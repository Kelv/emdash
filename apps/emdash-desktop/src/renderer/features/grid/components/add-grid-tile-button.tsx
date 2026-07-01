import { Plus } from 'lucide-react';
import { Button } from '@renderer/lib/ui/button';
import { showModal } from '@renderer/lib/modal/modal-provider';

export function AddGridTileButton() {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => showModal('gridAddItemModal', {})}
      data-icon="inline-start"
    >
      <Plus className="size-3.5" />
      Add tile
    </Button>
  );
}
