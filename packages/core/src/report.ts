import { type ArcGuardReport } from "./schema";

const bulletList = (items: string[]): string =>
  items.length === 0 ? "- None" : items.map((item) => `- ${item}`).join("\n");

const escapeMarkdown = (value: string): string =>
  value.replace(/[<>]/g, "").replace(/\r/g, "");

const formatPercent = (score: number): string => `${score}/100`;

export const reportToMarkdown = (report: ArcGuardReport): string => {
  const architectureViolations = report.architecture.violations.map(
    (violation) =>
      `${violation.filePath}: ${violation.sourceLayer} -> ${violation.targetLayer} is disallowed. ${violation.rationale}`,
  );
  const riskyDependencies = report.architecture.riskyDependencies.map(
    (dependency) =>
      `${dependency.name}${dependency.version ? `@${dependency.version}` : ""}: ${dependency.reason}`,
  );
  const intentWarnings = report.intent.findings.flatMap((finding) =>
    finding.mismatchWarnings.map((warning) => `${finding.claim}: ${warning}`),
  );
  const flakeSummary = report.flake.evidence.map(
    (evidence) =>
      `${evidence.testName}: ${(evidence.failureRate * 100).toFixed(0)}% failure rate, suspected ${evidence.suspectedCauseCategory}.`,
  );
  const rollbackItems = [
    ...report.rollback.blockers,
    ...report.rollback.recommendedStrategy,
  ];
  const ciWaste = [
    `${report.sustainability.totalMinutes} total pipeline minutes`,
    `${report.sustainability.avoidableMinutes} avoidable minutes`,
    `${report.sustainability.avoidablePercent}% avoidable share`,
    `${report.sustainability.estimatedWasteGrams}g estimated avoidable emissions`,
    `green opportunity: ${report.sustainability.greenOpportunity}`,
    ...report.sustainability.suggestions,
  ];

  return [
    "# ArcGuard Merge Confidence Report",
    "",
    "## Summary",
    `- Repository: ${escapeMarkdown(report.input.repository)}`,
    `- Merge request: ${escapeMarkdown(report.input.title)}`,
    `- Author: ${escapeMarkdown(report.input.author)}`,
    `- Branch: ${escapeMarkdown(report.input.sourceBranch)} -> ${escapeMarkdown(report.input.targetBranch)}`,
    `- Verdict: **${report.verdictLabel}**`,
    `- Confidence score: **${formatPercent(report.score)}**`,
    "",
    "## Final Merge Confidence Verdict",
    escapeMarkdown(
      report.keyFindings[0] ??
        "ArcGuard did not find a dominant blocking concern in this run.",
    ),
    "",
    "## Architecture Drift",
    `- Score: ${formatPercent(report.architecture.score)}`,
    bulletList([...architectureViolations, ...riskyDependencies]),
    "",
    "## Review Minimap",
    `- Score: ${formatPercent(report.review.score)}`,
    bulletList(
      report.review.zones.map(
        (zone) =>
          `${zone.zone}: ${zone.files.length} files, ${zone.churn} lines of churn, ${zone.riskLevel} risk. ${zone.guidance}`,
      ),
    ),
    "",
    "## Intent Contracts",
    `- Score: ${formatPercent(report.intent.score)}`,
    bulletList(
      intentWarnings.length > 0
        ? intentWarnings
        : ["Intent remains aligned with code, docs, and tests."],
    ),
    "",
    "## Flake Witness Capsule",
    `- Score: ${formatPercent(report.flake.score)}`,
    bulletList(flakeSummary),
    "",
    "## Rollback Reality Check",
    `- Score: ${formatPercent(report.rollback.score)}`,
    `- Status: ${report.rollback.status}`,
    bulletList(rollbackItems),
    "",
    "## Sustainability / CI Waste",
    `- Score: ${formatPercent(report.sustainability.score)}`,
    bulletList(ciWaste),
    "",
    "## Reviewer Guidance",
    bulletList(report.reviewerGuidance),
  ].join("\n");
};

export const reportToJson = (report: ArcGuardReport): string =>
  JSON.stringify(report, null, 2);
