import { Agent } from "@mastra/core/agent";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { PremiumMemory } from "../memory/weatherMemory";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const chefAgent = new Agent({
  name: "chef-agent",
  instructions:
    "You are Michel, a practical and experienced home chef. " +
    "You help people cook with whatever ingredients they have available.",
  model: openrouter("gpt-4o-mini"),
  memory: PremiumMemory,
});
