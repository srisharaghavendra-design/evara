import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Called by pg_cron every 15 minutes to fire scheduled campaigns
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date().toISOString();

    // Find campaigns scheduled to send before now
    const { data: due, error } = await supabase
      .from("email_campaigns")
      .select("*, events(name, location, event_date, event_time)")
      .eq("status", "scheduled")
      .lte("scheduled_at", now)
      .limit(10);

    if (error) throw error;
    if (!due?.length) {
      return new Response(JSON.stringify({ fired: 0, message: "No campaigns due" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`Found ${due.length} campaigns due to send`);
    let fired = 0;

    for (const campaign of due) {
      try {
        // Mark as sending to prevent double-send
        await supabase.from("email_campaigns")
          .update({ status: "sending" })
          .eq("id", campaign.id);

        // Get contacts filtered by campaign segment
        let q = supabase.from("event_contacts")
          .select("contacts(id, email, first_name, last_name, unsubscribed)")
          .eq("event_id", campaign.event_id);

        const seg = campaign.segment || "all";
        if (seg === "confirmed")  q = q.eq("status", "confirmed");
        else if (seg === "pending") q = q.eq("status", "pending");
        else if (seg === "attended") q = q.eq("status", "attended");
        else if (seg === "declined") q = q.eq("status", "declined");
        else q = q.neq("status", "declined"); // "all" = everyone except declined

        const { data: eventContacts } = await q;

        let contacts = (eventContacts || [])
          .map((ec: any) => ec.contacts)
          .filter((c: any) => c?.email && !c.unsubscribed);

        // VIP filter
        if (seg === "vip") {
          const { data: allEcs } = await supabase
            .from("event_contacts")
            .select("contacts(id, email, first_name, last_name, unsubscribed, tags)")
            .eq("event_id", campaign.event_id);
          contacts = (allEcs || [])
            .map((ec: any) => ec.contacts)
            .filter((c: any) => c?.email && !c.unsubscribed && (c.tags || []).includes("vip"));
        }

        if (!contacts.length) {
          await supabase.from("email_campaigns")
            .update({ status: "sent", sent_at: now, total_sent: 0 })
            .eq("id", campaign.id);
          console.log(`Campaign ${campaign.id}: no eligible contacts for segment "${seg}"`);
          continue;
        }

        // Call send-email function
        const sendRes = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
            },
            body: JSON.stringify({
              campaignId: campaign.id,
              contacts,
              subject: campaign.subject,
              htmlContent: campaign.html_content,
              plainText: campaign.plain_text,
              fromName: campaign.from_name || "evara",
              fromEmail: campaign.from_email || "hello@evarahq.com",
            })
          }
        );

        const sendResult = await sendRes.json();
        console.log(`Campaign ${campaign.id}: ${sendResult.sent} sent, ${sendResult.failed} failed`);
        fired++;

        // Log activity
        await supabase.from("contact_activity").insert({
          event_id: campaign.event_id,
          company_id: campaign.company_id,
          activity_type: "scheduled_send",
          description: `Scheduled campaign "${campaign.name}" auto-sent to ${sendResult.sent} contacts`,
        });

      } catch (e) {
        console.error(`Failed campaign ${campaign.id}:`, e.message);
        await supabase.from("email_campaigns")
          .update({ status: "scheduled", send_error: e.message })
          .eq("id", campaign.id);
      }
    }

    return new Response(JSON.stringify({ fired, total_due: due.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Scheduler error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
