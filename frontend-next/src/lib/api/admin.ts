import { serverFetchJSON } from "../http/serverFetch";

export interface AdminCollectionResponse {
  items?: Array<Record<string, unknown>>;
  item?: Record<string, unknown>;
  total?: number;
  [key: string]: unknown;
}

export async function fetchAdminCollection(requestHeaders: Headers, path: string): Promise<AdminCollectionResponse> {
  return serverFetchJSON<AdminCollectionResponse>(path, {
    requestHeaders
  });
}
