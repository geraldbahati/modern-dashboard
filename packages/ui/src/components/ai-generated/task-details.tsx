/**
 * TaskDetails - Comprehensive task view
 *
 * @example
 * <TaskDetails task={mockTask} onAction={handleAction} />
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Progress } from "@workspace/ui/components/progress";
import { cn } from "@workspace/ui/lib/utils";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Paperclip,
  MessageSquare,
  History,
  User,
  Tag,
  Flag,
  Edit,
  Trash2,
  Share2,
} from "lucide-react";

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Comment {
  id: string;
  author: {
    name: string;
    image: string | null;
  };
  content: string;
  createdAt: Date;
}

interface ActivityItem {
  id: string;
  user: {
    name: string;
    image: string | null;
  };
  action: string;
  createdAt: Date;
}

interface TaskDetailsProps {
  task: {
    id: string;
    title: string;
    description: string;
    status: "todo" | "in_progress" | "done" | "canceled";
    priority: "low" | "medium" | "high" | "urgent";
    assignee: {
      name: string;
      image: string | null;
    } | null;
    reporter: {
      name: string;
      image: string | null;
    };
    project: {
      name: string;
      id: string;
    };
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    subtasks: Subtask[];
    comments: Comment[];
    activity: ActivityItem[];
  };
  onAction?: (action: string, taskId: string, data?: any) => void;
  className?: string;
}

export function TaskDetails({ task, onAction, className }: TaskDetailsProps) {
  const [subtasks, setSubtasks] = React.useState(task.subtasks);

  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const progress =
    subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  const handleSubtaskToggle = (id: string) => {
    const newSubtasks = subtasks.map((s) =>
      s.id === id ? { ...s, completed: !s.completed } : s
    );
    setSubtasks(newSubtasks);
    onAction?.("toggle_subtask", task.id, {
      subtaskId: id,
      completed: !subtasks.find((s) => s.id === id)?.completed,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "default"; // or success color if available
      case "in_progress":
        return "secondary"; // or blue
      case "canceled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className={cn("grid gap-6 lg:grid-cols-3", className)}>
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{task.project.name}</span>
                  <span>/</span>
                  <span className="font-mono">{task.id}</span>
                </div>
                <CardTitle className="text-2xl">{task.title}</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onAction?.("share", task.id)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onAction?.("edit", task.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => onAction?.("delete", task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={getStatusColor(task.status)}
                className="capitalize"
              >
                {task.status.replace("_", " ")}
              </Badge>
              <Badge
                variant={getPriorityColor(task.priority)}
                className="capitalize"
              >
                <Flag className="h-3 w-3 mr-1" />
                {task.priority}
              </Badge>
              {task.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-muted-foreground"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Description
              </h3>
              <p className="whitespace-pre-wrap">{task.description}</p>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Subtasks
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {completedSubtasks}/{subtasks.length}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="space-y-2">
                  {subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={subtask.id}
                        checked={subtask.completed}
                        onCheckedChange={() => handleSubtaskToggle(subtask.id)}
                      />
                      <label
                        htmlFor={subtask.id}
                        className={cn(
                          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                          subtask.completed &&
                            "line-through text-muted-foreground"
                        )}
                      >
                        {subtask.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Tabs defaultValue="comments" className="w-full">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="comments">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comments
                  </TabsTrigger>
                  <TabsTrigger value="activity">
                    <History className="h-4 w-4 mr-2" />
                    Activity
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="comments" className="mt-4 space-y-4">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.image || undefined} />
                      <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-4 pt-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>ME</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <textarea
                      className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Write a comment..."
                    />
                    <div className="flex justify-end mt-2">
                      <Button size="sm">Post Comment</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="activity" className="mt-4">
                <div className="space-y-4">
                  {task.activity.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={item.user.image || undefined} />
                        <AvatarFallback>{item.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <span className="font-medium">{item.user.name}</span>{" "}
                        <span className="text-muted-foreground">
                          {item.action}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Assignee
              </span>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assignee?.image || undefined} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  {task.assignee?.name || "Unassigned"}
                </span>
              </div>
            </div>
            <Separator />
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Reporter
              </span>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.reporter.image || undefined} />
                  <AvatarFallback>{task.reporter.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{task.reporter.name}</span>
              </div>
            </div>
            <Separator />
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Due Date
              </span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "No due date"}
                </span>
              </div>
            </div>
            <Separator />
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Created
              </span>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-20 border-2 border-dashed rounded-md text-muted-foreground text-sm hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex flex-col items-center gap-1">
                <Paperclip className="h-4 w-4" />
                <span>Drop files here</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
