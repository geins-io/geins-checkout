<script setup lang="ts">
import type { CartItemType, CartType } from '@geins/types';
const { vatIncluded, getRegularPrice, getSellingPrice } = usePrice();
const { getProductImageUrl } = useCheckoutToken();
const { cartEmpty } = useCheckout();

const props = defineProps<{
  cart: CartType;
}>();

const items = ref<CartItemType[]>(props.cart.items);
const firstItem = computed(() => items.value[0]);

const getImgUrl = (item?: CartItemType): string | undefined => {
  if (!item?.product?.productImages?.length) return '';
  const fileName = item?.product?.productImages?.[0]?.fileName;
  return getProductImageUrl(fileName) || undefined;
};

const getSkuName = (item: CartItemType): string => {
  const skuId = item?.skuId;
  const sku = item.product?.skus?.find((skuItem) => skuItem.skuId === skuId);
  const name = !sku?.name || sku?.name === '-' ? 'ONE SIZE' : sku.name;
  return name;
};
</script>
<template>
  <Card class="mx-auto w-full max-w-3xl">
    <CardContent v-if="!cartEmpty">
      <!-- Single Item Cart -->
      <div v-if="items?.length === 1 && firstItem">
        <div class="flex flex-col">
          <!-- Product Details -->
          <div class="flex justify-between">
            <div class="pr-2">
              <p class="md:text-md text-sm font-bold uppercase text-card-foreground/80">
                {{ firstItem.product?.brand?.name }}
              </p>
              <h3 class="text-2xl font-thin lg:mb-2 lg:text-[3.1vh] lg:leading-[3.1vh]">
                {{ firstItem.title }}
              </h3>
            </div>
            <div class="flex flex-col justify-end">
              <div
                class="mb-auto self-end rounded-lg bg-background px-2 py-0.5 text-[0.7rem] text-foreground md:text-xs"
              >
                {{ getSkuName(firstItem) }}
              </div>
              <div
                :class="
                  cn(
                    'mb-0.5 flex items-center justify-end text-xs text-card-foreground/65',
                    `${!firstItem.unitPrice?.isDiscounted ? 'lg:mb-2' : ''}`,
                  )
                "
              >
                <span class="text-sm">{{ firstItem.quantity }}</span>
                <span class="mx-2">×</span>
                <span v-if="firstItem?.unitPrice" class="flex flex-col text-sm">
                  <span :class="`${firstItem.unitPrice?.isDiscounted ? 'text-sale' : ''}`">
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
            class="mt-[1vh] text-3xl text-card-foreground lg:text-[3.5vh] lg:leading-[3.5vh]"
            :class="{ 'text-sale': firstItem.totalPrice?.isDiscounted }"
          >
            {{ getSellingPrice(firstItem.totalPrice) }}
            <span v-if="!vatIncluded" class="text-sm text-card-foreground/80">
              {{ $t('ex_vat') }}
            </span>
          </div>
          <!-- Product Image -->
          <div class="relative mb-[1vh] mt-[3vh] h-[45vh] w-full">
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
            <div class="flex w-full flex-col pt-1">
              <div class="mb-2 lg:mb-1">
                <p class="text-[0.65rem] font-bold uppercase text-card-foreground/80 lg:text-xs">
                  {{ item.product?.brand?.name }}
                </p>
                <h3 class="mb-0.5 text-lg font-thin leading-5 lg:mb-1 lg:text-xl">{{ item.title }}</h3>
                <div
                  class="inline-block rounded-lg bg-background px-2 py-0.5 text-[0.7rem] text-foreground md:text-xs"
                >
                  {{ getSkuName(item) }}
                </div>
              </div>
              <div class="w-full items-center justify-between lg:flex">
                <div class="flex items-center text-xs text-card-foreground/65">
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
    <CardContent v-else>
      <div class="flex h-[20vh] items-center justify-center">
        <div class="text-center">
          <p class="text-2xl font-bold text-card-foreground">{{ $t('cart_empty') }}</p>
          <p class="mt-2 text-sm text-card-foreground/60">{{ $t('cart_empty_desc') }}</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
