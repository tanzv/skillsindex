import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AdminCatalogContent } from "@/src/features/adminCatalog/AdminCatalogContent";
import { CatalogDetailPane } from "@/src/features/adminCatalog/AdminCatalogShared";
import { ProtectedI18nProvider } from "@/src/features/protected/i18n/ProtectedI18nProvider";
import type {
  AdminCatalogRoute,
  AdminCatalogViewModel,
} from "@/src/features/adminCatalog/model";
import { createProtectedPageTestMessages } from "./protected-page-test-messages";

function createViewModel(route: AdminCatalogRoute): AdminCatalogViewModel {
  if (route === "/admin/skills") {
    return {
      metrics: [{ label: "Total Skills", value: "2" }],
      sidePanel: [
        {
          title: "Catalog Signals",
          items: [{ label: "Repository-backed", value: "1" }],
        },
      ],
      table: {
        title: "Skill Inventory",
        pagination: {
          page: 1,
          limit: 20,
          total: 40,
          totalPages: 2,
          hasPreviousPage: false,
          hasNextPage: true,
        },
        rows: [
          {
            id: 11,
            name: "Release Readiness Checklist",
            summary: "operations · repository · ops.lead",
            meta: ["184 stars", "9.3 quality"],
            status: "public",
            detailTopology: {
              title: "Topology",
              rootLabel: "Skill Entry",
              rootValue: "README.md",
              rootMetaLabel: "Mechanism",
              rootMetaValue: "skill_manifest",
              lanes: [
                {
                  title: "Metadata Sources",
                  nodes: [
                    { value: "README.md", href: "/admin/skills?q=README.md" },
                    {
                      value: "package.json",
                      href: "/admin/skills?q=package.json",
                    },
                  ],
                  emptyValue: "No metadata sources detected",
                },
                {
                  title: "Reference Paths",
                  nodes: [
                    {
                      value: "skills/release",
                      href: "/admin/skills?q=skills%2Frelease",
                    },
                  ],
                  emptyValue: "No reference paths detected",
                },
                {
                  title: "Dependencies",
                  nodes: [
                    {
                      label: "skill",
                      value: "using-superpowers",
                      href: "/admin/skills?q=using-superpowers",
                    },
                  ],
                  emptyValue: "No dependencies detected",
                },
              ],
            },
            detailSections: [
              {
                title: "Source Analysis",
                items: [
                  { label: "Entry File", value: "README.md" },
                  { label: "Mechanism", value: "skill_manifest" },
                ],
              },
              {
                title: "Metadata Sources",
                items: [
                  { value: "README.md", href: "/admin/skills?q=README.md" },
                  {
                    value: "package.json",
                    href: "/admin/skills?q=package.json",
                  },
                ],
              },
              {
                title: "Reference Paths",
                items: [
                  {
                    value: "skills/release",
                    href: "/admin/skills?q=skills%2Frelease",
                  },
                ],
              },
              {
                title: "Dependencies",
                items: [
                  {
                    label: "skill",
                    value: "using-superpowers",
                    href: "/admin/skills?q=using-superpowers",
                  },
                ],
              },
            ],
            syncable: true,
          },
        ],
      },
      editor: null,
    };
  }

  if (route === "/admin/jobs") {
    return {
      metrics: [{ label: "Queued Jobs", value: "2" }],
      sidePanel: [
        {
          title: "Execution Signals",
          items: [{ label: "Latest running", value: "repo_sync" }],
        },
      ],
      table: {
        title: "Async Job Queue",
        rows: [
          {
            id: 81,
            name: "import_archive #81",
            summary: "Skill 101 · owner 7 · actor 7",
            meta: ["Attempt 1/3", "Mar 10, 08:10 AM"],
            status: "failed",
            detail: "archive parse failed",
          },
          {
            id: 82,
            name: "repo_sync #82",
            summary: "Skill 102 · owner 7 · actor 7",
            meta: ["Attempt 1/3", "Mar 10, 08:15 AM"],
            status: "running",
          },
        ],
      },
      editor: null,
    };
  }

  if (route === "/admin/sync-jobs") {
    return {
      metrics: [{ label: "Sync Runs", value: "1" }],
      sidePanel: [
        {
          title: "Run Distribution",
          items: [{ label: "Scheduled runs", value: "1" }],
        },
      ],
      table: {
        title: "Repository Sync Runs",
        rows: [
          {
            id: 41,
            name: "schedule · repository",
            summary: "11 synced / 1 failed / 12 candidates",
            meta: ["6.2 s", "Mar 10, 08:10 AM"],
            status: "success",
          },
        ],
      },
      editor: null,
    };
  }

  return {
    metrics: [{ label: "Scheduler Enabled", value: "Yes" }],
    sidePanel: [
      {
        title: "Policy Notes",
        items: [{ label: "Execution mode", value: "Scheduled sync enabled" }],
      },
    ],
    table: null,
    editor: {
      enabled: true,
      interval: "15m",
      timeout: "5m",
      batchSize: 25,
    },
  };
}

function renderCatalogRoute(route: AdminCatalogRoute) {
  return renderToStaticMarkup(
    createElement(
      ProtectedI18nProvider,
      {
        locale: "en",
        messages: createProtectedPageTestMessages({
          adminCommon: {
            adminEyebrow: "Admin",
            refresh: "Refresh",
            refreshing: "Refreshing...",
          },
          adminCatalog: {
            loadingData: "Loading admin catalog data...",
            emptyRows:
              "No catalog rows are available for the current route and filters.",
            filtersTitle: "Filters",
            filtersDescription:
              "Scope the current collection before refreshing the route-specific admin view.",
            keywordLabel: "Catalog keyword",
            keywordPlaceholder: "Keyword",
            sourceLabel: "Catalog source",
            sourcePlaceholder: "Source",
            statusLabel: "Catalog status",
            statusPlaceholder: "Status",
            visibilityLabel: "Catalog visibility",
            visibilityPlaceholder: "Visibility",
            ownerLabel: "Catalog owner",
            ownerPlaceholder: "Owner",
            jobTypeLabel: "Catalog job type",
            jobTypePlaceholder: "Job Type",
            applyFiltersAction: "Apply Filters",
            resetFiltersAction: "Reset",
            previousPageAction: "Previous Page",
            nextPageAction: "Next Page",
            paginationSummaryTemplate: "Page {page} of {totalPages}",
            inspectAction: "Inspect",
            selectedAction: "Selected",
            openDetailAction: "Open Details",
            closePanelAction: "Close Panel",
            skillsInventoryTitle: "Governed Inventory",
            skillsInventoryDescription:
              "Use this route as the searchable catalog list, then inspect one governed skill at a time.",
            skillsEmpty: "No governed skills were returned by the backend.",
            selectedSkillTitle: "Selected Skill",
            selectedSkillDescription:
              "Keep governance decisions anchored to one skill at a time instead of scanning anonymous rows.",
            selectedSkillEmpty:
              "Select a skill from the governed inventory to inspect ownership, quality, and exposure.",
            detailSourceAnalysisTitle: "Source Analysis",
            detailEntryFileLabel: "Entry File",
            detailMechanismLabel: "Mechanism",
            detailMetadataSourcesTitle: "Metadata Sources",
            detailReferencePathsTitle: "Reference Paths",
            detailDependenciesTitle: "Dependencies",
            detailTopologyTitle: "Topology",
            detailTopologyRootTitle: "Skill Entry",
            detailNoMetadataSources: "No metadata sources detected",
            detailNoReferencePaths: "No reference paths detected",
            detailNoDependencies: "No dependencies detected",
            syncNowAction: "Sync now",
            syncingAction: "Syncing...",
            updatingVisibilityAction: "Updating visibility...",
            makePublicAction: "Make Public",
            makePrivateAction: "Make Private",
            openVersionHistoryAction: "Open Version History",
            deleteSkillAction: "Delete Skill",
            deletingSkillAction: "Deleting Skill...",
            deleteSkillConfirmTitle: "Delete Skill Permanently",
            deleteSkillConfirmDescription:
              "This action removes the selected skill and its current record from the governed inventory.",
            deleteSkillConfirmBody:
              "Delete this governed skill only after version review is complete.",
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
            rollbackVersionSuccess: "Skill rollback completed.",
            restoreVersionSuccess: "Skill restore completed.",
            openSkillDetailAction: "Open Skill Detail",
            openIntakeAction: "Open Intake",
            jobsQueueTitle: "Execution Queue",
            jobsQueueDescription:
              "Review the async job queue as an action list, not only a metric strip.",
            jobsEmpty: "No async jobs were returned by the backend.",
            selectedJobTitle: "Selected Job",
            selectedJobDescription:
              "Inspect the currently selected queue item before applying retry or cancel decisions.",
            selectedJobEmpty:
              "Select a job from the queue to inspect retry pressure and failure context.",
            retryAction: "Retry",
            retryingAction: "Retrying...",
            cancelAction: "Cancel",
            cancelingAction: "Canceling...",
            retrySelectedAction: "Retry Selected",
            cancelSelectedAction: "Cancel Selected",
            syncRunsTitle: "Run History",
            syncRunsDescription:
              "Read repository synchronization as an operational history with one focused run at a time.",
            syncRunsEmpty:
              "No synchronization runs were returned by the backend.",
            selectedSyncRunTitle: "Selected Sync Run",
            selectedSyncRunDescription:
              "Use the focused run detail to understand cadence, duration, and delivery quality.",
            selectedSyncRunEmpty:
              "Select a sync run to inspect throughput and completion details.",
            openSyncPolicyAction: "Open Sync Policy",
            policyEditorTitle: "Policy Editor",
            policyEditorDescription:
              "Use this route as a configuration surface rather than a generic data table.",
            schedulerEnabledLabel: "Scheduler enabled",
            schedulerEnabledHelp: "Scheduler enabled",
            intervalLabel: "Interval",
            intervalPlaceholder: "Interval",
            intervalHelp:
              "How often the scheduler starts a new repository sync run.",
            timeoutLabel: "Timeout",
            timeoutPlaceholder: "Timeout",
            timeoutHelp:
              "Maximum runtime allowed for a single scheduled sync before it is marked as timed out.",
            batchSizeLabel: "Batch Size",
            batchSizePlaceholder: "Batch Size",
            batchSizeHelp:
              "Maximum number of repository-backed skills evaluated in one scheduled run.",
            savePolicyAction: "Save Policy",
            savingPolicyAction: "Saving...",
            resetDraftAction: "Reset Draft",
            policyPostureTitle: "Current Policy Posture",
            policyPostureDescription:
              "Read the effective scheduler posture before publishing a new draft.",
            policySaveImpactTitle: "Save Impact",
            policySaveImpactDescription:
              "Review what this draft changes before you publish the next scheduler posture.",
            policySaveImpactBody:
              "Saved changes affect future scheduled runs and do not restart a run that is already in progress.",
          },
        }),
      },
      createElement(AdminCatalogContent, {
        route,
        title: "Catalog",
        description: "Route specific catalog view",
        loading: false,
        busyAction: "",
        error: "",
        message: "",
        query: {},
        viewModel: createViewModel(route),
        policyDraft: {
          enabled: true,
          interval: "15m",
          timeout: "5m",
          batchSize: 25,
        },
        onQueryChange: () => undefined,
        onResetQuery: () => undefined,
        onRefresh: () => undefined,
        onPageChange: () => undefined,
        onSyncSkill: () => undefined,
        onUpdateSkillVisibility: () => undefined,
        onDeleteSkill: () => undefined,
        onRollbackSkillVersion: () => undefined,
        onRestoreSkillVersion: () => undefined,
        onRunJobAction: () => undefined,
        onPolicyDraftChange: () => undefined,
        onResetPolicyDraft: () => undefined,
        onSavePolicy: () => undefined,
      }),
    ),
  );
}

function expectMarkupToContainAll(markup: string, fragments: string[]) {
  for (const fragment of fragments) {
    expect(markup).toContain(fragment);
  }
}

function expectMarkupToExcludeAll(markup: string, fragments: string[]) {
  for (const fragment of fragments) {
    expect(markup).not.toContain(fragment);
  }
}

describe("admin catalog content", () => {
  it("renders the skills route with drawer entry actions and primary skill actions", () => {
    const markup = renderCatalogRoute("/admin/skills");

    expectMarkupToContainAll(markup, [
      "Governed Inventory",
      "Release Readiness Checklist",
      'data-testid="admin-catalog-row-11"',
      "Selected",
      "Open Details",
      "Sync now",
      "Catalog Signals",
    ]);
    expectMarkupToExcludeAll(markup, [
      'role="dialog"',
      'data-testid="admin-skills-inline-detail"',
      "Selected Skill",
      "Topology",
    ]);
  });

  it("renders the jobs route with queue actions while keeping the detail pane closed by default", () => {
    const markup = renderCatalogRoute("/admin/jobs");

    expectMarkupToContainAll(markup, [
      "Execution Queue",
      "import_archive #81",
      'data-testid="admin-catalog-row-81"',
      "Selected",
      "Open Details",
      "Retry",
      "Cancel",
    ]);
    expectMarkupToExcludeAll(markup, ['role="dialog"']);
  });

  it("renders the sync runs route as a history list with detail entry actions", () => {
    const markup = renderCatalogRoute("/admin/sync-jobs");

    expectMarkupToContainAll(markup, [
      "Run History",
      "schedule · repository",
      'data-testid="admin-catalog-row-41"',
      "Selected",
      "Open Details",
    ]);
    expectMarkupToExcludeAll(markup, ['role="dialog"']);
  });

  it("renders the shared catalog detail surface inline when opened", () => {
    const markup = renderToStaticMarkup(
      createElement(
        ProtectedI18nProvider,
        {
          locale: "en",
          messages: createProtectedPageTestMessages({
            adminCatalog: {
              closePanelAction: "Close Panel",
            },
          }),
        },
        createElement(CatalogDetailPane, {
          open: true,
          row: {
            id: 81,
            name: "import_archive #81",
            summary: "Skill 101 · owner 7 · actor 7",
            meta: ["Attempt 1/3", "Mar 10, 08:10 AM"],
            status: "failed",
            detail: "archive parse failed",
          },
          description:
            "Inspect the currently selected queue item before applying retry or cancel decisions.",
          closeLabel: "Close Panel",
          onClose: () => undefined,
        }),
      ),
    );

    expectMarkupToContainAll(markup, [
      'data-testid="admin-catalog-detail-pane"',
      "import_archive #81",
      "archive parse failed",
      "Close Panel",
    ]);
    expect(markup).toContain('role="dialog"');
  });

  it("renders the policy route as a configuration form plus posture summary", () => {
    const markup = renderCatalogRoute("/admin/sync-policy/repository");

    expectMarkupToContainAll(markup, [
      'data-testid="admin-sync-policy-page"',
      'data-testid="admin-sync-policy-current-posture"',
      'data-testid="admin-sync-policy-editor"',
      'data-testid="admin-sync-policy-guidance"',
      "Policy Editor",
      "Current Policy Posture",
      'aria-label="Scheduler enabled"',
      'aria-label="Interval"',
      'aria-label="Timeout"',
      'aria-label="Batch Size"',
      "How often the scheduler starts a new repository sync run.",
      "Maximum runtime allowed for a single scheduled sync before it is marked as timed out.",
      "Maximum number of repository-backed skills evaluated in one scheduled run.",
      "Save Impact",
      "Save Policy",
      "Reset Draft",
    ]);
  });

});
