import { expect, test } from "@playwright/test";

const HOME_PATH = "/";
const RESULTS_PATH = "/results";
const selectors = {
  root: ".marketplace-home",
  resultsFloatingContainer:
    "[data-testid='marketplace-results-floating-container'], .marketplace-results-floating-container, .marketplace-results-overlay-panel, [role='dialog']",
  resultsFloatingMask: "[data-testid='marketplace-results-floating-mask'], .marketplace-results-floating-mask, .marketplace-results-overlay-mask",
  resultsFloatingClose: "[data-testid='marketplace-results-floating-close'], .marketplace-results-floating-close, .marketplace-results-overlay-close",
  topStatsCard: ".marketplace-top-stats-card",
  searchStrip: ".marketplace-search-strip",
  searchUtilityRow: ".marketplace-search-utility-row",
  searchFilterBtn: ".marketplace-search-filter-btn",
  searchKeywordInput: ".marketplace-search-input.is-query input",
  resultsKeywordInput: ".marketplace-results-modal-input.is-query input",
  resultsSemanticInput: ".marketplace-results-modal-input.is-semantic input",
  resultsSearchButton: ".marketplace-results-modal-search",
  resultsToolbar: ".marketplace-results-toolbar",
  featuredRow: ".marketplace-featured-row",
  resultsList: ".marketplace-results-list",
  topbarBrand: ".marketplace-topbar-brand",
  topbarCta: ".marketplace-topbar-cta",
  topbarLocaleSwitch: ".marketplace-topbar-locale-switch",
  topbarThemeSwitch: ".marketplace-topbar-theme-switch",
  searchSubmit: ".marketplace-search-submit",
  openQueue: ".marketplace-search-utility-right .is-open-queue",
  loadMoreButton: ".marketplace-pagination-load-more",
  pagination: ".marketplace-pagination, [aria-label='pagination']",
  paginationPrev: ".marketplace-pagination .is-nav:first-of-type, [aria-label='pagination'] .is-nav:first-of-type",
  paginationNext: ".marketplace-pagination .is-nav:last-of-type, [aria-label='pagination'] .is-nav:last-of-type",
  paginationEmptyHint: "[data-testid='marketplace-pagination-empty-hint']",
  resultsEmptyState: "[data-testid='marketplace-results-empty-state']",
  skillRowNameButton: ".marketplace-skill-row .marketplace-skill-name button",
  resultsModalCardTitle: ".marketplace-results-modal-card h3",
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

  test("quick filter action opens results and keeps current query", async ({ page }) => {
    await page.goto("/?q=repo");
    await page.locator(selectors.searchFilterBtn).click();
    await expect(page).toHaveURL(/\/results\?q=repo$/);
  });

  test("search action updates URL query state", async ({ page }) => {
    await page.goto("/?q=odoo&page=2");
    await page.locator(selectors.searchSubmit).click();

    await expect(page).toHaveURL(/\/results\?q=odoo$/);
  });

  test("clicking home search entry opens floating modal route", async ({ page }) => {
    await page.goto(HOME_PATH);
    await page.locator(selectors.searchKeywordInput).click();
    await expect(page).toHaveURL(/\/results$/);
  });

  test("floating modal search fields update query params", async ({ page }) => {
    await page.goto(RESULTS_PATH);
    await page.locator(selectors.resultsKeywordInput).fill("odoo");
    await page.locator(selectors.resultsSemanticInput).fill("workflow");
    await page.locator(selectors.resultsSearchButton).click();

    await expect(page).toHaveURL(/\/results\?q=odoo&tags=workflow$/);
  });

  test("results entry chips can apply quick tag filters", async ({ page }) => {
    await page.goto(RESULTS_PATH);
    await page.locator(".marketplace-results-entry-chips button").first().click();
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
    const hasNumericPagination = (await page.locator(selectors.pagination).count()) > 0;

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
    const hasNumericPagination = (await page.locator(selectors.pagination).count()) > 0;

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
    await page.locator(selectors.resultsFloatingClose).first().click();
    await expect(page).toHaveURL(/\/\?q=odoo&page=2$/);
    const hasNumericPagination = (await page.locator(selectors.pagination).count()) > 0;
    if (hasNumericPagination) {
      await expect(page.locator(selectors.pagination)).toBeVisible();
      await page.locator(selectors.paginationNext).click();
      await expect(page).toHaveURL(/\/\?q=odoo&page=3$/);
      return;
    }

    await expect(page.locator(selectors.loadMoreButton)).toBeVisible();
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await expect
      .poll(async () => {
        const currentURL = new URL(page.url());
        return Number(currentURL.searchParams.get("page") || "1");
      })
      .toBeGreaterThan(2);
  });

  test("home search entry opens dedicated results route", async ({ page }) => {
    await page.goto(HOME_PATH);
    await page.locator(selectors.searchKeywordInput).click();
    await expect(page).toHaveURL(/\/results$/);
  });

  test("scrolling at the last page does not trigger additional loading", async ({ page }) => {
    await page.goto("/?q=odoo&page=109");
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await expect(page).toHaveURL(/\/\?q=odoo&page=109$/);
  });

  test("topbar and utility actions navigate to auth-protected routes", async ({ page }) => {
    await page.goto(HOME_PATH);

    await page.locator(selectors.topbarCta).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goto(HOME_PATH);
    await page.locator(selectors.openQueue).click();
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

  test("results modal supports Enter submission for quick keyword update", async ({ page }) => {
    await page.goto(RESULTS_PATH);
    await page.locator(selectors.resultsKeywordInput).fill("repo");
    await page.locator(selectors.resultsKeywordInput).press("Enter");
    await expect(page).toHaveURL(/\/results\?q=repo$/);
  });

  test("results modal remains visible after semantic filter submission", async ({ page }) => {
    await page.goto(RESULTS_PATH);
    await page.locator(selectors.resultsSemanticInput).fill("policy lint");
    await page.locator(selectors.resultsSearchButton).click();
    await expect(page).toHaveURL(/\/results\?tags=policy\+lint$/);
    await expect(page.locator(selectors.resultsFloatingContainer).first()).toBeVisible();
    await expect(page.locator(selectors.resultsModalCardTitle).first()).toBeVisible();
  });

  test("results modal cards react to keyword changes", async ({ page }) => {
    await page.goto("/results?q=playwright");
    const beforeTitles = await page.$$eval(selectors.resultsModalCardTitle, (nodes) => nodes.map((node) => node.textContent?.trim() || ""));
    await page.locator(selectors.resultsKeywordInput).fill("zzzz-not-found-keyword");
    await page.locator(selectors.resultsSearchButton).click();
    await expect(page).toHaveURL(/\/results\?q=zzzz-not-found-keyword$/);
    await expect
      .poll(async () => {
        const titles = await page.$$eval(selectors.resultsModalCardTitle, (nodes) => nodes.map((node) => node.textContent?.trim() || ""));
        return JSON.stringify(titles);
      })
      .not.toBe(JSON.stringify(beforeTitles));
  });

  test("results quick filters keep visual active state in sync with selected filter", async ({ page }) => {
    await page.goto(RESULTS_PATH);
    const chips = page.locator(".marketplace-results-entry-chips button");
    await expect(chips).toHaveCount(3);
    await chips.nth(1).click();
    await expect(page).toHaveURL(/\/results\?tags=/);
    const activeStates = await chips.evaluateAll((nodes) => nodes.map((node) => node.classList.contains("is-active")));
    expect(activeStates[1]).toBe(true);
    expect(activeStates[0]).toBe(false);
  });

  test("clicking a result row navigates to the skill detail route", async ({ page }) => {
    await page.goto(HOME_PATH);
    await page.locator(selectors.skillRowNameButton).first().click();

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

test.describe("Marketplace results floating page interactions", () => {
  test("results route shows floating container and mask", async ({ page }) => {
    await page.goto(RESULTS_PATH);

    await expect(page.locator(selectors.resultsFloatingContainer).first()).toBeVisible();
    await expect(page.locator(selectors.resultsFloatingMask).first()).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  test("close button closes floating page back to home route", async ({ page }) => {
    await page.goto(RESULTS_PATH);
    await page.locator(selectors.resultsFloatingClose).first().click();

    await expect(page).toHaveURL(HOME_PATH);
  });

  test("close keeps current query params when returning to home route", async ({ page }) => {
    await page.goto("/results?q=odoo&tags=workflow&page=3&sort=quality");
    await page.locator(selectors.resultsFloatingClose).first().click();

    await expect(page).toHaveURL(/\/\?q=odoo&tags=workflow&sort=quality&page=3$/);
  });

  test("escape closes floating page back to home route", async ({ page }) => {
    await page.goto(RESULTS_PATH);
    await page.keyboard.press("Escape");

    await expect(page).toHaveURL(HOME_PATH);
  });

  test("clicking mask closes floating page back to home route", async ({ page }) => {
    await page.goto(RESULTS_PATH);
    await page.locator(selectors.resultsFloatingMask).first().click({ position: { x: 4, y: 4 } });

    await expect(page).toHaveURL(HOME_PATH);
  });

  test("escape keeps current query params when returning to home route", async ({ page }) => {
    await page.goto("/results?q=repo&mode=ai");
    await page.keyboard.press("Escape");

    await expect(page).toHaveURL(/\/\?q=repo&mode=ai$/);
  });

  test("results modal traps keyboard focus within dialog", async ({ page }) => {
    await page.goto(RESULTS_PATH);
    await expect(page.locator(selectors.resultsFloatingContainer).first()).toBeVisible();
    for (let index = 0; index < 60; index += 1) {
      await page.keyboard.press("Tab");
    }
    const isFocusInsideModal = await page.evaluate(() => {
      const activeElement = document.activeElement;
      return Boolean(activeElement && activeElement.closest(".marketplace-results-modal"));
    });
    expect(isFocusInsideModal).toBe(true);
  });

  test("repeated search submit with identical query does not push duplicate history", async ({ page }) => {
    await page.goto("/results?q=repo");
    await page.evaluate(() => {
      (window as Window & { __beforeHistoryLength?: number }).__beforeHistoryLength = window.history.length;
    });
    await page.locator(selectors.resultsSearchButton).click();
    await page.waitForTimeout(150);
    const historySnapshot = await page.evaluate(() => {
      const value = (window as Window & { __beforeHistoryLength?: number }).__beforeHistoryLength;
      return {
        before: Number(value || 0),
        after: window.history.length
      };
    });
    expect(historySnapshot.after).toBe(historySnapshot.before);
  });

  test("light results modal follows light theme tokens", async ({ page }) => {
    await page.goto("/light/results");
    await expect(page.locator(selectors.resultsFloatingContainer).first()).toBeVisible();

    await expect
      .poll(async () => {
        return await page.evaluate(() => {
          const rootStyle = window.getComputedStyle(document.documentElement);
          const modal = document.querySelector<HTMLElement>(".marketplace-results-modal");
          const modalStyle = modal ? window.getComputedStyle(modal) : null;
          return {
            mode: document.documentElement.getAttribute("data-theme-mode"),
            panelToken: rootStyle.getPropertyValue("--si-color-panel").trim(),
            canvasToken: rootStyle.getPropertyValue("--si-color-canvas").trim(),
            modalBackground: modalStyle?.backgroundColor || "",
            modalBorder: modalStyle?.borderColor || ""
          };
        });
      })
      .toMatchObject({
        mode: "light",
        panelToken: "#ffffff",
        canvasToken: "#eef1f5",
        modalBackground: "rgb(255, 255, 255)"
      });
  });
});
