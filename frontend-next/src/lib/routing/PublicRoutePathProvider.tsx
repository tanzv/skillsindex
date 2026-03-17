"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

const PublicRoutePathContext = createContext<string | null>(null);

export function PublicRoutePathProvider({
  pathname,
  children
}: {
  pathname: string;
  children: ReactNode;
}) {
  return <PublicRoutePathContext.Provider value={pathname}>{children}</PublicRoutePathContext.Provider>;
}

export function usePublicRoutePathnameContext() {
  return useContext(PublicRoutePathContext);
}
