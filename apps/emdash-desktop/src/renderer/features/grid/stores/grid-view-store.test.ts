import { describe, expect, it } from 'vitest';
import { GridViewStore } from './grid-view-store';

describe('GridViewStore', () => {
  it('adds a conversation tile with default wide sizing', () => {
    const store = new GridViewStore();

    store.addTile({
      kind: 'conversation',
      projectId: 'project-1',
      projectName: 'Project Alpha',
      taskId: 'task-1',
      taskName: 'API polish',
      targetId: 'conversation-1',
      targetName: 'Codex 3',
    });

    expect(store.snapshot.tiles).toEqual([
      expect.objectContaining({
        kind: 'conversation',
        projectId: 'project-1',
        taskId: 'task-1',
        targetId: 'conversation-1',
        sizePreset: 'wide',
        order: 0,
      }),
    ]);
  });

  it('does not duplicate the same tile reference', () => {
    const store = new GridViewStore();

    const firstId = store.addTile({
      kind: 'terminal',
      projectId: 'project-1',
      projectName: 'Project Alpha',
      taskId: 'task-1',
      taskName: 'Release smoke test',
      targetId: 'terminal-1',
      targetName: 'Shell 1',
    });

    const secondId = store.addTile({
      kind: 'terminal',
      projectId: 'project-1',
      projectName: 'Project Alpha',
      taskId: 'task-1',
      taskName: 'Release smoke test',
      targetId: 'terminal-1',
      targetName: 'Shell 1',
    });

    expect(secondId).toBe(firstId);
    expect(store.snapshot.tiles).toHaveLength(1);
  });

  it('reorders tiles and normalizes order indices', () => {
    const store = new GridViewStore();

    const firstId = store.addTile({
      kind: 'conversation',
      projectId: 'project-1',
      projectName: 'Project Alpha',
      taskId: 'task-1',
      taskName: 'API polish',
      targetId: 'conversation-1',
      targetName: 'Codex 3',
    });
    const secondId = store.addTile({
      kind: 'terminal',
      projectId: 'project-1',
      projectName: 'Project Alpha',
      taskId: 'task-1',
      taskName: 'API polish',
      targetId: 'terminal-1',
      targetName: 'Shell 1',
    });

    store.reorderTiles(secondId, firstId);

    expect(store.snapshot.tiles.map((tile) => tile.id)).toEqual([secondId, firstId]);
    expect(store.snapshot.tiles.map((tile) => tile.order)).toEqual([0, 1]);
  });
});
