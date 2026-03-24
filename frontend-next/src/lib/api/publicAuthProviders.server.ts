import "server-only";

import { fetchBackend } from "@/src/lib/http/backend";
import type { PublicAuthProviderItem } from "./publicAuthProviders";

interface PublicAuthProvidersResponse {
  items?: Array<{
    key?: string;
    start_path?: string;
    label?: string;
  }>;
}

export async function loadPublicAuthProviders(acceptLanguage: string | null | undefined): Promise<PublicAuthProviderItem[]> {
  try {
    const response = await fetchBackend("/api/v1/auth/providers", {
      method: "GET",
      headers: {
        accept: "application/json",
        ...(acceptLanguage ? { "accept-language": acceptLanguage } : {})
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as PublicAuthProvidersResponse;
    return Array.isArray(payload.items)
      ? payload.items
          .map((item) => ({
            key: String(item?.key || "").trim(),
            startPath: String(item?.start_path || "").trim(),
            label: String(item?.label || "").trim()
          }))
          .filter((item) => item.key && item.startPath)
      : [];
  } catch {
    return [];
  }
}
