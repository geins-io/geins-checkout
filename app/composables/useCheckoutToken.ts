import { GeinsOMS } from '@geins/oms';
import type {
  CheckoutBrandingType,
  CheckoutRedirectsType,
  CheckoutStyleType,
  CheckoutTokenPayload,
} from '@geins/types';

export const useCheckoutToken = () => {
  const config = useRuntimeConfig();
  const { geinsLog, geinsLogError } = useGeinsLog('useCheckoutToken.ts');

  const token = useState<string>('checkout-token');
  const parsedCheckoutToken = useState<CheckoutTokenPayload>('parsed-checkout-token');
  const latestVersion = useState<string>('latest-version', () => config.public.latestVersion);
  const currentVersion = useState<string>('current-version', () => config.public.latestVersion);
  const branding = useState<CheckoutBrandingType | undefined>('checkout-branding');
  const urls = useState<CheckoutRedirectsType | undefined>('checkout-urls');

  const logo = computed(() => branding.value?.logo);
  const icon = computed(() => branding.value?.icon);
  const title = computed(() => branding.value?.title);

  const cssVariables = ref<Record<string, string>>({});

  // Return checkout url for latest version
  const latestCheckoutUrl = computed(() => {
    return `/${latestVersion.value}/checkout/${token.value}`;
  });
  const checkoutPageUrl = computed(() => {
    return `${config.public.baseUrl}/${currentVersion.value}/checkout/${token.value}`;
  });
  // Return confirmation url for current version
  const confirmationPageUrl = computed(() => {
    return `${config.public.baseUrl}/${currentVersion.value}/thank-you/${token.value}/{orderId}`;
  });
  const iconFallback = computed(() => {
    return branding.value?.title
      ?.split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  });

  const setCurrentVersion = (version?: string) => {
    if (!version || !/^v\d+$/.test(version)) {
      return;
    }
    currentVersion.value = version;
  };

  const initSettingsFromToken = async (): Promise<boolean> => {
    if (!token.value) return false;
    try {
      parsedCheckoutToken.value = await parseToken(token.value);
      geinsLog('parsed checkout token', parsedCheckoutToken.value);
    } catch (error) {
      token.value = '';
      geinsLogError('Failed to parse checkout token', error);
      return false;
    }
    if (!parsedCheckoutToken.value?.checkoutSettings) {
      return false;
    }

    branding.value = parsedCheckoutToken.value?.checkoutSettings?.branding;
    urls.value = parsedCheckoutToken.value?.checkoutSettings?.redirectUrls;

    if (!branding.value) {
      return false;
    }
    parseStyles(branding.value?.styles);
    return true;
  };

  const parseToken = async (token: string) => {
    return await GeinsOMS.parseCheckoutToken(token);
  };

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

  const parseStyles = (styles?: CheckoutStyleType) => {
    cssVariables.value = styles
      ? Object.entries(styles).reduce(
          (acc, [key, value]) => {
            const val = /^#/.test(value) ? hexToHSL(value) : value;
            acc[`--${camelToKebab(key)}`] = val || '';
            return acc;
          },
          {} as Record<string, string>,
        )
      : {};
  };

  const nuxtApp = useNuxtApp();
  const setCssVarsToHead = async () => {
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

  watch(cssVariables, setCssVarsToHead, { once: true });

  const getProductImageUrl = (filename?: string) => {
    const accountName = parsedCheckoutToken.value?.geinsSettings?.accountName || '';
    const domain = config.public.productImageDomain;
    if (!accountName || !domain || !filename) {
      return null;
    }
    const baseUrl = config.public.productImageBaseUrl
      .replace('{ACCOUNT_NAME}', accountName)
      .replace('{DOMAIN}', domain);
    return `${baseUrl}${filename}`;
  };

  return {
    token,
    parsedCheckoutToken,
    latestVersion,
    latestCheckoutUrl,
    checkoutPageUrl,
    confirmationPageUrl,
    branding,
    iconFallback,
    icon,
    logo,
    title,
    urls,
    getProductImageUrl,
    setCurrentVersion,
    initSettingsFromToken,
    parseToken,
    parseStyles,
    setCssVarsToHead,
  };
};
