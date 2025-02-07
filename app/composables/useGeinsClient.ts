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
  GeinsUserType,
  CheckoutUrlsInputType,
  CheckoutTokenPayload,
  CheckoutRedirectsType,
  CheckoutStyleType,
} from '@geins/types';
import { markRaw } from 'vue';

// Keep core instances outside the composable state
let geinsCore: GeinsCore;
let geinsOMS: GeinsOMS;

interface State {
  styles: CheckoutStyleType | undefined;
  geinsSettings: GeinsSettings | null;
  settings: Record<string, unknown> | null;
  cartId: string;
  cartObject: CartType | null;
  paymentMethods: PaymentOptionType[];
  shippingMethods: ShippingOptionType[];
  user: GeinsUserType | undefined;
  checkoutObject: CheckoutType | null;
  orderSummary: unknown | null;
  redirectUrls: CheckoutRedirectsType | undefined;
}

export const useGeinsClient = () => {
  const state: State = {
    styles: undefined,
    geinsSettings: null,
    settings: null,
    cartId: '',
    cartObject: null,
    paymentMethods: [],
    shippingMethods: [],
    user: undefined,
    checkoutObject: null,
    orderSummary: null,
    redirectUrls: undefined,
  };

  const initializeStateFromToken = async (token: string): Promise<void> => {
    const payload = GeinsCore.decodeJWT(token) as CheckoutTokenPayload;

    state.styles = payload.checkoutSettings.style;
    state.cartId = payload.cartId;
    state.geinsSettings = payload.geinsSettings;
    state.user = payload.user;
    state.settings = payload.checkoutSettings;

    state.redirectUrls = payload.checkoutSettings?.redirectUrls;
  };

  const setGeinsFromToken = async (token: string): Promise<void> => {
    await initializeStateFromToken(token);

    if (!state.geinsSettings) {
      throw new Error('Failed to initialize geinsSettings from token');
    }

    // initialize Geins core
    geinsCore = markRaw(new GeinsCore(state.geinsSettings));
    // initialize Geins OMS
    geinsOMS = markRaw(
      new GeinsOMS(geinsCore, {
        omsSettings: { context: RuntimeContext.HYBRID },
      }),
    );
  };

  const initializeSummary = async (
    token: string,
    orderId: string,
  ): Promise<any> => {
    // set all the settings from the token
    await setGeinsFromToken(token);
    const order = await geinsOMS.order.get({ publicOrderId: orderId });
    state.orderSummary = order;
    return order;
  };

  const initializeCheckout = async (token: string): Promise<void> => {
    // set all the settings from the token
    await setGeinsFromToken(token);
    const checkout = await getCheckout();

    if (checkout) {
      state.cartObject = checkout.cart || null;
      state.paymentMethods = setPaymentMethods(checkout.paymentOptions || []);
      state.shippingMethods = setShippingMethods(
        checkout.shippingOptions || [],
      );
    }
  };

  const updateCheckout = async (options?: {
    paymentMethodId?: number;
    shippingMethodId?: number;
  }): Promise<void> => {
    const checkout = await getCheckout(options);
    if (checkout) {
      state.cartObject = checkout.cart || null;
      state.paymentMethods = setPaymentMethods(checkout.paymentOptions || []);
      state.shippingMethods = setShippingMethods(
        checkout.shippingOptions || [],
      );
    }
  };

  const getCheckout = async (options?: {
    paymentMethodId?: number;
    shippingMethodId?: number;
  }): Promise<CheckoutType> => {
    let paymentMethodId = state.settings?.selectedPaymentMethodId as
      | number
      | undefined;
    let shippingMethodId = state.settings?.selectedShippingMethodId as
      | number
      | undefined;

    if (options) {
      if (options.paymentMethodId) {
        paymentMethodId = options.paymentMethodId;
      }
      if (options.shippingMethodId) {
        shippingMethodId = options.shippingMethodId;
      }
    }

    const args = {
      cartId: state.cartId,
      paymentMethodId,
      shippingMethodId,
      checkout: {
        checkoutUrls: {
          termsPageUrl: state.redirectUrls?.terms ?? null,
          redirectUrl: state.redirectUrls?.success ?? null,
          checkoutPageUrl: state.redirectUrls?.change ?? null,
        } as CheckoutUrlsInputType,
      } as CheckoutInputType,
    };

    const checkout = await geinsOMS.checkout.get(args);
    if (!checkout) {
      throw new Error('Failed to get checkout');
    }
    return checkout;
  };

  const setPaymentMethods = (
    methods: PaymentOptionType[],
  ): PaymentOptionType[] => {
    if (!Array.isArray(methods) || methods.length === 0) return [];
    if (
      !Array.isArray(state.settings?.paymentMethods) ||
      state.settings.paymentMethods.length === 0
    )
      return methods;

    const returnMethods: PaymentOptionType[] = [];
    const order = state.settings.paymentMethods as number[];

    for (const methodId of order) {
      const method = methods.find((m) => m.id === methodId);
      if (method) returnMethods.push(method);
    }
    return returnMethods;
  };

  const setShippingMethods = (
    methods: ShippingOptionType[],
  ): ShippingOptionType[] => {
    if (!Array.isArray(methods) || methods.length === 0) return [];
    if (
      !Array.isArray(state.settings?.shippingMethods) ||
      state.settings.shippingMethods.length === 0
    )
      return methods;

    const returnMethods: ShippingOptionType[] = [];
    const order = state.settings.shippingMethods as number[];

    for (const methodId of order) {
      const method = methods.find((m) => m.id === methodId);
      if (method) returnMethods.push(method);
    }
    return returnMethods;
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
    getSettings: () => state.settings,
    getRedirectUrls: () => state.redirectUrls,
    getPaymentMethods: () => state.paymentMethods,
    getSelectedPaymentMethod: () =>
      state.paymentMethods.find((method) => method.isSelected),
    getShippingMethods: () => state.shippingMethods,
    getSelectedShippingMethod: () =>
      state.shippingMethods.find((method) => method.isSelected),
    validateCheckout: async () => true,
    createOrder: async (checkoutInput: {
      cartId: string;
      checkout: CheckoutInputType;
    }) => {
      const result = await geinsOMS.order.create(checkoutInput);
      return result;
    },
    getSummary: () => state.orderSummary,
  };
};
