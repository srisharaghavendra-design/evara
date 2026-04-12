import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

const buildHtml = (headline, bodyHtml, cta, orgName, eventDate, location) =>
  `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden"><tr><td style="background:#0A1628;padding:32px;text-align:center"><h1 style="margin:0;color:#fff;font-size:26px;font-weight:700">${headline}</h1>${eventDate ? `<p style="margin:12px 0 0;color:rgba(255,255,255,0.65);font-size:14px">📅 ${eventDate}${location ? ` · 📍 ${location}` : ""}</p>` : ""}</td></tr><tr><td style="padding:32px">${bodyHtml}<table width="100%" style="margin-top:24px"><tr><td align="center"><a href="{{REGISTRATION_URL}}" style="display:inline-block;padding:13px 36px;background:#0A84FF;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px">${cta} →</a></td></tr></table></td></tr><tr><td style="background:#f8f8f8;padding:16px 32px;border-top:1px solid #eee"><table width="100%"><tr><td style="font-size:11px;color:#aaa">© ${new Date().getFullYear()} ${orgName}</td><td align="right" style="font-size:11px"><a href="{{UNSUBSCRIBE_URL}}" style="color:#aaa">Unsubscribe</a></td></tr></table></td></tr></table></td></tr></table></body></html>`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    if (!ANTHROPIC_KEY) throw new Error("ANTHROPIC_API_KEY not set");
    const { eventName, eventDate, location, description, audience, tone, eventId, companyId } = await req.json();
    if (!eventName) throw new Error("eventName required");

    const dateFmt = eventDate ? new Date(eventDate).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "TBC";

    const prompt = `Expert event marketing copywriter. Generate 7-email campaign JSON only (no markdown).
Event: ${eventName} | Date: ${dateFmt} | Location: ${location || "TBC"} | Audience: ${audience || "professionals"} | Tone: ${tone || "professional"}
Description: ${description || ""}

Return JSON:
{"campaign_name":"","emails":{"save_the_date":{"subject":"","headline":"","body":"","cta":"Save Your Spot"},"invitation":{"subject":"","headline":"","body":"","cta":"Register Now"},"reminder_week":{"subject":"","headline":"","body":"","cta":"Secure Your Place"},"reminder_day":{"subject":"","headline":"","body":"","cta":"See You Tomorrow"},"confirmation":{"subject":"","headline":"","body":"","cta":"Add to Calendar"},"byo":{"subject":"","headline":"","body":"","cta":"View Details"},"thank_you":{"subject":"","headline":"","body":"","cta":"Give Feedback"}},"landing_page":{"headline":"","subheadline":"","about_text":"","cta_text":"Register Now"},"social_linkedin":""}
Rules: subjects<55 chars, body 2-3 sentences, plain text only`;

    const ai = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2500, messages: [{ role: "user", content: prompt }] }),
    });
    if (!ai.ok) throw new Error(`AI ${ai.status}`);
    const aiData = await ai.json();
    const raw = (aiData.content?.[0]?.text ?? "").replace(/```json|```/g, "").trim();
    let data;
    try { data = JSON.parse(raw); } catch { const m = raw.match(/\{[\s\S]*\}/); if (!m) throw new Error("bad json"); data = JSON.parse(m[0]); }

    const schedule = [
      { type: "save_the_date", label: "Save the Date", offset: -56 },
      { type: "invitation", label: "Invitation", offset: -28 },
      { type: "reminder_week", label: "1-Week Reminder", offset: -7 },
      { type: "reminder_day", label: "Day Before", offset: -1 },
      { type: "confirmation", label: "Confirmation", offset: 0 },
      { type: "byo", label: "What to Bring", offset: -1 },
      { type: "thank_you", label: "Thank You", offset: 1 },
    ];

    const htmlEmails = {};
    for (const [type, copy] of Object.entries(data.emails || {})) {
      const showDate = ["save_the_date","invitation","reminder_week","reminder_day"].includes(type);
      const bodyHtml = `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#333">Dear [First Name],</p><p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#333">${copy.body || ""}</p>`;
      htmlEmails[type] = {
        subject: copy.subject || `${type} - ${eventName}`,
        html: buildHtml(copy.headline || eventName, bodyHtml, copy.cta || "Learn More", "Your Organisation", showDate ? dateFmt : null, type === "byo" ? location : null),
        plain_text: `Dear [First Name],\n\n${copy.body || ""}\n\n${copy.cta}: {{REGISTRATION_URL}}\n\n---\nUnsubscribe: {{UNSUBSCRIBE_URL}}`,
      };
    }

    const savedIds = {};
    if (eventId && companyId) {
      const sb = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
      const edObj = eventDate ? new Date(eventDate) : null;
      for (const s of schedule) {
        const e = htmlEmails[s.type]; if (!e) continue;
        let sendAt = null;
        if (edObj) { const d = new Date(edObj); d.setDate(d.getDate() + s.offset); if (d > new Date()) sendAt = d.toISOString(); }
        const { data: cam } = await sb.from("email_campaigns").insert({ event_id: eventId, company_id: companyId, name: `${s.label} - ${eventName}`, email_type: s.type.includes("reminder") ? "reminder" : s.type, subject: e.subject, html_content: e.html, plain_text: e.plain_text, scheduled_at: sendAt, status: "draft", segment: "all" }).select("id").single();
        if (cam) savedIds[s.type] = cam.id;
      }
      const lp = data.landing_page;
      if (lp) await sb.from("landing_pages").upsert({ event_id: eventId, company_id: companyId, headline: lp.headline, subheadline: lp.subheadline, about_text: lp.about_text, cta_text: lp.cta_text, slug: eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-"), template: "corporate", is_published: false }, { onConflict: "event_id" });
    }

    return new Response(JSON.stringify({ success: true, campaign: { ...data, emails: htmlEmails }, savedIds }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
