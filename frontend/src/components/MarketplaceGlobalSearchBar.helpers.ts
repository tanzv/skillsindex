export type MarketplaceSearchActionOrder = "submit-first" | "filter-first";

export function resolveSearchActionOrder(order: MarketplaceSearchActionOrder, hasFilterAction: boolean): Array<"submit" | "filter"> {
  if (!hasFilterAction) {
    return ["submit"];
  }
  if (order === "filter-first") {
    return ["filter", "submit"];
  }
  return ["submit", "filter"];
}
