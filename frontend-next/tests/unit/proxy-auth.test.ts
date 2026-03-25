import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server.js";

import { proxy } from "@/proxy";

describe("proxy auth redirects", () => {
  it("redirects localhost requests to the canonical loopback host", () => {
    const request = new NextRequest("http://localhost:3000/admin/skills?source=repository");

    const response = proxy(request);

    expect(response.headers.get("location")).toBe("http://127.0.0.1:3000/admin/skills?source=repository");
  });

  it("does not redirect the login route to workspace when only a stale session cookie is present", () => {
    const request = new NextRequest("http://127.0.0.1:3300/login", {
      headers: {
        cookie: "skillsindex_session=stale-token"
      }
    });

    const response = proxy(request);

    expect(response.headers.get("location")).not.toBe("http://127.0.0.1:3300/workspace");
    expect(response.headers.get("location")).not.toBe("/workspace");
  });
});
