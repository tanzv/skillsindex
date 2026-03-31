import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

interface AdminDataPageProps {
  title: string;
  description: string;
  endpoint: string;
  payload: Record<string, unknown>;
  messages: {
    responsePayloadTitle: string;
    recordTitleTemplate: string;
    objectValueLabel: string;
  };
}

function formatRecordTitle(template: string, index: number) {
  return template.replaceAll("{index}", String(index));
}

export function AdminDataPage({ title, description, endpoint, payload, messages }: AdminDataPageProps) {
  const primaryItems = Array.isArray(payload.items) ? payload.items : [];
  const secondaryPairs = Object.entries(payload).filter(([key]) => key !== "items");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 text-sm text-[color:var(--ui-text-secondary)]">
          <span className="rounded-full border border-[color:var(--ui-control-border)] bg-[color:var(--ui-control-bg-subtle)] px-3 py-1 font-medium text-[color:var(--ui-text-primary)]">
            {endpoint}
          </span>
          {secondaryPairs.slice(0, 4).map(([key, value]) => (
            <span
              key={key}
              className="rounded-full border border-[color:var(--ui-accent-soft-bg)] bg-[color:var(--ui-accent-soft-bg)] px-3 py-1 font-medium text-[color:var(--ui-accent-soft-text)]"
            >
              {key}: {typeof value === "object" ? messages.objectValueLabel : String(value)}
            </span>
          ))}
        </CardContent>
      </Card>

      {primaryItems.length > 0 ? (
        <div className="grid gap-4">
          {primaryItems.slice(0, 20).map((item, index) => (
            <Card key={`item-${index}`}>
              <CardHeader>
                <CardTitle className="text-lg">{formatRecordTitle(messages.recordTitleTemplate, index + 1)}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="overflow-auto rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] p-4 text-xs leading-6 text-[color:var(--ui-text-primary)]">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{messages.responsePayloadTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-2xl border border-[color:var(--ui-border)] bg-[color:var(--ui-card-muted-bg)] p-4 text-xs leading-6 text-[color:var(--ui-text-primary)]">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
