import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { ElementSchema, ElementStyle } from '@/models/element';
import type { PageSchema } from '@/models/page';
import type { WorkSchema } from '@/models/work';
import { pluginRegistry } from '@/plugins';
import { createBlankWork as createBlankWorkData, createDefaultPage, createElementFromPlugin } from '@/utils/createElement';
import { stringifyWork } from '@/utils/exportJson';
import {
  clampElementToPage,
  clampRectToPage,
  normalizePositiveFinite,
  resizePageWithClampedElements,
  styleToRect
} from '@/utils/geometry';
import { createHistoryState, createSnapshot, popRedo, popUndo, pushHistory, resetHistory, type HistoryState } from '@/utils/history';
import { cloneElementWithNewId, cloneJson, clonePageWithNewIds } from '@/utils/clone';
import { moveLayer, normalizeLayerOrder } from '@/utils/layers';
import { loadWorkFromStorage, saveWorkToStorage } from '@/utils/storage';
import { parseWorkJson } from '@/utils/validateWork';

export type EditorMode = 'edit' | 'preview';
export type CommandResult = { ok: true } | { ok: false; message: string };
export type AlignCommand = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
export type DistributeCommand = 'horizontal' | 'vertical';

export const useEditorStore = defineStore('editor', () => {
  const work = ref<WorkSchema>(createBlankWorkData());
  const currentPageId = ref(work.value.currentPageId);
  const selectedElementIds = ref<string[]>([]);
  const clipboardElement = ref<ElementSchema | null>(null);
  const history = ref<HistoryState>(createHistoryState());
  const zoom = ref(1);
  const mode = ref<EditorMode>('edit');
  const saving = ref(false);
  const lastSavedAt = ref<string | null>(null);
  const errorMessage = ref<string | null>(null);

  const currentPage = computed<PageSchema>(() => {
    return work.value.pages.find((page) => page.id === currentPageId.value) ?? work.value.pages[0];
  });

  const selectedElementId = computed<string | null>({
    get: () => selectedElementIds.value[0] ?? null,
    set: (value) => {
      selectedElementIds.value = value ? [value] : [];
    }
  });

  const selectedElement = computed<ElementSchema | null>(() => {
    const id = selectedElementId.value;
    if (!id) return null;
    return currentPage.value.elements.find((element) => element.id === id) ?? null;
  });

  const selectedElements = computed<ElementSchema[]>(() => {
    const ids = new Set(selectedElementIds.value);
    return currentPage.value.elements.filter((element) => ids.has(element.id));
  });

  const canUndo = computed(() => history.value.undoStack.length > 0);
  const canRedo = computed(() => history.value.redoStack.length > 0);
  const canCopy = computed(() => selectedElements.value.length === 1 && !selectedElements.value[0].locked);
  const canPaste = computed(() => clipboardElement.value !== null);

  function createBlankWork(): void {
    setWork(createBlankWorkData(), { resetHistory: true });
    errorMessage.value = null;
  }

  function setWork(nextWork: WorkSchema, options: { resetHistory?: boolean } = {}): void {
    const normalized = normalizeWork(nextWork);
    work.value = touch(normalized);
    currentPageId.value = normalized.currentPageId;
    selectedElementIds.value = [];
    if (options.resetHistory) history.value = resetHistory(history.value);
  }

  function setCurrentPage(pageId: string): CommandResult {
    if (!work.value.pages.some((page) => page.id === pageId)) {
      return block('Page does not exist.');
    }
    return commit('Switch page', () => {
      currentPageId.value = pageId;
      work.value = touch({ ...work.value, currentPageId: pageId });
      selectedElementIds.value = [];
    });
  }

  function selectElement(elementId: string): void {
    selectedElementIds.value = currentPage.value.elements.some((element) => element.id === elementId) ? [elementId] : [];
  }

  function addToSelection(elementId: string): void {
    if (!currentPage.value.elements.some((element) => element.id === elementId)) return;
    if (!selectedElementIds.value.includes(elementId)) selectedElementIds.value = [...selectedElementIds.value, elementId];
  }

  function removeFromSelection(elementId: string): void {
    selectedElementIds.value = selectedElementIds.value.filter((id) => id !== elementId);
  }

  function setSelection(elementIds: string[]): void {
    const valid = new Set(currentPage.value.elements.map((element) => element.id));
    selectedElementIds.value = Array.from(new Set(elementIds.filter((id) => valid.has(id))));
  }

  function clearSelection(): void {
    selectedElementIds.value = [];
  }

  function addElement(pluginType: string): CommandResult {
    const plugin = pluginRegistry.get(pluginType);
    if (!plugin) return block(`Unknown component type: ${pluginType}`);
    return commit('Add element', () => {
      const element = createElementFromPlugin(plugin, currentPage.value);
      replaceCurrentPage({
        ...currentPage.value,
        elements: [...currentPage.value.elements, element]
      });
      selectedElementIds.value = [element.id];
    });
  }

  function deleteSelectedElement(): CommandResult {
    return deleteSelectedElements();
  }

  function deleteSelectedElements(): CommandResult {
    const ids = new Set(selectedElementIds.value);
    const editableIds = new Set(selectedElements.value.filter((element) => !element.locked).map((element) => element.id));
    if (ids.size === 0) return block('No element selected.');
    if (editableIds.size === 0) return block('Selected element is locked.');
    return commit('Delete element', () => {
      replaceCurrentPage({
        ...currentPage.value,
        elements: currentPage.value.elements.filter((element) => !editableIds.has(element.id))
      });
      selectedElementIds.value = selectedElementIds.value.filter((id) => !editableIds.has(id));
    });
  }

  function moveElement(elementId: string, x: number, y: number): CommandResult {
    return updateElementStyle(elementId, { x, y }, 'Move element');
  }

  function resizeElement(elementId: string, width: number, height: number, x?: number, y?: number): CommandResult {
    return updateElementStyle(
      elementId,
      { width, height, ...(x !== undefined ? { x } : {}), ...(y !== undefined ? { y } : {}) },
      'Resize element'
    );
  }

  function updateElementStyle(elementId: string, patch: Partial<ElementStyle>, label = 'Update style'): CommandResult {
    const element = findElement(elementId);
    if (!element) return block('Element does not exist.');
    if (element.locked) return block('Selected element is locked.');
    return commit(label, () => {
      replaceElement(elementId, (item) => {
        const nextStyle = {
          ...item.style,
          ...patch,
          opacity: patch.opacity !== undefined ? clampOpacity(patch.opacity) : item.style.opacity
        };
        return clampElementToPage({ ...item, style: nextStyle }, currentPage.value);
      });
    });
  }

  function updateElementProps(elementId: string, patch: Record<string, unknown>): CommandResult {
    const element = findElement(elementId);
    if (!element) return block('Element does not exist.');
    if (element.locked) return block('Selected element is locked.');
    return commit('Update props', () => {
      replaceElement(elementId, (item) => ({
        ...item,
        props: { ...item.props, ...patch }
      }));
    });
  }

  function updatePageSize(width: number, height: number): CommandResult {
    return commit('Update page size', () => {
      const nextPage = resizePageWithClampedElements(
        currentPage.value,
        normalizePositiveFinite(width, currentPage.value.width),
        normalizePositiveFinite(height, currentPage.value.height)
      );
      replaceCurrentPage(nextPage);
    });
  }

  function copySelectedElement(): CommandResult {
    if (!canCopy.value || !selectedElement.value) return block('No editable element selected.');
    clipboardElement.value = cloneJson(selectedElement.value);
    errorMessage.value = null;
    return { ok: true };
  }

  function pasteElement(): CommandResult {
    const source = clipboardElement.value;
    if (!source) return block('Clipboard is empty.');
    return commit('Paste element', () => {
      const pasted = cloneElementWithNewId(source);
      const nextStyle = {
        ...pasted.style,
        x: pasted.style.x + 12,
        y: pasted.style.y + 12,
        zIndex: nextZIndex(currentPage.value)
      };
      const nextElement = clampElementToPage({ ...pasted, locked: false, hidden: false, style: nextStyle }, currentPage.value);
      replaceCurrentPage({
        ...currentPage.value,
        elements: [...currentPage.value.elements, nextElement]
      });
      selectedElementIds.value = [nextElement.id];
    });
  }

  function addPage(): CommandResult {
    return commit('Add page', () => {
      const page = createDefaultPage();
      page.title = `Page ${work.value.pages.length + 1}`;
      work.value = touch({
        ...work.value,
        pages: [...work.value.pages, page],
        currentPageId: page.id
      });
      currentPageId.value = page.id;
      selectedElementIds.value = [];
    });
  }

  function duplicatePage(pageId = currentPageId.value): CommandResult {
    const source = work.value.pages.find((page) => page.id === pageId);
    if (!source) return block('Page does not exist.');
    return commit('Duplicate page', () => {
      const page = clonePageWithNewIds(source, `${source.title} Copy`);
      const index = work.value.pages.findIndex((item) => item.id === pageId);
      const pages = [...work.value.pages];
      pages.splice(index + 1, 0, page);
      work.value = touch({ ...work.value, pages, currentPageId: page.id });
      currentPageId.value = page.id;
      selectedElementIds.value = [];
    });
  }

  function deletePage(pageId = currentPageId.value): CommandResult {
    if (work.value.pages.length <= 1) return block('Work must contain at least one page.');
    const index = work.value.pages.findIndex((page) => page.id === pageId);
    if (index < 0) return block('Page does not exist.');
    return commit('Delete page', () => {
      const pages = work.value.pages.filter((page) => page.id !== pageId);
      const nextPage = pages[Math.min(index, pages.length - 1)];
      work.value = touch({ ...work.value, pages, currentPageId: nextPage.id });
      currentPageId.value = nextPage.id;
      selectedElementIds.value = [];
    });
  }

  function moveLayerUp(elementId = selectedElementId.value): CommandResult {
    return moveSelectedLayer(elementId, 'up', 'Move layer up');
  }

  function moveLayerDown(elementId = selectedElementId.value): CommandResult {
    return moveSelectedLayer(elementId, 'down', 'Move layer down');
  }

  function bringLayerToTop(elementId = selectedElementId.value): CommandResult {
    return moveSelectedLayer(elementId, 'top', 'Bring to top');
  }

  function sendLayerToBottom(elementId = selectedElementId.value): CommandResult {
    return moveSelectedLayer(elementId, 'bottom', 'Send to bottom');
  }

  function lockElement(elementId = selectedElementId.value): CommandResult {
    return setElementFlag(elementId, 'locked', true, 'Lock element');
  }

  function unlockElement(elementId = selectedElementId.value): CommandResult {
    return setElementFlag(elementId, 'locked', false, 'Unlock element');
  }

  function hideElement(elementId = selectedElementId.value): CommandResult {
    return setElementFlag(elementId, 'hidden', true, 'Hide element');
  }

  function showElement(elementId = selectedElementId.value): CommandResult {
    return setElementFlag(elementId, 'hidden', false, 'Show element');
  }

  function toggleSelectedLock(): CommandResult {
    const element = selectedElement.value;
    if (!element) return block('No element selected.');
    return element.locked ? unlockElement(element.id) : lockElement(element.id);
  }

  function toggleSelectedHidden(): CommandResult {
    const element = selectedElement.value;
    if (!element) return block('No element selected.');
    return element.hidden ? showElement(element.id) : hideElement(element.id);
  }

  function alignSelected(command: AlignCommand): CommandResult {
    const editable = selectedElements.value.filter((element) => !element.locked);
    if (editable.length === 0) return block('No editable element selected.');
    const target = alignmentTarget(editable, command);
    return commit('Align elements', () => {
      editable.forEach((element) => {
        const rect = styleToRect(element.style);
        const patch: Partial<ElementStyle> = {};
        if (command === 'left') patch.x = target;
        if (command === 'center') patch.x = target - rect.width / 2;
        if (command === 'right') patch.x = target - rect.width;
        if (command === 'top') patch.y = target;
        if (command === 'middle') patch.y = target - rect.height / 2;
        if (command === 'bottom') patch.y = target - rect.height;
        replaceElement(element.id, (item) => clampElementToPage({ ...item, style: { ...item.style, ...patch } }, currentPage.value));
      });
    });
  }

  function distributeSelected(command: DistributeCommand): CommandResult {
    const editable = selectedElements.value.filter((element) => !element.locked);
    if (editable.length < 3) return block('At least three editable elements are required.');
    const sorted = editable
      .slice()
      .sort((a, b) => (command === 'horizontal' ? a.style.x - b.style.x : a.style.y - b.style.y));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const firstCenter = command === 'horizontal' ? first.style.x + first.style.width / 2 : first.style.y + first.style.height / 2;
    const lastCenter = command === 'horizontal' ? last.style.x + last.style.width / 2 : last.style.y + last.style.height / 2;
    const step = (lastCenter - firstCenter) / (sorted.length - 1);
    return commit('Distribute elements', () => {
      sorted.forEach((element, index) => {
        const center = firstCenter + step * index;
        const patch =
          command === 'horizontal'
            ? { x: center - element.style.width / 2 }
            : { y: center - element.style.height / 2 };
        replaceElement(element.id, (item) => clampElementToPage({ ...item, style: { ...item.style, ...patch } }, currentPage.value));
      });
    });
  }

  function undo(): CommandResult {
    const result = popUndo(history.value);
    if (!result.entry) return block('Nothing to undo.');
    history.value = result.state;
    restoreSnapshot(result.entry.before);
    errorMessage.value = null;
    return { ok: true };
  }

  function redo(): CommandResult {
    const result = popRedo(history.value);
    if (!result.entry) return block('Nothing to redo.');
    history.value = result.state;
    restoreSnapshot(result.entry.after);
    errorMessage.value = null;
    return { ok: true };
  }

  function setZoom(nextZoom: number): void {
    zoom.value = normalizePositiveFinite(nextZoom, 1);
  }

  function setMode(nextMode: EditorMode): void {
    mode.value = nextMode;
  }

  function loadFromLocalStorage(): void {
    try {
      const storedWork = loadWorkFromStorage();
      if (storedWork) setWork(storedWork, { resetHistory: true });
    } catch {
      const message = 'Failed to load saved work.';
      createBlankWork();
      setError(message);
    }
  }

  function saveToLocalStorage(): void {
    try {
      saving.value = true;
      saveWorkToStorage(work.value);
      lastSavedAt.value = new Date().toISOString();
      errorMessage.value = null;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save work.');
    } finally {
      saving.value = false;
    }
  }

  function importWork(jsonText: string): boolean {
    const result = parseWorkJson(jsonText);
    if (!result.valid || !result.work) {
      setError(result.errors.join('\n'));
      return false;
    }
    setWork(result.work, { resetHistory: true });
    errorMessage.value = null;
    return true;
  }

  function exportWork(): string {
    return stringifyWork(work.value);
  }

  function replaceElement(elementId: string, updater: (element: ElementSchema) => ElementSchema): void {
    replaceCurrentPage({
      ...currentPage.value,
      elements: currentPage.value.elements.map((element) => (element.id === elementId ? updater(element) : element))
    });
  }

  function replaceCurrentPage(page: PageSchema): void {
    work.value = touch({
      ...work.value,
      currentPageId: currentPageId.value,
      pages: work.value.pages.map((item) => (item.id === page.id ? page : item))
    });
  }

  function setError(message: string): void {
    errorMessage.value = message;
  }

  function block(message: string): CommandResult {
    setError(message);
    return { ok: false, message };
  }

  function commit(label: string, mutation: () => void): CommandResult {
    const before = createSnapshot(work.value, currentPageId.value, selectedElementIds.value);
    mutation();
    normalizeSelection();
    const after = createSnapshot(work.value, currentPageId.value, selectedElementIds.value);
    history.value = pushHistory(history.value, label, before, after);
    errorMessage.value = null;
    return { ok: true };
  }

  function restoreSnapshot(snapshot: ReturnType<typeof createSnapshot>): void {
    work.value = cloneJson(snapshot.work);
    currentPageId.value = snapshot.currentPageId;
    selectedElementIds.value = [...snapshot.selectedElementIds];
    normalizeSelection();
  }

  function normalizeSelection(): void {
    const valid = new Set(currentPage.value.elements.map((element) => element.id));
    selectedElementIds.value = selectedElementIds.value.filter((id) => valid.has(id));
  }

  function normalizeWork(nextWork: WorkSchema): WorkSchema {
    const pages = nextWork.pages.length > 0 ? nextWork.pages : [createDefaultPage()];
    const current = pages.some((page) => page.id === nextWork.currentPageId) ? nextWork.currentPageId : pages[0].id;
    return {
      ...nextWork,
      pages: pages.map((page) => ({ ...page, elements: normalizeLayerOrder(page.elements) })),
      currentPageId: current
    };
  }

  function moveSelectedLayer(elementId: string | null, action: 'up' | 'down' | 'top' | 'bottom', label: string): CommandResult {
    if (!elementId) return block('No element selected.');
    const element = findElement(elementId);
    if (!element) return block('Element does not exist.');
    if (element.locked) return block('Selected element is locked.');
    return commit(label, () => {
      replaceCurrentPage({ ...currentPage.value, elements: moveLayer(currentPage.value.elements, elementId, action) });
    });
  }

  function setElementFlag(elementId: string | null, key: 'locked' | 'hidden', value: boolean, label: string): CommandResult {
    if (!elementId) return block('No element selected.');
    if (!findElement(elementId)) return block('Element does not exist.');
    return commit(label, () => {
      replaceElement(elementId, (element) => ({ ...element, [key]: value }));
    });
  }

  function findElement(elementId: string): ElementSchema | null {
    return currentPage.value.elements.find((element) => element.id === elementId) ?? null;
  }

  function alignmentTarget(elements: ElementSchema[], command: AlignCommand): number {
    if (command === 'left') return Math.min(...elements.map((element) => element.style.x));
    if (command === 'center') return Math.min(...elements.map((element) => element.style.x)) + groupWidth(elements) / 2;
    if (command === 'right') return Math.max(...elements.map((element) => element.style.x + element.style.width));
    if (command === 'top') return Math.min(...elements.map((element) => element.style.y));
    if (command === 'middle') return Math.min(...elements.map((element) => element.style.y)) + groupHeight(elements) / 2;
    return Math.max(...elements.map((element) => element.style.y + element.style.height));
  }

  function groupWidth(elements: ElementSchema[]): number {
    return Math.max(...elements.map((element) => element.style.x + element.style.width)) - Math.min(...elements.map((element) => element.style.x));
  }

  function groupHeight(elements: ElementSchema[]): number {
    return Math.max(...elements.map((element) => element.style.y + element.style.height)) - Math.min(...elements.map((element) => element.style.y));
  }

  return {
    work,
    currentPageId,
    currentPage,
    selectedElementId,
    selectedElementIds,
    selectedElement,
    selectedElements,
    clipboardElement,
    history,
    canUndo,
    canRedo,
    canCopy,
    canPaste,
    zoom,
    mode,
    saving,
    lastSavedAt,
    errorMessage,
    createBlankWork,
    loadFromLocalStorage,
    saveToLocalStorage,
    importWork,
    exportWork,
    setCurrentPage,
    selectElement,
    addToSelection,
    removeFromSelection,
    setSelection,
    clearSelection,
    addElement,
    deleteSelectedElement,
    deleteSelectedElements,
    moveElement,
    resizeElement,
    updatePageSize,
    updateElementStyle,
    updateElementProps,
    copySelectedElement,
    pasteElement,
    addPage,
    duplicatePage,
    deletePage,
    moveLayerUp,
    moveLayerDown,
    bringLayerToTop,
    sendLayerToBottom,
    lockElement,
    unlockElement,
    hideElement,
    showElement,
    toggleSelectedLock,
    toggleSelectedHidden,
    alignSelected,
    distributeSelected,
    undo,
    redo,
    setZoom,
    setMode
  };
});

function touch(work: WorkSchema): WorkSchema {
  return { ...work, updatedAt: new Date().toISOString() };
}

function clampOpacity(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(value, 0), 1);
}

function nextZIndex(page: PageSchema): number {
  return page.elements.reduce((max, element) => Math.max(max, element.style.zIndex), 0) + 1;
}
