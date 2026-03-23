import { describe, expect, it } from "vitest";

import {
  closeAdminOverlayState,
  createAdminOverlayState,
  isAdminOverlayMatch
} from "@/src/lib/admin/useAdminOverlayState";

describe("admin overlay state helpers", () => {
  it("creates an open overlay state with a nullable entity id", () => {
    const state = createAdminOverlayState({ kind: "create", entity: "manualSkill" });

    expect(state).toEqual({
      open: true,
      kind: "create",
      entity: "manualSkill",
      entityId: null
    });
  });

  it("matches overlay state by kind, entity, and entity id", () => {
    const state = createAdminOverlayState({ kind: "detail", entity: "importJob", entityId: 42 });

    expect(isAdminOverlayMatch(state, { kind: "detail" })).toBe(true);
    expect(isAdminOverlayMatch(state, { entity: "importJob", entityId: 42 })).toBe(true);
    expect(isAdminOverlayMatch(state, { entity: "syncRun" })).toBe(false);
  });

  it("closes back to a null overlay state", () => {
    expect(closeAdminOverlayState()).toBeNull();
  });
});
