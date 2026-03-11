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
        bio: "Repository admin"
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

test("repository ingestion submits and refreshes repository inventory", async ({ page }) => {
  await forceEnglishLocale(page);
  await mockWorkspaceShell(page);

  let repositoryImported = false;

  await page.route("**/api/v1/admin/skills", async (route) => {
    await fulfillJSON(route, 200, {
      items: repositoryImported
        ? [
            {
              id: 88,
              name: "Repo Skill",
              description: "Imported from repository",
              source_type: "repository",
              visibility: "private",
              owner_username: "admin.user",
              updated_at: "2026-03-11T10:00:00Z"
            }
          ]
        : []
    });
  });

  await page.route("**/api/v1/admin/sync-jobs**", async (route) => {
    await fulfillJSON(route, 200, {
      items: [
        {
          id: 9001,
          trigger: "manual",
          scope: "repository",
          status: "partial",
          candidates: 3,
          synced: 2,
          failed: 1,
          duration_ms: 1200,
          started_at: "2026-03-11T10:00:00Z",
          finished_at: "2026-03-11T10:00:01Z",
          error_summary: "one repository failed",
          owner_user: { username: "admin.user" },
          actor_user: { username: "admin.user" }
        }
      ]
    });
  });

  await page.route("**/api/v1/admin/sync-policy/repository", async (route) => {
    await fulfillJSON(route, 200, {
      item: {
        enabled: true,
        interval: "30m",
        timeout: "10m",
        batch_size: 20
      }
    });
  });

  await page.route("**/api/v1/admin/ingestion/repository", async (route) => {
    repositoryImported = true;
    await fulfillJSON(route, 201, {
      ok: true,
      status: "created",
      message: "Repository skill synced",
      item: {
        id: 88,
        name: "Repo Skill",
        source_type: "repository",
        owner_username: "admin.user"
      }
    });
  });

  await page.goto("/admin/ingestion/repository");

  await expect(page.getByRole("heading", { name: "Repository Ingestion" }).first()).toBeVisible();
  await expect(page.getByText("Latest Sync Runs")).toBeVisible();

  await page.getByLabel("Repository URL").fill("https://example.com/repo.git");
  await page.getByRole("button", { name: "Sync Repository Skill" }).click();

  await expect(page.getByText("Repository skill synced")).toBeVisible();
  await expect(page.getByText("Repo Skill")).toBeVisible();
});
