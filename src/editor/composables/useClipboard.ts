import { useEditorStore } from '@/editor/store/editor.store';

export function useClipboard() {
  const store = useEditorStore();
  return {
    copy: store.copySelectedElement,
    paste: store.pasteElement
  };
}
