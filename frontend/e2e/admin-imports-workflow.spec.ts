import { expect, test, type Page, type Route } from "@playwright/test";

const AUTH_USER = {
  id: 101,
  username: "admin.user",
  display_name: "Admin User",
  role: "admin",
  status: "active"
} as const;

async function fulfillJSON(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body)
  });
}

interface ArchiveUploadSnapshot {
  method: string;
  contentType: string;
  bodySize: number;
}

async function forceEnglishLocale(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem("skillsindex.locale", "en");
  });
}

async function mockWorkspaceShell(page: Page): Promise<void> {
  await page.route("**/api/v1/auth/csrf", async (route) => {
    await fulfillJSON(route, 200, { csrf_token: "csrf-token" });
  });

  await page.route("**/api/v1/auth/me", async (route) => {
    await fulfillJSON(route, 200, { user: AUTH_USER });
  });

  await page.route("**/api/v1/account/profile", async (route) => {
    await fulfillJSON(route, 200, {
      user: AUTH_USER,
      profile: {
        display_name: "Admin User",
        avatar_url: "",
        bio: "Imports admin"
      }
    });
  });

  await page.route("**/api/v1/account/sessions", async (route) => {
    await fulfillJSON(route, 200, {
      current_session_id: "session-current",
      session_issued_at: "2026-03-11T08:00:00Z",
      session_expires_at: "2026-03-12T08:00:00Z",
      total: 1,
      items: [
        {
          session_id: "session-current",
          user_agent: "Chrome",
          issued_ip: "127.0.0.1",
          last_seen: "2026-03-11T08:00:00Z",
          expires_at: "2026-03-12T08:00:00Z",
          is_current: true
        }
      ]
    });
  });
}

test("imports workbench uploads archives and updates import job actions", async ({ page }) => {
  await forceEnglishLocale(page);
  await mockWorkspaceShell(page);

  let archiveImported = false;
  let uploadRequest: ArchiveUploadSnapshot | null = null;
  let retryRequestMethod = "";
  let cancelRequestMethod = "";
  const importJobs = [
    {
      id: 11,
      job_type: "import_upload",
      status: "failed",
      owner_user_id: 101,
      actor_user_id: 101,
      target_skill_id: 0,
      error_message: "archive parse failed",
      created_at: "2026-03-11T10:00:00Z",
      updated_at: "2026-03-11T10:01:00Z"
    },
    {
      id: 12,
      job_type: "import_skillmp",
      status: "running",
      owner_user_id: 101,
      actor_user_id: 101,
      target_skill_id: 21,
      error_message: "",
      created_at: "2026-03-11T10:02:00Z",
      updated_at: "2026-03-11T10:03:00Z"
    }
  ];

  await page.route("**/api/v1/admin/skills", async (route) => {
    await fulfillJSON(route, 200, {
      items: archiveImported
        ? [
            {
              id: 201,
              name: "Archive Skill",
              description: "Imported from archive",
              source_type: "upload",
              visibility: "private",
              owner_username: "admin.user",
              updated_at: "2026-03-11T10:04:00Z"
            }
          ]
        : []
    });
  });

  await page.route("**/api/v1/admin/jobs?limit=40", async (route) => {
    await fulfillJSON(route, 200, { items: importJobs });
  });

  await page.route("**/api/v1/admin/ingestion/upload", async (route) => {
    uploadRequest = {
      method: route.request().method().toUpperCase(),
      contentType: route.request().headers()["content-type"] || "",
      bodySize: route.request().postDataBuffer()?.byteLength || 0
    };
    archiveImported = true;
    await fulfillJSON(route, 201, {
      ok: true,
      status: "created",
      message: "Archive skill imported",
      item: {
        id: 201,
        name: "Archive Skill",
        source_type: "upload",
        owner_username: "admin.user"
      }
    });
  });

  await page.route("**/api/v1/admin/jobs/11/retry", async (route) => {
    retryRequestMethod = route.request().method().toUpperCase();
    importJobs[0] = {
      ...importJobs[0],
      status: "pending",
      error_message: ""
    };
    await fulfillJSON(route, 200, { item: importJobs[0] });
  });

  await page.route("**/api/v1/admin/jobs/12/cancel", async (route) => {
    cancelRequestMethod = route.request().method().toUpperCase();
    importJobs[1] = {
      ...importJobs[1],
      status: "canceled"
    };
    await fulfillJSON(route, 200, { item: importJobs[1] });
  });

  await page.goto("/admin/records/imports");

  await expect(page.getByRole("heading", { name: "Import Center" })).toBeVisible();
  await expect(page.getByText("Import Jobs")).toBeVisible();

  await page.getByLabel("Archive File").setInputFiles({
    name: "skill.zip",
    mimeType: "application/zip",
    buffer: Buffer.from("archive-content")
  });
  await page.getByRole("button", { name: "Import Archive" }).first().click();

  await expect.poll(() => uploadRequest).toMatchObject({
    method: "POST"
  });
  expect(uploadRequest?.contentType).toContain("multipart/form-data");
  expect(uploadRequest?.bodySize || 0).toBeGreaterThan(0);
  await expect(page.getByText("Archive skill imported")).toBeVisible();
  await expect(page.getByRole("cell", { name: "Archive Skill" })).toBeVisible();

  const failedRow = page.locator("tbody tr").filter({
    has: page.getByRole("cell", { name: "11", exact: true })
  });
  await expect(failedRow.getByRole("button", { name: "Retry" })).toBeVisible();
  await failedRow.getByRole("button", { name: "Retry" }).click();

  await expect.poll(() => retryRequestMethod).toBe("POST");
  await expect(page.getByText("Operation completed")).toBeVisible();
  await expect(failedRow.getByRole("button", { name: "Retry" })).toHaveCount(0);
  await expect(failedRow.getByRole("button", { name: "Cancel" })).toBeVisible();

  const runningRow = page.locator("tbody tr").filter({
    has: page.getByRole("cell", { name: "12", exact: true })
  });
  await expect(runningRow.getByRole("button", { name: "Cancel" })).toBeVisible();
  await runningRow.getByRole("button", { name: "Cancel" }).click();

  await expect.poll(() => cancelRequestMethod).toBe("POST");
  await expect(runningRow.getByRole("button", { name: "Retry" })).toBeVisible();
  await expect(runningRow.getByRole("button", { name: "Cancel" })).toHaveCount(0);
});
