# AI Package Implementation Guide

## ✅ Completed

### Package Structure

```
packages/ai/
├── src/
│   ├── actions/
│   │   └── chat.tsx              # Main streamUI server action
│   ├── lib/
│   │   ├── ai-provider.ts        # OpenRouter configuration
│   │   ├── models-list.ts        # UI-friendly model list
│   │   └── system-prompt.ts      # AI assistant instructions
│   ├── tools/
│   │   ├── analytics.ts          # Analytics schemas
│   │   ├── organizations.ts      # Organization schemas
│   │   ├── projects.ts           # Project schemas
│   │   ├── tasks.ts              # Task schemas
│   │   ├── users.ts              # User schemas
│   │   └── index.ts
│   └── index.ts
├── package.json
├── tsconfig.json
├── README.md
└── IMPLEMENTATION.md (this file)
```

### Features Implemented

1. ✅ **OpenRouter Integration**
   - Single API for 100+ models
   - Support for GPT-4, Claude, Llama, Gemini, Mistral, DeepSeek
   - Cost-effective pay-as-you-go pricing

2. ✅ **Tool Definitions**
   - `getUsers` - Search and filter users
   - `getProjects` - Browse projects
   - `getTasks` - Query tasks
   - `getOrganizations` - List organizations
   - `getDashboardStats` - Analytics metrics

3. ✅ **Type Safety**
   - Full TypeScript support
   - Zod schemas for all tools
   - Proper exports and module structure

4. ✅ **Server Action**
   - `streamChat()` function using AI SDK's `streamUI`
   - Streaming responses with loading states
   - Returns structured data for UI components

## 🚧 Next Steps

### 1. Environment Variables

Add to `apps/web/.env.local`:

\`\`\`bash
OPENROUTER_API_KEY=sk-or-v1-xxxxx
\`\`\`

Get your key from: https://openrouter.ai/keys

### 2. Create UI Components (in @workspace/ui)

Create these components in `packages/ui/src/components/ai-generated/`:

#### a) `users-list.tsx`
```tsx
interface UsersListProps {
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: "active" | "inactive" | "pending";
  }>;
}

export function UsersList({ users }: UsersListProps) {
  // Render table of users
}
```

#### b) `projects-grid.tsx`
```tsx
interface ProjectsGridProps {
  projects: Array<{
    id: string;
    name: string;
    description: string;
    status: string;
    progress: number;
  }>;
}

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  // Render grid of project cards
}
```

#### c) `analytics-card.tsx`
```tsx
interface AnalyticsCardProps {
  metrics: Array<{
    label: string;
    value: string | number;
    change?: number;
    trend?: "up" | "down" | "neutral";
  }>;
}

export function AnalyticsCard({ metrics }: AnalyticsCardProps) {
  // Render analytics metrics
}
```

### 3. Add Data Fetching Functions

In `packages/api/src/routers/`, create functions to fetch actual data:

```typescript
// Example: getUsersData
export async function getUsersData(params: GetUsersInput) {
  const users = await appDb.query.users.findMany({
    where: /* filter logic */,
    limit: params.limit,
  });
  return users;
}
```

Then update the tools in `packages/ai/src/actions/chat.tsx` to call these functions.

### 4. Update AI Assistant Page

Replace the mock implementation in `apps/web/app/(dashboard)/dashboard/ai-assistant/`:

```tsx
"use client";

import { useChat } from "ai/react";

export function AiAssistantView() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
  });

  return (
    // Render chat UI with messages
  );
}
```

### 5. Create Chat API Route

Create `apps/web/app/api/chat/route.ts`:

```typescript
import { streamChat } from "@workspace/ai/actions";

export async function POST(req: Request) {
  const { messages, model } = await req.json();
  const lastMessage = messages[messages.length - 1];

  const result = await streamChat(lastMessage.content, model);

  // Return streaming response
  return result;
}
```

## 📋 Usage Examples

Once implemented, users can ask:

- "Show me all active users"
- "What are the project statistics?"
- "List high-priority tasks"
- "Get dashboard analytics for last 30 days"
- "Show me organizations with more than 10 members"

The AI will:
1. Understand the query
2. Call the appropriate tool
3. Fetch the data
4. Render it as a beautiful UI component
5. Stream the response to the user

## 🎯 Model Selection

Users can choose from:
- GPT-4o (best for complex reasoning)
- Claude Opus 4 (best for analysis)
- Llama 3.3 70B (open source, fast)
- Gemini 2.0 Flash (free tier available)
- And many more!

## 💡 Tips

1. Start with free models like Gemini 2.0 Flash for testing
2. Use GPT-4o or Claude for production
3. Monitor costs in the OpenRouter dashboard
4. Implement rate limiting for user queries
5. Cache common queries to reduce API calls
