<script setup lang="ts">

const route = useRoute();
const router = useRouter();
const token = route.params.token as string
const currentVersion = 'v0';

onMounted(() => {
    router.push(`/${currentVersion}/${token}/checkout`);
})

</script>
<template>
    <div>
    </div>
</template>
