import "server-only";

import type { ReactElement } from "react";

import { headers } from "next/headers";

import { ErrorState } from "@/src/components/shared/ErrorState";
import { PageHeader } from "@/src/components/shared/PageHeader";
import { Button } from "@/src/components/ui/button";
import { fetchAdminCollection } from "@/src/lib/api/admin";
import { resolveRequestErrorDisplayMessage } from "@/src/lib/http/requestErrors";
import { formatProtectedMessage } from "@/src/lib/i18n/protectedMessages";
import { loadProtectedMessages } from "@/src/lib/i18n/protectedMessages.server";
import { resolveServerLocale } from "@/src/lib/i18n/serverLocale";
import { buildAdminDataPageRouteMetaMap } from "@/src/lib/routing/adminRoutePageMeta";

import { AdminDataPage } from "./AdminDataPage";

export async function renderAdminDataRoute(pathname: string): Promise<ReactElement> {
  const locale = await resolveServerLocale();
  const protectedMessages = await loadProtectedMessages(locale);
  const routeMessages = protectedMessages.adminRoute;
  const meta = buildAdminDataPageRouteMetaMap(protectedMessages.adminNavigation)[pathname];

  if (!meta) {
    return (
      <ErrorState
        title={routeMessages.unknownRouteTitle}
        description={formatProtectedMessage(routeMessages.unknownRouteDescriptionTemplate, { pathname })}
      />
    );
  }

  try {
    const requestHeaders = new Headers(await headers());
    const payload = await fetchAdminCollection(requestHeaders, meta.endpoint);

    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow={routeMessages.eyebrow}
          title={meta.title}
          description={meta.description}
          actions={
            <Button asChild variant="outline">
              <a href={meta.endpoint} target="_blank" rel="noreferrer">
                {routeMessages.openEndpointAction}
              </a>
            </Button>
          }
        />
        <AdminDataPage
          title={meta.title}
          description={meta.description}
          endpoint={meta.endpoint}
          payload={payload}
          messages={{
            responsePayloadTitle: routeMessages.responsePayloadTitle,
            recordTitleTemplate: routeMessages.recordTitleTemplate,
            objectValueLabel: routeMessages.objectValueLabel
          }}
        />
      </div>
    );
  } catch (error) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow={routeMessages.eyebrow} title={meta.title} description={meta.description} />
        <ErrorState description={resolveRequestErrorDisplayMessage(error, routeMessages.loadFailureDescription)} />
      </div>
    );
  }
}
