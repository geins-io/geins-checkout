<script setup lang="ts">
import type { CartItemType, CartType } from '@geins/types'



const props = defineProps<{
  cart: CartType
}>()



const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
  return ''
}
const imgUrl = (item: CartItemType): string => {
  if (!item.product?.productImages) return ''

  if (item.product?.productImages.length > 0) {
    return `https://labs.commerce.services/product/raw/${item.product?.productImages[0].fileName || ''}`
  }
}




</script>

<template>
  <div class="space-y-6">
    <!-- Cart Items -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Cart Items</h3>
      <div v-for="item in cart.items" :key="item.id" class="flex gap-4 py-4 border-b">
        <!-- Product Image -->
        <div v-if="item.product?.productImages" class="w-20 h-20 flex-shrink-0">
          <img :src="imgUrl(item)" class="w-full h-full object-cover rounded" />
        </div>

        <!-- Product Details -->
        <div class="flex-grow">
          <h4 class="font-medium">{{ item.title }}</h4>

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
            <span>{{ item.quantity }} × {{ item.unitPrice?.regularPriceIncVatFormatted }}</span>
            <span class="font-medium">{{ item.totalPrice?.regularPriceIncVatFormatted }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Totals -->
    <div class="space-y-4">
      <h3 class="text-lg font-medium">Order Summary</h3>

      <!-- Subtotal -->
      <div class="flex justify-between">
        <span>Subtotal</span>
        <span>{{ cart.summary.subTotal.regularPriceIncVatFormatted }}</span>
      </div>

      <!-- VAT -->
      <!--       <div v-for="vat in cart.totals.vat" :key="vat.rate" class="flex justify-between text-sm text-gray-600">
        <span>VAT ({{ vat.rate }}%)</span>
        <span>{{ formatPrice(vat.amount) }}</span>
      </div> -->
      <div class="flex justify-between text-sm text-gray-600">
        <span>VAT (X<!-- {{ cart.summary.subTotal.vat / cart.summary.subTotal.regularPriceIncVat }} -->%)</span>
        <span>{{ cart.summary.subTotal.vatFormatted }}</span>
      </div>

      <!-- Shipping -->
      <div class="flex justify-between">
        <span>Shipping</span>
        <span>{{ cart.summary.shipping.feeIncVatFormatted }}</span>
      </div>

      <!-- Payment Fee -->
      <!--       <div v-if="cart.totals.paymentFee > 0" class="flex justify-between">
        <span>Payment Fee</span>
        <span>{{ formatPrice(cart.totals.paymentFee) }}</span>
      </div>
 -->
      <!-- Discounts -->
      <div class="flex justify-between text-green-600">
        <ul v-if="Array.isArray(cart.appliedCampaigns)">
          <li v-for="campaign in cart.appliedCampaigns" :key="campaign.name">
            {{ campaign.name }}
          </li>
        </ul>
        <span>-{{ cart.summary.total.discountIncVatFormatted }}</span>
      </div>

      <!-- Total -->
      <div class="flex justify-between text-lg font-bold pt-4 border-t">
        <span>Total</span>
        <span>{{ cart.summary.total.sellingPriceIncVatFormatted }}</span>
      </div>
    </div>
  </div>
</template>
