import {
  renderPublicSkillDetailRoute,
  type PublicSkillDetailRouteProps
} from "@/src/features/public/publicSkillDetailRouteEntry";

export default async function SkillDetailPage({ params }: PublicSkillDetailRouteProps) {
  return renderPublicSkillDetailRoute(params);
}
