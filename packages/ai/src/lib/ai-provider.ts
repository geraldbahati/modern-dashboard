import { createOpenRouter } from "@openrouter/ai-sdk-provider";

/**
 * OpenRouter provider instance
 * Provides access to hundreds of models from multiple providers
 */
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

/**
 * Available models through OpenRouter
 * Access to GPT-4, Claude, Llama, Mistral, and many more
 */
export const models = {
  // OpenAI models
  "gpt-4o-mini": "openai/gpt-4o-mini",

  // xAI models
  "grok-4.1-fast": "x-ai/grok-4.1-fast:free",

  // Google models
  "gemini-2.5-flash-lite": "google/gemini-2.5-flash-lite",

  // Qwen models
  "qwen3-next-80b": "qwen/qwen3-next-80b-a3b-instruct",

  // DeepSeek models
  "deepseek-chat-v3": "deepseek/deepseek-chat-v3-0324",
} as const;

export type ModelId = keyof typeof models;

type AISDKModel = ReturnType<typeof openrouter.chat>;

/**
 * Get the configured AI model from OpenRouter
 * Returns the OpenRouter chat model instance compatible with AI SDK
 *
 * Note: OpenRouter models are functionally compatible with AI SDK functions
 * like streamUI, streamText, etc. The provider uses v1 specification but
 * works correctly with v2 functions at runtime.
 */
export function getModel(modelId: ModelId = "grok-4.1-fast"): AISDKModel {
  const modelName = models[modelId] || models["grok-4.1-fast"];
  return openrouter.chat(modelName);
}

/**
 * Get list of available models
 */
export function getAvailableModels() {
  return Object.keys(models) as ModelId[];
}
