import type { PublicLocale } from "@/src/lib/i18n/publicLocale";
import { adminSkillsRoute } from "@/src/lib/routing/protectedSurfaceLinks";

import type { AdminCatalogDisplayMessages } from "./display";
import {
  resolveCatalogCategoryLabel,
  resolveCatalogOwnerLabel,
  resolveCatalogSkillName,
  resolveCatalogSourceTypeLabel,
  resolveCatalogVisibilityLabel,
} from "./display";
import type {
  AdminCatalogDetailSection,
  AdminCatalogDetailTopology,
  AdminCatalogModelMessages,
  AdminCatalogRow,
  SkillsPayload,
} from "./model.types";

function formatDateTime(
  value: string,
  locale: PublicLocale,
  notAvailable: string,
): string {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return notAvailable;
  }

  return new Date(parsed).toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function hasSourceAnalysisData(item: SkillsPayload["items"][number]): boolean {
  return Boolean(
    item.sourceAnalysis.entryFile ||
    item.sourceAnalysis.mechanism ||
    item.sourceAnalysis.metadataSources.length ||
    item.sourceAnalysis.referencePaths.length ||
    item.sourceAnalysis.dependencies.length,
  );
}

function buildDetailValueList(
  values: string[],
  emptyValue: string,
  buildHref?: (value: string) => string | undefined,
): AdminCatalogDetailSection["items"] {
  if (!values.length) {
    return [{ value: emptyValue }];
  }

  return values.map((value) => ({ value, href: buildHref?.(value) }));
}

function buildAdminSkillSearchLink(value: string): string | undefined {
  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }

  return `${adminSkillsRoute}?q=${encodeURIComponent(normalized)}`;
}

function normalizeSkillLookupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractSkillLookupKeys(
  item: SkillsPayload["items"][number],
): string[] {
  const lookupKeys = new Set<string>();
  const pushValue = (value: string) => {
    const normalized = normalizeSkillLookupKey(value);
    if (normalized) {
      lookupKeys.add(normalized);
    }
  };

  pushValue(String(item.id));
  pushValue(item.name);

  item.sourceAnalysis.referencePaths.forEach((referencePath) => {
    pushValue(referencePath);
    const pathSegments = referencePath.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1] || "";
    pushValue(lastSegment);
  });

  return Array.from(lookupKeys);
}

function buildPublicSkillDetailLinkResolver(
  items: SkillsPayload["items"],
): (value: string) => string | undefined {
  const skillHrefByKey = new Map<string, string>();

  items.forEach((item) => {
    if (item.visibility.toLowerCase() !== "public") {
      return;
    }

    const href = `/skills/${item.id}`;
    extractSkillLookupKeys(item).forEach((lookupKey) => {
      if (!skillHrefByKey.has(lookupKey)) {
        skillHrefByKey.set(lookupKey, href);
      }
    });
  });

  return (value: string) => {
    const lookupKey = normalizeSkillLookupKey(value);
    if (!lookupKey) {
      return undefined;
    }

    return skillHrefByKey.get(lookupKey);
  };
}

function buildDependencyDetailItems(
  item: SkillsPayload["items"][number],
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages,
  resolvePublicSkillDetailLink: (value: string) => string | undefined,
): AdminCatalogDetailSection["items"] {
  if (!item.sourceAnalysis.dependencies.length) {
    return [{ value: messages.detailNoDependencies }];
  }

  return item.sourceAnalysis.dependencies.map((dependency) => ({
    label: dependency.kind || displayMessages.valueUnknown,
    value: dependency.target || messages.valueNotAvailable,
    href:
      dependency.kind === "skill"
        ? resolvePublicSkillDetailLink(dependency.target || "") ||
          buildAdminSkillSearchLink(dependency.target || "")
        : undefined,
  }));
}

function buildTopologyNodes(
  values: string[],
): { value: string; href?: string }[] {
  return values.map((value) => ({
    value,
    href: buildAdminSkillSearchLink(value),
  }));
}

function buildDependencyTopologyNodes(
  item: SkillsPayload["items"][number],
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages,
  resolvePublicSkillDetailLink: (value: string) => string | undefined,
): { label?: string; value: string; href?: string }[] {
  if (!item.sourceAnalysis.dependencies.length) {
    return [{ value: messages.detailNoDependencies }];
  }

  return item.sourceAnalysis.dependencies.map((dependency) => ({
    label: dependency.kind || displayMessages.valueUnknown,
    value: dependency.target || messages.valueNotAvailable,
    href:
      dependency.kind === "skill"
        ? resolvePublicSkillDetailLink(dependency.target || "") ||
          buildAdminSkillSearchLink(dependency.target || "")
        : undefined,
  }));
}

function buildSkillDetailTopology(
  item: SkillsPayload["items"][number],
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages,
  resolvePublicSkillDetailLink: (value: string) => string | undefined,
): AdminCatalogDetailTopology | undefined {
  if (!hasSourceAnalysisData(item)) {
    return undefined;
  }

  return {
    title: messages.detailTopologyTitle,
    rootLabel: messages.detailTopologyRootTitle,
    rootValue: item.sourceAnalysis.entryFile || messages.valueNotAvailable,
    rootMetaLabel: messages.detailMechanismLabel,
    rootMetaValue: item.sourceAnalysis.mechanism || messages.valueNotAvailable,
    lanes: [
      {
        title: messages.detailMetadataSourcesTitle,
        nodes: buildTopologyNodes(item.sourceAnalysis.metadataSources),
        emptyValue: messages.detailNoMetadataSources,
      },
      {
        title: messages.detailReferencePathsTitle,
        nodes: buildTopologyNodes(item.sourceAnalysis.referencePaths),
        emptyValue: messages.detailNoReferencePaths,
      },
      {
        title: messages.detailDependenciesTitle,
        nodes: buildDependencyTopologyNodes(
          item,
          messages,
          displayMessages,
          resolvePublicSkillDetailLink,
        ),
        emptyValue: messages.detailNoDependencies,
      },
    ],
  };
}

function buildSkillDetailSections(
  item: SkillsPayload["items"][number],
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages,
  resolvePublicSkillDetailLink: (value: string) => string | undefined,
): AdminCatalogDetailSection[] | undefined {
  if (!hasSourceAnalysisData(item)) {
    return undefined;
  }

  return [
    {
      title: messages.detailSourceAnalysisTitle,
      items: [
        {
          label: messages.detailEntryFileLabel,
          value: item.sourceAnalysis.entryFile || messages.valueNotAvailable,
        },
        {
          label: messages.detailMechanismLabel,
          value: item.sourceAnalysis.mechanism || messages.valueNotAvailable,
        },
      ],
    },
    {
      title: messages.detailMetadataSourcesTitle,
      items: buildDetailValueList(
        item.sourceAnalysis.metadataSources,
        messages.detailNoMetadataSources,
        buildAdminSkillSearchLink,
      ),
    },
    {
      title: messages.detailReferencePathsTitle,
      items: buildDetailValueList(
        item.sourceAnalysis.referencePaths,
        messages.detailNoReferencePaths,
        buildAdminSkillSearchLink,
      ),
    },
    {
      title: messages.detailDependenciesTitle,
      items: buildDependencyDetailItems(
        item,
        messages,
        displayMessages,
        resolvePublicSkillDetailLink,
      ),
    },
  ];
}

function buildSkillRow(
  item: SkillsPayload["items"][number],
  locale: PublicLocale,
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages,
  resolvePublicSkillDetailLink: (value: string) => string | undefined,
): AdminCatalogRow {
  return {
    id: item.id,
    name: resolveCatalogSkillName(item.name, displayMessages),
    summary: [
      resolveCatalogCategoryLabel(item.category, displayMessages),
      resolveCatalogSourceTypeLabel(item.sourceType, displayMessages),
      resolveCatalogOwnerLabel(item.ownerUsername, displayMessages),
    ].join(" · "),
    meta: [
      `${item.starCount} ${messages.starsSuffix}`,
      `${item.qualityScore.toFixed(1)} ${messages.qualitySuffix}`,
      formatDateTime(item.updatedAt, locale, messages.valueNotAvailable),
    ],
    status: item.visibility || "private",
    statusLabel: resolveCatalogVisibilityLabel(
      item.visibility,
      displayMessages,
    ),
    detailTopology: buildSkillDetailTopology(
      item,
      messages,
      displayMessages,
      resolvePublicSkillDetailLink,
    ),
    detailSections: buildSkillDetailSections(
      item,
      messages,
      displayMessages,
      resolvePublicSkillDetailLink,
    ),
    syncable: item.sourceType.toLowerCase() === "repository",
  };
}

export function buildSkillRows(
  payload: SkillsPayload,
  locale: PublicLocale,
  messages: AdminCatalogModelMessages,
  displayMessages: AdminCatalogDisplayMessages,
): AdminCatalogRow[] {
  const resolvePublicSkillDetailLink = buildPublicSkillDetailLinkResolver(
    payload.items,
  );

  return payload.items.map((item) =>
    buildSkillRow(
      item,
      locale,
      messages,
      displayMessages,
      resolvePublicSkillDetailLink,
    ),
  );
}
