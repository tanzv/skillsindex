"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ErrorState } from "@/src/components/shared/ErrorState";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { clientFetchJSON } from "@/src/lib/http/clientFetch";
import { resolveRequestErrorDisplayMessage } from "@/src/lib/http/requestErrors";

import type { ActionDefinition, FieldDefinition, ResourceDefinition, WorkbenchDefinition } from "./types";
import { buildBFFPath } from "./utils";

interface ConsoleWorkbenchProps {
  definition: WorkbenchDefinition;
  scope: "admin" | "account";
}

interface RequestState {
  loading: boolean;
  error: string;
  data: unknown;
  path: string;
}

function buildInitialValues(fields: FieldDefinition[] | undefined): Record<string, unknown> {
  return Object.fromEntries((fields || []).map((field) => [field.key, field.defaultValue ?? (field.type === "switch" ? false : "")]));
}

function normalizePayload(values: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== "" && value !== undefined && value !== null));
}

function renderField(
  field: FieldDefinition,
  values: Record<string, unknown>,
  onChange: (key: string, value: unknown) => void
) {
  const value = values[field.key];

  if (field.type === "textarea") {
    return (
      <textarea
        className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        value={String(value ?? "")}
        placeholder={field.placeholder}
        onChange={(event) => onChange(field.key, event.target.value)}
      />
    );
  }

  if (field.type === "switch") {
    return (
      <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(field.key, event.target.checked)} />
        <span>{field.label}</span>
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <select
        className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        value={String(value ?? "")}
        onChange={(event) => onChange(field.key, event.target.value)}
      >
        {(field.options || []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <Input
      type={field.type === "number" ? "number" : field.type === "password" ? "password" : "text"}
      value={String(value ?? "")}
      min={field.min}
      max={field.max}
      step={field.step}
      placeholder={field.placeholder}
      onChange={(event) => onChange(field.key, field.type === "number" ? event.target.valueAsNumber || event.target.value : event.target.value)}
    />
  );
}

export function ConsoleWorkbench({ definition, scope }: ConsoleWorkbenchProps) {
  const resourceInitialValues = useMemo(
    () => Object.fromEntries(definition.resources.map((resource) => [resource.key, buildInitialValues(resource.fields)])),
    [definition.resources]
  );
  const actionInitialValues = useMemo(
    () => Object.fromEntries((definition.actions || []).map((action) => [action.key, buildInitialValues(action.fields)])),
    [definition.actions]
  );

  const [resourceValues, setResourceValues] = useState<Record<string, Record<string, unknown>>>(resourceInitialValues);
  const [resourceStates, setResourceStates] = useState<Record<string, RequestState>>({});
  const [actionValues, setActionValues] = useState<Record<string, Record<string, unknown>>>(actionInitialValues);
  const [actionStates, setActionStates] = useState<Record<string, RequestState>>({});
  const resourceValuesRef = useRef(resourceValues);
  const actionValuesRef = useRef(actionValues);

  useEffect(() => {
    setResourceValues(resourceInitialValues);
    setActionValues(actionInitialValues);
  }, [actionInitialValues, resourceInitialValues]);

  useEffect(() => {
    resourceValuesRef.current = resourceValues;
  }, [resourceValues]);

  useEffect(() => {
    actionValuesRef.current = actionValues;
  }, [actionValues]);

  const loadResource = useCallback(async (resource: ResourceDefinition, valuesOverride?: Record<string, unknown>) => {
    const values = valuesOverride || resourceValuesRef.current[resource.key] || {};
    const path = resource.buildPath(values);

    if (!path) {
      setResourceStates((current) => ({
        ...current,
        [resource.key]: { loading: false, error: "Missing required query fields.", data: null, path: "" }
      }));
      return;
    }

    setResourceStates((current) => ({
      ...current,
      [resource.key]: { loading: true, error: "", data: current[resource.key]?.data ?? null, path }
    }));

    try {
      const data = await clientFetchJSON(buildBFFPath(path));
      setResourceStates((current) => ({
        ...current,
        [resource.key]: { loading: false, error: "", data, path }
      }));
    } catch (error) {
      setResourceStates((current) => ({
        ...current,
        [resource.key]: {
          loading: false,
          error: resolveRequestErrorDisplayMessage(error, "Request failed"),
          data: current[resource.key]?.data ?? null,
          path
        }
      }));
    }
  }, []);

  const runAction = useCallback(async (action: ActionDefinition) => {
    const values = actionValuesRef.current[action.key] || {};
    const path = action.buildPath(values);

    if (!path) {
      setActionStates((current) => ({
        ...current,
        [action.key]: { loading: false, error: "Missing required action parameters.", data: null, path: "" }
      }));
      return;
    }

    setActionStates((current) => ({
      ...current,
      [action.key]: { loading: true, error: "", data: current[action.key]?.data ?? null, path }
    }));

    try {
      const data =
        action.method === "GET"
          ? await clientFetchJSON(buildBFFPath(path))
          : await clientFetchJSON(buildBFFPath(path), {
              method: "POST",
              body: action.buildPayload ? action.buildPayload(values) : normalizePayload(values)
            });

      setActionStates((current) => ({
        ...current,
        [action.key]: { loading: false, error: "", data, path }
      }));

      for (const resourceKey of action.refreshResources || []) {
        const resource = definition.resources.find((item) => item.key === resourceKey);
        if (resource) {
          await loadResource(resource);
        }
      }
    } catch (error) {
      setActionStates((current) => ({
        ...current,
        [action.key]: { loading: false, error: resolveRequestErrorDisplayMessage(error, "Action failed"), data: null, path }
      }));
    }
  }, [definition.resources, loadResource]);

  useEffect(() => {
    definition.resources
      .filter((resource) => resource.autoLoad !== false)
      .forEach((resource) => {
        void loadResource(resource, resourceInitialValues[resource.key] || {});
      });
  }, [definition.resources, loadResource, resourceInitialValues]);

  const summaryStats = definition.summary
    ? definition.summary(
        Object.fromEntries(definition.resources.map((resource) => [resource.key, resourceStates[resource.key]?.data]).filter(([, data]) => data !== undefined))
      )
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">{scope}</div>
              <CardTitle>{definition.title}</CardTitle>
              <CardDescription>{definition.subtitle}</CardDescription>
            </div>
            <Badge variant="outline">{definition.resources.length} resources</Badge>
          </div>
        </CardHeader>
      </Card>

      {summaryStats.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryStats.map((item) => (
            <Card key={item.label}>
              <CardHeader>
                <CardDescription>{item.label}</CardDescription>
                <CardTitle>{item.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          {definition.resources.map((resource) => {
            const state = resourceStates[resource.key];
            const values = resourceValues[resource.key] || {};

            return (
              <Card key={resource.key}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle>{resource.title}</CardTitle>
                      {resource.description ? <CardDescription>{resource.description}</CardDescription> : null}
                    </div>
                    <Button variant="outline" onClick={() => void loadResource(resource)}>
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resource.fields?.length ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {resource.fields.map((field) => (
                        <div key={field.key} className="space-y-2">
                          <div className="text-sm font-medium text-slate-700">{field.label}</div>
                          {renderField(field, values, (key, value) =>
                            setResourceValues((current) => ({ ...current, [resource.key]: { ...values, [key]: value } }))
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {state?.error ? <ErrorState description={state.error} /> : null}
                  {state?.loading ? <p className="text-sm text-slate-500">Loading...</p> : null}
                  <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                    {JSON.stringify(state?.data ?? {}, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="space-y-6">
          {(definition.actions || []).map((action) => {
            const values = actionValues[action.key] || {};
            const state = actionStates[action.key];

            return (
              <Card key={action.key}>
                <CardHeader>
                  <CardTitle>{action.title}</CardTitle>
                  {action.description ? <CardDescription>{action.description}</CardDescription> : null}
                </CardHeader>
                <CardContent className="space-y-4">
                  {action.fields?.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <div className="text-sm font-medium text-slate-700">{field.label}</div>
                      {renderField(field, values, (key, value) =>
                        setActionValues((current) => ({ ...current, [action.key]: { ...values, [key]: value } }))
                      )}
                    </div>
                  ))}
                  {state?.error ? <ErrorState description={state.error} /> : null}
                  <Button className="w-full" onClick={() => void runAction(action)} disabled={Boolean(state?.loading)}>
                    {state?.loading ? "Running..." : action.submitText || action.title}
                  </Button>
                  {state?.data ? (
                    <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                      {JSON.stringify(state.data, null, 2)}
                    </pre>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
