import type { ElementSchema, ElementStyle } from '@/models/element';
import type { PageSchema } from '@/models/page';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PageBounds {
  width: number;
  height: number;
}

export const MIN_ELEMENT_SIZE = 1;

export function isPositiveFinite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function normalizePositiveFinite(value: unknown, fallback: number): number {
  if (isPositiveFinite(value)) {
    return value;
  }
  return isPositiveFinite(fallback) ? fallback : 1;
}

export function clampNumber(value: number, min: number, max: number): number {
  if (max < min) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

export function clampRectToPage(rect: Rect, page: PageBounds): Rect {
  const pageWidth = normalizePositiveFinite(page.width, 1);
  const pageHeight = normalizePositiveFinite(page.height, 1);
  const width = clampNumber(normalizePositiveFinite(rect.width, MIN_ELEMENT_SIZE), MIN_ELEMENT_SIZE, pageWidth);
  const height = clampNumber(normalizePositiveFinite(rect.height, MIN_ELEMENT_SIZE), MIN_ELEMENT_SIZE, pageHeight);
  const x = clampNumber(Number.isFinite(rect.x) ? rect.x : 0, 0, pageWidth - width);
  const y = clampNumber(Number.isFinite(rect.y) ? rect.y : 0, 0, pageHeight - height);

  return { x, y, width, height };
}

export function isRectInsidePage(rect: Rect, page: PageBounds): boolean {
  return (
    isPositiveFinite(page.width) &&
    isPositiveFinite(page.height) &&
    Number.isFinite(rect.x) &&
    Number.isFinite(rect.y) &&
    isPositiveFinite(rect.width) &&
    isPositiveFinite(rect.height) &&
    rect.x >= 0 &&
    rect.y >= 0 &&
    rect.x + rect.width <= page.width &&
    rect.y + rect.height <= page.height
  );
}

export function styleToRect(style: ElementStyle): Rect {
  return {
    x: style.x,
    y: style.y,
    width: style.width,
    height: style.height
  };
}

export function applyRectToStyle(style: ElementStyle, rect: Rect): ElementStyle {
  return {
    ...style,
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height
  };
}

export function clampElementToPage(element: ElementSchema, page: PageBounds): ElementSchema {
  return {
    ...element,
    style: applyRectToStyle(element.style, clampRectToPage(styleToRect(element.style), page))
  };
}

export function clampElementsToPage(elements: ElementSchema[], page: PageBounds): ElementSchema[] {
  return elements.map((element) => clampElementToPage(element, page));
}

export function resizePageWithClampedElements(page: PageSchema, width: number, height: number): PageSchema {
  const nextBounds = {
    width: normalizePositiveFinite(width, page.width),
    height: normalizePositiveFinite(height, page.height)
  };
  return {
    ...page,
    ...nextBounds,
    elements: clampElementsToPage(page.elements, nextBounds)
  };
}
