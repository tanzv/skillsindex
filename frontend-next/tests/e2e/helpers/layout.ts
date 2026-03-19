import { expect, type Locator, type Page } from "@playwright/test";

export async function expectSingleRow(locator: Locator, maximumTopDelta = 10) {
  const itemTops = await locator.evaluateAll((elements) =>
    elements.map((element) => Math.round(element.getBoundingClientRect().top))
  );

  expect(itemTops.length).toBeGreaterThan(1);
  expect(Math.max(...itemTops) - Math.min(...itemTops)).toBeLessThanOrEqual(maximumTopDelta);
}

export async function expectFeaturedGridColumns(page: Page) {
  const row = page.getByTestId("landing-latest-rows").locator(".marketplace-results-row").first();
  await expect(row).toBeVisible();

  const layout = await row.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const firstCard = element.querySelector(".marketplace-home-deck-card");
    const firstCardRect = firstCard?.getBoundingClientRect() || null;

    return {
      rowWidth: rect.width,
      columns: style.gridTemplateColumns.split(" ").filter(Boolean).length,
      firstCardWidth: firstCardRect?.width || 0,
      firstCardHeight: firstCardRect?.height || 0
    };
  });

  expect(layout.columns).toBe(3);
  expect(layout.firstCardWidth).toBeGreaterThan(layout.rowWidth * 0.25);
  expect(layout.firstCardWidth).toBeLessThan(layout.rowWidth * 0.36);
  expect(layout.firstCardHeight).toBeGreaterThanOrEqual(190);
  expect(layout.firstCardHeight).toBeLessThanOrEqual(202);
}

export async function expectSeparateSearchRow(page: Page) {
  const heroBox = await page.getByTestId("landing-hero").boundingBox();
  const searchBox = await page.getByTestId("landing-search-strip").boundingBox();

  expect(heroBox).not.toBeNull();
  expect(searchBox).not.toBeNull();

  if (!heroBox || !searchBox) {
    return;
  }

  expect(searchBox.y).toBeGreaterThan(heroBox.y + heroBox.height - 4);
  expect(Math.abs(searchBox.x - heroBox.x)).toBeLessThanOrEqual(6);
  expect(searchBox.width).toBeGreaterThanOrEqual(heroBox.width - 6);
}

export async function expectLandingHeroAndSearchLayout(page: Page) {
  const heroBox = await page.getByTestId("landing-hero").boundingBox();
  const searchBox = await page.getByTestId("landing-search-strip").boundingBox();
  const chartBox = await page.locator(".marketplace-home-hero .marketplace-top-stats-trend-chart").boundingBox();
  const mainRowBox = await page.locator(".marketplace-home-search-shell .marketplace-search-main-row").boundingBox();

  expect(heroBox).not.toBeNull();
  expect(searchBox).not.toBeNull();
  expect(chartBox).not.toBeNull();
  expect(mainRowBox).not.toBeNull();

  if (!heroBox || !searchBox || !chartBox || !mainRowBox) {
    return;
  }

  expect(chartBox.width).toBeGreaterThan(heroBox.width * 0.24);
  expect(chartBox.width).toBeLessThan(heroBox.width * 0.44);
  expect(chartBox.x).toBeGreaterThan(heroBox.x + heroBox.width * 0.52);
  expect(searchBox.height).toBeLessThan(210);
  expect(mainRowBox.height).toBeGreaterThanOrEqual(56);
}

export async function expectSkillDetailHeaderWithinViewport(page: Page) {
  const headerBox = await page.getByTestId("skill-detail-header").boundingBox();
  const viewport = page.viewportSize();

  expect(headerBox).not.toBeNull();
  expect(viewport).not.toBeNull();

  if (!headerBox || !viewport) {
    return;
  }

  expect(headerBox.y).toBeLessThan(viewport.height - 96);
}

export async function expectCategoryReferenceFrame(page: Page) {
  const rail = page.getByTestId("categories-rail");
  const stream = page.getByTestId("categories-stream");

  await expect(rail).toBeVisible();
  await expect(stream).toBeVisible();

  const layout = await page.evaluate(() => {
    const hub = document.querySelector(".marketplace-category-reference-layout");
    const railNode = document.querySelector("[data-testid='categories-rail']");
    const streamNode = document.querySelector("[data-testid='categories-stream']");

    if (!hub || !railNode || !streamNode) {
      return null;
    }

    const hubStyle = window.getComputedStyle(hub);
    const railRect = railNode.getBoundingClientRect();
    const streamRect = streamNode.getBoundingClientRect();

    return {
      hubColumns: hubStyle.gridTemplateColumns.split(" ").filter(Boolean).length,
      railWidth: Math.round(railRect.width),
      streamWidth: Math.round(streamRect.width),
      streamOffset: Math.round(streamRect.x - railRect.x)
    };
  });

  expect(layout).not.toBeNull();

  if (!layout) {
    return;
  }

  expect(layout.hubColumns).toBe(2);
  expect(layout.streamWidth).toBeGreaterThan(layout.railWidth);
  expect(layout.streamOffset).toBeGreaterThan(layout.railWidth - 20);
}

export async function expectCategoryReferenceLayout(page: Page) {
  const firstSection = page.locator("[data-testid^='category-skill-section-']").first();

  await expectCategoryReferenceFrame(page);
  await expect(firstSection).toBeVisible();

  const firstSectionBox = await firstSection.boundingBox();
  const railBox = await page.getByTestId("categories-rail").boundingBox();

  expect(firstSectionBox).not.toBeNull();
  expect(railBox).not.toBeNull();

  if (firstSectionBox && railBox) {
    expect(firstSectionBox.width).toBeGreaterThan(railBox.width);
  }
}

interface ResultsStageTestIds {
  layoutTestId: string;
  mainTestId: string;
  sideTestId: string;
}

export async function expectResultsStageLayout(page: Page, testIds: ResultsStageTestIds) {
  const layout = page.getByTestId(testIds.layoutTestId);
  const main = page.getByTestId(testIds.mainTestId);
  const support = page.getByTestId(testIds.sideTestId);

  await expect(layout).toBeVisible();
  await expect(main).toBeVisible();
  await expect(support).toBeVisible();

  const resolvedMetrics = await page.evaluate(({ layoutTestId, mainTestId, sideTestId }) => {
    const layoutNode = document.querySelector(`[data-testid='${layoutTestId}']`);
    const mainNode = document.querySelector(`[data-testid='${mainTestId}']`);
    const supportNode = document.querySelector(`[data-testid='${sideTestId}']`);

    if (!layoutNode || !mainNode || !supportNode) {
      return null;
    }

    const layoutStyle = window.getComputedStyle(layoutNode);
    const mainRect = mainNode.getBoundingClientRect();
    const supportRect = supportNode.getBoundingClientRect();

    return {
      columns: layoutStyle.gridTemplateColumns.split(" ").filter(Boolean).length,
      mainWidth: Math.round(mainRect.width),
      supportWidth: Math.round(supportRect.width),
      supportOffset: Math.round(supportRect.x - mainRect.x)
    };
  }, testIds);

  expect(resolvedMetrics).not.toBeNull();

  if (!resolvedMetrics) {
    return;
  }

  expect(resolvedMetrics.columns).toBe(2);
  expect(resolvedMetrics.mainWidth).toBeGreaterThan(resolvedMetrics.supportWidth);
  expect(resolvedMetrics.supportOffset).toBeGreaterThan(resolvedMetrics.mainWidth - 24);
}
