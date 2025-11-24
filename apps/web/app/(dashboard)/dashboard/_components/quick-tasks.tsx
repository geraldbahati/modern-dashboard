"use client";

import { useState } from "react";
import { Plus, Pencil, X, Circle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { DashboardCard } from "@workspace/ui/components/dashboard-card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";

type QuickTask = {
  id: string;
  text: string;
  ownerId: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export default function QuickTasks() {
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [newTask, setNewTask] = useState("");
  const queryClient = useQueryClient();
  const queryKey = orpc.quickTasks.list.queryKey();

  // Fetch tasks from the server
  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery(orpc.quickTasks.list.queryOptions({}));

  // Create task mutation with optimistic update
  const createMutation = useMutation({
    ...orpc.quickTasks.create.mutationOptions(),
    onMutate: async (newTaskData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<QuickTask[]>(queryKey);

      // Optimistically add the new task
      const optimisticTask: QuickTask = {
        id: `temp-${Date.now()}`,
        text: newTaskData.text,
        ownerId: "",
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      queryClient.setQueryData<QuickTask[]>(queryKey, (old = []) => [
        optimisticTask,
        ...old,
      ]);

      setNewTask("");

      return { previousTasks };
    },
    onError: (_err, _newTask, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Toggle task mutation with optimistic update
  const toggleMutation = useMutation({
    ...orpc.quickTasks.toggle.mutationOptions(),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousTasks = queryClient.getQueryData<QuickTask[]>(queryKey);

      // Optimistically toggle the task
      queryClient.setQueryData<QuickTask[]>(queryKey, (old = []) =>
        old.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Delete task mutation with optimistic update
  const deleteMutation = useMutation({
    ...orpc.quickTasks.remove.mutationOptions(),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousTasks = queryClient.getQueryData<QuickTask[]>(queryKey);

      // Optimistically remove the task
      queryClient.setQueryData<QuickTask[]>(queryKey, (old = []) =>
        old.filter((task) => task.id !== id)
      );

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKey, context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const displayedTasks = activeTab === "active" ? activeTasks : completedTasks;

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || createMutation.isPending) return;
    createMutation.mutate({ text: newTask });
  };

  const toggleTask = (id: string) => {
    toggleMutation.mutate({ id });
  };

  const deleteTask = (id: string) => {
    deleteMutation.mutate({ id });
  };

  // Show loading skeleton
  if (isLoading) {
    return <QuickTasksSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <DashboardCard className="h-auto min-h-[360px]">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Failed to load tasks. Please try again.</p>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard className="h-auto min-h-[360px]">
      <div className="mb-3 flex items-center justify-between z-1 relative">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Quick Tasks
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage your daily tasks
          </p>
        </div>
      </div>

      <div className="flex-1 mt-4 flex flex-col">
        <div className="flex flex-col h-full">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1 relative bg-secondary/50 w-full rounded-2xl border border-border/60 transition-none">
            <div
              className={cn(
                "absolute rounded-lg z-[1] bg-background shadow-sm transition-all duration-300 ease-in-out h-7",
                activeTab === "active"
                  ? "left-1 w-[calc(50%-4px)]"
                  : "left-[calc(50%+2px)] w-[calc(50%-4px)]"
              )}
            />
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={cn(
                "relative flex items-center justify-center gap-1.5 rounded-lg px-4 py-1.5 z-[2] text-sm font-medium transition-colors duration-300 outline-none focus-visible:outline-none focus-visible:ring-0 truncate w-[48%] sm:w-[48%]",
                activeTab === "active"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Circle className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Active ({activeTasks.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("completed")}
              className={cn(
                "relative flex items-center justify-center gap-1.5 rounded-lg px-4 py-1.5 z-[2] text-sm font-medium transition-colors duration-300 outline-none focus-visible:outline-none focus-visible:ring-0 truncate w-[48%] sm:w-[48%]",
                activeTab === "completed"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                Completed ({completedTasks.length})
              </span>
            </button>
          </div>

          <div className="flex-1 relative mt-4">
            <div className="bg-card border border-border/60 rounded-lg w-full relative overflow-hidden h-[320px] flex flex-col">
              <div className="flex flex-col h-full p-4">
                <form onSubmit={addTask} className="flex gap-2 mb-4">
                  <input
                    placeholder="Add a quick task..."
                    className="flex-1 px-3 py-2 text-sm bg-secondary/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!newTask.trim() || createMutation.isPending}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 disabled:hover:opacity-60 disabled:cursor-not-allowed"
                    aria-label="Add task"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </form>

                <div className="mt-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-2">
                    {displayedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group flex items-center gap-3 p-3 rounded-lg border transition-all bg-card border-border hover:border-primary/30"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleTask(task.id)}
                              className={cn(
                                "appearance-none rounded transition-all duration-200 flex items-center justify-center w-4 h-4 border hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer flex-shrink-0",
                                task.completed
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "bg-primary/10 border-border"
                              )}
                            >
                              {task.completed && (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={cn(
                              "flex items-center gap-2 text-sm transition-colors",
                              task.completed
                                ? "text-muted-foreground line-through"
                                : "text-foreground"
                            )}
                          >
                            <span
                              className="truncate min-w-0"
                              title={task.text}
                            >
                              {task.text}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1 hover:bg-primary/10 rounded transition-all text-primary"
                            aria-label="Edit task"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 hover:bg-destructive/10 rounded transition-all text-destructive"
                            aria-label="Delete task"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {displayedTasks.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No {activeTab} tasks
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

export function QuickTasksSkeleton() {
  return (
    <DashboardCard className="h-auto min-h-[360px]">
      <div className="mb-3 flex items-center justify-between z-1 relative">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="flex-1 mt-4 flex flex-col">
        <div className="flex flex-col h-full">
          <div className="flex flex-wrap items-center gap-2 p-1 relative bg-secondary/50 w-full rounded-2xl border border-border/60 h-10">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
          <div className="flex-1 relative mt-4">
            <div className="bg-card border border-border/60 rounded-lg w-full relative overflow-hidden h-[320px] flex flex-col p-4 space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
