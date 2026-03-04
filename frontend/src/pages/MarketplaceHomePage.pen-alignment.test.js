import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildPrototypeCardGroups } from "./MarketplaceHomePage.helpers";
import { marketplaceHomeCopy } from "./MarketplaceHomePage.copy";
import { marketplaceHomeResultsStyles } from "./MarketplaceHomePage.styles.results";
import { marketplaceHomeResultsPageStyles } from "./MarketplaceHomePage.styles.resultsPage";
import { marketplaceHomeSearchStyles } from "./MarketplaceHomePage.styles.search";
import { marketplaceHomeThemeStyles } from "./MarketplaceHomePage.styles.theme";

function findNodeByID(node, id) {
  if (node?.id === id) {
    return node;
  }
  for (const child of node?.children || []) {
    const matched = findNodeByID(child, id);
    if (matched) {
      return matched;
    }
  }
  return null;
}

function findNodeByIDInScope(scopeNode, id) {
  return findNodeByID(scopeNode, id);
}

function findNodeByName(node, expectedName) {
  if (node?.name === expectedName) {
    return node;
  }
  for (const child of node?.children || []) {
    const matched = findNodeByName(child, expectedName);
    if (matched) {
      return matched;
    }
  }
  return null;
}

function findNodeByAnyName(node, candidateNames) {
  for (const name of candidateNames) {
    const matched = findNodeByName(node, name);
    if (matched) {
      return matched;
    }
  }
  return null;
}

function getPenRoot() {
  const filePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../prototypes/skillsindex_framework/skillsindex_framework.pen");
  const payload = JSON.parse(readFileSync(filePath, "utf8"));
  return { id: "document", children: payload.children || [] };
}

function getPreviewNodeMap() {
  const filePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../prototypes/skillsindex_framework/preview-node-map.json");
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function hasTextContent(node, expectedText) {
  if (node?.type === "text" && String(node?.content || "") === expectedText) {
    return true;
  }
  for (const child of node?.children || []) {
    if (hasTextContent(child, expectedText)) {
      return true;
    }
  }
  return false;
}

function expectModalWidthToken(styles) {
  const hasFixedWidth = styles.includes("width: 980px");
  const hasResponsiveWidth = styles.includes("width: min(980px, calc(100% - 24px))");
  const hasFluidOverlayWidth =
    styles.includes(".marketplace-results-overlay .marketplace-results-modal {") &&
    styles.includes("width: 100%;") &&
    styles.includes("max-width: 100%;");
  expect(hasFixedWidth || hasResponsiveWidth || hasFluidOverlayWidth).toBe(true);
}

function expectContainsAny(styles, candidates) {
  expect(candidates.some((token) => styles.includes(token))).toBe(true);
}

describe("Marketplace homepage pen alignment", () => {
  it("keeps key geometry values synchronized with j0pbU", () => {
    const root = getPenRoot();
    const previewNodeMap = getPreviewNodeMap();
    const homeMapping = previewNodeMap?.mapping?.find((entry) => entry?.path === "marketplace_home");
    const homeNode = findNodeByID(root, "j0pbU");
    const topNode = findNodeByIDInScope(homeNode, "MKSGV");
    const topStatsNode = findNodeByIDInScope(homeNode, "ULLct") || findNodeByIDInScope(homeNode, "dyGYs");
    const searchNode = findNodeByIDInScope(homeNode, "HSLpj");
    const curatedRowNode = findNodeByIDInScope(homeNode, "gDBq1");
    const paginationNode =
      findNodeByIDInScope(homeNode, "rQX3m") ||
      findNodeByAnyName(homeNode, ["virtualListLoadIndicator", "loadIndicator", "paginationLoadIndicator"]);
    const homeFill = String(homeNode?.fill || "").toLowerCase();
    const topFill = String(topNode?.fill || "").toLowerCase();
    const topStatsFill = String(topStatsNode?.fill || "").toLowerCase();
    const topStatsStrokeFill = String(topStatsNode?.stroke?.fill || "").toLowerCase();
    const searchFill = String(searchNode?.fill || "").toLowerCase();

    expect(homeNode?.width).toBe(1440);
    expect(homeNode?.height).toBe(1776);
    expect(homeMapping?.node_id).toBe("j0pbU");
    expect(homeFill).toMatch(/^#(?:[0-9a-f]{3}){1,2}$/);
    expect(topNode?.height).toBe(84);
    expect(topFill).toMatch(/^#(?:[0-9a-f]{3}){1,2}$/);
    expect(topStatsNode?.height).toBe(244);
    expect(topStatsFill).toBe("#0b0e12");
    expect(topStatsNode?.cornerRadius).toBe(12);
    expect(topStatsStrokeFill).toBe("#3e3e3e");
    expect([350, 108]).toContain(searchNode?.height);
    expect(searchFill).toMatch(/^#(?:[0-9a-f]{3}){1,2}$/);
    expect(curatedRowNode?.height).toBe(166);
    if (paginationNode) {
      expect([40, 44, 56]).toContain(paginationNode?.height);
    } else {
      expect(marketplaceHomeResultsStyles.styles).toContain(".marketplace-pagination-shell");
    }

    expectContainsAny(marketplaceHomeThemeStyles.styles, ["width: 1440px", "width: 100%"]);
    expectContainsAny(marketplaceHomeThemeStyles.styles, ["max-width: 1440px", "max-width: none", "width: 1440px"]);
    expect(
      marketplaceHomeThemeStyles.styles.includes("height: 1776px") ||
        (marketplaceHomeThemeStyles.styles.includes("min-height: 100dvh") &&
          marketplaceHomeThemeStyles.styles.includes("height: auto"))
    ).toBe(true);
    expect(marketplaceHomeThemeStyles.styles).toContain("height: 84px");
    expectContainsAny(marketplaceHomeThemeStyles.styles, [
      "padding: 0;",
      "padding: 0 24px",
      "padding: 0 12px",
      "padding: 0 var(--marketplace-content-gutter)"
    ]);
    expect(
      marketplaceHomeThemeStyles.styles.includes(`background: ${topFill}`) ||
        marketplaceHomeThemeStyles.styles.includes(`--marketplace-topbar-background: ${topFill}`) ||
        marketplaceHomeThemeStyles.styles.includes("--marketplace-topbar-background:") ||
        marketplaceHomeThemeStyles.styles.includes("background: linear-gradient")
    ).toBe(true);
    expect(marketplaceHomeThemeStyles.styles).toContain(`background: ${homeFill}`);
    expect(marketplaceHomeThemeStyles.styles).toContain("border-radius: 9px");
    expectContainsAny(marketplaceHomeThemeStyles.styles, ["color: #b3b3b3", "--marketplace-brand-subtitle: #b3b3b3"]);
    expectContainsAny(marketplaceHomeThemeStyles.styles, ["color: #d4d4d4", "--marketplace-status-text: #d4d4d4"]);
    expect(marketplaceHomeThemeStyles.styles).not.toContain("background-image: url(\"/prototypes/previews/marketplace_home.png\")");
    expect(marketplaceHomeThemeStyles.styles).not.toContain(".marketplace-home.is-prototype-ghost");
    expectContainsAny(marketplaceHomeSearchStyles.styles, ["height: 244px", "height: 276px"]);
    expectContainsAny(marketplaceHomeSearchStyles.styles, [
      "border: 1px solid #3e3e3e",
      "border: 1px solid #334155",
      "border: 1px solid #2f3440",
      "border: 1px solid rgba(255, 255, 255, 0.08)",
      "border: 1px solid rgba(255, 255, 255, 0.06)"
    ]);
    expectContainsAny(marketplaceHomeSearchStyles.styles, [
      "#0b0e12",
      "#0b1220",
      "#0c0d12",
      "#0b0c10",
      "rgba(255, 255, 255, 0.03)",
      "background: transparent"
    ]);
    expectContainsAny(marketplaceHomeSearchStyles.styles, ["color: #aeb6c3", "color: #94a3b8", "color: #a9abb2", "color: #c2c6ce"]);
    expectContainsAny(marketplaceHomeSearchStyles.styles, [
      `background: ${searchFill}`,
      "background: #0b1220",
      "background: #0f172a",
      "#0d0e13",
      "background: linear-gradient"
    ]);
    expectContainsAny(marketplaceHomeSearchStyles.styles, [
      "height: 350px",
      "height: 338px",
      "height: 370px",
      "height: auto",
      "min-height: 398px"
    ]);
    expect(marketplaceHomeSearchStyles.styles).toContain(".marketplace-top-stats-trend-chart");
    expectContainsAny(marketplaceHomeResultsStyles.styles, ["height: 166px", "height: 184px", "height: 186px", "height: 196px", "height: 198px"]);
    expectContainsAny(marketplaceHomeResultsStyles.styles, ["height: 168px", "height: 184px", "height: 186px", "height: 196px", "height: 198px"]);
    expectContainsAny(marketplaceHomeResultsStyles.styles, ["min-height: 56px", "min-height: 40px"]);
    expectContainsAny(marketplaceHomeResultsStyles.styles, [
      "background: #1f1f1f",
      "background: #111827",
      "background: #161616",
      "rgba(20, 26, 38, 0.56)",
      "rgba(20, 26, 38, 0.4)",
      "rgba(16, 17, 19, 0.34)",
      "rgba(16, 17, 19, 0.28)"
    ]);
    expect(marketplaceHomeResultsStyles.styles).toContain(".marketplace-card-cover-chip");
    expect(marketplaceHomeResultsStyles.styles).toContain(".marketplace-pagination-load-indicator");
  });

  it("keeps featured and latest card copy synchronized", () => {
    const root = getPenRoot();
    const homeNode = findNodeByID(root, "j0pbU");
    const featuredTitleNode = findNodeByIDInScope(homeNode, "EHANz");
    const latestTitleNode = findNodeByIDInScope(homeNode, "HNWTf");
    const featuredMetaNode = findNodeByIDInScope(homeNode, "JaaDt");
    const latestMetaNode = findNodeByIDInScope(homeNode, "vRZhF");
    const cardGroups = buildPrototypeCardGroups([]);

    expect(featuredTitleNode?.content).toBe("Playwright Flow Guardian");
    expect(latestTitleNode?.content).toBe("Repository Diff Sentinel");
    expect(cardGroups.featured[0]?.title).toBe(featuredTitleNode?.content);
    expect(cardGroups.latest[0]?.title).toBe(latestTitleNode?.content);
    expect(cardGroups.featured[0]?.meta).toBe(featuredMetaNode?.content);
    expect(cardGroups.latest[0]?.meta).toBe(latestMetaNode?.content);
    expect(cardGroups.featured[0]?.chips).toEqual(["Automation", "E2E"]);
    expect(cardGroups.latest[0]?.chips).toEqual(["Repo", "Diff"]);
  });

  it("keeps home search and pagination copy synchronized with pen text nodes", () => {
    const root = getPenRoot();
    const homeNode = findNodeByID(root, "j0pbU");
    const queryTextNode = findNodeByIDInScope(homeNode, "SA8gi");
    const hotkeyNode = findNodeByIDInScope(homeNode, "vBU43");
    const quickFilterNode = findNodeByIDInScope(homeNode, "hptut");
    const queueNode = findNodeByIDInScope(homeNode, "kERTX");
    const openQueueNode = findNodeByIDInScope(homeNode, "lApmS");
    const loadMoreMainNode =
      findNodeByIDInScope(homeNode, "PRlFv") ||
      findNodeByIDInScope(homeNode, "pgt1L") ||
      null;
    const loadMoreSubNode =
      findNodeByIDInScope(homeNode, "VJFEw") ||
      findNodeByIDInScope(homeNode, "r3Ufn") ||
      null;
    const paginationIndicatorNode =
      findNodeByIDInScope(homeNode, "rQX3m") ||
      findNodeByAnyName(homeNode, ["virtualListLoadIndicator", "loadIndicator", "paginationLoadIndicator"]);

    expect(String(queryTextNode?.content || "")).toBe(marketplaceHomeCopy.zh.queryPlaceholder);
    expect([marketplaceHomeCopy.zh.hotkeyLabel, "Ctrl/Cmd+K", "Search"]).toContain(String(hotkeyNode?.content || ""));
    expect([marketplaceHomeCopy.zh.advanced, "筛选", "Filter", "Filters"]).toContain(String(quickFilterNode?.content || ""));
    expect(
      [marketplaceHomeCopy.zh.queueLabel, "队列", "Queue"].some((token) => String(queueNode?.content || "").includes(token))
    ).toBe(true);
    expect([marketplaceHomeCopy.zh.openQueue, "打开队列", "Open Queue", "Open Execution Queue"]).toContain(
      String(openQueueNode?.content || "")
    );
    if (loadMoreMainNode && loadMoreSubNode) {
      expect(String(loadMoreMainNode?.content || "")).toBe(marketplaceHomeCopy.zh.loadMore);
      expect(String(loadMoreSubNode?.content || "")).toBe(marketplaceHomeCopy.zh.loadMoreHint);
      return;
    }

    const loadingRingNode = findNodeByName(paginationIndicatorNode, "loadingRing");
    const loadingDotsNode = findNodeByName(paginationIndicatorNode, "loadingDots") || findNodeByName(paginationIndicatorNode, "loadingRow");
    const loadingDotNode = findNodeByName(paginationIndicatorNode, "dot1");
    const hasLoadingRingStyle = marketplaceHomeResultsStyles.styles.includes(".marketplace-pagination-loading-ring");
    const hasLoadingDotsStyle = marketplaceHomeResultsStyles.styles.includes(".marketplace-pagination-loading-dots");
    if (paginationIndicatorNode) {
      expect([40, 44, 56]).toContain(paginationIndicatorNode?.height);
      expect(loadingRingNode?.type === "frame" || hasLoadingRingStyle).toBe(true);
      expect(loadingDotsNode?.type === "frame" || hasLoadingDotsStyle).toBe(true);
      expect(loadingDotNode?.type === "frame" || hasLoadingDotsStyle).toBe(true);
      return;
    }

    expect(marketplaceHomeResultsStyles.styles).toContain(".marketplace-pagination-shell");
    expect(marketplaceHomeResultsStyles.styles).toContain(".marketplace-pagination-load-more");
  });

  it("keeps top-level zh copy synchronized with pen text contents", () => {
    const root = getPenRoot();
    const homeNode = findNodeByID(root, "j0pbU");
    const expectedTextGroups = [
      [marketplaceHomeCopy.zh.brandTitle],
      [marketplaceHomeCopy.zh.brandSubtitle],
      [marketplaceHomeCopy.zh.signedOut],
      [marketplaceHomeCopy.zh.statsMain],
      [marketplaceHomeCopy.zh.statsSub],
      [marketplaceHomeCopy.zh.signIn],
      [marketplaceHomeCopy.zh.curatedTitle],
      [marketplaceHomeCopy.zh.latestTitle],
      [marketplaceHomeCopy.zh.queryPlaceholder],
      [marketplaceHomeCopy.zh.advanced, "筛选", "Filter", "Filters"],
      [marketplaceHomeCopy.zh.hotkeyLabel, "Ctrl/Cmd+K", "Search"]
    ];

    for (const alternatives of expectedTextGroups) {
      expect(alternatives.some((candidate) => hasTextContent(homeNode, candidate))).toBe(true);
    }

    const hasLoadMoreText = hasTextContent(homeNode, marketplaceHomeCopy.zh.loadMore);
    const hasLoadMoreHintText = hasTextContent(homeNode, marketplaceHomeCopy.zh.loadMoreHint);
    if (hasLoadMoreText || hasLoadMoreHintText) {
      expect(hasLoadMoreText).toBe(true);
      expect(hasLoadMoreHintText).toBe(true);
      return;
    }

    const paginationIndicatorNode =
      findNodeByIDInScope(homeNode, "rQX3m") ||
      findNodeByAnyName(homeNode, ["virtualListLoadIndicator", "loadIndicator", "paginationLoadIndicator"]);
    const loadingDotsNode = findNodeByName(paginationIndicatorNode, "loadingDots") || findNodeByName(paginationIndicatorNode, "loadingRow");
    const hasLoadingRingStyle = marketplaceHomeResultsStyles.styles.includes(".marketplace-pagination-loading-ring");
    const hasLoadingDotsStyle = marketplaceHomeResultsStyles.styles.includes(".marketplace-pagination-loading-dots");
    if (paginationIndicatorNode) {
      expect([40, 44, 56]).toContain(paginationIndicatorNode?.height);
      expect(Boolean(findNodeByName(paginationIndicatorNode, "loadingRing")) || hasLoadingRingStyle).toBe(true);
      expect(Boolean(loadingDotsNode) || hasLoadingDotsStyle).toBe(true);
      return;
    }

    expect(marketplaceHomeResultsStyles.styles).toContain(".marketplace-pagination-shell");
    expect(marketplaceHomeResultsStyles.styles).toContain(".marketplace-pagination-load-more");
  });

  it("keeps floating search modal geometry synchronized with fThmU", () => {
    const root = getPenRoot();
    const floatingRootNode = findNodeByID(root, "fThmU");
    const overlayCanvasNode = findNodeByIDInScope(floatingRootNode, "mbFND");
    const modalNode = findNodeByIDInScope(floatingRootNode, "KNhj8");
    const closeNode = findNodeByIDInScope(floatingRootNode, "LAPx0");
    const modalTitleNode = findNodeByIDInScope(floatingRootNode, "L5LfS");
    const closeTextNode = findNodeByIDInScope(floatingRootNode, "WDD9X");

    expect(floatingRootNode?.width).toBe(1440);
    expect(floatingRootNode?.height).toBe(1960);
    expect(String(overlayCanvasNode?.fill || "").toLowerCase()).toBe("#d6d6d6");
    expect(overlayCanvasNode?.width).toBe(1392);
    expect(overlayCanvasNode?.height).toBe(1040);
    expect(overlayCanvasNode?.cornerRadius).toBe(14);
    expect(modalNode?.width).toBe(980);
    expect(modalNode?.cornerRadius).toBe(16);
    expect(String(modalNode?.stroke?.fill || "").toLowerCase()).toBe("#d6d6d6");
    expect(closeNode?.height).toBe(30);
    expect(String(closeNode?.fill || "").toLowerCase()).toBe("#f3f4f6");
    expect(String(modalTitleNode?.content || "")).toBe("搜索中心 · 浮窗模式");
    expect(String(closeTextNode?.content || "")).toBe("Esc 关闭");

    const hasLegacyOverlayWidth = marketplaceHomeResultsPageStyles.styles.includes("width: 1392px");
    const hasResponsiveOverlayWidth = marketplaceHomeResultsPageStyles.styles.includes("width: min(1120px, 100%)");
    expect(hasLegacyOverlayWidth || hasResponsiveOverlayWidth).toBe(true);
    expect(marketplaceHomeResultsPageStyles.styles).toContain("background: #d6d6d6");
    expectModalWidthToken(marketplaceHomeResultsPageStyles.styles);
    expect(marketplaceHomeResultsPageStyles.styles).toContain("border-radius: 16px");
    expect(marketplaceHomeResultsPageStyles.styles).toContain("border: 1px solid #d6d6d6");
    expectContainsAny(marketplaceHomeResultsPageStyles.styles, ["height: 30px", "height: 34px"]);
    expect(marketplaceHomeResultsPageStyles.styles).toContain("background: #f3f4f6");
  });
});
