"use client";

import { ErrorState } from "@/src/components/shared/ErrorState";

import { ConsoleWorkbench } from "./ConsoleWorkbench";
import { adminWorkbenchDefinitions } from "./definitions";

interface AdminWorkbenchPageProps {
  route: string;
}

export function AdminWorkbenchPage({ route }: AdminWorkbenchPageProps) {
  const definition = adminWorkbenchDefinitions[route];

  if (!definition) {
    return <ErrorState title="Unknown admin route" description={`No workbench definition registered for ${route}.`} />;
  }

  return <ConsoleWorkbench definition={definition} scope="admin" />;
}
