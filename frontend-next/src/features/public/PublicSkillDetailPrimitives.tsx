import { Card, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

export function DetailMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="gap-2 p-5">
        <CardDescription className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{label}</CardDescription>
        <CardTitle className="text-base">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export function DetailFactList({
  items,
  emphasized
}: {
  items: Array<{ label: string; value: string; description?: string }>;
  emphasized?: boolean;
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className={`rounded-2xl border px-4 py-3 ${emphasized ? "border-slate-200 bg-slate-50/80" : "border-slate-200 bg-white"}`}
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{item.label}</div>
            <div className="text-sm font-semibold text-slate-950">{item.value}</div>
          </div>
          {item.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p> : null}
        </div>
      ))}
    </div>
  );
}
