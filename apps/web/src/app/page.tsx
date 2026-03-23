import {
  Activity,
  ArrowRight,
  CheckCircle2,
  GitBranchPlus,
  Gitlab,
  Leaf,
  MessageSquareText,
  Radar,
  RotateCcw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import Link from "next/link";

import { LandingHero } from "@/components/landing-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const capabilityCards = [
  {
    icon: Gitlab,
    title: "GitLab-native workflow",
    body: "ArcGuard is triggered from the actual review loop, reacts inside CI, and posts its merge confidence report back into the merge request.",
  },
  {
    icon: ScanSearch,
    title: "Deterministic analysis engine",
    body: "Architecture drift, review zones, intent alignment, flaky evidence, rollback safety, and CI waste are scored from structured, inspectable logic.",
  },
  {
    icon: MessageSquareText,
    title: "Demo and flow parity",
    body: "The landing experience and the GitLab flow use the same shared engine, so the live demo stays anchored to the real product behavior.",
  },
];

const signalCards = [
  {
    icon: Radar,
    title: "Architecture drift",
    body: "Detects risky boundary crossings, elevated dependency exposure, and change shapes that deserve design attention.",
  },
  {
    icon: Activity,
    title: "Review complexity",
    body: "Maps the semantic spread of a merge request so reviewers can spot where attention is thin or overloaded.",
  },
  {
    icon: Sparkles,
    title: "Intent alignment",
    body: "Compares what the MR claims against code, tests, and docs so delivery intent stays coherent.",
  },
  {
    icon: ShieldCheck,
    title: "Flake witness",
    body: "Carries seeded CI evidence into the scoring model rather than treating reliability as an afterthought.",
  },
  {
    icon: RotateCcw,
    title: "Rollback reality",
    body: "Checks whether the change is actually recoverable, not merely reversible in theory.",
  },
  {
    icon: Leaf,
    title: "CI waste lens",
    body: "Scores avoidable runtime, duplicate jobs, and reclaimable emissions as part of merge confidence.",
  },
];

const flowSteps = [
  {
    icon: GitBranchPlus,
    title: "Trigger",
    body: "Mention or assign ArcGuard when a merge request needs an authoritative confidence read.",
  },
  {
    icon: Workflow,
    title: "Analyze",
    body: "The shared engine ingests MR context and computes evidence across six review dimensions.",
  },
  {
    icon: MessageSquareText,
    title: "Report",
    body: "GitLab receives a structured Merge Confidence Report with verdict, score, and reviewer guidance.",
  },
];

const readinessItems = [
  "Real trigger to action workflow using GitLab Duo custom flows",
  "Seeded but computed scenarios for fast three-minute demonstrations",
  "Local-first monorepo with MIT licensing and setup documentation",
];

export default function HomePage() {
  return (
    <main id="main-content" className="page-shell pb-16 sm:pb-20">
      <LandingHero />

      <section id="capabilities" className="layout-section-tight">
        <div className="layout-container">
          <div className="section-header mb-7 max-w-3xl sm:mb-8">
            <Badge>Capabilities</Badge>
            <h2 className="max-w-2xl font-[family-name:var(--font-display)] text-[clamp(2.35rem,4.2vw,4rem)] font-semibold tracking-[-0.05em] text-white">
              A calmer interface for reviewing risky change.
            </h2>
            <p className="max-w-xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">
              The landing system now mirrors ArcGuard&apos;s product positioning:
              minimal chrome, strong hierarchy, and enough atmosphere to feel
              premium without turning the interface into decoration.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
            {capabilityCards.map((item) => (
              <Card key={item.title} className="h-full">
                <CardHeader className="relative z-10 space-y-4 p-5 sm:p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)] shadow-[0_0_24px_rgba(87,227,174,0.16)]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-3">
                    <CardTitle className="text-[1.45rem] tracking-[-0.04em] sm:text-2xl">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-[0.98rem] leading-7">
                      {item.body}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="signals" className="layout-section">
        <div className="layout-container section-shell p-5 sm:p-7 lg:p-9">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:gap-8">
            <div className="section-header max-w-xl">
              <Badge variant="accent">Signal stack</Badge>
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.35rem,4.2vw,4rem)] font-semibold tracking-[-0.05em] text-white">
                Six evidence lenses, one final merge verdict.
              </h2>
              <p className="max-w-lg text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">
                ArcGuard is not a generic chatbot layered on top of a dashboard.
                It is a defined review mechanism with clear inputs, computed outputs,
                and reviewer-facing evidence that can be challenged or verified.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {signalCards.map((item) => (
                <div
                  key={item.title}
                  className="relative rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4 sm:p-5"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-black/20 text-[var(--accent)]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.04em] text-white sm:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-6 text-[var(--text-secondary)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="layout-section">
        <div className="layout-container grid gap-4 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] lg:gap-5">
          <div className="section-shell p-5 sm:p-7">
            <Badge>Workflow</Badge>
            <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-display)] text-[clamp(2.3rem,4vw,3.8rem)] font-semibold tracking-[-0.05em] text-white">
              Trigger to action flow, expressed with less friction.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">
              The design language is cinematic, but the product path stays
              operationally direct: trigger ArcGuard, compute the evidence, and
              return a verdict teams can act on.
            </p>

            <div className="mt-7 grid gap-3 md:grid-cols-3 md:gap-4">
              {flowSteps.map((item, index) => (
                <div
                  key={item.title}
                  className="rounded-[1.4rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-strong)] bg-black/20 text-[var(--accent)]">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.04em] text-white sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-6 text-[var(--text-secondary)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="section-shell flex flex-col justify-between p-5 sm:p-7">
            <div>
              <Badge variant="accent">Submission-ready repo</Badge>
              <h2 className="mt-4 max-w-lg font-[family-name:var(--font-display)] text-[clamp(2.1rem,3.6vw,3.4rem)] font-semibold tracking-[-0.05em] text-white">
                Built to demo clearly and ship credibly.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">
                The repo stays honest about what ArcGuard is: a GitLab-native merge
                confidence system with shared analysis logic, seeded demos, and a
                clean handoff into evaluator review.
              </p>
            </div>

            <div className="mt-7 space-y-2.5">
              {readinessItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[1.3rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-4 py-3.5 text-sm leading-6 text-[var(--text-secondary)]"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--accent)]" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/demo">
                  Explore the console
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="#signals">
                  Review the signal stack
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="layout-section pt-3 sm:pt-5">
        <div className="layout-container section-shell p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="section-header max-w-3xl">
              <Badge variant="accent">Final CTA</Badge>
              <h2 className="max-w-2xl font-[family-name:var(--font-display)] text-[clamp(2.25rem,4vw,3.8rem)] font-semibold tracking-[-0.05em] text-white">
                Review merges with the atmosphere of a premium product and the
                rigor of a scoring engine.
              </h2>
              <p className="max-w-xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">
                The homepage now sets the tone; the demo route still carries the
                real analysis logic. Move into the live console to inspect seeded
                scenarios and the full Merge Confidence Report.
              </p>
            </div>

            <Button asChild size="lg" className="min-w-52">
              <Link href="/demo">
                Open live demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
