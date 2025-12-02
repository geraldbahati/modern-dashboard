"use client";

import dynamic from "next/dynamic";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
  useStickToBottomContext,
} from "@workspace/ui/components/ai-elements/conversation";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@workspace/ui/components/ai-elements/reasoning";

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@workspace/ui/components/ai-elements/message";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  type PromptInputMessage,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputProvider,
  usePromptInputAttachments,
} from "@workspace/ui/components/ai-elements/prompt-input";
import { GridPattern } from "@workspace/ui/components/grid-pattern";
import { ArrowUpIcon, PlusIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useIsMobile } from "@workspace/ui/hooks/use-mobile";
import { AiHeader } from "./_components/ai-header";
import {
  addMessageToConversation,
  type Conversation as HistoryConversation,
  createConversation,
  getConversation,
  getHistory,
} from "./_data/mock-history";
import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { getToolComponent } from "./registry";
import { useUserContext } from "./_hooks/use-user-context";
import { eventIteratorToStream } from "@orpc/server";
import { createBrowserClient } from "@workspace/api/client";
import "./tools/user-tools"; // Register tools
import "./tools/organization-tools"; // Register organization tools
import "./tools/project-tools"; // Register project tools
import "./tools/task-tools"; // Register task tools
import "./tools/quick-task-tools"; // Register quick task tools
import "./tools/analytics-tools"; // Register analytics tools

import { modelsList } from "@workspace/ai";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-background/50">
      <div className="animate-pulse w-32 h-32 rounded-full bg-muted/20" />
    </div>
  ),
});

interface SplineApp {
  setZoom: (value: number) => void;
}

export function AiAssistantView() {
  const isMobile = useIsMobile();
  const [text, setText] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>(modelsList[0].id);
  const selectedModelRef = useRef(selectedModel);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update ref when state changes
  useEffect(() => {
    selectedModelRef.current = selectedModel;
  }, [selectedModel]);

  // Get user context from session
  const { userName } = useUserContext();

  // History state
  const [history, setHistory] = useState<HistoryConversation[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string>();

  // Use AI SDK UI hook with oRPC transport
  const { messages, sendMessage, status } = useChat<UIMessage>({
    id: "ai-assistant-chat",
    messages: [] as UIMessage[],
    transport: {
      async sendMessages(options) {
        // Create oRPC client
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const RPC_URL = `${API_URL}/api/rpc`;
        const client = createBrowserClient(RPC_URL);

        // Call oRPC AI chat endpoint
        return eventIteratorToStream(
          await (client.ai.chat as any)(
            {
              messages: options.messages,
              model: selectedModelRef.current,
            },
            {
              signal: options.abortSignal,
            }
          )
        );
      },
      reconnectToStream() {
        throw new Error("Unsupported");
      },
    },
  });

  useEffect(() => {
    getHistory().then(setHistory);
  }, []);

  const handleNewChat = useCallback(() => {
    setText("");
    setCurrentConversationId(undefined);
    setHistoryOpen(false);
    // Note: useChat doesn't expose a clear method, would need to reload page or manage manually
  }, []);

  const handleSelectConversation = useCallback(async (id: string) => {
    const conversation = await getConversation(id);
    if (conversation) {
      setCurrentConversationId(id);
      setHistoryOpen(false);
    }
  }, []);

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const hasText = Boolean(message.text);
      const hasAttachments = Boolean(message.files?.length);

      if (!hasText && !hasAttachments) return;

      setText("");

      // Send message using AI SDK UI v5 with oRPC
      await sendMessage({
        role: "user",
        parts: [
          {
            type: "text",
            text: message.text,
          },
        ],
      });

      // Save to conversation history
      try {
        let conversationId = currentConversationId;
        if (!conversationId) {
          const newConv = await createConversation(message.text);
          conversationId = newConv.id;
          setCurrentConversationId(conversationId);
        } else {
          await addMessageToConversation(conversationId, {
            role: "user",
            content: message.text,
          });
        }
        getHistory().then(setHistory);
      } catch (error) {
        console.error("Failed to save message", error);
      }
    },
    [currentConversationId, sendMessage]
  );

  const onLoad = useCallback(
    (e: unknown) => {
      const spline = e as SplineApp;

      // Disable zoom via wheel
      const canvas = document
        .getElementById("spline-wrapper")
        ?.querySelector("canvas");
      if (canvas) {
        canvas.addEventListener(
          "wheel",
          (e) => {
            e.stopImmediatePropagation();
            e.preventDefault();
          },
          { capture: true }
        );
      }

      if (spline.setZoom) {
        const startZoom = 1;
        const endZoom = isMobile ? 0.5 : 0.2;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Ease out cubic
          const ease = 1 - Math.pow(1 - progress, 3);
          const currentZoom = startZoom + (endZoom - startZoom) * ease;

          spline.setZoom(currentZoom);

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      }
    },
    [isMobile]
  );

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col relative overflow-hidden rounded-xl border bg-background shadow-sm">
      <AiHeader
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        models={modelsList}
        onNewChat={handleNewChat}
        history={history}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        historyOpen={historyOpen}
        setHistoryOpen={setHistoryOpen}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
        #spline-wrapper a[href^="https://spline.design"],
        #spline-wrapper a[href^="https://spline.design"] {
            display: none !important;
        }
      `,
        }}
      />
      {messages.length === 0 && (
        <div id="spline-wrapper" className="absolute inset-0 z-0">
          <div className="w-full h-full relative">
            <Spline
              className="w-full h-full"
              scene="https://prod.spline.design/h657iRNghD1uiDKp/scene.splinecode"
              onLoad={onLoad}
            />
            {/* Overlay to hide logo if CSS fails, positioned at bottom right */}
            <div className="absolute bottom-2 right-2 w-32 h-8 bg-background/0 z-50 pointer-events-none" />
          </div>
        </div>
      )}
      <GridPattern
        width={30}
        height={30}
        x={-1}
        y={-1}
        strokeDasharray={"4 2"}
        className="[mask-image:radial-gradient(600px_circle_at_center,white,transparent)] opacity-50 pointer-events-none"
      />
      <Conversation className="z-10 max-w-4xl w-full mx-auto pt-16 pointer-events-none">
        <ScrollManager messages={messages} />
        {messages.length === 0 ? (
          <ConversationEmptyState
            title=""
            description=""
            className="p-0 overflow-hidden relative h-full bg-transparent"
          >
            <div className="z-10 flex flex-col items-center gap-2 pointer-events-none mt-64">
              <h3 className="font-medium text-xl text-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-both">
                Good to see you, {userName.split(" ")[0] || userName}.
              </h3>
              <p className="text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700 fill-mode-both">
                How can I help you today?
              </p>
            </div>
          </ConversationEmptyState>
        ) : (
          <ConversationContent className="pb-32 pointer-events-auto">
            {messages.map((msg) => (
              <Message key={msg.id} from={msg.role}>
                <MessageContent>
                  {msg.parts.map((part, partIndex) => {
                    // Render text parts
                    if (part.type === "text") {
                      return (
                        <MessageResponse key={partIndex}>
                          {part.text}
                        </MessageResponse>
                      );
                    }

                    // Render reasoning parts
                    if (part.type === "reasoning") {
                      return (
                        <Reasoning
                          key={partIndex}
                          className="w-full"
                          isStreaming={
                            status === "streaming" &&
                            partIndex === msg.parts.length - 1 &&
                            msg.id === messages.at(-1)?.id
                          }
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    }

                    // Render tool invocations (type starts with 'tool-')
                    if (part.type.startsWith("tool-")) {
                      const toolName = part.type.slice(5);
                      const toolPart = part as any;

                      return (
                        <div key={partIndex} className="flex flex-col gap-2">
                          {(() => {
                            const ToolComponent = getToolComponent(toolName);
                            if (
                              ToolComponent &&
                              toolPart.state === "output-available"
                            ) {
                              return (
                                <ToolComponent
                                  tool={toolPart}
                                  result={toolPart.output}
                                  onAction={(action: string, data: any) => {
                                    let prompt = "";
                                    if (
                                      toolName === "listUsers" &&
                                      action === "viewDetails"
                                    ) {
                                      prompt = `Show details for user ${data}`;
                                    } else if (toolName === "getUserById") {
                                      switch (action) {
                                        case "edit":
                                          prompt = `I want to edit user ${data}`;
                                          break;
                                        case "ban":
                                          prompt = `Ban user ${data}`;
                                          break;
                                        case "delete":
                                          prompt = `Delete user ${data}`;
                                          break;
                                      }
                                    }
                                    // Quick Task Actions
                                    else if (
                                      toolName === "listQuickTasks" ||
                                      toolName.endsWith("QuickTask")
                                    ) {
                                      switch (action) {
                                        case "toggle":
                                          prompt = `Toggle quick task ${data}`;
                                          break;
                                        case "delete":
                                          prompt = `Delete quick task ${data}`;
                                          break;
                                        case "create":
                                          prompt = `Create quick task: ${data}`;
                                          break;
                                      }
                                    }
                                    // Task Actions
                                    else if (
                                      toolName === "listTasks" ||
                                      toolName === "getMyTasks" ||
                                      toolName.endsWith("Task")
                                    ) {
                                      switch (action) {
                                        case "viewDetails":
                                          prompt = `Show details for task ${data}`;
                                          break;
                                        case "changeStatus":
                                          prompt = `Change status of task ${data.taskId} to ${data.status}`;
                                          break;
                                        case "edit":
                                          prompt = `Edit task ${data}`;
                                          break;
                                        case "delete":
                                          prompt = `Delete task ${data}`;
                                          break;
                                        case "toggle_subtask":
                                          // Optional: handle subtask toggle if API supports it via chat
                                          break;
                                        case "share":
                                          // Optional: handle share
                                          break;
                                      }
                                    }
                                    // Project Actions
                                    else if (
                                      toolName === "listProjects" ||
                                      toolName.endsWith("Project")
                                    ) {
                                      switch (action) {
                                        case "viewDetails":
                                          prompt = `Show details for project ${data}`;
                                          break;
                                        case "edit":
                                          prompt = `Edit project ${data}`;
                                          break;
                                        case "delete":
                                          prompt = `Delete project ${data}`;
                                          break;
                                      }
                                    }
                                    // Quick Task Actions
                                    else if (
                                      toolName === "listQuickTasks" ||
                                      toolName.endsWith("QuickTask")
                                    ) {
                                      switch (action) {
                                        case "toggle":
                                          prompt = `Toggle quick task ${data}`;
                                          break;
                                        case "delete":
                                          prompt = `Delete quick task ${data}`;
                                          break;
                                        case "create":
                                          prompt = `Create quick task: ${data}`;
                                          break;
                                      }
                                    }
                                    // Task Actions
                                    else if (
                                      toolName === "listTasks" ||
                                      toolName === "getMyTasks" ||
                                      toolName.endsWith("Task")
                                    ) {
                                      switch (action) {
                                        case "viewDetails":
                                          prompt = `Show details for task ${data}`;
                                          break;
                                        case "changeStatus":
                                          prompt = `Change status of task ${data.taskId} to ${data.status}`;
                                          break;
                                        case "edit":
                                          prompt = `Edit task ${data}`;
                                          break;
                                        case "delete":
                                          prompt = `Delete task ${data}`;
                                          break;
                                        case "toggle_subtask":
                                          // Optional: handle subtask toggle if API supports it via chat
                                          break;
                                        case "share":
                                          // Optional: handle share
                                          break;
                                      }
                                    }
                                    // Project Actions
                                    else if (
                                      toolName === "listProjects" ||
                                      toolName.endsWith("Project")
                                    ) {
                                      switch (action) {
                                        case "viewDetails":
                                          prompt = `Show details for project ${data}`;
                                          break;
                                        case "edit":
                                          prompt = `Edit project ${data}`;
                                          break;
                                        case "delete":
                                          prompt = `Delete project ${data}`;
                                          break;
                                      }
                                    }

                                    if (prompt) {
                                      sendMessage({
                                        role: "user",
                                        parts: [{ type: "text", text: prompt }],
                                      });
                                    }
                                  }}
                                />
                              );
                            }
                            return null;
                          })()}
                        </div>
                      );
                    }

                    return null;
                  })}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
        )}
        <ConversationScrollButton className="pointer-events-auto" />
      </Conversation>

      <div className="absolute bottom-8 left-0 right-0 p-4 z-20 flex justify-center">
        <PromptInputProvider>
          <div className="w-full max-w-4xl bg-background/80 backdrop-blur-md rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ease-in-out">
            <CustomAttachments />
            <PromptInput
              onSubmit={handleSubmit}
              className="w-full bg-transparent border-none shadow-none flex items-center px-2 py-2 gap-2 [&_[data-slot=input-group]]:!border-0 [&_[data-slot=input-group]]:!shadow-none [&_[data-slot=input-group]]:!bg-transparent [&_[data-slot=input-group]]:!ring-0"
              globalDrop
              multiple
            >
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger className="rounded-full w-8 h-8 p-0 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                  <PlusIcon className="w-5 h-5" />
                </PromptInputActionMenuTrigger>
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>

              <PromptInputTextarea
                onChange={(e) => setText(e.target.value)}
                ref={textareaRef}
                value={text}
                placeholder="Ask anything"
                className="flex-1 min-h-[40px] max-h-[200px] py-2 bg-transparent border-none focus-visible:ring-0 text-foreground placeholder:text-muted-foreground resize-none"
              />

              <div className="flex items-center gap-2">
                <PromptInputSpeechButton
                  onTranscriptionChange={setText}
                  textareaRef={textareaRef}
                  className="rounded-full w-8 h-8 p-0 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                />
                <PromptInputSubmit
                  disabled={!text || status === "streaming"}
                  className="rounded-full w-10 h-10 p-0 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowUpIcon className="w-5 h-5" />
                </PromptInputSubmit>
              </div>
            </PromptInput>
          </div>
        </PromptInputProvider>
      </div>
    </div>
  );
}

function ScrollManager({ messages }: { messages: UIMessage[] }) {
  const { scrollToBottom, isAtBottom } = useStickToBottomContext();
  const prevMessagesLength = useRef(messages.length);

  useEffect(() => {
    // Scroll to bottom on initial load
    scrollToBottom();
  }, [scrollToBottom]);

  useEffect(() => {
    const length = messages.length;
    const prevLength = prevMessagesLength.current;
    const lastMessage = messages[length - 1];

    if (length > prevLength) {
      // New message added
      if (lastMessage?.role === "user") {
        // Always scroll to bottom for new user messages
        scrollToBottom();
      } else if (isAtBottom) {
        // For new AI messages, scroll if we were already at the bottom
        scrollToBottom();
      }
    } else {
      // Existing message updated (streaming)
      if (isAtBottom) {
        scrollToBottom();
      }
    }

    prevMessagesLength.current = length;
  }, [messages, scrollToBottom, isAtBottom]);

  return null;
}

function CustomAttachments() {
  const { files, remove } = usePromptInputAttachments();
  if (files.length === 0) return null;

  return (
    <div className="flex gap-3 px-4 pt-4 pb-2 overflow-x-auto scrollbar-hide">
      {files.map((file) => (
        <div
          key={file.id}
          className="relative group w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-border bg-muted/50"
        >
          {file.mediaType?.startsWith("image") ? (
            <Image
              src={file.url}
              alt={file.filename || "Attachment preview"}
              fill
              className="object-cover"
              unoptimized // Required for blob URLs as they cannot be optimized by the server
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs text-muted-foreground truncate px-1">
                {file.filename}
              </span>
            </div>
          )}
          <button
            onClick={() => remove(file.id)}
            className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-100 transition-opacity"
            type="button"
          >
            <XIcon className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
