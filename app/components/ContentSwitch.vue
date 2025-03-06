<script setup lang="ts">
const _props = defineProps<{
  label?: string;
  description?: string;
  insideBox?: boolean;
}>();

const checked = defineModel<boolean>('checked');

const beforeEnter = (el: Element) => {
  (el as HTMLElement).style.height = '0';
  (el as HTMLElement).style.overflow = 'hidden';
};

const enter = (el: Element) => {
  (el as HTMLElement).style.height = (el as HTMLElement).scrollHeight + 'px';
  (el as HTMLElement).style.overflow = 'visible';
};

const beforeLeave = (el: Element) => {
  (el as HTMLElement).style.height = (el as HTMLElement).scrollHeight + 'px';
  (el as HTMLElement).style.overflow = 'hidden';
};

const leave = (el: Element) => {
  (el as HTMLElement).style.height = '0';
  (el as HTMLElement).style.overflow = 'hidden';
};
</script>
<template>
  <div v-bind="$attrs" class="rounded-lg border p-4 text-sm shadow-sm">
    <div class="flex flex-row items-center justify-between">
      <div class="space-y-0.5">
        <p class="">{{ label }}</p>
        <p v-if="description">{{ description }}</p>
      </div>
      <div>
        <Switch v-model:checked="checked" />
      </div>
    </div>
    <transition
      v-if="insideBox"
      @before-enter="beforeEnter"
      @enter="enter"
      @before-leave="beforeLeave"
      @leave="leave"
    >
      <div
        v-show="checked"
        :data-state="checked ? 'open' : 'closed'"
        class="overflow-hidden pt-4 transition-all"
      >
        <slot />
      </div>
    </transition>
  </div>
  <transition
    v-if="!insideBox"
    @before-enter="beforeEnter"
    @enter="enter"
    @before-leave="beforeLeave"
    @leave="leave"
  >
    <div v-show="checked" :data-state="checked ? 'open' : 'closed'" class="pt-4 transition-all">
      <slot />
    </div>
  </transition>
</template>
