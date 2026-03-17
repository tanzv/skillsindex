"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

import type { PublicSkillResourcesResponse } from "@/src/lib/schemas/public";

interface SkillDetailResourceTreeProps {
  resources: PublicSkillResourcesResponse | null;
  selectedFileName: string;
  onOpenFile: (fileName: string) => void;
  title: string;
}

interface ResourceTreeFileNode {
  type: "file";
  id: string;
  name: string;
  path: string;
  fileName: string;
  sizeLabel: string;
}

interface ResourceTreeDirectoryNode {
  type: "directory";
  id: string;
  name: string;
  path: string;
  children: Map<string, ResourceTreeNode>;
}

type ResourceTreeNode = ResourceTreeFileNode | ResourceTreeDirectoryNode;

interface ResourceTreeRow {
  id: string;
  depth: number;
  isExpanded: boolean;
  name: string;
  path: string;
  type: "file" | "directory";
  fileName?: string;
  sizeLabel?: string;
}

function getFileSegments(fileName: string): string[] {
  return String(fileName || "")
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function buildResourceTree(resources: PublicSkillResourcesResponse | null): ResourceTreeNode[] {
  const rootChildren = new Map<string, ResourceTreeNode>();

  for (const file of resources?.files || []) {
    const segments = getFileSegments(file.name);
    if (segments.length === 0) {
      continue;
    }

    let currentChildren = rootChildren;
    let currentPath = "";

    segments.forEach((segment, index) => {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      const isLeaf = index === segments.length - 1;
      const existingNode = currentChildren.get(segment);

      if (isLeaf) {
        currentChildren.set(segment, {
          type: "file",
          id: `file:${file.name}`,
          name: segment,
          path: currentPath,
          fileName: file.name,
          sizeLabel: file.size_label
        });
        return;
      }

      if (existingNode?.type === "directory") {
        currentChildren = existingNode.children;
        return;
      }

      const directoryNode: ResourceTreeDirectoryNode = {
        type: "directory",
        id: `dir:${currentPath}`,
        name: segment,
        path: currentPath,
        children: new Map<string, ResourceTreeNode>()
      };
      currentChildren.set(segment, directoryNode);
      currentChildren = directoryNode.children;
    });
  }

  return sortNodes(rootChildren.values());
}

function collectDirectoryPaths(nodes: ResourceTreeNode[]): Set<string> {
  const paths = new Set<string>();

  function visit(node: ResourceTreeNode) {
    if (node.type !== "directory") {
      return;
    }

    paths.add(node.path);
    Array.from(node.children.values()).forEach(visit);
  }

  nodes.forEach(visit);
  return paths;
}

function sortNodes(nodes: Iterable<ResourceTreeNode>): ResourceTreeNode[] {
  return Array.from(nodes).sort((left, right) => {
    if (left.type !== right.type) {
      return left.type === "directory" ? -1 : 1;
    }
    return left.name.localeCompare(right.name);
  });
}

function flattenTree(nodes: ResourceTreeNode[], expanded: Set<string>): ResourceTreeRow[] {
  const rows: ResourceTreeRow[] = [];

  function visit(node: ResourceTreeNode, depth: number) {
    if (node.type === "directory") {
      const isExpanded = expanded.has(node.path);
      rows.push({
        id: node.id,
        depth,
        isExpanded,
        name: node.name,
        path: node.path,
        type: node.type
      });

      if (!isExpanded) {
        return;
      }

      sortNodes(node.children.values()).forEach((child) => visit(child, depth + 1));
      return;
    }

    rows.push({
      id: node.id,
      depth,
      isExpanded: false,
      name: node.name,
      path: node.path,
      type: node.type,
      fileName: node.fileName,
      sizeLabel: node.sizeLabel
    });
  }

  nodes.forEach((node) => visit(node, 1));
  return rows;
}

export function SkillDetailResourceTree({
  resources,
  selectedFileName,
  onOpenFile,
  title
}: SkillDetailResourceTreeProps) {
  const tree = useMemo(() => buildResourceTree(resources), [resources]);
  const [expandedDirectories, setExpandedDirectories] = useState<Set<string>>(() => collectDirectoryPaths(tree));
  const rows = useMemo(() => flattenTree(tree, expandedDirectories), [expandedDirectories, tree]);

  useEffect(() => {
    setExpandedDirectories(collectDirectoryPaths(tree));
  }, [tree]);

  function handleDirectoryToggle(path: string) {
    setExpandedDirectories((current) => {
      const next = new Set(current);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="skill-detail-directory-shell" data-testid="skill-detail-resource-tree">
      <div className="skill-detail-directory-head">
        <div className="skill-detail-directory-head-main">
          <p className="skill-detail-directory-title">{title}</p>
          <p className="skill-detail-directory-meta">{resources?.source_path || "/"}</p>
        </div>
        <p className="skill-detail-directory-current" title={selectedFileName || resources?.source_path || "/"}>
          {selectedFileName || resources?.source_path || "/"}
        </p>
      </div>

      <div className="skill-detail-directory-tree" role="tree" aria-label={title}>
        {rows.map((row) => {
          const isSelected = row.type === "file" && row.fileName === selectedFileName;

          return (
            <button
              key={row.id}
              type="button"
              role="treeitem"
              data-depth={row.depth}
              aria-level={row.depth}
              aria-expanded={row.type === "directory" ? row.isExpanded : undefined}
              aria-selected={isSelected}
              data-testid={`skill-detail-resource-tree-row-${row.path.replaceAll("/", "-")}`}
              className={`skill-detail-directory-row is-${row.type}${isSelected ? " is-selected" : ""}`}
              style={{ ["--skill-detail-tree-depth" as string]: row.depth } as CSSProperties}
              title={row.path}
              onClick={() => {
                if (row.type === "directory") {
                  handleDirectoryToggle(row.path);
                  return;
                }
                if (row.fileName) {
                  onOpenFile(row.fileName);
                }
              }}
            >
              <span className="skill-detail-directory-row-indent" aria-hidden="true" />
              <span className="skill-detail-directory-row-caret" aria-hidden="true">
                {row.type === "directory" ? (row.isExpanded ? "▾" : "▸") : "•"}
              </span>
              <span
                className={`skill-detail-directory-row-icon ${row.type === "directory" ? "is-directory" : "is-file"}`}
                aria-hidden="true"
              />
              <span className="skill-detail-directory-row-label" title={row.name}>
                {row.name}
              </span>
              {row.type === "file" && row.sizeLabel ? (
                <span className="skill-detail-directory-row-meta" aria-hidden="true">
                  {row.sizeLabel}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
