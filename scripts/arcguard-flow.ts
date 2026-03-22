import {
  analyzeMergeRequest,
  flowContextToScenario,
  reportToJson,
  reportToMarkdown,
} from "@arcguard/core";
import { getSeededScenario } from "@arcguard/fixtures";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const scenarioFlagIndex = args.findIndex((arg) => arg === "--scenario");
const explicitScenarioId =
  scenarioFlagIndex >= 0 ? args[scenarioFlagIndex + 1] : process.env.ARC_GUARD_SCENARIO;
const outputDir = resolve(process.env.ARC_GUARD_OUTPUT_DIR ?? "artifacts");

let reportInput;
let scenarioId: string | null = explicitScenarioId ?? null;

if (explicitScenarioId) {
  const scenario = getSeededScenario(explicitScenarioId);
  if (!scenario) {
    throw new Error(`Unknown ArcGuard scenario "${explicitScenarioId}".`);
  }
  reportInput = scenario;
} else {
  const rawFlowContext = process.env.AI_FLOW_CONTEXT
    ? JSON.parse(process.env.AI_FLOW_CONTEXT)
    : {};
  const derived = flowContextToScenario(rawFlowContext);
  scenarioId = derived.scenarioId;
  reportInput = scenarioId ? getSeededScenario(scenarioId) ?? derived.input : derived.input;
}

const report = analyzeMergeRequest(reportInput);
const markdown = reportToMarkdown(report);
const json = reportToJson(report);

mkdirSync(outputDir, { recursive: true });
writeFileSync(resolve(outputDir, "arcguard-report.md"), `${markdown}\n`, "utf8");
writeFileSync(resolve(outputDir, "arcguard-report.json"), `${json}\n`, "utf8");

process.stdout.write(`ARC_GUARD_SCENARIO=${scenarioId ?? "heuristic"}\n`);
process.stdout.write(`ARC_GUARD_VERDICT=${report.verdictLabel}\n`);
process.stdout.write(`ARC_GUARD_SCORE=${report.score}\n`);
process.stdout.write("ARC_GUARD_REPORT_MARKDOWN_START\n");
process.stdout.write(`${markdown}\n`);
process.stdout.write("ARC_GUARD_REPORT_MARKDOWN_END\n");
