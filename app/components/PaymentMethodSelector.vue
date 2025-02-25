<script setup lang="ts">
import type { PaymentMethod } from '#shared/types';

const props = defineProps<{
  methods: PaymentMethod[];
}>();

const emit = defineEmits<{
  select: [methodId: string];
}>();

const selectMethod = (methodId: string) => {
  emit('select', methodId);
};
</script>

<template>
  <div class="space-y-2 text-xs">
    <div class="space-y-3">
      <div
        v-for="method in methods"
        :key="method.id"
        class="cursor-pointer rounded-lg border p-4 transition-colors duration-200"
        :class="{
          'border-accent bg-accent/10': method.isSelected,
          'border-gray-200 hover:border-accent': !method.isSelected,
        }"
        @click="selectMethod(method.id)"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="size-6 shrink-0">
              <div
                class="flex size-6 items-center justify-center rounded-full border-2"
                :class="{ 'border-accent': method.isSelected, 'border-gray-300': !method.isSelected }"
              >
                <div v-if="method.isSelected" class="size-3 rounded-full bg-accent" />
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <img
                v-if="(method.logoUrl || '').length > 0"
                :src="method.logoUrl"
                :alt="method.displayName"
                class="h-8 w-auto object-contain"
              />
              <span class="font-medium">{{ method.displayName }}</span>
            </div>
          </div>
          <div class="text-sm text-gray-600" />
        </div>
      </div>
    </div>
  </div>
</template>
