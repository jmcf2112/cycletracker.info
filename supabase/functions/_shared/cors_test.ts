import {
  assertEquals,
  assertExists,
  assert,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildCorsHeaders, handlePreflight } from "./cors.ts";

const ALLOWED = [
  "https://www.cycletracker.info",
  "https://cycletracker.info",
  "https://cycletracker-v2.lovable.app",
  "https://id-preview--0a94c746-ff22-4c89-96bd-70ea14bc162e.lovable.app",
  "https://some-random-preview.lovable.app",
  "https://anything.lovable.dev",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
];

const DISALLOWED = [
  "https://evil.example.com",
  "https://lovable.app.attacker.com",
  "https://notcycletracker.info",
  "http://malicious.test",
];

function makeReq(method: string, origin?: string): Request {
  const headers: Record<string, string> = {};
  if (origin) headers["origin"] = origin;
  return new Request("https://example.functions.supabase.co/x", {
    method,
    headers,
  });
}

Deno.test("buildCorsHeaders echoes allowed origins", () => {
  for (const origin of ALLOWED) {
    const headers = buildCorsHeaders(makeReq("POST", origin));
    assertEquals(
      headers["Access-Control-Allow-Origin"],
      origin,
      `expected origin echoed for ${origin}`,
    );
    assertEquals(headers["Vary"], "Origin");
  }
});

Deno.test("buildCorsHeaders omits ACAO for disallowed origins", () => {
  for (const origin of DISALLOWED) {
    const headers = buildCorsHeaders(makeReq("POST", origin));
    assertEquals(
      headers["Access-Control-Allow-Origin"],
      undefined,
      `expected no ACAO for ${origin}`,
    );
  }
});

Deno.test("buildCorsHeaders omits ACAO when no origin (server-to-server)", () => {
  const headers = buildCorsHeaders(makeReq("POST"));
  assertEquals(headers["Access-Control-Allow-Origin"], undefined);
});

Deno.test("handlePreflight returns 204 with ACAO for allowed origins", async () => {
  for (const origin of ALLOWED) {
    const res = handlePreflight(makeReq("OPTIONS", origin));
    assertExists(res, `expected preflight response for ${origin}`);
    assert(res!.status === 200 || res!.status === 204, `status for ${origin}: ${res!.status}`);
    assertEquals(res!.headers.get("Access-Control-Allow-Origin"), origin);
    await res!.body?.cancel();
  }
});

Deno.test("handlePreflight returns 403 for disallowed origins", async () => {
  for (const origin of DISALLOWED) {
    const res = handlePreflight(makeReq("OPTIONS", origin));
    assertExists(res, `expected response for ${origin}`);
    assertEquals(res!.status, 403, `expected 403 for ${origin}`);
    await res!.text();
  }
});

Deno.test("handlePreflight returns null for non-OPTIONS requests", () => {
  for (const method of ["GET", "POST", "PUT", "DELETE"]) {
    assertEquals(handlePreflight(makeReq(method, "https://evil.com")), null);
  }
});

Deno.test("handlePreflight allows preflight with no origin (server-to-server)", async () => {
  const res = handlePreflight(makeReq("OPTIONS"));
  assertExists(res);
  assert(res!.status === 200 || res!.status === 204);
  await res!.body?.cancel();
});

// Per-function smoke tests: each browser-facing function must use the shared
// helper, so a disallowed Origin preflight should be rejected with 403.
const BROWSER_FUNCTIONS = [
  "create-payment",
  "health-chat",
  "send-notification",
  "send-transactional-email",
  "handle-email-unsubscribe",
];

for (const fn of BROWSER_FUNCTIONS) {
  Deno.test(`${fn} imports shared CORS helper`, async () => {
    const src = await Deno.readTextFile(
      new URL(`../${fn}/index.ts`, import.meta.url),
    );
    assert(
      src.includes('from "../_shared/cors.ts"') ||
        src.includes("from '../_shared/cors.ts'"),
      `${fn} should import from ../_shared/cors.ts`,
    );
    assert(
      src.includes("handlePreflight("),
      `${fn} should call handlePreflight`,
    );
    assert(
      src.includes("buildCorsHeaders("),
      `${fn} should call buildCorsHeaders`,
    );
  });
}
