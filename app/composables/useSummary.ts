import type { CheckoutQueryParameters, CheckoutSummaryType } from '@geins/types';

export const useSummary = () => {
  const geinsClient = useGeinsClient();
  const { geinsLog, geinsLogError } = useGeinsLog('composables/useSummary.ts');
  const { parsedCheckoutToken } = useCheckoutToken();
  const { externalSnippetHtml } = useExternalSnippet();

  const checkoutLoading = useState<boolean>('checkout-loading', () => true);

  const error = ref('');
  const orderSummary = ref<CheckoutSummaryType>();
  const summaryOrderId = ref('');

  const cart = computed(() => geinsClient.cart.value);

  const initializeSummary = async (orderId: string, checkoutQueryParams: CheckoutQueryParameters) => {
    const init = async () => {
      try {
        checkoutLoading.value = true;
        await geinsClient.initializeSummary();

        orderSummary.value = await getCheckoutSummary({ orderId, checkoutQueryParams });
        geinsLog('order summary fetched', orderSummary.value);
      } catch (e) {
        error.value = 'Failed to initialize summary';
        geinsLogError(error.value, e);
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
  }): Promise<CheckoutSummaryType | undefined> => {
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

  return {
    checkoutLoading,
    error,
    cart,
    orderSummary,
    summaryOrderId,
    initializeSummary,
  };
};
