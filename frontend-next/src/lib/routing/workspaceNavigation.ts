import type { NavigationLink } from "./adminNavigation";

export const workspaceNavigationItems: NavigationLink[] = [
  { href: "/workspace", label: "Overview", description: "Dashboard command deck and operator signals" },
  { href: "/workspace/activity", label: "Activity", description: "Recent execution, ownership, and catalog movement" },
  { href: "/workspace/queue", label: "Queue", description: "Pending, active, and at-risk execution lanes" },
  { href: "/workspace/policy", label: "Policy", description: "Governance posture and review pressure" },
  { href: "/workspace/runbook", label: "Runbook", description: "Response scripts and escalation checklists" },
  { href: "/workspace/actions", label: "Actions", description: "Operator shortcuts across connected surfaces" }
];

export const workspaceRelatedLinks: NavigationLink[] = [
  { href: "/", label: "Marketplace", description: "Return to the public discovery deck" },
  { href: "/admin/overview", label: "Admin", description: "Open governed operations and catalog controls" },
  { href: "/account/profile", label: "Account", description: "Review operator profile and credentials" },
  { href: "/governance", label: "Governance", description: "Inspect public-facing governance guidance" }
];
