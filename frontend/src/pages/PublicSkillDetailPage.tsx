import { CSSProperties, useEffect, useMemo, useState } from "react";
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
import { buildMarketplaceFallback } from "./MarketplaceHomePage.fallback";
import {
  TopbarActionItem,
  buildLightTopbarPrimaryActions,
  buildLightTopbarUtilityActions
} from "./MarketplaceHomePage.lightTopbar";
import MarketplaceHomeLocaleThemeSwitch from "./MarketplaceHomeLocaleThemeSwitch";
import { marketplaceHomeCopy } from "./MarketplaceHomePage.copy";
import PublicSkillDetailBreadcrumb from "./PublicSkillDetailBreadcrumb";
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
  findSkillInPublicCatalog,
  resolveFileIndexForPreset,
  resolvePresetForFileName,
  resolveSkillDetailDataMode
} from "./PublicSkillDetailPage.helpers";
import PublicSkillDetailPageStyles from "./PublicSkillDetailPage.styles";
import PublicStandardTopbar from "./PublicStandardTopbar";
import { createPublicPageNavigator } from "./publicPageNavigation";
import { isLightPrototypePath } from "./prototypePageTheme";

interface PublicSkillDetailPageProps {
  locale: AppLocale;
  skillID: number;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
  onThemeModeChange?: (nextMode: ThemeMode) => void;
  onLocaleChange?: (nextLocale: AppLocale) => void;
}

type PresetKey = SkillDetailPresetKey;

function resolveFilePresetLabel(preset: PresetKey): string {
  if (preset === "readme") {
    return "README.md";
  }
  if (preset === "changelog") {
    return "CHANGELOG.md";
  }
  return "SKILL.md";
}

export default function PublicSkillDetailPage({
  locale,
  skillID,
  onNavigate,
  sessionUser,
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
  const [loading, setLoading] = useState(true);
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
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }));

  const fallbackSkill = useMemo(() => {
    const fallback = buildMarketplaceFallback({ page: 1, sort: "recent" }, locale, sessionUser);
    return fallback.items.find((item) => item.id === skillID) || null;
  }, [locale, sessionUser, skillID]);

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

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    if (dataMode === "prototype") {
      setSkill(buildPrototypeSkillDetailSkill(skillID));
      applyInteractionSnapshot();
      setLoading(false);
      return () => {
        active = false;
      };
    }

    loadLiveDetail(skillID)
      .catch(async () => {
        if (!active) {
          return;
        }

        try {
          const matched = await findSkillInPublicCatalog(skillID);
          if (!active) {
            return;
          }
          if (matched) {
            setSkill(matched);
            applyInteractionSnapshot();
            return;
          }
        } catch {
          // Ignore fallback catalog errors and use static fallback payload.
        }

        if (!active) {
          return;
        }
        const fallback = fallbackSkill || buildPrototypeSkillDetailSkill(skillID);
        setSkill(fallback);
        applyInteractionSnapshot();
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [dataMode, fallbackSkill, skillID, text.loadError]);

  const activeSkill = skill || buildPrototypeSkillDetailSkill(skillID);
  const detailModel = useMemo(
    () => buildSkillDetailViewModel(activeSkill, locale, text, interactionStats),
    [activeSkill, interactionStats, locale, text]
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
    const installCommand = activeSkill.install_command;
    if (!installCommand || !navigator?.clipboard) {
      setFeedback(text.copyFailed);
      return;
    }

    try {
      await navigator.clipboard.writeText(installCommand);
      setFeedback(text.copied);
    } catch {
      setFeedback(text.copyFailed);
    }
  }

  async function handleCopyPath() {
    const selectedFile = detailModel.fileEntries[selectedFileIndex];
    const selectedFileName = selectedFile?.name || "SKILL.md";
    const filePath = `/${detailModel.repositorySlug}/${selectedFileName}`;
    if (!navigator?.clipboard) {
      setFeedback(text.copyFailed);
      return;
    }

    try {
      await navigator.clipboard.writeText(filePath);
      setFeedback(text.copied);
    } catch {
      setFeedback(text.copyFailed);
    }
  }

  function handleOpenSource() {
    const targetURL = activeSkill.source_url;
    if (targetURL) {
      window.open(targetURL, "_blank", "noopener,noreferrer");
      return;
    }
    setFeedback(text.copyFailed);
  }

  function handleInstall() {
    setFeedback(text.installed);
  }

  async function refreshLiveDetail() {
    if (dataMode !== "live") {
      return;
    }
    await loadLiveDetail(skillID);
  }

  async function handleToggleFavorite() {
    if (!viewerState.can_interact) {
      setFeedback(text.signInToInteract);
      return;
    }
    if (interactionBusy) {
      return;
    }

    const nextFavoriteState = !viewerState.favorited;
    setInteractionBusy(true);
    try {
      await setSkillFavorite(skillID, nextFavoriteState);
      await refreshLiveDetail();
      setFeedback(nextFavoriteState ? text.favoriteSaved : text.favoriteRemoved);
    } catch (mutationError) {
      setFeedback(mutationError instanceof Error ? mutationError.message : text.loadError);
    } finally {
      setInteractionBusy(false);
    }
  }

  async function handleSubmitRating() {
    const ratingScore = normalizeRatingScore(selectedRating || viewerState.rating);
    if (!viewerState.can_interact) {
      setFeedback(text.signInToInteract);
      return;
    }
    if (ratingScore === 0 || interactionBusy) {
      return;
    }

    setInteractionBusy(true);
    try {
      await submitSkillRating(skillID, ratingScore);
      await refreshLiveDetail();
      setFeedback(text.ratingSubmitted);
    } catch (mutationError) {
      setFeedback(mutationError instanceof Error ? mutationError.message : text.loadError);
    } finally {
      setInteractionBusy(false);
    }
  }

  async function handleSubmitComment() {
    if (!viewerState.can_interact) {
      setFeedback(text.signInToInteract);
      return;
    }
    if (!isCommentDraftValid(commentDraft) || interactionBusy) {
      setFeedback(text.commentInvalid);
      return;
    }

    setInteractionBusy(true);
    try {
      await createSkillComment(skillID, commentDraft.trim());
      setCommentDraft("");
      await refreshLiveDetail();
      setFeedback(text.commentPosted);
    } catch (mutationError) {
      setFeedback(mutationError instanceof Error ? mutationError.message : text.loadError);
    } finally {
      setInteractionBusy(false);
    }
  }

  async function handleDeleteComment(commentID: number) {
    if (!viewerState.can_interact || interactionBusy) {
      return;
    }
    setInteractionBusy(true);
    try {
      await deleteSkillComment(skillID, commentID);
      await refreshLiveDetail();
      setFeedback(text.commentDeleted);
    } catch (mutationError) {
      setFeedback(mutationError instanceof Error ? mutationError.message : text.loadError);
    } finally {
      setInteractionBusy(false);
    }
  }

  function handleViewChangeHistory() {
    const changelogIndex = detailModel.fileEntries.findIndex((entry) => entry.name.toLowerCase().includes("changelog"));
    setActivePreset("changelog");
    if (changelogIndex >= 0) {
      setSelectedFileIndex(changelogIndex);
    }
    setFeedback(text.addedCompare);
  }

  function handlePresetSwitch(nextPreset: PresetKey) {
    setActivePreset(nextPreset);
    setSelectedFileIndex((previousIndex) => resolveFileIndexForPreset(nextPreset, detailModel.fileEntries, previousIndex));
  }

  function handleSelectFile(nextIndex: number) {
    const nextEntry = detailModel.fileEntries[nextIndex];
    if (!nextEntry) {
      return;
    }
    setSelectedFileIndex(nextIndex);
    setActivePreset(resolvePresetForFileName(nextEntry.name));
  }

  const selectedFile = detailModel.fileEntries[selectedFileIndex] || detailModel.fileEntries[0];
  const selectedFileName = selectedFile?.name || "SKILL.md";
  const selectedFilePath = `/${detailModel.repositorySlug}/${selectedFileName}`;
  const selectedPresetLabel = selectedFile?.name || resolveFilePresetLabel(activePreset);
  const activePreviewLanguage = activePreset === "skill" ? detailModel.previewLanguage : "Markdown";
  const breadcrumbItems = useMemo(
    () => [
      {
        key: "marketplace",
        label: text.breadcrumbRoot,
        onClick: () => onNavigate(routeNavigator.toPublic("/"))
      },
      {
        key: "skill",
        label: activeSkill.name || detailModel.titleName,
        onClick: () => onNavigate(routeNavigator.toPublic(`/skills/${skillID}`))
      },
      {
        key: "file",
        label: selectedPresetLabel
      }
    ],
    [activeSkill.name, detailModel.titleName, onNavigate, routeNavigator, selectedPresetLabel, skillID, text.breadcrumbRoot]
  );
  const topMetaEntries = useMemo(
    () => [
      { key: "entry", value: `${text.metaEntryLabel} ${resolveFilePresetLabel(activePreset)}`, tone: "is-neutral" },
      { key: "source", value: `${text.metaSourceLabel} ${(activeSkill.source_type || "repository").toLowerCase()}`, tone: "is-accent" },
      { key: "language", value: `${text.metaLanguageLabel} ${activePreviewLanguage.toLowerCase()}`, tone: "is-success" }
    ],
    [activePreset, activeSkill.source_type, activePreviewLanguage, text.metaEntryLabel, text.metaLanguageLabel, text.metaSourceLabel]
  );
  const toPublicPath = routeNavigator.toPublic;
  const topbarCopy = marketplaceHomeCopy[locale] || marketplaceHomeCopy.en;
  const lightTopbarPrimaryActions = useMemo<TopbarActionItem[]>(
    () =>
      buildLightTopbarPrimaryActions({
        onNavigate,
        toPublicPath,
        primaryPreset: "compact",
        labels: {
          categoryNav: topbarCopy.categoryNav,
          downloadRankingNav: topbarCopy.downloadRankingNav
        }
      }),
    [onNavigate, toPublicPath, topbarCopy.categoryNav, topbarCopy.downloadRankingNav]
  );
  const lightTopbarUtilityActions = useMemo<TopbarActionItem[]>(
    () =>
      buildLightTopbarUtilityActions({
        onNavigate,
        toPublicPath,
        hasSessionUser: Boolean(sessionUser)
      }),
    [onNavigate, sessionUser, toPublicPath]
  );
  const topbarThemeMode: ThemeMode = lightMode ? "light" : "dark";
  const topbarBrandTitle = lightMode ? "SkillsIndex" : topbarCopy.brandTitle;
  const topbarBrandSubtitle = lightMode ? "User Portal" : topbarCopy.brandSubtitle;
  const topbarCtaPath = sessionUser ? toPublicPath("/workspace") : toPublicPath("/login");
  const isVisualBaselineViewport = viewport.width === 512 && viewport.height === 342;
  const visualScale = isVisualBaselineViewport ? viewport.width / 1440 : 1;

  const stageStyle: CSSProperties = isVisualBaselineViewport
    ? {
        width: "100%",
        height: "100dvh",
        overflow: "hidden"
      }
    : {
        width: "100%",
        minHeight: "100dvh"
      };

  const pageStyle: CSSProperties | undefined = isVisualBaselineViewport ? { transform: `scale(${visualScale})` } : undefined;

  return (
    <div className={`skill-detail-stage${lightMode ? " is-light-stage" : ""}`} style={stageStyle} data-testid="skill-detail-stage">
      <PublicSkillDetailPageStyles />
      <section className={`skill-detail-page${lightMode ? " is-light" : ""}${isVisualBaselineViewport ? " is-visual-baseline" : ""}`} style={pageStyle} data-testid="skill-detail-page">
        <PublicStandardTopbar
          shellClassName="animated-fade-down"
          dataAnimated
          brandTitle={topbarBrandTitle}
          brandSubtitle={topbarBrandSubtitle}
          onBrandClick={() => onNavigate(routeNavigator.toPublic("/"))}
          isLightTheme={lightMode}
          primaryActions={lightTopbarPrimaryActions}
          utilityActions={lightTopbarUtilityActions}
          statusLabel={sessionUser ? topbarCopy.signedIn : topbarCopy.signedOut}
          ctaLabel={sessionUser ? topbarCopy.openWorkspace : topbarCopy.signIn}
          onCtaClick={() => onNavigate(topbarCtaPath)}
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
            <h1 className="skill-detail-title">{activeSkill.name || text.title}</h1>
            <PublicSkillDetailBreadcrumb items={breadcrumbItems} />
            <div className="skill-detail-meta-strip" aria-label="skill detail metadata">
              {topMetaEntries.map((entry) => (
                <span key={entry.key} className={`skill-detail-meta-chip ${entry.tone}`}>
                  {entry.value}
                </span>
              ))}
            </div>
          </div>

          <div className="skill-detail-top-actions">
            <button type="button" className="skill-detail-pill is-secondary-action" onClick={handleCopyCommand}>
              <span>{text.copyCommand}</span>
            </button>
            <button type="button" className="skill-detail-pill is-primary-action" onClick={handleInstall}>
              <span>{text.installWorkspace}</span>
            </button>
            <button type="button" className="skill-detail-pill is-neutral" onClick={handleOpenSource}>
              <span>{text.openReadme}</span>
            </button>
          </div>
        </header>

        {loading ? <div className="skill-detail-loading">{text.loading}</div> : null}

        {!loading && error ? <div className="skill-detail-error">{error || text.loadError}</div> : null}

        {!loading && !error && !activeSkill ? <div className="skill-detail-empty">{text.notFound}</div> : null}

        {!loading && activeSkill ? (
          <main className="skill-detail-main">
            <PublicSkillDetailFileBrowser
              activePreset={activePreset}
              detailModel={detailModel}
              selectedFileIndex={selectedFileIndex}
              selectedFileName={selectedFileName}
              selectedFilePath={selectedFilePath}
              selectedPresetLabel={selectedPresetLabel}
              text={text}
              onCopyPath={handleCopyPath}
              onOpenSource={handleOpenSource}
              onPresetSwitch={handlePresetSwitch}
              onSelectFile={handleSelectFile}
            />

            <PublicSkillDetailInteractionPanel
              comments={comments}
              commentDraft={commentDraft}
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
              onSelectRating={setSelectedRating}
              onSubmitComment={handleSubmitComment}
              onSubmitFeedback={() => onNavigate(routeNavigator.toPublic("/"))}
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
