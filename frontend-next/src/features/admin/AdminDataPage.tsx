import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

interface AdminDataPageProps {
  title: string;
  description: string;
  endpoint: string;
  payload: Record<string, unknown>;
}

export function AdminDataPage({ title, description, endpoint, payload }: AdminDataPageProps) {
  const primaryItems = Array.isArray(payload.items) ? payload.items : [];
  const secondaryPairs = Object.entries(payload).filter(([key]) => key !== "items");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 text-sm text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">{endpoint}</span>
          {secondaryPairs.slice(0, 4).map(([key, value]) => (
            <span key={key} className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">
              {key}: {typeof value === "object" ? "object" : String(value)}
            </span>
          ))}
        </CardContent>
      </Card>

      {primaryItems.length > 0 ? (
        <div className="grid gap-4">
          {primaryItems.slice(0, 20).map((item, index) => (
            <Card key={`item-${index}`}>
              <CardHeader>
                <CardTitle className="text-lg">Record {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Response Payload</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
