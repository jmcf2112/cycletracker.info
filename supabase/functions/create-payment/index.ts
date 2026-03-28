import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TIERS: Record<string, string> = {
  small: "price_1T1FQG52JxoxrqKr9DY03od4",   // $3
  medium: "price_1T1FQf52JxoxrqKrkOS0zZbZ",   // $5
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
  );

  try {
    const body = await req.json();
    const { tier, customAmount } = body;

    // Determine line_items
    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];

    if (tier && TIERS[tier]) {
      lineItems = [{ price: TIERS[tier], quantity: 1 }];
    } else if (customAmount) {
      const cents = Math.round(Number(customAmount) * 100);
      if (!cents || cents < 100 || cents > 50000) {
        throw new Error("Amount must be between $1 and $500");
      }
      lineItems = [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Custom Tip" },
            unit_amount: cents,
          },
          quantity: 1,
        },
      ];
    } else {
      throw new Error("Invalid tier or amount");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Try to get authenticated user (optional for tips)
    let customerEmail: string | undefined;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      customerEmail = data.user?.email ?? undefined;
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/support?success=true`,
      cancel_url: `${req.headers.get("origin")}/support`,
    };

    if (customerEmail) {
      const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
      if (customers.data.length > 0) {
        sessionParams.customer = customers.data[0].id;
      } else {
        sessionParams.customer_email = customerEmail;
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
