<script setup lang="ts">
defineProps<{
  propsData: Record<string, unknown>;
}>();
</script>

<template>
  <img
    v-if="propsData.src"
    class="h-full w-full object-cover"
    :src="String(propsData.src)"
    :alt="String(propsData.alt ?? '')"
  />
  <div v-else class="flex h-full w-full items-center justify-center bg-slate-200 text-xs text-slate-500">
    Image
  </div>
</template>
