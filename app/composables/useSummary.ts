import type { CheckoutQueryParameters } from '@geins/types';

export const useSummary = () => {
  const geinsClient = useGeinsClient();
  const state = reactive<{
    loading: boolean;
    isExternalSummary: boolean;
    continueShoppingUrl: string;
    error: string;
  }>({
    loading: true,
    isExternalSummary: false,
    continueShoppingUrl: '',
    error: '',
  });

  const initializeSummary = async (
    token: string,
    orderId: string,
    paymentdata: CheckoutQueryParameters,
  ): Promise<CheckoutOrderSummary | null> => {
    let orderSummary: CheckoutOrderSummary | null = null;

    try {
      state.loading = true;
      await geinsClient.initializeSummary(token);
      state.continueShoppingUrl = (await getContinueShoppingUrl()) ?? '';

      orderSummary = await getCheckoutSummary({ orderId, paymentdata });
    } catch (e) {
      state.error = 'Failed to initialize summary';
      console.error(e);
    } finally {
      state.loading = false;
    }
    return orderSummary;
  };

  const getCheckoutSummary = async (args: {
    orderId: string;
    paymentdata: CheckoutQueryParameters;
  }): Promise<CheckoutOrderSummary> => {
    const queryStringArgs = parseQueryParameters(args.paymentdata);
    if (args.orderId === undefined || queryStringArgs.orderId === undefined) {
      throw new Error('Missing orderId');
    }
    const orderId = args.orderId ?? queryStringArgs.orderId;
    const paymentType = queryStringArgs.paymentType;
    const orderSummary = await geinsClient.getCheckoutSummary(orderId, paymentType);

    if (!orderSummary) {
      throw new Error('Failed to get order summary');
    }
    if (orderSummary.htmlSnippet) {
      state.isExternalSummary = true;
      // await setExternalSummary(orderSummary.htmlSnippet);
    }

    return orderSummary;
  };

  const getContinueShoppingUrl = async () => {
    const urls = geinsClient.getRedirectUrls();
    if (!urls) {
      return '';
    }
    return urls?.cancel || urls?.change;
  };

  const parseQueryParameters = (paymentdata: CheckoutQueryParameters) => {
    const orderId = paymentdata['geins-uid'] ?? '';
    const paymentType = paymentdata['geins-pt'] ?? 'STANDARD';

    return { orderId, paymentType };
  };

  return {
    state,
    initializeSummary,
    getContinueShoppingUrl,
  };
};
