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
      defaults: Record<string, string>;
      profiles: Record<
        string,
        {
          runtime: string;
          entry: string;
          cwd: string;
          args: string[];
          managed: boolean;
          env?: Record<string, string>;
          prelaunch_task: string | null;
        }
      >;
    };

    expect(payload.defaults).toMatchObject({
      frontend_port: "3400",
      backend_port: "38180",
      frontend_base_url: "http://127.0.0.1:3400",
      backend_base_url: "http://127.0.0.1:38180",
    });
    expect(payload.profiles["skillsindex-backend"]).toMatchObject({
      runtime: "go",
      entry: "./cmd/api",
      cwd: "backend",
      args: [],
      managed: true,
      env: {
        APP_PORT: "${backend_port}",
        CORS_ALLOWED_ORIGINS: "${frontend_base_url}",
        DINGTALK_REDIRECT_URL: "${backend_base_url}/auth/dingtalk/callback",
      },
      prelaunch_task: null,
    });
    expect(payload.profiles["skillsindex-frontend"]).toMatchObject({
      runtime: "node",
      entry: "node_modules/next/dist/bin/next",
      cwd: "frontend-next",
      args: ["start", "--hostname", "127.0.0.1", "--port", "${frontend_port}"],
      env: {
        NEXT_PUBLIC_API_BASE_URL: "${backend_base_url}",
        SKILLSINDEX_SERVER_API_BASE_URL: "${backend_base_url}",
      },
      managed: true,
      prelaunch_task: "npm run build",
    });
  });

  it("keeps example env defaults aligned with the repository lcode contract", async () => {
    const frontendEnvExample = await readFile(
      path.join(repositoryRoot, "frontend-next", ".env.example"),
      "utf8",
    );
    const backendEnvExample = await readFile(
      path.join(repositoryRoot, "backend", ".env.example"),
      "utf8",
    );

    expect(frontendEnvExample).toContain("SKILLSINDEX_SERVER_API_BASE_URL=http://127.0.0.1:38180");
    expect(frontendEnvExample).toContain("NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:38180");
    expect(backendEnvExample).toContain("APP_PORT=38180");
    expect(backendEnvExample).toContain("CORS_ALLOWED_ORIGINS=http://127.0.0.1:3400");
    expect(backendEnvExample).toContain(
      "DINGTALK_REDIRECT_URL=http://127.0.0.1:38180/auth/dingtalk/callback",
    );
  });
});
