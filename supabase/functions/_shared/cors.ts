// Shared CORS helper. Echoes the request Origin only when it's in the allowlist,
// preventing arbitrary cross-origin sites from invoking these functions from a browser.
// Server-to-server callers (no Origin header) are unaffected.

const ALLOWED_ORIGINS = new Set<string>([
  "https://www.cycletracker.info",
  "https://cycletracker.info",
  "https://cycletracker-v2.lovable.app",
  "https://id-preview--0a94c746-ff22-4c89-96bd-70ea14bc162e.lovable.app",
]);

// Allow Lovable preview subdomains (id-preview--<uuid>.lovable.app, *.lovable.dev) and localhost dev.
function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const u = new URL(origin);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return true;
    if (u.hostname.endsWith(".lovable.app") || u.hostname.endsWith(".lovable.dev")) return true;
  } catch {
    return false;
  }
  return false;
}

const BASE_ALLOWED_HEADERS =
  "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version";

export function buildCorsHeaders(
  req: Request,
  extraAllowedHeaders = "",
): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowedHeaders = extraAllowedHeaders
    ? `${BASE_ALLOWED_HEADERS}, ${extraAllowedHeaders}`
    : BASE_ALLOWED_HEADERS;

  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": allowedHeaders,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (origin && isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  // If origin not allowed (or absent), we simply omit the header — browsers will block,
  // server-to-server callers (no Origin) are unaffected.

  return headers;
}

export function handlePreflight(req: Request): Response | null {
  if (req.method !== "OPTIONS") return null;
  const origin = req.headers.get("origin") ?? "";
  if (origin && !isAllowedOrigin(origin)) {
    // Reject disallowed origins at preflight
    return new Response("Forbidden", { status: 403 });
  }
  return new Response(null, { headers: buildCorsHeaders(req) });
}

export { isAllowedOrigin, ALLOWED_ORIGINS };
