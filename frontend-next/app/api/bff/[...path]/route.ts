import { NextRequest, NextResponse } from "next/server";

import { getRequestCookieHeader } from "@/src/lib/bff/cookies";
import { applyCSRFToken } from "@/src/lib/bff/csrf";
import { buildBackendProxyPath, buildProxyResponseHeaders } from "@/src/lib/bff/proxy";
import { fetchBackend } from "@/src/lib/http/backend";

interface ProxyRouteProps {
  params: Promise<{
    path: string[];
  }>;
}

function createProxyErrorResponse() {
  return NextResponse.json(
    {
      error: "backend_unreachable",
      message: "Failed to reach the backend service."
    },
    {
      status: 503
    }
  );
}

async function proxyRequest(request: NextRequest, params: ProxyRouteProps["params"]) {
  try {
    const resolvedParams = await params;
    const search = request.nextUrl.searchParams.toString();
    const backendPath = buildBackendProxyPath(resolvedParams.path, search);
    const cookieHeader = getRequestCookieHeader(request.headers);
    const method = request.method.toUpperCase();
    const headers = new Headers({
      accept: request.headers.get("accept") || "application/json"
    });

    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers.set("content-type", contentType);
    }

    const acceptLanguage = request.headers.get("accept-language");
    if (acceptLanguage) {
      headers.set("accept-language", acceptLanguage);
    }

    if (cookieHeader) {
      headers.set("cookie", cookieHeader);
    }
    applyCSRFToken(headers, method, cookieHeader);

    const requestBuffer =
      method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer().then((buffer) => (buffer.byteLength > 0 ? buffer : undefined));

    const backendResponse = await fetchBackend(backendPath, {
      method,
      headers,
      body: requestBuffer,
      cache: "no-store",
      redirect: "manual"
    });

    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      headers: buildProxyResponseHeaders(backendResponse.headers)
    });
  } catch {
    return createProxyErrorResponse();
  }
}

export async function GET(request: NextRequest, context: ProxyRouteProps) {
  return proxyRequest(request, context.params);
}

export async function POST(request: NextRequest, context: ProxyRouteProps) {
  return proxyRequest(request, context.params);
}

export async function PUT(request: NextRequest, context: ProxyRouteProps) {
  return proxyRequest(request, context.params);
}

export async function PATCH(request: NextRequest, context: ProxyRouteProps) {
  return proxyRequest(request, context.params);
}

export async function DELETE(request: NextRequest, context: ProxyRouteProps) {
  return proxyRequest(request, context.params);
}
