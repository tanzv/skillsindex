export interface EndpointMetadata {
  key: string;
  label: string;
  value: string;
  summary: string;
}

export interface PublicDocsStats {
  totalDocs: number;
  specDocs: number;
  interactiveTools: number;
  inAppRoutes: number;
}
