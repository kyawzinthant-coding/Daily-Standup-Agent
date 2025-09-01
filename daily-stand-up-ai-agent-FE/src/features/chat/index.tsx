import { useState } from "react";
import { mastraClient } from "@/lib/mastra-client";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: input }]);

    const agent = mastraClient.getAgent("weatherAgent");
    const response = await agent.streamVNext({
      messages: [{ role: "user", content: input }],
      threadId: "thread-1",
      resourceId: "resource-1",
    });

    let assistantMessage = "";

    // Stream response chunks
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
                { role: "assistant", content: assistantMessage },
              ];
            }
            return [...prev, { role: "assistant", content: assistantMessage }];
          });
        }
      },
    });

    setInput("");
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Agent</h1>

      {/* Chat Window */}
      <div className="border rounded-lg p-3  overflow-y-auto space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg ${
              m.role === "user"
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-200 text-black self-start"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="flex mt-4 gap-2">
        <input
          className="flex-1 border rounded p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
