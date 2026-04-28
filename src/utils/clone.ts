import type { ElementSchema } from '@/models/element';
import type { PageSchema } from '@/models/page';
import { createId } from './id';

export function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function cloneElementWithNewId(element: ElementSchema, idPrefix = element.type): ElementSchema {
  return {
    ...cloneJson(element),
    id: createId(idPrefix)
  };
}

export function clonePageWithNewIds(page: PageSchema, title?: string): PageSchema {
  return {
    ...cloneJson(page),
    id: createId('page'),
    title: title ?? `${page.title} Copy`,
    elements: page.elements.map((element) => cloneElementWithNewId(element))
  };
}
