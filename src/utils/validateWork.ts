import type { ElementSchema } from '@/models/element';
import type { PageSchema } from '@/models/page';
import type { WorkSchema } from '@/models/work';
import { isPositiveFinite, isRectInsidePage, styleToRect } from './geometry';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  work?: WorkSchema;
}

export function parseWorkJson(jsonText: string): ValidationResult {
  try {
    return validateWork(JSON.parse(jsonText));
  } catch {
    return { valid: false, errors: ['JSON text cannot be parsed.'] };
  }
}

export function validateWork(value: unknown, supportedTypes = ['text', 'image', 'button']): ValidationResult {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return { valid: false, errors: ['Work must be an object.'] };
  }

  const work = value as unknown as WorkSchema;
  if (typeof work.id !== 'string' || !work.id) errors.push('Work id is required.');
  if (typeof work.title !== 'string' || !work.title) errors.push('Work title is required.');
  if (!Array.isArray(work.pages) || work.pages.length === 0) errors.push('Work must contain at least one page.');

  if (Array.isArray(work.pages)) {
    const pageIds = new Set<string>();
    for (const page of work.pages) {
      validatePage(page, supportedTypes, errors);
      if (typeof page.id === 'string') {
        if (pageIds.has(page.id)) errors.push(`Duplicate page id: ${page.id}.`);
        pageIds.add(page.id);
      }
    }
    if (!work.currentPageId || !work.pages.some((page) => page.id === work.currentPageId)) {
      errors.push('currentPageId must match an existing page.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    work: errors.length === 0 ? work : undefined
  };
}

function validatePage(page: PageSchema, supportedTypes: string[], errors: string[]): void {
  if (!isRecord(page)) {
    errors.push('Page must be an object.');
    return;
  }
  if (typeof page.id !== 'string' || !page.id) errors.push('Page id is required.');
  if (typeof page.title !== 'string' || !page.title) errors.push('Page title is required.');
  if (!isPositiveFinite(page.width)) errors.push('Page width must be positive and finite.');
  if (!isPositiveFinite(page.height)) errors.push('Page height must be positive and finite.');
  if (!Array.isArray(page.elements)) {
    errors.push('Page elements must be an array.');
    return;
  }

  const ids = new Set<string>();
  for (const element of page.elements) {
    validateElement(element, page, supportedTypes, errors);
    if (typeof element.id === 'string') {
      if (ids.has(element.id)) errors.push(`Duplicate element id: ${element.id}.`);
      ids.add(element.id);
    }
  }
}

function validateElement(
  element: ElementSchema,
  page: PageSchema,
  supportedTypes: string[],
  errors: string[]
): void {
  if (!isRecord(element)) {
    errors.push('Element must be an object.');
    return;
  }
  if (typeof element.id !== 'string' || !element.id) errors.push('Element id is required.');
  if (typeof element.type !== 'string' || !supportedTypes.includes(element.type)) {
    errors.push(`Unsupported element type: ${String(element.type)}.`);
  }
  if (!isRecord(element.props)) errors.push('Element props must be an object.');
  if (typeof element.locked !== 'boolean') errors.push(`Element ${element.id || '(unknown)'} locked must be boolean.`);
  if (typeof element.hidden !== 'boolean') errors.push(`Element ${element.id || '(unknown)'} hidden must be boolean.`);
  if (!isRecord(element.style)) {
    errors.push('Element style is required.');
    return;
  }
  if (!isRectInsidePage(styleToRect(element.style), page)) {
    errors.push(`Element ${element.id || '(unknown)'} geometry must fit inside page.`);
  }
  if (element.style.opacity !== undefined && !isOpacity(element.style.opacity)) {
    errors.push(`Element ${element.id || '(unknown)'} opacity must be between 0 and 1.`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOpacity(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}
