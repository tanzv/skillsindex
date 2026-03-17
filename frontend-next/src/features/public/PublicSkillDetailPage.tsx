import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import type { PublicSkillDetailResponse, PublicSkillResourcesResponse, PublicSkillVersionsResponse } from "@/src/lib/schemas/public";

import { resolveMarketplaceSkillCategoryLabel, resolveMarketplaceSkillSubcategoryLabel } from "./marketplace/marketplaceTaxonomy";

interface PublicSkillDetailPageProps {
  detail: PublicSkillDetailResponse;
  resources: PublicSkillResourcesResponse | null;
  versions: PublicSkillVersionsResponse | null;
}

export function PublicSkillDetailPage({ detail, resources, versions }: PublicSkillDetailPageProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{detail.skill.name}</CardTitle>
          <CardDescription>{detail.skill.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-400">Category</div>
              <div className="mt-2 font-semibold">{`${resolveMarketplaceSkillCategoryLabel(detail.skill)} / ${resolveMarketplaceSkillSubcategoryLabel(detail.skill)}`}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-400">Quality Score</div>
              <div className="mt-2 font-semibold">{detail.skill.quality_score}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-400">Install</div>
              <div className="mt-2 break-all font-semibold">{detail.skill.install_command || "Not provided"}</div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-semibold">Skill Content</h3>
            <pre className="mt-3 overflow-auto whitespace-pre-wrap text-sm leading-6 text-slate-700">{detail.skill.content}</pre>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Interaction Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-slate-600">
            <div>Favorites: {detail.stats.favorite_count}</div>
            <div>Ratings: {detail.stats.rating_count}</div>
            <div>Average Rating: {detail.stats.rating_average}</div>
            <div>Comments: {detail.stats.comment_count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Snapshot</CardTitle>
            <CardDescription>{resources?.files.length || 0} files available</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            {resources?.files.slice(0, 8).map((file) => (
              <div key={file.name} className="rounded-2xl border border-slate-200 px-3 py-2">
                <div className="font-medium text-slate-900">{file.display_name}</div>
                <div>{file.language} · {file.size_label}</div>
              </div>
            )) || <p>No repository resources returned for this skill.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Versions</CardTitle>
            <CardDescription>{versions?.total || 0} captured versions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            {versions?.items.slice(0, 6).map((version) => (
              <div key={version.id} className="rounded-2xl border border-slate-200 px-3 py-2">
                <div className="font-medium text-slate-900">v{version.version_number} · {version.trigger}</div>
                <div>{version.change_summary}</div>
              </div>
            )) || <p>No version history returned for this skill.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
