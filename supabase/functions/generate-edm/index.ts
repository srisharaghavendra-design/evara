import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      eventName, eventDate, eventTime, location, description, orgName,
      emailType, templateStyle = "branded", tone = "professional and exciting",
      extra = "", registrationUrl, eventId, companyId,
      headerImageUrl, bodyImageUrl, footerImageUrl,
    } = body;

    const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_KEY) throw new Error("ANTHROPIC_API_KEY not set");

    // Fetch brand voice to improve email quality
    let brandVoice: any = null;
    if (companyId) {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data: bv } = await supabase.from("brand_voice").select("*").eq("company_id", companyId).maybeSingle();
      brandVoice = bv;
    }

    const EMAIL_TYPE_PROMPTS: Record<string, string> = {
      save_the_date: "Save the Date announcement — exciting, brief, builds anticipation. Include the date prominently. CTA: 'Save the Date'",
      invitation: "Formal invitation — compelling, creates FOMO, emphasises exclusivity and value. CTA: 'Register Now' or 'Accept Invitation'",
      reminder: "Friendly reminder — warm, helpful, includes all event logistics. CTA: 'View Details' or 'Confirm Attendance'",
      confirmation: "RSVP confirmation — warm confirmation of attendance, provide practical details. CTA: 'Add to Calendar'",
      byo: "What to Bring / Day-of logistics — practical, friendly, answers key questions about the event day. CTA: 'View Agenda'",
      day_of: "Day-of excitement email — sent morning of, high energy, final logistics. CTA: 'Get Directions'",
      thank_you: "Warm thank you email — genuine appreciation, highlights key moments, next steps. CTA: 'Share Feedback'",
    };

    const COLORS: Record<string, { primary: string; accent: string; bg: string; headerBg: string; text: string }> = {
      minimal: { primary: "#111", accent: "#0A84FF", bg: "#fff", headerBg: "#f8f8f8", text: "#333" },
      branded: { primary: "#0A84FF", accent: "#fff", bg: "#fff", headerBg: "#0A1628", text: "#333" },
      vibrant: { primary: "#FF6B35", accent: "#fff", bg: "#fff", headerBg: "#1a1a2e", text: "#333" },
    };
    const colors = COLORS[templateStyle] || COLORS.branded;

    const prompt = `You are an expert event email copywriter. Write a ${emailType?.replace(/_/g, " ")} email.
Type: ${EMAIL_TYPE_PROMPTS[emailType] || "Professional event email"}
Event: ${eventName}
Date: ${eventDate || "TBC"}
Time: ${eventTime || "TBC"}
Location: ${location || "TBC"}
Organisation: ${orgName || ""}
Tone: ${brandVoice?.tone_adjectives?.length ? brandVoice.tone_adjectives.join(", ") : tone}
${description ? `Description: ${description}` : ""}
${extra ? `Additional context: ${extra}` : ""}
${brandVoice?.audience ? `Target audience: ${brandVoice.audience}` : ""}
${brandVoice?.industry ? `Industry: ${brandVoice.industry}` : ""}
${brandVoice?.avoid_phrases?.length ? `Do NOT use these phrases: ${brandVoice.avoid_phrases.join(", ")}` : ""}
${brandVoice?.signature_phrases?.length ? `Consider using these signature phrases naturally: ${brandVoice.signature_phrases.join(", ")}` : ""}
${brandVoice?.preferred_cta ? `Preferred CTA style: ${brandVoice.preferred_cta}` : ""}
${brandVoice?.email_sign_off ? `Sign off: ${brandVoice.email_sign_off}` : ""}
${brandVoice?.extra_context ? `Brand context: ${brandVoice.extra_context}` : ""}

Return ONLY valid JSON (no markdown):
{
  "subject": "compelling email subject (max 60 chars)",
  "preview_text": "preview text shown in inbox (max 90 chars)",
  "headline": "main email headline (max 60 chars)",
  "subheadline": "supporting line under headline (max 80 chars, optional)",
  "greeting": "personalised greeting line e.g. 'Dear [First Name],'",
  "paragraphs": ["paragraph 1", "paragraph 2", "paragraph 3"],
  "bullet_points": ["key point 1", "key point 2", "key point 3"],
  "cta_text": "button text (max 30 chars)",
  "cta_url": "${registrationUrl || "#"}",
  "sign_off": "sign off line e.g. 'Best regards,'",
  "plain_text": "full plain text version of email"
}`;

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const aiData = await aiRes.json();
    const rawText = aiData.content?.[0]?.text || "";
    const cleanText = rawText.replace(/```json|```/g, "").trim();
    const content = JSON.parse(cleanText);

    // Build table-based HTML (Outlook compatible)
    const bulletHtml = content.bullet_points?.length
      ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
          <tr><td>
            ${content.bullet_points.map(bp => `
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
                <tr>
                  <td width="20" valign="top" style="color:${colors.primary};font-size:16px;line-height:22px;">•</td>
                  <td style="font-family:Arial,sans-serif;font-size:15px;line-height:22px;color:${colors.text};">${bp}</td>
                </tr>
              </table>`).join("")}
          </td></tr>
        </table>` : "";

    const eventDetailHtml = (eventDate || eventTime || location) ? `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f9fa;border-radius:8px;margin:20px 0;">
        <tr><td style="padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            ${eventDate ? `<tr><td style="padding:4px 0;font-family:Arial,sans-serif;font-size:14px;color:#666;">📅&nbsp;&nbsp;<strong style="color:${colors.text};">Date:</strong>&nbsp; ${eventDate}</td></tr>` : ""}
            ${eventTime ? `<tr><td style="padding:4px 0;font-family:Arial,sans-serif;font-size:14px;color:#666;">🕐&nbsp;&nbsp;<strong style="color:${colors.text};">Time:</strong>&nbsp; ${eventTime}</td></tr>` : ""}
            ${location ? `<tr><td style="padding:4px 0;font-family:Arial,sans-serif;font-size:14px;color:#666;">📍&nbsp;&nbsp;<strong style="color:${colors.text};">Location:</strong>&nbsp; ${location}</td></tr>` : ""}
          </table>
        </td></tr>
      </table>` : "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${content.subject}</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f0f0f0">
  <tr><td align="center" style="padding:24px 0;">
    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08);">
      
      <!-- HEADER -->
      <tr><td bgcolor="${colors.headerBg}" style="padding:40px 40px 32px;">
        ${headerImageUrl ? `<img src="${headerImageUrl}" width="520" alt="Event banner" style="display:block;width:100%;max-width:520px;border-radius:8px;margin-bottom:20px;">` : ""}
        <h1 style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:28px;font-weight:700;color:${colors.accent};line-height:1.2;">${content.headline}</h1>
        ${content.subheadline ? `<p style="margin:0;font-family:Arial,sans-serif;font-size:16px;color:${colors.accent === "#fff" ? "rgba(255,255,255,0.75)" : "#666"};line-height:1.5;">${content.subheadline}</p>` : ""}
      </td></tr>

      <!-- BODY -->
      <tr><td style="padding:36px 40px;">
        ${content.greeting ? `<p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:16px;color:${colors.text};">${content.greeting}</p>` : ""}
        ${content.paragraphs?.map(p => `<p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:${colors.text};">${p}</p>`).join("") || ""}
        ${eventDetailHtml}
        ${bulletHtml}
        ${bodyImageUrl ? `<img src="${bodyImageUrl}" width="520" alt="" style="display:block;width:100%;max-width:520px;border-radius:8px;margin:20px 0;">` : ""}
        
        <!-- CTA BUTTON -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
          <tr><td align="center">
            <a href="${content.cta_url || "#"}" style="display:inline-block;padding:14px 36px;background:${colors.primary};color:${colors.primary === "#111" ? "#fff" : colors.accent};font-family:Arial,sans-serif;font-size:16px;font-weight:700;text-decoration:none;border-radius:8px;">${content.cta_text || "Learn More"}</a>
          </td></tr>
        </table>

        <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;color:${colors.text};">${content.sign_off || "Best regards,"}</p>
        <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:15px;font-weight:600;color:${colors.text};">${orgName || "The Event Team"}</p>
      </td></tr>

      <!-- FOOTER IMAGE -->
      ${footerImageUrl ? `<tr><td style="padding:0 40px 24px;"><img src="${footerImageUrl}" width="520" alt="" style="display:block;width:100%;max-width:520px;border-radius:6px;"></td></tr>` : ""}

      <!-- FOOTER -->
      <tr><td bgcolor="#f8f8f8" style="padding:20px 40px;border-top:1px solid #eee;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-family:Arial,sans-serif;font-size:12px;color:#999;">© ${new Date().getFullYear()} ${orgName || "evara"}. All rights reserved.</td>
            <td align="right" style="font-family:Arial,sans-serif;font-size:12px;color:#999;"><a href="https://evara-tau.vercel.app/unsubscribe" style="color:#999;text-decoration:underline;">Unsubscribe</a></td>
          </tr>
        </table>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

    // Save to Supabase if eventId provided
    let campaignId = null;
    if (eventId && companyId) {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data } = await supabase.from("email_campaigns").insert({
        event_id: eventId,
        company_id: companyId,
        name: `${content.subject}`,
        subject: content.subject,
        email_type: emailType,
        template_style: templateStyle,
        html_content: html,
        plain_text: content.plain_text,
        status: "draft",
        segment: "all",
      }).select("id").single();
      campaignId = data?.id;
    }

    return new Response(JSON.stringify({
      success: true,
      subject: content.subject,
      preview_text: content.preview_text,
      html,
      plain_text: content.plain_text,
      content,
      campaign_id: campaignId,
      brand_voice_applied: !!brandVoice,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
