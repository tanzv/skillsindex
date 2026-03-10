import type { MarketplaceSkill } from "../../lib/api";
import type { SkillDetailCopy } from "./PublicSkillDetailPage.copy";
import type { SkillDetailPresetKey, SkillDetailViewModel } from "./PublicSkillDetailPage.helpers";
import type { SkillDetailResourceTabKey } from "./PublicSkillDetailResourceTabs";

export type RelatedSkillsLoadStatus = "idle" | "loading" | "ready" | "error";

export interface PublicSkillDetailFileBrowserProps {
  activePreset: SkillDetailPresetKey;
  activeResourceTab: SkillDetailResourceTabKey;
  activeSkill: MarketplaceSkill | null;
  detailModel: SkillDetailViewModel;
  relatedSkills: MarketplaceSkill[];
  relatedSkillsLoadStatus: RelatedSkillsLoadStatus;
  selectedFileIndex: number;
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
  selectedFileName: string;
  selectedFilePath: string;
  text: SkillDetailCopy;
  onCopyPath: () => void;
  onOpenSource: () => void;
  panelClassName?: string;
}
