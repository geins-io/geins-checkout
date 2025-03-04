import { GeinsOMS } from '@geins/oms';
import type {
  CheckoutBrandingType,
  CheckoutRedirectsType,
  CheckoutStyleType,
  CheckoutTokenPayload,
} from '@geins/types';

export const useCheckoutToken = () => {
  const token = useState<string>('checkout-token');
  const parsedToken = ref<CheckoutTokenPayload | null>(null);
  const currentVersion = useRuntimeConfig().public.currentVersion;
  const branding = ref<CheckoutBrandingType>();
  const urls = ref<CheckoutRedirectsType>();
  const logo = computed(() => branding.value?.logo);
  const icon = computed(() => branding.value?.icon);
  const title = computed(() => branding.value?.title);
  const imgBaseUrl = ref('https://labs.commerce.services/product/raw/');

  const cssVariables = ref<Record<string, string>>({});

  const currentCheckoutUrl = computed(() => {
    return `/${currentVersion}/${token.value}/checkout`;
  });
  const iconFallback = computed(() => {
    return branding.value?.title
      ?.split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  });

  const initSettings = async () => {
    if (!token.value) return;
    parsedToken.value = await parseToken(token.value);
    if (!parsedToken.value?.checkoutSettings) return;
    branding.value = parsedToken.value?.checkoutSettings?.branding;
    urls.value = parsedToken.value?.checkoutSettings?.redirectUrls;
    if (!branding.value) return;
    setStyles(branding.value?.styles);
  };

  const parseToken = async (token: string) => {
    return await GeinsOMS.parseCheckoutToken(token);
  };

  watch(
    token,
    async () => {
      await initSettings();
    },
    { immediate: true },
  );

  const camelToKebab = (str: string) => str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

  const hexToHSL = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (!result) return null;

    let r = parseInt(result[1] ?? '0', 16);
    let g = parseInt(result[2] ?? '0', 16);
    let b = parseInt(result[3] ?? '0', 16);

    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
  };

  const setStyles = (styles?: CheckoutStyleType) => {
    cssVariables.value = styles
      ? Object.entries(styles).reduce(
          (acc, [key, value]) => {
            const val = /^#/.test(value) ? hexToHSL(value) : value;
            acc[`--${camelToKebab(key)}`] = val;
            return acc;
          },
          {} as Record<string, string>,
        )
      : {};
  };

  const nuxtApp = useNuxtApp();
  const setStylesToHead = async () => {
    await nuxtApp.runWithContext(() => {
      useHead({
        style: [
          {
            children: `body { ${Object.entries(cssVariables.value)
              .filter(([_key, value]) => value)
              .map(([key, value]) => `${key}: ${value};`)
              .join(' ')} }`,
          },
        ],
      });
    });
  };

  watch(cssVariables, setStylesToHead);

  return {
    token,
    parsedToken,
    currentVersion,
    currentCheckoutUrl,
    branding,
    iconFallback,
    icon,
    logo,
    title,
    urls,
    imgBaseUrl,
    initSettings,
    parseToken,
    setStyles,
    setStylesToHead,
  };
};
