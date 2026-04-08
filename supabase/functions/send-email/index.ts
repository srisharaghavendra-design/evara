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

    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY")!;
    const FROM_EMAIL = fromEmail || Deno.env.get("FROM_EMAIL") || "hello@evarahq.com";
    const FROM_NAME = fromName || Deno.env.get("FROM_NAME") || "evara";

    if (!SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY not configured");
    if (!contacts?.length) throw new Error("No contacts provided");

    console.log(`Sending to ${contacts.length} contact(s) from ${FROM_EMAIL}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let sent = 0, failed = 0;
    const errors: string[] = [];

    for (const contact of contacts) {
      if (contact.unsubscribed || !contact.email) { failed++; continue; }

      const personalHtml = (htmlContent || "<p>No content</p>")
        .replace(/\[First Name\]/gi, contact.first_name || "")
        .replace(/\{\{FIRST_NAME\}\}/gi, contact.first_name || "")
        .replace(/Dear \[First Name\]/gi, `Dear ${contact.first_name || "there"}`)
        .replace(/\[Last Name\]/gi, contact.last_name || "")
        .replace(/\[Full Name\]/gi, `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || contact.email);

      const payload = {
        personalizations: [{ to: [{ email: contact.email, name: `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || contact.email }] }],
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: subject || "Email from evara",
        // text/plain MUST come before text/html per SendGrid spec
        content: [
          { type: "text/plain", value: plainText || subject || "Email from evara" },
          { type: "text/html", value: personalHtml },
        ],
        tracking_settings: { click_tracking: { enable: true }, open_tracking: { enable: true } },
        ...(campaignId ? { custom_args: { campaign_id: String(campaignId) } } : {}),
      };

      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: { "Authorization": `Bearer ${SENDGRID_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok || res.status === 202) {
        sent++;
        console.log(`✅ Sent to ${contact.email}`);
      } else {
        failed++;
        const errText = await res.text();
        console.error(`❌ SendGrid ${res.status}: ${errText}`);
        errors.push(`${res.status}: ${errText}`);
      }

      await new Promise(r => setTimeout(r, 50));
    }

    if (campaignId && sent > 0) {
      await supabase.from("email_campaigns").update({ total_sent: sent, status: "sent", sent_at: new Date().toISOString() }).eq("id", campaignId);
    }

    console.log(`Done: ${sent} sent, ${failed} failed`);

    if (sent === 0 && errors.length > 0) {
      return new Response(JSON.stringify({ success: false, sent: 0, failed, error: errors[0] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, sent, failed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("Error:", err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
