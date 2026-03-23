"use client";

import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";

import type { PublicTopbarSlots } from "./PublicTopbar";

const PublicMarketWebclientSlotsContext = createContext<((slots: PublicTopbarSlots | null) => void) | null>(null);

export function PublicMarketWebclientSlotsProvider({
  children,
  onSlotsChange
}: {
  children: ReactNode;
  onSlotsChange: (slots: PublicTopbarSlots | null) => void;
}) {
  return (
    <PublicMarketWebclientSlotsContext.Provider value={onSlotsChange}>
      {children}
    </PublicMarketWebclientSlotsContext.Provider>
  );
}

export function PublicMarketWebclientRegistration({ slots }: { slots: PublicTopbarSlots }) {
  const setSlots = useContext(PublicMarketWebclientSlotsContext);

  useEffect(() => {
    setSlots?.(slots);

    return () => {
      setSlots?.(null);
    };
  }, [setSlots, slots]);

  return null;
}
