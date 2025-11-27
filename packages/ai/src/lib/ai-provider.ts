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
  "gpt-4o": "openai/gpt-4o",
  "gpt-4o-mini": "openai/gpt-4o-mini",
  "gpt-4-turbo": "openai/gpt-4-turbo",

  // Anthropic models
  "claude-opus-4": "anthropic/claude-opus-4",
  "claude-sonnet-4": "anthropic/claude-sonnet-4-20250514",
  "claude-sonnet-3.5": "anthropic/claude-3.5-sonnet",

  // Meta Llama models
  "llama-3.3-70b": "meta-llama/llama-3.3-70b-instruct",
  "llama-3.1-405b": "meta-llama/llama-3.1-405b-instruct",

  // Google models
  "gemini-2.0-flash": "google/gemini-2.0-flash-exp:free",
  "gemini-pro-1.5": "google/gemini-pro-1.5",

  // Mistral models
  "mistral-large": "mistralai/mistral-large",

  // DeepSeek models
  "deepseek-chat": "deepseek/deepseek-chat",
  "deepseek-r1": "deepseek/deepseek-r1",

  // xAI models
  "grok-beta": "x-ai/grok-beta",
  "grok-2-vision-1212": "x-ai/grok-2-vision-1212",
  "grok-4.1-fast": "x-ai/grok-4.1-fast:free",
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
