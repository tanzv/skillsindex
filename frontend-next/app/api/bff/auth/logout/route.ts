import { NextRequest, NextResponse } from "next/server";

import { getRequestCookieHeader } from "@/src/lib/bff/cookies";
import { applyCSRFToken } from "@/src/lib/bff/csrf";
import { appendSetCookieHeaders } from "@/src/lib/bff/proxy";
import { fetchBackend } from "@/src/lib/http/backend";

export async function POST(request: NextRequest) {
  const cookieHeader = getRequestCookieHeader(request.headers);
  const headers = new Headers({
    accept: "application/json"
  });

  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }
  applyCSRFToken(headers, "POST", cookieHeader);

  const response = await fetchBackend("/api/v1/auth/logout", {
    method: "POST",
    headers,
    cache: "no-store"
  });

  const responseText = await response.text();
  const responseHeaders = new Headers();
  const contentType = response.headers.get("content-type");
  if (contentType) {
    responseHeaders.set("content-type", contentType);
  }
  appendSetCookieHeaders(responseHeaders, response.headers);

  return new NextResponse(responseText, {
    status: response.status,
    headers: responseHeaders
  });
}
