import { z } from "zod";

export const riskLevelSchema = z.enum(["low", "medium", "high", "critical"]);
export type RiskLevel = z.infer<typeof riskLevelSchema>;

export const verdictSchema = z.enum([
  "safe_to_merge",
  "needs_fixes",
  "blocked",
]);
export type Verdict = z.infer<typeof verdictSchema>;

export const rollbackStatusSchema = z.enum(["safe", "caution", "unsafe"]);
export type RollbackStatus = z.infer<typeof rollbackStatusSchema>;

export const layerSchema = z.enum([
  "ui",
  "application",
  "domain",
  "data",
  "platform",
  "docs",
  "test",
  "ops",
  "external",
]);
export type Layer = z.infer<typeof layerSchema>;

export const semanticZoneSchema = z.enum([
  "frontend",
  "api",
  "domain",
  "data",
  "ci",
  "docs",
  "tests",
  "ops",
  "config",
]);
export type SemanticZone = z.infer<typeof semanticZoneSchema>;

export const changeTypeSchema = z.enum([
  "added",
  "modified",
  "deleted",
  "renamed",
]);
export type ChangeType = z.infer<typeof changeTypeSchema>;

export const dependencyEcosystemSchema = z.enum([
  "npm",
  "pnpm",
  "python",
  "go",
  "internal",
]);
export type DependencyEcosystem = z.infer<typeof dependencyEcosystemSchema>;

export const dependencySignalSchema = z.object({
  name: z.string().min(1),
  ecosystem: dependencyEcosystemSchema,
  version: z.string().min(1).optional(),
  riskLevel: riskLevelSchema,
  reason: z.string().min(1),
  sourceLayer: layerSchema,
  targetLayer: layerSchema,
});
export type DependencySignal = z.infer<typeof dependencySignalSchema>;

export const changedFileSchema = z.object({
  path: z.string().min(1),
  previousPath: z.string().min(1).optional(),
  changeType: changeTypeSchema,
  linesAdded: z.number().int().nonnegative(),
  linesRemoved: z.number().int().nonnegative(),
  summary: z.string().min(1),
  layer: layerSchema,
  semanticZone: semanticZoneSchema,
  dependsOnLayers: z.array(layerSchema).default([]),
  imports: z.array(z.string()).default([]),
  newDependencies: z.array(dependencySignalSchema).default([]),
  intentTags: z.array(z.string()).default([]),
  riskNotes: z.array(z.string()).default([]),
});
export type ChangedFile = z.infer<typeof changedFileSchema>;

export const architectureRuleSchema = z.object({
  sourceLayer: layerSchema,
  targetLayer: layerSchema,
  allowed: z.boolean(),
  rationale: z.string().min(1),
});
export type ArchitectureRule = z.infer<typeof architectureRuleSchema>;

export const intentContractSchema = z.object({
  claim: z.string().min(1),
  expectedZones: z.array(semanticZoneSchema).default([]),
  expectedLayers: z.array(layerSchema).default([]),
  requiresDocs: z.boolean().default(false),
  requiresTests: z.boolean().default(true),
  matchedFilePaths: z.array(z.string()).default([]),
  docsUpdated: z.boolean().default(false),
  testsUpdated: z.boolean().default(false),
  evidenceNote: z.string().optional(),
});
export type IntentContract = z.infer<typeof intentContractSchema>;

export const flakeEvidenceSchema = z.object({
  testName: z.string().min(1),
  failureRate: z.number().min(0).max(1),
  occurrencesLast14Days: z.number().int().nonnegative(),
  suspectedCauseCategory: z.enum([
    "timing",
    "order-dependence",
    "shared-state",
    "network",
    "data-race",
    "environment-drift",
  ]),
  symptoms: z.array(z.string()).min(1),
  impactedPaths: z.array(z.string()).default([]),
  replaySteps: z.array(z.string()).min(1),
  envSnapshot: z.array(z.string()).default([]),
});
export type FlakeEvidence = z.infer<typeof flakeEvidenceSchema>;

export const rollbackSignalSchema = z.object({
  kind: z.enum([
    "schema",
    "public_interface",
    "config",
    "data_backfill",
    "migration",
  ]),
  reversible: z.boolean(),
  severity: riskLevelSchema,
  detail: z.string().min(1),
  mitigation: z.string().min(1),
  saferRollout: z.string().optional(),
});
export type RollbackSignal = z.infer<typeof rollbackSignalSchema>;

export const pipelineJobSchema = z.object({
  name: z.string().min(1),
  stage: z.string().min(1),
  durationMinutes: z.number().nonnegative(),
  status: z.enum(["success", "failed", "running", "skipped"]),
  retries: z.number().int().nonnegative().default(0),
  duplicateOf: z.string().optional(),
  avoidable: z.boolean().default(false),
  reason: z.string().optional(),
  emissionsGrams: z.number().nonnegative().default(0),
});
export type PipelineJob = z.infer<typeof pipelineJobSchema>;

export const mergeRequestScenarioInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  repository: z.string().min(1),
  author: z.string().min(1),
  sourceBranch: z.string().min(1),
  targetBranch: z.string().min(1),
  summary: z.string().min(1),
  intentSummary: z.string().min(1),
  pipelineStatus: z.enum(["passed", "running", "failed"]),
  architectureRules: z.array(architectureRuleSchema).min(1),
  changedFiles: z.array(changedFileSchema).min(1),
  intentContracts: z.array(intentContractSchema).default([]),
  flakyEvidence: z.array(flakeEvidenceSchema).default([]),
  rollbackSignals: z.array(rollbackSignalSchema).default([]),
  pipelineJobs: z.array(pipelineJobSchema).default([]),
  reviewerHints: z.array(z.string()).default([]),
  scenarioTags: z.array(z.string()).default([]),
});
export type MergeRequestScenarioInput = z.infer<
  typeof mergeRequestScenarioInputSchema
>;

export type ArchitectureViolation = {
  filePath: string;
  sourceLayer: Layer;
  targetLayer: Layer;
  severity: RiskLevel;
  rationale: string;
};

export type ReviewZone = {
  zone: SemanticZone;
  files: string[];
  churn: number;
  riskLevel: RiskLevel;
  guidance: string;
};

export type IntentFinding = {
  claim: string;
  codeAligned: boolean;
  docsAligned: boolean;
  testsAligned: boolean;
  mismatchWarnings: string[];
  evidence: string[];
};

export type RollbackAssessment = {
  status: RollbackStatus;
  blockers: string[];
  recommendedStrategy: string[];
};

export type SustainabilityAssessment = {
  totalMinutes: number;
  avoidableMinutes: number;
  avoidablePercent: number;
  duplicateJobs: number;
  estimatedWasteGrams: number;
  greenOpportunity: "tight" | "meaningful" | "major";
  hotspots: Array<{
    job: string;
    minutes: number;
    reason: string;
  }>;
  suggestions: string[];
};

export type CategoryScore = {
  score: number;
  riskLevel: RiskLevel;
  summary: string;
};

export type ArcGuardReport = {
  input: MergeRequestScenarioInput;
  score: number;
  verdict: Verdict;
  verdictLabel: string;
  architecture: CategoryScore & {
    violations: ArchitectureViolation[];
    riskyDependencies: DependencySignal[];
    crossBoundaryCoupling: number;
  };
  review: CategoryScore & {
    totalChurn: number;
    zones: ReviewZone[];
  };
  intent: CategoryScore & {
    findings: IntentFinding[];
  };
  flake: CategoryScore & {
    evidence: FlakeEvidence[];
    likelyRootCauseCategory: FlakeEvidence["suspectedCauseCategory"] | null;
  };
  rollback: CategoryScore & RollbackAssessment;
  sustainability: CategoryScore & SustainabilityAssessment;
  timeline: Array<{
    stage: string;
    summary: string;
  }>;
  reviewerGuidance: string[];
  keyFindings: string[];
};
