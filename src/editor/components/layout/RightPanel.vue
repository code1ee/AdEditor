<template>
  <aside class="overflow-auto border-l border-slate-200 bg-white p-4">
    <slot>
      <div class="space-y-6">
        <PropertyPanel />
        <LayerPanel />
      </div>
    </slot>
  </aside>
</template>

<script setup lang="ts">
import LayerPanel from '@/editor/components/panels/LayerPanel.vue';
import PropertyPanel from '@/editor/components/panels/PropertyPanel.vue';
</script>
