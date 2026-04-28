<script setup lang="ts">
import { computed } from 'vue';
import { useEditorStore } from '@/editor/store/editor.store';
import { useI18n } from '@/i18n';

const store = useEditorStore();
const { t } = useI18n();
const elements = computed(() => store.currentPage.elements.slice().sort((a, b) => b.style.zIndex - a.style.zIndex));
</script>

<template>
  <section class="space-y-3">
    <h2 class="text-sm font-semibold text-slate-700">{{ t('layers.title') }}</h2>
    <div class="grid grid-cols-2 gap-2">
      <el-button size="small" @click="store.moveLayerUp()">{{ t('layers.up') }}</el-button>
      <el-button size="small" @click="store.moveLayerDown()">{{ t('layers.down') }}</el-button>
      <el-button size="small" @click="store.bringLayerToTop()">{{ t('layers.top') }}</el-button>
      <el-button size="small" @click="store.sendLayerToBottom()">{{ t('layers.bottom') }}</el-button>
      <el-button size="small" @click="store.toggleSelectedLock">{{ t('layers.lock') }}</el-button>
      <el-button size="small" @click="store.toggleSelectedHidden">{{ t('layers.hide') }}</el-button>
    </div>
    <div class="space-y-2">
      <button
        v-for="element in elements"
        :key="element.id"
        class="flex w-full items-center justify-between rounded border px-2 py-1 text-left text-xs"
        :class="store.selectedElementIds.includes(element.id) ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'"
        type="button"
        @click="store.selectElement(element.id)"
      >
        <span class="truncate">{{ element.name }}</span>
        <span class="shrink-0 text-slate-400">
          {{ element.locked ? t('layers.locked') : '' }} {{ element.hidden ? t('layers.hidden') : '' }}
        </span>
      </button>
    </div>
  </section>
</template>
