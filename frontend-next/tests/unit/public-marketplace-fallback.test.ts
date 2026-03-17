import { describe, expect, it } from "vitest";

import { buildPublicMarketplaceFallback } from "@/src/features/public/publicMarketplaceFallback";

describe("public marketplace fallback", () => {
  it("filters fallback skills by grouped category, grouped subcategory, and semantic tags", () => {
    const payload = buildPublicMarketplaceFallback({
      category: "programming-development",
      subcategory: "devops-cloud",
      tags: "rollback"
    });

    expect(payload.items).toHaveLength(1);
    expect(payload.items[0]?.name).toBe("Cloud Rollout Runbook");
  });

  it("matches keyword and semantic filters together for the results route", () => {
    const payload = buildPublicMarketplaceFallback({
      q: "nextjs",
      tags: "react"
    });

    expect(payload.items).toHaveLength(1);
    expect(payload.items[0]?.name).toBe("Next.js UX Audit Agent");
  });
});
