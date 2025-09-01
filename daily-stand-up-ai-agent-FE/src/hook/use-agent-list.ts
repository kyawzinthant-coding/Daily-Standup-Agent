import { mastraClient } from "@/lib/mastra-client";
import { useEffect, useState } from "react";

export const useAgentList = () => {
  const [agentList, setAgentList] = useState<any>();

  useEffect(() => {
    async function listofAgents() {
      const agents = await mastraClient.getAgents();
      setAgentList(agents);
    }

    listofAgents();
  }, []);

  const agentsArray = Object.entries(agentList ?? {}).map(([key, value]) => ({
    id: key,
    ...(typeof value === "object" && value !== null ? value : {}),
  }));

  return { agentsArray };
};
