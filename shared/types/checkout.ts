import type { GeinsAddressType } from '@geins/types';

export const enum ExternalSnippetType {
  Checkout = 'checkout',
  Summary = 'summary',
}

export const enum PaymentMethodId {
  ManualInvoice = 18,
  Klarna = 23,
  Svea = 24,
  Walley = 25,
  Avarda = 26,
  GeinsPay = 27,
}

export interface CheckoutFormType {
  email?: string;
  message?: string;
  identityNumber?: string;
  address?: GeinsAddressType;
}

export interface CheckoutState {
  email: string;
  identityNumber: string;
  message: string;
  billingAddress?: GeinsAddressType;
  shippingAddress?: GeinsAddressType;
  selectedPaymentId: number;
  selectedShippingId: number;
  externalSnippetHtml: string;
  useShippingAddress: boolean;
  showMessageInput: boolean;
}

export interface CompleteCheckoutResponse {
  success: boolean;
  orderId: string;
  publicOrderId: string;
  redirectUrl: string;
  message: string;
}

export interface CheckoutFormUpdateEvent {
  valid: boolean;
  touched: boolean;
  values: CheckoutFormType;
}
