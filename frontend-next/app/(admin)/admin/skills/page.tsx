import { adminSkillsRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAdminPageRoute } from "@/src/features/admin/adminRouteEntry";

interface AdminSkillsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstSearchParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return String(value[0] || "").trim();
  }

  return String(value || "").trim();
}

export default async function AdminSkillsPage({
  searchParams,
}: AdminSkillsPageProps) {
  const resolvedSearchParams = await searchParams;

  return renderAdminPageRoute(adminSkillsRoute, {
    initialQuery: {
      q: firstSearchParam(resolvedSearchParams.q),
      owner: firstSearchParam(resolvedSearchParams.owner),
      page: firstSearchParam(resolvedSearchParams.page),
      limit: firstSearchParam(resolvedSearchParams.limit),
      source: firstSearchParam(resolvedSearchParams.source),
      visibility: firstSearchParam(resolvedSearchParams.visibility),
    },
  });
}
