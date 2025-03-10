import type { AddressType, CartType, GeinsUserType } from '@geins/types';
import { CustomerType } from '@geins/types';

export const useCheckout = () => {
  const { parsedToken } = useCheckoutToken();
  const geinsClient = useGeinsClient();

  const defaultAddress: AddressType = {
    phone: '',
    firstName: '',
    lastName: '',
    addressLine1: '',
    zip: '',
    careOf: '',
    city: '',
    company: '',
  };

  const loading = ref(true);
  const error = ref('');
  const useShippingAddress = ref(false);
  const paymentMethods = ref([]);
  const shippingMethods = ref([]);

  const state = ref<{
    cart: CartType | null;
    email: string;
    identityNumber: string;
    message: string;
    billingAddress: AddressType;
    shippingAddress: AddressType;
    selectedPaymentMethod: number;
    selectedShippingMethod: number;
    externalCheckoutHTML: string;
    showMessageInput: boolean;
  }>({
    cart: null,
    email: '',
    identityNumber: '',
    message: '',
    billingAddress: { ...defaultAddress },
    shippingAddress: { ...defaultAddress },
    selectedPaymentMethod: 0,
    selectedShippingMethod: 0,
    externalCheckoutHTML: '',
    showMessageInput: true,
  });

  const isExternalCheckout = computed(() => state.value.externalCheckoutHTML.length > 0);

  const initializeCheckout = async () => {
    try {
      await geinsClient.initializeCheckout();
      // if user is logged in, load user data
      const user = geinsClient.getUser();
      if (user) {
        await loadUser(user);
      }
      // run update checkout with current client data
      updateCheckout(false);
    } catch (e) {
      error.value = 'Failed to initialize checkout';
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  watch(parsedToken, initializeCheckout);

  const loadUser = async (user: GeinsUserType) => {
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
      loading.value = true;
      if (type === 'billing') {
        state.value.email = data.email ?? '';
        state.value.identityNumber = data.identityNumber ?? '';
        state.value.message = data.message ?? '';
        state.value.billingAddress = data.address;
        if (!useShippingAddress.value) {
          state.value.shippingAddress = { ...data.address };
        }
      } else {
        state.value.shippingAddress = data.address;
      }
    } catch (e) {
      error.value = `Failed to update ${type} address`;
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const setExternalCheckout = async (paymentMethod: any) => {
    if (paymentMethod.paymentData === null) {
      return;
    }
    let html = paymentMethod.paymentData;
    if (paymentMethod.paymentType === 'AVARDA') {
      html = `<script src="https://stage.checkout-cdn.avarda.com/cdn/static/js/main.js"></script>` + html;
    }

    shippingMethods.value = [];
    state.value.externalCheckoutHTML = html;

    // Wait for Vue to update the DOM
    await nextTick();

    const container = document.createElement('div');
    container.innerHTML = html;

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
      loading.value = true;
      state.value.selectedPaymentMethod = methodId;

      await updateCheckout(true);
    } catch (e) {
      error.value = 'Failed to update payment method';
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const selectShippingMethod = async (methodId: number) => {
    try {
      loading.value = true;
      state.value.selectedShippingMethod = methodId;

      await updateCheckout(true);
    } catch (e) {
      error.value = 'Failed to update shipping method';
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const updateCheckout = async (reload: boolean = true) => {
    try {
      loading.value = true;
      state.value.externalCheckoutHTML = '';

      // update
      if (reload) {
        //console.log('updateCheckout::', state.value.selectedPaymentMethod);
        await geinsClient.updateCheckout({
          paymentMethodId: state.value.selectedPaymentMethod,
          shippingMethodId: state.value.selectedShippingMethod,
        });
      }

      // set cart
      const cart = geinsClient.getCart();

      state.value.cart = cart ?? null;

      // shipping methods
      shippingMethods.value = geinsClient.getShippingMethods();
      const selectedShippingMethod = geinsClient.getSelectedShippingMethod();
      if (selectedShippingMethod) {
        state.value.selectedShippingMethod = Number(selectedShippingMethod.id);
      }

      // paymenent methods
      paymentMethods.value = await geinsClient.getPaymentMethods();
      const selectedPaymentMethod = await geinsClient.getSelectedPaymentMethod();
      if (selectedPaymentMethod) {
        state.value.selectedPaymentMethod = Number(selectedPaymentMethod.id);
        if (selectedPaymentMethod.paymentData) {
          setExternalCheckout(selectedPaymentMethod);
        }
      }
    } catch (e) {
      error.value = 'Failed to update checkout';
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const createCheckoutInput = () => {
    const cartId = state.value.cart?.id ?? '';
    const merchantData = state.value.cart?.merchantData ?? { test: 'test' };

    return {
      cartId: cartId,
      checkoutOptions: {
        email: state.value.email,
        customerType: CustomerType.PERSON,
        paymentId: state.value.selectedPaymentMethod,
        billingAddress: state.value.billingAddress,
        acceptedConsents: ['order'],
        shippingAddress: useShippingAddress.value ? state.value.shippingAddress : state.value.billingAddress,
        merchantData: '{"extraData":"","extraNumber":1}', //'JSON.stringify(merchantData)',
        message: state.value.message,
      },
    };
  };

  // place order
  const completeCheckout = async () => {
    loading.value = true;
    const retval = {
      success: false,
      orderId: '',
      publicOrderId: '',
      redirectUrl: '',
    };

    try {
      const checkoutInput = createCheckoutInput();
      console.log('🚀 ~ completeCheckout ~ checkoutInput:', checkoutInput);

      retval.success = false;
      loading.value = true;
      const valid = await geinsClient.validateCheckout();
      if (!valid) {
        error.value = 'Failed to validate checkout';
        return { success: false };
      }
      const orderResult = await geinsClient.createOrder(checkoutInput);
      if (orderResult) {
        retval.success = true;
        retval.orderId = orderResult.orderId;
        retval.publicOrderId = orderResult.publicId;
      }
    } catch (e) {
      error.value = 'Failed to complete checkout';
      console.error(e);
      retval.redirectUrl = await getRedirectUrl({ success: false });
    } finally {
      loading.value = false;
    }
    return retval;
  };

  const getRedirectUrl = async (orderResult: any) => {
    // console.log('getRedirectUrl::', orderResult);
    const redirectUrls = geinsClient.getRedirectUrls();
    if (orderResult.success) {
      if (redirectUrls?.success) {
        return `${redirectUrls.success}?order=${orderResult.publicOrderId}`;
      }
    } else {
      if (redirectUrls?.error) {
        return `${redirectUrls.error}`;
      }
    }
    return undefined;
  };

  return {
    state,
    loading,
    error,
    useShippingAddress,
    paymentMethods,
    shippingMethods,
    initializeCheckout,
    updateCheckoutData,
    selectPaymentMethod,
    selectShippingMethod,
    completeCheckout,
    isExternalCheckout,
    getSettings: () => geinsClient.getSettings(),
    getRedirectUrls: () => geinsClient.getRedirectUrls(),
  };
};
