import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EMAIL_TYPES = [
  { type: "save_the_date", label: "Save the Date", timing: "8 weeks before" },
  { type: "invitation",    label: "Invitation",    timing: "6 weeks before" },
  { type: "reminder",      label: "Reminder",      timing: "2 weeks before" },
  { type: "byo",           label: "What to Bring", timing: "3 days before" },
  { type: "day_of",        label: "Day-of Details", timing: "Day of event" },
  { type: "thank_you",     label: "Thank You",     timing: "Day after" },
  { type: "confirmation",  label: "Follow-up",     timing: "1 week after" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { eventId, eventName, eventDate, eventTime, location, description, orgName, tone, companyId } = body;
    
    const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_KEY) throw new Error("ANTHROPIC_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const campaigns = [];

    for (const emailType of EMAIL_TYPES) {
      const prompt = `Generate a ${emailType.label} email for this event.

Event: ${eventName}
Date: ${eventDate}
Time: ${eventTime || "TBC"}
Location: ${location || "TBC"}
Description: ${description || ""}
Organisation: ${orgName || ""}
Tone: ${tone || "professional and exciting"}
Email type: ${emailType.label} (sent ${emailType.timing})

Return ONLY valid JSON:
{
  "subject": "compelling subject line",
  "preview_text": "short preview",
  "headline": "email headline",
  "body": "2-3 paragraphs of email body text",
  "cta_text": "button text",
  "plain_text": "plain text version"
}`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 600, messages: [{ role: "user", content: prompt }] }),
      });

      const data = await res.json();
      const text = data.content?.[0]?.text?.replace(/```json|```/g, "").trim();
      const content = JSON.parse(text);

      // Save to DB
      const { data: cam } = await supabase.from("email_campaigns").insert({
        event_id: eventId,
        company_id: companyId,
        name: `${emailType.label} — ${eventName}`,
        subject: content.subject,
        email_type: emailType.type,
        template_style: "branded",
        html_content: `<h1>${content.headline}</h1><div>${content.body}</div><a href="#">${content.cta_text}</a>`,
        plain_text: content.plain_text,
        status: "draft",
        segment: "all",
      }).select().single();

      campaigns.push({ ...cam, content });
    }

    return new Response(JSON.stringify({ success: true, campaigns, count: campaigns.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
