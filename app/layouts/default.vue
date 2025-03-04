<script setup lang="ts">
import Logo from '@/assets/logos/geins.svg';
import { LucideArrowLeft } from '#components';
const { path } = useRoute();
const { logo, icon, iconFallback, title, urls } = useCheckoutToken();

const isHomePage = computed(() => path === '/');
</script>

<template>
  <div class="grid lg:grid-cols-2">
    <div
      class="flex flex-col gap-8 bg-background px-[4vw] py-8 text-foreground lg:h-screen lg:overflow-y-auto lg:overflow-x-hidden lg:py-[8vh]"
    >
      <header
        v-if="!isHomePage && (title || logo || icon || iconFallback || urls?.cancel)"
        class="flex items-center"
      >
        <a v-if="urls?.cancel" :href="urls.cancel" class="flex items-center">
          <LucideArrowLeft class="mr-4 size-6" />
          <span v-if="!title && !logo && !icon && !iconFallback" class="text-md">
            {{ $t('go_back') }}
          </span>
        </a>
        <Avatar v-if="icon || (!logo && iconFallback)" class="mr-4 size-12 shrink-0">
          <AvatarImage v-if="icon" :src="icon" :alt="title" />
          <AvatarFallback class="text-xl">{{ iconFallback }}</AvatarFallback>
        </Avatar>
        <img v-if="logo" :src="logo" :class="cn(`h-8 w-auto pr-6 mr-6`, `${!!title ? 'border-r' : ''}`)" />
        <h1 v-if="title" class="text-xl font-semibold tracking-wide">{{ title }}</h1>
      </header>
      <slot name="cart" />
    </div>
    <div
      class="bg-card px-[4vw] py-12 text-card-foreground lg:h-screen lg:overflow-y-auto lg:overflow-x-hidden lg:py-[8vh]"
    >
      <div class="rounded-lg border bg-white p-8">
        <slot name="checkout" />
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
