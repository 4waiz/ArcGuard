import Link from "next/link";

import { ArcGuardDemo } from "@/components/arcguard-demo";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const demoLinks = [
  { href: "/", label: "Home" },
  { href: "/demo", label: "Live Demo" },
];

export default function DemoPage() {
  return (
    <main id="main-content" className="page-shell pb-14 sm:pb-16">
      <SiteHeader links={demoLinks} ctaHref="/" ctaLabel="Back to landing" />

      <section className="layout-section-tight pt-8 sm:pt-10">
        <div className="layout-container section-shell p-5 sm:p-6 lg:p-7">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="max-w-3xl space-y-4">
              <Badge variant="accent">Interactive merge intelligence</Badge>
              <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-[clamp(2.2rem,4vw,3.9rem)] font-semibold tracking-[-0.05em] text-white">
                Scenario console for the real ArcGuard analysis engine.
              </h1>
              <p className="max-w-xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg sm:leading-8">
                Switch between seeded merge requests, trigger the shared scoring
                flow, and inspect the evidence layers behind each confidence verdict.
              </p>
            </div>

            <Button asChild variant="secondary" size="lg">
              <Link href="/">Return to overview</Link>
            </Button>
          </div>
        </div>
      </section>

      <ArcGuardDemo />
    </main>
  );
}
