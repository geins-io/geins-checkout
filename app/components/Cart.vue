<script setup lang="ts">
import type { CartItemType, CartType } from '@geins/types';

const props = defineProps<{
  cart: CartType;
}>();

const items = ref<CartItemType[]>(props.cart.items);
const { imgBaseUrl } = useCheckoutToken();

// Promo code functionality
const promoCode = ref('');
const promoMessage = ref('');

// Computed properties
const totalItems = computed(() => {
  return items.value.reduce((total, item) => total + item.quantity, 0);
});

const firstItem = computed(() => items.value[0]);

const getImgUrl = (item?: CartItemType): string => {
  if (!item?.product?.productImages) return '';

  if (item.product?.productImages.length > 0) {
    return `${imgBaseUrl.value}${item?.product?.productImages?.[0]?.fileName ?? ''}`;
  }
  return '';
};
</script>
<template>
  <Card>
    <CardContent>
      <!-- Single Item Cart -->
      <div v-if="items.length === 1 && firstItem">
        <div class="flex flex-col gap-3 lg:gap-6">
          <!-- Product Details -->
          <div class="flex justify-between">
            <div>
              <p class="text-md font-bold uppercase text-card-foreground/80">
                {{ firstItem.product?.brand?.name }}
              </p>
              <h3 class="pr-2 text-lg font-thin lg:text-4xl">{{ firstItem.title }}</h3>
            </div>
            <div class="flex flex-col justify-end">
              <div class="mb-1 flex items-center justify-end text-xs text-card-foreground/65">
                <span class="text-sm">{{ firstItem.quantity }}</span>
                <span class="mx-3">×</span>
                <span class="text-sm">{{ firstItem.unitPrice?.regularPriceIncVatFormatted }}</span>
              </div>
            </div>
          </div>
          <div class="text-3xl text-card-foreground lg:mb-5 lg:text-[40px]">
            {{ firstItem.totalPrice?.regularPriceIncVatFormatted }}
          </div>
          <!-- Product Image -->
          <div class="relative mb-5 h-[45vh] w-full">
            <NuxtImg
              :src="getImgUrl(firstItem)"
              :alt="firstItem.title"
              class="mx-auto h-full rounded-lg border object-contain"
            />
          </div>
        </div>
      </div>

      <!-- Multiple Items Cart -->
      <div v-else class="lg:py-4">
        <div class="max-h-[400px] overflow-y-auto lg:px-5">
          <div v-for="item in items" :key="item.id" class="flex border-b py-4 last:border-b-0">
            <!-- Product Image -->
            <div class="relative mr-4 h-24 shrink-0">
              <NuxtImg
                height="96px"
                :src="getImgUrl(item)"
                :alt="item.title"
                class="h-full rounded-lg border object-contain"
              />
            </div>

            <!-- Product Details -->
            <div class="flex w-full flex-col pt-1 lg:gap-2">
              <div>
                <p class="text-[0.65rem] font-bold uppercase text-card-foreground/80 lg:text-xs">
                  {{ item.product?.brand?.name }}
                </p>
                <h3 class="mb-1 text-lg font-thin lg:text-xl">{{ item.title }}</h3>
              </div>
              <div class="w-full items-center justify-between lg:flex">
                <div class="flex items-center text-xs text-card-foreground/65 lg:mb-1">
                  <span class="text-xs lg:text-sm">{{ item.quantity }}</span>
                  <span class="mx-1 lg:mx-3">×</span>
                  <span class="text-xs lg:text-sm">{{ item.unitPrice?.regularPriceIncVatFormatted }}</span>
                </div>
                <div class="text-lg lg:text-xl">
                  {{ item.totalPrice?.regularPriceIncVatFormatted }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<style></style>
