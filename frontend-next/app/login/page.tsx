import { renderLoginRoute, type LoginRoutePageProps } from "@/src/features/auth/renderLoginRoute";

export default async function LoginPage({ searchParams }: LoginRoutePageProps) {
  return renderLoginRoute(searchParams);
}
