"use client";

import { ArrowRight, ChevronRight, Play, Radar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const primaryLinks = [
  { href: "#capabilities", label: "Capabilities" },
  { href: "#signals", label: "Signals" },
  { href: "#workflow", label: "Workflow" },
  { href: "/demo", label: "Demo" },
];

const proofPoints = [
  "GitLab Duo-native trigger and response flow",
  "Deterministic scoring across six merge-risk lenses",
  "Shared engine powers both the live demo and CI workflow",
];

export function LandingHero() {
  return (
    <section className="page-shell relative overflow-hidden pb-24">
      <SiteHeader links={primaryLinks} ctaHref="/demo" ctaLabel="Open live demo" />

      <div className="mx-auto grid max-w-7xl gap-16 px-6 pb-12 pt-16 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:px-12 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="relative z-10"
        >
          <Badge variant="accent" className="mb-6">
            GitLab Duo-native merge intelligence
          </Badge>

          <div className="max-w-3xl space-y-7">
            <p className="max-w-xl text-sm uppercase tracking-[0.26em] text-[var(--text-muted)] sm:text-[0.82rem]">
              Deterministic review signals for teams shipping high-stakes changes
            </p>

            <h1 className="text-balance font-[family-name:var(--font-display)] text-[clamp(3.6rem,8vw,6.9rem)] font-semibold leading-[0.96] tracking-[-0.06em] text-white">
              Merge confidence for{" "}
              <span className="relative inline-block">
                <span className="font-accent neon-line pl-1 text-[clamp(4rem,8.2vw,7.2rem)] text-white">
                  critical releases
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 320 42"
                  className="pointer-events-none absolute -bottom-6 left-0 h-7 w-[min(20rem,90%)] text-[var(--accent)]"
                >
                  <path
                    d="M8 28C80 8 162 6 312 28"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="4"
                  />
                </svg>
              </span>
              .
            </h1>

            <p className="text-pretty max-w-2xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
              ArcGuard reacts to merge request events, runs a shared analysis engine,
              and posts a structured Merge Confidence Report directly into GitLab.
              The result is a calmer review loop with inspectable evidence instead of
              vague AI opinion.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/demo">
                Launch demo
                <Play className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="#workflow">
                See trigger to report flow
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="section-shell mt-12 p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  Why teams adopt ArcGuard
                </p>
                <p className="text-pretty font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                  A premium review surface for architecture drift, intent mismatch,
                  flaky evidence, rollback risk, and CI waste.
                </p>
              </div>

              <div className="grid gap-3">
                {proofPoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-4 py-4 text-sm text-[var(--text-secondary)]"
                  >
                    <span>{point}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.12 }}
          className="relative mx-auto flex w-full max-w-[40rem] justify-center lg:justify-end"
        >
          <div className="relative aspect-square w-full max-w-[38rem]">
            <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(87,227,174,0.18),transparent_58%)] blur-3xl" />
            <div className="absolute inset-[14%] rounded-full bg-[radial-gradient(circle,rgba(60,134,255,0.1),transparent_64%)] blur-3xl" />

            <div className="hero-wave absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[linear-gradient(90deg,transparent,rgba(87,227,174,0.85),rgba(255,255,255,0.7),rgba(87,227,174,0.9),transparent)] shadow-[0_0_38px_rgba(87,227,174,0.45)]" />

            <div className="absolute inset-0">
              {[0, 1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="hero-wave absolute right-[7%] top-1/2 h-px origin-right bg-[linear-gradient(90deg,rgba(87,227,174,0.06),rgba(87,227,174,0.78))]"
                  style={{
                    width: `${42 + index * 7}%`,
                    transform: `translateY(${(index - 2) * 18}px) rotate(${(index - 2) * -12}deg)`,
                    opacity: 1 - index * 0.1,
                    animationDelay: `${index * 0.4}s`,
                  }}
                />
              ))}
            </div>

            <div className="hero-orb absolute left-1/2 top-1/2 h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full">
              <div className="absolute inset-[-18%] rounded-full border border-white/30 opacity-60 blur-[0.5px]" />
            </div>

            <div className="hero-ring absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40" />
            <div className="hero-ring absolute left-1/2 top-1/2 h-[72%] w-[32%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color:rgba(143,250,209,0.45)] [transform:translate(-50%,-50%)_rotate(65deg)]" />
            <div className="hero-ring absolute left-1/2 top-1/2 h-[82%] w-[28%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/18 [transform:translate(-50%,-50%)_rotate(24deg)]" />

            <div className="section-shell absolute bottom-6 left-0 right-0 mx-auto max-w-sm p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    Live preview
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.04em] text-white">
                    Merge Confidence Report
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)] shadow-[0_0_24px_rgba(87,227,174,0.18)]">
                  <Radar className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center justify-between rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-4 py-3">
                  <span>Architecture drift</span>
                  <span className="text-[var(--danger)]">1 critical edge</span>
                </div>
                <div className="flex items-center justify-between rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-4 py-3">
                  <span>Intent alignment</span>
                  <span className="text-[var(--accent-strong)]">Computed evidence</span>
                </div>
                <div className="flex items-center justify-between rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-4 py-3">
                  <span>Verdict</span>
                  <span className="inline-flex items-center gap-2 text-white">
                    <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                    Needs fixes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
