import type { AddressType } from '@geins/types';

export interface CheckoutFormType {
  email?: string;
  message?: string;
  identityNumber?: string;
  address: AddressType;
}
export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  imageUrl?: string;
  message?: string;
  isPackage?: boolean;
  packageItems?: Array<{
    name: string;
    quantity: number;
  }>;
}

export interface VatGroup {
  rate: number;
  amount: number;
}

export interface CartTotals {
  subtotal: number;
  vat: VatGroup[];
  shippingFee: number;
  freeShipping: boolean;
  paymentFee: number;
  discounts: Array<{
    name: string;
    amount: number;
  }>;
  total: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totals: CartTotals;
}

export interface PaymentMethod {
  id: string;
  displayName: string;
  logoUrl: string;
  feeIncVatFormatted: string;
  isDefault: boolean;
  isSelected: boolean;
  paymentType: string;
  paymentData: Record<string, unknown>;
}

export interface ShippingSubOption {
  id: string;
  displayName: string;
  feeIncVatFormatted: string;
  isSelected: boolean;
  shippingData: Record<string, unknown>;
}

export interface ShippingMethod {
  id: string;
  displayName: string;
  logoUrl?: string;
  feeIncVatFormatted: string;
  isDefault: boolean;
  isSelected: boolean;
  amountLeftToFreeShippingFormatted?: string;
  shippingData: Record<string, unknown>;
  subOptions?: ShippingSubOption[];
}

export interface CheckoutState {
  cart: Cart | null;
  billingAddress: Address;
  shippingAddress: Address;
  selectedPaymentMethod: string;
  selectedShippingMethod: string;
  paymentMethods: PaymentMethod[];
  shippingMethods: ShippingMethod[];
}

export interface CheckoutSummary {
  htmlSnippet?: string | null;
  order: CheckoutOrderSummary;
  nthPurchase?: number;
}

export interface CheckoutOrderSummary {
  status: string;
  orderId: string;
  transactionId: string;
  marketId: string;
  languageId: string;
  message?: string;
  customerId: number;
  customerTypeId: number;
  customerGroupId: number;
  organizationNumber: string | null;
  ipAddress: string;
  paymentId: number;
  shippingId: number;
  pickupPoint: string | null;
  desiredDeliveryDate: string | null;
  promoCode: string | null;
  appliedCampaignsIds: string[];
  appliedCampaigns: string[];
  total: {
    itemValueExVat?: number;
    itemValueExVatFormatted?: string;
    itemValueIncVat?: number;
    itemValueIncVatFormatted?: string;
    orderValueExVat?: number;
    orderValueExVatFormatted?: string;
    orderValueIncVat?: number;
    orderValueIncVatFormatted?: string;
    paymentFeeExVat?: number;
    paymentFeeExVatFormatted?: string;
    paymentFeeIncVat?: number;
    paymentFeeIncVatFormatted?: string;
    shippingFeeExVat?: number;
    shippingFeeExVatFormatted?: string;
    shippingFeeIncVat?: number;
    shippingFeeIncVatFormatted?: string;
    discountExVat?: number;
    discountExVatFormatted?: string;
    discountIncVat?: number;
    discountIncVatFormatted?: string;
    sum?: number;
    sumFormatted?: string;
    currency?: string;
  };
  billingAddress: AddressType;
  shippingAddress: AddressType;
  rows: Array<CheckoutOrderRowSummary>;
}

export interface CheckoutOrderRowSummary {
  quantity: number;
  skuId: string;
  articleNumber: string;
  gtin: string;
  name: string;
  weight: number;
  height: number;
  length: number;
  width: number;
  message?: string;
  product: {
    name: string;
    brand: string;
    imageUrl: string;
    categories: string[];
    productId: number;
    productUrl: string;
  };
  price: {
    campaignIds: string[];
    campaignNames: string[];
    productPriceCampaignId: string | null;
    productPriceListId: string | null;
    discountRate: number;
    discountExVat: number;
    discountExVatFormatted: string;
    discountIncVat: number;
    discountIncVatFormatted: string;
    priceExVat: number;
    priceExVatFormatted: string;
    priceIncVat: number;
    priceIncVatFormatted: string;
    currency: string;
  };
}
