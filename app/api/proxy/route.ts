import { z } from "zod";
import { isValidApiBaseUrl } from "@/lib/sanitize";

/**
 * Pure CORS proxy — forwards HTTP requests to external AI API endpoints.
 *
 * SECURITY: This route does NOT store API keys, request bodies, or response data.
 * It is a pure byte-level forwarder. Keys pass through server memory only for the
 * duration of the request and are never persisted.
 *
 * Protections:
 * - SSRF prevention: target URL must be HTTPS and not a private/internal address
 * - Rate limiting: 30 requests per minute per IP
 * - Method allowlist: only POST (AI chat completions are POST)
 */

// ── Rate limiter ──
interface RateLimitEntry {
  tokens: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { tokens: RATE_LIMIT_MAX_REQUESTS - 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.tokens--;
  return entry.tokens < 0;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 300_000);

// ── Request schema ──
const proxySchema = z.object({
  url: z.string().url(),
  method: z.literal("POST"),
  headers: z.record(z.string(), z.string()).default({}),
  body: z.string().optional(),
});

export async function POST(req: Request) {
  // Rate limiting
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(clientIp)) {
    return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  // Parse and validate request
  let parsed;
  try {
    parsed = proxySchema.safeParse(await req.json());
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!parsed.success) {
    return Response.json({ error: "Invalid request", details: parsed.error.flatten() }, { status: 400 });
  }

  const { url, method, headers, body } = parsed.data;

  // SSRF prevention — only allow HTTPS to non-internal addresses
  if (!isValidApiBaseUrl(url)) {
    return Response.json(
      { error: "Blocked: target URL must be HTTPS and not point to an internal address." },
      { status: 403 },
    );
  }

  // Forward the request — pure byte-level passthrough, no parsing/storage
  try {
    // Use the native fetch to forward — the returned Response object
    // (including its .body stream) is passed through directly so the
    // AI SDK can consume it exactly as if it had called fetch itself.
    const upstream = await fetch(url, {
      method,
      headers,
      body: body || undefined,
    });

    // Return the upstream Response directly. This preserves the stream,
    // status code, and all headers exactly as the AI API sent them.
    // We only need to copy headers explicitly because constructing a new
    // Response from upstream.body requires us to re-set headers.
    const responseHeaders = new Headers();
    for (const [key, value] of upstream.headers.entries()) {
      const lower = key.toLowerCase();
      // Skip hop-by-hop headers that shouldn't be forwarded.
      // CRITICAL: skip "content-encoding" and "content-length" — server-side
      // fetch already decompresses gzip/deflate, so forwarding these headers
      // would make the browser try to decompress already-decompressed data,
      // causing ERR_CONTENT_DECODING_FAILED.
      if (
        lower === "transfer-encoding" ||
        lower === "connection" ||
        lower === "keep-alive" ||
        lower === "content-encoding" ||
        lower === "content-length"
      ) {
        continue;
      }
      responseHeaders.set(key, value);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("[proxy] Forward failed:", err instanceof Error ? err.message : err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Proxy request failed" },
      { status: 502 },
    );
  }
}
