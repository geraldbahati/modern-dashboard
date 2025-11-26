/**
 * QuickTasksList - Simple checklist for personal tasks
 *
 * @example
 * <QuickTasksList tasks={mockTasks} onToggle={handleToggle} onDelete={handleDelete} />
 */

"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@workspace/ui/components/card";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { Plus, Trash2, X } from "lucide-react";

interface QuickTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface QuickTasksListProps {
  tasks: QuickTask[];
  onToggle?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onAdd?: (text: string) => void;
  className?: string;
}

export function QuickTasksList({
  tasks,
  onToggle,
  onDelete,
  onAdd,
  className,
}: QuickTasksListProps) {
  const [newTask, setNewTask] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newTask.trim()) {
      onAdd?.(newTask.trim());
      setNewTask("");
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewTask("");
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base">Quick Tasks</CardTitle>
          <CardDescription>
            {tasks.filter((t) => t.completed).length}/{tasks.length} completed
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add task</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.length === 0 && !isAdding ? (
          <div className="flex h-24 flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <p>No quick tasks yet.</p>
            <Button
              variant="link"
              className="px-0 text-primary"
              onClick={() => setIsAdding(true)}
            >
              Add your first task
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center justify-between rounded-md border border-transparent px-2 py-1 hover:bg-muted/50 hover:border-border transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => onToggle?.(task.id)}
                  />
                  <label
                    htmlFor={`task-${task.id}`}
                    className={cn(
                      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate cursor-pointer select-none",
                      task.completed && "text-muted-foreground line-through"
                    )}
                  >
                    {task.text}
                  </label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete?.(task.id)}
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            ))}
          </div>
        )}

        {isAdding && (
          <div className="flex items-center gap-2 pt-2 animate-in fade-in slide-in-from-top-2">
            <Input
              autoFocus
              placeholder="What needs to be done?"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-8"
            />
            <div className="flex items-center gap-1">
              <Button size="sm" className="h-8 px-3" onClick={handleAdd}>
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setIsAdding(false);
                  setNewTask("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
