"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { usePublicRoutePathnameContext } from "./PublicRoutePathProvider";

function resolvePublicPathname(pathname: string | null, contextPathname: string | null): string {
  if (typeof window !== "undefined") {
    return window.location.pathname || contextPathname || pathname || "/";
  }

  return contextPathname || pathname || "/";
}

export function useResolvedPublicPathname(): string {
  const pathname = usePathname();
  const contextPathname = usePublicRoutePathnameContext();
  const [resolvedPathname, setResolvedPathname] = useState(() => resolvePublicPathname(pathname, contextPathname));
  const browserPathname = typeof window !== "undefined" ? window.location.pathname || "" : "";

  useEffect(() => {
    function syncResolvedPathname() {
      setResolvedPathname(resolvePublicPathname(pathname, contextPathname));
    }

    syncResolvedPathname();
    window.addEventListener("popstate", syncResolvedPathname);
    window.addEventListener("hashchange", syncResolvedPathname);

    return () => {
      window.removeEventListener("popstate", syncResolvedPathname);
      window.removeEventListener("hashchange", syncResolvedPathname);
    };
  }, [contextPathname, pathname]);

  return browserPathname || resolvedPathname || contextPathname || pathname || "/";
}
