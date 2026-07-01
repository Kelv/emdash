import { makeAutoObservable } from 'mobx';
import type {
  GridTileKind,
  GridTileSizePreset,
  GridTileSnapshot,
  GridViewSnapshot,
} from '@shared/view-state';

export interface AddGridTileInput {
  kind: GridTileKind;
  projectId: string;
  taskId: string;
  targetId: string;
  projectName: string;
  taskName: string;
  targetName: string;
}

export class GridViewStore {
  tiles: GridTileSnapshot[] = [];

  constructor(savedSnapshot?: Partial<GridViewSnapshot>) {
    if (savedSnapshot?.tiles) {
      this.tiles = normalizeTileOrder(savedSnapshot.tiles);
    }

    makeAutoObservable(this);
  }

  get snapshot(): GridViewSnapshot {
    return { tiles: this.tiles.slice() };
  }

  addTile(input: AddGridTileInput): string {
    const existing = this.tiles.find(
      (tile) =>
        tile.kind === input.kind &&
        tile.projectId === input.projectId &&
        tile.taskId === input.taskId &&
        tile.targetId === input.targetId
    );
    if (existing) return existing.id;

    const tile: GridTileSnapshot = {
      id: crypto.randomUUID(),
      kind: input.kind,
      projectId: input.projectId,
      taskId: input.taskId,
      targetId: input.targetId,
      projectName: input.projectName,
      taskName: input.taskName,
      targetName: input.targetName,
      sizePreset: input.kind === 'conversation' ? 'wide' : 'small',
      order: this.tiles.length,
    };

    this.tiles.push(tile);
    this.tiles = normalizeTileOrder(this.tiles);
    return tile.id;
  }

  removeTile(tileId: string): void {
    this.tiles = normalizeTileOrder(this.tiles.filter((tile) => tile.id !== tileId));
  }

  setTileSize(tileId: string, sizePreset: GridTileSizePreset): void {
    this.tiles = this.tiles.map((tile) => (tile.id === tileId ? { ...tile, sizePreset } : tile));
  }

  updateTileMetadata(tileId: string, metadata: Partial<Pick<GridTileSnapshot, 'projectName' | 'taskName' | 'targetName'>>): void {
    this.tiles = this.tiles.map((tile) => (tile.id === tileId ? { ...tile, ...metadata } : tile));
  }

  reorderTiles(activeId: string, overId: string): void {
    if (activeId === overId) return;
    const fromIndex = this.tiles.findIndex((tile) => tile.id === activeId);
    const toIndex = this.tiles.findIndex((tile) => tile.id === overId);
    if (fromIndex === -1 || toIndex === -1) return;

    const next = this.tiles.slice();
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    this.tiles = normalizeTileOrder(next);
  }
}

function normalizeTileOrder(tiles: GridTileSnapshot[]): GridTileSnapshot[] {
  return tiles.map((tile, index) => ({ ...tile, order: index }));
}
