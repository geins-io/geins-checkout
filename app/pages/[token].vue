<script setup lang="ts">
const { token } = useCheckout();
const currentVersion = useRuntimeConfig().public.currentVersion;

console.log('Redirecting to checkout page');
const url = `/${currentVersion}/${token}/checkout`;
console.log('Redirecting to', url);
navigateTo(url);
</script>
<template>
  <div />
</template>
