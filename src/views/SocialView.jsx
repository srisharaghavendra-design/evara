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

// SocialView
function SocialView({ supabase, profile, activeEvent, fire }) {
  const [generating, setGenerating] = useState(false);
  const [posts, setPosts] = useState(null);
  const [phase, setPhase] = useState("pre"); // pre | during | post
  const [copied, setCopied] = useState(null);
  const [eventDetails, setEventDetails] = useState({ topic: "", speakers: "", highlights: "", attendance: "" });

  const PHASES = [
    { id: "pre", label: "Pre-Event", emoji: "📣", desc: "Announce & build hype" },
    { id: "during", label: "Day Of", emoji: "🎉", desc: "Live updates & stories" },
    { id: "post", label: "Post-Event", emoji: "📊", desc: "Wrap-up & follow-up" },
  ];

  const PLATFORMS = [
    { id: "linkedin", label: "LinkedIn", color: "#0077B5", emoji: "💼" },
    { id: "twitter", label: "Twitter / X", color: "#1DA1F2", emoji: "🐦" },
    { id: "instagram", label: "Instagram", color: "#E1306C", emoji: "📸" },
  ];

  const generate = async () => {
    if (!activeEvent) { fire("No active event", "err"); return; }
    setGenerating(true); setPosts(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const prompt = `You are a B2B event marketing expert. Generate social media posts for this event.

Event: ${activeEvent.name}
Date: ${activeEvent.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "TBC"}
Location: ${activeEvent.location || "TBC"}
Phase: ${phase} (${phase === "pre" ? "before the event" : phase === "during" ? "day of the event" : "after the event"})
${eventDetails.topic ? `Topic/theme: ${eventDetails.topic}` : ""}
${eventDetails.speakers ? `Speakers: ${eventDetails.speakers}` : ""}
${eventDetails.highlights ? `Key highlights: ${eventDetails.highlights}` : ""}
${eventDetails.attendance ? `Attendance: ${eventDetails.attendance}` : ""}

Return ONLY valid JSON with this structure:
{
  "linkedin": { "post": "150-200 word professional post with paragraph breaks", "hashtags": ["tag1","tag2","tag3"] },
  "twitter": { "post": "Under 280 chars, punchy and engaging", "hashtags": ["tag1","tag2"] },
  "instagram": { "caption": "Engaging caption with emojis", "hashtags": ["tag1","tag2","tag3","tag4","tag5"], "story_ideas": ["idea1","idea2","idea3"] },
  "facebook": { "post": "Conversational 100-150 word post, good for sharing event details", "hashtags": ["tag1","tag2"] },
  "email": { "subject": "Compelling email subject line", "preview_text": "Email preview text under 90 chars", "blurb": "2-3 sentence newsletter blurb about the event" }
}`

      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setPosts(JSON.parse(clean));
      fire("Social posts generated!");
    } catch (err) { fire("Generation failed: " + err.message, "err"); }
    setGenerating(false);
  };

  const copy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
    fire("Copied to clipboard!");
  };

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: C.text, letterSpacing: "-0.6px" }}>AI Social Suite</h1>
        <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Generate LinkedIn, Twitter & Instagram posts from your event — one click, all platforms.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <Sec label="Event phase">
            {PHASES.map(p => (
              <button key={p.id} onClick={() => setPhase(p.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 6, borderRadius: 7, border: `1px solid ${phase === p.id ? C.blue + "80" : C.border}`, background: phase === p.id ? C.blue + "10" : "transparent", cursor: "pointer", textAlign: "left", width: "100%" }}>
                <span style={{ fontSize: 18 }}>{p.emoji}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: phase === p.id ? C.blue : C.text }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{p.desc}</div>
                </div>
              </button>
            ))}
          </Sec>
          <Sec label="Extra context (optional)">
            {[{ k: "topic", ph: "e.g. AI in Banking, ESG trends" },
              { k: "speakers", ph: "e.g. John Smith (CEO, Acme)" },
              { k: "highlights", ph: "e.g. 200 attendees, 5 panels" },
              { k: "attendance", ph: "e.g. 150 executives" }
            ].map(f => (
              <div key={f.k} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 3, textTransform: "capitalize" }}>{f.k}</div>
                <input value={eventDetails[f.k]} onChange={e => setEventDetails(p => ({ ...p, [f.k]: e.target.value }))}
                  placeholder={f.ph} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "6px 8px", fontSize: 12, outline: "none" }} />
              </div>
            ))}
          </Sec>
          <button onClick={generate} disabled={generating}
            style={{ padding: 11, borderRadius: 8, border: "none", background: generating ? C.raised : C.blue, color: generating ? C.muted : "#fff", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", boxShadow: generating ? "none" : `0 4px 20px ${C.blue}35` }}>
            {generating ? <><Spin />Generating…</> : <><Sparkles size={14} />Generate Posts</>}
          </button>
        </div>

        <div>
          {!posts && !generating && (
            <div style={{ height: "100%", minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: C.muted, border: `1px dashed ${C.border}`, borderRadius: 10 }}>
              <Radio size={36} strokeWidth={1} />
              <div style={{ fontSize: 14 }}>Select a phase and click Generate</div>
            </div>
          )}
          {generating && (
            <div style={{ height: "100%", minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: C.muted, border: `1px dashed ${C.border}`, borderRadius: 10 }}>
              <Spin size={28} /><div>Claude is writing your posts…</div>
            </div>
          )}
          {posts && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                { id:"linkedin", label:"LinkedIn", color:"#0077B5", emoji:"💼" },
                { id:"twitter", label:"Twitter / X", color:"#000", emoji:"🐦" },
                { id:"instagram", label:"Instagram", color:"#E1306C", emoji:"📸" },
                { id:"facebook", label:"Facebook", color:"#1877F2", emoji:"📘" },
              ].map(plat => {
                const d = posts[plat.id] || {};
                const text = d.post || d.caption || "";
                const tags = (d.hashtags||[]).map(t=>`#${t.replace(/^#/,"")}`).join(" ");
                const full = `${text}\n\n${tags}`;
                const charLimit = plat.id==="twitter"?280:plat.id==="instagram"?2200:plat.id==="linkedin"?3000:null;
                const fullLength = full.length;
                const overLimit = charLimit && fullLength > charLimit;
                const shareUrl = plat.id==="linkedin"
                  ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`
                  : plat.id==="twitter"
                  ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(text.slice(0,240))}&hashtags=${encodeURIComponent((d.hashtags||[]).join(","))}`
                  : null;
                return (
                  <div key={plat.id} style={{ background:C.card, borderRadius:10, border:`1px solid ${C.border}`, overflow:"hidden" }}>
                    <div style={{ padding:"11px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:`${plat.color}0a` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:16 }}>{plat.emoji}</span>
                        <span style={{ fontSize:13.5, fontWeight:700, color:C.text }}>{plat.label}</span>
                        {charLimit && <span style={{ fontSize:10.5, color:overLimit?C.red:fullLength>charLimit*0.9?C.amber:C.muted, fontWeight:overLimit?700:400 }}>{fullLength}/{charLimit}</span>}
                      </div>
                      <div style={{ display:"flex", gap:6 }}>
                        {shareUrl && <a href={shareUrl} target="_blank" rel="noopener" style={{ fontSize:11.5, padding:"4px 12px", borderRadius:5, background:`${plat.color}15`, color:plat.color, border:`1px solid ${plat.color}30`, fontWeight:600 }}>Share ↗</a>}
                        <button onClick={() => { navigator.clipboard?.writeText(full); setCopied(plat.id); setTimeout(()=>setCopied(null),2000); fire("Copied!"); }}
                          style={{ fontSize:11.5, padding:"4px 12px", borderRadius:5, border:`1px solid ${C.border}`, background:copied===plat.id?`${C.green}15`:"transparent", color:copied===plat.id?C.green:C.muted, cursor:"pointer", fontWeight:500 }}>
                          {copied===plat.id?"✅ Copied":"Copy"}
                        </button>
                      </div>
                    </div>
                    <div style={{ padding:"14px 16px" }}>
                      <p style={{ fontSize:13, color:C.sec, lineHeight:1.75, marginBottom:10, whiteSpace:"pre-wrap" }}>{text}</p>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom: plat.id==="instagram"&&d.story_ideas?.length?10:0 }}>
                        {(d.hashtags||[]).map(t => (
                          <span key={t} style={{ fontSize:11, color:plat.color, background:`${plat.color}12`, padding:"2px 8px", borderRadius:4 }}>#{t.replace(/^#/,"")}</span>
                        ))}
                      </div>
                      {plat.id==="instagram" && d.story_ideas?.length > 0 && (
                        <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}` }}>
                          <div style={{ fontSize:10.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8 }}>📱 Story Ideas</div>
                          {d.story_ideas.map((s,i) => (
                            <div key={i} style={{ fontSize:12, color:C.sec, padding:"5px 0", borderBottom:i<d.story_ideas.length-1?`1px solid ${C.border}`:undefined }}>→ {s}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Email blurb */}
              {posts.email && (
                <div style={{ background:C.card, borderRadius:10, border:`1px solid ${C.border}`, overflow:"hidden" }}>
                  <div style={{ padding:"11px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:`${C.blue}0a` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:16 }}>✉️</span>
                      <span style={{ fontSize:13.5, fontWeight:700, color:C.text }}>Email / Newsletter</span>
                    </div>
                    <button onClick={() => { navigator.clipboard?.writeText(`Subject: ${posts.email.subject}\n\n${posts.email.blurb}`); fire("Email blurb copied!"); }}
                      style={{ fontSize:11.5, padding:"4px 12px", borderRadius:5, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>Copy</button>
                  </div>
                  <div style={{ padding:"14px 16px" }}>
                    <div style={{ marginBottom:8 }}>
                      <div style={{ fontSize:10.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:4 }}>Subject line</div>
                      <div style={{ fontSize:13.5, fontWeight:600, color:C.text }}>{posts.email.subject}</div>
                    </div>
                    {posts.email.preview_text && (
                      <div style={{ marginBottom:10 }}>
                        <div style={{ fontSize:10.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:4 }}>Preview text</div>
                        <div style={{ fontSize:12.5, color:C.sec }}>{posts.email.preview_text}</div>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize:10.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:4 }}>Newsletter blurb</div>
                      <p style={{ fontSize:13, color:C.sec, lineHeight:1.7 }}>{posts.email.blurb}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ANALYTICS VIEW ───────────────────────────────────────────

export default SocialView;