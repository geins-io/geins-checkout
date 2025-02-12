import { markRaw } from 'vue';
import { GeinsCore, RuntimeContext, CHECKOUT_PARAMETER, extractParametersFromUrl } from '@geins/core';
import { GeinsOMS } from '@geins/oms';
import type { CartType, GeinsSettings, PaymentOptionType, ShippingOptionType, CheckoutType, CheckoutInputType, GeinsUserType, CheckoutUrlsInputType, CheckoutTokenPayload, CheckoutRedirectsType, CheckoutStyleType, CheckoutQueryParameters } from '@geins/types';
import { settings } from 'eslint-plugin-prettier/recommended';

interface OrderSummary {
  cart: CartType;
  billingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    zip: string;
    country: string;
    mobile?: string;
    phone?: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    zip: string;
    country: string;
    mobile?: string;
    phone?: string;
  };
  paymentDetails: Array<{
    displayName: string;
  }>;
  shippingDetails: Array<{
    name: string;
  }>;
  status: string;
}
const CHECKOUT_URL = 'https://checkout-qa.geins.services';
//const CHECKOUT_URL = 'http://localhost:3005';

// Keep core instances outside the composable state
let geinsCore: GeinsCore;
let geinsOMS: GeinsOMS;

interface State {
  token: string;

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
  style: CheckoutStyleType | undefined;
}

export const useGeinsClient = () => {
  const state: State = {
    token: '',
    style: undefined,
    geinsSettings: null,
    settings: null,
    cartId: '',
    cartObject: null,
    paymentMethods: [],
    shippingMethods: [],
    user: undefined,
    checkoutObject: null,
    orderSummary: undefined,
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
    state.token = token;
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

  const initializeSummary = async (token: string, orderId: string, paymentdata: CheckoutQueryParameters): Promise<OrderSummary | undefined> => {
    // set all the settings from the token
    await setGeinsFromToken(token);
    // GeinsMerchantApiQuery.checkout(§

    const order = await getSummary(orderId, paymentdata);

    return order as OrderSummary | undefined;
  };

  const initializeCheckout = async (token: string): Promise<void> => {
    // set all the settings from the token
    await setGeinsFromToken(token);
    const checkout = await getCheckout({ paymentMethodId: state.settings?.selectedPaymentMethodId as number });
    if (checkout) {
      state.cartObject = checkout.cart || null;
      state.paymentMethods = setPaymentMethods(checkout.paymentOptions || []);
      state.shippingMethods = setShippingMethods(checkout.shippingOptions || []);
    }
  };

  const getSummary = async (orderId: string, paymentData: CheckoutQueryParameters): Promise<OrderSummary | undefined> => {
    const isExternal = typeof paymentData === 'object' && paymentData !== null && 'geins-pt' in paymentData;

    const summary = await geinsOMS.order.getFromExternalPaymentData({
      pspOrderId: paymentData['geins-uid'] ?? orderId,
      paymentType: paymentData['geins-pt'] ?? 'STANDARD',
    });

    if (!summary) {
      throw new Error('Failed to get order summary');
    }
    return summary as OrderSummary;
  };

  const updateCheckout = async (options?: { paymentMethodId?: number; shippingMethodId?: number }): Promise<void> => {
    const checkout = await getCheckout(options);
    if (checkout) {
      state.cartObject = checkout.cart || null;
      state.paymentMethods = setPaymentMethods(checkout.paymentOptions || []);
      state.shippingMethods = setShippingMethods(checkout.shippingOptions || []);
    }
  };

  const getCheckout = async (options?: { paymentMethodId?: number; shippingMethodId?: number }): Promise<CheckoutType> => {
    let paymentMethodId = state.settings?.selectedPaymentMethodId as number | undefined;
    let shippingMethodId = state.settings?.selectedShippingMethodId as number | undefined;

    if (options) {
      if (options.paymentMethodId) {
        paymentMethodId = options.paymentMethodId;
      }
      if (options.shippingMethodId) {
        shippingMethodId = options.shippingMethodId;
      }
    }
    // console.log('CLIENT getCheckout() - paymentMethodId', paymentMethodId);

    const checkoutUrls = getCheckouUrls(paymentMethodId ?? 0);
    // console.log('CLIENT getCheckout() - checkoutUrls', checkoutUrls);
    const args = {
      cartId: state.cartId,
      paymentMethodId,
      shippingMethodId,
      checkout: {
        checkoutUrls,
      } as CheckoutInputType,
    };

    const checkout = await geinsOMS.checkout.get(args);
    if (!checkout) {
      throw new Error('Failed to get checkout');
    }
    return checkout;
  };

  const getCheckouUrls = (paymentMethodId: number): CheckoutUrlsInputType | undefined => {
    const urls = {} as CheckoutUrlsInputType;
    // console.log('CLIENT getCheckouUrls() - paymentMethod', paymentMethodId);
    if (paymentMethodId === 0) {
      throw new Error('Payment method ID is required.');
    }

    // add success if any
    if (state.redirectUrls?.success) {
      // Use the success URL directly without adding parameters again
      urls.redirectUrl = state.redirectUrls.success;
    } else {
      urls.redirectUrl = `${CHECKOUT_URL}/v0/${state.token}/thank-you/{payment.uid}`;
    }
    urls.redirectUrl = updateCheckoutUrlWithParameters({
      url: urls.redirectUrl,
      paymentMethodId,
    });

    // add change / cancel if any
    if (state.redirectUrls?.change) {
      urls.checkoutPageUrl = state.redirectUrls.change;
    }

    // add terms if any
    if (state.redirectUrls?.terms) {
      urls.termsPageUrl = state.redirectUrls.terms;
    }

    return urls;
  };

  const updateCheckoutUrlWithParameters = (args: { url: string; paymentMethodId: number }): string => {
    const { url, params } = extractParametersFromUrl(args.url);
    const parameters = geinsOMS.checkout.generateExternalCheckoutUrlParameters(params);
    if (!parameters) {
      return url;
    }
    const queryParams = Array.from(parameters.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    let newUrl = `${url}?${queryParams}`;
    newUrl = newUrl.replace('{geins.paymentMethodId}', args.paymentMethodId.toString());
    return newUrl;
  };

  const setPaymentMethods = (methods: PaymentOptionType[]): PaymentOptionType[] => {
    if (!Array.isArray(methods) || methods.length === 0) return [];
    if (!Array.isArray(state.settings?.availablePaymentMethodIds) || state.settings.availablePaymentMethodIds.length === 0) return methods;
    const returnMethods: PaymentOptionType[] = [];
    const order = state.settings.availablePaymentMethodIds as number[];

    for (const methodId of order) {
      const method = methods.find((m) => m.id === methodId);
      if (method) returnMethods.push(method);
    }

    return returnMethods;
  };

  const setShippingMethods = (methods: ShippingOptionType[]): ShippingOptionType[] => {
    if (!Array.isArray(methods) || methods.length === 0) return [];
    if (!Array.isArray(state.settings?.availableShippingMethodIds) || state.settings.availableShippingMethodIds.length === 0) return methods;

    const returnMethods: ShippingOptionType[] = [];
    const order = state.settings.availableShippingMethodIds as number[];

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
