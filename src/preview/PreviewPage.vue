<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import PageRenderer from '@/renderer/PageRenderer.vue';
import { useI18n } from '@/i18n';
import type { WorkSchema } from '@/models/work';
import { createBlankWork } from '@/utils/createElement';
import { loadWorkFromStorage } from '@/utils/storage';

const router = useRouter();
const { t } = useI18n();
const work = ref<WorkSchema>(createBlankWork());
const previewPageId = ref(work.value.currentPageId);
const page = computed(() => work.value.pages.find((item) => item.id === previewPageId.value) ?? work.value.pages[0]);

onMounted(() => {
  work.value = loadWorkFromStorage() ?? createBlankWork();
  previewPageId.value = work.value.currentPageId;
});
</script>

<template>
  <div class="min-h-screen bg-slate-900 p-6">
    <button class="mb-4 rounded bg-white px-3 py-1 text-sm" type="button" @click="router.push('/editor')">
      {{ t('preview.backToEditor') }}
    </button>
    <div class="mb-4 flex justify-center gap-2" :aria-label="t('preview.pages')">
      <button
        v-for="(item, index) in work.pages"
        :key="item.id"
        class="rounded px-3 py-1 text-sm"
        :class="item.id === page.id ? 'bg-blue-500 text-white' : 'bg-white text-slate-700'"
        type="button"
        @click="previewPageId = item.id"
      >
        {{ index + 1 }}
      </button>
    </div>
    <div class="mx-auto w-fit bg-white">
      <PageRenderer :page="page" />
    </div>
  </div>
</template>
