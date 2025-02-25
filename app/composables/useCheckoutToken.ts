import { GeinsOMS } from '@geins/oms';

export const useCheckoutToken = () => {
  const mockStyles = {
    fontSize: '0.875rem',
    radius: '0.5rem',
    background: '#f7f7f7',
    foreground: '#aaaaaa',
    card: '#ffffff',
    cardForeground: '#131313',
    accent: '#fc5c65',
    accentForeground: '#ffffff',
    border: '#e6e6e6',
    sale: '#b70000',
  };

  const mockSettings = {
    styles: mockStyles,
    logo: 'https://docs.geins.io/img/logo-black.svg',
    avatar: 'https://avatar.iran.liara.run/public',
    name: 'Checkout',
    source: '',
  };

  const token = useState<string>('checkout-token');
  const currentVersion = useRuntimeConfig().public.currentVersion;
  const settings = ref<CheckoutTokenSettings>();
  const logo = computed(() => settings.value?.logo);
  const avatar = computed(() => settings.value?.avatar);
  const name = computed(() => settings.value?.name);
  const source = computed(() => settings.value?.source);
  const imgBaseUrl = ref('https://labs.commerce.services/product/raw/');

  const currentCheckoutUrl = computed(() => {
    return `/${currentVersion}/${token.value}/checkout`;
  });
  const avatarFallback = computed(() => {
    return settings.value?.name
      ?.split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  });

  const initSettings = async () => {
    if (!token.value) return;
    const payload = await GeinsOMS.parseCheckoutToken(token.value);
    if (!payload?.checkoutSettings) return;
    settings.value = payload?.checkoutSettings;
    if (!settings.value?.styles) return;
    setStyles(settings.value?.styles);
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

  const setStyles = (styles: CheckoutStyleType) => {
    const cssVariables = Object.entries(styles).reduce(
      (acc, [key, value]) => {
        const val = /^#/.test(value) ? hexToHSL(value) : value;
        acc[`--${camelToKebab(key)}`] = val;
        return acc;
      },
      {} as Record<string, string>,
    );

    useHead({
      style: [
        {
          children: `body { ${Object.entries(cssVariables)
            .map(([key, value]) => `${key}: ${value};`)
            .join(' ')} }`,
        },
      ],
    });
  };

  return {
    token,
    currentVersion,
    settings,
    currentCheckoutUrl,
    avatarFallback,
    logo,
    avatar,
    name,
    source,
    imgBaseUrl,
    initSettings,
    setStyles,
  };
};
