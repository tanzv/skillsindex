"use client";

import { useMemo } from "react";

import type { PublicSkillResourcesResponse } from "@/src/lib/schemas/public";

interface SkillDetailResourceTreeProps {
  resources: PublicSkillResourcesResponse | null;
  selectedFileName: string;
  onOpenFile: (fileName: string) => void;
  title: string;
}

export function SkillDetailResourceTree({
  resources,
  selectedFileName,
  onOpenFile,
  title
}: SkillDetailResourceTreeProps) {
  const files = useMemo(
    () =>
      [...(resources?.files || [])].sort((left, right) =>
        left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
      ),
    [resources?.files]
  );

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="skill-detail-resource-table-shell" data-testid="skill-detail-resource-tree">
      <div className="skill-detail-resource-table-head" role="presentation">
        <span className="skill-detail-resource-table-heading">{title}</span>
        <span className="skill-detail-resource-table-heading is-size">Size</span>
      </div>

      <div className="skill-detail-resource-table" role="table" aria-label={title}>
        {files.map((file) => {
          const isSelected = file.name === selectedFileName;
          const pathSegments = file.name.split("/").filter(Boolean);
          const primaryLabel = file.display_name || pathSegments[pathSegments.length - 1] || file.name;
          const pathHint = file.name !== primaryLabel ? file.name : "";
          return (
            <button
              key={file.name}
              type="button"
              role="row"
              aria-selected={isSelected}
              data-testid={`skill-detail-resource-tree-row-${file.name.replaceAll("/", "-")}`}
              className={`skill-detail-resource-table-row${isSelected ? " is-selected" : ""}`}
              title={file.name}
              onClick={() => onOpenFile(file.name)}
            >
              <span className="skill-detail-resource-table-cell is-name">
                <span className="skill-detail-resource-table-file-icon" aria-hidden="true" />
                <span className="skill-detail-resource-table-file-copy">
                  <span className="skill-detail-resource-table-file-name">{primaryLabel}</span>
                  {pathHint ? <span className="skill-detail-resource-table-file-path">{pathHint}</span> : null}
                </span>
              </span>
              <span className="skill-detail-resource-table-cell is-size">{file.size_label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
