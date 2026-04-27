import { readFileSync } from "node:fs";
import path from "node:path";

import { expect } from "vitest";

export interface FileContentContract {
  requiredSnippets?: readonly string[];
  forbiddenSnippets?: readonly string[];
}

export interface RouteEntrypointContract {
  requiredSnippets?: readonly string[];
  forbiddenSnippets?: readonly string[];
}

export function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

export function expectFileContract(relativePath: string, contract: FileContentContract): string {
  const source = readRepoFile(relativePath);

  expectFileContents(source, contract);

  return source;
}

export function expectFileContents(source: string, contract: FileContentContract): void {
  for (const snippet of contract.requiredSnippets || []) {
    expect(source).toContain(snippet);
  }

  for (const snippet of contract.forbiddenSnippets || []) {
    expect(source).not.toContain(snippet);
  }
}

export function expectFileContains(source: string, snippets: readonly string[]): void {
  expectFileContents(source, { requiredSnippets: snippets });
}

export function expectFileOmits(source: string, snippets: readonly string[]): void {
  expectFileContents(source, { forbiddenSnippets: snippets });
}

export function expectRouteEntrypoint(relativePath: string, contract: RouteEntrypointContract): string {
  return expectFileContract(relativePath, contract);
}
