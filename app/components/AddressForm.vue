<script setup lang="ts">
import { reactive, watch, onMounted } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import type { Address } from '#shared/types';
import { addressSchema } from '#shared/types';
import { ZodError } from 'zod';

const props = defineProps<{
  address: Address;
  onlyAddress?: boolean;
}>();

const emit = defineEmits<{
  update: [address: Address];
}>();

const formData = reactive<Address>({ ...props.address });
const errors = reactive<Record<string, string>>({});

const validateForm = async () => {
  try {
    const validatedData = await addressSchema.parseAsync(formData);
    Object.keys(errors).forEach((key) => delete errors[key]);
    emit('update', validatedData);
  } catch (error) {
    if (error instanceof ZodError) {
      Object.keys(errors).forEach((key) => delete errors[key]);
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
  <Form @submit.prevent>
    <div v-if="!onlyAddress" class="grid grid-cols-1 md:grid-cols-2 md:gap-4">
      <FormField name="email">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input v-model="formData.email" type="email" :error="!!errors.email" />
          </FormControl>
          <FormMessage v-if="errors.email">
            {{ errors.email }}
          </FormMessage>
        </FormItem>
      </FormField>

      <FormField name="phone">
        <FormItem>
          <FormLabel>Phone</FormLabel>
          <FormControl>
            <Input v-model="formData.phone" type="tel" :error="!!errors.phone" />
          </FormControl>
          <FormMessage v-if="errors.phone">
            {{ errors.phone }}
          </FormMessage>
        </FormItem>
      </FormField>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 md:gap-4">
      <FormField name="firstName">
        <FormItem>
          <FormLabel>First Name</FormLabel>
          <FormControl>
            <Input v-model="formData.firstName" :error="!!errors.firstName" />
          </FormControl>
          <FormMessage v-if="errors.firstName">
            {{ errors.firstName }}
          </FormMessage>
        </FormItem>
      </FormField>

      <FormField name="lastName">
        <FormItem>
          <FormLabel>Last Name</FormLabel>
          <FormControl>
            <Input v-model="formData.lastName" :error="!!errors.lastName" />
          </FormControl>
          <FormMessage v-if="errors.lastName">
            {{ errors.lastName }}
          </FormMessage>
        </FormItem>
      </FormField>
    </div>

    <FormField name="careOf">
      <FormItem>
        <FormLabel>C/O <span class="text-card-foreground/60">(optional)</span></FormLabel>
        <FormControl>
          <Input v-model="formData.careOf" />
        </FormControl>
        <FormMessage v-if="errors.careOf">
          {{ errors.careOf }}
        </FormMessage>
      </FormItem>
    </FormField>

    <FormField name="street">
      <FormItem>
        <FormLabel>Street Address</FormLabel>
        <FormControl>
          <Input v-model="formData.street" :error="!!errors.street" />
        </FormControl>
        <FormMessage v-if="errors.street">
          {{ errors.street }}
        </FormMessage>
      </FormItem>
    </FormField>

    <div class="grid grid-cols-1 md:grid-cols-2 md:gap-4">
      <FormField name="postalCode">
        <FormItem>
          <FormLabel>Postal Code</FormLabel>
          <FormControl>
            <Input v-model="formData.postalCode" :error="!!errors.postalCode" />
          </FormControl>
          <FormMessage v-if="errors.postalCode">
            {{ errors.postalCode }}
          </FormMessage>
        </FormItem>
      </FormField>
      <FormField name="city">
        <FormItem>
          <FormLabel>City</FormLabel>
          <FormControl>
            <Input v-model="formData.city" :error="!!errors.city" />
          </FormControl>
          <FormMessage v-if="errors.city">
            {{ errors.city }}
          </FormMessage>
        </FormItem>
      </FormField>
    </div>
  </Form>
</template>
