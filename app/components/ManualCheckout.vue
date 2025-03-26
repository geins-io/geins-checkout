<script setup lang="ts">
const { state, checkoutLoading, cart, updateCheckoutData, completeCheckout } = useCheckout();
const { currentCountryName } = useGeinsClient();
console.log('🚀 ~ currentCountryName:', currentCountryName.value);

const _props = defineProps<{
  enableCompleteCheckout: boolean;
}>();

const emit = defineEmits<{
  completed: [value: boolean];
}>();

const billingFormData = ref<CheckoutFormType>({
  email: '',
  address: state.value.billingAddress,
  message: '',
});

const shippingFormData = ref<CheckoutFormType>({
  address: state.value.shippingAddress,
});

const formValid = ref(false);
const formTouched = ref(false);

const handleFormUpdate = async (data: CheckoutFormUpdateEvent, addressType: 'billing' | 'shipping') => {
  updateCheckoutData(addressType, data.values);
  formTouched.value = data.touched;
  formValid.value = data.valid;
};

const handleCheckout = async () => {
  const response = await completeCheckout();

  if (response.redirectUrl) {
    navigateTo(response.redirectUrl, { external: true });
  } else {
    console.warn('Unknown response:', response);
  }
};

const handleNextStep = async () => {
  emit('completed', true);
};

// TODO: fix country name not working anymore
</script>
<template>
  <div class="lg:px-7">
    <h2 class="text-lg font-bold">
      {{ state.useShippingAddress ? 'Billing Address' : 'Your Information' }}
    </h2>
    <p class="mb-2 text-card-foreground/60">The address must be in {{ currentCountryName }}.</p>
    <CheckoutForm :data="billingFormData" @update="handleFormUpdate($event, 'billing')" />
    <!-- Shipping Information -->
    <ContentSwitch
      v-model:checked="state.useShippingAddress"
      label="Ship to a different address"
      :inside-box="true"
      class="mt-4"
    >
      <h2 class="text-lg font-bold">Shipping Address</h2>
      <p class="mb-2 text-card-foreground/60">The address must be in {{ currentCountryName }}.</p>
      <CheckoutForm
        :data="shippingFormData"
        :only-address="true"
        @update="handleFormUpdate($event, 'shipping')"
      />
    </ContentSwitch>
    <CartSummary v-if="cart?.summary" :summary="cart.summary" class="mt-4" />
    <Button
      v-if="enableCompleteCheckout"
      :loading="checkoutLoading"
      class="mt-4 w-full"
      size="lg"
      :disabled="!formTouched || !formValid"
      @click="handleCheckout"
    >
      {{ checkoutLoading ? 'Processing...' : 'Complete Checkout' }}
    </Button>
    <Button
      v-else
      class="mt-4 w-full"
      size="lg"
      :loading="checkoutLoading"
      :disabled="!formTouched || !formValid"
      @click="handleNextStep"
    >
      {{ checkoutLoading ? 'Loading...' : 'Go to Payment' }}
    </Button>
  </div>
</template>
