<script setup lang="ts">
import { useEditorStore } from '@/editor/store/editor.store';
import { useI18n } from '@/i18n';

const store = useEditorStore();
const { t } = useI18n();
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold text-slate-700">{{ t('pages.title') }}</h2>
      <el-button size="small" @click="store.addPage">{{ t('pages.add') }}</el-button>
    </div>
    <div class="space-y-2">
      <button
        v-for="(page, index) in store.work.pages"
        :key="page.id"
        class="flex w-full items-center justify-between rounded border px-2 py-1 text-left text-xs"
        :class="page.id === store.currentPageId ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'"
        type="button"
        @click="store.setCurrentPage(page.id)"
      >
        <span>{{ index + 1 }}. {{ page.title }}</span>
        <span class="text-slate-400">{{ page.width }}x{{ page.height }}</span>
      </button>
    </div>
    <div class="grid grid-cols-2 gap-2">
      <el-button size="small" @click="store.duplicatePage(store.currentPageId)">{{ t('pages.duplicate') }}</el-button>
      <el-button size="small" type="danger" @click="store.deletePage(store.currentPageId)">{{ t('pages.delete') }}</el-button>
    </div>
  </section>
</template>
