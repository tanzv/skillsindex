"use client";

import Link from "next/link";

import { usePublicI18n } from "@/src/features/public/i18n/PublicI18nProvider";
import { usePublicRouteState } from "@/src/lib/routing/usePublicRouteState";
import { resolvePublicStateDescriptor } from "./publicStateModel";

interface PublicStatePageProps {
  state: string;
}

export function PublicStatePage({ state }: PublicStatePageProps) {
  const { messages } = usePublicI18n();
  const descriptor = resolvePublicStateDescriptor(messages, state);
  const { toPublicPath } = usePublicRouteState();

  if (!descriptor) {
    return null;
  }

  return (
    <section className="marketplace-section-card">
      <div className="marketplace-section-header">
        <p className="marketplace-kicker">{messages.statePrototypeRoute}</p>
        <h2>{descriptor.title}</h2>
        <p>{descriptor.description}</p>
      </div>

      <div className="marketplace-pill-row">
        <Link href={toPublicPath("/")} className="marketplace-topbar-button is-primary">
          {messages.stateBackToMarketplace}
        </Link>
        <Link href={toPublicPath("/results")} className="marketplace-topbar-button">
          {messages.stateOpenSearch}
        </Link>
      </div>
    </section>
  );
}
