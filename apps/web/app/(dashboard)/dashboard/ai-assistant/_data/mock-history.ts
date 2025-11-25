export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    title: "React Component Help",
    updatedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    messages: [
      {
        id: "m1",
        role: "user",
        content: "How do I create a functional component in React?",
        createdAt: new Date(Date.now() - 1000 * 60 * 35),
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "You can create a functional component by defining a function that returns JSX. Here's an example:\n\n```tsx\nexport function MyComponent() {\n  return <div>Hello World</div>;\n}\n```",
        createdAt: new Date(Date.now() - 1000 * 60 * 34),
      },
    ],
  },
  {
    id: "2",
    title: "Database Schema Design",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    messages: [
      {
        id: "m3",
        role: "user",
        content: "I need help designing a schema for a blog.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 - 1000 * 60),
      },
      {
        id: "m4",
        role: "assistant",
        content:
          "Sure! A basic blog schema usually includes tables for Users, Posts, and Comments. Would you like me to draft a SQL schema or a Prisma schema?",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    ],
  },
  {
    id: "3",
    title: "Next.js Routing",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    messages: [
      {
        id: "m5",
        role: "user",
        content: "Explain App Router in Next.js 13+",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      },
    ],
  },
];

// Simulate a database
let conversations = [...MOCK_CONVERSATIONS];

export const getHistory = async (): Promise<Conversation[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  // Return a copy to ensure React detects state change
  return [...conversations].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
};

export const getConversation = async (
  id: string
): Promise<Conversation | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return conversations.find((c) => c.id === id);
};

export const createConversation = async (
  firstMessage: string
): Promise<Conversation> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newConversation: Conversation = {
    id: generateId(),
    title: firstMessage.slice(0, 30) + (firstMessage.length > 30 ? "..." : ""),
    updatedAt: new Date(),
    messages: [
      {
        id: generateId(),
        role: "user",
        content: firstMessage,
        createdAt: new Date(),
      },
    ],
  };
  conversations = [newConversation, ...conversations];
  return newConversation;
};

export const addMessageToConversation = async (
  conversationId: string,
  message: Omit<Message, "id" | "createdAt">
): Promise<Message> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const conversation = conversations.find((c) => c.id === conversationId);
  if (!conversation) throw new Error("Conversation not found");

  const newMessage: Message = {
    ...message,
    id: generateId(),
    createdAt: new Date(),
  };

  conversation.messages.push(newMessage);
  conversation.updatedAt = new Date();

  // Re-sort conversations
  conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  return newMessage;
};
