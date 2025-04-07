<script setup lang="ts">
const { title } = useCheckoutToken();
useHeadSafe({
  title: title.value || 'Geins Checkout',
});
</script>
<template>
  <NuxtPage />
</template>
