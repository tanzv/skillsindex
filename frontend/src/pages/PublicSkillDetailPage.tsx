import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import {
  MarketplaceSkill,
  PublicSkillDetailComment,
  PublicSkillDetailResponse,
  SessionUser,
  createSkillComment,
  deleteSkillComment,
  fetchPublicSkillDetail,
  setSkillFavorite,
  submitSkillRating
} from "../lib/api";
import { AppLocale } from "../lib/i18n";
import type { ThemeMode } from "../lib/themeModePath";
import { buildMarketplaceTopbarActionBundle } from "./MarketplaceHomePage.lightTopbar";
import MarketplaceHomeLocaleThemeSwitch from "./MarketplaceHomeLocaleThemeSwitch";
import { marketplaceHomeCopy } from "./MarketplaceHomePage.copy";
import { buildMarketplaceWorkspaceAccessRightRegistrations } from "./MarketplaceTopbarRightRegistrations";
import { publicSkillDetailCopy } from "./PublicSkillDetailPage.copy";
import PublicSkillDetailFileBrowser from "./PublicSkillDetailPage.fileBrowser";
import PublicSkillDetailInteractionPanel from "./PublicSkillDetailPage.interactionPanel";
import {
  buildInteractionSnapshot,
  defaultSkillInteractionStats,
  defaultSkillViewerState,
  isCommentDraftValid,
  normalizeRatingScore
} from "./PublicSkillDetailPage.interaction";
import {
  SkillDetailDataMode,
  SkillDetailPresetKey,
  buildPrototypeSkillDetailSkill,
  buildSkillDetailViewModel,
  resolveFileIndexForPreset,
  resolvePresetForFileName,
  resolveSkillDetailDataMode
} from "./PublicSkillDetailPage.helpers";
import {
  buildSkillFilePath,
  copyInstallCommand,
  copySkillFilePath,
  openSkillSource
} from "./publicSkillDetail/PublicSkillDetailInstallActions";
import {
  deleteCommentInteraction,
  submitCommentInteraction,
  submitRatingInteraction,
  toggleFavoriteInteraction
} from "./publicSkillDetail/PublicSkillDetailInteractionActions";
import {
  resolveFilePresetLabel,
  resolveInteractionFeedbackMessage
} from "./publicSkillDetail/PublicSkillDetailPageViewHelpers";
import PublicSkillDetailBreadcrumb from "./publicSkillDetail/PublicSkillDetailBreadcrumb";
import { resolveSkillDetailLoadFailure } from "./PublicSkillDetailPage.loadState";
import type { SkillDetailLoadStatus } from "./PublicSkillDetailPage.loadState";
import PublicSkillDetailPageStyles from "./PublicSkillDetailPage.styles";
import MarketplaceTopbar from "./MarketplaceTopbar";
import { createPublicPageNavigator } from "./publicPageNavigation";
import { isLightPrototypePath } from "./prototypePageTheme";
interface PublicSkillDetailPageProps {
  locale: AppLocale;
  skillID: number;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
  onLogout?: () => Promise<void> | void;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
}
type PresetKey = SkillDetailPresetKey;
export default function PublicSkillDetailPage({
  locale,
  skillID,
  onNavigate,
  sessionUser,
  onLogout,
  onThemeModeChange,
  onLocaleChange
}: PublicSkillDetailPageProps) {
  const text = publicSkillDetailCopy[locale];
  const currentSearch = window.location.search;
  const currentPath = window.location.pathname;
  const modeOverride = useMemo(() => new URLSearchParams(currentSearch).get("skill_detail_mode") || "", [currentSearch]);
  const routeNavigator = useMemo(() => createPublicPageNavigator(currentPath), [currentPath]);
  const lightMode = isLightPrototypePath(currentPath);
  const dataMode = useMemo<SkillDetailDataMode>(
    () => resolveSkillDetailDataMode(import.meta.env.VITE_MARKETPLACE_HOME_MODE, modeOverride),
    [modeOverride]
  );
  const [skill, setSkill] = useState<MarketplaceSkill | null>(null);
  const [loadStatus, setLoadStatus] = useState<SkillDetailLoadStatus>("loading");
  const [error, setError] = useState("");
  const [activePreset, setActivePreset] = useState<PresetKey>("skill");
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [interactionBusy, setInteractionBusy] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [commentDraft, setCommentDraft] = useState("");
  const [interactionStats, setInteractionStats] = useState(defaultSkillInteractionStats);
  const [viewerState, setViewerState] = useState(defaultSkillViewerState);
  const [comments, setComments] = useState<PublicSkillDetailComment[]>([]);
  const commentComposerRef = useRef<HTMLTextAreaElement | null>(null);
  const interactionBusyLockRef = useRef(false);

  function applyInteractionSnapshot() {
    setInteractionStats(defaultSkillInteractionStats);
    setViewerState(defaultSkillViewerState);
    setComments([]);
    setSelectedRating(0);
  }

  function applyLiveDetailSnapshot(detailPayload: PublicSkillDetailResponse) {
    const snapshot = buildInteractionSnapshot(detailPayload);
    setSkill(detailPayload.skill);
    setInteractionStats(snapshot.stats);
    setViewerState(snapshot.viewerState);
    setComments(snapshot.comments);
    setSelectedRating(normalizeRatingScore(snapshot.viewerState.rating));
  }

  async function loadLiveDetail(targetSkillID: number) {
    const detailPayload = await fetchPublicSkillDetail(targetSkillID);
    applyLiveDetailSnapshot(detailPayload);
  }

  useEffect(() => {
    let active = true;
    setLoadStatus("loading");
    setError("");
    setSkill(null);
    applyInteractionSnapshot();

    if (dataMode === "prototype") {
      setSkill(buildPrototypeSkillDetailSkill(skillID));
      setLoadStatus("ready");
      return () => {
        active = false;
      };
    }

    loadLiveDetail(skillID)
      .then(() => {
        if (!active) {
          return;
        }
        setLoadStatus("ready");
      })
      .catch((loadError) => {
        if (!active) {
          return;
        }

        const resolvedFailure = resolveSkillDetailLoadFailure(loadError, text.loadError);
        if (resolvedFailure.status === "not_found") {
          setLoadStatus("not_found");
          return;
        }

        if (!active) {
          return;
        }
        setError(resolvedFailure.message);
        setLoadStatus("error");
      });

    return () => {
      active = false;
    };
  }, [dataMode, skillID, text.loadError]);

  const activeSkill = skill;
  const detailViewSkill = activeSkill || buildPrototypeSkillDetailSkill(skillID);
  const detailModel = useMemo(
    () => buildSkillDetailViewModel(detailViewSkill, locale, text, interactionStats),
    [detailViewSkill, interactionStats, locale, text]
  );

  useEffect(() => {
    if (selectedFileIndex < detailModel.fileEntries.length) {
      return;
    }
    setSelectedFileIndex(0);
  }, [detailModel.fileEntries.length, selectedFileIndex]);

  useEffect(() => {
    setSelectedFileIndex((previousIndex) => resolveFileIndexForPreset(activePreset, detailModel.fileEntries, previousIndex));
  }, [activePreset, detailModel.fileEntries]);

  function setFeedback(nextMessage: string) {
    setFeedbackMessage(nextMessage);
    window.setTimeout(() => {
      setFeedbackMessage("");
    }, 1600);
  }

  async function handleCopyCommand() {
    const status = await copyInstallCommand({
      skill: activeSkill,
      clipboard: navigator?.clipboard
    });
    if (status === "success") {
      setFeedback(text.copied);
      return;
    }
    if (status === "missing_command") {
      setFeedback(text.copyFailed);
      return;
    }
    setFeedback(text.copyFailed);
  }

  async function handleCopyPath() {
    const selectedFileName = detailModel.fileEntries[selectedFileIndex]?.name || "SKILL.md";
    const status = await copySkillFilePath({
      repositorySlug: detailModel.repositorySlug,
      selectedFileName,
      clipboard: navigator?.clipboard
    });
    if (status === "success") {
      setFeedback(text.copied);
      return;
    }
    setFeedback(text.copyFailed);
  }

  function handleOpenSource() {
    const opened = openSkillSource({
      sourceURL: activeSkill?.source_url,
      openWindow: window.open
    });
    if (opened) {
      return;
    }
    setFeedback(text.copyFailed);
  }

  async function handleInstall() {
    const status = await copyInstallCommand({
      skill: activeSkill,
      clipboard: navigator?.clipboard
    });
    if (status === "missing_command") {
      setFeedback(text.installCommandMissing);
      return;
    }
    if (status === "success") {
      setFeedback(text.installed);
      return;
    }
    setFeedback(text.copyFailed);
  }

  async function refreshLiveDetail() {
    if (dataMode !== "live") {
      return;
    }
    await loadLiveDetail(skillID);
  }

  async function handleToggleFavorite() {
    await executeBusyInteraction(async () => {
      const outcome = await toggleFavoriteInteraction({
        canInteract: viewerState.can_interact,
        interactionBusy,
        favorited: viewerState.favorited,
        skillID,
        setFavorite: setSkillFavorite,
        refreshLiveDetail
      });
      if (outcome.status === "idle") {
        return;
      }
      if (outcome.status === "blocked") {
        setFeedback(resolveInteractionFeedbackMessage(text, outcome.feedback));
        return;
      }
      if (outcome.status === "failure") {
        setFeedback(outcome.error instanceof Error ? outcome.error.message : text.loadError);
        return;
      }
      setFeedback(resolveInteractionFeedbackMessage(text, outcome.feedback));
    });
  }

  async function executeBusyInteraction(action: () => Promise<void>) {
    if (interactionBusyLockRef.current) {
      return;
    }
    interactionBusyLockRef.current = true;
    setInteractionBusy(true);
    try {
      await action();
    } finally {
      interactionBusyLockRef.current = false;
      setInteractionBusy(false);
    }
  }

  async function handleSubmitRating() {
    const ratingScore = normalizeRatingScore(selectedRating || viewerState.rating);
    await executeBusyInteraction(async () => {
      const outcome = await submitRatingInteraction({
        canInteract: viewerState.can_interact,
        interactionBusy,
        ratingScore,
        skillID,
        submitRating: submitSkillRating,
        refreshLiveDetail
      });
      if (outcome.status === "idle") {
        return;
      }
      if (outcome.status === "blocked") {
        setFeedback(resolveInteractionFeedbackMessage(text, outcome.feedback));
        return;
      }
      if (outcome.status === "failure") {
        setFeedback(outcome.error instanceof Error ? outcome.error.message : text.loadError);
        return;
      }
      setFeedback(resolveInteractionFeedbackMessage(text, outcome.feedback));
    });
  }

  async function handleSubmitComment() {
    await executeBusyInteraction(async () => {
      const outcome = await submitCommentInteraction({
        canInteract: viewerState.can_interact,
        interactionBusy,
        commentDraft,
        isCommentDraftValid,
        skillID,
        createComment: createSkillComment,
        refreshLiveDetail
      });
      if (outcome.status === "idle") {
        return;
      }
      if (outcome.status === "blocked") {
        setFeedback(resolveInteractionFeedbackMessage(text, outcome.feedback));
        return;
      }
      if (outcome.status === "failure") {
        setFeedback(outcome.error instanceof Error ? outcome.error.message : text.loadError);
        return;
      }
      setCommentDraft("");
      setFeedback(resolveInteractionFeedbackMessage(text, outcome.feedback));
    });
  }

  async function handleDeleteComment(commentID: number) {
    await executeBusyInteraction(async () => {
      const outcome = await deleteCommentInteraction({
        canInteract: viewerState.can_interact,
        interactionBusy,
        commentID,
        skillID,
        deleteComment: deleteSkillComment,
        refreshLiveDetail
      });
      if (outcome.status === "idle") {
        return;
      }
      if (outcome.status === "failure") {
        setFeedback(outcome.error instanceof Error ? outcome.error.message : text.loadError);
        return;
      }
      setFeedback(resolveInteractionFeedbackMessage(text, outcome.feedback));
    });
  }

  function handleViewChangeHistory() {
    const changelogIndex = detailModel.fileEntries.findIndex((entry) => entry.name.toLowerCase().includes("changelog"));
    setActivePreset("changelog");
    if (changelogIndex >= 0) setSelectedFileIndex(changelogIndex);
    setFeedback(text.addedCompare);
  }

  function handleSubmitFeedback() {
    if (!viewerState.can_interact) {
      onNavigate(routeNavigator.toPublic("/login"));
      return;
    }
    commentComposerRef.current?.focus();
    commentComposerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setFeedback(text.postComment);
  }

  function handleSelectFileFromTree(nextFileIndex: number) {
    const targetEntry = detailModel.fileEntries[nextFileIndex];
    if (!targetEntry) return;
    setActivePreset(resolvePresetForFileName(targetEntry.name));
    setSelectedFileIndex(nextFileIndex);
  }
  const selectedFile = detailModel.fileEntries[selectedFileIndex] || detailModel.fileEntries[0];
  const selectedFileName = selectedFile?.name || "SKILL.md";
  const selectedFilePath = buildSkillFilePath(detailModel.repositorySlug, selectedFileName);
  const selectedPresetLabel = selectedFile?.name || resolveFilePresetLabel(activePreset);
  const activePreviewLanguage = activePreset === "skill" ? detailModel.previewLanguage : "Markdown";
  const activeSkillDisplayName = String(activeSkill?.name || "").trim() || text.title;
  const topMetaEntries = useMemo(
    () => [
      { key: "entry", value: `${text.metaEntryLabel} ${resolveFilePresetLabel(activePreset)}`, tone: "is-neutral" },
      { key: "source", value: `${text.metaSourceLabel} ${(activeSkill?.source_type || "repository").toLowerCase()}`, tone: "is-accent" },
      { key: "language", value: `${text.metaLanguageLabel} ${activePreviewLanguage.toLowerCase()}`, tone: "is-success" }
    ],
    [activePreset, activeSkill?.source_type, activePreviewLanguage, text.metaEntryLabel, text.metaLanguageLabel, text.metaSourceLabel]
  );
  const toPublicPath = routeNavigator.toPublic;
  const topbarCopy = marketplaceHomeCopy[locale] || marketplaceHomeCopy.en;
  function handleTopbarAuthAction(): void {
    if (sessionUser) {
      void onLogout?.();
      return;
    }
    onNavigate(toPublicPath("/login"));
  }

  const topbarActionBundle = useMemo(
    () =>
      buildMarketplaceTopbarActionBundle({
        onNavigate,
        toPublicPath,
        locale,
        hasSessionUser: Boolean(sessionUser),
        authActionLabel: sessionUser ? topbarCopy.signOut : topbarCopy.signIn,
        onAuthAction: handleTopbarAuthAction
      }),
    [handleTopbarAuthAction, locale, onNavigate, sessionUser, toPublicPath, topbarCopy.signIn, topbarCopy.signOut]
  );
  const topbarThemeMode: ThemeMode = lightMode ? "light" : "dark";
  const topbarBrandTitle = "SkillsIndex";
  const topbarBrandSubtitle = topbarCopy.brandSubtitle;
  const topbarRightRegistrations = useMemo(
    () =>
      buildMarketplaceWorkspaceAccessRightRegistrations({
        sessionUser,
        signedInLabel: topbarCopy.signedIn,
        signedOutLabel: topbarCopy.signedOut,
        workspaceLabel: topbarCopy.openWorkspace,
        signInLabel: topbarCopy.signIn,
        onNavigate,
        toPublicPath
      }),
    [onNavigate, sessionUser, toPublicPath, topbarCopy.openWorkspace, topbarCopy.signIn, topbarCopy.signedIn, topbarCopy.signedOut]
  );
  const stageStyle: CSSProperties = {
    width: "100%",
    minHeight: "100dvh"
  };

  return (
    <div className={`skill-detail-stage${lightMode ? " is-light-stage" : ""}`} style={stageStyle} data-testid="skill-detail-stage">
      <PublicSkillDetailPageStyles />
      <section className={`skill-detail-page${lightMode ? " is-light" : ""}`} data-testid="skill-detail-page">
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
          <div className="skill-detail-title-group">
            <h1 className="skill-detail-title">{activeSkillDisplayName}</h1>
            <PublicSkillDetailBreadcrumb
              rootLabel={text.breadcrumbRoot}
              skillLabel={activeSkillDisplayName}
              currentLabel={selectedPresetLabel}
              onNavigateRoot={() => onNavigate(routeNavigator.toPublic("/"))}
              onNavigateSkill={() => onNavigate(routeNavigator.toPublic(`/skills/${skillID}`))}
            />
            <div className="skill-detail-meta-strip" aria-label="skill detail metadata">
              {topMetaEntries.map((entry) => (
                <span key={entry.key} className={`skill-detail-meta-chip ${entry.tone}`}>
                  {entry.value}
                </span>
              ))}
            </div>
          </div>
        </header>
        {loadStatus === "loading" ? <div className="skill-detail-loading">{text.loading}</div> : null}
        {loadStatus === "error" ? <div className="skill-detail-error">{error || text.loadError}</div> : null}
        {loadStatus === "not_found" ? <div className="skill-detail-empty">{text.notFound}</div> : null}
        {loadStatus === "ready" && activeSkill ? (
          <main className="skill-detail-main">
            <PublicSkillDetailFileBrowser
              activePreset={activePreset}
              detailModel={detailModel}
              selectedFileIndex={selectedFileIndex}
              selectedFileName={selectedFileName}
              selectedFilePath={selectedFilePath}
              text={text}
              onCopyPath={handleCopyPath}
              onOpenSource={handleOpenSource}
              onSelectFile={handleSelectFileFromTree}
            />
            <PublicSkillDetailInteractionPanel
              comments={comments}
              commentDraft={commentDraft}
              commentInputRef={commentComposerRef}
              detailModel={detailModel}
              feedbackMessage={feedbackMessage}
              interactionBusy={interactionBusy}
              selectedRating={selectedRating}
              stats={interactionStats}
              text={text}
              viewerState={viewerState}
              onCommentDraftChange={setCommentDraft}
              onCopyCommand={handleCopyCommand}
              onDeleteComment={handleDeleteComment}
              onInstall={handleInstall}
              onOpenSource={handleOpenSource}
              onSignIn={() => onNavigate(routeNavigator.toPublic("/login"))}
              onSelectRating={setSelectedRating}
              onSubmitComment={handleSubmitComment}
              onSubmitFeedback={handleSubmitFeedback}
              onSubmitRating={handleSubmitRating}
              onToggleFavorite={handleToggleFavorite}
              onViewChangeHistory={handleViewChangeHistory}
            />
          </main>
        ) : null}
      </section>
    </div>
  );
}
