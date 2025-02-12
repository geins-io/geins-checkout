<script setup lang="ts">
const route = useRoute();

const { state, initialize } = useCheckoutStyling();

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
      // Initialize your styling service
      await initialize(token);

      // page background color
      const bgColor = state.style.backgroundColor;
      if (bgColor && typeof bgColor === 'string') {
        document.body.style.backgroundColor = bgColor;
      } else {
        document.body.style.backgroundColor = '';
      }

      // header background color
      const header = document.querySelector('header');
      if (header) {
        const headerColor = state.style.topbar.backgroundColor;

        if (headerColor && typeof headerColor === 'string') {
          header.style.backgroundColor = headerColor;
        } else {
          header.style.backgroundColor = '';
        }
        const headerTextColor = state.style.topbar.textColor;
        if (headerTextColor && typeof headerTextColor === 'string') {
          header.style.color = headerTextColor;
        } else {
          header.style.color = '';
        }
      }

      // build <style> tag for custom CSS rules
      const styleTag = document.createElement('style');
      styleTag.innerHTML = state.css;
      document.head.appendChild(styleTag);
    }
  });
});
</script>

<template>
  <div>
    <header class="border-b bg-white shadow-sm">
      <div class="mx-auto max-w-4xl px-6 py-4">
        <h1 class="text-center text-xl font-bold">{{ state?.style?.title }}</h1>
      </div>
    </header>
    <slot />
  </div>
</template>
<style></style>
