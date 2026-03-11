import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getSkillOperationsCopy } from "./SkillOperationsPage.copy";
import SkillOperationsImportsView from "./SkillOperationsImportsView";

describe("SkillOperationsImportsView", () => {
  it("renders import jobs and action buttons for actionable states", () => {
    const html = renderToStaticMarkup(
      React.createElement(SkillOperationsImportsView, {
        locale: "en",
        copy: getSkillOperationsCopy("en"),
        skills: [],
        importJobs: [
          {
            id: 11,
            job_type: "import_upload",
            status: "failed",
            owner_user_id: 1,
            actor_user_id: 2,
            target_skill_id: 0,
            error_message: "archive parse failed",
            created_at: "2026-03-11T10:00:00Z",
            updated_at: "2026-03-11T10:01:00Z"
          },
          {
            id: 12,
            job_type: "import_skillmp",
            status: "running",
            owner_user_id: 1,
            actor_user_id: 2,
            target_skill_id: 21,
            error_message: "",
            created_at: "2026-03-11T10:02:00Z",
            updated_at: "2026-03-11T10:03:00Z"
          }
        ],
        submittingAction: "",
        onArchiveSubmit: async () => undefined,
        onSkillMPSubmit: async () => undefined,
        onRetryJob: async () => undefined,
        onCancelJob: async () => undefined
      })
    );

    expect(html).toContain("Import Jobs");
    expect(html).toContain("import_upload");
    expect(html).toContain("import_skillmp");
    expect(html).toContain("Retry");
    expect(html).toContain("Cancel");
    expect(html).toContain("archive parse failed");
  });
});
