export type ShortcutCommand = 'undo' | 'redo' | 'copy' | 'paste' | 'delete' | 'save' | 'preview';

export interface ShortcutDefinition {
  command: ShortcutCommand;
  key: string;
  metaOrCtrl?: boolean;
  shift?: boolean;
}

export const SHORTCUTS: ShortcutDefinition[] = [
  { command: 'undo', key: 'z', metaOrCtrl: true },
  { command: 'redo', key: 'z', metaOrCtrl: true, shift: true },
  { command: 'redo', key: 'y', metaOrCtrl: true },
  { command: 'copy', key: 'c', metaOrCtrl: true },
  { command: 'paste', key: 'v', metaOrCtrl: true },
  { command: 'save', key: 's', metaOrCtrl: true },
  { command: 'preview', key: 'p', metaOrCtrl: true },
  { command: 'delete', key: 'Delete' },
  { command: 'delete', key: 'Backspace' }
];

export function isFormControl(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('input,textarea,select,[contenteditable="true"],[contenteditable=""]'));
}

export function matchShortcut(event: KeyboardEvent): ShortcutCommand | null {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const metaOrCtrl = event.metaKey || event.ctrlKey;
  const shortcut = SHORTCUTS.find((item) => {
    if (item.key !== key) return false;
    if (Boolean(item.metaOrCtrl) !== metaOrCtrl) return false;
    if (Boolean(item.shift) !== event.shiftKey) return false;
    return true;
  });
  return shortcut?.command ?? null;
}
