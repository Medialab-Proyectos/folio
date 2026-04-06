import { NextRequest, NextResponse } from 'next/server';

// Allow up to 60s — AI image analysis endpoints can be slow
export const maxDuration = 60;

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://34.233.63.96:8001';

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

/**
 * Safely read the full request body into a fresh Uint8Array.
 *
 * We **copy** every chunk the moment we receive it so that even runtimes which
 * detach or recycle the backing ArrayBuffer between reads cannot affect us.
 * The final concatenation produces a brand-new Uint8Array whose ArrayBuffer is
 * entirely owned by us — safe to pass to fetch(), Buffer.from(), etc.
 */
async function safeReadBody(
  stream: ReadableStream<Uint8Array> | null,
): Promise<Uint8Array | undefined> {
  if (!stream) return undefined;

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value && value.byteLength > 0) {
        // Immediately copy into a private buffer so no runtime can reclaim it
        const copy = new Uint8Array(value.byteLength);
        copy.set(value);
        chunks.push(copy);
        totalLength += copy.byteLength;
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (totalLength === 0) return undefined;

  // Single contiguous Uint8Array — NOT a Buffer (avoids detachable AB issues)
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

async function proxyRequest(req: NextRequest, pathSegments: string[]) {
  const targetUrl = `${BACKEND_URL}/${pathSegments.join('/')}${req.nextUrl.search}`;

  // Forward all headers except hop-by-hop ones
  const forwardHeaders: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (!['host', 'connection', 'transfer-encoding'].includes(key.toLowerCase())) {
      forwardHeaders[key] = value;
    }
  });

  // ── Read incoming request body safely ───────────────────────────────────
  let body: Uint8Array | undefined;
  if (!['GET', 'HEAD'].includes(req.method)) {
    body = await safeReadBody(req.body);
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
      // @ts-expect-error — duplex required by Node 18+ when body is present
      duplex: 'half',
    });

    // ── Stream backend response directly — no arrayBuffer() call ──────────
    // Passing the response body stream straight to NextResponse avoids
    // materializing any ArrayBuffer on the response path.
    const resHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        resHeaders.set(key, value);
      }
    });

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
