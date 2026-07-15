import Stripe from "npm:stripe@14";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-04-10",
});

const PRICES: Record<string, string> = {
  monthly: "price_1TlJtoEtlIXbMcJ2c5VP38iT",
  yearly:  "price_1TlJtwEtlIXbMcJ22ft014Gi",
};

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { plan = "monthly", email, successUrl, cancelUrl } = await req.json();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email || undefined,
      line_items: [{ price: PRICES[plan] || PRICES.monthly, quantity: 1 }],
      subscription_data: { trial_period_days: 7 },
      success_url: successUrl || "https://contentaipro.ai/welcome?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: cancelUrl || "https://contentaipro.ai/pricing",
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), { headers: cors });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: cors });
  }
});
