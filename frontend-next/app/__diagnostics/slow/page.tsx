import { setTimeout as delay } from "node:timers/promises";
import { notFound } from "next/navigation";

function assertDiagnosticsEnabled() {
  if (process.env.SKILLSINDEX_ENABLE_DIAGNOSTIC_ROUTES !== "1") {
    notFound();
  }
}

export default async function SlowDiagnosticPage() {
  assertDiagnosticsEnabled();
  await delay(1_500);

  return <main data-testid="diagnostic-slow-page">Diagnostic content ready.</main>;
}
