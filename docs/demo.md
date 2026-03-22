# Demo Guide

ArcGuard is designed for a sub-3-minute hackathon demo.

## Recommended demo path

1. Open `/` and explain the product in one sentence.
2. Jump to `/demo`.
3. Select Scenario A and run analysis to show a clean `Safe to Merge` verdict.
4. Switch to Scenario B and run analysis to show `Needs Fixes`.
5. Switch to Scenario C and run analysis to show `Blocked`.
6. Highlight:
   - Architecture Drift
   - Review Minimap
   - Flake Witness Capsule
   - Rollback Reality Check
   - Sustainability / CI Waste
7. End on the final verdict card and explain what the reviewer should do next.

## Optional GitLab flow demo

If you want to show the GitLab-native path:

1. Create a demo MR whose description includes one of the scenario markers:
   - `arcguard-scenario: scenario-a-low-risk`
   - `arcguard-scenario: scenario-b-medium-risk`
   - `arcguard-scenario: scenario-c-high-risk`
2. Trigger the custom flow by mention or reviewer assignment.
3. Show the flow session and the MR note posted by ArcGuard.

