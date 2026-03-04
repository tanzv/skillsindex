import { describe, expect, it } from "vitest";
import { isSkillDetailNotFoundError, resolveSkillDetailLoadFailure } from "./PublicSkillDetailPage.loadState";

describe("PublicSkillDetailPage.loadState", () => {
  it("detects not found errors from backend error code messages", () => {
    expect(isSkillDetailNotFoundError(new Error("skill_not_found"))).toBe(true);
    expect(isSkillDetailNotFoundError(new Error("Skill detail not found"))).toBe(true);
    expect(isSkillDetailNotFoundError(new Error("HTTP 404"))).toBe(true);
  });

  it("keeps non-not-found errors as generic error status", () => {
    const resolved = resolveSkillDetailLoadFailure(new Error("Service unavailable"), "Failed to load skill detail");
    expect(resolved.status).toBe("error");
    expect(resolved.message).toBe("Service unavailable");
  });

  it("uses fallback message when error object has no message", () => {
    const resolved = resolveSkillDetailLoadFailure(null, "Failed to load skill detail");
    expect(resolved.status).toBe("error");
    expect(resolved.message).toBe("Failed to load skill detail");
  });

  it("marks not-found status through failure resolver", () => {
    const resolved = resolveSkillDetailLoadFailure(new Error("Skill detail not found"), "Failed to load skill detail");
    expect(resolved.status).toBe("not_found");
    expect(resolved.message).toBe("Skill detail not found");
  });
});
