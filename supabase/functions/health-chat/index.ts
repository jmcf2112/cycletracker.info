import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_MODES = ["cycle", "pregnancy", "menopause"] as const;
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 2000;
const VALID_ROLES = ["user", "assistant"];

function sanitize(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .slice(0, MAX_MESSAGE_LENGTH);
}

function getSystemPrompt(mode: string, cycleDay: number | null, cycleLength: number): string {
  const base =
    "You are a knowledgeable and empathetic women's health assistant. " +
    "Provide helpful, evidence-based information. " +
    "Always recommend consulting a healthcare provider for medical concerns. " +
    "Never diagnose conditions or prescribe treatments. " +
    "Keep responses concise and supportive.";

  if (mode === "pregnancy") {
    return (
      base +
      "\n\nThe user is currently pregnant. Focus on pregnancy-related topics: " +
      "baby development by week, trimester-specific guidance, nutrition, exercise safety, " +
      "common pregnancy symptoms and when to contact a healthcare provider. " +
      "Be reassuring but always emphasize the importance of prenatal care."
    );
  }

  if (mode === "menopause") {
    return (
      base +
      "\n\nThe user is tracking menopause or perimenopause. Focus on: " +
      "stage-specific information, symptom management (hot flashes, night sweats, sleep issues), " +
      "HRT considerations (pros/cons, not recommendations), lifestyle modifications, " +
      "bone health, cardiovascular health, and emotional wellbeing during this transition."
    );
  }

  // cycle mode
  const cycleContext = cycleDay
    ? `\n\nThe user is on day ${cycleDay} of a ${cycleLength}-day cycle.`
    : `\n\nThe user has a typical cycle length of ${cycleLength} days.`;

  return (
    base +
    cycleContext +
    " Focus on menstrual cycle topics: cycle phases and what to expect, " +
    "symptom patterns and correlations, fertility window information, " +
    "PMS management, irregular cycles, and general reproductive health."
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Auth ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    // --- Rate limit ---
    try {
      const { data: rl, error: rlErr } = await supabase.rpc("check_and_increment_chat_rate_limit", {
        p_user_id: userId,
        p_max_requests: 15,
        p_window_seconds: 60,
      });

      if (!rlErr && rl && !(rl as any).allowed) {
        const resetIn = (rl as any).reset_in ?? 60;
        return new Response(
          JSON.stringify({ error: `Rate limit exceeded. Try again in ${resetIn} seconds.` }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } catch {
      // fail-open: allow request if rate limit check fails
      console.warn("Rate limit check failed, allowing request");
    }

    // --- Parse & validate body ---
    const body = await req.json();
    const { messages: rawMessages, mode, cycleDay, cycleLength } = body;

    if (!VALID_MODES.includes(mode)) {
      return new Response(JSON.stringify({ error: "Invalid mode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(rawMessages) || rawMessages.length === 0 || rawMessages.length > MAX_MESSAGES) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validCycleDay =
      cycleDay != null && typeof cycleDay === "number" && cycleDay >= 1 && cycleDay <= 100
        ? cycleDay
        : null;
    const validCycleLength =
      typeof cycleLength === "number" && cycleLength >= 15 && cycleLength <= 90 ? cycleLength : 28;

    // Sanitize messages
    const messages = rawMessages
      .filter((m: any) => VALID_ROLES.includes(m.role) && typeof m.content === "string")
      .map((m: any) => ({ role: m.role, content: sanitize(m.content) }));

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "No valid messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Call Lovable AI Gateway ---
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service is temporarily unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = getSystemPrompt(mode, validCycleDay, validCycleLength);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI service rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI gateway error:", aiResponse.status, await aiResponse.text());
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream SSE back to client
    return new Response(aiResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("health-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
