import styles from "./LoginPageRoute.module.scss";

import { renderLoginRoute, type LoginRoutePageProps } from "@/src/features/auth/renderLoginRoute";

export default async function LoginPage({ searchParams }: LoginRoutePageProps) {
  return <div className={styles.page}>{await renderLoginRoute(searchParams)}</div>;
}
