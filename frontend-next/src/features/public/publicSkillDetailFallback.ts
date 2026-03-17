import type {
  PublicSkillDetailResponse,
  PublicSkillResourceContentResponse,
  PublicSkillResourcesResponse,
  PublicSkillVersionsResponse
} from "@/src/lib/schemas/public";

import { fallbackSkills, resolvePublicMarketplaceFallbackSkill } from "./publicMarketplaceFallback";

type FallbackSkill = (typeof fallbackSkills)[number];

interface FallbackResourceFile {
  name: string;
  display_name: string;
  language: string;
  content: string;
}

function buildFallbackReadmeContent(skill: FallbackSkill): string {
  const installCommand =
    String(skill.install_command || "").trim() ||
    "Install the skill using the marketplace command available in your environment.";

  return [
    `# ${skill.name}`,
    "",
    "## Overview",
    skill.description,
    "",
    "## Quick Start",
    `- ${installCommand}`,
    "- Review the local SKILL.md file before execution.",
    "- Validate workspace access before enabling automation."
  ].join("\n");
}

function buildFallbackChangelogContent(skill: FallbackSkill): string {
  return [
    "# CHANGELOG",
    "",
    "## Latest",
    `- ${skill.updated_at}: Refined marketplace summary and preview metadata.`,
    "- Added dedicated SKILL.md, README.md, and CHANGELOG.md previews.",
    "",
    "## Previous",
    "- Expanded installation guidance for workspace operators.",
    "- Updated resource metadata for repository alignment."
  ].join("\n");
}

function buildFallbackResourceFiles(skill: FallbackSkill): FallbackResourceFile[] {
  return [
    {
      name: "SKILL.md",
      display_name: "SKILL.md",
      language: "Markdown",
      content: skill.content
    },
    {
      name: "README.md",
      display_name: "README.md",
      language: "Markdown",
      content: buildFallbackReadmeContent(skill)
    },
    {
      name: "CHANGELOG.md",
      display_name: "CHANGELOG.md",
      language: "Markdown",
      content: buildFallbackChangelogContent(skill)
    }
  ];
}

function buildDetailResponse(skillId: number): PublicSkillDetailResponse {
  const skill = resolvePublicMarketplaceFallbackSkill(skillId) || fallbackSkills[0];

  return {
    skill,
    stats: {
      favorite_count: Math.max(skill.star_count - 80, 12),
      rating_count: Math.max(skill.star_count - 95, 8),
      rating_average: skill.quality_score,
      comment_count: 2
    },
    viewer_state: {
      can_interact: false,
      favorited: false,
      rated: false,
      rating: 0
    },
    comments: [
      {
        id: 1,
        username: "ops.lead",
        display_name: "Ops Lead",
        content: "Useful baseline for release and recovery coordination.",
        created_at: "2026-03-10T09:30:00Z",
        can_delete: false
      },
      {
        id: 2,
        username: "platform.owner",
        display_name: "Platform Owner",
        content: "Good starting point for operational guardrails and follow-up runbooks.",
        created_at: "2026-03-11T13:15:00Z",
        can_delete: false
      }
    ],
    comments_limit: 80
  };
}

function buildResourcesResponse(skillId: number): PublicSkillResourcesResponse {
  const skill = resolvePublicMarketplaceFallbackSkill(skillId) || fallbackSkills[0];
  const files = buildFallbackResourceFiles(skill).map((file) => ({
    name: file.name,
    display_name: file.display_name,
    size_bytes: file.content.length,
    size_label: `${file.content.length} B`,
    language: file.language
  }));

  return {
    skill_id: skill.id,
    source_type: skill.source_type,
    source_url: skill.source_url,
    repo_url: skill.source_url,
    source_branch: "main",
    source_path: "SKILL.md",
    install_command: skill.install_command,
    updated_at: skill.updated_at,
    file_count: files.length,
    files
  };
}

export function buildPublicSkillFallbackResourceContent(
  skillId: number,
  requestedPath?: string
): PublicSkillResourceContentResponse | null {
  const skill = resolvePublicMarketplaceFallbackSkill(skillId) || fallbackSkills[0];
  const normalizedPath = String(requestedPath || "").trim() || "SKILL.md";
  const selectedFile = buildFallbackResourceFiles(skill).find((file) => file.name === normalizedPath);

  if (!selectedFile) {
    return null;
  }

  return {
    skill_id: skill.id,
    path: selectedFile.name,
    display_name: selectedFile.display_name,
    language: selectedFile.language,
    size_bytes: selectedFile.content.length,
    size_label: `${selectedFile.content.length} B`,
    content: selectedFile.content,
    updated_at: skill.updated_at
  };
}

function buildResourceContentResponse(skillId: number): PublicSkillResourceContentResponse {
  const content = buildPublicSkillFallbackResourceContent(skillId, "SKILL.md");
  if (!content) {
    throw new Error("Fallback skill preview content for SKILL.md is unavailable.");
  }
  return content;
}

function buildVersionsResponse(skillId: number): PublicSkillVersionsResponse {
  const skill = resolvePublicMarketplaceFallbackSkill(skillId) || fallbackSkills[0];

  return {
    items: [
      {
        id: skill.id * 10 + 1,
        skill_id: skill.id,
        version_number: 3,
        trigger: "sync",
        change_summary: "Aligned summary, tags, and rollout guidance with the latest operating model.",
        risk_level: "low",
        captured_at: "2026-03-10T08:00:00Z",
        actor_username: "system",
        actor_display_name: "System",
        tags: ["sync", "marketplace"],
        changed_fields: ["description", "content"]
      },
      {
        id: skill.id * 10 + 2,
        skill_id: skill.id,
        version_number: 2,
        trigger: "manual",
        change_summary: "Expanded installation and execution notes for operators.",
        risk_level: "medium",
        captured_at: "2026-03-08T14:20:00Z",
        actor_username: "ops.lead",
        actor_display_name: "Ops Lead",
        tags: ["manual"],
        changed_fields: ["install_command", "content"]
      }
    ],
    total: 2
  };
}

export function resolvePublicSkillFallback(skillId: number) {
  return resolvePublicMarketplaceFallbackSkill(skillId);
}

export function buildPublicSkillDetailFallback(skillId: number): {
  detail: PublicSkillDetailResponse;
  resources: PublicSkillResourcesResponse;
  versions: PublicSkillVersionsResponse;
  resourceContent: PublicSkillResourceContentResponse;
} {
  const resolvedSkillId = resolvePublicMarketplaceFallbackSkill(skillId)?.id || fallbackSkills[0]?.id || skillId;

  return {
    detail: buildDetailResponse(resolvedSkillId),
    resources: buildResourcesResponse(resolvedSkillId),
    versions: buildVersionsResponse(resolvedSkillId),
    resourceContent: buildResourceContentResponse(resolvedSkillId)
  };
}
