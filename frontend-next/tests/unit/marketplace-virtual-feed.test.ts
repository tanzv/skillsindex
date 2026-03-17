import { describe, expect, it } from "vitest";

import { computeMarketplaceVirtualWindow, groupMarketplaceRows } from "@/src/features/public/marketplace/marketplaceVirtualFeed";

describe("marketplace virtual feed helpers", () => {
  it("groups items into fixed rows", () => {
    expect(groupMarketplaceRows([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
  });

  it("computes the virtual window with overscan padding", () => {
    expect(
      computeMarketplaceVirtualWindow({
        totalRows: 12,
        rowHeight: 186,
        rowGap: 16,
        overscanRows: 2,
        viewportTop: 420,
        viewportBottom: 980
      })
    ).toEqual({
      startIndex: 0,
      endIndex: 7,
      paddingTop: 0,
      paddingBottom: 994
    });
  });
});
