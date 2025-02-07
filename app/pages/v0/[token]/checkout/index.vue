<script setup lang="ts">
import ExternalCheckout from '~/components/ExternalCheckout.vue';
import Button from '~/components/ui/button/Button.vue';
//import Loading from '~/components/shared/icon/Loading.vue';
import { ReloadIcon } from '@radix-icons/vue';
const initialLoading = ref(true);

const route = useRoute();
const router = useRouter();
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

const token = route.params.token as string;
const cart = computed(() => state.cart);

// watch loading state
watch(loading, (value) => {
  if (value === false) {
    initialLoading.value = false;
  }
});

// Initialize checkout with token from URL
onMounted(async () => {
  if (!token) {
    router.push('/');
    return;
  }

  await initializeCheckout(token);
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
    router.push(`/v0/${token}/thank-you/${typedResult.publicOrderId}`);
  } else if (typedResult.error) {
    console.error(typedResult.error);
  }
};
</script>

<template>
  <div v-if="false" class="min-h-screen">
    <div class="flex min-h-screen items-center justify-center">
      <loading class="mr-2 h-4 w-4" />
      <p>Loading Checkout</p>
    </div>
  </div>
  <div v-else class="min-h-screen">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
        <!-- Checkout Form -->
        <div class="space-y-8">
          <!-- Payment Methods -->
          <div
            class="rounded-lg bg-white p-6 shadow"
            v-if="paymentMethods.length > 1"
          >
            <PaymentMethodSelector
              :methods="paymentMethods"
              @select="selectPaymentMethod"
            />
          </div>

          <div
            class="rounded-lg bg-white p-6 shadow"
            v-if="state.externalCheckoutHTML.length > 0"
          >
            <ExternalCheckout
              :html="state.externalCheckoutHTML"
              @select="selectPaymentMethod"
            />
          </div>

          <!-- Billing Information -->
          <div
            v-if="state.selectedPaymentMethod === 18"
            class="rounded-lg bg-white p-6 shadow"
          >
            <h2 class="mb-4 text-lg font-medium">Billing Information</h2>
            <AddressForm
              :address="state.billingAddress"
              @update="updateAddress('billing', $event)"
            />
            <div class="mt-4">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="useShippingAddress"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-600"
                  >Use different shipping address</span
                >
              </label>
            </div>
          </div>

          <!-- Shipping Information -->
          <div v-if="useShippingAddress" class="rounded-lg bg-white p-6 shadow">
            <h2 class="mb-4 text-lg font-medium">Shipping Information</h2>
            <AddressForm
              :address="state.shippingAddress"
              @update="updateAddress('shipping', $event)"
            />
          </div>

          <!-- Shipping Methods -->
          <div
            class="rounded-lg bg-white p-6 shadow"
            v-if="shippingMethods.length > 0"
          >
            <ShippingMethodSelector
              :methods="shippingMethods"
              @select="selectShippingMethod"
            />
          </div>
        </div>

        <!-- Order Summary -->
        <div class="h-fit rounded-lg bg-white p-6 shadow">
          <OrderSummary v-if="cart" :cart="cart" />
          <Button
            @click="handleCheckout"
            v-if="state.showCompleteButton"
            :disabled="loading || state.disableCompleteButton"
            class="mt-6 w-full px-4 py-2"
          >
            <ReloadIcon v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ loading ? 'Processing...' : 'Complete Checkout' }}
          </Button>

          <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
