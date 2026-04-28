<script setup lang="ts">
import EditorToolbar from './EditorToolbar.vue';
import LeftPanel from './LeftPanel.vue';
import RightPanel from './RightPanel.vue';
</script>

<template>
  <div class="flex h-screen flex-col bg-slate-100">
    <EditorToolbar />
    <div class="grid min-h-0 flex-1 grid-cols-[240px_minmax(0,1fr)_320px]">
      <LeftPanel />
      <main class="min-w-0 overflow-auto bg-slate-200 p-6">
        <slot />
      </main>
      <RightPanel />
    </div>
  </div>
</template>
