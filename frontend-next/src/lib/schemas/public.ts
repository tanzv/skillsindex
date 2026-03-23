import type { SessionUser } from "./session";

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

export interface PublicMarketplaceResponse {
  filters: Record<string, string | number>;
  stats: {
    total_skills: number;
    matching_skills: number;
  };
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    prev_page: number;
    next_page: number;
  };
  categories: MarketplaceCategory[];
  top_tags: MarketplaceTag[];
  filter_options?: Record<string, unknown>;
  items: MarketplaceSkill[];
  summary?: PublicMarketplaceSummary;
  session_user: SessionUser | null;
  can_access_dashboard: boolean;
}

export interface PublicMarketplaceLandingSummary {
  total_skills: number;
  category_count: number;
  top_tag_count: number;
  featured_skill_count: number;
  latest_skill_count: number;
}

export interface PublicMarketplaceCategoryHubSummary {
  total_categories: number;
  total_skills: number;
  top_tag_count: number;
  spotlight_category_count: number;
}

export interface PublicMarketplaceCategoryDetailSummary {
  category_slug: string;
  total_skills: number;
  matching_skills: number;
  subcategory_count: number;
}

export interface PublicMarketplaceSummary {
  landing: PublicMarketplaceLandingSummary;
  category_hub: PublicMarketplaceCategoryHubSummary;
  category_detail: PublicMarketplaceCategoryDetailSummary | null;
}

export interface PublicRankingSummary {
  total_compared: number;
  top_stars: number;
  top_quality: number;
  average_quality: number;
}

export interface PublicRankingCategoryLeader {
  category_slug: string;
  count: number;
  average_quality: number;
  leading_skill: MarketplaceSkill;
}

export interface PublicRankingResponse {
  sort: string;
  ranked_items: MarketplaceSkill[];
  highlights: MarketplaceSkill[];
  list_items: MarketplaceSkill[];
  summary: PublicRankingSummary;
  category_leaders: PublicRankingCategoryLeader[];
}

export interface PublicSkillDetailResponse {
  skill: MarketplaceSkill;
  stats: {
    favorite_count: number;
    rating_count: number;
    rating_average: number;
    comment_count: number;
  };
  viewer_state: {
    can_interact: boolean;
    favorited: boolean;
    rated: boolean;
    rating: number;
  };
  comments: Array<{
    id: number;
    username: string;
    display_name: string;
    content: string;
    created_at: string;
    can_delete: boolean;
  }>;
  comments_limit: number;
  related_skills?: MarketplaceSkill[];
}

export interface PublicSkillResourcesResponse {
  skill_id: number;
  source_type?: string;
  source_url?: string;
  repo_url: string;
  source_branch: string;
  source_path: string;
  install_command?: string;
  updated_at?: string;
  file_count?: number;
  files: Array<{
    name: string;
    display_name: string;
    size_bytes?: number;
    size_label: string;
    language: string;
  }>;
}

export interface PublicSkillResourceContentResponse {
  skill_id: number;
  path: string;
  display_name: string;
  language: string;
  size_bytes: number;
  size_label: string;
  content: string;
  updated_at: string;
}

export interface PublicSkillVersionsResponse {
  items: Array<{
    id: number;
    skill_id?: number;
    version_number: number;
    trigger: string;
    change_summary: string;
    risk_level: string;
    captured_at: string;
    archived_at?: string;
    archive_reason?: string;
    actor_username?: string;
    actor_display_name?: string;
    tags?: string[];
    changed_fields?: string[];
  }>;
  total: number;
}

export interface PublicSkillCompareResponse {
  left_skill: MarketplaceSkill;
  right_skill: MarketplaceSkill;
}

export interface SkillInteractionStats {
  favorite_count: number;
  rating_count: number;
  rating_average: number;
  comment_count: number;
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
