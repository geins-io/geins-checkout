import { z } from 'zod'

export const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required')
})

export type Address = z.infer<typeof addressSchema>

export interface CartItem {
  id: string
  name: string
  quantity: number
  price: number
  totalPrice: number
  imageUrl?: string
  message?: string
  isPackage?: boolean
  packageItems?: Array<{
    name: string
    quantity: number
  }>
}

export interface VatGroup {
  rate: number
  amount: number
}

export interface CartTotals {
  subtotal: number
  vat: VatGroup[]
  shippingFee: number
  freeShipping: boolean
  paymentFee: number
  discounts: Array<{
    name: string
    amount: number
  }>
  total: number
}

export interface Cart {
  id: string
  items: CartItem[]
  totals: CartTotals
}

export interface PaymentMethod {
  id: string
  displayName: string
  logoUrl: string
  feeIncVatFormatted: string
  isDefault: boolean
  isSelected: boolean
  paymentType: string
  paymentData: Record<string, unknown>
}

export interface ShippingSubOption {
  id: string
  displayName: string
  feeIncVatFormatted: string
  isSelected: boolean
  shippingData: Record<string, unknown>
}

export interface ShippingMethod {
  id: string
  displayName: string
  logoUrl?: string
  feeIncVatFormatted: string
  isDefault: boolean
  isSelected: boolean
  amountLeftToFreeShippingFormatted?: string
  shippingData: Record<string, unknown>
  subOptions?: ShippingSubOption[]
}

export interface CheckoutState {
  cart: Cart | null
  billingAddress: Address
  shippingAddress: Address
  selectedPaymentMethod: string
  selectedShippingMethod: string
  paymentMethods: PaymentMethod[]
  shippingMethods: ShippingMethod[]
}