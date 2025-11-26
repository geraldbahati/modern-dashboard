/**
 * TasksList - Display tasks in List or Kanban view
 *
 * @example
 * <TasksList tasks={mockTasks} onTaskClick={(id) => console.log(id)} />
 */

"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { cn } from "@workspace/ui/lib/utils";
import {
  Calendar,
  MoreHorizontal,
  LayoutList,
  Kanban,
  Flag,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";

// --- Types ---

export interface Task {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  assigneeId: string | null;
  assignee?: { name: string; image: string | null };
  status: "todo" | "in_progress" | "done";
  priority: number; // 0=low, 1=medium, 2=high
  dueDate: Date | null;
  createdAt: Date;
}

interface TasksListProps {
  tasks: Task[];
  groupBy?: "status" | "priority" | "project" | "assignee";
  onTaskClick?: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: Task["status"]) => void;
  className?: string;
}

// --- Helper Components ---

const PriorityBadge = ({ priority }: { priority: number }) => {
  switch (priority) {
    case 2:
      return (
        <Badge variant="destructive" className="gap-1">
          <Flag className="h-3 w-3" /> High
        </Badge>
      );
    case 1:
      return (
        <Badge
          variant="secondary"
          className="gap-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80"
        >
          <Flag className="h-3 w-3" /> Medium
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="gap-1 text-muted-foreground">
          <Flag className="h-3 w-3" /> Low
        </Badge>
      );
  }
};

const StatusIcon = ({ status }: { status: Task["status"] }) => {
  switch (status) {
    case "done":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "in_progress":
      return <Clock className="h-4 w-4 text-blue-500" />;
    case "todo":
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />;
  }
};

// --- Kanban Components ---

interface SortableTaskItemProps {
  task: Task;
  onTaskClick?: (taskId: string) => void;
}

function SortableTaskItem({ task, onTaskClick }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "Task", task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-muted/50 border-dashed border-2 rounded-lg h-[150px]"
      />
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
      onClick={() => onTaskClick?.(task.id)}
    >
      <CardHeader className="p-4 pb-2 space-y-0">
        <div className="flex justify-between items-start gap-2">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
            {task.id.slice(0, 6)}
          </Badge>
          <PriorityBadge priority={task.priority} />
        </div>
        <CardTitle className="text-sm font-medium leading-tight mt-2 line-clamp-2">
          {task.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {task.dueDate && (
              <div
                className={cn(
                  "flex items-center gap-1",
                  task.dueDate < new Date() && "text-destructive"
                )}
              >
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(task.dueDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
          {task.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.image || undefined} />
              <AvatarFallback className="text-[10px]">
                {task.assignee.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Main Component ---

export function TasksList({
  tasks: initialTasks,
  groupBy: _groupBy = "status",
  onTaskClick,
  onStatusChange,
  className,
}: TasksListProps) {
  const [view, setView] = React.useState<"list" | "kanban">("kanban");
  const [tasks, setTasks] = React.useState(initialTasks);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  // Update local state when props change
  React.useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = React.useMemo(() => {
    return {
      todo: tasks.filter((t) => t.status === "todo"),
      in_progress: tasks.filter((t) => t.status === "in_progress"),
      done: tasks.filter((t) => t.status === "done"),
    };
  }, [tasks]);

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    // Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (activeIndex === -1 || overIndex === -1) return tasks;

        if (tasks[activeIndex]!.status !== tasks[overIndex]!.status) {
          const newTasks = [...tasks];
          newTasks[activeIndex]!.status = tasks[overIndex]!.status;
          return arrayMove(newTasks, activeIndex, overIndex - 1); // Simple reorder logic
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverColumn = over.data.current?.type === "Column";

    // Dropping a Task over a Column
    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const newStatus = overId as Task["status"];

        if (activeIndex === -1) return tasks;

        if (tasks[activeIndex]!.status !== newStatus) {
          const newTasks = [...tasks];
          newTasks[activeIndex]!.status = newStatus;
          return arrayMove(newTasks, activeIndex, activeIndex);
        }
        return tasks;
      });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    const overTask = tasks.find((t) => t.id === overId);

    // If dropped on a column
    const isOverColumn = ["todo", "in_progress", "done"].includes(overId);

    if (activeTask) {
      let newStatus = activeTask.status;

      if (isOverColumn) {
        newStatus = overId as Task["status"];
      } else if (overTask) {
        newStatus = overTask.status;
      }

      if (activeTask.status !== newStatus) {
        onStatusChange?.(activeTask.id, newStatus);
      }
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
        <div className="flex items-center gap-2">
          <Tabs
            value={view}
            onValueChange={(v) => setView(v as "list" | "kanban")}
            className="w-[200px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="kanban">
                <Kanban className="mr-2 h-4 w-4" />
                Board
              </TabsTrigger>
              <TabsTrigger value="list">
                <LayoutList className="mr-2 h-4 w-4" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {view === "list" ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead className="text-right">Due Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow
                    key={task.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onTaskClick?.(task.id)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {task.id.slice(0, 6)}
                    </TableCell>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusIcon status={task.status} />
                        <span className="capitalize text-sm">
                          {task.status.replace("_", " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={task.priority} />
                    </TableCell>
                    <TableCell>
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={task.assignee.image || undefined}
                            />
                            <AvatarFallback className="text-[10px]">
                              {task.assignee.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{task.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {task.dueDate ? (
                        <span
                          className={cn(
                            task.dueDate < new Date() && "text-destructive"
                          )}
                        >
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskClick?.(task.id);
                            }}
                          >
                            View Details
                          </DropdownMenuItem>
                          {/* Add more actions */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[500px]">
            {(Object.keys(columns) as Array<keyof typeof columns>).map(
              (columnId) => (
                <div key={columnId} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={columnId} />
                      <h3 className="font-semibold capitalize">
                        {columnId.replace("_", " ")}
                      </h3>
                      <Badge variant="secondary" className="rounded-full px-2">
                        {columns[columnId].length}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-1 bg-muted/30 rounded-lg p-2 space-y-3">
                    <SortableContext
                      id={columnId}
                      items={columns[columnId].map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {columns[columnId].map((task) => (
                        <SortableTaskItem
                          key={task.id}
                          task={task}
                          onTaskClick={onTaskClick}
                        />
                      ))}
                    </SortableContext>
                    {columns[columnId].length === 0 && (
                      <div className="h-24 flex items-center justify-center border-2 border-dashed rounded-lg border-muted-foreground/20 text-muted-foreground text-sm">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
          <DragOverlay dropAnimation={dropAnimation}>
            {activeId ? (
              <Card className="cursor-grabbing shadow-xl rotate-2 opacity-90 w-[300px]">
                {(() => {
                  const task = tasks.find((t) => t.id === activeId);
                  if (!task) return null;
                  return (
                    <>
                      <CardHeader className="p-4 pb-2 space-y-0">
                        <div className="flex justify-between items-start gap-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-5"
                          >
                            {task.id.slice(0, 6)}
                          </Badge>
                          <PriorityBadge priority={task.priority} />
                        </div>
                        <CardTitle className="text-sm font-medium leading-tight mt-2 line-clamp-2">
                          {task.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {task.dueDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(task.dueDate).toLocaleDateString(
                                    undefined,
                                    { month: "short", day: "numeric" }
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </>
                  );
                })()}
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
