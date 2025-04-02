<script setup lang="ts">
const { title } = useCheckoutToken();
useHeadSafe({
  title: title.value || 'Geins Checkout',
  meta: [
    {
      name: 'description',
      content: 'Storefrontless checkout for your e-commerce',
    },
  ],
});
</script>
<template>
  <NuxtPage />
</template>
