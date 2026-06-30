import { Terminal } from 'lucide-react';
import { TerminalPtyContent } from '@renderer/features/tasks/terminals/terminal-pty-content';
import { EmptyState } from '@renderer/lib/ui/empty-state';
import type { ResolvedTerminalGridTile } from '../stores/grid-tile-resolver';

export function TerminalGridTile({ resolved }: { resolved: ResolvedTerminalGridTile }) {
  if (resolved.isStale || !resolved.session) {
    return (
      <EmptyState
        icon={<Terminal className="h-5 w-5 text-muted-foreground" />}
        label="Terminal unavailable"
        description="This terminal is no longer active in its task."
      />
    );
  }

  return (
    <TerminalPtyContent
      className="h-full min-h-0 overflow-auto"
      activeSession={resolved.session}
      allSessionIds={[resolved.session.sessionId]}
      autoFocus={false}
      emptyState={null}
      remoteConnectionId={resolved.remoteConnectionId}
      workspaceId={resolved.workspaceId ?? resolved.tile.taskId}
    />
  );
}
