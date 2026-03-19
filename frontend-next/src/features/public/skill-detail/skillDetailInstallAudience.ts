import type { SkillDetailWorkspaceTab } from "./SkillDetailWorkbench";

export type SkillDetailInstallAudience = "agent" | "human";

export function resolveSkillDetailInstallAudience(
  activeTab: SkillDetailWorkspaceTab,
  installAudience: SkillDetailInstallAudience
): SkillDetailInstallAudience {
  return activeTab === "resources" ? "agent" : installAudience;
}
