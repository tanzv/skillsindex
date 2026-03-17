import type { SessionContext } from "@/src/lib/schemas/session";

import { formatWorkspaceDate } from "./snapshot";
import { buildCommonQuickActions, buildOverviewQuickActions } from "./pageMetrics";
import type { WorkspacePageModel, WorkspaceRoutePath, WorkspaceSection, WorkspaceSectionItem, WorkspaceSnapshot } from "./types";

function buildActivityItems(entries: WorkspaceSnapshot["recentActivity"]): WorkspaceSectionItem[] {
  return entries.map((entry) => ({
    label: entry.name,
    value: `${entry.status.toUpperCase()} · ${entry.owner}`,
    description: `${entry.summary} Updated ${formatWorkspaceDate(entry.updatedAt)} · ${entry.category}/${entry.subcategory}.`
  }));
}
function buildOwnerCoverageItems(snapshot: WorkspaceSnapshot): WorkspaceSectionItem[] {
  return snapshot.ownerCoverage.map((item) => ({
    label: item.owner,
    value: `${item.itemCount} items · ${item.riskCount} risk`,
    description: `Average quality score ${item.averageQuality}.`
  }));
}
function buildRiskWatchlistItems(snapshot: WorkspaceSnapshot): WorkspaceSectionItem[] {
  if (snapshot.riskWatchlist.length === 0) {
    return [
      {
        label: "No active risk item",
        value: "Queue remains stable",
        description: "The current workspace snapshot does not contain blocked or degraded queue entries."
      }
    ];
  }

  return snapshot.riskWatchlist.map((entry) => ({
    label: entry.name,
    value: `${entry.status.toUpperCase()} · ${entry.owner}`,
    description: `${entry.summary} Updated ${formatWorkspaceDate(entry.updatedAt)} · quality ${entry.qualityScore.toFixed(1)}.`
  }));
}
function buildPolicyCoverageItems(snapshot: WorkspaceSnapshot): WorkspaceSectionItem[] {
  return snapshot.policySignals.map((signal) => ({
    label: signal.label,
    value: signal.value,
    description: signal.detail
  }));
}
function buildTopTagItems(snapshot: WorkspaceSnapshot): WorkspaceSectionItem[] {
  return snapshot.topTags.map((tag) => ({
    label: tag.name,
    value: `${tag.count} matches`,
    description: "Current hot topic across the active workspace catalog."
  }));
}
function buildCurrentSessionSection(session: SessionContext): WorkspaceSection {
  const userName = session.user?.displayName || session.user?.username || "Unknown user";
  const role = session.user?.role || "Unknown role";
  const status = session.user?.status || "unknown";

  return {
    title: "Current Session",
    description: "Identity, access, and visibility posture for the active workspace operator.",
    variant: "session",
    items: [
      { label: "Signed In User", value: userName, description: "Current operator identity resolved from the authenticated session." },
      { label: "Role", value: role, description: "Workspace capabilities depend on the current role binding." },
      { label: "Session Status", value: status, description: "Authentication state currently applied to workspace routes." },
      {
        label: "Marketplace Access",
        value: session.marketplacePublicAccess ? "Public" : "Restricted",
        description: session.marketplacePublicAccess
          ? "Public marketplace discovery is available from this session."
          : "Public marketplace discovery is intentionally restricted for this session."
      }
    ]
  };
}
function buildWorkspaceSignalsSection(snapshot: WorkspaceSnapshot, session: SessionContext): WorkspaceSection {
  const activeRuns = snapshot.queueCounts.pending + snapshot.queueCounts.running;

  return {
    title: "Workspace Signals",
    description: "At-a-glance operational posture for catalog readiness, active execution, and session visibility.",
    variant: "signal-grid",
    items: [
      {
        label: "Catalog Footprint",
        value: `${snapshot.metrics.installedSkills}`,
        description: `${snapshot.queueCounts.all} tracked skills are currently wired into this workspace.`
      },
      {
        label: "Execution Throughput",
        value: `${activeRuns}`,
        description: `${snapshot.queueCounts.running} running and ${snapshot.queueCounts.pending} pending lanes are active.`
      },
      {
        label: "Risk Queue",
        value: `${snapshot.queueCounts.risk}`,
        description: "Items that need governance or operator follow-up before they can move forward."
      },
      {
        label: "Discovery Access",
        value: session.marketplacePublicAccess ? "Public" : "Restricted",
        description: "Marketplace visibility inherited by the current authenticated workspace session."
      }
    ]
  };
}
function buildExecutionSpotlightSection(snapshot: WorkspaceSnapshot): WorkspaceSection {
  const spotlight = snapshot.spotlightEntry;

  if (!spotlight) {
    return {
      title: "Execution Spotlight",
      description: "Primary queue focus for the current operator session.",
      variant: "compact-list",
      items: [{ label: "Queue Focus", value: "No active item", description: "Load a workspace snapshot with active queue entries to populate this lane." }],
      actions: [{ label: "Open Queue", href: "/workspace/queue", variant: "default" }]
    };
  }

  return {
    title: "Execution Spotlight",
    description: spotlight.summary,
    variant: "compact-list",
    items: [
      { label: "Focus Skill", value: spotlight.name, description: `${spotlight.category}/${spotlight.subcategory}` },
      {
        label: "Execution State",
        value: spotlight.status.toUpperCase(),
        description: `Updated ${formatWorkspaceDate(spotlight.updatedAt)} · owner ${spotlight.owner}.`
      },
      {
        label: "Quality Score",
        value: spotlight.qualityScore.toFixed(1),
        description: `${spotlight.starCount} stars captured in the current catalog snapshot.`
      },
      {
        label: "Next Route",
        value: "/workspace/runbook",
        description: "Jump into the response script or inspect the full execution queue."
      }
    ],
    badges: spotlight.tags,
    actions: [
      { label: "Open Queue", href: "/workspace/queue", variant: "default" },
      { label: "Open Runbook", href: "/workspace/runbook", variant: "outline" }
    ]
  };
}
export function buildRouteSections(session: SessionContext, snapshot: WorkspaceSnapshot): Record<
  WorkspaceRoutePath,
  Pick<WorkspacePageModel, "primarySections" | "railSections" | "quickActions">
> {
  const commonQuickActions = buildCommonQuickActions();
  const spotlight = snapshot.spotlightEntry;
  const runbookEntry = snapshot.runbookEntry;
  return {
    "/workspace": {
      quickActions: buildOverviewQuickActions(snapshot),
      primarySections: [
        buildWorkspaceSignalsSection(snapshot, session),
        buildExecutionSpotlightSection(snapshot),
        {
          title: "Recent Activity",
          description: "The latest skill changes and queue movement in this workspace.",
          variant: "activity-list",
          items: buildActivityItems(snapshot.recentActivity),
          actions: [{ label: "Open Activity Feed", href: "/workspace/activity", variant: "outline" }]
        }
      ],
      railSections: [
        {
          title: "Owner Coverage",
          description: "Squads currently carrying the most execution and catalog volume.",
          variant: "compact-list",
          items: buildOwnerCoverageItems(snapshot)
        },
        {
          title: "Risk Watchlist",
          description: "Queue items that need operator attention before rollout can continue.",
          variant: "activity-list",
          items: buildRiskWatchlistItems(snapshot),
          actions: [{ label: "Review Policy", href: "/workspace/policy", variant: "soft" }]
        },
        {
          title: "Policy Coverage",
          description: "Governance signals derived from the current catalog mix.",
          variant: "compact-list",
          items: buildPolicyCoverageItems(snapshot)
        },
        buildCurrentSessionSection(session)
      ]
    },
    "/workspace/activity": {
      quickActions: commonQuickActions,
      primarySections: [
        {
          title: "Activity Feed",
          description: "Recent execution and catalog events ordered by freshness.",
          variant: "activity-list",
          items: buildActivityItems(snapshot.recentActivity)
        },
        {
          title: "Owner Coverage",
          description: "Which squads currently own the most queue volume.",
          variant: "compact-list",
          items: buildOwnerCoverageItems(snapshot)
        }
      ],
      railSections: [
        {
          title: "Top Tags",
          description: "Current hot topics across the active skill set.",
          variant: "compact-list",
          items: buildTopTagItems(snapshot)
        },
        buildCurrentSessionSection(session)
      ]
    },
    "/workspace/queue": {
      quickActions: commonQuickActions,
      primarySections: [
        {
          title: "Execution Spotlight",
          description: spotlight ? spotlight.summary : "No queue activity is currently available.",
          variant: "compact-list",
          items: spotlight
            ? [
                { label: "Skill", value: spotlight.name, description: `${spotlight.category}/${spotlight.subcategory}` },
                { label: "Owner", value: spotlight.owner, description: `Updated ${formatWorkspaceDate(spotlight.updatedAt)}.` },
                { label: "Status", value: spotlight.status.toUpperCase(), description: "Current execution state in the queue." },
                { label: "Quality", value: spotlight.qualityScore.toFixed(1), description: `${spotlight.starCount} stars in the catalog snapshot.` }
              ]
            : [{ label: "Queue", value: "No active queue entries", description: "The current workspace snapshot does not expose queue activity." }],
          badges: spotlight ? spotlight.tags : undefined,
          actions: [
            { label: "Open Skill Detail", href: spotlight ? `/skills/${spotlight.id}` : "/", variant: "default" },
            { label: "Open Sync Jobs", href: "/admin/sync-jobs", variant: "outline" }
          ]
        },
        {
          title: "Queue Insights",
          description: "Execution capacity, risk ratio, and alert volume for the current queue.",
          variant: "signal-grid",
          items: [
            {
              label: "Risk Ratio",
              value: snapshot.queueCounts.all > 0 ? `${Math.round((snapshot.queueCounts.risk / snapshot.queueCounts.all) * 100)}%` : "0%",
              description: "Share of queued items that currently require explicit intervention."
            },
            {
              label: "Execution Coverage",
              value:
                snapshot.queueCounts.all > 0
                  ? `${Math.round(((snapshot.queueCounts.pending + snapshot.queueCounts.running) / snapshot.queueCounts.all) * 100)}%`
                  : "0%",
              description: "Share of tracked skills that are currently in motion."
            },
            {
              label: "Health Score",
              value: snapshot.metrics.healthScore.toFixed(1),
              description: "Average quality score across the queue backlog."
            },
            {
              label: "Alerts",
              value: String(snapshot.metrics.alerts),
              description: "Combined alert load derived from queue risk and access posture."
            }
          ]
        }
      ],
      railSections: [
        {
          title: "Escalation Paths",
          description: "Recommended destinations when queue pressure or risk requires action.",
          variant: "compact-list",
          items: [
            { label: "Import Recovery", value: "/admin/records/imports", description: "Review failed imports and replay decisions." },
            { label: "Governance Follow-up", value: "/workspace/policy", description: "Open policy posture and unresolved governance signals." },
            { label: "Catalog Review", value: "/admin/skills", description: "Inspect skill metadata or re-run catalog operations." }
          ],
          actions: [{ label: "Open Imports", href: "/admin/records/imports", variant: "soft" }]
        },
        buildCurrentSessionSection(session)
      ]
    },
    "/workspace/policy": {
      quickActions: commonQuickActions,
      primarySections: [
        {
          title: "Governance Priorities",
          description: "Signals that should inform approvals, ownership review, and policy changes.",
          variant: "compact-list",
          items: buildPolicyCoverageItems(snapshot)
        },
        {
          title: "Review Pressure",
          description: "Signals that indicate where policy review bandwidth is currently consumed.",
          variant: "signal-grid",
          items: [
            { label: "Alerts", value: String(snapshot.metrics.alerts), description: "Combined alert load across workspace operations." },
            { label: "Risk Items", value: String(snapshot.queueCounts.risk), description: "Items blocked by risk, governance, or missing follow-up." },
            { label: "Running Items", value: String(snapshot.queueCounts.running), description: "Execution lanes already in progress." },
            { label: "Pending Items", value: String(snapshot.queueCounts.pending), description: "Items waiting to enter active execution." }
          ]
        }
      ],
      railSections: [
        {
          title: "Top Tags",
          description: "Topics that are driving the most current workspace activity.",
          variant: "compact-list",
          items: buildTopTagItems(snapshot)
        },
        buildCurrentSessionSection(session)
      ]
    },
    "/workspace/runbook": {
      quickActions: commonQuickActions,
      primarySections: [
        {
          title: "Response Script",
          description: "Suggested command path for the currently highlighted queue item.",
          variant: "code-emphasis",
          items: runbookEntry
            ? [
                { label: "Focus Skill", value: runbookEntry.name, description: `${runbookEntry.category}/${runbookEntry.subcategory}` },
                { label: "Current Status", value: runbookEntry.status.toUpperCase(), description: "Current queue state for the highlighted item." },
                { label: "Owner", value: runbookEntry.owner, description: "Primary owner expected to close the action loop." }
              ]
            : [{ label: "Runbook", value: "No queue item available", description: "The response script will appear when a queue item is available." }],
          code: runbookEntry
            ? [
                `workspace queue --skill ${runbookEntry.id} --status ${runbookEntry.status}`,
                `workspace verify --skill ${runbookEntry.id} --quality ${runbookEntry.qualityScore.toFixed(1)}`,
                `workspace rollout --skill ${runbookEntry.id} --owner ${runbookEntry.owner}`,
                `workspace observe --skill ${runbookEntry.id} --channel ${runbookEntry.category.toLowerCase()}`
              ].join("\n")
            : "workspace queue --select none",
          actions: [{ label: "Open Queue", href: "/workspace/queue", variant: "outline" }]
        }
      ],
      railSections: [
        {
          title: "Escalation Checklist",
          description: "High-signal checks to complete before moving the item forward.",
          variant: "compact-list",
          items: [
            { label: "Owner confirmed", value: "Validate squad routing and current reviewer." },
            { label: "Policy reviewed", value: "Check governance or compliance blockers." },
            { label: "Execution evidence", value: "Capture logs, import history, and rollout notes." }
          ]
        },
        buildCurrentSessionSection(session)
      ]
    },
    "/workspace/actions": {
      quickActions: [...commonQuickActions, { label: "Open Account Center", href: "/account/profile", variant: "outline" }],
      primarySections: [
        {
          title: "Quick Actions",
          description: "High-frequency operator shortcuts for catalog, governance, and execution work.",
          variant: "compact-list",
          items: [
            { label: "Catalog Intake", value: "/admin/ingestion/repository", description: "Open repository ingestion controls." },
            { label: "Manual Import", value: "/admin/records/imports", description: "Review manual or external import history." },
            { label: "Policy Review", value: "/workspace/policy", description: "Inspect current governance signals." }
          ],
          actions: [
            { label: "Open Repository Intake", href: "/admin/ingestion/repository", variant: "default" },
            { label: "Open Policy View", href: "/workspace/policy", variant: "outline" }
          ]
        },
        {
          title: "Linked Surfaces",
          description: "Related route families that still participate in the migrated workbench.",
          variant: "compact-list",
          items: [
            { label: "Admin Skills", value: "/admin/skills", description: "Inspect catalog inventory and metadata." },
            { label: "Sync Jobs", value: "/admin/sync-jobs", description: "Review repository and import synchronization activity." },
            { label: "API Credentials", value: "/account/api-credentials", description: "Manage account-scoped credential access." }
          ]
        }
      ],
      railSections: [
        {
          title: "Suggested Next Steps",
          description: "Recommended destinations based on the current workspace posture.",
          variant: "compact-list",
          items: [
            { label: "Highest priority", value: snapshot.riskWatchlist[0]?.name || "No risk item detected" },
            { label: "Most active owner", value: snapshot.ownerCoverage[0]?.owner || "n/a" },
            { label: "Top tag", value: snapshot.topTags[0]?.name || "n/a" }
          ]
        },
        buildCurrentSessionSection(session)
      ]
    }
  };
}
