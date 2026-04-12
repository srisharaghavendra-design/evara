import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EMAIL_SEQUENCE = [
  {
    type: "save_the_date",
    label: "Save the Date",
    timing: "Send 6–8 weeks before",
    prompt_role: "Create a Save the Date email. Keep it brief and exciting. The goal is to secure the date in the reader's calendar. Include event name, date, location and a short teaser. CTA should be 'Save Your Spot'.",
  },
  {
    type: "invitation",
    label: "Invitation",
    timing: "Send 3–4 weeks before",
    prompt_role: "Write a full event invitation email. This is the main invite — make it compelling. Include event highlights, who should attend, what they'll gain. CTA should be 'Register Now'.",
  },
  {
    type: "reminder",
    label: "1-Week Reminder",
    timing: "Send 7 days before",
    prompt_role: "Write a reminder email for people who haven't registered yet. Create urgency — limited spots, deadline approaching. Reference the event value briefly. CTA should be 'Secure Your Place'.",
  },
  {
    type: "day_of_details",
    label: "Day-of Details",
    timing: "Send 1 day before",
    prompt_role: "Write a day-before email with practical details. Include venue address, time, dress code if applicable, parking/transport tips, what to bring. Tone should be warm and helpful. CTA should be 'Add to Calendar'.",
  },
  {
    type: "thank_you",
    label: "Thank You",
    timing: "Send 1 day after",
    prompt_role: "Write a post-event thank you email. Express genuine gratitude, highlight key moments, tease what's coming next. CTA should be 'Share Your Feedback'.",
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { eventId, companyId, userId } = await req.json();

    if (!eventId || !companyId) throw new Error("eventId and companyId required");

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: bv } = await supabase.from("brand_voice").select("*").eq("company_id", companyId).maybeSingle();

    const SEND_OFFSETS: Record<string, number> = {
      save_the_date: -42, invitation: -21, reminder: -7, day_of_details: -1, thank_you: 1
    };

    const { data: event, error: eventErr } = await supabase.from("events").select("*").eq("id", eventId).single();
    if (eventErr || !event) throw new Error("Event not found");

    const { data: company } = await supabase.from("companies").select("name, logo_url, brand_color").eq("id", companyId).single();

    const orgName = company?.name || "Our Organisation";
    const logoUrl = company?.logo_url || "";
    const brandColor = company?.brand_color || "";
    const eventDate = event.event_date
      ? new Date(event.event_date).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : "TBC";

    const eventContext = `
Event Name: ${event.name}
Date: ${eventDate}
Time: ${event.event_time || "TBC"}
Location: ${event.location || "TBC"}
Description: ${event.description || ""}
Event Type: ${event.event_type || ""}
Organiser: ${orgName}
${bv?.tone_adjectives?.length ? `Tone: ${bv.tone_adjectives.join(", ")}` : ""}
${bv?.audience ? `Audience: ${bv.audience}` : ""}
`.trim();

    console.log(`Auto-drafting for event: ${event.name}`);

    // ── 1. EMAIL SEQUENCE ────────────────────────────────────────────
    const drafts = [];

    for (const emailType of EMAIL_SEQUENCE) {
      try {
        const prompt = `You are an expert B2B event marketing copywriter.

${emailType.prompt_role}

Event details:
${eventContext}

Respond ONLY with a JSON object (no markdown, no explanation):
{
  "subject": "compelling subject line under 60 chars",
  "headline": "bold hero headline",
  "subheadline": "supporting line",
  "greeting": "Dear [First Name],",
  "body_paragraphs": ["paragraph 1", "paragraph 2", "paragraph 3"],
  "cta_text": "button text",
  "ps_line": "optional PS line or empty string"
}`;

        const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 900,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        const aiData = await aiRes.json();
        const rawText = aiData.content?.[0]?.text || "{}";
        let content;
        try {
          content = JSON.parse(rawText.replace(/```json|```/g, "").trim());
        } catch {
          console.error("JSON parse failed for", emailType.type);
          continue;
        }

        const htmlBody = buildHtml(content, event, orgName, logoUrl, brandColor);
        const plainText = [
          content.greeting,
          ...(content.body_paragraphs || []),
          "",
          content.cta_text,
          content.ps_line ? `\n${content.ps_line}` : "",
        ].join("\n");

        let sendAt: string | null = null;
        const offsetDays = SEND_OFFSETS[emailType.type];
        if (event.event_date && offsetDays !== undefined) {
          const d = new Date(event.event_date);
          d.setDate(d.getDate() + offsetDays);
          sendAt = d.toISOString();
        }
        const isScheduled = sendAt && new Date(sendAt) > new Date();

        const { data: saved } = await supabase.from("email_campaigns").insert({
          event_id: eventId,
          company_id: companyId,
          name: `${emailType.label} — ${event.name}`,
          email_type: emailType.type,
          subject: content.subject,
          html_content: htmlBody,
          plain_text: plainText,
          send_at: sendAt,
          scheduled_at: sendAt,
          status: isScheduled ? "scheduled" : "draft",
          segment: "all",
        }).select("id").single();

        if (saved) {
          drafts.push({ type: emailType.type, label: emailType.label, id: saved.id, subject: content.subject, timing: emailType.timing });
          console.log(`✅ Email drafted: ${emailType.label}`);
        }
      } catch (e) {
        console.error(`Failed to draft ${emailType.type}:`, e.message);
      }
    }

    // ── 2. LANDING PAGE ──────────────────────────────────────────────
    let landingCreated = false;
    try {
      const { data: existingLp } = await supabase.from("landing_pages").select("id").eq("event_id", eventId).maybeSingle();

      if (!existingLp) {
        const lpPrompt = `You are an event landing page copywriter.

Write compelling copy for an event landing page.

Event details:
${eventContext}

Respond ONLY with a JSON object (no markdown):
{
  "title": "page title (same as or close to event name)",
  "tagline": "short punchy tagline under 10 words",
  "headline": "hero headline — bold, exciting, under 12 words",
  "subheadline": "supporting sentence under 20 words",
  "about_text": "2-3 sentence description of the event and why people should attend",
  "cta_text": "Register Now"
}`;

        const lpRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 400,
            messages: [{ role: "user", content: lpPrompt }],
          }),
        });

        const lpData = await lpRes.json();
        const lpText = lpData.content?.[0]?.text || "{}";
        let lpContent: any = {};
        try {
          lpContent = JSON.parse(lpText.replace(/```json|```/g, "").trim());
        } catch {
          console.error("Landing page JSON parse failed");
        }

        const slug = (event.name || "event")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          + "-" + Date.now().toString(36);

        await supabase.from("landing_pages").insert({
          event_id: eventId,
          company_id: companyId,
          title: lpContent.title || event.name,
          tagline: lpContent.tagline || "",
          headline: lpContent.headline || event.name,
          subheadline: lpContent.subheadline || "",
          about_text: lpContent.about_text || event.description || "",
          cta_text: lpContent.cta_text || "Register Now",
          brand_color: brandColor || "#0A84FF",
          template: "corporate",
          slug,
          location_text: event.location || "",
          organiser: orgName,
          blocks: { hero: true, countdown: true, details: true, speakers: false, rsvp: true, sponsors: false },
          is_published: false,
          reg_url: "",
        });

        landingCreated = true;
        console.log("✅ Landing page draft created");
      }
    } catch (e) {
      console.error("Landing page creation failed:", e.message);
    }

    // ── 3. REGISTRATION FORM ─────────────────────────────────────────
    let formCreated = false;
    try {
      const { data: existingForm } = await supabase.from("forms").select("id").eq("event_id", eventId).limit(1).maybeSingle();

      if (!existingForm) {
        const eventType = (event.event_type || "").toLowerCase();
        const isDining = ["gala", "dinner", "lunch", "breakfast"].some(t => eventType.includes(t));

        const shareToken = Math.random().toString(36).substring(2, 14) + Date.now().toString(36);

        const fields = [
          { id: 1, type: "text",   label: "First Name",           required: true,  options: [] },
          { id: 2, type: "text",   label: "Last Name",            required: true,  options: [] },
          { id: 3, type: "email",  label: "Email Address",        required: true,  options: [] },
          { id: 4, type: "text",   label: "Company / Organisation", required: false, options: [] },
          { id: 5, type: "text",   label: "Job Title",            required: false, options: [] },
          { id: 6, type: "text",   label: "Phone Number",         required: false, options: [] },
          ...(isDining ? [{ id: 7, type: "text", label: "Dietary Requirements", required: false, options: [] }] : []),
        ];

        await supabase.from("forms").insert({
          event_id: eventId,
          company_id: companyId,
          name: `Registration — ${event.name}`,
          fields,
          form_type: "registration",
          is_active: true,
          share_token: shareToken,
        });

        formCreated = true;
        console.log("✅ Registration form created");
      }
    } catch (e) {
      console.error("Form creation failed:", e.message);
    }

    return new Response(JSON.stringify({
      success: true,
      event_name: event.name,
      drafts_created: drafts.length,
      landing_page_created: landingCreated,
      form_created: formCreated,
      drafts,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error:", err.message);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildHtml(content: any, event: any, orgName: string, logoUrl = "", brandColor = ""): string {
  const headerBg = brandColor || "#1a1a2e";
  const accentColor = brandColor || "#0A84FF";
  const paragraphs = (content.body_paragraphs || [])
    .map((p: string) => `<tr><td style="padding:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#333333;">${p}</td></tr>`)
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f4">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
  <tr><td bgcolor="${headerBg}" style="padding:32px;text-align:center;border-radius:12px 12px 0 0;">
    ${logoUrl
      ? `<img src="${logoUrl}" alt="${orgName}" style="display:block;max-height:48px;max-width:160px;object-fit:contain;margin:0 auto 16px;">`
      : `<p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:12px;color:#8888aa;letter-spacing:2px;text-transform:uppercase;">${orgName}</p>`
    }
    <h1 style="margin:0;font-family:Arial,sans-serif;font-size:28px;font-weight:700;color:#ffffff;line-height:1.3;">${content.headline || event.name}</h1>
    ${content.subheadline ? `<p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:16px;color:rgba(255,255,255,0.75);">${content.subheadline}</p>` : ""}
  </td></tr>
  <tr><td bgcolor="${accentColor}" style="padding:14px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#ffffff;">
      📅 ${event.event_date ? new Date(event.event_date).toLocaleDateString("en-AU", { day:"numeric",month:"long",year:"numeric" }) : "Date TBC"}
      &nbsp;&nbsp;|&nbsp;&nbsp;
      📍 ${event.location || "Venue TBC"}
    </td></tr>
    </table>
  </td></tr>
  <tr><td bgcolor="#ffffff" style="padding:32px;border-radius:0 0 12px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:0 0 20px 0;font-family:Arial,sans-serif;font-size:15px;color:#333;">${content.greeting || "Dear [First Name],"}</td></tr>
      ${paragraphs}
      <tr><td style="padding:24px 0;" align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr><td bgcolor="${accentColor}" style="border-radius:8px;">
          <a href="{{REGISTRATION_URL}}" style="display:inline-block;padding:14px 40px;font-family:Arial,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${content.cta_text || "Register Now"} →</a>
        </td></tr>
        </table>
      </td></tr>
      ${content.ps_line ? `<tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#888;font-style:italic;padding-top:16px;">${content.ps_line}</td></tr>` : ""}
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #eee;margin-top:32px;">
    <tr><td style="padding-top:20px;font-family:Arial,sans-serif;font-size:11px;color:#aaa;text-align:center;">
      Sent by ${orgName} via evara &nbsp;·&nbsp; <a href="{{UNSUBSCRIBE_URL}}" style="color:#aaa;">Unsubscribe</a>
    </td></tr>
    </table>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}
