import type { Ref } from 'vue';
import { onBeforeUnmount, onMounted } from 'vue';
import type { ElementSchema } from '@/models/element';
import type { PageSchema } from '@/models/page';
import { useEditorStore } from '@/editor/store/editor.store';

export function useDrag(target: Ref<HTMLElement | null>, element: Ref<ElementSchema>, page: Ref<PageSchema>) {
  const store = useEditorStore();
  let stopDrag: (() => void) | null = null;

  onMounted(() => {
    if (!target.value) return;
    target.value.addEventListener('pointerdown', startDrag);
  });

  onBeforeUnmount(() => {
    target.value?.removeEventListener('pointerdown', startDrag);
    stopDrag?.();
  });

  function startDrag(event: PointerEvent): void {
    if (event.button !== 0) return;
    if ((event.target as Element | null)?.closest('[data-resize-handle]')) return;
    if ((event.target as Element | null)?.closest('button,input,textarea,select,a')) return;

    stopDrag?.();
    event.preventDefault();
    const node = target.value;
    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const startX = element.value.style.x;
    const startY = element.value.style.y;
    const pointerId = event.pointerId;

    try {
      node?.setPointerCapture?.(pointerId);
    } catch {
      // The pointer may already be released if the browser interrupted the event.
    }

    const onMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startClientX) / store.zoom;
      const dy = (moveEvent.clientY - startClientY) / store.zoom;
      store.moveElement(element.value.id, startX + dx, startY + dy);
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
      stopDrag = null;
    };

    stopDrag = onEnd;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd, { once: true });
    window.addEventListener('pointercancel', onEnd, { once: true });
    window.addEventListener('blur', onEnd, { once: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    node?.addEventListener('lostpointercapture', onEnd, { once: true });
  }
}
