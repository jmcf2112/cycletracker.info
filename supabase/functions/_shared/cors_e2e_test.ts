// End-to-end CORS preflight tests against the deployed edge functions.
// Hits real https://<project>.supabase.co/functions/v1/<fn> over the network
// and verifies that allowed Origins get Access-Control-Allow-Origin echoed
// back, while disallowed Origins are rejected with 403.
//
// Run via supabase--test_edge_functions (allow-net + allow-env).

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import {
  assert,
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
assert(SUPABASE_URL, "VITE_SUPABASE_URL must be set in .env");

const FUNCTIONS_BASE = `${SUPABASE_URL}/functions/v1`;

const BROWSER_FUNCTIONS = [
  "create-payment",
  "health-chat",
  "send-notification",
  "send-transactional-email",
  "handle-email-unsubscribe",
];

const ALLOWED_ORIGINS = [
  "https://www.cycletracker.info",
  "https://cycletracker.info",
  "https://cycletracker-v2.lovable.app",
  "https://id-preview--0a94c746-ff22-4c89-96bd-70ea14bc162e.lovable.app",
  "https://some-other-preview.lovable.app",
  "https://anything.lovable.dev",
  "http://localhost:5173",
];

const DISALLOWED_ORIGINS = [
  "https://evil.example.com",
  "https://attacker.test",
  "https://lovable.app.attacker.com", // suffix-spoof attempt
  "https://notcycletracker.info",
];

async function preflight(
  fn: string,
  origin: string,
  requestHeaders = "authorization, content-type",
): Promise<Response> {
  return await fetch(`${FUNCTIONS_BASE}/${fn}`, {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": requestHeaders,
    },
  });
}

for (const fn of BROWSER_FUNCTIONS) {
  Deno.test(`E2E ${fn}: allowed origins receive ACAO echo on preflight`, async () => {
    for (const origin of ALLOWED_ORIGINS) {
      const res = await preflight(fn, origin);
      await res.body?.cancel();
      assert(
        res.status === 200 || res.status === 204,
        `${fn} <- ${origin}: expected 2xx, got ${res.status}`,
      );
      const acao = res.headers.get("access-control-allow-origin");
      assertEquals(
        acao,
        origin,
        `${fn} <- ${origin}: expected ACAO=${origin}, got ${acao}`,
      );
      const vary = res.headers.get("vary") ?? "";
      assert(
        vary.split(",").map((s) => s.trim()).includes("Origin"),
        `${fn} <- ${origin}: Vary must include Origin, got "${vary}"`,
      );
      const acah = res.headers.get("access-control-allow-headers") ?? "";
      const allowedHeaderSet = new Set(
        acah.split(",").map((s) => s.trim().toLowerCase()),
      );
      assert(
        allowedHeaderSet.has("authorization") && allowedHeaderSet.has("content-type"),
        `${fn} <- ${origin}: ACAH must include authorization and content-type, got "${acah}"`,
      );
    }
  });

  Deno.test(`E2E ${fn}: disallowed origins are rejected at preflight`, async () => {
    for (const origin of DISALLOWED_ORIGINS) {
      const res = await preflight(fn, origin);
      await res.body?.cancel();
      // Either an explicit 403 from our handler, OR a 2xx with no ACAO
      // (which still blocks the browser). Reject anything that echoes ACAO.
      const acao = res.headers.get("access-control-allow-origin");
      assert(
        acao !== origin && acao !== "*",
        `${fn} <- ${origin}: disallowed origin must NOT be echoed (got ACAO=${acao}, status=${res.status})`,
      );
      assertEquals(
        res.status,
        403,
        `${fn} <- ${origin}: expected 403, got ${res.status}`,
      );
    }
  });

  Deno.test(`E2E ${fn}: missing Origin (server-to-server) preflight succeeds`, async () => {
    const res = await fetch(`${FUNCTIONS_BASE}/${fn}`, {
      method: "OPTIONS",
      headers: { "Access-Control-Request-Method": "POST" },
    });
    await res.body?.cancel();
    assert(
      res.status === 200 || res.status === 204,
      `${fn} no-origin preflight: expected 2xx, got ${res.status}`,
    );
    assertEquals(res.headers.get("access-control-allow-origin"), null);
  });
}

Deno.test("E2E sanity: functions base URL reachable", async () => {
  const res = await fetch(`${FUNCTIONS_BASE}/${BROWSER_FUNCTIONS[0]}`, {
    method: "OPTIONS",
    headers: { Origin: ALLOWED_ORIGINS[0] },
  });
  await res.body?.cancel();
  assertExists(res);
});
