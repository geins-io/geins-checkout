<script setup lang="ts">
const { confirmationPageUrl } = useCheckoutToken();
const { state, loading, cart, updateCheckoutData, completeCheckout } = useCheckout();

const billingFormData = ref<CheckoutFormType>({
  email: '',
  address: state.value.billingAddress,
  message: '',
});

const shippingFormData = ref<CheckoutFormType>({
  address: state.value.shippingAddress,
});

const handleCheckout = async () => {
  const response = await completeCheckout();

  if (response.redirectUrl) {
    navigateTo(response.redirectUrl, { external: true });
  } else if (response.success && response.publicOrderId) {
    navigateTo(`${confirmationPageUrl.value}/${response.publicOrderId}`, { external: true });
  } else {
    console.warn('Unknown response:', response);
  }
};
</script>
<template>
  <div class="lg:px-7">
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
</template>
