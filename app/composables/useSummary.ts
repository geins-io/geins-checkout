import { ref } from 'vue';
import type { CartType, CheckoutQueryParameters } from '@geins/types';

const geinsClient = useGeinsClient();

interface OrderSummary {
  cart: CartType;
  billingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    zip: string;
    country: string;
    mobile?: string;
    phone?: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    zip: string;
    country: string;
    mobile?: string;
    phone?: string;
  };
  paymentDetails: Array<{
    displayName: string;
  }>;
  shippingDetails: Array<{
    name: string;
  }>;
  status: string;
}

export const useSummary = () => {
  const loading = ref(false);
  const error = ref('');

  const initializeSummary = async (token: string, orderId: string, paymentdata: CheckoutQueryParameters) => {
    let summary: OrderSummary | null = null;

    /*  
    try {
      loading.value = true;
      summary = await geinsClient.initializeSummary(token, orderId, paymentdata);
      console.log('initializeSummary::', summary);
    } catch (e) {
      error.value = 'Failed to initialize summary';
      console.error(e);
    } finally {
      loading.value = false;
    } */
    return summary;
  };

  const getSummary = async () => {
    const orderSummary = await geinsClient.getSummary();
    // console.log('getSummary::', orderSummary);

    const summary = {
      cart: orderSummary.cart,
    };

    return summary;
  };

  return {
    initializeSummary,
    getSummary,
  };
};
