// evara — generate-edm edge function
// Updated: returns structured content JSON + builds world-class HTML server-side
// Deploy: supabase functions deploy generate-edm --no-verify-jwt

import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.27.3";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EMAIL_TYPE_CONTEXT: Record<string, string> = {
  save_the_date: "Save the Date — early announcement to mark the date",
  invitation:    "Formal invitation to attend the event",
  reminder:      "Reminder to register or attend",
  confirmation:  "Registration/RSVP confirmation — they're in",
  byo:           "What to bring / logistics and preparation details",
  day_of:        "Day-of details — schedule, venue, parking, check-in",
  thank_you:     "Post-event thank you and follow-up",
};

// ─── TEMPLATE BUILDER (mirrors frontend buildEmailHtml) ────────────────────
// Builds Outlook-safe, table-based HTML from structured content.
// Any change here should be mirrored in App.jsx buildEmailHtml().
function buildEmailHtml(params: {
  style?: string;
  headline?: string;
  subheadline?: string;
  greeting?: string;
  bodyParagraphs?: string[];
  ctaText?: string;
  ctaUrl?: string;
  eventDate?: string;
  eventTime?: string;
  location?: string;
  orgName?: string;
  headerImageUrl?: string | null;
  bodyImageUrl?: string | null;
  footerImageUrl?: string | null;
  psLine?: string;
}): string {
  const {
    style = "branded",
    headline = "",
    subheadline = "",
    greeting = "Dear {{FIRST_NAME}},",
    bodyParagraphs = [],
    ctaText = "Register Now",
    ctaUrl = "",
    eventDate = "",
    eventTime = "",
    location = "",
    orgName = "Orbis Events",
    headerImageUrl = null,
    bodyImageUrl = null,
    footerImageUrl = null,
    psLine = "",
  } = params;

  const themes: Record<string, Record<string, string>> = {
    minimal: {
      headerBg:      "#F8F8F6",
      headerColor:   "#1A1A18",
      headerSubColor:"#777777",
      accentColor:   "#1A1A18",
      chipBg:        "transparent",
      chipColor:     "#999999",
      showChip:      "false",
      orgColor:      "#999999",
    },
    branded: {
      headerBg:      "#1E3A5F",
      headerColor:   "#FFFFFF",
      headerSubColor:"rgba(255,255,255,0.75)",
      accentColor:   "#1E3A5F",
      chipBg:        "rgba(79,195,247,0.18)",
      chipColor:     "#4FC3F7",
      showChip:      "true",
      orgColor:      "rgba(255,255,255,0.7)",
    },
    vibrant: {
      headerBg:      "#FF5C35",
      headerColor:   "#FFFFFF",
      headerSubColor:"rgba(255,255,255,0.88)",
      accentColor:   "#FF5C35",
      chipBg:        "rgba(0,0,0,0.12)",
      chipColor:     "#FFFFFF",
      showChip:      "true",
      orgColor:      "rgba(255,255,255,0.7)",
    },
  };

  const t = themes[style] || themes.branded;
  const showChip = t.showChip === "true";

  // ── HEADER ──
  const headerSection = headerImageUrl
    ? `<img src="${headerImageUrl}" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0;">`
    : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${t.headerBg}">
        <tr><td style="padding:36px 40px 32px;">
          <p style="margin:0 0 22px;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:${t.orgColor};font-family:Arial,Helvetica,sans-serif;">${orgName}</p>
          ${showChip ? `<p style="margin:0 0 14px;"><span style="display:inline-block;background:${t.chipBg};color:${t.chipColor};font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:5px 14px;border-radius:20px;font-family:Arial,Helvetica,sans-serif;">You&rsquo;re Invited</span></p>` : ""}
          <h1 style="margin:0;font-size:30px;font-weight:700;line-height:1.15;color:${t.headerColor};letter-spacing:-0.5px;font-family:Arial,Helvetica,sans-serif;">${headline}</h1>
          ${subheadline ? `<p style="margin:10px 0 0;font-size:15px;color:${t.headerSubColor};line-height:1.6;font-family:Arial,Helvetica,sans-serif;">${subheadline}</p>` : ""}
          ${(eventDate || location) ? `<table cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;"><tr>
            ${eventDate ? `<td style="font-size:12px;color:${t.headerSubColor};font-family:Arial,Helvetica,sans-serif;padding-right:20px;">&#128197;&nbsp;${eventDate}${eventTime ? " &middot; " + eventTime : ""}</td>` : ""}
            ${location ? `<td style="font-size:12px;color:${t.headerSubColor};font-family:Arial,Helvetica,sans-serif;">&#128205;&nbsp;${location}</td>` : ""}
          </tr></table>` : ""}
        </td></tr>
      </table>`;

  // ── BODY PARAGRAPHS ──
  const bodyHtml = bodyParagraphs
    .filter(Boolean)
    .map(p => `<p style="margin:0 0 18px;font-size:15px;color:#444444;line-height:1.8;font-family:Arial,Helvetica,sans-serif;">${p}</p>`)
    .join("");

  // ── EVENT DETAILS CARD ──
  const detailsCard = (eventDate || eventTime || location)
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 28px;background:#F8F8F8;border-radius:6px;border-left:3px solid ${t.accentColor};">
        <tr><td style="padding:18px 22px;">
          <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${t.accentColor};font-family:Arial,Helvetica,sans-serif;">Event Details</p>
          <table cellpadding="0" cellspacing="4" border="0" style="width:100%;">
            ${eventDate ? `<tr><td style="font-size:12px;color:#999999;font-family:Arial,Helvetica,sans-serif;width:70px;padding:3px 0;">Date</td><td style="font-size:13px;color:#111111;font-weight:600;font-family:Arial,Helvetica,sans-serif;padding:3px 0;">${eventDate}</td></tr>` : ""}
            ${eventTime ? `<tr><td style="font-size:12px;color:#999999;font-family:Arial,Helvetica,sans-serif;padding:3px 0;">Time</td><td style="font-size:13px;color:#111111;font-weight:600;font-family:Arial,Helvetica,sans-serif;padding:3px 0;">${eventTime}</td></tr>` : ""}
            ${location ? `<tr><td style="font-size:12px;color:#999999;font-family:Arial,Helvetica,sans-serif;padding:3px 0;">Venue</td><td style="font-size:13px;color:#111111;font-weight:600;font-family:Arial,Helvetica,sans-serif;padding:3px 0;">${location}</td></tr>` : ""}
          </table>
        </td></tr>
      </table>`
    : "";

  // ── CTA BUTTON (Outlook VML + standard) ──
  const ctaSection = ctaUrl
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 32px;">
        <tr><td align="center">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" bgcolor="${t.accentColor}" style="border-radius:6px;mso-padding-alt:14px 40px;">
                <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${ctaUrl}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="12%" strokecolor="${t.accentColor}" fillcolor="${t.accentColor}"><w:anchorlock/><center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;">${ctaText}</center></v:roundrect><![endif]-->
                <!--[if !mso]><!--><a href="${ctaUrl}" style="display:inline-block;padding:14px 40px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.3px;font-family:Arial,Helvetica,sans-serif;mso-hide:all;">${ctaText}</a><!--<![endif]-->
              </td>
            </tr>
          </table>
        </td></tr>
      </table>`
    : "";

  const bodyImageSection = bodyImageUrl
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;"><tr><td><img src="${bodyImageUrl}" width="100%" alt="" style="display:block;width:100%;border-radius:6px;border:0;"></td></tr></table>`
    : "";

  const footerImageSection = footerImageUrl
    ? `<tr><td style="padding:0;"><img src="${footerImageUrl}" width="600" alt="" style="display:block;width:100%;max-width:600px;border:0;"></td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<title>Email</title>
</head>
<body style="margin:0;padding:0;background-color:#EBEBEB;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;word-break:break-word;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#EBEBEB">
<tr><td align="center" style="padding:24px 12px;">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.09);">

    <!-- HEADER -->
    <tr><td style="padding:0;line-height:0;">${headerSection}</td></tr>

    <!-- BODY -->
    <tr><td style="padding:32px 40px 16px;">
      ${greeting ? `<p style="margin:0 0 22px;font-size:16px;color:#111111;font-weight:500;font-family:Arial,Helvetica,sans-serif;">${greeting}</p>` : ""}
      ${bodyHtml}
    </td></tr>

    <!-- EVENT DETAILS CARD -->
    ${detailsCard ? `<tr><td style="padding:0 40px;">${detailsCard}</td></tr>` : ""}

    <!-- BODY IMAGE -->
    ${bodyImageSection ? `<tr><td style="padding:0 40px 24px;">${bodyImageSection}</td></tr>` : ""}

    <!-- CTA BUTTON -->
    ${ctaSection ? `<tr><td style="padding:0 40px;">${ctaSection}</td></tr>` : ""}

    <!-- PS LINE -->
    ${psLine ? `<tr><td style="padding:0 40px 28px;"><p style="margin:0;font-size:13px;color:#AAAAAA;font-style:italic;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">${psLine}</p></td></tr>` : ""}

    <!-- FOOTER IMAGE -->
    ${footerImageSection}

    <!-- FOOTER -->
    <tr><td bgcolor="#F8F8F8" style="padding:22px 40px;border-top:1px solid #EEEEEE;text-align:center;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#AAAAAA;font-family:Arial,Helvetica,sans-serif;">${orgName}</p>
      <p style="margin:0;font-size:11px;color:#CCCCCC;font-family:Arial,Helvetica,sans-serif;">
        <a href="{{UNSUBSCRIBE_URL}}" style="color:#CCCCCC;text-decoration:underline;font-family:Arial,Helvetica,sans-serif;">Unsubscribe</a>
        &nbsp;&middot;&nbsp;
        <a href="#" style="color:#CCCCCC;text-decoration:underline;font-family:Arial,Helvetica,sans-serif;">View in browser</a>
        &nbsp;&middot;&nbsp;
        <a href="#" style="color:#CCCCCC;text-decoration:underline;font-family:Arial,Helvetica,sans-serif;">Privacy Policy</a>
      </p>
    </td></tr>

  </table>

</td></tr>
</table>
</body>
</html>`;
}

// ─── PLAIN TEXT FALLBACK ───────────────────────────────────────────────────
function buildPlainText(params: {
  subject: string;
  greeting: string;
  bodyParagraphs: string[];
  ctaText: string;
  ctaUrl: string;
  eventDate: string;
  eventTime: string;
  location: string;
  orgName: string;
  psLine: string;
}): string {
  const lines: string[] = [
    params.subject,
    "",
    params.greeting,
    "",
    ...params.bodyParagraphs,
    "",
  ];
  if (params.eventDate || params.eventTime || params.location) {
    lines.push("── Event Details ──");
    if (params.eventDate) lines.push(`Date:  ${params.eventDate}`);
    if (params.eventTime) lines.push(`Time:  ${params.eventTime}`);
    if (params.location)  lines.push(`Venue: ${params.location}`);
    lines.push("");
  }
  if (params.ctaUrl) {
    lines.push(`${params.ctaText}: ${params.ctaUrl}`);
    lines.push("");
  }
  if (params.psLine) {
    lines.push(params.psLine);
    lines.push("");
  }
  lines.push(`──`);
  lines.push(params.orgName);
  lines.push("To unsubscribe reply UNSUBSCRIBE to this email.");
  return lines.join("\n");
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      eventName        = "",
      eventDate        = "",
      eventTime        = "",
      location         = "",
      description      = "",
      tone             = "professional and exciting",
      extra            = "",
      emailType        = "invitation",
      templateStyle    = "branded",
      registrationUrl  = null,
      headerImageUrl   = null,
      bodyImageUrl     = null,
      footerImageUrl   = null,
      eventId          = null,
      companyId        = null,
    } = body;

    // ── Supabase client (service role for DB writes) ──
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get company name
    let orgName = "Orbis Events";
    if (companyId) {
      const { data: co } = await supabase.from("companies").select("name").eq("id", companyId).single();
      if (co?.name) orgName = co.name;
    }

    const emailContext = EMAIL_TYPE_CONTEXT[emailType] || emailType;

    // ── Claude system prompt ──────────────────────────────────────────────
    const systemPrompt = `You are a world-class B2B event email copywriter. Your emails are used by top-tier event agencies, investment banks, and professional services firms.

Return ONLY valid JSON. No markdown fences, no preamble, no explanation — pure JSON only.

Required JSON structure:
{
  "subject":        "Subject line — 40-60 characters, drive open rate",
  "preheader":      "Preview text shown in inbox — 60-90 chars, complement subject",
  "headline":       "Bold email headline — 5-10 words, punchy and specific",
  "subheadline":    "Optional supporting line under headline — or empty string",
  "greeting":       "Opening e.g. 'Dear {{FIRST_NAME}},' or 'Hi {{FIRST_NAME}},'",
  "body_paragraphs": ["para 1 — 2-3 sentences", "para 2 — 2-3 sentences", "para 3 (optional — urgency/closing)"],
  "cta_text":       "CTA button label — 2-5 words, action-oriented",
  "ps_line":        "Optional P.S. urgency line — or empty string"
}

Writing rules:
- Tone: ${tone}
- Email type: ${emailContext}
- Subject: specific to the event, create curiosity or urgency — never generic
- Greeting: always use {{FIRST_NAME}} placeholder
- Body: scannable, short paragraphs, no filler words, no clichés
- CTA: match the email type (Register Now / Confirm Attendance / View Details / RSVP Today)
- PS: subtle urgency — e.g. seats, deadline, exclusivity — or leave empty
- NEVER fabricate speaker names, statistics, or facts not in the event info
- NEVER use placeholder text like [Name] or [Date] — use the real values provided
- Use {{FIRST_NAME}} only for the recipient's first name`;

    const userPrompt = `Generate ${emailContext} email content for:

Event: ${eventName}
Date: ${eventDate || "TBC"}
Time: ${eventTime || "TBC"}
Location: ${location || "TBC"}
Description: ${description || "(no description provided)"}
Organisation: ${orgName}
${registrationUrl ? `Registration URL: ${registrationUrl}` : "No registration URL"}
${extra ? `Additional context: ${extra}` : ""}

Reflect the event details accurately. Keep copy tight and high-converting.`;

    // ── Call Claude ───────────────────────────────────────────────────────
    const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    // ── Parse AI response ─────────────────────────────────────────────────
    const rawText = response.content
      .filter(b => b.type === "text")
      .map(b => (b as { type: "text"; text: string }).text)
      .join("");

    let content: {
      subject: string;
      preheader?: string;
      headline: string;
      subheadline?: string;
      greeting: string;
      body_paragraphs: string[];
      cta_text: string;
      ps_line?: string;
    };

    try {
      // Strip any accidental markdown fences
      const cleaned = rawText.replace(/^```(?:json)?\s*/m, "").replace(/\s*```$/m, "").trim();
      content = JSON.parse(cleaned);
    } catch {
      // Graceful fallback if JSON parse fails
      console.error("JSON parse failed, using fallback content. Raw:", rawText.slice(0, 200));
      content = {
        subject:         `You're Invited: ${eventName}`,
        preheader:       `Join us for ${eventName}${eventDate ? " on " + eventDate : ""}`,
        headline:        eventName || "You're Invited",
        subheadline:     eventDate && location ? `${eventDate} · ${location}` : "",
        greeting:        "Dear {{FIRST_NAME}},",
        body_paragraphs: [
          description || `We would like to personally invite you to ${eventName}.`,
          `This is an exclusive gathering designed for senior professionals. Seats are limited — we encourage you to confirm your attendance early.`,
        ],
        cta_text:        emailType === "confirmation" ? "View My Registration" : "Register Now",
        ps_line:         "",
      };
    }

    // ── Build beautiful HTML ──────────────────────────────────────────────
    const html = buildEmailHtml({
      style:          templateStyle,
      headline:       content.headline,
      subheadline:    content.subheadline || "",
      greeting:       content.greeting,
      bodyParagraphs: content.body_paragraphs,
      ctaText:        content.cta_text,
      ctaUrl:         registrationUrl || "",
      eventDate,
      eventTime,
      location,
      orgName,
      headerImageUrl,
      bodyImageUrl,
      footerImageUrl,
      psLine:         content.ps_line || "",
    });

    // ── Build plain text ──────────────────────────────────────────────────
    const plain_text = buildPlainText({
      subject:        content.subject,
      greeting:       content.greeting,
      bodyParagraphs: content.body_paragraphs,
      ctaText:        content.cta_text,
      ctaUrl:         registrationUrl || "",
      eventDate,
      eventTime,
      location,
      orgName,
      psLine:         content.ps_line || "",
    });

    // ── Save to database ──────────────────────────────────────────────────
    let campaignId: string | null = null;

    if (eventId && companyId) {
      const campaignName = `${content.subject.slice(0, 60)}`;
      const { data: cam, error: camError } = await supabase
        .from("email_campaigns")
        .insert({
          event_id:     eventId,
          company_id:   companyId,
          name:         campaignName,
          email_type:   emailType,
          subject:      content.subject,
          html_content: html,
          plain_text,
          status:       "draft",
          segment:      "all",
          template_style: templateStyle,
        })
        .select("id")
        .single();

      if (camError) {
        console.error("DB insert error:", camError.message);
      } else {
        campaignId = cam?.id ?? null;
      }
    }

    // ── Return response ───────────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        success:     true,
        subject:     content.subject,
        preheader:   content.preheader || "",
        html,
        plain_text,
        content,           // ← Frontend uses this to re-render with local template
        campaign_id: campaignId,
      }),
      {
        status:  200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("generate-edm error:", message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        status:  500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
