import {
  CheckCircle2,
  Gitlab,
  MessageSquareText,
  ScanSearch,
} from "lucide-react";
import Link from "next/link";

import { LandingHero } from "@/components/landing-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main id="main-content">
      <LandingHero />

      <section className="px-6 pb-24 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          {[
            {
              icon: Gitlab,
              title: "GitLab-native workflow",
              body: "ArcGuard is built as a custom public GitLab Duo flow that reacts to MR reviewer assignment or mention, runs in GitLab CI, and posts its report back into the merge request.",
            },
            {
              icon: ScanSearch,
              title: "Deterministic engine",
              body: "Architecture drift, review zones, intent alignment, flaky-test evidence, rollback risk, and CI waste are scored from structured data and inspectable logic.",
            },
            {
              icon: MessageSquareText,
              title: "Demo and flow parity",
              body: "The companion Next.js app and the GitLab flow both use the same analysis package, so the demo view stays functionally aligned with the real MR workflow.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <item.icon className="h-5 w-5 text-violet-100" />
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-6 pb-28 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/4 p-8">
          <Badge variant="accent">Submission-ready repo</Badge>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold">
                What makes ArcGuard different from a generic AI reviewer
              </h2>
              <p className="max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
                ArcGuard is not a generic chatbot layered over a dashboard. It is
                a triggerable GitLab workflow with a defined action path: ingest
                MR context, run a consistent analysis engine, and post a structured
                Merge Confidence Report with verdict and evidence.
              </p>
            </div>
            <div className="space-y-3">
              {[
                "Real trigger -> action flow using GitLab Duo custom flows",
                "Seeded but computed scenarios for fast 3-minute demos",
                "Local-first monorepo with MIT licensing and setup docs",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/15 p-4 text-sm text-[var(--text-secondary)]"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  {item}
                </div>
              ))}
              <Button asChild className="mt-2">
                <Link href="/demo">Open live demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
