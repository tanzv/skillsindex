import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repositoryRoot = path.resolve(import.meta.dirname, "../../..");

describe("repository real backend smoke tooling", () => {
  it("defines a make target for synchronizing repository lcode profiles", async () => {
    const makefile = await readFile(path.join(repositoryRoot, "Makefile"), "utf8");

    expect(makefile).toContain("sync-lcode-profiles");
    expect(makefile).toContain("scripts/dev/ensure_lcode_profiles.py");
  });

  it("defines a make target for the frontend account menu regression check", async () => {
    const makefile = await readFile(path.join(repositoryRoot, "Makefile"), "utf8");

    expect(makefile).toContain("verify-frontend-account-menu");
    expect(makefile).toContain("npm run test:unit:account-menu");
  });

  it("defines a make target for the frontend real backend smoke check", async () => {
    const makefile = await readFile(path.join(repositoryRoot, "Makefile"), "utf8");

    expect(makefile).toContain("verify-frontend-real-backend");
    expect(makefile).toContain("scripts/run_frontend_real_backend_smoke.sh");
  });

  it("runs the frontend account menu regression check in CI", async () => {
    const workflow = await readFile(
      path.join(repositoryRoot, ".github", "workflows", "ci.yml"),
      "utf8",
    );

    expect(workflow).toContain("Run frontend account menu regression tests");
    expect(workflow).toContain("npm run test:unit:account-menu");
  });

  it("runs the real backend smoke check in CI", async () => {
    const workflow = await readFile(
      path.join(repositoryRoot, ".github", "workflows", "ci.yml"),
      "utf8",
    );

    expect(workflow).toContain("Run frontend real-backend smoke test");
    expect(workflow).toContain("./scripts/run_frontend_real_backend_smoke.sh");
  });

  it("stores canonical lcode profile contracts in the repository", async () => {
    const rawProfiles = await readFile(
      path.join(repositoryRoot, "scripts", "dev", "lcode_profiles.json"),
      "utf8",
    );
    const payload = JSON.parse(rawProfiles) as {
      profiles: Record<
        string,
        {
          runtime: string;
          entry: string;
          cwd: string;
          args: string[];
          managed: boolean;
          prelaunch_task: string | null;
        }
      >;
    };

    expect(payload.profiles["skillsindex-backend"]).toMatchObject({
      runtime: "go",
      entry: "./cmd/api",
      cwd: "backend",
      args: [],
      managed: true,
      prelaunch_task: null,
    });
    expect(payload.profiles["skillsindex-frontend"]).toMatchObject({
      runtime: "node",
      entry: "node_modules/next/dist/bin/next",
      cwd: "frontend-next",
      args: ["start", "--hostname", "127.0.0.1", "--port", "3000"],
      managed: true,
      prelaunch_task: "npm run build",
    });
  });
});
