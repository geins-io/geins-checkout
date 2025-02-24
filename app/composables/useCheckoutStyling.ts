import { GeinsOMS } from '@geins/oms';
import type { CheckoutStyleType } from '@geins/types';

// TODO: re-do styles so that it integrates with tailwind/shadcn instead of basic css
export const useCheckoutStyling = () => {
  const loading = ref(false);
  const style = ref<CheckoutStyleType>();
  const css = ref('');
  const cssNameTranslate = {
    backgroundColor: { name: 'background-color', unit: '' },
    textColor: { name: 'color', unit: '' },
    fontSize: { name: 'font-size', unit: '' },
    borderRadius: { name: 'border-radius', unit: 'px' },
  };
  // TODO: send this with token
  const imgBaseUrl = ref('https://labs.commerce.services/product/raw/');

  const initialize = async (token: string) => {
    const payload = await GeinsOMS.parseCheckoutToken(token);
    style.value = payload?.checkoutSettings?.style;
    if (!style.value) {
      return;
    }

    const classes = [];
    if (style.value?.body) {
      const bodyClass = buildClass('element', 'body', style.value.body);
      if (bodyClass) {
        classes.push(bodyClass);
      }
    }
    if (style.value?.topbar) {
      const topbarClass = buildClass('element', 'header', style.value.topbar);
      if (topbarClass) {
        classes.push(topbarClass);
      }
    }
    if (style.value?.cards) {
      const cardClass = buildClass('class', 'card', style.value?.cards);
      if (cardClass) {
        classes.push(cardClass);
      }
    }
    if (style.value?.buttons) {
      const buttonClass = buildClass('element', 'button', style.value?.buttons);
      if (buttonClass) {
        classes.push(buttonClass);
      }
    }

    css.value = `${classes.join('\n')}`;

    useHead({
      style: [
        {
          innerHTML: css.value,
        },
      ],
    });
  };

  const buildClass = (type: string, name: string, styleObject: unknown) => {
    const styles = [];
    for (const [key, value] of Object.entries(styleObject)) {
      if (!value) {
        continue;
      }
      const cssKey = cssNameTranslate[key];
      if (!cssKey) {
        continue;
      }
      styles.push(`${cssKey.name}: ${value}${cssKey.unit} !important`);
    }
    const prefix = type === 'class' ? '.' : '';

    return styles.length > 0 ? `${prefix}${name} {${styles.join(';')}}` : undefined;
  };

  const topBarVisible = computed(() => style.value?.topbar?.visible ?? true);
  const topBarTitle = computed(() => style.value?.title ?? 'Checkout');
  const logoUrl = computed(() => style.value?.logoUrl ?? '');

  return {
    loading,
    css,
    style,
    imgBaseUrl,
    initialize,
    topBarVisible,
    topBarTitle,
    logoUrl,
  };
};

/* export type CheckoutStyleType = {
  title?: string;
  logoUrl?: string;
  font?: string;
  backgroundColor?: string;
  body?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
  };
  topbar?: {
    visible?: boolean;
    backgroundColor?: string;
    textColor?: string;
  };
  cards?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
    borderRadius?: string;
  };
  text?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
  };
  buttons?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
  };
  validation?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
  };
};
 */
