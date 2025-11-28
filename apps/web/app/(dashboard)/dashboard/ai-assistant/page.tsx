import { AiAssistantView } from "./ai-assistant-view";

export default function AiAssistantPage() {
  // Note: User context is fetched client-side via useUserContext hook
  // The AI receives personalized context server-side in the chat API route
  return <AiAssistantView />;
}
