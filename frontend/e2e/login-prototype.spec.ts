import { expect, test, type Page } from "@playwright/test";

async function mockAnonymousAuth(page: Page): Promise<void> {
  await page.route("**/api/v1/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: null })
    });
  });
}

test.describe("Login prototype alignment", () => {
  test.use({
    viewport: {
      width: 512,
      height: 342
    }
  });

  test("desktop login keeps prototype two-panel layout on baseline viewport", async ({ page }) => {
    await mockAnonymousAuth(page);
    await page.goto("/login");

    const shell = page.locator(".auth-shell.auth-shell-prototype");
    await expect(shell).toBeVisible();
    await expect(shell).toHaveClass(/is-visual-baseline/);
    await expect(page.locator(".login-visual-panel")).toBeVisible();
    await expect(page.locator(".login-form-panel")).toBeVisible();

    const layoutMetrics = await page.evaluate(() => {
      const stage = document.querySelector(".login-page-stage");
      const shellElement = document.querySelector(".auth-shell.auth-shell-prototype");
      const layout = document.querySelector(".auth-layout");
      const stageStyles = stage ? window.getComputedStyle(stage) : null;
      const shellStyles = shellElement ? window.getComputedStyle(shellElement) : null;
      const layoutStyles = layout ? window.getComputedStyle(layout) : null;

      return {
        stageHeight: stageStyles?.height || "",
        shellWidth: shellStyles?.width || "",
        transform: shellStyles?.transform || "",
        gridTemplateColumns: layoutStyles?.gridTemplateColumns || ""
      };
    });

    expect(layoutMetrics.stageHeight).toBe("342px");
    expect(layoutMetrics.shellWidth).toBe("1440px");
    expect(layoutMetrics.gridTemplateColumns).toBe("820px 460px");
    expect(layoutMetrics.transform).not.toBe("none");
  });

  test("login topbar theme switch updates route mode", async ({ page }) => {
    await mockAnonymousAuth(page);
    await page.goto("/login");

    const darkToggle = page.getByRole("button", { name: "Use dark theme" });
    const lightToggle = page.getByRole("button", { name: "Use light theme" });

    await expect(darkToggle).toBeDisabled();
    await expect(lightToggle).toBeEnabled();
    await lightToggle.click();

    await expect(page).toHaveURL(/\/light\/login$/);
    await expect(page.getByRole("button", { name: "Use light theme" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Use dark theme" })).toBeEnabled();
  });

  test("login topbar brand logo navigates to public home", async ({ page }) => {
    await mockAnonymousAuth(page);
    await page.goto("/login");

    const brandLogo = page.locator(".auth-topbar-brand-logo");
    await expect(brandLogo).toBeVisible();
    await expect(brandLogo).toHaveAttribute("src", "/brand/skillsindex-logo.svg");
    await expect(page.locator(".login-form-brand")).toBeVisible();
    await expect(page.locator(".login-form-brand-logo")).toHaveAttribute("src", "/brand/skillsindex-logo.svg");

    const homeLogoButton = page.getByRole("button", { name: "Go to homepage" });
    await expect(homeLogoButton).toBeVisible();
    await homeLogoButton.click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/light/login");
    const lightHomeLogoButton = page.getByRole("button", { name: "Go to homepage" });
    await expect(lightHomeLogoButton).toBeVisible();
    await lightHomeLogoButton.click();
    await expect(page).toHaveURL(/\/light\/$/);
  });

  test("login topbar brand supports query-based runtime override", async ({ page }) => {
    await mockAnonymousAuth(page);
    await page.goto("/login?loginLogoSrc=/brand/skillsindex-logo.svg%3Fv%3Dcustom&loginBrandText=SkillPortal");

    const brandLogo = page.locator(".auth-topbar-brand-logo");
    await expect(brandLogo).toBeVisible();
    await expect(brandLogo).toHaveAttribute("src", /\/brand\/skillsindex-logo\.svg\?v=custom$/);
    await expect(page.locator(".auth-topbar-brand-text")).toHaveText("SkillPortal");
    await expect(page.locator(".login-form-brand-logo")).toHaveAttribute("src", /\/brand\/skillsindex-logo\.svg\?v=custom$/);
    await expect(page.locator(".login-form-brand-text")).toHaveText("SkillPortal");
  });

  test("login info panel copy supports query-based runtime override", async ({ page }) => {
    await mockAnonymousAuth(page);
    await page.goto("/login?loginKicker=Configured+Kicker&loginTitle=Configured+Title&loginLead=Configured+Lead");

    await expect(page.locator("[data-testid='login-info-hint']")).toHaveText("Configured Title");
    await expect(page.locator("[data-testid='login-info-card']")).toBeVisible();
    await expect(page.locator(".login-info-description")).toHaveText("Configured Lead");
    await expect(page.locator("[data-testid='login-info-points']")).toHaveCount(0);
  });

  test("password field supports explicit show and hide toggle", async ({ page }) => {
    await mockAnonymousAuth(page);
    await page.goto("/login");

    const passwordInput = page.locator("input[autocomplete='current-password']");
    const visibilityToggle = page.getByTestId("login-password-visibility-toggle");

    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(visibilityToggle).toBeVisible();

    await visibilityToggle.click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    await visibilityToggle.click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("login stage is marked as no-drag region", async ({ page }) => {
    await mockAnonymousAuth(page);
    await page.goto("/login");
    const stage = page.locator(".login-page-stage");
    await expect(stage).toBeVisible();

    const dragMeta = await stage.evaluate((element) => {
      const stageStyles = window.getComputedStyle(element);
      const button = element.querySelector("button");
      const buttonStyles = button ? window.getComputedStyle(button) : null;
      return {
        stageAppRegion: stageStyles.getPropertyValue("-webkit-app-region").trim(),
        stageUserDrag: stageStyles.getPropertyValue("-webkit-user-drag").trim(),
        buttonAppRegion: buttonStyles?.getPropertyValue("-webkit-app-region").trim() || ""
      };
    });

    expect(dragMeta.stageAppRegion).toBe("no-drag");
    expect(dragMeta.stageUserDrag).toBe("none");
    expect(dragMeta.buttonAppRegion).toBe("no-drag");
  });

  test("login info panel removes non-essential decorative sections", async ({ page }) => {
    await mockAnonymousAuth(page);
    await page.goto("/login");

    await expect(page.locator(".auth-topbar-nav")).toHaveCount(0);
    await expect(page.locator(".auth-stat-grid")).toHaveCount(0);
    await expect(page.locator(".login-badge-row")).toHaveCount(0);
    await expect(page.locator(".auth-context-card")).toHaveCount(0);
    await expect(page.locator(".login-trust-row")).toHaveCount(0);
    await expect(page.locator("[data-testid='login-info-card']")).toBeVisible();
    await expect(page.locator(".login-info-hero")).toHaveCount(0);
    await expect(page.locator("[data-testid='login-info-points']")).toHaveCount(0);
  });
});

test.describe("Login desktop shell behavior", () => {
  test.use({
    viewport: {
      width: 1366,
      height: 768
    }
  });

  test("topbar spans viewport width and bottom scroll has no extra gap", async ({ page }) => {
    await mockAnonymousAuth(page);
    await page.goto("/login");
    await expect(page.locator(".auth-shell.auth-shell-prototype")).toBeVisible();
    await expect(page.locator(".auth-topbar")).toBeVisible();
    await expect(page.locator(".auth-layout")).toBeVisible();

    const layoutMetrics = await page.evaluate(() => {
      const topbar = document.querySelector(".auth-topbar");
      const shell = document.querySelector(".auth-shell.auth-shell-prototype");
      const layout = document.querySelector(".auth-layout");
      if (!topbar || !shell || !layout) {
        return null;
      }

      window.scrollTo(0, document.documentElement.scrollHeight);
      const topbarRect = topbar.getBoundingClientRect();
      const layoutRect = layout.getBoundingClientRect();
      const shellStyles = window.getComputedStyle(shell);
      const topbarStyles = window.getComputedStyle(topbar);
      const root = document.documentElement;

      return {
        topbarLeft: topbarRect.left,
        topbarRightGap: window.innerWidth - topbarRect.right,
        layoutBottomGap: window.innerHeight - layoutRect.bottom,
        shellPaddingBottom: shellStyles.paddingBottom,
        topbarBorderRadius: topbarStyles.borderRadius,
        pageScrollable: root.scrollHeight > root.clientHeight
      };
    });

    expect(layoutMetrics).not.toBeNull();
    if (!layoutMetrics) {
      return;
    }
    expect(layoutMetrics.shellPaddingBottom).toBe("0px");
    expect(layoutMetrics.topbarBorderRadius).toBe("0px");
    expect(layoutMetrics.pageScrollable).toBe(false);
    expect(Math.abs(layoutMetrics.topbarLeft)).toBeLessThanOrEqual(1);
    expect(Math.abs(layoutMetrics.topbarRightGap)).toBeLessThanOrEqual(1);
    expect(Math.abs(layoutMetrics.layoutBottomGap)).toBeLessThanOrEqual(1);
  });
});
