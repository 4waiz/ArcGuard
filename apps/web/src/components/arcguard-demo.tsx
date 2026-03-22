"use client";

import {
  analyzeMergeRequest,
  type ArcGuardReport,
  type RiskLevel,
  type SemanticZone,
} from "@arcguard/core";
import { seededScenarios } from "@arcguard/fixtures";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRightLeft,
  Bot,
  ChevronRight,
  CircuitBoard,
  FileStack,
  FlaskConical,
  GitMerge,
  Leaf,
  Play,
  Radar,
  ScrollText,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "accent";

const motionProps = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.45, ease: "easeOut" as const },
};

const riskVariant = (riskLevel: RiskLevel): BadgeVariant => {
  if (riskLevel === "low") return "success";
  if (riskLevel === "medium") return "warning";
  return "danger";
};

const verdictVariant = (verdict: ArcGuardReport["verdict"]): BadgeVariant => {
  if (verdict === "safe_to_merge") return "success";
  if (verdict === "needs_fixes") return "warning";
  return "danger";
};

const zoneLabel = (zone: SemanticZone): string =>
  zone === "ci" ? "CI" : zone.charAt(0).toUpperCase() + zone.slice(1);

const totalChurn = (report: ArcGuardReport): number =>
  report.input.changedFiles.reduce(
    (sum, file) => sum + file.linesAdded + file.linesRemoved,
    0,
  );

const stageDescriptions = [
  "ingest diff",
  "inspect structure",
  "score intent",
  "detect flake risk",
  "evaluate rollback",
  "generate verdict",
];

function StageRail({
  report,
  stageIndex,
  isRunning,
}: {
  report: ArcGuardReport;
  stageIndex: number;
  isRunning: boolean;
}) {
  return (
    <ol className="space-y-4">
      {report.timeline.map((item, index) => {
        const completed =
          stageIndex > index || (!isRunning && stageIndex >= report.timeline.length);
        const active = isRunning && stageIndex === index;

        return (
          <li
            key={item.stage}
            className={cn(
              "rounded-2xl border p-4 transition",
              completed
                ? "border-emerald-400/20 bg-emerald-400/10"
                : active
                  ? "border-violet-300/30 bg-violet-400/10"
                  : "border-white/8 bg-white/4",
            )}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "mt-1 h-3 w-3 rounded-full",
                  completed
                    ? "bg-emerald-300"
                    : active
                      ? "bg-violet-300 shadow-[0_0_18px_rgba(191,150,255,0.8)]"
                      : "bg-white/20",
                )}
              />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {item.stage}
                </p>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  {item.summary}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function ArcGuardDemo() {
  const reducedMotion = useReducedMotion();
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    seededScenarios[0]?.id ?? "",
  );
  const deferredScenarioId = useDeferredValue(selectedScenarioId);
  const initialScenario = seededScenarios[0];
  const [report, setReport] = useState(() =>
    initialScenario ? analyzeMergeRequest(initialScenario) : null,
  );
  const [pendingReport, setPendingReport] = useState(report);
  const [stageIndex, setStageIndex] = useState(report?.timeline.length ?? 0);
  const [isRunning, setIsRunning] = useState(false);
  const chartsReady = typeof window !== "undefined";

  const selectedScenario =
    seededScenarios.find((scenario) => scenario.id === deferredScenarioId) ??
    seededScenarios[0];
  const displayReport = pendingReport ?? report;

  const completeStage = useEffectEvent(() => {
    if (!displayReport) return;
    setStageIndex((current) => {
      if (current >= displayReport.timeline.length) {
        setIsRunning(false);
        setReport(displayReport);
        return displayReport.timeline.length;
      }

      const nextValue = current + 1;
      if (nextValue >= displayReport.timeline.length) {
        setIsRunning(false);
        setReport(displayReport);
      }
      return nextValue;
    });
  });

  useEffect(() => {
    if (!isRunning || !displayReport) return;
    const timer = window.setTimeout(completeStage, reducedMotion ? 120 : 420);
    return () => window.clearTimeout(timer);
  }, [displayReport, isRunning, reducedMotion, stageIndex]);

  if (!selectedScenario || !displayReport || !report) {
    return null;
  }

  const isStale = report.input.id !== selectedScenario.id;

  const scoreBreakdown = [
    { name: "Architecture", score: displayReport.architecture.score, fill: "#bf96ff" },
    { name: "Review", score: displayReport.review.score, fill: "#7c5cff" },
    { name: "Intent", score: displayReport.intent.score, fill: "#5eead4" },
    { name: "Flake", score: displayReport.flake.score, fill: "#fbbf24" },
    { name: "Rollback", score: displayReport.rollback.score, fill: "#fb7185" },
    { name: "CI Waste", score: displayReport.sustainability.score, fill: "#22c55e" },
  ];

  const wasteChartData = displayReport.sustainability.hotspots.map((hotspot) => ({
    name: hotspot.job,
    minutes: hotspot.minutes,
  }));

  const analysisProgress = Math.round(
    (stageIndex / displayReport.timeline.length) * 100,
  );
  const currentStageLabel =
    stageDescriptions[Math.min(stageIndex, stageDescriptions.length - 1)] ??
    stageDescriptions[stageDescriptions.length - 1];

  const runAnalysis = () => {
    const nextReport = analyzeMergeRequest(selectedScenario);
    startTransition(() => {
      setPendingReport(nextReport);
      setStageIndex(0);
      setIsRunning(true);
    });
  };

  return (
    <div className="px-6 pb-20 pt-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <motion.section
          {...motionProps}
          className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
        >
          <Card className="overflow-hidden border-violet-300/15 bg-[linear-gradient(135deg,rgba(18,18,37,0.98),rgba(9,10,21,0.94))]">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-2">
                  <Badge variant="accent">Interactive Merge Request Analysis</Badge>
                  <CardTitle className="text-3xl">ArcGuard demo console</CardTitle>
                  <CardDescription>
                    Switch between seeded merge requests, trigger the same analysis
                    engine used by the GitLab Duo flow, and inspect the resulting
                    Merge Confidence Report.
                  </CardDescription>
                </div>
                <Button
                  onClick={runAnalysis}
                  aria-label="Run ArcGuard analysis on the selected scenario"
                >
                  <Play className="h-4 w-4" />
                  Run ArcGuard
                </Button>
              </div>

              <div className="flex flex-wrap gap-3">
                {seededScenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    type="button"
                    aria-pressed={selectedScenarioId === scenario.id}
                    onClick={() =>
                      startTransition(() => {
                        setSelectedScenarioId(scenario.id);
                      })
                    }
                    className={cn(
                      "focus-ring rounded-2xl border px-4 py-3 text-left transition",
                      selectedScenarioId === scenario.id
                        ? "border-violet-300/40 bg-violet-400/12 shadow-[0_0_28px_rgba(157,108,255,0.2)]"
                        : "border-white/8 bg-white/4 hover:border-white/15 hover:bg-white/7",
                    )}
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      {scenario.name}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                      {scenario.title}
                    </p>
                  </button>
                ))}
              </div>
            </CardHeader>
          </Card>

          <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(12,14,27,0.9),rgba(9,10,18,0.82))]">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Analysis timeline</CardTitle>
                  <CardDescription>
                    Real deterministic scoring with staged reveal for demo pace.
                  </CardDescription>
                </div>
                <Bot className="h-5 w-5 text-violet-200" />
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2" aria-live="polite">
                <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                  <span>{isRunning ? `Running ${currentStageLabel}` : "Analysis ready"}</span>
                  <span>{analysisProgress}%</span>
                </div>
                <Progress value={analysisProgress} />
              </div>
              <StageRail
                report={displayReport}
                stageIndex={stageIndex}
                isRunning={isRunning}
              />
            </CardContent>
          </Card>
        </motion.section>
        <motion.section
          {...motionProps}
          className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{selectedScenario.repository}</CardTitle>
                  <CardDescription>{selectedScenario.summary}</CardDescription>
                </div>
                <Badge
                  variant={
                    selectedScenario.pipelineStatus === "failed"
                      ? "danger"
                      : "success"
                  }
                >
                  Pipeline {selectedScenario.pipelineStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Author", value: selectedScenario.author },
                  {
                    label: "Branch",
                    value: `${selectedScenario.sourceBranch} -> ${selectedScenario.targetBranch}`,
                  },
                  {
                    label: "Changed files",
                    value: String(selectedScenario.changedFiles.length),
                  },
                  { label: "Diff churn", value: `${totalChurn(displayReport)} lines` },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/8 bg-white/4 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  File diff summary
                </p>
                <div className="space-y-3">
                  {selectedScenario.changedFiles.map((file) => (
                    <div
                      key={file.path}
                      className="flex items-start justify-between gap-4 text-sm"
                    >
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{file.path}</p>
                        <p className="mt-1 text-[var(--text-secondary)]">{file.summary}</p>
                      </div>
                      <Badge
                        variant={riskVariant(file.riskNotes.length > 0 ? "high" : "low")}
                      >
                        {zoneLabel(file.semanticZone)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {isStale ? (
                <div className="rounded-2xl border border-amber-300/25 bg-amber-400/10 p-4 text-sm text-amber-100">
                  Scenario switched. Run ArcGuard to refresh the report for this MR.
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Badge variant={verdictVariant(displayReport.verdict)}>
                    {displayReport.verdictLabel}
                  </Badge>
                  <CardTitle className="mt-3 text-3xl">Confidence Report</CardTitle>
                  <CardDescription>
                    Expand each evidence area to inspect the computed rationale.
                  </CardDescription>
                </div>
                <div className="rounded-[1.75rem] border border-violet-300/20 bg-violet-400/10 px-6 py-5 text-center shadow-[0_0_36px_rgba(157,108,255,0.22)]">
                  <p className="text-xs uppercase tracking-[0.2em] text-violet-100/80">
                    Confidence
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-display)] text-5xl font-semibold">
                    {displayReport.score}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-3 sm:hidden">
                  {scoreBreakdown.map((entry) => (
                    <div key={entry.name} className="rounded-2xl border border-white/8 bg-white/4 p-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {entry.name}
                        </span>
                        <span className="text-sm text-[var(--text-secondary)]">
                          {entry.score}/100
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/8">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${entry.score}%`, backgroundColor: entry.fill }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden h-72 rounded-[1.5rem] border border-white/8 bg-black/15 p-4 sm:block">
                  {chartsReady ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreBreakdown}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="rgba(185,178,209,0.7)"
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                      />
                      <YAxis
                        stroke="rgba(185,178,209,0.7)"
                        tickLine={false}
                        axisLine={false}
                        width={34}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                        contentStyle={{
                          borderRadius: 16,
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "rgba(10,11,21,0.96)",
                          color: "#f6f3ff",
                        }}
                      />
                      <Bar dataKey="score" radius={[10, 10, 0, 0]}>
                        {scoreBreakdown.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  ) : (
                    <div className="h-full rounded-[1.25rem] bg-white/4" />
                  )}
                </div>
              </div>

              <Accordion
                type="single"
                collapsible
                className="rounded-3xl border border-white/8 bg-white/4 px-5"
              >
                {[
                  displayReport.architecture,
                  displayReport.review,
                  displayReport.intent,
                  displayReport.flake,
                  displayReport.rollback,
                  displayReport.sustainability,
                ].map((item) => (
                  <AccordionItem key={item.summary} value={item.summary}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-3">
                        <Badge variant={riskVariant(item.riskLevel)}>{item.riskLevel}</Badge>
                        <span>{item.summary}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="leading-7">{item.summary}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section {...motionProps}>
          <Tabs defaultValue="review" className="space-y-6">
            <TabsList>
              <TabsTrigger value="review">Review minimap</TabsTrigger>
              <TabsTrigger value="architecture">Architecture drift</TabsTrigger>
              <TabsTrigger value="intent">Intent contracts</TabsTrigger>
            </TabsList>

            <TabsContent value="review">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <FileStack className="h-5 w-5 text-violet-100" />
                    <div>
                      <CardTitle>Review Minimap</CardTitle>
                      <CardDescription>
                        Semantic clusters computed from the same changed-file model
                        used by the flow.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  {displayReport.review.zones.map((zone) => (
                    <div
                      key={zone.zone}
                      className="rounded-3xl border border-white/10 bg-white/4 p-5"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <Badge variant={riskVariant(zone.riskLevel)}>
                          {zoneLabel(zone.zone)}
                        </Badge>
                        <span className="text-sm text-[var(--text-secondary)]">
                          {zone.churn} lines
                        </span>
                      </div>
                      <p className="text-sm leading-7 text-[var(--text-secondary)]">
                        {zone.guidance}
                      </p>
                      <Separator className="my-4" />
                      <ul className="space-y-2 text-sm text-[var(--text-primary)]">
                        {zone.files.map((file) => (
                          <li key={file} className="flex items-center gap-2">
                            <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                            {file}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="architecture">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CircuitBoard className="h-5 w-5 text-violet-100" />
                    <div>
                      <CardTitle>Architecture Drift View</CardTitle>
                      <CardDescription>
                        Expected layer boundaries versus the dependencies
                        introduced by this merge request.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-3 md:grid-cols-5">
                    {["ui", "application", "domain", "data", "platform"].map(
                      (layer) => (
                        <div
                          key={layer}
                          className="rounded-3xl border border-white/8 bg-white/4 p-4 text-center"
                        >
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            Layer
                          </p>
                          <p className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold capitalize">
                            {layer}
                          </p>
                        </div>
                      ),
                    )}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                    <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
                      <p className="mb-4 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        Detected drift
                      </p>
                      <div className="space-y-3">
                        {displayReport.architecture.violations.length > 0 ? (
                          displayReport.architecture.violations.map((violation) => (
                            <div
                              key={`${violation.filePath}-${violation.targetLayer}`}
                              className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-rose-50">
                                  {violation.sourceLayer} -&gt; {violation.targetLayer}
                                </p>
                                <Badge variant="danger">{violation.severity}</Badge>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-rose-100/90">
                                {violation.filePath}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-rose-100/75">
                                {violation.rationale}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-50">
                            No blocked layer edges were detected for this MR.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
                      <p className="mb-4 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        Risky dependencies
                      </p>
                      <div className="space-y-3">
                        {displayReport.architecture.riskyDependencies.length > 0 ? (
                          displayReport.architecture.riskyDependencies.map((dependency) => (
                            <div
                              key={dependency.name}
                              className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-amber-50">
                                  {dependency.name}
                                </p>
                                <Badge variant="warning">{dependency.riskLevel}</Badge>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-amber-100/80">
                                {dependency.reason}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-white/8 bg-black/15 p-4 text-sm text-[var(--text-secondary)]">
                            No risky new runtime dependencies were introduced.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="intent">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <ScrollText className="h-5 w-5 text-violet-100" />
                    <div>
                      <CardTitle>Intent Contract View</CardTitle>
                      <CardDescription>
                        ArcGuard compares what the MR claims to do against code,
                        test, and docs evidence.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {displayReport.intent.findings.map((finding) => (
                    <div
                      key={finding.claim}
                      className="rounded-3xl border border-white/8 bg-white/4 p-5"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant={finding.codeAligned ? "success" : "danger"}>
                          Code {finding.codeAligned ? "aligned" : "mismatch"}
                        </Badge>
                        <Badge variant={finding.docsAligned ? "success" : "warning"}>
                          Docs {finding.docsAligned ? "aligned" : "missing"}
                        </Badge>
                        <Badge variant={finding.testsAligned ? "success" : "warning"}>
                          Tests {finding.testsAligned ? "aligned" : "missing"}
                        </Badge>
                      </div>
                      <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold">
                        {finding.claim}
                      </h3>
                      <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_1fr]">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            Evidence
                          </p>
                          <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                            {finding.evidence.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            Mismatch warnings
                          </p>
                          <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                            {finding.mismatchWarnings.length > 0 ? (
                              finding.mismatchWarnings.map((warning) => (
                                <li key={warning}>{warning}</li>
                              ))
                            ) : (
                              <li>Intent remains consistent with code, docs, and tests.</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.section>

        <motion.section
          {...motionProps}
          className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FlaskConical className="h-5 w-5 text-violet-100" />
                <div>
                  <CardTitle>Flake Witness Capsule</CardTitle>
                  <CardDescription>
                    Seeded CI evidence is scored directly into merge confidence.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {displayReport.flake.evidence.length > 0 ? (
                displayReport.flake.evidence.map((evidence) => (
                  <div
                    key={evidence.testName}
                    className="rounded-3xl border border-amber-400/20 bg-amber-400/10 p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-amber-50">{evidence.testName}</p>
                      <Badge variant="warning">
                        {(evidence.failureRate * 100).toFixed(0)}% flake rate
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-amber-100/85">
                      Suspected root cause: {evidence.suspectedCauseCategory}
                    </p>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-amber-100/70">
                          Replay
                        </p>
                        <ul className="mt-2 space-y-2 text-sm text-amber-50/90">
                          {evidence.replaySteps.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-amber-100/70">
                          Env snapshot
                        </p>
                        <ul className="mt-2 space-y-2 text-sm text-amber-50/90">
                          {evidence.envSnapshot.map((snapshot) => (
                            <li key={snapshot}>{snapshot}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-sm text-emerald-50">
                  No flaky-test evidence surfaced in the seeded data for this
                  merge request.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <ArrowRightLeft className="h-5 w-5 text-violet-100" />
                <div>
                  <CardTitle>Rollback Reality Check</CardTitle>
                  <CardDescription>
                    Checks whether rollback is truly safe, not just theoretically
                    possible.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/8 bg-white/4 p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Rollback status
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold capitalize">
                    {displayReport.rollback.status}
                  </p>
                </div>
                <Badge variant={riskVariant(displayReport.rollback.riskLevel)}>
                  {displayReport.rollback.riskLevel}
                </Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Blockers
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                    {displayReport.rollback.blockers.length > 0 ? (
                      displayReport.rollback.blockers.map((blocker) => (
                        <li key={blocker}>{blocker}</li>
                      ))
                    ) : (
                      <li>No rollback blockers were detected.</li>
                    )}
                  </ul>
                </div>
                <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Safer rollout
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                    {displayReport.rollback.recommendedStrategy.map((strategy) => (
                      <li key={strategy}>{strategy}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          {...motionProps}
          className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Leaf className="h-5 w-5 text-violet-100" />
                <div>
                  <CardTitle>Sustainability / CI Waste View</CardTitle>
                  <CardDescription>
                    Avoidable CI work is scored as both delivery drag and
                    sustainability waste.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Green opportunity",
                    value: displayReport.sustainability.greenOpportunity,
                  },
                  {
                    label: "Avoidable minutes",
                    value: String(displayReport.sustainability.avoidableMinutes),
                  },
                  {
                    label: "Avoidable share",
                    value: `${displayReport.sustainability.avoidablePercent}%`,
                  },
                  {
                    label: "Duplicate jobs",
                    value: String(displayReport.sustainability.duplicateJobs),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-white/8 bg-white/4 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      {item.label}
                    </p>
                    <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-3xl border border-emerald-400/18 bg-emerald-400/10 p-4 text-sm leading-7 text-emerald-50/90">
                ArcGuard treats CI waste as both delivery drag and a Green Agent
                signal. This scenario spends {displayReport.sustainability.avoidablePercent}% of
                its pipeline on reclaimable work and estimates {displayReport.sustainability.estimatedWasteGrams}g
                of avoidable emissions.
              </div>

              <div className="space-y-4">
                <div className="grid gap-3 sm:hidden">
                  {wasteChartData.length > 0 ? (
                    wasteChartData.map((entry) => (
                      <div key={entry.name} className="rounded-2xl border border-white/8 bg-white/4 p-3">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-[var(--text-primary)]">
                            {entry.name}
                          </span>
                          <span className="text-sm text-[var(--text-secondary)]">
                            {entry.minutes}m
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/8">
                          <div
                            className="h-2 rounded-full bg-emerald-400"
                            style={{
                              width: `${Math.max(
                                16,
                                (entry.minutes /
                                  Math.max(
                                    1,
                                    Math.max(...wasteChartData.map((item) => item.minutes)),
                                  )) *
                                  100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-[var(--text-secondary)]">
                      No avoidable CI hotspots surfaced for this scenario.
                    </div>
                  )}
                </div>
                <div className="hidden h-72 rounded-[1.5rem] border border-white/8 bg-black/15 p-4 sm:block">
                  {chartsReady ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={wasteChartData}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="rgba(185,178,209,0.7)"
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                      />
                      <YAxis
                        stroke="rgba(185,178,209,0.7)"
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                        contentStyle={{
                          borderRadius: 16,
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "rgba(10,11,21,0.96)",
                          color: "#f6f3ff",
                        }}
                      />
                      <Bar
                        dataKey="minutes"
                        radius={[10, 10, 0, 0]}
                        fill="#22c55e"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  ) : (
                    <div className="h-full rounded-[1.25rem] bg-white/4" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <GitMerge className="h-5 w-5 text-violet-100" />
                <div>
                  <CardTitle>Final Merge Confidence Verdict</CardTitle>
                  <CardDescription>
                    Computed from architecture, review complexity, intent
                    alignment, flake risk, rollback safety, and CI waste.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-3xl border border-white/8 bg-white/4 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Badge variant={verdictVariant(displayReport.verdict)}>
                      {displayReport.verdictLabel}
                    </Badge>
                    <p className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold">
                      {displayReport.score}/100
                    </p>
                  </div>
                  <Radar className="h-10 w-10 text-violet-200" />
                </div>
                <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                  {displayReport.keyFindings[0] ??
                    "ArcGuard did not find a dominant blocking concern in this run."}
                </p>
              </div>

              <div className="space-y-3">
                {displayReport.keyFindings.map((finding) => (
                  <div
                    key={finding}
                    className="rounded-2xl border border-white/8 bg-white/4 p-4 text-sm text-[var(--text-secondary)]"
                  >
                    {finding}
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-violet-300/16 bg-violet-400/10 p-5">
                <div className="flex items-center gap-3">
                  {displayReport.verdict === "blocked" ? (
                    <ShieldAlert className="h-5 w-5 text-rose-100" />
                  ) : displayReport.verdict === "needs_fixes" ? (
                    <AlertTriangle className="h-5 w-5 text-amber-100" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-emerald-100" />
                  )}
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Reviewer guidance
                  </p>
                </div>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {displayReport.reviewerGuidance.map((guidance) => (
                    <li key={guidance}>{guidance}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}
