<script setup lang="ts">
const { state, checkoutLoading, cart, currentCountryName, updateCheckoutData, completeCheckout } =
  useCheckout();

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
</script>
<template>
  <div class="lg:px-7">
    <h2 class="text-lg font-bold">
      {{ state.useShippingAddress ? $t('billing_address') : $t('your_information') }}
    </h2>
    <p class="mb-2 text-card-foreground/60">
      {{ $t('address_must_be_in_country', { country: currentCountryName }) }}
    </p>
    <CheckoutForm :data="billingFormData" @update="handleFormUpdate($event, 'billing')" />
    <!-- Shipping Information -->
    <ContentSwitch
      v-model:checked="state.useShippingAddress"
      :label="$t('ship_to_different_address')"
      :inside-box="true"
      class="mt-4"
    >
      <h2 class="text-lg font-bold">{{ $t('shipping_address') }}</h2>
      <p class="mb-2 text-card-foreground/60">
        {{ $t('address_must_be_in_country', { country: currentCountryName }) }}
      </p>
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
      {{ checkoutLoading ? $t('processing') + '...' : $t('complete_checkout') }}
    </Button>
    <Button
      v-else
      class="mt-4 w-full"
      size="lg"
      :loading="checkoutLoading"
      :disabled="!formTouched || !formValid"
      @click="handleNextStep"
    >
      {{ checkoutLoading ? $t('loading') + '...' : $t('go_to_payment') }}
    </Button>
  </div>
</template>
