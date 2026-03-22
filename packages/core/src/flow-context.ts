import {
  type ArchitectureRule,
  type ChangedFile,
  type DependencySignal,
  type FlakeEvidence,
  type IntentContract,
  type Layer,
  type MergeRequestScenarioInput,
  type PipelineJob,
  mergeRequestScenarioInputSchema,
} from "./schema";

const defaultArchitectureRules: ArchitectureRule[] = [
  {
    sourceLayer: "ui",
    targetLayer: "application",
    allowed: true,
    rationale: "UI may depend on application orchestration only.",
  },
  {
    sourceLayer: "ui",
    targetLayer: "domain",
    allowed: false,
    rationale: "UI must not import domain logic directly.",
  },
  {
    sourceLayer: "ui",
    targetLayer: "data",
    allowed: false,
    rationale: "UI must never reach persistence or migrations directly.",
  },
  {
    sourceLayer: "application",
    targetLayer: "domain",
    allowed: true,
    rationale: "Application services coordinate domain behavior.",
  },
  {
    sourceLayer: "application",
    targetLayer: "data",
    allowed: true,
    rationale: "Application services may orchestrate data access through adapters.",
  },
  {
    sourceLayer: "application",
    targetLayer: "ui",
    allowed: false,
    rationale: "Application layer must not depend on UI concerns.",
  },
  {
    sourceLayer: "domain",
    targetLayer: "application",
    allowed: false,
    rationale: "Domain code must remain policy-focused and orchestration-free.",
  },
  {
    sourceLayer: "domain",
    targetLayer: "data",
    allowed: false,
    rationale: "Domain logic must not depend on persistence details.",
  },
  {
    sourceLayer: "data",
    targetLayer: "platform",
    allowed: true,
    rationale: "Data adapters can depend on platform and infrastructure utilities.",
  },
  {
    sourceLayer: "test",
    targetLayer: "application",
    allowed: true,
    rationale: "Tests may exercise application and domain behavior.",
  },
  {
    sourceLayer: "ops",
    targetLayer: "platform",
    allowed: true,
    rationale: "Operational config can depend on platform utilities.",
  },
];

const riskPackages: Record<string, DependencySignal["riskLevel"]> = {
  "pg-boss": "high",
  knex: "medium",
  prisma: "medium",
  lodash: "low",
  moment: "medium",
};

const extractScenarioMarker = (text: string): string | null => {
  const match = text.match(/arcguard-scenario:\s*([a-z0-9-]+)/i);
  return match?.[1]?.toLowerCase() ?? null;
};

const countPattern = (input: string, expression: RegExp): number =>
  input.split("\n").filter((line) => expression.test(line)).length;

const inferLayerFromPath = (path: string): Layer => {
  const normalized = path.toLowerCase();
  if (
    normalized.includes("/ui/") ||
    normalized.includes("/components/") ||
    normalized.endsWith(".tsx")
  ) {
    return "ui";
  }
  if (normalized.includes("/application/") || normalized.includes("/services/")) {
    return "application";
  }
  if (normalized.includes("/domain/") || normalized.includes("/entities/")) {
    return "domain";
  }
  if (
    normalized.includes("/data/") ||
    normalized.includes("/migrations/") ||
    normalized.includes("/queries/")
  ) {
    return "data";
  }
  if (
    normalized.includes("/docs/") ||
    normalized.endsWith(".md") ||
    normalized.endsWith(".mdx")
  ) {
    return "docs";
  }
  if (
    normalized.includes("/test") ||
    normalized.includes("/spec") ||
    normalized.includes("__tests__")
  ) {
    return "test";
  }
  if (
    normalized.includes("gitlab-ci") ||
    normalized.includes("/ci/") ||
    normalized.includes("/pipelines/")
  ) {
    return "ops";
  }
  return "platform";
};

const inferZoneFromPath = (path: string): ChangedFile["semanticZone"] => {
  const normalized = path.toLowerCase();
  if (normalized.includes("/ui/") || normalized.endsWith(".tsx")) return "frontend";
  if (normalized.includes("/api/") || normalized.includes("/controllers/")) return "api";
  if (normalized.includes("/domain/")) return "domain";
  if (normalized.includes("/data/") || normalized.includes("/migrations/")) return "data";
  if (normalized.includes("gitlab-ci") || normalized.includes("/ci/")) return "ci";
  if (
    normalized.includes("/docs/") ||
    normalized.endsWith(".md") ||
    normalized.endsWith(".mdx")
  ) {
    return "docs";
  }
  if (
    normalized.includes("/test") ||
    normalized.includes("/spec") ||
    normalized.includes("__tests__")
  ) {
    return "tests";
  }
  if (normalized.includes("/ops/") || normalized.includes("/helm/")) return "ops";
  return "config";
};

const importedLayersFromDiff = (diffText: string): Layer[] => {
  const layers = new Set<Layer>();
  const importLines = diffText
    .split("\n")
    .filter((line) => line.startsWith("+") && /import|from|require\(/i.test(line));

  for (const line of importLines) {
    const normalized = line.toLowerCase();
    if (normalized.includes("/ui/")) layers.add("ui");
    if (normalized.includes("/application/")) layers.add("application");
    if (normalized.includes("/domain/")) layers.add("domain");
    if (normalized.includes("/data/") || normalized.includes("/migrations/")) layers.add("data");
    if (normalized.includes("/platform/")) layers.add("platform");
  }
  return [...layers];
};

const dependencySignalsFromDiff = (
  filePath: string,
  diffText: string,
  sourceLayer: Layer,
): DependencySignal[] => {
  if (!/package\.json|pnpm-lock|requirements\.txt/i.test(filePath)) return [];

  const dependencies: DependencySignal[] = [];
  for (const line of diffText.split("\n")) {
    if (!line.startsWith("+")) continue;
    const match = line.match(/"([a-z0-9@/_-]+)"\s*:\s*"([^"]+)"/i);
    if (!match) continue;
    const name = match[1];
    const version = match[2];
    if (!name || !version) continue;
    dependencies.push({
      name,
      ecosystem: /requirements\.txt/i.test(filePath) ? "python" : "npm",
      version,
      riskLevel: riskPackages[name] ?? "low",
      reason:
        riskPackages[name] && riskPackages[name] !== "low"
          ? "new runtime dependency expands the operational blast radius"
          : "new dependency should be reviewed for lockfile and bundle impact",
      sourceLayer,
      targetLayer: "external",
    });
  }
  return dependencies;
};

const riskNotesFromDiff = (filePath: string, diffText: string): string[] => {
  const notes = new Set<string>();
  const normalizedPath = filePath.toLowerCase();
  const normalizedDiff = diffText.toLowerCase();

  if (normalizedPath.includes("/migrations/") && /drop column|drop table|alter column/i.test(normalizedDiff)) {
    notes.add("migration changes include destructive schema operations");
  }
  if (normalizedPath.includes("/api/") && /export|response|request|schema/i.test(normalizedDiff)) {
    notes.add("public interface changed in a user-facing contract surface");
  }
  if (/rerun|flake|retry/i.test(normalizedDiff)) {
    notes.add("diff references flaky execution or retry behavior");
  }
  return [...notes];
};

const summarizePath = (path: string): string => {
  const leaf = path.split("/").pop() ?? path;
  return `Change detected in ${leaf}`;
};

const defaultIntentContracts = (
  title: string,
  description: string,
  changedFiles: ChangedFile[],
): IntentContract[] => {
  const text = `${title}\n${description}`.toLowerCase();
  const docsUpdated = changedFiles.some((file) => file.semanticZone === "docs");
  const testsUpdated = changedFiles.some((file) => file.semanticZone === "tests");

  const contracts: IntentContract[] = [
    {
      claim: title,
      expectedZones: Array.from(new Set(changedFiles.map((file) => file.semanticZone))).slice(0, 3),
      expectedLayers: Array.from(new Set(changedFiles.map((file) => file.layer))).slice(0, 3),
      requiresDocs: /api|contract|reviewer|behavior|checkout|public/i.test(text),
      requiresTests: !/docs-only|docs only/i.test(text),
      matchedFilePaths: changedFiles.slice(0, 4).map((file) => file.path),
      docsUpdated,
      testsUpdated,
      evidenceNote: "Inferred directly from MR title and touched files.",
    },
  ];

  if (/rollback|migration|schema/i.test(text)) {
    contracts.push({
      claim: "Schema changes include a safe rollback path",
      expectedZones: ["data"],
      expectedLayers: ["data"],
      requiresDocs: true,
      requiresTests: true,
      matchedFilePaths: changedFiles
        .filter((file) => file.semanticZone === "data")
        .map((file) => file.path),
      docsUpdated,
      testsUpdated,
      evidenceNote: "Generated because the MR mentions migration or rollback-sensitive work.",
    });
  }
  return contracts;
};

const flakyEvidenceFromText = (text: string): FlakeEvidence[] => {
  const evidence: FlakeEvidence[] = [];
  const match = text.match(/flaky test:\s*([^\n]+)\n/i);
  if (!match) return evidence;
  const testName = match[1]?.trim();
  if (!testName) return evidence;

  evidence.push({
    testName,
    failureRate: 0.28,
    occurrencesLast14Days: 4,
    suspectedCauseCategory: /network/i.test(text) ? "network" : "shared-state",
    symptoms: ["passed on rerun", "intermittent assertion mismatch"],
    impactedPaths: [],
    replaySteps: [
      "Run the affected spec ten times against the MR branch.",
      "Disable parallelization for the failing suite to isolate ordering effects.",
    ],
    envSnapshot: ["CI=true", "GITLAB_CI=1"],
  });
  return evidence;
};

const rollbackSignalsFromFiles = (files: ChangedFile[]) =>
  files.flatMap((file) => {
    const signals = [];
    if (file.riskNotes.some((note) => note.includes("destructive schema"))) {
      signals.push({
        kind: "schema" as const,
        reversible: false,
        severity: "critical" as const,
        detail: `${file.path} contains destructive schema operations that are not instantly reversible.`,
        mitigation: "Prepare a forward-fix migration before merge.",
        saferRollout: "Ship behind an expand-contract migration plan and postpone column removal.",
      });
    }
    if (file.riskNotes.some((note) => note.includes("public interface"))) {
      signals.push({
        kind: "public_interface" as const,
        reversible: false,
        severity: "high" as const,
        detail: `${file.path} updates a public interface surface that may break consumers on rollback.`,
        mitigation: "Version the contract or keep backward-compatible fields until rollout completes.",
        saferRollout: "Use a compatibility shim and dual-read strategy during rollout.",
      });
    }
    return signals;
  });

const pipelineJobsFromContext = (candidateJobs: unknown): PipelineJob[] => {
  if (!Array.isArray(candidateJobs)) return [];

  return candidateJobs
    .map((job): PipelineJob | null => {
      if (!job || typeof job !== "object") return null;
      const record = job as Record<string, unknown>;
      const name = typeof record.name === "string" ? record.name : null;
      if (!name) return null;
      const durationSeconds =
        typeof record.duration_seconds === "number"
          ? record.duration_seconds
          : typeof record.duration === "number"
            ? record.duration
            : 0;

      return {
        name,
        stage: typeof record.stage === "string" ? record.stage : "test",
        durationMinutes: Number((durationSeconds / 60).toFixed(1)),
        status:
          record.status === "failed" ||
          record.status === "running" ||
          record.status === "skipped"
            ? record.status
            : "success",
        retries: typeof record.retries === "number" ? record.retries : 0,
        duplicateOf:
          typeof record.duplicate_of === "string" ? record.duplicate_of : undefined,
        avoidable:
          Boolean(record.avoidable) ||
          typeof record.duplicate_of === "string" ||
          (typeof record.retries === "number" && record.retries > 0),
        reason:
          typeof record.reason === "string"
            ? record.reason
            : typeof record.duplicate_of === "string"
              ? `duplicates ${record.duplicate_of}`
              : undefined,
        emissionsGrams:
          typeof record.emissions_grams === "number" ? record.emissions_grams : 0,
      };
    })
    .filter((job): job is PipelineJob => job !== null);
};

export const flowContextToScenario = (
  rawContext: unknown,
): { scenarioId: string | null; input: MergeRequestScenarioInput } => {
  const context =
    rawContext && typeof rawContext === "object"
      ? (rawContext as Record<string, unknown>)
      : {};

  const mergeRequest =
    (context.merge_request as Record<string, unknown> | undefined) ??
    (context.mergeRequest as Record<string, unknown> | undefined) ??
    {};

  const title =
    (typeof mergeRequest.title === "string" && mergeRequest.title) ||
    "ArcGuard Merge Request Analysis";
  const description =
    (typeof mergeRequest.description === "string" && mergeRequest.description) ||
    "No description provided.";
  const repository =
    (mergeRequest.project &&
      typeof mergeRequest.project === "object" &&
      typeof (mergeRequest.project as Record<string, unknown>).path_with_namespace === "string" &&
      ((mergeRequest.project as Record<string, unknown>).path_with_namespace as string)) ||
    (typeof context.project_path === "string" ? context.project_path : null) ||
    "local/demo-repo";
  const authorRecord =
    mergeRequest.author && typeof mergeRequest.author === "object"
      ? (mergeRequest.author as Record<string, unknown>)
      : {};
  const author =
    (typeof authorRecord.name === "string" && authorRecord.name) ||
    (typeof authorRecord.username === "string" && authorRecord.username) ||
    "ArcGuard Demo User";
  const sourceBranch =
    (typeof mergeRequest.source_branch === "string" && mergeRequest.source_branch) ||
    "feature/arcguard";
  const targetBranch =
    (typeof mergeRequest.target_branch === "string" && mergeRequest.target_branch) ||
    "main";

  const diffCandidates = [
    context.diffs,
    context.changes,
    mergeRequest.diffs,
    mergeRequest.changes,
  ].find(Array.isArray) as Array<Record<string, unknown>> | undefined;

  const derivedChangedFiles =
    diffCandidates?.map((diff): ChangedFile => {
      const path =
        (typeof diff.new_path === "string" && diff.new_path) ||
        (typeof diff.path === "string" && diff.path) ||
        (typeof diff.newPath === "string" && diff.newPath) ||
        "unknown/file.ts";
      const diffText =
        (typeof diff.diff === "string" && diff.diff) ||
        (typeof diff.patch === "string" && diff.patch) ||
        "";
      const layer = inferLayerFromPath(path);

      return {
        path,
        previousPath: typeof diff.old_path === "string" ? diff.old_path : undefined,
        changeType:
          typeof diff.deleted_file === "boolean" && diff.deleted_file
            ? "deleted"
            : typeof diff.new_file === "boolean" && diff.new_file
              ? "added"
              : "modified",
        linesAdded: countPattern(diffText, /^\+(?!\+\+)/),
        linesRemoved: countPattern(diffText, /^-(?!--)/),
        summary: summarizePath(path),
        layer,
        semanticZone: inferZoneFromPath(path),
        dependsOnLayers: importedLayersFromDiff(diffText),
        imports: diffText
          .split("\n")
          .filter((line) => line.startsWith("+") && /import|from|require\(/i.test(line))
          .map((line) => line.slice(1).trim())
          .slice(0, 8),
        newDependencies: dependencySignalsFromDiff(path, diffText, layer),
        intentTags: [],
        riskNotes: riskNotesFromDiff(path, diffText),
      };
    }) ?? [];

  const changedFiles: ChangedFile[] =
    derivedChangedFiles.length > 0 ? derivedChangedFiles : [
      {
        path: "src/application/arcguard-demo.ts",
        changeType: "modified",
        linesAdded: 14,
        linesRemoved: 6,
        summary: "Fallback synthetic file generated from flow context",
        layer: "application",
        semanticZone: "config",
        dependsOnLayers: ["domain"],
        imports: [],
        newDependencies: [],
        intentTags: [],
        riskNotes: [],
      },
    ];

  const textCorpus = [
    title,
    description,
    JSON.stringify(context.notes ?? []),
    JSON.stringify(context.comments ?? []),
    JSON.stringify(context.discussions ?? []),
  ].join("\n");

  const scenarioId = extractScenarioMarker(textCorpus);
  const rollbackSignals = rollbackSignalsFromFiles(changedFiles);
  const flakyEvidence = flakyEvidenceFromText(textCorpus);
  const pipelineJobs = pipelineJobsFromContext(
    context.pipeline_jobs ?? context.jobs ?? mergeRequest.jobs,
  );

  const input = mergeRequestScenarioInputSchema.parse({
    id: scenarioId ?? "flow-context",
    name: scenarioId ? `Flow scenario ${scenarioId}` : "Flow Context Analysis",
    title,
    description,
    repository,
    author,
    sourceBranch,
    targetBranch,
    summary:
      typeof context.summary === "string"
        ? context.summary
        : "Heuristic ArcGuard analysis generated from AI_FLOW_CONTEXT.",
    intentSummary: title,
    pipelineStatus:
      pipelineJobs.some((job) => job.status === "failed")
        ? "failed"
        : pipelineJobs.some((job) => job.status === "running")
          ? "running"
          : "passed",
    architectureRules: defaultArchitectureRules,
    changedFiles,
    intentContracts: defaultIntentContracts(title, description, changedFiles),
    flakyEvidence,
    rollbackSignals,
    pipelineJobs,
    reviewerHints: [],
    scenarioTags: scenarioId ? [scenarioId, "flow-triggered"] : ["flow-triggered"],
  });

  return { scenarioId, input };
};

export const getDefaultArchitectureRules = (): ArchitectureRule[] => [
  ...defaultArchitectureRules,
];
