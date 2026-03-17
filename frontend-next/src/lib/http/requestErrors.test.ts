import { describe, expect, it } from "vitest";

import { createRequestError } from "@/src/lib/http/requestErrors";

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
});
