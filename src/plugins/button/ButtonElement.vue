<script setup lang="ts">
defineProps<{
  propsData: Record<string, unknown>;
}>();
</script>

<template>
  <button class="h-full w-full border-0 bg-transparent">
    {{ String(propsData.text ?? 'Button') }}
  </button>
</template>
