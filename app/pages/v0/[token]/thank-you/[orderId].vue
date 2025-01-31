<script setup lang="ts">
import { useRoute } from 'vue-router';
import type { Address, Cart, PaymentMethod, ShippingMethod } from '~/types/checkout'

const {
  loading,
  initializeSummary,
  getSummary
} = useCheckout()

interface OrderDetails {
  orderId: string
  cart: Cart
  billingAddress: Address
  shippingAddress: Address
  paymentMethod: PaymentMethod
  shippingMethod: ShippingMethod
}


const orderDetails = ref<OrderDetails | null>(null)
const route = useRoute()
const router = useRouter()
const token = route.params.token as string;
const orderId = route.params.orderId as string;
const cart = computed(() => orderDetails.value?.cart);

onMounted(async () => {
  if (!token) {
    router.push('/')
    return
  }


  // In a real application, you would fetch the order details from your backend
  // For now, we'll use the data from localStorage if available
  const storedDetails = localStorage.getItem(`order-${route.params.orderId}`)
  if (storedDetails) {
    orderDetails.value = JSON.parse(storedDetails)
    //console.log('Order details loaded from localStorage:', orderDetails.value)
  }


  await initializeSummary(token, orderId)
  const summary = await getSummary()
  console.log('Summary:', summary)


  // orderDetails.value.cart = summary.cart






  /*   if (!token || !orderId) {
      console.error('Token or Order ID is missing');
      return;
    } */
  //console.log('Thank you page for token:', token, 'Order ID:', orderId);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <!-- Order Confirmation Header -->
        <div class="bg-blue-600 px-6 py-8 text-white">
          <div class="flex items-center justify-center">
            <div class="text-center">
              <h1 class="text-3xl font-bold">Thank you for your order!</h1>
              <p class="mt-2 text-blue-100">Order #{{ orderDetails?.orderId }}</p>
            </div>
          </div>
        </div>

        <div class="px-6 py-8">
          <!-- Order Status -->
          <div class="mb-8">
            <h2 class="text-lg font-semibold mb-2">Order Status</h2>
            <p class="text-gray-600">
              Expected delivery: {{ orderDetails?.shippingMethod?.shippingData?.estimatedDays || 'To be determined' }}
            </p>
          </div>

          <!-- Addresses -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <!-- Billing Address -->
            <div>
              <h2 class="text-lg font-semibold mb-2">Billing Address</h2>
              <div class="border rounded-lg p-4">
                <p>{{ orderDetails?.billingAddress?.firstName }} {{ orderDetails?.billingAddress?.lastName }}</p>
                <p>{{ orderDetails?.billingAddress?.street }}</p>
                <p>{{ orderDetails?.billingAddress?.city }}, {{ orderDetails?.billingAddress?.postalCode }}</p>
                <p>{{ orderDetails?.billingAddress?.country }}</p>
                <p class="mt-2">{{ orderDetails?.billingAddress?.email }}</p>
                <p>{{ orderDetails?.billingAddress?.phone }}</p>
              </div>
            </div>

            <!-- Shipping Address -->
            <div>
              <h2 class="text-lg font-semibold mb-2">Shipping Address</h2>
              <div class="border rounded-lg p-4">
                <p>{{ orderDetails?.shippingAddress?.firstName }} {{ orderDetails?.shippingAddress?.lastName }}</p>
                <p>{{ orderDetails?.shippingAddress?.street }}</p>
                <p>{{ orderDetails?.shippingAddress?.city }}, {{ orderDetails?.shippingAddress?.postalCode }}</p>
                <p>{{ orderDetails?.shippingAddress?.country }}</p>
                <p class="mt-2">{{ orderDetails?.shippingAddress?.email }}</p>
                <p>{{ orderDetails?.shippingAddress?.phone }}</p>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="mb-8">
            <h2 class="text-lg font-semibold mb-4">Order Summary</h2>
            <!--   <OrderSummary :cart="orderDetails?.cart" /> -->
            <OrderSummary v-if="orderDetails?.cart" :cart="cart" />
          </div>

          <!-- Payment & Shipping Method -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 class="text-lg font-semibold mb-2">Payment Method</h2>
              <div class="border rounded-lg p-4">
                <div class="flex items-center">
                  <img v-if="orderDetails?.paymentMethod?.logoUrl" :src="orderDetails?.paymentMethod?.logoUrl"
                    :alt="orderDetails?.paymentMethod?.displayName" class="h-8 w-auto mr-3" />
                  <span>{{ orderDetails?.paymentMethod?.displayName }}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 class="text-lg font-semibold mb-2">Shipping Method</h2>
              <div class="border rounded-lg p-4">
                <div class="flex items-center">
                  <img v-if="orderDetails?.shippingMethod?.logoUrl" :src="orderDetails?.shippingMethod?.logoUrl"
                    :alt="orderDetails?.shippingMethod?.displayName" class="h-8 w-auto mr-3" />
                  <div>
                    <p>{{ orderDetails?.shippingMethod?.displayName }}</p>
                    <p v-if="orderDetails?.shippingMethod?.shippingData?.estimatedDays" class="text-sm text-gray-600">
                      {{ orderDetails?.shippingMethod?.shippingData?.estimatedDays }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Back to Home -->
          <div class="mt-8 text-center">
            <NuxtLink to="/"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Continue Shopping
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
