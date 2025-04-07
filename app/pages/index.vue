<script setup lang="ts">
import Logo from '@/assets/logos/geins.svg';
</script>
<template>
  <div>
    <div class="color-card absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
      <p class="text-muted-foreground text-xs">{{ $t('powered_by') }}</p>
      <Logo :font-controlled="false" class="h-28 w-auto text-card-foreground" />
    </div>
    <NuxtLayout name="default" class="hidden lg:grid">
      <template #checkout>
        <div />
      </template>
    </NuxtLayout>
  </div>
</template>
