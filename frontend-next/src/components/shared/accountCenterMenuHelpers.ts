import {
  Globe2,
  Languages,
  LayoutGrid,
  ShieldCheck,
  UserCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";

import type { AccountCenterMenuIcon } from "./accountCenterMenu.types";

export function useOptionalRouter() {
  try {
    return useRouter();
  } catch {
    return null;
  }
}

export function resolveAccountCenterMenuIcon(icon: AccountCenterMenuIcon) {
  switch (icon) {
    case "profile":
      return UserCircle2;
    case "security":
      return ShieldCheck;
    case "sessions":
      return Languages;
    case "credentials":
      return LayoutGrid;
    default:
      return Globe2;
  }
}
