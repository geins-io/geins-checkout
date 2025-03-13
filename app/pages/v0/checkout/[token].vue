<script setup lang="ts">
const { urls } = useCheckoutToken();
const { state, cart, initializeCheckout } = useCheckout();

await initializeCheckout();
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
          <InvoiceCheckout v-else-if="state.selectedPaymentMethod === 18" />

          <!-- Manual Invoice -->
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
