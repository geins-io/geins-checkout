<script setup lang="ts">
const { externalCheckoutHtml, renderExternalCheckout } = useExternalCheckout();
onMounted(() => {
  renderExternalCheckout();
});
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div id="checkout-external" v-html="externalCheckoutHtml" />
</template>
