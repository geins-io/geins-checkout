import { ref } from 'vue';

import type { CheckoutQueryParameters } from '@geins/types';
import type { CheckoutOrderSummary } from '@/shared/types/checkout';

const geinsClient = useGeinsClient();

export const useSummary = () => {
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

  const initializeSummary = async (token: string, orderId: string, paymentdata: CheckoutQueryParameters): Promise<CheckoutOrderSummary> => {
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

  const getCheckoutSummary = async (args: { orderId: string; paymentdata: CheckoutQueryParameters }): Promise<CheckoutOrderSummary> => {
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
      await setExternalSummary(orderSummary.htmlSnippet);
    }

    return orderSummary;
  };

  const setExternalSummary = async (html: string) => {
    // Wait for Vue to update the DOM
    await nextTick();

    const container = document.createElement('div');
    container.innerHTML = html;

    console.log('html', html);

    const scriptTags = container.querySelectorAll('script');
    scriptTags.forEach(async (scriptTag) => {
      const newScript = document.createElement('script');
      if (scriptTag.src) {
        // External script
        newScript.src = scriptTag.src;
        newScript.async = true;
      } else {
        // Inline script
        newScript.textContent = scriptTag.innerHTML;
      }
      await nextTick();
      // Append the script to the container or body
      const target = document.getElementById('summary-external');
      console.log('add scriptTag', scriptTag);
      console.log('add to target', target);
      target?.appendChild(newScript);
      if (target) {
        //target.appendChild(newScript);
      } else {
        console.error('Container not found');
      }
    });
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
