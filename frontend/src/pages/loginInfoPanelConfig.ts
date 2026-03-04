export interface LoginInfoPanelConfig {
  kicker: string;
  title: string;
  lead: string;
  keyPoints?: string[];
  heroImageSrc?: string;
}

export interface LoginInfoPanelCopy {
  kicker: string;
  title: string;
  lead: string;
}

export type LoginInfoPanelLocale = "en" | "zh";

export interface ResolveLoginInfoPanelConfigInput {
  locale: LoginInfoPanelLocale;
  fallback: LoginInfoPanelCopy;
  search?: string;
  runtimeConfig?: unknown;
}

type LoginInfoPanelOverride = Partial<LoginInfoPanelCopy> & {
  heroImageSrc?: string;
};

interface LoginInfoPanelRuntimeConfigShape {
  kicker?: unknown;
  title?: unknown;
  lead?: unknown;
  heroImageSrc?: unknown;
  default?: unknown;
  en?: unknown;
  zh?: unknown;
}

const queryParamKeys = {
  kicker: "loginKicker",
  title: "loginTitle",
  lead: "loginLead",
  heroImageSrc: "loginHeroImageSrc"
} as const;

const localeQuerySuffix: Record<LoginInfoPanelLocale, string> = {
  en: "En",
  zh: "Zh"
};

export function buildLoginInfoPanelConfig(copy: LoginInfoPanelCopy): LoginInfoPanelConfig {
  return {
    kicker: copy.kicker,
    title: copy.title,
    lead: copy.lead,
    keyPoints: []
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeTextValue(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeImageSrc(value: unknown): string | undefined {
  const normalized = normalizeTextValue(value);
  if (!normalized) {
    return undefined;
  }

  const disallowedProtocolPattern = /^(?:javascript|data):/i;
  if (disallowedProtocolPattern.test(normalized)) {
    return undefined;
  }

  if (
    normalized.startsWith("/") ||
    normalized.startsWith("./") ||
    normalized.startsWith("../") ||
    /^https?:\/\//i.test(normalized)
  ) {
    return normalized;
  }

  return undefined;
}

function normalizeOverride(source: unknown): LoginInfoPanelOverride {
  if (!isRecord(source)) {
    return {};
  }

  const kicker = normalizeTextValue(source.kicker);
  const title = normalizeTextValue(source.title);
  const lead = normalizeTextValue(source.lead);
  const heroImageSrc = normalizeImageSrc(source.heroImageSrc);

  return {
    ...(kicker ? { kicker } : {}),
    ...(title ? { title } : {}),
    ...(lead ? { lead } : {}),
    ...(heroImageSrc ? { heroImageSrc } : {})
  };
}

function resolveRuntimeOverride(locale: LoginInfoPanelLocale, runtimeConfig: unknown): LoginInfoPanelOverride {
  if (!isRecord(runtimeConfig)) {
    return {};
  }

  const typedRuntimeConfig = runtimeConfig as LoginInfoPanelRuntimeConfigShape;
  const sharedOverride = normalizeOverride(typedRuntimeConfig);
  const defaultOverride = normalizeOverride(typedRuntimeConfig.default);
  const localeOverride = normalizeOverride(typedRuntimeConfig[locale]);

  return {
    ...sharedOverride,
    ...defaultOverride,
    ...localeOverride
  };
}

function resolveQueryOverride(locale: LoginInfoPanelLocale, search?: string): LoginInfoPanelOverride {
  const normalizedSearch = search || "";
  if (!normalizedSearch) {
    return {};
  }

  const searchParams = new URLSearchParams(normalizedSearch.startsWith("?") ? normalizedSearch : `?${normalizedSearch}`);
  const suffix = localeQuerySuffix[locale];
  const kicker = searchParams.get(`${queryParamKeys.kicker}${suffix}`) ?? searchParams.get(queryParamKeys.kicker);
  const title = searchParams.get(`${queryParamKeys.title}${suffix}`) ?? searchParams.get(queryParamKeys.title);
  const lead = searchParams.get(`${queryParamKeys.lead}${suffix}`) ?? searchParams.get(queryParamKeys.lead);
  const heroImageSrc = searchParams.get(`${queryParamKeys.heroImageSrc}${suffix}`) ?? searchParams.get(queryParamKeys.heroImageSrc);

  return normalizeOverride({
    kicker,
    title,
    lead,
    heroImageSrc
  });
}

function hasAnyOverride(override: LoginInfoPanelOverride): boolean {
  return Boolean(override.kicker || override.title || override.lead || override.heroImageSrc);
}

export function resolveLoginInfoPanelConfigOverride({
  locale,
  fallback,
  search,
  runtimeConfig
}: ResolveLoginInfoPanelConfigInput): LoginInfoPanelConfig | undefined {
  const runtimeOverride = resolveRuntimeOverride(locale, runtimeConfig);
  const queryOverride = resolveQueryOverride(locale, search);
  const mergedOverride: LoginInfoPanelOverride = {
    ...runtimeOverride,
    ...queryOverride
  };

  if (!hasAnyOverride(mergedOverride)) {
    return undefined;
  }

  return {
    kicker: mergedOverride.kicker ?? fallback.kicker,
    title: mergedOverride.title ?? fallback.title,
    lead: mergedOverride.lead ?? fallback.lead,
    keyPoints: [],
    ...(mergedOverride.heroImageSrc ? { heroImageSrc: mergedOverride.heroImageSrc } : {})
  };
}
