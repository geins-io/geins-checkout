<script setup lang="ts">
import Logo from '@/assets/logos/geins.svg';
const { token } = useCheckout();
const { initialize, topBarVisible, topBarTitle, logoUrl } = useCheckoutStyling();

watchEffect(async () => {
  initialize(token.value);
});
</script>

<template>
  <div>
    <header v-if="topBarVisible" class="bg-background py-5">
      <div class="mx-auto flex items-center justify-center">
        <img v-if="logoUrl" :src="logoUrl" class="max-h-8 w-auto" />
        <Logo v-else :font-controlled="false" class="max-h-8 w-auto" />
        <h1 class="ml-6 border-l-2 pl-6 pr-4 text-center text-xl">{{ topBarTitle }}</h1>
      </div>
    </header>
    <slot />
  </div>
</template>
