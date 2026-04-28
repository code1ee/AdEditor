import { describe, expect, it } from 'vitest';
import { isFormControl, matchShortcut } from './shortcuts';

describe('shortcuts', () => {
  it('matches common editor commands', () => {
    expect(matchShortcut(new KeyboardEvent('keydown', { key: 'z', metaKey: true }))).toBe('undo');
    expect(matchShortcut(new KeyboardEvent('keydown', { key: 'z', metaKey: true, shiftKey: true }))).toBe('redo');
    expect(matchShortcut(new KeyboardEvent('keydown', { key: 'Delete' }))).toBe('delete');
  });

  it('detects form controls', () => {
    const input = document.createElement('input');
    const div = document.createElement('div');
    expect(isFormControl(input)).toBe(true);
    expect(isFormControl(div)).toBe(false);
  });
});
