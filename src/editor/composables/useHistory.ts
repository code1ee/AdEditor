import { storeToRefs } from 'pinia';
import { useEditorStore } from '@/editor/store/editor.store';

export function useHistory() {
  const store = useEditorStore();
  const { canRedo, canUndo } = storeToRefs(store);
  return {
    canRedo,
    canUndo,
    redo: store.redo,
    undo: store.undo
  };
}
