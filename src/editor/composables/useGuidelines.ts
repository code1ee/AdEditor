import { computed, ref } from 'vue';
import type { AlignmentGuide } from '@/utils/geometry';

const activeGuides = ref<AlignmentGuide[]>([]);

export function useGuidelines() {
  return {
    activeGuides: computed(() => activeGuides.value),
    setGuides(guides: AlignmentGuide[]) {
      activeGuides.value = guides;
    },
    clearGuides() {
      activeGuides.value = [];
    }
  };
}
