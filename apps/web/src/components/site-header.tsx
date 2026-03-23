"use client";

import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Route } from "next";

import { Button } from "@/components/ui/button";

type SiteHeaderLink = {
  href: string;
  label: string;
};

export function SiteHeader({
  links,
  ctaHref,
  ctaLabel,
}: {
  links: SiteHeaderLink[];
  ctaHref: string;
  ctaLabel: string;
}) {
  const renderNavLink = (href: string, label: string, className: string) =>
    href.startsWith("/") ? (
      <Link href={href as Route} className={className}>
        {label}
      </Link>
    ) : (
      <a href={href} className={className}>
        {label}
      </a>
    );

  const ctaContent = ctaHref.startsWith("/") ? (
    <Link href={ctaHref as Route}>{ctaLabel}</Link>
  ) : (
    <a href={ctaHref}>{ctaLabel}</a>
  );

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto flex max-w-7xl justify-center px-6 pt-6 sm:px-8 lg:px-12"
    >
      <div className="glass-pill flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 rounded-[2rem] px-4 py-3 sm:px-5">
        <Link
          href="/"
          className="focus-ring flex items-center gap-3 rounded-full px-2 py-1 transition hover:text-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)] shadow-[0_0_24px_rgba(87,227,174,0.18)]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.14em] text-white uppercase">
              ArcGuard
            </p>
            <p className="text-xs text-[var(--text-muted)]">Merge confidence system</p>
          </div>
        </Link>

        <nav aria-label="Primary" className="flex flex-1 justify-center">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-2 text-sm text-[var(--text-secondary)] sm:gap-x-8">
            {links.map((link) => (
              <li key={link.href}>
                {renderNavLink(
                  link.href,
                  link.label,
                  "focus-ring rounded-full px-2 py-1 transition hover:text-white",
                )}
              </li>
            ))}
          </ul>
        </nav>

        <Button asChild size="sm" className="min-w-36">
          {ctaContent}
        </Button>
      </div>
    </motion.header>
  );
}
