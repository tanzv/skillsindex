import { DetailFileEntry } from "./PublicSkillDetailPage.helpers";

export type SkillFileTreeNodeType = "directory" | "file";

export interface SkillFileTreeNode {
  id: string;
  path: string;
  name: string;
  type: SkillFileTreeNodeType;
  fileIndex: number | null;
  children: SkillFileTreeNode[];
}

export interface SkillFileTreeRow {
  id: string;
  path: string;
  name: string;
  type: SkillFileTreeNodeType;
  fileIndex: number | null;
  depth: number;
  isExpanded: boolean;
}

interface MutableSkillFileTreeNode {
  id: string;
  path: string;
  name: string;
  type: SkillFileTreeNodeType;
  fileIndex: number | null;
  childrenByName: Map<string, MutableSkillFileTreeNode>;
}

function normalizeFilePath(rawPath: string): string {
  return String(rawPath || "")
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+/g, "/");
}

function createDirectoryNode(name: string, path: string): MutableSkillFileTreeNode {
  return {
    id: `dir:${path}`,
    path,
    name,
    type: "directory",
    fileIndex: null,
    childrenByName: new Map()
  };
}

function createFileNode(name: string, path: string, fileIndex: number): MutableSkillFileTreeNode {
  return {
    id: `file:${path}`,
    path,
    name,
    type: "file",
    fileIndex,
    childrenByName: new Map()
  };
}

function compareTreeNodes(left: MutableSkillFileTreeNode, right: MutableSkillFileTreeNode): number {
  if (left.type !== right.type) {
    return left.type === "directory" ? -1 : 1;
  }
  return left.name.localeCompare(right.name);
}

function toReadonlyTreeNode(node: MutableSkillFileTreeNode): SkillFileTreeNode {
  const orderedChildren = Array.from(node.childrenByName.values())
    .sort(compareTreeNodes)
    .map((child) => toReadonlyTreeNode(child));
  return {
    id: node.id,
    path: node.path,
    name: node.name,
    type: node.type,
    fileIndex: node.fileIndex,
    children: orderedChildren
  };
}

function resolveAncestorDirectoryPaths(filePath: string): string[] {
  const normalizedPath = normalizeFilePath(filePath);
  if (!normalizedPath) {
    return [];
  }
  const segments = normalizedPath.split("/");
  if (segments.length <= 1) {
    return [];
  }

  const directories: string[] = [];
  for (let index = 0; index < segments.length - 1; index += 1) {
    const currentPath = segments.slice(0, index + 1).join("/");
    directories.push(currentPath);
  }
  return directories;
}

export function buildSkillFileDirectoryTree(fileEntries: DetailFileEntry[]): SkillFileTreeNode[] {
  const root = createDirectoryNode("", "");

  fileEntries.forEach((entry, fileIndex) => {
    const normalizedPath = normalizeFilePath(entry.name);
    if (!normalizedPath) {
      return;
    }

    const segments = normalizedPath.split("/");
    let currentNode = root;

    segments.forEach((segment, segmentIndex) => {
      const isFileNode = segmentIndex === segments.length - 1;
      const segmentPath = currentNode.path ? `${currentNode.path}/${segment}` : segment;
      const existingNode = currentNode.childrenByName.get(segment);

      if (existingNode) {
        if (isFileNode && existingNode.type === "file" && existingNode.fileIndex === null) {
          existingNode.fileIndex = fileIndex;
        }
        currentNode = existingNode;
        return;
      }

      const nextNode = isFileNode ? createFileNode(segment, segmentPath, fileIndex) : createDirectoryNode(segment, segmentPath);
      currentNode.childrenByName.set(segment, nextNode);
      currentNode = nextNode;
    });
  });

  return Array.from(root.childrenByName.values())
    .sort(compareTreeNodes)
    .map((node) => toReadonlyTreeNode(node));
}

export function flattenSkillFileDirectoryTree(
  treeNodes: SkillFileTreeNode[],
  expandedDirectories: ReadonlySet<string>,
  depth = 1
): SkillFileTreeRow[] {
  const rows: SkillFileTreeRow[] = [];

  treeNodes.forEach((node) => {
    const isExpanded = node.type === "directory" ? expandedDirectories.has(node.path) : false;
    rows.push({
      id: node.id,
      path: node.path,
      name: node.name,
      type: node.type,
      fileIndex: node.fileIndex,
      depth,
      isExpanded
    });

    if (node.type === "directory" && isExpanded) {
      rows.push(...flattenSkillFileDirectoryTree(node.children, expandedDirectories, depth + 1));
    }
  });

  return rows;
}

export function resolveDefaultExpandedDirectoryPaths(
  treeNodes: SkillFileTreeNode[],
  selectedFilePath: string
): Set<string> {
  const expandedDirectories = new Set<string>();
  treeNodes.forEach((node) => {
    if (node.type === "directory") {
      expandedDirectories.add(node.path);
    }
  });

  const ancestorPaths = resolveAncestorDirectoryPaths(selectedFilePath);
  ancestorPaths.forEach((path) => {
    expandedDirectories.add(path);
  });

  return expandedDirectories;
}
