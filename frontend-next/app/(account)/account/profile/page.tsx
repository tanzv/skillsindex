import { accountProfileRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAccountRoute } from "@/src/features/accountCenter/renderAccountRoute";

export default async function AccountProfilePage() {
  return renderAccountRoute(accountProfileRoute);
}
