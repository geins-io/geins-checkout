import { reactive } from 'vue';
import type { CheckoutStyleType } from '@geins/core';
import { GeinsOMS } from '@geins/oms';

const cssNameTranslate = {
  backgroundColor: { name: 'background-color', unit: '' },
  textColor: { name: 'color', unit: '' },
  fontSize: { name: 'font-size', unit: 'px' },
  borderRadius: { name: 'border-radius', unit: 'px' },
};

export const useCheckoutStyling = () => {
  const state = reactive<any>({
    loading: true,
    style: undefined,
    css: '',
  });

  const initialize = async (token: string) => {
    const payload = await GeinsOMS.parseCheckoutToken(token);
    const style = payload?.checkoutSettings?.style;
    if (!style) {
      return;
    }
    state.style = style;

    const classes = [];

    if (style?.cards) {
      const cardClass = buildClass('card', style?.cards);
      classes.push(cardClass);
    }
    // build css

    state.css = classes.join('\n');
  };
  const buildClass = (className: string, styleObject: unknown) => {
    const styles = [];
    for (const [key, value] of Object.entries(styleObject)) {
      console.log('key', key, value);
      if (!value) {
        continue;
      }
      const cssKey = cssNameTranslate[key];
      if (!cssKey) {
        continue;
      }
      styles.push(`${cssKey.name}: ${value}${cssKey.unit} !important`);
    }

    return `.${className} {${styles.join(';')}}`;
  };

  return {
    state,
    initialize,
  };
};

/* export type CheckoutStyleType = {
  title?: string;
  logoUrl?: string;
  font?: string;
  backgroundColor?: string;
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
