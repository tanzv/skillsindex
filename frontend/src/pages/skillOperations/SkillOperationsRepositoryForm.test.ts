import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getSkillOperationsCopy } from "./SkillOperationsPage.copy";
import SkillOperationsRepositoryView from "./SkillOperationsRepositoryView";

describe("SkillOperationsRepositoryView", () => {
  it("renders repository fields and repository sync actions", () => {
    const html = renderToStaticMarkup(
      React.createElement(SkillOperationsRepositoryView, {
        locale: "en",
        copy: getSkillOperationsCopy("en"),
        skills: [],
        syncRuns: [],
        submittingAction: "",
        onSubmit: async () => undefined,
        onRunSyncBatch: async () => undefined,
        onSelectRun: () => undefined
      })
    );

    expect(html).toContain("Repository URL");
    expect(html).toContain("Branch");
    expect(html).toContain("Path");
    expect(html).toContain("Sync Repository Skill");
    expect(html).toContain("Run Repository Sync");
    expect(html).toContain("required");
  });
});
