import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { asMounted, getProjectManagerStore } from '@renderer/features/projects/stores/project-selectors';
import { getGridViewStore } from '@renderer/features/grid/stores/grid-store-registry';
import { type BaseModalProps } from '@renderer/lib/modal/modal-provider';
import { rpc } from '@renderer/lib/ipc';
import { Button } from '@renderer/lib/ui/button';
import {
  DialogContentArea,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@renderer/lib/ui/dialog';
import type { Conversation } from '@shared/core/conversations/conversations';
import type { Terminal } from '@shared/core/terminals/terminals';

type GridAddItem = {
  kind: 'conversation' | 'terminal';
  projectId: string;
  projectName: string;
  taskId: string;
  taskName: string;
  targetId: string;
  targetName: string;
};

type Props = BaseModalProps<void>;

export const GridAddItemModal = observer(function GridAddItemModal({ onSuccess, onClose }: Props) {
  const [items, setItems] = useState<GridAddItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let disposed = false;

    void (async () => {
      const projects = Array.from(getProjectManagerStore().projects.entries())
        .map(([projectId, store]) => {
          const mounted = asMounted(store);
          if (!mounted) return null;
          return {
            projectId,
            projectName: store.name,
            tasks: Array.from(mounted.taskManager.tasks.values())
              .filter((task) => task.state !== 'unregistered')
              .map((task) => ({ taskId: task.data.id, taskName: task.data.name })),
          };
        })
        .filter(Boolean) as Array<{
        projectId: string;
        projectName: string;
        tasks: Array<{ taskId: string; taskName: string }>;
      }>;

      const nextItems = (
        await Promise.all(
          projects.flatMap((project) =>
            project.tasks.map(async (task) => {
              const [conversations, terminals] = await Promise.all([
                rpc.conversations.getConversationsForTask(project.projectId, task.taskId),
                rpc.terminals.getTerminalsForTask(project.projectId, task.taskId),
              ]);

              return [
                ...conversations.map((conversation: Conversation) => ({
                  kind: 'conversation' as const,
                  projectId: project.projectId,
                  projectName: project.projectName,
                  taskId: task.taskId,
                  taskName: task.taskName,
                  targetId: conversation.id,
                  targetName: conversation.title || 'Conversation',
                })),
                ...terminals.map((terminal: Terminal) => ({
                  kind: 'terminal' as const,
                  projectId: project.projectId,
                  projectName: project.projectName,
                  taskId: task.taskId,
                  taskName: task.taskName,
                  targetId: terminal.id,
                  targetName: terminal.name,
                })),
              ];
            })
          )
        )
      ).flat();

      if (disposed) return;
      setItems(nextItems);
      setIsLoading(false);
    })();

    return () => {
      disposed = true;
    };
  }, []);

  const handleAdd = (item: GridAddItem) => {
    getGridViewStore().addTile(item);
    onSuccess();
  };

  return (
    <>
      <DialogHeader showCloseButton={false}>
        <DialogTitle>Add grid tile</DialogTitle>
      </DialogHeader>
      <DialogContentArea className="pt-0">
        {isLoading ? (
          <p className="text-sm text-foreground-muted">Loading conversations and terminals…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-foreground-muted">No active conversations or terminals found.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <button
                key={`${item.kind}:${item.taskId}:${item.targetId}`}
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-border bg-background-secondary-1 px-3 py-2 text-left hover:bg-background-1"
                onClick={() => handleAdd(item)}
              >
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.04em] text-foreground-tertiary-muted">
                    {item.projectName}
                  </div>
                  <div className="truncate text-sm text-foreground">
                    {item.taskName} / {item.targetName}
                  </div>
                </div>
                <span className="shrink-0 text-xs capitalize text-foreground-muted">
                  {item.kind}
                </span>
              </button>
            ))}
          </div>
        )}
      </DialogContentArea>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </DialogFooter>
    </>
  );
});
