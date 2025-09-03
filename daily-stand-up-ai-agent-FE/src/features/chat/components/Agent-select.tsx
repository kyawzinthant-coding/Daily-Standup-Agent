import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

function AgentSelector({
  agentsArray,
  selectedAgentId,
  onAgentChange,
}: {
  agentsArray: any[];
  selectedAgentId: string;
  onAgentChange: (agentId: string) => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  console.log("selected agent id ", selectedAgentId);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="text-sm"
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isChanging}
      >
        {isChanging
          ? "Switching..."
          : agentsArray.find((a: any) => a.id === selectedAgentId)?.name ||
            agentsArray.find((a: any) => a.id === selectedAgentId)?.id ||
            selectedAgentId}
        <ChevronDown className="w-4 h-4 ml-2" />
      </Button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border rounded-lg shadow-lg z-50">
          {agentsArray.map((agent: any) => (
            <button
              key={agent.id}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                selectedAgentId === agent.id ? "bg-blue-50 text-blue-600" : ""
              }`}
              onClick={() => {
                console.log("heyy");
                setIsChanging(true);
                setShowDropdown(false);

                onAgentChange(agent.id);
                setIsChanging(false);
              }}
            >
              <div className="font-medium">{agent.name || agent.id}</div>
              <div className="text-xs text-gray-500">
                {agent.description || `Agent: ${agent.id}`}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AgentSelector;
