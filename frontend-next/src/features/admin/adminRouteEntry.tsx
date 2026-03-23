import type { ReactElement } from "react";

import type { AdminIngestionRepositorySnapshot } from "@/src/features/adminIngestion/model";

import { renderAdminRoute } from "./renderAdminRoute";

export interface RenderAdminPageRouteOptions {
  initialRepositorySnapshot?: AdminIngestionRepositorySnapshot | null;
}

export async function renderAdminPageRoute(
  pathname: string,
  options: RenderAdminPageRouteOptions = {}
): Promise<ReactElement> {
  return renderAdminRoute(pathname, options);
}
