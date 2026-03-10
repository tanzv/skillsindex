export interface LoginBrandConfig {
  logoSrc: string;
  brandText: string;
}

export type LoginBrandLocale = "en" | "zh";

export interface ResolveLoginBrandConfigInput {
  locale: LoginBrandLocale;
  search?: string;
  runtimeConfig?: unknown;
}

interface LoginBrandRuntimeConfigShape {
  logoSrc?: unknown;
  brandText?: unknown;
  default?: unknown;
  en?: unknown;
  zh?: unknown;
}

const defaultLogoSrc = "/brand/skillsindex-logo.svg";
const defaultBrandText = "SkillsIndex";

const queryParamKeys = {
  logoSrc: "loginLogoSrc",
  brandText: "loginBrandText"
} as const;

const localeQuerySuffix: Record<LoginBrandLocale, string> = {
  en: "En",
  zh: "Zh"
};

type LoginBrandOverride = Partial<LoginBrandConfig>;

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

function normalizeLogoSrc(value: unknown): string | undefined {
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

function normalizeOverride(source: unknown): LoginBrandOverride {
  if (!isRecord(source)) {
    return {};
  }

  const logoSrc = normalizeLogoSrc(source.logoSrc);
  const brandText = normalizeTextValue(source.brandText);

  return {
    ...(logoSrc ? { logoSrc } : {}),
    ...(brandText ? { brandText } : {})
  };
}

function resolveRuntimeOverride(locale: LoginBrandLocale, runtimeConfig: unknown): LoginBrandOverride {
  if (!isRecord(runtimeConfig)) {
    return {};
  }

  const typedRuntimeConfig = runtimeConfig as LoginBrandRuntimeConfigShape;
  const sharedOverride = normalizeOverride(typedRuntimeConfig);
  const defaultOverride = normalizeOverride(typedRuntimeConfig.default);
  const localeOverride = normalizeOverride(typedRuntimeConfig[locale]);

  return {
    ...sharedOverride,
    ...defaultOverride,
    ...localeOverride
  };
}

function resolveQueryOverride(locale: LoginBrandLocale, search?: string): LoginBrandOverride {
  const normalizedSearch = search || "";
  if (!normalizedSearch) {
    return {};
  }

  const searchParams = new URLSearchParams(normalizedSearch.startsWith("?") ? normalizedSearch : `?${normalizedSearch}`);
  const suffix = localeQuerySuffix[locale];

  const logoSrc = searchParams.get(`${queryParamKeys.logoSrc}${suffix}`) ?? searchParams.get(queryParamKeys.logoSrc);
  const brandText = searchParams.get(`${queryParamKeys.brandText}${suffix}`) ?? searchParams.get(queryParamKeys.brandText);

  return normalizeOverride({
    logoSrc,
    brandText
  });
}

export function resolveLoginBrandConfig({
  locale,
  search,
  runtimeConfig
}: ResolveLoginBrandConfigInput): LoginBrandConfig {
  const runtimeOverride = resolveRuntimeOverride(locale, runtimeConfig);
  const queryOverride = resolveQueryOverride(locale, search);
  const mergedOverride: LoginBrandOverride = {
    ...runtimeOverride,
    ...queryOverride
  };

  return {
    logoSrc: mergedOverride.logoSrc ?? defaultLogoSrc,
    brandText: mergedOverride.brandText ?? defaultBrandText
  };
}
