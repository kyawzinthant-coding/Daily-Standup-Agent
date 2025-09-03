"use client";

import { useChat } from "@/hook/useChat";
import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User } from "lucide-react";
import { TypingIndicator } from "./typing-indicator";

export default function ChatInterface({
  resourceId,
  agentId,
  threadId,
}: {
  resourceId: string;
  agentId: string;
  threadId: string;
  onThreadUpdate?: () => void;
}) {
  const { messages, loading, fetchHistory, sendMessage } = useChat(
    resourceId,
    agentId,
    threadId
  );
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (threadId && resourceId && agentId) {
      fetchHistory();
    }
  }, [fetchHistory, threadId, resourceId, agentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim() || loading) return;

      console.log(
        "Sending message:",
        input.trim(),
        "Agent:",
        agentId,
        "Thread:",
        threadId
      );

      const message = input.trim();
      setInput("");

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      try {
        await sendMessage(message);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [input, loading, sendMessage, agentId, threadId]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="flex flex-col w-full h-[600px] bg-white rounded-lg overflow-hidden border">
      <div className="px-4 py-3 bg-gray-50 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">AI Assistant</h3>
            <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-0 bg-white">
        <div className="p-4 space-y-4 min-h-full">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  Start a conversation
                </h3>
                <p className="text-gray-500 text-sm">
                  Ask me anything and I'll help you out.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === "user" ? "bg-blue-600" : "bg-gray-600"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              <div
                className={`max-w-[75%] px-3 py-2 text-start rounded-lg break-words ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900 border"
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="resize-none bg-white border rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-h-[40px] max-h-32"
              rows={1}
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-lg px-3 py-2 min-w-[40px] h-[40px]"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
