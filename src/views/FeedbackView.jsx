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
import {Spin, Alert, Inp, ViewHint, ScoreBadge, ImageUploadZone, C} from "../components/Shared";

// AddCustomQuestion + FeedbackView
function AddCustomQuestion({ feedbackForm, setFeedbackForm, supabase, fire }) {
  const [show, setShow] = useState(false);
  const [qLabel, setQLabel] = useState("");
  const [qType, setQType] = useState("text");
  const [qOptions, setQOptions] = useState("Option 1\nOption 2\nOption 3");
  const [qRequired, setQRequired] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!qLabel.trim()) return;
    setSaving(true);
    const newField = {
      id: Date.now(),
      type: qType,
      label: qLabel.trim(),
      required: qRequired,
      options: (qType === "radio" || qType === "select") ? qOptions.split("\n").map(o => o.trim()).filter(Boolean) : [],
    };
    const newFields = [...(feedbackForm.fields || []), newField];
    await supabase.from("forms").update({ fields: newFields }).eq("id", feedbackForm.id);
    setFeedbackForm(p => ({ ...p, fields: newFields }));
    fire("✅ Question added");
    setQLabel(""); setQType("text"); setQOptions("Option 1\nOption 2\nOption 3"); setQRequired(false); setShow(false);
    setSaving(false);
  };

  if (!show) return (
    <button onClick={() => setShow(true)} style={{ width: "100%", marginTop: 10, padding: "7px", borderRadius: 6, border: `1px dashed ${C.blue}40`, background: `${C.blue}06`, color: C.blue, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
      + Add custom question
    </button>
  );

  return (
    <div style={{ marginTop: 10, background: C.bg, borderRadius: 8, border: `1px solid ${C.blue}30`, padding: "12px 14px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 10 }}>New question</div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Question text *</label>
        <input value={qLabel} onChange={e => setQLabel(e.target.value)} autoFocus placeholder="e.g. How did you hear about us?"
          style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: "7px 10px", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Type</label>
          <select value={qType} onChange={e => setQType(e.target.value)}
            style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: "7px 8px", fontSize: 12, outline: "none" }}>
            <option value="text">Short text</option>
            <option value="textarea">Long text</option>
            <option value="radio">Multiple choice</option>
            <option value="select">Dropdown</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted, cursor: "pointer" }}>
            <input type="checkbox" checked={qRequired} onChange={e => setQRequired(e.target.checked)} style={{ accentColor: C.blue, cursor: "pointer" }} />
            Required
          </label>
        </div>
      </div>
      {(qType === "radio" || qType === "select") && (
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Options (one per line)</label>
          <textarea value={qOptions} onChange={e => setQOptions(e.target.value)} rows={4}
            style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: "7px 10px", fontSize: 12, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
        </div>
      )}
      <div style={{ display: "flex", gap: 7 }}>
        <button onClick={() => { setShow(false); setQLabel(""); }} style={{ flex: 1, padding: "7px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, cursor: "pointer" }}>Cancel</button>
        <button onClick={save} disabled={!qLabel.trim() || saving}
          style={{ flex: 2, padding: "7px", borderRadius: 6, border: "none", background: qLabel.trim() ? C.blue : C.border, color: "#fff", fontSize: 12, fontWeight: 600, cursor: qLabel.trim() ? "pointer" : "default" }}>
          {saving ? "Saving…" : "Add Question"}
        </button>
      </div>
    </div>
  );
}

// ─── FEEDBACK VIEW ────────────────────────────────────────────
// AI-powered post-event feedback collection and analysis
function Sec({ label, children }) {
  return (
    <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 14 }}>
      <div style={{ fontSize: 10.5, fontWeight: 500, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 11 }}>{label}</div>
      {children}
    </div>
  );
}

function FeedbackView({ supabase, profile, activeEvent, fire }) {
  const [tab, setTab] = useState("collect"); // collect | analyse | report
  const [submissions, setSubmissions] = useState([]);
  const [analysing, setAnalysing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [sending, setSending] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState(null);
  const [shareLink, setShareLink] = useState("");

  useEffect(() => {
    if (!activeEvent || !profile) return;
    // Load existing feedback form for this event
    supabase.from("forms").select("*").eq("event_id", activeEvent.id).eq("form_type", "feedback")
      .maybeSingle().then(({ data }) => {
        if (data) {
          setFeedbackForm(data);
          setShareLink(`${window.location.origin}/form/${data.share_token}`);
          // Load submissions
          supabase.from("form_submissions").select("*").eq("form_id", data.id)
            .order("submitted_at", { ascending: false })
            .then(({ data: subs }) => setSubmissions(subs || []));
        }
      });
  }, [activeEvent, profile]);

  const createFeedbackForm = async () => {
    if (!activeEvent || !profile) return;
    setSending(true);
    const feedbackFields = [
      { id: 1, type: "radio", label: "How would you rate this event overall?", required: true, options: ["⭐⭐⭐⭐⭐ Excellent", "⭐⭐⭐⭐ Very Good", "⭐⭐⭐ Good", "⭐⭐ Fair", "⭐ Poor"] },
      { id: 2, type: "radio", label: "How likely are you to recommend this event to a colleague?", required: true, options: ["10 - Extremely likely", "9", "8", "7", "6", "5 - Neutral", "4", "3", "2", "1 - Not at all"] },
      { id: 3, type: "textarea", label: "What did you enjoy most about the event?", required: false, options: [] },
      { id: 4, type: "textarea", label: "What could we improve for next time?", required: false, options: [] },
      { id: 5, type: "radio", label: "Would you attend our next event?", required: true, options: ["Yes, definitely", "Probably yes", "Not sure", "Probably not", "No"] },
      { id: 6, type: "text", label: "Any other comments or suggestions?", required: false, options: [] },
    ];
    const { data, error } = await supabase.from("forms").insert({
      event_id: activeEvent.id,
      company_id: profile.company_id,
      name: `${activeEvent.name} — Feedback`,
      fields: feedbackFields,
      form_type: "feedback",
      is_active: true,
    }).select().single();
    if (error) { fire(error.message, "err"); }
    else {
      setFeedbackForm(data);
      setShareLink(`${window.location.origin}/form/${data.share_token}`);
      fire("✅ Feedback form created!");
    }
    setSending(false);
  };

  const analyseWithAI = async () => {
    if (submissions.length === 0) { fire("No submissions to analyse yet", "err"); return; }
    setAnalysing(true);
    try {
      const responses = submissions.map(s => JSON.stringify(s.responses)).join("\n\n");
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1200,
          messages: [{
            role: "user",
            content: `Analyse these ${submissions.length} event feedback responses and return ONLY valid JSON:

Event: ${activeEvent.name}
Responses: ${responses.slice(0, 8000)}

Return this exact JSON structure:
{
  "nps": number (0-10 average from "likely to recommend" answers),
  "overall_rating": number (1-5 average),
  "sentiment": "positive" | "neutral" | "negative",
  "top_positives": ["phrase1", "phrase2", "phrase3"],
  "top_improvements": ["phrase1", "phrase2", "phrase3"],
  "would_attend_again": number (percentage),
  "key_quotes": ["quote1", "quote2"],
  "recommendations": ["action1", "action2", "action3"],
  "summary": "2-3 sentence executive summary"
}`
          }]
        })
      });
      const d = await res.json();
      const text = d.content?.[0]?.text?.replace(/```json|```/g, "").trim();
      setAnalysis(JSON.parse(text));
      fire("✅ AI analysis complete!");
      setTab("analyse");
    } catch(e) { fire("Analysis failed: " + e.message, "err"); }
    setAnalysing(false);
  };

  const copyReport = () => {
    if (!analysis) return;
    const report = `
POST-EVENT FEEDBACK REPORT
${activeEvent?.name}
${"=".repeat(40)}

SUMMARY
${analysis.summary}

KEY METRICS
• NPS Score: ${analysis.nps}/10
• Overall Rating: ${analysis.overall_rating}/5 ⭐
• Would attend again: ${analysis.would_attend_again}%
• Responses received: ${submissions.length}

TOP POSITIVES
${analysis.top_positives?.map(p => `✅ ${p}`).join("\n")}

AREAS FOR IMPROVEMENT
${analysis.top_improvements?.map(p => `⚠️ ${p}`).join("\n")}

ATTENDEE QUOTES
${analysis.key_quotes?.map(q => `"${q}"`).join("\n")}

RECOMMENDED ACTIONS
${analysis.recommendations?.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Generated by evara
`.trim();
    navigator.clipboard?.writeText(report);
    fire("📋 Report copied to clipboard!");
  };

  const npsColor = !analysis ? C.muted : analysis.nps >= 8 ? C.green : analysis.nps >= 6 ? C.amber : C.red;
  const ratingColor = !analysis ? C.muted : analysis.overall_rating >= 4 ? C.green : analysis.overall_rating >= 3 ? C.amber : C.red;

  if (!activeEvent) return (
    <div style={{ animation:"fadeUp .2s ease" }}>
      <div style={{ marginBottom:24 }}><h1 style={{ fontSize:24, fontWeight:600, letterSpacing:"-0.6px", color:C.text }}>Feedback Intelligence</h1>
        <p style={{ color:C.muted, fontSize:13, marginTop:4 }}>Collect, analyse, and act on post-event feedback with AI.</p></div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", paddingTop:60, gap:14, textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:4 }}>📝</div>
        <div style={{ fontSize:18, fontWeight:600, color:C.text }}>No event selected</div>
        <p style={{ fontSize:13, color:C.muted, maxWidth:340, lineHeight:1.6 }}>Select an event from the sidebar to create its feedback form and analyse responses.</p>
      </div>
    </div>
  );

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: C.text, letterSpacing: "-0.6px" }}>Feedback Intelligence</h1>
            {analysis?.nps !== undefined && (
              <div style={{ background: analysis.nps >= 50 ? C.green+"20" : analysis.nps >= 0 ? C.amber+"20" : C.red+"20", border: `1px solid ${analysis.nps >= 50 ? C.green : analysis.nps >= 0 ? C.amber : C.red}40`, borderRadius: 8, padding: "4px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: analysis.nps >= 50 ? C.green : analysis.nps >= 0 ? C.amber : C.red }}>{analysis.nps}</div>
                <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>NPS</div>
              </div>
            )}
          </div>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Collect, analyse, and act on post-event feedback with AI.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {submissions.length > 0 && (
            <>
            <button onClick={() => {
              const rows = ["Name,Email,Submitted At,...Responses"];
              submissions.forEach(s => {
                const name = s.event_contacts?.contacts?.first_name + " " + (s.event_contacts?.contacts?.last_name || "");
                const email = s.event_contacts?.contacts?.email || "";
                const date = new Date(s.created_at).toLocaleDateString("en-AU");
                const responses = Object.values(s.responses || {}).join(" | ");
                rows.push(`"${name}","${email}","${date}","${responses}"`);
              });
              const blob = new Blob([rows.join("\n")], { type: "text/csv" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `feedback_${activeEvent?.name?.replace(/\s+/g,"_")}.csv`;
              a.click();
              fire(`✅ Exported ${submissions.length} responses`);
            }} style={{ fontSize: 13, padding: "7px 16px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
              ↓ Export CSV
            </button>
            <button onClick={analyseWithAI} disabled={analysing}
              style={{ fontSize: 13, padding: "7px 16px", borderRadius: 7, border: "none", background: analysing ? C.raised : C.blue, color: analysing ? C.muted : "#fff", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              {analysing ? <><Spin size={12} />Analysing…</> : <><Sparkles size={13} />AI Analyse ({submissions.length})</>}
            </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 20, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 3, width: "fit-content" }}>
        {[{ id: "collect", label: "Collect Feedback" }, { id: "analyse", label: `AI Analysis${analysis ? " ✅" : ""}` }, { id: "report", label: "Report" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: tab === t.id ? C.raised : "transparent", color: tab === t.id ? C.text : C.muted, fontSize: 13, fontWeight: tab === t.id ? 500 : 400, cursor: "pointer" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* COLLECT TAB */}
      {tab === "collect" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            {!feedbackForm ? (
              <div style={{ background: C.card, borderRadius: 10, border: `1px dashed ${C.border}`, padding: 32, textAlign: "center" }}>
                <ClipboardList size={40} color={C.muted} strokeWidth={1} style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 15, fontWeight: 500, color: C.text, marginBottom: 8 }}>No feedback form yet</div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Create a pre-built NPS + feedback form for {activeEvent?.name}</div>
                <button onClick={createFeedbackForm} disabled={sending}
                  style={{ padding: "10px 24px", borderRadius: 7, border: "none", background: C.blue, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                  {sending ? "Creating…" : "Create Feedback Form"}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 4 }}>{feedbackForm.name}</div>
                  <div style={{ fontSize: 12, color: C.green, marginBottom: 14 }}>✅ {feedbackForm.fields?.length} questions · Active</div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Share link</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", fontSize: 11, color: C.sec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shareLink}</div>
                    <button onClick={() => { navigator.clipboard?.writeText(shareLink); fire("Link copied!"); }}
                      style={{ padding: "8px 14px", background: C.blue, color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>Copy</button>
                  </div>
                  <button onClick={() => window.open(shareLink, "_blank")} style={{ marginTop: 8, width: "100%", padding: "7px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 11, cursor: "pointer" }}>
                    👁 Preview form →
                  </button>
                  <div style={{ marginTop: 10, fontSize: 12, color: C.muted }}>
                    💡 Display this link on screens at the end of the event, and include it in your Thank You email.
                  </div>
                </div>

                {/* Custom question builder */}
                <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 10 }}>Questions ({feedbackForm.fields?.length})</div>
                  {(feedbackForm.fields || []).map((field, idx) => (
                    <div key={field.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 0", borderBottom: idx < feedbackForm.fields.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <span style={{ fontSize: 10, color: C.muted, marginTop: 2, flexShrink: 0, width: 16, textAlign: "center" }}>{idx + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: C.text }}>{field.label}</div>
                        <div style={{ fontSize: 10, color: C.muted, marginTop: 1, textTransform: "capitalize" }}>{field.type}{field.required ? " · required" : ""}</div>
                      </div>
                      <button onClick={async () => {
                        const newFields = feedbackForm.fields.filter((_, i) => i !== idx);
                        await supabase.from("forms").update({ fields: newFields }).eq("id", feedbackForm.id);
                        setFeedbackForm(p => ({ ...p, fields: newFields }));
                        fire("Question removed");
                      }} style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: C.red, cursor: "pointer", flexShrink: 0 }}>✕</button>
                    </div>
                  ))}

                  {/* Add custom question */}
                  <AddCustomQuestion feedbackForm={feedbackForm} setFeedbackForm={setFeedbackForm} supabase={supabase} fire={fire} />
                </div>

                <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 18 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: C.blue, marginBottom: 4 }}>{submissions.length}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Responses received</div>
                  {submissions.length > 0 && (
                    <button onClick={analyseWithAI} disabled={analysing}
                      style={{ marginTop: 12, width: "100%", padding: "9px", borderRadius: 6, border: "none", background: C.blue, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                      {analysing ? "Analysing with AI…" : "Analyse with AI →"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Embed code */}
          {feedbackForm && (
            <Sec label="Email template — Thank You with feedback link">
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Copy this into your Thank You email to collect feedback automatically.</div>
              <div style={{ background: C.bg, borderRadius: 7, border: `1px solid ${C.border}`, padding: 12, fontSize: 12, color: C.teal, fontFamily: "monospace", lineHeight: 1.7, marginBottom: 10 }}>
                {`<a href="${shareLink}" style="display:inline-block;padding:12px 28px;background:#0A84FF;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Share Your Feedback →</a>`}
              </div>
              <button onClick={() => { navigator.clipboard?.writeText(`<a href="${shareLink}" style="display:inline-block;padding:12px 28px;background:#0A84FF;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Share Your Feedback →</a>`); fire("Embed code copied!"); }}
                style={{ width: "100%", padding: "8px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, cursor: "pointer" }}>Copy embed code</button>
            </Sec>
          )}
        </div>
      )}

      {/* ANALYSE TAB */}
      {tab === "analyse" && (
        !analysis ? (
          <div style={{ background: C.card, borderRadius: 10, border: `1px dashed ${C.border}`, padding: 48, textAlign: "center", color: C.muted }}>
            <Sparkles size={36} strokeWidth={1} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14 }}>Collect responses first, then click "AI Analyse"</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Score cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {[
                { label: "NPS Score", val: `${analysis.nps}/10`, color: npsColor, note: analysis.nps >= 8 ? "Excellent" : analysis.nps >= 6 ? "Good" : "Needs work" },
                { label: "Overall Rating", val: `${analysis.overall_rating}/5`, color: ratingColor, note: "★".repeat(Math.round(analysis.overall_rating)) },
                { label: "Would Attend Again", val: `${analysis.would_attend_again}%`, color: C.green, note: `${submissions.length} responses` },
                { label: "Sentiment", val: analysis.sentiment, color: analysis.sentiment === "positive" ? C.green : analysis.sentiment === "neutral" ? C.amber : C.red, note: "" },
              ].map(s => (
                <div key={s.label} style={{ background: C.card, borderRadius: 10, padding: "16px", border: `1px solid ${C.border}`, borderTop: `2px solid ${s.color}40`, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: "-0.5px", textTransform: "capitalize" }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{s.note}</div>
                </div>
              ))}
            </div>

            {/* Analysis cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.green, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>✅ What Worked Well</div>
                {analysis.top_positives?.map((p, i) => (
                  <div key={i} style={{ fontSize: 13, color: C.sec, padding: "6px 0", borderBottom: i < analysis.top_positives.length - 1 ? `1px solid ${C.border}` : undefined }}>
                    • {p}
                  </div>
                ))}
              </div>
              <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.amber, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>⚠️ Areas to Improve</div>
                {analysis.top_improvements?.map((p, i) => (
                  <div key={i} style={{ fontSize: 13, color: C.sec, padding: "6px 0", borderBottom: i < analysis.top_improvements.length - 1 ? `1px solid ${C.border}` : undefined }}>
                    • {p}
                  </div>
                ))}
              </div>
            </div>

            {/* Quotes & actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.teal, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>💬 Attendee Quotes</div>
                {analysis.key_quotes?.map((q, i) => (
                  <div key={i} style={{ fontSize: 13, color: C.sec, fontStyle: "italic", padding: "8px 12px", borderLeft: `3px solid ${C.teal}`, background: `${C.teal}08`, borderRadius: "0 6px 6px 0", marginBottom: 8 }}>
                    "{q}"
                  </div>
                ))}
              </div>
              <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.blue, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>🎯 Recommended Actions</div>
                {analysis.recommendations?.map((r, i) => (
                  <div key={i} style={{ fontSize: 13, color: C.sec, padding: "6px 0", borderBottom: i < analysis.recommendations.length - 1 ? `1px solid ${C.border}` : undefined }}>
                    {i + 1}. {r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* REPORT TAB */}
      {tab === "report" && (
        <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 24 }}>
          {!analysis ? (
            <div style={{ textAlign: "center", color: C.muted, padding: 32 }}>
              Run AI Analysis first to generate the report
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Post-Event Feedback Report</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{activeEvent?.name} · {submissions.length} responses</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                <button onClick={async () => {
                  fire("Generating AI executive debrief…");
                  const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      model: "claude-sonnet-4-20250514", max_tokens: 1200,
                      messages: [{ role: "user", content: "Write a professional 400-word executive debrief for " + (activeEvent?.name||"this event") + "\n\nData: NPS=" + analysis.nps + "/10, Rating=" + analysis.overall_rating + "/5, Would attend again=" + analysis.would_attend_again + "%, Responses=" + submissions.length + "\nPositives: " + (analysis.top_positives||[]).join(", ") + "\nImprovements: " + (analysis.top_improvements||[]).join(", ") + "\nQuotes: " + (analysis.key_quotes||[]).join(" | ") + "\n\nInclude: Executive Summary, KPIs, What Worked, Improvements, Next Steps. Professional tone for CMO/MD." }]
                    })
                  }).then(r => r.json()).catch(() => null);
                  const text = res?.content?.[0]?.text || "Generation failed";
                  navigator.clipboard?.writeText(text);
                  fire("📋 AI Executive Debrief copied to clipboard!");
                }} style={{ padding: "8px 16px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles size={12} />AI Debrief
                </button><button onClick={copyReport}
                  style={{ padding: "8px 18px", borderRadius: 7, border: "none", background: C.blue, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                  📋 Copy Full Report
                </button></div>
              </div>
              <div style={{ background: C.bg, borderRadius: 8, padding: 20, border: `1px solid ${C.border}`, fontFamily: "monospace", fontSize: 12, color: C.sec, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
{`POST-EVENT FEEDBACK REPORT
${activeEvent?.name}
${"=".repeat(40)}

EXECUTIVE SUMMARY
${analysis.summary}

KEY METRICS
• NPS Score: ${analysis.nps}/10  
• Overall Rating: ${analysis.overall_rating}/5 ⭐
• Would attend again: ${analysis.would_attend_again}%
• Total responses: ${submissions.length}

TOP POSITIVES
${analysis.top_positives?.map(p => `✅ ${p}`).join("\n")}

AREAS FOR IMPROVEMENT  
${analysis.top_improvements?.map(p => `⚠️ ${p}`).join("\n")}

ATTENDEE QUOTES
${analysis.key_quotes?.map(q => `"${q}"`).join("\n")}

RECOMMENDED ACTIONS
${analysis.recommendations?.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Generated by evara`}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── FEEDBACK VIEW ────────────────────────────────────────────

// ─── PUBLIC LANDING PAGE ─────────────────────────────────────

export default FeedbackView;