import { redirect } from "next/navigation";

import { adminRoutePrefix, protectedDashboardRoute } from "@/src/lib/routing/protectedSurfaceLinks";

interface DashboardCompatibilityPageProps {
  params: Promise<{
    slug: string[];
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function buildQueryString(searchParams: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string" && value) {
      params.set(key, value);
      continue;
    }

    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((item) => params.append(key, item));
    }
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export default async function DashboardCompatibilityPage({
  params,
  searchParams
}: DashboardCompatibilityPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const nextPath = `${adminRoutePrefix}/${slug.join("/")}${buildQueryString(resolvedSearchParams)}`;

  if (nextPath === protectedDashboardRoute) {
    redirect(adminRoutePrefix);
  }

  redirect(nextPath);
}
