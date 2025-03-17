import type { PaymentOptionType } from '@geins/types';
import { GeinsPaymentType } from '@geins/types';

export const useExternalCheckout = () => {
  const { selectedPaymentMethod } = useGeinsClient();
  const externalCheckoutHtml = useState<string>('external-html', () => '');
  const isExternalCheckout = computed(() => !!selectedPaymentMethod.value?.paymentData);
  const suspended = ref(false);

  const renderExternalCheckout = async (payment?: PaymentOptionType) => {
    const paymentMethod = payment || selectedPaymentMethod.value;
    if (!paymentMethod?.paymentData || import.meta.server) {
      return;
    }
    externalCheckoutHtml.value = '';
    if (paymentMethod.paymentType === GeinsPaymentType.AvardaType) {
      externalCheckoutHtml.value = `<script src="https://stage.checkout-cdn.avarda.com/cdn/static/js/main.js"></script>`;
    }
    externalCheckoutHtml.value += paymentMethod.paymentData || '';

    await nextTick();

    const checkoutExternal = document.getElementById('checkout-external');
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
        initEventListeners();
      } else {
        console.error('Container not found');
      }
    });
  };

  const initEventListeners = () => {
    if (selectedPaymentMethod.value?.paymentType === GeinsPaymentType.GeinsPayType) {
      if (window._briqpay) {
        window._briqpay.subscribe('make_desicion', function (data) {
          console.log('make_desicion', data);
        });
      }
    }
  };

  const suspend = () => {
    if (externalCheckoutHtml.value) {
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
    if (externalCheckoutHtml.value && suspended.value) {
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
    } else {
      renderExternalCheckout();
    }
  };

  return {
    externalCheckoutHtml,
    isExternalCheckout,
    renderExternalCheckout,
    initEventListeners,
    suspend,
    resume,
  };
};
