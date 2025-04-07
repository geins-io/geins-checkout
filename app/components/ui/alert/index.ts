import { cva, type VariantProps } from 'class-variance-authority';

export { default as Alert } from './Alert.vue';
export { default as AlertDescription } from './AlertDescription.vue';
export { default as AlertTitle } from './AlertTitle.vue';

export const alertVariants = cva(
  'relative w-full rounded-lg border-l-4 p-4 shadow-md [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-3 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 [&>svg]:text-foreground [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        error: 'border-l-error bg-error/5 dark:border-error [&>svg]:text-error',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type AlertVariants = VariantProps<typeof alertVariants>;
