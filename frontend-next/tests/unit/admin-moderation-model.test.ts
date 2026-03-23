import { describe, expect, it } from "vitest";

import { buildModerationOverview, normalizeModerationCasesPayload } from "@/src/features/adminGovernance/moderationModel";

describe("admin moderation model", () => {
  it("builds moderation metrics and reason summary", () => {
    const payload = normalizeModerationCasesPayload({
      total: 3,
      items: [
        {
          id: 101,
          reporter_user_id: 7,
          resolver_user_id: 0,
          target_type: "skill",
          skill_id: 88,
          comment_id: 0,
          reason_code: "abuse",
          reason_detail: "Abusive content",
          status: "open",
          action: "none",
          resolution_note: "",
          resolved_at: "",
          created_at: "2026-03-12T08:00:00Z",
          updated_at: "2026-03-12T08:10:00Z"
        },
        {
          id: 102,
          reporter_user_id: 8,
          resolver_user_id: 3,
          target_type: "comment",
          skill_id: 0,
          comment_id: 55,
          reason_code: "spam",
          reason_detail: "Repeated spam",
          status: "resolved",
          action: "hidden",
          resolution_note: "Hidden comment",
          resolved_at: "2026-03-12T09:00:00Z",
          created_at: "2026-03-12T08:20:00Z",
          updated_at: "2026-03-12T09:00:00Z"
        },
        {
          id: 103,
          reporter_user_id: 9,
          resolver_user_id: 4,
          target_type: "skill",
          skill_id: 89,
          comment_id: 0,
          reason_code: "abuse",
          reason_detail: "Unsafe instruction",
          status: "rejected",
          action: "none",
          resolution_note: "",
          resolved_at: "2026-03-12T10:00:00Z",
          created_at: "2026-03-12T08:50:00Z",
          updated_at: "2026-03-12T10:00:00Z"
        }
      ]
    });

    const overview = buildModerationOverview(payload, 102);

    expect(overview.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Open Cases", value: "1" }),
        expect.objectContaining({ label: "Resolved Cases", value: "1" }),
        expect.objectContaining({ label: "Skill Targets", value: "2" })
      ])
    );
    expect(overview.selectedCase?.id).toBe(102);
    expect(overview.reasonSummary).toEqual(
      expect.arrayContaining([expect.objectContaining({ reason: "abuse", count: 2 })])
    );
  });

  it("applies injected moderation labels and fallbacks", () => {
    const payload = normalizeModerationCasesPayload(
      {
        total: 2,
        items: [
          {
            id: 201,
            reporter_user_id: 0,
            resolver_user_id: 0,
            target_type: "",
            skill_id: 0,
            comment_id: 0,
            reason_code: "",
            reason_detail: "",
            status: "",
            action: "",
            resolution_note: "",
            resolved_at: "",
            created_at: "",
            updated_at: ""
          },
          {
            id: 202,
            reporter_user_id: 1,
            resolver_user_id: 2,
            target_type: "skill",
            skill_id: 8,
            comment_id: 0,
            reason_code: "abuse",
            reason_detail: "",
            status: "rejected",
            action: "hidden",
            resolution_note: "",
            resolved_at: "",
            created_at: "",
            updated_at: ""
          }
        ]
      },
      {
        targetUnknown: "target_unknown_custom",
        reasonUnspecified: "reason_unspecified_custom",
        statusFallback: "status_open_custom",
        actionNone: "action_none_custom"
      }
    );

    const overview = buildModerationOverview(payload, 201, {
      totalCases: "metric_total_custom",
      openCases: "metric_open_custom",
      resolvedCases: "metric_resolved_custom",
      skillTargets: "metric_skill_custom",
      rejectedSummary: "rejected_custom"
    });

    expect(payload.items[0]).toEqual(
      expect.objectContaining({
        targetType: "target_unknown_custom",
        reasonCode: "reason_unspecified_custom",
        status: "status_open_custom",
        action: "action_none_custom"
      })
    );
    expect(overview.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "metric_total_custom", value: "2" }),
        expect.objectContaining({ label: "metric_open_custom", value: "0" }),
        expect.objectContaining({ label: "metric_skill_custom", value: "1" })
      ])
    );
    expect(overview.reasonSummary).toEqual(
      expect.arrayContaining([expect.objectContaining({ reason: "rejected_custom", count: 1 })])
    );
  });
});
