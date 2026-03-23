"use client";

import { useRouter } from "next/navigation";

import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { publicHomeRoute, publicResultsRoute } from "@/src/lib/routing/publicRouteRegistry";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import {
  SystemStatusButtonAction,
  SystemStatusLinkAction,
  SystemStatusPage
} from "@/src/components/shared/SystemStatusPage";

import { resolvePublicStateDescriptor } from "./publicStateModel";

interface PublicStatePageProps {
  state: string;
}

export function PublicStatePage({ state }: PublicStatePageProps) {
  const router = useRouter();
  const { messages } = usePublicI18n();
  const descriptor = resolvePublicStateDescriptor(messages, state);
  const { toPublicPath } = usePublicRouteState();

  if (!descriptor) {
    return null;
  }

  return (
    <SystemStatusPage
      layout="embedded"
      eyebrow={messages.stateSystemRoute}
      statusCode={descriptor.code}
      title={descriptor.title}
      description={descriptor.description}
      tone={descriptor.tone}
      actions={descriptor.actions.length ? (
        <>
          {descriptor.actions.includes("retry") ? (
            <SystemStatusButtonAction variant="primary" onClick={() => router.refresh()}>
              {messages.stateRetry}
            </SystemStatusButtonAction>
          ) : null}
          {descriptor.actions.includes("home") ? (
            <SystemStatusLinkAction href={toPublicPath(publicHomeRoute)} variant={descriptor.actions.includes("retry") ? "secondary" : "primary"}>
              {messages.stateBackToMarketplace}
            </SystemStatusLinkAction>
          ) : null}
          {descriptor.actions.includes("search") ? (
            <SystemStatusLinkAction href={toPublicPath(publicResultsRoute)}>
              {messages.stateOpenSearch}
            </SystemStatusLinkAction>
          ) : null}
        </>
      ) : null}
    />
  );
}
