<template>
  <aside class="border-r border-slate-200 bg-white p-4">
    <slot>
      <ComponentPanel />
    </slot>
  </aside>
</template>

<script setup lang="ts">
import ComponentPanel from '@/editor/components/panels/ComponentPanel.vue';
</script>
