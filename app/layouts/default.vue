<script setup lang="ts">
const route = useRoute();

const { state, initialize, topbarVisible, topbarTitle } = useCheckoutStyling();

onMounted(async () => {
  watchEffect(async () => {
    if (import.meta.client) {
      const segments = route.path.split('/');
      if (segments.length < 3) {
        return;
      }
      const token = segments[2];
      if (!token) {
        return;
      }
      await initialize(token);
    }
  });
});
</script>

<template>
  <div>
    <header class="header border-b shadow-sm" v-if="topbarVisible()">
      <div class="mx-auto max-w-4xl px-6 py-4">
        <h1 class="text-center text-xl font-bold">{{ topbarTitle() }}</h1>
      </div>
    </header>
    <slot />
  </div>
</template>
