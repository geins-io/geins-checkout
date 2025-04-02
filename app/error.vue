<script setup lang="ts">
import type { NuxtError } from '#app';
import Logo from '@/assets/logos/geins.svg';

const _props = defineProps({
  error: Object as () => NuxtError,
});

const handleError = () => clearError({ redirect: '/' });
// TODO: Remove message and callstack before launch
</script>

<template>
  <NuxtLayout name="default" class="hidden lg:grid">
    <template #cart>
      <Logo :font-controlled="false" class="h-28 w-auto text-foreground" />
    </template>
    <template #checkout>
      <div class="flex h-screen flex-col items-center justify-center bg-card text-card-foreground">
        <h1 class="mb-2 text-xl font-bold">Error {{ error?.statusCode }}</h1>
        <p v-if="error?.message" class="mb-5">{{ error?.message }}</p>
        <p v-else>No message</p>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="mb-5 max-w-xl text-xs" v-html="error?.stack" />
        <Button @click="handleError">Clear errors</Button>
      </div>
    </template>
  </NuxtLayout>
</template>
