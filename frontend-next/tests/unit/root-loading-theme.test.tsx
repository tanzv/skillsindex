import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn()
}));

import { cookies } from "next/headers";

function createCookieStore(theme: string | null) {
  return {
    get(name: string) {
      if (name !== "skillsindex.theme" || !theme) {
        return undefined;
      }

      return {
        name,
        value: theme
      };
    }
  };
}

describe("root loading theme", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the root loading shell with the server-resolved shared theme", async () => {
    vi.mocked(cookies).mockResolvedValue(createCookieStore("light") as Awaited<ReturnType<typeof cookies>>);

    const { default: RootLoadingPage } = await import("@/app/loading");
    const markup = renderToStaticMarkup(await RootLoadingPage());

    expect(markup).toContain('data-testid="root-loading-page"');
    expect(markup).toContain('data-theme="light"');
    expect(markup).toContain("--motion-delay:");
  });
});
