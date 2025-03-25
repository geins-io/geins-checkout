import type { CartType, CheckoutQueryParameters, CheckoutSummaryType } from '@geins/types';

export const useSummary = () => {
  const geinsClient = useGeinsClient();
  const { parsedCheckoutToken } = useCheckoutToken();
  const { externalSnippetHtml } = useExternalSnippet();

  const checkoutLoading = useState<boolean>('checkout-loading', () => true);
  const continueShoppingUrl = ref('');
  const error = ref('');
  const orderSummary = ref<CheckoutSummaryType>();
  const cart = computed(() => geinsClient.cart.value);
  const summaryOrderId = ref('');

  const initializeSummary = async (orderId: string, checkoutQueryParams: CheckoutQueryParameters) => {
    const init = async () => {
      try {
        checkoutLoading.value = true;
        await geinsClient.initializeSummary();
        continueShoppingUrl.value = geinsClient.redirectUrls.value?.cancel || '';

        orderSummary.value = await getCheckoutSummary({ orderId, checkoutQueryParams });
      } catch (e) {
        error.value = 'Failed to initialize summary';
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

  const getCheckoutSummary = async (args: {
    orderId: string;
    checkoutQueryParams: CheckoutQueryParameters;
  }): Promise<CheckoutSummaryType> => {
    const queryStringArgs = parseQueryParameters(args.checkoutQueryParams);
    summaryOrderId.value = queryStringArgs.orderId;
    if (!args.orderId && !queryStringArgs.orderId) {
      throw new Error('Missing orderId');
    }

    queryStringArgs.orderId = args.orderId || queryStringArgs.orderId;

    const { orderId, paymentMethod, cartId } = queryStringArgs;

    const orderSummary = await geinsClient.getCheckoutSummary(orderId, paymentMethod, cartId);

    if (!orderSummary) {
      throw new Error('Failed to get order summary');
    }
    if (orderSummary.htmlSnippet) {
      externalSnippetHtml.value = orderSummary.htmlSnippet;
    }

    return orderSummary;
  };

  const parseQueryParameters = (checkoutQueryParams: CheckoutQueryParameters) => {
    const orderId = checkoutQueryParams['geins-uid'] ?? '';
    const paymentMethod = checkoutQueryParams['geins-pt'] ?? 'STANDARD';
    const cartId = checkoutQueryParams['geins-cart'] ?? '';

    return { orderId, paymentMethod, cartId };
  };

  const orderCart = computed(() => {
    return {
      id: '',
      items: orderSummary.value?.order?.rows,
    } as CartType;
  });

  return {
    checkoutLoading,
    error,
    cart,
    continueShoppingUrl,
    orderSummary,
    orderCart,
    summaryOrderId,
    initializeSummary,
  };
};
