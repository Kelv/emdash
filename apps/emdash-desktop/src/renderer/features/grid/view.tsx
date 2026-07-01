import { type ViewDefinition } from '@renderer/app/view-registry';
import { GridMainPanel } from './grid-main-panel';

export const gridView = {
  MainPanel: GridMainPanel,
} satisfies ViewDefinition;
