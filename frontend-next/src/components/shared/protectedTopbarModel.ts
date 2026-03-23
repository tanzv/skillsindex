import type {
  ProtectedTopbarConfig,
  ProtectedTopbarEntryKind
} from "@/src/lib/navigation/protectedTopbarContracts";

export interface ProtectedTopbarEntry {
  id: string;
  href: string;
  label: string;
  description: string;
  kind: ProtectedTopbarEntryKind;
  overflowGroupId: string;
  active: boolean;
  matchPrefixes?: string[];
}

export interface ProtectedTopbarPrimaryGroup {
  id: string;
  label: string;
  tagLabel: string;
  kind: ProtectedTopbarEntryKind;
  entries: ProtectedTopbarEntry[];
}

export interface ProtectedTopbarOverflowGroup {
  id: string;
  title: string;
  countLabel: string;
  active: boolean;
  entries: ProtectedTopbarEntry[];
}

export interface ProtectedTopbarOverflowMetric {
  id: string;
  label: string;
  value: string;
}

export interface ProtectedTopbarModel {
  entries: ProtectedTopbarEntry[];
  visibleEntries: ProtectedTopbarEntry[];
  hiddenEntries: ProtectedTopbarEntry[];
  primaryGroups: ProtectedTopbarPrimaryGroup[];
  overflow: {
    title: string;
    hint: string;
    metrics: ProtectedTopbarOverflowMetric[];
    groups: ProtectedTopbarOverflowGroup[];
  };
}

const PRIMARY_ACTION_COLLAPSED_VISIBLE_COUNT = 5;
const PRIMARY_ACTION_MIN_VISIBLE_COUNT = 2;
const PRIMARY_ACTION_RESPONSIVE_MIN_SHELL_WIDTH = 520;
const PRIMARY_ACTION_RESPONSIVE_MAX_SHELL_WIDTH = 820;
const PRIMARY_ACTION_RESPONSIVE_VIEWPORT_OFFSET = 520;
const PRIMARY_ACTION_RESPONSIVE_TOGGLE_RESERVE_WIDTH = 184;
const PRIMARY_ACTION_RESPONSIVE_SLOT_WIDTH = 128;

function matchesPathname(pathname: string, href: string, exactMatch?: boolean, matchPrefixes?: string[]) {
  if (exactMatch) {
    return pathname === href;
  }

  const prefixes = matchPrefixes && matchPrefixes.length > 0 ? matchPrefixes : [href];
  return prefixes.some((prefix) => (prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(`${prefix}/`)));
}

function clampVisibleCount(value: number) {
  return Math.max(PRIMARY_ACTION_MIN_VISIBLE_COUNT, Math.min(PRIMARY_ACTION_COLLAPSED_VISIBLE_COUNT, value));
}

function selectEntryIndexesByPredicate(
  entries: ProtectedTopbarEntry[],
  selectedEntryIndexes: Set<number>,
  maxVisibleCount: number,
  predicate: (entry: ProtectedTopbarEntry) => boolean
) {
  for (let index = 0; index < entries.length; index += 1) {
    if (selectedEntryIndexes.size >= maxVisibleCount) {
      return;
    }

    if (selectedEntryIndexes.has(index) || !predicate(entries[index])) {
      continue;
    }

    selectedEntryIndexes.add(index);
  }
}

function ensureActiveEntryStaysVisible(
  entries: ProtectedTopbarEntry[],
  selectedEntryIndexes: Set<number>,
  maxVisibleCount: number
) {
  const activeEntryIndex = entries.findIndex((entry) => entry.active);
  if (activeEntryIndex < 0 || selectedEntryIndexes.has(activeEntryIndex)) {
    return;
  }

  if (selectedEntryIndexes.size >= maxVisibleCount) {
    const removableEntryIndex = Array.from(selectedEntryIndexes)
      .sort((left, right) => left - right)
      .reverse()
      .find((index) => !entries[index].active);

    if (typeof removableEntryIndex === "number") {
      selectedEntryIndexes.delete(removableEntryIndex);
    }
  }

  selectedEntryIndexes.add(activeEntryIndex);
}

function buildPrimaryGroups(
  entries: ProtectedTopbarEntry[],
  config: ProtectedTopbarConfig
): ProtectedTopbarPrimaryGroup[] {
  return config.primaryGroups
    .map((group) => {
      const groupEntries = entries.filter((entry) => entry.kind === group.kind);
      if (groupEntries.length === 0) {
        return null;
      }

      return {
        ...group,
        entries: groupEntries
      };
    })
    .filter((group): group is ProtectedTopbarPrimaryGroup => Boolean(group));
}

function buildOverflowGroups(
  entries: ProtectedTopbarEntry[],
  config: ProtectedTopbarConfig
): ProtectedTopbarOverflowGroup[] {
  const groups = new Map<string, ProtectedTopbarOverflowGroup>();

  for (const entry of entries) {
    const existingGroup = groups.get(entry.overflowGroupId);
    if (existingGroup) {
      existingGroup.entries.push(entry);
      existingGroup.countLabel = String(existingGroup.entries.length);
      existingGroup.active = existingGroup.active || entry.active;
      continue;
    }

    groups.set(entry.overflowGroupId, {
      id: entry.overflowGroupId,
      title: config.overflowGroupTitles[entry.overflowGroupId] || entry.overflowGroupId,
      countLabel: "1",
      active: entry.active,
      entries: [entry]
    });
  }

  return Array.from(groups.values()).sort((left, right) => {
    if (left.active !== right.active) {
      return left.active ? -1 : 1;
    }

    return config.overflowGroupOrder.indexOf(left.id) - config.overflowGroupOrder.indexOf(right.id);
  });
}

export function resolveProtectedPrimaryShellWidth(viewportWidth: number | null | undefined): number | null {
  if (!Number.isFinite(viewportWidth)) {
    return null;
  }

  return Math.min(
    PRIMARY_ACTION_RESPONSIVE_MAX_SHELL_WIDTH,
    Math.max(PRIMARY_ACTION_RESPONSIVE_MIN_SHELL_WIDTH, Number(viewportWidth) - PRIMARY_ACTION_RESPONSIVE_VIEWPORT_OFFSET)
  );
}

export function resolveProtectedResponsivePrimaryVisibleCount(shellWidth: number | null | undefined): number {
  if (!Number.isFinite(shellWidth)) {
    return PRIMARY_ACTION_COLLAPSED_VISIBLE_COUNT;
  }

  const availableActionWidth = Math.max(0, Number(shellWidth) - PRIMARY_ACTION_RESPONSIVE_TOGGLE_RESERVE_WIDTH);
  const estimatedVisibleCount = Math.floor(availableActionWidth / PRIMARY_ACTION_RESPONSIVE_SLOT_WIDTH);
  return clampVisibleCount(estimatedVisibleCount);
}

export function buildProtectedTopbarEntries(pathname: string, config: ProtectedTopbarConfig): ProtectedTopbarEntry[] {
  return config.entries.map((seed) => ({
    id: seed.id,
    href: seed.href,
    label: seed.label,
    description: seed.description,
    kind: seed.kind,
    overflowGroupId: seed.overflowGroupId,
    matchPrefixes: seed.matchPrefixes,
    active: matchesPathname(pathname, seed.href, seed.exactMatch, seed.matchPrefixes)
  }));
}

export function buildProtectedTopbarModel(
  pathname: string,
  config: ProtectedTopbarConfig,
  maxVisibleCount: number = PRIMARY_ACTION_COLLAPSED_VISIBLE_COUNT
): ProtectedTopbarModel {
  const entries = buildProtectedTopbarEntries(pathname, config);
  const visibleCount = clampVisibleCount(maxVisibleCount);
  const selectedEntryIndexes = new Set<number>();

  selectEntryIndexesByPredicate(entries, selectedEntryIndexes, visibleCount, (entry) => entry.kind === "primary");
  selectEntryIndexesByPredicate(entries, selectedEntryIndexes, visibleCount, (entry) => entry.kind === "access");
  selectEntryIndexesByPredicate(entries, selectedEntryIndexes, visibleCount, () => true);

  if (selectedEntryIndexes.size === 0) {
    for (let index = 0; index < entries.length && selectedEntryIndexes.size < visibleCount; index += 1) {
      selectedEntryIndexes.add(index);
    }
  }

  ensureActiveEntryStaysVisible(entries, selectedEntryIndexes, visibleCount);

  const visibleEntries: ProtectedTopbarEntry[] = [];
  const hiddenEntries: ProtectedTopbarEntry[] = [];

  for (let index = 0; index < entries.length; index += 1) {
    if (selectedEntryIndexes.has(index)) {
      visibleEntries.push(entries[index]);
      continue;
    }

    hiddenEntries.push(entries[index]);
  }

  return {
    entries,
    visibleEntries,
    hiddenEntries,
    primaryGroups: buildPrimaryGroups(visibleEntries, config),
    overflow: {
      title: config.overflowTitle,
      hint: config.overflowHint,
      metrics: [
        { id: "visible", label: config.overflowMetricLabels.visible, value: String(visibleEntries.length) },
        { id: "hidden", label: config.overflowMetricLabels.hidden, value: String(hiddenEntries.length) }
      ],
      groups: buildOverflowGroups(hiddenEntries, config)
    }
  };
}
