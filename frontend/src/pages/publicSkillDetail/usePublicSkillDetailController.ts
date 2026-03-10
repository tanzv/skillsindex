import { useEffect, useMemo, useState } from "react";

import {
  type MarketplaceQueryParams,
  type MarketplaceSkill,
  type PublicSkillDetailComment,
  type PublicSkillDetailResponse,
  type SessionUser,
  fetchPublicMarketplace,
  fetchPublicSkillDetail
} from "../../lib/api";
import type { AppLocale } from "../../lib/i18n";
import type { ThemeMode } from "../../lib/themeModePath";
import { marketplaceHomeCopy } from "../marketplaceHome/MarketplaceHomePage.copy";
import { buildMarketplaceTopbarActionBundle } from "../marketplaceHome/MarketplaceHomePage.lightTopbar";
import { buildMarketplaceWorkspaceAccessRightRegistrations } from "../marketplacePublic/MarketplaceTopbarRightRegistrations";
import { publicSkillDetailCopy } from "./PublicSkillDetailPage.copy";
import {
  buildInteractionSnapshot,
  defaultSkillInteractionStats,
  defaultSkillViewerState
} from "./PublicSkillDetailPage.interaction";
import {
  type SkillDetailDataMode,
  type SkillDetailPresetKey,
  buildPrototypeSkillDetailSkill,
  buildSkillDetailViewModel,
  resolveFileIndexForPreset,
  resolveSkillDetailDataMode
} from "./PublicSkillDetailPage.helpers";
import { resolveSkillDetailLoadFailure, type SkillDetailLoadStatus } from "./PublicSkillDetailPage.loadState";
import { createPublicPageNavigator } from "../publicShared/publicPageNavigation";
import { isLightPrototypePath } from "../prototype/prototypePageTheme";
import type { RelatedSkillsLoadStatus } from "./PublicSkillDetailPage.fileBrowser.contract";
import { resolveFilePresetLabel, resolveResourceTabLabel } from "./PublicSkillDetailPageViewHelpers";
import { type SkillDetailResourceTabKey } from "./PublicSkillDetailResourceTabs";
import { usePublicSkillDetailInteractions } from "./usePublicSkillDetailInteractions";

interface UsePublicSkillDetailControllerOptions {
  locale: AppLocale;
  skillID: number;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
  onLogout?: () => Promise<void> | void;
}

interface SkillDetailTopMetaEntry {
  key: string;
  value: string;
  tone: "is-neutral" | "is-accent" | "is-success";
}

async function loadRelatedSkillsCatalog(skill: MarketplaceSkill): Promise<MarketplaceSkill[]> {
  const primaryTag = (skill.tags || []).find((tag) => String(tag || "").trim());
  const queries: MarketplaceQueryParams[] = [];

  if (skill.category && skill.subcategory) {
    queries.push({
      category: skill.category,
      subcategory: skill.subcategory,
      sort: "recent",
      page: 1
    });
  }

  if (skill.category) {
    queries.push({
      category: skill.category,
      sort: "recent",
      page: 1
    });
  }

  if (primaryTag) {
    queries.push({
      tags: primaryTag,
      sort: "recent",
      page: 1
    });
  }

  if (queries.length === 0) {
    return [];
  }

  const relatedSkills = new Map<number, MarketplaceSkill>();

  for (const query of queries) {
    const payload = await fetchPublicMarketplace(query);
    payload.items.forEach((item) => {
      if (item.id === skill.id || relatedSkills.has(item.id)) {
        return;
      }
      relatedSkills.set(item.id, item);
    });
    if (relatedSkills.size >= 6) {
      break;
    }
  }

  return Array.from(relatedSkills.values()).slice(0, 6);
}

export function usePublicSkillDetailController({
  locale,
  skillID,
  onNavigate,
  sessionUser,
  onLogout
}: UsePublicSkillDetailControllerOptions) {
  const text = publicSkillDetailCopy[locale] || publicSkillDetailCopy.en;
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
  const [activePreset, setActivePreset] = useState<SkillDetailPresetKey>("skill");
  const [activeResourceTab, setActiveResourceTab] = useState<SkillDetailResourceTabKey>("overview");
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [interactionStats, setInteractionStats] = useState(defaultSkillInteractionStats);
  const [viewerState, setViewerState] = useState(defaultSkillViewerState);
  const [comments, setComments] = useState<PublicSkillDetailComment[]>([]);
  const [relatedSkills, setRelatedSkills] = useState<MarketplaceSkill[]>([]);
  const [relatedSkillsLoadStatus, setRelatedSkillsLoadStatus] = useState<RelatedSkillsLoadStatus>("idle");

  function applyInteractionSnapshot() {
    setInteractionStats(defaultSkillInteractionStats);
    setViewerState(defaultSkillViewerState);
    setComments([]);
  }

  function applyLiveDetailSnapshot(detailPayload: PublicSkillDetailResponse) {
    const snapshot = buildInteractionSnapshot(detailPayload);
    setSkill(detailPayload.skill);
    setInteractionStats(snapshot.stats);
    setViewerState(snapshot.viewerState);
    setComments(snapshot.comments);
  }

  async function loadLiveDetail(targetSkillID: number) {
    const detailPayload = await fetchPublicSkillDetail(targetSkillID);
    applyLiveDetailSnapshot(detailPayload);
  }

  useEffect(() => {
    setActivePreset("skill");
    setActiveResourceTab("overview");
    setSelectedFileIndex(0);
  }, [dataMode, skillID]);

  useEffect(() => {
    let active = true;
    setLoadStatus("loading");
    setError("");
    setSkill(null);
    setRelatedSkills([]);
    setRelatedSkillsLoadStatus("idle");
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
    () => buildSkillDetailViewModel(detailViewSkill, locale, text, interactionStats, dataMode),
    [dataMode, detailViewSkill, interactionStats, locale, text]
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

  useEffect(() => {
    let active = true;

    if (dataMode !== "live" || !activeSkill) {
      setRelatedSkills([]);
      setRelatedSkillsLoadStatus("idle");
      return () => {
        active = false;
      };
    }

    setRelatedSkillsLoadStatus("loading");

    loadRelatedSkillsCatalog(activeSkill)
      .then((items) => {
        if (!active) {
          return;
        }
        setRelatedSkills(items);
        setRelatedSkillsLoadStatus("ready");
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setRelatedSkills([]);
        setRelatedSkillsLoadStatus("error");
      });

    return () => {
      active = false;
    };
  }, [activeSkill, dataMode]);

  async function refreshLiveDetail() {
    if (dataMode !== "live") {
      return;
    }
    await loadLiveDetail(skillID);
  }

  const {
    feedbackMessage,
    interactionBusy,
    selectedRating,
    commentDraft,
    commentComposerRef,
    selectedFileName,
    selectedFilePath,
    setSelectedRating,
    setCommentDraft,
    syncSelectedRatingFromViewer,
    handleCopyCommand,
    handleCopyAgentPrompt,
    handleCopyPath,
    handleOpenSource,
    handleInstall,
    handleToggleFavorite,
    handleSubmitRating,
    handleSubmitComment,
    handleDeleteComment,
    handleViewInstallationDetails,
    handleViewResourceDetails,
    handleViewChangeHistory,
    handleSelectFileFromTree
  } = usePublicSkillDetailInteractions({
    text,
    activeSkill,
    detailModel,
    selectedFileIndex,
    canInteract: viewerState.can_interact,
    viewerRating: viewerState.rating,
    viewerFavorited: viewerState.favorited,
    skillID,
    setActivePreset,
    setActiveResourceTab,
    setSelectedFileIndex,
    refreshLiveDetail
  });

  useEffect(() => {
    syncSelectedRatingFromViewer(viewerState.rating);
  }, [syncSelectedRatingFromViewer, viewerState.rating]);

  const selectedPresetLabel =
    activeResourceTab === "skill"
      ? selectedFileName || resolveFilePresetLabel(activePreset)
      : resolveResourceTabLabel(text, activeResourceTab);
  const activePreviewLanguage = activePreset === "skill" ? detailModel.previewLanguage : "Markdown";
  const activeSkillDisplayName = String(activeSkill?.name || "").trim() || text.title;

  const topMetaEntries = useMemo<SkillDetailTopMetaEntry[]>(
    () => [
      {
        key: "entry",
        value: `${text.metaEntryLabel} ${
          activeResourceTab === "skill" ? resolveFilePresetLabel(activePreset) : resolveResourceTabLabel(text, activeResourceTab)
        }`,
        tone: "is-neutral"
      },
      { key: "source", value: `${text.metaSourceLabel} ${(activeSkill?.source_type || "repository").toLowerCase()}`, tone: "is-accent" },
      { key: "language", value: `${text.metaLanguageLabel} ${activePreviewLanguage.toLowerCase()}`, tone: "is-success" }
    ],
    [activePreset, activePreviewLanguage, activeResourceTab, activeSkill?.source_type, text]
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

  return {
    text,
    routeNavigator,
    lightMode,
    loadStatus,
    error,
    activeSkill,
    activePreset,
    activeResourceTab,
    selectedFileIndex,
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
    interactionStats,
    viewerState,
    activeSkillDisplayName,
    topMetaEntries,
    topbarThemeMode,
    topbarBrandTitle,
    topbarBrandSubtitle,
    topbarActionBundle,
    topbarRightRegistrations,
    relatedSkills,
    relatedSkillsLoadStatus,
    setActiveResourceTab,
    setCommentDraft,
    setSelectedRating,
    handleCopyCommand,
    handleCopyAgentPrompt,
    handleCopyPath,
    handleOpenSource,
    handleInstall,
    handleDeleteComment,
    handleSubmitComment,
    handleSubmitRating,
    handleToggleFavorite,
    handleViewInstallationDetails,
    handleViewResourceDetails,
    handleViewChangeHistory,
    handleSelectFileFromTree
  };
}
