import { Memory } from "@mastra/memory";
import { fastembed } from "@mastra/fastembed";
import { PostgresStore, PgVector } from "@mastra/pg";

const connectionString = process.env.DATABASE_URL || "";

export const PGStorage = new PostgresStore({
  connectionString: (process.env.DATABASE_URL as unknown as string) || "",
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
      generateTitle: true,
    },
  },
});
