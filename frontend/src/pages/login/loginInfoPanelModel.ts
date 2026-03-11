import { LoginInfoPanelConfig } from "./loginInfoPanelConfig";

export interface LoginInfoPointViewModel {
  id: string;
  body: string;
}

export interface LoginInfoPanelViewModel {
  eyebrow: string;
  headline: string;
  description: string;
  points: LoginInfoPointViewModel[];
}

function normalizeText(value: string | undefined): string {
  return String(value || "").trim();
}

function resolveHeadline(config: LoginInfoPanelConfig): string {
  const title = normalizeText(config.title);
  if (title) {
    return title;
  }

  const kicker = normalizeText(config.kicker);
  if (kicker) {
    return kicker;
  }

  return normalizeText(config.lead);
}

function resolveEyebrow(config: LoginInfoPanelConfig): string {
  const title = normalizeText(config.title);
  const kicker = normalizeText(config.kicker);
  if (!title || !kicker) {
    return "";
  }
  return kicker;
}

function buildPointFromCopy(copy: string, index: number): LoginInfoPointViewModel {
  const normalized = normalizeText(copy);
  return {
    id: `policy-point-${index + 1}`,
    body: normalized
  };
}

function resolveKeyPoints(config: LoginInfoPanelConfig): string[] {
  return (config.keyPoints || []).map((item) => normalizeText(item)).filter((item) => item.length > 0);
}

function resolvePoints(config: LoginInfoPanelConfig): LoginInfoPointViewModel[] {
  const keyPoints = resolveKeyPoints(config);
  return keyPoints.slice(0, 3).map((item, index) => buildPointFromCopy(item, index));
}

function resolveDescription(config: LoginInfoPanelConfig): string {
  const lead = normalizeText(config.lead);
  if (lead) {
    return lead;
  }

  return "";
}

export function buildLoginInfoPanelViewModel(config: LoginInfoPanelConfig): LoginInfoPanelViewModel {
  const headline = resolveHeadline(config);
  return {
    eyebrow: resolveEyebrow(config),
    headline,
    description: resolveDescription(config),
    points: resolvePoints(config)
  };
}
