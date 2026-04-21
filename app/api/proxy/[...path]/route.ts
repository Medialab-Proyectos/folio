import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://34.233.63.96:8001';
const DEAD_DOMAIN = 'http://34.233.63.96:8001';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, (await params).path);
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, (await params).path);
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, (await params).path);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, (await params).path);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, (await params).path);
}

async function readBodyAsBlob(
  stream: ReadableStream<Uint8Array> | null,
): Promise<Blob | undefined> {
  if (!stream) return undefined;
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value && value.byteLength > 0) {
        const copy = new Uint8Array(value.byteLength);
        copy.set(value);
        chunks.push(copy);
      }
    }
  } finally {
    reader.releaseLock();
  }
  if (chunks.length === 0) return undefined;
  return new Blob(chunks);
}

async function proxyRequest(req: NextRequest, pathSegments: string[]) {
  // Build target URL — same approach as the working v2
  const targetUrl = `${BACKEND_URL}/${pathSegments.join('/')}${req.nextUrl.search}`;

  // Forward all headers except hop-by-hop ones
  const forwardHeaders: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (!['host', 'connection', 'transfer-encoding'].includes(key.toLowerCase())) {
      forwardHeaders[key] = value;
    }
  });

  let body: Blob | undefined;
  if (!['GET', 'HEAD'].includes(req.method)) {
    body = await readBodyAsBlob(req.body);
  }

  try {
    // Use redirect: 'manual' so we can intercept any redirect to the dead domain
    let backendRes = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
      redirect: 'manual',
    });

    // Follow redirects ourselves, rewriting the dead domain to BACKEND_URL
    let redirects = 0;
    while ([301, 302, 303, 307, 308].includes(backendRes.status) && redirects < 5) {
      let location = backendRes.headers.get('location');
      if (!location) break;
      // Kill any reference to the dead domain
      location = location.replace(DEAD_DOMAIN, BACKEND_URL);
      // Handle relative redirects
      if (!location.startsWith('http')) {
        location = `${BACKEND_URL}${location.startsWith('/') ? '' : '/'}${location}`;
      }
      backendRes = await fetch(location, {
        method: req.method,
        headers: forwardHeaders,
        body,
        redirect: 'manual',
      });
      redirects++;
    }

    // Strip any location header pointing to the dead domain from the final response
    const resHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
      if (['transfer-encoding', 'connection'].includes(key.toLowerCase())) return;
      if (key.toLowerCase() === 'location') {
        resHeaders.set(key, value.replace(DEAD_DOMAIN, BACKEND_URL));
      } else {
        resHeaders.set(key, value);
      }
    });
    // Prevent browser from caching any redirects
    resHeaders.set('Cache-Control', 'no-store');

    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      headers: resHeaders,
    });
  } catch (err) {
    console.error('[proxy] Error forwarding request to backend:', err);
    return NextResponse.json(
      { detail: 'Proxy error: could not reach backend' },
      { status: 502 },
    );
  }
}
