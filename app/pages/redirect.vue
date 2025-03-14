<script setup lang="ts">
import { NuxtLayout } from '#components';

const { latestCheckoutUrl } = useCheckoutToken();
navigateTo(latestCheckoutUrl.value);
</script>
<template>
  <NuxtLayout />
</template>
