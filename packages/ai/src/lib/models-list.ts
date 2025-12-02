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
  // OpenAI models
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Most capable GPT-4 model, great for complex tasks",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Faster and more affordable GPT-4 variant",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    description: "High-performance GPT-4 with 128k context",
  },

  // Anthropic models
  {
    id: "claude-opus-4",
    name: "Claude Opus 4",
    provider: "Anthropic",
    description: "Most powerful Claude model for complex reasoning",
  },
  {
    id: "claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    description: "Balanced performance and speed",
  },
  {
    id: "claude-sonnet-3.5",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    description: "Previous generation Claude, still very capable",
  },

  // Meta Llama models
  {
    id: "llama-3.3-70b",
    name: "Llama 3.3 70B",
    provider: "Meta",
    description: "Latest Llama model with strong performance",
  },
  {
    id: "llama-3.1-405b",
    name: "Llama 3.1 405B",
    provider: "Meta",
    description: "Largest open-source model available",
  },

  // Google models
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    description: "Fast and efficient, free tier available",
  },
  {
    id: "gemini-pro-1.5",
    name: "Gemini Pro 1.5",
    provider: "Google",
    description: "Google's advanced model with large context",
  },

  // Mistral models
  {
    id: "mistral-large",
    name: "Mistral Large",
    provider: "Mistral",
    description: "Mistral's most capable model",
  },

  // DeepSeek models
  {
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    provider: "DeepSeek",
    description: "Cost-effective model with strong performance",
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    description: "Advanced reasoning model",
  },

  // xAI models
  {
    id: "grok-beta",
    name: "Grok Beta",
    provider: "xAI",
    description: "Early access to Grok",
  },
  {
    id: "grok-2-vision-1212",
    name: "Grok 2 Vision",
    provider: "xAI",
    description: "Grok with vision capabilities",
  },
  {
    id: "grok-4.1-fast",
    name: "Grok 4.1 Fast",
    provider: "xAI",
    description: "Fastest Grok model (Free)",
  },
];
