<script setup lang="ts">
import { ExternalSnippetType } from '#shared/types';
const { urls } = useCheckoutToken();
const { cart, cartEmpty, useManualCheckout, isPaymentInvoice, initializeCheckout, updateCheckout } =
  useCheckout();
const { externalPaymentSelected } = useExternalSnippet();

await initializeCheckout();

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
            v-if="useManualCheckout || cartEmpty"
            :enable-complete-checkout="isPaymentInvoice"
            :disabled="cartEmpty"
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
