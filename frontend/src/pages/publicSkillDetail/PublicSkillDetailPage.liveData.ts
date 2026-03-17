import type { MarketplaceSkill, PublicSkillResourcesResponse, PublicSkillVersionItem } from "../../lib/api";
import type { DetailFileEntry, SkillDetailViewModel } from "./PublicSkillDetailPage.helpers";

export interface SkillResourceSnapshot {
  sourceUrl: string;
  repository: string;
  sourceBranch: string;
  sourcePath: string;
  selectedFile: string;
  sourceType: string;
  updatedAt: string;
  fileCount: string;
}

export interface SkillVersionHistoryEntry {
  id: number;
  versionLabel: string;
  trigger: string;
  riskLevel: string;
  capturedAt: string;
  summary: string;
  actor: string;
  changedFields: string;
  tags: string;
}

export function resolveDetailFileEntries(
  fallbackEntries: DetailFileEntry[],
  resources: PublicSkillResourcesResponse | null
): DetailFileEntry[] {
  if (!resources || !Array.isArray(resources.files) || resources.files.length === 0) {
    return fallbackEntries;
  }

  return resources.files.map((file) => ({
    name: file.name,
    displayName: file.display_name || file.name,
    size: file.size_label
  }));
}

interface ResolveSkillResourceSnapshotOptions {
  activeSkill: MarketplaceSkill | null;
  detailModel: SkillDetailViewModel;
  selectedFileName: string;
  resources: PublicSkillResourcesResponse | null;
}

export function resolveSkillResourceSnapshot({
  activeSkill,
  detailModel,
  selectedFileName,
  resources
}: ResolveSkillResourceSnapshotOptions): SkillResourceSnapshot {
  const fallbackFileCount = detailModel.fileEntries.length > 0 ? detailModel.fileEntries.length : 1;

  return {
    sourceUrl: String(resources?.source_url || activeSkill?.source_url || detailModel.repositoryHostPath || "").trim(),
    repository: String(resources?.repo_url || detailModel.repositoryHostPath || activeSkill?.source_url || "").trim(),
    sourceBranch: String(resources?.source_branch || "").trim(),
    sourcePath: String(resources?.source_path || selectedFileName || detailModel.fileEntries[0]?.name || "SKILL.md").trim(),
    selectedFile: String(selectedFileName || detailModel.fileEntries[0]?.name || resources?.source_path || "SKILL.md").trim(),
    sourceType: String(resources?.source_type || activeSkill?.source_type || "repository").trim(),
    updatedAt: String(resources?.updated_at || activeSkill?.updated_at || "").trim(),
    fileCount: String(resources?.file_count || fallbackFileCount)
  };
}

export function resolveSkillVersionHistoryEntries(items: PublicSkillVersionItem[]): SkillVersionHistoryEntry[] {
  return items.map((item) => {
    const changedFields = Array.isArray(item.changed_fields) ? item.changed_fields.filter(Boolean).join(", ") : "";
    const tags = Array.isArray(item.tags) ? item.tags.filter(Boolean).join(", ") : "";
    const summary = String(item.change_summary || changedFields || "").trim();
    const actor = String(item.actor_display_name || item.actor_username || "system").trim();

    return {
      id: item.id,
      versionLabel: `v${item.version_number}`,
      trigger: String(item.trigger || "").trim(),
      riskLevel: String(item.risk_level || "").trim(),
      capturedAt: String(item.captured_at || "").trim(),
      summary,
      actor,
      changedFields,
      tags
    };
  });
}
