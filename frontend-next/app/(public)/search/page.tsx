import { redirect } from "next/navigation";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
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

  const suffix = params.toString();
  redirect(suffix ? `/results?${suffix}` : "/results");
}
