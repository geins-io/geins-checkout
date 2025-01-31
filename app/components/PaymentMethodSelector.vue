<script setup lang="ts">
import type { PaymentMethod } from '#shared/types';


const props = defineProps<{
  methods: PaymentMethod[]
}>()

const emit = defineEmits<{
  select: [methodId: string]
}>()

const selectMethod = (methodId: string) => {
  emit('select', methodId)
}
</script>


<template>
  <div class="space-y-4">
    <h2 class="text-lg font-medium">Payment Method</h2>
    <div class="space-y-3">
      <div v-for="method in methods" :key="method.id" @click="selectMethod(method.id)"
        class="p-4 border rounded-lg cursor-pointer transition-colors duration-200"
        :class="{ 'border-blue-500 bg-blue-50': method.isSelected, 'border-gray-200 hover:border-blue-200': !method.isSelected }">
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
              <span class="font-medium">{{ method.displayName }}</span>
            </div>
          </div>
          <div class="text-sm text-gray-600">

          </div>
        </div>
      </div>
    </div>
  </div>
</template>
