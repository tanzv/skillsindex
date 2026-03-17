import { useEffect, useState } from "react";

import {
  type MarketplaceSkill,
  fetchPublicSkillResourceContent
} from "../../lib/api";
import type { SkillDetailDataMode } from "./PublicSkillDetailPage.helpers";

interface UsePublicSkillDetailLiveFilePreviewOptions {
  activeSkill: MarketplaceSkill | null;
  dataMode: SkillDetailDataMode;
  selectedFileName: string;
}

export function usePublicSkillDetailLiveFilePreview({
  activeSkill,
  dataMode,
  selectedFileName
}: UsePublicSkillDetailLiveFilePreviewOptions) {
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [selectedFileLanguage, setSelectedFileLanguage] = useState("");

  useEffect(() => {
    let active = true;
    const normalizedFileName = String(selectedFileName || "").trim();

    if (dataMode !== "live" || !activeSkill || !normalizedFileName) {
      setSelectedFileContent("");
      setSelectedFileLanguage("");
      return () => {
        active = false;
      };
    }

    setSelectedFileContent("");
    setSelectedFileLanguage("");

    fetchPublicSkillResourceContent(activeSkill.id, normalizedFileName)
      .then((payload) => {
        if (!active) {
          return;
        }
        setSelectedFileContent(String(payload.content || ""));
        setSelectedFileLanguage(String(payload.language || ""));
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setSelectedFileContent("");
        setSelectedFileLanguage("");
      });

    return () => {
      active = false;
    };
  }, [activeSkill, dataMode, selectedFileName]);

  return {
    selectedFileContent,
    selectedFileLanguage
  };
}
