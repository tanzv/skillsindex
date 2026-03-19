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
