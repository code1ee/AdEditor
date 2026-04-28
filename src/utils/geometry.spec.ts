import { describe, expect, it } from 'vitest';
import { clampRectToPage, getGuideCandidates, isRectInsidePage, resizePageWithClampedElements, snapRectToGuides } from './geometry';
import { createDefaultPage } from './createElement';

describe('geometry helpers', () => {
  it('clamps rectangles inside page bounds', () => {
    const rect = clampRectToPage({ x: 90, y: 90, width: 40, height: 40 }, { width: 100, height: 100 });

    expect(rect).toEqual({ x: 60, y: 60, width: 40, height: 40 });
    expect(isRectInsidePage(rect, { width: 100, height: 100 })).toBe(true);
  });

  it('shrinks oversized elements to fit tiny positive pages', () => {
    const rect = clampRectToPage({ x: 0, y: 0, width: 1000, height: 1000 }, { width: 3, height: 2 });

    expect(rect).toEqual({ x: 0, y: 0, width: 3, height: 2 });
  });

  it('clamps existing elements when page dimensions shrink', () => {
    const page = createDefaultPage();
    page.elements = [
      {
        id: 'el',
        type: 'text',
        name: 'Text',
        locked: false,
        hidden: false,
        props: { text: 'Hello' },
        style: { x: 350, y: 600, width: 100, height: 100, zIndex: 1, opacity: 1 }
      }
    ];

    const resized = resizePageWithClampedElements(page, 120, 80);
    const element = resized.elements[0];

    expect(element.style.x + element.style.width).toBeLessThanOrEqual(120);
    expect(element.style.y + element.style.height).toBeLessThanOrEqual(80);
  });

  it('creates snap guides from page and visible elements while excluding hidden elements', () => {
    const page = createDefaultPage();
    page.elements = [
      {
        id: 'visible',
        type: 'text',
        name: 'Visible',
        locked: true,
        hidden: false,
        props: {},
        style: { x: 100, y: 100, width: 40, height: 40, zIndex: 1 }
      },
      {
        id: 'hidden',
        type: 'text',
        name: 'Hidden',
        locked: false,
        hidden: true,
        props: {},
        style: { x: 200, y: 200, width: 40, height: 40, zIndex: 2 }
      }
    ];

    const guides = getGuideCandidates(page, 'moving');
    expect(guides.some((guide) => guide.targetElementId === 'visible')).toBe(true);
    expect(guides.some((guide) => guide.targetElementId === 'hidden')).toBe(false);

    const snapped = snapRectToGuides({ x: 96, y: 10, width: 20, height: 20 }, page, 'moving');
    expect(snapped.rect.x).toBe(100);
    expect(isRectInsidePage(snapped.rect, page)).toBe(true);
  });
});
