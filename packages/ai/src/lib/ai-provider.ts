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
} as const;

export type ModelId = keyof typeof models;

/**
 * Get the configured AI model from OpenRouter
 */
export function getModel(modelId: ModelId = "gpt-4o"): ReturnType<typeof openrouter.chat> {
  const modelName = models[modelId] || models["gpt-4o"];
  return openrouter.chat(modelName);
}

/**
 * Get list of available models
 */
export function getAvailableModels() {
  return Object.keys(models) as ModelId[];
}
