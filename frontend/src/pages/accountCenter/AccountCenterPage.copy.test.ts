import { describe, expect, it } from "vitest";

import { getAccountCenterCopy } from "./AccountCenterPage.copy";

describe("AccountCenterPage.copy", () => {
  it("returns edit profile related labels in english", () => {
    const copy = getAccountCenterCopy("en");

    expect(copy.editProfile).toBe("Edit Profile");
    expect(copy.profilePreview).toBe("Profile Preview");
    expect(copy.editProfileModalTitle).toBe("Edit Personal Information");
    expect(copy.credentialsTab).toBe("API Credentials");
  });

  it("returns localized edit profile labels in chinese", () => {
    const copy = getAccountCenterCopy("zh");

    expect(copy.editProfile).toBe("\u7f16\u8f91\u4e2a\u4eba\u4fe1\u606f");
    expect(copy.profilePreview).toBe("\u4e2a\u4eba\u8d44\u6599\u9884\u89c8");
    expect(copy.editProfileModalTitle).toBe("\u7f16\u8f91\u4e2a\u4eba\u4fe1\u606f");
    expect(copy.credentialsTab).toBe("\u4e2a\u4eba API \u51ed\u8bc1");
  });
});
