<script setup lang="ts">
const { token, currentVersion, urls } = useCheckoutToken();
const { state, loading, shippingMethods, paymentMethods, updateCheckoutData, completeCheckout } =
  useCheckout();

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
  } else if (typedResult.success && typedResult.publicOrderId) {
    navigateTo(`/${currentVersion}/${token.value}/thank-you/${typedResult.publicOrderId}`);
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
        <div
          v-if="urls?.terms || urls?.privacy"
          class="flex w-full justify-center gap-4 text-xs lg:absolute lg:bottom-10 lg:left-[4vw] lg:w-auto lg:justify-start lg:text-sm"
        >
          <a v-if="urls?.terms" :href="urls.terms" class="text-foreground/90 underline underline-offset-2">
            Terms & Conditions
          </a>
          <a
            v-if="urls?.privacy"
            :href="urls.privacy"
            class="text-foreground/90 underline underline-offset-2"
          >
            Privacy Policy
          </a>
        </div>
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

            <!-- <div class="mt-4 flex items-center space-x-2">
              <Checkbox
                id="useShipping"
                :model-value="useShippingAddress"
                @update:model-value="useShippingAddress = !!$event"
              />
              <Label for="useShipping">Ship to a different address</Label>
            </div> -->
            <ContentSwitch
              v-model:checked="useShippingAddress"
              label="Ship to a different address"
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
