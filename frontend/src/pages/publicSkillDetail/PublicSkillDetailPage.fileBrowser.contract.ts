import type { MarketplaceSkill, PublicSkillResourcesResponse, PublicSkillVersionItem } from "../../lib/api";
import type { SkillDetailCopy } from "./PublicSkillDetailPage.copy";
import type { SkillDetailPresetKey, SkillDetailViewModel } from "./PublicSkillDetailPage.helpers";
import type { SkillDetailResourceTabKey } from "./PublicSkillDetailResourceTabs";

export type SkillDetailAsyncLoadStatus = "idle" | "loading" | "ready" | "error";
export type RelatedSkillsLoadStatus = SkillDetailAsyncLoadStatus;

export interface PublicSkillDetailFileBrowserProps {
  activePreset: SkillDetailPresetKey;
  activeResourceTab: SkillDetailResourceTabKey;
  activeSkill: MarketplaceSkill | null;
  detailModel: SkillDetailViewModel;
  skillResources: PublicSkillResourcesResponse | null;
  skillResourcesLoadStatus: SkillDetailAsyncLoadStatus;
  versionItems: PublicSkillVersionItem[];
  versionItemsLoadStatus: SkillDetailAsyncLoadStatus;
  relatedSkills: MarketplaceSkill[];
  relatedSkillsLoadStatus: RelatedSkillsLoadStatus;
  selectedFileIndex: number;
  selectedFileContent: string;
  selectedFileLanguage: string;
  selectedFileName: string;
  selectedFilePath: string;
  text: SkillDetailCopy;
  onCopyPath: () => void;
  onOpenSource: () => void;
  onSelectResourceTab: (nextTab: SkillDetailResourceTabKey) => void;
}

export interface SkillDetailPreviewPanelProps {
  activePreset: SkillDetailPresetKey;
  activeSkill: MarketplaceSkill | null;
  detailModel: SkillDetailViewModel;
  selectedFileIndex: number;
  selectedFileContent: string;
  selectedFileLanguage: string;
  selectedFileName: string;
  selectedFilePath: string;
  text: SkillDetailCopy;
  onCopyPath: () => void;
  onOpenSource: () => void;
  panelClassName?: string;
}
