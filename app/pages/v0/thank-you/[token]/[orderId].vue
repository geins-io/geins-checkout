<script setup lang="ts">
import { ExternalSnippetType } from '#shared/types';
const { orderSummary, initializeSummary } = useSummary();
const { cart } = useCheckout();
const { query, params } = useRoute();
const orderId = params.orderId?.toString() || '';

if (!orderId) {
  navigateTo('/');
}

await initializeSummary(orderId, query);
console.log(orderSummary.value);
console.log(cart.value);
</script>

<template>
  <div>
    <NuxtLayout name="default">
      <template #cart>
        <!-- <Cart v-if="cart" :cart="cart" /> -->
      </template>

      <template #checkout>
        <ExternalSnippet :type="ExternalSnippetType.Summary" />
      </template>
    </NuxtLayout>
  </div>
</template>
