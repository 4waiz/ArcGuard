import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "ArcGuard",
  description: "GitLab-native merge confidence reports powered by a Duo custom flow.",
  applicationName: "ArcGuard",
  keywords: [
    "GitLab Duo Agent Platform",
    "merge request review",
    "AI code review",
    "hackathon",
    "ArcGuard",
  ],
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <a
          href="#main-content"
          className="focus-ring absolute left-4 top-4 z-50 -translate-y-24 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition focus:translate-y-0 focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
