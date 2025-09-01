import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useAgentList } from "@/hook/use-agent-list";

const ListOfAgents = () => {
  const { agentsArray } = useAgentList();

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Available Agent Lists</h1>
      <ScrollArea className="h-auto w-full rounded-md  p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentsArray.map((agent: any) => (
            <Card
              key={agent.id}
              className="rounded-2xl shadow-md hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{agent.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {agent.provider}
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {agent.instructions}
                </p>
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-xs">
                    {agent.modelId}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </>
  );
};

export default ListOfAgents;
