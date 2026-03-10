import { CSSProperties, useEffect, useMemo, useState } from "react";
import { DetailFileEntry } from "./PublicSkillDetailPage.helpers";
import {
  buildSkillFileDirectoryTree,
  flattenSkillFileDirectoryTree,
  resolveDefaultExpandedDirectoryPaths
} from "./fileDirectoryTree";

interface PublicSkillDetailDirectoryTreeProps {
  fileEntries: DetailFileEntry[];
  rootLabel: string;
  selectedFilePath: string;
  title: string;
  hideHeader?: boolean;
  onSelectFile: (nextFileIndex: number) => void;
}

export default function PublicSkillDetailDirectoryTree({
  fileEntries,
  rootLabel,
  selectedFilePath,
  title,
  hideHeader = false,
  onSelectFile
}: PublicSkillDetailDirectoryTreeProps) {
  const fileTreeNodes = useMemo(() => buildSkillFileDirectoryTree(fileEntries), [fileEntries]);
  const [expandedDirectories, setExpandedDirectories] = useState<Set<string>>(() =>
    resolveDefaultExpandedDirectoryPaths(fileTreeNodes, selectedFilePath)
  );
  const fileTreeRows = useMemo(
    () => flattenSkillFileDirectoryTree(fileTreeNodes, expandedDirectories),
    [expandedDirectories, fileTreeNodes]
  );

  useEffect(() => {
    setExpandedDirectories((previousState) => {
      const nextState = new Set(previousState);
      const defaultExpandedDirectories = resolveDefaultExpandedDirectoryPaths(fileTreeNodes, selectedFilePath);
      defaultExpandedDirectories.forEach((directoryPath) => {
        nextState.add(directoryPath);
      });
      return nextState;
    });
  }, [fileTreeNodes, selectedFilePath]);

  function handleDirectoryToggle(directoryPath: string): void {
    setExpandedDirectories((previousState) => {
      const nextState = new Set(previousState);
      if (nextState.has(directoryPath)) {
        nextState.delete(directoryPath);
      } else {
        nextState.add(directoryPath);
      }
      return nextState;
    });
  }

  return (
    <div className="skill-detail-directory-shell">
      {hideHeader ? null : (
        <div className="skill-detail-directory-head">
          <div className="skill-detail-directory-head-main">
            <p className="skill-detail-directory-title">{title}</p>
            <p className="skill-detail-directory-meta">{rootLabel}</p>
          </div>
          <p className="skill-detail-directory-current" title={selectedFilePath || rootLabel}>
            {selectedFilePath || rootLabel}
          </p>
        </div>
      )}
      <div className="skill-detail-directory-tree" role="tree" aria-label={title}>
        {fileTreeRows.map((row) => {
          const isDirectory = row.type === "directory";
          const isSelected = row.type === "file" && row.path === selectedFilePath;
          const rowStyle = {
            "--skill-detail-tree-depth": row.depth
          } as CSSProperties;

          return (
            <button
              key={row.id}
              type="button"
              role="treeitem"
              data-testid={`skill-detail-directory-row-${row.path}`}
              data-depth={row.depth}
              aria-level={row.depth}
              aria-expanded={isDirectory ? row.isExpanded : undefined}
              aria-selected={isSelected}
              className={`skill-detail-directory-row is-${row.type}${isSelected ? " is-selected" : ""}`}
              style={rowStyle}
              title={row.path}
              onClick={() => {
                if (isDirectory) {
                  handleDirectoryToggle(row.path);
                  return;
                }
                if (typeof row.fileIndex === "number") {
                  onSelectFile(row.fileIndex);
                }
              }}
            >
              <span className="skill-detail-directory-row-indent" aria-hidden="true" />
              <span className="skill-detail-directory-row-caret" aria-hidden="true">
                {isDirectory ? (row.isExpanded ? "▾" : "▸") : "•"}
              </span>
              <span className={`skill-detail-directory-row-icon ${isDirectory ? "is-directory" : "is-file"}`} aria-hidden="true" />
              <span className="skill-detail-directory-row-label" title={row.name}>{row.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
