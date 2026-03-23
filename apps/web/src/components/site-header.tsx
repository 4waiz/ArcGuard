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
      className="layout-container flex justify-center pt-5 sm:pt-6"
    >
      <div className="glass-pill flex w-full max-w-[66rem] flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-[1.75rem] px-3.5 py-2.5 sm:px-5">
        <Link
          href="/"
          className="focus-ring flex items-center gap-2.5 rounded-full px-2 py-1 transition hover:text-white"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)] shadow-[0_0_24px_rgba(87,227,174,0.18)]">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="font-[family-name:var(--font-display)] text-[0.78rem] font-semibold tracking-[0.14em] text-white uppercase">
              ArcGuard
            </p>
            <p className="text-[0.72rem] text-[var(--text-muted)]">Merge confidence system</p>
          </div>
        </Link>

        <nav aria-label="Primary" className="order-3 flex w-full justify-center sm:order-2 sm:w-auto sm:flex-1">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-1 text-sm text-[var(--text-secondary)] sm:gap-x-6">
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

        <Button asChild size="sm" className="order-2 min-w-[9rem] sm:order-3">
          {ctaContent}
        </Button>
      </div>
    </motion.header>
  );
}
