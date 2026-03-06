export interface GlobalNavigationRegistration<Slot extends string, Item> {
  key: string;
  slot: Slot;
  order: number;
  item: Item;
}

export interface GlobalNavigationRegistry<Slot extends string, Item> {
  register: (registration: GlobalNavigationRegistration<Slot, Item>) => void;
  unregister: (key: string) => void;
  resolve: (slot: Slot) => Item[];
  resolveRegistrations: (slot: Slot) => GlobalNavigationRegistration<Slot, Item>[];
}

function normalizeRegistrationKey(rawKey: string): string {
  return String(rawKey || "").trim();
}

export function createGlobalNavigationRegistry<Slot extends string, Item>(
  registrations: GlobalNavigationRegistration<Slot, Item>[] = []
): GlobalNavigationRegistry<Slot, Item> {
  const registryMap = new Map<string, GlobalNavigationRegistration<Slot, Item>>();

  function register(registration: GlobalNavigationRegistration<Slot, Item>): void {
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

  function resolveRegistrations(slot: Slot): GlobalNavigationRegistration<Slot, Item>[] {
    return Array.from(registryMap.values())
      .filter((registration) => registration.slot === slot)
      .sort((left, right) => {
        if (left.order === right.order) {
          return left.key.localeCompare(right.key);
        }
        return left.order - right.order;
      });
  }

  return {
    register,
    unregister: (key) => {
      const normalizedKey = normalizeRegistrationKey(key);
      if (!normalizedKey) {
        return;
      }
      registryMap.delete(normalizedKey);
    },
    resolve: (slot) => resolveRegistrations(slot).map((registration) => registration.item),
    resolveRegistrations
  };
}
