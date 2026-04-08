import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TEMPLATES: Record<string, { subject: string; body: string }> = {
  confirmation: {
    subject: "You're confirmed for {eventName}!",
    body: `<p>Hi {firstName},</p><p>Great news — your place at <strong>{eventName}</strong> is confirmed.</p><p>📅 {eventDate}<br>🕐 {eventTime}<br>📍 {location}</p><p>We look forward to seeing you!</p><p>Best,<br>{orgName}</p>`,
  },
  reminder: {
    subject: "Reminder: {eventName} is coming up!",
    body: `<p>Hi {firstName},</p><p>Just a quick reminder that <strong>{eventName}</strong> is coming up soon.</p><p>📅 {eventDate}<br>🕐 {eventTime}<br>📍 {location}</p><p>See you there!</p><p>Best,<br>{orgName}</p>`,
  },
  decline: {
    subject: "We're sorry to hear you can't make it",
    body: `<p>Hi {firstName},</p><p>Thanks for letting us know you won't be able to attend <strong>{eventName}</strong>. We hope to see you at a future event!</p><p>Best,<br>{orgName}</p>`,
  },
  thank_you: {
    subject: "Thank you for attending {eventName}",
    body: `<p>Hi {firstName},</p><p>Thank you for attending <strong>{eventName}</strong>! It was great to have you with us.</p><p>We hope you found it valuable and look forward to seeing you at our next event.</p><p>Best,<br>{orgName}</p>`,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { contacts, triggerType, eventName, eventDate, eventTime, location, orgName } = await req.json();
    
    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
    const FROM_EMAIL = Deno.env.get("SENDGRID_FROM_EMAIL") || "hello@evarahq.com";
    
    if (!SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY not configured");
    
    const template = TEMPLATES[triggerType];
    if (!template) throw new Error(`Unknown trigger type: ${triggerType}`);

    const fill = (str: string, firstName: string) => str
      .replace(/{eventName}/g, eventName || "")
      .replace(/{eventDate}/g, eventDate || "")
      .replace(/{eventTime}/g, eventTime || "")
      .replace(/{location}/g, location || "")
      .replace(/{orgName}/g, orgName || "evara")
      .replace(/{firstName}/g, firstName || "");

    let sent = 0;
    for (const contact of contacts) {
      if (contact.unsubscribed || !contact.email) continue;
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: { "Authorization": `Bearer ${SENDGRID_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: contact.email }] }],
          from: { email: FROM_EMAIL, name: orgName || "evara" },
          subject: fill(template.subject, contact.first_name),
          content: [{ type: "text/html", value: fill(template.body, contact.first_name) }],
        }),
      });
      if (res.ok || res.status === 202) sent++;
      await new Promise(r => setTimeout(r, 50));
    }

    return new Response(JSON.stringify({ success: true, sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
