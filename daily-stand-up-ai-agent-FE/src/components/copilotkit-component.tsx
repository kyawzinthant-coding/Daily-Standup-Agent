import React from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import { CopilotKit } from "@copilotkit/react-core";

interface Props {
  runtimeUrl: string;
  agent?: string;
}

export const CopilotKitComponent: React.FC<Props> = ({
  runtimeUrl,
  agent = "weatherAgent",
}) => {
  return (
    <CopilotKit runtimeUrl={runtimeUrl} agent={agent}>
      <CopilotChat
        labels={{
          title: "Your Standup Assistant",
          initial: "Hi! 👋 I can help generate your daily standup.",
        }}
      />
    </CopilotKit>
  );
};
