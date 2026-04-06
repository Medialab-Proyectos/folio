import { NextRequest, NextResponse } from 'next/server';

// Allow up to 60s — AI image analysis endpoints can be slow
export const maxDuration = 60;

// Vercel serverless body-size limit — raise to 10 MB (default is 4.5 MB).
// This config is respected by the App Router runtime.
export const bodyParserSizeLimit = '10mb';

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
 * Safely drain a ReadableStream into a freshly-allocated Uint8Array.
 *
 * WHY:
 * In Vercel's Node.js serverless runtime the ArrayBuffer returned by
 * req.arrayBuffer() / res.arrayBuffer() is *transferred* (detached) by the
 * runtime shortly after the await resolves.  Any later .slice(), Buffer.from(),
 * or fetch() internals that touch it throw:
 *
 *   "Cannot perform ArrayBuffer.prototype.slice on a detached ArrayBuffer"
 *
 * Reading via getReader() yields independent Uint8Array chunks whose backing
 * memory is never detached.  We concatenate them into a *new* Uint8Array that
 * is entirely under our control.
 */
async function drainStream(
  stream: ReadableStream<Uint8Array> | null,
): Promise<Uint8Array | null> {
  if (!stream) return null;

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value && value.byteLength > 0) {
        chunks.push(value);
        totalLength += value.byteLength;
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (totalLength === 0) return null;

  // Build a single contiguous Uint8Array (NOT a Buffer, which wraps an
  // ArrayBuffer that some runtimes may detach when handed to fetch()).
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
  let body: Uint8Array | null = null;
  if (!['GET', 'HEAD'].includes(req.method)) {
    body = await drainStream(req.body);
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      // Passing Uint8Array is safe in all runtimes; avoid Buffer which may
      // reference a detachable ArrayBuffer.
      body: body ?? undefined,
      // @ts-expect-error — duplex is required for streaming request bodies in
      // some edge-runtime versions, harmless in Node.js runtime.
      duplex: 'half',
    });

    // ── Read backend response body safely ─────────────────────────────────
    const resBody = await drainStream(backendRes.body);

    const resHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        resHeaders.set(key, value);
      }
    });

    return new NextResponse(resBody, {
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
