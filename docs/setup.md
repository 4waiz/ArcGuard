# Setup

## Install

```bash
pnpm install
```

## Run the demo web app

```bash
pnpm dev
```

Open `http://localhost:3000` for the landing page or `http://localhost:3000/demo` for the interactive demo route.

## Run the analysis CLI

```bash
pnpm analyze -- --scenario scenario-a-low-risk
pnpm report:scenario -- --scenario scenario-c-high-risk
pnpm arcguard:analyze:flow -- --scenario scenario-b-medium-risk
```

## Verify the repo

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## GitLab Duo flow setup

1. Push this repository to GitLab.
2. Ensure GitLab Duo flows are enabled and a suitable runner is available.
3. Keep `.gitlab/duo/agent-config.yml` on the default branch.
4. Create a custom flow in GitLab using the YAML from `.gitlab/duo/flows/arcguard-merge-confidence.yml`.
5. Publish the flow as public when you are ready to submit.
6. Trigger the flow from a merge request by mention or reviewer assignment.
