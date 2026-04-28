import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useEditorStore } from './editor.store';

describe('editor store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('adds, selects, moves, resizes, and deletes elements inside bounds', () => {
    const store = useEditorStore();
    store.createBlankWork();
    store.addElement('text');

    const id = store.selectedElementId;
    expect(id).toBeTruthy();

    store.moveElement(id!, 9999, 9999);
    expect(store.selectedElement!.style.x + store.selectedElement!.style.width).toBeLessThanOrEqual(
      store.currentPage.width
    );

    store.resizeElement(id!, 9999, 9999);
    expect(store.selectedElement!.style.width).toBeLessThanOrEqual(store.currentPage.width);
    expect(store.selectedElement!.style.height).toBeLessThanOrEqual(store.currentPage.height);

    store.deleteSelectedElement();
    expect(store.currentPage.elements).toHaveLength(0);
    expect(store.selectedElementId).toBeNull();
  });

  it('updates style, props, page size, and clamps on page shrink', () => {
    const store = useEditorStore();
    store.addElement('button');
    const id = store.selectedElementId!;

    store.updateElementProps(id, { text: 'Go' });
    store.updateElementStyle(id, { opacity: 2, x: 300, y: 600 });
    store.updatePageSize(80, 40);

    expect(store.selectedElement!.props.text).toBe('Go');
    expect(store.selectedElement!.style.opacity).toBe(1);
    expect(store.selectedElement!.style.x + store.selectedElement!.style.width).toBeLessThanOrEqual(80);
    expect(store.selectedElement!.style.y + store.selectedElement!.style.height).toBeLessThanOrEqual(40);
  });

  it('saves, restores, exports, and rejects invalid imports', () => {
    const store = useEditorStore();
    store.addElement('text');
    const before = store.work.id;
    store.saveToLocalStorage();

    const nextStore = useEditorStore();
    nextStore.loadFromLocalStorage();
    expect(nextStore.work.id).toBe(before);

    const exported = nextStore.exportWork();
    expect(JSON.parse(exported).id).toBe(before);

    expect(nextStore.importWork('{"pages":[]}')).toBe(false);
    expect(nextStore.work.id).toBe(before);
  });
});
