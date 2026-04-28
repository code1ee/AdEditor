<template>
  <aside class="overflow-auto border-l border-slate-200 bg-white p-4">
    <slot>
      <PropertyPanel />
    </slot>
  </aside>
</template>

<script setup lang="ts">
import PropertyPanel from '@/editor/components/panels/PropertyPanel.vue';
</script>
