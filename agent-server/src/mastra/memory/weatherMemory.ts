import { Memory } from "@mastra/memory";
import { fastembed } from "@mastra/fastembed";
import { PostgresStore, PgVector } from "@mastra/pg";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const connectionString = process.env.DATABASE_URL || "";

export const PGStorage = new PostgresStore({
  connectionString: (process.env.DATABASE_URL as unknown as string) || "",
});

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const PremiumMemory = new Memory({
  storage: PGStorage,
  vector: new PgVector({ connectionString }),
  embedder: fastembed,
  options: {
    lastMessages: 10,
    semanticRecall: {
      topK: 3,
      messageRange: 2,
      scope: "resource",
    },
    workingMemory: {
      enabled: true,
    },
    threads: {
      generateTitle: {
        model: openrouter("z-ai/glm-4.5-air:free"),
        instructions:
          "Generate a concise title for this conversation based on the first user message.",
      },
    },
  },
});
