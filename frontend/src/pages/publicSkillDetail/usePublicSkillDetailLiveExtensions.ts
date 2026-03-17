import { useEffect, useState } from "react";

import {
  type MarketplaceSkill,
  type PublicSkillResourcesResponse,
  type PublicSkillVersionItem,
  fetchPublicSkillResources,
  fetchPublicSkillVersions
} from "../../lib/api";
import type { SkillDetailAsyncLoadStatus } from "./PublicSkillDetailPage.fileBrowser.contract";
import type { SkillDetailDataMode } from "./PublicSkillDetailPage.helpers";

interface UsePublicSkillDetailLiveExtensionsOptions {
  activeSkill: MarketplaceSkill | null;
  dataMode: SkillDetailDataMode;
}

export function usePublicSkillDetailLiveExtensions({
  activeSkill,
  dataMode
}: UsePublicSkillDetailLiveExtensionsOptions) {
  const [skillResources, setSkillResources] = useState<PublicSkillResourcesResponse | null>(null);
  const [skillResourcesLoadStatus, setSkillResourcesLoadStatus] = useState<SkillDetailAsyncLoadStatus>("idle");
  const [versionItems, setVersionItems] = useState<PublicSkillVersionItem[]>([]);
  const [versionItemsLoadStatus, setVersionItemsLoadStatus] = useState<SkillDetailAsyncLoadStatus>("idle");

  useEffect(() => {
    let active = true;

    if (dataMode !== "live" || !activeSkill) {
      setSkillResources(null);
      setSkillResourcesLoadStatus("idle");
      setVersionItems([]);
      setVersionItemsLoadStatus("idle");
      return () => {
        active = false;
      };
    }

    setSkillResources(null);
    setSkillResourcesLoadStatus("loading");
    setVersionItems([]);
    setVersionItemsLoadStatus("loading");

    fetchPublicSkillResources(activeSkill.id)
      .then((payload) => {
        if (!active) {
          return;
        }
        setSkillResources(payload);
        setSkillResourcesLoadStatus("ready");
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setSkillResources(null);
        setSkillResourcesLoadStatus("error");
      });

    fetchPublicSkillVersions(activeSkill.id)
      .then((payload) => {
        if (!active) {
          return;
        }
        setVersionItems(Array.isArray(payload.items) ? payload.items : []);
        setVersionItemsLoadStatus("ready");
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setVersionItems([]);
        setVersionItemsLoadStatus("error");
      });

    return () => {
      active = false;
    };
  }, [activeSkill, dataMode]);

  return {
    skillResources,
    skillResourcesLoadStatus,
    versionItems,
    versionItemsLoadStatus
  };
}
