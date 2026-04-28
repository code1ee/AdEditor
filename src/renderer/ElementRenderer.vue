<script setup lang="ts">
import { computed } from 'vue';
import type { ElementSchema } from '@/models/element';
import { pluginRegistry } from '@/plugins';
import { toElementStyle } from './style';

const props = defineProps<{
  element: ElementSchema;
}>();

const plugin = computed(() => pluginRegistry.get(props.element.type));
const style = computed(() => toElementStyle(props.element.style));
</script>

<template>
  <component
    :is="plugin.component"
    v-if="plugin && !element.hidden"
    :style="style"
    :props-data="element.props"
    data-rendered-element
  />
</template>
