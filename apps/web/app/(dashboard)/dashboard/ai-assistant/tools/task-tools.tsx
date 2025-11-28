"use client";

import { TasksList } from "@workspace/ui/components/ai-generated/tasks-list";
import { TaskDetails } from "@workspace/ui/components/ai-generated/task-details";
import type { ToolComponentProps } from "../registry";
import { registerTool } from "../registry";

interface Task {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  assigneeId: string | null;
  status: "todo" | "in_progress" | "done" | "canceled";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Extended fields for details
  assignee?: { name: string; image: string | null } | null;
  reporter?: { name: string; image: string | null };
  project?: { name: string; id: string };
  tags?: string[];
  subtasks?: any[];
  comments?: any[];
  activity?: any[];
}

interface ListTasksResult {
  data: Task[];
  count: number;
}

interface TaskDetailsResult {
  data: Task;
}

// Transform API task to UI task format (for TasksList)
const transformTask = (task: Task) => {
  // Map priority string to number for TasksList
  const priorityMap: Record<string, number> = {
    low: 0,
    medium: 1,
    high: 2,
    urgent: 3,
  };

  return {
    id: task.id,
    title: task.title,
    description: task.description || "",
    projectId: task.projectId,
    assigneeId: task.assigneeId,
    status: task.status as any,
    priority:
      typeof task.priority === "string"
        ? (priorityMap[task.priority] ?? 0)
        : task.priority,
    dueDate: task.dueDate,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    assignee: task.assignee || undefined, // TasksList expects undefined, not null
  };
};

// Transform API task to UI task details format (for TaskDetails)
const transformTaskDetails = (task: Task) => ({
  id: task.id,
  title: task.title,
  description: task.description || "",
  status: task.status,
  priority: task.priority, // TaskDetails expects string
  assignee: task.assignee || null, // TaskDetails expects null
  reporter: task.reporter || { name: "Unknown", image: null },
  project: task.project || { name: "Unknown Project", id: task.projectId },
  dueDate: task.dueDate,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
  tags: task.tags || [],
  subtasks: task.subtasks || [],
  comments: task.comments || [],
  activity: task.activity || [],
});

export const ListTasksTool: React.FC<ToolComponentProps<ListTasksResult>> = ({
  tool,
  result,
  onAction,
}) => {
  if (tool.state !== "output-available" || !result) return null;

  return (
    <TasksList
      tasks={(result?.data || []).map(transformTask) as any}
      onTaskClick={(taskId) => onAction?.("viewDetails", taskId)}
      onStatusChange={(taskId, status) =>
        onAction?.("changeStatus", { taskId, status })
      }
      onEdit={(taskId) => onAction?.("edit", taskId)}
      onDelete={(taskId) => onAction?.("delete", taskId)}
    />
  );
};

export const TaskDetailsTool: React.FC<
  ToolComponentProps<TaskDetailsResult>
> = ({ tool, result, onAction }) => {
  if (tool.state !== "output-available" || !result) return null;

  return (
    <TaskDetails
      task={transformTaskDetails(result?.data) as any}
      onAction={(action, taskId) => onAction?.(action, taskId)}
    />
  );
};

export const MyTasksTool: React.FC<ToolComponentProps<{ data: Task[] }>> = ({
  tool,
  result,
  onAction,
}) => {
  if (tool.state !== "output-available" || !result) return null;

  return (
    <TasksList
      tasks={(result?.data || []).map(transformTask) as any}
      onTaskClick={(taskId) => onAction?.("viewDetails", taskId)}
      onStatusChange={(taskId, status) =>
        onAction?.("changeStatus", { taskId, status })
      }
      onEdit={(taskId) => onAction?.("edit", taskId)}
      onDelete={(taskId) => onAction?.("delete", taskId)}
    />
  );
};

// Batch operation result interfaces
interface BatchCreateResult {
  success: boolean;
  created: Task[];
  failed: Array<{ index: number; error: string }>;
  message: string;
}

interface BatchUpdateResult {
  success: boolean;
  updated: Task[];
  failed: Array<{ taskId: string; error: string }>;
  message: string;
}

interface BatchDeleteResult {
  success: boolean;
  deletedCount: number;
  failed: Array<{ taskId: string; error: string }>;
  message: string;
}

// Batch Create Component
export const BatchCreateTasksTool: React.FC<
  ToolComponentProps<BatchCreateResult>
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
          <TasksList
            tasks={created.map(transformTask) as any}
            onTaskClick={(taskId) => onAction?.("viewDetails", taskId)}
            onStatusChange={(taskId, status) =>
              onAction?.("changeStatus", { taskId, status })
            }
            onEdit={(taskId) => onAction?.("edit", taskId)}
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
export const BatchUpdateTasksTool: React.FC<
  ToolComponentProps<BatchUpdateResult>
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
          <TasksList
            tasks={updated.map(transformTask) as any}
            onTaskClick={(taskId) => onAction?.("viewDetails", taskId)}
            onStatusChange={(taskId, status) =>
              onAction?.("changeStatus", { taskId, status })
            }
            onEdit={(taskId) => onAction?.("edit", taskId)}
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
                  Task {fail.taskId}: {fail.error}
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
export const BatchDeleteTasksTool: React.FC<
  ToolComponentProps<BatchDeleteResult>
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
              Deleted {deletedCount} task{deletedCount !== 1 ? "s" : ""}
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
                  Task {fail.taskId}: {fail.error}
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
registerTool("listTasks", ListTasksTool);
registerTool("getTaskById", TaskDetailsTool);
registerTool("getMyTasks", MyTasksTool);
registerTool("createTask", TaskDetailsTool);
registerTool("updateTask", TaskDetailsTool);
registerTool("changeTaskStatus", TaskDetailsTool);
registerTool("completeTask", TaskDetailsTool);
registerTool("reopenTask", TaskDetailsTool);
registerTool("changeTaskPriority", TaskDetailsTool);
registerTool("assignTask", TaskDetailsTool);
registerTool("unassignTask", TaskDetailsTool);
registerTool("batchCreateTasks", BatchCreateTasksTool);
registerTool("batchUpdateTasks", BatchUpdateTasksTool);
registerTool("batchDeleteTasks", BatchDeleteTasksTool);
