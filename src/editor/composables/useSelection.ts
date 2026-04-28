import { useEditorStore } from '@/editor/store/editor.store';

export function useSelection() {
  const store = useEditorStore();

  return {
    selectElement: store.selectElement,
    clearSelection: store.clearSelection
  };
}
