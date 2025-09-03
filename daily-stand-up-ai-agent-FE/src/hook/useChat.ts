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
  threadId?: string,
  onTitleGenerated?: () => void
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!threadId) return;
    const thread = mastraClient.getMemoryThread(threadId, agentId);
    const { messages: history } = await thread.getMessages();

    const refined = history.map((msg: any) => ({
      ...msg,
      content: refineMessageContent(msg, false),
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

      try {
        const response = await mastraClient.getAgent(agentId).streamVNext({
          messages: [{ role: "user", content: text }],
          threadId,
          resourceId: resourceId,
        });

        let assistantMessage = "";
        let isFirstChunk = true;

        await response.processDataStream({
          onChunk: async (chunk) => {
            if (chunk.type === "text-delta") {
              // Hide loading indicator on first text chunk
              if (isFirstChunk) {
                setLoading(false);
                isFirstChunk = false;
              }

              assistantMessage += chunk.payload.text;

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

        // Ensure loading is false
        setLoading(false);

        // Refresh thread list for title generation
        if (onTitleGenerated) {
          const refreshAttempts = [1000, 3000, 5000];
          refreshAttempts.forEach((delay) => {
            setTimeout(() => {
              onTitleGenerated();
            }, delay);
          });
        }
      } catch (error) {
        console.error("Error in sendMessage:", error);
        setLoading(false);
      }
    },
    [threadId, agentId, resourceId, onTitleGenerated]
  );

  return {
    messages,
    loading,
    fetchHistory,
    sendMessage,
  };
}
