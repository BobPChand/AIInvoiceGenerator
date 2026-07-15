// Stripe Checkout for AI Invoice Generator
Deno.serve(async (req: Request): Promise<Response> => {
  const cors = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { default: Stripe } = await import("npm:stripe@14");
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-04-10" });

    const { plan = "monthly", email, success_url, cancel_url } = await req.json();

    const PRICES: Record<string, string> = {
      monthly: "price_1TmbqHEtlIXbMcJ2ZSKExMY6",
      yearly: "price_1TmbqHEtlIXbMcJ2TWduRpD6",
    };

    const priceId = PRICES[plan];
    if (!priceId) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), { status: 400, headers: cors });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 7 },
      customer_email: email || undefined,
      success_url: success_url || "https://ai-invoice-generator.expo.app/?success=true",
      cancel_url: cancel_url || "https://ai-invoice-generator.expo.app/?canceled=true",
      metadata: { app: "ai-invoice-generator", plan },
    });

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), { headers: cors });

  } catch (err: any) {
    console.error("invoiceCheckout error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: cors });
  }
});
