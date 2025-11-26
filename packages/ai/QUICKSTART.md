# AI Package Quickstart Guide

## ✅ What's Complete

The `@workspace/ai` package is now fully implemented with:

- ✅ OpenRouter integration (access to 100+ AI models)
- ✅ AI SDK RSC with `streamUI` for generative UI
- ✅ 5 dashboard tools with Zod schemas
- ✅ Type-safe TypeScript implementation
- ✅ Loading states and placeholder components
- ✅ Proper server action exports

## 🚀 Next Steps to Make It Work

### 1. Get OpenRouter API Key (2 minutes)

1. Visit https://openrouter.ai/
2. Sign up or log in
3. Go to https://openrouter.ai/keys
4. Create a new API key
5. Copy the key (starts with `sk-or-v1-`)

### 2. Add Environment Variable

Add to `apps/web/.env.local`:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### 3. Test the Package (Optional)

Create a test file to verify it works:

```typescript
// apps/web/app/test-ai/page.tsx
import { streamChat } from "@workspace/ai/actions";

export default async function TestAI() {
  const result = await streamChat("Hello, tell me about yourself");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">AI Test</h1>
      {result}
    </div>
  );
}
```

Visit `/test-ai` to see if the AI responds.

## 📦 Available Models

Choose from:

**Free/Cheap Options:**
- `gemini-2.0-flash` - Google's free model
- `deepseek-chat` - Very affordable
- `llama-3.3-70b` - Open source Meta model

**Premium Options:**
- `gpt-4o` - OpenAI's best (recommended)
- `claude-opus-4` - Anthropic's most capable
- `claude-sonnet-4` - Fast Claude model

**Usage:**
```typescript
// Default (GPT-4o)
await streamChat("your question");

// Specific model
await streamChat("your question", "gemini-2.0-flash");
```

## 🔧 Integration Options

### Option A: Route Handler (Recommended for Production)

Create `apps/web/app/api/chat/route.ts`:

```typescript
import { streamChat } from "@workspace/ai/actions";
import { type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { message, model } = await req.json();

  const result = await streamChat(message, model);

  return new Response(JSON.stringify({ result }), {
    headers: { "Content-Type": "application/json" },
  });
}
```

### Option B: Direct Server Action (Simpler)

In your AI assistant page:

```typescript
"use client";

import { streamChat } from "@workspace/ai/actions";
import { useState } from "react";

export function AiChat() {
  const [response, setResponse] = useState(null);
  const [input, setInput] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await streamChat(input);
    setResponse(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask anything..."
      />
      <button type="submit">Send</button>
      {response && <div>{response}</div>}
    </form>
  );
}
```

## 🎨 Replace Placeholder Components

Currently, tools return `<ToolResult>` placeholder components. Replace these with real UI:

1. **Create UI Components** in `packages/ui/src/components/ai-generated/`
   - `users-list.tsx`
   - `projects-grid.tsx`
   - `analytics-card.tsx`
   - `tasks-list.tsx`
   - `organizations-list.tsx`

2. **Import in chat.tsx:**
```typescript
import { UsersList } from "@workspace/ui/components/ai-generated/users-list";
import { ProjectsGrid } from "@workspace/ui/components/ai-generated/projects-grid";
// ... etc
```

3. **Replace in tool `generate` functions:**
```typescript
// Instead of:
return <ToolResult type="users-list" data={...} />;

// Use:
const users = await getUsersData({ search, role, status, limit });
return <UsersList users={users} />;
```

## 📊 Connect Real Data

Create data fetching functions in `packages/api/src/routers/`:

```typescript
// packages/api/src/routers/users.ts
import { appDb } from "@workspace/db/app-db";
import type { GetUsersInput } from "@workspace/ai/tools";

export async function getUsersData(params: GetUsersInput) {
  return await appDb.query.users.findMany({
    where: (users, { like, eq }) => {
      const conditions = [];
      if (params.search) {
        conditions.push(like(users.name, `%${params.search}%`));
      }
      if (params.role) {
        conditions.push(eq(users.role, params.role));
      }
      return conditions.length ? and(...conditions) : undefined;
    },
    limit: params.limit,
  });
}
```

Then import and use in the tools.

## 🧪 Example Queries to Test

Once set up, try asking:

- "Show me all active users"
- "What are the current project statistics?"
- "List all high-priority tasks"
- "Get dashboard analytics for the last 30 days"
- "Show me organizations with more than 10 members"

The AI will automatically:
1. Understand the intent
2. Call the appropriate tool
3. Show a loading state
4. Render the results as UI components

## 💰 Cost Management

OpenRouter pricing is transparent:
- Track usage at https://openrouter.ai/dashboard
- Set budget limits
- Monitor per-model costs

Free tier recommendations:
- `gemini-2.0-flash` - Free up to rate limits
- Start here for development/testing

## 🐛 Troubleshooting

**"API key not found"**
- Check `OPENROUTER_API_KEY` in `.env.local`
- Restart the dev server

**"Model not available"**
- Check model ID in `packages/ai/src/lib/ai-provider.ts`
- Verify model exists at https://openrouter.ai/docs#models

**TypeScript errors**
- Run `pnpm type-check` in `packages/ai`
- Ensure React types are installed

## 📚 Learn More

- [AI SDK Documentation](https://sdk.vercel.ai/docs)
- [OpenRouter Docs](https://openrouter.ai/docs)
- [AI SDK RSC Guide](https://sdk.vercel.ai/docs/ai-sdk-rsc)
- [streamUI API](https://sdk.vercel.ai/docs/reference/ai-sdk-rsc/stream-ui)

---

**Ready to start?** Just add your OpenRouter API key and start chatting! 🚀
