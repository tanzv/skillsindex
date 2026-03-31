import { accountApiCredentialsRoute } from "@/src/lib/routing/protectedSurfaceLinks";
import { renderAccountRoute } from "@/src/features/accountCenter/renderAccountRoute";

export default async function AccountAPICredentialsPage() {
  return renderAccountRoute(accountApiCredentialsRoute);
}
