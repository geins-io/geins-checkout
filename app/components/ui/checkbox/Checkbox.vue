<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from 'reka-ui';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-vue-next';
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from 'reka-ui';
import { computed, type HTMLAttributes } from 'vue';

const props = defineProps<CheckboxRootProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<CheckboxRootEmits>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <CheckboxRoot
    v-bind="forwarded"
    :class="
      cn(
        'peer size-5 shrink-0 rounded-sm shadow-sm border border-border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=checked]:text-accent-foreground',
        props.class,
      )
    "
  >
    <CheckboxIndicator class="flex h-full w-full items-center justify-center text-current">
      <slot>
        <Check class="size-4" />
      </slot>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
