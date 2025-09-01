import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { weatherWorkflow } from "./workflows/weather-workflow";
import { weatherAgent } from "./agents/weather-agent";
import { chefAgent } from "./agents/chef-agent";
import { PGStorage } from "./memory/weatherMemory";

export const mastra = new Mastra({
  storage: PGStorage,
  workflows: { weatherWorkflow },
  agents: { weatherAgent, chefAgent },

  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});
