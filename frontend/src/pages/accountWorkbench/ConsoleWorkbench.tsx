import { ReloadOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Row,
  Space,
  Spin,
  Statistic,
  Typography,
  message
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { fetchConsoleJSON, postConsoleJSON } from "../../lib/api";
import { FieldEditor, PayloadView } from "./ConsoleWorkbenchFieldPayload";

export type FieldType = "text" | "number" | "password" | "textarea" | "select" | "switch";

export type PrimitiveValue = string | number | boolean | null | undefined;

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  defaultValue?: PrimitiveValue;
  min?: number;
  max?: number;
  step?: number;
}

export interface ResourceDefinition {
  key: string;
  title: string;
  description?: string;
  fields?: FieldDefinition[];
  autoLoad?: boolean;
  buildPath: (values: Record<string, unknown>) => string | null;
}

export interface ActionDefinition {
  key: string;
  title: string;
  description?: string;
  fields?: FieldDefinition[];
  method?: "GET" | "POST";
  submitText?: string;
  buildPath: (values: Record<string, unknown>) => string | null;
  buildPayload?: (values: Record<string, unknown>) => Record<string, unknown> | undefined;
  refreshResources?: string[];
}

export interface SummaryStat {
  label: string;
  value: string | number;
  help?: string;
}

export interface WorkbenchDefinition {
  title: string;
  subtitle: string;
  resources: ResourceDefinition[];
  actions?: ActionDefinition[];
  summary?: (resources: Record<string, unknown>) => SummaryStat[];
}

interface ConsoleWorkbenchProps {
  definition: WorkbenchDefinition;
  scope: "admin" | "account";
}

interface ResourceState {
  loading: boolean;
  error: string;
  data: unknown;
  path: string;
}

interface ActionState {
  loading: boolean;
  error: string;
  data: unknown;
}

function defaultFieldValue(field: FieldDefinition): PrimitiveValue {
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }
  if (field.type === "switch") {
    return false;
  }
  return "";
}

function buildInitialValues(fields: FieldDefinition[] | undefined): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of fields || []) {
    values[field.key] = defaultFieldValue(field);
  }
  return values;
}

function buildPathWithQuery(basePath: string, values: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value === "" || value === undefined || value === null) {
      continue;
    }
    if (Array.isArray(value)) {
      if (value.length > 0) {
        params.set(key, value.join(","));
      }
      continue;
    }
    params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function buildDefaultPayload(values: Record<string, unknown>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === "" || value === undefined || value === null) {
      continue;
    }
    payload[key] = value;
  }
  return payload;
}

export function ConsoleWorkbench({ definition, scope }: ConsoleWorkbenchProps) {
  const [messageAPI, messageContext] = message.useMessage();

  const initialResourceValues = useMemo(() => {
    const values: Record<string, Record<string, unknown>> = {};
    for (const resource of definition.resources) {
      values[resource.key] = buildInitialValues(resource.fields);
    }
    return values;
  }, [definition]);

  const initialActionValues = useMemo(() => {
    const values: Record<string, Record<string, unknown>> = {};
    for (const action of definition.actions || []) {
      values[action.key] = buildInitialValues(action.fields);
    }
    return values;
  }, [definition]);

  const [resourceValues, setResourceValues] = useState<Record<string, Record<string, unknown>>>(initialResourceValues);
  const [resourceState, setResourceState] = useState<Record<string, ResourceState>>({});
  const [actionValues, setActionValues] = useState<Record<string, Record<string, unknown>>>(initialActionValues);
  const [actionState, setActionState] = useState<Record<string, ActionState>>({});

  useEffect(() => {
    setResourceValues(initialResourceValues);
    setResourceState({});
    setActionValues(initialActionValues);
    setActionState({});

    definition.resources
      .filter((resource) => resource.autoLoad !== false)
      .forEach((resource) => {
        void loadResource(resource, initialResourceValues[resource.key] || {});
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [definition, initialActionValues, initialResourceValues]);

  async function loadResource(resource: ResourceDefinition, valuesOverride?: Record<string, unknown>) {
    const effectiveValues = valuesOverride || resourceValues[resource.key] || {};
    const path = resource.buildPath(effectiveValues);
    if (!path) {
      setResourceState((previous) => ({
        ...previous,
        [resource.key]: {
          loading: false,
          error: "Missing required query fields.",
          data: null,
          path: ""
        }
      }));
      return;
    }

    setResourceState((previous) => ({
      ...previous,
      [resource.key]: {
        loading: true,
        error: "",
        data: previous[resource.key]?.data,
        path
      }
    }));

    try {
      const payload = await fetchConsoleJSON(path);
      setResourceState((previous) => ({
        ...previous,
        [resource.key]: {
          loading: false,
          error: "",
          data: payload,
          path
        }
      }));
    } catch (requestError) {
      setResourceState((previous) => ({
        ...previous,
        [resource.key]: {
          loading: false,
          error: requestError instanceof Error ? requestError.message : "Request failed",
          data: previous[resource.key]?.data,
          path
        }
      }));
    }
  }

  async function runAction(action: ActionDefinition) {
    const values = actionValues[action.key] || {};
    const path = action.buildPath(values);
    if (!path) {
      setActionState((previous) => ({
        ...previous,
        [action.key]: {
          loading: false,
          error: "Missing required action parameters.",
          data: previous[action.key]?.data
        }
      }));
      return;
    }

    setActionState((previous) => ({
      ...previous,
      [action.key]: {
        loading: true,
        error: "",
        data: previous[action.key]?.data
      }
    }));

    try {
      let payload: unknown;
      if (action.method === "GET") {
        payload = await fetchConsoleJSON(path);
      } else {
        const body = action.buildPayload ? action.buildPayload(values) : buildDefaultPayload(values);
        payload = await postConsoleJSON(path, body);
      }

      setActionState((previous) => ({
        ...previous,
        [action.key]: {
          loading: false,
          error: "",
          data: payload
        }
      }));

      messageAPI.success(`${action.title} completed`);

      for (const key of action.refreshResources || []) {
        const resource = definition.resources.find((item) => item.key === key);
        if (!resource) {
          continue;
        }
        // eslint-disable-next-line no-await-in-loop
        await loadResource(resource);
      }
    } catch (requestError) {
      const errorMessage = requestError instanceof Error ? requestError.message : "Action failed";
      setActionState((previous) => ({
        ...previous,
        [action.key]: {
          loading: false,
          error: errorMessage,
          data: previous[action.key]?.data
        }
      }));
      messageAPI.error(errorMessage);
    }
  }

  const resourceDataMap = useMemo(() => {
    const map: Record<string, unknown> = {};
    for (const resource of definition.resources) {
      if (resourceState[resource.key]?.data !== undefined) {
        map[resource.key] = resourceState[resource.key].data;
      }
    }
    return map;
  }, [definition.resources, resourceState]);

  const summaryStats = definition.summary ? definition.summary(resourceDataMap) : [];

  return (
    <div className={`workbench-page ${scope === "admin" ? "workbench-page-admin" : "workbench-page-account"}`}>
      {messageContext}

      <section className="workbench-hero panel">
        <Typography.Title level={3} className="workbench-title">
          {definition.title}
        </Typography.Title>
        <Typography.Paragraph className="workbench-subtitle">{definition.subtitle}</Typography.Paragraph>
      </section>

      {summaryStats.length > 0 ? (
        <section className="workbench-summary-grid">
          <Row gutter={[12, 12]}>
            {summaryStats.map((item) => (
              <Col key={item.label} xs={24} sm={12} md={8} lg={6}>
                <Card className="workbench-card workbench-summary-card" variant="outlined">
                  <Statistic title={item.label} value={item.value} />
                  {item.help ? <p className="workbench-summary-help">{item.help}</p> : null}
                </Card>
              </Col>
            ))}
          </Row>
        </section>
      ) : null}

      <section className="workbench-resource-list">
        {definition.resources.map((resource) => {
          const state = resourceState[resource.key];
          const values = resourceValues[resource.key] || {};
          return (
            <Card
              key={resource.key}
              className="workbench-card"
              title={resource.title}
              extra={
                <Space>
                  <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      void loadResource(resource);
                    }}
                  >
                    Refresh
                  </Button>
                </Space>
              }
            >
              {resource.description ? <p className="workbench-card-description">{resource.description}</p> : null}

              {resource.fields && resource.fields.length > 0 ? (
                <>
                  <div className="workbench-field-grid">
                    {resource.fields.map((field) => (
                      <label key={`${resource.key}-${field.key}`} className="workbench-field">
                        <span>
                          {field.label}
                          {field.required ? " *" : ""}
                        </span>
                        <FieldEditor
                          field={field}
                          value={values[field.key]}
                          onChange={(next) => {
                            setResourceValues((previous) => ({
                              ...previous,
                              [resource.key]: {
                                ...(previous[resource.key] || {}),
                                [field.key]: next
                              }
                            }));
                          }}
                        />
                      </label>
                    ))}
                  </div>

                  <Space className="workbench-card-actions">
                    <Button
                      type="primary"
                      onClick={() => {
                        void loadResource(resource);
                      }}
                    >
                      Load
                    </Button>
                  </Space>

                  <Divider className="workbench-divider" />
                </>
              ) : null}

              {state?.loading ? (
                <div className="workbench-loading">
                  <Spin size="small" />
                </div>
              ) : null}

              {state?.error ? <Alert type="error" showIcon message={state.error} /> : null}

              {state?.data !== undefined ? <PayloadView payload={state.data} /> : <p className="workbench-empty">No data loaded.</p>}

              {state?.path ? <p className="workbench-path">Endpoint: {state.path}</p> : null}
            </Card>
          );
        })}
      </section>

      {definition.actions && definition.actions.length > 0 ? (
        <section className="workbench-action-list">
          <h3>Actions</h3>
          <Row gutter={[12, 12]}>
            {definition.actions.map((action) => {
              const values = actionValues[action.key] || {};
              const state = actionState[action.key];
              return (
                <Col key={action.key} xs={24} lg={12}>
                  <Card className="workbench-card" title={action.title}>
                    {action.description ? <p className="workbench-card-description">{action.description}</p> : null}

                    {action.fields && action.fields.length > 0 ? (
                      <div className="workbench-field-grid">
                        {action.fields.map((field) => (
                          <label key={`${action.key}-${field.key}`} className="workbench-field">
                            <span>
                              {field.label}
                              {field.required ? " *" : ""}
                            </span>
                            <FieldEditor
                              field={field}
                              value={values[field.key]}
                              onChange={(next) => {
                                setActionValues((previous) => ({
                                  ...previous,
                                  [action.key]: {
                                    ...(previous[action.key] || {}),
                                    [field.key]: next
                                  }
                                }));
                              }}
                            />
                          </label>
                        ))}
                      </div>
                    ) : null}

                    <Space className="workbench-card-actions">
                      <Button
                        type="primary"
                        loading={Boolean(state?.loading)}
                        onClick={() => {
                          void runAction(action);
                        }}
                      >
                        {action.submitText || "Run"}
                      </Button>
                    </Space>

                    {state?.error ? <Alert type="error" showIcon message={state.error} /> : null}
                    {state?.data !== undefined ? <PayloadView payload={state.data} /> : null}
                  </Card>
                </Col>
              );
            })}
          </Row>
        </section>
      ) : null}
    </div>
  );
}

export { buildPathWithQuery };
