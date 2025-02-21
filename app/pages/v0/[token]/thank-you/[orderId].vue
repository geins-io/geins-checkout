<script setup lang="ts">
import { useRoute } from 'vue-router';
import type { CheckoutOrderSummary } from '#shared/types';

const { state, initializeSummary } = useSummary();

const route = useRoute();
const router = useRouter();
const token = route.params.token as string;
const orderId = route.params.orderId as string;
const querystrings = route.query;
const orderDetails = ref<CheckoutOrderSummary | null>(null);
const externalSummaryHTML = ref<string | undefined>(undefined);

onMounted(async () => {
  if (!token) {
    router.push('/');
    return;
  }

  if (!orderId) {
    router.push('/');
    return;
  }

  const summary = await initializeSummary(token, orderId, querystrings);
  console.log('Summary', summary.htmlSnippet);
  if (summary.htmlSnippet) {
    externalSummaryHTML.value = summary.htmlSnippet;
  } else {
    orderDetails.value = summary.order;
  }
});
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div class="overflow-hidden rounded-lg bg-white shadow">
        <!-- Order Confirmation Header -->
        <div class="bg-blue-600 px-6 py-8 text-white">
          <div class="flex items-center justify-center">
            <div class="text-center">
              <h1 class="text-3xl font-bold">Thank you for your order!</h1>
              <p class="mt-2 text-blue-100">Order #{{ orderDetails?.orderId }}</p>
            </div>
          </div>
        </div>
        <div class="px-6 py-8">
          <ExternalSummary :html="externalSummaryHTML" />
        </div>
        <div v-if="!state.loading && !state.isExternalSummary" class="px-6 py-8">
          <!-- Order Status -->
          <!--           <div class="mb-8">
            <h2 class="mb-2 text-lg font-semibold">Order Status</h2>
            <p class="text-gray-600">Status: {{ orderDetails?.status || 'Processing' }}</p>
            <h1>CR Action: {{ orderId }}</h1>
            <p v-for="(value, key) in querystrings" :key="key">{{ key }}: {{ value }}</p>
          </div> -->

          <!-- Addresses -->
          <div v-if="orderDetails?.billingAddress" class="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            <!-- Billing Address -->
            <div>
              <h2 class="mb-2 text-lg font-semibold">Billing Address</h2>
              <div class="rounded-lg border p-4">
                <p>
                  {{ orderDetails?.billingAddress?.firstName }}
                  {{ orderDetails?.billingAddress?.lastName }}
                </p>
                <p>{{ orderDetails?.billingAddress?.addressLine1 }}</p>
                <p v-if="orderDetails?.billingAddress?.addressLine2">
                  {{ orderDetails?.billingAddress?.addressLine2 }}
                </p>
                <p>
                  {{ orderDetails?.billingAddress?.city }},
                  {{ orderDetails?.billingAddress?.zip }}
                </p>
                <p>{{ orderDetails?.billingAddress?.country }}</p>
                <p v-if="orderDetails?.billingAddress?.mobile" class="mt-2">
                  {{ orderDetails?.billingAddress?.mobile }}
                </p>
                <p v-if="orderDetails?.billingAddress?.phone">
                  {{ orderDetails?.billingAddress?.phone }}
                </p>
              </div>
            </div>

            <!-- Shipping Address -->
            <div>
              <h2 class="mb-2 text-lg font-semibold">Shipping Address</h2>
              <div class="rounded-lg border p-4">
                <p>
                  {{ orderDetails?.shippingAddress?.firstName }}
                  {{ orderDetails?.shippingAddress?.lastName }}
                </p>
                <p>{{ orderDetails?.shippingAddress?.addressLine1 }}</p>
                <p v-if="orderDetails?.shippingAddress?.addressLine2">
                  {{ orderDetails?.shippingAddress?.addressLine2 }}
                </p>
                <p>
                  {{ orderDetails?.shippingAddress?.city }},
                  {{ orderDetails?.shippingAddress?.zip }}
                </p>
                <p>{{ orderDetails?.shippingAddress?.country }}</p>
                <p v-if="orderDetails?.shippingAddress?.mobile" class="mt-2">
                  {{ orderDetails?.shippingAddress?.mobile }}
                </p>
                <p v-if="orderDetails?.shippingAddress?.phone">
                  {{ orderDetails?.shippingAddress?.phone }}
                </p>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="mb-8">
            <h2 class="mb-4 text-lg font-semibold">Order Summary</h2>
            <CheckoutSummaryOrderRows v-if="orderDetails" :order="orderDetails" />
          </div>

          <!-- Payment & Shipping Method -->
          <!--           <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h2 class="mb-2 text-lg font-semibold">Payment Method</h2>
              <div class="rounded-lg border p-4">
                <div class="flex items-center">
                  <img v-if="orderDetails?.paymentMethod?.logoUrl" :src="orderDetails?.paymentMethod?.logoUrl" :alt="orderDetails?.paymentMethod?.displayName" class="mr-3 h-8 w-auto" />
                  <span>{{ orderDetails?.paymentMethod?.displayName }}</span>
                </div>
              </div>
            </div> -->

          <!--             <div>
              <h2 class="mb-2 text-lg font-semibold">Shipping Method</h2>
              <div class="rounded-lg border p-4">
                <div class="flex items-center">
                  <img v-if="orderDetails?.shippingMethod?.logoUrl" :src="orderDetails?.shippingMethod?.logoUrl" :alt="orderDetails?.shippingMethod?.displayName" class="mr-3 h-8 w-auto" />
                  <div>
                    <p>{{ orderDetails?.shippingMethod?.displayName }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div> -->

          <!-- Back to Home -->
          <div v-if="state.continueShoppingUrl" class="mt-8 text-center">
            <NuxtLink :to="state.continueShoppingUrl" class="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Continue Shopping
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
