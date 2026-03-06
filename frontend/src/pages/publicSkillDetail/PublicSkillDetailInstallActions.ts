import type { MarketplaceSkill } from "../../lib/api";

export type InstallActionStatus = "success" | "clipboard_unavailable" | "missing_command" | "failed";

export interface ClipboardWriter {
  writeText: (value: string) => Promise<void>;
}

export interface WindowOpenLike {
  (url: string, target?: string, features?: string): unknown;
}

export interface CopyInstallCommandOptions {
  skill: MarketplaceSkill | null;
  clipboard?: ClipboardWriter | null;
}

export interface CopyFilePathOptions {
  repositorySlug: string;
  selectedFileName: string;
  clipboard?: ClipboardWriter | null;
}

export interface OpenSourceOptions {
  sourceURL?: string | null;
  openWindow?: WindowOpenLike | null;
}

function resolveClipboard(clipboard: ClipboardWriter | null | undefined): ClipboardWriter | null {
  if (!clipboard || typeof clipboard.writeText !== "function") {
    return null;
  }
  return clipboard;
}

function normalizeInstallCommand(skill: MarketplaceSkill | null): string {
  return String(skill?.install_command || "").trim();
}

export function buildSkillFilePath(repositorySlug: string, selectedFileName: string): string {
  const normalizedSlug = String(repositorySlug || "").trim().replace(/^\/+|\/+$/g, "");
  const normalizedFileName = String(selectedFileName || "").trim() || "SKILL.md";
  return `/${normalizedSlug}/${normalizedFileName}`;
}

export async function copyInstallCommand(options: CopyInstallCommandOptions): Promise<InstallActionStatus> {
  const command = normalizeInstallCommand(options.skill);
  if (!command) {
    return "missing_command";
  }
  const clipboard = resolveClipboard(options.clipboard);
  if (!clipboard) {
    return "clipboard_unavailable";
  }
  try {
    await clipboard.writeText(command);
    return "success";
  } catch {
    return "failed";
  }
}

export async function copySkillFilePath(options: CopyFilePathOptions): Promise<InstallActionStatus> {
  const clipboard = resolveClipboard(options.clipboard);
  if (!clipboard) {
    return "clipboard_unavailable";
  }
  const path = buildSkillFilePath(options.repositorySlug, options.selectedFileName);
  try {
    await clipboard.writeText(path);
    return "success";
  } catch {
    return "failed";
  }
}

export function openSkillSource(options: OpenSourceOptions): boolean {
  const normalizedURL = String(options.sourceURL || "").trim();
  if (!normalizedURL) {
    return false;
  }
  if (!options.openWindow) {
    return false;
  }
  options.openWindow(normalizedURL, "_blank", "noopener,noreferrer");
  return true;
}
