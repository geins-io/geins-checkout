import type { CartType, CheckoutQueryParameters, CheckoutSummaryType } from '@geins/types';

export const useSummary = () => {
  const geinsClient = useGeinsClient();
  const { parsedCheckoutToken } = useCheckoutToken();

  const checkoutLoading = useState<boolean>('checkout-loading', () => true);
  const continueShoppingUrl = ref('');
  const isExternalSummary = ref(false);
  const error = ref('');
  const orderSummary = ref<CheckoutSummaryType>();

  const initializeSummary = async (orderId: string, paymentdata: CheckoutQueryParameters) => {
    const init = async () => {
      try {
        checkoutLoading.value = true;
        await geinsClient.initializeSummary();
        continueShoppingUrl.value = geinsClient.redirectUrls.value?.cancel || '';

        orderSummary.value = await getCheckoutSummary({ orderId, paymentdata });
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
    paymentdata: CheckoutQueryParameters;
  }): Promise<CheckoutSummaryType> => {
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
      isExternalSummary.value = true;
      // await setExternalSummary(orderSummary.htmlSnippet);
    }

    return orderSummary;
  };

  const parseQueryParameters = (paymentdata: CheckoutQueryParameters) => {
    const orderId = paymentdata['geins-uid'] ?? '';
    const paymentType = paymentdata['geins-pt'] ?? 'STANDARD';

    return { orderId, paymentType };
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
    isExternalSummary,
    continueShoppingUrl,
    orderSummary,
    orderCart,
    initializeSummary,
  };
};
