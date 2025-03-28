<script setup lang="ts">
import { ExternalSnippetType, PaymentMethodId } from '#shared/types';
const { urls } = useCheckoutToken();
const { state, cart, initializeCheckout, updateCheckout } = useCheckout();
const { externalPaymentSelected } = useExternalSnippet();
const { vatIncluded } = usePrice();

await initializeCheckout();

const isPaymentInvoice = computed(() => state.value.selectedPaymentId === PaymentMethodId.ManualInvoice);
const useManualCheckout = computed(
  () =>
    !externalPaymentSelected.value &&
    (isPaymentInvoice.value ||
      (vatIncluded.value && state.value.selectedPaymentId === PaymentMethodId.GeinsPay)),
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
        </div>
      </template>
    </NuxtLayout>
  </div>
</template>
