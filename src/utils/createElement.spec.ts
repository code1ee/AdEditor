import { describe, expect, it } from 'vitest';
import { createBlankWork, createDefaultPage, createElementFromPlugin } from './createElement';
import { textPlugin } from '@/plugins/text';

describe('createElement utilities', () => {
  it('creates a blank work with one current page', () => {
    const work = createBlankWork();

    expect(work.schemaVersion).toBe('0.1.0');
    expect(work.pages).toHaveLength(1);
    expect(work.currentPageId).toBe(work.pages[0].id);
    expect(work.pages[0].width).toBe(375);
    expect(work.pages[0].height).toBe(667);
  });

  it('creates plugin elements with cloned defaults inside the page', () => {
    const page = createDefaultPage();
    const element = createElementFromPlugin(textPlugin, page);

    expect(element.type).toBe('text');
    expect(element.props).toEqual({ text: 'Text' });
    expect(element.style.x).toBeGreaterThanOrEqual(0);
    expect(element.style.y).toBeGreaterThanOrEqual(0);
    expect(element.style.x + element.style.width).toBeLessThanOrEqual(page.width);
  });
});
