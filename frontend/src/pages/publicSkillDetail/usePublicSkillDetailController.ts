import { useEffect, useMemo, useState } from "react";

import {
  type MarketplaceSkill,
  type PublicSkillDetailComment,
  type PublicSkillDetailResponse,
  type SessionUser,
  fetchPublicSkillDetail
} from "../../lib/api";
import type { AppLocale } from "../../lib/i18n";
import { publicSkillDetailCopy } from "./PublicSkillDetailPage.copy";
import {
  buildInteractionSnapshot,
  defaultSkillInteractionStats,
  defaultSkillViewerState
} from "./PublicSkillDetailPage.interaction";
import {
  buildEmptySkillDetailViewModel,
  type SkillDetailDataMode,
  type SkillDetailPresetKey,
  buildPrototypeSkillDetailSkill,
  buildSkillDetailViewModel,
  resolveFileIndexForPreset,
  resolveSkillDetailViewSkill,
  resolveSkillDetailDataMode
} from "./PublicSkillDetailPage.helpers";
import { resolveSkillDetailLoadFailure, type SkillDetailLoadStatus } from "./PublicSkillDetailPage.loadState";
import { createPublicPageNavigator } from "../publicShared/publicPageNavigation";
import { isLightPrototypePath } from "../prototype/prototypePageTheme";
import { resolveFilePresetLabel, resolveResourceTabLabel } from "./PublicSkillDetailPageViewHelpers";
import { type SkillDetailResourceTabKey } from "./PublicSkillDetailResourceTabs";
import { usePublicSkillDetailInteractions } from "./usePublicSkillDetailInteractions";
import { resolveDetailFileEntries } from "./PublicSkillDetailPage.liveData";
import { usePublicSkillDetailLiveExtensions } from "./usePublicSkillDetailLiveExtensions";
import { usePublicSkillDetailLiveFilePreview } from "./usePublicSkillDetailLiveFilePreview";
import { usePublicSkillDetailRelatedSkills } from "./usePublicSkillDetailRelatedSkills";
import { usePublicSkillDetailTopbar } from "./usePublicSkillDetailTopbar";

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
  const {
    skillResources,
    skillResourcesLoadStatus,
    versionItems,
    versionItemsLoadStatus
  } = usePublicSkillDetailLiveExtensions({
    activeSkill,
    dataMode
  });
  const detailViewSkill = useMemo(
    () => resolveSkillDetailViewSkill(activeSkill, skillID, dataMode),
    [activeSkill, dataMode, skillID]
  );
  const baseDetailModel = useMemo(
    () =>
      detailViewSkill
        ? buildSkillDetailViewModel(detailViewSkill, locale, text, interactionStats, dataMode)
        : buildEmptySkillDetailViewModel(text),
    [dataMode, detailViewSkill, interactionStats, locale, text]
  );
  const detailModel = useMemo(
    () => ({
      ...baseDetailModel,
      fileEntries: resolveDetailFileEntries(baseDetailModel.fileEntries, skillResources)
    }),
    [baseDetailModel, skillResources]
  );
  const selectedFileEntryName = detailModel.fileEntries[selectedFileIndex]?.name || detailModel.fileEntries[0]?.name || "";
  const {
    selectedFileContent,
    selectedFileLanguage
  } = usePublicSkillDetailLiveFilePreview({
    activeSkill,
    dataMode,
    selectedFileName: selectedFileEntryName
  });
  const {
    relatedSkills,
    relatedSkillsLoadStatus
  } = usePublicSkillDetailRelatedSkills({
    activeSkill,
    dataMode
  });

  useEffect(() => {
    if (selectedFileIndex < detailModel.fileEntries.length) {
      return;
    }
    setSelectedFileIndex(0);
  }, [detailModel.fileEntries.length, selectedFileIndex]);

  useEffect(() => {
    setSelectedFileIndex((previousIndex) => resolveFileIndexForPreset(activePreset, detailModel.fileEntries, previousIndex));
  }, [activePreset, detailModel.fileEntries]);

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
    () => {
      if (!activeSkill) {
        return [];
      }
      return [
        {
          key: "entry",
          value: `${text.metaEntryLabel} ${
            activeResourceTab === "skill" ? resolveFilePresetLabel(activePreset) : resolveResourceTabLabel(text, activeResourceTab)
          }`,
          tone: "is-neutral"
        },
        { key: "source", value: `${text.metaSourceLabel} ${activeSkill.source_type.toLowerCase()}`, tone: "is-accent" },
        { key: "language", value: `${text.metaLanguageLabel} ${activePreviewLanguage.toLowerCase()}`, tone: "is-success" }
      ];
    },
    [activePreset, activePreviewLanguage, activeResourceTab, activeSkill, text]
  );
  const {
    topbarThemeMode,
    topbarBrandTitle,
    topbarBrandSubtitle,
    topbarActionBundle,
    topbarRightRegistrations
  } = usePublicSkillDetailTopbar({
    locale,
    lightMode,
    onNavigate,
    onLogout,
    sessionUser,
    toPublicPath: routeNavigator.toPublic
  });

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
    interactionStats,
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
