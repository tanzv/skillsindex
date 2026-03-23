import { SystemStatusLinkAction, SystemStatusPage } from "@/src/components/shared/SystemStatusPage";

export default function NotFoundPage() {
  return (
    <SystemStatusPage
      eyebrow="System Status"
      statusCode="404"
      title="Page Not Found"
      description="The route you requested is not registered in the current frontend surface."
      detail="Return to the marketplace entrypoint or open the public search stage to continue navigation."
      tone="warning"
      actions={(
        <>
          <SystemStatusLinkAction href="/" variant="primary">
            Back to Marketplace
          </SystemStatusLinkAction>
          <SystemStatusLinkAction href="/results">Open Search</SystemStatusLinkAction>
        </>
      )}
    />
  );
}
