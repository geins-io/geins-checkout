import { ExternalSnippetType } from '#shared/types';
import type { PaymentOptionType } from '@geins/types';
import { GeinsPaymentType } from '@geins/types';

export const useExternalSnippet = () => {
  const { geinsLog, geinsLogError, geinsLogInfo } = useGeinsLog('composables/useExternalSnippet.ts');
  const { selectedPaymentMethod } = useGeinsClient();

  const externalSnippetHtml = useState<string>('external-html', () => '');
  const externalSnippetRendered = useState<boolean>('external-rendered', () => false);
  const suspended = useState<boolean>('external-suspended', () => false);

  const externalPaymentSelected = computed(() => !!selectedPaymentMethod.value?.paymentData);
  const hasExternalSnippet = computed(() => !!externalSnippetHtml.value);

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
