import { extractParametersFromUrl, GeinsCore, RuntimeContext } from '@geins/core';
import { GeinsOMS } from '@geins/oms';
import type {
  CartType,
  CheckoutInputType,
  CheckoutRedirectsType,
  CheckoutSettings,
  CheckoutSummaryType,
  CheckoutType,
  CheckoutUrlsInputType,
  GeinsSettings,
  GeinsUserType,
  PaymentOptionType,
  ShippingOptionType,
} from '@geins/types';
import { CustomerType } from '@geins/types';
interface State {
  token: string;
  geinsSettings: GeinsSettings | null;
  settings: CheckoutSettings | null;
  cartId: string;
  cartObject: CartType | null;
  paymentMethods: PaymentOptionType[];
  shippingMethods: ShippingOptionType[];
  user: GeinsUserType | undefined;
  checkoutObject: CheckoutType | null;
  orderSummary: unknown | null;
  redirectUrls: CheckoutRedirectsType | undefined;
}

// Keep core instances outside the composable state
let geinsCore: GeinsCore;
let geinsOMS: GeinsOMS;

export const useGeinsClient = () => {
  const { token, parsedToken, confirmationUrl, parseToken } = useCheckoutToken();
  const { vatIncluded } = usePrice();

  const state = ref<State>({
    token: token.value,
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
  });

  const copyCart = (cartId: string): string => {
    return 'copy-cart-id ';
  };

  const initializeStateFromToken = async (): Promise<void> => {
    if (!parsedToken.value) {
      console.log('called init before token parsed');
      parsedToken.value = await parseToken(token.value);
    }

    state.value.geinsSettings = parsedToken.value.geinsSettings;
    state.value.user = parsedToken.value.user;
    state.value.settings = parsedToken.value.checkoutSettings;
    state.value.redirectUrls = parsedToken.value.checkoutSettings?.redirectUrls;

    vatIncluded.value = parsedToken.value.checkoutSettings.customerType === CustomerType.PERSON;
    console.log(
      '🚀 ~ initializeStateFromToken ~ parsedToken.value.checkoutSettings.customerType:',
      parsedToken.value.checkoutSettings.customerType,
    );

    if (parsedToken.value.checkoutSettings?.copyCart) {
      console.log(
        'CLIENT initializeStateFromToken() - copyCart',
        parsedToken.value.checkoutSettings.copyCart,
      );
    }

    state.value.cartId = parsedToken.value.cartId;
    // copy cart???
  };

  const setGeinsFromToken = async (): Promise<void> => {
    await initializeStateFromToken();

    if (!state.value.geinsSettings) {
      throw new Error('Failed to initialize geinsSettings from token');
    }

    // initialize Geins core
    geinsCore = new GeinsCore(state.value.geinsSettings);
    // initialize Geins OMS
    geinsOMS = markRaw(
      new GeinsOMS(geinsCore, {
        omsSettings: { context: RuntimeContext.HYBRID },
      }),
    );
  };

  const initializeSummary = async (): Promise<boolean> => {
    // set all the settings from the token
    try {
      await setGeinsFromToken();
    } catch (e) {
      console.error(e);
      return false;
    }
    return true;
  };

  const initializeCheckout = async (): Promise<void> => {
    await setGeinsFromToken();

    const checkout = await getCheckout({
      paymentMethodId: state.value.settings?.selectedPaymentMethodId as number,
    });

    if (checkout) {
      state.value.cartObject = checkout.cart || null;
      state.value.paymentMethods = setPaymentMethods(checkout.paymentOptions || []);
      state.value.shippingMethods = setShippingMethods(checkout.shippingOptions || []);
    }
  };

  const getCheckoutSummary = async (
    orderId: string,
    paymentMethod: string,
  ): Promise<CheckoutSummaryType | undefined> => {
    const summary = await geinsOMS.checkout.summary({ orderId, paymentMethod });
    if (!summary) {
      throw new Error('Failed to get order summary');
    }
    return summary;
  };

  const updateCheckout = async (options?: {
    paymentMethodId?: number;
    shippingMethodId?: number;
  }): Promise<void> => {
    const checkout = await getCheckout(options);

    if (checkout) {
      state.value.cartObject = checkout.cart || null;
      state.value.paymentMethods = setPaymentMethods(checkout.paymentOptions || []);
      state.value.shippingMethods = setShippingMethods(checkout.shippingOptions || []);
    }
  };

  const getCheckout = async (options?: {
    paymentMethodId?: number;
    shippingMethodId?: number;
  }): Promise<CheckoutType> => {
    let paymentMethodId = state.value.settings?.selectedPaymentMethodId as number | undefined;
    let shippingMethodId = state.value.settings?.selectedShippingMethodId as number | undefined;

    if (options) {
      if (options.paymentMethodId) {
        paymentMethodId = options.paymentMethodId;
      }
      if (options.shippingMethodId) {
        shippingMethodId = options.shippingMethodId;
      }
    }
    // console.log('CLIENT getCheckout() - paymentMethodId', paymentMethodId);

    const checkoutUrls = getCheckoutUrls(paymentMethodId ?? 0);

    const args = {
      cartId: state.value.cartId,
      paymentMethodId,
      shippingMethodId,
      checkoutOptions: {
        checkoutUrls,
      } as CheckoutInputType,
    };
    try {
      const checkout = await geinsOMS.checkout.get(args);
      if (!checkout) {
        throw new Error('Failed to get checkout');
      }
      return checkout;
    } catch (error) {
      console.error('Error during getCheckout:', error);
      throw error;
    }
  };

  const getCheckoutUrls = (paymentMethodId: number): CheckoutUrlsInputType | undefined => {
    const urls = {} as CheckoutUrlsInputType;
    // console.log('CLIENT getCheckoutUrls() - paymentMethod', paymentMethodId);
    if (paymentMethodId === 0) {
      throw new Error('Payment method ID is required.');
    }

    // add success if any
    if (state.value.redirectUrls?.success) {
      // Use the success URL directly without adding parameters again
      urls.redirectUrl = state.value.redirectUrls.success;
    } else {
      urls.redirectUrl = `${confirmationUrl.value}/{payment.uid}`;
    }
    urls.redirectUrl = updateCheckoutUrlWithParameters({
      url: urls.redirectUrl,
      paymentMethodId,
    });

    // add change / cancel if any
    if (state.value.redirectUrls?.cancel) {
      urls.checkoutPageUrl = state.value.redirectUrls.cancel;
    }

    // add terms if any
    if (state.value.redirectUrls?.terms) {
      urls.termsPageUrl = state.value.redirectUrls.terms;
    }

    // add privacy if any
    if (state.value.redirectUrls?.privacy) {
      urls.privacyPageUrl = state.value.redirectUrls.privacy;
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
    if (
      !Array.isArray(state.value.settings?.availablePaymentMethodIds) ||
      state.value.settings.availablePaymentMethodIds.length === 0
    )
      return methods;
    const returnMethods: PaymentOptionType[] = [];
    const order = state.value.settings.availablePaymentMethodIds as number[];

    for (const methodId of order) {
      const method = methods.find((m) => m.id === methodId);
      if (method) returnMethods.push(method);
    }

    return returnMethods;
  };

  const setShippingMethods = (methods: ShippingOptionType[]): ShippingOptionType[] => {
    if (!Array.isArray(methods) || methods.length === 0) return [];
    if (
      !Array.isArray(state.value.settings?.availableShippingMethodIds) ||
      state.value.settings.availableShippingMethodIds.length === 0
    )
      return methods;

    const returnMethods: ShippingOptionType[] = [];
    const order = state.value.settings.availableShippingMethodIds as number[];

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
    getCheckoutSummary,
    updateCheckout,
    // Getters that return current state values
    getCart: () => state.value.cartObject,
    getUser: () => state.value.user,
    getSettings: () => state.value.settings,
    getRedirectUrls: () => state.value.redirectUrls,
    getPaymentMethods: () => state.value.paymentMethods,
    getSelectedPaymentMethod: () => state.value.paymentMethods.find((method) => method.isSelected),
    getShippingMethods: () => state.value.shippingMethods,
    getSelectedShippingMethod: () => state.value.shippingMethods.find((method) => method.isSelected),
    validateCheckout: async () => true,
    createOrder: async (checkoutInput: { cartId: string; checkoutOptions: CheckoutInputType }) => {
      const result = await geinsOMS.checkout.createOrder(checkoutInput);
      return result;
    },
    getSummary: () => state.value.orderSummary,
  };
};
