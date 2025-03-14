<script setup lang="ts">
import type { CheckoutFormType } from '#shared/types';
import { useDebounceFn } from '@vueuse/core';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
const { vatIncluded } = usePrice();

const _props = defineProps<{
  data: CheckoutFormType;
  onlyAddress?: boolean;
  hideMessageInput?: boolean;
}>();

const identityNumberSchema = !vatIncluded.value
  ? z.string().min(1, 'Identity number is required')
  : z.string().optional();
const companyNameSchema = !vatIncluded.value
  ? z.string().min(1, 'Company name is required')
  : z.string().optional();

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email('Invalid email address'),
    identityNumber: identityNumberSchema,
    address: z.object({
      phone: z.string().min(1, 'Phone number is required'),
      company: companyNameSchema,
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      careOf: z.string().optional(),
      addressLine1: z.string().min(1, 'Street address is required'),
      zip: z.string().min(1, 'Zip code is required'),
      city: z.string().min(1, 'City is required'),
      country: z.string().optional(),
    }),
    message: z.string().optional(),
  }),
);
const form = useForm({
  validationSchema: formSchema,
});

const formValid = computed(() => form.meta.value.valid);
const formTouched = computed(() => form.meta.value.touched);

const emit = defineEmits<{
  update: [data: CheckoutFormUpdateEvent];
}>();

watch(
  form.values,
  useDebounceFn(async () => {
    emit('update', {
      valid: formValid.value,
      touched: formTouched.value,
      values: form.values as CheckoutFormType,
    });
  }),
);

const onSubmit = form.handleSubmit((values) => {
  console.log('Form submitted!', values);
});
</script>

<template>
  <form class="space-y-2" @submit.prevent="onSubmit">
    <div v-if="!onlyAddress" class="grid grid-cols-1 md:grid-cols-2 md:gap-4">
      <FormField
        v-slot="{ componentField }"
        name="email"
        :validate-on-change="false"
        :validate-on-input="false"
        :validate-on-model-update="false"
      >
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
    <FormField v-if="!vatIncluded" v-slot="{ componentField }" name="identityNumber">
      <FormItem v-auto-animate>
        <FormLabel>Organization Number</FormLabel>
        <FormControl>
          <Input v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-if="!vatIncluded" v-slot="{ componentField }" name="address.company">
      <FormItem v-auto-animate>
        <FormLabel>Company</FormLabel>
        <FormControl>
          <Input v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
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
