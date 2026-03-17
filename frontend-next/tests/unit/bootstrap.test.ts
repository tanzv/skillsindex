import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

const rootDirectory = path.resolve(import.meta.dirname, "../..");

async function readJSON<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content) as T;
}

describe("frontend-next bootstrap", () => {
  it("defines the expected app scripts", async () => {
    const packageJSON = await readJSON<{ scripts?: Record<string, string> }>(path.join(rootDirectory, "package.json"));

    expect(packageJSON.scripts).toMatchObject({
      dev: "next dev --webpack",
      build: "next build --webpack",
      start: "next start",
      lint: "eslint .",
      "test:unit": "vitest run",
      "test:e2e": "node ./scripts/run-e2e.mjs"
    });
  });

  it("exports a Next.js config module", async () => {
    const configURL = pathToFileURL(path.join(rootDirectory, "next.config.ts")).href;
    const configModule = await import(configURL);

    expect(configModule.default).toBeTypeOf("object");
  });

  it("defines the app router entry files", async () => {
    await expect(access(path.join(rootDirectory, "app", "layout.tsx"))).resolves.toBeUndefined();
    await expect(access(path.join(rootDirectory, "app", "globals.css"))).resolves.toBeUndefined();
  });

  it("defines the tsconfig alias and environment template", async () => {
    const tsconfig = await readJSON<{ compilerOptions?: { paths?: Record<string, string[]> } }>(
      path.join(rootDirectory, "tsconfig.json")
    );
    const envExample = await readFile(path.join(rootDirectory, ".env.example"), "utf8");

    expect(tsconfig.compilerOptions?.paths).toMatchObject({
      "@/*": ["./*"]
    });
    expect(envExample).toContain("NEXT_PUBLIC_API_BASE_URL=");
  });

  it("defines the route groups, middleware, and auth entrypoints for the migrated app", async () => {
    const requiredFiles = [
      "proxy.ts",
      "app/login/page.tsx",
      "app/(public)/layout.tsx",
      "app/(public)/page.tsx",
      "app/(public)/search/page.tsx",
      "app/(public)/results/page.tsx",
      "app/(public)/categories/page.tsx",
      "app/(public)/categories/[slug]/page.tsx",
      "app/(public)/rankings/page.tsx",
      "app/(public)/skills/[skillId]/page.tsx",
      "app/(public)/states/[state]/page.tsx",
      "app/(public)/docs/page.tsx",
      "app/(workspace)/workspace/layout.tsx",
      "app/(workspace)/workspace/page.tsx",
      "app/(workspace)/workspace/activity/page.tsx",
      "app/(workspace)/workspace/queue/page.tsx",
      "app/(workspace)/workspace/policy/page.tsx",
      "app/(workspace)/workspace/runbook/page.tsx",
      "app/(workspace)/workspace/actions/page.tsx",
      "app/(account)/account/layout.tsx",
      "app/(account)/account/profile/page.tsx",
      "app/(account)/account/security/page.tsx",
      "app/(account)/account/sessions/page.tsx",
      "app/(account)/account/api-credentials/page.tsx",
      "app/(admin)/admin/layout.tsx",
      "app/(admin)/admin/overview/page.tsx",
      "app/(admin)/admin/ingestion/manual/page.tsx",
      "app/(admin)/admin/ingestion/repository/page.tsx",
      "app/(admin)/admin/records/imports/page.tsx",
      "app/(admin)/admin/accounts/page.tsx",
      "app/(admin)/admin/accounts/new/page.tsx",
      "app/(admin)/admin/roles/page.tsx",
      "app/(admin)/admin/roles/new/page.tsx",
      "app/(admin)/admin/integrations/page.tsx",
      "app/(admin)/admin/access/page.tsx",
      "app/(admin)/admin/organizations/page.tsx",
      "app/(admin)/admin/moderation/page.tsx",
      "app/api/bff/session/route.ts",
      "app/api/bff/auth/login/route.ts",
      "app/api/bff/auth/logout/route.ts",
      "app/api/bff/[...path]/route.ts"
    ];

    await Promise.all(requiredFiles.map((filePath) => expect(access(path.join(rootDirectory, filePath))).resolves.toBeUndefined()));
  });
});
