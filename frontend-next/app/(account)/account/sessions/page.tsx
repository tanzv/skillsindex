import { accountSessionsRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAccountRoute } from "@/src/features/accountCenter/renderAccountRoute";

export default async function AccountSessionsPage() {
  return renderAccountRoute(accountSessionsRoute);
}
