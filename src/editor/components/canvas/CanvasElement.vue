<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import type { ElementSchema } from '@/models/element';
import type { PageSchema } from '@/models/page';
import { pluginRegistry } from '@/plugins';
import { useEditorStore } from '@/editor/store/editor.store';
import { useDrag } from '@/editor/composables/useDrag';
import { useResize } from '@/editor/composables/useResize';
import { toElementStyle } from '@/renderer/style';
import SelectionBox from './SelectionBox.vue';

const props = defineProps<{
  element: ElementSchema;
  page: PageSchema;
}>();

const store = useEditorStore();
const target = ref<HTMLElement | null>(null);
const elementRef = toRef(props, 'element');
const pageRef = toRef(props, 'page');
const plugin = computed(() => pluginRegistry.get(props.element.type));
const isSelected = computed(() => store.selectedElementIds.includes(props.element.id));
const style = computed(() => toElementStyle(props.element.style));

useDrag(target, elementRef, pageRef);
useResize(target, elementRef, pageRef);
</script>

<template>
  <div
    v-if="plugin && !element.hidden"
    ref="target"
    class="absolute cursor-move"
    :class="{ 'cursor-not-allowed': element.locked }"
    :style="style"
    data-canvas-element
    @click.stop.shift="store.addToSelection(element.id)"
    @click.stop.meta="store.addToSelection(element.id)"
    @click.stop.ctrl="store.addToSelection(element.id)"
    @click.stop.exact="store.selectElement(element.id)"
  >
    <component :is="plugin.component" class="h-full w-full" :props-data="element.props" />
    <SelectionBox v-if="isSelected && !element.locked" />
  </div>
</template>
