import { analyzeMergeRequest, reportToMarkdown } from "@arcguard/core";
import { getSeededScenario, seededScenarios } from "@arcguard/fixtures";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const scenarioFlagIndex = args.findIndex((arg) => arg === "--scenario");
const outputFlagIndex = args.findIndex((arg) => arg === "--out");
const scenarioId =
  scenarioFlagIndex >= 0 ? args[scenarioFlagIndex + 1] : seededScenarios[0]?.id;
const outputPath =
  outputFlagIndex >= 0 ? args[outputFlagIndex + 1] : "artifacts/arcguard-report.md";

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
const markdown = reportToMarkdown(report);
const absoluteOutputPath = resolve(outputPath);

mkdirSync(dirname(absoluteOutputPath), { recursive: true });
writeFileSync(absoluteOutputPath, `${markdown}\n`, "utf8");
process.stdout.write(`${markdown}\n`);
