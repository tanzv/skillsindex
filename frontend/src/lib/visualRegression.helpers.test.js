import { describe, expect, it } from "vitest";
import { buildComparisonSummary, didVisualCheckPass } from "../../scripts/visual-regression/utils.mjs";

describe("didVisualCheckPass", () => {
  it("returns true when ratio is equal to threshold", () => {
    expect(didVisualCheckPass(0.01, 0.01)).toBe(true);
  });

  it("returns false when ratio is greater than threshold", () => {
    expect(didVisualCheckPass(0.0101, 0.01)).toBe(false);
  });
});

describe("buildComparisonSummary", () => {
  it("builds ratio and pass status from pixels", () => {
    const summary = buildComparisonSummary({
      diffPixels: 100,
      width: 100,
      height: 100,
      threshold: 0.02
    });

    expect(summary.totalPixels).toBe(10_000);
    expect(summary.mismatchRatio).toBe(0.01);
    expect(summary.passed).toBe(true);
  });
});
