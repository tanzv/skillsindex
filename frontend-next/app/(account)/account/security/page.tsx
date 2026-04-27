import "../../../account-center.css";
import { accountSecurityRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAccountRoute } from "@/src/features/accountCenter/renderAccountRoute";

export default async function AccountSecurityPage() {
  return renderAccountRoute(accountSecurityRoute);
}
