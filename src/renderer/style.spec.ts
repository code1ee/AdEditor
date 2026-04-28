import { describe, expect, it } from 'vitest';
import { toElementStyle } from './style';

describe('toElementStyle', () => {
  it('maps ElementStyle into absolute inline styles', () => {
    const style = toElementStyle({
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      zIndex: 3,
      opacity: 0.5,
      backgroundColor: '#fff'
    });

    expect(style.left).toBe('10px');
    expect(style.top).toBe('20px');
    expect(style.width).toBe('100px');
    expect(style.height).toBe('50px');
    expect(style.zIndex).toBe(3);
    expect(style.backgroundColor).toBe('#fff');
  });
});
