import { Channel, extractParametersFromUrl, GeinsCore, RuntimeContext } from '@geins/core';
import { GeinsOMS } from '@geins/oms';
import type {
  CartType,
  CheckoutInputType,
  CheckoutRedirectsType,
  CheckoutSettings,
  CheckoutSummaryType,
  CheckoutType,
  CheckoutUrlsInputType,
  GeinsChannelTypeType,
  GeinsSettings,
  GeinsUserType,
  GetCheckoutOptions,
  PaymentOptionType,
  ShippingOptionType,
} from '@geins/types';
import { CustomerType } from '@geins/types';

export const useGeinsClient = () => {
  const geinsOMS = ref<GeinsOMS>();
  const geinsChannel = useState<GeinsChannelTypeType | undefined>('geins-channel');

  const { parsedCheckoutToken, confirmationPageUrl, checkoutPageUrl } = useCheckoutToken();
  const { vatIncluded } = usePrice();

  const geinsSettings = ref<GeinsSettings>();
  const checkoutSettings = ref<CheckoutSettings>();
  const cart = useState<CartType>('cart');
  const paymentMethods = useState<PaymentOptionType[]>('payment-methods', () => []);
  const shippingMethods = useState<ShippingOptionType[]>('shipping-methods', () => []);
  const user = ref<GeinsUserType>();
  const checkoutObject = ref<CheckoutType>();
  const redirectUrls = ref<CheckoutRedirectsType>();
  const checkoutUrls = ref<CheckoutUrlsInputType>();
  const orderSummary = ref<CheckoutSummaryType>();

  const selectedPaymentMethod = computed(() => {
    return paymentMethods.value?.find((method) => method.isSelected);
  });

  const selectedShippingMethod = computed(() => {
    return shippingMethods.value?.find((method) => method.isSelected);
  });

  const currentCountryName = computed(() => {
    const market = geinsSettings.value?.market;
    console.log('🚀 ~ currentCountryName ~ market:', market);

    if (!geinsChannel.value?.markets) return '';
    const currentMarketObj = geinsChannel.value.markets.find((m) => m?.alias === market);
    console.log('🚀 ~ currentCountryName ~ currentMarketObj:', currentMarketObj);
    const countryName = currentMarketObj?.country?.name;
    console.log('🚀 ~ currentCountryName ~ countryName:', countryName);
    return countryName;
  });

  const initializeClientFromToken = async (): Promise<void> => {
    checkoutSettings.value = parsedCheckoutToken.value.checkoutSettings;
    user.value = parsedCheckoutToken.value.user;
    geinsSettings.value = parsedCheckoutToken.value.geinsSettings;
    redirectUrls.value = checkoutSettings.value?.redirectUrls;

    // Set vatIncluded based on customer type
    vatIncluded.value = parsedCheckoutToken.value.checkoutSettings.customerType === CustomerType.PERSON;
    cart.value = { id: parsedCheckoutToken.value.cartId } as CartType;
  };

  const setGeinsClient = async (): Promise<void> => {
    await initializeClientFromToken();

    if (!geinsSettings.value) {
      throw new Error('Failed to initialize geinsSettings from token');
    }

    // initialize Geins OMS
    geinsOMS.value = new GeinsOMS(new GeinsCore(geinsSettings.value), {
      omsSettings: { context: RuntimeContext.HYBRID },
    });
    try {
      const channel = Channel.getInstance(geinsSettings.value);
      geinsChannel.value = await channel.get();
    } catch (e) {
      console.error('Failed to set Geins channel', e);
    }
  };

  const copyCart = async (): Promise<void> => {
    if (checkoutSettings.value?.copyCart) {
      try {
        if (!cart.value?.id) {
          throw new Error('Cart ID is missing');
        }
        const newCartId = await geinsOMS.value?.cart.copy({ id: cart.value?.id, loadCopy: true });
        cart.value = { id: newCartId } as CartType;
      } catch (e) {
        console.error('Failed to copy cart', e);
      }
    }
  };

  const initializeSummary = async (): Promise<boolean> => {
    // set all the checkoutSettings from the token
    try {
      await setGeinsClient();
    } catch (e) {
      console.error(e);
      return false;
    }
    return true;
  };

  const initializeCheckout = async (): Promise<void> => {
    await setGeinsClient();
    await copyCart();

    const checkout = await getCheckout({
      paymentMethodId: checkoutSettings.value?.selectedPaymentMethodId,
      shippingMethodId: checkoutSettings.value?.selectedShippingMethodId,
    });

    if (checkout) {
      if (checkout.cart) {
        cart.value = checkout.cart;
      }
      paymentMethods.value = setPaymentMethods(checkout.paymentOptions || []);
      shippingMethods.value = setShippingMethods(checkout.shippingOptions || []);
    }
  };

  const getCheckoutSummary = async (
    orderId: string,
    paymentMethod: string,
    cartId: string,
  ): Promise<CheckoutSummaryType | undefined> => {
    const summary = await geinsOMS.value?.checkout.summary({ orderId, paymentMethod });
    if (!summary) {
      throw new Error('Failed to get order summary');
    }
    const orderCart = await geinsOMS.value?.cart.get(cartId);
    if (!orderCart) {
      throw new Error('Failed to get cart');
    }
    cart.value = orderCart;
    if (!cart.value.completed) {
      await completeCart();
    }
    return summary;
  };

  const updateCheckout = async (options?: {
    paymentMethodId?: number;
    shippingMethodId?: number;
    checkoutOptions?: CheckoutInputType;
  }): Promise<void> => {
    const checkout = await getCheckout(options);

    if (checkout) {
      if (checkout.cart) {
        cart.value = checkout.cart;
      }
      paymentMethods.value = setPaymentMethods(checkout.paymentOptions || []);
      shippingMethods.value = setShippingMethods(checkout.shippingOptions || []);
    }
  };

  const getCheckout = async (options?: {
    paymentMethodId?: number;
    shippingMethodId?: number;
    checkoutOptions?: CheckoutInputType;
  }): Promise<CheckoutType> => {
    const paymentMethodId = checkoutSettings.value?.selectedPaymentMethodId || options?.paymentMethodId;
    const shippingMethodId = checkoutSettings.value?.selectedShippingMethodId || options?.shippingMethodId;

    checkoutUrls.value = getCheckoutUrls(paymentMethodId);

    const args: GetCheckoutOptions = {
      cartId: cart.value?.id,
      paymentMethodId,
      shippingMethodId,
      checkoutOptions: {
        customerType: checkoutSettings.value?.customerType,
        checkoutUrls: checkoutUrls.value,
        ...options?.checkoutOptions,
      },
    };

    try {
      const checkout = await geinsOMS.value?.checkout.get(args);
      if (!checkout) {
        throw new Error('Failed to get checkout');
      }
      return checkout;
    } catch (error) {
      console.error('Error during getCheckout:', error);
      throw error;
    }
  };

  const getCheckoutUrls = (paymentMethodId?: number): CheckoutUrlsInputType | undefined => {
    const urls: CheckoutUrlsInputType = {};
    if (!paymentMethodId) {
      throw new Error('Payment method ID is required.');
    }

    if (checkoutSettings.value?.redirectUrls?.success) {
      urls.redirectUrl = checkoutSettings.value.redirectUrls.success;
    } else {
      urls.redirectUrl = confirmationPageUrl.value.replace('{orderId}', '{payment.uid}');
    }

    urls.redirectUrl = updateCheckoutUrlWithParameters({
      url: urls.redirectUrl || '',
      paymentMethodId,
    });

    if (checkoutPageUrl.value) {
      urls.checkoutPageUrl = checkoutPageUrl.value;
    }

    if (checkoutSettings.value?.redirectUrls?.terms) {
      urls.termsPageUrl = checkoutSettings.value.redirectUrls.terms;
    }

    return urls;
  };

  const updateCheckoutUrlWithParameters = (args: { url: string; paymentMethodId: number }): string => {
    const { url, params } = extractParametersFromUrl(args.url);

    const parameters = geinsOMS.value?.checkout.generateExternalCheckoutUrlParameters(params);
    if (!parameters) {
      return url;
    }
    const queryParams = Array.from(parameters.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    let newUrl = `${url}?${queryParams}`;
    newUrl = newUrl.replace('{geins.paymentMethodId}', args.paymentMethodId.toString());
    if (args.paymentMethodId === 18) {
      newUrl = newUrl
        .replace('{geins.cartid}', cart.value?.id || '')
        .replace('{geins.paymentType}', 'STANDARD');
    }

    return newUrl;
  };

  const setPaymentMethods = (methods: PaymentOptionType[]): PaymentOptionType[] => {
    if (!Array.isArray(methods) || methods.length === 0) return [];
    if (
      !Array.isArray(checkoutSettings.value?.availablePaymentMethodIds) ||
      checkoutSettings.value?.availablePaymentMethodIds.length === 0
    )
      return methods;
    const returnMethods: PaymentOptionType[] = [];
    const order = checkoutSettings.value.availablePaymentMethodIds as number[];

    for (const methodId of order) {
      const method = methods.find((m) => m.id === methodId);
      if (method) returnMethods.push(method);
    }

    return returnMethods;
  };

  const setShippingMethods = (methods: ShippingOptionType[]): ShippingOptionType[] => {
    if (!Array.isArray(methods) || methods.length === 0) return [];
    if (
      !Array.isArray(checkoutSettings.value?.availableShippingMethodIds) ||
      checkoutSettings.value.availableShippingMethodIds.length === 0
    )
      return methods;

    const returnMethods: ShippingOptionType[] = [];
    const order = checkoutSettings.value.availableShippingMethodIds as number[];

    for (const methodId of order) {
      const method = methods.find((m) => m.id === methodId);
      if (method) returnMethods.push(method);
    }
    return returnMethods;
  };

  const createOrder = async (checkoutInput: { cartId: string; checkoutOptions: CheckoutInputType }) => {
    const result = await geinsOMS.value?.checkout.createOrder(checkoutInput);
    return result;
  };

  const completeCart = async () => {
    try {
      const result = await geinsOMS.value?.cart.complete();
      return result;
    } catch (error) {
      console.error('Error during completeCart:', error);
      throw error;
    }
  };

  return {
    geinsSettings,
    checkoutSettings,
    cart,
    paymentMethods,
    shippingMethods,
    user,
    checkoutObject,
    redirectUrls,
    checkoutUrls,
    orderSummary,
    selectedPaymentMethod,
    selectedShippingMethod,
    currentCountryName,
    initializeSummary,
    initializeCheckout,
    getCheckout,
    getCheckoutSummary,
    updateCheckout,
    updateCheckoutUrlWithParameters,
    createOrder,
    completeCart,
  };
};
