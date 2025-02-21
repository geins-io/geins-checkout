<script setup lang="ts">
const { token } = useCheckout();
const { initialize, topBarVisible, topBarTitle } = useCheckoutStyling();

watchEffect(async () => {
  initialize(token.value);
});
</script>

<template>
  <div>
    <header v-if="topBarVisible" class="header border-b shadow-sm">
      <div class="mx-auto max-w-4xl px-6 py-4">
        <h1 class="text-center text-xl font-bold">{{ topBarTitle }}</h1>
      </div>
    </header>
    <slot />
  </div>
</template>
