# Architecture Overview

ArcGuard is organized as a small monorepo so the GitLab flow and the web demo share the same scoring logic.

## Runtime pieces

### GitLab Duo custom flow

- Source: `.gitlab/duo/flows/arcguard-merge-confidence.yml`
- Trigger model: merge request mention or reviewer assignment
- Action: runs `pnpm arcguard:analyze:flow` and posts a Merge Confidence Report back into the MR

### Shared analysis engine

- Source: `packages/core`
- Responsibilities:
  - schema validation with Zod
  - architecture drift scoring
  - review minimap clustering
  - intent contract checks
  - flake witness scoring
  - rollback reality analysis
  - CI waste and sustainability scoring
  - final merge confidence verdict

### Seeded scenarios

- Source: `packages/fixtures`
- Three deterministic MR scenarios are included for fast local demos and reproducible scoring.

### Demo web app

- Source: `apps/web`
- Reads seeded scenarios and the same analysis engine used by the GitLab flow CLI.

## Flow of data

1. A merge request triggers ArcGuard in GitLab.
2. The flow runs the repository script `pnpm arcguard:analyze:flow`.
3. The script either:
   - hydrates a seeded scenario from an `arcguard-scenario:` marker, or
   - derives a best-effort input from `AI_FLOW_CONTEXT`
4. `packages/core` computes the report.
5. The flow posts the markdown report to the merge request.

## Computed versus seeded

- Seeded:
  - scenario metadata
  - realistic changed file lists
  - CI job snapshots
  - flaky-test evidence capsules
  - rollback markers for demo branches
- Computed:
  - all category scores
  - risk levels
  - review zones
  - mismatch warnings
  - sustainability totals
  - final confidence score
  - final verdict

