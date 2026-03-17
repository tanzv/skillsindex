"use client";

import { ErrorState } from "@/src/components/shared/ErrorState";

import { ConsoleWorkbench } from "./ConsoleWorkbench";
import { accountWorkbenchDefinitions } from "./definitions";

interface AccountWorkbenchPageProps {
  route: string;
}

export function AccountWorkbenchPage({ route }: AccountWorkbenchPageProps) {
  const definition = accountWorkbenchDefinitions[route];

  if (!definition) {
    return <ErrorState title="Unknown account route" description={`No workbench definition registered for ${route}.`} />;
  }

  return <ConsoleWorkbench definition={definition} scope="account" />;
}
