/**
 * AI router - oRPC procedures for AI chat assistant
 */

import { z } from "zod";
import { protectedProcedure } from "../middleware/auth.js";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { getModel, type ModelId, generateSystemPrompt } from "@workspace/ai";
import { streamToEventIterator } from "@orpc/server";
import { createTools } from "./ai/tools.js";
import { createClient } from "../client.js";

// Chat input schema
const chatInputSchema = z.object({
  messages: z.array(z.any()), // UI messages from @ai-sdk/react
  model: z.string().optional(),
});

/**
 * AI Chat streaming endpoint
 * Streams AI responses with tool support
 */
export const chat = protectedProcedure
  .input(chatInputSchema)
  .handler(async ({ input, context }): Promise<any> => {
    const { messages, model } = input;
    const { user, headers } = context;

    // Validate model
    const modelId = (model || "grok-4.1-fast") as ModelId;

    // Generate personalized system prompt with user context
    const personalizedSystemPrompt = generateSystemPrompt({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
    });

    // Convert UI messages to core messages
    const coreMessages = convertToModelMessages(messages);

    // Create client for tools using the request context
    // Extract cookies from headers
    const cookie = headers.get("cookie") || "";
    const origin = headers.get("origin") || headers.get("referer") || "";

    const API_URL =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.BETTER_AUTH_URL ||
      "http://localhost:3001";

    // Remove trailing slash if present
    const cleanApiUrl = API_URL.replace(/\/$/, "");
    const RPC_URL = `${cleanApiUrl}/api/rpc`;

    const token =
      process.env.INTERNAL_API_KEY ||
      "e4539e9b6edb44aaf974adf22b62c0aa5c2e8af1b42e2a46ac71042e1bfc5165";
    console.log("AI Router Debug:", {
      API_URL,
      RPC_URL,
      tokenPrefix: token.substring(0, 5) + "...",
      hasProcessEnv: !!process.env.INTERNAL_API_KEY,
    });

    const client = createClient({
      baseUrl: RPC_URL,
      headers: () => ({
        cookie,
        origin,
        "x-internal-token": token,
      }),
    });

    // Stream response with tools
    const result = streamText({
      model: getModel(modelId),
      system: personalizedSystemPrompt,
      messages: coreMessages,
      stopWhen: stepCountIs(5),
      providerOptions: {
        openrouter: {
          include_reasoning: true,
        },
      },
      onStepFinish: async ({
        text,
        toolCalls,
        toolResults,
        finishReason,
        usage,
        reasoning,
      }) => {
        console.log("Step finished:", {
          text,
          toolCalls,
          toolResults,
          finishReason,
          usage,
          reasoning,
        });
      },
      onFinish: async ({ text, finishReason, usage }) => {
        console.log("Stream finished:", { text, finishReason, usage });
      },
      tools: createTools(client),
    });

    // Convert to event iterator for streaming over oRPC
    return streamToEventIterator(
      result.toUIMessageStream({ sendReasoning: true })
    );
  });

// AI router
export const aiRouter = {
  chat,
};
