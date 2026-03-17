import { redirect } from "next/navigation";

interface ComparePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const resolvedSearchParams = await searchParams;
  const params = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(resolvedSearchParams)) {
    if (Array.isArray(rawValue)) {
      rawValue.filter(Boolean).forEach((value) => params.append(key, value));
      continue;
    }

    if (rawValue) {
      params.set(key, rawValue);
    }
  }

  if (!params.has("sort")) {
    params.set("sort", "stars");
  }

  const suffix = params.toString();
  redirect(suffix ? `/rankings?${suffix}` : "/rankings");
}
