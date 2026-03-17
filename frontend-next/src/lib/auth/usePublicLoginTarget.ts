"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { buildPublicLoginPath } from "./loginPaths";
import { usePublicRouteState } from "../routing/usePublicRouteState";

export function usePublicLoginTarget() {
  const searchParams = useSearchParams();
  const { corePath, prefix, toPublicLinkTarget } = usePublicRouteState();

  return useMemo(() => {
    const encodedSearch = searchParams.toString();
    const loginHref = buildPublicLoginPath(prefix, corePath, encodedSearch ? `?${encodedSearch}` : "");
    return toPublicLinkTarget(loginHref);
  }, [corePath, prefix, searchParams, toPublicLinkTarget]);
}
