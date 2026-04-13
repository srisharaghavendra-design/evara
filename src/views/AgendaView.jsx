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

// AgendaView
function AgendaView({ supabase, profile, activeEvent, fire }) {
  const [sessions, setSessions] = useState([
    { id: 1, title: "Welcome & Registration", duration: 30, type: "logistics" },
    { id: 2, title: "Opening Keynote", duration: 45, type: "keynote" },
    { id: 3, title: "Morning Break", duration: 15, type: "break" },
    { id: 4, title: "Panel Discussion", duration: 60, type: "panel" },
    { id: 5, title: "Networking Lunch", duration: 60, type: "networking" },
  ]);
  const [startTime, setStartTime] = useState("09:00");
  const [generating, setGenerating] = useState(false);
  const [agenda, setAgenda] = useState(null);
  const [nextId, setNextId] = useState(10);

  const SESSION_TYPES = [
    { id: "keynote", label: "Keynote", color: C.blue, emoji: "🎤" },
    { id: "panel", label: "Panel", color: "#8B5CF6", emoji: "💬" },
    { id: "workshop", label: "Workshop", color: C.amber, emoji: "🛠" },
    { id: "networking", label: "Networking", color: C.green, emoji: "🤝" },
    { id: "break", label: "Break", color: C.muted, emoji: "☕" },
    { id: "logistics", label: "Logistics", color: C.teal, emoji: "📋" },
    { id: "dinner", label: "Dinner/Social", color: "#EC4899", emoji: "🍽" },
  ];

  const [dragIdx, setDragIdx] = useState(null);
  const [dragOver, setDragOverIdx] = useState(null);

  const handleDrop = (targetIdx) => {
    if (dragIdx === null || dragIdx === targetIdx) return;
    setSessions(p => {
      const arr = [...p];
      const [moved] = arr.splice(dragIdx, 1);
      arr.splice(targetIdx, 0, moved);
      return arr;
    });
    setDragIdx(null); setDragOverIdx(null);
  };

  const buildAgenda = () => {
    const [h, m] = startTime.split(":").map(Number);
    let current = h * 60 + m;
    return sessions.map(s => {
      const startH = Math.floor(current / 60).toString().padStart(2, "0");
      const startM = (current % 60).toString().padStart(2, "0");
      current += s.duration;
      const endH = Math.floor(current / 60).toString().padStart(2, "0");
      const endM = (current % 60).toString().padStart(2, "0");
      return { ...s, startTime: `${startH}:${startM}`, endTime: `${endH}:${endM}` };
    });
  };

  const optimize = async () => {
    setGenerating(true);
    try {
      const sessionList = sessions.map(s => `${s.title} (${s.duration} min, ${s.type})`).join(", ");
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          messages: [{
            role: "user",
            content: `You are an expert event planner. Optimize this agenda for best flow and attendee experience.

Event: ${activeEvent?.name || "Event"}
Sessions: ${sessionList}
Start time: ${startTime}

Rules: Don't put 2+ intensive sessions back-to-back without a break. End networking/breaks logically. 
Return ONLY JSON array with objects: { "title": string, "duration": number, "type": string, "tip": string }
Keep all sessions, just reorder if needed and add a "tip" explaining any change.`
          }]
        })
      });
      const d = await res.json();
      const text = d.content?.[0]?.text?.replace(/```json|```/g, "").trim();
      const optimized = JSON.parse(text);
      setSessions(optimized.map((s, i) => ({ ...s, id: i + 1 })));
      fire("✅ Agenda optimized by AI!");
    } catch(e) { fire("Optimization failed: " + e.message, "err"); }
    setGenerating(false);
  };

  const timed = buildAgenda();
  const totalMins = sessions.reduce((a, s) => a + s.duration, 0);
  const totalHrs = Math.floor(totalMins / 60);
  const totalMin = totalMins % 60;

  if (!activeEvent) return (
    <div style={{ animation:"fadeUp .2s ease" }}>
      <div style={{ marginBottom:24 }}><h1 style={{ fontSize:24, fontWeight:600, letterSpacing:"-0.6px", color:C.text }}>AI Agenda Builder</h1>
        <p style={{ color:C.muted, fontSize:13, marginTop:4 }}>Build and optimise your event run sheet with AI.</p></div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", paddingTop:60, gap:14, textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:4 }}>🗓</div>
        <div style={{ fontSize:18, fontWeight:600, color:C.text }}>No event selected</div>
        <p style={{ fontSize:13, color:C.muted, maxWidth:340, lineHeight:1.6 }}>Select an event from the sidebar to build its agenda.</p>
      </div>
    </div>
  );

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: C.text, letterSpacing: "-0.6px" }}>AI Agenda Builder</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Build your timed agenda — AI optimizes flow, populates emails and landing page.</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ fontSize: 12, color: C.muted }}>Total: {totalHrs}h {totalMin}m</div>
          <button onClick={optimize} disabled={generating}
            style={{ fontSize: 13, padding: "7px 16px", borderRadius: 7, border: "none", background: generating ? C.raised : C.blue, color: generating ? C.muted : "#fff", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            {generating ? <><Spin size={12} />Optimizing…</> : <><Sparkles size={13} />AI Optimize</>}
          </button>
          <button onClick={() => {
            const agendaData = buildAgenda();
            const lines = [
              `AGENDA — ${activeEvent?.name || "Event"}`,
              `Date: ${activeEvent?.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"}) : "TBC"}`,
              `Venue: ${activeEvent?.location || "TBC"}`,
              "─".repeat(50),
              ...agendaData.map(s => {
                const t = SESSION_TYPES.find(t => t.id === s.type);
                return `${s.startTime} – ${s.endTime}  ${t?.emoji || ""} ${s.title} (${s.duration} min)`;
              }),
              "─".repeat(50),
              `Total duration: ${Math.floor(sessions.reduce((s,x)=>s+x.duration,0)/60)}h ${sessions.reduce((s,x)=>s+x.duration,0)%60}m`
            ].join("\n");
            const blob = new Blob([lines], { type: "text/plain" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `${(activeEvent?.name||"agenda").replace(/\s+/g,"_")}_agenda.txt`;
            a.click();
            fire("⬇ Agenda downloaded");
          }} style={{ fontSize: 12, padding: "7px 12px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
            ⬇ Download
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        {/* Session list */}
        <div>
          <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>Sessions</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: C.muted }}>Start:</span>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                  style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "4px 8px", fontSize: 12, outline: "none" }} />
                <button onClick={() => { setSessions(p => [...p, { id: nextId, title: "New Session", duration: 30, type: "keynote" }]); setNextId(p => p + 1); }}
                  style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, border: "none", background: C.blue, color: "#fff", cursor: "pointer" }}>+ Add</button>
              </div>
            </div>
            {sessions.map((s, i) => {
              const typeInfo = SESSION_TYPES.find(t => t.id === s.type) || SESSION_TYPES[0];
              const isDragging = dragIdx === i;
              const isOver = dragOver === i;
              const maxDur = Math.max(...sessions.map(x => x.duration), 60);
              return (
                <div key={s.id}
                  draggable
                  onDragStart={() => setDragIdx(i)}
                  onDragOver={e => { e.preventDefault(); setDragOverIdx(i); }}
                  onDragLeave={() => setDragOverIdx(null)}
                  onDrop={() => handleDrop(i)}
                  onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                  style={{ padding:"10px 16px", borderBottom: i < sessions.length - 1 ? `1px solid ${C.border}` : undefined, display:"flex", alignItems:"center", gap:10, opacity: isDragging ? 0.4 : 1, background: isOver ? `${C.blue}08` : "transparent", borderLeft: isOver ? `3px solid ${C.blue}` : "3px solid transparent", transition:"all .1s", cursor:"grab" }}>
                  <span style={{ fontSize:14, color:C.muted, cursor:"grab", flexShrink:0 }}>⠿</span>
                  <span style={{ fontSize:16, flexShrink:0 }}>{typeInfo.emoji}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
                      <input value={s.title} onChange={e => setSessions(p => p.map(x => x.id === s.id ? { ...x, title: e.target.value } : x))}
                        style={{ flex:1, background:C.bg, border:`1px solid ${C.border}`, borderRadius:5, color:C.text, padding:"5px 8px", fontSize:12.5, outline:"none" }} />
                      <select value={s.type} onChange={e => setSessions(p => p.map(x => x.id === s.id ? { ...x, type: e.target.value } : x))}
                        style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:5, color:typeInfo.color, padding:"5px 8px", fontSize:11.5, outline:"none", cursor:"pointer", flexShrink:0 }}>
                        {SESSION_TYPES.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>)}
                      </select>
                      <div style={{ display:"flex", alignItems:"center", gap:3, flexShrink:0 }}>
                        <input type="number" value={s.duration} min={5} max={480} onChange={e => setSessions(p => p.map(x => x.id === s.id ? { ...x, duration: parseInt(e.target.value)||30 } : x))}
                          style={{ width:52, background:C.bg, border:`1px solid ${C.border}`, borderRadius:5, color:C.text, padding:"5px 5px", fontSize:12, outline:"none", textAlign:"center" }} />
                        <span style={{ fontSize:10, color:C.muted }}>min</span>
                      </div>
                    </div>
                    {/* Duration bar */}
                    <div style={{ height:3, background:C.raised, borderRadius:2, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${(s.duration/maxDur)*100}%`, background:typeInfo.color, borderRadius:2, opacity:0.7 }} />
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:2, flexShrink:0 }}>
                    <button onClick={() => { if(i===0) return; setSessions(p => { const a=[...p]; [a[i-1],a[i]]=[a[i],a[i-1]]; return a; }); }} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:13, padding:"1px 3px" }}>↑</button>
                    <button onClick={() => { if(i===sessions.length-1) return; setSessions(p => { const a=[...p]; [a[i],a[i+1]]=[a[i+1],a[i]]; return a; }); }} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:13, padding:"1px 3px" }}>↓</button>
                    <button onClick={() => setSessions(p => p.filter(x => x.id !== s.id))} style={{ background:"transparent", border:"none", color:C.red, cursor:"pointer", fontSize:15, padding:"1px 3px" }}>×</button>
                  </div>
                  {s.tip && <div style={{ fontSize:10, color:C.amber, background:C.amber+"10", padding:"2px 6px", borderRadius:3, maxWidth:110, flexShrink:0 }}>💡 {s.tip}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Timed agenda preview */}
        <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 16, height: "fit-content" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14 }}>Timed Schedule</div>
          {timed.map((s, i) => {
            const typeInfo = SESSION_TYPES.find(t => t.id === s.type) || SESSION_TYPES[0];
            return (
              <div key={s.id} style={{ display: "flex", gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: i < timed.length - 1 ? `1px solid ${C.border}` : undefined }}>
                <div style={{ textAlign: "right", minWidth: 40, flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: typeInfo.color }}>{s.startTime}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{s.endTime}</div>
                </div>
                <div style={{ width: 3, background: typeInfo.color, borderRadius: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{s.emoji || typeInfo.emoji} {s.title}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{s.duration} min · {typeInfo.label}</div>
                </div>
              </div>
            );
          })}
          <button onClick={() => { navigator.clipboard?.writeText(timed.map(s => `${s.startTime}–${s.endTime}  ${s.title}`).join("\n")); fire("Agenda copied!"); }}
            style={{ width: "100%", marginTop: 8, padding: "8px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, cursor: "pointer" }}>
            Copy agenda text
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CONTACT LIFECYCLE VIEW ───────────────────────────────────

export default AgendaView;