import type { AddressInputType } from '@geins/types';

export interface CheckoutFormType {
  email?: string;
  message?: string;
  identityNumber?: string;
  address: AddressInputType;
}

export interface CheckoutState {
  email: string;
  identityNumber: string;
  message: string;
  billingAddress: AddressInputType;
  shippingAddress: AddressInputType;
  selectedPaymentMethod: number;
  selectedShippingMethod: number;
  externalCheckoutHTML: string;
  useShippingAddress: boolean;
  showMessageInput: boolean;
}

export interface CompleteCheckoutResponse {
  success: boolean;
  orderId?: string;
  publicOrderId?: string;
  redirectUrl?: string;
}
