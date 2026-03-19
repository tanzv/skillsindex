"use client";

import { MarketplaceTopbarBreadcrumb, type MarketplaceTopbarBreadcrumbItem } from "../marketplace/MarketplaceTopbarBreadcrumb";
import { SkillDetailWorkbenchTabs } from "./SkillDetailWorkbenchTabs";
import {
  skillDetailWorkspacePanelIdByKey,
  skillDetailWorkspaceTabIdByKey,
  type SkillDetailWorkspaceTab
} from "./skillDetailWorkspaceConfig";

interface SkillDetailContextBarProps {
  activeTab: SkillDetailWorkspaceTab;
  breadcrumbAriaLabel: string;
  breadcrumbItems: MarketplaceTopbarBreadcrumbItem[];
  onTabChange: (nextTab: SkillDetailWorkspaceTab) => void;
  previewStatus: string;
  summaryItems?: string[];
  title?: string;
  workspaceCopy: Record<SkillDetailWorkspaceTab, { description: string; title: string }>;
}

export function SkillDetailContextBar({
  activeTab,
  breadcrumbAriaLabel,
  breadcrumbItems,
  onTabChange,
  previewStatus,
  summaryItems = [],
  title,
  workspaceCopy
}: SkillDetailContextBarProps) {
  const activeTabTitle = workspaceCopy[activeTab].title;

  return (
    <div className="skill-detail-context-bar" data-testid="skill-detail-context-bar">
      <div className="skill-detail-context-bar-top">
        <div className="skill-detail-context-bar-leading">
          <MarketplaceTopbarBreadcrumb
            ariaLabel={breadcrumbAriaLabel}
            className="skill-detail-shell-breadcrumb skill-detail-context-breadcrumb"
            testId="skill-detail-shell-breadcrumb"
            items={breadcrumbItems}
          />

          {title || summaryItems.length > 0 ? (
            <div className="skill-detail-context-summary">
              {title ? <strong className="skill-detail-context-title">{title}</strong> : null}
              {summaryItems.length > 0 ? (
                <div className="skill-detail-context-summary-row" aria-label={activeTabTitle}>
                  {summaryItems.filter(Boolean).map((item) => (
                    <span key={item} className="skill-detail-context-summary-chip">
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="skill-detail-context-bar-status" aria-label={activeTabTitle}>
          <span className="skill-detail-context-status-label">{activeTabTitle}</span>
          <span className="skill-detail-context-status-value">{previewStatus}</span>
        </div>
      </div>

      <SkillDetailWorkbenchTabs
        activeTab={activeTab}
        ariaLabel={activeTabTitle}
        onTabChange={onTabChange}
        panelIdByKey={skillDetailWorkspacePanelIdByKey}
        rootClassName="skill-detail-context-bar-tabs"
        tabLabelByKey={skillDetailWorkspaceTabIdByKey}
        tabListClassName="skill-detail-context-tab-list"
        titleByTab={Object.fromEntries(Object.entries(workspaceCopy).map(([key, value]) => [key, value.title])) as Record<
          SkillDetailWorkspaceTab,
          string
        >}
      />
    </div>
  );
}
