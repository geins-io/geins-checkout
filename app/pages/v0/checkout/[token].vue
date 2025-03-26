<script setup lang="ts">
import { ExternalSnippetType } from '#shared/types';
const { urls } = useCheckoutToken();
const { state, cart, initializeCheckout, updateCheckout } = useCheckout();
const { externalPaymentSelected } = useExternalSnippet();
const { vatIncluded } = usePrice();

await initializeCheckout();

const isPaymentInvoice = computed(() => state.value.selectedPaymentMethod === 18);
const useManualCheckout = computed(
  () =>
    !externalPaymentSelected.value &&
    (isPaymentInvoice.value || (vatIncluded.value && state.value.selectedPaymentMethod === 27)),
);

const nextStep = async () => {
  await updateCheckout();
};
</script>

<template>
  <div>
    <NuxtLayout name="default">
      <template #cart>
        <Cart
          v-if="cart"
          :cart="cart"
          class="overflow-y-auto overflow-x-hidden lg:max-h-[72vh] lg:min-h-56"
        />
        <BottomUrls v-if="urls" :urls="urls" />
      </template>

      <template #checkout>
        <div v-auto-animate class="mx-auto w-full max-w-2xl">
          <ManualCheckout
            v-if="useManualCheckout"
            :enable-complete-checkout="isPaymentInvoice"
            @completed="nextStep"
          />
          <div v-else-if="externalPaymentSelected" class="rounded-lg bg-white p-3 lg:p-8">
            <ExternalSnippet :type="ExternalSnippetType.Checkout" />
          </div>
          <!-- Manual Invoice -->
        </div>
        <!--         <div
          v-if="paymentMethods.length > 1"
          class="card absolute bottom-0 left-0 rounded-lg bg-white p-6 shadow"
        >
          <PaymentMethodSelector :methods="paymentMethods" @select="selectPaymentMethod" />
        </div> -->
      </template>
    </NuxtLayout>
  </div>
</template>
