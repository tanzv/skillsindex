import type { SessionUser } from "../../lib/api";
import type { MarketplaceTopbarRightRegistration } from "./MarketplaceTopbar.rightRegistry";

interface BuildMarketplaceTopbarRightRegistrationsInput {
  statusLabel?: string;
  secondaryCtaLabel?: string;
  onSecondaryCtaClick?: () => void;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

interface BuildMarketplaceWorkspaceAccessRightRegistrationsInput {
  sessionUser: SessionUser | null;
  signedInLabel: string;
  signedOutLabel: string;
  workspaceLabel: string;
  signInLabel: string;
  onNavigate: (path: string) => void;
  toPublicPath: (path: string) => string;
  workspacePath?: string;
  loginPath?: string;
}

interface BuildMarketplaceWorkspaceAuthRightRegistrationsInput {
  sessionUser: SessionUser | null;
  workspaceLabel: string;
  signInLabel: string;
  signOutLabel: string;
  onWorkspaceClick: () => void;
  onAuthClick: () => void;
}

function hasLabelContent(label: string | undefined): boolean {
  return Boolean(String(label || "").trim());
}

function hasAction(label: string | undefined, onClick: (() => void) | undefined): boolean {
  return Boolean(hasLabelContent(label) && onClick);
}

export function buildMarketplaceTopbarRightRegistrations({
  statusLabel,
  secondaryCtaLabel,
  onSecondaryCtaClick,
  ctaLabel,
  onCtaClick
}: BuildMarketplaceTopbarRightRegistrationsInput): MarketplaceTopbarRightRegistration[] {
  const registrations: MarketplaceTopbarRightRegistration[] = [];

  if (hasLabelContent(statusLabel)) {
    registrations.push({
      key: "dark-status",
      slot: "dark",
      order: 10,
      render: () => <span className="marketplace-topbar-status">{statusLabel}</span>
    });
  }

  if (hasAction(secondaryCtaLabel, onSecondaryCtaClick)) {
    registrations.push({
      key: "dark-secondary-cta",
      slot: "dark",
      order: 30,
      render: () => (
        <button type="button" className="marketplace-topbar-secondary-cta" onClick={onSecondaryCtaClick}>
          {secondaryCtaLabel}
        </button>
      )
    });
  }

  if (hasAction(ctaLabel, onCtaClick)) {
    registrations.push({
      key: "dark-cta",
      slot: "dark",
      order: 40,
      render: () => (
        <button type="button" className="marketplace-topbar-cta" onClick={onCtaClick}>
          {ctaLabel}
        </button>
      )
    });
  }

  return registrations;
}

export function buildMarketplaceWorkspaceAccessRightRegistrations({
  sessionUser,
  signedInLabel,
  signedOutLabel,
  workspaceLabel,
  signInLabel,
  onNavigate,
  toPublicPath,
  workspacePath = "/workspace",
  loginPath = "/login"
}: BuildMarketplaceWorkspaceAccessRightRegistrationsInput): MarketplaceTopbarRightRegistration[] {
  const hasSessionUser = Boolean(sessionUser);
  const ctaPath = hasSessionUser ? toPublicPath(workspacePath) : toPublicPath(loginPath);

  return buildMarketplaceTopbarRightRegistrations({
    statusLabel: hasSessionUser ? signedInLabel : signedOutLabel,
    ctaLabel: hasSessionUser ? workspaceLabel : signInLabel,
    onCtaClick: () => onNavigate(ctaPath)
  });
}

export function buildMarketplaceWorkspaceAuthRightRegistrations({
  sessionUser,
  workspaceLabel,
  signInLabel,
  signOutLabel,
  onWorkspaceClick,
  onAuthClick
}: BuildMarketplaceWorkspaceAuthRightRegistrationsInput): MarketplaceTopbarRightRegistration[] {
  const hasSessionUser = Boolean(sessionUser);
  return buildMarketplaceTopbarRightRegistrations({
    secondaryCtaLabel: workspaceLabel,
    onSecondaryCtaClick: onWorkspaceClick,
    ctaLabel: hasSessionUser ? signOutLabel : signInLabel,
    onCtaClick: onAuthClick
  });
}
