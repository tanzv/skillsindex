"use client";

import { ErrorState } from "@/src/components/shared/ErrorState";
import type { AdminRenderableWorkbenchRoute } from "@/src/lib/routing/adminRouteRegistry";

import { ConsoleWorkbench } from "./ConsoleWorkbench";
import { resolveAdminRenderableWorkbenchDefinition } from "./definitions";

interface AdminWorkbenchPageProps {
  route: AdminRenderableWorkbenchRoute;
}

export function AdminWorkbenchPage({ route }: AdminWorkbenchPageProps) {
  const definition = resolveAdminRenderableWorkbenchDefinition(route);

  if (!definition) {
    return <ErrorState title="Unknown admin route" description={`No workbench definition registered for ${route}.`} />;
  }

  return <ConsoleWorkbench definition={definition} scope="admin" />;
}
