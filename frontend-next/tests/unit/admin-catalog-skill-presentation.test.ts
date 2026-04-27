import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AdminConfirmModal } from "@/src/components/admin/AdminOverlaySurface";
import { SkillVersionActionsSection } from "@/src/features/adminCatalog/AdminCatalogSkillVersions";
import { ProtectedI18nProvider } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

function renderDeleteConfirmModal() {
  return renderToStaticMarkup(
    createElement(
      AdminConfirmModal,
      {
        open: true,
        title: "Delete Skill Permanently",
        description:
          "This action removes the selected skill and its current record from the governed inventory.",
        closeLabel: "Close Panel",
        cancelLabel: "Cancel",
        confirmLabel: "Delete Skill",
        onClose: () => undefined,
        onConfirm: () => undefined,
      },
      "Delete this governed skill only after version review is complete.",
    ),
  );
}

function renderSkillVersionActionsSection() {
  return renderToStaticMarkup(
    createElement(
      ProtectedI18nProvider,
      {
        locale: "en",
        messages: createProtectedPageTestMessages({
          adminCatalog: {
            versionsSectionTitle: "Recent Versions",
            versionsSectionDescription:
              "Review the latest snapshots before choosing rollback or restore.",
            versionsLoading: "Loading recent versions...",
            versionsLoadError: "Failed to load recent versions.",
            versionsEmpty: "No recent versions are available for this skill.",
            rollbackVersionAction: "Rollback to This Version",
            rollingBackVersionAction: "Rolling Back...",
            restoreVersionAction: "Restore This Snapshot",
            restoringVersionAction: "Restoring...",
          },
        }),
      },
      createElement(SkillVersionActionsSection, {
        versions: [
          {
            id: 701,
            versionNumber: 7,
            trigger: "sync",
            changeSummary: "Repository sync update",
            capturedAt: "2026-03-31T12:00:00Z",
            actorDisplayName: "Ops Lead",
            archivedAt: null,
          },
          {
            id: 699,
            versionNumber: 6,
            trigger: "rollback",
            changeSummary: "Rollback safety snapshot",
            capturedAt: "2026-03-30T12:00:00Z",
            actorDisplayName: "Ops Lead",
            archivedAt: "2026-03-31T13:00:00Z",
          },
        ],
        loading: false,
        error: "",
        busyAction: "",
        onRollback: () => undefined,
        onRestore: () => undefined,
      }),
    ),
  );
}

function expectMarkupToContainAll(markup: string, fragments: string[]) {
  for (const fragment of fragments) {
    expect(markup).toContain(fragment);
  }
}

describe("admin catalog skill presentation", () => {
  it("renders the skill delete confirmation modal with governance warning copy", () => {
    const markup = renderDeleteConfirmModal();

    expectMarkupToContainAll(markup, [
      "Delete Skill Permanently",
      "Delete this governed skill only after version review is complete.",
      "Cancel",
      "Delete Skill",
    ]);
  });

  it("renders recent version actions with rollback and restore controls", () => {
    const markup = renderSkillVersionActionsSection();

    expectMarkupToContainAll(markup, [
      "Recent Versions",
      "Version 7",
      "Repository sync update",
      "Rollback to This Version",
      "Version 6",
      "Rollback safety snapshot",
      "Restore This Snapshot",
    ]);
  });
});
