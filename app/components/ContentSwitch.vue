<script setup lang="ts">
const _props = defineProps<{
  label?: string;
  description?: string;
  insideBox?: boolean;
}>();

const checked = defineModel<boolean>('checked');
</script>
<template>
  <div v-auto-animate>
    <div v-auto-animate class="rounded-lg border p-4 text-sm shadow-sm">
      <div class="flex flex-row items-center justify-between">
        <div class="space-y-0.5">
          <p>{{ label }}</p>
          <p v-if="description">{{ description }}</p>
        </div>
        <div>
          <Switch v-model:checked="checked" />
        </div>
      </div>
      <div v-if="insideBox && checked" class="pt-4">
        <slot />
      </div>
    </div>
    <div v-if="!insideBox && checked" class="pt-4">
      <slot />
    </div>
  </div>
</template>
