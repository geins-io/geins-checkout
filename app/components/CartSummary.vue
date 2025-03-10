<script setup lang="ts">
import type { CartSummaryType } from '@geins/types';
const props = defineProps<{
  summary: CartSummaryType;
  simple?: boolean;
  display?: boolean;
}>();

const { vatIncluded, getRegularPrice, getSellingPrice } = usePrice();

const freeShipping = computed(() => props.summary.shipping.feeIncVat === 0);
</script>
<template>
  <div class="space-y-2">
    <div v-if="summary.total.isDiscounted && !simple" class="flex justify-between py-1">
      <span class="font-semibold">{{ $t('cart_summary_regular_price') }}</span>
      <span>{{ getRegularPrice(summary.subTotal) }}</span>
    </div>
    <div v-if="summary.total.isDiscounted && !simple" class="flex justify-between py-1 text-sale">
      <span class="font-semibold">{{ $t('cart_summary_discount') }}</span>
      <span
        >-{{
          vatIncluded ? summary.total.discountIncVatFormatted : summary.total.discountExVatFormatted
        }}</span
      >
    </div>
    <div class="flex justify-between py-1">
      <span class="font-semibold">{{ $t('cart_summary_subtotal') }}</span>
      <span>{{ getSellingPrice(summary.subTotal) }}</span>
    </div>
    <div v-if="!vatIncluded" class="flex justify-between py-1">
      <span class="font-semibold">{{ $t('cart_summary_vat') }}</span>
      <span>{{ summary.total.vatFormatted }}</span>
    </div>
    <div class="flex justify-between py-1">
      <span class="font-semibold">
        {{
          summary.shipping.isDefault && summary.shipping.amountLeftToFreeShipping !== 0
            ? $t('cart_summary_estimated_shipping_fee')
            : $t('cart_summary_shipping_fee')
        }}
      </span>
      <span :class="{ 'font-bold': freeShipping }">
        {{
          freeShipping
            ? $t('free_shipping')
            : vatIncluded
              ? summary.shipping.feeIncVatFormatted
              : summary.shipping.feeExVatFormatted
        }}
      </span>
    </div>
    <div
      v-if="!freeShipping && !display && summary.shipping.amountLeftToFreeShipping !== -1"
      class="text-right text-xs"
    >
      <span class="font-bold">{{ summary.shipping.amountLeftToFreeShippingFormatted }}</span>
      {{ $t('cart_summary_left_to_free_shipping') }}
    </div>
    <div v-if="summary.balance.pending > 0" class="py-1">
      <div class="flex justify-between font-bold">
        <span>{{ $t('cart_summary_total_ex_balance') }}</span>
        <span>{{ summary.balance.totalSellingPriceExBalanceIncVatFormatted }}</span>
      </div>
      <div class="flex justify-between py-1">
        <span class="font-semibold">{{ $t('cart_summary_balance') }}</span>
        <span>-{{ summary.balance.pendingFormatted }}</span>
      </div>
    </div>
    <div class="flex justify-between py-1 font-bold">
      <span>{{ $t('cart_summary_total') }}</span>
      <span>{{ summary.total.sellingPriceIncVatFormatted }}</span>
    </div>
  </div>
</template>
