export interface SessionUser {
  id: number;
  username: string;
  display_name: string;
  role: string;
  status: string;
}

export interface SessionContextResponse {
  user: SessionUser | null;
  marketplace_public_access: boolean;
}

export interface IntegrationConnector {
  id: number;
  name: string;
  provider: string;
  description: string;
  base_url: string;
  enabled: boolean;
  updated_at: string;
}

export interface WebhookLog {
  id: number;
  connector_id: number;
  event_type: string;
  outcome: string;
  status_code: number;
  endpoint: string;
  delivered_at: string;
}

export interface AdminIntegrationsResponse {
  items: IntegrationConnector[];
  total: number;
  webhook_logs: WebhookLog[];
  webhook_total: number;
}

export interface OpsMetrics {
  open_incidents: number;
  pending_moderation_cases: number;
  unresolved_jobs: number;
  failed_sync_runs_24h: number;
  disabled_accounts: number;
  stale_integrations: number;
}

export interface AdminOpsMetricsResponse {
  item: OpsMetrics;
}

export interface MarketplaceSubcategory {
  slug: string;
  name: string;
  count: number;
}

export interface MarketplaceCategory {
  slug: string;
  name: string;
  description: string;
  count: number;
  subcategories: MarketplaceSubcategory[];
}

export interface MarketplaceTag {
  name: string;
  count: number;
}

export interface MarketplaceSkill {
  id: number;
  name: string;
  description: string;
  content: string;
  category: string;
  subcategory: string;
  tags: string[];
  source_type: string;
  source_url: string;
  star_count: number;
  quality_score: number;
  install_command: string;
  updated_at: string;
}

export interface MarketplaceFilters {
  q: string;
  tags: string;
  category: string;
  subcategory: string;
  sort: string;
  mode: string;
}

export interface MarketplaceFilterOption {
  value: string;
  label?: string;
}

export interface MarketplaceCategoryFilterOptions {
  category_slug: string;
  sort?: MarketplaceFilterOption[];
  mode?: MarketplaceFilterOption[];
}

export interface MarketplaceFilterOptions {
  sort?: MarketplaceFilterOption[];
  mode?: MarketplaceFilterOption[];
  category_overrides?: MarketplaceCategoryFilterOptions[];
}

export interface MarketplaceStats {
  total_skills: number;
  matching_skills: number;
}

export interface MarketplacePagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  prev_page: number;
  next_page: number;
}

export interface PublicMarketplaceResponse {
  filters: MarketplaceFilters;
  stats: MarketplaceStats;
  pagination: MarketplacePagination;
  categories: MarketplaceCategory[];
  top_tags: MarketplaceTag[];
  filter_options?: MarketplaceFilterOptions;
  items: MarketplaceSkill[];
  session_user: SessionUser | null;
  can_access_dashboard: boolean;
}

export interface SkillInteractionStats {
  favorite_count: number;
  rating_count: number;
  rating_average: number;
  comment_count: number;
}

export interface PublicSkillDetailViewerState {
  can_interact: boolean;
  favorited: boolean;
  rated: boolean;
  rating: number;
}

export interface PublicSkillDetailComment {
  id: number;
  skill_id: number;
  user_id: number;
  username: string;
  display_name: string;
  content: string;
  created_at: string;
  can_delete: boolean;
}

export interface PublicSkillDetailResponse {
  skill: MarketplaceSkill;
  stats: SkillInteractionStats;
  viewer_state: PublicSkillDetailViewerState;
  comments: PublicSkillDetailComment[];
  comments_limit: number;
}

export interface SkillFavoriteMutationResponse {
  ok: boolean;
  favorited: boolean;
  stats?: SkillInteractionStats;
}

export interface SkillRatingMutationResponse {
  ok: boolean;
  score: number;
  stats?: SkillInteractionStats;
}

export interface SkillCommentCreateMutationResponse {
  ok: boolean;
  comment: {
    id: number;
    skill_id: number;
    user_id: number;
    content: string;
    created_at: string;
  };
}

export interface SkillCommentDeleteMutationResponse {
  ok: boolean;
  comment_id: number;
}

export interface MarketplaceQueryParams extends Partial<MarketplaceFilters> {
  page?: number | string;
}

export interface AuthProviderEntry {
  key: string;
  start_path: string;
}

export interface AuthProvidersResponse {
  ok: boolean;
  auth_providers: string[];
  items: AuthProviderEntry[];
}

export interface ConsoleFormSubmissionResult {
  ok: boolean;
  message: string;
  error: string;
  redirectedTo: string;
}
