<script setup lang="ts">
const { token } = useCheckout();
const currentVersion = useRuntimeConfig().public.currentVersion;

navigateTo(`/${currentVersion}/${token.value}/checkout`);
</script>
<template>
  <div />
</template>
