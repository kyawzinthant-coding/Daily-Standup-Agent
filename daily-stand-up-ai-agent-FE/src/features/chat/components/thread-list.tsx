import { Button } from "@/components/ui/button";
import { useMemoryThread } from "@/hook/use-memory-thread";
import { Plus, Trash2 } from "lucide-react";
import { useState, forwardRef, useImperativeHandle } from "react";

interface ThreadListProps {
  selectedThreadId: string | null;
  onThreadSelect: (threadId: string) => void;
  onThreadDelete?: (threadId: string) => void;
  agentId: string;
}

const ThreadList = forwardRef<{ refreshThreads: () => void }, ThreadListProps>(({
  selectedThreadId,
  onThreadSelect,
  onThreadDelete,
  agentId,
}, ref) => {
  const { memoryThread, loading, createNewThread, deleteThread, refreshThreads } =
    useMemoryThread(agentId);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    refreshThreads
  }));



  const handleCreateThread = async () => {
    setIsCreating(true);
    try {
      console.log("Creating new thread for agent:", agentId);
      const newThread = await createNewThread();
      console.log("New thread created:", newThread);
      if (newThread?.id) {
        // Immediately select the new thread for smooth UX
        onThreadSelect(newThread.id);
      }
    } catch (error) {
      console.error("Failed to create new thread:", error);
      alert("Failed to create new thread. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteThread = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent thread selection when clicking delete

    if (
      !confirm(
        "Are you sure you want to delete this thread? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingThreadId(threadId);
    try {
      await deleteThread(threadId);

      // If the deleted thread was selected, clear selection
      if (selectedThreadId === threadId) {
        onThreadDelete?.(threadId);
      }
    } catch (error) {
      console.error("Failed to delete thread:", error);
      alert("Failed to delete thread. Please try again.");
    } finally {
      setDeletingThreadId(null);
    }
  };

  return (
    <div className="mt-6">
      <div className="mb-4">
        <h1 className="text-lg font-medium text-gray-900">Threads</h1>
      </div>

      <div className="space-y-2 flex flex-col">
        {loading && memoryThread.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-4">
            Loading threads...
          </div>
        ) : memoryThread.length > 0 ? (
          memoryThread.map((item: any) => (
            <div key={item.id} className="relative group">
              <Button
                variant={selectedThreadId === item.id ? "default" : "outline"}
                className={`w-full justify-start text-left h-auto py-2 px-3 pr-10 ${selectedThreadId === item.id
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : ""
                  }`}
                onClick={() => onThreadSelect(item.id)}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium text-sm truncate w-full" title={item.title}>
                    {item.title && item.title.length > 25 ? `${item.title.substring(0, 25)}...` : item.title}
                  </span>
                  {item.metadata?.createdAt && (
                    <span
                      className={`text-xs ${selectedThreadId === item.id
                        ? "text-blue-100"
                        : "text-gray-500"
                        }`}
                    >
                      {new Date(item.metadata.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Button>

              {/* Delete button */}
              <Button
                variant="ghost"
                size="sm"
                className={`absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 ${selectedThreadId === item.id
                  ? "text-white hover:bg-blue-500"
                  : "text-gray-500 hover:bg-red-100 hover:text-red-600"
                  }`}
                onClick={(e) => handleDeleteThread(item.id, e)}
                disabled={deletingThreadId === item.id}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500 text-center py-4">
            No threads yet. Create your first conversation!
          </div>
        )}

        {/* New Thread Button - Now below existing threads */}
        <Button
          onClick={handleCreateThread}
          disabled={isCreating || loading}
          variant="outline"
          className="w-full justify-center mt-3 border-dashed border-2 hover:border-solid hover:bg-blue-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isCreating ? "Creating..." : "New Thread"}
        </Button>
      </div>
    </div>
  );
});

ThreadList.displayName = "ThreadList";

export default ThreadList;
