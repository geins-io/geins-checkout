<script setup lang="ts">
const { confirmationUrl, urls } = useCheckoutToken();
const { state, loading, updateCheckoutData, completeCheckout } = useCheckout();

const cart = computed(() => state.value.cart);
const useShippingAddress = ref(false);

const billingFormData = ref<CheckoutFormType>({
  email: '',
  address: state.value.billingAddress,
  message: '',
});

const shippingFormData = ref<CheckoutFormType>({
  address: state.value.shippingAddress,
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
    navigateTo(typedResult.redirectUrl, { external: true });
  } else if (typedResult.success && typedResult.publicOrderId) {
    navigateTo(`${confirmationUrl.value}/${typedResult.publicOrderId}`, { external: true });
  } else if (typedResult.error) {
    console.error(typedResult.error);
  }
};
</script>

<template>
  <div>
    <NuxtLayout name="default">
      <template #cart>
        <Cart v-if="cart" :cart="cart" />
        <BottomUrls v-if="urls" :urls="urls" />
      </template>

      <template #checkout>
        <div class="mx-auto w-full max-w-2xl">
          <!-- Checkout Form -->
          <!-- Payment Methods -->
          <!--               <div
                  v-if="paymentMethods.length > 1"
                  class="card absolute bottom-0 left-0 rounded-lg bg-white p-6 shadow"
                >
                  <PaymentMethodSelector :methods="paymentMethods" @select="selectPaymentMethod" />
                </div> -->

          <div v-if="state.externalCheckoutHTML.length > 0" class="rounded-lg bg-white p-3 lg:p-8">
            <ExternalCheckout :html="state.externalCheckoutHTML" />
          </div>

          <!-- Billing Information -->
          <div v-if="state.selectedPaymentMethod === 18" class="">
            <h2 class="text-lg font-bold">
              {{ useShippingAddress ? 'Billing Address' : 'Your Information' }}
            </h2>
            <p class="mb-2 text-card-foreground/60">The address must be in Sweden.</p>
            <CheckoutForm :data="billingFormData" @update="updateCheckoutData('billing', $event)" />
            <!-- Shipping Information -->
            <ContentSwitch
              v-model:checked="useShippingAddress"
              label="Ship to a different address"
              :inside-box="true"
              class="mt-4"
            >
              <h2 class="text-lg font-bold">Shipping Address</h2>
              <p class="mb-2 text-card-foreground/60">The address must be in Sweden.</p>
              <CheckoutForm
                :data="shippingFormData"
                :only-address="true"
                @update="updateCheckoutData('shipping', $event)"
              />
            </ContentSwitch>
          </div>

          <Button :loading="loading" class="mt-4 w-full" size="lg" @click="handleCheckout">
            {{ loading ? 'Processing...' : 'Complete Checkout' }}
          </Button>
        </div>
      </template>
    </NuxtLayout>
  </div>
</template>
