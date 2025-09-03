import { refineMessageContent } from "@/features/chat/text-format";
import { mastraClient } from "@/lib/mastra-client";
import { useState, useCallback } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: any;
}

export function useChat(
  resourceId: string,
  agentId: string,
  threadId?: string
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!threadId) return;
    const thread = mastraClient.getMemoryThread(threadId, agentId);
    const { messages: history } = await thread.getMessages();

    const refined = history.map((msg: any) => ({
      ...msg,
      content: refineMessageContent(msg, false), // ignore reasoning for history
    }));

    setMessages(refined.filter((m) => m.content.trim() !== ""));
  }, [threadId, agentId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!threadId) return;

      // Add user message locally
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      setLoading(true);

      const response = await mastraClient.getAgent(agentId).streamVNext({
        messages: [{ role: "user", content: text }],
        threadId,
        resourceId: resourceId,
      });

      let assistantMessage = "";

      // Flatten assistant message (include reasoning)
      await response.processDataStream({
        onChunk: async (chunk) => {
          if (chunk.type === "text-delta") {
            assistantMessage += chunk.payload.text;

            // Update assistant message progressively
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return [
                  ...prev.slice(0, -1),
                  {
                    ...last,
                    content: assistantMessage,
                  },
                ];
              }

              return [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  role: "assistant",
                  content: assistantMessage,
                  createdAt: new Date(),
                },
              ];
            });
          }
        },
      });

      setLoading(false);
    },
    [threadId, agentId, resourceId]
  );

  return {
    messages,
    loading,
    fetchHistory,
    sendMessage,
  };
}
