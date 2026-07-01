import { Columns2, RectangleHorizontal, Square } from 'lucide-react';
import { Button } from '@renderer/lib/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@renderer/lib/ui/dropdown-menu';
import type { GridTileSizePreset } from '@shared/view-state';

const OPTIONS: Array<{
  value: GridTileSizePreset;
  label: string;
  icon: typeof Square;
}> = [
  { value: 'small', label: 'Small', icon: Square },
  { value: 'wide', label: 'Wide', icon: RectangleHorizontal },
  { value: 'large', label: 'Large', icon: Columns2 },
];

export function GridSizePresetMenu({
  value,
  onChange,
}: {
  value: GridTileSizePreset;
  onChange: (value: GridTileSizePreset) => void;
}) {
  const active = OPTIONS.find((option) => option.value === value) ?? OPTIONS[0];
  const ActiveIcon = active.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Tile size: ${active.label}`}
            className="text-foreground-muted hover:text-foreground"
          />
        }
      >
        <ActiveIcon className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem key={option.value} onClick={() => onChange(option.value)}>
              <div className="flex items-center gap-2">
                <Icon className="size-3" />
                <span>{option.label}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
