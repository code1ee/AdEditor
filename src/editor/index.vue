<script setup lang="ts">
import { onMounted } from 'vue';
import EditorLayout from '@/editor/components/layout/EditorLayout.vue';
import EditorCanvas from '@/editor/components/canvas/EditorCanvas.vue';
import { useEditorStore } from '@/editor/store/editor.store';

const store = useEditorStore();

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
