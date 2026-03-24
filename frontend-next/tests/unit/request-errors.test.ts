import { describe, expect, it } from "vitest";

import { createRequestError, resolveRequestErrorDisplayMessage } from "@/src/lib/http/requestErrors";

describe("requestErrors", () => {
  it("keeps both message and error code on request errors", () => {
    const error = createRequestError(401, {
      code: "unauthorized",
      message: "Invalid username or password"
    });

    expect(error.status).toBe(401);
    expect(error.code).toBe("unauthorized");
    expect(error.message).toBe("Invalid username or password");
  });

  it("falls back to safe copy for unknown backend failures", () => {
    const error = createRequestError(500, {
      code: "query_failed",
      message: "sql: connection refused for tenant shard"
    });

    expect(resolveRequestErrorDisplayMessage(error, "Failed to load data.")).toBe("Failed to load data.");
  });

  it("prefers mapped copy for structured request errors", () => {
    const error = createRequestError(403, {
      code: "csrf_validation_failed",
      message: "csrf validation failed"
    });

    expect(
      resolveRequestErrorDisplayMessage(error, "Failed to save changes.", {
        codeMessages: {
          csrf_validation_failed: "Your session verification expired. Refresh and try again."
        }
      })
    ).toBe("Your session verification expired. Refresh and try again.");
  });

  it("uses default safe copy for common infrastructure error codes", () => {
    expect(
      resolveRequestErrorDisplayMessage(
        createRequestError(503, {
          code: "backend_unreachable",
          message: "dial tcp 127.0.0.1:8080: connect: connection refused"
        }),
        "Failed to load data."
      )
    ).toBe("The service is temporarily unavailable. Try again shortly.");

    expect(
      resolveRequestErrorDisplayMessage(
        createRequestError(403, {
          code: "permission_denied",
          message: "viewer role cannot perform this action"
        }),
        "Failed to save changes."
      )
    ).toBe("You do not have permission to perform this action.");

    expect(
      resolveRequestErrorDisplayMessage(
        createRequestError(403, {
          code: "csrf_validation_failed",
          message: "csrf validation failed"
        }),
        "Failed to save changes."
      )
    ).toBe("Your session verification expired. Refresh and try again.");
  });
});
