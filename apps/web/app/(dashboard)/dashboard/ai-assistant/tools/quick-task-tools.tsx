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

// Batch operation result interfaces
interface BatchCreateQuickTasksResult {
  success: boolean;
  created: QuickTask[];
  failed: Array<{ index: number; error: string }>;
  message: string;
}

interface BatchUpdateQuickTasksResult {
  success: boolean;
  updated: QuickTask[];
  failed: Array<{ quickTaskId: string; error: string }>;
  message: string;
}

interface BatchDeleteQuickTasksResult {
  success: boolean;
  deletedCount: number;
  failed: Array<{ quickTaskId: string; error: string }>;
  message: string;
}

// Batch Create Component
export const BatchCreateQuickTasksTool: React.FC<
  ToolComponentProps<BatchCreateQuickTasksResult>
> = ({ tool, result, onAction }) => {
  if (tool.state !== "output-available" || !result) return null;

  const created = result.created || [];
  const failed = result.failed || [];

  return (
    <div className="space-y-4">
      {created.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">
            Successfully Created ({created.length})
          </h3>
          <QuickTasksList
            tasks={created.map(transformQuickTask)}
            onToggle={(taskId) => onAction?.("toggle", taskId)}
            onDelete={(taskId) => onAction?.("delete", taskId)}
          />
        </div>
      )}
      {failed.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-destructive">
            Failed ({failed.length})
          </h3>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <ul className="space-y-1 text-sm text-muted-foreground">
              {failed.map((fail, idx) => (
                <li key={idx}>
                  Task #{fail.index + 1}: {fail.error}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// Batch Update Component
export const BatchUpdateQuickTasksTool: React.FC<
  ToolComponentProps<BatchUpdateQuickTasksResult>
> = ({ tool, result, onAction }) => {
  if (tool.state !== "output-available" || !result) return null;

  const updated = result.updated || [];
  const failed = result.failed || [];

  return (
    <div className="space-y-4">
      {updated.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">
            Successfully Updated ({updated.length})
          </h3>
          <QuickTasksList
            tasks={updated.map(transformQuickTask)}
            onToggle={(taskId) => onAction?.("toggle", taskId)}
            onDelete={(taskId) => onAction?.("delete", taskId)}
          />
        </div>
      )}
      {failed.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-destructive">
            Failed ({failed.length})
          </h3>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <ul className="space-y-1 text-sm text-muted-foreground">
              {failed.map((fail, idx) => (
                <li key={idx}>
                  Task {fail.quickTaskId}: {fail.error}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// Batch Delete Component
export const BatchDeleteQuickTasksTool: React.FC<
  ToolComponentProps<BatchDeleteQuickTasksResult>
> = ({ tool, result }) => {
  if (tool.state !== "output-available" || !result) return null;

  const failed = result.failed || [];
  const deletedCount = result.deletedCount || 0;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${result.success ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}
          >
            {result.success ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {result.message || "Batch delete operation completed"}
            </p>
            <p className="text-sm text-muted-foreground">
              Deleted {deletedCount} quick task{deletedCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
      {failed.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-destructive">
            Failed ({failed.length})
          </h3>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <ul className="space-y-1 text-sm text-muted-foreground">
              {failed.map((fail, idx) => (
                <li key={idx}>
                  Task {fail.quickTaskId}: {fail.error}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
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
registerTool("batchCreateQuickTasks", BatchCreateQuickTasksTool);
registerTool("batchUpdateQuickTasks", BatchUpdateQuickTasksTool);
registerTool("batchDeleteQuickTasks", BatchDeleteQuickTasksTool);
