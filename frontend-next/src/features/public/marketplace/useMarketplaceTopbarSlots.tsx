"use client";

import { useMemo } from "react";

import { buildMarketplaceTopbarSlots, type MarketplaceTopbarSlotsInput } from "./marketplaceTopbarSlots";

export function useMarketplaceTopbarSlots({
  belowContent,
  stageLabel,
  variant = "landing"
}: MarketplaceTopbarSlotsInput = {}) {
  return useMemo(() => buildMarketplaceTopbarSlots({ belowContent, stageLabel, variant }), [belowContent, stageLabel, variant]);
}
