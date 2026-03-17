import { useEffect, useState } from "react";

import {
  type MarketplaceQueryParams,
  type MarketplaceSkill,
  fetchPublicMarketplace
} from "../../lib/api";
import type { RelatedSkillsLoadStatus } from "./PublicSkillDetailPage.fileBrowser.contract";
import type { SkillDetailDataMode } from "./PublicSkillDetailPage.helpers";

async function loadRelatedSkillsCatalog(skill: MarketplaceSkill): Promise<MarketplaceSkill[]> {
  const primaryTag = (skill.tags || []).find((tag) => String(tag || "").trim());
  const queries: MarketplaceQueryParams[] = [];

  if (skill.category && skill.subcategory) {
    queries.push({
      category: skill.category,
      subcategory: skill.subcategory,
      sort: "recent",
      page: 1
    });
  }

  if (skill.category) {
    queries.push({
      category: skill.category,
      sort: "recent",
      page: 1
    });
  }

  if (primaryTag) {
    queries.push({
      tags: primaryTag,
      sort: "recent",
      page: 1
    });
  }

  if (queries.length === 0) {
    return [];
  }

  const relatedSkills = new Map<number, MarketplaceSkill>();

  for (const query of queries) {
    const payload = await fetchPublicMarketplace(query);
    payload.items.forEach((item) => {
      if (item.id === skill.id || relatedSkills.has(item.id)) {
        return;
      }
      relatedSkills.set(item.id, item);
    });
    if (relatedSkills.size >= 6) {
      break;
    }
  }

  return Array.from(relatedSkills.values()).slice(0, 6);
}

interface UsePublicSkillDetailRelatedSkillsOptions {
  activeSkill: MarketplaceSkill | null;
  dataMode: SkillDetailDataMode;
}

export function usePublicSkillDetailRelatedSkills({
  activeSkill,
  dataMode
}: UsePublicSkillDetailRelatedSkillsOptions) {
  const [relatedSkills, setRelatedSkills] = useState<MarketplaceSkill[]>([]);
  const [relatedSkillsLoadStatus, setRelatedSkillsLoadStatus] = useState<RelatedSkillsLoadStatus>("idle");

  useEffect(() => {
    let active = true;

    if (dataMode !== "live" || !activeSkill) {
      setRelatedSkills([]);
      setRelatedSkillsLoadStatus("idle");
      return () => {
        active = false;
      };
    }

    setRelatedSkillsLoadStatus("loading");

    loadRelatedSkillsCatalog(activeSkill)
      .then((items) => {
        if (!active) {
          return;
        }
        setRelatedSkills(items);
        setRelatedSkillsLoadStatus("ready");
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setRelatedSkills([]);
        setRelatedSkillsLoadStatus("error");
      });

    return () => {
      active = false;
    };
  }, [activeSkill, dataMode]);

  return {
    relatedSkills,
    relatedSkillsLoadStatus
  };
}
