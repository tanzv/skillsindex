import type { ReactElement } from "react";

import type { AdminIngestionRepositorySnapshot } from "@/src/features/adminIngestion/model";

import { guardAdminPageRoute } from "./guardAdminPageRoute";
import { renderAdminRoute } from "./renderAdminRoute";

export interface RenderAdminPageRouteOptions {
  initialRepositorySnapshot?: AdminIngestionRepositorySnapshot | null;
  initialQuery?: Record<string, string>;
}

export async function renderAdminPageRoute(
  pathname: string,
  options: RenderAdminPageRouteOptions = {}
): Promise<ReactElement> {
  await guardAdminPageRoute(pathname);
  return renderAdminRoute(pathname, options);
}
