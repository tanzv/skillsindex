import type { MarketplaceSkill } from "../lib/api";
import type { AppLocale } from "../lib/i18n";
import { PrototypeCardEntry } from "./MarketplaceHomePage.helpers";

interface BuildMergedLatestCardsInput {
  items: MarketplaceSkill[];
  pageSize: number;
  locale: AppLocale;
  isLightTheme: boolean;
  useSkillPayload: boolean;
  fallbackLatestCards: PrototypeCardEntry[];
}

export function buildMergedLatestCards({
  items,
  pageSize,
  locale,
  isLightTheme,
  useSkillPayload,
  fallbackLatestCards
}: BuildMergedLatestCardsInput): PrototypeCardEntry[] {
  if (!useSkillPayload) {
    return fallbackLatestCards;
  }

  if (items.length === 0) {
    return [];
  }

  const normalizedPageSize = Math.max(1, pageSize);
  const cardsPerPage = Math.max(1, fallbackLatestCards.length);
  const mergedLatestCards: PrototypeCardEntry[] = [];
  for (let index = 0; index < items.length; index += normalizedPageSize) {
    const pageItems = items.slice(index, index + normalizedPageSize);
    const visiblePageItems = pageItems.slice(0, cardsPerPage);
    visiblePageItems.forEach((skill, itemIndex) => {
      const templateCard = fallbackLatestCards[itemIndex % cardsPerPage];
      if (!templateCard) {
        return;
      }
      mergedLatestCards.push(buildCardFromSkill(skill, templateCard, itemIndex, locale, isLightTheme));
    });
  }

  if (mergedLatestCards.length === 0) {
    return [];
  }

  return mergedLatestCards;
}

function buildCardFromSkill(
  skill: MarketplaceSkill,
  templateCard: PrototypeCardEntry,
  indexInPage: number,
  locale: AppLocale,
  isLightTheme: boolean
): PrototypeCardEntry {
  return {
    ...templateCard,
    code: buildCardCode(skill, templateCard.code),
    chips: buildCardChips(skill, templateCard.chips),
    title: String(skill.name || "").trim() || templateCard.title,
    subtitle: buildCardSubtitle(skill, templateCard.subtitle, locale),
    meta: buildCardMeta(skill, templateCard.meta),
    coverImageURL: resolveCardCover(templateCard.coverImageURL, isLightTheme, indexInPage),
    skillID: skill.id
  };
}

function buildCardCode(skill: MarketplaceSkill, fallbackCode: string): string {
  const source = String(skill.name || skill.tags[0] || "").trim();
  const tokens = source
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .slice(0, 2);
  if (tokens.length === 0) {
    return fallbackCode;
  }
  const code = tokens.map((token) => token.charAt(0).toUpperCase()).join("");
  return code || fallbackCode;
}

function normalizeChip(raw: string): string {
  const normalized = String(raw || "")
    .trim()
    .replace(/[_-]+/g, " ");
  if (!normalized) {
    return "";
  }
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

function buildCardChips(skill: MarketplaceSkill, fallbackChips: [string, string]): [string, string] {
  const primary = normalizeChip(skill.tags[0] || "");
  const secondary = normalizeChip(skill.tags[1] || "");
  return [
    primary || fallbackChips[0],
    secondary || fallbackChips[1]
  ];
}

function buildCardSubtitle(skill: MarketplaceSkill, fallbackSubtitle: string, locale: AppLocale): string {
  const description = String(skill.description || "").trim();
  if (description) {
    return description;
  }
  const tags = skill.tags.filter(Boolean).slice(0, 2);
  if (tags.length === 0) {
    return fallbackSubtitle;
  }
  const prefix = locale === "zh" ? "Tags" : "Tags";
  return `${prefix}: ${tags.join(" / ")}`;
}

function buildCardMeta(skill: MarketplaceSkill, fallbackMeta: string): string {
  const qualityScore = Number(skill.quality_score);
  const starCount = Number(skill.star_count);
  if (Number.isFinite(qualityScore) && Number.isFinite(starCount)) {
    return `Score ${qualityScore.toFixed(1)} · Stars ${starCount}`;
  }
  if (Number.isFinite(qualityScore)) {
    return `Score ${qualityScore.toFixed(1)}`;
  }
  if (Number.isFinite(starCount)) {
    return `Stars ${starCount}`;
  }
  return fallbackMeta;
}

function resolveCardCover(currentCover: string, _isLightTheme: boolean, _indexInPage: number): string {
  return currentCover;
}
