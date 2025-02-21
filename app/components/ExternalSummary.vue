<script setup lang="ts">
const props = defineProps<{
  html: string | undefined;
}>();

watch(
  () => props.html,
  (html) => {
    if (html) {
      setExternalSummary(html);
    }
  },
);

const setExternalSummary = async (html: string) => {
  console.log('Setting external summary');
  // Wait for Vue to update the DOM
  await nextTick();

  // Set the HTML content first
  const target = document.getElementById('summary-external');
  if (!target) {
    console.error('External summary container not found');
    return;
  }

  // Create a temporary container to parse the HTML
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = html;

  // Extract scripts before setting the HTML
  const scripts: { src?: string; content?: string; id?: string; type?: string }[] = [];
  tempContainer.querySelectorAll('script').forEach((script) => {
    scripts.push({
      src: script.src,
      content: script.innerHTML,
      id: script.id,
      type: script.type,
    });
    script.remove(); // Remove script tags from the HTML
  });

  // Set the HTML content (without scripts)
  target.innerHTML = tempContainer.innerHTML;

  // Execute scripts after the HTML is in place
  for (const scriptData of scripts) {
    const newScript = document.createElement('script');
    if (scriptData.id) newScript.id = scriptData.id;
    if (scriptData.type) newScript.type = scriptData.type;

    if (scriptData.src) {
      newScript.src = scriptData.src;
      newScript.async = true;
    } else if (scriptData.content) {
      newScript.textContent = scriptData.content;
    }

    // Wait for the DOM to be ready
    await nextTick();
    target.appendChild(newScript);
  }
};
</script>
<template>
  <div class="space-y-4">
    <div class="space-y-3">
      <div id="summary-external" v-html="html" />
    </div>
  </div>
</template>
