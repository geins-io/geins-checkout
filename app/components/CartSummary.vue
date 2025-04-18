<script setup lang="ts">
import type { CartSummaryType } from '@geins/types';
const props = defineProps<{
  summary: CartSummaryType;
  simple?: boolean;
  display?: boolean;
}>();

const { vatIncluded, getRegularPrice, getSellingPrice } = usePrice();
const freeShipping = computed(() => props.summary.shipping.feeIncVat === 0);
const showDetails = ref(false);
</script>
<template>
  <div v-auto-animate>
    <div class="flex w-full flex-col items-end py-1 text-xl lg:text-2xl">
      <div class="flex w-full items-end justify-between font-bold">
        <span>{{ $t('cart_summary_total') }}</span>
        <span
          class="mb-1 ml-2 mr-auto text-[0.7rem] font-normal leading-[0.8rem] text-card-foreground/80 lg:text-xs"
          >{{ $t('cart_summary_inc_vat_and_shipping') }}</span
        >
        <span>{{ summary.total.sellingPriceIncVatFormatted }}</span>
      </div>
      <button class="text-xs text-card-foreground/80 underline" @click="showDetails = !showDetails">
        {{ showDetails ? $t('hide_details') : $t('show_details') }}
      </button>
    </div>
    <div v-if="showDetails" class="mt-2 w-full space-y-0.5 rounded-lg border bg-background/10 p-4 text-sm">
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
      <div v-if="!vatIncluded" class="flex justify-between py-1">
        <span class="font-semibold">{{ $t('cart_summary_vat') }}</span>
        <span>{{ summary.total.vatFormatted }}</span>
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
      <div class="flex justify-between py-1 text-lg font-bold">
        <span>{{ $t('cart_summary_total') }}</span>
        <span>{{ summary.total.sellingPriceIncVatFormatted }}</span>
      </div>
    </div>
  </div>
</template>
