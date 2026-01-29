import cron from "node-cron";
import { connectors } from "@conflictpulse/core";
import { insertConnectorRun, upsertSignals, computeDailyScores } from "@conflictpulse/core";

const ENABLED_CONNECTORS = (process.env.CONNECTORS ?? "all").split(",");

const isEnabled = (provider: string) =>
  ENABLED_CONNECTORS.includes("all") || ENABLED_CONNECTORS.includes(provider);

async function runConnectors() {
  for (const connector of connectors) {
    if (!isEnabled(connector.provider)) {
      continue;
    }
    const startedAt = new Date();
    try {
      const result = await connector.run();
      const ingested = await upsertSignals(result.items);
      await insertConnectorRun(
        connector.provider,
        "success",
        startedAt,
        new Date(),
        new Date(),
        undefined,
        ingested
      );
    } catch (error) {
      await insertConnectorRun(
        connector.provider,
        "error",
        startedAt,
        new Date(),
        undefined,
        (error as Error).message,
        0
      );
    }
  }
}

async function runScoring() {
  const date = new Date().toISOString().slice(0, 10);
  await computeDailyScores(date);
}

async function runOnce() {
  await runConnectors();
  await runScoring();
}

cron.schedule("0 * * * *", async () => {
  await runOnce();
});

runOnce().catch((error) => {
  console.error("Worker failed", error);
});
