import { GripVertical, Minus, SquareTerminal, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';
import { Button } from '@renderer/lib/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/lib/ui/tooltip';
import { cn } from '@renderer/utils/utils';
import type { GridTileSnapshot } from '@shared/view-state';
import { tileSpanClasses } from '../stores/grid-layout';
import { GridSizePresetMenu } from './grid-size-preset-menu';

export function GridTile({
  tile,
  body,
  onOpenTask,
  onOpenTarget,
  onRemove,
  onEnd,
  onResize,
}: {
  tile: GridTileSnapshot;
  body: ReactNode;
  onOpenTask: () => void;
  onOpenTarget: () => void;
  onRemove: () => void;
  onEnd: () => void;
  onResize: (size: GridTileSnapshot['sizePreset']) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tile.id,
  });

  return (
    <section
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'group flex min-h-[240px] flex-col overflow-hidden rounded-xl border border-border bg-background-secondary-1',
        tileSpanClasses(tile.sizePreset),
        isDragging && 'opacity-50'
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            className="flex shrink-0 cursor-grab items-center text-foreground-muted active:cursor-grabbing"
            aria-label="Reorder tile"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-3.5" />
          </button>
          <span className="shrink-0 text-[11px] uppercase tracking-[0.04em] text-foreground-tertiary-muted">
            {tile.projectName}
          </span>
          <button
            type="button"
            className="truncate text-left text-xs text-foreground hover:underline"
            onClick={onOpenTask}
          >
            {tile.taskName}
          </button>
          <span className="text-foreground-tertiary-muted">/</span>
          <button
            type="button"
            className="truncate text-left text-xs text-foreground hover:underline"
            onClick={onOpenTarget}
          >
            {tile.targetName}
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <GridSizePresetMenu value={tile.sizePreset} onChange={onResize} />
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Remove from grid"
                className="text-foreground-muted hover:text-foreground"
                onClick={onRemove}
              >
                <Minus className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Remove from grid</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={tile.kind === 'conversation' ? 'End conversation' : 'Terminate terminal'}
                className="text-foreground-muted hover:text-foreground-destructive"
                onClick={onEnd}
              >
                {tile.kind === 'conversation' ? (
                  <Trash2 className="size-3" />
                ) : (
                  <SquareTerminal className="size-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {tile.kind === 'conversation' ? 'End conversation' : 'Terminate terminal'}
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto">{body}</div>
    </section>
  );
}
