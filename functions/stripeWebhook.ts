import Stripe from "npm:stripe@14";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.31";

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const STRIPE_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

const PRICE_TO_PLAN: Record<string, string> = {
  "price_1TlJtoEtlIXbMcJ2c5VP38iT": "monthly",
  "price_1TlJtwEtlIXbMcJ22ft014Gi": "yearly",
};

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = { "Content-Type": "application/json" };
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const stripe = new Stripe(STRIPE_KEY, { apiVersion: "2024-04-10" });
  const base44 = createClientFromRequest(req);

  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature") ?? "";

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, sig, WEBHOOK_SECRET);
    } catch (err: any) {
      console.error("Webhook signature failed:", err.message);
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400, headers: cors });
    }

    console.log(`Stripe event: ${event.type}`);

    switch (event.type) {

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(sub.customer as string) as Stripe.Customer;
        const email = customer.email ?? "";
        const priceId = sub.items.data[0]?.price?.id ?? "";
        const plan = PRICE_TO_PLAN[priceId] ?? "monthly";
        const isActive = ["active", "trialing"].includes(sub.status);

        const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_subscription_id: sub.id });

        const data = {
          email,
          stripe_customer_id: sub.customer as string,
          stripe_subscription_id: sub.id,
          plan,
          status: sub.status,
          trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : "",
          current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
          is_active: isActive,
        };

        if (existing.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, data);
          console.log(`Updated subscription: ${email} → ${sub.status}`);
        } else {
          await base44.asServiceRole.entities.Subscription.create(data);
          console.log(`Created subscription: ${email} → ${sub.status}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_subscription_id: sub.id });
        if (existing.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, { status: "canceled", is_active: false });
          console.log(`Canceled subscription: ${sub.id}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const inv = event.data.object as Stripe.Invoice;
        if (inv.subscription) {
          const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_subscription_id: inv.subscription as string });
          if (existing.length > 0) {
            await base44.asServiceRole.entities.Subscription.update(existing[0].id, { status: "active", is_active: true });
            console.log(`Payment succeeded: ${inv.subscription}`);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        if (inv.subscription) {
          const existing = await base44.asServiceRole.entities.Subscription.filter({ stripe_subscription_id: inv.subscription as string });
          if (existing.length > 0) {
            await base44.asServiceRole.entities.Subscription.update(existing[0].id, { status: "past_due", is_active: false });
            console.log(`Payment failed: ${inv.subscription}`);
          }
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { headers: cors });

  } catch (err: any) {
    console.error("Webhook error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: cors });
  }
});
