<script setup lang="ts">
import { ref } from 'vue';

const styling = useCheckoutStyling();
const route = useRoute();
const style = ref({
  'background-color': '#000000',
});

const setStyling = async (styleObject: CheckoutStyleType) => {
  style.value = {
    'background-color': styleObject.backgroundColor,
  };
  // get elements with id "checkout"
  await nextTick();
  const checkoutElement = document.getElementById('checkout');

  if (checkoutElement) {
    checkoutElement.style.backgroundColor = styleObject.backgroundColor;
  }
};

onBeforeMount(async () => {
  const segments = route.path.split('/');
  if (segments.length < 3) {
    return;
  }

  const token = segments[2];
  if (token) {
    await styling.initialize(token);
    const styles = styling.getStyleObject();
    await setStyling(styles);
  }
});
</script>

<template>
  <div id="checkout" :style="style">
    <slot />
  </div>
</template>
