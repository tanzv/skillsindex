"use client";

import { useEffect } from "react";

import {
  SystemStatusButtonAction,
  SystemStatusLinkAction,
  SystemStatusPage
} from "@/src/components/shared/SystemStatusPage";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <SystemStatusPage
          eyebrow="Runtime Fault"
          statusCode="500"
          title="Unexpected Application Error"
          description="The current route raised an unhandled exception before the page could stabilize."
          detail={error.digest ? `Error digest: ${error.digest}` : "Retry the current transition or return to the marketplace root."}
          tone="danger"
          actions={(
            <>
              <SystemStatusButtonAction variant="primary" onClick={reset}>
                Try Again
              </SystemStatusButtonAction>
              <SystemStatusLinkAction href="/">Back to Marketplace</SystemStatusLinkAction>
            </>
          )}
        />
      </body>
    </html>
  );
}
