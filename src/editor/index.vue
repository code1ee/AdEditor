<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import EditorLayout from '@/editor/components/layout/EditorLayout.vue';
import EditorCanvas from '@/editor/components/canvas/EditorCanvas.vue';
import { useKeyboard } from '@/editor/composables/useKeyboard';
import { useEditorStore } from '@/editor/store/editor.store';

const store = useEditorStore();
const router = useRouter();
useKeyboard(router);

onMounted(() => {
  store.loadFromLocalStorage();
});
</script>

<template>
  <EditorLayout>
    <div class="flex min-h-full items-start justify-center">
      <EditorCanvas />
    </div>
  </EditorLayout>
</template>
