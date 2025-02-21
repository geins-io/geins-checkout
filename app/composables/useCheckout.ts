/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Address } from '#shared/types';
import { computed, reactive, ref } from 'vue';

import type { AddressInputType, CartType, CheckoutStyleType, GeinsUserType } from '@geins/types';
import { CustomerType } from '@geins/types';

export const useCheckout = () => {
  const geinsClient = useGeinsClient();

  const defaultAddress: Address = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    country: '',
  };

  const loading = ref(false);
  const error = ref('');
  const useShippingAddress = ref(false);
  const paymentMethods = ref<any[]>([]);
  const shippingMethods = ref<any[]>([]);

  const state = reactive<{
    cart: CartType | null;
    billingAddress: Address;
    shippingAddress: Address;
    selectedPaymentMethod: number;
    selectedShippingMethod: number;
    showCompleteButton: boolean;
    disableCompleteButton: boolean;
    externalCheckoutHTML: string;
    style: CheckoutStyleType | undefined;
  }>({
    cart: null,
    billingAddress: { ...defaultAddress },
    shippingAddress: { ...defaultAddress },
    selectedPaymentMethod: 0,
    selectedShippingMethod: 0,
    showCompleteButton: true,
    disableCompleteButton: false,
    externalCheckoutHTML: '',
    style: undefined,
  });

  const isExternalCheckout = computed(() => state.externalCheckoutHTML.length > 0);

  const initializeCheckout = async (token: string) => {
    try {
      loading.value = true;
      await geinsClient.initializeCheckout(token);
      // if user is logged in, load user data
      const user = await geinsClient.getUser();
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

  const createAddressInputType = (address: Address): AddressInputType => {
    return {
      firstName: address.firstName,
      lastName: address.lastName,
      addressLine1: address.street,
      addressLine2: '',
      addressLine3: '',
      entryCode: '',
      careOf: '',
      city: address.city,
      state: '',
      country: address.country,
      zip: address.postalCode,
      company: '',
      mobile: address.phone,
      phone: address.phone,
    };
  };

  const loadUser = async (user: GeinsUserType) => {
    try {
      state.billingAddress.email = user.email;
      if (user.address) {
        state.billingAddress.firstName = user.address.firstName;
        state.billingAddress.lastName = user.address.lastName;
        state.billingAddress.email = user.email;
        state.billingAddress.phone = user.address.phone;
        state.billingAddress.street = user.address.addressLine1;
        state.billingAddress.city = user.address.city;
        state.billingAddress.postalCode = user.address.zip;
        state.billingAddress.country = user.address.country;
      }
    } catch (e) {
      error.value = 'Failed to initialize user';
      console.error(e);
    }
  };

  const updateAddress = async (type: 'billing' | 'shipping', address: Address) => {
    try {
      loading.value = true;
      if (type === 'billing') {
        state.billingAddress = address;
        if (!useShippingAddress.value) {
          state.shippingAddress = { ...address };
        }
      } else {
        state.shippingAddress = address;
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
    state.externalCheckoutHTML = html;
    state.showCompleteButton = false;
    state.disableCompleteButton = true;

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
      state.selectedPaymentMethod = methodId;

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
      state.selectedShippingMethod = methodId;

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
      state.disableCompleteButton = false;
      state.externalCheckoutHTML = '';

      // update
      if (reload) {
        //console.log('updateCheckout::', state.selectedPaymentMethod);
        await geinsClient.updateCheckout({
          paymentMethodId: state.selectedPaymentMethod,
          shippingMethodId: state.selectedShippingMethod,
        });
      }

      // set cart
      const cart = await geinsClient.getCart();
      if (cart) {
        state.cart = cart ?? null;
      }

      // shipping methods
      shippingMethods.value = await geinsClient.getShippingMethods();
      const selectedShippingMethod = await geinsClient.getSelectedShippingMethod();
      if (selectedShippingMethod) {
        state.selectedShippingMethod = Number(selectedShippingMethod.id);
      }

      // paymenent methods
      paymentMethods.value = await geinsClient.getPaymentMethods();
      const selectedPaymentMethod = await geinsClient.getSelectedPaymentMethod();
      if (selectedPaymentMethod) {
        state.selectedPaymentMethod = Number(selectedPaymentMethod.id);
        if (selectedPaymentMethod.paymentData) {
          state.showCompleteButton = false;
          state.disableCompleteButton = true;
          setExternalCheckout(selectedPaymentMethod);
        }
      }

      // set button state
      state.showCompleteButton = !isExternalCheckout.value;
    } catch (e) {
      error.value = 'Failed to update checkout';
      console.error(e);
    } finally {
      loading.value = false;
    }
  };

  const validateCheckout = async () => {
    const retval = false;

    const billingAddress = createAddressInputType(state.billingAddress);
    // validate billing address all fields must have a length over 1
    if (
      billingAddress.firstName.length === 0 ||
      billingAddress.lastName.length === 0 ||
      billingAddress.addressLine1.length === 0 ||
      billingAddress.city.length === 0 ||
      billingAddress.zip.length === 0 ||
      billingAddress.country.length === 0
    ) {
      error.value = 'Please fill in all billing address fields';
      return false;
    }
    // console.log('billingAddress::', billingAddress);

    const shippingAddress = createAddressInputType(state.shippingAddress);

    return true;
  };

  const createCheckoutInput = () => {
    const cartId = state.cart?.id ?? '';
    const merchantData = state.cart?.merchantData ?? { test: 'test' };

    return {
      cartId: cartId,
      checkoutOptions: {
        email: state.billingAddress.email,
        customerType: CustomerType.PERSON,
        paymentId: state.selectedPaymentMethod,
        billingAddress: createAddressInputType(state.billingAddress),
        acceptedConsents: ['order'],
        shippingAddress: useShippingAddress.value
          ? createAddressInputType(state.shippingAddress)
          : createAddressInputType(state.billingAddress),
        merchantData: '{"extraData":"","extraNumber":1}', //'JSON.stringify(merchantData)',
        message: 'hello',
      },
    };
  };

  // place order
  const completeCheckout = async () => {
    const retval = {
      success: false,
      orderId: '',
      publicOrderId: '',
      redirectUrl: '',
    };

    //const validate = await validateCheckout();
    //console.log('completeCheckout::', validate);

    try {
      // Validate shipping selection
      if (!state.selectedShippingMethod) {
        error.value = 'Please select a shipping method';
        return { success: false };
      }

      // validate addresses
      const billingAddress = createAddressInputType(state.billingAddress);
      const shippingAddress = createAddressInputType(state.shippingAddress);

      if (
        billingAddress.firstName.length === 0 ||
        billingAddress.firstName.length === 0 ||
        billingAddress.addressLine1.length === 0 ||
        billingAddress.city.length === 0 ||
        billingAddress.zip.length === 0 ||
        billingAddress.country.length === 0
      ) {
        error.value = 'Please fill in all billing address fields';
        return { success: false };
      }

      // place order
      const checkoutInput = createCheckoutInput();

      retval.success = false;
      loading.value = true;
      const valid = await geinsClient.validateCheckout(checkoutInput);
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
    const redirectUrls = await geinsClient.getRedirectUrls();
    if (orderResult.success) {
      if (redirectUrls.success) {
        return `${redirectUrls.success}?order=${orderResult.publicOrderId}`;
      }
    } else {
      if (redirectUrls.error) {
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
    updateAddress,
    selectPaymentMethod,
    selectShippingMethod,
    completeCheckout,
    isExternalCheckout,
    getSettings: () => geinsClient.getSettings(),
    getRedirectUrls: () => geinsClient.getRedirectUrls(),
  };
};
