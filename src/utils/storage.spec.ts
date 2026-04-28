import { beforeEach, describe, expect, it } from 'vitest';
import { createBlankWork } from './createElement';
import { loadWorkFromStorage, saveWorkToStorage, WORK_STORAGE_KEY } from './storage';

describe('storage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads work JSON', () => {
    const work = createBlankWork();
    saveWorkToStorage(work);

    expect(loadWorkFromStorage()?.id).toBe(work.id);
  });

  it('returns null when no saved data exists', () => {
    expect(loadWorkFromStorage()).toBeNull();
  });

  it('throws for corrupt saved data', () => {
    localStorage.setItem(WORK_STORAGE_KEY, '{bad');

    expect(() => loadWorkFromStorage()).toThrow();
  });
});
