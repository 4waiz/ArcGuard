# ArcGuard

Ship changes with proof, not hope.

ArcGuard is a GitLab-native merge confidence system built for the GitLab Duo Agent Platform hackathon. Its primary deliverable is a custom public GitLab Duo flow that reacts to merge requests, runs a deterministic analysis engine, and posts a Merge Confidence Report back into the MR.

The repository also includes a polished Next.js demo app that uses the exact same analysis engine for fast local demos.

## Why ArcGuard matters

Generic AI review comments are often broad, subjective, and disconnected from the actual merge decision. ArcGuard is opinionated about merge confidence:

- it checks architecture drift
- it clusters review work into a minimap
- it validates intent against code, tests, and docs
- it surfaces flaky-test evidence
- it evaluates rollback realism
- it scores CI waste and sustainability impact
- it computes a final verdict from explicit rules

## What is in this repo

- `apps/web`: companion demo app built with Next.js App Router, React, TypeScript, Tailwind, shadcn-style components, Framer Motion, Lucide, Recharts, and Zod
- `packages/core`: shared deterministic analysis engine
- `packages/fixtures`: seeded MR scenarios
- `.gitlab/duo/agent-config.yml`: GitLab Duo flow execution config
- `.gitlab/duo/flows/arcguard-merge-confidence.yml`: custom flow source
- `scripts`: local CLI entry points for scenario analysis and flow simulation
- `docs`: setup, architecture, demo, and submission notes

## Core feature overview

ArcGuard computes a Merge Confidence Report across seven areas:

1. Architecture Drift
2. Review Minimap
3. Intent Contracts
4. Flake Witness Capsule
5. Rollback Reality Check
6. Sustainability / CI Waste
7. Final Merge Confidence Verdict

Verdicts are:

- `Safe to Merge`
- `Needs Fixes`
- `Blocked`

## Seeded scenarios

Three seeded scenarios are included and scored by the engine:

- `scenario-a-low-risk`: safe refactor, aligned tests/docs, rollback safe, verdict `Safe to Merge`
- `scenario-b-medium-risk`: moderate design concern, partial docs mismatch, manageable review complexity, some CI waste, verdict `Needs Fixes`
- `scenario-c-high-risk`: cross-layer drift, destructive rollback hazard, flaky-test evidence, docs mismatch, significant CI waste, verdict `Blocked`

The category scores and verdicts are computed from structured scenario data and scoring rules in `packages/core`. They are not hardcoded.

## GitLab Duo flow

ArcGuard is designed as a custom public GitLab Duo flow.

### Trigger -> action flow

1. A merge request mentions ArcGuard or assigns ArcGuard as reviewer.
2. GitLab Duo starts the flow in CI using `.gitlab/duo/agent-config.yml`.
3. The flow runs `pnpm arcguard:analyze:flow`.
4. The script converts `AI_FLOW_CONTEXT` into ArcGuard input or hydrates a seeded scenario if a scenario marker is present.
5. The shared engine computes the report.
6. The flow posts a Merge Confidence Report into the merge request via `create_merge_request_note`.

### Flow files

- Flow YAML: `.gitlab/duo/flows/arcguard-merge-confidence.yml`
- Execution config: `.gitlab/duo/agent-config.yml`
- Flow instructions: `AGENTS.md`

## Local development

### Install

```bash
pnpm install
```

### Start the demo app

```bash
pnpm dev
```

Open:

- `http://localhost:3000/`
- `http://localhost:3000/demo`

### Run scenario analysis locally

```bash
pnpm analyze -- --scenario scenario-a-low-risk
pnpm report:scenario -- --scenario scenario-b-medium-risk
pnpm arcguard:analyze:flow -- --scenario scenario-c-high-risk
```

### Verify everything

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## How scoring works

ArcGuard uses deterministic logic in `packages/core/src/analysis.ts`.

- architecture score:
  layer violations, risky dependencies, cross-boundary coupling
- review score:
  semantic zone spread, churn, risky file clusters
- intent score:
  claims matched against code, docs, and tests
- flake score:
  frequency and severity of flaky-test evidence
- rollback score:
  reversibility, schema hazards, public interface risk
- sustainability score:
  duplicate jobs, retries, and avoidable CI minutes
- green opportunity:
  avoidable CI share and waste concentration for Green Agent-style optimization wins

The final confidence score is a weighted combination of those categories. The final verdict is then derived from score thresholds plus blocking conditions such as critical architecture drift or unsafe rollback.

## Security considerations

- Zod validation for analysis inputs
- no unsafe HTML injection
- no client-side secrets
- strict TypeScript
- no `eval`
- security headers in `apps/web/next.config.ts`
- flow instructions explicitly prevent fabricated scores

## Accessibility considerations

- semantic HTML and keyboard-accessible controls
- visible focus states
- reduced-motion aware animation timing
- responsive layout across desktop and mobile
- readable contrast in the demo UI

## Recording the demo

Use the path in [docs/demo.md](./docs/demo.md). The fastest path is:

1. land on `/`
2. jump to `/demo`
3. run Scenario A
4. run Scenario B
5. run Scenario C
6. end on the final verdict and reviewer guidance

## Why this is different from a generic AI reviewer

ArcGuard is not a chat wrapper around a static dashboard. It is a triggerable GitLab workflow with a local-first demo path and a deterministic scoring engine that both the flow and the web app share.

## Additional docs

- [Setup](./docs/setup.md)
- [Architecture Overview](./docs/architecture.md)
- [Demo Guide](./docs/demo.md)
- [Submission Notes](./docs/submission-notes.md)
- [Contributing](./CONTRIBUTING.md)
- [DCO](./DCO.md)
