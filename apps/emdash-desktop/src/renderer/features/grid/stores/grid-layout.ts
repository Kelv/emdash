import type { GridTileSizePreset } from '@shared/view-state';

export function tileSpanClasses(sizePreset: GridTileSizePreset): string {
  switch (sizePreset) {
    case 'large':
      return 'col-span-2 row-span-2';
    case 'wide':
      return 'col-span-2 row-span-1';
    default:
      return 'col-span-1 row-span-1';
  }
}
