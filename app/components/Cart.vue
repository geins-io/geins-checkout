<script setup lang="ts">
import type { CartItemType, CartType } from '@geins/types';
const { vatIncluded, getRegularPrice, getSellingPrice } = usePrice();

const props = defineProps<{
  cart: CartType;
}>();

const items = ref<CartItemType[]>(props.cart.items);
const { getProductImageUrl } = useCheckoutToken();

const firstItem = computed(() => items.value[0]);

const getImgUrl = (item?: CartItemType): string | undefined => {
  if (!item?.product?.productImages?.length) return '';
  const fileName = item?.product?.productImages?.[0]?.fileName;
  return getProductImageUrl(fileName) || undefined;
};
</script>
<template>
  <Card class="mx-auto w-full max-w-3xl">
    <CardContent v-if="cart?.items?.length">
      <!-- Single Item Cart -->
      <div v-if="items?.length === 1 && firstItem">
        <div class="flex flex-col gap-3 lg:gap-[2vh]">
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
                <span class="mx-2">×</span>
                <span v-if="firstItem?.unitPrice" class="flex flex-col text-sm">
                  <span :class="{ 'text-sale': firstItem.unitPrice?.isDiscounted }">
                    {{ getSellingPrice(firstItem.unitPrice) }}
                  </span>
                  <span
                    v-if="firstItem.unitPrice?.isDiscounted"
                    class="ml-2 text-[0.7rem] leading-[0.8rem] line-through"
                  >
                    {{ getRegularPrice(firstItem.unitPrice) }}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div
            v-if="firstItem.totalPrice"
            class="text-3xl text-card-foreground lg:mb-5 lg:text-[40px]"
            :class="{ 'text-sale': firstItem.totalPrice?.isDiscounted }"
          >
            {{ getSellingPrice(firstItem.totalPrice) }}
            <span v-if="!vatIncluded" class="text-sm text-card-foreground/80">
              {{ $t('ex_vat') }}
            </span>
          </div>
          <!-- Product Image -->
          <div class="relative mb-5 h-[45vh] w-full">
            <NuxtImg
              v-if="getImgUrl(firstItem)"
              :src="getImgUrl(firstItem)"
              :alt="firstItem.title"
              class="mx-auto h-full rounded-lg object-contain"
              sizes="80vw lg:40vw"
              densities="x1 x2"
            />
          </div>
        </div>
      </div>

      <!-- Multiple Items Cart -->
      <div v-else class="lg:py-4">
        <div class="lg:px-5">
          <div v-for="item in items" :key="item.id" class="flex border-b py-4 last:border-b-0">
            <!-- Product Image -->
            <div class="relative mr-4 h-24 shrink-0">
              <NuxtImg
                height="96px"
                :src="getImgUrl(item)"
                :alt="item.title"
                class="h-full rounded-lg object-contain shadow-md"
                densities="x1 x2"
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
                  <span v-if="item.unitPrice" class="flex text-xs lg:flex-col lg:text-sm">
                    <span :class="{ 'text-sale': item.unitPrice?.isDiscounted }">
                      {{ getSellingPrice(item.unitPrice) }}
                    </span>
                    <span
                      v-if="item.unitPrice?.isDiscounted"
                      class="ml-2 text-[0.7rem] line-through lg:leading-[0.8rem]"
                    >
                      {{ getRegularPrice(item.unitPrice) }}
                    </span>
                  </span>
                </div>
                <div
                  v-if="item.totalPrice"
                  class="text-lg lg:text-xl"
                  :class="{ 'text-sale': item.totalPrice?.isDiscounted }"
                >
                  {{ getSellingPrice(item.totalPrice) }}
                  <span v-if="!vatIncluded" class="text-[0.65rem] text-card-foreground/80">
                    {{ $t('ex_vat') }}
                  </span>
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
