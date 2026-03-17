"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { buildPublicLinkTarget, splitPublicPathPrefix } from "@/src/lib/routing/publicCompat";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";

type PublicLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

export function PublicLink({ href, ...props }: PublicLinkProps) {
  const { prefix } = usePublicRouteState();
  const browserPrefix =
    typeof window !== "undefined" ? splitPublicPathPrefix(window.location.pathname || "/").prefix : prefix;
  const target = buildPublicLinkTarget(browserPrefix || prefix, href);

  return <Link {...props} href={target.href} as={target.as} />;
}
