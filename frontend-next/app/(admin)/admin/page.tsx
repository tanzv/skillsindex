import { redirect } from "next/navigation";

import { adminOverviewRoute } from "@/src/lib/routing/protectedSurfaceLinks";

export default function AdminIndexPage() {
  redirect(adminOverviewRoute);
}
