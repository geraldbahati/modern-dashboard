"use client";

import React from "react";
import type { UIToolInvocation } from "ai";

export interface ToolComponentProps<T = unknown> {
  tool: UIToolInvocation<any>;
  result?: T;
  onAction?: (action: string, data?: unknown) => void;
}

export type ToolComponent<T = unknown> = React.ComponentType<
  ToolComponentProps<T>
>;

export interface ToolRegistryItem {
  component: ToolComponent;
  name: string;
}

export const toolRegistry: Record<string, ToolComponent> = {};

export function registerTool(name: string, component: ToolComponent<any>) {
  toolRegistry[name] = component;
}

export function getToolComponent(name: string): ToolComponent | undefined {
  return toolRegistry[name];
}
