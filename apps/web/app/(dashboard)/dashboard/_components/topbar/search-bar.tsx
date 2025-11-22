"use client";

import * as React from "react";
import {
  Bot,
  FileText,
  Folder,
  Layers,
  Search,
  Trash,
  Users,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Kbd } from "@workspace/ui/components/kbd";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { cn } from "@workspace/ui/lib/utils";

interface SearchBarProps {
  className?: string;
}

const items = [
  {
    icon: FileText,
    title: "Overview",
    description: "Dashboard overview with key metrics and project status",
    type: "Pages",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    description: "Chat with AI assistant powered by multiple LLM providers",
    type: "Tools",
  },
  {
    icon: Users,
    title: "Users",
    description: "Manage platform users and accounts",
    type: "Pages",
  },
  {
    icon: Layers,
    title: "All",
    description: "All active users in the system",
    type: "Pages",
  },
  {
    icon: Trash,
    title: "Deleted",
    description: "Deleted or deactivated users",
    type: "Pages",
  },
  {
    icon: Folder,
    title: "Projects",
    description: "Manage development projects and deployments",
    type: "Pages",
  },
];

export default function SearchBar({ className }: SearchBarProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      // Handle navigation here
      console.log("Navigating to:", items[selectedIndex]?.title);
      setOpen(false);
    }
  };

  // Reset selection when opening
  React.useEffect(() => {
    if (open) setSelectedIndex(0);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          className={cn("relative w-full max-w-sm cursor-pointer", className)}
        >
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search..."
            className="bg-secondary/50 h-9 cursor-pointer rounded-full border-none pl-9 pr-12 text-sm shadow-none focus-visible:ring-0"
            readOnly
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Kbd className="bg-background/50 text-muted-foreground h-5 rounded px-1.5 font-mono text-[10px] font-medium">
              <span className="text-xs">⌘</span>K
            </Kbd>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent
        className="gap-0 p-0 sm:max-w-[600px] top-24 translate-y-0"
        showCloseButton={false}
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="flex items-center border-b px-4 py-3">
          <Search className="text-muted-foreground mr-2 size-5" />
          <input
            className="placeholder:text-muted-foreground flex h-6 w-full rounded-md bg-transparent text-sm outline-none"
            placeholder="Search for anything..."
          />
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground ml-auto"
          >
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="p-2">
            {items.map((item, index) => (
              <div
                key={index}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => {
                  console.log("Navigating to:", item.title);
                  setOpen(false);
                }}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors",
                  selectedIndex === index ? "bg-accent" : "hover:bg-accent/50"
                )}
              >
                <div className="bg-secondary/50 flex size-9 items-center justify-center rounded-lg border">
                  <item.icon className="text-muted-foreground size-5" />
                </div>
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-sm font-medium">{item.title}</span>
                  <span className="text-muted-foreground text-xs">
                    {item.description}
                  </span>
                </div>
                <span className="text-muted-foreground text-xs font-medium">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="bg-muted/30 text-muted-foreground flex items-center justify-end gap-4 border-t px-4 py-2 text-xs">
          <div className="flex items-center gap-1">
            <Kbd className="bg-background h-5 px-1.5 font-mono text-[10px]">
              ↑↓
            </Kbd>
            <span>to navigate</span>
          </div>
          <div className="flex items-center gap-1">
            <Kbd className="bg-background h-5 px-1.5 font-mono text-[10px]">
              ↵
            </Kbd>
            <span>to select</span>
          </div>
          <div className="flex items-center gap-1">
            <Kbd className="bg-background h-5 px-1.5 font-mono text-[10px]">
              esc
            </Kbd>
            <span>to close</span>
          </div>
          <div className="ml-4 border-l pl-4">
            Search by{" "}
            <span className="text-foreground font-medium">Aniq-ui</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
