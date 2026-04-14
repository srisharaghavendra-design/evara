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

import { Spin, Alert, Inp, ViewHint, ScoreBadge, ImageUploadZone } from "../components/Shared";

// PublicLandingPage
function PublicLandingPage({ slug }) {
  const [page, setPage] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days:0, hours:0, mins:0, secs:0 });
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  useEffect(() => {
    supabase.from("landing_pages").select("*, events(*)").eq("slug", slug).maybeSingle()
      .then(({ data }) => { if (data) { setPage(data); setEvent(data.events); } setLoading(false); });
  }, [slug]);

  useEffect(() => {
    if (!event?.event_date) return;
    const tick = () => {
      const diff = new Date(event.event_date) - new Date();
      if (diff <= 0) return;
      const days = Math.floor(diff/(1000*60*60*24));
      const hours = Math.floor((diff%(1000*60*60*24))/(1000*60*60));
      const mins = Math.floor((diff%(1000*60*60))/(1000*60));
      const secs = Math.floor((diff%(1000*60))/1000);
      setCountdown({ days, hours, mins, secs });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [event?.event_date]);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#080809", fontFamily:"Outfit,sans-serif" }}>
      <div style={{ textAlign:"center", color:"rgba(255,255,255,0.4)", fontSize:14 }}>Loading…</div>
    </div>
  );

  if (!page) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Outfit,sans-serif", background:"#080809" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:14 }}>🔍</div>
        <h1 style={{ fontSize:22, color:"#fff", marginBottom:8 }}>Page not found</h1>
        <p style={{ color:"rgba(255,255,255,0.4)" }}>This event page doesn't exist or has been removed.</p>
      </div>
    </div>
  );

  const tmpl = page.template || "corporate";
  const accent = page.brand_color || "#0A84FF";
  const isLight = tmpl === "minimal" || tmpl === "light" || tmpl === "editorial" || tmpl === "warm";
  const bg = tmpl==="minimal"?"#FFFFFF":tmpl==="light"||tmpl==="warm"?"#FAF9F7":tmpl==="editorial"?"#F5F0E8":tmpl==="neon"?"#050505":tmpl==="bold"?"#0A0A1A":"#0D0D0F";
  const textCol = isLight ? "#111111" : "#F5F5F7";
  const subCol = isLight ? "#555" : "rgba(255,255,255,0.6)";
  const borderCol = isLight ? "#E5E5E7" : "rgba(255,255,255,0.1)";
  const accentActual = tmpl==="neon"?"#39FF14":tmpl==="editorial"?"#000":tmpl==="minimal"?"#111":accent;
  const regUrl = page.reg_url || "#register";
  const eventDate = event?.event_date ? new Date(event.event_date) : null;
  const eventDateStr = eventDate ? eventDate.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"}) : "";
  const isFuture = eventDate && eventDate > new Date();
  const blocks = page.blocks || {};

  return (
    <div style={{ minHeight:"100vh", background:bg, fontFamily:"Outfit,sans-serif", color:textCol }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none}`}</style>

      {/* Top accent */}
      {tmpl==="editorial" && <div style={{ height:5, background:"#000" }} />}
      {tmpl==="neon" && <div style={{ height:2, background:`linear-gradient(90deg,transparent,#39FF14,transparent)` }} />}

      {/* Nav */}
      <nav style={{ padding:"14px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${borderCol}`, position:"sticky", top:0, background: isLight?"rgba(255,255,255,0.95)":"rgba(0,0,0,0.85)", backdropFilter:"blur(12px)", zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {page.logo_url ? <img src={page.logo_url} alt="logo" style={{ height:28, objectFit:"contain" }} /> : <span style={{ fontSize:15, fontWeight:700, color:textCol }}>{page.organiser || event?.name || "evara"}</span>}
        </div>
        <a href={regUrl} style={{ padding:"8px 20px", background:accentActual, color: tmpl==="neon"?"#000":"#fff", borderRadius:8, fontSize:13, fontWeight:700 }}>
          {page.cta_text || "Register Now"}
        </a>
      </nav>

      {/* Hero */}
      {(blocks.hero !== false) && (
        <div style={{ padding:"72px 24px 56px", textAlign:"center", position:"relative", overflow:"hidden" }}>
          {(tmpl==="bold"||tmpl==="neon") && <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 0%, ${accentActual}20 0%, transparent 65%)`, pointerEvents:"none" }} />}
          {eventDateStr && <div style={{ fontSize:11, fontWeight:700, color:accentActual, textTransform:"uppercase", letterSpacing:"2.5px", marginBottom:14 }}>{eventDateStr}{event?.location ? ` · ${event.location}` : ""}</div>}
          <h1 style={{ fontSize:"clamp(30px,5vw,62px)", fontWeight:800, letterSpacing:"-1.5px", lineHeight:1.05, marginBottom:14, color:textCol, maxWidth:820, margin:"0 auto 14px" }}>
            {page.headline || event?.name || "Event"}
          </h1>
          {page.subheadline && <p style={{ fontSize:"clamp(15px,2vw,19px)", color:subCol, maxWidth:560, margin:"0 auto 14px", lineHeight:1.65 }}>{page.subheadline}</p>}
          {page.tagline && <p style={{ fontSize:14, color: isLight?"#888":"rgba(255,255,255,0.4)", marginBottom:28, fontStyle: tmpl==="editorial"?"italic":"normal" }}>{page.tagline}</p>}
          <a href={regUrl} style={{ display:"inline-block", padding:"14px 36px", background:accentActual, color: tmpl==="neon"?"#000":"#fff", borderRadius:9, fontSize:16, fontWeight:700, boxShadow:`0 8px 28px ${accentActual}40`, marginTop:8 }}>
            {page.cta_text || "Register Now"} →
          </a>
        </div>
      )}

      {/* Countdown */}
      {(blocks.countdown !== false) && isFuture && (
        <div style={{ padding:"20px 24px", borderTop:`1px solid ${borderCol}`, borderBottom:`1px solid ${borderCol}`, display:"flex", justifyContent:"center", gap:"clamp(20px,4vw,48px)", background: isLight?"rgba(0,0,0,0.03)":"rgba(255,255,255,0.04)" }}>
          {[["Days",countdown.days],["Hours",countdown.hours],["Mins",countdown.mins],["Secs",countdown.secs]].map(([lbl,val]) => (
            <div key={lbl} style={{ textAlign:"center" }}>
              <div style={{ fontSize:"clamp(28px,5vw,48px)", fontWeight:800, color:accentActual, lineHeight:1, fontVariantNumeric:"tabular-nums" }}>{String(val).padStart(2,"0")}</div>
              <div style={{ fontSize:10, color:subCol, textTransform:"uppercase", letterSpacing:"1.5px", marginTop:4 }}>{lbl}</div>
            </div>
          ))}
        </div>
      )}

      {/* Event details grid */}
      {(blocks.details !== false) && eventDateStr && (
        <div style={{ maxWidth:800, margin:"0 auto", padding:"40px 24px", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14 }}>
          {[
            eventDateStr && {icon:"📅",label:"Date",val:eventDateStr},
            event?.event_time && {icon:"🕐",label:"Time",val:event.event_time},
            (page.location_text||event?.location) && {icon:"📍",label:"Location",val:page.location_text||event.location},
            event?.capacity && {icon:"👥",label:"Capacity",val:`${event.capacity} guests`},
          ].filter(Boolean).map(({icon,label,val}) => (
            <div key={label} style={{ background: isLight?"rgba(0,0,0,0.04)":"rgba(255,255,255,0.05)", border:`1px solid ${borderCol}`, borderRadius:12, padding:"16px 18px" }}>
              <div style={{ fontSize:20, marginBottom:8 }}>{icon}</div>
              <div style={{ fontSize:10, color:subCol, textTransform:"uppercase", letterSpacing:"1px", marginBottom:4 }}>{label}</div>
              <div style={{ fontSize:14, fontWeight:600, color:textCol, lineHeight:1.3 }}>{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* About */}
      {(blocks.about !== false || blocks.details !== false) && (page.about_text||event?.description) && (
        <div style={{ maxWidth:680, margin:"0 auto", padding:"24px 24px 48px", textAlign:"center" }}>
          <h2 style={{ fontSize:26, fontWeight:700, color:textCol, marginBottom:14, letterSpacing:"-0.5px" }}>About this event</h2>
          <p style={{ fontSize:16, lineHeight:1.8, color:subCol }}>{page.about_text||event?.description}</p>
        </div>
      )}

      {/* RSVP CTA */}
      {blocks.rsvp !== false && (
        <div style={{ textAlign:"center", padding:"40px 24px 64px", borderTop:`1px solid ${borderCol}` }}>
          {regUrl.includes("/form/") ? (
            <div style={{ maxWidth:640, margin:"0 auto" }}>
              <h2 style={{ fontSize:22, fontWeight:700, color:textCol, marginBottom:8 }}>Reserve your spot</h2>
              <p style={{ fontSize:14, color:subCol, marginBottom:24 }}>Fill in your details below to register for this event.</p>
              {regUrl && <iframe src={regUrl} style={{ width:"100%", minHeight:500, border:"none", borderRadius:14, background:"#fff", boxShadow:"0 4px 24px rgba(0,0,0,0.15)" }} title="Registration Form" />}
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize:22, fontWeight:700, color:textCol, marginBottom:8 }}>Ready to attend?</h2>
              <p style={{ fontSize:14, color:subCol, marginBottom:24 }}>Secure your spot before registrations close.</p>
              <a href={regUrl} style={{ display:"inline-block", padding:"14px 40px", background:accentActual, color: tmpl==="neon"?"#000":"#fff", borderRadius:9, fontSize:16, fontWeight:700, boxShadow:`0 6px 24px ${accentActual}40` }}>
                {page.cta_text || "Register Now"} →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop:`1px solid ${borderCol}`, padding:"18px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", gap:14 }}>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`} target="_blank" rel="noopener" style={{ fontSize:12, color:subCol, padding:"5px 12px", borderRadius:20, border:`1px solid ${borderCol}` }}>📤 Share on LinkedIn</a>
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent((page.headline||event?.name||"")+' — register now!')}`} target="_blank" rel="noopener" style={{ fontSize:12, color:subCol, padding:"5px 12px", borderRadius:20, border:`1px solid ${borderCol}` }}>🐦 Share on X</a>
        </div>
        <span style={{ fontSize:11, color: isLight?"#bbb":"rgba(255,255,255,0.25)" }}>Powered by evara · evarahq.com</span>
      </div>
    </div>
  );
}

// ─── MULTI-EVENT OVERVIEW ────────────────────────────────────

export default PublicLandingPage;