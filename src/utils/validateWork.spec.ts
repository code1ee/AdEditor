import { describe, expect, it } from 'vitest';
import { createBlankWork } from './createElement';
import { validateWork } from './validateWork';

describe('validateWork', () => {
  it('accepts a blank work', () => {
    expect(validateWork(createBlankWork()).valid).toBe(true);
  });

  it('rejects invalid page sizes', () => {
    const work = createBlankWork();
    work.pages[0].width = 0;

    const result = validateWork(work);

    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('Page width');
  });

  it('rejects elements outside page bounds', () => {
    const work = createBlankWork();
    work.pages[0].elements.push({
      id: 'el',
      type: 'text',
      name: 'Text',
      locked: false,
      hidden: false,
      props: { text: 'Hello' },
      style: { x: 360, y: 0, width: 20, height: 20, zIndex: 1, opacity: 1 }
    });

    const result = validateWork(work);

    expect(result.valid).toBe(false);
    expect(result.errors.join(' ')).toContain('geometry');
  });
});
