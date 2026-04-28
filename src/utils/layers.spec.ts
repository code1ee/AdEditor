import { describe, expect, it } from 'vitest';
import type { ElementSchema } from '@/models/element';
import { moveLayer, normalizeLayerOrder, topmostElementId } from './layers';

function element(id: string, zIndex: number, locked = false, hidden = false): ElementSchema {
  return {
    id,
    type: 'text',
    name: id,
    locked,
    hidden,
    props: {},
    style: { x: 0, y: 0, width: 10, height: 10, zIndex }
  };
}

describe('layer utilities', () => {
  it('normalizes and moves layers deterministically', () => {
    const moved = moveLayer([element('a', 1), element('b', 2), element('c', 3)], 'a', 'top');
    expect(moved.at(-1)?.id).toBe('a');
    expect(normalizeLayerOrder(moved).map((item) => item.style.zIndex)).toEqual([1, 2, 3]);
  });

  it('does not move locked elements and ignores hidden for topmost selection', () => {
    const elements = [element('a', 1, true), element('b', 2, false, true), element('c', 3)];
    expect(moveLayer(elements, 'a', 'top').at(0)?.id).toBe('a');
    expect(topmostElementId(elements)).toBe('c');
  });
});
