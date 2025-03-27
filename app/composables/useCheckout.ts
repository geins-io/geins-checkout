import type { AddressInputType, CheckoutInputType, GeinsUserType } from '@geins/types';
import { CustomerType } from '@geins/types';

export const useCheckout = () => {
  const geinsClient = useGeinsClient();
  const { parsedCheckoutToken, urls, confirmationPageUrl } = useCheckoutToken();
  const { externalPaymentSelected, suspend, resume } = useExternalSnippet();

  const globalLoading = useState<boolean>('global-loading', () => false);
  const checkoutLoading = useState<boolean>('checkout-loading', () => true);

  const error = ref('');
  const paymentMethods = ref();
  const shippingMethods = ref();

  const checkoutSettings = computed(() => geinsClient.checkoutSettings.value);
  const cart = computed(() => geinsClient.cart.value);
  const redirectUrls = computed(() => geinsClient.redirectUrls.value);
  const currentCountryName = computed(() => geinsClient.currentCountryName.value);

  const defaultAddress: AddressInputType = {
    phone: '',
    company: '',
    firstName: '',
    lastName: '',
    addressLine1: '',
    zip: '',
    careOf: '',
    city: '',
    country: '',
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
        await geinsClient.initializeCheckout();
        setShippingMethods();
        setPaymentMethods();
      } catch (e) {
        error.value = 'Failed to initialize checkout';
        console.error(e);
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

  const _loadUser = async (user: GeinsUserType) => {
    try {
      state.value.email = user.email;
      if (user.address) {
        state.value.billingAddress = { ...user.address };
      }
    } catch (e) {
      error.value = 'Failed to initialize user';
      console.error(e);
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
      console.error(e);
    } finally {
      checkoutLoading.value = false;
    }
  };

  const setShippingMethods = () => {
    shippingMethods.value = geinsClient.shippingMethods.value;
    if (geinsClient.selectedShippingMethod.value) {
      state.value.selectedShippingId = Number(geinsClient.selectedShippingMethod.value.id);
    }
  };

  const setPaymentMethods = () => {
    paymentMethods.value = geinsClient.paymentMethods.value;
    if (geinsClient.selectedPaymentMethod.value) {
      state.value.selectedPaymentId = Number(geinsClient.selectedPaymentMethod.value.id);
    }
  };

  const updateCheckout = async () => {
    try {
      if (externalPaymentSelected.value) {
        suspend();
      }
      checkoutLoading.value = true;
      const checkoutInput = createCheckoutInput();

      await geinsClient.updateCheckout({
        paymentMethodId: state.value.selectedPaymentId,
        shippingMethodId: state.value.selectedShippingId,
        checkoutOptions: checkoutInput.checkoutOptions,
      });

      setShippingMethods();
      setPaymentMethods();
    } catch (e) {
      error.value = 'Failed to update checkout';
      console.error(e);
    } finally {
      checkoutLoading.value = false;
      if (externalPaymentSelected.value) {
        resume();
      }
    }
  };

  const createCheckoutInput = (): {
    cartId: string;
    checkoutOptions: CheckoutInputType;
  } => {
    const cartId = geinsClient.cart.value?.id || '';

    return {
      cartId: cartId,
      checkoutOptions: {
        email: state.value.email,
        customerType: parsedCheckoutToken.value?.checkoutSettings?.customerType ?? CustomerType.PERSON,
        paymentId: state.value.selectedPaymentId,
        billingAddress: state.value.billingAddress,
        acceptedConsents: ['order'],
        shippingAddress: state.value.useShippingAddress
          ? state.value.shippingAddress
          : state.value.billingAddress,
        merchantData: '',
        message: state.value.message,
        identityNumber: state.value.identityNumber,
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
    };

    try {
      const checkoutInput = createCheckoutInput();
      const orderResult = await geinsClient.createOrder(checkoutInput);
      if (orderResult) {
        response.success = true;
        response.orderId = orderResult.orderId || '';
        response.publicOrderId = orderResult.publicId || '';
        response.redirectUrl = getRedirectUrl(response);
      }
    } catch (e) {
      error.value = 'Failed to complete checkout';
      console.error(e);
      response.success = false;
      response.redirectUrl = getRedirectUrl(response);
    }
    return response;
  };

  const getRedirectUrl = (response: CompleteCheckoutResponse): string => {
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
  };

  return {
    state,
    globalLoading,
    checkoutLoading,
    error,
    paymentMethods,
    shippingMethods,
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
