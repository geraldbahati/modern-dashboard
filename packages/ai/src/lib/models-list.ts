/**
 * UI-friendly model list for display in the frontend
 */
export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description?: string;
}

export const modelsList: ModelOption[] = [
  // xAI models
  {
    id: "grok-4.1-fast",
    name: "Grok 4.1 Fast",
    provider: "xAI",
    description: "Fastest Grok model (Free)",
  },

  // OpenAI models
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Affordable and intelligent small model",
  },

  // Google models
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    provider: "Google",
    description: "Ultra-fast and efficient",
  },

  // Qwen models
  {
    id: "qwen3-next-80b",
    name: "Qwen 3 Next 80B",
    provider: "Qwen",
    description: "Powerful open model",
  },

  // DeepSeek models
  {
    id: "deepseek-chat-v3",
    name: "DeepSeek Chat V3",
    provider: "DeepSeek",
    description: "Latest DeepSeek chat model",
  },
];
