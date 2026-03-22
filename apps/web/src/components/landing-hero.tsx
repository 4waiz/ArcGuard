"use client";

import Link from "next/link";
import { ArrowRight, GitBranchPlus, ShieldCheck, Workflow } from "lucide-react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const previewItems = [
  { label: "Architecture Drift", value: "1 critical edge", tone: "text-rose-200" },
  { label: "Review Minimap", value: "3 zones", tone: "text-violet-100" },
  { label: "Rollback Reality", value: "Unsafe rollback", tone: "text-amber-100" },
];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-violet-400/20 bg-violet-400/10 p-3 shadow-[0_0_40px_rgba(157,108,255,0.25)]">
              <ShieldCheck className="h-5 w-5 text-violet-100" />
            </div>
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg font-semibold">
                ArcGuard
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Merge confidence for GitLab Duo flows
              </p>
            </div>
          </div>
          <Badge variant="accent">GitLab Duo Flow</Badge>
        </header>

        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-8">
            <Badge variant="default">Ship changes with proof, not hope.</Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-balance font-[family-name:var(--font-display)] text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
                ArcGuard turns merge requests into actionable confidence reports.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
                A custom public GitLab Duo flow reacts to merge request triggers,
                runs the same deterministic analysis engine used in the demo UI,
                and posts a Merge Confidence Report directly back into the MR.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/demo">
                  Start demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="#flow">See trigger to action flow</Link>
              </Button>
            </div>

            <div
              id="flow"
              className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/4 p-5 md:grid-cols-3"
            >
              {[
                {
                  icon: GitBranchPlus,
                  title: "Trigger",
                  body: "Mention or assign ArcGuard as MR reviewer in GitLab.",
                },
                {
                  icon: Workflow,
                  title: "Analyze",
                  body: "The flow runs the shared analysis engine against the MR context.",
                },
                {
                  icon: ShieldCheck,
                  title: "Act",
                  body: "ArcGuard posts a Merge Confidence Report with verdict and evidence.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/8 bg-black/15 p-4">
                  <item.icon className="mb-3 h-5 w-5 text-violet-100" />
                  <p className="mb-1 text-sm font-semibold text-[var(--text-primary)]">
                    {item.title}
                  </p>
                  <p className="text-sm leading-6 text-[var(--text-secondary)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            <Card className="surface-grid overflow-hidden border-violet-300/15 bg-[linear-gradient(180deg,rgba(22,18,41,0.96),rgba(13,15,30,0.9))]">
              <CardContent className="space-y-6 p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-[var(--text-muted)]">
                      Live preview
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold">
                      Merge Confidence Report
                    </p>
                  </div>
                  <Badge variant="danger">Blocked</Badge>
                </div>

                <div className="grid gap-3">
                  {previewItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + index * 0.09, duration: 0.4 }}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-[var(--text-secondary)]">{item.label}</p>
                          <p className={`mt-1 text-lg font-semibold ${item.tone}`}>
                            {item.value}
                          </p>
                        </div>
                        <div className="h-3 w-3 rounded-full bg-violet-300 shadow-[0_0_20px_rgba(191,150,255,0.9)]" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="rounded-2xl border border-violet-300/15 bg-violet-400/10 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-violet-100/80">
                    Verdict rationale
                  </p>
                  <p className="mt-2 text-sm leading-7 text-violet-50">
                    Direct UI to data access, a destructive schema migration, and
                    flaky queue-backed checkout tests push this MR below the merge
                    confidence threshold.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
