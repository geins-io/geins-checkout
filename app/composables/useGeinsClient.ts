// Mock implementation of Geins client
import { GeinsCore, RuntimeContext } from '@geins/core';
import { GeinsOMS } from '@geins/oms';
import type { 
  CartType, 
  GeinsSettings,
  PaymentOptionType,
  ShippingOptionType,
  CheckoutType,
  CheckoutInputType,
  GeinsUserType
} from '@geins/types';
import { markRaw } from 'vue';

// Keep core instances outside the composable state
let geinsCore: GeinsCore;
let geinsOMS: GeinsOMS;

interface State {
  geinsSettings: GeinsSettings | null;
  settings: Record<string, unknown> | null;
  cartId: string;
  cartObject: CartType | null;
  paymentMethods: PaymentOptionType[];
  shippingMethods: ShippingOptionType[];
  user: GeinsUserType | null;
  checkoutObject: CheckoutType | null;
  orderSummary: unknown | null;
  redirectUrls: {
    success: string | null;
    cancel: string | null;
    change: string | null;
    terms: string | null;
    error: string | null;
  };
}

export const useGeinsClient = () => {
  const state: State = {
    geinsSettings: null,
    settings: null,
    cartId: '',
    cartObject: null,
    paymentMethods: [],
    shippingMethods: [],
    user: null,
    checkoutObject: null,
    orderSummary: null,
  };

  const setGeinsFromToken = async (token: string): Promise<void> => {
    await initializeFromToken(token);

    if (!state.geinsSettings) {
      throw new Error('Failed to initialize geinsSettings from token');
    }

    // initialize Geins core
    geinsCore = markRaw(new GeinsCore(state.geinsSettings));
    // initialize Geins OMS
    geinsOMS = markRaw(new GeinsOMS(geinsCore, {
      omsSettings: { context: RuntimeContext.HYBRID },
    }));
  };

  const initializeSummary = async (token: string, orderId: string): Promise<void> => {
    // set all the settings from the token
    await setGeinsFromToken(token);
    const order = await geinsOMS.order.get({ publicOrderId: orderId });
    state.orderSummary = order;
  };

  const initializeCheckout = async (token: string): Promise<void> => {
    // set all the settings from the token
    await setGeinsFromToken(token);

    // get the checkout
    const checkout = await geinsOMS.checkout.get({
      cartId: state.cartId,
      paymentMethodId: state.settings?.paymentId as number | undefined,
      shippingMethodId: state.settings?.shippingId as number | undefined,
    });

    if (checkout) {
      state.cartObject = checkout.cart || null;
      state.paymentMethods = checkout.paymentOptions || [];
      state.shippingMethods = checkout.shippingOptions || [];
    }
  };

  const initializeFromToken = async (token: string): Promise<void> => {
    const payload = GeinsCore.decodeJWT(token);
    
    state.cartId = payload.cartId;
    state.geinsSettings = payload.geinsSettings;
    state.user = payload.user;
    state.settings = payload.settings;
    state.redirectUrls = payload.settings?.redirectUrls;
    
  };

  interface CheckoutState {
    selectedPaymentMethod: number;
    selectedShippingMethod: number;
  }

  const createUpdateArgsFromState = (checkoutState: CheckoutState) => ({
    cartId: state.cartId,
    paymentMethodId: checkoutState.selectedPaymentMethod,
    shippingMethodId: checkoutState.selectedShippingMethod,
    checkoutUrls: {
      termsPageUrl: state.settings?.redirectUrls?.terms ?? null,
      redirectUrl: state.settings?.redirectUrls?.success ?? null,
      checkoutPageUrl: state.settings?.redirectUrls?.change ?? null,
    },
  });

  const updateCheckout = async (checkoutState: CheckoutState): Promise<void> => {
    const vh : CheckoutInputType = {
      cartId: state.cartId,
      paymentMethodId: checkoutState.selectedPaymentMethod,
      shippingMethodId: checkoutState.selectedShippingMethod,
      // redirectUrls: state.redirectUrls,
    }
    const args = createUpdateArgsFromState(checkoutState);
    console.log('state::', state);
    console.log('ARGS::', args);
    const checkout = await geinsOMS.checkout.get(args);
    console.log('checkout::', checkout);

    if (checkout) {
      // set cart
      state.cartObject = checkout.cart || null;

      // set payment and shipping
      state.paymentMethods = setPaymentMethods(checkout.paymentOptions || []);
      state.shippingMethods = setShippingMethods(checkout.shippingOptions || []);
    }
  };

  const setPaymentMethods = (methods: PaymentOptionType[]): PaymentOptionType[] => {
    if (!Array.isArray(methods) || methods.length === 0) return [];
    if (!Array.isArray(state.settings?.paymentMethods) || state.settings.paymentMethods.length === 0) return methods;

    const returnMethods: PaymentOptionType[] = [];
    const order = state.settings.paymentMethods as number[];

    for (const methodId of order) {
      const method = methods.find((m) => m.id === methodId);
      if (method) returnMethods.push(method);
    }
    return returnMethods;
  };

  const setShippingMethods = (methods: ShippingOptionType[]): ShippingOptionType[] => {
    if (!Array.isArray(methods) || methods.length === 0) return [];
    if (!Array.isArray(state.settings?.shippingMethods) || state.settings.shippingMethods.length === 0) return methods;

    const returnMethods: ShippingOptionType[] = [];
    const order = state.settings.shippingMethods as number[];

    for (const methodId of order) {
      const method = methods.find((m) => m.id === methodId);
      if (method) returnMethods.push(method);
    }
    return returnMethods;
  };

  const getCheckout = async (paymentId?: number): Promise<CheckoutType> => {
    const args = { cartId: state.cartId, paymentProviderId: paymentId };
    console.log('state::', state);
    console.log('ARGS::', args);

    const checkout = await geinsOMS.checkout.get(args);

    if (!checkout) {
      throw new Error('Failed to get checkout');
    }

    state.cartObject = checkout.cart || null;
    state.paymentMethods = checkout.paymentOptions || [];
    state.shippingMethods = checkout.shippingOptions || [];

    return checkout;
  };

  // Return only data, not functions in the main state
  return {
    // Methods
    initializeSummary,
    initializeCheckout,
    getCheckout,
    updateCheckout,
    // Getters that return current state values
    getCart: () => state.cartObject,
    getUser: () => state.user,
    getPaymentMethods: () => state.paymentMethods,
    getSelectedPaymentMethod: () => state.paymentMethods.find((method) => method.isSelected),
    getShippingMethods: () => state.shippingMethods,
    getSelectedShippingMethod: () => state.shippingMethods.find((method) => method.isSelected),
    validateCheckout: async () => true,
    createOrder: async (checkoutInput: { cartId: string; checkout: CheckoutInputType }) => {
      const result = await geinsOMS.order.create(checkoutInput);
      return result;
    },
    getSummary: () => state.orderSummary,
  };
};
