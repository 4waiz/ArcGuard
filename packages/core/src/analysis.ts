import {
  type ArchitectureRule,
  type ArchitectureViolation,
  type ArcGuardReport,
  type ChangedFile,
  type DependencySignal,
  type IntentContract,
  type IntentFinding,
  type Layer,
  type MergeRequestScenarioInput,
  type PipelineJob,
  type ReviewZone,
  type RiskLevel,
  type RollbackAssessment,
  type RollbackSignal,
  type SemanticZone,
  mergeRequestScenarioInputSchema,
} from "./schema";

const severityWeight: Record<RiskLevel, number> = {
  low: 6,
  medium: 12,
  high: 24,
  critical: 36,
};

const zoneGuidance: Record<SemanticZone, string> = {
  frontend: "Validate user-visible state shifts, empty states, and access boundaries.",
  api: "Check public contract changes, serialization, and backward compatibility.",
  domain: "Review business invariants and whether new coupling leaks across bounded contexts.",
  data: "Inspect migration safety, data loss risk, and read/write sequencing.",
  ci: "Verify job deduplication, cache strategy, and branch-condition correctness.",
  docs: "Confirm reviewer instructions still match runtime behavior and operational steps.",
  tests: "Prioritize fragile assertions, integration coverage, and replayability.",
  ops: "Review rollout order, feature flag posture, and runtime observability.",
  config: "Check environment-scoped behavior and default values before merge.",
};

const zoneRiskOrder: RiskLevel[] = ["low", "medium", "high", "critical"];

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const round = (value: number): number => Math.round(value);

const toRiskLevel = (score: number): RiskLevel => {
  if (score >= 88) return "low";
  if (score >= 72) return "medium";
  if (score >= 56) return "high";
  return "critical";
};

const summarizeCategory = (
  score: number,
  low: string,
  medium: string,
  high: string,
  critical: string,
): string => {
  const risk = toRiskLevel(score);
  if (risk === "low") return low;
  if (risk === "medium") return medium;
  if (risk === "high") return high;
  return critical;
};

const computeChurn = (file: ChangedFile): number => file.linesAdded + file.linesRemoved;

const unique = <T>(values: T[]): T[] => Array.from(new Set(values));

const classifyArchitectureSeverity = (
  sourceLayer: Layer,
  targetLayer: Layer,
): RiskLevel => {
  if (
    (sourceLayer === "ui" && targetLayer === "data") ||
    (sourceLayer === "domain" && targetLayer === "data")
  ) {
    return "critical";
  }
  if (
    (sourceLayer === "ui" && targetLayer === "platform") ||
    (sourceLayer === "application" && targetLayer === "ui")
  ) {
    return "high";
  }
  return "medium";
};

const getRule = (
  rules: ArchitectureRule[],
  sourceLayer: Layer,
  targetLayer: Layer,
): ArchitectureRule | undefined =>
  rules.find(
    (rule) =>
      rule.sourceLayer === sourceLayer && rule.targetLayer === targetLayer,
  );

const analyzeArchitecture = (
  input: MergeRequestScenarioInput,
): ArcGuardReport["architecture"] => {
  const violations: ArchitectureViolation[] = [];
  const riskyDependencies: DependencySignal[] = [];
  let crossBoundaryCoupling = 0;

  for (const file of input.changedFiles) {
    const outboundLayers = unique(
      file.dependsOnLayers.filter((layer) => layer !== file.layer),
    );

    if (outboundLayers.length > 1) {
      crossBoundaryCoupling += 1;
    }

    for (const targetLayer of outboundLayers) {
      const rule = getRule(input.architectureRules, file.layer, targetLayer);
      if (!rule || rule.allowed) continue;

      violations.push({
        filePath: file.path,
        sourceLayer: file.layer,
        targetLayer,
        severity: classifyArchitectureSeverity(file.layer, targetLayer),
        rationale: rule.rationale,
      });
    }

    for (const dependency of file.newDependencies) {
      if (zoneRiskOrder.indexOf(dependency.riskLevel) >= 1) {
        riskyDependencies.push(dependency);
      }
    }
  }

  const violationPenalty = violations.reduce(
    (sum, violation) => sum + severityWeight[violation.severity],
    0,
  );
  const dependencyPenalty = riskyDependencies.reduce(
    (sum, dependency) => sum + severityWeight[dependency.riskLevel] * 0.7,
    0,
  );
  const couplingPenalty = crossBoundaryCoupling * 6;
  const score = round(
    clamp(100 - violationPenalty - dependencyPenalty - couplingPenalty, 12, 99),
  );

  return {
    score,
    riskLevel: toRiskLevel(score),
    summary: summarizeCategory(
      score,
      "Layering stays inside the intended architecture boundaries.",
      "Some coupling spread appeared, but the boundary model still mostly holds.",
      "Boundary drift needs review before this merge becomes harder to unwind.",
      "The merge request introduces direct architectural drift across protected layers.",
    ),
    violations,
    riskyDependencies,
    crossBoundaryCoupling,
  };
};

const analyzeReview = (input: MergeRequestScenarioInput): ArcGuardReport["review"] => {
  const zoneMap = new Map<SemanticZone, ChangedFile[]>();
  let totalChurn = 0;

  for (const file of input.changedFiles) {
    totalChurn += computeChurn(file);
    const zoneFiles = zoneMap.get(file.semanticZone) ?? [];
    zoneFiles.push(file);
    zoneMap.set(file.semanticZone, zoneFiles);
  }

  const zones: ReviewZone[] = Array.from(zoneMap.entries())
    .map(([zone, files]) => {
      const churn = files.reduce((sum, file) => sum + computeChurn(file), 0);
      const uniqueLayers = unique(files.map((file) => file.layer));
      const riskSeed =
        churn > 320 ? 3 : churn > 180 ? 2 : churn > 80 ? 1 : 0;
      const riskFromNotes = files.some((file) => file.riskNotes.length > 0) ? 1 : 0;
      const riskFromSpread = uniqueLayers.length > 2 ? 1 : 0;
      const riskLevel =
        zoneRiskOrder[clamp(riskSeed + riskFromNotes + riskFromSpread, 0, 3)] ??
        "critical";

      return {
        zone,
        files: files.map((file) => file.path),
        churn,
        riskLevel,
        guidance: zoneGuidance[zone],
      };
    })
    .sort((left, right) => right.churn - left.churn);

  const multiZonePenalty = Math.max(zones.length - 2, 0) * 4;
  const zonePenalty = zones.reduce(
    (sum, zone) => sum + severityWeight[zone.riskLevel] * 0.55,
    0,
  );
  const churnPenalty =
    totalChurn > 500 ? 18 : totalChurn > 300 ? 10 : totalChurn > 160 ? 4 : 0;
  const score = round(clamp(100 - multiZonePenalty - zonePenalty - churnPenalty, 24, 97));

  return {
    score,
    riskLevel: toRiskLevel(score),
    summary: summarizeCategory(
      score,
      "The diff clusters cleanly into reviewable slices.",
      "The MR is still reviewable, but reviewers need a minimap to avoid blind spots.",
      "The MR spans enough semantic areas that important review edges can be missed.",
      "The review surface is sprawling and likely to hide critical regressions.",
    ),
    totalChurn,
    zones,
  };
};

const contractEvidence = (
  contract: IntentContract,
  input: MergeRequestScenarioInput,
): IntentFinding => {
  const inferredMatches = input.changedFiles.filter((file) => {
    const pathMatch = contract.matchedFilePaths.includes(file.path);
    const zoneMatch = contract.expectedZones.includes(file.semanticZone);
    const layerMatch = contract.expectedLayers.includes(file.layer);
    return pathMatch || zoneMatch || layerMatch;
  });

  const codeAligned = inferredMatches.length > 0;
  const docsChanged =
    contract.docsUpdated ||
    input.changedFiles.some((file) => file.semanticZone === "docs");
  const testsChanged =
    contract.testsUpdated ||
    input.changedFiles.some((file) => file.semanticZone === "tests");
  const docsAligned = !contract.requiresDocs || docsChanged;
  const testsAligned = !contract.requiresTests || testsChanged;
  const mismatchWarnings: string[] = [];

  if (!codeAligned) mismatchWarnings.push("claimed change is not reflected in the touched code zones");
  if (!docsAligned) mismatchWarnings.push("documentation has not been updated to match the claimed behavior");
  if (!testsAligned) mismatchWarnings.push("tests do not prove the intended behavior change");

  const evidence = unique([
    ...inferredMatches.map((file) => file.path),
    ...(contract.evidenceNote ? [contract.evidenceNote] : []),
  ]);

  return {
    claim: contract.claim,
    codeAligned,
    docsAligned,
    testsAligned,
    mismatchWarnings,
    evidence,
  };
};

const analyzeIntent = (input: MergeRequestScenarioInput): ArcGuardReport["intent"] => {
  const findings =
    input.intentContracts.length > 0
      ? input.intentContracts.map((contract) => contractEvidence(contract, input))
      : [
          {
            claim: input.intentSummary,
            codeAligned: true,
            docsAligned: input.changedFiles.some((file) => file.semanticZone === "docs"),
            testsAligned: input.changedFiles.some((file) => file.semanticZone === "tests"),
            mismatchWarnings: [],
            evidence: input.changedFiles.slice(0, 4).map((file) => file.path),
          },
        ];

  const mismatchPenalty = findings.reduce((sum, finding) => {
    let penalty = 0;
    if (!finding.codeAligned) penalty += 22;
    if (!finding.docsAligned) penalty += 12;
    if (!finding.testsAligned) penalty += 16;
    return sum + penalty;
  }, 0);
  const score = round(clamp(100 - mismatchPenalty, 18, 98));

  return {
    score,
    riskLevel: toRiskLevel(score),
    summary: summarizeCategory(
      score,
      "The merge request intent is supported by code, docs, and tests.",
      "Most of the stated intent is covered, but some reviewer assumptions still need confirmation.",
      "The MR claims more than the evidence currently proves.",
      "The stated intent and the implementation evidence diverge in material ways.",
    ),
    findings,
  };
};

const analyzeFlake = (input: MergeRequestScenarioInput): ArcGuardReport["flake"] => {
  const evidence = [...input.flakyEvidence].sort(
    (left, right) => right.failureRate - left.failureRate,
  );
  const likelyRootCauseCategory = evidence[0]?.suspectedCauseCategory ?? null;

  if (evidence.length === 0) {
    return {
      score: 96,
      riskLevel: "low",
      summary: "No flaky-test evidence surfaced from the seeded CI data.",
      evidence: [],
      likelyRootCauseCategory,
    };
  }

  const penalty = evidence.reduce((sum, item) => {
    const ratePenalty = item.failureRate * 40;
    const occurrencePenalty = Math.min(item.occurrencesLast14Days, 8) * 3;
    return sum + ratePenalty + occurrencePenalty;
  }, 0);
  const score = round(clamp(100 - penalty, 10, 94));

  return {
    score,
    riskLevel: toRiskLevel(score),
    summary: summarizeCategory(
      score,
      "Observed flake evidence looks isolated and unlikely to block merge confidence.",
      "Flake signals exist and should be replayed before the merge window narrows.",
      "CI history already shows instability around the changed behavior.",
      "The MR intersects with pronounced flaky-test behavior that undermines trust in green pipelines.",
    ),
    evidence,
    likelyRootCauseCategory,
  };
};

const analyzeRollback = (
  rollbackSignals: RollbackSignal[],
): ArcGuardReport["rollback"] => {
  if (rollbackSignals.length === 0) {
    return {
      score: 97,
      riskLevel: "low",
      summary: "Rollback remains straightforward with no irreversible change markers.",
      status: "safe",
      blockers: [],
      recommendedStrategy: ["Standard revert is sufficient if the MR regresses."],
    };
  }

  const blockers = rollbackSignals
    .filter((signal) => !signal.reversible)
    .map((signal) => signal.detail);
  const recommendedStrategy = unique(
    rollbackSignals.map((signal) => signal.saferRollout ?? signal.mitigation),
  );
  const penalty = rollbackSignals.reduce((sum, signal) => {
    const irreversibilityPenalty = signal.reversible ? 0 : 20;
    return sum + severityWeight[signal.severity] + irreversibilityPenalty;
  }, 0);
  const score = round(clamp(100 - penalty, 8, 95));
  const status: RollbackAssessment["status"] =
    blockers.length > 0 || rollbackSignals.some((signal) => signal.severity === "critical")
      ? "unsafe"
      : rollbackSignals.some((signal) => signal.severity === "high")
        ? "caution"
        : "safe";

  return {
    score,
    riskLevel: toRiskLevel(score),
    summary: summarizeCategory(
      score,
      "Rollback posture remains healthy.",
      "Rollback is possible but needs a deliberate rollout or feature-flag plan.",
      "Rollback is fragile because the MR changes stateful or public interfaces.",
      "Rollback is not realistically safe without additional rollout controls.",
    ),
    status,
    blockers,
    recommendedStrategy,
  };
};

const sustainabilitySuggestions = (jobs: PipelineJob[]): string[] => {
  const suggestions = new Set<string>();
  for (const job of jobs) {
    if (job.duplicateOf) {
      suggestions.add(`Collapse ${job.name} into ${job.duplicateOf} or gate it behind a targeted ruleset.`);
    }
    if (job.retries > 0) {
      suggestions.add(`Stabilize ${job.name} or move it behind an opt-in replay path.`);
    }
    if (job.avoidable && job.stage === "test") {
      suggestions.add(`Scope ${job.name} to touched areas to cut wasted CI minutes.`);
    }
    if (job.avoidable && job.stage === "build") {
      suggestions.add(`Reuse build artifacts for ${job.name} instead of rebuilding identical outputs.`);
    }
    if (job.avoidable && job.stage === "test" && job.durationMinutes >= 8) {
      suggestions.add(`Split ${job.name} by changed path or risk tier so long suites only run when justified.`);
    }
    if (job.emissionsGrams >= 80) {
      suggestions.add(`Prioritize ${job.name} for CI right-sizing because it has a higher carbon and runner cost footprint.`);
    }
  }
  return [...suggestions];
};

const analyzeSustainability = (
  jobs: PipelineJob[],
): ArcGuardReport["sustainability"] => {
  const hotspots = jobs
    .filter((job) => job.avoidable || job.duplicateOf || job.retries > 0)
    .map((job) => ({
      job: job.name,
      minutes: round(job.durationMinutes),
      reason:
        job.reason ??
        (job.duplicateOf
          ? `duplicates ${job.duplicateOf}`
          : job.retries > 0
            ? "requires repeat execution"
            : "avoidable pipeline work"),
    }))
    .sort((left, right) => right.minutes - left.minutes);

  const totalMinutes = round(
    jobs.reduce((sum, job) => sum + job.durationMinutes, 0),
  );
  const avoidableMinutes = round(
    hotspots.reduce((sum, hotspot) => sum + hotspot.minutes, 0),
  );
  const avoidablePercent =
    totalMinutes === 0 ? 0 : round((avoidableMinutes / totalMinutes) * 100);
  const duplicateJobs = hotspots.filter((job) => /duplicate/i.test(job.reason)).length;
  const estimatedWasteGrams = round(
    jobs
      .filter((job) => job.avoidable || job.duplicateOf)
      .reduce((sum, job) => sum + job.emissionsGrams, 0),
  );
  const greenOpportunity =
    avoidablePercent >= 40 || duplicateJobs >= 2
      ? "major"
      : avoidablePercent >= 20 || avoidableMinutes >= 8
        ? "meaningful"
        : "tight";
  const retryPenalty = jobs.reduce((sum, job) => sum + job.retries, 0) * 6;
  const score = round(
    clamp(
      100 -
        avoidableMinutes * 1.6 -
        duplicateJobs * 9 -
        avoidablePercent * 0.45 -
        retryPenalty,
      12,
      98,
    ),
  );

  return {
    score,
    riskLevel: toRiskLevel(score),
    summary: summarizeCategory(
      score,
      "CI execution is proportionate to the change.",
      "Some CI minutes are recoverable through targeting and deduplication.",
      "The pipeline spends meaningful time on work that does not improve confidence or sustainability posture.",
      "CI waste is material and should be fixed alongside the merge concerns.",
    ),
    totalMinutes,
    avoidableMinutes,
    avoidablePercent,
    duplicateJobs,
    estimatedWasteGrams,
    greenOpportunity,
    hotspots,
    suggestions: sustainabilitySuggestions(jobs),
  };
};

const buildKeyFindings = (
  report: Omit<ArcGuardReport, "keyFindings" | "reviewerGuidance">,
): string[] => {
  const findings: string[] = [];

  for (const violation of report.architecture.violations.slice(0, 3)) {
    findings.push(
      `${violation.filePath} crosses ${violation.sourceLayer} -> ${violation.targetLayer} despite the stated architecture boundary.`,
    );
  }
  for (const finding of report.intent.findings) {
    for (const warning of finding.mismatchWarnings) {
      findings.push(`${finding.claim}: ${warning}.`);
    }
  }
  if (report.flake.evidence[0]) {
    findings.push(
      `${report.flake.evidence[0].testName} has repeat failures consistent with ${report.flake.evidence[0].suspectedCauseCategory}.`,
    );
  }
  if (report.rollback.blockers[0]) findings.push(report.rollback.blockers[0]);
  if (report.sustainability.hotspots[0]) {
    findings.push(
      `${report.sustainability.hotspots[0].job} accounts for ${report.sustainability.hotspots[0].minutes} avoidable CI minutes.`,
    );
  }

  return unique(findings).slice(0, 6);
};

const buildReviewerGuidance = (
  review: ArcGuardReport["review"],
  input: MergeRequestScenarioInput,
): string[] => {
  const guidance = new Set<string>(input.reviewerHints);
  for (const zone of review.zones.slice(0, 3)) {
    guidance.add(`${zone.zone}: ${zone.guidance}`);
  }
  if (input.changedFiles.some((file) => file.semanticZone === "data")) {
    guidance.add("Validate migration order and rollback assumptions against the target environment.");
  }
  if (input.changedFiles.some((file) => file.semanticZone === "ci")) {
    guidance.add("Inspect CI rules for branch targeting, cache reuse, and job duplication.");
  }
  return [...guidance].slice(0, 8);
};

export const verdictLabel = (verdict: ArcGuardReport["verdict"]): string => {
  if (verdict === "safe_to_merge") return "Safe to Merge";
  if (verdict === "needs_fixes") return "Needs Fixes";
  return "Blocked";
};

export const analyzeMergeRequest = (
  rawInput: MergeRequestScenarioInput,
): ArcGuardReport => {
  const input = mergeRequestScenarioInputSchema.parse(rawInput);
  const architecture = analyzeArchitecture(input);
  const review = analyzeReview(input);
  const intent = analyzeIntent(input);
  const flake = analyzeFlake(input);
  const rollback = analyzeRollback(input.rollbackSignals);
  const sustainability = analyzeSustainability(input.pipelineJobs);

  const score = round(
    architecture.score * 0.24 +
      review.score * 0.16 +
      intent.score * 0.18 +
      flake.score * 0.14 +
      rollback.score * 0.2 +
      sustainability.score * 0.08,
  );

  const blocked =
    rollback.status === "unsafe" ||
    architecture.violations.some(
      (violation) => violation.severity === "critical",
    ) ||
    score < 55 ||
    intent.findings.some((finding) => !finding.codeAligned);

  const needsFixes =
    !blocked &&
    (score < 80 ||
      architecture.violations.length > 0 ||
      intent.findings.some((finding) => !finding.docsAligned || !finding.testsAligned) ||
      sustainability.avoidableMinutes >= 10 ||
      review.zones.some((zone) => zone.riskLevel === "high"));

  const verdict = blocked
    ? "blocked"
    : needsFixes
      ? "needs_fixes"
      : "safe_to_merge";

  const reportBase = {
    input,
    score,
    verdict,
    verdictLabel: verdictLabel(verdict),
    architecture,
    review,
    intent,
    flake,
    rollback,
    sustainability,
    timeline: [
      {
        stage: "Ingest Diff",
        summary: `${input.changedFiles.length} changed files spanning ${review.zones.length} semantic review zones.`,
      },
      {
        stage: "Inspect Structure",
        summary:
          architecture.violations.length > 0
            ? `${architecture.violations.length} architecture drift findings detected.`
            : "No direct layer violations detected against the configured architecture rules.",
      },
      {
        stage: "Score Intent",
        summary: `${intent.findings.length} intent contracts evaluated against code, tests, and docs.`,
      },
      {
        stage: "Detect Flake Risk",
        summary:
          flake.evidence.length > 0
            ? `${flake.evidence.length} flaky-test evidence capsule(s) identified from CI history.`
            : "No flaky-test evidence surfaced in the seeded CI history.",
      },
      {
        stage: "Evaluate Rollback",
        summary:
          rollback.status === "unsafe"
            ? "Rollback is not considered safe without an alternate rollout strategy."
            : rollback.status === "caution"
              ? "Rollback remains possible but needs staged rollout controls."
              : "Rollback posture remains safe.",
      },
      {
        stage: "Generate Verdict",
        summary: `${verdictLabel(verdict)} at ${score}/100 merge confidence.`,
      },
    ],
  } satisfies Omit<ArcGuardReport, "keyFindings" | "reviewerGuidance">;

  return {
    ...reportBase,
    reviewerGuidance: buildReviewerGuidance(review, input),
    keyFindings: buildKeyFindings(reportBase),
  };
};
