import { describe, expect, it } from "vitest";

import {
  resolveDirtySkillIdAfterSkillSync,
  resolveSkillVersionLoadState,
  shouldLoadSkillVersions,
  shouldPreserveSkillVersions,
} from "@/src/features/adminCatalog/AdminCatalogSkillVersions";

describe("admin catalog skill versions", () => {
  it("reuses cached versions when reopening the same skill drawer", () => {
    expect(
      shouldLoadSkillVersions({
        detailDrawerOpen: true,
        selectedSkillId: 11,
        loadedSkillId: 11,
        dirtySkillId: null,
      }),
    ).toBe(false);
    expect(shouldPreserveSkillVersions(11, 11)).toBe(true);
  });

  it("refreshes versions when the selected skill changes or becomes dirty", () => {
    expect(
      shouldLoadSkillVersions({
        detailDrawerOpen: true,
        selectedSkillId: 12,
        loadedSkillId: 11,
        dirtySkillId: null,
      }),
    ).toBe(true);
    expect(
      shouldLoadSkillVersions({
        detailDrawerOpen: true,
        selectedSkillId: 12,
        loadedSkillId: 12,
        dirtySkillId: 12,
      }),
    ).toBe(true);
    expect(shouldPreserveSkillVersions(12, 11)).toBe(false);
  });

  it("records the loaded skill and clears the dirty flag after a successful refresh", () => {
    expect(
      resolveSkillVersionLoadState({
        skillId: 12,
        dirtySkillId: 12,
      }),
    ).toEqual({
      loadedSkillId: 12,
      dirtySkillId: null,
    });
    expect(
      resolveSkillVersionLoadState({
        skillId: 12,
        dirtySkillId: 15,
      }),
    ).toEqual({
      loadedSkillId: 12,
      dirtySkillId: 15,
    });
  });

  it("marks versions dirty after sync only for the currently selected skill", () => {
    expect(
      resolveDirtySkillIdAfterSkillSync({
        selectedSkillId: 12,
        syncedSkillId: 12,
        dirtySkillId: null,
      }),
    ).toBe(12);
    expect(
      resolveDirtySkillIdAfterSkillSync({
        selectedSkillId: 12,
        syncedSkillId: 15,
        dirtySkillId: null,
      }),
    ).toBe(null);
  });
});
