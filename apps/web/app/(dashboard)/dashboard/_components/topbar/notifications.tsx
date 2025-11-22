"use client";

import { useState } from "react";
import { Bell, Settings } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";

import NotificationItem from "./notification-item";

const notifications = [
  {
    id: 1,
    title: "Card Spending Alert",
    description: "You have spent 80% of your monthly budget",
    createdAt: new Date(),
    read: false,
  },
  {
    id: 2,
    title: "New Feature Available",
    description: "Check out the new dashboard analytics view",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
  },
  {
    id: 3,
    title: "System Update",
    description: "System maintenance scheduled for tonight",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
];

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full size-8"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full ring-2 ring-background" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold leading-none">Notifications</h4>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-auto p-0 text-muted-foreground hover:text-foreground"
          >
            Mark all read
          </Button>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="grid">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        </ScrollArea>
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            className="w-full justify-center gap-2 text-sm font-medium h-10"
          >
            <Settings className="size-4" />
            Notification Settings
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
