import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { ElementSchema, ElementStyle } from '@/models/element';
import type { PageSchema } from '@/models/page';
import type { WorkSchema } from '@/models/work';
import { pluginRegistry } from '@/plugins';
import { createBlankWork as createBlankWorkData, createElementFromPlugin } from '@/utils/createElement';
import { stringifyWork } from '@/utils/exportJson';
import {
  clampElementToPage,
  clampRectToPage,
  normalizePositiveFinite,
  resizePageWithClampedElements,
  styleToRect
} from '@/utils/geometry';
import { loadWorkFromStorage, saveWorkToStorage } from '@/utils/storage';
import { parseWorkJson } from '@/utils/validateWork';

export type EditorMode = 'edit' | 'preview';

export const useEditorStore = defineStore('editor', () => {
  const work = ref<WorkSchema>(createBlankWorkData());
  const currentPageId = ref(work.value.currentPageId ?? work.value.pages[0]?.id ?? '');
  const selectedElementId = ref<string | null>(null);
  const zoom = ref(1);
  const mode = ref<EditorMode>('edit');
  const saving = ref(false);
  const lastSavedAt = ref<string | null>(null);
  const errorMessage = ref<string | null>(null);

  const currentPage = computed<PageSchema>(() => {
    return work.value.pages.find((page) => page.id === currentPageId.value) ?? work.value.pages[0];
  });

  const selectedElement = computed<ElementSchema | null>(() => {
    if (!selectedElementId.value) return null;
    return currentPage.value.elements.find((element) => element.id === selectedElementId.value) ?? null;
  });

  function createBlankWork(): void {
    work.value = createBlankWorkData();
    currentPageId.value = work.value.currentPageId ?? work.value.pages[0].id;
    selectedElementId.value = null;
    errorMessage.value = null;
  }

  function setWork(nextWork: WorkSchema): void {
    work.value = touch(nextWork);
    currentPageId.value = nextWork.currentPageId ?? nextWork.pages[0].id;
    selectedElementId.value = null;
  }

  function setCurrentPage(pageId: string): void {
    if (work.value.pages.some((page) => page.id === pageId)) {
      currentPageId.value = pageId;
      work.value.currentPageId = pageId;
      selectedElementId.value = null;
    }
  }

  function selectElement(elementId: string): void {
    selectedElementId.value = currentPage.value.elements.some((element) => element.id === elementId) ? elementId : null;
  }

  function clearSelection(): void {
    selectedElementId.value = null;
  }

  function addElement(pluginType: string): void {
    const plugin = pluginRegistry.get(pluginType);
    if (!plugin) {
      setError(`Unknown component type: ${pluginType}`);
      return;
    }
    const element = createElementFromPlugin(plugin, currentPage.value);
    replaceCurrentPage({
      ...currentPage.value,
      elements: [...currentPage.value.elements, element]
    });
    selectedElementId.value = element.id;
  }

  function deleteSelectedElement(): void {
    if (!selectedElementId.value) return;
    replaceCurrentPage({
      ...currentPage.value,
      elements: currentPage.value.elements.filter((element) => element.id !== selectedElementId.value)
    });
    selectedElementId.value = null;
  }

  function moveElement(elementId: string, x: number, y: number): void {
    updateElementStyle(elementId, { x, y });
  }

  function resizeElement(elementId: string, width: number, height: number, x?: number, y?: number): void {
    updateElementStyle(elementId, { width, height, ...(x !== undefined ? { x } : {}), ...(y !== undefined ? { y } : {}) });
  }

  function updateElementStyle(elementId: string, patch: Partial<ElementStyle>): void {
    replaceElement(elementId, (element) => {
      const nextStyle = {
        ...element.style,
        ...patch,
        opacity: patch.opacity !== undefined ? clampOpacity(patch.opacity) : element.style.opacity
      };
      return clampElementToPage({ ...element, style: nextStyle }, currentPage.value);
    });
  }

  function updateElementProps(elementId: string, patch: Record<string, unknown>): void {
    replaceElement(elementId, (element) => ({
      ...element,
      props: { ...element.props, ...patch }
    }));
  }

  function updatePageSize(width: number, height: number): void {
    const nextPage = resizePageWithClampedElements(
      currentPage.value,
      normalizePositiveFinite(width, currentPage.value.width),
      normalizePositiveFinite(height, currentPage.value.height)
    );
    replaceCurrentPage(nextPage);
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
      if (storedWork) setWork(storedWork);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load saved work.');
      createBlankWork();
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
    setWork(result.work);
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

  return {
    work,
    currentPageId,
    currentPage,
    selectedElementId,
    selectedElement,
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
    clearSelection,
    addElement,
    deleteSelectedElement,
    moveElement,
    resizeElement,
    updatePageSize,
    updateElementStyle,
    updateElementProps,
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
