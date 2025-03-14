import type { AddressInputType, CheckoutInputType, GeinsUserType, PaymentOptionType } from '@geins/types';
import { CustomerType } from '@geins/types';

export const useCheckout = () => {
  const geinsClient = useGeinsClient();
  const { parsedCheckoutToken } = useCheckoutToken();

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

  const globalLoading = useState<boolean>('global-loading', () => false);
  const checkoutLoading = useState<boolean>('checkout-loading', () => true);
  const error = ref('');
  const paymentMethods = ref();
  const shippingMethods = ref();
  const checkoutSettings = computed(() => geinsClient.checkoutSettings.value);
  const cart = computed(() => geinsClient.cart.value);
  const redirectUrls = computed(() => geinsClient.redirectUrls.value);

  const state = useState<CheckoutState>('checkout', () => ({
    email: '',
    identityNumber: '',
    message: '',
    billingAddress: { ...defaultAddress },
    shippingAddress: { ...defaultAddress },
    selectedPaymentMethod: 0,
    selectedShippingMethod: 0,
    externalCheckoutHTML: '',
    useShippingAddress: false,
    showMessageInput: true,
  }));

  const isExternalCheckout = computed(() => !!state.value.externalCheckoutHTML);

  const initializeCheckout = async () => {
    const init = async () => {
      try {
        await geinsClient.initializeCheckout();
        setShippingMethods();
        setPaymentMethods();

        /*       // if user is logged in, load user data
      const user = geinsClient.getUser();
      if (user) {
        await loadUser(user);
      }
      // run update checkout with current client data
      updateCheckout(false); */
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

  onMounted(() => {
    if (geinsClient.selectedPaymentMethod.value) {
      setExternalCheckout(geinsClient.selectedPaymentMethod.value);
    }
  });

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
      if (type === 'billing') {
        state.value.email = data.email ?? '';
        state.value.identityNumber = data.identityNumber ?? '';
        state.value.message = data.message ?? '';
        state.value.billingAddress = data.address;
        if (!state.value.useShippingAddress) {
          state.value.shippingAddress = data.address;
        }
      } else {
        state.value.shippingAddress = data.address;
      }
    } catch (e) {
      error.value = `Failed to update ${type} address`;
      console.error(e);
    } finally {
      checkoutLoading.value = false;
    }
  };

  const setExternalCheckout = async (paymentMethod: PaymentOptionType) => {
    if (paymentMethod.paymentData === null) {
      return;
    }
    state.value.externalCheckoutHTML = '';
    let html = paymentMethod.paymentData;
    if (paymentMethod.paymentType === 'AVARDA') {
      html = `<script src="https://stage.checkout-cdn.avarda.com/cdn/static/js/main.js"></script>` + html;
    }

    shippingMethods.value = [];
    state.value.externalCheckoutHTML = html || '';

    await nextTick();

    const container = document.createElement('div');
    container.innerHTML = state.value.externalCheckoutHTML;

    await nextTick();

    const scriptTags = container.querySelectorAll('script');

    scriptTags.forEach((scriptTag) => {
      const newScript = document.createElement('script');
      if (scriptTag.src) {
        // External script
        newScript.src = scriptTag.src;
        newScript.async = true;
      } else {
        // Inline script
        newScript.textContent = scriptTag.innerHTML;
      }

      // Append the script to the container or body
      const target = document.getElementById('checkout-external');
      if (target) {
        target.appendChild(newScript);
      } else {
        console.error('Container not found');
      }
    });
  };

  const selectPaymentMethod = async (methodId: number) => {
    try {
      checkoutLoading.value = true;
      state.value.selectedPaymentMethod = methodId;

      await updateCheckout();
    } catch (e) {
      error.value = 'Failed to update payment method';
      console.error(e);
    } finally {
      checkoutLoading.value = false;
    }
  };

  const selectShippingMethod = async (methodId: number) => {
    try {
      checkoutLoading.value = true;
      state.value.selectedShippingMethod = methodId;

      await updateCheckout();
    } catch (e) {
      error.value = 'Failed to update shipping method';
      console.error(e);
    } finally {
      checkoutLoading.value = false;
    }
  };

  const setShippingMethods = () => {
    shippingMethods.value = geinsClient.shippingMethods.value;
    if (geinsClient.selectedShippingMethod.value) {
      state.value.selectedShippingMethod = Number(geinsClient.selectedShippingMethod.value.id);
    }
  };

  const setPaymentMethods = () => {
    paymentMethods.value = geinsClient.paymentMethods.value;
    if (geinsClient.selectedPaymentMethod.value) {
      state.value.selectedPaymentMethod = Number(geinsClient.selectedPaymentMethod.value.id);
    }
  };

  const updateCheckout = async () => {
    try {
      checkoutLoading.value = true;
      const checkoutInput = createCheckoutInput();

      await geinsClient.updateCheckout({
        paymentMethodId: state.value.selectedPaymentMethod,
        shippingMethodId: state.value.selectedShippingMethod,
        checkoutOptions: checkoutInput.checkoutOptions,
      });

      setShippingMethods();
      setPaymentMethods();

      if (geinsClient.selectedPaymentMethod.value) {
        await setExternalCheckout(geinsClient.selectedPaymentMethod.value);
      }
    } catch (e) {
      error.value = 'Failed to update checkout';
      console.error(e);
    } finally {
      checkoutLoading.value = false;
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
        paymentId: state.value.selectedPaymentMethod,
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
    } finally {
      checkoutLoading.value = false;
    }
    return response;
  };

  const getRedirectUrl = (response: CompleteCheckoutResponse): string => {
    const redirectUrls = checkoutSettings.value?.redirectUrls;
    if (response.success && redirectUrls?.success) {
      return `${redirectUrls.success}?order=${response.publicOrderId}`;
    } else if (redirectUrls?.error) {
      return redirectUrls.error;
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
    isExternalCheckout,
    checkoutSettings,
    cart,
    redirectUrls,
    initializeCheckout,
    updateCheckoutData,
    selectPaymentMethod,
    selectShippingMethod,
    updateCheckout,
    completeCheckout,
  };
};
