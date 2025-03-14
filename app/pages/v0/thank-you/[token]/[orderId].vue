<script setup lang="ts">
import type { OrderSummaryType, CartType } from '@geins/types';
const { orderSummary, orderCart, initializeSummary } = useSummary();
const { query, params } = useRoute();
const orderId = params.orderId?.toString() || '';
const orderDetails = ref<OrderSummaryType | null>(null);
const externalSummaryHTML = ref<string | undefined>(undefined);

if (!orderId) {
  navigateTo('/');
}

await initializeSummary(orderId, query);
console.log(orderSummary.value);
</script>

<template>
  <div>
    <NuxtLayout name="default">
      <template #cart>
        <!-- <Cart v-if="orderCart" :cart="orderCart" /> -->
        <!--  <BottomUrls v-if="urls" :urls="urls" /> -->
      </template>

      <template #checkout>
        <h1 class="text-center text-3xl">Thank you for your order!</h1>
      </template>
    </NuxtLayout>
  </div>
</template>
