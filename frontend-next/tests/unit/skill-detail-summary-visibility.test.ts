import { describe, expect, it } from "vitest";

import { shouldRenderSkillDetailSummary } from "@/src/features/public/skill-detail/skillDetailSummaryVisibility";

describe("skill detail summary visibility", () => {
  it("hides the summary when the preview repeats it near the top", () => {
    expect(
      shouldRenderSkillDetailSummary(
        "Review repository sync drift and ownership mappings.",
        [
          "# Repository Sync Auditor",
          "",
          "Review repository sync drift and ownership mappings.",
          "",
          "## Quick Start",
          "- Run the repository sync check."
        ].join("\n")
      )
    ).toBe(false);
  });

  it("keeps the summary visible when the same text only appears deep in the preview", () => {
    const summary = "Review repository sync drift and ownership mappings.";
    const previewContent = ["# Repository Sync Auditor", "", "## Deep Notes", "x".repeat(1400), summary].join("\n");

    expect(shouldRenderSkillDetailSummary(summary, previewContent)).toBe(true);
  });
});
