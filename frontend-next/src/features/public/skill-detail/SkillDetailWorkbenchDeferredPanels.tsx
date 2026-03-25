import type { ReactNode } from "react";

import { TabsContent } from "@/src/components/ui/tabs";
import { PublicLink } from "@/src/components/shared/PublicLink";

import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import { formatPublicDate, type PublicLocale } from "@/src/lib/i18n/publicLocale";
import type {
  PublicSkillDetailResponse,
  PublicSkillResourceContentResponse,
  PublicSkillResourcesResponse
} from "@/src/lib/schemas/public";

import type { PublicSkillDetailModel } from "../publicSkillDetailModel";
import { SkillDetailPreviewStage } from "./SkillDetailPreviewStage";
import { SkillDetailResourceTree } from "./SkillDetailResourceTree";
import {
  buildSkillDetailWorkspaceCopy,
  skillDetailWorkspacePanelIdByKey,
  skillDetailWorkspaceTabIdByKey,
  type SkillDetailWorkspaceTab
} from "./skillDetailWorkspaceConfig";

interface SkillDetailWorkbenchDeferredPanelsProps {
  activeTab: Exclude<SkillDetailWorkspaceTab, "overview">;
  detail: PublicSkillDetailResponse;
  locale: PublicLocale;
  messages: Pick<
    PublicMarketplaceMessages,
    | "rankingOpenSkillLabel"
    | "skillDetailContentTitle"
    | "skillDetailInstallDescription"
    | "skillDetailInstallTitle"
    | "skillDetailNoResources"
    | "skillDetailNoVersions"
    | "skillDetailOverviewDescription"
    | "skillDetailOverviewTitle"
    | "skillDetailRelatedDescription"
    | "skillDetailRelatedTitle"
    | "skillDetailResourcesDescription"
    | "skillDetailResourcesTitle"
    | "skillDetailSourceAnalysisTitle"
    | "skillDetailSourceDependenciesLabel"
    | "skillDetailSourceEntryFileLabel"
    | "skillDetailSourceMechanismLabel"
    | "skillDetailSourceMetadataSourcesLabel"
    | "skillDetailSourceNoDependencies"
    | "skillDetailSourceNoMetadataSources"
    | "skillDetailSourceNoReferencePaths"
    | "skillDetailSourceReferencePathsLabel"
    | "skillDetailNotAvailable"
    | "skillDetailSelectFile"
    | "skillDetailUnknownLanguage"
    | "skillDetailUpdatedBadgePrefix"
    | "skillDetailVersionsDescription"
    | "skillDetailVersionsTitle"
  >;
  model: PublicSkillDetailModel;
  onOpenFile: (fileName: string) => void;
  resourceContent: PublicSkillResourceContentResponse | null;
  resourcesPending?: boolean;
  resources: PublicSkillResourcesResponse | null;
  selectedFileName: string;
  versionsPending?: boolean;
}

type SourceAnalysisDependency = NonNullable<PublicSkillResourcesResponse["dependencies"]>[number];

function normalizePublicSkillLookupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildPublicSkillHrefResolver(detail: PublicSkillDetailResponse): (value: string) => string | undefined {
  const hrefByKey = new Map<string, string>();
  const visibleSkills = [detail.skill, ...(detail.related_skills || [])];

  visibleSkills.forEach((skill) => {
    const href = `/skills/${skill.id}`;

    [String(skill.id), skill.name].forEach((candidate) => {
      const normalized = normalizePublicSkillLookupKey(candidate);
      if (normalized && !hrefByKey.has(normalized)) {
        hrefByKey.set(normalized, href);
      }
    });
  });

  return (value: string) => {
    const normalized = normalizePublicSkillLookupKey(value);
    if (!normalized) {
      return undefined;
    }

    return hrefByKey.get(normalized);
  };
}

function hasSourceAnalysis(resources: PublicSkillResourcesResponse | null): boolean {
  return Boolean(
    resources?.entry_file ||
      resources?.mechanism ||
      resources?.metadata_sources?.length ||
      resources?.reference_paths?.length ||
      resources?.dependencies?.length
  );
}

function renderSourceAnalysisValue(value: string, href?: string, key?: string): ReactNode {
  if (href) {
    return (
      <PublicLink key={key || value} href={href} className="skill-detail-source-analysis-link">
        {value}
      </PublicLink>
    );
  }

  return (
    <span key={key || value} className="skill-detail-source-analysis-value">
      {value}
    </span>
  );
}

function renderSourceAnalysisList(values: string[], emptyValue: string): ReactNode {
  if (!values.length) {
    return <span className="skill-detail-source-analysis-empty">{emptyValue}</span>;
  }

  return values.map((value) => renderSourceAnalysisValue(value, undefined, value));
}

function renderDependencyList(
  dependencies: SourceAnalysisDependency[],
  emptyValue: string,
  resolvePublicSkillHref: (value: string) => string | undefined
): ReactNode {
  if (!dependencies.length) {
    return <span className="skill-detail-source-analysis-empty">{emptyValue}</span>;
  }

  return dependencies.map((dependency, index) => {
    const target = dependency.target || emptyValue;
    const href = dependency.kind === "skill" ? resolvePublicSkillHref(target) : undefined;

    return (
      <div key={`${dependency.kind}-${target}-${index}`} className="skill-detail-source-analysis-pill">
        <span className="skill-detail-source-analysis-pill-label">{dependency.kind}</span>
        {renderSourceAnalysisValue(target, href, `${dependency.kind}-${target}-${index}`)}
      </div>
    );
  });
}

function SkillDetailSourceAnalysisPanel({
  detail,
  messages,
  resources
}: {
  detail: PublicSkillDetailResponse;
  messages: Pick<
    PublicMarketplaceMessages,
    | "skillDetailNotAvailable"
    | "skillDetailSourceAnalysisTitle"
    | "skillDetailSourceDependenciesLabel"
    | "skillDetailSourceEntryFileLabel"
    | "skillDetailSourceMechanismLabel"
    | "skillDetailSourceMetadataSourcesLabel"
    | "skillDetailSourceNoDependencies"
    | "skillDetailSourceNoMetadataSources"
    | "skillDetailSourceNoReferencePaths"
    | "skillDetailSourceReferencePathsLabel"
  >;
  resources: PublicSkillResourcesResponse;
}) {
  const resolvePublicSkillHref = buildPublicSkillHrefResolver(detail);

  return (
    <section className="skill-detail-source-analysis-card" data-testid="skill-detail-source-analysis">
      <div className="skill-detail-source-analysis-title">{messages.skillDetailSourceAnalysisTitle}</div>
      <div className="skill-detail-source-analysis-summary">
        <div className="skill-detail-source-analysis-summary-item">
          <span className="skill-detail-source-analysis-label">{messages.skillDetailSourceEntryFileLabel}</span>
          <span className="skill-detail-source-analysis-value">
            {resources.entry_file || messages.skillDetailNotAvailable}
          </span>
        </div>
        <div className="skill-detail-source-analysis-summary-item">
          <span className="skill-detail-source-analysis-label">{messages.skillDetailSourceMechanismLabel}</span>
          <span className="skill-detail-source-analysis-value">
            {resources.mechanism || messages.skillDetailNotAvailable}
          </span>
        </div>
      </div>
      <div className="skill-detail-source-analysis-grid">
        <div className="skill-detail-source-analysis-section">
          <span className="skill-detail-source-analysis-label">{messages.skillDetailSourceMetadataSourcesLabel}</span>
          <div className="skill-detail-source-analysis-values">
            {renderSourceAnalysisList(resources.metadata_sources || [], messages.skillDetailSourceNoMetadataSources)}
          </div>
        </div>
        <div className="skill-detail-source-analysis-section">
          <span className="skill-detail-source-analysis-label">{messages.skillDetailSourceReferencePathsLabel}</span>
          <div className="skill-detail-source-analysis-values">
            {renderSourceAnalysisList(resources.reference_paths || [], messages.skillDetailSourceNoReferencePaths)}
          </div>
        </div>
        <div className="skill-detail-source-analysis-section">
          <span className="skill-detail-source-analysis-label">{messages.skillDetailSourceDependenciesLabel}</span>
          <div className="skill-detail-source-analysis-values">
            {renderDependencyList(
              resources.dependencies || [],
              messages.skillDetailSourceNoDependencies,
              resolvePublicSkillHref
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

interface SkillDetailDocumentPreviewProps {
  className?: string;
  content: string;
  language: string;
  locale: PublicLocale;
  title: string;
  updatedAt?: string | null;
  updatedBadgePrefix: string;
}

function SkillDetailDocumentPreview({
  className,
  content,
  language,
  locale,
  title,
  updatedAt,
  updatedBadgePrefix
}: SkillDetailDocumentPreviewProps) {
  return (
    <SkillDetailPreviewStage
      badge={updatedAt ? `${updatedBadgePrefix} ${formatPublicDate(updatedAt, locale)}` : undefined}
      className={className}
      meta={language}
      title={title}
    >
      <pre className="skill-detail-preview-content">{content}</pre>
    </SkillDetailPreviewStage>
  );
}

function SkillWorkbenchPanel({
  activeTab,
  children,
  tab
}: {
  activeTab: SkillDetailWorkspaceTab;
  children: ReactNode;
  tab: SkillDetailWorkspaceTab;
}) {
  return (
    <TabsContent
      value={tab}
      activeValue={activeTab}
      panelId={skillDetailWorkspacePanelIdByKey[tab]}
      labelledBy={skillDetailWorkspaceTabIdByKey[tab]}
      className="skill-detail-workbench-panel"
    >
      {children}
    </TabsContent>
  );
}

function SkillDetailResourceLoadingSkeleton() {
  return (
    <div className="skill-detail-loading-shell skill-detail-loading-resource-shell" aria-hidden="true">
      <div className="skill-detail-loading-tree">
        <span className="skill-detail-loading-line is-strong" />
        <span className="skill-detail-loading-line" />
        <span className="skill-detail-loading-line is-short" />
        <span className="skill-detail-loading-line" />
      </div>
      <div className="skill-detail-loading-preview">
        <span className="skill-detail-loading-line is-strong" />
        <span className="skill-detail-loading-line" />
        <span className="skill-detail-loading-line" />
        <span className="skill-detail-loading-line is-short" />
      </div>
    </div>
  );
}

function SkillDetailHistoryLoadingSkeleton() {
  return (
    <div className="skill-detail-loading-shell skill-detail-loading-timeline" aria-hidden="true">
      <div className="skill-detail-loading-timeline-row">
        <span className="skill-detail-loading-dot" />
        <div className="skill-detail-loading-copy">
          <span className="skill-detail-loading-line is-strong" />
          <span className="skill-detail-loading-line" />
        </div>
      </div>
      <div className="skill-detail-loading-timeline-row">
        <span className="skill-detail-loading-dot" />
        <div className="skill-detail-loading-copy">
          <span className="skill-detail-loading-line is-strong" />
          <span className="skill-detail-loading-line is-short" />
        </div>
      </div>
      <div className="skill-detail-loading-timeline-row">
        <span className="skill-detail-loading-dot" />
        <div className="skill-detail-loading-copy">
          <span className="skill-detail-loading-line" />
          <span className="skill-detail-loading-line" />
        </div>
      </div>
    </div>
  );
}

export function SkillDetailWorkbenchDeferredPanels({
  activeTab,
  detail,
  locale,
  messages,
  model,
  onOpenFile,
  resourceContent,
  resourcesPending = false,
  resources,
  selectedFileName,
  versionsPending = false
}: SkillDetailWorkbenchDeferredPanelsProps) {
  const selectedFile = resources?.files.find((file) => file.name === selectedFileName) || null;
  const fallbackFile = selectedFile || resources?.files[0] || null;
  const installMetadataRows = model.installationSteps.slice(1);
  const resourceTableTitle = "Name";
  const headerByTab = buildSkillDetailWorkspaceCopy(messages);
  const selectedFileDisplayName =
    selectedFile?.display_name || selectedFileName.split("/").filter(Boolean).pop() || selectedFileName;

  return (
    <>
      <SkillWorkbenchPanel activeTab={activeTab} tab="installation">
        <SkillDetailPreviewStage
          className="skill-detail-install-command-panel"
          meta={headerByTab.installation.description}
          title={model.installationSteps[0]?.label || headerByTab.installation.title}
        >
          <pre className="skill-detail-content-preview">{detail.skill.install_command || model.installationSteps[0]?.value}</pre>
        </SkillDetailPreviewStage>

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
      </SkillWorkbenchPanel>

      <SkillWorkbenchPanel activeTab={activeTab} tab="skill">
        <SkillDetailDocumentPreview
          content={resourceContent?.content || detail.skill.content || messages.skillDetailSelectFile}
          language={resourceContent?.language || fallbackFile?.language || messages.skillDetailUnknownLanguage}
          locale={locale}
          title={selectedFileDisplayName || resourceContent?.display_name || fallbackFile?.display_name || messages.skillDetailContentTitle}
          updatedAt={resourceContent?.updated_at}
          updatedBadgePrefix={messages.skillDetailUpdatedBadgePrefix}
        />
      </SkillWorkbenchPanel>

      <SkillWorkbenchPanel activeTab={activeTab} tab="resources">
        {resourcesPending ? (
          <SkillDetailResourceLoadingSkeleton />
        ) : resources?.files.length ? (
          <div className="skill-detail-resource-stack">
            {hasSourceAnalysis(resources) ? (
              <SkillDetailSourceAnalysisPanel detail={detail} messages={messages} resources={resources} />
            ) : null}
            <div className="skill-detail-resource-browser">
              <SkillDetailResourceTree
                resources={resources}
                selectedFileName={selectedFileName}
                onOpenFile={onOpenFile}
                title={resourceTableTitle}
              />
              <SkillDetailDocumentPreview
                className="skill-detail-resource-preview-stage"
                content={resourceContent?.content || messages.skillDetailSelectFile}
                language={resourceContent?.language || fallbackFile?.language || messages.skillDetailUnknownLanguage}
                locale={locale}
                title={selectedFileDisplayName || fallbackFile?.display_name || headerByTab.resources.title}
                updatedAt={resourceContent?.updated_at}
                updatedBadgePrefix={messages.skillDetailUpdatedBadgePrefix}
              />
            </div>
          </div>
        ) : (
          <p className="skill-detail-empty-state">{messages.skillDetailNoResources}</p>
        )}
      </SkillWorkbenchPanel>

      <SkillWorkbenchPanel activeTab={activeTab} tab="history">
        {versionsPending ? (
          <SkillDetailHistoryLoadingSkeleton />
        ) : model.versionHighlights.length > 0 ? (
          <SkillDetailPreviewStage meta={headerByTab.history.description} title={headerByTab.history.title}>
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
          </SkillDetailPreviewStage>
        ) : (
          <p className="skill-detail-empty-state">{messages.skillDetailNoVersions}</p>
        )}
      </SkillWorkbenchPanel>

      <SkillWorkbenchPanel activeTab={activeTab} tab="related">
        <SkillDetailPreviewStage meta={headerByTab.related.description} title={headerByTab.related.title}>
          <div className="skill-detail-related-list">
            {model.relatedSkills.map((skill) => (
              <PublicLink key={skill.id} href={`/skills/${skill.id}`} className="skill-detail-related-card">
                <div className="skill-detail-related-head">
                  <strong>{skill.name}</strong>
                  <span>{skill.qualityScore}</span>
                </div>
                <span className="skill-detail-related-meta">{skill.category}</span>
                <span className="skill-detail-related-link">{messages.rankingOpenSkillLabel}</span>
              </PublicLink>
            ))}
          </div>
        </SkillDetailPreviewStage>
      </SkillWorkbenchPanel>
    </>
  );
}
