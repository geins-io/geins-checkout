<script setup lang="ts">
const { currentCheckoutUrl } = useCheckoutToken();
navigateTo(currentCheckoutUrl.value);
</script>
<template>
  <div />
</template>
