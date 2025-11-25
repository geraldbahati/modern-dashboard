"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { SparklesIcon } from "lucide-react";
import * as React from "react";

interface Model {
  id: string;
  name: string;
}

interface ModelSelectorProps {
  models: Model[];
  value: string;
  onValueChange: (value: string) => void;
}

export function ModelSelector({
  models,
  value,
  onValueChange,
}: ModelSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px] border-none bg-transparent shadow-none focus:ring-0 hover:bg-accent/50 transition-colors h-9 rounded-lg">
        <div className="flex items-center gap-2 text-muted-foreground">
          <SparklesIcon className="w-4 h-4" />
          <SelectValue placeholder="Select model" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
