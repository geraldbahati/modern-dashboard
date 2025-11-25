"use client";

import Spline from "@splinetool/react-spline";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@workspace/ui/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@workspace/ui/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
} from "@workspace/ui/components/ai-elements/prompt-input";
import { GridPattern } from "@workspace/ui/components/grid-pattern";
import { useState } from "react";

export function AiAssistantView() {
  const [messages, setMessages] = useState<
    { id: string; role: "user" | "assistant"; content: string }[]
  >([]);

  const handleSubmit = (message: { text: string; files: any[] }) => {
    if (!message.text.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: message.text },
    ]);

    // Simulate response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I am a demo AI assistant. How can I help you?",
        },
      ]);
    }, 1000);
  };

  const onLoad = (spline: any) => {
    if (spline.setZoom) {
      const startZoom = 1;
      const endZoom = 0.2;
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
  };

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col relative overflow-hidden rounded-xl border bg-background shadow-sm">
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
      <GridPattern
        width={30}
        height={30}
        x={-1}
        y={-1}
        strokeDasharray={"4 2"}
        className="[mask-image:radial-gradient(600px_circle_at_center,white,transparent)] opacity-50"
      />
      <Conversation className="z-10">
        {messages.length === 0 ? (
          <ConversationEmptyState
            title=""
            description=""
            className="p-0 overflow-hidden relative h-full"
          >
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
            <div className="z-10 flex flex-col items-center gap-2 pointer-events-none mt-64">
              <h3 className="font-medium text-xl text-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-both">
                Good to see you, Demo.
              </h3>
            </div>
          </ConversationEmptyState>
        ) : (
          <ConversationContent>
            {messages.map((msg) => (
              <Message key={msg.id} from={msg.role}>
                <MessageContent>
                  {msg.role === "assistant" ? (
                    <MessageResponse>{msg.content}</MessageResponse>
                  ) : (
                    msg.content
                  )}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
        )}
        <ConversationScrollButton />
      </Conversation>

      <div className="p-4 border-t bg-background/50 backdrop-blur-sm z-10">
        <PromptInput onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <PromptInputBody>
            <PromptInputTextarea
              name="message"
              placeholder="Ask me anything..."
            />
          </PromptInputBody>
        </PromptInput>
      </div>
    </div>
  );
}
