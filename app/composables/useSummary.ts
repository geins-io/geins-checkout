export const useCheckout = () => {
  const geinsClient = useGeinsClient();
  const loading = ref(false);
  const error = ref('');

  const initializeSummary = async (
    token: string,
    orderId: string,
    paymentdata: any,
  ) => {
    let summary = null;
    try {
      loading.value = true;
      summary = await geinsClient.initializeSummary(
        token,
        orderId,
        paymentdata,
      );
      console.log('initializeSummary::', summary);
    } catch (e) {
      error.value = 'Failed to initialize summary';
      console.error(e);
    } finally {
      loading.value = false;
    }
    return summary;
  };

  const getSummary = async () => {
    const orderSummary = await geinsClient.getSummary();
    // console.log('getSummary::', orderSummary);

    const summary = {
      cart: orderSummary.cart,
    };

    return summary;
  };

  return {
    initializeSummary,
    getSummary,
  };
};
