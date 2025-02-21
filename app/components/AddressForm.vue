<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import type { Address } from '#shared/types';

import { addressSchema } from '#shared/types';

import { ZodError } from 'zod';

const props = defineProps<{
  address: Address;
}>();

const emit = defineEmits<{
  update: [address: Address];
}>();

const formData = reactive<Address>({ ...props.address });
const errors = reactive<Record<string, string>>({});

const validateForm = async () => {
  try {
    const validatedData = await addressSchema.parseAsync(formData);
    // Clear any previous errors
    Object.keys(errors).forEach((key) => delete errors[key]);
    emit('update', validatedData);
  } catch (error) {
    if (error instanceof ZodError) {
      // Clear previous errors
      Object.keys(errors).forEach((key) => delete errors[key]);
      // Set new errors
      error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
    }
  }
};

onMounted(() => {
  Object.assign(formData, props.address);
});

// Debounced validation to avoid too many validations while typing
const debouncedValidation = useDebounceFn(validateForm, 300);

watch(
  formData,
  () => {
    debouncedValidation();
  },
  { deep: true },
);
</script>

<template>
  <form class="space-y-4" @submit.prevent>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label class="block text-sm font-medium text-gray-700">First Name</label>
        <input
          v-model="formData.firstName"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          :class="{ 'border-red-500': errors.firstName }"
        />
        <p v-if="errors.firstName" class="mt-1 text-sm text-red-600">{{ errors.firstName }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Last Name</label>
        <input
          v-model="formData.lastName"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          :class="{ 'border-red-500': errors.lastName }"
        />
        <p v-if="errors.lastName" class="mt-1 text-sm text-red-600">{{ errors.lastName }}</p>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Email</label>
      <input
        v-model="formData.email"
        type="email"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.email }"
      />
      <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Phone</label>
      <input
        v-model="formData.phone"
        type="tel"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.phone }"
      />
      <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Street Address</label>
      <input
        v-model="formData.street"
        type="text"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        :class="{ 'border-red-500': errors.street }"
      />
      <p v-if="errors.street" class="mt-1 text-sm text-red-600">{{ errors.street }}</p>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div>
        <label class="block text-sm font-medium text-gray-700">City</label>
        <input
          v-model="formData.city"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          :class="{ 'border-red-500': errors.city }"
        />
        <p v-if="errors.city" class="mt-1 text-sm text-red-600">{{ errors.city }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Postal Code</label>
        <input
          v-model="formData.postalCode"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          :class="{ 'border-red-500': errors.postalCode }"
        />
        <p v-if="errors.postalCode" class="mt-1 text-sm text-red-600">{{ errors.postalCode }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Country</label>
        <input
          v-model="formData.country"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          :class="{ 'border-red-500': errors.country }"
        />
        <p v-if="errors.country" class="mt-1 text-sm text-red-600">{{ errors.country }}</p>
      </div>
    </div>
  </form>
</template>
