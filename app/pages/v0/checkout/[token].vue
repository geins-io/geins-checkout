<script setup lang="ts">
const { confirmationPageUrl, urls } = useCheckoutToken();
const { state, loading, cart, initializeCheckout, updateCheckoutData, completeCheckout } = useCheckout();

await initializeCheckout();

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
    navigateTo(typedResult.redirectUrl, { external: true });
  } else if (typedResult.success && typedResult.publicOrderId) {
    navigateTo(`${confirmationPageUrl.value}/${typedResult.publicOrderId}`, { external: true });
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
          <div v-if="state.externalCheckoutHTML.length > 0" class="rounded-lg bg-white p-3 lg:p-8">
            <ExternalCheckout :html="state.externalCheckoutHTML" />
          </div>

          <!-- Manual Invoice -->
          <div v-if="state.selectedPaymentMethod === 18" class="lg:px-7">
            <h2 class="text-lg font-bold">
              {{ state.useShippingAddress ? 'Billing Address' : 'Your Information' }}
            </h2>
            <p class="mb-2 text-card-foreground/60">The address must be in Sweden.</p>
            <CheckoutForm :data="billingFormData" @update="updateCheckoutData('billing', $event)" />
            <!-- Shipping Information -->
            <ContentSwitch
              v-model:checked="state.useShippingAddress"
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
            <CartSummary v-if="cart" :summary="cart.summary" class="mt-4" />
            <Button :loading="loading" class="mt-4 w-full" size="lg" @click="handleCheckout">
              {{ loading ? 'Processing...' : 'Complete Checkout' }}
            </Button>
          </div>
        </div>
        <!--               <div
                  v-if="paymentMethods.length > 1"
                  class="card absolute bottom-0 left-0 rounded-lg bg-white p-6 shadow"
                >
                  <PaymentMethodSelector :methods="paymentMethods" @select="selectPaymentMethod" />
                </div> -->
      </template>
    </NuxtLayout>
  </div>
</template>
