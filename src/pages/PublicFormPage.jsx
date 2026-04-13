import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard, Mail, Globe, FileText, Users, Calendar,
  Settings, Bell, Search, Download, Share2, Plus, Zap,
  Shield, ChevronDown, Sparkles, X, Phone,
  LogOut, AlertCircle, CheckCircle, Send, Star, Eye, Upload, Image as ImageIcon,
  QrCode, BarChart3, BarChart2, Megaphone, UserCheck, UserCheck2,
  Layers, Layout, Link, ExternalLink, ClipboardList, TrendingUp,
  Radio, ChevronRight, ChevronLeft, Edit2, Trash2, Copy, Check, Clock,
  Filter, MapPin, Users2, ArrowRight, ArrowLeft, RefreshCw, MoreHorizontal,
  Hash, Globe2, Linkedin, Twitter, Instagram
} from "lucide-react";
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY, ANON_KEY, getSender } from "../lib/evara";
import { buildEmailHtml } from "../lib/utils";
import {Spin, Alert, Inp, ViewHint, ScoreBadge, ImageUploadZone, isBusinessEmail, C} from "../components/Shared";

// PublicFormPage
function PublicFormPage({ token }) {
  const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZGRwanNndHdibG1rZ3hxeXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODk5NTAsImV4cCI6MjA4OTY2NTk1MH0.x5BOfQRzn-F_tvUJv3mHRmfdOZiklyMkGzmPfRYoII4";
  const [form, setForm] = useState(null);
  const [event, setEvent] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [landingPage, setLandingPage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data: f } = await supabase.from("forms").select("*, events(*), companies(name, brand_color, logo_url)").eq("share_token", token).single();
      if (!f) { setError("Form not found or no longer active."); setLoading(false); return; }
      if (!f.is_active) { setError("This form is no longer accepting responses."); setLoading(false); return; }
      setForm(f);
      setEvent(f.events);
      // Load landing page branding
      if (f.events?.id) {
        const { data: lp } = await supabase.from("landing_pages").select("headline,brand_color,template,about_text,organiser").eq("event_id", f.events.id).eq("page_type","event").maybeSingle();
        if (lp) setLandingPage(lp);
      }
      setLoading(false);
    };
    load();
  }, [token]);

  const isFeedback = form?.form_type === "feedback";

  const submit = async () => {
    if (!form) return;
    
    // Only validate business email for registration forms, not feedback
    if (!isFeedback) {
      const emailFieldCheck = form.fields?.find(f => f.type === "email");
      const emailValueCheck = answers[emailFieldCheck?.id] || "";
      if (emailValueCheck && !isBusinessEmail(emailValueCheck)) {
        setSubmitError("Please use a business email address. Personal emails (Gmail, Yahoo, Hotmail, Rediffmail, etc.) are not accepted for event registration.");
        return;
      }
    }
    
    setSubmitting(true);
    try {
      const emailField = form.fields?.find(f => f.type === "email");
      const firstField = form.fields?.find(f => f.label?.toLowerCase().includes("first"));
      const lastField = form.fields?.find(f => f.label?.toLowerCase().includes("last"));
      const email = answers[emailField?.id] || "";
      const firstName = answers[firstField?.id] || "";
      const lastName = answers[lastField?.id] || "";

      // Upsert contact (skip for feedback-only forms with no email field)
      let contactId = null;
      if (email) {
        const { data: c } = await supabase.from("contacts").upsert({
          email: email.toLowerCase().trim(),
          first_name: firstName,
          last_name: lastName,
          company_id: form.company_id,
          source: isFeedback ? "feedback" : "form",
          // Consent: set opted_in=true when registering via form
          // Only update if not already unsubscribed
          ...(!isFeedback ? {
            opted_in: true,
            consent_timestamp: new Date().toISOString(),
            consent_source: "form",
          } : {}),
        }, { onConflict: "company_id,email" }).select("id").single();
        contactId = c?.id;

        // Add to event contacts as confirmed (registration only, not feedback)
        if (contactId && form.event_id && !isFeedback) {
          await supabase.from("event_contacts").upsert({
            contact_id: contactId,
            event_id: form.event_id,
            company_id: form.company_id,
            status: "confirmed",
          }, { onConflict: "event_id,contact_id" });
        }
      }

      // Save submission
      await supabase.from("form_submissions").insert({
        form_id: form.id,
        event_id: form.event_id,
        company_id: form.company_id,
        contact_id: contactId,
        submitter_email: email,
        responses: answers,
        submitted_at: new Date().toISOString(),
      });

      // Send confirmation email only for registration forms (not feedback)
      if (email && contactId && !isFeedback) {
        try {
          await fetch(`${SUPABASE_URL}/functions/v1/send-triggered-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${ANON_KEY}` },
            body: JSON.stringify({
              contacts: [{ email, first_name: firstName, last_name: lastName, unsubscribed: false }],
              triggerType: "confirmation",
              eventName: event?.name || "the event",
              eventDate: event?.event_date ? new Date(event.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "",
              eventTime: event?.event_time || "",
              location: event?.location || "",
              orgName: form?.companies?.name || "evara",
            })
          });
        } catch(e) { console.log("Confirmation email failed:", e.message); }
      }

      setSubmitted(true);
    } catch(e) {
      setError("Submission failed. Please try again.");
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F2F2F7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ fontSize: 14, color: "#666" }}>Loading form…</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#F2F2F7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: 400, padding: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#111", marginBottom: 8 }}>Form unavailable</div>
        <div style={{ fontSize: 14, color: "#666" }}>{error}</div>
      </div>
    </div>
  );

  if (submitted) {
    const isFeedbackSubmit = form?.form_type === "feedback";
    return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0A1628 0%, #1a2a4a 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 460, width: "100%", padding: "48px 40px", background: "#fff", borderRadius: 20, boxShadow: "0 24px 64px rgba(0,0,0,.25)" }}>
        <div style={{ width: 72, height: 72, background: isFeedbackSubmit ? "#E8F5E9" : "#E8F5E9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 20px" }}>
          {isFeedbackSubmit ? "🙏" : "✅"}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 10 }}>
          {isFeedbackSubmit ? "Thank you for your feedback!" : "You're confirmed!"}
        </div>
        <div style={{ fontSize: 15, color: "#666", lineHeight: 1.6, marginBottom: 16 }}>
          {isFeedbackSubmit
            ? `Your response has been recorded. We really appreciate you taking the time to share your thoughts on ${event?.name}.`
            : `Thanks for registering for ${event?.name}. A confirmation email is on its way to you.`}
        </div>
        {!isFeedbackSubmit && (event?.event_date || event?.location) && (
          <div style={{ background: "#F8F9FA", borderRadius: 10, padding: "14px 18px", marginBottom: 16, textAlign: "left" }}>
            {event?.event_date && <div style={{ fontSize: 14, color: "#333", marginBottom: 6 }}>📅 {new Date(event.event_date).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>}
            {event?.event_time && <div style={{ fontSize: 14, color: "#333", marginBottom: 6 }}>🕐 {event.event_time}</div>}
            {event?.location && <div style={{ fontSize: 14, color: "#333" }}>📍 {event.location}</div>}
          </div>
        )}
        {!isFeedbackSubmit && event && event.event_date && (
          <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event?.name||"Event")}&dates=${(event.event_date||"").replace(/-/g,"")}&details=${encodeURIComponent((event?.description||"")+" "+window.location.href)}&location=${encodeURIComponent(event?.location||"")}`}
              target="_blank" rel="noopener"
              style={{ fontSize: 13, padding: "8px 20px", background: "#0A84FF", color: "#fff", borderRadius: 20, textDecoration: "none", fontWeight: 500 }}>
              📅 Add to Calendar
            </a>
          </div>
        )}
        <div style={{ marginTop: 20, fontSize: 11, color: "#ccc" }}>🔒 Powered by evara</div>
      </div>
    </div>
  );
  }

  const requiredIds = form.fields?.filter(f => f.required).map(f => f.id) || [];
  const allFilled = requiredIds.every(id => answers[id]?.toString().trim());

  return (
    <div style={{ minHeight: "100vh", background: "#F2F2F7", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Branded hero header */}
      {(() => {
        const accent = landingPage?.brand_color || "#0A84FF";
        const isDark = landingPage?.template !== "minimal" && landingPage?.template !== "light" && landingPage?.template !== "editorial";
        const heroBg = isDark ? "#0D0D0F" : "#fff";
        const heroText = isDark ? "#F5F5F7" : "#111";
        const heroSub = isDark ? "rgba(255,255,255,0.6)" : "#555";
        return (
          <div style={{ background: heroBg, borderBottom: `3px solid ${accent}`, padding: "28px 20px 24px" }}>
            <div style={{ maxWidth: 560, margin: "0 auto" }}>
              {/* Organiser */}
              <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 12 }}>
                {event?.companies?.name || landingPage?.organiser || ""}
              </div>
              {/* Event name */}
              <h1 style={{ fontSize: 28, fontWeight: 800, color: heroText, margin: "0 0 8px", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
                {landingPage?.headline || event?.name}
              </h1>
              {landingPage?.subheadline && (
                <p style={{ fontSize: 15, color: heroSub, margin: "6px 0 0", lineHeight: 1.5, maxWidth: 480 }}>{landingPage.subheadline}</p>
              )}
              {/* Date · Time · Location */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 10 }}>
                {event?.event_date && <span style={{ fontSize: 13, color: heroSub, display: "flex", alignItems: "center", gap: 5 }}>📅 {new Date(event.event_date).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</span>}
                {event?.event_time && <span style={{ fontSize: 13, color: heroSub, display: "flex", alignItems: "center", gap: 5 }}>🕐 {event.event_time}</span>}
                {event?.location && <span style={{ fontSize: 13, color: heroSub, display: "flex", alignItems: "center", gap: 5 }}>📍 {event.location}</span>}
              </div>
              {/* About text */}
              {landingPage?.about_text && (
                <p style={{ fontSize: 13, color: heroSub, marginTop: 12, lineHeight: 1.65, maxWidth: 480 }}>{landingPage.about_text}</p>
              )}
            </div>
          </div>
        );
      })()}

      {/* Form */}
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px 60px" }}>
        {event && (
          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #E5E5E5" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#0A84FF", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>{isFeedback ? "Feedback Form" : "Registration"}</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111", marginBottom: 8, letterSpacing: "-0.5px" }}>{event.name}</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {event.event_date && <div style={{ fontSize: 13, color: "#555" }}>📅 {new Date(event.event_date).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>}
              {event.event_time && <div style={{ fontSize: 13, color: "#555" }}>🕐 {event.event_time}</div>}
              {event.location && <div style={{ fontSize: 13, color: "#555" }}>📍 {event.location}</div>}
            </div>
          </div>
        )}
        <h2 style={{ fontSize: 17, fontWeight: 600, color: "#111", marginBottom: 4, letterSpacing: "-0.3px" }}>{form.name}</h2>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>{isFeedback ? "Share your thoughts — it only takes a minute." : "Fill in your details to register your place."}</p>

        {/* Progress bar */}
        {form.fields?.length > 0 && (() => {
          const filled = (form.fields||[]).filter(f => answers[f.id]?.toString().trim()).length;
          const total = (form.fields||[]).length;
          const pct = Math.round(filled/total*100);
          return (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, fontSize:12, color:"#888" }}>
                <span>{filled} of {total} fields</span>
                <span style={{ color: pct===100?"#30D158":"#0A84FF", fontWeight:600 }}>{pct===100?"Ready to submit ✓":`${pct}% complete`}</span>
              </div>
              <div style={{ height:4, background:"#E5E5E7", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:pct===100?"#30D158":"#0A84FF", borderRadius:2, transition:"width .3s" }} />
              </div>
            </div>
          );
        })()}

        {form.fields?.map(field => (
          <div key={field.id} style={{ marginBottom: 20 }}>
            {field.type !== "checkbox" && (
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#111", marginBottom: 7 }}>
                {field.label}
                {field.required && <span style={{ color: "#0A84FF", marginLeft: 3 }}>*</span>}
              </label>
            )}
            {(field.type === "text" || field.type === "email" || field.type === "phone") && (<>
              <input
                type={field.type}
                value={answers[field.id] || ""}
                onChange={e => setAnswers(p => ({ ...p, [field.id]: e.target.value }))}
                onKeyDown={e => { if (e.key === "Enter" && allFilled && !submitting) submit(); }}
                placeholder={`Enter ${field.label.toLowerCase()}…`}
                style={{ width: "100%", height: 44, borderRadius: 10, border: "1.5px solid #D1D1D6", padding: "0 14px", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border-color .15s" }}
                onFocus={e => { e.target.style.borderColor = "#0A84FF"; setSubmitError(""); }}
                onBlur={e => e.target.style.borderColor = "#D1D1D6"}
              />
              {field.type === "email" && answers[field.id]?.includes("@") && !isFeedback && !isBusinessEmail(answers[field.id]) && (
                <div style={{ fontSize: 12, color: "#FF453A", marginTop: 5 }}>
                  ⚠️ Personal emails (Gmail, Yahoo, Hotmail, Rediffmail etc.) are not accepted — use your work email
                </div>
              )}
              {field.type === "email" && answers[field.id]?.includes("@") && !isFeedback && isBusinessEmail(answers[field.id]) && (
                <div style={{ fontSize: 12, color: "#30D158", marginTop: 5 }}>✅ Business email accepted</div>
              )}
            </>)}
            {field.type === "textarea" && (
              <textarea
                value={answers[field.id] || ""}
                onChange={e => setAnswers(p => ({ ...p, [field.id]: e.target.value }))}
                placeholder="Type your response…"
                rows={3}
                style={{ width: "100%", borderRadius: 10, border: "1.5px solid #D1D1D6", padding: "10px 14px", fontSize: 15, outline: "none", resize: "vertical", lineHeight: 1.5, boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "#0A84FF"}
                onBlur={e => e.target.style.borderColor = "#D1D1D6"}
              />
            )}
            {field.type === "radio" && (field.options || []).map(opt => (
              <label key={opt} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, cursor: "pointer", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${answers[field.id] === opt ? "#0A84FF" : "#D1D1D6"}`, background: answers[field.id] === opt ? "#F0F7FF" : "#fff", transition: "all .12s" }}
                onClick={() => setAnswers(p => ({ ...p, [field.id]: opt }))}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${answers[field.id] === opt ? "#0A84FF" : "#C7C7CC"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {answers[field.id] === opt && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0A84FF" }} />}
                </div>
                <span style={{ fontSize: 14, color: "#333" }}>{opt}</span>
              </label>
            ))}
            {field.type === "select" && (
              <select value={answers[field.id] || ""} onChange={e => setAnswers(p => ({ ...p, [field.id]: e.target.value }))}
                style={{ width: "100%", height: 44, borderRadius: 10, border: "1.5px solid #D1D1D6", padding: "0 14px", fontSize: 15, outline: "none", background: "#fff", cursor: "pointer", boxSizing: "border-box" }}>
                <option value="">Select…</option>
                {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
            {field.type === "dietary" && (
              <select value={answers[field.id] || ""} onChange={e => setAnswers(p => ({ ...p, [field.id]: e.target.value }))}
                style={{ width: "100%", height: 44, borderRadius: 10, border: "1.5px solid #D1D1D6", padding: "0 14px", fontSize: 15, outline: "none", background: "#fff", cursor: "pointer", boxSizing: "border-box" }}>
                <option value="">No dietary requirements</option>
                {["Vegetarian","Vegan","Gluten-free","Halal","Kosher","Nut allergy","Dairy-free","Other — please specify"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
            {field.type === "rating" && (
              <div style={{ display: "flex", gap: 8 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setAnswers(p => ({ ...p, [field.id]: n }))}
                    style={{ flex: 1, height: 44, borderRadius: 10, border: `2px solid ${answers[field.id] >= n ? "#0A84FF" : "#D1D1D6"}`, background: answers[field.id] >= n ? "#0A84FF10" : "#fff", fontSize: 20, cursor: "pointer", color: answers[field.id] >= n ? "#0A84FF" : "#C7C7CC", transition: "all .12s" }}>
                    ★
                  </button>
                ))}
              </div>
            )}
            {field.type === "date" && (
              <input type="date" value={answers[field.id] || ""} onChange={e => setAnswers(p => ({ ...p, [field.id]: e.target.value }))}
                style={{ width: "100%", height: 44, borderRadius: 10, border: "1.5px solid #D1D1D6", padding: "0 14px", fontSize: 15, outline: "none", background: "#fff", boxSizing: "border-box" }} />
            )}
            {field.type === "number" && (
              <input type="number" value={answers[field.id] || ""} onChange={e => setAnswers(p => ({ ...p, [field.id]: e.target.value }))}
                style={{ width: "100%", height: 44, borderRadius: 10, border: "1.5px solid #D1D1D6", padding: "0 14px", fontSize: 15, outline: "none", background: "#fff", boxSizing: "border-box" }} />
            )}
            {field.type === "checkbox" && (
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: field.label?.toLowerCase().includes("consent") ? "12px 14px" : "0", background: field.label?.toLowerCase().includes("consent") ? "#F0F4FF" : "transparent", borderRadius: field.label?.toLowerCase().includes("consent") ? 8 : 0, border: field.label?.toLowerCase().includes("consent") ? "1px solid #0A84FF25" : "none" }}
                onClick={() => setAnswers(p => ({ ...p, [field.id]: !p[field.id] }))}>
                <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${answers[field.id] ? "#0A84FF" : "#C7C7CC"}`, background: answers[field.id] ? "#0A84FF" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all .12s" }}>
                  {answers[field.id] && <span style={{ color: "#fff", fontSize: 13, lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13, color: "#333", lineHeight: 1.5 }}>
                  {field.label}
                  {field.required && <span style={{ color: "#FF453A", marginLeft: 3 }}>*</span>}
                  {field.label?.toLowerCase().includes("consent") && (
                    <span style={{ display: "block", fontSize: 11, color: "#8E8E93", marginTop: 3 }}>
                      You can unsubscribe at any time. We will never share your data with third parties.
                    </span>
                  )}
                </span>
              </label>
            )}
          </div>
        ))}

        <button onClick={submit} disabled={submitting || !allFilled}
          style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: submitting || !allFilled ? "#C7C7CC" : "#0A84FF", color: "#fff", fontSize: 16, fontWeight: 600, cursor: submitting || !allFilled ? "not-allowed" : "pointer", marginTop: 8, transition: "background .15s" }}>
          {submitting ? <><span style={{ display: "inline-block", animation: "spin 1s linear infinite", marginRight: 6 }}>⟳</span>Submitting…</> : allFilled ? (isFeedback ? "Submit Feedback →" : "Register Now →") : "Complete all required fields"}
        </button>

        {submitError && (
          <div style={{ background: "#FF453A15", border: "1px solid #FF453A40", borderRadius: 8, padding: "10px 14px", marginTop: 12, fontSize: 13, color: "#FF453A", lineHeight: 1.5 }}>
            ⚠️ {submitError}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#AEAEB2" }}>
          🔒 Your data is encrypted and secure{!isFeedback ? " · A confirmation email will be sent to you" : ""} · Powered by evara
        </div>
      </div>
    </div>
  );
}

// ─── PUBLIC SELF CHECK-IN PAGE ────────────────────────────────

export default PublicFormPage;