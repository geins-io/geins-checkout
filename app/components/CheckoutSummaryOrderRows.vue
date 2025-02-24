<script setup lang="ts">
import type { CheckoutOrderRowSummary } from '@geins/types';

const props = defineProps<{
  order: CheckoutOrderSummary;
}>();

const imgUrl = (item: CheckoutOrderRowSummary): string => {
  if (!item.product?.imageUrl) return '';

  return `https://labs.commerce.services/product/raw/${item.product.imageUrl}`;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Cart Items -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Items</h3>
      <div v-for="item in order.rows" :key="item.skuId" class="flex gap-4 border-b py-4">
        <!-- Product Image -->
        <div v-if="item.product?.imageUrl" class="size-20 shrink-0">
          <NuxtImg :src="imgUrl(item)" class="size-full rounded object-cover" />
        </div>

        <!-- Product Details -->
        <div class="grow">
          <h4 class="font-medium">
            {{ item.product.name }} <i>{{ item.name }}</i>
          </h4>

          <!-- Package Items -->
          <!--           <div v-if="item.isPackage && item.packageItems" class="mt-2 text-sm text-gray-600">
            <p class="font-medium">Package contents:</p>
            <ul class="list-disc list-inside">
              <li v-for="pkg in item.packageItems" :key="pkg.name">
                {{ pkg.name }} (x{{ pkg.quantity }})
              </li>
            </ul>
          </div> -->

          <!-- Message -->
          <p v-if="item.message" class="mt-1 text-sm text-gray-600">
            {{ item.message }}
          </p>

          <!-- Price Info -->
          <div class="mt-2 flex justify-between text-sm">
            <span>{{ item.quantity }} pcs</span>
            <span class="font-medium">{{ item.price?.priceIncVatFormatted }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Totals -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Order Summary</h3>

      <div v-if="order.appliedCampaigns?.length" class="flex justify-between text-green-600">
        <ul v-if="Array.isArray(order.appliedCampaigns)">
          <li v-for="campaign in order.appliedCampaigns" :key="campaign">
            {{ campaign }}
          </li>
        </ul>
        <span>-{{ order.total.discountIncVatFormatted }}</span>
      </div>

      <!-- Subtotal -->
      <div class="flex justify-between">
        <span>Subtotal</span>
        <span>{{ order.total.itemValueIncVatFormatted }}</span>
      </div>

      <!-- VAT -->
      <!--       <div v-for="vat in cart.totals.vat" :key="vat.rate" class="flex justify-between text-sm text-gray-600">
        <span>VAT ({{ vat.rate }}%)</span>
        <span>{{ formatPrice(vat.amount) }}</span>
      </div> -->
      <!--       <div class="flex justify-between text-sm text-gray-600">
        <span>VAT (X%)</span>
        <span>{{ orderSummary.summary.subTotal.vatFormatted }}</span>
      </div> -->

      <!-- Shipping -->
      <div class="flex justify-between">
        <span>Shipping</span>
        <span>{{ order.total.shippingFeeIncVatFormatted }}</span>
      </div>

      <!-- Payment Fee -->
      <!--       <div v-if="cart.totals.paymentFee > 0" class="flex justify-between">
        <span>Payment Fee</span>
        <span>{{ formatPrice(cart.totals.paymentFee) }}</span>
      </div>
 -->
      <!-- Discounts -->

      <!-- Total -->
      <div class="flex justify-between border-t pt-4 text-lg font-bold">
        <span>Total</span>
        <span>{{ order.total.sumFormatted }}</span>
      </div>
    </div>
  </div>
</template>
