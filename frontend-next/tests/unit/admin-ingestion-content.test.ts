import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AdminIngestionContent } from "@/src/features/adminIngestion/AdminIngestionContent";
import { ProtectedI18nProvider } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import type { AdminIngestionRoute } from "@/src/features/adminIngestion/model";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

function renderAdminIngestionRoute(route: AdminIngestionRoute) {
  return renderToStaticMarkup(
    createElement(
      ProtectedI18nProvider,
      {
        locale: "en",
        messages: createProtectedPageTestMessages({
          adminCommon: {
            adminEyebrow: "Admin",
            refresh: "Refresh",
            refreshing: "Refreshing..."
          },
          adminIngestion: {
            manualAuthoringTitle: "Manual Authoring",
            manualAuthoringDescription: "Compose a governed skill record directly when the source does not begin in a repository or import pipeline.",
            repositoryIntakeTitle: "Repository Intake",
            repositoryIntakeDescription: "Submit repository metadata for extraction, governance review, and follow-on synchronization.",
            schedulerPolicyTitle: "Scheduler Policy",
            schedulerPolicyDescription: "Keep repository sync cadence near the intake flow so the handoff from authoring to automation stays visible.",
            archiveImportTitle: "Archive Import",
            archiveImportDescription: "Upload a packaged archive and let the backend extract a persisted skill record from the bundle.",
            skillmpImportTitle: "SkillMP Import",
            skillmpImportDescription: "Pull one remote SkillMP definition directly into the governed import inventory.",
            manualInventoryTitle: "Manual Inventory",
            manualInventoryDescription: "Manually-authored records currently available for governance and publication review.",
            manualInventoryEmpty: "No manually-authored skills are available yet.",
            repositoryInventoryTitle: "Repository Inventory",
            repositoryInventoryDescription: "Repository-backed skills currently available for monitored synchronization.",
            repositoryInventoryEmpty: "No repository-backed skills are available yet.",
            importedInventoryTitle: "Imported Inventory",
            importedInventoryDescription: "Archive and SkillMP entries that already landed in the governed import inventory.",
            importedInventoryEmpty: "No archive or SkillMP imports are available yet.",
            publishingGuardrailsTitle: "Publishing Guardrails",
            publishingGuardrailsDescription: "Keep manually-authored entries aligned with the same governance posture used by repository and import flows.",
            publishingGuardrailsItemOne: "Capture a concise description and install command so operators can review the manual record without opening a secondary page.",
            publishingGuardrailsItemTwo: "Use visibility intentionally. Public entries should already satisfy the same catalog review expectations as repository-backed skills.",
            recentSyncRunsTitle: "Recent Sync Runs",
            recentSyncRunsDescription: "Latest synchronization evidence returned by the repository sync endpoint.",
            recentSyncRunsEmpty: "No repository sync runs are available yet.",
            importJobsTitle: "Import Jobs",
            importJobsDescription: "Actionable archive and SkillMP import activity returned by the admin job endpoint.",
            importJobsEmpty: "No import jobs are available yet.",
            nameLabel: "Name",
            descriptionLabel: "Description",
            contentLabel: "Content",
            tagsLabel: "Tags",
            visibilityLabel: "Visibility",
            installCommandLabel: "Install Command",
            repositoryUrlLabel: "Repository URL",
            repositoryBranchLabel: "Repository Branch",
            repositoryPathLabel: "Repository Path",
            enabledLabel: "Enabled",
            enabledHelp: "Allow scheduled repository synchronization",
            intervalLabel: "Interval",
            timeoutLabel: "Timeout",
            batchSizeLabel: "Batch Size",
            archiveFileLabel: "Archive File",
            skillmpUrlLabel: "SkillMP URL",
            skillmpIdLabel: "SkillMP ID",
            skillmpTokenLabel: "SkillMP Token",
            createManualAction: "Create Manual Skill",
            savingManualAction: "Saving...",
            startRepositoryAction: "Start Repository Intake",
            submittingRepositoryAction: "Submitting...",
            savePolicyAction: "Save Policy",
            savingPolicyAction: "Saving...",
            importArchiveAction: "Import Archive",
            uploadingArchiveAction: "Uploading...",
            importSkillmpAction: "Import SkillMP",
            submittingSkillmpAction: "Submitting...",
            retryAction: "Retry",
            retryingAction: "Retrying...",
            cancelAction: "Cancel",
            cancelingAction: "Canceling...",
            selectedArchiveTemplate: "Selected archive: {fileName}",
            runsCountTemplate: "{count} runs",
            jobsCountTemplate: "{count} jobs",
            itemsCountTemplate: "{count} items",
            runLabelTemplate: "Run #{runId}",
            jobLabelTemplate: "Job #{jobId}",
            targetLabelTemplate: "Target {targetId}",
            syncedCountTemplate: "Synced {count}",
            failedCountTemplate: "Failed {count}",
            valueNotAvailable: "n/a"
          }
        })
      },
      createElement(AdminIngestionContent, {
        route,
        title: "Ingestion",
        description: "Route specific ingestion view",
        loading: false,
        error: "",
        message: "",
        metrics: [{ label: "Inventory", value: "2" }],
        onRefresh: () => undefined,
        manualView: {
          draft: {
            name: "Manual Skill",
            description: "Manual description",
            content: "skill content",
            tags: "manual ops",
            visibility: "private",
            install_command: "uvx install manual"
          },
          skills: [
            {
              id: 11,
              name: "Manual Skill",
              description: "Manual description",
              sourceType: "manual",
              visibility: "private",
              ownerUsername: "ops.lead",
              updatedAt: "2026-03-16T08:00:00Z"
            }
          ],
          busyAction: "",
          onDraftChange: () => undefined,
          onSubmit: () => undefined
        },
        repositoryView: {
          draft: {
            repo_url: "https://github.com/example/repo",
            repo_branch: "main",
            repo_path: "skills/catalog",
            tags: "repository",
            visibility: "public",
            install_command: "uvx install repo"
          },
          skills: [
            {
              id: 21,
              name: "Repository Skill",
              description: "Repository description",
              sourceType: "repository",
              visibility: "public",
              ownerUsername: "repo.bot",
              updatedAt: "2026-03-16T08:00:00Z"
            }
          ],
          policy: {
            enabled: true,
            interval: "15m",
            timeout: "5m",
            batchSize: 30
          },
          syncRuns: [
            {
              id: 41,
              trigger: "schedule",
              scope: "repository",
              status: "success",
              failed: 0,
              synced: 12,
              startedAt: "2026-03-16T08:10:00Z"
            }
          ],
          busyAction: "",
          onDraftChange: () => undefined,
          onPolicyChange: () => undefined,
          onSubmit: () => undefined,
          onSavePolicy: () => undefined
        },
        importsView: {
          draft: {
            archive_tags: "archive",
            archive_visibility: "private",
            archive_install_command: "npx import archive",
            skillmp_url: "https://skillmp.example.com/42",
            skillmp_id: "skillmp-42",
            skillmp_token: "token",
            skillmp_tags: "skillmp",
            skillmp_visibility: "public",
            skillmp_install_command: "npx import skillmp"
          },
          selectedArchiveName: "archive-42.zip",
          skills: [
            {
              id: 31,
              name: "Imported Skill",
              description: "Imported description",
              sourceType: "upload",
              visibility: "private",
              ownerUsername: "import.bot",
              updatedAt: "2026-03-16T08:00:00Z"
            }
          ],
          jobs: [
            {
              id: 81,
              jobType: "import_archive",
              status: "failed",
              targetSkillId: 31,
              errorMessage: "archive parse failed",
              createdAt: "2026-03-16T08:00:00Z",
              updatedAt: "2026-03-16T08:01:00Z"
            }
          ],
          busyAction: "",
          onDraftChange: () => undefined,
          onArchiveFileChange: () => undefined,
          onSubmitArchive: () => undefined,
          onSubmitSkillMP: () => undefined,
          onRunJobAction: () => undefined
        }
      })
    )
  );
}

describe("admin ingestion content", () => {
  it("renders the manual route as authoring plus manual inventory", () => {
    const markup = renderAdminIngestionRoute("/admin/ingestion/manual");

    expect(markup).toContain("Manual Authoring");
    expect(markup).toContain("Manual Inventory");
    expect(markup).toContain("Publishing Guardrails");
    expect(markup).not.toContain("Scheduler Policy");
  });

  it("renders the repository route as intake, inventory, policy, and sync evidence", () => {
    const markup = renderAdminIngestionRoute("/admin/ingestion/repository");

    expect(markup).toContain("Repository Intake");
    expect(markup).toContain("Repository Inventory");
    expect(markup).toContain("Scheduler Policy");
    expect(markup).toContain("Recent Sync Runs");
    expect(markup).not.toContain("Import Jobs");
  });

  it("renders the imports route as source forms plus import jobs", () => {
    const markup = renderAdminIngestionRoute("/admin/records/imports");

    expect(markup).toContain("Archive Import");
    expect(markup).toContain("SkillMP Import");
    expect(markup).toContain("Imported Inventory");
    expect(markup).toContain("Import Jobs");
    expect(markup).toContain("Selected archive: archive-42.zip");
  });
});
