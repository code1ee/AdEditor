import { describe, expect, it } from 'vitest';
import { createBlankWork } from './createElement';
import { createHistoryState, createSnapshot, popRedo, popUndo, pushHistory, resetHistory } from './history';

describe('history utilities', () => {
  it('pushes, undoes, redoes, clears redo on new edit, and resets', () => {
    const work = createBlankWork();
    let state = createHistoryState(2);
    const before = createSnapshot(work, work.currentPageId, []);
    const after = createSnapshot({ ...work, title: 'Next' }, work.currentPageId, []);

    state = pushHistory(state, 'edit', before, after);
    expect(state.undoStack).toHaveLength(1);

    const undo = popUndo(state);
    expect(undo.entry?.before.work.title).toBe(work.title);
    expect(undo.state.redoStack).toHaveLength(1);

    const redo = popRedo(undo.state);
    expect(redo.entry?.after.work.title).toBe('Next');

    state = pushHistory(redo.state, 'another edit', after, createSnapshot({ ...work, title: 'Third' }, work.currentPageId, []));
    expect(state.redoStack).toHaveLength(0);
    expect(resetHistory(state).undoStack).toHaveLength(0);
  });

  it('retains only the configured latest entries', () => {
    const work = createBlankWork();
    let state = createHistoryState(2);
    const first = createSnapshot(work, work.currentPageId, []);

    state = pushHistory(state, '1', first, createSnapshot({ ...work, title: '1' }, work.currentPageId, []));
    state = pushHistory(state, '2', first, createSnapshot({ ...work, title: '2' }, work.currentPageId, []));
    state = pushHistory(state, '3', first, createSnapshot({ ...work, title: '3' }, work.currentPageId, []));

    expect(state.undoStack.map((entry) => entry.label)).toEqual(['2', '3']);
  });
});
