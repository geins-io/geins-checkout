<script setup lang="ts">
const props = defineProps<{
  html: string | undefined;
}>();

/* const selectMethod = (methodId: string) => {
  emit('select', methodId)
} */
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-3">
      <div id="checkout-external" v-html="html" />
    </div>
  </div>
</template>
