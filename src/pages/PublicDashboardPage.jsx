import { useState, useEffect, useRef, useCallback } from "react";
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

// PublicDashboardPage
function PublicDashboardPage({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [copied, setCopied] = useState(false);

  const load = async () => {
    try {
      const { data: event } = await supabase
        .from("events")
        .select("*,companies(*)")
        .eq("share_token", token)
        .single();

      if (!event) { setError("Dashboard not found or link has expired."); setLoading(false); return; }

      const [{ data: ecs }, { data: cams }] = await Promise.all([
        supabase.from("event_contacts").select("status").eq("event_id", event.id),
        supabase.from("email_campaigns").select("*").eq("event_id", event.id).eq("status", "sent").order("sent_at", { ascending: false })
      ]);

      const statusCounts = (ecs || []).reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
      const totalSent    = (cams || []).reduce((a, c) => a + (c.total_sent    || 0), 0);
      const totalOpened  = (cams || []).reduce((a, c) => a + (c.total_opened  || 0), 0);
      const totalClicked = (cams || []).reduce((a, c) => a + (c.total_clicked || 0), 0);

      setData({ event, total: (ecs || []).length, confirmed: statusCounts.confirmed || 0, attended: statusCounts.attended || 0, declined: statusCounts.declined || 0, pending: statusCounts.pending || 0, campaigns: cams || [], totalSent, totalOpened, totalClicked });
      setLastRefresh(new Date());
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [token]);
  useEffect(() => { const t = setInterval(load, 30000); return () => clearInterval(t); }, [token]);

  const copyLink = () => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#07070A", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui" }}>
      <div style={{ textAlign:"center", color:"#48484A" }}>
        <div style={{ fontSize:24, marginBottom:10 }}>📊</div>
        <div>Loading dashboard…</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:"100vh", background:"#07070A", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🔒</div>
        <div style={{ color:"#F5F5F7", fontSize:16, fontWeight:600, marginBottom:6 }}>Link not found</div>
        <div style={{ color:"#636366", fontSize:13 }}>{error}</div>
      </div>
    </div>
  );

  const { event, total, confirmed, attended, declined, pending, campaigns, totalSent, totalOpened, totalClicked } = data;
  const openRate  = totalSent    > 0 ? Math.round((totalOpened  / totalSent)    * 100) : 0;
  const clickRate = totalSent    > 0 ? Math.round((totalClicked / totalSent)    * 100) : 0;
  const showRate  = confirmed    > 0 ? Math.round((attended     / confirmed)    * 100) : 0;
  const confRate  = total        > 0 ? Math.round((confirmed    / total)        * 100) : 0;
  const daysToEvent = event.event_date ? Math.ceil((new Date(event.event_date) - new Date()) / (1000*60*60*24)) : null;

  const BG = "#07070A", CARD = "#0F0F12", BORDER = "#1A1A1F", TEXT = "#F5F5F7", MUTED = "#636366", SEC = "#AEAEB2";
  const BLUE = "#0A84FF", GREEN = "#30D158", AMBER = "#FF9F0A", RED = "#FF453A", TEAL = "#5AC8FA";

  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:"'Outfit','Inter',system-ui,sans-serif", color:TEXT }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ── Header ── */}
      <div style={{ background:CARD, borderBottom:`1px solid ${BORDER}`, padding:"13px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10, backdropFilter:"blur(12px)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:24, height:24, borderRadius:6, background:BLUE, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:"#fff", fontSize:13, fontWeight:800, letterSpacing:"-0.5px" }}>e</span>
          </div>
          <span style={{ fontSize:14, fontWeight:700, color:TEXT }}>evara</span>
          <span style={{ fontSize:12, color:MUTED }}>/ Live Dashboard</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:GREEN, animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:11, color:MUTED }}>Auto-refreshes · {lastRefresh.toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit"})}</span>
          </div>
          <button onClick={copyLink} style={{ fontSize:11, padding:"5px 12px", borderRadius:6, border:`1px solid ${copied?GREEN:BORDER}`, background:copied?`${GREEN}15`:"transparent", color:copied?GREEN:MUTED, cursor:"pointer", transition:"all .2s" }}>
            {copied ? "✓ Copied!" : "📋 Copy link"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"32px 24px", animation:"fadeUp .3s ease" }}>

        {/* ── Event Header ── */}
        <div style={{ marginBottom:28, display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:20 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, fontWeight:700, color:BLUE, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:8 }}>
              {event.companies?.name || "Event Dashboard"}
            </div>
            <h1 style={{ fontSize:30, fontWeight:800, letterSpacing:"-0.8px", margin:"0 0 8px", lineHeight:1.1 }}>{event.name}</h1>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              {event.event_type && <span style={{ fontSize:11, padding:"2px 9px", borderRadius:4, background:`${BLUE}18`, color:BLUE, fontWeight:600, textTransform:"capitalize" }}>{event.event_type}</span>}
              {event.event_date && <span style={{ fontSize:13, color:SEC }}>{new Date(event.event_date).toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</span>}
              {event.location && <span style={{ fontSize:13, color:MUTED }}>📍 {event.location}</span>}
            </div>
          </div>
          {daysToEvent !== null && (
            <div style={{ textAlign:"center", background:CARD, border:`1px solid ${daysToEvent<=3?`${RED}50`:daysToEvent<=7?`${AMBER}50`:BORDER}`, borderRadius:12, padding:"14px 22px", flexShrink:0 }}>
              <div style={{ fontSize:36, fontWeight:800, color:daysToEvent<=3?RED:daysToEvent<=7?AMBER:TEXT, lineHeight:1, letterSpacing:"-1px" }}>
                {daysToEvent > 0 ? daysToEvent : daysToEvent===0 ? "🎉" : Math.abs(daysToEvent)}
              </div>
              <div style={{ fontSize:10, color:MUTED, textTransform:"uppercase", letterSpacing:"0.8px", marginTop:5 }}>
                {daysToEvent>0?"days to go":daysToEvent===0?"today!":"days ago"}
              </div>
            </div>
          )}
        </div>

        {/* ── Key Rate Indicators ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:12 }}>
          {[
            { label:"Open Rate",    val:`${openRate}%`,  sub:`${totalOpened.toLocaleString()} of ${totalSent.toLocaleString()} opens`, color:openRate>=30?GREEN:openRate>=20?AMBER:SEC,  good:openRate>=25 },
            { label:"Confirm Rate", val:`${confRate}%`,  sub:`${confirmed} of ${total} confirmed`,   color:confRate>=60?GREEN:confRate>=40?AMBER:SEC,   good:confRate>=50 },
            { label:"Show Rate",    val:`${showRate}%`,  sub:`${attended} of ${confirmed} attended`, color:showRate>=70?GREEN:showRate>=50?AMBER:SEC,   good:showRate>=70 },
          ].map(m => (
            <div key={m.label} style={{ background:CARD, borderRadius:12, padding:"18px 20px", border:`1px solid ${m.good?`${m.color}30`:BORDER}`, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:m.good?m.color:BORDER, borderRadius:"12px 12px 0 0" }} />
              <div style={{ fontSize:10, fontWeight:600, color:MUTED, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8 }}>{m.label}</div>
              <div style={{ fontSize:36, fontWeight:800, color:m.color, letterSpacing:"-1px", lineHeight:1, marginBottom:4 }}>{m.val}</div>
              <div style={{ fontSize:11, color:MUTED }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* ── RSVP Status Grid ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:24 }}>
          {[
            { label:"Registered",  val:total,     color:TEXT,  icon:"👥" },
            { label:"Confirmed",   val:confirmed,  color:GREEN, icon:"✅" },
            { label:"Pending",     val:pending,    color:AMBER, icon:"⏳" },
            { label:"Attended",    val:attended,   color:TEAL,  icon:"🎟" },
          ].map(m => (
            <div key={m.label} style={{ background:CARD, borderRadius:12, padding:"16px 14px", border:`1px solid ${BORDER}`, position:"relative" }}>
              <div style={{ position:"absolute", top:12, right:14, fontSize:18, opacity:0.15 }}>{m.icon}</div>
              <div style={{ fontSize:10, fontWeight:600, color:MUTED, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:8 }}>{m.label}</div>
              <div style={{ fontSize:32, fontWeight:800, color:m.color, letterSpacing:"-0.8px", lineHeight:1 }}>{m.val}</div>
              {total > 0 && m.val > 0 && m.label !== "Registered" && (
                <div style={{ fontSize:10, color:MUTED, marginTop:5 }}>{Math.round(m.val/total*100)}% of total</div>
              )}
            </div>
          ))}
        </div>

        {/* ── Event Funnel ── */}
        <div style={{ background:CARD, borderRadius:12, border:`1px solid ${BORDER}`, padding:"20px 22px", marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:700, color:TEXT, marginBottom:18, display:"flex", alignItems:"center", gap:8 }}>
            📉 Event Funnel
            <span style={{ fontSize:10, fontWeight:400, color:MUTED }}>— drop-off at each stage</span>
          </div>
          {[
            { label:"Emails Sent",  val:totalSent,   color:BLUE  },
            { label:"Opened",       val:totalOpened, color:TEAL  },
            { label:"Registered",   val:total,       color:SEC   },
            { label:"Confirmed",    val:confirmed,   color:AMBER },
            { label:"Attended",     val:attended,    color:GREEN },
          ].map((s, i, arr) => {
            const base = arr[0].val || 1;
            const pct = Math.round((s.val / base) * 100);
            const prevPct = i > 0 ? Math.round((arr[i-1].val / base) * 100) : 100;
            const dropOff = i > 0 ? prevPct - pct : 0;
            return (
              <div key={s.label} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:s.color, flexShrink:0 }} />
                    <span style={{ color:SEC }}>{s.label}</span>
                    {i > 0 && dropOff > 0 && <span style={{ fontSize:10, color:`${RED}90` }}>-{dropOff}%</span>}
                  </div>
                  <span style={{ color:s.color, fontWeight:700 }}>{s.val.toLocaleString()}{i>0&&base>0?` · ${pct}%`:""}</span>
                </div>
                <div style={{ height:7, background:"#1A1A1F", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg, ${s.color}CC, ${s.color})`, borderRadius:4, transition:"width .6s ease" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Email Campaigns ── */}
        {campaigns.length > 0 && (
          <div style={{ background:CARD, borderRadius:12, border:`1px solid ${BORDER}`, overflow:"hidden", marginBottom:16 }}>
            <div style={{ padding:"14px 20px", borderBottom:`1px solid ${BORDER}`, fontSize:13, fontWeight:700, color:TEXT }}>
              📧 Email Campaigns ({campaigns.length})
            </div>
            {campaigns.map((cam, i) => {
              const or = cam.total_sent ? Math.round((cam.total_opened||0)/cam.total_sent*100) : 0;
              const cr = cam.total_sent ? Math.round((cam.total_clicked||0)/cam.total_sent*100) : 0;
              return (
                <div key={cam.id} style={{ padding:"12px 20px", borderBottom:i<campaigns.length-1?`1px solid ${BORDER}`:undefined, display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, color:TEXT, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{cam.subject||cam.name}</div>
                    <div style={{ fontSize:11, color:MUTED, marginTop:2, textTransform:"capitalize" }}>
                      {cam.email_type?.replace(/_/g," ")} · {cam.sent_at?new Date(cam.sent_at).toLocaleDateString("en-AU",{day:"numeric",month:"short"}):"Sent"}
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:12, color:MUTED }}>{(cam.total_sent||0).toLocaleString()} sent</div>
                  </div>
                  <div style={{ display:"flex", gap:10, flexShrink:0 }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:14, fontWeight:700, color:or>=30?GREEN:or>=20?AMBER:SEC }}>{or}%</div>
                      <div style={{ fontSize:9, color:MUTED, textTransform:"uppercase" }}>Open</div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:14, fontWeight:700, color:cr>=5?GREEN:cr>0?AMBER:MUTED }}>{cr}%</div>
                      <div style={{ fontSize:9, color:MUTED, textTransform:"uppercase" }}>Click</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── RSVP breakdown bar ── */}
        {total > 0 && (
          <div style={{ background:CARD, borderRadius:12, border:`1px solid ${BORDER}`, padding:"18px 20px", marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:TEXT, marginBottom:14 }}>👥 RSVP Breakdown</div>
            <div style={{ display:"flex", height:12, borderRadius:6, overflow:"hidden", marginBottom:14, gap:1 }}>
              {[
                { val:attended,          color:GREEN },
                { val:confirmed-attended,color:TEAL  },
                { val:pending,           color:AMBER },
                { val:declined,          color:RED   },
              ].filter(s=>s.val>0).map((s,i) => (
                <div key={i} style={{ flex:s.val, background:s.color, transition:"flex .5s ease" }} />
              ))}
            </div>
            <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
              {[
                { label:"Attended",  val:attended,          pct:Math.round(attended/total*100),          color:GREEN },
                { label:"Confirmed", val:confirmed-attended,pct:Math.round((confirmed-attended)/total*100),color:TEAL  },
                { label:"Pending",   val:pending,           pct:Math.round(pending/total*100),           color:AMBER },
                { label:"Declined",  val:declined,          pct:Math.round(declined/total*100),          color:RED   },
              ].map(s => (
                <div key={s.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:s.color }} />
                  <span style={{ fontSize:12, color:SEC }}>{s.label}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:s.color }}>{s.val}</span>
                  <span style={{ fontSize:10, color:MUTED }}>({s.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ textAlign:"center", marginTop:32, paddingTop:20, borderTop:`1px solid ${BORDER}` }}>
          <div style={{ fontSize:11, color:MUTED, marginBottom:8 }}>This is a read-only live dashboard · no login required</div>
          <div style={{ fontSize:10, color:"#2C2C30" }}>Powered by <a href="https://evara-tau.vercel.app" style={{ color:"#3A3A3F", textDecoration:"none" }}>evara</a></div>
        </div>
      </div>
    </div>
  );
}

// ─── UNSUBSCRIBE PAGE ────────────────────────────────────────
// cache bust Wed Apr 08 16:48 UTC 2026
// Fri Apr 10 06:07:34 UTC 2026


export default PublicDashboardPage;