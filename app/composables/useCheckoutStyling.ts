import { reactive } from 'vue';
import type { CheckoutStyleType } from '@geins/core';
import { GeinsOMS } from '@geins/oms';

export const useCheckoutStyling = () => {
  const state = reactive<CheckoutStyleType>({
    backgroundColor: undefined,
  });

  const initialize = async (token: string) => {
    const payload = await GeinsOMS.parseCheckoutToken(token);
    const style = payload?.checkoutSettings?.style;
    if (!style) {
      return;
    }

    if (style.backgroundColor) {
      state.backgroundColor = style.backgroundColor;
    }
  };

  return {
    state,
    initialize,
    getStyleObject: () => state,
  };
};
