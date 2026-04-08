import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const buildHtml = (opts: {
  headline: string; subheadline?: string; body: string;
  cta?: string; ctaUrl?: string; orgName: string;
  eventDate?: string; eventTime?: string; location?: string;
}) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f0f0f0">
  <tr><td align="center" style="padding:24px 0;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08);">
      <tr><td bgcolor="#0A1628" style="padding:36px 40px 28px;">
        <h1 style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:26px;font-weight:700;color:#ffffff;line-height:1.2;">${opts.headline}</h1>
        ${opts.subheadline ? `<p style="margin:0;font-family:Arial,sans-serif;font-size:15px;color:rgba(255,255,255,0.7);">${opts.subheadline}</p>` : ""}
      </td></tr>
      <tr><td style="padding:32px 40px;">
        ${opts.body}
        ${(opts.eventDate || opts.eventTime || opts.location) ? `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f9fa;border-radius:8px;margin:20px 0;">
          <tr><td style="padding:18px 20px;">
            ${opts.eventDate ? `<p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:14px;color:#666;">📅&nbsp;&nbsp;<strong>Date:</strong>&nbsp; ${opts.eventDate}</p>` : ""}
            ${opts.eventTime ? `<p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:14px;color:#666;">🕐&nbsp;&nbsp;<strong>Time:</strong>&nbsp; ${opts.eventTime}</p>` : ""}
            ${opts.location ? `<p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#666;">📍&nbsp;&nbsp;<strong>Location:</strong>&nbsp; ${opts.location}</p>` : ""}
          </td></tr>
        </table>` : ""}
        ${opts.cta ? `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
          <tr><td align="center">
            <a href="${opts.ctaUrl || "#"}" style="display:inline-block;padding:13px 32px;background:#0A84FF;color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;">${opts.cta}</a>
          </td></tr>
        </table>` : ""}
      </td></tr>
      <tr><td bgcolor="#f8f8f8" style="padding:18px 40px;border-top:1px solid #eee;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-family:Arial,sans-serif;font-size:12px;color:#999;">© ${new Date().getFullYear()} ${opts.orgName}. All rights reserved.</td>
            <td align="right" style="font-family:Arial,sans-serif;font-size:12px;"><a href="https://evara-tau.vercel.app/unsubscribe" style="color:#999;text-decoration:underline;">Unsubscribe</a></td>
          </tr>
        </table>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

const TEMPLATES: Record<string, (p: Record<string, string>) => { subject: string; html: string; plain: string }> = {
  confirmation: (p) => ({
    subject: `✅ You're confirmed for ${p.eventName}!`,
    html: buildHtml({
      headline: `You're confirmed! 🎉`,
      subheadline: `We've saved your spot at ${p.eventName}`,
      body: `<p style="font-family:Arial,sans-serif;font-size:16px;color:#333;margin:0 0 14px;">Hi ${p.firstName || "there"},</p>
             <p style="font-family:Arial,sans-serif;font-size:16px;color:#333;margin:0 0 16px;line-height:1.6;">Great news — your place at <strong>${p.eventName}</strong> is confirmed. We're looking forward to seeing you there!</p>`,
      eventDate: p.eventDate, eventTime: p.eventTime, location: p.location,
      cta: "Add to Calendar", ctaUrl: p.calendarUrl || "#",
      orgName: p.orgName,
    }),
    plain: `Hi ${p.firstName || "there"},\n\nYou're confirmed for ${p.eventName}!\n\nDate: ${p.eventDate || ""}\nTime: ${p.eventTime || ""}\nLocation: ${p.location || ""}\n\nSee you there!\n${p.orgName}`,
  }),
  reminder: (p) => ({
    subject: `⏰ Reminder: ${p.eventName} is coming up!`,
    html: buildHtml({
      headline: `See you soon! 👋`,
      subheadline: `${p.eventName} is just around the corner`,
      body: `<p style="font-family:Arial,sans-serif;font-size:16px;color:#333;margin:0 0 14px;">Hi ${p.firstName || "there"},</p>
             <p style="font-family:Arial,sans-serif;font-size:16px;color:#333;margin:0 0 16px;line-height:1.6;">Just a friendly reminder that <strong>${p.eventName}</strong> is coming up soon. We can't wait to see you!</p>`,
      eventDate: p.eventDate, eventTime: p.eventTime, location: p.location,
      cta: "View Event Details", ctaUrl: p.eventUrl || "#",
      orgName: p.orgName,
    }),
    plain: `Hi ${p.firstName || "there"},\n\nReminder: ${p.eventName} is coming up!\n\nDate: ${p.eventDate || ""}\nTime: ${p.eventTime || ""}\nLocation: ${p.location || ""}\n\nSee you there!\n${p.orgName}`,
  }),
  decline: (p) => ({
    subject: `We'll miss you at ${p.eventName}`,
    html: buildHtml({
      headline: `Sorry you can't make it`,
      body: `<p style="font-family:Arial,sans-serif;font-size:16px;color:#333;margin:0 0 14px;">Hi ${p.firstName || "there"},</p>
             <p style="font-family:Arial,sans-serif;font-size:16px;color:#333;margin:0 0 16px;line-height:1.6;">Thanks for letting us know you won't be able to attend <strong>${p.eventName}</strong>. We'll miss you and hope to see you at a future event!</p>`,
      orgName: p.orgName,
    }),
    plain: `Hi ${p.firstName || "there"},\n\nThanks for letting us know. We'll miss you at ${p.eventName} and hope to see you next time.\n\n${p.orgName}`,
  }),
  thank_you: (p) => ({
    subject: `Thank you for attending ${p.eventName} 🙏`,
    html: buildHtml({
      headline: `Thank you for joining us!`,
      subheadline: `It was great having you at ${p.eventName}`,
      body: `<p style="font-family:Arial,sans-serif;font-size:16px;color:#333;margin:0 0 14px;">Hi ${p.firstName || "there"},</p>
             <p style="font-family:Arial,sans-serif;font-size:16px;color:#333;margin:0 0 16px;line-height:1.6;">Thank you for attending <strong>${p.eventName}</strong>! It was wonderful to have you there. We hope you found it valuable and would love to hear your thoughts.</p>`,
      cta: "Share Your Feedback", ctaUrl: p.feedbackUrl || "#",
      orgName: p.orgName,
    }),
    plain: `Hi ${p.firstName || "there"},\n\nThank you for attending ${p.eventName}! We hope you enjoyed it.\n\nWe'd love your feedback: ${p.feedbackUrl || ""}\n\n${p.orgName}`,
  }),
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json();
    const { contacts, triggerType, eventName, eventDate, eventTime, location, orgName, calendarUrl, feedbackUrl, eventUrl } = body;
    
    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "hello@evarahq.com";
    if (!SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY not configured in Supabase secrets");
    
    const templateFn = TEMPLATES[triggerType];
    if (!templateFn) throw new Error(`Unknown trigger type: ${triggerType}`);

    let sent = 0;
    for (const contact of (contacts || [])) {
      if (contact.unsubscribed || !contact.email) continue;
      const params = { firstName: contact.first_name || "", eventName: eventName || "", eventDate: eventDate || "", eventTime: eventTime || "", location: location || "", orgName: orgName || "evara", calendarUrl: calendarUrl || "", feedbackUrl: feedbackUrl || "", eventUrl: eventUrl || "" };
      const tmpl = templateFn(params);
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: { "Authorization": `Bearer ${SENDGRID_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: contact.email, name: `${contact.first_name || ""} ${contact.last_name || ""}`.trim() }] }],
          from: { email: FROM_EMAIL, name: orgName || "evara" },
          subject: tmpl.subject,
          content: [{ type: "text/html", value: tmpl.html }, { type: "text/plain", value: tmpl.plain }],
        }),
      });
      if (res.ok || res.status === 202) sent++;
      await new Promise(r => setTimeout(r, 80));
    }
    return new Response(JSON.stringify({ success: true, sent }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
