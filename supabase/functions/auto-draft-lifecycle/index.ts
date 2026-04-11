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

    // Load brand voice for better quality
    const { data: bv } = await supabase.from("brand_voice").select("*").eq("company_id", companyId).maybeSingle();

    // Offset days per email type relative to event date
    const SEND_OFFSETS: Record<string, number> = {
      save_the_date: -42, invitation: -21, reminder: -7, day_of_details: -1, thank_you: 1
    };

    // Fetch event details
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventErr || !event) throw new Error("Event not found");

    // Fetch company/org name
    const { data: company } = await supabase
      .from("companies")
      .select("name")
      .eq("id", companyId)
      .single();

    const orgName = company?.name || "Our Organisation";
    const eventDate = event.event_date
      ? new Date(event.event_date).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : "TBC";

    const eventContext = `
Event Name: ${event.name}
Date: ${eventDate}
Location: ${event.location || "TBC"}
Description: ${event.description || ""}
Organiser: ${orgName}
${bv?.tone_adjectives?.length ? `Tone: ${bv.tone_adjectives.join(", ")}` : ""}
${bv?.audience ? `Audience: ${bv.audience}` : ""}
${bv?.avoid_phrases?.length ? `Avoid phrases: ${bv.avoid_phrases.join(", ")}` : ""}
${bv?.preferred_cta ? `Preferred CTA style: ${bv.preferred_cta}` : ""}
`.trim();

    console.log(`Auto-drafting ${EMAIL_SEQUENCE.length} emails for event: ${event.name}`);

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
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        const aiData = await aiRes.json();
        const rawText = aiData.content?.[0]?.text || "{}";

        let content;
        try {
          const cleaned = rawText.replace(/```json|```/g, "").trim();
          content = JSON.parse(cleaned);
        } catch {
          console.error("JSON parse failed for", emailType.type);
          continue;
        }

        // Build clean HTML email body (simplified table-based)
        const htmlBody = buildHtml(content, event, orgName);
        const plainText = [
          content.greeting,
          ...(content.body_paragraphs || []),
          "",
          content.cta_text,
          content.ps_line ? `\n${content.ps_line}` : "",
        ].join("\n");

        // Calculate send date from event date + offset
        let sendAt: string | null = null;
        const offsetDays = SEND_OFFSETS[emailType.type];
        if (event.event_date && offsetDays !== undefined) {
          const d = new Date(event.event_date);
          d.setDate(d.getDate() + offsetDays);
          sendAt = d.toISOString();
        }
        const isScheduled = sendAt && new Date(sendAt) > new Date();

        // Save draft to DB
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
          console.log(`✅ Drafted: ${emailType.label}`);
        }
      } catch (e) {
        console.error(`Failed to draft ${emailType.type}:`, e.message);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      event_name: event.name,
      drafts_created: drafts.length,
      drafts 
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

function buildHtml(content: any, event: any, orgName: string): string {
  const paragraphs = (content.body_paragraphs || [])
    .map((p: string) => `<tr><td style="padding:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#333333;">${p}</td></tr>`)
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f4f4">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
  <!-- Header -->
  <tr><td bgcolor="#1a1a2e" style="padding:32px;text-align:center;border-radius:12px 12px 0 0;">
    <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:12px;color:#8888aa;letter-spacing:2px;text-transform:uppercase;">${orgName}</p>
    <h1 style="margin:0;font-family:Arial,sans-serif;font-size:28px;font-weight:700;color:#ffffff;line-height:1.3;">${content.headline || event.name}</h1>
    ${content.subheadline ? `<p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:16px;color:#aaaacc;">${content.subheadline}</p>` : ""}
  </td></tr>
  <!-- Event Details Bar -->
  <tr><td bgcolor="#0A84FF" style="padding:14px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="font-family:Arial,sans-serif;font-size:13px;color:#ffffff;">
        📅 ${event.event_date ? new Date(event.event_date).toLocaleDateString("en-AU", { day:"numeric",month:"long",year:"numeric" }) : "Date TBC"}
        &nbsp;&nbsp;|&nbsp;&nbsp;
        📍 ${event.location || "Venue TBC"}
      </td>
    </tr>
    </table>
  </td></tr>
  <!-- Body -->
  <tr><td bgcolor="#ffffff" style="padding:32px;border-radius:0 0 12px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="padding:0 0 20px 0;font-family:Arial,sans-serif;font-size:15px;color:#333;">${content.greeting || "Dear [First Name],"}</td></tr>
      ${paragraphs}
      <!-- CTA -->
      <tr><td style="padding:24px 0;" align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr><td bgcolor="#0A84FF" style="border-radius:8px;">
          <a href="{{REGISTRATION_URL}}" style="display:inline-block;padding:14px 40px;font-family:Arial,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${content.cta_text || "Register Now"} →</a>
        </td></tr>
        </table>
      </td></tr>
      ${content.ps_line ? `<tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#888;font-style:italic;padding-top:16px;">${content.ps_line}</td></tr>` : ""}
    </table>
    <!-- Footer -->
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
