import type { PublicSkillDetailFileBrowserProps } from "./PublicSkillDetailPage.fileBrowser.contract";
import {
  SkillDetailActiveResourcePanel,
  SkillDetailResourceTabList
} from "./PublicSkillDetailPage.fileBrowser.panels";

export default function PublicSkillDetailFileBrowser({
  activeResourceTab,
  text,
  onSelectResourceTab,
  ...panelProps
}: PublicSkillDetailFileBrowserProps) {
  return (
    <div className="skill-detail-left-col skill-detail-resource-shell">
      <SkillDetailResourceTabList
        activeResourceTab={activeResourceTab}
        onSelectResourceTab={onSelectResourceTab}
        text={text}
      />
      <SkillDetailActiveResourcePanel
        {...panelProps}
        activeResourceTab={activeResourceTab}
        onSelectResourceTab={onSelectResourceTab}
        text={text}
      />
    </div>
  );
}
