import { SystemStatusPage } from "@/src/components/shared/SystemStatusPage";

export default function RootLoadingPage() {
  return (
    <SystemStatusPage
      eyebrow="Transition State"
      title="Loading Next Surface"
      description="The shell is assembling route data, navigation context, and the first visible content block."
      detail="This transition page is shared across public and protected surfaces to avoid blank states during navigation."
      tone="loading"
      testId="system-status-loading-page"
    />
  );
}
