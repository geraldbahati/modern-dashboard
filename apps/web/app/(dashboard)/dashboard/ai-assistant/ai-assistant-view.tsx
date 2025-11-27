"use client";

import dynamic from "next/dynamic";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@workspace/ui/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
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
import { UsersList } from "@workspace/ui/components/ai-generated/users-list";
import { UserDetails } from "@workspace/ui/components/ai-generated/user-details";

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

const models = [
  { id: "grok-4.1-fast", name: "Grok 4.1 Fast" },
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "claude-opus-4-20250514", name: "Claude 4 Opus" },
];

export function AiAssistantView() {
  const isMobile = useIsMobile();
  const [text, setText] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>(models[0].id);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // History state
  const [history, setHistory] = useState<HistoryConversation[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string>();

  // Use AI SDK UI hook
  const { messages, sendMessage, status } = useChat<UIMessage>({
    id: "ai-assistant-chat",
    messages: [] as UIMessage[],
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

      // Send message using AI SDK UI v5
      await sendMessage(
        {
          role: "user",
          parts: [
            {
              type: "text",
              text: message.text,
            },
          ],
        },
        {
          body: { model: selectedModel },
        }
      );

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
    [currentConversationId, sendMessage, selectedModel]
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
        models={models}
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
      <Conversation className="z-10 w-full max-w-4xl mx-auto pointer-events-none pt-16">
        {messages.length === 0 ? (
          <ConversationEmptyState
            title=""
            description=""
            className="p-0 overflow-hidden relative h-full bg-transparent"
          >
            <div className="z-10 flex flex-col items-center gap-2 pointer-events-none mt-64">
              <h3 className="font-medium text-xl text-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-both">
                Good to see you, Demo.
              </h3>
            </div>
          </ConversationEmptyState>
        ) : (
          <ConversationContent className="pointer-events-auto">
            {messages.map((msg) => (
              <Message key={msg.id} from={msg.role}>
                <MessageContent>
                  {msg.parts.map((part, partIndex) => {
                    // Render text parts
                    if (part.type === "text") {
                      return <span key={partIndex}>{part.text}</span>;
                    }

                    // Render tool invocations (type starts with 'tool-')
                    if (part.type.startsWith("tool-")) {
                      const toolPart = part as {
                        type: string;
                        toolCallId: string;
                        toolName: string;
                        state:
                          | "input-streaming"
                          | "input-available"
                          | "output-available"
                          | "output-error";
                        input: unknown;
                        output?: unknown;
                        errorText?: string;
                      };

                      // Render loading state
                      if (
                        toolPart.state === "input-streaming" ||
                        toolPart.state === "input-available"
                      ) {
                        return (
                          <div
                            key={partIndex}
                            className="flex items-center gap-2 text-muted-foreground mt-2"
                          >
                            <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                            <span>Loading {toolPart.toolName}...</span>
                          </div>
                        );
                      }

                      // Render error state
                      if (toolPart.state === "output-error") {
                        return (
                          <div
                            key={partIndex}
                            className="border border-red-200 bg-red-50 rounded-lg p-3 mt-2"
                          >
                            <p className="text-red-900 text-sm">
                              Error: {toolPart.errorText}
                            </p>
                          </div>
                        );
                      }

                      // Render tool result
                      if (toolPart.state === "output-available") {
                        const result = toolPart.output as {
                          success: boolean;
                          data?: unknown;
                          count?: number;
                          message?: string;
                          error?: string;
                        };

                        // Handle errors in result
                        if (!result.success) {
                          return (
                            <div
                              key={partIndex}
                              className="border border-red-200 bg-red-50 rounded-lg p-3 mt-2"
                            >
                              <p className="text-red-900 text-sm">
                                Error: {result.error}
                              </p>
                            </div>
                          );
                        }

                        // Render UsersList component
                        if (toolPart.toolName === "listUsers") {
                          return (
                            <div key={partIndex} className="mt-2">
                              <UsersList
                                users={(result.data as any) || []}
                                total={result.count}
                                onUserClick={() => {}}
                              />
                            </div>
                          );
                        }

                        // Render UserDetails component
                        if (toolPart.toolName === "getUserById") {
                          return (
                            <div key={partIndex} className="mt-2">
                              <UserDetails
                                user={result.data as any}
                                onAction={() => {}}
                              />
                            </div>
                          );
                        }

                        // Render success messages for other tools
                        if (result.message) {
                          return (
                            <div
                              key={partIndex}
                              className="border border-green-200 bg-green-50 rounded-lg p-3 mt-2"
                            >
                              <p className="text-green-900 text-sm">
                                {result.message}
                              </p>
                            </div>
                          );
                        }
                      }
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
