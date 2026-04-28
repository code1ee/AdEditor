import type { Ref } from 'vue';
import { onBeforeUnmount, onMounted } from 'vue';
import type { ElementSchema } from '@/models/element';
import type { PageSchema } from '@/models/page';
import { useEditorStore } from '@/editor/store/editor.store';
import { snapRectToGuides } from '@/utils/geometry';
import { useGuidelines } from './useGuidelines';

export function useResize(target: Ref<HTMLElement | null>, element: Ref<ElementSchema>, page: Ref<PageSchema>) {
  const store = useEditorStore();
  const guides = useGuidelines();
  let stopResize: (() => void) | null = null;

  onMounted(() => {
    if (!target.value) return;
    target.value.addEventListener('pointerdown', startResize);
  });

  onBeforeUnmount(() => {
    target.value?.removeEventListener('pointerdown', startResize);
    stopResize?.();
  });

  function startResize(event: PointerEvent): void {
    const handle = (event.target as Element | null)?.closest<HTMLElement>('[data-resize-handle]');
    if (event.button !== 0 || !handle) return;
    if (element.value.locked) return;

    stopResize?.();
    event.preventDefault();
    event.stopPropagation();

    const direction = handle.dataset.resizeHandle ?? 'se';
    const node = target.value;
    const pointerId = event.pointerId;
    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const start = { ...element.value.style };

    try {
      node?.setPointerCapture?.(pointerId);
    } catch {
      // The pointer may already be released if the browser interrupted the event.
    }

    const onMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startClientX) / store.zoom;
      const dy = (moveEvent.clientY - startClientY) / store.zoom;
      let x = start.x;
      let y = start.y;
      let width = start.width;
      let height = start.height;

      if (direction.includes('e')) width = start.width + dx;
      if (direction.includes('s')) height = start.height + dy;
      if (direction.includes('w')) {
        x = start.x + dx;
        width = start.width - dx;
      }
      if (direction.includes('n')) {
        y = start.y + dy;
        height = start.height - dy;
      }

      const snapped = snapRectToGuides({ x, y, width, height }, page.value, element.value.id);
      guides.setGuides(snapped.guides);
      store.resizeElement(element.value.id, snapped.rect.width, snapped.rect.height, snapped.rect.x, snapped.rect.y);
    };

    const onVisibilityChange = () => {
      if (document.hidden) onEnd();
    };

    let stopped = false;
    const onEnd = () => {
      if (stopped) return;
      stopped = true;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
      window.removeEventListener('blur', onEnd);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      node?.removeEventListener('lostpointercapture', onEnd);
      try {
        node?.releasePointerCapture?.(pointerId);
      } catch {
        // Releasing an already-ended pointer can throw in some browsers.
      }
      stopResize = null;
      guides.clearGuides();
    };

    stopResize = onEnd;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd, { once: true });
    window.addEventListener('pointercancel', onEnd, { once: true });
    window.addEventListener('blur', onEnd, { once: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    node?.addEventListener('lostpointercapture', onEnd, { once: true });
  }
}
