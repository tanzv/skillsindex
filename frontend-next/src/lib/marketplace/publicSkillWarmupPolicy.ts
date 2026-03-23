export interface PublicSkillWarmupNetworkInfo {
  effectiveType?: string;
  saveData?: boolean;
}

export interface PublicSkillWarmupNavigatorSnapshot {
  connection?: PublicSkillWarmupNetworkInfo | null;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

const constrainedConnectionTypes = new Set(["slow-2g", "2g"]);

export function shouldEnableBatchSkillWarmupForEnvironment(environment: string | undefined): boolean {
  return String(environment || "").trim().toLowerCase() === "production";
}

export function shouldWarmPublicSkillViewportLinksInDev(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DEV_PUBLIC_SKILL_VIEWPORT_WARMUP === "true";
}

export function shouldEnablePublicSkillViewportWarmupForEnvironment(environment: string | undefined): boolean {
  const normalizedEnvironment = String(environment || "").trim().toLowerCase();
  if (normalizedEnvironment !== "development") {
    return true;
  }

  return shouldWarmPublicSkillViewportLinksInDev();
}

export function shouldDisableBatchSkillWarmup(snapshot: PublicSkillWarmupNavigatorSnapshot): boolean {
  const effectiveType = String(snapshot.connection?.effectiveType || "").trim().toLowerCase();
  if (snapshot.connection?.saveData || constrainedConnectionTypes.has(effectiveType)) {
    return true;
  }

  const deviceMemory = Number(snapshot.deviceMemory || 0);
  if (Number.isFinite(deviceMemory) && deviceMemory > 0 && deviceMemory <= 2) {
    return true;
  }

  const hardwareConcurrency = Number(snapshot.hardwareConcurrency || 0);
  if (Number.isFinite(hardwareConcurrency) && hardwareConcurrency > 0 && hardwareConcurrency <= 2) {
    return true;
  }

  return false;
}
