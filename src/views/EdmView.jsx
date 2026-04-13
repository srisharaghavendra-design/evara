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
import {Spin, Alert, Inp, ViewHint, ScoreBadge, ImageUploadZone, EMAIL_TYPES, C} from "../components/Shared";

// BrandVoiceBadge + EdmView
function BrandVoiceBadge({ supabase, profile, setView }) {
  const [bv, setBv] = useState(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!profile?.company_id) return;
    supabase.from("brand_voice").select("industry,tone_adjectives,audience").eq("company_id", profile.company_id).maybeSingle()
      .then(({ data }) => { setBv(data); setLoaded(true); });
  }, [profile]);
  if (!loaded) return null;
  if (!bv || (!bv.industry && !bv.tone_adjectives?.length && !bv.audience)) return (
    <button onClick={() => setView?.("settings")}
      style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 10px", background:"#FF9F0A10", border:"1px solid #FF9F0A30", borderRadius:6, marginBottom:2, cursor:"pointer" }}>
      <span style={{ fontSize:11, color:"#FF9F0A", fontWeight:500 }}>⚡ Set up Brand Voice</span>
      <span style={{ fontSize:10, color:"#FF9F0A80" }}>· improves AI email quality →</span>
    </button>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: "#30D15810", border: "1px solid #30D15830", borderRadius: 6, marginBottom: 2 }}>
      <Sparkles size={11} color="#30D158" strokeWidth={2} />
      <span style={{ fontSize: 11, color: "#30D158", fontWeight: 500 }}>Brand voice active</span>
      <span style={{ fontSize: 10, color: "#30D15880" }}>· {[bv.industry, bv.tone_adjectives?.[0]].filter(Boolean).join(" · ")}</span>
    </div>
  );
}

// ─── EDM BUILDER — with AI content + beautiful templates + image upload ──────
function Sec({ label, children }) {
  return (
    <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 14 }}>
      <div style={{ fontSize: 10.5, fontWeight: 500, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 11 }}>{label}</div>
      {children}
    </div>
  );
}

function EdmView({ supabase, profile, activeEvent, fire, setView }) {
  const [eType, setEType] = useState("invitation");
  const [tmpl, setTmpl] = useState("branded");
  const [gen, setGen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [preview, setPreview] = useState(null);
  const [sendingTest, setSendingTest] = useState(false);
  const [previewWidth, setPreviewWidth] = useState("100%");
  const [previewTab, setPreviewTab] = useState("html"); // html | text
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [showTemplateLib, setShowTemplateLib] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Load saved templates
  useEffect(() => {
    if (!profile?.company_id) return;
    supabase.from("email_campaigns")
      .select("id,name,email_type,subject,html_content,created_at")
      .eq("company_id", profile.company_id)
      .eq("is_template", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => setSavedTemplates(data || []));
  }, [profile?.company_id]);

  const saveAsTemplate = async () => {
    if (!preview?.html || !profile?.company_id) return;
    const name = preview.subject || "Email template " + new Date().toLocaleDateString(); 
    setSavingTemplate(true);
    const { error } = await supabase.from("email_campaigns").insert({
      company_id: profile.company_id,
      name,
      email_type: eType,
      subject: preview.subject || "",
      html_content: preview.html,
      plain_text: preview.plain_text || "",
      status: "draft",
      segment: "all",
      is_template: true,
    });
    if (!error) {
      fire("✅ Saved as template!");
      supabase.from("email_campaigns").select("id,name,email_type,subject,html_content,created_at").eq("company_id", profile.company_id).eq("is_template", true).order("created_at", { ascending: false })
        .then(({ data }) => setSavedTemplates(data || []));
    } else { fire("Failed to save template", "err"); }
    setSavingTemplate(false);
  };

  const loadTemplate = (t) => {
    setPreview({ subject: t.subject, html: t.html_content, plain_text: t.plain_text || "", campaign_id: null });
    setEType(t.email_type || eType);
    setShowTemplateLib(false);
    fire(`Template "${t.name}" loaded!`);
  };

  // Cmd+S shortcut saves draft
  const saveDraft = async () => {
    if (!preview?.html || !activeEvent?.id || !profile?.company_id) return;
    if (preview.campaign_id) {
      await supabase.from("email_campaigns").update({ html_content: preview.html, plain_text: preview.plain_text, subject: preview.subject }).eq("id", preview.campaign_id);
      fire("💾 Draft saved!");
    } else {
      const { data: saved } = await supabase.from("email_campaigns").insert({ event_id: activeEvent.id, company_id: profile.company_id, name: (preview.subject || eType.replace(/_/g," ")+" — email").slice(0,80), email_type: eType, subject: preview.subject, html_content: preview.html, plain_text: preview.plain_text, status: "draft", segment: "all" }).select("id").single();
      if (saved?.id) { setPreview(p => ({ ...p, campaign_id: saved.id })); fire("💾 Draft saved!"); }
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (preview?.html) saveDraft();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [preview?.html, preview?.campaign_id]);
  const [subjectAlts, setSubjectAlts] = useState([]);
  const [loadingAlts, setLoadingAlts] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const initialLoadDone = useRef(false);
  const [formLink, setFormLink] = useState("");
  const [landingUrl, setLandingUrl] = useState("");
  const [ctaTarget, setCtaTarget] = useState("landing"); // "landing" | "form"
  const [uploadingZone, setUploadingZone] = useState(null);
  const [images, setImages] = useState({ header: null, body: null, footer: null });
  const [info, setInfo] = useState({
    eventName: activeEvent?.name || "",
    eventDate: activeEvent?.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU",{day:"numeric",month:"long",year:"numeric"}) : "",
    eventTime: activeEvent?.event_time || "",
    location: activeEvent?.location || "",
    description: activeEvent?.description || "",
    tone: "professional and exciting",
    extra: ""
  });
  const [resources, setResources] = useState({ photos: "", slides: "", recording: "", nextEvent: "" });
  const [showResources, setShowResources] = useState(false);

  useEffect(() => {
    if (activeEvent) {
      setInfo(p => ({ ...p, 
          eventName: activeEvent.name || "", 
          eventDate: activeEvent.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "",
          eventTime: activeEvent.event_time || p.eventTime || "",
          location: activeEvent.location || p.location || "", 
          description: activeEvent.description || p.description || "",
          orgName: p.orgName || profile?.companies?.from_name || profile?.companies?.name || ""
        }));
      supabase.from("forms").select("share_token").eq("event_id", activeEvent.id).eq("is_active", true).limit(1).maybeSingle()
        .then(({ data }) => { if (data?.share_token) setFormLink(`${window.location.origin}/form/${data.share_token}`); });
      supabase.from("landing_pages").select("slug,is_published").eq("event_id", activeEvent.id).maybeSingle()
        .then(({ data }) => {
          if (data?.slug && data?.is_published) {
            const lUrl = `${window.location.origin}/page/${data.slug}`;
            setLandingUrl(lUrl);
            setCtaTarget("landing");
          } else {
            setLandingUrl("");
            setCtaTarget("form");
          }
        });
    }
  }, [activeEvent]);

  const [aiBuilding, setAiBuilding] = useState(false);
  useEffect(() => {
    if (!activeEvent || !profile) return;
    let pollTimer = null;
    const fetchCampaigns = () => {
      supabase.from("email_campaigns").select("*").eq("event_id", activeEvent.id).order("created_at", { ascending: true })
        .then(({ data: d }) => {
          const TYPE_ORDER = ["save_the_date","invitation","reminder","reminder_week","reminder_day","confirmation","byo","thank_you"];
          const list = (d || []).sort((a,b) => {
            const ai = TYPE_ORDER.indexOf(a.email_type); const bi = TYPE_ORDER.indexOf(b.email_type);
            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
          });
          setCampaigns(list);
          if (!initialLoadDone.current && list.length > 0) {
            initialLoadDone.current = true;
            setAiBuilding(false);
            const first = list[0];
            if (first.html_content) {
              setPreview({ subject: first.subject, html: first.html_content, plain_text: first.plain_text || "", campaign_id: first.id });
              setEType(first.email_type || "invitation");
            }
          } else if (list.length === 0 && !initialLoadDone.current) {
            // AI still generating — poll every 4s for up to 90s
            setAiBuilding(true);
            pollTimer = setTimeout(fetchCampaigns, 4000);
          }
        });
    };
    fetchCampaigns();
    return () => { if (pollTimer) clearTimeout(pollTimer); };
  }, [activeEvent, profile]);

  // Upload image to Supabase Storage
  const uploadImage = async (file, zone) => {
    if (!profile) return;
    if (file.size > 3 * 1024 * 1024) { fire("Image must be under 3MB", "err"); return; }
    setUploadingZone(zone);
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      const path = `${profile.company_id}/emails/${zone}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("email-images").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("email-images").getPublicUrl(path);
      setImages(p => ({ ...p, [zone]: publicUrl }));
      fire(`${zone.charAt(0).toUpperCase() + zone.slice(1)} image uploaded!`);
    } catch (err) {
      // If bucket doesn't exist, fall back to data URL for preview
      const reader = new FileReader();
      reader.onload = e => {
        setImages(p => ({ ...p, [zone]: e.target.result }));
        fire(`${zone} image ready (local preview)`);
      };
      reader.readAsDataURL(file);
    } finally { setUploadingZone(null); }
  };

  const generate = async () => {
    if (!info.eventName) { fire("Add event name first", "err"); return; }
    setGen(true); setPreview(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-edm`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({
          ...info, emailType: eType, templateStyle: tmpl,
          tone: info.tone || "professional and exciting",
          orgName: info.orgName || profile?.companies?.name || "",
          eventId: activeEvent?.id, companyId: profile?.company_id,
          registrationUrl: (ctaTarget === "landing" && landingUrl) ? landingUrl : (formLink || null),
          headerImageUrl: images.header || null,
          bodyImageUrl: images.body || null,
          footerImageUrl: images.footer || null,
          returnFormat: "json",
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      let finalSubject = data.subject;
      let finalHtml = data.html;
      let finalPlain = data.plain_text;

      // If edge function returns structured content JSON → render into our beautiful template
      if (data.content) {
        const c = data.content;
        finalSubject = c.subject || data.subject;
        finalHtml = buildEmailHtml({
          style: tmpl,
          headline: c.headline || info.eventName,
          subheadline: c.subheadline || "",
          greeting: c.greeting || "Dear {{FIRST_NAME}},",
          bodyParagraphs: c.body_paragraphs || [],
          ctaText: c.cta_text || "Register Now",
          ctaUrl: (ctaTarget === "landing" && landingUrl) ? landingUrl : (formLink || ""),
          eventDate: info.eventDate,
          eventTime: info.eventTime,
          location: info.location,
          orgName: profile?.companies?.from_name || profile?.companies?.name || "evara",
          headerImageUrl: images.header,
          bodyImageUrl: images.body,
          footerImageUrl: images.footer,
          psLine: c.ps_line || "",
        });
      } else if (finalHtml) {
        // Old format: edge function returned full HTML.
        // If images are uploaded, always rebuild using our beautiful template
        // so images actually appear. Extract body text from AI HTML.
        if (images.header || images.body || images.footer) {
          const tmp = document.createElement("div");
          tmp.innerHTML = finalHtml;
          // Pull out meaningful paragraphs from the AI HTML
          const paras = Array.from(tmp.querySelectorAll("p,td"))
            .map(el => el.innerText?.trim())
            .filter(t => t && t.length > 30 && t.length < 800)
            .slice(0, 4);
          finalHtml = buildEmailHtml({
            style: tmpl,
            headline: info.eventName,
            subheadline: "",
            greeting: "Dear {{FIRST_NAME}},",
            bodyParagraphs: paras.length ? paras : [info.description || `We'd like to invite you to ${info.eventName}.`],
            ctaText: "Register Now",
            ctaUrl: (ctaTarget === "landing" && landingUrl) ? landingUrl : (formLink || ""),
            eventDate: info.eventDate,
            eventTime: info.eventTime,
            location: info.location,
            orgName: profile?.companies?.from_name || profile?.companies?.name || "evara",
            headerImageUrl: images.header,
            bodyImageUrl: images.body,
            footerImageUrl: images.footer,
          });
        } else {
          // No images — inject the CTA link based on current ctaTarget
          const activeCta = (ctaTarget === "landing" && landingUrl) ? landingUrl : formLink;
          if (activeCta && !finalHtml.includes(activeCta)) {
          const ctaInject = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;text-align:center;">
            <tr><td align="center">
              <a href="${activeCta}" style="display:inline-block;padding:14px 40px;background:#0A84FF;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:6px;font-family:Arial,Helvetica,sans-serif;">Register Now →</a>
            </td></tr>
          </table>`;
          finalHtml = finalHtml.replace(/<\/body>/i, ctaInject + "</body>");
          }
        }
      }

      // Always save/update the campaign in DB with the final HTML
      let finalCampaignId = data.campaign_id;
      if (activeEvent?.id && profile?.company_id) {
        if (finalCampaignId) {
          await supabase.from("email_campaigns")
            .update({ html_content: finalHtml, plain_text: finalPlain, subject: finalSubject })
            .eq("id", finalCampaignId);
        } else {
          const { data: saved } = await supabase.from("email_campaigns").insert({
            event_id: activeEvent.id,
            company_id: profile.company_id,
            name: (finalSubject || eType.replace(/_/g, " ") + " — " + info.eventName).slice(0, 80),
            email_type: eType,
            subject: finalSubject,
            html_content: finalHtml,
            plain_text: finalPlain,
            status: "draft",
            segment: "all",
          }).select("id").single();
          finalCampaignId = saved?.id || null;
        }
      }
      setPreview({ subject: finalSubject, html: finalHtml, plain_text: finalPlain, campaign_id: finalCampaignId });
      fire(`Email generated & saved as draft!${data.brand_voice_applied ? " ✨ Brand voice applied." : ""}${data.logo_applied ? " 🖼 Logo included." : ""}`);
      const { data: cams } = await supabase.from("email_campaigns").select("*").eq("event_id", activeEvent.id).order("created_at", { ascending: false });
      setCampaigns(cams || []);
    } catch (err) {
      const msg = err.message?.includes("ANTHROPIC_API_KEY") 
        ? "❌ AI key not configured — add ANTHROPIC_API_KEY in Supabase → Edge Function Secrets"
        : err.message?.includes("fetch") 
        ? "❌ Network error — check your connection and try again"
        : err.message || "Generation failed";
      fire(msg, "err");
    } finally { setGen(false); }
  };

  // Full-page AI building state — replaces entire view
  if (aiBuilding && campaigns.length === 0) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", gap:20 }}>
        <svg viewBox="0 0 56 56" width="52" height="52" style={{ animation:"spin 1.2s linear infinite" }}>
          <circle cx="28" cy="28" r="24" fill="none" stroke="#0A84FF20" strokeWidth="4"/>
          <circle cx="28" cy="28" r="24" fill="none" stroke="#0A84FF" strokeWidth="4" strokeDasharray="38 113" strokeLinecap="round"/>
        </svg>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:17, fontWeight:700, color:"#1C1C1E", marginBottom:8 }}>AI is drafting your emails…</div>
          <div style={{ fontSize:13, color:"#AEAEB2" }}>Building Save the Date, Invite, Reminder &amp; Thank You.</div>
          <div style={{ fontSize:12, color:"#AEAEB2", marginTop:4 }}>This takes about 30 seconds — they'll appear automatically.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.6px", color: C.text }}>eDM Builder</h1>
            <span style={{ fontSize:10.5, padding:"2px 8px", borderRadius:4, background:C.blue+"12", color:C.blue, border:`1px solid ${C.blue}20` }}>✨ Claude Sonnet 4</span>
          </div>
          <p style={{ color: C.muted, fontSize: 13 }}>AI generates copy · your template renders it · world-class result every time.</p>
        </div>
        {/* Brand assets status */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {profile?.companies?.logo_url
            ? <span style={{ fontSize:10.5, padding:"3px 9px", borderRadius:999, background:C.green+"15", color:C.green, border:`1px solid ${C.green}30`, fontWeight:600 }}>🖼 Logo ready</span>
            : <span style={{ fontSize:10.5, padding:"3px 9px", borderRadius:999, background:C.amber+"12", color:C.amber, border:`1px solid ${C.amber}30`, fontWeight:500, cursor:"pointer" }}
                onClick={() => setView("settings")}>⚠️ No logo — add in Settings</span>
          }
          {profile?.companies?.brand_color
            ? <span style={{ fontSize:10.5, padding:"3px 9px", borderRadius:999, background:C.green+"15", color:C.green, border:`1px solid ${C.green}30`, fontWeight:600 }}>🎨 Brand colour set</span>
            : null
          }
          {profile?.companies?.from_name
            ? <span style={{ fontSize:10.5, padding:"3px 9px", borderRadius:999, background:C.green+"15", color:C.green, border:`1px solid ${C.green}30`, fontWeight:600 }}>✉️ Sender: {profile.companies.from_name}</span>
            : <span style={{ fontSize:10.5, padding:"3px 9px", borderRadius:999, background:C.amber+"12", color:C.amber, border:`1px solid ${C.amber}30`, fontWeight:500, cursor:"pointer" }}
                onClick={() => setView("settings")}>⚠️ Set sender name</span>
          }
        </div>
      </div>
      {!activeEvent && (
        <div style={{ padding:"11px 14px", background:C.amber+"12", borderRadius:8, border:`1px solid ${C.amber}40`, marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:16 }}>⚠️</span>
          <span style={{ fontSize:13, color:C.amber, fontWeight:500 }}>No event selected — select an event from the sidebar to save generated emails to your campaign.</span>
        </div>
      )}

      {activeEvent && (
        <div style={{ padding:"7px 12px", background:C.blue+"08", borderRadius:7, border:`1px solid ${C.blue}18`, marginBottom:10, display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
          <span style={{ fontSize:12, fontWeight:600, color:C.blue }}>✉️ {activeEvent.name}</span>
          {activeEvent.event_date && <span style={{ fontSize:11, color:C.muted }}>📅 {new Date(activeEvent.event_date).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})}</span>}
          {activeEvent.location && <span style={{ fontSize:11, color:C.muted }}>📍 {activeEvent.location}</span>}
        </div>
      )}
      {/* ── CTA Chain selector ── */}
      {activeEvent && (formLink || landingUrl) && (() => {
        const activeCta = ctaTarget === "landing" && landingUrl ? landingUrl : formLink;
        const chainComplete = landingUrl && formLink;
        return (
          <div style={{ marginBottom:10, padding:"10px 14px", background:C.card, border:`1px solid ${C.border}`, borderRadius:9, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            <span style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:"0.8px", textTransform:"uppercase", whiteSpace:"nowrap" }}>Email CTA links to</span>
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              <button onClick={() => setCtaTarget("landing")} style={{ fontSize:11.5, padding:"4px 10px", borderRadius:6, border:`1px solid ${ctaTarget==="landing"?C.blue:C.border}`, background:ctaTarget==="landing"?C.blue+"15":"transparent", color:ctaTarget==="landing"?C.blue:C.muted, cursor:"pointer", fontWeight:ctaTarget==="landing"?600:400, display:"flex", alignItems:"center", gap:4 }}>
                🌐 Landing Page {landingUrl ? <span style={{fontSize:9,color:C.green}}>✓ live</span> : <span style={{fontSize:9,color:C.amber}}>not yet live</span>}
              </button>
              <span style={{ fontSize:11, color:C.border }}>→</span>
              <button onClick={() => setCtaTarget("form")} style={{ fontSize:11.5, padding:"4px 10px", borderRadius:6, border:`1px solid ${ctaTarget==="form"?C.blue:C.border}`, background:ctaTarget==="form"?C.blue+"15":"transparent", color:ctaTarget==="form"?C.blue:C.muted, cursor:"pointer", fontWeight:ctaTarget==="form"?600:400, display:"flex", alignItems:"center", gap:4 }}>
                📋 Form directly {formLink ? <span style={{fontSize:9,color:C.green}}>✓</span> : <span style={{fontSize:9,color:C.amber}}>not yet created</span>}
              </button>
            </div>
            {chainComplete && ctaTarget === "landing" && (
              <span style={{ fontSize:10.5, color:C.green, marginLeft:"auto" }}>✅ Full chain: Email → Landing Page → Form</span>
            )}
            {!landingUrl && ctaTarget === "landing" && (
              <span style={{ fontSize:10.5, color:C.amber, marginLeft:"auto" }}>Publish your Landing Page first (Step 2) to enable this</span>
            )}
          </div>
        );
      })()}
      {/* ── EMAIL TYPE TABS — primary navigation ── */}
      {(() => {
        const EMAIL_TABS = [
          { type: "save_the_date", label: "Save the Date", icon: "📅" },
          { type: "invitation",    label: "Invite",         icon: "✉️" },
          { type: "reminder",      label: "Reminder",       icon: "⏰" },
          { type: "day_of_details",label: "Day-of Details", icon: "🌅" },
          { type: "thank_you",     label: "Thank You",      icon: "🙏" },
        ];
        const isGenerating = aiBuilding || (campaigns.length === 0 && activeEvent);
        return (
          <div style={{ marginBottom: 0 }}>
            {/* Tab bar */}
            <div style={{ display: "flex", borderBottom: `2px solid ${C.border}`, marginBottom: 0 }}>
              {EMAIL_TABS.map(tab => {
                const cam = campaigns.find(c => c.email_type === tab.type);
                const isActive = preview?.campaign_id === cam?.id;
                const isApproved = cam?.status === "approved" || cam?.status === "sent";
                const isDraft = cam?.status === "draft";
                return (
                  <button key={tab.type}
                    onClick={() => {
                      if (cam) {
                        setPreview({ subject: cam.subject, html: cam.html_content, plain_text: cam.plain_text || "", campaign_id: cam.id });
                        setEType(cam.email_type);
                      } else {
                        setEType(tab.type);
                        setPreview(null);
                      }
                    }}
                    style={{
                      flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      padding: "12px 8px 10px",
                      background: "transparent", border: "none",
                      borderBottom: `2.5px solid ${isActive ? C.blue : "transparent"}`,
                      marginBottom: -2,
                      color: isActive ? C.blue : cam ? C.text : C.muted,
                      cursor: "pointer", transition: "all .12s",
                    }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: 13 }}>{tab.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, whiteSpace: "nowrap" }}>{tab.label}</span>
                    </div>
                    <div style={{ fontSize: 9.5, fontWeight: 600,
                      color: isApproved ? C.green : isDraft ? C.amber : isGenerating ? C.blue : C.muted }}>
                      {isApproved ? "✓ approved" : isDraft ? "● draft" : isGenerating ? "generating…" : "not started"}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Tab content area — generating state */}
            {isGenerating && campaigns.length === 0 && (
              <div style={{ padding: "32px 24px", textAlign: "center", background: C.card, borderRadius: "0 0 10px 10px", border: `1px solid ${C.border}`, borderTop: "none", marginBottom: 16 }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>✨</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>AI is drafting your emails…</div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>This takes about 10–30 seconds. They'll appear as tabs above once ready.</div>
                <div style={{ fontSize: 12, color: C.muted, opacity: 0.8 }}>You can generate a custom email using the builder below while you wait.</div>
              </div>
            )}

            {/* Tab content area — no selection prompt */}
            {!isGenerating && campaigns.length > 0 && !preview && (
              <div style={{ padding: "20px 24px", textAlign: "center", background: C.card, border: `1px solid ${C.border}`, borderTop: "none", borderRadius: "0 0 10px 10px", marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: C.muted }}>← Select an email tab above to preview and approve it</div>
              </div>
            )}
          </div>
        );
      })()}
      <div className="edm-grid" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, minHeight: "70vh" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 11, overflow: "auto" }}>
          <Sec label="Email type">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
              {EMAIL_TYPES.map(t => (
                <button key={t.id} onClick={() => setEType(t.id)} style={{ padding: "7px 10px", borderRadius: 6, border: `1px solid ${eType === t.id ? C.blue + "80" : C.border}`, background: eType === t.id ? C.blue + "10" : "transparent", color: eType === t.id ? C.blue : C.muted, fontSize: 12.5, textAlign: "left", fontWeight: eType === t.id ? 500 : 400, transition: "all .12s", cursor: "pointer" }}>
                  {t.label}
                </button>
              ))}
            </div>
          </Sec>

          <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, padding: "6px 10px", background: C.raised, borderRadius: 6, borderLeft: `3px solid ${C.blue}40` }}>
            {{"invitation":"📌 Date · Time · Venue · CTA · Key agenda highlight",
              "save_the_date":"📅 Event name · Date only — build intrigue, no full details yet",
              "reminder":"⚡ Urgency + logistics: venue, time, what to bring",
              "thank_you":"🙏 Appreciation · Highlights · Tease next event",
              "confirmation":"✅ Their confirmed spot + logistics + calendar link",
              "byo":"🎒 What to wear · Bring · Know — parking, agenda, contact",
            }[eType] || "✨ Generate with AI below"}
          </div>
          <Sec label="Template style">
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { id:"minimal", label:"Minimal", desc:"Clean white", bg:"#F8F8F6", accent:"#111", textBg:"#E8E8E6" },
                { id:"branded", label:"Branded", desc:"Dark pro", bg:"#0A1628", accent:"#0A84FF", textBg:"rgba(255,255,255,0.15)" },
                { id:"vibrant", label:"Vibrant", desc:"Bold colour", bg:"#FF5C35", accent:"#fff", textBg:"rgba(255,255,255,0.3)" },
              ].map(t => (
                <button key={t.id} onClick={() => { setTmpl(t.id); setPreview(null); }} style={{ flex:1, padding:"8px 6px", borderRadius:7, border:`1.5px solid ${tmpl===t.id?C.blue+"80":C.border}`, background:tmpl===t.id?C.blue+"10":"transparent", cursor:"pointer", textAlign:"center", transition:"all .12s" }}>
                  {/* Mini email preview */}
                  <div style={{ width:"100%", height:40, borderRadius:4, marginBottom:5, background:t.bg, padding:"4px 5px", overflow:"hidden" }}>
                    <div style={{ height:5, borderRadius:2, background:t.accent, opacity:0.9, marginBottom:3 }} />
                    <div style={{ height:3, borderRadius:1, background:t.textBg, width:"70%", marginBottom:2 }} />
                    <div style={{ height:3, borderRadius:1, background:t.textBg, width:"50%", marginBottom:3 }} />
                    <div style={{ height:8, width:32, borderRadius:2, background:t.accent, opacity:0.8 }} />
                  </div>
                  <div style={{ fontSize:11.5, fontWeight:600, color:tmpl===t.id?C.blue:C.text }}>{t.label}</div>
                  <div style={{ fontSize:10, color:C.muted }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </Sec>

          <Sec label="Tone">
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {[
                { id:"professional and authoritative", label:"Professional", emoji:"💼" },
                { id:"warm and friendly", label:"Warm", emoji:"🤝" },
                { id:"exciting and high-energy", label:"Exciting", emoji:"⚡" },
                { id:"formal and prestigious", label:"Formal", emoji:"🎩" },
                { id:"urgent and compelling", label:"Urgent", emoji:"🔥" },
                { id:"celebratory and joyful", label:"Celebratory", emoji:"🎉" },
              ].map(t => (
                <button key={t.id} onClick={() => setInfo(p => ({ ...p, tone: t.id }))}
                  style={{ fontSize: 11, padding: "5px 11px", borderRadius: 6, border: `1px solid ${(info.tone||"professional and authoritative") === t.id ? C.blue + "80" : C.border}`, background: (info.tone||"professional and authoritative") === t.id ? C.blue + "15" : "transparent", cursor: "pointer", color: (info.tone||"professional and authoritative") === t.id ? C.blue : C.muted, fontWeight: (info.tone||"professional and authoritative") === t.id ? 600 : 400, display:"flex", alignItems:"center", gap:4 }}>
                  <span>{t.emoji}</span>{t.label}
                </button>
              ))}
            </div>
          </Sec>

          <Sec label="Event details">
            {[{ k: "eventName", ph: "Tech Summit 2026" }, { k: "eventDate", ph: "April 15, 2026" }, { k: "eventTime", ph: "06:30 PM" }, { k: "location", ph: "Marina Bay Sands" }].map(f => (
              <div key={f.k} style={{ marginBottom: 7 }}>
                <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 3, textTransform: "capitalize" }}>{f.k.replace(/([A-Z])/g, " $1").toLowerCase()}</div>
                <input value={info[f.k]} onChange={e => setInfo(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "6px 8px", fontSize: 12.5, outline: "none" }} />
              </div>
            ))}
            <div>
              <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 3 }}>Description</div>
              <textarea value={info.description} onChange={e => setInfo(p => ({ ...p, description: e.target.value }))} rows={3} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "7px 8px", fontSize: 12.5, outline: "none", resize: "none", lineHeight: 1.5 }} />
            </div>
          </Sec>

          <button onClick={() => setShowAdvanced(p => !p)} style={{ width:"100%", padding:"7px 10px", background:"transparent", border:`1px dashed ${C.border}`, borderRadius:7, color:C.muted, fontSize:11.5, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", fontWeight:500, marginBottom: showAdvanced ? 8 : 0 }}>
            <span>⚙️ Advanced options (tone, images, form link)</span>
            <span style={{ fontSize:10 }}>{showAdvanced ? "▲ hide" : "▼ show"}</span>
          </button>
          {showAdvanced && (<>
          <Sec label="Tone / Extra context">
            <textarea value={info.extra} onChange={e => setInfo(p => ({ ...p, extra: e.target.value }))} rows={2} placeholder="e.g. Black tie. Partners welcome. Emphasise exclusivity." style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "7px 8px", fontSize: 12.5, outline: "none", resize: "none", lineHeight: 1.5 }} />
          </Sec>
          {eType === "thank_you" && (
            <Sec label="Post-event resources (Thank You)">
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>AI includes these links in the thank you email</div>
              {[
                { k: "photos", ph: "https://photos.google.com/...", label: "Event photos URL" },
                { k: "slides", ph: "https://slides.com/...", label: "Presentation slides URL" },
                { k: "recording", ph: "https://youtube.com/...", label: "Recording URL" },
                { k: "nextEvent", ph: "https://...", label: "Next event URL" },
              ].map(f => (
                <div key={f.k} style={{ marginBottom: 7 }}>
                  <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>{f.label}</div>
                  <input value={resources[f.k]} onChange={e => setResources(p => ({ ...p, [f.k]: e.target.value }))}
                    placeholder={f.ph} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "6px 8px", fontSize: 11.5, outline: "none" }} />
                </div>
              ))}
            </Sec>
          )}

          <Sec label="Registration form link">
            <div style={{ fontSize: 11, color: formLink ? C.green : C.muted, marginBottom: 6 }}>{formLink ? "✓ Auto-loaded from your saved form" : "Paste your form URL — becomes the CTA button"}</div>
            <input value={formLink} onChange={e => setFormLink(e.target.value)} placeholder="https://…" style={{ width: "100%", background: C.bg, border: `1px solid ${formLink ? C.green + "50" : C.border}`, borderRadius: 5, color: C.text, padding: "7px 8px", fontSize: 12, outline: "none" }} />
          </Sec>

          {/* IMAGE UPLOAD ZONES */}
          <Sec label="Images (optional)">
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Add images to your email — stored securely, rendered in all clients.</div>
            <ImageUploadZone
              label="Header image"
              sublabel="Replaces colour header · 600×200px recommended"
              url={images.header}
              uploading={uploadingZone === "header"}
              onUpload={f => uploadImage(f, "header")}
              onClear={() => setImages(p => ({ ...p, header: null }))}
            />
            {images.header && (
              <button onClick={async () => {
                if (!window.confirm(`Apply this header image to all ${campaigns.length} email drafts?`)) return;
                let updated = 0;
                for (const cam of campaigns) {
                  if (!cam.html_content) continue;
                  // Replace existing header img src or inject after opening body tag
                  let html = cam.html_content;
                  if (html.includes('class="email-header-img"') || html.includes('id="header-img"')) {
                    html = html.replace(/(<img[^>]*(?:class="email-header-img"|id="header-img")[^>]*src=")[^"]*(")/g, `$1${images.header}$2`);
                  } else {
                    // Replace the brand-color header div with the image
                    html = html.replace(
                      /(<td[^>]*background-color[^>]*>)(\s*<\/td>)/,
                      `$1<img src="${images.header}" style="width:100%;max-width:600px;display:block" />$2`
                    );
                  }
                  await supabase.from("email_campaigns").update({ html_content: html }).eq("id", cam.id);
                  updated++;
                }
                fire(`✅ Header applied to ${updated} emails`);
                setCampaignsVersion(v => v + 1);
              }} style={{ width: "100%", marginTop: 6, padding: "7px 12px", borderRadius: 7, border: `1px solid ${C.blue}40`, background: `${C.blue}10`, color: C.blue, fontSize: 12, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                ✨ Apply this header to all {campaigns.length} emails
              </button>
            )}
            <ImageUploadZone
              label="In-body image"
              sublabel="Speaker photo, venue, or banner · 600×300px"
              url={images.body}
              uploading={uploadingZone === "body"}
              onUpload={f => uploadImage(f, "body")}
              onClear={() => setImages(p => ({ ...p, body: null }))}
            />
            <ImageUploadZone
              label="Footer image"
              sublabel="Sponsor logos or brand lockup · 600×80px"
              url={images.footer}
              uploading={uploadingZone === "footer"}
              onUpload={f => uploadImage(f, "footer")}
              onClear={() => setImages(p => ({ ...p, footer: null }))}
            />
          </Sec>
          </>)}

          <BrandVoiceBadge supabase={supabase} profile={profile} setView={setView} />

          {/* ── BLANK CANVAS FEAR SOLVER ── */}
          {!info.extra && !activeEvent?.description && (
            <div style={{ background:C.raised, borderRadius:8, padding:"10px 12px", marginBottom:4 }}>
              <div style={{ fontSize:10, fontWeight:600, color:C.muted, letterSpacing:"1px", marginBottom:8 }}>💡 QUICK STARTERS — click to use</div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {[
                  { label:"Formal corporate dinner", extra:"Black tie optional. Partners welcome. Emphasise exclusivity and limited seats." },
                  { label:"High-energy product launch", extra:"Energetic, bold tone. Focus on innovation and being first to experience the product." },
                  { label:"Intimate networking breakfast", extra:"Casual, warm tone. Small group, senior professionals. Coffee and conversation." },
                  { label:"Leadership summit — keynotes + roundtables", extra:"Thought leadership focus. Senior executives. Strategic conversations, not sales." },
                  { label:"Client appreciation — relationship building", extra:"Warm, personal tone. Celebrating the partnership. No hard sell — pure gratitude." },
                ].map(ex => (
                  <button key={ex.label} onClick={() => setInfo(p => ({ ...p, extra: ex.extra }))}
                    style={{ textAlign:"left", fontSize:12, padding:"6px 10px", borderRadius:6, border:`1px solid ${C.border}`, background:C.card, color:C.sec, cursor:"pointer", transition:"all .1s", lineHeight:1.4 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.color=C.blue; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.sec; }}>
                    → {ex.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button onClick={generate} disabled={gen} style={{ padding: "11px", borderRadius: 8, border: "none", background: gen ? C.raised : C.blue, color: gen ? C.muted : "#fff", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .15s", boxShadow: gen ? "none" : `0 4px 20px ${C.blue}35`, cursor: "pointer" }}>
            {gen ? <><Spin />Claude is writing… (~15s)</> : <><Sparkles size={14} strokeWidth={1.5} />Generate with AI</>}
          </button>

          {/* ── SEND TO MY INBOX — always visible ── */}
          {preview && profile?.email && (
            <button onClick={async () => {
              const { data: { session } } = await supabase.auth.getSession();
              setSendingTest(true);
              const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
                method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${session?.access_token}`},
                body: JSON.stringify({ contacts:[{ email:profile.email, first_name:profile.full_name?.split(" ")[0]||"Test" }], subject:`[PREVIEW] ${preview.subject}`, htmlContent:preview.html.replace(/{{REGISTRATION_URL}}/g, landingUrl||formLink||"#").replace(/{{UNSUBSCRIBE_URL}}/g,"#"), ...getSender(profile) })
              });
              setSendingTest(false);
              const d = await res.json();
              fire(d.sent > 0 ? `✅ Sent to ${profile.email}` : "Send failed", d.sent > 0 ? "ok" : "err");
            }} style={{ padding:"9px", borderRadius:7, border:`1px solid ${C.green}40`, background:`${C.green}08`, color:C.green, fontSize:12.5, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:6, cursor:"pointer", transition:"all .1s" }}>
              {sendingTest ? "Sending…" : `⚡ Send to my inbox (${profile.email})`}
            </button>
          )}

          {campaigns.length === 0 && activeEvent && (
            <div style={{ background:`${C.blue}08`, border:`1px solid ${C.blue}25`, borderRadius:10, padding:"16px 14px", marginTop:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:`${C.blue}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, animation:"pulse 2s infinite" }}>✨</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.blue }}>AI is drafting your emails…</div>
                  <div style={{ fontSize:11, color:C.muted }}>This takes about 10–30 seconds. They'll appear in "Saved drafts" below.</div>
                </div>
              </div>
              <div style={{ fontSize:11, color:C.muted, display:"flex", flexDirection:"column", gap:4 }}>
                <div>💡 While you wait — select an email type and generate a custom one above</div>
                <div>📋 Or go to <strong style={{color:C.text}}>Schedule</strong> to see and send your drafts once they appear</div>
              </div>
            </div>
          )}

          {campaigns.length > 0 && (() => {
            const sentCount = campaigns.filter(c => c.status === "sent").length;
            const scheduledCount = campaigns.filter(c => c.status === "scheduled").length;
            const draftCount = campaigns.filter(c => c.status === "draft").length;
            return (
              <div style={{ background:`${C.green}07`, border:`1px solid ${C.green}20`, borderRadius:10, padding:"12px 14px", marginBottom:12, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:C.green }} />
                  <span style={{ fontSize:12.5, fontWeight:600, color:C.green }}>{campaigns.length} email{campaigns.length!==1?"s":""} drafted</span>
                </div>
                {scheduledCount > 0 && <span style={{ fontSize:11.5, color:C.blue, background:`${C.blue}12`, padding:"2px 8px", borderRadius:4, fontWeight:500 }}>📅 {scheduledCount} scheduled</span>}
                {sentCount > 0 && <span style={{ fontSize:11.5, color:C.green, background:`${C.green}12`, padding:"2px 8px", borderRadius:4, fontWeight:500 }}>✅ {sentCount} sent</span>}
                {draftCount > 0 && <span style={{ fontSize:11.5, color:C.muted, background:C.raised, padding:"2px 8px", borderRadius:4 }}>✏️ {draftCount} draft{draftCount!==1?"s":""}</span>}
                <span style={{ fontSize:11, color:C.muted, marginLeft:"auto" }}>Click any email below to preview</span>
              </div>
            );
          })()}
          {campaigns.length > 0 && (
            <Sec label={`Saved drafts (${campaigns.length}) · ${campaigns.filter(c=>c.status==="scheduled").length} scheduled`}>
              {campaigns.map(cam => (
                <div key={cam.id}
                  style={{ padding: "9px 10px", borderRadius: 7, border: `1px solid ${C.border}`, marginBottom: 6, transition: "border-color .12s", background: C.bg }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.blue} onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, cursor: cam.html_content ? "pointer" : "default" }} onClick={() => {
                    if (cam.html_content) {
                      setPreview({ subject: cam.subject, html: cam.html_content, plain_text: cam.plain_text, campaign_id: cam.id });
                      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
                    }
                  }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>
                      {cam.email_type === "save_the_date" ? "📅" : cam.email_type === "invitation" ? "✉️" : cam.email_type === "reminder" ? "⏰" : cam.email_type === "day_of_details" ? "📍" : cam.email_type === "thank_you" ? "🙏" : cam.email_type === "confirmation" ? "✅" : "📧"}
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{cam.subject || cam.name}</span>
                    {cam.status === "sent" && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: C.green + "20", color: C.green, flexShrink: 0 }}>Sent</span>}
                  </div>
                  {cam.subject && cam.name !== cam.subject && <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cam.name}</div>}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 10.5, color: C.muted, textTransform: "capitalize" }}>{cam.email_type?.replace(/_/g, " ")}{cam.total_sent > 0 ? ` · ${cam.total_sent} sent` : ""}</span>
                    <div style={{ display:"flex", gap:4 }}>
                      {cam.html_content && (
                        <button onClick={e => { e.stopPropagation(); setPreview({ subject: cam.subject, html: cam.html_content, plain_text: cam.plain_text, campaign_id: cam.id }); }}
                          style={{ fontSize:10, padding:"2px 7px", borderRadius:4, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>
                          👁 View
                        </button>
                      )}
                      {cam.status !== "sent" && (
                        <button onClick={async e => {
                          e.stopPropagation();
                          if (!activeEvent || !profile) return;
                          fire("🔄 Regenerating…");
                          const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-edm`, {
                            method:"POST", headers:{"Content-Type":"application/json","apikey":SUPABASE_ANON_KEY},
                            body: JSON.stringify({ eventName:activeEvent.name, eventDate:activeEvent.event_date?new Date(activeEvent.event_date).toLocaleDateString("en-AU",{day:"numeric",month:"long",year:"numeric"}):"", eventTime:activeEvent.event_time||"", location:activeEvent.location||"", description:activeEvent.description||"", orgName:profile?.companies?.name||"", emailType:cam.email_type||"invitation", tone:info.tone||"professional and exciting", companyId:profile.company_id, eventId:activeEvent.id })
                          });
                          const d = await res.json();
                          if (d.success && d.html) {
                            await supabase.from("email_campaigns").update({ html_content:d.html, subject:d.subject, plain_text:d.plain_text }).eq("id", cam.id);
                            setCampaigns(p => p.map(c => c.id===cam.id ? {...c, html_content:d.html, subject:d.subject, plain_text:d.plain_text} : c));
                            setPreview({ subject:d.subject, html:d.html, plain_text:d.plain_text, campaign_id:cam.id });
                            fire("✅ Regenerated!");
                          } else fire(d.error||"Failed","err");
                        }} style={{ fontSize:10, padding:"2px 7px", borderRadius:4, border:`1px solid ${C.blue}30`, background:`${C.blue}08`, color:C.blue, cursor:"pointer" }}>
                          ✨ Regen
                        </button>
                      )}
                      {cam.status !== "sent" && (
                        <button onClick={async e => {
                          e.stopPropagation();
                          if (!window.confirm(`Delete this "${cam.email_type}" email? This cannot be undone.`)) return;
                          await supabase.from("email_campaigns").delete().eq("id", cam.id);
                          setCampaigns(p => p.filter(c => c.id !== cam.id));
                          if (preview?.campaign_id === cam.id) setPreview(null);
                          fire("🗑 Email deleted");
                        }} style={{ fontSize:10, padding:"2px 7px", borderRadius:4, border:`1px solid ${C.red}30`, background:`${C.red}08`, color:C.red, cursor:"pointer" }}>
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </Sec>
          )}
        </div>

        {/* PREVIEW PANEL */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ fontSize: 10.5, fontWeight: 500, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px" }}>Preview</div>
              {preview?.html && (() => {
                const words = preview.html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(w => w.length > 1).length;
                const mins = Math.max(1, Math.round(words / 200));
                return <span style={{ fontSize: 10, color: C.muted }}>{words} words · ~{mins} min read{words < 50 ? " ⚠️ too short" : words > 500 ? " ⚠️ too long" : ""}</span>;
              })()}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize: 10, color: C.muted }}>⌘S to save</span>
              {preview?.campaign_id && (() => {
                const cam = campaigns.find(c => c.id === preview.campaign_id);
                const isApproved = cam?.status === "approved" || cam?.status === "sent";
                return isApproved ? (
                  <div style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", background:`${C.green}15`, border:`1px solid ${C.green}40`, borderRadius:7, fontSize:12, fontWeight:700, color:C.green }}>
                    ✓ Approved
                  </div>
                ) : (
                  <button onClick={async () => {
                    const { error } = await supabase.from("email_campaigns").update({ status: "approved" }).eq("id", preview.campaign_id);
                    if (!error) {
                      setCampaigns(p => p.map(c => c.id === preview.campaign_id ? { ...c, status: "approved" } : c));
                      fire("✅ Email approved! Move to Step 2 when all emails are done.");
                    }
                  }} style={{ padding:"6px 18px", background:C.green, color:"#fff", border:"none", borderRadius:7, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, boxShadow:`0 2px 8px ${C.green}40` }}>
                    ✓ Approve this email
                  </button>
                );
              })()}
            </div>
          </div>

          <div style={{ flex: 1, border: `1px solid ${preview ? C.blue + "50" : C.border}`, borderRadius: 10, background: "#EBEBEB", overflow: "auto", transition: "border-color .3s", minHeight: preview ? 0 : 500, display: "flex", flexDirection: "column" }}>
            {!preview && !gen && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, minHeight: 300, padding: 32 }}>
                {aiBuilding ? (
                  <>
                    <svg viewBox="0 0 56 56" width="44" height="44" style={{ animation:"spin 1.2s linear infinite" }}>
                      <circle cx="28" cy="28" r="24" fill="none" stroke="#0A84FF20" strokeWidth="4"/>
                      <circle cx="28" cy="28" r="24" fill="none" stroke="#0A84FF" strokeWidth="4" strokeDasharray="38 113" strokeLinecap="round"/>
                    </svg>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:6 }}>AI is building your emails…</div>
                      <div style={{ fontSize:12, color:C.muted }}>This takes 20–40 seconds. They'll appear automatically.</div>
                    </div>
                  </>
                ) : (
                  <>
                    <Mail size={32} color="#AEAEB2" strokeWidth={1} style={{ opacity: .4 }} />
                    <span style={{ fontSize: 13, color: "#AEAEB2" }}>Select an email above to preview, or generate a new one below</span>
                  </>
                )}
              </div>
            )}
            {gen && (() => {
              return (
                <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, minHeight:300, padding:32 }}>
                  <div style={{ position:"relative", width:56, height:56 }}>
                    <svg viewBox="0 0 56 56" width="56" height="56" style={{ animation:"spin 1.2s linear infinite", position:"absolute", top:0, left:0 }}>
                      <circle cx="28" cy="28" r="24" fill="none" stroke="#0A84FF20" strokeWidth="4"/>
                      <circle cx="28" cy="28" r="24" fill="none" stroke="#0A84FF" strokeWidth="4" strokeDasharray="38 113" strokeLinecap="round"/>
                    </svg>
                    <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>✨</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:14, fontWeight:600, color:"#1C1C1E", marginBottom:6 }}>Claude is writing your email…</div>
                    <div style={{ fontSize:12, color:"#AEAEB2" }}>This usually takes 10–20 seconds</div>
                  </div>
                </div>
              );
            })()}
            {preview && (
              <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "12px 16px", background: "white", borderBottom: "1px solid #E5E5EA", fontFamily: "Arial,sans-serif" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div style={{ fontSize: 11, color: "#999" }}>Subject</div>
                      {preview?.subject && <span style={{ fontSize: 10, color: preview.subject.length > 60 ? "#FF453A" : preview.subject.length > 40 ? "#FF9F0A" : "#30D158" }}>
                        {preview.subject.length}/60 chars
                      </span>}
                    </div>
                    <button onClick={async () => {
                      setLoadingAlts(true); setSubjectAlts([]);
                      const { data: { session: s } } = await supabase.auth.getSession();
                      const res = await fetch(`${SUPABASE_URL}/functions/v1/subject-suggestions`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${s?.access_token}` },
                        body: JSON.stringify({ subject: preview.subject, emailType: eType, eventName: info.eventName })
                      }).then(r => r.json()).catch(() => ({ suggestions: [] }));
                      setSubjectAlts(res.suggestions || []);
                      setLoadingAlts(false);
                    }} disabled={loadingAlts} style={{ fontSize: 10, padding: "2px 8px", background: "#0A84FF15", border: "1px solid #0A84FF30", borderRadius: 4, color: "#0A84FF", cursor: "pointer" }}>
                      {loadingAlts ? "…" : "✨ Alt subjects"}
                    </button>
                  </div>
                  <input
                  value={preview.subject || ""}
                  onChange={e => setPreview(p => ({ ...p, subject: e.target.value }))}
                  style={{ fontSize: 14, fontWeight: 600, color: "#111", border: "none", outline: "none", background: "transparent", width: "100%", fontFamily: "inherit" }} />
                  {subjectAlts.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, color: "#888", marginBottom: 5, textTransform:"uppercase", letterSpacing:"0.5px" }}>✨ Click to use alternative subject:</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                        {subjectAlts.map((s, i) => (
                          <button key={i} onClick={() => { setPreview(p => ({ ...p, subject: s })); setSubjectAlts([]); }}
                            style={{ fontSize: 11.5, padding: "4px 10px", background: "#EEF3FF", borderRadius: 20, cursor: "pointer", color: "#0A84FF", border: "1px solid #C7D9FF", fontFamily:"inherit", transition:"all .1s" }}
                            onMouseEnter={e => { e.currentTarget.style.background="#0A84FF"; e.currentTarget.style.color="#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.background="#EEF3FF"; e.currentTarget.style.color="#0A84FF"; }}>
                            {s}
                          </button>
                        ))}
                        <button onClick={() => setSubjectAlts([])} style={{ fontSize:11, padding:"4px 8px", background:"transparent", border:"1px solid #ddd", borderRadius:20, color:"#999", cursor:"pointer", fontFamily:"inherit" }}>✕</button>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ background: "#f2f2f2", borderRadius: 8, overflow: "hidden" }}>
                  {/* Toolbar: device toggle + spam score */}
                  <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "6px 14px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {/* Device toggle */}
                    <div style={{ display: "flex", gap: 3 }}>
                      {[{label:"🖥",w:"100%"},{label:"📱",w:"375px"}].map(v => (
                        <button key={v.w} onClick={() => setPreviewWidth(v.w)}
                          style={{ fontSize: 13, padding: "3px 8px", borderRadius: 5, border: `1px solid ${previewWidth===v.w||(!previewWidth&&v.w==="100%") ? C.blue : C.border}`, background: previewWidth===v.w||(!previewWidth&&v.w==="100%") ? C.blue+"15" : "transparent", cursor: "pointer" }}>
                          {v.label}
                        </button>
                      ))}
                      {[
                        { label: "⬇ Outlook iOS", suffix: "-ios",
                          transform: h => h },
                        { label: "⬇ Outlook Win", suffix: "-win",
                          transform: h => h.replace(/border-radius:[^;]+;/gi,"").replace(/box-shadow:[^;]+;/gi,"").replace(/background-image:[^;]+;/gi,"").replace(/linear-gradient[^;]+;/gi,"") }
                      ].map(({ label, suffix, transform }) => (
                        <button key={suffix} onClick={() => {
                          const subject = preview.subject || "Email Preview";
                          const emlContent = [
                            "MIME-Version: 1.0",
                            `Date: ${new Date().toUTCString()}`,
                            "From: hello@evarahq.com",
                            "To: test@example.com",
                            `Subject: ${subject}`,
                            "Content-Type: text/html; charset=UTF-8",
                            "",
                            transform(preview.html || "")
                          ].join("\r\n");
                          const a = Object.assign(document.createElement("a"), {
                            href: URL.createObjectURL(new Blob([emlContent], { type: "message/rfc822" })),
                            download: subject.slice(0,40).replace(/[^a-z0-9]/gi,"-") + suffix + ".eml"
                          });
                          a.click(); URL.revokeObjectURL(a.href);
                        }} style={{ fontSize:11, padding:"3px 9px", borderRadius:5, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>
                          {label}
                        </button>
                      ))}
                    </div>
                    {/* Spam score */}
                    {(() => {
                      const html = preview.html || "";
                      const subj = preview.subject || "";
                      let score = 0;
                      const flags = [];
                      if (/FREE|URGENT|ACT NOW|CLICK HERE|GUARANTEED|WINNER/i.test(subj)) { score += 25; flags.push("Spammy subject words"); }
                      if (subj.includes("!!!") || subj.split("!").length > 3) { score += 15; flags.push("Too many exclamation marks"); }
                      if ((subj.match(/[A-Z]/g)||[]).length > subj.length * 0.5 && subj.length > 5) { score += 20; flags.push("ALL CAPS in subject"); }
                      if (!html.includes("unsubscribe") && !html.includes("Unsubscribe")) { score += 20; flags.push("No unsubscribe link"); }
                      if ((html.match(/<img/gi)||[]).length > 8) { score += 10; flags.push("Too many images"); }
                      const color = score === 0 ? "#30D158" : score < 30 ? "#FF9F0A" : "#FF453A";
                      const label = score === 0 ? "✓ Clean" : score < 30 ? "⚠ Caution" : "✗ High risk";
                      return (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }} title={flags.length ? flags.join(" · ") : "No spam signals detected"}>
                          <span style={{ fontSize: 10, color: "#888" }}>Spam score</span>
                          <div style={{ width: 60, height: 5, background: "#E5E5E7", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(score, 100)}%`, height: "100%", background: color, borderRadius: 3, transition: "width .3s" }} />
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 600, color }}>{label}</span>
                        </div>
                      );
                    })()}
                    {/* ── APPROVE BUTTON IN TOOLBAR ── */}
                    {preview.campaign_id && (() => {
                      const cam = campaigns.find(c => c.id === preview.campaign_id);
                      const isApproved = cam?.status === "approved" || cam?.status === "sent";
                      return isApproved ? (
                        <div style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 12px", background:`${C.green}15`, border:`1px solid ${C.green}40`, borderRadius:6, fontSize:12, fontWeight:600, color:C.green }}>
                          ✓ Approved
                        </div>
                      ) : (
                        <button onClick={async () => {
                          const { error } = await supabase.from("email_campaigns").update({ status: "approved" }).eq("id", preview.campaign_id);
                          if (!error) {
                            setCampaigns(p => p.map(c => c.id === preview.campaign_id ? { ...c, status: "approved" } : c));
                            fire("✅ Approved! Move to Step 2 when all emails are done.");
                          }
                        }} style={{ padding:"5px 14px", background:C.green, color:"#fff", border:"none", borderRadius:6, fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap" }}>
                          ✓ Approve
                        </button>
                      );
                    })()}
                  </div>

                  {/* Alt subjects */}
                  {subjectAlts.length > 0 && (
                    <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "8px 14px" }}>
                      <div style={{ fontSize: 10, color: "#999", marginBottom: 5 }}>✨ Alternative subject lines — click to use:</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {subjectAlts.map((s, i) => (
                          <div key={i} onClick={() => { setPreview(p => ({ ...p, subject: s })); setSubjectAlts([]); }}
                            style={{ fontSize: 12, padding: "5px 8px", background: "#f5f5f5", borderRadius: 4, cursor: "pointer", color: "#333", border: "1px solid #eee" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#e8f0fe"}
                            onMouseLeave={e => e.currentTarget.style.background = "#f5f5f5"}>
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Email body */}
                  <div style={{ background: previewWidth === "375px" ? "#1a1a2e" : "#ffffff", display: "flex", justifyContent: "center", padding: previewWidth === "375px" ? "24px 20px" : "0", width: "100%" }}>
                    {(previewTab || "html") === "html" ? (
                      <iframe srcDoc={(preview.html || '').replace(/\{\{REGISTRATION_URL\}\}/g, landingUrl || formLink || '#').replace(/\{\{UNSUBSCRIBE_URL\}\}/g, '#')}
                        style={{ width: previewWidth || "100%", maxWidth: previewWidth === "375px" ? "375px" : "100%", border: "none", height: previewWidth === "375px" ? "600px" : "750px", transition: "width .3s ease", display: "block", borderRadius: previewWidth === "375px" ? 14 : 0, boxShadow: previewWidth === "375px" ? "0 0 0 8px #1a1a1f, 0 0 0 10px #2a2a2f" : "none" }}
                        onLoad={e => { try { const d = e.target.contentDocument || e.target.contentWindow?.document; const h = d?.documentElement?.scrollHeight; if (h && h > 100 && h < 3000) e.target.style.height = h + "px"; } catch(_){} }}
                        title="Email Preview" sandbox="allow-same-origin" />
                    ) : previewTab === "edit" ? (
                      <div style={{ width: "100%", background: "#fff", padding: "24px" }}>
                        <div style={{ fontSize: 11, color: "#888", marginBottom: 12, display:"flex", alignItems:"center", gap:8 }}>
                          ✏️ Edit email content below — click Save to update the email
                        </div>
                        {/* Subject */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 4, textTransform:"uppercase", letterSpacing:"0.5px" }}>Subject Line</div>
                          <input value={preview.subject || ""} onChange={e => setPreview(p => ({...p, subject: e.target.value}))}
                            style={{ width:"100%", padding:"8px 12px", border:"1px solid #e0e0e0", borderRadius:6, fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
                        </div>
                        {/* Body text */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 4, textTransform:"uppercase", letterSpacing:"0.5px" }}>Email Body</div>
                          <textarea
                            value={preview.plain_text || preview.html?.replace(/<style[^>]*>[\s\S]*?<\/style>/gi,"").replace(/<[^>]+>/g," ").replace(/\s{3,}/g,"\n\n").trim() || ""}
                            onChange={e => setPreview(p => ({...p, plain_text: e.target.value}))}
                            rows={16}
                            style={{ width:"100%", padding:"10px 12px", border:"1px solid #e0e0e0", borderRadius:6, fontSize:13, fontFamily:"inherit", outline:"none", resize:"vertical", lineHeight:1.7, boxSizing:"border-box" }} />
                        </div>
                        <div style={{ display:"flex", gap:8 }}>
                          <button onClick={async () => {
                            // Rebuild HTML with edited plain text injected into existing template
                            const newHtml = preview.html
                              // Replace body paragraphs — find the white body section and inject edited text
                              .replace(
                                /(<td[^>]*bgcolor="#ffffff"[^>]*>[\s\S]*?<table[^>]*>)([\s\S]*?)(<\/table>\s*<\/td>)/,
                                (match, open, body, close) => {
                                  const paras = (preview.plain_text || "").split(/\n\n+/).filter(p => p.trim());
                                  const newBody = paras.map(p => `<tr><td style="padding:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#333333;">${p.replace(/\n/g,"<br>")}</td></tr>`).join("");
                                  return open + newBody + close;
                                }
                              );
                            setPreview(p => ({...p, html: newHtml || p.html}));
                            setPreviewTab("html");
                            fire("✅ Email updated! Switch to HTML tab to see changes.");
                          }} style={{ padding:"8px 18px", background:C.blue, border:"none", borderRadius:7, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                            Save & Preview →
                          </button>
                          <button onClick={() => setPreviewTab("html")} style={{ padding:"8px 14px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:7, color:C.muted, fontSize:13, cursor:"pointer" }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ width: "100%", background: "#fff", padding: "24px", fontFamily: "monospace", fontSize: 13, color: "#333", lineHeight: 1.8, whiteSpace: "pre-wrap", minHeight: 400 }}>
                        {preview.plain_text || preview.html?.replace(/<[^>]+>/g, "").replace(/\s{2,}/g, "\n").trim() || "No plain text available."}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          {preview && <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {/* Row 1: secondary actions */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {preview.campaign_id && (() => {
                const cam = campaigns.find(c => c.id === preview.campaign_id);
                const isApproved = cam?.status === "approved" || cam?.status === "sent";
                return isApproved ? (
                  <div style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px", background:`${C.green}15`, border:`1px solid ${C.green}40`, borderRadius:7, fontSize:13, fontWeight:700, color:C.green }}>
                    ✓ Approved
                  </div>
                ) : (
                  <button onClick={async () => {
                    if (!preview.campaign_id) return;
                    const { error } = await supabase.from("email_campaigns").update({ status: "approved" }).eq("id", preview.campaign_id);
                    if (!error) {
                      setCampaigns(p => p.map(c => c.id === preview.campaign_id ? { ...c, status: "approved" } : c));
                      fire("✅ Email approved! Select the next email above to approve it too.");
                    } else {
                      fire("❌ Approval failed: " + error.message, "err");
                    }
                  }} style={{ padding:"9px 20px", background:C.green, color:"#fff", border:"none", borderRadius:7, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, boxShadow:`0 2px 10px ${C.green}40` }}>
                    ✓ Approve this email
                  </button>
                );
              })()}
              <button onClick={() => {
                const win = window.open("", "_blank");
                win.document.write(preview.html.replace(/{{REGISTRATION_URL}}/g, landingUrl||formLink||"#").replace(/{{UNSUBSCRIBE_URL}}/g, "#"));
                win.document.close();
              }} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
                🌐 Open in browser
              </button>
              <button onClick={() => { navigator.clipboard?.writeText(preview.html); fire("✅ HTML copied"); }}
                style={{ padding:"6px 14px", background:"transparent", color:C.muted, border:`1px solid ${C.border}`, borderRadius:6, fontSize:12, cursor:"pointer" }}>
                📋 Copy HTML
              </button>
              <button onClick={saveAsTemplate} disabled={!preview?.html || savingTemplate}
                style={{ padding:"6px 14px", background:"transparent", color:C.green, border:`1px solid ${C.green}40`, borderRadius:6, fontSize:12, cursor:"pointer" }}>
                {savingTemplate ? "Saving…" : "💾 Save template"}
              </button>
              <button onClick={() => setPreview(null)}
                style={{ padding:"6px 14px", background:C.raised, color:C.muted, border:`1px solid ${C.border}`, borderRadius:6, fontSize:12, cursor:"pointer" }}>
                Clear
              </button>
            </div>
            {/* Row 2: test send */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: C.raised, borderRadius: 7, border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>📧 Send test to:</span>
              <input
                id="test-email-input"
                defaultValue={profile?.email || ""}
                placeholder="your@email.com"
                style={{ flex: 1, fontSize: 11, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "4px 8px", outline: "none" }}
              />
              <button onClick={async () => {
                const testEmail = document.getElementById("test-email-input")?.value?.trim() || profile?.email;
                if (!testEmail?.includes("@")) { fire("Enter a valid email address", "err"); return; }
                const { data: { session } } = await supabase.auth.getSession();
                setSendingTest(true);
                const r = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
                  body: JSON.stringify({ contacts: [{ email: testEmail, first_name: "Test" }], subject: "[TEST] " + preview.subject, htmlContent: preview.html.replace(/{{REGISTRATION_URL}}/g, landingUrl||formLink||"#").replace(/{{UNSUBSCRIBE_URL}}/g, "#"), plainText: preview.plain_text, ...getSender(profile) })
                }).then(r => r.json()).catch(e => ({ error: e.message }));
                setSendingTest(false);
                fire(r.sent > 0 ? `✅ Test sent to ${testEmail}!` : `❌ ${r.error || "Send failed"}`, r.sent > 0 ? "ok" : "err");
              }} style={{ fontSize: 11, padding: "4px 14px", background: C.blue, color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
                {sendingTest ? "Sending…" : "Send Test"}
              </button>
            </div>
            {/* Row 3: Schedule — only show when approved */}
            {(() => {
              const cam = campaigns.find(c => c.id === preview?.campaign_id);
              const isApproved = cam?.status === "approved" || cam?.status === "sent";
              return isApproved ? (
                <button onClick={() => setView("schedule")} style={{ width:"100%", padding:"11px", background:C.blue, color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:`0 4px 16px ${C.blue}40` }}>
                  <Calendar size={14} />Schedule this email →
                </button>
              ) : null;
            })()}
          </div>}        </div>
      </div>

      {/* Template Library slide-in */}
      {showTemplateLib && (
        <div style={{ position:"fixed", inset:0, zIndex:80, display:"flex" }} onClick={() => setShowTemplateLib(false)}>
          <div style={{ flex:1 }} />
          <div style={{ width:360, background:C.card, borderLeft:`1px solid ${C.border}`, height:"100%", display:"flex", flexDirection:"column", animation:"fadeUp .2s ease" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding:"18px 18px 12px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:C.text }}>📂 Template Library</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>Saved email templates for your company</div>
              </div>
              <button onClick={() => setShowTemplateLib(false)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:20 }}>×</button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:14 }}>
              {savedTemplates.length === 0 ? (
                <div style={{ padding:"32px 16px", textAlign:"center", color:C.muted }}>
                  <div style={{ fontSize:32, marginBottom:10 }}>💾</div>
                  <div style={{ fontSize:13, fontWeight:500, color:C.text, marginBottom:6 }}>No templates yet</div>
                  <div style={{ fontSize:12 }}>Generate an email, then click "Save as template" to store it here for reuse.</div>
                </div>
              ) : savedTemplates.map(t => (
                <div key={t.id} style={{ background:C.raised, borderRadius:9, border:`1px solid ${C.border}`, padding:"12px 14px", marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{t.name}</div>
                      <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{(t.email_type||"").replace(/_/g," ")} · {new Date(t.created_at).toLocaleDateString("en-AU",{day:"numeric",month:"short"})}</div>
                    </div>
                    <button onClick={async () => {
                      await supabase.from("email_campaigns").delete().eq("id", t.id);
                      setSavedTemplates(p => p.filter(x => x.id !== t.id));
                      fire("Template deleted");
                    }} style={{ background:"transparent", border:"none", color:C.red, cursor:"pointer", fontSize:16, padding:"0 2px" }}>×</button>
                  </div>
                  {t.subject && <div style={{ fontSize:11, color:C.sec, marginBottom:8, fontStyle:"italic" }}>"{t.subject}"</div>}
                  <button onClick={() => loadTemplate(t)} style={{ width:"100%", padding:"7px", background:C.blue, border:"none", borderRadius:6, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                    Load this template →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SCHEDULE VIEW — with email preview modal ─────────────────

export default EdmView;