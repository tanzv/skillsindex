import { notFound } from "next/navigation";

function assertDiagnosticsEnabled() {
  if (process.env.SKILLSINDEX_ENABLE_DIAGNOSTIC_ROUTES !== "1") {
    notFound();
  }
}

export default function RuntimeErrorDiagnosticPage() {
  assertDiagnosticsEnabled();

  throw new Error("Intentional diagnostic runtime error.");
}
