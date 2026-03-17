import { MarketplaceSkill, SkillInteractionStats } from "../../lib/api";
import { buildPrototypeSkillDetailSkill, prototypeFiles } from "./PublicSkillDetailPage.prototypeData";
import { AppLocale } from "../../lib/i18n";
import { SkillDetailCopy } from "./PublicSkillDetailPage.copy";

export { buildPrototypeSkillDetailSkill } from "./PublicSkillDetailPage.prototypeData";

export type SkillDetailDataMode = "prototype" | "live";

export interface DetailMetricEntry {
  label: string;
  value: string;
}

export interface DetailFileEntry {
  name: string;
  displayName?: string;
  size: string;
}

export type SkillDetailPresetKey = "skill" | "readme" | "changelog";

export interface DetailChipEntry {
  label: string;
  tone: "is-light" | "is-warning" | "is-neutral";
}

export interface SkillDetailViewModel {
  titleName: string;
  breadcrumb: string;
  summaryDescription: string;
  summaryMetrics: DetailMetricEntry[];
  summaryChips: DetailChipEntry[];
  qualityMetrics: DetailMetricEntry[];
  fileEntries: DetailFileEntry[];
  fileInfo: string;
  fileCodePreview: string;
  presetPreviewContent: Record<SkillDetailPresetKey, string>;
  previewLanguage: string;
  codePanelTone: "default" | "sql";
  installSteps: string[];
  metadataHeading: string;
  metadataSubheading: string;
  metadataLines: string[];
  governanceState: string;
  showMetadataAvatar: boolean;
  repositoryHostPath: string;
  repositorySlug: string;
  runtimeValue: string;
  frameworkValue: string;
  bizVersionValue: string;
  supportsHistory: boolean;
  hasCompatibilityData: boolean;
}

function normalizeQualityScore(rawValue: number): number | null {
  if (!Number.isFinite(rawValue) || rawValue <= 0) {
    return null;
  }
  if (rawValue <= 10) {
    return rawValue;
  }
  if (rawValue <= 100) {
    return rawValue / 10;
  }
  return null;
}

function formatPreviewFileDisplayName(fileName: string): string {
  if (fileName.includes("/")) {
    return `📁 ${fileName}`;
  }
  return `📄 ${fileName}`;
}

function normalizeSkillSlug(rawName: string | null | undefined): string {
  const normalized = String(rawName || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "browser-automation-pro";
}

function formatDateOnly(rawValue: string | null | undefined, locale: AppLocale): string {
  if (!rawValue) {
    return "2026-02-20";
  }
  const timestamp = new Date(rawValue).getTime();
  if (!Number.isFinite(timestamp)) {
    return "2026-02-20";
  }
  const date = new Date(timestamp);
  return date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US");
}

function formatDateTime(rawValue: string | null | undefined, locale: AppLocale): string {
  if (!rawValue) {
    return "2026-02-20 14:32";
  }
  const timestamp = new Date(rawValue).getTime();
  if (!Number.isFinite(timestamp)) {
    return "2026-02-20 14:32";
  }
  const date = new Date(timestamp);
  const datePart = date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US");
  const timePart = date.toLocaleTimeString(locale === "zh" ? "zh-CN" : "en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit"
  });
  return `${datePart} ${timePart}`;
}

function inferPreviewFiles(skill: MarketplaceSkill, slug: string, isSQLSkill: boolean): DetailFileEntry[] {
  const fromContent = String(skill.content || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const matched = line.match(/([A-Za-z0-9_./-]+\.(?:md|json|yaml|yml|txt|sh|ts|js|py|sql))/);
      return matched ? matched[1] : "";
    })
    .filter(Boolean);

  const fallbackFlowFile = isSQLSkill ? `queries/${slug}.sql` : `examples/${slug}_flow.yaml`;
  const baselineNames = ["SKILL.md", "README.md", "CHANGELOG.md", fallbackFlowFile, "scripts/install.sh"];
  const deduped = Array.from(new Set([...baselineNames, ...fromContent])).slice(0, 6);

  return deduped.map((name, index) => ({
    name,
    displayName: formatPreviewFileDisplayName(name),
    size: prototypeFiles[index]?.size || `${(index + 1).toFixed(1)}KB`
  }));
}

function inferPreviewLanguage(fileEntries: DetailFileEntry[], content: string | null | undefined, isSQLSkill: boolean): string {
  if (fileEntries.some((entry) => entry.name.toLowerCase().endsWith(".sql"))) {
    return "SQL";
  }

  const normalizedContent = String(content || "");
  if (isSQLSkill || /(select\s+.+\s+from|create\s+table|insert\s+into|update\s+\w+\s+set|explain\s+analyze)/i.test(normalizedContent)) {
    return "SQL";
  }
  return "Markdown";
}

function buildGeneratedSkillPreview(skill: MarketplaceSkill, slug: string, isSQLSkill: boolean): string {
  const installCommand = skill.install_command || `npx skillsindex install ${slug}`;
  const normalizedQualityScore = normalizeQualityScore(skill.quality_score);
  const qualityScoreLabel = normalizedQualityScore !== null ? normalizedQualityScore.toFixed(1) : "n/a";
  if (isSQLSkill) {
    return [
      `01  -- name: ${slug}`,
      "02  -- entry: SKILL.md",
      `03  -- install: ${installCommand}`,
      "04  WITH source_data AS (",
      "05    SELECT customer_id, total_amount, created_at FROM orders",
      "06  ), grouped_data AS (",
      "07    SELECT customer_id, SUM(total_amount) AS total_spend",
      "08    FROM source_data GROUP BY customer_id",
      "09  )",
      "10  SELECT customer_id, total_spend",
      "11  FROM grouped_data",
      "12  ORDER BY total_spend DESC LIMIT 50;"
    ].join("\n");
  }

  const compactSummary = String(skill.description || "Workflow automation skill with governance and observability.")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 88);
  const tagsLabel = (skill.tags || []).slice(0, 4).join(", ") || "automation, workflow, platform";
  return [
    `01  name: ${slug}`,
    "02  version: 1.0.0",
    "03  entry: SKILL.md",
    `04  category: ${skill.category || "Developer Tools"} / ${skill.subcategory || "Automation"}`,
    `05  tags: ${tagsLabel}`,
    `06  install: ${installCommand}`,
    `07  source: ${skill.source_url || `https://github.com/skillsindex/${slug}`}`,
    `08  quality_score: ${qualityScoreLabel}`,
    `09  favorites: ${skill.star_count || 0}`,
    `10  summary: ${compactSummary}`,
    "11  docs: README.md / CHANGELOG.md",
    "12  ..."
  ].join("\n");
}

function buildCodePreview(content: string | null | undefined, fallbackPreview: string): string {
  const raw = String(content || "").trim();
  if (!raw) {
    return fallbackPreview;
  }

  const lines = raw.split(/\r?\n/).slice(0, 12);
  return lines
    .map((line, index) => {
      const row = String(index + 1).padStart(2, "0");
      return `${row}  ${line}`;
    })
    .join("\n");
}

function buildReadmePreview(slug: string, summaryDescription: string, installSteps: string[]): string {
  const primaryInstallStep = installSteps[0] || `npx skillsindex install ${slug}`;
  return [
    `# ${slug}`,
    "",
    "## Overview",
    summaryDescription,
    "",
    "## Quick Start",
    `- ${primaryInstallStep.replace(/^\d+\s+/, "")}`,
    "- Validate environment variables before running workflows.",
    "- Use sandbox mode in CI before production rollout."
  ].join("\n");
}

function buildChangelogPreview(updatedAtLabel: string): string {
  return [
    "# CHANGELOG",
    "",
    "## Latest",
    `- ${updatedAtLabel}: Improved execution resilience and diagnostics.`,
    "- Updated preset metadata and compatibility annotations.",
    "",
    "## Previous",
    "- Enhanced install command safety checks.",
    "- Added recovery hints for runtime conflicts."
  ].join("\n");
}

function findFileIndexByPattern(fileEntries: DetailFileEntry[], patterns: RegExp[]): number {
  for (const [index, entry] of fileEntries.entries()) {
    const normalizedName = String(entry.name || "").toLowerCase();
    if (patterns.some((pattern) => pattern.test(normalizedName))) {
      return index;
    }
  }
  return -1;
}

export function resolvePresetForFileName(fileName: string): SkillDetailPresetKey {
  const normalizedName = String(fileName || "").toLowerCase();
  if (/readme\.md$/i.test(normalizedName) || /readme/i.test(normalizedName)) {
    return "readme";
  }
  if (/changelog\.md$/i.test(normalizedName) || /change[-_]?log/i.test(normalizedName) || /release[-_]?notes/i.test(normalizedName)) {
    return "changelog";
  }
  return "skill";
}

export function resolveFileIndexForPreset(
  preset: SkillDetailPresetKey,
  fileEntries: DetailFileEntry[],
  fallbackIndex = 0
): number {
  if (fileEntries.length === 0) {
    return 0;
  }
  const boundedFallbackIndex = Math.max(0, Math.min(fallbackIndex, fileEntries.length - 1));
  const fallbackEntry = fileEntries[boundedFallbackIndex];
  const fallbackPreset = resolvePresetForFileName(fallbackEntry?.name || "");

  if (preset === "readme") {
    if (fallbackPreset === "readme") {
      return boundedFallbackIndex;
    }
    const readmeIndex = findFileIndexByPattern(fileEntries, [/readme\.md$/i, /readme/i]);
    return readmeIndex >= 0 ? readmeIndex : boundedFallbackIndex;
  }

  if (preset === "changelog") {
    if (fallbackPreset === "changelog") {
      return boundedFallbackIndex;
    }
    const changelogIndex = findFileIndexByPattern(fileEntries, [/changelog\.md$/i, /change[-_]?log/i, /release[-_]?notes/i, /history/i]);
    return changelogIndex >= 0 ? changelogIndex : boundedFallbackIndex;
  }

  if (fallbackPreset === "skill") {
    return boundedFallbackIndex;
  }

  const sqlIndex = findFileIndexByPattern(fileEntries, [/\.sql$/i, /migration/i, /query/i]);
  if (sqlIndex >= 0) {
    return sqlIndex;
  }
  const skillIndex = findFileIndexByPattern(fileEntries, [/skill\.md$/i, /skill/i]);
  if (skillIndex >= 0) {
    return skillIndex;
  }
  return boundedFallbackIndex;
}


function resolveLabelPrefix(rawLabel: string, fallbackLabel: string): string {
  const normalized = String(rawLabel || "").split(/[:：]/)[0]?.trim();
  return normalized || fallbackLabel;
}

function inferRepositoryLabel(skill: MarketplaceSkill, slug: string): string {
  if (!skill.source_url) {
    return `github.com/skillsindex/${slug}`;
  }
  try {
    const parsed = new URL(skill.source_url);
    const compactPath = parsed.pathname.replace(/^\/+/, "");
    return compactPath ? `${parsed.host}/${compactPath}` : parsed.host;
  } catch {
    return skill.source_url;
  }
}

function formatPreviewSize(content: string | null | undefined): string {
  const rawLength = String(content || "").trim().length;
  const normalizedLength = Math.max(rawLength, 64);
  return `${(normalizedLength / 1024).toFixed(1)}KB`;
}

function buildLiveFileEntries(previewLanguage: string, content: string | null | undefined): DetailFileEntry[] {
  const primaryFileName = previewLanguage === "SQL" ? "QUERY.sql" : "SKILL.md";
  return [
    {
      name: primaryFileName,
      displayName: formatPreviewFileDisplayName(primaryFileName),
      size: formatPreviewSize(content)
    }
  ];
}

export function resolveSkillDetailDataMode(rawMode: string | undefined, overrideMode?: string): SkillDetailDataMode {
  const override = String(overrideMode || "").trim().toLowerCase();
  if (override === "prototype" || override === "live") {
    return override;
  }
  const normalized = String(rawMode || "").trim().toLowerCase();
  return normalized === "prototype" ? "prototype" : "live";
}

export function resolveSkillDetailViewSkill(
  skill: MarketplaceSkill | null,
  targetSkillID: number,
  dataMode: SkillDetailDataMode
): MarketplaceSkill | null {
  if (skill) {
    return skill;
  }
  if (dataMode === "prototype") {
    return buildPrototypeSkillDetailSkill(targetSkillID);
  }
  return null;
}

export function buildEmptySkillDetailViewModel(text: SkillDetailCopy): SkillDetailViewModel {
  return {
    titleName: text.title,
    breadcrumb: text.breadcrumbRoot,
    summaryDescription: "",
    summaryMetrics: [],
    summaryChips: [],
    qualityMetrics: [],
    fileEntries: [],
    fileInfo: "",
    fileCodePreview: "",
    presetPreviewContent: {
      skill: "",
      readme: "",
      changelog: ""
    },
    previewLanguage: "",
    codePanelTone: "default",
    installSteps: [],
    metadataHeading: "",
    metadataSubheading: "",
    metadataLines: [],
    governanceState: "",
    showMetadataAvatar: false,
    repositoryHostPath: "",
    repositorySlug: "",
    runtimeValue: "",
    frameworkValue: "",
    bizVersionValue: "",
    supportsHistory: false,
    hasCompatibilityData: false
  };
}

export function buildSkillDetailViewModel(
  skill: MarketplaceSkill,
  locale: AppLocale,
  text: SkillDetailCopy,
  interactionStats?: SkillInteractionStats | null,
  dataMode: SkillDetailDataMode = "prototype"
): SkillDetailViewModel {
  const slug = normalizeSkillSlug(skill.name);
  const normalizedScore = normalizeQualityScore(skill.quality_score);
  const isSQLSkill = /sql|postgres|mysql|sqlite|database|query/i.test(
    `${skill.name || ""} ${skill.description || ""} ${skill.category || ""} ${skill.subcategory || ""} ${(skill.tags || []).join(" ")}`
  );
  const favoriteCount = Number.isFinite(interactionStats?.favorite_count)
    ? Math.max(0, Math.trunc(interactionStats?.favorite_count || 0))
    : Math.max(0, Math.trunc(skill.star_count || 0));
  const ratingCount = Number.isFinite(interactionStats?.rating_count)
    ? Math.max(0, Math.trunc(interactionStats?.rating_count || 0))
    : 0;
  const safeRatingAverage = Number.isFinite(interactionStats?.rating_average)
    ? Math.max(0, Math.min(5, Number(interactionStats?.rating_average || 0)))
    : 0;
  const ratingValue = ratingCount > 0 ? `${safeRatingAverage.toFixed(1)} / 5.0 (${ratingCount})` : text.ratingUnavailable;
  const summaryInstallValue = skill.install_command ? text.installCommandAvailable : text.installCommandMissing;
  const summaryRatingValue = `${favoriteCount}  ·  ${ratingValue}`;
  const summaryReleaseValue = formatDateTime(skill.updated_at, locale);
  const summaryDescription = String(skill.description || text.summaryDescription).trim() || text.summaryDescription;
  const qualityScore = normalizedScore !== null ? normalizedScore.toFixed(1) : text.metricUnavailable;
  const repositoryHostPath = inferRepositoryLabel(skill, slug);
  const releaseDateLabel = formatDateOnly(skill.updated_at, locale);

  if (dataMode === "live") {
    const fileEntries = buildLiveFileEntries(isSQLSkill ? "SQL" : "Markdown", skill.content);
    const previewLanguage = inferPreviewLanguage(fileEntries, skill.content, isSQLSkill);
    const livePreviewContent = buildCodePreview(skill.content, String(skill.description || "").trim() || text.summaryDescription);
    const primaryFileName = fileEntries[0]?.name || "SKILL.md";
    const fileInfo = text.fileInfoLabel
      .replace("SKILL.md", primaryFileName)
      .replace("/browser-automation-pro/", `/${slug}/`)
      .replace("2026-02-20 14:32", formatDateTime(skill.updated_at, locale));

    return {
      titleName: String(skill.name || "").trim() || slug,
      breadcrumb: text.breadcrumb.replace("browser-automation-pro", String(skill.name || "").trim() || slug),
      summaryDescription,
      summaryMetrics: [
        { label: text.installCount, value: summaryInstallValue },
        { label: text.favoriteRating, value: summaryRatingValue },
        { label: text.recentRelease, value: summaryReleaseValue }
      ],
      summaryChips: [],
      qualityMetrics: qualityScore === text.metricUnavailable ? [] : [{ label: text.qualityScore, value: qualityScore }],
      fileEntries,
      fileInfo,
      fileCodePreview: livePreviewContent,
      presetPreviewContent: {
        skill: livePreviewContent,
        readme: livePreviewContent,
        changelog: livePreviewContent
      },
      previewLanguage,
      codePanelTone: previewLanguage === "SQL" ? "sql" : "default",
      installSteps: skill.install_command ? [skill.install_command] : [text.installCommandMissing],
      metadataHeading: repositoryHostPath,
      metadataSubheading: "",
      metadataLines: [
        `${resolveLabelPrefix(text.categoryLine, "Category")}: ${skill.category || text.metricUnavailable} / ${skill.subcategory || text.metricUnavailable}`,
        `${resolveLabelPrefix(text.tagsLine, "Tags")}: ${(skill.tags || []).join(", ") || text.metricUnavailable}`
      ],
      governanceState: "",
      showMetadataAvatar: false,
      repositoryHostPath,
      repositorySlug: slug,
      runtimeValue: "",
      frameworkValue: "",
      bizVersionValue: "",
      supportsHistory: false,
      hasCompatibilityData: false
    };
  }

  const securityScore = text.metricUnavailable;
  const docsScore = text.metricUnavailable;
  const fileEntries = inferPreviewFiles(skill, slug, isSQLSkill);
  const generatedSkillPreview = buildGeneratedSkillPreview(skill, slug, isSQLSkill);
  const previewLanguage = inferPreviewLanguage(fileEntries, skill.content, isSQLSkill);
  const codePanelTone = previewLanguage === "SQL" ? "sql" : "default";
  const fileInfo = text.fileInfoLabel
    .replace("/browser-automation-pro/", `/${slug}/`)
    .replace("2026-02-20 14:32", formatDateTime(skill.updated_at, locale));
  const runtimeValue = text.runtimeValue;
  const frameworkValue = text.frameworkValue;
  const bizVersionValue = text.bizVersionValue;
  const installCommand = String(skill.install_command || "").trim();
  const installSteps = installCommand
    ? [
        `1  ${installCommand}`,
        `2  workspace enable ${slug}`,
        `3  workspace verify ${slug}`,
        `4  workspace rollback ${slug}  (if needed)`
      ]
    : [text.installCommandMissing];
  const presetPreviewContent: Record<SkillDetailPresetKey, string> = {
    skill: buildCodePreview(skill.content, generatedSkillPreview),
    readme: buildReadmePreview(slug, summaryDescription, installSteps),
    changelog: buildChangelogPreview(releaseDateLabel)
  };

  return {
    titleName: slug,
    breadcrumb: text.breadcrumb.replace("browser-automation-pro", slug),
    summaryDescription,
    summaryMetrics: [
      { label: text.installCount, value: summaryInstallValue },
      { label: text.favoriteRating, value: summaryRatingValue },
      { label: text.recentRelease, value: summaryReleaseValue }
    ],
    summaryChips: [
      { label: text.officialVerified, tone: "is-light" },
      { label: text.riskFlag, tone: "is-warning" }
    ],
    qualityMetrics: [
      { label: text.qualityScore, value: qualityScore },
      { label: text.securityScore, value: securityScore },
      { label: text.docsScore, value: docsScore }
    ],
    fileEntries,
    fileInfo,
    fileCodePreview: presetPreviewContent.skill,
    presetPreviewContent,
    previewLanguage,
    codePanelTone,
    installSteps,
    metadataHeading: text.auditor,
    metadataSubheading: repositoryHostPath,
    metadataLines: [
      text.licenseLine,
      `${resolveLabelPrefix(text.categoryLine, "Category")}: ${skill.category || "Developer Tools"} / ${skill.subcategory || "Quality Assurance"}`,
      `${resolveLabelPrefix(text.tagsLine, "Tags")}: ${(skill.tags || []).slice(0, 4).join(", ") || "browser, playwright, odoo, ci"}`
    ],
    governanceState: text.governanceState,
    showMetadataAvatar: true,
    repositoryHostPath,
    repositorySlug: slug,
    runtimeValue,
    frameworkValue,
    bizVersionValue,
    supportsHistory: true,
    hasCompatibilityData: true
  };
}
