export interface WorkspaceRouteMeta {
  title: string;
  description: string;
}

export const workspaceRouteMeta: Record<string, WorkspaceRouteMeta> = {
  "/workspace": {
    title: "Workspace Overview",
    description: "Operational summary with the current signed-in session and the new shell baseline."
  },
  "/workspace/activity": {
    title: "Activity Feed",
    description: "Recent execution, governance, and marketplace interaction signals."
  },
  "/workspace/queue": {
    title: "Queue Execution",
    description: "Execution queue visibility for pending, active, and blocked runs."
  },
  "/workspace/policy": {
    title: "Policy Summary",
    description: "Current governance posture, registration policy, and access-related context."
  },
  "/workspace/runbook": {
    title: "Runbook Preview",
    description: "Operational runbooks and response procedures available to signed-in users."
  },
  "/workspace/actions": {
    title: "Quick Actions",
    description: "Action shortcuts that bridge discovery, execution, and governance."
  }
};
