

# Plan: Recreate the `health-chat` Edge Function

## Important Note on API Key

Your project already has **Lovable AI** configured (the `LOVABLE_API_KEY` secret is present). This provides access to high-quality AI models (Google Gemini, OpenAI GPT-5) without needing a separate OpenAI API key. The plan below uses Lovable AI, saving you the cost and hassle of managing a separate key.

If you still prefer to use your own OpenAI key instead, let me know after reviewing.

## What Will Be Built

A single edge function at `supabase/functions/health-chat/index.ts` that:

1. **Validates the JWT** from the Authorization header to identify the user
2. **Rate limits** using the existing `check_and_increment_chat_rate_limit` database function (15 req/60s)
3. **Validates input**: mode must be one of `cycle`, `pregnancy`, `menopause`; max 50 messages, 2000 chars each; cycleDay 1-100, cycleLength 15-90
4. **Sanitizes messages** by stripping HTML tags and control characters, whitelisting role to `user`/`assistant`
5. **Calls Lovable AI Gateway** (`https://ai.gateway.lovable.dev/v1/chat/completions`) with a mode-specific system prompt tailored to cycle tracking, pregnancy, or menopause
6. **Streams the response** back via SSE (Server-Sent Events) — matching exactly what the existing frontend expects
7. **Handles errors** gracefully (429 rate limit, 402 payment required, sanitized error messages)

## Technical Details

- **File created**: `supabase/functions/health-chat/index.ts`
- **Secrets used**: `LOVABLE_API_KEY` (already configured), `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- **Model**: `google/gemini-3-flash-preview` (fast, capable, good for health Q&A)
- **CORS**: Full headers for browser compatibility
- **No config.toml changes needed** — Lovable-managed functions deploy with `verify_jwt = false` by default; JWT validation is done in code
- **Deployed automatically** after creation via the deploy tool

