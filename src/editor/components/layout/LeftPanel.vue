<template>
  <aside class="border-r border-slate-200 bg-white p-4">
    <slot>
      <div class="space-y-6">
        <ComponentPanel />
        <PagePanel />
      </div>
    </slot>
  </aside>
</template>

<script setup lang="ts">
import ComponentPanel from '@/editor/components/panels/ComponentPanel.vue';
import PagePanel from '@/editor/components/panels/PagePanel.vue';
</script>
