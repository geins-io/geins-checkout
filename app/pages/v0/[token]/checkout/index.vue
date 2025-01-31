<script setup lang="ts">
import ExternalCheckout from '~/components/ExternalCheckout.vue'


const route = useRoute()
const router = useRouter()
const {
  state,
  loading,
  error,
  useShippingAddress,
  paymentMethods,
  shippingMethods,
  initializeCheckout,
  updateAddress,
  selectPaymentMethod,
  selectShippingMethod,
  completeCheckout,
} = useCheckout()

const token = route.params.token as string
const cart = computed(() => state.cart);


// Initialize checkout with token from URL
onMounted(async () => {
  if (!token) {
    router.push('/')
    return
  }
  await initializeCheckout(token)

})


const handleCheckout = async () => {
  const result = await completeCheckout()

  if (result?.success) {
    // Store order details in localStorage before redirecting
    const selectedPaymentMethod = paymentMethods.value.find(m => m.isSelected)
    const selectedShippingMethod = shippingMethods.value.find(m => m.isSelected)

    const orderDetails = {
      orderId: result.orderId,
      cart: state.cart,
      billingAddress: state.billingAddress,
      shippingAddress: useShippingAddress.value ? state.shippingAddress : state.billingAddress,
      paymentMethod: selectedPaymentMethod,
      shippingMethod: selectedShippingMethod
    }

    localStorage.setItem(`order-${result.orderId}`, JSON.stringify(orderDetails))
    router.push(`/v0/${token}/thank-you/${result.orderId}`);
  }

  /*  const result = await completeCheckout()
   if (result?.success && 'orderId' in result) {
     router.push(`v0/${token}/thank-you/${result.orderId}`);
   } */
}

</script>
<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Checkout Form -->
        <div class="space-y-8">
          <!-- Payment Methods -->
          <div class="bg-white p-6 rounded-lg shadow" v-if="paymentMethods.length > 1">
            <PaymentMethodSelector :methods="paymentMethods" @select="selectPaymentMethod" />
          </div>

          <div class="bg-white p-6 rounded-lg shadow" v-if="state.externalCheckoutHTML.length > 0">
            <ExternalCheckout :html="state.externalCheckoutHTML" @select="selectPaymentMethod" />
          </div>

          <!-- Billing Information -->
          <div v-if="state.selectedPaymentMethod === 18" class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-lg font-medium mb-4">Billing Information</h2>
            <AddressForm :address="state.billingAddress" @update="updateAddress('billing', $event)" />
            <div class="mt-4">
              <label class="flex items-center">
                <input type="checkbox" v-model="useShippingAddress"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                <span class="ml-2 text-sm text-gray-600">Use different shipping address</span>
              </label>
            </div>
          </div>

          <!-- Shipping Information -->
          <div v-if="useShippingAddress" class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-lg font-medium mb-4">Shipping Information</h2>
            <AddressForm :address="state.shippingAddress" @update="updateAddress('shipping', $event)" />
          </div>

          <!-- Shipping Methods -->
          <div class="bg-white p-6 rounded-lg shadow" v-if="shippingMethods.length > 0">
            <ShippingMethodSelector :methods="shippingMethods" @select="selectShippingMethod" />
          </div>
        </div>

        <!-- Order Summary -->
        <div class="bg-white p-6 rounded-lg shadow h-fit">
          <OrderSummary v-if="cart" :cart="cart" />
          <button @click="handleCheckout" v-if="state.showCompleteButton"
            :disabled="loading || state.disableCompleteButton"
            class="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {{ loading ? 'Processing...' : 'Complete Checkout' }}
          </button>
          <p v-if="error" class="mt-2 text-red-600 text-sm">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
