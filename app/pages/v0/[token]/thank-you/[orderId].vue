<script setup lang="ts">
import type { OrderSummaryType } from '@geins/types';
const { state, initializeSummary } = useSummary();
const { token } = useCheckoutToken();
const { query, params } = useRoute();
const orderId = params.orderId?.toString() || '';
const orderDetails = ref<OrderSummaryType | null>(null);
const externalSummaryHTML = ref<string | undefined>(undefined);

if (!orderId) {
  navigateTo('/');
}

onMounted(async () => {
  const summary = await initializeSummary(token.value, orderId, query);
  console.log('Summary', summary?.htmlSnippet);
  if (summary?.htmlSnippet) {
    externalSummaryHTML.value = summary.htmlSnippet;
  } else {
    orderDetails.value = summary.order;
  }
});
</script>

<template>
  <div>
    <NuxtLayout name="default">
      <template #cart>
        <Cart v-if="cart" :cart="cart" />
        <BottomUrls v-if="urls" :urls="urls" />
      </template>

      <template #checkout>
        <h1>Thank you for your order</h1>
      </template>
    </NuxtLayout>
  </div>
</template>
