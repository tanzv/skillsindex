import { NextRequest, NextResponse } from "next/server";

import { getRequestCookieHeader, getSetCookieHeaders } from "@/src/lib/bff/cookies";
import { appendSetCookieHeaders, mergeCookieHeaders } from "@/src/lib/bff/proxy";
import { fetchBackend } from "@/src/lib/http/backend";

interface CSRFResponse {
  csrf_token?: string;
}

export async function POST(request: NextRequest) {
  const requestCookieHeader = getRequestCookieHeader(request.headers);
  const csrfHeaders = new Headers({
    accept: "application/json"
  });

  if (requestCookieHeader) {
    csrfHeaders.set("cookie", requestCookieHeader);
  }

  const csrfResponse = await fetchBackend("/api/v1/auth/csrf", {
    method: "GET",
    headers: csrfHeaders,
    cache: "no-store"
  });

  const csrfPayload = (await csrfResponse.json()) as CSRFResponse;
  const csrfToken = String(csrfPayload.csrf_token || "").trim();
  if (!csrfResponse.ok || !csrfToken) {
    return NextResponse.json(
      {
        error: "csrf_token_failed",
        message: "Failed to initialize CSRF token."
      },
      {
        status: csrfResponse.status || 500
      }
    );
  }

  const requestBody = await request.text();
  const loginHeaders = new Headers({
    accept: "application/json",
    "content-type": request.headers.get("content-type") || "application/json",
    "x-csrf-token": csrfToken
  });
  const mergedCookieHeader = mergeCookieHeaders(requestCookieHeader, getSetCookieHeaders(csrfResponse.headers));
  if (mergedCookieHeader) {
    loginHeaders.set("cookie", mergedCookieHeader);
  }

  const loginResponse = await fetchBackend("/api/v1/auth/login", {
    method: "POST",
    headers: loginHeaders,
    body: requestBody,
    cache: "no-store"
  });

  const responseText = await loginResponse.text();
  const responseHeaders = new Headers();
  const contentType = loginResponse.headers.get("content-type");
  if (contentType) {
    responseHeaders.set("content-type", contentType);
  }

  appendSetCookieHeaders(responseHeaders, csrfResponse.headers);
  appendSetCookieHeaders(responseHeaders, loginResponse.headers);

  return new NextResponse(responseText, {
    status: loginResponse.status,
    headers: responseHeaders
  });
}
