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

// MultiEventView
function MultiEventView({ supabase, profile, events, setActiveEvent, setView, fire }) {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | upcoming | past | draft

  useEffect(() => {
    if (!profile || !events.length) { setLoading(false); return; }
    const load = async () => {
      const results = {};
      await Promise.all(events.map(async ev => {
        const [{ data: m }, { data: ecs }, { data: cams }] = await Promise.all([
          supabase.from("event_summary").select("*").eq("event_id", ev.id).maybeSingle(),
          supabase.from("event_contacts").select("status").eq("event_id", ev.id),
          supabase.from("email_campaigns").select("status,total_sent,total_opened").eq("event_id", ev.id),
        ]);
        const counts = (ecs||[]).reduce((a,r) => { a[r.status]=(a[r.status]||0)+1; return a; }, {});
        results[ev.id] = {
          sent: m?.total_sent || 0,
          opened: m?.total_opened || 0,
          confirmed: counts.confirmed || 0,
          attended: counts.attended || 0,
          total: (ecs||[]).length,
          campaigns: (cams||[]).length,
          campaignsSent: (cams||[]).filter(c=>c.status==="sent").length,
        };
      }));
      setStats(results);
      setLoading(false);
    };
    load();
  }, [profile, events.length]);

  const now = new Date();
  const filtered = events.filter(ev => {
    if (filter === "upcoming") return ev.event_date && new Date(ev.event_date) >= now && ev.status !== "archived";
    if (filter === "past") return ev.event_date && new Date(ev.event_date) < now;
    if (filter === "draft") return ev.status === "draft";
    return ev.status !== "archived";
  }).sort((a,b) => {
    if (!a.event_date) return 1;
    if (!b.event_date) return -1;
    return new Date(a.event_date) - new Date(b.event_date);
  });

  const TYPE_ICONS = { conference:"🎤", gala:"🥂", workshop:"🛠", webinar:"🖥", awards:"🏆", networking:"🤝", launch:"🚀", training:"📋", dinner:"🍽", other:"📅" };

  return (
    <div style={{ animation:"fadeUp .2s ease" }}>
      <div style={{ marginBottom:16, display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:C.text, letterSpacing:"-0.6px" }}>All Events</h1>
          <p style={{ color:C.muted, fontSize:13, marginTop:4 }}>{events.filter(e=>e.status!=="archived").length} events · overview across your full portfolio</p>
        </div>
        <div style={{ display:"flex", gap:4, background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:3 }}>
          {[["all","All"],["upcoming","Upcoming"],["past","Past"],["draft","Draft"]].map(([id,lbl]) => (
            <button key={id} onClick={() => setFilter(id)} style={{ padding:"5px 12px", borderRadius:6, border:"none", background:filter===id?C.raised:"transparent", color:filter===id?C.text:C.muted, fontSize:12, fontWeight:filter===id?600:400, cursor:"pointer" }}>{lbl}</button>
          ))}
        </div>
      </div>

      {/* Aggregate totals */}
      {!loading && Object.keys(stats).length > 0 && (() => {
        const totals = Object.values(stats).reduce((a,s) => ({
          sent: a.sent+(s.sent||0), opened: a.opened+(s.opened||0),
          confirmed: a.confirmed+(s.confirmed||0), attended: a.attended+(s.attended||0),
          total: a.total+(s.total||0)
        }), { sent:0, opened:0, confirmed:0, attended:0, total:0 });
        const overallOpenRate = totals.sent>0?Math.round(totals.opened/totals.sent*100):0;
        return (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:20 }}>
            {[
              { label:"Total contacts", val:totals.total, color:C.text, icon:"👥" },
              { label:"Emails sent", val:totals.sent.toLocaleString(), color:C.blue, icon:"📧" },
              { label:"Overall open rate", val:totals.sent>0?`${overallOpenRate}%`:"—", color:overallOpenRate>=25?C.green:overallOpenRate>0?C.amber:C.muted, icon:"👁" },
              { label:"Confirmed", val:totals.confirmed, color:C.green, icon:"✅" },
              { label:"Attended", val:totals.attended, color:C.blue, icon:"🎪" },
            ].map(s => (
              <div key={s.label} style={{ background:C.card, borderRadius:10, border:`1px solid ${C.border}`, padding:"14px 16px", textAlign:"center" }}>
                <div style={{ fontSize:18, marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontSize:22, fontWeight:700, color:s.color, letterSpacing:"-0.5px" }}>{s.val}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:3, textTransform:"uppercase", letterSpacing:"0.4px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        );
      })()}

      {loading && <div style={{ padding:60, textAlign:"center", color:C.muted, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}><Spin />Loading event stats…</div>}

      {!loading && filtered.length === 0 && (
        <div style={{ padding:60, textAlign:"center", color:C.muted }}>
          <div style={{ fontSize:36, marginBottom:12 }}>📅</div>
          <div style={{ fontSize:14, color:C.text, marginBottom:6 }}>No events in this category</div>
          <div style={{ fontSize:12 }}>Create a new event using the button in the header</div>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:14 }}>
          {filtered.map(ev => {
            const s = stats[ev.id] || {};
            const daysUntil = ev.event_date ? Math.ceil((new Date(ev.event_date)-now)/(1000*60*60*24)) : null;
            const isPast = daysUntil !== null && daysUntil < 0;
            const isToday = daysUntil === 0;
            const urgency = !isPast && daysUntil !== null && daysUntil <= 7;
            const openRate = s.sent > 0 ? Math.round((s.opened/s.sent)*100) : 0;
            const confirmRate = s.total > 0 ? Math.round((s.confirmed/s.total)*100) : 0;
            const health = Math.min(100, (s.total>0?20:0) + (s.sent>0?20:0) + (openRate>=25?20:0) + (confirmRate>=50?20:0) + (s.campaignsSent>0?20:0));
            const healthCol = health>=80?C.green:health>=50?C.amber:C.red;

            return (
              <div key={ev.id} onClick={() => { setActiveEvent(ev); setView("dashboard"); fire(`Switched to ${ev.name}`); }}
                style={{ background:C.card, borderRadius:12, border:`1px solid ${urgency?C.red+"40":isToday?C.green+"60":C.border}`, padding:0, cursor:"pointer", transition:"all .15s", overflow:"hidden", position:"relative" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C.blue+"60"}
                onMouseLeave={e=>e.currentTarget.style.borderColor=urgency?C.red+"40":isToday?C.green+"60":C.border}>

                {/* Colour strip */}
                <div style={{ height:3, background:isPast?C.muted:urgency?C.red:isToday?C.green:C.blue }} />

                <div style={{ padding:"14px 16px" }}>
                  {/* Header */}
                  <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:12 }}>
                    <div style={{ fontSize:22, flexShrink:0, marginTop:1 }}>{TYPE_ICONS[ev.event_type]||"📅"}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14.5, fontWeight:700, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:3 }}>{ev.name}</div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap", fontSize:11, color:C.muted }}>
                        {ev.event_date && <span>📅 {new Date(ev.event_date).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})}</span>}
                        {ev.location && <span>📍 {ev.location.slice(0,28)}{ev.location.length>28?"…":""}</span>}
                      </div>
                    </div>
                    {/* Day badge */}
                    <div style={{ flexShrink:0, textAlign:"center", padding:"4px 8px", borderRadius:7, background:isPast?C.raised:urgency?C.red+"15":isToday?C.green+"15":C.blue+"10", border:`1px solid ${isPast?C.border:urgency?C.red+"40":isToday?C.green+"40":C.blue+"30"}` }}>
                      {isToday ? <span style={{ fontSize:11, fontWeight:700, color:C.green }}>TODAY</span>
                        : isPast ? <span style={{ fontSize:10, color:C.muted }}>Past</span>
                        : daysUntil !== null ? <><div style={{ fontSize:16, fontWeight:800, color:urgency?C.red:C.blue, lineHeight:1 }}>{daysUntil}</div><div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", letterSpacing:"0.5px" }}>days</div></>
                        : <span style={{ fontSize:10, color:C.muted }}>TBD</span>}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6, marginBottom:12 }}>
                    {[
                      { label:"Contacts", val:s.total||0, color:C.text },
                      { label:"Confirmed", val:s.confirmed||0, color:C.green },
                      { label:"Emails sent", val:s.sent||0, color:C.blue },
                      { label:"Open rate", val:s.sent>0?openRate+"%":"—", color:openRate>=25?C.green:openRate>0?C.amber:C.muted },
                    ].map(({label,val,color}) => (
                      <div key={label} style={{ background:C.raised, borderRadius:7, padding:"7px 8px", textAlign:"center" }}>
                        <div style={{ fontSize:15, fontWeight:700, color, lineHeight:1.2 }}>{val}</div>
                        <div style={{ fontSize:9.5, color:C.muted, marginTop:2, textTransform:"uppercase", letterSpacing:"0.3px" }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Health bar */}
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ flex:1, height:4, background:C.border, borderRadius:2, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${health}%`, background:`linear-gradient(90deg,${healthCol},${healthCol}aa)`, borderRadius:2, transition:"width .5s" }} />
                    </div>
                    <span style={{ fontSize:10.5, color:healthCol, fontWeight:600, flexShrink:0 }}>{health}% ready</span>
                    <span style={{ fontSize:10, color:C.muted, padding:"1px 6px", borderRadius:3, background:C.raised, flexShrink:0 }}>{s.campaignsSent||0}/{s.campaigns||0} sent</span>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ borderTop:`1px solid ${C.border}`, padding:"8px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:10, padding:"2px 7px", borderRadius:4, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px",
                    background:ev.status==="published"?C.green+"15":ev.status==="archived"?C.raised:C.amber+"15",
                    color:ev.status==="published"?C.green:ev.status==="archived"?C.muted:C.amber }}>
                    {ev.status||"draft"}
                  </span>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <button onClick={async (e) => {
                      e.stopPropagation();
                      const newStatus = ev.status === "archived" ? "draft" : "archived";
                      await supabase.from("events").update({ status: newStatus }).eq("id", ev.id);
                      fire(newStatus === "archived" ? `📦 ${ev.name} archived` : `✅ ${ev.name} restored`);
                      window.location.reload();
                    }} style={{ fontSize:11, color:C.muted, background:"transparent", border:"none", cursor:"pointer", padding:"2px 6px" }}
                      title={ev.status==="archived"?"Restore event":"Archive event"}>
                      {ev.status==="archived" ? "↩ Restore" : "📦 Archive"}
                    </button>
                    <span style={{ fontSize:11, color:C.blue, fontWeight:500 }}>Open →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── PRICING / WAITLIST PAGE ─────────────────────────────────

export default MultiEventView;