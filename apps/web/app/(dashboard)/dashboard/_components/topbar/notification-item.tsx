import { formatDistanceToNow } from "date-fns";
import { Check, X } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

interface NotificationItemProps {
  notification: {
    id: number;
    title: string;
    description: string;
    createdAt: Date;
    read: boolean;
  };
}

export default function NotificationItem({
  notification,
}: NotificationItemProps) {
  return (
    <div className="group relative flex gap-4 p-4 transition-colors hover:bg-muted/50">
      <div className="mt-1.5">
        <div
          className={cn(
            "size-2 rounded-full",
            !notification.read ? "bg-primary" : "bg-muted-foreground/30"
          )}
        />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-none">
            {notification.title}
          </p>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {!notification.read && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6 rounded-full hover:bg-background hover:text-foreground"
                title="Mark as read"
              >
                <Check className="size-3" />
                <span className="sr-only">Mark as read</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-6 rounded-full hover:bg-background hover:text-destructive"
              title="Delete"
            >
              <X className="size-3" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground text-sm leading-snug">
          {notification.description}
        </p>
        <p className="text-muted-foreground text-xs">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
