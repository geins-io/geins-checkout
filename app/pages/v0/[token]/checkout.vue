<script setup lang="ts">
const { token } = useCheckoutToken();
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
} = useCheckout();

const initialLoading = ref(true);
const cart = computed(() => state.value.cart);

// watch loading state
watch(loading, (value) => {
  if (value === false) {
    initialLoading.value = false;
  }
});

// Initialize checkout with token from URL
onMounted(async () => {
  await initializeCheckout(token.value);
});

const handleCheckout = async () => {
  const result = await completeCheckout();

  type CheckoutResult = {
    success: boolean;
    orderId?: string;
    publicOrderId?: string;
    redirectUrl?: string;
    error?: string;
  };

  const typedResult = result as CheckoutResult;

  if (typedResult.redirectUrl) {
    window.location.href = typedResult.redirectUrl;
  } else if (typedResult.success && typedResult.publicOrderId) {
    navigateTo(`/v0/${token.value}/thank-you/${typedResult.publicOrderId}`);
  } else if (typedResult.error) {
    console.error(typedResult.error);
  }
};
</script>

<template>
  <div>
    <NuxtLayout name="default">
      <template #cart>
        <Card>
          <CardContent>
            <OrderSummary v-if="cart" :cart="cart" />
            <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
          </CardContent>
        </Card>
      </template>

      <template #checkout>
        <div class="w-full">
          <div class="mx-auto">
            <div class="grid">
              <!-- Checkout Form -->
              <div>
                <!-- Payment Methods -->
                <div
                  v-if="paymentMethods.length > 1"
                  class="card rounded-lg bg-white p-6 shadow absolute left-0 bottom-0"
                >
                  <PaymentMethodSelector :methods="paymentMethods" @select="selectPaymentMethod" />
                </div>

                <div v-if="state.externalCheckoutHTML.length > 0" class="">
                  <ExternalCheckout :html="state.externalCheckoutHTML" />
                </div>

                <!-- Billing Information -->
                <div v-if="state.selectedPaymentMethod === 18" class="">
                  <h2 class="mb-4 text-lg font-medium">Billing Information</h2>
                  <AddressForm :address="state.billingAddress" @update="updateAddress('billing', $event)" />
                  <div class="mt-4">
                    <label class="flex items-center">
                      <input
                        v-model="useShippingAddress"
                        type="checkbox"
                        class="rounded border-gray-300 text-accent shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200/50"
                      />
                      <span class="ml-2 text-sm text-gray-600">Use different shipping address</span>
                    </label>
                  </div>
                </div>

                <!-- Shipping Information -->
                <div v-if="useShippingAddress" class="card rounded-lg bg-white p-6 shadow">
                  <h2 class="mb-4 text-lg font-medium">Shipping Information</h2>
                  <AddressForm :address="state.shippingAddress" @update="updateAddress('shipping', $event)" />
                </div>

                <!-- Shipping Methods -->
                <div v-if="shippingMethods.length > 0" class="rounded-lg bg-white p-6 shadow">
                  <ShippingMethodSelector :methods="shippingMethods" @select="selectShippingMethod" />
                </div>

                <Button
                  v-if="state.showCompleteButton"
                  :disabled="loading || state.disableCompleteButton"
                  :loading="loading"
                  class="mt-6 w-full px-4 py-2"
                  @click="handleCheckout"
                >
                  {{ loading ? 'Processing...' : 'Complete Checkout' }}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </NuxtLayout>
  </div>
</template>
