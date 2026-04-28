<script setup lang="ts">
import type { AlignmentGuide } from '@/utils/geometry';

defineProps<{
  guides: AlignmentGuide[];
}>();
</script>

<template>
  <div class="pointer-events-none absolute inset-0" data-guide-lines>
    <div
      v-for="(guide, index) in guides"
      :key="`${guide.axis}-${guide.position}-${index}`"
      class="absolute bg-sky-500/80"
      :style="
        guide.axis === 'x'
          ? { left: `${guide.position}px`, top: 0, bottom: 0, width: '1px' }
          : { top: `${guide.position}px`, left: 0, right: 0, height: '1px' }
      "
    />
  </div>
</template>
