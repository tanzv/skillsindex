import { asArray, asNumber, asObject, asString } from "./shared";

export interface ModerationCaseItem {
  id: number;
  reporterUserId: number;
  resolverUserId: number;
  targetType: string;
  skillId: number;
  commentId: number;
  reasonCode: string;
  reasonDetail: string;
  status: string;
  action: string;
  resolutionNote: string;
  resolvedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModerationCasesPayload {
  total: number;
  items: ModerationCaseItem[];
}

export interface ModerationOverview {
  metrics: Array<{ label: string; value: string }>;
  selectedCase: ModerationCaseItem | null;
  reasonSummary: Array<{ reason: string; count: number }>;
}

export function normalizeModerationCasesPayload(payload: unknown): ModerationCasesPayload {
  const record = asObject(payload);
  const items = asArray<Record<string, unknown>>(record.items);

  return {
    total: asNumber(record.total) || items.length,
    items: items.map((item) => ({
      id: asNumber(item.id),
      reporterUserId: asNumber(item.reporter_user_id),
      resolverUserId: asNumber(item.resolver_user_id),
      targetType: asString(item.target_type) || "unknown",
      skillId: asNumber(item.skill_id),
      commentId: asNumber(item.comment_id),
      reasonCode: asString(item.reason_code) || "unspecified",
      reasonDetail: asString(item.reason_detail),
      status: asString(item.status) || "open",
      action: asString(item.action) || "none",
      resolutionNote: asString(item.resolution_note),
      resolvedAt: asString(item.resolved_at),
      createdAt: asString(item.created_at),
      updatedAt: asString(item.updated_at)
    }))
  };
}

export function buildModerationOverview(payload: ModerationCasesPayload, selectedCaseId = 0): ModerationOverview {
  const selectedCase = payload.items.find((item) => item.id === selectedCaseId) || payload.items[0] || null;
  const openCount = payload.items.filter((item) => item.status.toLowerCase() === "open").length;
  const resolvedCount = payload.items.filter((item) => item.status.toLowerCase() === "resolved").length;
  const rejectedCount = payload.items.filter((item) => item.status.toLowerCase() === "rejected").length;
  const targetSkillCount = payload.items.filter((item) => item.targetType.toLowerCase() === "skill").length;
  const reasonMap = payload.items.reduce<Map<string, number>>((accumulator, item) => {
    const reason = item.reasonCode || "unspecified";
    accumulator.set(reason, (accumulator.get(reason) || 0) + 1);
    return accumulator;
  }, new Map<string, number>());

  return {
    metrics: [
      { label: "Total Cases", value: String(payload.total) },
      { label: "Open Cases", value: String(openCount) },
      { label: "Resolved Cases", value: String(resolvedCount) },
      { label: "Skill Targets", value: String(targetSkillCount) }
    ],
    selectedCase,
    reasonSummary: [
      ...Array.from(reasonMap.entries())
        .map(([reason, count]) => ({ reason, count }))
        .sort((left, right) => right.count - left.count || left.reason.localeCompare(right.reason)),
      ...(rejectedCount > 0 ? [{ reason: "rejected", count: rejectedCount }] : [])
    ]
  };
}
