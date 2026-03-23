import {
  renderPublicStateRoute,
  type PublicStateRouteEntryProps
} from "@/src/features/public/publicStateRouteEntry";

export default async function PublicStateRoutePage({ params }: PublicStateRouteEntryProps) {
  return renderPublicStateRoute(params);
}
