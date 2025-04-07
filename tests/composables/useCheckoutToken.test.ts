// tests/composables/useCheckoutToken.test.ts
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ref } from 'vue';

// Create a more realistic state storage for useState
const stateStorage = new Map();

// Mock dependencies
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: {
      latestVersion: 'v0',
      baseUrl: 'http://localhost:3000',
      productImageDomain: 'commerce.services',
      productImageBaseUrl: 'https://{ACCOUNT_NAME}.{DOMAIN}/product/raw/',
    },
  }),
  useNuxtApp: () => ({
    runWithContext: (fn) => fn(),
  }),
  // Improved useState mock that behaves more like Nuxt's implementation
  useState: (key, init) => {
    if (!stateStorage.has(key) && init) {
      stateStorage.set(key, init());
    }

    // If no value exists yet, set default empty value
    if (!stateStorage.has(key)) {
      stateStorage.set(key, '');
    }

    // Create a ref that's connected to our storage
    const value = ref(stateStorage.get(key));

    // Update storage when ref changes
    const originalSet = Object.getOwnPropertyDescriptor(value, 'value').set;
    Object.defineProperty(value, 'value', {
      get: () => stateStorage.get(key),
      set: (newValue) => {
        stateStorage.set(key, newValue);
        originalSet.call(value, newValue);
      },
    });

    return value;
  },
}));

vi.mock('#app/composables/router', () => ({
  useRoute: () => ({
    params: { token: '' },
    path: '',
    meta: {},
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => key,
  }),
}));

vi.mock('@vueuse/core', () => ({
  useHead: vi.fn(),
}));

describe('useCheckoutToken', () => {
  let useCheckoutToken;

  // Sample test token
  const testToken =
    'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJjYXJ0SWQiOiJmNmNhMDAwOC0zNTE4LTQwM2YtYWFjZC04MWRlYzY4MmExNDgiLCJ1c2VyIjp7ImlkIjowLCJlbWFpbCI6IiIsImFkZHJlc3MiOnsicGhvbmUiOiIiLCJtb2JpbGUiOiIiLCJjb21wYW55IjoiIiwiZmlyc3ROYW1lIjoiIiwibGFzdE5hbWUiOiIiLCJhZGRyZXNzTGluZTEiOiIiLCJhZGRyZXNzTGluZTIiOiIiLCJhZGRyZXNzTGluZTMiOiIiLCJ6aXAiOiIiLCJjYXJlT2YiOiIiLCJjaXR5IjoiIiwic3RhdGUiOiIiLCJjb3VudHJ5IjoiIiwiZW50cnlDb2RlIjoiIn19LCJjaGVja291dFNldHRpbmdzIjp7ImlzQ2FydEVkaXRhYmxlIjpmYWxzZSwiY29weUNhcnQiOnRydWUsInNlbGVjdGVkUGF5bWVudE1ldGhvZElkIjoyMywic2VsZWN0ZWRTaGlwcGluZ01ldGhvZElkIjoxLCJjdXN0b21lclR5cGUiOiJQRVJTT04iLCJyZWRpcmVjdFVybHMiOnt9LCJicmFuZGluZyI6eyJ0aXRsZSI6IiIsImljb24iOiIiLCJsb2dvIjoiIiwic3R5bGVzIjp7ImxvZ29TaXplIjoiMnJlbSIsInJhZGl1cyI6IiIsImJhY2tncm91bmQiOiIjZjdmN2Y3IiwiZm9yZWdyb3VuZCI6IiMxMzEzMTMiLCJjYXJkIjoiI2ZmZmZmZiIsImNhcmRGb3JlZ3JvdW5kIjoiIzEzMTMxMyIsImFjY2VudCI6IiMxMzEzMTMiLCJhY2NlbnRGb3JlZ3JvdW5kIjoiI2ZmZmZmZiIsImJvcmRlciI6IiNlYmViZWIiLCJzYWxlIjoiI2U2MDAwMCIsImVycm9yIjoiI2IwMDAyMCJ9fX0sImdlaW5zU2V0dGluZ3MiOnsiZW52aXJvbm1lbnQiOiJwcm9kIiwiYXBpS2V5IjoiQkQ2NzlGRjAtMDVCRS00ODc2LUI1NEMtRjE2REZEQjhFOTY3IiwiYWNjb3VudE5hbWUiOiJsYWJzIiwiY2hhbm5lbCI6IjEiLCJ0bGQiOiJzZSIsImxvY2FsZSI6InN2LVNFIiwibWFya2V0Ijoic2UifX0';

  beforeEach(async () => {
    // Clear mocks and state storage between tests
    vi.clearAllMocks();
    stateStorage.clear();

    // Import the composable dynamically to get a fresh instance
    const module = await import('../../app/composables/useCheckoutToken');
    useCheckoutToken = module.useCheckoutToken;
  });

  test('initializes with default values', () => {
    const { token, latestVersion, currentVersion, branding, urls } = useCheckoutToken();

    expect(token?.value).toBe('');
    expect(latestVersion?.value).toBe('v0');
    expect(currentVersion?.value).toBeUndefined();
    expect(branding?.value).toBeUndefined();
    expect(urls?.value).toBeUndefined();
  });

  test('parses token correctly', async () => {
    const { token, parseToken, parsedCheckoutToken } = useCheckoutToken();
    token.value = testToken;

    const result = await parseToken(testToken);

    expect(result).toBeDefined();
    expect(result.cartId).toBe('f6ca0008-3518-403f-aacd-81dec682a148');
    expect(result.geinsSettings.accountName).toBe('labs');
    expect(result.checkoutSettings.selectedPaymentMethodId).toBe(23);
    expect(parsedCheckoutToken.value).toEqual(result);
  });

  test('generates product image URL correctly', () => {
    const { getProductImageUrl, parseToken } = useCheckoutToken();

    // Set up token and parse it to set parsedCheckoutToken
    parseToken(testToken);

    const imageUrl = getProductImageUrl('example.jpg');
    expect(imageUrl).toBe('https://labs.commerce.services/product/raw/example.jpg');
  });

  test('initializes settings from token', async () => {
    const { token, initSettingsFromToken, parseToken, branding, urls } = useCheckoutToken();

    // Mock parseToken to return a valid result
    vi.spyOn({ parseToken }, 'parseToken').mockImplementation(() => {
      return Promise.resolve({
        cartId: 'test-cart-id',
        geinsSettings: { accountName: 'test-account' },
        checkoutSettings: {
          branding: { title: 'Test Store', styles: { accent: '#ff0000' } },
          redirectUrls: { cancel: '/cancel', terms: '/terms' },
        },
      });
    });

    // Set token and initialize
    token.value = testToken;
    const result = await initSettingsFromToken();

    expect(result).toBe(true);
    expect(branding.value).toEqual({ title: 'Test Store', styles: { accent: '#ff0000' } });
    expect(urls.value).toEqual({ cancel: '/cancel', terms: '/terms' });
  });

  test('sets CSS variables based on branding', async () => {
    const { branding, parseStyles, cssVariables } = useCheckoutToken();

    // Set up branding with styles
    branding.value = {
      styles: {
        accent: '#ff0000',
        background: '#f7f7f7',
        logoSize: '2rem',
      },
    };

    parseStyles(branding.value.styles);

    expect(cssVariables.value).toEqual({
      '--accent': '#ff0000',
      '--background': '#f7f7f7',
      '--logo-size': '2rem',
    });
  });

  test('computes URLs correctly', () => {
    const { token, latestVersion, currentVersion, latestCheckoutUrl, checkoutPageUrl } = useCheckoutToken();

    token.value = 'test-token';
    latestVersion.value = 'v1';
    currentVersion.value = 'v0';

    expect(latestCheckoutUrl.value).toBe('/v1/checkout/test-token');
    expect(checkoutPageUrl.value).toBe('http://localhost:3000/v0/checkout/test-token');
  });
});
