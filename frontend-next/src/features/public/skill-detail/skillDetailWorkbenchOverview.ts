import type { PublicMarketplaceMessages } from "@/src/lib/i18n/publicMessages";
import type {
  PublicSkillDetailResponse,
  PublicSkillResourceContentResponse,
  PublicSkillResourcesResponse
} from "@/src/lib/schemas/public";

export interface SkillDetailOverviewModel {
  summary: string;
  previewTitle: string;
  previewLanguage: string;
  previewContent: string;
  previewUpdatedAt: string | null;
  sections: SkillDetailOverviewSection[];
}

export interface SkillDetailOverviewSection {
  title: string;
  description: string;
  points: string[];
}

interface BuildSkillDetailOverviewModelOptions {
  detail: Pick<PublicSkillDetailResponse, "skill">;
  resourceContent: PublicSkillResourceContentResponse | null;
  resources: PublicSkillResourcesResponse | null;
  messages: Pick<
    PublicMarketplaceMessages,
    "skillDetailContentTitle" | "skillDetailSelectFile" | "skillDetailUnknownLanguage"
  >;
}

const preferredSectionPattern = /(overview|summary|what|when|why|use|usage|workflow|capabilit|output|result|return)/i;
const ignoredSectionPattern = /(license|history|changelog|release|version|author|maintainer)/i;

function normalizeOverviewLine(value: string): string {
  return String(value || "").replace(/^\s*\d+\s+/, "").trim();
}

function normalizeHeadingTitle(value: string): string {
  return value
    .replace(/^#+\s*/, "")
    .replace(/[_*-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldUseHeading(title: string): boolean {
  if (!title) {
    return false;
  }

  if (ignoredSectionPattern.test(title)) {
    return false;
  }

  return true;
}

function extractOverviewSections(rawContent: string): SkillDetailOverviewSection[] {
  const lines = String(rawContent || "").split(/\r?\n/);
  const sections: Array<SkillDetailOverviewSection & { originalIndex: number; score: number }> = [];
  let currentTitle = "";
  let currentDescriptionLines: string[] = [];
  let currentPoints: string[] = [];

  function flushSection(): void {
    if (!shouldUseHeading(currentTitle)) {
      currentTitle = "";
      currentDescriptionLines = [];
      currentPoints = [];
      return;
    }

    const description = currentDescriptionLines.join(" ").trim();
    const points = currentPoints
      .map((point) => point.trim())
      .filter(Boolean)
      .slice(0, 4);

    if (!description && points.length === 0) {
      currentTitle = "";
      currentDescriptionLines = [];
      currentPoints = [];
      return;
    }

    sections.push({
      title: currentTitle,
      description,
      points,
      originalIndex: sections.length,
      score: preferredSectionPattern.test(currentTitle) ? 2 : 1
    });

    currentTitle = "";
    currentDescriptionLines = [];
    currentPoints = [];
  }

  for (const rawLine of lines) {
    const line = normalizeOverviewLine(rawLine);
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    if (/^#{2,3}\s+/.test(trimmed)) {
      flushSection();
      currentTitle = normalizeHeadingTitle(trimmed);
      continue;
    }

    if (!currentTitle) {
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      currentPoints.push(trimmed.replace(/^[-*]\s+/, "").trim());
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      currentPoints.push(trimmed.replace(/^\d+\.\s+/, "").trim());
      continue;
    }

    currentDescriptionLines.push(trimmed);
  }

  flushSection();

  return sections
    .sort((left, right) => right.score - left.score || left.originalIndex - right.originalIndex)
    .slice(0, 2)
    .map(({ title, description, points }) => ({
      title,
      description,
      points
    }));
}

export function buildSkillDetailOverviewModel({
  detail,
  resourceContent,
  resources,
  messages
}: BuildSkillDetailOverviewModelOptions): SkillDetailOverviewModel {
  const selectedFile = resources?.files.find((file) => file.name === resourceContent?.path) || resources?.files[0] || null;
  const summary = String(detail.skill.description || "").trim();

  return {
    summary,
    previewTitle: resourceContent?.display_name || selectedFile?.display_name || messages.skillDetailContentTitle,
    previewLanguage: resourceContent?.language || selectedFile?.language || messages.skillDetailUnknownLanguage,
    previewContent: resourceContent?.content || detail.skill.content || messages.skillDetailSelectFile,
    previewUpdatedAt: resourceContent?.updated_at || null,
    sections: extractOverviewSections(resourceContent?.content || detail.skill.content || "")
  };
}
