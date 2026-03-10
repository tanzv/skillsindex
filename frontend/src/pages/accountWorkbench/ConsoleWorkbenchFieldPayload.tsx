import {
  Card,
  Descriptions,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Table,
  Tag
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReactNode } from "react";
import type { FieldDefinition } from "./ConsoleWorkbench";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isScalar(value: unknown): value is string | number | boolean | null {
  return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function humanizeKey(raw: string): string {
  return raw
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function looksLikeDate(raw: string): boolean {
  if (!raw || raw.length < 10) {
    return false;
  }
  if (!raw.includes("T") && !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return false;
  }
  const parsed = Date.parse(raw);
  return !Number.isNaN(parsed);
}

function renderValue(value: unknown): ReactNode {
  if (value === null || value === undefined || value === "") {
    return <span className="workbench-empty">-</span>;
  }
  if (typeof value === "boolean") {
    return <Tag color={value ? "success" : "default"}>{value ? "true" : "false"}</Tag>;
  }
  if (typeof value === "number") {
    return Number.isInteger(value) ? value : value.toFixed(2);
  }
  if (typeof value === "string") {
    if (looksLikeDate(value)) {
      return new Date(value).toLocaleString();
    }
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="workbench-empty">empty</span>;
    }
    if (value.every((item) => isScalar(item))) {
      return value.join(", ");
    }
    return `${value.length} items`;
  }
  if (isPlainObject(value)) {
    return "object";
  }
  return String(value);
}

function payloadToTableRows(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is Record<string, unknown> => isPlainObject(item));
}

function buildTableColumns(rows: Record<string, unknown>[]): ColumnsType<Record<string, unknown>> {
  const columnSet = new Set<string>();
  rows.slice(0, 20).forEach((item) => {
    Object.keys(item).forEach((key) => columnSet.add(key));
  });
  return Array.from(columnSet)
    .slice(0, 12)
    .map((key) => ({
      title: humanizeKey(key),
      dataIndex: key,
      key,
      render: (value: unknown) => renderValue(value)
    }));
}

function compactPayload(payload: unknown): string {
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}

export function PayloadView({ payload }: { payload: unknown }) {
  if (!isPlainObject(payload)) {
    return <pre className="workbench-json">{compactPayload(payload)}</pre>;
  }

  const entries = Object.entries(payload);
  const scalarEntries = entries.filter(([, value]) => isScalar(value) || (Array.isArray(value) && value.every((item) => isScalar(item))));
  const arrayEntries = entries.filter(([, value]) => Array.isArray(value) && !value.every((item) => isScalar(item)));
  const objectEntries = entries.filter(([key, value]) => isPlainObject(value) && !scalarEntries.some(([scalarKey]) => scalarKey === key));

  return (
    <Space direction="vertical" size={14} className="workbench-payload-stack">
      {scalarEntries.length > 0 ? (
        <Descriptions size="small" bordered column={{ xs: 1, sm: 1, md: 2, lg: 3 }}>
          {scalarEntries.map(([key, value]) => (
            <Descriptions.Item key={key} label={humanizeKey(key)}>
              {renderValue(value)}
            </Descriptions.Item>
          ))}
        </Descriptions>
      ) : null}

      {arrayEntries.map(([key, value]) => {
        const rows = payloadToTableRows(value);
        const columns = buildTableColumns(rows);
        return (
          <Card key={key} type="inner" title={humanizeKey(key)} className="workbench-nested-card">
            {rows.length === 0 ? (
              <pre className="workbench-json">{compactPayload(value)}</pre>
            ) : (
              <Table<Record<string, unknown>>
                size="small"
                bordered
                columns={columns}
                dataSource={rows}
                rowKey={(record, index) =>
                  String(
                    record.id ??
                      record.session_id ??
                      record.user_id ??
                      record.organization_id ??
                      record.plan_key ??
                      record.ticket_id ??
                      index
                  )
                }
                pagination={{ pageSize: 8, hideOnSinglePage: true }}
                scroll={{ x: true }}
              />
            )}
          </Card>
        );
      })}

      {objectEntries.map(([key, value]) => (
        <Card key={key} type="inner" title={humanizeKey(key)} className="workbench-nested-card">
          {isPlainObject(value) ? <PayloadView payload={value} /> : <pre className="workbench-json">{compactPayload(value)}</pre>}
        </Card>
      ))}
    </Space>
  );
}

export function FieldEditor({
  field,
  value,
  onChange
}: {
  field: FieldDefinition;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  if (field.type === "switch") {
    return <Switch checked={Boolean(value)} onChange={(checked) => onChange(checked)} />;
  }

  if (field.type === "select") {
    return (
      <Select
        value={String(value ?? "")}
        options={field.options || []}
        placeholder={field.placeholder}
        onChange={(selected) => onChange(selected)}
      />
    );
  }

  if (field.type === "number") {
    const numericValue = typeof value === "number" ? value : value === "" || value === null ? null : Number(value);
    return (
      <InputNumber
        value={Number.isFinite(numericValue as number) ? (numericValue as number) : null}
        onChange={(next) => onChange(next ?? "")}
        min={field.min}
        max={field.max}
        step={field.step || 1}
        placeholder={field.placeholder}
        className="workbench-number-input"
      />
    );
  }

  if (field.type === "textarea") {
    return (
      <Input.TextArea
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        autoSize={{ minRows: 2, maxRows: 6 }}
      />
    );
  }

  if (field.type === "password") {
    return (
      <Input.Password
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
      />
    );
  }

  return (
    <Input
      value={String(value ?? "")}
      onChange={(event) => onChange(event.target.value)}
      placeholder={field.placeholder}
    />
  );
}
