import { onBeforeUnmount, onMounted } from 'vue';
import type { Router } from 'vue-router';
import { useEditorStore } from '@/editor/store/editor.store';
import { isFormControl, matchShortcut } from '@/utils/shortcuts';

export function useKeyboard(router: Router) {
  const store = useEditorStore();

  function onKeydown(event: KeyboardEvent): void {
    const command = matchShortcut(event);
    if (!command) return;
    if (isFormControl(event.target) && command !== 'save') return;

    event.preventDefault();
    if (command === 'undo') store.undo();
    if (command === 'redo') store.redo();
    if (command === 'copy') store.copySelectedElement();
    if (command === 'paste') store.pasteElement();
    if (command === 'delete') store.deleteSelectedElement();
    if (command === 'save') store.saveToLocalStorage();
    if (command === 'preview') {
      store.saveToLocalStorage();
      router.push('/preview');
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown));
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
}
