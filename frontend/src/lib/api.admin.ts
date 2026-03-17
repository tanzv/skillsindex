import type { AdminIntegrationsResponse, AdminOpsMetricsResponse } from "./api.types";
import { requestJSON } from "./api.core";

export async function fetchAdminIntegrations(): Promise<AdminIntegrationsResponse> {
  return requestJSON<AdminIntegrationsResponse>("/api/v1/admin/integrations?limit=20", {
    method: "GET"
  });
}

export async function fetchAdminOpsMetrics(): Promise<AdminOpsMetricsResponse> {
  return requestJSON<AdminOpsMetricsResponse>("/api/v1/admin/ops/metrics", {
    method: "GET"
  });
}
