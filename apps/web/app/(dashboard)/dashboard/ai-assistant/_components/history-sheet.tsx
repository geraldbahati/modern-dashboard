"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { HistoryIcon, MessageSquareIcon } from "lucide-react";
import { Conversation } from "../_data/mock-history";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { cn } from "@workspace/ui/lib/utils";

interface HistorySheetProps {
  children: React.ReactNode;
  history: Conversation[];
  currentConversationId?: string;
  onSelectConversation: (id: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerTooltip?: string;
}

export function HistorySheet({
  children,
  history,
  currentConversationId,
  onSelectConversation,
  open,
  onOpenChange,
  triggerTooltip,
}: HistorySheetProps) {
  // Group history by date
  const groupedHistory = history.reduce(
    (acc, conversation) => {
      const date = conversation.updatedAt;
      let key = "Previous 7 Days";

      if (isToday(date)) {
        key = "Today";
      } else if (isYesterday(date)) {
        key = "Yesterday";
      } else if (date.getTime() < Date.now() - 1000 * 60 * 60 * 24 * 7) {
        key = "Older";
      }

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(conversation);
      return acc;
    },
    {} as Record<string, Conversation[]>
  );

  const groups = ["Today", "Yesterday", "Previous 7 Days", "Older"];

  const trigger = <SheetTrigger asChild>{children}</SheetTrigger>;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {triggerTooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent>{triggerTooltip}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <HistoryIcon className="w-5 h-5" />
            History
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          {history.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No history yet
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => {
                const conversations = groupedHistory[group];
                if (!conversations || conversations.length === 0) return null;

                return (
                  <div key={group}>
                    <h4 className="text-xs font-medium text-muted-foreground mb-3 px-2">
                      {group}
                    </h4>
                    <div className="space-y-1">
                      {conversations.map((conversation) => (
                        <Button
                          key={conversation.id}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start font-normal h-auto py-3 px-2",
                            currentConversationId === conversation.id &&
                              "bg-accent text-accent-foreground"
                          )}
                          onClick={() => {
                            onSelectConversation(conversation.id);
                            onOpenChange?.(false);
                          }}
                        >
                          <MessageSquareIcon className="w-4 h-4 mr-3 shrink-0 text-muted-foreground" />
                          <div className="flex flex-col items-start overflow-hidden">
                            <span className="truncate w-full text-sm">
                              {conversation.title}
                            </span>
                            <span className="text-xs text-muted-foreground truncate w-full">
                              {formatDistanceToNow(conversation.updatedAt, {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
