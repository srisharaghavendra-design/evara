import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { campaignId, contacts, subject, htmlContent, plainText, fromEmail, fromName } = await req.json();
    
    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
    const FROM_EMAIL = fromEmail || Deno.env.get("SENDGRID_FROM_EMAIL") || "hello@evarahq.com";
    const FROM_NAME = fromName || "evara";

    if (!SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY not configured");
    if (!contacts?.length) throw new Error("No contacts provided");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let sent = 0, failed = 0;

    for (const contact of contacts) {
      if (contact.unsubscribed || !contact.email) { failed++; continue; }
      
      // Personalise the email
      const personalHtml = htmlContent
        .replace(/\[First Name\]/gi, contact.first_name || "")
        .replace(/\[Last Name\]/gi, contact.last_name || "")
        .replace(/\[Full Name\]/gi, `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || contact.email);

      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: contact.email, name: `${contact.first_name || ""} ${contact.last_name || ""}`.trim() }] }],
          from: { email: FROM_EMAIL, name: FROM_NAME },
          subject,
          content: [
            { type: "text/html", value: personalHtml },
            { type: "text/plain", value: plainText || subject },
          ],
          tracking_settings: {
            click_tracking: { enable: true },
            open_tracking: { enable: true },
          },
          custom_args: campaignId ? { campaign_id: campaignId } : {},
        }),
      });

      if (res.ok || res.status === 202) { sent++; }
      else { failed++; console.error("SendGrid error:", await res.text()); }
      
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 50));
    }

    // Update campaign stats
    if (campaignId) {
      await supabase.from("email_campaigns").update({
        total_sent: sent,
        status: "sent",
        sent_at: new Date().toISOString(),
      }).eq("id", campaignId);
    }

    return new Response(JSON.stringify({ success: true, sent, failed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
