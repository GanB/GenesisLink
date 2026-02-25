import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.API_PROXY_URL || "http://localhost:5050";

const ALLOWED_PREFIXES = [
  "/api/loan",
  "/api/payment",
  "/api/blockchain",
];

function isAllowedPath(path: string): boolean {
  return ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

async function proxyRequest(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (!isAllowedPath(path)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = `${BACKEND_URL}${path}${req.nextUrl.search}`;

  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (key !== "host" && key !== "cookie") headers[key] = value;
  });

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  try {
    const res = await fetch(url, init);
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
