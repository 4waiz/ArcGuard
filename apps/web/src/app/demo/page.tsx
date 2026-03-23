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
    <main id="main-content" className="page-shell pb-20">
      <SiteHeader links={demoLinks} ctaHref="/" ctaLabel="Back to landing" />

      <section className="px-6 pb-4 pt-16 sm:px-8 lg:px-12 lg:pt-20">
        <div className="mx-auto max-w-7xl section-shell p-7 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl space-y-5">
              <Badge variant="accent">Interactive merge intelligence</Badge>
              <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                Scenario console for the real ArcGuard analysis engine.
              </h1>
              <p className="text-lg leading-8 text-[var(--text-secondary)]">
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
