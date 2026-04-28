import type { WorkSchema } from '@/models/work';

export function stringifyWork(work: WorkSchema): string {
  return JSON.stringify(work, null, 2);
}

export function downloadJson(filename: string, jsonText: string): void {
  const blob = new Blob([jsonText], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
