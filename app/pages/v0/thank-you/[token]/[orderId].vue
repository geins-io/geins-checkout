<script setup lang="ts">
import { ExternalSnippetType } from '#shared/types';
const { urls } = useCheckoutToken();
const { orderSummary, summaryOrderId, initializeSummary } = useSummary();
const { hasExternalSnippet } = useExternalSnippet();
const { cart } = useCheckout();
const { query, params } = useRoute();
const orderId = params.orderId?.toString() || '';

if (!orderId) {
  navigateTo('/');
}

await initializeSummary(orderId, query);
</script>

<template>
  <div>
    <NuxtLayout name="confirm">
      <template #summary>
        <Card class="mx-auto w-full max-w-3xl">
          <CardContent>
            <ExternalSnippet v-if="hasExternalSnippet" :type="ExternalSnippetType.Summary" />
            <div v-else-if="orderSummary" class="flex flex-col items-center lg:p-6 lg:pb-3">
              <p class="mt-2 text-center text-xs font-light uppercase text-card-foreground lg:text-sm">
                {{ $t('order_number') }}:
                <span class="inline-block rounded-lg bg-background px-2 py-1 font-bold text-foreground">
                  #{{ summaryOrderId }}
                </span>
              </p>
              <h1 class="mb-6 text-center text-xl font-bold lg:mb-8 lg:text-3xl">
                {{ $t('confirmation_page_title') }} ✨
              </h1>
              <p
                class="text-md mx-auto mb-8 max-w-sm text-center font-light text-card-foreground/80 lg:mb-12 lg:text-lg"
              >
                {{ $t('confirmation_page_text') }}
              </p>
              <Button
                v-if="urls?.continue"
                as-child
                variant="outline"
                class="inline-flex items-center border-foreground/60 hover:border-foreground/20 hover:bg-transparent hover:text-foreground md:hidden"
              >
                <a :href="urls.continue">
                  {{ $t('continue_shopping') }}
                  <LucideArrowRight />
                </a>
              </Button>
              <CartSummary v-if="cart?.summary" :summary="cart.summary" class="mt-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </template>
      <template #cart>
        <Cart v-if="cart" :cart="cart" />
      </template>
    </NuxtLayout>
  </div>
</template>
