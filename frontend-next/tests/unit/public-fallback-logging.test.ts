import { afterEach, describe, expect, it, vi } from "vitest";

import { reportPublicFallbackError } from "@/src/lib/api/publicFallbackLogging";

describe("reportPublicFallbackError", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("logs normalized fallback details outside production", () => {
    vi.stubEnv("NODE_ENV", "test");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    reportPublicFallbackError("public-landing-marketplace", new Error("backend unavailable"), {
      route: "/",
      hasQuery: false
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith("[public-fallback] public-landing-marketplace", {
      context: {
        hasQuery: false,
        route: "/"
      },
      message: "backend unavailable",
      name: "Error"
    });
  });

  it("does not log fallback details in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    reportPublicFallbackError("public-results-marketplace", new Error("backend unavailable"), {
      route: "/results"
    });

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("normalizes non-error throw values", () => {
    vi.stubEnv("NODE_ENV", "test");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    reportPublicFallbackError("public-ranking-compare", "compare failed", {
      leftSkillId: 10,
      rightSkillId: 12,
      skipped: undefined
    });

    expect(warnSpy).toHaveBeenCalledWith("[public-fallback] public-ranking-compare", {
      context: {
        leftSkillId: 10,
        rightSkillId: 12
      },
      message: "compare failed",
      name: "UnknownError"
    });
  });
});
