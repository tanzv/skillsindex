import type { SkillDetailWorkspaceTab } from "./skillDetailWorkspaceConfig";

export function shouldLoadDeferredSkillResources(activeTab: SkillDetailWorkspaceTab): boolean {
  return activeTab === "skill" || activeTab === "resources";
}

export function shouldLoadDeferredSkillVersions(activeTab: SkillDetailWorkspaceTab): boolean {
  return activeTab === "history";
}

export function shouldLoadDeferredSkillResourceContent(activeTab: SkillDetailWorkspaceTab): boolean {
  return activeTab === "skill" || activeTab === "resources";
}
