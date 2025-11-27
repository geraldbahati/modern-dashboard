import { streamText, tool, convertToModelMessages, stepCountIs } from "ai";
import { getModel, type ModelId, systemPrompt } from "@workspace/ai";
import { auth } from "@workspace/auth/next";
import { headers } from "next/headers";
import { createClient } from "@workspace/api/client";
import { cookies } from "next/headers";
import { createTools } from "../../../lib/ai/tools";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface ChatRequest {
  messages: any[];
  model?: string;
}

export async function POST(req: Request) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Parse request
    const body = (await req.json()) as ChatRequest;
    const { messages, model } = body;

    // Validate model
    const modelId = (model || "gpt-4o") as ModelId;

    // Create server-side oRPC client with cookies for auth
    const cookieStore = await cookies();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const RPC_URL = `${API_URL}/api/rpc`;

    const client = createClient({
      baseUrl: RPC_URL,
      headers: () => ({ cookie: cookieStore.toString() }),
    });

    const coreMessages = convertToModelMessages(messages);

    // Stream response with tools
    const result = streamText({
      model: getModel(modelId),
      system: systemPrompt,
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

    return result.toUIMessageStreamResponse({ sendReasoning: true });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
