import { mastraClient } from "@/lib/mastra-client";
import { useEffect, useState, useCallback } from "react";

export const useMemoryThread = (agentId: string = "weatherAgent") => {
  const [memoryThread, setMemoryThread] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchThreads = useCallback(async () => {
    try {
      console.log("📋 FETCHING THREADS:");
      console.log("  🤖 Agent ID:", agentId);
      console.log("  🏢 Resource ID: resource-1");

      const threads = await mastraClient.getMemoryThreads({
        resourceId: "resource-1",
        agentId: agentId,
      });

      console.log("✅ THREADS FETCHED:");
      console.log("  📊 Count:", threads.length);
      console.log("  🤖 For agent:", agentId);
      console.log("  📝 Thread titles:", threads.map(t => ({ id: t.id, title: t.title })));

      setMemoryThread(threads);
    } catch (error) {
      console.error("❌ FAILED TO FETCH THREADS:");
      console.error("  🤖 Agent:", agentId);
      console.error("  ❌ Error:", error);
    }
  }, [agentId]);

  const createNewThread = useCallback(async (title: string = "New Conversation") => {
    setLoading(true);
    try {
      console.log("Creating new thread for agent:", agentId, "with title:", title);
      const newThread = await mastraClient.createMemoryThread({
        title,
        metadata: { createdAt: new Date().toISOString() },
        resourceId: "resource-1",
        agentId: agentId,
      });
      console.log("Thread created successfully:", newThread);

      // Refresh the thread list
      await fetchThreads();
      return newThread;
    } catch (error) {
      console.error("Failed to create thread for agent", agentId, ":", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchThreads, agentId]);

  const deleteThread = useCallback(async (threadId: string) => {
    setLoading(true);
    try {
      const thread = mastraClient.getMemoryThread(threadId, agentId);
      await thread.delete();

      // Refresh the thread list
      await fetchThreads();
      return true;
    } catch (error) {
      console.error("Failed to delete thread:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchThreads, agentId]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return {
    memoryThread,
    loading,
    createNewThread,
    deleteThread,
    refreshThreads: fetchThreads
  };
};
