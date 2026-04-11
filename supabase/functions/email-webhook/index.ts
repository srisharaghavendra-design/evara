import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const events = await req.json();
    if (!Array.isArray(events)) throw new Error("Expected array of events");

    for (const event of events) {
      const { event: eventType, campaign_id, contact_id, email_send_id, email, timestamp } = event;
      const ts = new Date((timestamp || Date.now() / 1000) * 1000).toISOString();

      const matchSend = async (updates: Record<string, unknown>, extraFilter?: string) => {
        if (email_send_id) {
          return supabase.from("email_sends").update(updates).eq("id", email_send_id);
        } else if (campaign_id && contact_id) {
          let q = supabase.from("email_sends").update(updates).eq("campaign_id", campaign_id).eq("contact_id", contact_id);
          return extraFilter === "no_open" ? q.is("opened_at", null) : extraFilter === "no_click" ? q.is("clicked_at", null) : q;
        } else if (campaign_id && email) {
          let q = supabase.from("email_sends").update(updates).eq("campaign_id", campaign_id).eq("email", email);
          return extraFilter === "no_open" ? q.is("opened_at", null) : extraFilter === "no_click" ? q.is("clicked_at", null) : q;
        }
        return null;
      };

      if (eventType === "open") {
        await matchSend({ status: "opened", opened_at: ts }, "no_open");
        if (campaign_id) await supabase.rpc("increment_campaign_opens", { campaign_id });
        console.log(`Open: campaign=${campaign_id} contact=${contact_id} email=${email}`);
      }

      if (eventType === "click") {
        await matchSend({ status: "clicked", clicked_at: ts }, "no_click");
        if (campaign_id) await supabase.rpc("increment_campaign_clicks", { campaign_id });
        console.log(`Click: campaign=${campaign_id} url=${event.url}`);
      }

      if (eventType === "unsubscribe" || eventType === "spamreport") {
        if (email) await supabase.from("contacts").update({ unsubscribed: true, unsubscribed_at: ts }).eq("email", email);
        if (campaign_id && email) await supabase.from("email_sends").update({ status: "unsubscribed" }).eq("campaign_id", campaign_id).eq("email", email);
        console.log(`Unsub: ${email}`);
      }

      if (eventType === "bounce" || eventType === "dropped") {
        await matchSend({ status: "bounced" });
        console.log(`Bounce: ${email}`);
      }
    }

    return new Response(JSON.stringify({ received: events.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
    });
  } catch (err) {
    console.error("Webhook error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
    });
  }
});
