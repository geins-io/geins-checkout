<script setup lang="ts">
import Logo from '@/assets/logos/geins.svg';
const { globalLoading } = useCheckout();
</script>

<template>
  <div
    :class="
      cn(
        'bg-background px-[4vw] py-6 text-foreground lg:flex lg:items-center lg:h-full lg:min-h-screen lg:overflow-y-auto lg:overflow-x-hidden',
      )
    "
  >
    <div
      v-if="!globalLoading"
      class="my-auto flex flex-col gap-6 lg:size-full lg:justify-center lg:gap-[2vh]"
    >
      <Header />
      <slot name="summary" />
      <slot name="cart" />
      <footer class="mx-auto flex gap-2 py-6">
        <div>
          <p class="text-[0.6rem] text-foreground/70 lg:text-xs">{{ $t('powered_by') }}</p>
        </div>
        <div class="text-foreground">
          <Logo :font-controlled="false" class="h-4 w-auto lg:h-5" />
        </div>
      </footer>
    </div>
  </div>
</template>
