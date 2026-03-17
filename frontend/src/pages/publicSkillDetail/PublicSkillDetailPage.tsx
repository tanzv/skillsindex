import { useEffect, useState } from "react";

import type { AppLocale } from "../../lib/i18n";
import type { SessionUser } from "../../lib/api";
import type { ThemeMode } from "../../lib/themeModePath";
import MarketplaceHomeLocaleThemeSwitch from "../marketplaceHome/MarketplaceHomeLocaleThemeSwitch";
import MarketplacePublicPageShell from "../marketplacePublic/MarketplacePublicPageShell";
import PublicSkillDetailFileBrowser from "./PublicSkillDetailPage.fileBrowser";
import PublicSkillDetailInteractionPanel from "./PublicSkillDetailPage.interactionPanel";
import PublicSkillDetailPageStyles from "./PublicSkillDetailPage.styles";
import MarketplaceTopbar from "../marketplacePublic/MarketplaceTopbar";
import PublicSkillDetailBreadcrumb from "./PublicSkillDetailBreadcrumb";
import { resolveTopSummaryEntries } from "./PublicSkillDetailPageViewHelpers";
import { usePublicSkillDetailController } from "./usePublicSkillDetailController";

interface PublicSkillDetailPageProps {
  locale: AppLocale;
  skillID: number;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
  onLogout?: () => Promise<void> | void;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
}

export default function PublicSkillDetailPage({
  locale,
  skillID,
  onNavigate,
  sessionUser,
  onLogout,
  onThemeModeChange,
  onLocaleChange
}: PublicSkillDetailPageProps) {
  const {
    text,
    routeNavigator,
    lightMode,
    loadStatus,
    error,
    activeSkill,
    activePreset,
    activeResourceTab,
    selectedFileIndex,
    selectedFileContent,
    selectedFileLanguage,
    selectedFileName,
    selectedFilePath,
    selectedPresetLabel,
    detailModel,
    comments,
    commentDraft,
    commentComposerRef,
    feedbackMessage,
    interactionBusy,
    selectedRating,
    viewerState,
    activeSkillDisplayName,
    topMetaEntries,
    topbarThemeMode,
    topbarBrandTitle,
    topbarBrandSubtitle,
    topbarActionBundle,
    topbarRightRegistrations,
    skillResources,
    skillResourcesLoadStatus,
    versionItems,
    versionItemsLoadStatus,
    relatedSkills,
    relatedSkillsLoadStatus,
    setActiveResourceTab,
    setCommentDraft,
    setSelectedRating,
    handleCopyCommand,
    handleCopyAgentPrompt,
    handleCopyPath,
    handleOpenSource,
    handleDeleteComment,
    handleSubmitComment,
    handleSubmitRating,
    handleToggleFavorite,
    handleViewInstallationDetails,
    handleViewResourceDetails,
    handleSelectFileFromTree
  } = usePublicSkillDetailController({
    locale,
    skillID,
    onNavigate,
    sessionUser,
    onLogout
  });

  const currentPath = window.location.pathname;
  const isMobileRoute = /^\/mobile(\/|$)/.test(currentPath);
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }));
  const isCompactLayout = viewport.width <= 900 && viewport.height >= 500;
  const isMobileLayout = isCompactLayout || isMobileRoute;
  const pageRootClassName = `marketplace-home skill-detail-page${lightMode ? " is-light is-light-theme" : ""}${isMobileLayout ? " is-mobile" : ""}${locale === "zh" ? " is-locale-zh" : " is-locale-en"}`;
  const topSummaryEntries = resolveTopSummaryEntries(detailModel);

  useEffect(() => {
    function handleResize() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <MarketplacePublicPageShell
      isMobileLayout={isMobileLayout}
      isLightTheme={lightMode}
      stageTestId="skill-detail-stage"
      stageClassName="skill-detail-stage"
      rootClassName={pageRootClassName}
      rootTestId="skill-detail-page"
    >
      <PublicSkillDetailPageStyles />
      <MarketplaceTopbar
        shellClassName="animated-fade-down"
        dataAnimated
        brandTitle={topbarBrandTitle}
        brandSubtitle={topbarBrandSubtitle}
        onBrandClick={() => onNavigate(routeNavigator.toPublic("/"))}
        isLightTheme={lightMode}
        primaryActions={topbarActionBundle.primaryActions}
        utilityActions={topbarActionBundle.utilityActions}
        rightRegistrations={topbarRightRegistrations}
        localeThemeSwitch={
          <MarketplaceHomeLocaleThemeSwitch
            locale={locale}
            currentThemeMode={topbarThemeMode}
            onThemeModeChange={onThemeModeChange}
            onLocaleChange={onLocaleChange}
          />
        }
      />
      <header className="skill-detail-top">
        <div className="skill-detail-top-layout">
          <div className="skill-detail-title-group">
            <PublicSkillDetailBreadcrumb
              rootLabel={text.breadcrumbRoot}
              skillLabel={activeSkillDisplayName}
              currentLabel={selectedPresetLabel}
              onNavigateRoot={() => onNavigate(routeNavigator.toPublic("/"))}
              onNavigateSkill={() => onNavigate(routeNavigator.toPublic(`/skills/${skillID}`))}
            />
            <h1 className="skill-detail-title">{activeSkillDisplayName}</h1>
            <p className="skill-detail-title-description">{detailModel.summaryDescription}</p>
            <div className="skill-detail-meta-strip" aria-label="skill detail metadata">
              {topMetaEntries.map((entry) => (
                <span key={entry.key} className={`skill-detail-meta-chip ${entry.tone}`}>
                  {entry.value}
                </span>
              ))}
            </div>
          </div>
          {loadStatus === "ready" && activeSkill && topSummaryEntries.length > 0 ? (
            <div className="skill-detail-top-aside">
              <div className="skill-detail-top-summary" aria-label={text.summaryTitle}>
                {topSummaryEntries.map((entry) => (
                  <div key={`${entry.label}-${entry.value}`} className="skill-detail-top-summary-card">
                    <span className="skill-detail-top-summary-label">{entry.label}</span>
                    <span className="skill-detail-top-summary-value">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </header>
      {loadStatus === "loading" ? <div className="skill-detail-loading">{text.loading}</div> : null}
      {loadStatus === "error" ? <div className="skill-detail-error">{error || text.loadError}</div> : null}
      {loadStatus === "not_found" ? <div className="skill-detail-empty">{text.notFound}</div> : null}
      {loadStatus === "ready" && activeSkill ? (
        <main className="skill-detail-main">
          <PublicSkillDetailFileBrowser
            activePreset={activePreset}
            activeResourceTab={activeResourceTab}
            activeSkill={activeSkill}
            detailModel={detailModel}
            skillResources={skillResources}
            skillResourcesLoadStatus={skillResourcesLoadStatus}
            versionItems={versionItems}
            versionItemsLoadStatus={versionItemsLoadStatus}
            relatedSkills={relatedSkills}
            relatedSkillsLoadStatus={relatedSkillsLoadStatus}
            selectedFileIndex={selectedFileIndex}
            selectedFileContent={selectedFileContent}
            selectedFileLanguage={selectedFileLanguage}
            selectedFileName={selectedFileName}
            selectedFilePath={selectedFilePath}
            text={text}
            onCopyPath={handleCopyPath}
            onOpenSource={handleOpenSource}
            onSelectResourceTab={setActiveResourceTab}
          />
          <PublicSkillDetailInteractionPanel
            activeSkill={activeSkill}
            comments={comments}
            commentDraft={commentDraft}
            commentInputRef={commentComposerRef}
            detailModel={detailModel}
            feedbackMessage={feedbackMessage}
            interactionBusy={interactionBusy}
            selectedFileName={selectedFileName}
            selectedRating={selectedRating}
            text={text}
            viewerState={viewerState}
            onCommentDraftChange={setCommentDraft}
            onCopyAgentPrompt={handleCopyAgentPrompt}
            onCopyCommand={handleCopyCommand}
            onDeleteComment={handleDeleteComment}
            onOpenSource={handleOpenSource}
            onSignIn={() => onNavigate(routeNavigator.toPublic("/login"))}
            onSelectFile={handleSelectFileFromTree}
            onSelectRating={setSelectedRating}
            onSubmitComment={handleSubmitComment}
            onSubmitRating={handleSubmitRating}
            onToggleFavorite={handleToggleFavorite}
            onViewInstallationDetails={handleViewInstallationDetails}
            onViewResourceDetails={handleViewResourceDetails}
          />
        </main>
      ) : null}
    </MarketplacePublicPageShell>
  );
}
