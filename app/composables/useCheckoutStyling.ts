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
    if (style?.body) {
      const bodyClass = buildClass('elemnet', 'body', style?.body);
      if (bodyClass) {
        classes.push(bodyClass);
      }
    }
    if (style?.topbar) {
      const topbarClass = buildClass('elemnet', 'header', style?.topbar);
      if (topbarClass) {
        classes.push(topbarClass);
      }
    }
    if (style?.cards) {
      const cardClass = buildClass('class', 'card', style?.cards);
      if (cardClass) {
        classes.push(cardClass);
      }
    }
    if (style?.buttons) {
      const buttonClass = buildClass('elemnet', 'button', style?.buttons);
      if (buttonClass) {
        classes.push(buttonClass);
      }
    }
    state.css = classes.join('\n');
    setStylesToDocument();
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

  const setStylesToDocument = () => {
    // page background color
    const bgColor = state.style.backgroundColor;
    if (bgColor && typeof bgColor === 'string') {
      document.body.style.backgroundColor = bgColor;
    } else {
      //document.body.style.backgroundColor = '';
    }
    // build <style> tag for custom CSS rules
    const styleTag = document.createElement('style');
    styleTag.innerHTML = state.css;
    console.log(state.css);
    document.head.appendChild(styleTag);
  };

  return {
    state,
    initialize,
    setStylesToDocument,
    topbarVisible: () => state.style?.topbar?.visible ?? false,
    topbarTitle: () => state.style?.title ?? '',
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
