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
 * Read the request body stream into a Blob that is safe to hand to fetch().
 *
 * WHY:
 * In Vercel's serverless runtime, Node.js built-in fetch (undici) internally
 * calls `ArrayBuffer.prototype.slice()` when the body is a Uint8Array, Buffer,
 * or ArrayBuffer.  If the runtime has detached (transferred) the backing
 * ArrayBuffer, this throws:
 *
 *   "Cannot perform ArrayBuffer.prototype.slice on a detached ArrayBuffer"
 *
 * Blob bodies follow a completely different code path inside undici — the data
 * is read via Blob.stream() and never touches ArrayBuffer.prototype.slice.
 *
 * We read the incoming stream chunk-by-chunk (so we never call
 * req.arrayBuffer()), immediately copy each chunk into a private Uint8Array,
 * and wrap the result in a Blob.  The Blob makes its own internal copy of the
 * data, so nothing can be detached.
 */
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
        // Copy immediately — the runtime can detach `value`'s buffer at any time
        const copy = new Uint8Array(value.byteLength);
        copy.set(value);
        chunks.push(copy);
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (chunks.length === 0) return undefined;

  // Blob copies the data internally — safe from detachment forever
  return new Blob(chunks);
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

  // ── Read incoming request body safely into a Blob ───────────────────────
  let body: Blob | undefined;
  if (!['GET', 'HEAD'].includes(req.method)) {
    body = await readBodyAsBlob(req.body);
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      // Blob body avoids undici's ArrayBuffer.slice() code path entirely
      body,
    });

    // ── Stream backend response directly — no arrayBuffer() call ──────────
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
