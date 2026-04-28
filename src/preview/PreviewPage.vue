<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import PageRenderer from '@/renderer/PageRenderer.vue';
import { useEditorStore } from '@/editor/store/editor.store';
import { useI18n } from '@/i18n';

const store = useEditorStore();
const router = useRouter();
const { t } = useI18n();
const page = computed(() => store.currentPage);

onMounted(() => {
  store.loadFromLocalStorage();
});
</script>

<template>
  <div class="min-h-screen bg-slate-900 p-6">
    <button class="mb-4 rounded bg-white px-3 py-1 text-sm" type="button" @click="router.push('/editor')">
      {{ t('preview.backToEditor') }}
    </button>
    <div class="mx-auto w-fit bg-white">
      <PageRenderer :page="page" />
    </div>
  </div>
</template>
