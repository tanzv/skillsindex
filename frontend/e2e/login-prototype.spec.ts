import { expect, test, type Page } from "@playwright/test";

interface MockAuthProviderItem {
  key: string;
  start_path: string;
}

const defaultMockAuthProviders: MockAuthProviderItem[] = [
  { key: "dingtalk", start_path: "/auth/dingtalk/start" },
  { key: "github", start_path: "/auth/sso/start/github" },
  { key: "google", start_path: "/auth/sso/start/google" },
  { key: "wecom", start_path: "/auth/sso/start/wecom" },
  { key: "microsoft", start_path: "/auth/sso/start/microsoft" }
];

async function mockAnonymousAuth(page: Page, authProviders: MockAuthProviderItem[] = defaultMockAuthProviders): Promise<void> {
  await page.route("**/api/v1/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: null })
    });
  });
  await page.route("**/api/v1/auth/providers", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        auth_providers: authProviders.map((item) => item.key),
        items: authProviders
      })
    });
  });
}

async function setAuthProvidersFetchMode(page: Page, mode: "always" | "never"): Promise<void> {
  await page.addInitScript((nextMode) => {
    (
      window as Window & {
        __SKILLSINDEX_LOGIN_AUTH_PROVIDERS_MODE__?: string;
      }
    ).__SKILLSINDEX_LOGIN_AUTH_PROVIDERS_MODE__ = nextMode;
  }, mode);
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

  test("login header theme switch updates route mode", async ({ page }) => {
    await mockAnonymousAuth(page);
    await page.goto("/login");

    const header = page.locator(".auth-topbar");
    const darkToggle = header.getByRole("button", { name: "Use dark theme" });
    const lightToggle = header.getByRole("button", { name: "Use light theme" });

    await expect(header).toBeVisible();
    await expect(darkToggle).toBeDisabled();
    await expect(lightToggle).toBeEnabled();
    await lightToggle.click();

    await expect(page).toHaveURL(/\/light\/login$/);
    await expect(page.locator(".auth-topbar").getByRole("button", { name: "Use light theme" })).toBeDisabled();
    await expect(page.locator(".auth-topbar").getByRole("button", { name: "Use dark theme" })).toBeEnabled();
  });

  test("login page keeps theme and locale switches grouped in header without public navigation chrome", async ({ page }) => {
    await mockAnonymousAuth(page);
    await page.goto("/login");

    const header = page.locator(".auth-header");
    const topbar = page.locator(".auth-topbar");
    const topbarActions = topbar.locator(".auth-topbar-locale");
    await expect(header).toBeVisible();
    await expect(topbar).toBeVisible();
    await expect(topbarActions).toBeVisible();
    await expect(topbarActions.locator(".auth-topbar-theme-switch")).toHaveCount(1);
    await expect(topbarActions.locator(".auth-topbar-locale-switch")).toHaveCount(1);
    await expect(page.locator(".login-form-toolbar")).toHaveCount(0);
    await expect(topbar.getByRole("button", { name: "Use English locale" })).toBeVisible();
    await expect(topbar.getByRole("button", { name: "Use Chinese locale" })).toBeVisible();
    await expect(page.locator(".login-form-header-actions")).toHaveCount(0);
    await expect(page.locator(".auth-topbar-brand")).toHaveCount(0);
    await expect(page.locator(".login-form-brand")).toBeVisible();
    await expect(page.locator(".login-form-brand-logo")).toHaveAttribute("src", "/brand/skillsindex-logo.svg");
  });

  test("login form brand supports query-based runtime override", async ({ page }) => {
    await mockAnonymousAuth(page);
    await page.goto("/login?loginLogoSrc=/brand/skillsindex-logo.svg%3Fv%3Dcustom&loginBrandText=SkillPortal");

    await expect(page.locator(".auth-topbar-brand-logo")).toHaveCount(0);
    await expect(page.locator(".login-form-brand-logo")).toHaveAttribute("src", /\/brand\/skillsindex-logo\.svg\?v=custom$/);
    await expect(page.locator(".login-form-brand-text")).toHaveText("SkillPortal");
  });

  test("login info panel copy supports query-based runtime override", async ({ page }) => {
    await mockAnonymousAuth(page);
    await page.goto(
      "/login?loginKicker=Configured+Kicker&loginTitle=Configured+Title&loginLead=Configured+Lead&loginKeyPoint1=Configured+Point+One&loginKeyPoint2=Configured+Point+Two&loginKeyPoint3=Configured+Point+Three"
    );

    await expect(page.locator("[data-testid='login-info-hint']")).toHaveText("Configured Title");
    await expect(page.locator("[data-testid='login-info-card']")).toBeVisible();
    await expect(page.locator(".login-info-description")).toHaveText("Configured Lead");
    await expect(page.locator("[data-testid='login-info-eyebrow']")).toHaveText("Configured Kicker");
    await expect(page.locator("[data-testid='login-info-points']")).toHaveCount(1);
    await expect(page.locator(".login-info-points li")).toHaveCount(3);
    await expect(page.locator(".login-info-points li").nth(0)).toContainText("Configured Point One");
    await expect(page.locator(".login-info-points li").nth(1)).toContainText("Configured Point Two");
    await expect(page.locator(".login-info-points li").nth(2)).toContainText("Configured Point Three");
  });

  test("password field supports explicit show and hide toggle", async ({ page }) => {
    await mockAnonymousAuth(page);
    await page.goto("/login");

    const passwordInput = page.locator("input[autocomplete='current-password']");
    const visibilityToggle = page.getByTestId("login-password-visibility-toggle");
    const passwordAffixWrapper = page.locator(".ant-input-affix-wrapper").filter({ has: passwordInput });
    const eyeVisibleIcon = visibilityToggle.locator(".anticon-eye");
    const eyeHiddenIcon = visibilityToggle.locator(".anticon-eye-invisible");

    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(visibilityToggle).toBeVisible();
    await expect(passwordAffixWrapper).toHaveCount(1);
    await expect(passwordAffixWrapper.getByTestId("login-password-visibility-toggle")).toHaveCount(1);
    await expect(eyeVisibleIcon).toHaveCount(1);
    await expect(eyeHiddenIcon).toHaveCount(0);

    await visibilityToggle.click();
    await expect(passwordInput).toHaveAttribute("type", "text");
    await expect(eyeVisibleIcon).toHaveCount(0);
    await expect(eyeHiddenIcon).toHaveCount(1);

    await visibilityToggle.click();
    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(eyeVisibleIcon).toHaveCount(1);
    await expect(eyeHiddenIcon).toHaveCount(0);
  });

  test("third-party provider buttons follow backend auth provider configuration", async ({ page }) => {
    await setAuthProvidersFetchMode(page, "always");
    await mockAnonymousAuth(page, [
      { key: "github", start_path: "/auth/sso/start/github" },
      { key: "wecom", start_path: "/auth/sso/start/wecom" }
    ]);
    await page.goto("/login");

    await expect(page.locator(".oauth-provider-item")).toHaveCount(2);
    await expect(page.locator(".oauth-provider-item[data-provider-key='github']")).toHaveCount(1);
    await expect(page.locator(".oauth-provider-item[data-provider-key='wecom']")).toHaveCount(1);
    await expect(page.locator(".oauth-provider-item[data-provider-key='google']")).toHaveCount(0);
    await expect(page.locator(".oauth-provider-item[data-provider-key='dingtalk']")).toHaveCount(0);
  });

  test("cross-origin login avoids optional provider requests and 404 console noise", async ({ page }) => {
    const consoleErrors: string[] = [];
    let providerRequestCount = 0;

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: null })
      });
    });
    await page.route("**/api/v1/auth/providers", async (route) => {
      providerRequestCount += 1;
      await route.fulfill({
        status: 404,
        contentType: "text/plain",
        body: "Not Found"
      });
    });

    await page.goto("/login");

    expect(providerRequestCount).toBe(0);
    expect(consoleErrors.filter((entry) => entry.includes("Failed to load resource"))).toEqual([]);
    await expect(page.locator(".oauth-provider-item")).toHaveCount(0);
  });

  test("interactive controls expose motion-friendly transition and animation styles", async ({ page }) => {
    await setAuthProvidersFetchMode(page, "always");
    await mockAnonymousAuth(page);
    await page.goto("/login");
    await expect(page.locator(".oauth-provider-item").first()).toBeVisible();

    const motionMetrics = await page.evaluate(() => {
      const submitButton = document.querySelector(".auth-submit");
      const passwordToggle = document.querySelector(".login-password-toggle");
      const oauthProvider = document.querySelector(".oauth-provider-item");
      if (!submitButton || !passwordToggle || !oauthProvider) {
        return null;
      }

      const submitStyles = window.getComputedStyle(submitButton);
      const passwordToggleStyles = window.getComputedStyle(passwordToggle);
      const providerStyles = window.getComputedStyle(oauthProvider);

      return {
        submitTransitionDuration: submitStyles.transitionDuration,
        passwordToggleTransitionDuration: passwordToggleStyles.transitionDuration,
        providerTransitionDuration: providerStyles.transitionDuration,
        providerAnimationName: providerStyles.animationName,
        providerAnimationDuration: providerStyles.animationDuration
      };
    });

    expect(motionMetrics).not.toBeNull();
    if (!motionMetrics) {
      return;
    }
    expect(motionMetrics.submitTransitionDuration).not.toBe("0s");
    expect(motionMetrics.passwordToggleTransitionDuration).not.toBe("0s");
    expect(motionMetrics.providerTransitionDuration).not.toBe("0s");
    expect(motionMetrics.providerAnimationName).toContain("loginPanelEnter");
    expect(motionMetrics.providerAnimationDuration).not.toBe("0s");
  });

  test("login stage is marked as no-drag region", async ({ page }) => {
    await mockAnonymousAuth(page);
    await page.goto("/login");
    await expect(page.locator(".auth-shell.auth-shell-prototype")).toBeVisible();

    const dragMeta = await page.evaluate(() => {
      const stage = document.querySelector(".login-page-stage") || document.querySelector(".auth-shell.auth-shell-prototype");
      if (!stage) {
        return null;
      }
      const stageStyles = window.getComputedStyle(stage);
      const button = stage.querySelector("button");
      const buttonStyles = button ? window.getComputedStyle(button) : null;
      return {
        stageAppRegion: stageStyles.getPropertyValue("-webkit-app-region").trim(),
        stageUserDrag: stageStyles.getPropertyValue("-webkit-user-drag").trim(),
        buttonAppRegion: buttonStyles?.getPropertyValue("-webkit-app-region").trim() || ""
      };
    });

    expect(dragMeta).not.toBeNull();
    if (!dragMeta) {
      return;
    }
    expect(dragMeta.stageAppRegion).toBe("no-drag");
    expect(dragMeta.stageUserDrag).toBe("none");
    expect(dragMeta.buttonAppRegion).toBe("no-drag");
  });

  test("login info panel stays focused without legacy decorative sections", async ({ page }) => {
    await mockAnonymousAuth(page);
    await page.goto("/login");

    await expect(page.locator(".auth-topbar-nav")).toHaveCount(0);
    await expect(page.locator(".auth-stat-grid")).toHaveCount(0);
    await expect(page.locator(".login-badge-row")).toHaveCount(0);
    await expect(page.locator(".auth-context-card")).toHaveCount(0);
    await expect(page.locator(".login-trust-row")).toHaveCount(0);
    await expect(page.locator("[data-testid='login-info-card']")).toBeVisible();
    await expect(page.locator(".login-info-hero")).toHaveCount(0);
    await expect(page.locator("[data-testid='login-info-eyebrow']")).toHaveCount(0);
    await expect(page.locator(".login-info-points li")).toHaveCount(3);
  });
});

test.describe("Login desktop shell behavior", () => {
  test.use({
    viewport: {
      width: 1366,
      height: 768
    }
  });

  test("login layout fills the viewport without outer gaps or page scroll", async ({ page }) => {
    await mockAnonymousAuth(page);
    await page.goto("/login");
    await expect(page.locator(".auth-shell.auth-shell-prototype")).toBeVisible();
    await expect(page.locator(".auth-topbar")).toHaveCount(1);
    await expect(page.locator(".auth-layout")).toBeVisible();

    const layoutMetrics = await page.evaluate(() => {
      const stage = document.querySelector(".login-page-stage");
      const shell = document.querySelector(".auth-shell.auth-shell-prototype");
      const topbar = document.querySelector(".auth-topbar");
      const layout = document.querySelector(".auth-layout");
      const formPanel = document.querySelector(".login-form-panel");
      const visualPanel = document.querySelector(".login-visual-panel");
      if (!stage || !shell || !topbar || !layout || !formPanel || !visualPanel) {
        return null;
      }

      window.scrollTo(0, document.documentElement.scrollHeight);
      const stageRect = stage.getBoundingClientRect();
      const topbarRect = topbar.getBoundingClientRect();
      const layoutRect = layout.getBoundingClientRect();
      const shellStyles = window.getComputedStyle(shell);
      const formPanelStyles = window.getComputedStyle(formPanel);
      const visualPanelStyles = window.getComputedStyle(visualPanel);
      const root = document.documentElement;

      return {
        layoutLeftGap: layoutRect.left - stageRect.left,
        layoutRightGap: stageRect.right - layoutRect.right,
        layoutTopGap: layoutRect.top - stageRect.top,
        layoutBottomGap: stageRect.bottom - layoutRect.bottom,
        topbarHeight: topbarRect.height,
        shellPaddingBottom: shellStyles.paddingBottom,
        formPanelRadius: formPanelStyles.borderTopLeftRadius,
        visualPanelRadius: visualPanelStyles.borderTopLeftRadius,
        pageScrollable: root.scrollHeight > root.clientHeight
      };
    });

    expect(layoutMetrics).not.toBeNull();
    if (!layoutMetrics) {
      return;
    }
    expect(layoutMetrics.shellPaddingBottom).toBe("0px");
    expect(layoutMetrics.formPanelRadius).toBe("0px");
    expect(layoutMetrics.visualPanelRadius).toBe("0px");
    expect(layoutMetrics.pageScrollable).toBe(false);
    expect(Math.abs(layoutMetrics.layoutLeftGap)).toBeLessThanOrEqual(1);
    expect(Math.abs(layoutMetrics.layoutRightGap)).toBeLessThanOrEqual(1);
    expect(layoutMetrics.topbarHeight).toBeGreaterThan(0);
    expect(Math.abs(layoutMetrics.layoutTopGap - layoutMetrics.topbarHeight)).toBeLessThanOrEqual(1);
    expect(Math.abs(layoutMetrics.layoutBottomGap)).toBeLessThanOrEqual(1);
  });
});
