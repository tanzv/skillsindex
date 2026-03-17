import type { PublicSkillDetailFileBrowserProps } from "./PublicSkillDetailPage.fileBrowser.contract";
import { SkillDetailPreviewPanel, formatSkillDetailDateLabel } from "./PublicSkillDetailPage.fileBrowser.preview";
import { resolveOverviewMetricSections, resolveResourceTabLabel } from "./PublicSkillDetailPageViewHelpers";
import { skillDetailResourceTabs } from "./PublicSkillDetailResourceTabs";
import {
  resolveSkillResourceSnapshot,
  resolveSkillVersionHistoryEntries
} from "./PublicSkillDetailPage.liveData";

type ResourceTabListProps = Pick<
  PublicSkillDetailFileBrowserProps,
  "activeResourceTab" | "onSelectResourceTab" | "text"
>;

type OverviewPanelProps = Pick<
  PublicSkillDetailFileBrowserProps,
  | "activePreset"
  | "activeSkill"
  | "detailModel"
  | "selectedFileIndex"
  | "selectedFileContent"
  | "selectedFileLanguage"
  | "selectedFileName"
  | "selectedFilePath"
  | "text"
  | "onCopyPath"
  | "onOpenSource"
>;

type InstallationPanelProps = Pick<PublicSkillDetailFileBrowserProps, "activeSkill" | "detailModel" | "text">;

type ResourcesPanelProps = Pick<
  PublicSkillDetailFileBrowserProps,
  "activeSkill" | "detailModel" | "selectedFileName" | "skillResources" | "skillResourcesLoadStatus" | "text"
>;

type RelatedPanelProps = Pick<
  PublicSkillDetailFileBrowserProps,
  "relatedSkills" | "relatedSkillsLoadStatus" | "text"
>;

type HistoryPanelProps = Pick<PublicSkillDetailFileBrowserProps, "text" | "versionItems" | "versionItemsLoadStatus">;

function renderPanelFact(label: string, value: string, emptyValue = "N/A") {
  return (
    <div className="skill-detail-resource-fact">
      <span className="skill-detail-resource-fact-label">{label}</span>
      <span className="skill-detail-resource-fact-value">{String(value || "").trim() || emptyValue}</span>
    </div>
  );
}

export function SkillDetailResourceTabList({
  activeResourceTab,
  onSelectResourceTab,
  text
}: ResourceTabListProps) {
  return (
    <div className="skill-detail-top-file-switch skill-detail-resource-tab-switch" role="tablist" aria-label="Skill detail resources">
      <div className="skill-detail-top-file-tabs skill-detail-resource-tab-list">
        {skillDetailResourceTabs.map((tabKey) => {
          const isActive = tabKey === activeResourceTab;
          return (
            <button
              key={tabKey}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-testid={`skill-detail-resource-tab-${tabKey}`}
              className={`skill-detail-top-file-button${isActive ? " is-active" : ""}`}
              onClick={() => onSelectResourceTab(tabKey)}
            >
              {resolveResourceTabLabel(text, tabKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SkillDetailOverviewPanel({
  activePreset,
  activeSkill,
  detailModel,
  selectedFileIndex,
  selectedFileContent,
  selectedFileLanguage,
  selectedFileName,
  selectedFilePath,
  text,
  onCopyPath,
  onOpenSource
}: OverviewPanelProps) {
  const overviewSections = resolveOverviewMetricSections(text, detailModel);

  return (
    <>
      <article className="skill-detail-card is-summary skill-detail-overview-panel" aria-label="Summary">
        <div className="skill-detail-card-title">
          <span className="skill-detail-title-dot" />
          <span>{text.tabOverview}</span>
        </div>
        {detailModel.summaryChips.length > 0 ? (
          <div className="skill-detail-summary-badges">
            {detailModel.summaryChips.map((chip) => (
              <span key={`${chip.tone}-${chip.label}`} className={`skill-detail-chip ${chip.tone}`}>
                {chip.label}
              </span>
            ))}
          </div>
        ) : null}
        <p className="skill-detail-summary-description">{detailModel.summaryDescription}</p>
        <div className="skill-detail-overview-sections">
          {overviewSections.map((section) => (
            <section className="skill-detail-overview-section" key={section.title}>
              <h3 className="skill-detail-overview-section-title">{section.title}</h3>
              <div className="skill-detail-overview-detail-list">
                {section.entries.map((metric) => (
                  <div className="skill-detail-overview-detail-row" key={metric.label}>
                    <span className="skill-detail-overview-detail-label">{metric.label}</span>
                    <span className="skill-detail-overview-detail-value">{metric.value}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>

      <SkillDetailPreviewPanel
        activePreset={activePreset}
        activeSkill={activeSkill}
        detailModel={detailModel}
        selectedFileIndex={selectedFileIndex}
        selectedFileContent={selectedFileContent}
        selectedFileLanguage={selectedFileLanguage}
        selectedFileName={selectedFileName}
        selectedFilePath={selectedFilePath}
        text={text}
        onCopyPath={onCopyPath}
        onOpenSource={onOpenSource}
      />
    </>
  );
}

function SkillDetailInstallationPanel({ activeSkill, detailModel, text }: InstallationPanelProps) {
  return (
    <article className="skill-detail-card skill-detail-resource-panel skill-detail-installation-panel" role="tabpanel" aria-label={text.tabInstallationMethod}>
      <div className="skill-detail-resource-head">
        <div>
          <h2 className="skill-detail-resource-heading">{text.installationPanelTitle}</h2>
          <p className="skill-detail-resource-subheading">{text.installFlowHint}</p>
        </div>
      </div>
      <div className="skill-detail-installation-grid">
        <section className="skill-detail-resource-block">
          <p className="skill-detail-resource-label">{text.agentPromptTitle}</p>
          <pre className="skill-detail-resource-code">{activeSkill?.install_command || text.installCommandMissing}</pre>
        </section>
        <section className="skill-detail-resource-block">
          <p className="skill-detail-resource-label">{text.humanAudience}</p>
          <div className="skill-detail-install-steps">
            {detailModel.installSteps.map((step) => (
              <div className="skill-detail-install-step" key={step}>
                {step}
              </div>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}

function SkillDetailResourcesPanel({
  activeSkill,
  detailModel,
  skillResources,
  skillResourcesLoadStatus,
  selectedFileName,
  text
}: ResourcesPanelProps) {
  const snapshot = resolveSkillResourceSnapshot({
    activeSkill,
    detailModel,
    selectedFileName,
    resources: skillResources
  });

  return (
    <article className="skill-detail-card skill-detail-resource-panel skill-detail-resources-panel" role="tabpanel" aria-label={text.tabResources}>
      <div className="skill-detail-resource-head">
        <div>
          <h2 className="skill-detail-resource-heading">{text.resourcesPanelTitle}</h2>
          <p className="skill-detail-resource-subheading">{text.metadataTitle}</p>
        </div>
      </div>
      {skillResourcesLoadStatus === "loading" ? <p className="skill-detail-empty-state">Loading resource metadata</p> : null}
      {skillResourcesLoadStatus === "error" && !skillResources ? (
        <p className="skill-detail-empty-state">Resource metadata is unavailable</p>
      ) : null}
      <div className="skill-detail-resource-facts">
        {renderPanelFact(text.sourceUrlLabel, snapshot.sourceUrl)}
        {renderPanelFact(text.repositoryLabel, snapshot.repository)}
        {renderPanelFact("Source Branch", snapshot.sourceBranch)}
        {renderPanelFact("Source Path", snapshot.sourcePath)}
        {renderPanelFact(text.selectedFileLabel, snapshot.selectedFile)}
        {renderPanelFact(text.updatedAtLabel, formatSkillDetailDateLabel(snapshot.updatedAt))}
        {renderPanelFact(text.typeLabel, snapshot.sourceType)}
        {renderPanelFact(text.fileCountLabel, snapshot.fileCount)}
      </div>
    </article>
  );
}

function SkillDetailRelatedPanel({ relatedSkills, relatedSkillsLoadStatus, text }: RelatedPanelProps) {
  return (
    <article className="skill-detail-card skill-detail-resource-panel skill-detail-related-panel" role="tabpanel" aria-label={text.tabRelatedSkills}>
      <div className="skill-detail-resource-head">
        <div>
          <h2 className="skill-detail-resource-heading">{text.tabRelatedSkills}</h2>
          <p className="skill-detail-resource-subheading">{text.resourcesPanelTitle}</p>
        </div>
      </div>
      {relatedSkillsLoadStatus === "loading" ? <p className="skill-detail-empty-state">{text.relatedSkillsLoading}</p> : null}
      {relatedSkillsLoadStatus !== "loading" && relatedSkills.length === 0 ? (
        <p className="skill-detail-empty-state">{text.relatedSkillsEmpty}</p>
      ) : null}
      {relatedSkills.length > 0 ? (
        <div className="skill-detail-related-grid">
          {relatedSkills.map((relatedSkill) => (
            <article className="skill-detail-related-card" key={relatedSkill.id}>
              <div className="skill-detail-related-card-head">
                <h3 className="skill-detail-related-card-title">{relatedSkill.name}</h3>
                <span className="skill-detail-related-card-stars">★ {relatedSkill.star_count}</span>
              </div>
              <p className="skill-detail-related-card-description">{relatedSkill.description}</p>
              <p className="skill-detail-related-card-meta">{relatedSkill.category} · {relatedSkill.subcategory}</p>
            </article>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function SkillDetailHistoryPanel({ text, versionItems, versionItemsLoadStatus }: HistoryPanelProps) {
  const historyEntries = resolveSkillVersionHistoryEntries(versionItems);
  const historySubheading =
    historyEntries.length > 0 ? "Captured versions from public sync records" : text.versionHistorySourceNote;

  return (
    <article className="skill-detail-card skill-detail-resource-panel skill-detail-history-panel" role="tabpanel" aria-label={text.tabVersionHistory}>
      <div className="skill-detail-resource-head">
        <div>
          <h2 className="skill-detail-resource-heading">{text.tabVersionHistory}</h2>
          <p className="skill-detail-resource-subheading">{historySubheading}</p>
        </div>
      </div>
      {versionItemsLoadStatus === "loading" ? <p className="skill-detail-empty-state">Loading version history</p> : null}
      {versionItemsLoadStatus !== "loading" && historyEntries.length === 0 ? (
        <p className="skill-detail-empty-state">{text.versionHistoryEmpty}</p>
      ) : null}
      {historyEntries.length > 0 ? (
        <div className="skill-detail-history-list">
          {historyEntries.map((entry) => (
            <div className="skill-detail-history-item" key={entry.id}>
              <div className="skill-detail-history-dot" aria-hidden="true" />
              <div className="skill-detail-history-content">
                <p className="skill-detail-history-date">{formatSkillDetailDateLabel(entry.capturedAt)}</p>
                <p className="skill-detail-history-text">
                  {entry.versionLabel} · {entry.trigger || "manual"} · {entry.riskLevel || "unknown"}
                </p>
                <p className="skill-detail-history-text">{entry.summary || "No summary available"}</p>
                <p className="skill-detail-history-text">Actor: {entry.actor || "system"}</p>
                {entry.changedFields ? <p className="skill-detail-history-text">Changed Fields: {entry.changedFields}</p> : null}
                {entry.tags ? <p className="skill-detail-history-text">Tags: {entry.tags}</p> : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function SkillDetailActiveResourcePanel(props: PublicSkillDetailFileBrowserProps) {
  const { activeResourceTab } = props;

  if (activeResourceTab === "overview") {
    return <SkillDetailOverviewPanel {...props} />;
  }

  if (activeResourceTab === "installation") {
    return <SkillDetailInstallationPanel {...props} />;
  }

  if (activeResourceTab === "skill") {
    return <SkillDetailPreviewPanel {...props} panelClassName="skill-detail-skill-panel" />;
  }

  if (activeResourceTab === "resources") {
    return <SkillDetailResourcesPanel {...props} />;
  }

  if (activeResourceTab === "related") {
    return <SkillDetailRelatedPanel {...props} />;
  }

  if (activeResourceTab === "history") {
    return <SkillDetailHistoryPanel {...props} />;
  }

  return null;
}
