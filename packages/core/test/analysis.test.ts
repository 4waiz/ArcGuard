import { describe, expect, it } from "vitest";

import { analyzeMergeRequest } from "../src/analysis";
import { flowContextToScenario } from "../src/flow-context";
import { reportToMarkdown } from "../src/report";
import {
  getSeededScenario,
  seededScenarios,
} from "../../fixtures/src/scenarios";

describe("ArcGuard seeded scenarios", () => {
  it("computes the expected verdict for each demo scenario", () => {
    const expectations = [
      ["scenario-a-low-risk", "safe_to_merge"],
      ["scenario-b-medium-risk", "needs_fixes"],
      ["scenario-c-high-risk", "blocked"],
    ] as const;

    for (const [scenarioId, verdict] of expectations) {
      const scenario = getSeededScenario(scenarioId);
      expect(scenario).not.toBeNull();
      const report = analyzeMergeRequest(scenario!);
      expect(report.verdict).toBe(verdict);
    }
  });

  it("keeps confidence scores ordered from low risk to high risk", () => {
    const [low, medium, high] = seededScenarios.map((scenario) =>
      analyzeMergeRequest(scenario),
    );

    expect(low.score).toBeGreaterThan(medium.score);
    expect(medium.score).toBeGreaterThan(high.score);
  });

  it("adds explicit sustainability and verdict details to the markdown report", () => {
    const scenario = getSeededScenario("scenario-c-high-risk");
    expect(scenario).not.toBeNull();
    const markdown = reportToMarkdown(analyzeMergeRequest(scenario!));

    expect(markdown).toContain("Sustainability / CI Waste");
    expect(markdown).toContain("green opportunity");
    expect(markdown).toContain("Final Merge Confidence Verdict");
  });
});

describe("flow context adapter", () => {
  it("extracts a seeded scenario marker from AI_FLOW_CONTEXT", () => {
    const derived = flowContextToScenario({
      merge_request: {
        title: "ArcGuard demo MR",
        description:
          "Testing flow hydration.\n\narcguard-scenario: scenario-b-medium-risk",
        source_branch: "feature/demo",
        target_branch: "main",
        author: {
          name: "Demo Author",
        },
        project: {
          path_with_namespace: "gitlab-org/demo",
        },
      },
      diffs: [],
    });

    expect(derived.scenarioId).toBe("scenario-b-medium-risk");
    expect(derived.input.id).toBe("scenario-b-medium-risk");
  });
});
