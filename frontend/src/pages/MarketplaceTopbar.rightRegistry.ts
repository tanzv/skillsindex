import type { ReactNode } from "react";

export type MarketplaceTopbarRightSlot = "light" | "dark";

export interface MarketplaceTopbarRightRegistration {
  key: string;
  slot: MarketplaceTopbarRightSlot | "both";
  order: number;
  render: () => ReactNode;
}

export interface MarketplaceTopbarRightRegistry {
  register: (registration: MarketplaceTopbarRightRegistration) => void;
  resolve: (slot: MarketplaceTopbarRightSlot) => MarketplaceTopbarRightRegistration[];
}

function normalizeRegistrationKey(rawKey: string): string {
  return String(rawKey || "").trim();
}

function shouldIncludeSlot(registration: MarketplaceTopbarRightRegistration, slot: MarketplaceTopbarRightSlot): boolean {
  return registration.slot === "both" || registration.slot === slot;
}

export function createMarketplaceTopbarRightRegistry(
  registrations: MarketplaceTopbarRightRegistration[] = []
): MarketplaceTopbarRightRegistry {
  const registryMap = new Map<string, MarketplaceTopbarRightRegistration>();

  function register(registration: MarketplaceTopbarRightRegistration): void {
    const normalizedKey = normalizeRegistrationKey(registration.key);
    if (!normalizedKey) {
      return;
    }
    registryMap.set(normalizedKey, {
      ...registration,
      key: normalizedKey
    });
  }

  for (const registration of registrations) {
    register(registration);
  }

  return {
    register,
    resolve: (slot) => {
      return Array.from(registryMap.values())
        .filter((registration) => shouldIncludeSlot(registration, slot))
        .sort((left, right) => {
          if (left.order === right.order) {
            return left.key.localeCompare(right.key);
          }
          return left.order - right.order;
        });
    }
  };
}
