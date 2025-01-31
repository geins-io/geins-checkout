// Mock implementation of Geins client
import { GeinsCore, RuntimeContext } from '@geins/core';
import { GeinsOMS } from '@geins/oms';
import type { CartType, GeinsSettings } from '@geins/types';

export const useGeinsClient = () => {
  let geinsSettings: GeinsSettings;
  let geinsCore: GeinsCore;
  let geinsOMS: GeinsOMS;
  let settings: any;
  let cartId: string;
  let cartObject: CartType = {} as CartType;
  let paymentMethods: any[] = [];
  let shippingMethods: any[] = [];
  let user: any;
  let checkoutObject: any;
  let orderSummary: any;

  const setGeinsFromToken = (token: any) => {
    initializFromToken(token);

    // initialize Geins core
    geinsCore = new GeinsCore(geinsSettings);
    // initialize Geins OMS
    geinsOMS = new GeinsOMS(geinsCore, {
      omsSettings: { context: RuntimeContext.HYBRID },
    });
  };

  const initializeSummary = async (token: string, orderId: string) => {
    // set all the settings from the token
    await setGeinsFromToken(token);
    //console.log('initializeSummary - token ::', token);
    const order = await geinsOMS.order.get({ orderId: orderId });
    orderSummary = order;
  };

  const initializeCheckout = async (token: string) => {
    // set all the settings from the token
    await setGeinsFromToken(token);

    // get the checkout
    const checkout = await geinsOMS.checkout.get({
      cartId: cartId,
      paymentMethodId: settings.paymentId,
      shippingMethodId: settings.shippingId,
    });
    let checkoutObject = checkout;

    if (checkout) {
      cartObject = checkout.cart;
      paymentMethods = setPaymentMethods(checkout.paymentOptions);
      shippingMethods = setShippingMethods(checkout.shippingOptions);
    }
  };

  const initializFromToken = async (token: string) => {
    const payload = GeinsCore.decodeJWT(token);
    // console.log('useGeinsClient - initializFromToken ::  payload', payload);
    cartId = payload.cartId;
    geinsSettings = payload.geinsSettings;
    user = payload.user;
    settings = payload.settings;
  };

  const createUpdateArgsFromState = (state: any) => {
    let args = {
      cartId: cartId,
      paymentMethodId: state.selectedPaymentMethod,
      shippingMethodId: state.selectedShippingMethod,
    };
    return args;
  };

  const updateCheckout = async (checkoutState: any) => {
    const args = createUpdateArgsFromState(checkoutState);
    const checkout = await geinsOMS.checkout.get(args);
    let checkoutObject = checkout;

    // set cart
    cartObject = checkout.cart;

    // set payment and shipping
    paymentMethods = setPaymentMethods(checkout.paymentOptions);
    shippingMethods = setShippingMethods(checkout.shippingOptions);
  };

  const setPaymentMethods = (methods: any[]) => {
    if (!methods) {
      return [];
    }

    if (!settings.paymentMethods || settings.paymentMethods.length === 0) {
      return methods;
    }

    // set order from order of settings array and filter out the rest
    const returnMethods = [];
    const order = settings.paymentMethods;

    for (let i = 0; i < order.length; i++) {
      const method = methods.find((m) => m.id === order[i]);
      if (method) {
        returnMethods.push(method);
      }
    }
    return returnMethods;
  };

  const setShippingMethods = (methods: any[]) => {
    if (!methods) {
      return [];
    }

    if (!settings.shippingMethods || settings.shippingMethods.length === 0) {
      return methods;
    }

    // set order from order of settings array and filter out the rest
    const returnMethods = [];
    const order = settings.shippingMethods;

    for (let i = 0; i < order.length; i++) {
      const method = methods.find((m) => m.id === order[i]);
      if (method) {
        returnMethods.push(method);
      }
    }
    return returnMethods;
  };

  const getCheckout = async (paymentId?: any) => {
    const args = { cartId: cartId, paymentProviderId: paymentId };
    const checkout = await geinsOMS.checkout.get(args);

    // set cartObject, paymentMethods, and shippingMethods
    cartObject = checkout.cart;
    paymentMethods = checkout.paymentOptions;
    shippingMethods = checkout.shippingOptions;

    return checkout;
  };

  const getCart = async (): Promise<CartType | undefined> => {
    if (!cartObject) {
      return undefined;
    }
    return cartObject;
  };

  const getPaymentMethods = async () => {
    return paymentMethods;
  };

  const getShippingMethods = async () => {
    return shippingMethods;
  };

  const getSelectedShippingMethod = async () => {
    return shippingMethods.find((method) => method.isSelected);
  };

  const getSelectedPaymentMethod = async () => {
    return paymentMethods.find((method) => method.isSelected);
  };

  const getUser = async () => {
    if (!user) {
      undefined;
    }
    return user;
  };

  const validateCheckout = async (checkoutInput: any) => {
    return true;
  };

  const createOrder = async (checkoutInput: any) => {
    const result = await geinsOMS.order.create(checkoutInput);

    // complete cart
    //const completeCartResult = await geinsOMS.cart.complete();

    return result;
  };

  const getBillingAddress = async () => {
    if (!user) {
      undefined;
    }
    return user.billingAddress;
  };

  const getShippingAddress = async () => {
    if (!user) {
      undefined;
    }
    return user.shippingAddress;
  };

  const getSummary = async () => {
    // console.log('getSummary - orderSummary ::', orderSummary);
    if (orderSummary) {
      return orderSummary;
    }
  };

  return {
    initializeSummary,
    initializeCheckout,
    getCheckout,
    updateCheckout,
    getCart,
    getUser,
    getPaymentMethods,
    getSelectedPaymentMethod,
    getShippingMethods,
    getSelectedShippingMethod,
    validateCheckout,
    createOrder,
    getSummary,
  };
};
