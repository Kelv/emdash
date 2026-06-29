import { DndContext, DragOverlay, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { LayoutGrid } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useMemo, useState } from 'react';
import { ConversationGridTile } from '@renderer/features/grid/components/conversation-grid-tile';
import { GridEmptyState } from '@renderer/features/grid/components/grid-empty-state';
import { GridTile } from '@renderer/features/grid/components/grid-tile';
import { TerminalGridTile } from '@renderer/features/grid/components/terminal-grid-tile';
import { focusGridConversationTile, focusGridTerminalTile, openTaskView } from '@renderer/features/grid/grid-navigation';
import { getGridViewStore } from '@renderer/features/grid/stores/grid-store-registry';
import { resolveGridTile } from '@renderer/features/grid/stores/grid-tile-resolver';
import { getConversationsForTask, getTerminalsForTask } from '@renderer/features/tasks/stores/task-selectors';
import { toast } from '@renderer/lib/hooks/use-toast';
import { GridTileSnapshot } from '@shared/view-state';
import { AddGridTileButton } from './components/add-grid-tile-button';

export const GridMainPanel = observer(function GridMainPanel() {
  const grid = getGridViewStore();
  const tiles = useMemo(() => grid.tiles.slice().sort((a, b) => a.order - b.order), [grid.tiles]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [activeTileId, setActiveTileId] = useState<string | null>(null);

  const activeTile = activeTileId ? tiles.find((tile) => tile.id === activeTileId) ?? null : null;

  const handleEnd = async (tile: GridTileSnapshot) => {
    try {
      if (tile.kind === 'conversation') {
        await getConversationsForTask(tile.taskId)?.deleteConversation(tile.targetId);
      } else {
        await getTerminalsForTask(tile.taskId)?.deleteTerminal(tile.targetId);
      }
      grid.removeTile(tile.id);
    } catch (error) {
      toast({
        title: tile.kind === 'conversation' ? 'Conversation not ended' : 'Terminal not terminated',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="size-4 text-foreground-muted" />
          <div>
            <h1 className="text-sm font-medium text-foreground">Grid</h1>
            <p className="text-xs text-foreground-muted">Live conversations and terminals across tasks.</p>
          </div>
        </div>
        <AddGridTileButton />
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {tiles.length === 0 ? (
          <GridEmptyState />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={({ active }) => setActiveTileId(String(active.id))}
            onDragCancel={() => setActiveTileId(null)}
            onDragEnd={({ active, over }) => {
              setActiveTileId(null);
              if (!over) return;
              grid.reorderTiles(String(active.id), String(over.id));
            }}
          >
            <SortableContext items={tiles.map((tile) => tile.id)} strategy={rectSortingStrategy}>
              <div className="grid auto-rows-[minmax(220px,220px)] grid-cols-2 gap-3">
                {tiles.map((tile) => {
                  const resolved = resolveGridTile(tile);
                  const body =
                    resolved.kind === 'conversation' ? (
                      <ConversationGridTile resolved={resolved} />
                    ) : (
                      <TerminalGridTile resolved={resolved} />
                    );
                  return (
                    <GridTile
                      key={tile.id}
                      tile={tile}
                      onOpenTask={() => openTaskView(tile.projectId, tile.taskId)}
                      onOpenTarget={() =>
                        tile.kind === 'conversation'
                          ? void focusGridConversationTile({
                              projectId: tile.projectId,
                              taskId: tile.taskId,
                              conversationId: tile.targetId,
                            })
                          : void focusGridTerminalTile({
                              projectId: tile.projectId,
                              taskId: tile.taskId,
                              terminalId: tile.targetId,
                            })
                      }
                      onRemove={() => grid.removeTile(tile.id)}
                      onEnd={() => void handleEnd(tile)}
                      onResize={(sizePreset) => grid.setTileSize(tile.id, sizePreset)}
                      body={body}
                    />
                  );
                })}
              </div>
            </SortableContext>
            <DragOverlay dropAnimation={null}>
              {activeTile ? (
                <div className="w-[420px] rounded-xl border border-border bg-background-secondary-1 p-4 shadow-lg">
                  <div className="truncate text-xs text-foreground-muted">
                    {activeTile.projectName}
                  </div>
                  <div className="truncate text-sm text-foreground">
                    {activeTile.taskName} / {activeTile.targetName}
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
});
