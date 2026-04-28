import type { WorkSchema } from '@/models/work';
import { cloneJson } from './clone';

export const DEFAULT_HISTORY_LIMIT = 50;

export interface HistorySnapshot {
  work: WorkSchema;
  currentPageId: string;
  selectedElementIds: string[];
}

export interface HistoryEntry {
  id: string;
  label: string;
  before: HistorySnapshot;
  after: HistorySnapshot;
  createdAt: string;
}

export interface HistoryState {
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
  limit: number;
}

export function createHistoryState(limit = DEFAULT_HISTORY_LIMIT): HistoryState {
  return {
    undoStack: [],
    redoStack: [],
    limit
  };
}

export function createSnapshot(work: WorkSchema, currentPageId: string, selectedElementIds: string[]): HistorySnapshot {
  return {
    work: cloneJson(work),
    currentPageId,
    selectedElementIds: [...selectedElementIds]
  };
}

export function pushHistory(
  state: HistoryState,
  label: string,
  before: HistorySnapshot,
  after: HistorySnapshot
): HistoryState {
  if (sameSnapshot(before, after)) return state;

  const entry: HistoryEntry = {
    id: `history-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    label,
    before,
    after,
    createdAt: new Date().toISOString()
  };
  const undoStack = [...state.undoStack, entry].slice(-state.limit);
  return {
    ...state,
    undoStack,
    redoStack: []
  };
}

export function popUndo(state: HistoryState): { state: HistoryState; entry: HistoryEntry | null } {
  const entry = state.undoStack.at(-1) ?? null;
  if (!entry) return { state, entry: null };
  return {
    entry,
    state: {
      ...state,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, entry]
    }
  };
}

export function popRedo(state: HistoryState): { state: HistoryState; entry: HistoryEntry | null } {
  const entry = state.redoStack.at(-1) ?? null;
  if (!entry) return { state, entry: null };
  return {
    entry,
    state: {
      ...state,
      undoStack: [...state.undoStack, entry].slice(-state.limit),
      redoStack: state.redoStack.slice(0, -1)
    }
  };
}

export function resetHistory(state: HistoryState): HistoryState {
  return {
    ...state,
    undoStack: [],
    redoStack: []
  };
}

function sameSnapshot(left: HistorySnapshot, right: HistorySnapshot): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
