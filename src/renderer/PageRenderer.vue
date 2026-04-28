<script setup lang="ts">
import { computed } from 'vue';
import type { PageSchema } from '@/models/page';
import ElementRenderer from './ElementRenderer.vue';

const props = defineProps<{
  page: PageSchema;
}>();

const pageStyle = computed(() => ({
  width: `${props.page.width}px`,
  height: `${props.page.height}px`,
  backgroundColor: props.page.backgroundColor,
  backgroundImage: props.page.backgroundImage ? `url(${props.page.backgroundImage})` : undefined,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative' as const,
  overflow: 'hidden'
}));

const elements = computed(() =>
  props.page.elements
    .filter((element) => !element.hidden)
    .slice()
    .sort((a, b) => a.style.zIndex - b.style.zIndex)
);
</script>

<template>
  <div class="page-renderer" :style="pageStyle" data-preview-page>
    <ElementRenderer v-for="element in elements" :key="element.id" :element="element" />
  </div>
</template>
