<script setup lang="ts">
defineProps<{
  propsData: Record<string, unknown>;
}>();
</script>

<template>
  <div class="h-full w-full whitespace-pre-wrap break-words">
    {{ String(propsData.text ?? 'Text') }}
  </div>
</template>
