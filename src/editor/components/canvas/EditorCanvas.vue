<script setup lang="ts">
import { computed } from 'vue';
import { useEditorStore } from '@/editor/store/editor.store';
import { useI18n } from '@/i18n';
import CanvasElement from './CanvasElement.vue';

const store = useEditorStore();
const { t } = useI18n();

const pageStyle = computed(() => ({
  width: `${store.currentPage.width}px`,
  height: `${store.currentPage.height}px`,
  backgroundColor: store.currentPage.backgroundColor,
  backgroundImage: store.currentPage.backgroundImage ? `url(${store.currentPage.backgroundImage})` : undefined,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transform: `scale(${store.zoom})`,
  transformOrigin: 'top left'
}));

const elements = computed(() =>
  store.currentPage.elements.slice().sort((a, b) => a.style.zIndex - b.style.zIndex)
);

function updatePageWidth(value: number | undefined) {
  store.updatePageSize(Number(value), store.currentPage.height);
}

function updatePageHeight(value: number | undefined) {
  store.updatePageSize(store.currentPage.width, Number(value));
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <div class="inline-block rounded bg-white shadow-sm">
      <div
        class="relative overflow-hidden"
        :style="pageStyle"
        data-editor-canvas
        @click.self="store.clearSelection"
      >
        <CanvasElement v-for="element in elements" :key="element.id" :element="element" :page="store.currentPage" />
      </div>
    </div>

    <div class="flex items-center gap-2 text-sm text-slate-500" :aria-label="t('canvas.pageSize')">
      <el-input-number
        :model-value="store.currentPage.width"
        :min="1"
        :controls="false"
        size="small"
        class="w-24"
        :aria-label="t('canvas.pageWidth')"
        @update:model-value="updatePageWidth"
      />
      <span class="text-base text-slate-400">x</span>
      <el-input-number
        :model-value="store.currentPage.height"
        :min="1"
        :controls="false"
        size="small"
        class="w-24"
        :aria-label="t('canvas.pageHeight')"
        @update:model-value="updatePageHeight"
      />
      <span class="text-base text-slate-400">px</span>
    </div>
  </div>
</template>
