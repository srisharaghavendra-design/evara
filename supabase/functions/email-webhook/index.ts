import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// SendGrid webhook for tracking email opens and clicks
serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("ok", { status: 200 });
  }

  try {
    const events = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    for (const event of events) {
      const campaignId = event.campaign_id;
      const email = event.email;
      const eventType = event.event; // "open", "click", "bounce", "unsubscribe"

      if (!campaignId || !email) continue;

      if (eventType === "open") {
        // Update email_sends record
        await supabase.from("email_sends")
          .update({ opened_at: new Date().toISOString(), status: "opened" })
          .eq("campaign_id", campaignId)
          .eq("email", email)
          .is("opened_at", null);

        // Increment campaign open count
        await supabase.rpc("increment_campaign_opens", { campaign_id: campaignId });
      }

      if (eventType === "click") {
        await supabase.from("email_sends")
          .update({ clicked_at: new Date().toISOString() })
          .eq("campaign_id", campaignId)
          .eq("email", email);

        await supabase.rpc("increment_campaign_clicks", { campaign_id: campaignId });
      }

      if (eventType === "bounce") {
        await supabase.from("email_sends")
          .update({ bounced_at: new Date().toISOString(), status: "bounced" })
          .eq("campaign_id", campaignId)
          .eq("email", email);
      }

      if (eventType === "unsubscribe") {
        // Mark contact as unsubscribed
        await supabase.from("contacts")
          .update({ unsubscribed: true, unsubscribed_at: new Date().toISOString() })
          .eq("email", email);

        await supabase.from("email_sends")
          .update({ unsubscribed_at: new Date().toISOString() })
          .eq("campaign_id", campaignId)
          .eq("email", email);
      }
    }

    return new Response(JSON.stringify({ received: events.length }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("ok", { status: 200 }); // Always 200 to SendGrid
  }
});
