"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

interface PublicViewerSessionContextValue {
  isAuthenticated: boolean;
}

const PublicViewerSessionContext = createContext<PublicViewerSessionContextValue | null>(null);

interface PublicViewerSessionProviderProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

export function PublicViewerSessionProvider({ children, isAuthenticated }: PublicViewerSessionProviderProps) {
  const value = useMemo<PublicViewerSessionContextValue>(
    () => ({
      isAuthenticated
    }),
    [isAuthenticated]
  );

  return <PublicViewerSessionContext.Provider value={value}>{children}</PublicViewerSessionContext.Provider>;
}

export function usePublicViewerSession(): PublicViewerSessionContextValue {
  return useContext(PublicViewerSessionContext) || { isAuthenticated: false };
}
