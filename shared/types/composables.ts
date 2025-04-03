import type { ExternalSnippetType } from '#shared/types';
import type {
  CartType,
  CheckoutBrandingType,
  CheckoutInputType,
  CheckoutQueryParameters,
  CheckoutRedirectsType,
  CheckoutSettings,
  CheckoutStyleType,
  CheckoutSummaryType,
  CheckoutTokenPayload,
  CheckoutType,
  CheckoutUrlsInputType,
  CreateOrderResponseType,
  GeinsSettings,
  GeinsUserType,
  PaymentOptionType,
  PriceType,
  ShippingOptionType,
} from '@geins/types';

export interface UseCheckoutComposable {
  state: Ref<CheckoutState>;
  checkoutLoading: Ref<boolean>;
  error: Ref<string>;
  checkoutSettings: ComputedRef<CheckoutSettings | undefined>;
  cart: ComputedRef<CartType | undefined>;
  cartEmpty: ComputedRef<boolean>;
  redirectUrls: ComputedRef<CheckoutRedirectsType | undefined>;
  currentCountryName: ComputedRef<string>;
  isPaymentInvoice: ComputedRef<boolean>;
  useManualCheckout: ComputedRef<boolean>;
  initializeCheckout: () => Promise<void>;
  updateCheckoutData: (type: 'billing' | 'shipping', data: CheckoutFormType) => Promise<void>;
  updateCheckout: () => Promise<void>;
  completeCheckout: () => Promise<CompleteCheckoutResponse>;
  getRedirectUrl: (response: CompleteCheckoutResponse) => string;
}

export interface UsePriceComposable {
  vatIncluded: Ref<boolean>;
  getSellingPrice: (price: PriceType) => string | undefined;
  getRegularPrice: (price: PriceType) => string | undefined;
}

export interface UseExternalSnippetComposable {
  externalSnippetHtml: Ref<string>;
  externalSnippetRendered: Ref<boolean>;
  suspended: Ref<boolean>;
  externalPaymentSelected: ComputedRef<boolean>;
  hasExternalSnippet: ComputedRef<boolean>;
  renderExternalSnippet: (type: ExternalSnippetType, payment?: PaymentOptionType) => Promise<void>;
  initExternalEventListeners: () => void;
  suspend: () => void;
  resume: () => void;
}

export interface UseSummaryComposable {
  checkoutLoading: Ref<boolean>;
  error: Ref<string>;
  cart: ComputedRef<CartType | undefined>;
  orderSummary: Ref<CheckoutSummaryType | undefined>;
  summaryOrderId: Ref<string>;
  initializeSummary: (orderId: string, checkoutQueryParams: CheckoutQueryParameters) => Promise<void>;
}

export interface UseCheckoutTokenComposable {
  token: Ref<string>;
  parsedCheckoutToken: Ref<CheckoutTokenPayload>;
  latestVersion: Ref<string>;
  latestCheckoutUrl: ComputedRef<string>;
  checkoutPageUrl: ComputedRef<string>;
  confirmationPageUrl: ComputedRef<string>;
  branding: Ref<CheckoutBrandingType | undefined>;
  iconFallback: ComputedRef<string | undefined>;
  icon: ComputedRef<string | undefined>;
  logo: ComputedRef<string | undefined>;
  title: ComputedRef<string | undefined>;
  urls: Ref<CheckoutRedirectsType | undefined>;
  getProductImageUrl: (filename?: string) => string | null;
  setCurrentVersion: (version?: string) => void;
  initSettingsFromToken: () => Promise<boolean>;
  parseToken: (token: string) => Promise<CheckoutTokenPayload>;
  parseStyles: (styles?: CheckoutStyleType) => void;
  setCssVarsToHead: () => Promise<void>;
}

export interface UseGeinsClientComposable {
  geinsSettings: Ref<GeinsSettings | undefined>;
  checkoutSettings: Ref<CheckoutSettings | undefined>;
  cart: Ref<CartType | undefined>;
  paymentMethods: Ref<PaymentOptionType[]>;
  shippingMethods: Ref<ShippingOptionType[]>;
  user: Ref<GeinsUserType | undefined>;
  checkoutObject: Ref<CheckoutType | undefined>;
  redirectUrls: Ref<CheckoutRedirectsType | undefined>;
  checkoutUrls: Ref<CheckoutUrlsInputType | undefined>;
  orderSummary: Ref<CheckoutSummaryType | undefined>;
  selectedPaymentMethod: ComputedRef<PaymentOptionType | undefined>;
  selectedShippingMethod: ComputedRef<ShippingOptionType | undefined>;
  currentCountryName: Ref<string>;
  initializeSummary: () => Promise<boolean>;
  initializeCheckout: (checkoutOptions: CheckoutInputType) => Promise<void>;
  getCheckout: (
    options?: {
      paymentMethodId?: number;
      shippingMethodId?: number;
      checkoutOptions?: CheckoutInputType;
    },
    useSSR?: boolean,
  ) => Promise<CheckoutType>;
  getCheckoutSummary: (
    orderId: string,
    paymentMethod: string,
    cartId: string,
  ) => Promise<CheckoutSummaryType | undefined>;
  updateCheckout: (options?: {
    paymentMethodId?: number;
    shippingMethodId?: number;
    checkoutOptions?: CheckoutInputType;
  }) => Promise<void>;
  updateCheckoutUrlWithParameters: (args: { url: string; paymentMethodId: number }) => string;
  createOrder: (checkoutInput: {
    cartId: string;
    checkoutOptions: CheckoutInputType;
  }) => Promise<CreateOrderResponseType>;
  completeCart: () => Promise<boolean>;
}
