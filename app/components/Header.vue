<script setup lang="ts">
import { LucideArrowLeft } from '#components';
const { logo, icon, iconFallback, title, urls } = useCheckoutToken();
</script>
<template>
  <header
    v-if="title || logo || icon || iconFallback || urls?.cancel"
    class="mx-auto flex w-full max-w-3xl items-center"
  >
    <a v-if="urls?.cancel" :href="urls.cancel" class="flex items-center">
      <LucideArrowLeft class="mr-4 size-6" />
      <span v-if="!title && !logo && !icon && !iconFallback" class="text-md">
        {{ $t('go_back') }}
      </span>
    </a>
    <Avatar
      v-if="icon || (!logo && iconFallback)"
      :class="cn('mr-4 size-12 shrink-0', `${!icon ? 'bg-accent text-accent-foreground' : ''}`)"
    >
      <AvatarImage v-if="icon" :src="icon" :alt="title" />
      <AvatarFallback class="text-xl font-bold tracking-wider">{{ iconFallback }}</AvatarFallback>
    </Avatar>
    <img
      v-if="logo"
      :src="logo"
      :class="cn(`h-8 w-auto pr-6 mr-6`, `${!!title ? 'border-r border-foreground' : ''}`)"
    />
    <h1 v-if="title" class="text-xl font-semibold tracking-wide">{{ title }}</h1>
  </header>
</template>
