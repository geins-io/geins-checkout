import { Channel, extractParametersFromUrl } from '@geins/core';
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
import { CustomerType, PaymentOptionCheckoutType } from '@geins/types';

export const useGeinsClient = () => {
  const { $geinsOMS, $createGeinsClient } = useNuxtApp();
  const { geinsLog, geinsLogError } = useGeinsLog('useGeinsClient.ts');
  const { parsedCheckoutToken, confirmationPageUrl, checkoutPageUrl } = useCheckoutToken();
  const { vatIncluded } = usePrice();

  const geinsSettings = ref<GeinsSettings>();
  const checkoutSettings = ref<CheckoutSettings>();
  const user = ref<GeinsUserType>();
  const checkoutObject = ref<CheckoutType>();
  const redirectUrls = ref<CheckoutRedirectsType>();
  const checkoutUrls = ref<CheckoutUrlsInputType>();
  const orderSummary = ref<CheckoutSummaryType>();

  const geinsChannel = useState<GeinsChannelTypeType | undefined>('geins-channel');
  const cart = useState<CartType>('cart');
  const paymentMethods = useState<PaymentOptionType[]>('payment-methods', () => []);
  const shippingMethods = useState<ShippingOptionType[]>('shipping-methods', () => []);
  const currentCountryName = useState<string>('country-name');

  const selectedPaymentMethod = computed(() => {
    return paymentMethods.value?.find((method) => method.isSelected);
  });

  const selectedShippingMethod = computed(() => {
    return shippingMethods.value?.find((method) => method.isSelected);
  });

  const initializeClientFromToken = async (): Promise<void> => {
    checkoutSettings.value = parsedCheckoutToken.value.checkoutSettings;
    user.value = parsedCheckoutToken.value.user;
    geinsSettings.value = parsedCheckoutToken.value.geinsSettings;
    redirectUrls.value = checkoutSettings.value?.redirectUrls;

    vatIncluded.value = parsedCheckoutToken.value.checkoutSettings.customerType === CustomerType.PERSON;
    cart.value = { id: parsedCheckoutToken.value.cartId } as CartType;
  };

  const setGeinsClient = async (): Promise<void> => {
    await initializeClientFromToken();

    if (!geinsSettings.value) {
      throw new Error('Failed to initialize geinsSettings from token');
    }

    await $createGeinsClient(geinsSettings.value);
    await setGeinsChannel();
    geinsLog('client initialized with settings', geinsSettings.value);
  };

  const setGeinsChannel = async (): Promise<void> => {
    if (!geinsSettings.value) {
      throw new Error('Geins settings are missing');
    }
    try {
      const channel = Channel.getInstance(geinsSettings.value);
      geinsChannel.value = await channel.get();
      geinsLog('channel set', geinsChannel.value);
      if (geinsChannel.value) {
        const currentMarketObj = geinsChannel.value.markets?.find(
          (m) => m?.alias === geinsSettings.value?.market,
        );
        currentCountryName.value = currentMarketObj?.country?.name || '';
      }
    } catch (e) {
      geinsLogError('Failed to set Geins channel', e);
      throw e;
    }
  };

  const copyCart = async (): Promise<void> => {
    if (checkoutSettings.value?.copyCart) {
      try {
        if (!cart.value?.id) {
          throw new Error('Cart ID is missing');
        }
        const newCartId = await $geinsOMS.value?.cart.copy({ id: cart.value?.id, loadCopy: true });
        cart.value = { id: newCartId } as CartType;
        geinsLog('cart successfully copied');
      } catch (e) {
        geinsLogError('Failed to copy cart', e);
        throw new Error('Failed to copy cart');
      }
    }
  };

  const initializeSummary = async (): Promise<boolean> => {
    try {
      await setGeinsClient();
    } catch (e) {
      geinsLogError('Failed to initialize summary', e);
      throw e;
    }
    return true;
  };

  const initializeCheckout = async (checkoutOptions: CheckoutInputType): Promise<void> => {
    await setGeinsClient();
    await copyCart();

    const checkout = await getCheckout({
      paymentMethodId: checkoutOptions.paymentId,
      shippingMethodId: checkoutOptions.shippingId,
      checkoutOptions,
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
    if (!$geinsOMS.value) {
      throw new Error('Geins OMS is not initialized');
    }
    const summary = await fetchFromClient(
      'get-summary',
      $geinsOMS.value.checkout.summary({ orderId, paymentMethod }),
    );
    if (!summary) {
      throw new Error('Failed to get summary');
    }
    const orderCart = await fetchFromClient('get-cart', $geinsOMS.value?.cart.get(cartId));
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
    const checkout = await getCheckout(options, false);

    if (checkout) {
      if (checkout.cart) {
        cart.value = checkout.cart;
      }
      paymentMethods.value = setPaymentMethods(checkout.paymentOptions || []);
      shippingMethods.value = setShippingMethods(checkout.shippingOptions || []);
    }
  };

  const getCheckout = async (
    options?: {
      paymentMethodId?: number;
      shippingMethodId?: number;
      checkoutOptions?: CheckoutInputType;
    },
    useSSR: boolean = true,
  ): Promise<CheckoutType> => {
    const paymentMethodId = checkoutSettings.value?.selectedPaymentMethodId || options?.paymentMethodId;
    const shippingMethodId = checkoutSettings.value?.selectedShippingMethodId || options?.shippingMethodId;

    checkoutUrls.value = getCheckoutUrls(paymentMethodId);

    const args: GetCheckoutOptions = {
      cartId: cart.value?.id,
      paymentMethodId,
      shippingMethodId,
      checkoutOptions: {
        checkoutUrls: checkoutUrls.value,
        ...options?.checkoutOptions,
      },
    };

    if (!$geinsOMS.value) {
      throw new Error('Geins OMS is not initialized');
    }

    let checkout: CheckoutType | undefined;
    if (!useSSR) {
      checkout = await $geinsOMS.value.checkout.get(args);
    } else {
      checkout = await fetchFromClient('get-checkout', $geinsOMS.value.checkout.get(args));
    }

    if (!checkout) {
      throw new Error('Failed to get checkout');
    }
    return checkout;
  };

  const fetchFromClient = async <T>(key: string, promise: Promise<T>) => {
    const { data, error } = await useAsyncData(key, () => {
      return promise;
    });
    if (error.value) {
      throw new Error(`Failed to fetch ${key}: ${error.value}`);
    }
    return data.value;
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

    const parameters = $geinsOMS.value?.checkout.generateExternalCheckoutUrlParameters(params);
    if (!parameters) {
      return url;
    }
    const queryParams = Array.from(parameters.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    let newUrl = `${url}?${queryParams}`;
    newUrl = newUrl.replace('{geins.paymentMethodId}', args.paymentMethodId.toString());
    if (selectedPaymentMethod.value?.checkoutType === PaymentOptionCheckoutType.STANDARD) {
      newUrl = newUrl
        .replace('{geins.cartid}', cart.value?.id || '')
        .replace('{geins.paymentType}', PaymentOptionCheckoutType.STANDARD);
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
    const result = await $geinsOMS.value?.checkout.createOrder(checkoutInput);
    if (!result) {
      throw new Error('Failed to create order');
    }
    geinsLog('order created', result);
    return result;
  };

  const completeCart = async () => {
    const result = await $geinsOMS.value?.cart.complete();
    if (!result) {
      throw new Error('Failed to complete cart');
    }
    geinsLog('cart successfully completed');
    return result;
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
