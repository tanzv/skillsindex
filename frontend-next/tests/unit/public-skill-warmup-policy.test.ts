import { describe, expect, it } from "vitest";

import { shouldDisableBatchSkillWarmup } from "@/src/features/public/marketplace/publicSkillWarmupPolicy";

describe("public skill warmup policy", () => {
  it("disables batch warmup when data saver is enabled", () => {
    expect(
      shouldDisableBatchSkillWarmup({
        connection: {
          saveData: true
        }
      })
    ).toBe(true);
  });

  it("disables batch warmup on constrained network types", () => {
    expect(
      shouldDisableBatchSkillWarmup({
        connection: {
          effectiveType: "2g"
        }
      })
    ).toBe(true);

    expect(
      shouldDisableBatchSkillWarmup({
        connection: {
          effectiveType: "slow-2g"
        }
      })
    ).toBe(true);
  });

  it("disables batch warmup on low-memory or low-core devices", () => {
    expect(
      shouldDisableBatchSkillWarmup({
        deviceMemory: 2
      })
    ).toBe(true);

    expect(
      shouldDisableBatchSkillWarmup({
        hardwareConcurrency: 2
      })
    ).toBe(true);
  });

  it("keeps batch warmup enabled on capable devices", () => {
    expect(
      shouldDisableBatchSkillWarmup({
        connection: {
          effectiveType: "4g",
          saveData: false
        },
        deviceMemory: 8,
        hardwareConcurrency: 8
      })
    ).toBe(false);
  });
});
