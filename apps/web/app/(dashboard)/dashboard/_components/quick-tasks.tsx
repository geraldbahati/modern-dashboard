"use client";

import { useState } from "react";
import { Plus, Pencil, X, Circle, CheckCircle2 } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { DashboardCard } from "@workspace/ui/components/dashboard-card";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export default function QuickTasks() {
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [newTask, setNewTask] = useState("");
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", text: "this tasks three", completed: false },
    { id: "2", text: "this tasks one", completed: false },
    { id: "3", text: "Completed task example", completed: true },
  ]);

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const displayedTasks = activeTab === "active" ? activeTasks : completedTasks;

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([
      ...tasks,
      { id: Date.now().toString(), text: newTask, completed: false },
    ]);
    setNewTask("");
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

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
                    disabled={!newTask.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 disabled:hover:opacity-60 disabled:cursor-not-allowed"
                    aria-label="Add task"
                  >
                    <Plus className="w-4 h-4" />
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
