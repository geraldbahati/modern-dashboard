"use client";

import { QuickTasksList } from "@workspace/ui/components/ai-generated/quick-tasks-list";
import type { ToolComponentProps } from "../registry";
import { registerTool } from "../registry";

interface QuickTask {
  id: string;
  text: string;
  ownerId: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ListQuickTasksResult {
  data: QuickTask[];
  count: number;
}

interface QuickTaskResult {
  data: QuickTask;
}

// Transform API quick task to UI format
const transformQuickTask = (task: QuickTask) => ({
  id: task.id,
  text: task.text,
  completed: task.completed,
  createdAt: task.createdAt,
});

export const ListQuickTasksTool: React.FC<
  ToolComponentProps<ListQuickTasksResult>
> = ({ tool, result, onAction }) => {
  if (tool.state !== "output-available" || !result) return null;

  return (
    <QuickTasksList
      tasks={(result?.data || []).map(transformQuickTask)}
      onToggle={(taskId) => onAction?.("toggle", taskId)}
      onDelete={(taskId) => onAction?.("delete", taskId)}
      onAdd={(text) => onAction?.("create", text)}
    />
  );
};

export const QuickTaskDetailTool: React.FC<
  ToolComponentProps<QuickTaskResult>
> = ({ tool, result, onAction }) => {
  if (tool.state !== "output-available" || !result) return null;

  // For single task operations, show it in a list
  return (
    <QuickTasksList
      tasks={[transformQuickTask(result.data)]}
      onToggle={(taskId) => onAction?.("toggle", taskId)}
      onDelete={(taskId) => onAction?.("delete", taskId)}
    />
  );
};

// Register tools
registerTool("listQuickTasks", ListQuickTasksTool);
registerTool("getQuickTaskById", QuickTaskDetailTool);
registerTool("createQuickTask", QuickTaskDetailTool);
registerTool("updateQuickTask", QuickTaskDetailTool);
registerTool("toggleQuickTask", QuickTaskDetailTool);
registerTool("completeQuickTask", QuickTaskDetailTool);
registerTool("uncompleteQuickTask", QuickTaskDetailTool);
