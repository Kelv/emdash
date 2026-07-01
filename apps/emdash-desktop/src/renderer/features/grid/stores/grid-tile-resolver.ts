import { getTaskStore, getWorkspaceForTask } from '@renderer/features/tasks/stores/task-selectors';
import { conversationRegistry } from '@renderer/features/tasks/stores/conversation-registry';
import { terminalRegistry } from '@renderer/features/tasks/stores/terminal-registry';
import type { ConversationStore } from '@renderer/features/tasks/conversations/conversation-manager';
import type { TerminalStore } from '@renderer/features/tasks/terminals/terminal-manager';
import type { PtySession } from '@renderer/lib/pty/pty-session';
import type { GridTileSnapshot } from '@shared/view-state';

type ResolvedGridTileBase = {
  tile: GridTileSnapshot;
  remoteConnectionId: string | undefined;
  workspaceId: string | null;
  isStale: boolean;
};

export type ResolvedConversationGridTile = ResolvedGridTileBase & {
  kind: 'conversation';
  store?: ConversationStore;
  session?: PtySession;
};

export type ResolvedTerminalGridTile = ResolvedGridTileBase & {
  kind: 'terminal';
  store?: TerminalStore;
  session?: PtySession;
};

export type ResolvedGridTile = ResolvedConversationGridTile | ResolvedTerminalGridTile;

export function resolveGridTile(tile: GridTileSnapshot): ResolvedGridTile {
  const workspace = getWorkspaceForTask(tile.projectId, tile.taskId);
  const remoteConnectionId = workspace?.sshConnectionId;
  const workspaceId = getTaskStore(tile.projectId, tile.taskId)?.workspaceId ?? null;

  if (tile.kind === 'conversation') {
    const manager = conversationRegistry.get(tile.taskId);
    const store = manager?.conversations.get(tile.targetId);
    const session = manager?.sessions.get(tile.targetId);
    return {
      kind: 'conversation',
      tile,
      store,
      session,
      remoteConnectionId,
      workspaceId,
      isStale: !store || !session,
    };
  }

  const manager = terminalRegistry.get(tile.taskId);
  const store = manager?.terminals.get(tile.targetId);
  const session = manager?.sessions.get(tile.targetId);
  return {
    kind: 'terminal',
    tile,
    store,
    session,
    remoteConnectionId,
    workspaceId,
    isStale: !store || !session,
  };
}
