<script setup lang="ts">
import { useRuntimeConfig } from '#imports';
const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const currentVersion = config.public.CURRENT_VERSION;
const token = route.params.token as string;

onMounted(() => {
  console.log('Redirecting to checkout page');
  const url = `/${currentVersion}/${token}/checkout`;
  console.log('Redirecting to', url);
  router.push(url);
});
</script>
<template>
  <div></div>
</template>
