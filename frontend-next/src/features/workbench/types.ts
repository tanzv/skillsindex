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
