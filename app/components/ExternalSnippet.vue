<script setup lang="ts">
import type { ExternalSnippetType } from '#shared/types';
const props = defineProps<{
  type: ExternalSnippetType;
}>();
const { externalSnippetHtml, renderExternalSnippet } = useExternalSnippet();

const id = computed(() => `${props.type}-external`);

onMounted(() => {
  renderExternalSnippet(props.type);
});
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div :id="id" v-html="externalSnippetHtml" />
</template>
