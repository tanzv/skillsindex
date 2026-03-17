"use client";

import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";

import type { PublicTopbarSlots } from "./PublicTopbar";

const PublicShellSlotsContext = createContext<((slots: PublicTopbarSlots | null) => void) | null>(null);

export function PublicShellSlotsProvider({
  children,
  onSlotsChange
}: {
  children: ReactNode;
  onSlotsChange: (slots: PublicTopbarSlots | null) => void;
}) {
  return <PublicShellSlotsContext.Provider value={onSlotsChange}>{children}</PublicShellSlotsContext.Provider>;
}

export function PublicShellRegistration({ slots }: { slots: PublicTopbarSlots }) {
  const setSlots = useContext(PublicShellSlotsContext);

  useEffect(() => {
    setSlots?.(slots);

    return () => {
      setSlots?.(null);
    };
  }, [setSlots, slots]);

  return null;
}
