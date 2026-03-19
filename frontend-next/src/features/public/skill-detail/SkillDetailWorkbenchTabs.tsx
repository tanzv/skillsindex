import { TabsList, TabsTrigger } from "@/src/components/ui/tabs";

import {
  skillDetailWorkspaceTabs,
  type SkillDetailWorkspaceTab
} from "./skillDetailWorkspaceConfig";

interface SkillDetailWorkbenchTabsProps {
  activeTab: SkillDetailWorkspaceTab;
  onTabChange: (nextTab: SkillDetailWorkspaceTab) => void;
  tabLabelByKey: Record<SkillDetailWorkspaceTab, string>;
  panelIdByKey: Record<SkillDetailWorkspaceTab, string>;
  titleByTab: Record<SkillDetailWorkspaceTab, string>;
  ariaLabel?: string;
  rootClassName?: string;
  tabListClassName?: string;
}

export function SkillDetailWorkbenchTabs({
  activeTab,
  ariaLabel,
  onTabChange,
  tabLabelByKey,
  panelIdByKey,
  rootClassName = "skill-detail-workbench-head",
  tabListClassName = "skill-detail-tab-list",
  titleByTab
}: SkillDetailWorkbenchTabsProps) {
  return (
    <div className={rootClassName}>
      <TabsList className={tabListClassName} aria-label={ariaLabel || titleByTab[activeTab]}>
        {skillDetailWorkspaceTabs.map(({ key: tab }) => (
          <TabsTrigger
            key={tab}
            value={tab}
            activeValue={activeTab}
            triggerId={tabLabelByKey[tab]}
            controlsId={panelIdByKey[tab]}
            className="skill-detail-tab-button"
            onValueChange={(nextTab) => onTabChange(nextTab as SkillDetailWorkspaceTab)}
          >
            {titleByTab[tab]}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
