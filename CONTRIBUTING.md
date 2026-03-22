# Contributing

ArcGuard uses a pnpm workspace with a shared analysis core.

## Prerequisites

- Node.js 24+
- pnpm 10+

## Local workflow

1. Install dependencies with `pnpm install`.
2. Run the demo app with `pnpm dev`.
3. Run scenario analysis with `pnpm analyze -- --scenario scenario-b-medium-risk`.
4. Verify the workspace before opening a merge request:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm build`

## Repository layout

- `apps/web`: Next.js demo app
- `packages/core`: deterministic scoring engine, flow context adapter, report generation
- `packages/fixtures`: seeded MR scenarios used by the demo and local flow testing
- `.gitlab/duo`: GitLab Duo flow and execution config
- `scripts`: local CLI entry points
- `docs`: setup, architecture, demo, and submission notes

## Code standards

- Keep TypeScript strict and explicit.
- Do not hardcode verdicts or report text that should be derived from scenario data.
- If you change seeded scenarios, keep the verdicts produced by the engine consistent with the scenario intent.
- If you change the GitLab flow prompt, keep it aligned with the local CLI and the demo UI.

## Pull requests

- Use clear commit messages.
- Include screenshots or short notes for UI changes.
- Include the commands you ran to verify the change.
- Sign off your commits as described in [DCO.md](./DCO.md).

