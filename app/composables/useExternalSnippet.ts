import { ExternalSnippetType } from '#shared/types';
import type { PaymentOptionType } from '@geins/types';
import { GeinsPaymentType, PaymentOptionCheckoutType } from '@geins/types';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _klarnaCheckout?: (callback: (api: any) => void) => void;
    _briqpay?: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subscribe: (event: string, callback: (data: any) => void) => void;
      v3: {
        suspend: () => void;
        resume: () => void;
      };
    };
    collector?: {
      checkout: {
        api: {
          suspend: () => void;
          resume: () => void;
        };
      };
    };
    scoApi?: {
      setCheckoutEnabled: (enabled: boolean) => void;
    };
    avardaCheckout?: {
      refreshForm: () => void;
    };
  }
}

/**
 * A composable function for managing external snippets in the checkout process.
 *
 * @returns {UseExternalSnippetComposable} An object containing state and methods for external snippet management.
 *
 * @property {Ref<string>} externalSnippetHtml - Reactive string containing the HTML of the external snippet.
 * @property {Ref<boolean>} externalSnippetRendered - Reactive boolean indicating if the external snippet is rendered.
 * @property {Ref<boolean>} suspended - Reactive boolean indicating if the external snippet is suspended.
 * @property {ComputedRef<boolean>} externalPaymentSelected - Computed property indicating if an external payment method is selected.
 * @property {ComputedRef<boolean>} hasExternalSnippet - Computed property indicating if an external snippet exists.
 * @property {(type: ExternalSnippetType, payment?: PaymentOptionType) => Promise<void>} renderExternalSnippet - Method to render the external snippet.
 * @property {() => void} initExternalEventListeners - Method to initialize event listeners for the external snippet.
 * @property {() => void} suspend - Method to suspend the external snippet.
 * @property {() => void} resume - Method to resume the external snippet.
 */
export const useExternalSnippet = (): UseExternalSnippetComposable => {
  const { geinsLog, geinsLogError, geinsLogInfo } = useGeinsLog('useExternalSnippet.ts');
  const { selectedPaymentMethod } = useGeinsClient();

  const externalSnippetHtml = useState<string>('external-html', () => '');
  const externalSnippetRendered = useState<boolean>('external-rendered', () => false);
  const suspended = useState<boolean>('external-suspended', () => false);

  const hasExternalSnippet = computed(() => !!externalSnippetHtml.value);

  const externalPaymentSelected = computed(() => {
    const checkoutType = selectedPaymentMethod.value?.checkoutType;

    return Boolean(
      checkoutType === PaymentOptionCheckoutType.EXTERNAL ||
        (checkoutType === PaymentOptionCheckoutType.GEINS_PAY && selectedPaymentMethod.value?.paymentData),
    );
  });

  const renderExternalSnippet = async (
    type: ExternalSnippetType = ExternalSnippetType.Checkout,
    payment?: PaymentOptionType,
  ) => {
    if (type === ExternalSnippetType.Checkout) {
      const paymentMethod = payment || selectedPaymentMethod.value;
      if (!paymentMethod?.paymentData || import.meta.server) {
        return;
      }
      externalSnippetHtml.value = '';
      if (paymentMethod.paymentType === GeinsPaymentType.AvardaType) {
        useHead({
          script: [
            {
              src: 'https://stage.checkout-cdn.avarda.com/cdn/static/js/main.js',
              async: true,
            },
          ],
        });
      }
      externalSnippetHtml.value += paymentMethod.paymentData || '';
    }

    if (!externalSnippetHtml.value) {
      geinsLogError('no external snippet found');
      return;
    }

    await nextTick();

    const checkoutExternal = document.getElementById(`${type}-external`);
    const scriptTags = checkoutExternal?.querySelectorAll('script');

    scriptTags?.forEach((scriptTag) => {
      const newScript = document.createElement('script');
      if (scriptTag.src) {
        // External script
        newScript.src = scriptTag.src;
        newScript.async = true;
      } else {
        // Inline script
        newScript.textContent = scriptTag.innerHTML;
      }
      if (checkoutExternal) {
        checkoutExternal.appendChild(newScript);
        initExternalEventListeners();
      } else {
        geinsLogError('external snippet container missing');
        return;
      }
    });
    externalSnippetRendered.value = true;
    geinsLog('external snippet rendered');
  };

  const initExternalEventListeners = () => {
    if (selectedPaymentMethod.value?.paymentType === GeinsPaymentType.GeinsPayType) {
      if (window._briqpay) {
        window._briqpay.subscribe('make_decision', function (data) {
          geinsLogInfo('make_decision', data);
        });
      }
    }
  };

  const suspend = () => {
    if (externalSnippetRendered.value) {
      switch (selectedPaymentMethod.value?.paymentType) {
        case GeinsPaymentType.KlarnaType:
          if (window._klarnaCheckout) {
            window._klarnaCheckout(function (api) {
              api.suspend();
            });
          }
          suspended.value = true;
          return;
        case GeinsPaymentType.SveaType:
          if (window.scoApi) {
            window.scoApi.setCheckoutEnabled(false);
          }
          suspended.value = true;
          return;
        case GeinsPaymentType.WalleyType:
          if (window.collector) {
            window.collector.checkout.api.suspend();
          }
          suspended.value = true;
          return;
        case GeinsPaymentType.GeinsPayType:
          if (window._briqpay) {
            window._briqpay.v3.suspend();
          }
          suspended.value = true;
          return;
      }
    }
  };
  const resume = () => {
    if (externalSnippetRendered.value && suspended.value) {
      switch (selectedPaymentMethod.value?.paymentType) {
        case GeinsPaymentType.KlarnaType:
          if (window._klarnaCheckout) {
            window._klarnaCheckout(function (api) {
              api.resume();
            });
          } else {
            setTimeout(resume, 100);
          }
          return;
        case GeinsPaymentType.SveaType:
          if (window.scoApi) {
            window.scoApi.setCheckoutEnabled(true);
          }
          return;
        case GeinsPaymentType.WalleyType:
          if (window.collector) {
            window.collector.checkout.api.resume();
          }
          return;
        case GeinsPaymentType.AvardaType:
          if (window.avardaCheckout) {
            window.avardaCheckout.refreshForm();
          }
          return;
        case GeinsPaymentType.GeinsPayType:
          if (window._briqpay) {
            window._briqpay.v3.resume();
          }
          return;
      }
      suspended.value = false;
    } else if (!externalSnippetRendered.value) {
      renderExternalSnippet();
    }
  };

  return {
    externalSnippetHtml,
    externalPaymentSelected,
    externalSnippetRendered,
    hasExternalSnippet,
    suspended,
    renderExternalSnippet,
    initExternalEventListeners,
    suspend,
    resume,
  };
};
