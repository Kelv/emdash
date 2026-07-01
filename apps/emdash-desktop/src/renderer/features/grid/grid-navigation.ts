import { when } from 'mobx';
import { appState } from '@renderer/lib/stores/app-state';
import { getTaskView } from '@renderer/features/tasks/stores/task-selectors';

async function waitForTaskView(projectId: string, taskId: string): Promise<void> {
  if (getTaskView(projectId, taskId)) return;
  await when(() => !!getTaskView(projectId, taskId), { timeout: 10_000 });
}

export function openGridView(): void {
  appState.navigation.navigate('grid');
}

export function openTaskView(projectId: string, taskId: string): void {
  appState.navigation.navigate('task', { projectId, taskId });
}

export async function focusGridConversationTile(input: {
  projectId: string;
  taskId: string;
  conversationId: string;
}): Promise<void> {
  openTaskView(input.projectId, input.taskId);
  await waitForTaskView(input.projectId, input.taskId);
  getTaskView(input.projectId, input.taskId)?.focusConversation(input.conversationId);
}

export async function focusGridTerminalTile(input: {
  projectId: string;
  taskId: string;
  terminalId: string;
}): Promise<void> {
  openTaskView(input.projectId, input.taskId);
  await waitForTaskView(input.projectId, input.taskId);
  getTaskView(input.projectId, input.taskId)?.focusTerminal(input.terminalId);
}
