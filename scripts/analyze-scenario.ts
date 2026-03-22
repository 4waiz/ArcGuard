import { analyzeMergeRequest, reportToJson } from "@arcguard/core";
import { getSeededScenario, seededScenarios } from "@arcguard/fixtures";

const args = process.argv.slice(2);
const scenarioFlagIndex = args.findIndex((arg) => arg === "--scenario");
const scenarioId =
  scenarioFlagIndex >= 0 ? args[scenarioFlagIndex + 1] : seededScenarios[0]?.id;

if (!scenarioId) {
  throw new Error("No seeded ArcGuard scenarios are available.");
}

const scenario = getSeededScenario(scenarioId);
if (!scenario) {
  throw new Error(
    `Unknown scenario "${scenarioId}". Available: ${seededScenarios
      .map((item) => item.id)
      .join(", ")}`,
  );
}

const report = analyzeMergeRequest(scenario);
process.stdout.write(`${reportToJson(report)}\n`);

