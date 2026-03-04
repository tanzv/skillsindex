import { MarketplaceSkill, SkillInteractionStats, fetchPublicMarketplace } from "../lib/api";
import { AppLocale } from "../lib/i18n";
import { SkillDetailCopy } from "./PublicSkillDetailPage.copy";

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

export interface SkillDetailViewModel {
  titleName: string;
  breadcrumb: string;
  summaryDescription: string;
  summaryMetrics: DetailMetricEntry[];
  qualityMetrics: DetailMetricEntry[];
  fileEntries: DetailFileEntry[];
  fileInfo: string;
  fileCodePreview: string;
  presetPreviewContent: Record<SkillDetailPresetKey, string>;
  previewLanguage: string;
  codePanelTone: "default" | "sql";
  installSteps: string[];
  metadataLines: string[];
  governanceState: string;
  governanceAuditor: string;
  repositoryHostPath: string;
  repositorySlug: string;
  runtimeValue: string;
  frameworkValue: string;
  bizVersionValue: string;
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

const prototypeCodePreview = [
  "01  name: browser-automation-pro",
  "02  version: 2.4.1",
  "03  entry: SKILL.md",
  "04  capabilities: record_and_replay, assert_state, export_trace_and_report",
  "05  required_inputs: BASE_URL, TOKEN, timeout_ms=30000",
  "06  output_artifacts: report.json, trace.zip, screenshots/",
  "07  compatibility: Odoo 16/17, Playwright >=1.40",
  "08  runtime: Node 20, Python 3.11",
  "09  maintainer: qa-platform@example.com",
  "10  updated_at: 2026-02-20",
  "11  docs: README.md / CHANGELOG.md",
  "12  ..."
].join("\n");

const prototypeSQLCodePreview = [
  "-- migration: 2026_02_20_optimize_orders.sql",
  "WITH paid_orders AS (",
  "  SELECT id, customer_id, total_amount, created_at",
  "  FROM orders",
  "  WHERE status = 'PAID'",
  "    AND created_at >= NOW() - INTERVAL '30 days'",
  "), ranked_orders AS (",
  "  SELECT customer_id, SUM(total_amount) AS total_spend",
  "  FROM paid_orders",
  "  GROUP BY customer_id",
  ")",
  "SELECT customer_id, total_spend FROM ranked_orders ORDER BY total_spend DESC LIMIT 50;"
].join("\n");

const prototypeFiles: DetailFileEntry[] = [
  { name: "SKILL.md", displayName: "📄 SKILL.md", size: "2.1KB" },
  { name: "README.md", displayName: "📄 README.md", size: "4.8KB" },
  { name: "CHANGELOG.md", displayName: "📄 CHANGELOG.md", size: "3.2KB" },
  { name: "examples/odoo_login_flow.yaml", displayName: "📁 examples/odoo_login_flow.yaml", size: "1.3KB" },
  { name: "scripts/install.sh", displayName: "📁 scripts/install.sh", size: "0.8KB" }
];

interface PrototypeSkillPreset {
  name: string;
  description: string;
  content: string;
  category: string;
  subcategory: string;
  tags: string[];
  source_type: string;
  source_url: string;
  star_count: number;
  quality_score: number;
  install_command: string;
}

const prototypeSkillPresetsByID: Record<number, PrototypeSkillPreset> = {
  974: {
    name: "sql-performance-lab",
    description: "Optimize SQL execution plans, index strategy, and query stability for transactional workloads.",
    content: prototypeSQLCodePreview,
    category: "Data Platform",
    subcategory: "SQL Optimization",
    tags: ["sql", "query-plan", "postgresql", "indexing"],
    source_type: "verified_community",
    source_url: "https://github.com/skillsindex/sql-performance-lab",
    star_count: 932,
    quality_score: 96.4,
    install_command: "npx skillsindex install sql-performance-lab"
  }
};

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

  if (preset === "readme") {
    const readmeIndex = findFileIndexByPattern(fileEntries, [/readme\.md$/i, /readme/i]);
    return readmeIndex >= 0 ? readmeIndex : Math.min(fallbackIndex, fileEntries.length - 1);
  }

  if (preset === "changelog") {
    const changelogIndex = findFileIndexByPattern(fileEntries, [/changelog\.md$/i, /change[-_]?log/i, /release[-_]?notes/i, /history/i]);
    return changelogIndex >= 0 ? changelogIndex : Math.min(fallbackIndex, fileEntries.length - 1);
  }

  const sqlIndex = findFileIndexByPattern(fileEntries, [/\.sql$/i, /migration/i, /query/i]);
  if (sqlIndex >= 0) {
    return sqlIndex;
  }
  const skillIndex = findFileIndexByPattern(fileEntries, [/skill\.md$/i, /skill/i]);
  if (skillIndex >= 0) {
    return skillIndex;
  }
  return Math.min(fallbackIndex, fileEntries.length - 1);
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

export function resolveSkillDetailDataMode(rawMode: string | undefined, overrideMode?: string): SkillDetailDataMode {
  const override = String(overrideMode || "").trim().toLowerCase();
  if (override === "prototype" || override === "live") {
    return override;
  }
  const normalized = String(rawMode || "").trim().toLowerCase();
  return normalized === "prototype" ? "prototype" : "live";
}

export function buildPrototypeSkillDetailSkill(targetSkillID: number): MarketplaceSkill {
  const resolvedID = Number.isFinite(targetSkillID) && targetSkillID > 0 ? Math.round(targetSkillID) : 901;
  const preset = prototypeSkillPresetsByID[resolvedID];
  if (preset) {
    return {
      id: resolvedID,
      name: preset.name,
      description: preset.description,
      content: preset.content,
      category: preset.category,
      subcategory: preset.subcategory,
      tags: preset.tags,
      source_type: preset.source_type,
      source_url: preset.source_url,
      star_count: preset.star_count,
      quality_score: preset.quality_score,
      install_command: preset.install_command,
      updated_at: "2026-02-20T14:32:00Z"
    };
  }

  return {
    id: resolvedID,
    name: "browser-automation-pro",
    description:
      "End-to-end browser automation for commerce and Odoo workflows, covering replay, assertions, retry handling, reporting, and trace export.",
    content: prototypeCodePreview,
    category: "Developer Tools",
    subcategory: "Quality Assurance",
    tags: ["browser", "playwright", "odoo", "ci"],
    source_type: "official",
    source_url: "https://github.com/skillsindex/browser-automation-pro",
    star_count: 812,
    quality_score: 97.8,
    install_command: "npx skillsindex install browser-automation-pro",
    updated_at: "2026-02-20T14:32:00Z"
  };
}

export function buildSkillDetailViewModel(
  skill: MarketplaceSkill,
  locale: AppLocale,
  text: SkillDetailCopy,
  interactionStats?: SkillInteractionStats | null
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
  const summaryRatingValue = `${favoriteCount}  \u00b7  ${ratingValue}`;
  const summaryReleaseValue = formatDateTime(skill.updated_at, locale);
  const summaryDescription = String(skill.description || text.summaryDescription).trim() || text.summaryDescription;
  const qualityScore = normalizedScore !== null ? normalizedScore.toFixed(1) : text.metricUnavailable;
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
  const releaseDateLabel = formatDateOnly(skill.updated_at, locale);
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
    metadataLines: [
      text.licenseLine,
      `${text.categoryLine.split(":")[0]}: ${skill.category || "Developer Tools"} / ${skill.subcategory || "Quality Assurance"}`,
      `${text.tagsLine.split(":")[0]}: ${(skill.tags || []).slice(0, 4).join(", ") || "browser, playwright, odoo, ci"}`,
      `${text.releasedLine.split(":")[0]}: ${formatDateOnly(skill.updated_at, locale)}`
    ],
    governanceState: text.governanceState,
    governanceAuditor: text.auditor,
    repositoryHostPath: inferRepositoryLabel(skill, slug),
    repositorySlug: slug,
    runtimeValue,
    frameworkValue,
    bizVersionValue
  };
}

export async function findSkillInPublicCatalog(targetSkillID: number): Promise<MarketplaceSkill | null> {
  if (!Number.isFinite(targetSkillID) || targetSkillID <= 0) {
    return null;
  }

  const first = await fetchPublicMarketplace({ page: 1, sort: "recent" });
  const direct = first.items.find((item) => item.id === targetSkillID);
  if (direct) {
    return direct;
  }

  const totalPages = Math.max(first.pagination.total_pages, 1);
  const upperBound = Math.min(totalPages, 32);
  for (let page = 2; page <= upperBound; page += 1) {
    const payload = await fetchPublicMarketplace({ page, sort: "recent" });
    const matched = payload.items.find((item) => item.id === targetSkillID);
    if (matched) {
      return matched;
    }
  }
  return null;
}
