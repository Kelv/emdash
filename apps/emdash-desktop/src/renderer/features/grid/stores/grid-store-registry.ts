import { snapshotRegistry } from '@renderer/lib/stores/snapshot-registry';
import { viewStateCache } from '@renderer/lib/stores/view-state-cache';
import type { GridViewSnapshot } from '@shared/view-state';
import { GridViewStore } from './grid-view-store';

const savedSnapshot = viewStateCache.peek('grid') as Partial<GridViewSnapshot> | undefined;
const gridViewStore = new GridViewStore(savedSnapshot);

snapshotRegistry.register('grid', () => gridViewStore.snapshot);

export function getGridViewStore(): GridViewStore {
  return gridViewStore;
}
