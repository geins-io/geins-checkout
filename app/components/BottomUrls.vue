<script setup lang="ts">
const _props = defineProps<{
  urls: {
    terms?: string;
    privacy?: string;
  } | null;
}>();
</script>
<template>
  <div
    v-if="urls?.terms || urls?.privacy"
    class="flex w-full justify-center gap-4 text-xs lg:absolute lg:bottom-10 lg:left-[4vw] lg:w-auto lg:justify-start"
  >
    <a v-if="urls?.terms" :href="urls.terms" class="text-foreground/90 underline underline-offset-2">
      Terms & Conditions
    </a>
    <a v-if="urls?.privacy" :href="urls.privacy" class="text-foreground/90 underline underline-offset-2">
      Privacy Policy
    </a>
  </div>
</template>
