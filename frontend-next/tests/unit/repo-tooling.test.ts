import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repositoryRoot = path.resolve(import.meta.dirname, "../../..");

describe("repository real backend smoke tooling", () => {
  it("defines a make target for the frontend real backend smoke check", async () => {
    const makefile = await readFile(path.join(repositoryRoot, "Makefile"), "utf8");

    expect(makefile).toContain("verify-frontend-real-backend");
    expect(makefile).toContain("scripts/run_frontend_real_backend_smoke.sh");
  });

  it("runs the real backend smoke check in CI", async () => {
    const workflow = await readFile(
      path.join(repositoryRoot, ".github", "workflows", "ci.yml"),
      "utf8",
    );

    expect(workflow).toContain("Run frontend real-backend smoke test");
    expect(workflow).toContain("./scripts/run_frontend_real_backend_smoke.sh");
  });
});
