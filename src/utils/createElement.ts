import type { ElementSchema, ElementStyle } from '@/models/element';
import type { PageSchema } from '@/models/page';
import type { EditorPlugin } from '@/models/plugin';
import type { WorkSchema } from '@/models/work';
import { clampRectToPage } from './geometry';
import { createId } from './id';

export const SCHEMA_VERSION = '0.1.0';

export function createDefaultPage(): PageSchema {
  return {
    id: createId('page'),
    title: 'Page 1',
    backgroundColor: '#ffffff',
    width: 375,
    height: 667,
    elements: []
  };
}

export function createBlankWork(): WorkSchema {
  const page = createDefaultPage();
  const now = new Date().toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    id: createId('work'),
    title: 'Untitled Work',
    pages: [page],
    currentPageId: page.id,
    createdAt: now,
    updatedAt: now
  };
}

export function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createElementFromPlugin(plugin: EditorPlugin, page: PageSchema): ElementSchema {
  const baseStyle: ElementStyle = {
    x: 24,
    y: 24,
    width: 120,
    height: 48,
    zIndex: nextZIndex(page),
    opacity: 1,
    ...cloneJson(plugin.defaultStyle)
  };
  const rect = clampRectToPage(baseStyle, page);

  return {
    id: createId(plugin.type),
    type: plugin.type,
    name: plugin.title,
    locked: false,
    hidden: false,
    props: cloneJson(plugin.defaultProps),
    style: { ...baseStyle, ...rect },
    events: [],
    animations: []
  };
}

export function nextZIndex(page: PageSchema): number {
  return page.elements.reduce((max, element) => Math.max(max, element.style.zIndex), 0) + 1;
}
