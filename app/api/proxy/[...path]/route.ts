import { NextRequest, NextResponse } from 'next/server';

// This runs on the server, so HTTP → backend is fine (no Mixed Content)
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://34.233.63.96:8001';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(req, path);
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(req, path);
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(req, path);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(req, path);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return proxyRequest(req, path);
}

async function proxyRequest(req: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join('/');
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND_URL}/${path}${search}`;

  // Forward relevant headers, strip host
  const forwardHeaders: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (!['host', 'connection', 'transfer-encoding'].includes(key.toLowerCase())) {
      forwardHeaders[key] = value;
    }
  });

  let body: BodyInit | undefined;
  if (!['GET', 'HEAD'].includes(req.method)) {
    // Stream the raw bytes — do NOT parse multipart/form-data and re-encode it.
    // Parsing changes the boundary, which causes "error parsing the body" on the backend.
    // Keep the original Content-Type header so the backend sees the correct boundary.
    const raw = await req.arrayBuffer();
    body = raw.byteLength > 0 ? raw : undefined;
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
    });

    const resHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        resHeaders.set(key, value);
      }
    });

    const resBody = await backendRes.arrayBuffer();
    return new NextResponse(resBody, {
      status: backendRes.status,
      headers: resHeaders,
    });
  } catch (err) {
    console.error('[proxy] Error forwarding request to backend:', err);
    return NextResponse.json({ detail: 'Proxy error: could not reach backend' }, { status: 502 });
  }
}
