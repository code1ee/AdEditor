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

export interface AlignmentGuide {
  axis: 'x' | 'y';
  position: number;
  source: 'page-edge' | 'page-center' | 'element-edge' | 'element-center';
  targetElementId?: string | null;
}

export interface SnapResult {
  rect: Rect;
  guides: AlignmentGuide[];
}

export const MIN_ELEMENT_SIZE = 1;
export const SNAP_TOLERANCE = 5;

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

export function centerX(rect: Rect): number {
  return rect.x + rect.width / 2;
}

export function centerY(rect: Rect): number {
  return rect.y + rect.height / 2;
}

export function getGuideCandidates(page: PageSchema, movingElementId?: string): AlignmentGuide[] {
  const pageGuides: AlignmentGuide[] = [
    { axis: 'x', position: 0, source: 'page-edge' },
    { axis: 'x', position: page.width / 2, source: 'page-center' },
    { axis: 'x', position: page.width, source: 'page-edge' },
    { axis: 'y', position: 0, source: 'page-edge' },
    { axis: 'y', position: page.height / 2, source: 'page-center' },
    { axis: 'y', position: page.height, source: 'page-edge' }
  ];

  const elementGuides = page.elements
    .filter((element) => !element.hidden && element.id !== movingElementId)
    .flatMap((element): AlignmentGuide[] => {
      const rect = styleToRect(element.style);
      return [
        { axis: 'x', position: rect.x, source: 'element-edge', targetElementId: element.id },
        { axis: 'x', position: centerX(rect), source: 'element-center', targetElementId: element.id },
        { axis: 'x', position: rect.x + rect.width, source: 'element-edge', targetElementId: element.id },
        { axis: 'y', position: rect.y, source: 'element-edge', targetElementId: element.id },
        { axis: 'y', position: centerY(rect), source: 'element-center', targetElementId: element.id },
        { axis: 'y', position: rect.y + rect.height, source: 'element-edge', targetElementId: element.id }
      ];
    });

  return [...pageGuides, ...elementGuides];
}

export function snapRectToGuides(
  rect: Rect,
  page: PageSchema,
  movingElementId?: string,
  tolerance = SNAP_TOLERANCE
): SnapResult {
  const candidates = getGuideCandidates(page, movingElementId);
  let nextRect = { ...rect };
  const guides: AlignmentGuide[] = [];
  const xAnchors = [
    { value: rect.x, apply: (position: number) => ({ ...nextRect, x: position }) },
    { value: centerX(rect), apply: (position: number) => ({ ...nextRect, x: position - rect.width / 2 }) },
    { value: rect.x + rect.width, apply: (position: number) => ({ ...nextRect, x: position - rect.width }) }
  ];
  const yAnchors = [
    { value: rect.y, apply: (position: number) => ({ ...nextRect, y: position }) },
    { value: centerY(rect), apply: (position: number) => ({ ...nextRect, y: position - rect.height / 2 }) },
    { value: rect.y + rect.height, apply: (position: number) => ({ ...nextRect, y: position - rect.height }) }
  ];

  const xGuide = nearestGuide(xAnchors.map((anchor) => anchor.value), candidates.filter((guide) => guide.axis === 'x'), tolerance);
  if (xGuide) {
    const anchor = xAnchors[xGuide.anchorIndex];
    nextRect = anchor.apply(xGuide.guide.position);
    guides.push(xGuide.guide);
  }

  const yGuide = nearestGuide(yAnchors.map((anchor) => anchor.value), candidates.filter((guide) => guide.axis === 'y'), tolerance);
  if (yGuide) {
    const anchor = yAnchors[yGuide.anchorIndex];
    nextRect = anchor.apply(yGuide.guide.position);
    guides.push(yGuide.guide);
  }

  return {
    rect: clampRectToPage(nextRect, page),
    guides
  };
}

function nearestGuide(
  anchors: number[],
  guides: AlignmentGuide[],
  tolerance: number
): { guide: AlignmentGuide; anchorIndex: number } | null {
  let best: { guide: AlignmentGuide; anchorIndex: number; distance: number } | null = null;
  for (let anchorIndex = 0; anchorIndex < anchors.length; anchorIndex += 1) {
    const anchor = anchors[anchorIndex];
    for (const guide of guides) {
      const distance = Math.abs(anchor - guide.position);
      if (distance <= tolerance && (!best || distance < best.distance)) {
        best = { guide, anchorIndex, distance };
      }
    }
  }
  return best ? { guide: best.guide, anchorIndex: best.anchorIndex } : null;
}
