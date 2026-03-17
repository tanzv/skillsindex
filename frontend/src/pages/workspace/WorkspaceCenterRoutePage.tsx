import { useEffect, useMemo, useState } from "react";

import type { SessionUser } from "../../lib/api";
import type { AppLocale } from "../../lib/i18n";
import { loadMarketplaceWithFallback, resolvePrototypeDataMode } from "../prototype/prototypeDataFallback";
import { createPublicPageNavigator } from "../publicShared/publicPageNavigation";
import { getWorkspaceCenterCopy } from "./WorkspaceCenterPage.copy";
import WorkspaceCenterPageContent from "./WorkspaceCenterPageContent";
import { buildWorkspaceSnapshot } from "./WorkspaceCenterPage.helpers";
import { resolveWorkspaceSectionPage } from "./WorkspaceCenterPage.navigation";
import WorkspaceDashboardPageContent from "./WorkspaceDashboardPageContent";

interface WorkspaceCenterRoutePageProps {
  locale: AppLocale;
  currentPath: string;
  onNavigate: (path: string) => void;
  sessionUser: SessionUser | null;
}

const workspaceUnavailableMessage =
  "Live workspace data is unavailable. Some workspace insights are currently unavailable.";

export default function WorkspaceCenterRoutePage({
  locale,
  currentPath,
  onNavigate,
  sessionUser
}: WorkspaceCenterRoutePageProps) {
  const text = useMemo(() => getWorkspaceCenterCopy(locale), [locale]);
  const dataMode = useMemo(() => resolvePrototypeDataMode(import.meta.env.VITE_MARKETPLACE_HOME_MODE), []);
  const pageNavigator = useMemo(() => createPublicPageNavigator(currentPath), [currentPath]);
  const activeSectionPage = useMemo(() => resolveWorkspaceSectionPage(currentPath), [currentPath]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [degradedMessage, setDegradedMessage] = useState("");
  const [payload, setPayload] = useState<Awaited<ReturnType<typeof loadMarketplaceWithFallback>>["payload"] | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setDegradedMessage("");

    loadMarketplaceWithFallback({
      query: { sort: "recent", page: 1 },
      locale,
      sessionUser,
      mode: dataMode
    })
      .then((result) => {
        if (!active) {
          return;
        }

        setPayload(result.payload);
        setDegradedMessage(result.degraded ? result.errorMessage || workspaceUnavailableMessage : "");
      })
      .catch((loadError) => {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : text.requestFailed);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [dataMode, locale, sessionUser, text.degradedData, text.requestFailed]);

  const snapshot = useMemo(() => buildWorkspaceSnapshot({ payload, locale }), [locale, payload]);

  if (activeSectionPage === "overview") {
    return (
      <WorkspaceDashboardPageContent
        text={text}
        locale={locale}
        loading={loading}
        error={error}
        degradedMessage={degradedMessage}
        snapshot={snapshot}
      />
    );
  }

  return (
    <WorkspaceCenterPageContent
      text={text}
      locale={locale}
      loading={loading}
      error={error}
      degradedMessage={degradedMessage}
      snapshot={snapshot}
      activeSectionPage={activeSectionPage}
      onNavigate={onNavigate}
      toPublicPath={pageNavigator.toPublic}
      toAdminPath={pageNavigator.toAdmin}
    />
  );
}
