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
import { Spin, Alert, Inp, ViewHint, ScoreBadge, ImageUploadZone } from "../components/Shared";

// FormsView
function FormsView({ supabase, profile, activeEvent, fire, onFormSaved }) {
  const [forms, setForms] = useState([]);
  const [activeForm, setActiveForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [tab, setTab] = useState("builder");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState([]);
  const [formName, setFormName] = useState("");
  const [nextId, setNextId] = useState(100);
  const DEFAULT_FIELDS = [
    { id: 1, type: "text", label: "First Name", required: true, options: [] }, { id: 2, type: "text", label: "Last Name", required: false, options: [] },
    { id: 3, type: "email", label: "Email Address", required: true, options: [] }, { id: 4, type: "text", label: "Company", required: false, options: [] },
    { id: 5, type: "radio", label: "Will you attend?", required: true, options: ["Yes, I'll attend", "Unable to attend"] },
    { id: 6, type: "checkbox", label: "I consent to receive event communications.", required: true, options: [] },
  ];
  const FIELD_TYPES = [{ type: "text", icon: "Aa", label: "Short Text" }, { type: "email", icon: "@", label: "Email" }, { type: "phone", icon: "✆", label: "Phone" }, { type: "textarea", icon: "¶", label: "Long Text" }, { type: "select", icon: "▾", label: "Dropdown" }, { type: "radio", icon: "◉", label: "Multiple Choice" }, { type: "checkbox", icon: "☑", label: "Checkbox" }, { type: "file", icon: "↑", label: "File Upload" }, 
  { type: "date", icon: "📅", label: "Date" }, 
  { type: "number", icon: "#", label: "Number" }, 
  { type: "rating", icon: "⭐", label: "Rating (1-5)" },
  { type: "dietary", icon: "🍽", label: "Dietary Needs" }];
  useEffect(() => {
    if (!activeEvent || !profile) return;
    supabase.from("forms").select("*").eq("event_id", activeEvent.id).order("created_at", { ascending: false })
      .then(({ data }) => { setForms(data || []); if (data?.length) { setActiveForm(data[0]); setFields(data[0].fields || DEFAULT_FIELDS); setFormName(data[0].name || ""); } else { setFields(DEFAULT_FIELDS); setFormName(`${activeEvent.name} — Registration`); } setLoading(false); });
  }, [activeEvent, profile]);
  useEffect(() => {
    if (!activeForm) return;
    supabase.from("form_submissions").select("*,contacts(first_name,last_name,email,company_name)").eq("form_id", activeForm.id).order("submitted_at", { ascending: false })
      .then(({ data }) => setSubmissions(data || []));
  }, [activeForm]);
  const saveForm = async () => {
    if (!activeEvent || !profile) return; setSaving(true);
    const payload = { event_id: activeEvent.id, company_id: profile.company_id, name: formName, fields, form_type: "registration", is_active: true };
    const { data, error } = activeForm ? await supabase.from("forms").update(payload).eq("id", activeForm.id).select().single() : await supabase.from("forms").insert(payload).select().single();
    if (error) { fire(error.message, "err"); } else { setActiveForm(data); if (!activeForm) setForms(p => [data, ...p]); fire("Form saved!"); onFormSaved?.(); }
    setSaving(false);
  };
  const addField = type => { setFields(p => [...p, { id: nextId, type, label: FIELD_TYPES.find(f => f.type === type)?.label || "Field", required: false, options: type === "radio" ? ["Option 1", "Option 2"] : [] }]); setNextId(p => p + 1); };
  const removeField = id => setFields(p => p.filter(f => f.id !== id));
  const updateLabel = (id, val) => setFields(p => p.map(f => f.id === id ? { ...f, label: val } : f));
  const toggleReq = id => setFields(p => p.map(f => f.id === id ? { ...f, required: !f.required } : f));
  const moveUp = i => { if (i === 0) return; const a = [...fields]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; setFields(a); };
  const moveDown = i => { if (i === fields.length - 1) return; const a = [...fields]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; setFields(a); };
  const shareLink = activeForm 
    ? `${window.location.hostname === 'localhost' ? 'https://evara-tau.vercel.app' : window.location.origin}/form/${activeForm.share_token}`
    : "Save form first";
  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", gap: 10, color: C.muted }}><Spin />Loading…</div>;

  const FORM_TEMPLATES = [
    { label:"📋 RSVP", fields:[
      { id:1, type:"text", label:"First Name", required:true, options:[] },
      { id:2, type:"text", label:"Last Name", required:false, options:[] },
      { id:3, type:"email", label:"Email Address", required:true, options:[] },
      { id:4, type:"text", label:"Company", required:false, options:[] },
      { id:5, type:"radio", label:"Will you attend?", required:true, options:["Yes, I'll attend","Unable to attend"] },
      { id:6, type:"checkbox", label:"I consent to receive event communications.", required:true, options:[] },
    ]},
    { label:"📝 Full Reg", fields:[
      { id:1, type:"text", label:"First Name", required:true, options:[] },
      { id:2, type:"text", label:"Last Name", required:true, options:[] },
      { id:3, type:"email", label:"Email Address", required:true, options:[] },
      { id:4, type:"phone", label:"Phone Number", required:false, options:[] },
      { id:5, type:"text", label:"Company / Organisation", required:false, options:[] },
      { id:6, type:"text", label:"Job Title", required:false, options:[] },
      { id:7, type:"radio", label:"Will you attend?", required:true, options:["Yes, I'll attend","Unable to attend","Sending a colleague"] },
      { id:8, type:"dietary", label:"Dietary requirements", required:false, options:["None","Vegetarian","Vegan","Gluten free","Halal","Kosher","Other"] },
      { id:9, type:"checkbox", label:"I consent to receive event communications.", required:true, options:[] },
    ]},
    { label:"⭐ Feedback", fields:[
      { id:1, type:"rating", label:"How would you rate this event overall?", required:true, options:[] },
      { id:2, type:"radio", label:"Would you attend our next event?", required:true, options:["Definitely","Probably","Unsure","Probably not"] },
      { id:3, type:"textarea", label:"What did you enjoy most?", required:false, options:[] },
      { id:4, type:"textarea", label:"What could we improve?", required:false, options:[] },
      { id:5, type:"text", label:"Any other comments?", required:false, options:[] },
    ]},
    { label:"📋 Waitlist", fields:[
      { id:1, type:"text", label:"Full Name", required:true, options:[] },
      { id:2, type:"email", label:"Email Address", required:true, options:[] },
      { id:3, type:"text", label:"Company", required:false, options:[] },
      { id:4, type:"textarea", label:"Why are you interested in attending?", required:false, options:[] },
      { id:5, type:"checkbox", label:"Notify me if a spot opens up.", required:true, options:[] },
    ]},
  ];

  if (!activeEvent) return (
    <div style={{ animation:"fadeUp .2s ease" }}>
      <div style={{ marginBottom:24 }}><h1 style={{ fontSize:24, fontWeight:600, letterSpacing:"-0.6px", color:C.text }}>Registration Forms</h1>
        <p style={{ color:C.muted, fontSize:13, marginTop:4 }}>Build drag-and-drop forms for your event.</p></div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", paddingTop:60, gap:14, textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:4 }}>📋</div>
        <div style={{ fontSize:18, fontWeight:600, color:C.text }}>No event selected</div>
        <p style={{ fontSize:13, color:C.muted, maxWidth:340, lineHeight:1.6 }}>Select an event from the sidebar to build and manage its registration form.</p>
      </div>
    </div>
  );

  return (
    <div style={{ animation: "fadeUp .2s ease", display: "flex", flexDirection: "column", height: "calc(100vh - 110px)" }}>
      <div style={{ marginBottom: 12, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.6px", color: C.text }}>Registration Forms</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Build your form, save it, then share the link or embed it.</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={saveForm} disabled={saving} style={{ fontSize: 13, padding: "7px 18px", borderRadius: 7, border: "none", background: C.blue, color: "#fff", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>{saving ? <><Spin />Saving…</> : activeForm ? "Save changes →" : "Create form →"}</button>
        </div>
      </div>

      {/* Template quick-start */}
      {!activeForm && (
        <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
          <span style={{ fontSize:11, color:C.muted, alignSelf:"center", flexShrink:0 }}>Start from template:</span>
          {FORM_TEMPLATES.map(t => (
            <button key={t.label} onClick={() => { setFields(t.fields.map((f,i)=>({...f,id:i+1}))); setNextId(t.fields.length+1); fire(`Loaded ${t.label} template`); }}
              style={{ fontSize:12, padding:"5px 12px", borderRadius:6, border:`1px solid ${C.border}`, background:C.raised, color:C.text, cursor:"pointer" }}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Prominent form URL bar ── */}
      {activeForm?.share_token && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: C.green + "10", border: `1px solid ${C.green}30`, borderRadius: 9, marginBottom: 14 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: C.green, fontWeight: 600, flexShrink: 0 }}>Form live:</span>
          <code style={{ flex: 1, fontSize: 11.5, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {`${window.location.hostname === "localhost" ? "https://evara-tau.vercel.app" : window.location.origin}/form/${activeForm.share_token}`}
          </code>
          <button onClick={() => {
            const url = `${window.location.hostname === "localhost" ? "https://evara-tau.vercel.app" : window.location.origin}/form/${activeForm.share_token}`;
            navigator.clipboard.writeText(url);
            fire("✅ Form URL copied!");
          }} style={{ fontSize: 11, padding: "3px 10px", background: C.green + "20", border: `1px solid ${C.green}40`, borderRadius: 5, color: C.green, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 500 }}>
            Copy Link
          </button>
          <button onClick={() => {
            const url = `${window.location.hostname === "localhost" ? "https://evara-tau.vercel.app" : window.location.origin}/form/${activeForm.share_token}`;
            const embed = `<iframe src="${url}" width="100%" height="600" frameborder="0" style="border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.08)"></iframe>`;
            navigator.clipboard.writeText(embed);
            fire("✅ Embed code copied — paste into your website!");
          }} style={{ fontSize: 11, padding: "3px 10px", background: C.blue+"15", border: `1px solid ${C.blue}40`, borderRadius: 5, color: C.blue, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 500 }}>
            {"</> Embed"}
          </button>
          <a href={`${window.location.hostname === "localhost" ? "https://evara-tau.vercel.app" : window.location.origin}/form/${activeForm.share_token}`} target="_blank" rel="noreferrer"
            style={{ fontSize: 11, padding: "3px 10px", background: C.raised, border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer", whiteSpace: "nowrap", textDecoration: "none" }}>
            Open ↗
          </a>
        </div>
      )}

      <div style={{ display: "flex", gap: 0, marginBottom: 16, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 3, width: "fit-content", flexShrink: 0 }}>
        {[{ id: "builder", label: "Form builder" }, { id: "preview", label: "Preview" }, { id: "responses", label: `Responses (${submissions.length})` }, { id: "share", label: "Share & embed" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: tab === t.id ? C.raised : "transparent", color: tab === t.id ? C.text : C.muted, fontSize: 12.5, fontWeight: tab === t.id ? 500 : 400, transition: "all .12s", cursor: "pointer" }}>{t.label}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 14, flex: 1, minHeight: 0 }}>
        {(tab === "builder" || tab === "preview") && (
          <div style={{ width: 256, display: "flex", flexDirection: "column", gap: 10, overflow: "auto", flexShrink: 0 }}>
            <Sec label="Form name">
              <input value={formName} onChange={e => setFormName(e.target.value)} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: "7px 9px", fontSize: 13, outline: "none" }} />
              {formName.length > 0 && <span style={{ fontSize:10, color:formName.length>60?C.red:C.muted, marginLeft:6 }}>{formName.length}/80</span>}
            </Sec>
            {tab === "builder" && <>
              <Sec label="Add field">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                  {FIELD_TYPES.map(f => (
                    <button key={f.type} onClick={() => addField(f.type)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, cursor: "pointer", textAlign: "left", transition: "all .12s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue; }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
                      <span style={{ width: 16, textAlign: "center" }}>{f.icon}</span><span>{f.label}</span>
                    </button>
                  ))}
                </div>
                {/* Quick-add common event fields */}
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6, fontWeight: 600 }}>Quick add common fields</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {[
                      { label: "Dietary requirements", type: "radio", options: ["No restrictions", "Vegetarian", "Vegan", "Gluten-free", "Halal", "Kosher", "Other"] },
                      { label: "Accessibility needs", type: "textarea" },
                      { label: "Job title", type: "text" },
                      { label: "LinkedIn profile", type: "text" },
                      { label: "How did you hear about us?", type: "radio", options: ["LinkedIn", "Email invitation", "Colleague referral", "Company website", "Other"] },
                      { label: "Questions for speakers", type: "textarea" },
                      { label: "T-shirt size", type: "radio", options: ["XS", "S", "M", "L", "XL", "XXL"] },
                      { label: "Table preference", type: "radio", options: ["No preference", "Near front", "Near back", "Quiet area"] },
                    ].map(f => (
                      <button key={f.label} onClick={() => {
                        setFields(p => [...p, { id: nextId, type: f.type, label: f.label, required: false, options: f.options || [] }]);
                        setNextId(p => p + 1);
                      }} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 5, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", transition: "all .12s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal||C.blue; e.currentTarget.style.color = C.teal||C.blue; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
                        + {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </Sec>
              <Sec label={`Fields (${fields.length})`}>
                {fields.map((f, i) => (
                  <div key={f.id} style={{ background: C.raised, borderRadius: 7, border: `1px solid ${C.border}`, padding: "9px 10px", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 9.5, color: C.muted, fontWeight: 600, marginRight: 2 }}>{i+1}.</span>
                      <span style={{ fontSize: 9.5, color: C.muted, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: "1px 5px", textTransform: "uppercase", fontWeight: 600 }}>{f.type}</span>
                      <div style={{ display: "flex", gap: 2, marginLeft: "auto" }}>
                        <button onClick={() => moveUp(i)} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 13, padding: "0 3px", cursor: "pointer" }}>↑</button>
                        <button onClick={() => moveDown(i)} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 13, padding: "0 3px", cursor: "pointer" }}>↓</button>
                        <button onClick={() => setFields(p => p.map(x => x.id === f.id ? {...x, required: !x.required} : x))}
                          title={f.required ? "Required — click to make optional" : "Optional — click to make required"}
                          style={{ background:"transparent", border:"none", color: f.required ? C.blue : C.muted, fontSize:11, padding:"0 3px", cursor:"pointer", fontWeight: f.required ? 700 : 400 }}>
                          {f.required ? "REQ" : "opt"}
                        </button>
                        <button onClick={() => {
                          const dup = { ...f, id: nextId };
                          setNextId(p => p + 1);
                          setFields(p => { const i = p.findIndex(x => x.id === f.id); const n=[...p]; n.splice(i+1,0,dup); return n; });
                        }} title="Duplicate field" style={{ background:"transparent", border:"none", color:C.muted, fontSize:12, padding:"0 3px", cursor:"pointer" }}>⧉</button>
                        <button onClick={() => removeField(f.id)} style={{ background: "transparent", border: "none", color: C.red, fontSize: 14, padding: "0 3px", cursor: "pointer" }}>×</button>
                      </div>
                    </div>
                    <div style={{ fontSize: 9.5, color: C.blue, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>Field label</div>
                    <input value={f.label} onChange={e => updateLabel(f.id, e.target.value)} placeholder="e.g. First Name, Company…"
                      style={{ width: "100%", background: C.bg, border: `1px solid ${C.blue}30`, borderRadius: 5, color: C.text, padding: "5px 7px", fontSize: 12, outline: "none", marginBottom: 5 }} />
                    <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.muted, cursor: "pointer" }}>
                      <input type="checkbox" checked={f.required} onChange={() => toggleReq(f.id)} style={{ accentColor: C.blue }} />Required
                    </label>
                  </div>
                ))}
              </Sec>
            </>}
          </div>
        )}
        <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          {(tab === "builder" || tab === "preview") && (
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, background: "#F2F2F7", overflow: "auto", height: "100%" }}>
              <div style={{ maxWidth: 520, margin: "0 auto", padding: "28px 22px" }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111", marginBottom: 4, letterSpacing: "-0.3px" }}>{formName || "Form name"}</h2>
                <p style={{ fontSize: 13, color: "#666", marginBottom: 22 }}>Fill in your details to register your place.</p>
                {fields.map(f => (
                  <div key={f.id} style={{ marginBottom: 16 }}>
                    {f.type !== "checkbox" && <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#111", marginBottom: 6 }}>{f.label}{f.required && <span style={{ color: C.blue, marginLeft: 2 }}>*</span>}</label>}
                    {(f.type === "text" || f.type === "email" || f.type === "phone") && <div style={{ height: 38, borderRadius: 7, border: "1px solid #D1D1D6", background: "white", padding: "0 12px", display: "flex", alignItems: "center" }}><span style={{ fontSize: 13, color: "#AEAEB2" }}>Enter {f.label.toLowerCase()}…</span></div>}
                    {f.type === "textarea" && <div style={{ height: 72, borderRadius: 7, border: "1px solid #D1D1D6", background: "white", padding: "10px 12px" }}><span style={{ fontSize: 13, color: "#AEAEB2" }}>Type your response…</span></div>}
                    {f.type === "select" && <div style={{ height: 38, borderRadius: 7, border: "1px solid #D1D1D6", background: "white", padding: "0 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ fontSize: 13, color: "#AEAEB2" }}>Select…</span><span style={{ color: "#999" }}>▾</span></div>}
                    {f.type === "radio" && (f.options || []).map((o, j) => (
                      <label key={j} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer" }}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", border: "1.5px solid #D1D1D6", background: "white", flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "#333" }}>{o}</span>
                      </label>
                    ))}
                    {f.type === "checkbox" && <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
                      <div style={{ width: 16, height: 16, borderRadius: 3, border: "1.5px solid #D1D1D6", background: "white", marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, color: "#555", lineHeight: 1.5 }}>{f.label}{f.required && <span style={{ color: C.blue, marginLeft: 2 }}>*</span>}</span>
                    </label>}
                    {f.type === "file" && <div style={{ height: 56, borderRadius: 7, border: "1.5px dashed #D1D1D6", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 13, color: "#AEAEB2" }}>↑ Click to upload</span></div>}
                  </div>
                ))}
                {fields.length > 0 && <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                  <button style={{ flex: 1, padding: "12px", background: C.blue, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Submit registration</button>
                </div>}
                <div style={{ marginTop: 14, fontSize: 11, color: "#AEAEB2", textAlign: "center" }}>🔒 Data encrypted · Powered by evara</div>
              </div>
            </div>
          )}
          {tab === "responses" && (
            <div>
              {submissions.length > 0 && (
                <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}>
                  <button onClick={() => {
                    const hdr = ["Submitted","Email",...fields.map(f=>f.label)];
                    const rows = submissions.map(s => [
                      new Date(s.submitted_at).toLocaleString("en-AU"),
                      s.submitter_email||"",
                      ...fields.map(f => String(s.responses?.[f.id]||""))
                    ].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(","));
                    const csv = [hdr.join(","),...rows].join("\n");
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
                    a.download = `form-responses-${new Date().toISOString().slice(0,10)}.csv`;
                    a.click(); fire(`✅ Exported ${submissions.length} responses`);
                  }} style={{ fontSize:12, padding:"6px 12px", borderRadius:6, border:`1px solid ${C.green}40`, background:"transparent", color:C.green, cursor:"pointer" }}>
                    ⬇ Export responses CSV
                  </button>
                </div>
              )}
              {submissions.length === 0 ? <div style={{ background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, padding: "48px", textAlign: "center", color: C.muted }}><FileText size={32} style={{ opacity: .3, marginBottom: 12 }} /><div style={{ fontSize: 14, marginBottom: 6 }}>No submissions yet</div><div style={{ fontSize: 13 }}>Share your form to collect registrations</div></div> : (
                <div style={{ background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                  <div style={{ padding: "13px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{submissions.length} responses</span>
                    <button onClick={() => {
                      if (!submissions.length) return;
                      // Build headers from first submission
                      const fields = activeForm?.fields || [];
                      const headers = ["Submitted", "Email", ...fields.map(f => f.label)];
                      const rows = submissions.map(s => [
                        new Date(s.submitted_at).toLocaleString(),
                        s.submitter_email || "",
                        ...fields.map(f => (s.responses?.[f.id] || "").toString().replace(/"/g, '""'))
                      ]);
                      const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url; a.download = `${activeForm?.name || "form"}-responses.csv`;
                      a.click(); URL.revokeObjectURL(url);
                      fire("CSV exported!");
                    }} style={{ fontSize: 12, padding: "5px 12px", background: C.blue, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                    <Download size={11} style={{ display: "inline", marginRight: 4 }} />Export CSV
                    </button>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>{["Submitted", "Name", "Email", "Responses"].map(h => <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10.5, color: C.muted, fontWeight: 500, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
                    <tbody>{submissions.map((s, i) => (
                      <tr key={s.id} className="rh" style={{ borderBottom: i < submissions.length - 1 ? `1px solid ${C.border}` : undefined, background: "transparent" }}>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: C.muted }}>{new Date(s.submitted_at).toLocaleDateString()}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13, color: C.text }}>{s.contacts ? `${s.contacts.first_name || ""} ${s.contacts.last_name || ""}`.trim() || "—" : "—"}</td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: C.muted }}>{s.submitter_email || s.contacts?.email || "—"}</td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: C.muted }}>{Object.keys(s.responses || {}).length} fields</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {tab === "share" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {!activeForm && <Alert type="error">Save the form first to get a share link</Alert>}
              <Sec label="Shareable link">
                <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 10 }}>Anyone with this link can fill in the form. No login required.</div>
                {activeForm?.share_token && (
                  <button onClick={() => window.open(`${window.location.hostname==="localhost"?"https://evara-tau.vercel.app":window.location.origin}/form/${activeForm.share_token}`, "_blank")}
                    style={{ fontSize:12, padding:"6px 14px", borderRadius:7, border:`1px solid ${C.blue}40`, background:C.blue+"10", color:C.blue, cursor:"pointer", marginBottom:8 }}>
                    🔗 Open form in new tab
                  </button>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 12px", fontSize: 12, color: C.sec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shareLink}</div>
                  <button onClick={() => { navigator.clipboard?.writeText(shareLink); fire("Link copied!"); }} style={{ padding: "9px 14px", background: C.blue, color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Copy</button>
                </div>
              </Sec>
              <Sec label="Embed code">
                <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 10 }}>Paste this into any webpage to embed the form inline.</div>
                <div style={{ background: C.bg, borderRadius: 7, border: `1px solid ${C.border}`, padding: 12, fontFamily: "monospace", fontSize: 11.5, color: C.teal, lineHeight: 1.7, wordBreak: "break-all", marginBottom: 10 }}>
                  {`<iframe src="${shareLink}" width="100%" height="600" frameborder="0" style="border:none;border-radius:8px;"></iframe>`}
                </div>
                <button onClick={() => { navigator.clipboard?.writeText(`<iframe src="${shareLink}" width="100%" height="600" frameborder="0"></iframe>`); fire("Embed code copied!"); }} style={{ padding: "8px 16px", background: C.blue, color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Copy embed code</button>
              </Sec>
              <Sec label="QR Code">
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Display this QR code on screen, print it at the venue, or include it in printed invites. Attendees scan to register instantly.</div>
                <div style={{ background: "#fff", borderRadius: 10, padding: 16, display: "inline-block", marginBottom: 12 }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareLink)}`} alt="QR Code" width={160} height={160} style={{ display: "block", borderRadius: 4 }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => {
                    const a = document.createElement("a");
                    a.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(shareLink)}`;
                    a.download = "evara-registration-qr.png";
                    a.target = "_blank";
                    a.click();
                    fire("QR code downloading…");
                  }} style={{ padding: "8px 16px", background: C.blue, color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                    ⬇ Download QR Code
                  </button>
                  <button onClick={() => { navigator.clipboard?.writeText(shareLink); fire("Link copied!"); }}
                    style={{ padding: "8px 16px", background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 7, fontSize: 13, cursor: "pointer" }}>
                    📋 Copy Link
                  </button>
                </div>
              </Sec>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────
// ─── BRAND KIT SECTION ───────────────────────────────────────

export default FormsView;