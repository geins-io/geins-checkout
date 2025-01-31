<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const token = route.params.token as string
onMounted(() => {
    router.push(`/v0/${token}/checkout`);
})

</script>
<template>
    <div>
    </div>
</template>
