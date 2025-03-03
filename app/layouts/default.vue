<script setup lang="ts">
import Logo from '@/assets/logos/geins.svg';
import { LucideArrowLeft } from '#components';
const { path } = useRoute();
const { logo, icon, iconFallback, title, urls } = useCheckoutToken();

const isHomePage = computed(() => path === '/');
</script>

<template>
  <div class="grid lg:grid-cols-2">
    <div class="flex flex-col gap-8 bg-background p-28 pt-[7vh] text-foreground">
      <header
        v-if="!isHomePage && (title || logo || icon || iconFallback || urls.cancel)"
        class="flex items-center"
      >
        <a v-if="urls.cancel" :href="urls.cancel" class="flex items-center">
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
        <h1 v-if="title" class="text-xl font-bold tracking-wide">{{ title }}</h1>
      </header>
      <slot name="cart" />
    </div>
    <div
      class="bg-card p-28 pt-[7vh] text-card-foreground lg:h-screen lg:overflow-y-auto lg:overflow-x-hidden"
    >
      <div class="rounded-lg border bg-white p-8">
        <slot name="checkout" />
      </div>
    </div>
  </div>
  <footer v-if="!isHomePage" class="absolute bottom-8 left-1/2 grid -translate-x-1/2 grid-cols-2 gap-8">
    <div>
      <p class="text-xs text-foreground">{{ $t('powered_by') }}</p>
    </div>
    <div class="text-card-foreground">
      <Logo :font-controlled="false" class="h-5 w-auto" />
    </div>
  </footer>
</template>
