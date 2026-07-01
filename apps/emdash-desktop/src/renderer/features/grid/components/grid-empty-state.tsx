import { LayoutGrid } from 'lucide-react';
import { EmptyState } from '@renderer/lib/ui/empty-state';
import { AddGridTileButton } from './add-grid-tile-button';

export function GridEmptyState() {
  return (
    <EmptyState
      icon={<LayoutGrid className="h-5 w-5 text-muted-foreground" />}
      label="No grid items yet"
      description="Add conversations and terminals from a task or from the grid picker."
      action={<AddGridTileButton />}
    />
  );
}
