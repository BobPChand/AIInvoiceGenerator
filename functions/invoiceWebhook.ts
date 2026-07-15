// Stripe Webhook for AI Invoice Generator subscriptions
Deno.serve(async (req: Request): Promise<Response> => {
  const cors = { "Content-Type": "application/json" };
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { default: Stripe } = await import("npm:stripe@14");
    const { createClient } = await import("npm:@base44/sdk@0.8.31");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-04-10" });
    const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
    const base44 = createClient({
      appId: Deno.env.get("BASE44_APP_ID")!,
      apiKey: Deno.env.get("BASE44_API_KEY")!,
    });

    const PRICE_TO_PLAN: Record<string, string> = {
      "price_1TmbqHEtlIXbMcJ2ZSKExMY6": "monthly",
      "price_1TmbqHEtlIXbMcJ2TWduRpD6": "yearly",
    };

    const body = await req.text();
    const sig = req.headers.get("stripe-signature")!;

    let event: any;
    try {
      event = await stripe.webhooks.constructEventAsync(body, sig, WEBHOOK_SECRET);
    } catch (err: any) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400, headers: cors });
    }

    const obj = event.data.object;

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const customer = await stripe.customers.retrieve(obj.customer) as any;
        const email = customer.email || "";
        const priceId = obj.items?.data[0]?.price?.id || "";
        const plan = PRICE_TO_PLAN[priceId] || "monthly";
        const isActive = ["active", "trialing"].includes(obj.status);

        const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_subscription_id: obj.id });
        const data = {
          email,
          stripe_customer_id: obj.customer,
          stripe_subscription_id: obj.id,
          plan,
          status: obj.status,
          trial_end: obj.trial_end ? new Date(obj.trial_end * 1000).toISOString() : null,
          current_period_end: new Date(obj.current_period_end * 1000).toISOString(),
          is_active: isActive,
        };

        if (existing.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, data);
        } else {
          await base44.asServiceRole.entities.Subscription.create(data);
        }
        console.log(`Invoice app subscription upserted: ${email} → ${obj.status}`);
        break;
      }
      case "customer.subscription.deleted": {
        const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_subscription_id: obj.id });
        if (existing.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, { status: "canceled", is_active: false });
        }
        break;
      }
      case "invoice.payment_succeeded": {
        if (obj.subscription) {
          const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_subscription_id: obj.subscription });
          if (existing.length > 0) {
            await base44.asServiceRole.entities.Subscription.update(existing[0].id, { status: "active", is_active: true });
          }
        }
        break;
      }
      case "invoice.payment_failed": {
        if (obj.subscription) {
          const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_subscription_id: obj.subscription });
          if (existing.length > 0) {
            await base44.asServiceRole.entities.Subscription.update(existing[0].id, { status: "past_due", is_active: false });
          }
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { headers: cors });
  } catch (err: any) {
    console.error("invoiceWebhook error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: cors });
  }
});
