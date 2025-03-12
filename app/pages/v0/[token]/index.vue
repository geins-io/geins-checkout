<script setup lang="ts">
const { latestCheckoutUrl } = useCheckoutToken();
navigateTo(latestCheckoutUrl.value);
</script>
<template>
  <div />
</template>
