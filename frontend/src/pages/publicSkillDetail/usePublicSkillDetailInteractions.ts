import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from "react";

import {
  type MarketplaceSkill,
  createSkillComment,
  deleteSkillComment,
  setSkillFavorite,
  submitSkillRating
} from "../../lib/api";
import { isCommentDraftValid, normalizeRatingScore } from "./PublicSkillDetailPage.interaction";
import { resolvePresetForFileName, type SkillDetailPresetKey, type SkillDetailViewModel } from "./PublicSkillDetailPage.helpers";
import type { SkillDetailCopy } from "./PublicSkillDetailPage.copy";
import {
  buildSkillFilePath,
  copyInstallCommand,
  copyPlainText,
  copySkillFilePath,
  openSkillSource
} from "./PublicSkillDetailInstallActions";
import {
  deleteCommentInteraction,
  submitCommentInteraction,
  submitRatingInteraction,
  toggleFavoriteInteraction
} from "./PublicSkillDetailInteractionActions";
import { buildAgentInstallPrompt, resolveInteractionFeedbackMessage } from "./PublicSkillDetailPageViewHelpers";
import type { SkillDetailResourceTabKey } from "./PublicSkillDetailResourceTabs";

interface UsePublicSkillDetailInteractionsOptions {
  text: SkillDetailCopy;
  activeSkill: MarketplaceSkill | null;
  detailModel: SkillDetailViewModel;
  selectedFileIndex: number;
  canInteract: boolean;
  viewerRating: number;
  viewerFavorited: boolean;
  skillID: number;
  setActivePreset: Dispatch<SetStateAction<SkillDetailPresetKey>>;
  setActiveResourceTab: Dispatch<SetStateAction<SkillDetailResourceTabKey>>;
  setSelectedFileIndex: Dispatch<SetStateAction<number>>;
  refreshLiveDetail: () => Promise<void>;
}

export function usePublicSkillDetailInteractions({
  text,
  activeSkill,
  detailModel,
  selectedFileIndex,
  canInteract,
  viewerRating,
  viewerFavorited,
  skillID,
  setActivePreset,
  setActiveResourceTab,
  setSelectedFileIndex,
  refreshLiveDetail
}: UsePublicSkillDetailInteractionsOptions) {
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [interactionBusy, setInteractionBusy] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [commentDraft, setCommentDraft] = useState("");
  const commentComposerRef = useRef<HTMLTextAreaElement | null>(null);
  const interactionBusyLockRef = useRef(false);

  function setFeedback(nextMessage: string) {
    setFeedbackMessage(nextMessage);
    window.setTimeout(() => {
      setFeedbackMessage("");
    }, 1600);
  }

  const syncSelectedRatingFromViewer = useCallback((rating: number) => {
    setSelectedRating(normalizeRatingScore(rating));
  }, []);

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

  async function handleCopyCommand() {
    const status = await copyInstallCommand({
      skill: activeSkill,
      clipboard: navigator?.clipboard
    });
    if (status === "success") {
      setFeedback(text.copied);
      return;
    }
    setFeedback(status === "missing_command" ? text.installCommandMissing : text.copyFailed);
  }

  async function handleCopyAgentPrompt() {
    const prompt = buildAgentInstallPrompt(activeSkill, detailModel);
    const status = await copyPlainText({
      value: prompt,
      clipboard: navigator?.clipboard
    });
    if (status === "success") {
      setFeedback(text.copied);
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

  async function handleToggleFavorite() {
    await executeBusyInteraction(async () => {
      const outcome = await toggleFavoriteInteraction({
        canInteract,
        interactionBusy,
        favorited: viewerFavorited,
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

  async function handleSubmitRating() {
    const ratingScore = normalizeRatingScore(selectedRating || viewerRating);
    await executeBusyInteraction(async () => {
      const outcome = await submitRatingInteraction({
        canInteract,
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
        canInteract,
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
        canInteract,
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

  function handleViewInstallationDetails() {
    setActiveResourceTab("installation");
  }

  function handleViewResourceDetails() {
    setActiveResourceTab("resources");
  }

  function handleViewChangeHistory() {
    setActiveResourceTab("history");
    setFeedback(text.addedCompare);
  }

  function handleSelectFileFromTree(nextFileIndex: number) {
    const targetEntry = detailModel.fileEntries[nextFileIndex];
    if (!targetEntry) {
      return;
    }
    setActivePreset(resolvePresetForFileName(targetEntry.name));
    setSelectedFileIndex(nextFileIndex);
    setActiveResourceTab("skill");
  }

  const selectedFile = detailModel.fileEntries[selectedFileIndex] || detailModel.fileEntries[0];
  const selectedFileName = selectedFile?.name || "SKILL.md";
  const selectedFilePath = buildSkillFilePath(detailModel.repositorySlug, selectedFileName);

  return {
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
  };
}
