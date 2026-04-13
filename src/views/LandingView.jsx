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

// LandingView
function LandingView({ supabase, profile, activeEvent, fire, formShareLink }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(null);
  const [previewMode, setPreviewMode] = useState("desktop"); // desktop | mobile
  const [sideTab, setSideTab] = useState("content"); // content | design | sections
  const [aiGenerating, setAiGenerating] = useState(false);
  const [blocks, setBlocks] = useState({ hero: true, countdown: true, details: true, speakers: false, rsvp: true, sponsors: false });
  const [formId, setFormId] = useState(null);
  const [formFields, setFormFields] = useState([]);
  const [formShareToken, setFormShareToken] = useState(null);
  const brandColor = profile?.companies?.brand_color || "#0A84FF";
  const logoUrl = profile?.companies?.logo_url || "";
  const [info, setInfo] = useState({
    title: "", tagline: "", description: "", headline: "", subheadline: "",
    about_text: "", brand_color: brandColor, cta_text: "Register Now",
    template: "corporate", slug: (activeEvent?.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    location_text: "", organiser: "",
  });

  const TMPLS = [
    { id: "minimal", name: "Minimal", desc: "Clean, white & text-forward", accent: "#111", bg: "#FFFFFF", textCol: "#111111" },
    { id: "corporate", name: "Corporate", desc: "Dark, professional & premium", accent: brandColor, bg: "#0D0D0F", textCol: "#F5F5F7" },
    { id: "bold", name: "Bold", desc: "Vibrant gradient & high-energy", accent: brandColor, bg: "#0A0A1A", textCol: "#FFFFFF" },
    { id: "light", name: "Warm", desc: "Soft, friendly & approachable", accent: brandColor, bg: "#FAF9F7", textCol: "#1A1A1A" },
    { id: "editorial", name: "Editorial", desc: "Typographic & editorial feel", accent: "#000000", bg: "#F5F0E8", textCol: "#1A1A1A" },
    { id: "neon", name: "Neon", desc: "Bold dark with vivid highlights", accent: "#39FF14", bg: "#050505", textCol: "#FFFFFF" },
  ];
  const BLOCK_LIST = [
    { id: "hero", label: "Hero / Banner", icon: "🖼" },
    { id: "countdown", label: "Countdown Timer", icon: "⏱" },
    { id: "details", label: "Event Details", icon: "📍" },
    { id: "about", label: "About Section", icon: "📝" },
    { id: "speakers", label: "Speakers", icon: "🎤" },
    { id: "rsvp", label: "RSVP / Register Button", icon: "📋" },
    { id: "sponsors", label: "Sponsors", icon: "🏅" },
  ];

  useEffect(() => {
    if (!activeEvent || !profile) return;
    supabase.from("landing_pages").select("*").eq("event_id", activeEvent.id).maybeSingle()
      .then(async ({ data }) => {
        if (data) {
          setPage(data);
          setInfo({ title: data.title || "", tagline: data.tagline || "", description: data.description || "", headline: data.headline || "", subheadline: data.subheadline || "", about_text: data.about_text || "", brand_color: data.brand_color || brandColor, cta_text: data.cta_text || "Register Now", template: data.template || "corporate", slug: data.slug || (activeEvent?.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "", location_text: data.location_text || "", organiser: data.organiser || "" });
          setBlocks(data.blocks || blocks);
          setStep(2);
          // Auto-generate AI copy if headline is missing
          if (!data.headline && activeEvent?.name) {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
                body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 600,
                  messages: [{ role: "user", content: `Write landing page copy for this event. Return JSON only with keys: headline, subheadline, tagline, about_text, cta_text. Event: ${activeEvent.name}. Date: ${activeEvent.event_date || "TBC"}. Location: ${activeEvent.location || "TBC"}. Type: ${activeEvent.event_type || "event"}. Description: ${activeEvent.description || "Professional event"}. Keep headline punchy (max 8 words), subheadline 1 sentence, tagline 5 words, about_text 2-3 sentences, cta_text 3 words max.` }] })
              });
              const d = await res.json();
              const parsed = JSON.parse((d.content?.[0]?.text || "{}").replace(/```json|```/g, "").trim());
              setInfo(p => ({ ...p, ...parsed }));
            } catch(_) {}
          }
        } else if (activeEvent?.name) {
          // No landing page — auto-generate from brief and go straight to editor
          setLoading(false);
          try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
              body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 600,
                messages: [{ role: "user", content: `Write landing page copy for this event. Return JSON only with keys: headline, subheadline, tagline, about_text, cta_text. Event: ${activeEvent.name}. Date: ${activeEvent.event_date || "TBC"}. Location: ${activeEvent.location || "TBC"}. Type: ${activeEvent.event_type || "event"}. Description: ${activeEvent.description || "Professional event"}. Keep headline punchy (max 8 words), subheadline 1 sentence, tagline 5 words, about_text 2-3 sentences, cta_text 3 words max.` }] })
            });
            const d = await res.json();
            const parsed = JSON.parse((d.content?.[0]?.text || "{}").replace(/```json|```/g, "").trim());
            setInfo(p => ({ ...p, ...parsed, template: p.template || "corporate" }));
            setStep(2); // skip template picker — go straight to editor with AI content
            fire("✨ Landing page pre-filled from your event brief — review and publish!");
          } catch(e) {
            setStep(2); // even if AI fails, go to editor with event data
          }
          return;
        }
        setLoading(false);
      });
    // Also load the form for this event
    supabase.from("forms").select("*").eq("event_id", activeEvent.id).limit(1).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setFormId(data.id);
          setFormFields(data.fields || []);
          setFormShareToken(data.share_token || null);
        }
      });
    if (activeEvent) {
      setInfo(p => ({ ...p, title: p.title || activeEvent.name || "", description: p.description || activeEvent.description || "", location_text: p.location_text || activeEvent.location || "", slug: p.slug || (activeEvent.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"), organiser: p.organiser || profile?.companies?.name || "" }));
    }
  }, [activeEvent, profile]);

  const save = async (publish = false) => {
    if (!activeEvent || !profile) return; setSaving(true);
    // Derive reg_url from form share token
    const formLink = formShareToken ? `${window.location.origin}/form/${formShareToken}` : formShareLink || "";
    const payload = { event_id: activeEvent.id, company_id: profile.company_id, ...info, blocks, is_published: publish, reg_url: formLink || info.reg_url || "" };
    const { data, error } = await supabase.from("landing_pages").upsert(payload, { onConflict: "event_id" }).select().single();
    if (error) { fire(error.message, "err"); }
    else {
      setPage(data);
      // On publish: activate the form + save any field changes
      if (publish) {
        if (formId) {
          await supabase.from("forms").update({ is_active: true, fields: formFields }).eq("id", formId);
        }
        const url = `${window.location.origin}/page/${data.slug}`;
        fire(`🎉 Page published! Copied to clipboard.`);
        navigator.clipboard?.writeText(url);
        // ── Auto-update all draft email CTAs to point to this landing page ──
        supabase.from("email_campaigns")
          .select("id,html_content")
          .eq("event_id", activeEvent.id)
          .neq("status", "sent")
          .then(({ data: cams }) => {
            if (!cams?.length) return;
            const updates = cams
              .filter(c => c.html_content?.includes("{{REGISTRATION_URL}}") || c.html_content?.includes('href="#"'))
              .map(c => ({
                id: c.id,
                html_content: c.html_content
                  .replace(/{{REGISTRATION_URL}}/g, url)
                  .replace(/href="#"/g, `href="${url}"`)
              }));
            if (updates.length) {
              Promise.all(updates.map(u =>
                supabase.from("email_campaigns").update({ html_content: u.html_content }).eq("id", u.id)
              )).then(() => fire(`✅ ${updates.length} email CTA${updates.length!==1?"s":""} auto-linked to landing page`));
            }
          });
      } else {
        // Save form field changes on draft save too
        if (formId) await supabase.from("forms").update({ fields: formFields }).eq("id", formId);
        fire("Draft saved ✓");
      }
    }
    setSaving(false);
  };

  const aiGenerateCopy = async () => {
    if (!activeEvent) return;
    setAiGenerating(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001", max_tokens: 600,
          messages: [{ role: "user", content: `Write landing page copy for this event. Return JSON only with keys: headline, subheadline, tagline, about_text, cta_text. Event: ${activeEvent.name}. Date: ${activeEvent.event_date || "TBC"}. Location: ${activeEvent.location || "TBC"}. Type: ${activeEvent.event_type || "event"}. Description: ${activeEvent.description || "Professional event"}. Organiser: ${profile?.companies?.name || ""}. Keep headline punchy (max 8 words), subheadline 1 sentence, tagline 5 words, about_text 2–3 sentences, cta_text 3 words max.` }],
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setInfo(p => ({ ...p, ...parsed }));
      fire("✨ AI copy generated!");
    } catch { fire("AI generation failed — fill in manually", "err"); }
    setAiGenerating(false);
  };

  const tmpl = TMPLS.find(t => t.id === info.template) || TMPLS[1];
  const accent = info.brand_color || brandColor;

  // ── Template mini-preview ──
  const TemplateThumbnail = ({ t, selected }) => {
    const a = t.id === "neon" ? "#39FF14" : t.id === "editorial" ? "#000" : t.id === "minimal" ? "#111" : accent;
    return (
      <div onClick={() => { setInfo(p => ({ ...p, template: t.id })); setStep(2); }}
        style={{ borderRadius: 10, border: `2px solid ${selected ? accent : C.border}`, overflow: "hidden", cursor: "pointer", transition: "all .15s", boxShadow: selected ? `0 0 0 2px ${accent}40` : "none" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = selected ? accent : C.border; e.currentTarget.style.transform = "none"; }}>
        <div style={{ height: 160, background: t.bg, padding: "12px 14px", position: "relative", overflow: "hidden" }}>
          {/* nav bar */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ width:28, height:5, borderRadius:3, background: t.id==="minimal"?"#222":t.id==="editorial"?"#000":"rgba(255,255,255,0.5)" }} />
            <div style={{ width:32, height:14, borderRadius:3, background:a, opacity:0.9 }} />
          </div>
          {/* hero band */}
          {t.id==="bold" && <div style={{ position:"absolute", inset:0, background:`linear-gradient(135deg, ${accent}30, ${accent}08)`, pointerEvents:"none" }} />}
          {t.id==="neon" && <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 0%, ${a}20 0%, transparent 70%)`, pointerEvents:"none" }} />}
          {t.id==="editorial" && <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"#000" }} />}
          <div style={{ height:6, borderRadius:4, background: t.id==="minimal"||t.id==="light"||t.id==="editorial"?"#1A1A1A":"rgba(255,255,255,0.85)", width:"75%", marginBottom:6 }} />
          <div style={{ height:4, borderRadius:3, background: t.id==="minimal"||t.id==="light"||t.id==="editorial"?"#666":"rgba(255,255,255,0.4)", width:"55%", marginBottom:14 }} />
          <div style={{ height:22, width:60, borderRadius:5, background:a }} />
          {/* detail pills */}
          <div style={{ position:"absolute", bottom:10, left:14, display:"flex", gap:5 }}>
            {[40,55,36].map((w,i) => <div key={i} style={{ height:6, width:w, borderRadius:3, background: t.id==="minimal"||t.id==="light"||t.id==="editorial"?"rgba(0,0,0,0.12)":"rgba(255,255,255,0.15)" }} />)}
          </div>
        </div>
        <div style={{ padding: "10px 12px", background: C.card, borderTop: `1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{t.name}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop:1 }}>{t.desc}</div>
          </div>
          {selected && <div style={{ width:16, height:16, borderRadius:"50%", background:accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#fff" }}>✓</div>}
        </div>
      </div>
    );
  };

  // ── Rich live preview ──
  const LivePreview = () => {
    const isMinimal = info.template === "minimal" || info.template === "light" || info.template === "editorial";
    const textColor = tmpl.textCol;
    const subColor = isMinimal ? "#555" : "rgba(255,255,255,0.6)";
    const borderCol = isMinimal ? "#E5E5E7" : "rgba(255,255,255,0.1)";
    const a = info.template === "neon" ? "#39FF14" : info.template === "editorial" ? "#000" : info.template === "minimal" ? "#111" : accent;

    const days = activeEvent?.event_date ? Math.max(0, Math.ceil((new Date(activeEvent.event_date) - new Date()) / (1000*60*60*24))) : null;

    return (
      <div style={{ background: tmpl.bg, fontFamily: info.template==="editorial" ? "Georgia,serif" : "Outfit,sans-serif", color: textColor, minHeight:"100%", fontSize:14 }}>
        {/* Top accent bar */}
        {info.template === "editorial" && <div style={{ height:4, background:"#000" }} />}
        {info.template === "neon" && <div style={{ height:2, background:`linear-gradient(90deg, transparent, #39FF14, transparent)` }} />}

        {/* Nav */}
        <div style={{ padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${borderCol}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {logoUrl && <img src={logoUrl} alt="" style={{ height:22, objectFit:"contain" }} />}
            <span style={{ fontSize:13, fontWeight:700, color:textColor }}>{info.organiser || profile?.companies?.name || "Organiser"}</span>
          </div>
          <div style={{ background:a, color: info.template==="neon"?"#000":"#fff", padding:"5px 14px", borderRadius:5, fontSize:11.5, fontWeight:600, cursor:"pointer" }}>{info.cta_text || "Register Now"}</div>
        </div>

        {/* Hero */}
        {blocks.hero && (
          <div style={{ padding: previewMode==="mobile" ? "36px 20px" : "52px 40px", textAlign:"center", position:"relative", overflow:"hidden" }}>
            {(info.template==="bold"||info.template==="neon") && <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 0%, ${a}25 0%, transparent 65%)`, pointerEvents:"none" }} />}
            {activeEvent?.event_date && (
              <div style={{ fontSize:10, fontWeight:600, color:a, textTransform:"uppercase", letterSpacing:"2px", marginBottom:10 }}>
                {new Date(activeEvent.event_date).toLocaleDateString("en-AU", { day:"numeric", month:"long", year:"numeric" })}
                {activeEvent.location ? ` · ${activeEvent.location}` : ""}
              </div>
            )}
            <h1 style={{ fontSize: previewMode==="mobile"?26:38, fontWeight:800, letterSpacing:"-0.8px", lineHeight:1.08, marginBottom:12, color:textColor }}>{info.headline || info.title || activeEvent?.name || "Event Title"}</h1>
            {info.subheadline && <p style={{ fontSize: previewMode==="mobile"?13:15, color:subColor, maxWidth:460, margin:"0 auto 10px", lineHeight:1.6 }}>{info.subheadline}</p>}
            {info.tagline && <p style={{ fontSize:13, color: isMinimal?"#888":"rgba(255,255,255,0.45)", marginBottom:20, fontStyle: info.template==="editorial"?"italic":"normal" }}>{info.tagline}</p>}
            <div style={{ display:"inline-block", background:a, color: info.template==="neon"?"#000":"#fff", padding:"11px 28px", borderRadius:7, fontSize:13, fontWeight:700, cursor:"pointer" }}>{info.cta_text || "Register Now"}</div>
          </div>
        )}

        {/* Countdown */}
        {blocks.countdown && days !== null && (
          <div style={{ padding:"16px 24px", borderTop:`1px solid ${borderCol}`, borderBottom:`1px solid ${borderCol}`, display:"flex", justifyContent:"center", gap: previewMode==="mobile"?12:24 }}>
            {[["Days",days],["Hours","00"],["Mins","00"],["Secs","00"]].map(([lbl,val]) => (
              <div key={lbl} style={{ textAlign:"center" }}>
                <div style={{ fontSize: previewMode==="mobile"?22:28, fontWeight:800, color: a, lineHeight:1 }}>{String(val).padStart(2,"0")}</div>
                <div style={{ fontSize:9, color:subColor, textTransform:"uppercase", letterSpacing:"1px", marginTop:3 }}>{lbl}</div>
              </div>
            ))}
          </div>
        )}

        {/* Event details grid */}
        {blocks.details && (
          <div style={{ padding:"24px", display:"grid", gridTemplateColumns: previewMode==="mobile"?"1fr":"1fr 1fr 1fr", gap:12, borderBottom:`1px solid ${borderCol}` }}>
            {[
              { icon:"📅", label:"Date", val: activeEvent?.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"}) : "Date TBC" },
              { icon:"📍", label:"Location", val: info.location_text || activeEvent?.location || "Location TBC" },
              { icon:"🕐", label:"Time", val: activeEvent?.event_time || "Time TBC" },
            ].map(({ icon, label, val }) => (
              <div key={label} style={{ background: isMinimal?"rgba(0,0,0,0.04)":"rgba(255,255,255,0.05)", border:`1px solid ${borderCol}`, borderRadius:8, padding:"12px 14px" }}>
                <div style={{ fontSize:16, marginBottom:6 }}>{icon}</div>
                <div style={{ fontSize:9.5, color:subColor, textTransform:"uppercase", letterSpacing:"1px", marginBottom:3 }}>{label}</div>
                <div style={{ fontSize:12, fontWeight:600, color:textColor, lineHeight:1.3 }}>{val}</div>
              </div>
            ))}
          </div>
        )}

        {/* About */}
        {blocks.about && (info.about_text || info.description) && (
          <div style={{ padding:"24px 28px", borderBottom:`1px solid ${borderCol}` }}>
            <div style={{ fontSize:9.5, color:a, textTransform:"uppercase", letterSpacing:"1.5px", fontWeight:600, marginBottom:10 }}>About</div>
            <p style={{ fontSize:13.5, color:subColor, lineHeight:1.75, maxWidth:560 }}>{info.about_text || info.description}</p>
          </div>
        )}

        {/* RSVP / Embedded Form */}
        {blocks.rsvp && (
          <div style={{ padding:"28px 24px", textAlign:"center", borderBottom:`1px solid ${borderCol}` }}>
            {formFields.length > 0 ? (
              <div style={{ maxWidth:420, margin:"0 auto", textAlign:"left" }}>
                <div style={{ fontSize:16, fontWeight:700, color:textColor, marginBottom:4, textAlign:"center" }}>Reserve your spot</div>
                <div style={{ fontSize:12, color:subColor, marginBottom:18, textAlign:"center" }}>Fill in your details to register.</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {formFields.map(f => (
                    <div key={f.id}>
                      <div style={{ fontSize:10.5, color:subColor, marginBottom:4 }}>{f.label}{f.required && <span style={{ color:a, marginLeft:3 }}>*</span>}</div>
                      <div style={{ height:34, borderRadius:6, border:`1px solid ${borderCol}`, background:isMinimal?"rgba(0,0,0,0.04)":"rgba(255,255,255,0.08)", padding:"0 10px", display:"flex", alignItems:"center" }}>
                        <div style={{ fontSize:11, color:subColor, opacity:0.5 }}>{f.type === "email" ? "email@example.com" : f.label}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop:6, background:a, color:info.template==="neon"?"#000":"#fff", padding:"11px", borderRadius:7, fontSize:13, fontWeight:700, textAlign:"center", cursor:"pointer" }}>{info.cta_text || "Register Now"}</div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize:16, fontWeight:700, color:textColor, marginBottom:6 }}>Ready to attend?</div>
                <div style={{ fontSize:12.5, color:subColor, marginBottom:16 }}>Secure your spot before registrations close.</div>
                <div style={{ display:"inline-block", background:a, color:info.template==="neon"?"#000":"#fff", padding:"12px 32px", borderRadius:8, fontSize:13.5, fontWeight:700, cursor:"pointer" }}>{info.cta_text || "Register Now"}</div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:`1px solid ${borderCol}`, opacity:0.6 }}>
          <span style={{ fontSize:11 }}>© 2025 {info.organiser || profile?.companies?.name}</span>
          <span style={{ fontSize:11 }}>Powered by evara</span>
        </div>
      </div>
    );
  };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", gap: 10, color: C.muted }}><Spin />Loading…</div>;

  return (
    <div style={{ animation: "fadeUp .2s ease", display: "flex", flexDirection: "column", height: "calc(100vh - 110px)" }}>
      {/* Header */}
      <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px", color: C.text }}>Landing Page Builder</h1>
          <p style={{ color: C.muted, fontSize: 12.5, marginTop: 3 }}>Event page live in minutes — publish when ready.</p>
        </div>
        {step === 2 && (
          <div style={{ display: "flex", gap: 8, alignItems:"center" }}>
            {page?.is_published && <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: C.green, padding: "6px 12px", background: `${C.green}12`, border: `1px solid ${C.green}30`, borderRadius: 6 }}><div style={{ width:6,height:6,borderRadius:"50%",background:C.green }} /> Live</div>}
            <button onClick={() => setStep(1)} style={{ fontSize: 12.5, padding: "7px 12px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>← Templates</button>
            <button onClick={() => save(false)} disabled={saving} style={{ fontSize: 12.5, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.text, cursor: "pointer" }}>{saving ? <Spin /> : "Save draft"}</button>
            <button onClick={() => save(true)} disabled={saving} style={{ fontSize: 12.5, padding: "7px 18px", borderRadius: 7, border: "none", background: C.blue, color: "#fff", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>{saving ? <><Spin />Publishing…</> : "Publish →"}</button>
            {page?.id && (
              <button onClick={async () => {
                if (!window.confirm("Delete this landing page? This cannot be undone.")) return;
                await supabase.from("landing_pages").delete().eq("id", page.id);
                setPage(null);
                setStep(1);
                fire("🗑 Landing page deleted");
              }} style={{ fontSize: 12.5, padding: "7px 10px", borderRadius: 7, border: `1px solid ${C.red}30`, background: `${C.red}08`, color: C.red, cursor: "pointer" }}>🗑</button>
            )}
          </div>
        )}
      </div>

      {/* Live URL bar */}
      {page?.is_published && page?.slug && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: C.green + "10", border: `1px solid ${C.green}25`, borderRadius: 8, marginBottom: 10, flexShrink:0 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} />
          <span style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>Live:</span>
          <code style={{ fontSize: 11.5, color: C.text, flex:1 }}>{window.location.origin}/page/{page.slug}</code>
          <button onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/page/${page.slug}`); fire("✅ URL copied!"); }} style={{ fontSize: 10.5, padding: "3px 10px", background: C.green + "20", border: `1px solid ${C.green}40`, borderRadius: 5, color: C.green, cursor: "pointer", fontWeight: 500 }}>Copy</button>
          <button onClick={() => {
            const url = `${window.location.origin}/page/${page.slug}`;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&bgcolor=FFFFFF&color=0A84FF&margin=10`;
            const w = window.open("", "_blank", "width=380,height=420");
            w.document.write(`<html><head><title>QR — ${page.slug}</title></head><body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:Arial,sans-serif;background:#f8f9fa"><img src="${qrUrl}" width="280" style="border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.12)"><p style="font-size:12px;color:#666;margin:12px 0 4px;text-align:center">Scan to open landing page</p><p style="font-size:11px;color:#999;margin:0">${url}</p><button onclick="window.print()" style="margin-top:16px;padding:8px 20px;background:#0A84FF;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px">Print QR</button></body></html>`);
            w.document.close();
          }} style={{ fontSize: 10.5, padding: "3px 10px", background: C.raised, border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }} title="Download QR code for this page">
            QR
          </button>
          <a href={`/page/${page.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: 10.5, padding: "3px 10px", background: C.raised, border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, textDecoration: "none" }}>Open ↗</a>
        </div>
      )}

      {/* Template picker */}
      {step === 1 && (
        <div style={{ flex:1, overflow:"auto" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14 }}>Choose a template</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, paddingBottom:20 }}>
            {TMPLS.map(t => <TemplateThumbnail key={t.id} t={t} selected={info.template === t.id} />)}
          </div>
        </div>
      )}

      {/* ── LP Preview banner — shows what AI built ── */}
      {step === 2 && page && !page.is_published && (
        <div style={{ marginBottom:12, padding:"12px 16px", background:C.amber+"10", border:`1px solid ${C.amber}35`, borderRadius:10 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.amber, marginBottom:4 }}>📝 Your AI-drafted landing page is ready to review</div>
          <div style={{ fontSize:12, color:C.muted }}>Edit the content on the left, preview on the right, then click <strong>Publish →</strong> when it looks good.</div>
        </div>
      )}

      {/* Editor */}
      {step === 2 && (
        <div style={{ display: "flex", gap: 12, flex: 1, minHeight: 0 }}>
          {/* Left sidebar */}
          <div style={{ width: 248, display: "flex", flexDirection: "column", gap: 0, flexShrink: 0, overflow:"hidden", border:`1px solid ${C.border}`, borderRadius:10, background:C.card }}>
            {/* Sidebar tabs */}
            <div style={{ display:"flex", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
              {[{id:"content",label:"Content"},{id:"design",label:"Design"},{id:"sections",label:"Sections"},{id:"form",label:"Form 📋"}].map(t => (
                <button key={t.id} onClick={() => setSideTab(t.id)} style={{ flex:1, padding:"9px 4px", border:"none", background:"transparent", color: sideTab===t.id ? C.text : C.muted, fontSize:12, fontWeight: sideTab===t.id ? 600 : 400, borderBottom: sideTab===t.id ? `2px solid ${C.blue}` : "2px solid transparent", cursor:"pointer", transition:"all .12s" }}>{t.label}</button>
              ))}
            </div>
            <div style={{ flex:1, overflow:"auto", padding:"12px" }}>
              {/* AI fill */}
              <button onClick={aiGenerateCopy} disabled={aiGenerating} style={{ width:"100%", marginBottom:12, padding:"8px", borderRadius:7, border:`1px solid ${C.blue}30`, background:`${C.blue}12`, color:C.blue, fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                {aiGenerating ? <><Spin /> Generating…</> : <><Sparkles size={13} /> AI fill from event</>}
              </button>

              {sideTab === "content" && (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {/* URL slug */}
                  <div>
                    <div style={{ fontSize:10.5, color:C.muted, marginBottom:4, fontWeight:500 }}>Page URL</div>
                    <div style={{ display:"flex", background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, overflow:"hidden" }}>
                      <span style={{ fontSize:10, color:C.muted, padding:"8px 6px 8px 8px", whiteSpace:"nowrap", borderRight:`1px solid ${C.border}` }}>/page/</span>
                      <input value={info.slug} onChange={e => setInfo(p => ({ ...p, slug: e.target.value.replace(/[^a-z0-9-]/g, "-") }))} style={{ flex:1, background:"none", border:"none", outline:"none", color:C.text, padding:"8px 6px", fontSize:11.5, fontFamily:"monospace" }} />
                    </div>
                  </div>
                  {[
                    { k:"headline", ph:"Punchy event headline", label:"Headline" },
                    { k:"subheadline", ph:"One clear sentence about the event", label:"Subheadline" },
                    { k:"tagline", ph:"Short 5-word tagline", label:"Tagline" },
                    { k:"cta_text", ph:"Register Now", label:"Button text" },
                    { k:"reg_url", ph:formShareLink||"https://...", label:"Registration URL (form link)" },
                    { k:"location_text", ph:activeEvent?.location||"Venue name or Online", label:"Location" },
                    { k:"organiser", ph:profile?.companies?.name||"Organiser name", label:"Organiser" },
                  ].map(f => (
                    <div key={f.k}>
                      <div style={{ fontSize:10.5, color:C.muted, marginBottom:4, fontWeight:500 }}>{f.label}</div>
                      <input value={info[f.k]||""} onChange={e => setInfo(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph} style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, color:C.text, padding:"7px 9px", fontSize:12.5, outline:"none" }} onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                    </div>
                  ))}
                  <div>
                    <div style={{ fontSize:10.5, color:C.muted, marginBottom:4, fontWeight:500 }}>About section</div>
                    <textarea value={info.about_text||""} onChange={e => setInfo(p=>({...p, about_text:e.target.value}))} rows={4} placeholder="What attendees will experience..." style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, color:C.text, padding:"7px 9px", fontSize:12.5, outline:"none", resize:"none", lineHeight:1.5 }} onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                  </div>

                  {/* SEO + Social Meta */}
                  <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12, marginTop:4 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:8 }}>SEO & Social Preview</div>
                    <div style={{ marginBottom:8 }}>
                      <div style={{ fontSize:10.5, color:C.muted, marginBottom:4 }}>Meta title <span style={{ color:C.muted, fontSize:9 }}>(55–60 chars ideal)</span></div>
                      <input value={info.meta_title||""} onChange={e=>setInfo(p=>({...p,meta_title:e.target.value}))} placeholder={`${activeEvent?.name || "Event"} — Register Now`}
                        style={{ width:"100%", background:C.bg, border:`1px solid ${(info.meta_title||"").length>60?C.red:(info.meta_title||"").length>45?C.green:C.border}`, borderRadius:6, color:C.text, padding:"7px 9px", fontSize:12.5, outline:"none" }}
                        onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                      <div style={{ fontSize:10, color:(info.meta_title||"").length>60?C.red:C.muted, marginTop:2 }}>{(info.meta_title||"").length}/60</div>
                    </div>
                    <div style={{ marginBottom:8 }}>
                      <div style={{ fontSize:10.5, color:C.muted, marginBottom:4 }}>Meta description <span style={{ color:C.muted, fontSize:9 }}>(150–160 chars)</span></div>
                      <textarea value={info.meta_description||""} onChange={e=>setInfo(p=>({...p,meta_description:e.target.value}))} rows={2}
                        placeholder="Join us for..."
                        style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, color:C.text, padding:"7px 9px", fontSize:12, outline:"none", resize:"none" }}
                        onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                      <div style={{ fontSize:10, color:(info.meta_description||"").length>160?C.red:C.muted, marginTop:2 }}>{(info.meta_description||"").length}/160</div>
                    </div>
                    {/* Social preview card */}
                    {(info.meta_title||info.title) && (
                      <div style={{ border:`1px solid ${C.border}`, borderRadius:8, overflow:"hidden" }}>
                        <div style={{ height:48, background:`linear-gradient(135deg,${info.brand_color||C.blue}40,${info.brand_color||C.blue}20)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {logoUrl ? <img src={logoUrl} style={{ height:28, objectFit:"contain" }} alt="logo" /> : <span style={{ fontSize:11, color:C.muted }}>No image</span>}
                        </div>
                        <div style={{ padding:"8px 10px", background:C.raised }}>
                          <div style={{ fontSize:11, fontWeight:600, color:C.text, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{info.meta_title||info.title}</div>
                          <div style={{ fontSize:10, color:C.muted, overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{info.meta_description||info.description}</div>
                          <div style={{ fontSize:9, color:C.muted, marginTop:3 }}>evarahq.com/page/{info.slug}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {sideTab === "design" && (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div>
                    <div style={{ fontSize:10.5, color:C.muted, marginBottom:8, fontWeight:500 }}>Template</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                      {TMPLS.map(t => (
                        <button key={t.id} onClick={() => setInfo(p => ({...p, template:t.id}))} style={{ padding:"7px 8px", borderRadius:7, border:`2px solid ${info.template===t.id ? accent : C.border}`, background: info.template===t.id ? accent+"18" : C.bg, color: info.template===t.id ? accent : C.sec, fontSize:11.5, fontWeight: info.template===t.id ? 600 : 400, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                          <div style={{ width:10, height:10, borderRadius:2, background: t.bg, border:`1px solid ${C.border}`, flexShrink:0 }} />
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize:10.5, color:C.muted, marginBottom:6, fontWeight:500 }}>Accent colour</div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <input type="color" value={info.brand_color||accent} onChange={e=>setInfo(p=>({...p,brand_color:e.target.value}))} style={{ width:36, height:30, border:"none", background:"none", cursor:"pointer", padding:0 }} />
                      <input value={info.brand_color||accent} onChange={e=>setInfo(p=>({...p,brand_color:e.target.value}))} style={{ flex:1, background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, color:C.text, padding:"6px 8px", fontSize:12, outline:"none" }} />
                    </div>
                  </div>
                </div>
              )}

              {sideTab === "sections" && (
                <div>
                  {BLOCK_LIST.map((b, i) => (
                    <div key={b.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderBottom: i < BLOCK_LIST.length-1 ? `1px solid ${C.border}` : "none" }}>
                      <span style={{ fontSize:13, color: blocks[b.id] ? C.text : C.muted }}>{b.icon} {b.label}</span>
                      <div onClick={() => setBlocks(p => ({ ...p, [b.id]: !p[b.id] }))} style={{ width:32, height:18, borderRadius:9, background: blocks[b.id] ? C.green : "#3A3A3C", cursor:"pointer", position:"relative", transition:"background .2s", flexShrink:0 }}>
                        <div style={{ width:12, height:12, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left: blocks[b.id] ? 17 : 3, transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,.4)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {sideTab === "form" && (
                <div>
                  {!formId ? (
                    <div style={{ padding:"12px 0", fontSize:12, color:C.muted }}>
                      No registration form found for this event. Create an event first — the form is auto-generated.
                    </div>
                  ) : (
                    <>
                      {formShareToken && (
                        <div style={{ marginBottom:12, padding:"8px 10px", background:C.green+"12", border:`1px solid ${C.green}30`, borderRadius:7 }}>
                          <div style={{ fontSize:10, color:C.green, fontWeight:600, marginBottom:3 }}>Form link (auto-embedded on publish)</div>
                          <div style={{ fontSize:10, color:C.muted, fontFamily:"monospace", wordBreak:"break-all" }}>/form/{formShareToken}</div>
                        </div>
                      )}
                      <div style={{ fontSize:10.5, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:8 }}>Registration Fields</div>
                      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        {formFields.map((field, i) => (
                          <div key={field.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", background:C.raised, border:`1px solid ${C.border}`, borderRadius:7 }}>
                            <span style={{ flex:1, fontSize:12, color:C.text }}>{field.label}</span>
                            <button
                              onClick={() => setFormFields(p => p.map((f,fi) => fi===i ? {...f, required: !f.required} : f))}
                              style={{ fontSize:9.5, padding:"2px 7px", borderRadius:4, border:`1px solid ${field.required ? C.red+"40" : C.border}`, background: field.required ? C.red+"12" : "transparent", color: field.required ? C.red : C.muted, cursor:"pointer", whiteSpace:"nowrap" }}>
                              {field.required ? "required" : "optional"}
                            </button>
                            {!field.required && (
                              <button onClick={() => setFormFields(p => p.filter((_,fi) => fi!==i))} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:14, lineHeight:1, padding:"0 2px" }}>×</button>
                            )}
                          </div>
                        ))}
                      </div>
                      {/* Add field */}
                      <div style={{ marginTop:10 }}>
                        <div style={{ fontSize:10.5, fontWeight:600, color:C.muted, marginBottom:6 }}>Add field</div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                          {[["LinkedIn URL","text"],["Website","text"],["Team size","text"],["How did you hear","text"],["Role / Seniority","text"]].filter(([lbl]) => !formFields.some(f=>f.label===lbl)).map(([lbl,type]) => (
                            <button key={lbl} onClick={() => setFormFields(p => [...p, {id: Date.now(), type, label:lbl, required:false, options:[]}])} style={{ fontSize:10.5, padding:"3px 8px", borderRadius:5, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>+ {lbl}</button>
                          ))}
                        </div>
                      </div>
                      <div style={{ marginTop:10, fontSize:10.5, color:C.muted, padding:"8px 10px", background:C.raised, borderRadius:6, lineHeight:1.5 }}>
                        💡 Form is embedded at the bottom of your landing page. Publishing the LP auto-activates the form.
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Preview pane */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>
            {/* Preview controls */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8, flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, background:C.card, border:`1px solid ${C.border}`, borderRadius:7, padding:"5px 10px" }}>
                <Globe size={11} color={C.muted} />
                <span style={{ fontSize:11.5, color:C.muted, fontFamily:"monospace" }}>{window.location.origin}/page/{info.slug || "your-event"}</span>
              </div>
              <div style={{ display:"flex", gap:4 }}>
                {[{id:"desktop",icon:"🖥"},{id:"mobile",icon:"📱"}].map(m => (
                  <button key={m.id} onClick={() => setPreviewMode(m.id)} style={{ padding:"5px 12px", borderRadius:6, border:`1px solid ${previewMode===m.id ? C.blue : C.border}`, background: previewMode===m.id ? `${C.blue}14` : "transparent", color: previewMode===m.id ? C.blue : C.muted, fontSize:13, cursor:"pointer" }}>{m.icon}</button>
                ))}
              </div>
            </div>

            {/* Preview frame */}
            <div style={{ flex:1, overflow:"auto", display:"flex", justifyContent:"center", background:C.bg, borderRadius:10, border:`1px solid ${C.border}`, padding: previewMode==="mobile" ? "20px" : "0" }}>
              <div style={{ width: previewMode==="mobile" ? 375 : "100%", border: previewMode==="mobile" ? `1px solid ${C.border}` : "none", borderRadius: previewMode==="mobile" ? 16 : 0, overflow:"hidden", boxShadow: previewMode==="mobile" ? "0 8px 32px rgba(0,0,0,.4)" : "none" }}>
                <LivePreview />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FORMS VIEW ───────────────────────────────────────────────

export default LandingView;