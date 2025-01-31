<script setup lang="ts">
import type { ShippingMethod } from '#shared/types';

const props = defineProps<{
  methods: ShippingMethod[]
}>()

const emit = defineEmits<{
  select: [methodId: number]
}>()

const sortedMethods = computed(() => {
  return [...props.methods].sort((a, b) => {
    if (a.isDefault === b.isDefault) return 0
    return a.isDefault ? -1 : 1
  })
})

const selectMethod = (methodId: number) => {
  emit('select', methodId)
}

</script>

<template>
  <div class="space-y-4">
    <h2 class="text-lg font-medium">Shipping Method</h2>
    <div v-if="methods.length === 0" class="text-gray-500 text-center py-4">
      No shipping methods available
    </div>
    <div v-else class="space-y-3">
      <div v-for="method in sortedMethods" :key="method.id" class="space-y-2">
        <!-- Main shipping option -->
        <div @click="selectMethod(method.id)"
          class="p-4 border rounded-lg cursor-pointer transition-colors duration-200" :class="{
            'border-blue-500 bg-blue-50': method.isSelected,
            'border-gray-200 hover:border-blue-200': !method.isSelected
          }">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-6 h-6 flex-shrink-0">
                <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                  :class="{ 'border-blue-500': method.isSelected, 'border-gray-300': !method.isSelected }">
                  <div v-if="method.isSelected" class="w-3 h-3 rounded-full bg-blue-500"></div>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <img v-if="(method.logoUrl || '').length > 0" :src="method.logoUrl" :alt="method.displayName"
                  class="h-8 w-auto object-contain" />
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
