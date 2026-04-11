import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// SendGrid Event Webhook — tracks opens, clicks, bounces, unsubscribes
// URL: https://sqddpjsgtwblmkgxqyxe.supabase.co/functions/v1/email-webhook
serve(async (req) => {
  if (req.method !== "POST") return new Response("ok", { status: 200 });

  try {
    const events = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    for (const ev of events) {
      const campaignId = ev.campaign_id;   // from custom_args
      const contactId  = ev.contact_id;   // from custom_args
      const email      = ev.email;         // always present in SendGrid events
      const eventType  = ev.event;
      const ts         = new Date().toISOString();

      if (!campaignId || !email) continue;

      if (eventType === "open") {
        await supabase.from("email_sends")
          .update({ opened_at: ts, status: "opened" })
          .eq("campaign_id", campaignId)
          .eq("email", email)
          .is("opened_at", null); // only record first open

        await supabase.rpc("increment_campaign_opens", { campaign_id: campaignId });

        if (contactId) {
          await supabase.from("contact_activity").insert({
            contact_id: contactId,
            company_id: ev.company_id || null,
            activity_type: "email_opened",
            description: "Opened email",
            metadata: { campaign_id: campaignId, email, timestamp: ts },
          }).single();
        }
      }

      if (eventType === "click") {
        await supabase.from("email_sends")
          .update({ clicked_at: ts, click_count: supabase.raw("COALESCE(click_count,0)+1") as any })
          .eq("campaign_id", campaignId)
          .eq("email", email);

        await supabase.rpc("increment_campaign_clicks", { campaign_id: campaignId });

        if (contactId) {
          await supabase.from("contact_activity").insert({
            contact_id: contactId,
            company_id: ev.company_id || null,
            activity_type: "email_clicked",
            description: `Clicked link in email`,
            metadata: { campaign_id: campaignId, url: ev.url, email, timestamp: ts },
          }).single();
        }
      }

      if (eventType === "bounce" || eventType === "dropped") {
        await supabase.from("email_sends")
          .update({ bounced_at: ts, status: "bounced", send_error: ev.reason || eventType })
          .eq("campaign_id", campaignId)
          .eq("email", email);
      }

      if (eventType === "unsubscribe" || eventType === "spamreport") {
        await supabase.from("contacts")
          .update({ unsubscribed: true, unsubscribed_at: ts })
          .eq("email", email);

        await supabase.from("email_sends")
          .update({ unsubscribed_at: ts, status: "unsubscribed" })
          .eq("campaign_id", campaignId)
          .eq("email", email);
      }
    }

    return new Response(JSON.stringify({ received: events.length }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Webhook error:", err.message);
    return new Response("ok", { status: 200 }); // Always 200 to SendGrid
  }
});
