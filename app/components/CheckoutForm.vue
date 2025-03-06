<script setup lang="ts">
import type { CheckoutFormType } from '#shared/types';
import { useDebounceFn } from '@vueuse/core';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { vAutoAnimate } from '@formkit/auto-animate/vue';
import * as z from 'zod';

const _props = defineProps<{
  data: CheckoutFormType;
  onlyAddress?: boolean;
  hideMessageInput?: boolean;
}>();

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email('Invalid email address'),
    address: z.object({
      phone: z.string().min(1, 'Phone number is required'),
      company: z.string().optional(),
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      careOf: z.string().optional(),
      addressLine1: z.string().min(1, 'Street address is required'),
      zip: z.string().min(1, 'Zip code is required'),
      city: z.string().min(1, 'City is required'),
    }),
    message: z.string().optional(),
  }),
);
const form = useForm({
  validationSchema: formSchema,
});

watch(
  form.values,
  useDebounceFn(() => {
    emit('update', form.values as CheckoutFormType);
  }),
);

const emit = defineEmits<{
  update: [data: CheckoutFormType];
}>();

const onSubmit = form.handleSubmit((values) => {
  console.log('Form submitted!', values);
});
</script>

<template>
  <form @submit="onSubmit">
    <div v-if="!onlyAddress" class="grid grid-cols-1 md:grid-cols-2 md:gap-4">
      <FormField v-slot="{ componentField }" name="email">
        <FormItem v-auto-animate>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input v-bind="componentField" type="email" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="address.phone">
        <FormItem v-auto-animate>
          <FormLabel>Phone</FormLabel>
          <FormControl>
            <Input v-bind="componentField" type="tel" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 md:gap-4">
      <FormField v-slot="{ componentField }" name="address.firstName">
        <FormItem v-auto-animate>
          <FormLabel>First Name</FormLabel>
          <FormControl>
            <Input v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="address.lastName">
        <FormItem v-auto-animate>
          <FormLabel>Last Name</FormLabel>
          <FormControl>
            <Input v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <FormField v-slot="{ componentField }" name="address.careOf">
      <FormItem v-auto-animate>
        <FormLabel>C/O <span class="text-card-foreground/60">(optional)</span></FormLabel>
        <FormControl>
          <Input v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="address.addressLine1">
      <FormItem v-auto-animate>
        <FormLabel>Street Address</FormLabel>
        <FormControl>
          <Input v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="grid grid-cols-1 md:grid-cols-2 md:gap-4">
      <FormField v-slot="{ componentField }" name="address.zip">
        <FormItem v-auto-animate>
          <FormLabel>Postal Code</FormLabel>
          <FormControl>
            <Input v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="address.city">
        <FormItem v-auto-animate>
          <FormLabel>City</FormLabel>
          <FormControl>
            <Input v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>
    <FormField v-if="!onlyAddress && !hideMessageInput" v-slot="{ componentField }" name="message">
      <FormItem v-auto-animate>
        <FormLabel>Message <span class="text-card-foreground/60">(optional)</span></FormLabel>
        <FormControl>
          <Textarea v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </form>
</template>
