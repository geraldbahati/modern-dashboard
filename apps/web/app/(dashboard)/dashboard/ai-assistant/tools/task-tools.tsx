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
  status: "todo" | "in_progress" | "done";
  priority: number;
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ListTasksResult {
  data: Task[];
  count: number;
}

interface TaskDetailsResult {
  data: Task;
}

// Transform API task to UI task format
const transformTask = (task: Task) => ({
  id: task.id,
  title: task.title,
  description: task.description,
  projectId: task.projectId,
  assigneeId: task.assigneeId,
  status: task.status,
  priority: task.priority,
  dueDate: task.dueDate,
  createdAt: task.createdAt,
});

export const ListTasksTool: React.FC<ToolComponentProps<ListTasksResult>> = ({
  tool,
  result,
  onAction,
}) => {
  if (tool.state !== "output-available" || !result) return null;

  return (
    <TasksList
      tasks={(result?.data || []).map(transformTask)}
      onTaskClick={(taskId) => onAction?.("viewDetails", taskId)}
      onStatusChange={(taskId, status) =>
        onAction?.("changeStatus", { taskId, status })
      }
    />
  );
};

export const TaskDetailsTool: React.FC<
  ToolComponentProps<TaskDetailsResult>
> = ({ tool, result, onAction }) => {
  if (tool.state !== "output-available" || !result) return null;

  return (
    <TaskDetails
      task={result?.data}
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
      tasks={(result?.data || []).map(transformTask)}
      onTaskClick={(taskId) => onAction?.("viewDetails", taskId)}
      onStatusChange={(taskId, status) =>
        onAction?.("changeStatus", { taskId, status })
      }
    />
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
