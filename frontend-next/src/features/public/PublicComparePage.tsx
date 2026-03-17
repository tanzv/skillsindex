import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import type { MarketplaceSkill, PublicMarketplaceResponse, PublicSkillCompareResponse } from "@/src/lib/schemas/public";

import { resolveComparedSkills } from "./publicCompareModel";
import { resolveMarketplaceSkillCategoryLabel, resolveMarketplaceSkillSubcategoryLabel } from "./marketplace/marketplaceTaxonomy";

interface PublicComparePageProps {
  marketplace: PublicMarketplaceResponse;
  comparePayload: PublicSkillCompareResponse | null;
  leftSkillId: number;
  rightSkillId: number;
}

function SkillCompareCard({ skill, label }: { skill: MarketplaceSkill | null; label: string }) {
  if (!skill) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{label}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-500">No skill selected.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle>{skill.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-600">
        <p>{skill.description}</p>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-3">Category: {`${resolveMarketplaceSkillCategoryLabel(skill)} / ${resolveMarketplaceSkillSubcategoryLabel(skill)}`}</div>
          <div className="rounded-2xl bg-slate-50 p-3">Source: {skill.source_type || "-"}</div>
          <div className="rounded-2xl bg-slate-50 p-3">Stars: {skill.star_count}</div>
          <div className="rounded-2xl bg-slate-50 p-3">Quality: {skill.quality_score}</div>
        </div>
        <Link className="text-sm font-semibold text-sky-700" href={`/skills/${skill.id}`}>
          Open Skill Detail
        </Link>
      </CardContent>
    </Card>
  );
}

export function PublicComparePage({ marketplace, comparePayload, leftSkillId, rightSkillId }: PublicComparePageProps) {
  const { leftSkill, rightSkill } = resolveComparedSkills(marketplace, comparePayload, leftSkillId, rightSkillId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Skill Compare</CardTitle>
          <CardDescription>Compare two marketplace skills using the same public data contracts exposed by the backend.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/compare" className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <select
              className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              name="left"
              defaultValue={String(leftSkill?.id || leftSkillId || "")}
            >
              {marketplace.items.map((item) => (
                <option key={`left-${item.id}`} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              name="right"
              defaultValue={String(rightSkill?.id || rightSkillId || "")}
            >
              {marketplace.items.map((item) => (
                <option key={`right-${item.id}`} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <button className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Compare
            </button>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <SkillCompareCard skill={leftSkill} label="Left Skill" />
        <SkillCompareCard skill={rightSkill} label="Right Skill" />
      </div>
    </div>
  );
}
