<script setup lang="ts">
import Logo from '@/assets/logos/geins.svg';
import { LucideArrowLeft } from '#components';
const { path } = useRoute();
const { logo, avatar, avatarFallback, name, source } = useCheckoutToken();

const isHomePage = computed(() => path === '/');

watchEffect(async () => {
  //initialize(token.value);
});
</script>

<template>
  <div class="grid lg:grid-cols-2">
    <div class="bg-background p-20 pt-32 text-foreground flex flex-col gap-8">
      <header
        v-if="!isHomePage && (name || logo || avatar || avatarFallback || source)"
        class="flex items-center"
      >
        <a v-if="source" :href="source" class="flex items-center">
          <LucideArrowLeft class="size-6 mr-4" />
          <span v-if="!name && !logo && !avatar && !avatarFallback" class="text-md">
            {{ $t('go_back') }}
          </span>
        </a>
        <img v-if="logo" :src="logo" :class="cn(`h-12 w-auto pr-6 mr-6`, `${!!name ? 'border-r' : ''}`)" />
        <Avatar
          v-else-if="avatar || avatarFallback"
          :class="cn('mr-4 size-12', `${!!avatar ? '' : 'bg-accent color-accent-foreground'}`)"
        >
          <AvatarImage v-if="avatar" :src="avatar" :alt="name" />
          <AvatarFallback class="text-xl">{{ avatarFallback }}</AvatarFallback>
        </Avatar>
        <h1 v-if="name" class="text-xl">{{ name }}</h1>
      </header>
      <slot name="cart" />
    </div>
    <div class="bg-card p-20 pt-48 text-card-foreground lg:h-screen lg:overflow-y-auto lg:overflow-x-hidden">
      <slot name="checkout" />
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
