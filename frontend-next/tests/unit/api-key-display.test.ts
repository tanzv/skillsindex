import { describe, expect, it } from "vitest";

import { resolveApiKeyStatusLabel, resolveApiKeyStatusTone } from "@/src/lib/apiKeyDisplay";

const messages = {
  statusLabelActive: "Active Key",
  statusLabelRevoked: "Revoked Key",
  statusLabelExpired: "Expired Key",
  statusLabelUnknown: "Unknown Key Status"
};

describe("api key display helpers", () => {
  it("maps protocol statuses to localized labels", () => {
    expect(resolveApiKeyStatusLabel("active", messages)).toBe("Active Key");
    expect(resolveApiKeyStatusLabel("revoked", messages)).toBe("Revoked Key");
    expect(resolveApiKeyStatusLabel("expired", messages)).toBe("Expired Key");
    expect(resolveApiKeyStatusLabel("", messages)).toBe("Unknown Key Status");
  });

  it("maps statuses to semantic badge tones", () => {
    expect(resolveApiKeyStatusTone("active")).toBe("soft");
    expect(resolveApiKeyStatusTone("expired")).toBe("default");
    expect(resolveApiKeyStatusTone("revoked")).toBe("outline");
    expect(resolveApiKeyStatusTone("unknown")).toBe("outline");
  });
});
