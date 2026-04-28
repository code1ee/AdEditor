import { useEditorStore } from '@/editor/store/editor.store';

export function useMultiSelection() {
  const store = useEditorStore();
  return {
    addToSelection: store.addToSelection,
    clearSelection: store.clearSelection,
    removeFromSelection: store.removeFromSelection,
    setSelection: store.setSelection
  };
}
