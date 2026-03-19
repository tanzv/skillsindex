import type { FormEvent } from "react";

import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import type { PublicLocale } from "@/src/lib/i18n/publicLocale";
import type { PublicSkillDetailResponse } from "@/src/lib/schemas/public";

import type { PublicSkillDetailModel } from "../publicSkillDetailModel";
import type { SkillDetailWorkspaceTab } from "./SkillDetailWorkbench";
import type { SkillDetailInstallAudience } from "./skillDetailInstallAudience";

export type SkillDetailSidebarMessages = Pick<
  PublicMarketplaceMessages,
  | "shellSignIn"
  | "shellWorkspace"
  | "skillDetailActionAddFavorite"
  | "skillDetailActionCopyCommand"
  | "skillDetailActionCopyPrompt"
  | "skillDetailActionRatePrefix"
  | "skillDetailActionRemoveFavorite"
  | "skillDetailCommentDelete"
  | "skillDetailCommentPlaceholder"
  | "skillDetailCommentSubmit"
  | "skillDetailFeedbackCopyFailed"
  | "skillDetailFeedbackCopied"
  | "skillDetailInstallAgentHint"
  | "skillDetailInstallAgentPromptTitle"
  | "skillDetailInstallAudienceAgent"
  | "skillDetailInstallAudienceHuman"
  | "skillDetailInstallDescription"
  | "skillDetailInstallTitle"
  | "skillDetailInteractionDescription"
  | "skillDetailInteractionTitle"
  | "skillDetailMetricsComments"
  | "skillDetailNoComments"
  | "skillDetailOpenRankings"
  | "skillDetailOpenSource"
>;

export interface SkillDetailSidebarBaseProps {
  activeTab: SkillDetailWorkspaceTab;
  busy: boolean;
  currentContextLabel?: string;
  detail: PublicSkillDetailResponse;
  locale: PublicLocale;
  messages: SkillDetailSidebarMessages;
  model: PublicSkillDetailModel;
}

export interface SkillDetailInstallCardProps {
  activeTab: SkillDetailWorkspaceTab;
  currentContextLabel?: string;
  detail: Pick<PublicSkillDetailResponse, "skill">;
  installAudience: SkillDetailInstallAudience;
  installFeedback: string;
  installationSteps: PublicSkillDetailModel["installationSteps"];
  messages: Pick<
    SkillDetailSidebarMessages,
    | "skillDetailActionCopyCommand"
    | "skillDetailActionCopyPrompt"
    | "skillDetailInstallAgentHint"
    | "skillDetailInstallAgentPromptTitle"
    | "skillDetailInstallAudienceAgent"
    | "skillDetailInstallAudienceHuman"
    | "skillDetailInstallDescription"
    | "skillDetailInstallTitle"
    | "skillDetailOpenSource"
  >;
  onCopyValue: (value: string) => void;
  onInstallAudienceChange: (value: SkillDetailInstallAudience) => void;
}

export interface SkillDetailInstallAgentPanelProps {
  activeTab: SkillDetailWorkspaceTab;
  ctaLabel: string;
  hintText: string;
  onCopyValue: (value: string) => void;
  promptContent: string;
  promptTitle: string;
  sourceActionLabel: string;
  sourceUrl?: string;
}

export interface SkillDetailInstallHumanPanelProps {
  activeTab: SkillDetailWorkspaceTab;
  commandLabel: string;
  ctaLabel: string;
  metadataRows: PublicSkillDetailModel["installationSteps"];
  onCopyValue: (value: string) => void;
  sourceActionLabel: string;
  sourceUrl?: string;
  title: string;
}

export interface SkillDetailInteractionPanelProps {
  busy: boolean;
  commentDraft: string;
  canInteract: boolean;
  feedback: string;
  favoriteLabel: string;
  isAuthenticated: boolean;
  loginTarget: {
    as?: string;
    href: string;
  };
  messages: Pick<
    SkillDetailSidebarMessages,
    | "shellSignIn"
    | "shellWorkspace"
    | "skillDetailActionRatePrefix"
    | "skillDetailCommentPlaceholder"
    | "skillDetailCommentSubmit"
    | "skillDetailInteractionDescription"
    | "skillDetailInteractionTitle"
    | "skillDetailOpenRankings"
  >;
  ratingValue: number;
  onCommentDraftChange: (value: string) => void;
  onCommentSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFavorite: () => void;
  onRate: (score: number) => void;
  toPublicPath: (route: string) => string;
  workspaceHref: string;
}

export interface SkillDetailInteractionComposerProps {
  busy: boolean;
  commentDraft: string;
  favoriteLabel: string;
  ratingValue: number;
  rateActionLabel: string;
  commentPlaceholder: string;
  commentSubmitLabel: string;
  onCommentDraftChange: (value: string) => void;
  onCommentSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFavorite: () => void;
  onRate: (score: number) => void;
}

export interface SkillDetailInteractionAccessGateProps {
  isAuthenticated: boolean;
  loginTarget: {
    as?: string;
    href: string;
  };
  signInLabel: string;
  workspaceHref: string;
  workspaceLabel: string;
}

export interface SkillDetailCommentsPanelProps {
  busy: boolean;
  comments: PublicSkillDetailResponse["comments"];
  deleteActionLabel: string;
  emptyLabel: string;
  locale: PublicLocale;
  title: string;
  onCommentDelete: (commentId: number) => void;
}

export interface SkillDetailCommentItemProps {
  busy: boolean;
  comment: PublicSkillDetailResponse["comments"][number];
  deleteActionLabel: string;
  locale: PublicLocale;
  onCommentDelete: (commentId: number) => void;
}
