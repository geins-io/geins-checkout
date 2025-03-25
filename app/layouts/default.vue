<script setup lang="ts">
import Logo from '@/assets/logos/geins.svg';
const { path } = useRoute();
const { globalLoading } = useCheckout();
const isHomePage = computed(() => path === '/');
</script>

<template>
  <div class="grid lg:grid-cols-2">
    <div
      :class="
        cn(
          'bg-background px-[4vw] py-6 text-foreground lg:h-screen lg:overflow-y-auto lg:overflow-x-hidden lg:py-0',
          `${!globalLoading ? 'lg:pb-16' : ''}`,
        )
      "
    >
      <div v-if="!globalLoading" class="flex flex-col gap-6 lg:h-full lg:justify-center lg:gap-[2vh]">
        <Header v-if="!isHomePage" />
        <slot name="cart" />
      </div>
      <div v-else-if="!isHomePage" class="flex h-full items-center justify-center">
        <Loading class="m-auto size-10" />
      </div>
    </div>
    <div
      class="bg-card px-[4vw] py-12 text-card-foreground lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:py-[8vh]"
    >
      <div v-if="!globalLoading" class="lg:my-auto">
        <slot name="checkout" />
      </div>
      <div v-else-if="!isHomePage" class="flex h-full items-center justify-center">
        <Loading class="m-auto size-10 rotate-90" />
      </div>
    </div>
    <footer
      v-if="!isHomePage"
      class="mx-auto flex gap-2 py-6 lg:absolute lg:bottom-8 lg:left-1/2 lg:grid lg:-translate-x-1/2 lg:grid-cols-2 lg:gap-6 lg:py-0"
    >
      <div>
        <p class="text-[0.6rem] text-foreground/70 lg:text-xs">{{ $t('powered_by') }}</p>
      </div>
      <div class="lg:text-card-foreground">
        <Logo :font-controlled="false" class="h-4 w-auto lg:h-5" />
      </div>
    </footer>
  </div>
</template>
