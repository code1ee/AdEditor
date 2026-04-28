import type { WorkSchema } from '@/models/work';
import { validateWork } from './validateWork';

export const WORK_STORAGE_KEY = 'advision.adeditor.work';

export function saveWorkToStorage(work: WorkSchema, storage: Storage = window.localStorage): void {
  storage.setItem(WORK_STORAGE_KEY, JSON.stringify(work, null, 2));
}

export function loadWorkFromStorage(storage: Storage = window.localStorage): WorkSchema | null {
  const raw = storage.getItem(WORK_STORAGE_KEY);
  if (!raw) return null;
  const result = validateWork(JSON.parse(raw));
  if (!result.valid || !result.work) {
    throw new Error(result.errors.join('\n'));
  }
  return result.work;
}
