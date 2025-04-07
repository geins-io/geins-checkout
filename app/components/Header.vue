<script setup lang="ts">
import { LucideArrowLeft, LucideArrowRight } from '#components';
const { logo, icon, iconFallback, title, urls } = useCheckoutToken();

const _props = defineProps<{
  confirmPage?: boolean;
}>();
</script>
<template>
  <header
    v-if="title || logo || icon || iconFallback || urls?.cancel"
    class="mx-auto flex w-full max-w-3xl items-center"
  >
    <a v-if="urls?.cancel && !confirmPage" :href="urls.cancel" class="flex items-center">
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
    <img v-if="logo" :src="logo" :class="cn(`h-logo w-auto pr-6 mr-6`)" />
    <h1 v-if="title && !logo" class="text-xl font-semibold tracking-wide">{{ title }}</h1>
    <Button
      v-if="urls?.continue && confirmPage"
      as-child
      variant="outline"
      class="ml-auto hidden items-center border-foreground/60 hover:border-foreground/20 hover:bg-transparent hover:text-foreground md:flex"
    >
      <a :href="urls.continue">
        {{ $t('continue_shopping') }}
        <LucideArrowRight />
      </a>
    </Button>
  </header>
</template>
