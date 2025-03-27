<script setup lang="ts">
import type { CheckoutFormType } from '#shared/types';
import { useDebounceFn } from '@vueuse/core';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
const { vatIncluded } = usePrice();
const { t } = useI18n();

const props = defineProps<{
  data: CheckoutFormType;
  onlyAddress?: boolean;
  hideMessageInput?: boolean;
}>();

const emailSchema = props.onlyAddress ? z.string().optional() : z.string().email(t('form_validation_email'));
const phoneSchema = props.onlyAddress
  ? z.string().optional()
  : z.string().min(1, t('form_validation_phone_required'));
const identityNumberSchema =
  !vatIncluded.value && !props.onlyAddress
    ? z.string().min(1, t('form_validation_identity_number_required'))
    : z.string().optional();

const companyNameSchema = !vatIncluded.value
  ? z.string().min(1, t('form_validation_company_required'))
  : z.string().optional();

const formSchema = toTypedSchema(
  z.object({
    email: emailSchema,
    identityNumber: identityNumberSchema,
    address: z.object({
      phone: phoneSchema,
      company: companyNameSchema,
      firstName: z.string().min(1, t('form_validation_first_name_required')),
      lastName: z.string().min(1, t('form_validation_last_name_required')),
      careOf: z.string().optional(),
      addressLine1: z.string().min(1, t('form_validation_street_address_required')),
      zip: z.string().min(1, t('form_validation_zip_required')),
      city: z.string().min(1, t('form_validation_city_required')),
      country: z.string().optional(),
    }),
    message: z.string().optional(),
  }),
);

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    address: {
      country: props.data.address?.country || '',
    },
  },
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
          <FormLabel>{{ $t('form_label_email') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField" type="email" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="address.phone">
        <FormItem v-auto-animate>
          <FormLabel>{{ $t('form_label_phone') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField" type="tel" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>
    <FormField v-if="!vatIncluded && !onlyAddress" v-slot="{ componentField }" name="identityNumber">
      <FormItem v-auto-animate>
        <FormLabel>{{ $t('form_label_org_nr') }}</FormLabel>
        <FormControl>
          <Input v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-if="!vatIncluded" v-slot="{ componentField }" name="address.company">
      <FormItem v-auto-animate>
        <FormLabel>{{ $t('form_label_company') }}</FormLabel>
        <FormControl>
          <Input v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-if="onlyAddress" v-slot="{ componentField }" name="address.phone">
      <FormItem v-auto-animate>
        <FormLabel>{{ $t('form_label_phone') }}</FormLabel>
        <FormControl>
          <Input v-bind="componentField" type="tel" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <div class="grid grid-cols-1 md:grid-cols-2 md:gap-4">
      <FormField v-slot="{ componentField }" name="address.firstName">
        <FormItem v-auto-animate>
          <FormLabel>{{ $t('form_label_first_name') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="address.lastName">
        <FormItem v-auto-animate>
          <FormLabel>{{ $t('form_label_last_name') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <FormField v-slot="{ componentField }" name="address.careOf">
      <FormItem v-auto-animate>
        <FormLabel>
          {{ $t('form_label_care_of') }}
          <span class="text-card-foreground/60">({{ $t('form_label_optional') }})</span>
        </FormLabel>
        <FormControl>
          <Input v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="address.addressLine1">
      <FormItem v-auto-animate>
        <FormLabel>{{ $t('form_label_street_address') }}</FormLabel>
        <FormControl>
          <Input v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="grid grid-cols-1 md:grid-cols-2 md:gap-4">
      <FormField v-slot="{ componentField }" name="address.zip">
        <FormItem v-auto-animate>
          <FormLabel>{{ $t('form_label_zip') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="address.city">
        <FormItem v-auto-animate>
          <FormLabel>{{ $t('form_label_city') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>
    <FormField v-if="!onlyAddress && !hideMessageInput" v-slot="{ componentField }" name="message">
      <FormItem v-auto-animate>
        <FormLabel>
          {{ $t('form_label_message') }}
          <span class="text-card-foreground/60">({{ $t('form_label_optional') }})</span>
        </FormLabel>
        <FormControl>
          <Textarea v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </form>
</template>
