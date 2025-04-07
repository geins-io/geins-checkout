<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';
import { useFormField } from './useFormField';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();

const { formDescriptionId } = useFormField();
</script>

<template>
  <p :id="formDescriptionId" :class="cn('pl-1 text-[0.7rem] text-card-foreground/80', props.class)">
    <slot />
  </p>
</template>
