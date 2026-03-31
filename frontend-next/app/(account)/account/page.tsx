import { redirect } from "next/navigation";

import { accountProfileRoute } from "@/src/lib/routing/protectedSurfaceLinks";

export default function AccountIndexPage() {
  redirect(accountProfileRoute);
}
