import Link from "next/link";
import { useState } from "react";

import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import { formatPublicDate, type PublicLocale } from "@/src/lib/i18n/publicLocale";
import type {
  PublicSkillDetailResponse,
  PublicSkillResourceContentResponse,
  PublicSkillResourcesResponse
} from "@/src/lib/schemas/public";

import type { PublicSkillDetailModel } from "../publicSkillDetailModel";
import { buildSkillDetailOverviewModel } from "./skillDetailWorkbenchOverview";
import { SkillDetailResourceTree } from "./SkillDetailResourceTree";

export type SkillDetailWorkspaceTab = "overview" | "installation" | "skill" | "resources" | "related" | "history";

interface SkillDetailWorkbenchProps {
  activeTab: SkillDetailWorkspaceTab;
  detail: PublicSkillDetailResponse;
  locale: PublicLocale;
  messages: Pick<
    PublicMarketplaceMessages,
    | "rankingOpenSkillLabel"
    | "skillDetailContentTitle"
    | "skillDetailOverviewDescription"
    | "skillDetailOverviewTitle"
    | "skillDetailInstallDescription"
    | "skillDetailInstallTitle"
    | "skillDetailNoInstall"
    | "skillDetailNotAvailable"
    | "skillDetailNoResources"
    | "skillDetailNoVersions"
    | "skillDetailRelatedDescription"
    | "skillDetailRelatedTitle"
    | "skillDetailResourcesDescription"
    | "skillDetailResourcesTitle"
    | "skillDetailResourceDetailsToggle"
    | "skillDetailResourceTreeTitle"
    | "skillDetailSelectFile"
    | "skillDetailUnknownLanguage"
    | "skillDetailUpdatedBadgePrefix"
    | "skillDetailVersionsDescription"
    | "skillDetailVersionsTitle"
  >;
  model: PublicSkillDetailModel;
  onOpenFile: (fileName: string) => void;
  onTabChange: (nextTab: SkillDetailWorkspaceTab) => void;
  resourceContent: PublicSkillResourceContentResponse | null;
  resources: PublicSkillResourcesResponse | null;
  selectedFileName: string;
  toPublicPath: (route: string) => string;
}

const workspaceTabs: SkillDetailWorkspaceTab[] = ["overview", "installation", "skill", "resources", "related", "history"];

interface SkillDetailDocumentPreviewProps {
  content: string;
  language: string;
  locale: PublicLocale;
  title: string;
  updatedAt?: string | null;
  updatedBadgePrefix: string;
}

function SkillDetailDocumentPreview({
  content,
  language,
  locale,
  title,
  updatedAt,
  updatedBadgePrefix
}: SkillDetailDocumentPreviewProps) {
  return (
    <div className="skill-detail-preview-panel">
      <div className="skill-detail-preview-head">
        <div>
          <div className="skill-detail-preview-title">{title}</div>
          <div className="skill-detail-preview-meta">{language}</div>
        </div>
        {updatedAt ? (
          <span className="skill-detail-preview-badge">
            {updatedBadgePrefix} {formatPublicDate(updatedAt, locale)}
          </span>
        ) : null}
      </div>

      <pre className="skill-detail-preview-content">{content}</pre>
    </div>
  );
}

export function SkillDetailWorkbench({
  activeTab,
  detail,
  locale,
  messages,
  model,
  onOpenFile,
  onTabChange,
  resourceContent,
  resources,
  selectedFileName,
  toPublicPath
}: SkillDetailWorkbenchProps) {
  const selectedFile = resources?.files.find((file) => file.name === selectedFileName) || resources?.files[0] || null;
  const installMetadataRows = model.installationSteps.slice(1);
  const [resourceDetailsOpen, setResourceDetailsOpen] = useState(false);
  const overviewModel = buildSkillDetailOverviewModel({
    detail,
    resourceContent,
    resources,
    messages: {
      skillDetailContentTitle: messages.skillDetailContentTitle,
      skillDetailSelectFile: messages.skillDetailSelectFile,
      skillDetailUnknownLanguage: messages.skillDetailUnknownLanguage
    }
  });

  const headerByTab = {
    overview: {
      title: messages.skillDetailOverviewTitle,
      description: messages.skillDetailOverviewDescription
    },
    installation: {
      title: messages.skillDetailInstallTitle,
      description: messages.skillDetailInstallDescription
    },
    skill: {
      title: messages.skillDetailContentTitle,
      description: ""
    },
    resources: {
      title: messages.skillDetailResourcesTitle,
      description: messages.skillDetailResourcesDescription
    },
    history: {
      title: messages.skillDetailVersionsTitle,
      description: messages.skillDetailVersionsDescription
    },
    related: {
      title: messages.skillDetailRelatedTitle,
      description: messages.skillDetailRelatedDescription
    }
  } satisfies Record<SkillDetailWorkspaceTab, { title: string; description: string }>;

  const tabLabelByKey = {
    overview: "skill-detail-tab-overview",
    installation: "skill-detail-tab-installation",
    skill: "skill-detail-tab-skill",
    resources: "skill-detail-tab-resources",
    history: "skill-detail-tab-history",
    related: "skill-detail-tab-related"
  } satisfies Record<SkillDetailWorkspaceTab, string>;

  const panelIdByKey = {
    overview: "skill-detail-panel-overview",
    installation: "skill-detail-panel-installation",
    skill: "skill-detail-panel-skill",
    resources: "skill-detail-panel-resources",
    history: "skill-detail-panel-history",
    related: "skill-detail-panel-related"
  } satisfies Record<SkillDetailWorkspaceTab, string>;

  return (
    <section
      className="marketplace-section-card skill-detail-workbench-card"
      data-testid="skill-detail-resource-workbench"
    >
      <div className="skill-detail-workbench-head">
        <div className="marketplace-section-header">
          <h2>{headerByTab[activeTab].title}</h2>
          {headerByTab[activeTab].description ? <p>{headerByTab[activeTab].description}</p> : null}
        </div>

        <div className="skill-detail-tab-list" role="tablist" aria-label={headerByTab[activeTab].title}>
          {workspaceTabs.map((tab) => (
            <button
              key={tab}
              id={tabLabelByKey[tab]}
              type="button"
              role="tab"
              className={`skill-detail-tab-button${activeTab === tab ? " is-active" : ""}`}
              aria-selected={activeTab === tab}
              aria-controls={panelIdByKey[tab]}
              tabIndex={activeTab === tab ? 0 : -1}
              onClick={() => onTabChange(tab)}
            >
              {headerByTab[tab].title}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" ? (
        <div
          id={panelIdByKey.overview}
          className="skill-detail-workbench-panel"
          role="tabpanel"
          aria-labelledby={tabLabelByKey.overview}
        >
          <div className="skill-detail-overview-shell">
            <section className="skill-detail-preview-panel skill-detail-overview-card" aria-label={messages.skillDetailOverviewTitle}>
              <div className="skill-detail-preview-head">
                <div>
                  <div className="skill-detail-preview-title">{messages.skillDetailOverviewTitle}</div>
                  <div className="skill-detail-preview-meta">{messages.skillDetailOverviewDescription}</div>
                </div>
              </div>

              <div className="skill-detail-overview-summary">
                <p className="skill-detail-panel-copy">{overviewModel.summary}</p>
              </div>
            </section>

            <SkillDetailDocumentPreview
              content={overviewModel.previewContent}
              language={overviewModel.previewLanguage}
              locale={locale}
              title={overviewModel.previewTitle}
              updatedAt={overviewModel.previewUpdatedAt}
              updatedBadgePrefix={messages.skillDetailUpdatedBadgePrefix}
            />
          </div>
        </div>
      ) : null}

      {activeTab === "installation" ? (
        <div
          id={panelIdByKey.installation}
          className="skill-detail-workbench-panel"
          role="tabpanel"
          aria-labelledby={tabLabelByKey.installation}
        >
          <div className="skill-detail-content-panel skill-detail-install-command-panel">
            <div className="skill-detail-content-head">
              <h3>{model.installationSteps[0]?.label || messages.skillDetailInstallTitle}</h3>
            </div>
            <pre className="skill-detail-content-preview">{detail.skill.install_command || model.installationSteps[0]?.value}</pre>
          </div>

          {installMetadataRows.length > 0 ? (
            <div className="skill-detail-install-list">
              {installMetadataRows.map((item) => (
                <div key={`${item.label}-${item.value}`} className="skill-detail-install-row">
                  <div className="skill-detail-install-row-copy">
                    <span className="skill-detail-install-label">{item.label}</span>
                    {item.description ? <p className="skill-detail-install-help">{item.description}</p> : null}
                  </div>
                  <span className="skill-detail-install-value">{item.value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {activeTab === "skill" ? (
        <div
          id={panelIdByKey.skill}
          className="skill-detail-workbench-panel"
          role="tabpanel"
          aria-labelledby={tabLabelByKey.skill}
        >
          <SkillDetailDocumentPreview
            content={resourceContent?.content || detail.skill.content || messages.skillDetailSelectFile}
            language={resourceContent?.language || selectedFile?.language || messages.skillDetailUnknownLanguage}
            locale={locale}
            title={resourceContent?.display_name || selectedFile?.display_name || messages.skillDetailContentTitle}
            updatedAt={resourceContent?.updated_at}
            updatedBadgePrefix={messages.skillDetailUpdatedBadgePrefix}
          />
        </div>
      ) : null}

      {activeTab === "resources" ? (
        <div
          id={panelIdByKey.resources}
          className="skill-detail-workbench-panel"
          role="tabpanel"
          aria-labelledby={tabLabelByKey.resources}
        >
          {resources?.files.length ? (
            <div className="skill-detail-resource-browser">
              <div className="skill-detail-resource-browser-head">
                <div className="marketplace-section-header">
                  <h3>{messages.skillDetailResourceTreeTitle}</h3>
                  <p>{messages.skillDetailResourcesDescription}</p>
                </div>

                <button
                  type="button"
                  className={`skill-detail-resource-details-toggle${resourceDetailsOpen ? " is-active" : ""}`}
                  onClick={() => setResourceDetailsOpen((current) => !current)}
                >
                  {messages.skillDetailResourceDetailsToggle}
                </button>
              </div>

              {resourceDetailsOpen ? (
                <div className="skill-detail-resource-facts">
                  {model.resourceInsights.map((item) => (
                    <div key={`${item.label}-${item.value}`} className="skill-detail-resource-fact">
                      <span className="skill-detail-resource-fact-label">{item.label}</span>
                      <span className="skill-detail-resource-fact-value">{item.value}</span>
                      {item.description ? <p className="skill-detail-resource-fact-description">{item.description}</p> : null}
                    </div>
                  ))}
                </div>
              ) : null}

              <SkillDetailResourceTree
                resources={resources}
                selectedFileName={selectedFileName}
                onOpenFile={onOpenFile}
                title={messages.skillDetailResourceTreeTitle}
              />
            </div>
          ) : (
            <p className="skill-detail-empty-state">{messages.skillDetailNoResources}</p>
          )}
        </div>
      ) : null}

      {activeTab === "history" ? (
        <div
          id={panelIdByKey.history}
          className="skill-detail-workbench-panel"
          role="tabpanel"
          aria-labelledby={tabLabelByKey.history}
        >
          {model.versionHighlights.length > 0 ? (
            <div className="skill-detail-timeline">
              {model.versionHighlights.map((item) => (
                <div key={`${item.label}-${item.value}`} className="skill-detail-timeline-item">
                  <span className="skill-detail-timeline-dot" aria-hidden="true" />
                  <div className="skill-detail-timeline-copy">
                    <div className="skill-detail-timeline-title">{item.label}</div>
                    <div className="skill-detail-timeline-value">{item.value}</div>
                    {item.description ? <p className="skill-detail-timeline-description">{item.description}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="skill-detail-empty-state">{messages.skillDetailNoVersions}</p>
          )}
        </div>
      ) : null}

      {activeTab === "related" ? (
        <div
          id={panelIdByKey.related}
          className="skill-detail-workbench-panel"
          role="tabpanel"
          aria-labelledby={tabLabelByKey.related}
        >
          <div className="skill-detail-related-list">
            {model.relatedSkills.map((skill) => (
              <Link key={skill.id} href={toPublicPath(`/skills/${skill.id}`)} className="skill-detail-related-card">
                <div className="skill-detail-related-head">
                  <strong>{skill.name}</strong>
                  <span>{skill.qualityScore}</span>
                </div>
                <span className="skill-detail-related-meta">{skill.category}</span>
                <span className="skill-detail-related-link">{messages.rankingOpenSkillLabel}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
