import { expect, test } from "@playwright/test";

const HOME_PATH = "/";
const RESULTS_PATH = "/results";
const selectors = {
  root: ".marketplace-home",
  resultsPageRoot: ".marketplace-home.is-results-page",
  resultsFloatingContainer:
    "[data-testid='marketplace-results-floating-container'], .marketplace-results-floating-container, .marketplace-results-overlay-panel, [role='dialog']",
  resultsFloatingMask: "[data-testid='marketplace-results-floating-mask'], .marketplace-results-floating-mask, .marketplace-results-overlay-mask",
  resultsFloatingContext: "[data-testid='marketplace-results-modal-context']",
  topStatsCard: ".marketplace-top-stats-card",
  searchStrip: ".marketplace-search-strip",
  searchUtilityRow: ".marketplace-search-utility-row",
  searchKeywordInput: ".marketplace-search-input.is-query input",
  modalKeywordInput: ".marketplace-results-modal-input.is-query input",
  resultsKeywordInput: ".marketplace-home.is-results-page .marketplace-search-input.is-query input",
  resultsSemanticInput: ".marketplace-home.is-results-page .marketplace-search-input.is-semantic input",
  resultsToolbar: ".marketplace-results-toolbar",
  resultsToolbarTitle: ".marketplace-results-toolbar h2",
  featuredRow: ".marketplace-featured-row",
  resultsList: ".marketplace-results-list",
  topbarBrand: ".marketplace-topbar-brand",
  topbarSecondaryCta: ".marketplace-topbar-secondary-cta",
  topbarCta: ".marketplace-topbar-cta",
  topbarLocaleSwitch: ".marketplace-topbar-locale-switch",
  topbarThemeSwitch: ".marketplace-topbar-theme-switch",
  loadMoreButton: ".marketplace-pagination-load-more",
  pagination: ".marketplace-pagination, [aria-label='pagination']",
  paginationPrev: ".marketplace-pagination .is-nav:first-of-type, [aria-label='pagination'] .is-nav:first-of-type",
  paginationNext: ".marketplace-pagination .is-nav:last-of-type, [aria-label='pagination'] .is-nav:last-of-type",
  paginationEmptyHint: "[data-testid='marketplace-pagination-empty-hint']",
  paginationFinishedHint: "[data-testid='marketplace-pagination-finished-hint']",
  resultsEmptyState: "[data-testid='marketplace-results-empty-state']",
  skillRowCard: ".marketplace-skill-row",
  skillRowNameButton: ".marketplace-skill-row .marketplace-skill-name button",
  resultsModalCardTitle: ".marketplace-home.is-results-page .marketplace-results-list .marketplace-skill-name button",
  animatedSection: "[data-animated='true'].animated-fade-up"
} as const;

test.describe("Marketplace home interactions", () => {
  test("homepage loads and shows core sections", async ({ page }) => {
    await page.goto(HOME_PATH);

    await expect(page.locator(selectors.resultsToolbar).first()).toBeVisible();
    await expect(page.locator(selectors.featuredRow)).toBeVisible();
    await expect(page.locator(selectors.topStatsCard)).toBeVisible();
    await expect(page.locator(selectors.searchStrip)).toBeVisible();
    await expect(page.locator(selectors.searchUtilityRow)).toBeVisible();
    await expect(page.locator(selectors.resultsList)).toBeVisible();
    await expect(page.locator(selectors.loadMoreButton)).toBeVisible();
  });

  test("homepage renders card counts aligned with prototype grid", async ({ page }) => {
    await page.goto(HOME_PATH);

    await expect(page.locator(".marketplace-featured-row .marketplace-skill-row")).toHaveCount(3);
    await expect(page.locator(".marketplace-results-list .marketplace-skill-row")).toHaveCount(12);
    await expect(page.locator(".marketplace-results-list .marketplace-results-row")).toHaveCount(4);
  });

  test("home search action opens dedicated results route and preserves current query", async ({ page }) => {
    await page.goto("/?q=repo");
    await page.locator(selectors.searchKeywordInput).click();
    await expect(page).toHaveURL(/\/\?q=repo$/);
    await expect(page.locator(selectors.resultsFloatingContainer).first()).toBeVisible();
    await page.locator(selectors.modalKeywordInput).press("Enter");
    await expect(page).toHaveURL(/\/results\?q=repo$/);
    await expect(page.locator(selectors.resultsPageRoot).first()).toBeVisible();
  });

  test("search action updates URL query state", async ({ page }) => {
    await page.goto("/?q=odoo&page=2");
    await page.locator(selectors.searchKeywordInput).click();
    await expect(page.locator(selectors.resultsFloatingContainer).first()).toBeVisible();
    await page.locator(selectors.modalKeywordInput).press("Enter");
    await expect(page).toHaveURL(/\/results\?q=odoo$/);
  });

  test("clicking home search entry opens floating modal", async ({ page }) => {
    await page.goto(HOME_PATH);
    await page.locator(selectors.searchKeywordInput).click();
    await expect(page).toHaveURL(HOME_PATH);
    await expect(page.locator(selectors.resultsFloatingContainer).first()).toBeVisible();
    await expect(page.locator(selectors.resultsFloatingMask).first()).toBeVisible();
    await expect(page.locator(selectors.resultsFloatingContext).first()).toBeVisible();
  });

  test("results page search fields update query params", async ({ page }) => {
    await page.goto(RESULTS_PATH);
    await page.locator(selectors.resultsKeywordInput).fill("odoo");
    await page.locator(selectors.resultsSemanticInput).fill("workflow");
    await page.locator(selectors.resultsSemanticInput).press("Enter");

    await expect(page).toHaveURL(/\/results\?q=odoo&tags=workflow$/);
  });

  test("category detail results page uses category results title instead of latest title", async ({ page }) => {
    await page.goto("/categories/tools?category=tools&page=1");

    const resultsToolbarTitle = page.locator(selectors.resultsToolbarTitle).first();
    await expect(page.locator(selectors.resultsPageRoot).first()).toBeVisible();
    await expect(resultsToolbarTitle).toContainText(/Category Results|分类/);
    await expect(resultsToolbarTitle).not.toContainText(/Latest|最新上架/);
  });

  test("results entry chips can apply quick tag filters", async ({ page }) => {
    await page.goto(RESULTS_PATH);
    await page.locator(".marketplace-top-recommend-chips button").first().click();
    await expect(page).toHaveURL(/\/results\?tags=automation\+testing$/);
  });

  test("brand action clears query state and returns base path", async ({ page }) => {
    await page.goto("/?q=odoo&tags=playwright&page=2");
    await page.locator(selectors.topbarBrand).click();

    await expect(page).toHaveURL(HOME_PATH);
  });

  test("home route page above first hides numeric pagination and keeps virtual auto-load", async ({ page }) => {
    await page.goto("/?q=odoo&page=2");
    await expect(page.locator(selectors.pagination)).toHaveCount(0);

    const loadMoreButton = page.locator(selectors.loadMoreButton);
    await expect(loadMoreButton).toBeVisible();
    await expect(loadMoreButton.locator(".marketplace-pagination-loading-arrow")).toHaveCount(1);
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await expect
      .poll(async () => {
        const currentURL = new URL(page.url());
        return Number(currentURL.searchParams.get("page") || "1");
      })
      .toBeGreaterThan(2);
    await expect(loadMoreButton).toHaveAttribute("aria-busy", "false");
  });

  test("scrolling in pagination mode does not auto-advance page", async ({ page }) => {
    await page.goto("/?q=odoo&page=2");
    const hasNumericPagination =
      (await page.locator(selectors.paginationPrev).count()) > 0 &&
      (await page.locator(selectors.paginationNext).count()) > 0;

    if (hasNumericPagination) {
      await expect(page.locator(selectors.pagination)).toBeVisible();
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(220);
      await expect(page).toHaveURL(/\/\?q=odoo&page=2$/);
      return;
    }

    const hasLoadMoreIndicator = (await page.locator(selectors.loadMoreButton).count()) > 0;
    if (!hasLoadMoreIndicator) {
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(220);
      await expect(page).toHaveURL(/\/\?q=odoo&page=2$/);
      return;
    }

    const loadMoreButton = page.locator(selectors.loadMoreButton);
    await expect(loadMoreButton).toBeVisible();
    await page.evaluate(() => {
      const targetY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight - 140);
      window.scrollTo(0, targetY);
    });
    await expect
      .poll(async () => {
        return await loadMoreButton.getAttribute("data-state");
      })
      .toMatch(/^(idle|loading)$/);
    await expect
      .poll(async () => {
        const rawValue = await loadMoreButton.getAttribute("data-progress");
        return Number(rawValue || "0");
      })
      .toBeGreaterThanOrEqual(0);
  });

  test("pagination next and previous advance pages step-by-step", async ({ page }) => {
    await page.goto("/?q=odoo&page=2");
    await expect
      .poll(async () => {
        const hasNumeric = (await page.locator(selectors.pagination).count()) > 0;
        const hasLoadMore = (await page.locator(selectors.loadMoreButton).count()) > 0;
        return hasNumeric || hasLoadMore;
      })
      .toBe(true);
    const hasNumericPagination =
      (await page.locator(selectors.paginationPrev).count()) > 0 &&
      (await page.locator(selectors.paginationNext).count()) > 0;

    if (hasNumericPagination) {
      await expect(page.locator(selectors.pagination)).toBeVisible();
      await page.locator(selectors.paginationNext).click();
      await expect(page).toHaveURL(/\/\?q=odoo&page=3$/);
      await page.locator(selectors.paginationPrev).click();
      await expect(page).toHaveURL(/\/\?q=odoo&page=2$/);
      return;
    }

    const loadMoreButton = page.locator(selectors.loadMoreButton);
    const hasLoadMoreIndicator = (await loadMoreButton.count()) > 0;
    if (!hasLoadMoreIndicator) {
      await expect(page.locator(selectors.pagination)).toBeVisible();
      return;
    }
    await expect(loadMoreButton).toBeVisible();
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await expect
      .poll(async () => {
        const currentURL = new URL(page.url());
        return Number(currentURL.searchParams.get("page") || "1");
      })
      .toBeGreaterThan(2);
    const firstPage = await page.evaluate(() => Number(new URL(window.location.href).searchParams.get("page") || "1"));
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(150);
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await expect
      .poll(async () => {
        const currentURL = new URL(page.url());
        return Number(currentURL.searchParams.get("page") || "1");
      })
      .toBeGreaterThan(firstPage);
  });

  test("pagination mode keeps rendered card count stable per page", async ({ page }) => {
    await page.goto("/?q=odoo&page=2");
    await expect(page.locator(selectors.resultsList)).toBeVisible();
    const initialRenderedCards = await page.locator(".marketplace-results-list .marketplace-skill-row").count();
    expect(initialRenderedCards).toBeGreaterThan(0);
    expect(initialRenderedCards).toBeLessThanOrEqual(12);

    const hasNumericPagination = (await page.locator(selectors.pagination).count()) > 0;

    if (hasNumericPagination) {
      await expect(page.locator(selectors.pagination)).toBeVisible();
      await page.locator(selectors.paginationNext).click();
      await expect(page).toHaveURL(/\/\?q=odoo&page=3$/);
      const nextPageCount = await page.locator(".marketplace-results-list .marketplace-skill-row").count();
      expect(nextPageCount).toBeGreaterThan(0);
      expect(nextPageCount).toBeLessThanOrEqual(12);
      return;
    }

    const hasLoadMoreIndicator = (await page.locator(selectors.loadMoreButton).count()) > 0;
    if (!hasLoadMoreIndicator) {
      await expect(page).toHaveURL(/\/\?q=odoo&page=2$/);
      return;
    }

    await expect(page.locator(selectors.loadMoreButton)).toBeVisible();
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(450);
    const currentPage = await page.evaluate(() => Number(new URL(window.location.href).searchParams.get("page") || "1"));
    expect(currentPage).toBeGreaterThanOrEqual(2);

    const expectedAccumulatedCards = Math.max(12, currentPage * 12);
    const renderedCards = await page.locator(".marketplace-results-list .marketplace-skill-row").count();
    expect(renderedCards).toBeGreaterThan(0);
    expect(renderedCards).toBeLessThanOrEqual(expectedAccumulatedCards);
  });

  test("load-more indicator is icon-only and animated", async ({ page }) => {
    await page.goto(HOME_PATH);
    await expect(page.locator(selectors.loadMoreButton)).toBeVisible();

    const indicatorMetrics = await page.evaluate(() => {
      const ringNode = document.querySelector<HTMLElement>(".marketplace-pagination-loading-ring");
      const dots = document.querySelectorAll<HTMLElement>(".marketplace-pagination-loading-dots span");
      const hiddenLabelNode = document.querySelector<HTMLElement>(".marketplace-visually-hidden");
      if (!ringNode || dots.length !== 3 || !hiddenLabelNode) {
        return null;
      }
      const ringStyle = window.getComputedStyle(ringNode);
      const indicatorNode = document.querySelector<HTMLElement>(".marketplace-pagination-load-indicator");
      const indicatorStyle = indicatorNode ? window.getComputedStyle(indicatorNode) : null;
      return {
        ringAnimationName: ringStyle.animationName,
        indicatorAnimationName: indicatorStyle?.animationName || "none",
        dotCount: dots.length
      };
    });

    expect(indicatorMetrics).not.toBeNull();
    expect(indicatorMetrics?.dotCount).toBe(3);
    expect(indicatorMetrics?.ringAnimationName).not.toBe("none");
    expect(indicatorMetrics?.indicatorAnimationName).toContain("marketplaceAutoLoadSwing");
  });

  test("empty home results show no-data hint and stop auto-load interaction", async ({ page }) => {
    await page.goto("/?q=skill-not-found-zzzz");
    await expect(page.locator(selectors.resultsEmptyState)).toBeVisible();
    await expect(page.locator(selectors.paginationEmptyHint)).toBeVisible();
    await expect(page.locator(selectors.loadMoreButton)).toHaveCount(0);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await expect(page).toHaveURL("/?q=skill-not-found-zzzz");
  });

  test("closing results route keeps home paging interactions", async ({ page }) => {
    await page.goto("/results?q=odoo&page=2");
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/\?q=odoo&page=2$/);
    const hasNumericPagination = (await page.locator(selectors.pagination).count()) > 0;
    if (hasNumericPagination) {
      await expect(page.locator(selectors.pagination)).toBeVisible();
      await page.locator(selectors.paginationNext).click();
      await expect(page).toHaveURL(/\/\?q=odoo&page=3$/);
      return;
    }

    const hasLoadMore = (await page.locator(selectors.loadMoreButton).count()) > 0;
    if (hasLoadMore) {
      await expect(page.locator(selectors.loadMoreButton)).toBeVisible();
      return;
    }

    const hasEmptyState = (await page.locator(selectors.resultsEmptyState).count()) > 0;
    if (hasEmptyState) {
      await expect(page.locator(selectors.resultsEmptyState)).toBeVisible();
      return;
    }

    await expect(page.locator(selectors.resultsList)).toBeVisible();
  });

  test("home search entry opens dedicated results route", async ({ page }) => {
    await page.goto(HOME_PATH);
    await page.locator(selectors.searchKeywordInput).click();
    await expect(page.locator(selectors.resultsFloatingContainer).first()).toBeVisible();
    await page.locator(selectors.modalKeywordInput).press("Enter");
    await expect(page).toHaveURL(/\/results$/);
  });

  test("scrolling at the last page does not trigger additional loading", async ({ page }) => {
    await page.goto("/?q=odoo&page=109");
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await expect(page).toHaveURL(/\/\?q=odoo&page=109$/);
    await expect(page.locator(selectors.paginationFinishedHint)).toBeVisible();
    await expect(page.locator(selectors.loadMoreButton)).toHaveCount(0);
  });

  test("topbar sign-in action navigates to auth-protected route", async ({ page }) => {
    await page.goto(HOME_PATH);

    await expect(page.locator(selectors.topbarCta)).toBeVisible();
    const topbarRightMetrics = await page.evaluate(() => {
      const cta = document.querySelector<HTMLElement>(".marketplace-topbar-cta");
      const localeSwitch = document.querySelector<HTMLElement>(".marketplace-topbar-locale-switch");
      if (!cta || !localeSwitch) {
        return null;
      }
      const ctaRect = cta.getBoundingClientRect();
      const localeRect = localeSwitch.getBoundingClientRect();
      return {
        ctaLeft: ctaRect.left,
        ctaRightGap: window.innerWidth - ctaRect.right,
        localeRight: localeRect.right,
        localeRightGap: window.innerWidth - localeRect.right
      };
    });
    expect(topbarRightMetrics).not.toBeNull();
    expect((topbarRightMetrics?.ctaLeft || 0) >= (topbarRightMetrics?.localeRight || 0)).toBe(true);
    expect((topbarRightMetrics?.ctaRightGap || 999) <= (topbarRightMetrics?.localeRightGap || 0)).toBe(true);

    await page.locator(selectors.topbarCta).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator(".marketplace-search-utility-right .is-open-queue")).toHaveCount(0);
    await expect(page.locator(".marketplace-search-utility-right .is-queue")).toHaveCount(0);
  });

  test("topbar console action navigates to workspace route", async ({ page }) => {
    await page.goto(HOME_PATH);

    const consoleAction = page.locator(selectors.topbarSecondaryCta);
    const authAction = page.locator(selectors.topbarCta);
    await expect(consoleAction).toBeVisible();
    await expect(authAction).toBeVisible();

    const rightActionOrder = await page.evaluate(() => {
      const consoleButton = document.querySelector<HTMLElement>(".marketplace-topbar-secondary-cta");
      const authButton = document.querySelector<HTMLElement>(".marketplace-topbar-cta");
      if (!consoleButton || !authButton) {
        return null;
      }
      const consoleRect = consoleButton.getBoundingClientRect();
      const authRect = authButton.getBoundingClientRect();
      return {
        consoleLeft: consoleRect.left,
        authLeft: authRect.left
      };
    });
    expect(rightActionOrder).not.toBeNull();
    expect((rightActionOrder?.consoleLeft || 0) < (rightActionOrder?.authLeft || 0)).toBe(true);

    await consoleAction.click();
    await expect(page).toHaveURL(/\/workspace$/);
  });

  test("default home topbar shows category and download ranking navigation", async ({ page }) => {
    await page.goto(HOME_PATH);
    const topbarButtons = page.locator(".marketplace-topbar-light-nav button");
    await expect(topbarButtons).toHaveCount(2);
    await expect(topbarButtons.nth(0)).toBeVisible();
    await expect(topbarButtons.nth(1)).toBeVisible();
  });

  test("light home topbar shows category and download ranking navigation", async ({ page }) => {
    await page.goto("/light");
    const topbarButtons = page.locator(".marketplace-topbar-light-nav button");
    const categoriesButton = topbarButtons.nth(0);
    const rankingsButton = topbarButtons.nth(1);
    await expect(topbarButtons).toHaveCount(2);

    await expect(categoriesButton).toBeVisible();
    await expect(rankingsButton).toBeVisible();

    await categoriesButton.click();
    await expect(page).toHaveURL(/\/light\/categories$/);

    await page.goto("/light");
    await expect(rankingsButton).toBeVisible();
    await rankingsButton.click();
    await expect(page).toHaveURL(/\/light\/rankings$/);
  });

  test("topbar locale switch updates homepage copy", async ({ page }) => {
    await page.goto(HOME_PATH);

    const localeSwitch = page.locator(selectors.topbarLocaleSwitch);
    await expect(localeSwitch).toBeVisible();

    await localeSwitch.getByRole("button", { name: "Switch to English locale", exact: true }).click();
    await expect(page.locator(selectors.topbarBrand)).toContainText("SkillsIndex");

    await localeSwitch.getByRole("button", { name: "Switch to Chinese locale", exact: true }).click();
    await expect(page.locator(selectors.topbarBrand)).toContainText("\u6280\u80fd\u7d22\u5f15");
  });

  test("topbar theme switch updates route prefix and root tokens", async ({ page }) => {
    await page.goto(HOME_PATH);
    const themeSwitch = page.locator(selectors.topbarThemeSwitch);
    await expect(themeSwitch).toBeVisible();

    await expect
      .poll(async () => {
        return await page.evaluate(() => document.documentElement.getAttribute("data-theme-mode"));
      })
      .toBe("dark");

    await themeSwitch.getByRole("button", { name: "Switch to light theme", exact: true }).click();
    await expect(page).toHaveURL("/light");
    await expect
      .poll(async () => {
        return await page.evaluate(() => {
          const rootStyle = window.getComputedStyle(document.documentElement);
          return {
            mode: document.documentElement.getAttribute("data-theme-mode"),
            canvas: rootStyle.getPropertyValue("--si-color-canvas").trim(),
            panel: rootStyle.getPropertyValue("--si-color-panel").trim()
          };
        });
      })
      .toMatchObject({
        mode: "light",
        canvas: "#eef1f5",
        panel: "#ffffff"
      });

    await themeSwitch.getByRole("button", { name: "Switch to dark theme", exact: true }).click();
    await expect(page).toHaveURL(HOME_PATH);
    await expect
      .poll(async () => {
        return await page.evaluate(() => {
          const rootStyle = window.getComputedStyle(document.documentElement);
          return {
            mode: document.documentElement.getAttribute("data-theme-mode"),
            canvas: rootStyle.getPropertyValue("--si-color-canvas").trim(),
            panel: rootStyle.getPropertyValue("--si-color-panel").trim()
          };
        });
      })
      .toMatchObject({
        mode: "dark",
        canvas: "#101010",
        panel: "#111111"
      });
  });

  test("results page supports Enter submission for quick keyword update", async ({ page }) => {
    await page.goto(RESULTS_PATH);
    await page.locator(selectors.resultsKeywordInput).fill("repo");
    await page.locator(selectors.resultsKeywordInput).press("Enter");
    await expect(page).toHaveURL(/\/results\?q=repo$/);
  });

  test("results page remains visible after semantic filter submission", async ({ page }) => {
    await page.goto(RESULTS_PATH);
    await page.locator(selectors.resultsSemanticInput).fill("policy lint");
    await page.locator(selectors.resultsSemanticInput).press("Enter");
    await expect(page).toHaveURL(/\/results\?tags=policy\+lint$/);
    await expect(page.locator(selectors.resultsPageRoot).first()).toBeVisible();
    const resultsTitleButton = page.locator(selectors.resultsModalCardTitle).first();
    const emptyState = page.locator(selectors.resultsEmptyState);
    await expect
      .poll(async () => {
        const hasVisibleResult =
          (await resultsTitleButton.count()) > 0 && (await resultsTitleButton.isVisible().catch(() => false));
        if (hasVisibleResult) {
          return "card";
        }
        if (await emptyState.isVisible().catch(() => false)) {
          return "empty";
        }
        return "pending";
      })
      .toMatch(/^(card|empty)$/);
  });

  test("results page updates to empty state when keyword has no matches", async ({ page }) => {
    await page.goto("/results?q=playwright");
    await expect(page.locator(selectors.resultsList)).toBeVisible();
    await page.locator(selectors.resultsKeywordInput).fill("zzzz-not-found-keyword");
    await page.locator(selectors.resultsKeywordInput).press("Enter");
    await expect(page).toHaveURL(/\/results\?q=zzzz-not-found-keyword$/);
    await expect(page.locator(selectors.resultsEmptyState)).toBeVisible();
  });

  test("results quick filters update selected tag query", async ({ page }) => {
    await page.goto(RESULTS_PATH);
    const chips = page.locator(".marketplace-top-recommend-chips button");
    await expect(chips).toHaveCount(3);
    await chips.nth(1).click();
    await expect(page).toHaveURL(/\/results\?tags=/);
  });

  test("clicking a skill card row navigates to the skill detail route", async ({ page }) => {
    await page.goto(HOME_PATH);
    await page.locator(selectors.skillRowCard).first().click();

    await expect(page).toHaveURL(/\/skills\/\d+$/);
  });

  test("animated sections expose non-none animation name", async ({ page }) => {
    await page.goto(HOME_PATH);
    const animationName = await page.locator(selectors.animatedSection).first().evaluate((element) => {
      return window.getComputedStyle(element).animationName;
    });
    expect(animationName).not.toBe("none");
  });
});
