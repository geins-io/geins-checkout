<script setup lang="ts">
const { checkoutUrl } = useCheckoutToken();
navigateTo(checkoutUrl.value);
</script>
<template>
  <div />
</template>
