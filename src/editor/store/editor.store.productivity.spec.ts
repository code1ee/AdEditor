import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useEditorStore } from './editor.store';

describe('editor productivity store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('supports copy, paste, undo, redo, and history reset on import', () => {
    const store = useEditorStore();
    store.addElement('text');
    const sourceId = store.selectedElementId!;
    expect(store.copySelectedElement().ok).toBe(true);
    expect(store.pasteElement().ok).toBe(true);
    expect(store.currentPage.elements).toHaveLength(2);
    expect(store.selectedElementId).not.toBe(sourceId);

    store.undo();
    expect(store.currentPage.elements).toHaveLength(1);
    store.redo();
    expect(store.currentPage.elements).toHaveLength(2);

    const exported = store.exportWork();
    expect(store.importWork(exported)).toBe(true);
    expect(store.history.undoStack).toHaveLength(0);
  });

  it('manages pages and preserves at least one page', () => {
    const store = useEditorStore();
    const firstPage = store.currentPageId;
    store.addPage();
    expect(store.work.pages).toHaveLength(2);
    store.duplicatePage(store.currentPageId);
    expect(store.work.pages).toHaveLength(3);
    store.deletePage(firstPage);
    expect(store.work.pages).toHaveLength(2);
    store.deletePage(store.currentPageId);
    store.deletePage(store.currentPageId);
    expect(store.work.pages).toHaveLength(1);
  });

  it('blocks locked mutations and hides elements from preview data', () => {
    const store = useEditorStore();
    store.addElement('button');
    const id = store.selectedElementId!;
    store.lockElement(id);
    expect(store.moveElement(id, 100, 100).ok).toBe(false);
    store.unlockElement(id);
    store.hideElement(id);
    expect(store.selectedElement?.hidden).toBe(true);
  });

  it('aligns and distributes selected editable elements', () => {
    const store = useEditorStore();
    store.addElement('text');
    const a = store.selectedElementId!;
    store.addElement('text');
    const b = store.selectedElementId!;
    store.addElement('text');
    const c = store.selectedElementId!;
    store.updateElementStyle(a, { x: 10 });
    store.updateElementStyle(b, { x: 100 });
    store.updateElementStyle(c, { x: 200 });
    store.setSelection([a, b, c]);

    expect(store.alignSelected('left').ok).toBe(true);
    expect(new Set(store.selectedElements.map((element) => element.style.x)).size).toBe(1);
    expect(store.distributeSelected('horizontal').ok).toBe(true);
  });
});
