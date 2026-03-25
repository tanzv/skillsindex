import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AdminIngestionContent } from "@/src/features/adminIngestion/AdminIngestionContent";
import { ProtectedI18nProvider } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import type { AdminIngestionOverlayState } from "@/src/features/adminIngestion/AdminIngestionViewProps";
import type { AdminIngestionRoute } from "@/src/lib/routing/adminRouteRegistry";
import {
  adminIngestionTestMessages,
  createAdminIngestionContentTestProps
} from "./admin-ingestion-content.test-fixtures";

function renderAdminIngestionRoute(route: AdminIngestionRoute, overlay: AdminIngestionOverlayState | null = null) {
  return renderToStaticMarkup(
    createElement(
      ProtectedI18nProvider,
      {
        locale: "en",
        messages: adminIngestionTestMessages
      },
      createElement(AdminIngestionContent, createAdminIngestionContentTestProps(route, overlay))
    )
  );
}

describe("admin ingestion content", () => {
  it("renders the manual route with inventory and create trigger while keeping the page context inline", () => {
    const markup = renderAdminIngestionRoute("/admin/ingestion/manual");

    expect(markup).toContain("Manual Inventory");
    expect(markup).toContain("Create Manual Skill");
    expect(markup).toContain("Publishing Guardrails");
    expect(markup).not.toContain('role="dialog"');
  });

  it("renders the repository route with intake and policy triggers plus sync evidence", () => {
    const markup = renderAdminIngestionRoute("/admin/ingestion/repository");

    expect(markup).toContain("Repository Inventory");
    expect(markup).toContain("Start Repository Intake");
    expect(markup).toContain("Save Policy");
    expect(markup).toContain("Recent Sync Runs");
  });

  it("renders the imports route with source triggers and import jobs", () => {
    const markup = renderAdminIngestionRoute("/admin/records/imports");

    expect(markup).toContain("Archive Import");
    expect(markup).toContain("Import SkillMP");
    expect(markup).toContain("Imported Inventory");
    expect(markup).toContain("Import Jobs");
  });

  it("renders the manual create drawer when a create overlay is active", () => {
    const markup = renderAdminIngestionRoute("/admin/ingestion/manual", {
      open: true,
      kind: "create",
      entity: "manualForm",
      entityId: null
    });

    expect(markup).toContain('data-testid="admin-ingestion-manual-pane"');
    expect(markup).toContain("Close Panel");
    expect(markup).toContain("Name");
    expect(markup).toContain("Content");
    expect(markup).toContain('role="dialog"');
  });

  it("renders the import job detail drawer when a job overlay is active", () => {
    const markup = renderAdminIngestionRoute("/admin/records/imports", {
      open: true,
      kind: "detail",
      entity: "importJobDetail",
      entityId: 81
    });

    expect(markup).toContain('data-testid="admin-ingestion-job-pane"');
    expect(markup).toContain("Job #81");
    expect(markup).toContain("archive parse failed");
    expect(markup).toContain("Retry");
    expect(markup).toContain('role="dialog"');
  });
});
