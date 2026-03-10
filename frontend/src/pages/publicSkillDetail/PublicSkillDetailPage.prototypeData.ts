import { MarketplaceSkill } from "../../lib/api";

export interface PrototypeDetailFileEntry {
  name: string;
  displayName?: string;
  size: string;
}

export const prototypeCodePreview = [
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

export const prototypeSQLCodePreview = [
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

export const prototypeFiles: PrototypeDetailFileEntry[] = [
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
