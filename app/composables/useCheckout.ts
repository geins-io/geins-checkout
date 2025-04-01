import type { CheckoutInputType, GeinsAddressType } from '@geins/types';
import { CustomerType } from '@geins/types';

export const useCheckout = () => {
  const geinsClient = useGeinsClient();
  const { geinsLog, geinsLogError } = useGeinsLog('composables/useCheckout.ts');
  const { parsedCheckoutToken, urls, confirmationPageUrl } = useCheckoutToken();
  const { externalPaymentSelected, suspend, resume } = useExternalSnippet();

  const globalLoading = useState<boolean>('global-loading', () => false);
  const checkoutLoading = useState<boolean>('checkout-loading', () => true);

  const error = ref('');

  const checkoutSettings = computed(() => geinsClient.checkoutSettings.value);
  const cart = computed(() => geinsClient.cart.value);
  const redirectUrls = computed(() => geinsClient.redirectUrls.value);
  const currentCountryName = computed(() => geinsClient.currentCountryName.value);

  const defaultAddress: GeinsAddressType = {
    phone: '',
    mobile: '',
    company: '',
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    zip: '',
    careOf: '',
    city: '',
    state: '',
    country: '',
    entryCode: '',
  };

  const state = useState<CheckoutState>('checkout', () => ({
    email: '',
    identityNumber: '',
    message: '',
    billingAddress: { ...defaultAddress },
    shippingAddress: { ...defaultAddress },
    selectedPaymentId: 0,
    selectedShippingId: 0,
    externalSnippetHtml: '',
    useShippingAddress: false,
    showMessageInput: true,
  }));

  const initializeCheckout = async () => {
    const init = async () => {
      try {
        checkoutLoading.value = true;
        loadUser();
        setPaymentAndShippingIds();

        const checkoutInput = createCheckoutInput();
        const checkoutOptions = checkoutInput.checkoutOptions;
        await geinsClient.initializeCheckout(checkoutOptions);
        geinsLog('checkout initialized', checkoutInput);
      } catch (e) {
        error.value = 'Failed to initialize checkout';
        geinsLogError(error.value, e);
      } finally {
        checkoutLoading.value = false;
      }
    };

    if (parsedCheckoutToken.value) {
      await init();
      return;
    }

    watch(parsedCheckoutToken, init, { once: true });
  };

  const loadUser = () => {
    const user = parsedCheckoutToken.value?.user;
    if (!user) {
      return;
    }
    state.value.email = user.email;
    state.value.identityNumber = user.personalId || '';
    if (user.address) {
      state.value.billingAddress = { ...user.address };
    }
  };

  const updateCheckoutData = async (type: 'billing' | 'shipping', data: CheckoutFormType) => {
    try {
      checkoutLoading.value = true;
      if (!data.address) {
        return;
      }
      if (type === 'billing') {
        state.value.email = data.email || '';
        state.value.identityNumber = data.identityNumber || '';
        state.value.message = data.message || '';

        state.value.billingAddress = markRaw({
          ...data.address,
          country: currentCountryName.value || '',
        });
      } else {
        state.value.shippingAddress = markRaw({
          ...data.address,
          country: currentCountryName.value || '',
        });
      }
    } catch (e) {
      error.value = `Failed to update ${type} address`;
      geinsLogError(error.value, e);
    } finally {
      checkoutLoading.value = false;
    }
  };

  const setPaymentAndShippingIds = (paymentId?: number, shippingId?: number) => {
    state.value.selectedPaymentId =
      paymentId || parsedCheckoutToken.value?.checkoutSettings.selectedPaymentMethodId || 0;
    state.value.selectedShippingId =
      shippingId || parsedCheckoutToken.value?.checkoutSettings.selectedShippingMethodId || 0;
  };

  const updateCheckout = async () => {
    try {
      checkoutLoading.value = true;
      if (externalPaymentSelected.value) {
        suspend();
      }

      const checkoutInput = createCheckoutInput();

      await geinsClient.updateCheckout({
        paymentMethodId: state.value.selectedPaymentId,
        shippingMethodId: state.value.selectedShippingId,
        checkoutOptions: checkoutInput.checkoutOptions,
      });

      const paymentId = geinsClient.selectedPaymentMethod.value?.id;
      const shippingId = geinsClient.selectedShippingMethod.value?.id;

      setPaymentAndShippingIds(paymentId, shippingId);
    } catch (e) {
      error.value = 'Failed to update checkout';
      geinsLogError(error.value, e);
    } finally {
      checkoutLoading.value = false;
      if (externalPaymentSelected.value) {
        resume();
      }
    }
  };

  const createCheckoutInput = (): { cartId: string; checkoutOptions: CheckoutInputType } => {
    const cartId = geinsClient.cart.value?.id || '';

    return {
      cartId: cartId,
      checkoutOptions: {
        email: state.value.email,
        customerType: parsedCheckoutToken.value?.checkoutSettings?.customerType ?? CustomerType.PERSON,
        paymentId: state.value.selectedPaymentId,
        shippingId: state.value.selectedShippingId,
        billingAddress: state.value.billingAddress,
        acceptedConsents: ['order'],
        shippingAddress: state.value.useShippingAddress
          ? state.value.shippingAddress
          : state.value.billingAddress,
        message: state.value.message,
        identityNumber: state.value.identityNumber,
        skipShippingValidation: true,
      },
    };
  };

  const completeCheckout = async (): Promise<CompleteCheckoutResponse> => {
    checkoutLoading.value = true;
    const response: CompleteCheckoutResponse = {
      success: false,
      orderId: '',
      publicOrderId: '',
      redirectUrl: '',
      message: '',
    };

    try {
      const checkoutInput = createCheckoutInput();
      const orderResult = await geinsClient.createOrder(checkoutInput);
      if (orderResult?.created) {
        response.success = true;
        response.orderId = orderResult.orderId || '';
        response.publicOrderId = orderResult.publicId || '';
        response.redirectUrl = getRedirectUrl(response);
      } else {
        error.value = orderResult?.message || 'Failed to create order';
        geinsLogError(error.value);
        response.success = false;
        response.redirectUrl = getRedirectUrl(response);
        response.message = error.value;
        checkoutLoading.value = false;
      }
    } catch (e) {
      error.value = 'Failed to complete checkout';
      geinsLogError(error.value, e);
      response.success = false;
      response.redirectUrl = getRedirectUrl(response);
      checkoutLoading.value = false;
    }
    return response;
  };

  const getRedirectUrl = (response: CompleteCheckoutResponse): string => {
    try {
      if (response.success) {
        if (urls.value?.success) {
          return urls.value.success;
        }
        const url = geinsClient.updateCheckoutUrlWithParameters({
          url: confirmationPageUrl.value,
          paymentMethodId: state.value.selectedPaymentId,
        });
        return url.replace('{orderId}', response.publicOrderId).replace('{payment.uid}', response.orderId);
      } else if (urls.value?.error) {
        return urls.value.error;
      }
      return '';
    } catch (e) {
      error.value = 'Failed to get redirect URLs';
      geinsLogError(error.value, e);
      return '';
    }
  };

  return {
    state,
    globalLoading,
    checkoutLoading,
    error,
    checkoutSettings,
    cart,
    redirectUrls,
    currentCountryName,
    initializeCheckout,
    updateCheckoutData,
    updateCheckout,
    completeCheckout,
  };
};
