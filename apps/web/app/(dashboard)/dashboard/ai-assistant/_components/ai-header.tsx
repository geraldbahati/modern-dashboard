"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { HistoryIcon, PlusIcon } from "lucide-react";
import { ModelSelector } from "./model-selector";
import { HistorySheet } from "./history-sheet";
import { Conversation } from "../_data/mock-history";

interface AiHeaderProps {
  selectedModel: string;
  onModelChange: (value: string) => void;
  models: { id: string; name: string }[];
  onNewChat: () => void;
  history: Conversation[];
  currentConversationId?: string;
  onSelectConversation: (id: string) => void;
  historyOpen: boolean;
  setHistoryOpen: (open: boolean) => void;
}

export function AiHeader({
  selectedModel,
  onModelChange,
  models,
  onNewChat,
  history,
  currentConversationId,
  onSelectConversation,
  historyOpen,
  setHistoryOpen,
}: AiHeaderProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-background/80 to-transparent backdrop-blur-[2px]">
      <div className="flex items-center">
        <ModelSelector
          models={models}
          value={selectedModel}
          onValueChange={onModelChange}
        />
      </div>

      <div className="flex items-center gap-1">
        <TooltipProvider>
          <HistorySheet
            history={history}
            currentConversationId={currentConversationId}
            onSelectConversation={onSelectConversation}
            open={historyOpen}
            onOpenChange={setHistoryOpen}
            triggerTooltip="Chat History"
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50"
            >
              <HistoryIcon className="w-4 h-4" />
              <span className="sr-only">View History</span>
            </Button>
          </HistorySheet>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50"
                onClick={onNewChat}
              >
                <PlusIcon className="w-4 h-4" />
                <span className="sr-only">New Chat</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>New Chat</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
