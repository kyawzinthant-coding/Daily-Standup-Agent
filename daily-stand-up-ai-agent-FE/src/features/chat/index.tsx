import { useState, useRef, useEffect } from "react";
import { useAgentList } from "@/hook/use-agent-list";

import ThreadList from "./components/thread-list";
import ChatInterface from "./components/chat-interface";
import AgentSelector from "./components/Agent-select";

export default function ChatAgent() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const threadListRef = useRef<{ refreshThreads: () => void }>(null);

  const { agentsArray } = useAgentList();

  useEffect(() => {
    console.log("Agents loaded:", agentsArray);
    if (agentsArray.length > 0 && !selectedAgentId) {
      console.log("Setting default agent:", agentsArray[0].id);
      setSelectedAgentId(agentsArray[1].id);
    }
  }, [agentsArray, selectedAgentId]);

  const handleThreadDelete = (deletedThreadId: string) => {
    if (selectedThreadId === deletedThreadId) {
      setSelectedThreadId(null);
    }
  };

  const handleAgentChange = (newAgentId: string) => {
    // Only change if it's actually different
    if (newAgentId !== selectedAgentId) {
      console.log("✅ Agent change confirmed - proceeding with switch");

      setSelectedAgentId(newAgentId);

      // Clear selected thread when changing agents since threads are agent-specific
      if (selectedThreadId) {
        console.log("  🧹 Clearing selected thread (agent-specific threads)");
        setSelectedThreadId(null);
      }

      console.log("✅ Agent changed successfully to:", newAgentId);
      console.log(
        "  📊 State updated - ThreadList will re-render with key:",
        newAgentId
      );
    } else {
      console.log(
        "ℹ️ Agent is already selected:",
        newAgentId,
        "- no change needed"
      );
    }
  };

  const handleThreadUpdate = () => {
    console.log("🔄 THREAD UPDATE REQUESTED:");
    console.log("  🧵 Current agent:", selectedAgentId);
    console.log("  📋 ThreadList ref exists:", !!threadListRef.current);

    if (threadListRef.current?.refreshThreads) {
      console.log("  ✅ Calling refreshThreads...");
      threadListRef.current.refreshThreads();
    } else {
      console.warn("  ⚠️ refreshThreads method not available");
    }
  };

  return (
    <div className="w-full p-4">
      {agentsArray.length > 0 && (
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Chat Assistant
          </h2>
          <AgentSelector
            agentsArray={agentsArray}
            selectedAgentId={selectedAgentId}
            onAgentChange={handleAgentChange}
          />
        </div>
      )}

      <div className="flex space-x-12 w-full h-full items-start">
        {selectedAgentId && (
          <ThreadList
            key={selectedAgentId} // Force re-render when agent changes
            ref={threadListRef}
            selectedThreadId={selectedThreadId}
            onThreadSelect={setSelectedThreadId}
            onThreadDelete={handleThreadDelete}
            agentId={selectedAgentId}
          />
        )}
        {!selectedAgentId ? (
          <div className="flex-1 flex items-center justify-center h-[600px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Loading agents...
              </h3>
              <p className="text-gray-500">
                Please wait while we load available agents
              </p>
            </div>
          </div>
        ) : selectedThreadId ? (
          <ChatInterface
            agentId={selectedAgentId}
            resourceId="resource-1"
            threadId={selectedThreadId}
            onThreadUpdate={handleThreadUpdate}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center h-[600px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a thread to start chatting
              </h3>
              <p className="text-gray-500">
                Choose an existing conversation or create a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
