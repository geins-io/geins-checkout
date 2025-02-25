<script setup lang="ts">
import type { ShippingMethod } from '#shared/types';

const props = defineProps<{
  methods: ShippingMethod[];
}>();

const emit = defineEmits<{
  select: [methodId: number];
}>();

const sortedMethods = computed(() => {
  return [...props.methods].sort((a, b) => {
    if (a.isDefault === b.isDefault) return 0;
    return a.isDefault ? -1 : 1;
  });
});

const selectMethod = (methodId: number) => {
  emit('select', methodId);
};
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-lg font-medium">Shipping Method</h2>
    <div v-if="methods.length === 0" class="py-4 text-center text-gray-500">
      No shipping methods available
    </div>
    <div v-else class="space-y-3">
      <div v-for="method in sortedMethods" :key="method.id" class="space-y-2">
        <!-- Main shipping option -->
        <div
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
                <div>
                  <span class="font-medium">{{ method.displayName }}</span>
                  <div v-if="method.shippingData?.estimatedDays" class="text-sm text-gray-500">
                    {{ method.shippingData.estimatedDays }}
                  </div>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-medium">{{ method.feeIncVatFormatted }}</div>
              <div v-if="method.amountLeftToFreeShippingFormatted" class="text-sm text-green-600">
                {{ method.amountLeftToFreeShippingFormatted }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
