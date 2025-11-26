# @workspace/ai

AI SDK integration for the analytics dashboard with generative UI capabilities.

## Overview

This package provides AI-powered chat functionality with generative UI for the analytics dashboard. It uses Vercel's AI SDK with OpenRouter as the provider, giving you access to hundreds of models from OpenAI, Anthropic, Meta, Google, Mistral, and more through a single API.

## Features

- **Generative UI**: Stream React components based on AI responses
- **OpenRouter Integration**: Access to hundreds of models through one API
  - OpenAI (GPT-4o, GPT-4 Turbo)
  - Anthropic (Claude Opus 4, Claude Sonnet 4, Claude 3.5)
  - Meta Llama (3.3 70B, 3.1 405B)
  - Google (Gemini 2.0, Gemini Pro 1.5)
  - Mistral, DeepSeek, and many more
- **Dashboard Tools**: Pre-built tools for users, projects, tasks, organizations, and analytics
- **Type-Safe**: Full TypeScript support with Zod schemas
- **Server Actions**: Next.js server actions for chat functionality
- **Cost-Effective**: Pay-as-you-go pricing with transparent per-token costs

## Installation

This package is part of the monorepo and is already configured.

### Get Your OpenRouter API Key

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up or log in
3. Navigate to [API Keys](https://openrouter.ai/keys)
4. Create a new API key

### Environment Variables

Add to your `.env.local`:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key
```

## Usage

### Server Action

```tsx
import { streamChat } from "@workspace/ai/actions";

// In a server component or server action
const result = await streamChat("Show me all active users", "gpt-4o");
```

### Available Tools

The AI assistant has access to these tools:

1. **getUsers** - Fetch and display users
   - Filter by search, role, status
   - Returns user list with details

2. **getProjects** - Retrieve projects
   - Filter by search, status, organization
   - Shows project cards with progress

3. **getDashboardStats** - Get analytics metrics
   - Dashboard overview statistics
   - Time-based metrics (7d, 30d, 90d, 1y)

4. **getTasks** - Query tasks
   - Filter by project, assignee, status, priority
   - Display task lists

5. **getOrganizations** - List organizations
   - Search and filter organizations
   - Show organization details

### Tool Schemas

All tools use Zod schemas for validation:

```typescript
import { getUsersSchema, getProjectsSchema } from "@workspace/ai/tools";

// Example: validate user input
const input = getUsersSchema.parse({
  search: "john",
  role: "admin",
  limit: 5
});
```

### Custom Model Selection

```typescript
import { getModel, getAvailableModels } from "@workspace/ai/provider";

// Use a specific model
const model = getModel("claude-sonnet-4");

// Get all available models
const models = getAvailableModels();
// Returns: ["gpt-4o", "claude-opus-4", "llama-3.3-70b", ...]
```

### Available Models

- **OpenAI**: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`
- **Anthropic**: `claude-opus-4`, `claude-sonnet-4`, `claude-sonnet-3.5`
- **Meta**: `llama-3.3-70b`, `llama-3.1-405b`
- **Google**: `gemini-2.0-flash`, `gemini-pro-1.5`
- **Mistral**: `mistral-large`
- **DeepSeek**: `deepseek-chat`

## Architecture

```
@workspace/ai/
├── src/
│   ├── actions/
│   │   └── chat.tsx          # Main server action with streamUI
│   ├── lib/
│   │   ├── ai-provider.ts    # Model configuration
│   │   └── system-prompt.ts  # AI system instructions
│   └── tools/
│       ├── analytics.ts      # Analytics tool schemas
│       ├── organizations.ts  # Organization tool schemas
│       ├── projects.ts       # Project tool schemas
│       ├── tasks.ts          # Task tool schemas
│       └── users.ts          # User tool schemas
```

## Generative UI Flow

1. User sends a message to the AI assistant
2. AI determines which tool(s) to use based on the query
3. Tool generates a loading state (skeleton)
4. Tool returns structured data
5. UI components render the data (components defined in @workspace/ui)

## Example Queries

- "Show me all active users"
- "What are the current project statistics?"
- "List all high-priority tasks"
- "Get dashboard analytics for the last 30 days"
- "Show me organizations with more than 10 members"

## Next Steps

To use this package in the Next.js app:

1. Create generative UI components in `@workspace/ui`
2. Add an API route handler in `apps/web/app/api/chat`
3. Update the AI assistant page to use the chat functionality
4. Configure environment variables for API keys
