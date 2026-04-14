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
import {Spin, Alert, Inp, ViewHint, ScoreBadge, ImageUploadZone, C} from "../components/Shared";

// Sec + CheckInView
function Sec({ label, children }) {
  return (
    <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 14 }}>
      <div style={{ fontSize: 10.5, fontWeight: 500, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 11 }}>{label}</div>
      {children}
    </div>
  );
}

// ─── CHECK-IN VIEW ────────────────────────────────────────────
function CheckInView({ supabase, profile, activeEvent, fire }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("host"); // "host" | "kiosk"
  const [checkingIn, setCheckingIn] = useState(null);
  const [stats, setStats] = useState({ total: 0, attended: 0, walkin: 0 });
  const [hourlyData, setHourlyData] = useState([]);
  const [clock, setClock] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(t); }, []);
  const [walkinName, setWalkinName] = useState("");
  const [walkinEmail, setWalkinEmail] = useState("");
  const [walkinCompany, setWalkinCompany] = useState("");
  const [showWalkin, setShowWalkin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selCheckin, setSelCheckin] = useState(new Set());
  const [showQR, setShowQR] = useState(false);

  const bulkMarkAttended = async () => {
    if (!selCheckin.size) return;
    setBulkMarking(true);
    const ids = [...selCheckin];
    await supabase.from("event_contacts")
      .update({ status: "attended", attended_at: new Date().toISOString() })
      .in("id", ids);
    setContacts(p => p.map(c => ids.includes(c.id) ? { ...c, status: "attended", attended_at: new Date().toISOString() } : c));
    setStats(p => ({ ...p, attended: p.attended + ids.length }));
    setSelCheckin(new Set());
    fire(`✅ ${ids.length} guest${ids.length !== 1 ? "s" : ""} marked as attended`);
    setBulkMarking(false);
  };

  useEffect(() => {
    if (!activeEvent || !profile) return;
    load();
  }, [activeEvent, profile]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("event_contacts")
      .select("*,contacts(*)")
      .eq("event_id", activeEvent.id)
      .order("created_at", { ascending: false });
    const rows = data || [];
    setContacts(rows);
    setStats({
      total: rows.length,
      attended: rows.filter(r => r.status === "attended").length,
      walkin: rows.filter(r => r.contacts?.source === "walkin").length,
    });
    // Hourly breakdown
    const hourMap = {};
    rows.filter(r => r.attended_at).forEach(r => {
      const h = new Date(r.attended_at).getHours();
      hourMap[h] = (hourMap[h] || 0) + 1;
    });
    const hrs = Object.keys(hourMap).map(Number).sort((a,b)=>a-b);
    setHourlyData(hrs.map(h => ({ hour: h, count: hourMap[h] })));
    setLoading(false);
  };

  const checkIn = async (ec) => {
    setCheckingIn(ec.id);
    await supabase.from("event_contacts")
      .update({ status: "attended", attended_at: new Date().toISOString() })
      .eq("id", ec.id);
    await supabase.from("contact_activity").insert({
      contact_id: ec.contact_id, event_id: activeEvent.id,
      company_id: profile.company_id, activity_type: "checked_in",
      description: "Checked in via evara Check-in"
    });
    fire(`✅ ${ec.contacts?.first_name || ec.contacts?.email} checked in!`);
    setContacts(p => p.map(c => c.id === ec.id ? { ...c, status: "attended" } : c));
    setStats(p => ({ ...p, attended: p.attended + 1 }));
    setCheckingIn(null);
  };

  const addWalkin = async () => {
    if (!walkinEmail.trim()) { fire("Email required", "err"); return; }
    setSaving(true);
    const { data: c } = await supabase.from("contacts").upsert({
      email: walkinEmail.trim().toLowerCase(),
      first_name: walkinName.split(" ")[0] || "",
      last_name: walkinName.split(" ").slice(1).join(" ") || "",
      company_name: walkinCompany,
      company_id: profile.company_id,
      source: "walkin"
    }, { onConflict: "company_id,email" }).select().single();
    if (c) {
      const { data: ec } = await supabase.from("event_contacts").upsert({
        contact_id: c.id, event_id: activeEvent.id,
        company_id: profile.company_id, status: "attended",
        attended_at: new Date().toISOString()
      }, { onConflict: "event_id,contact_id" }).select("*,contacts(*)").single();
      if (ec) {
        setContacts(p => [ec, ...p]);
        setStats(p => ({ ...p, total: p.total + 1, attended: p.attended + 1, walkin: p.walkin + 1 }));
        fire(`✅ Walk-in registered: ${walkinName || walkinEmail}`);
        setWalkinName(""); setWalkinEmail(""); setWalkinCompany(""); setShowWalkin(false);
      }
    }
    setSaving(false);
  };

  const filtered = contacts.filter(c => !search ||
    (c.contacts?.first_name + " " + c.contacts?.last_name + " " + c.contacts?.email + " " + c.contacts?.company_name)
      .toLowerCase().includes(search.toLowerCase()));

  const attendancePct = stats.total > 0 ? Math.round((stats.attended/stats.total)*100) : 0;
  const lastIn = contacts.filter(c => c.attended_at).sort((a,b) => new Date(b.attended_at)-new Date(a.attended_at))[0];

  const STAT_CARDS = [
    { label:"Expected", val:stats.total, color:C.muted },
    { label:"Checked In", val:stats.attended, color:C.green, sub:`${attendancePct}% of expected` },
    { label:"Pending", val:stats.total - stats.attended, color:C.amber },
    { label:"Walk-ins", val:stats.walkin, color:C.blue },
    { label:"Last in", val: lastIn?.attended_at ? new Date(lastIn.attended_at).toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit"}) : "—", color:C.muted },
  ];

  if (!activeEvent) return (
    <div style={{ animation:"fadeUp .2s ease" }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:600, letterSpacing:"-0.6px", color:C.text }}>Check-in</h1>
        <p style={{ color:C.muted, fontSize:13, marginTop:4 }}>Live event day check-in and attendance tracking.</p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", paddingTop:50, gap:14, textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:4 }}>🎪</div>
        <div style={{ fontSize:18, fontWeight:600, color:C.text }}>No event selected</div>
        <p style={{ fontSize:13, color:C.muted, maxWidth:340, lineHeight:1.6 }}>Select an event from the sidebar to start checking in attendees on the day.</p>
      </div>
    </div>
  );

  if (!activeEvent) return (
    <div style={{ animation:"fadeUp .2s ease" }}>
      <div style={{ marginBottom:24 }}><h1 style={{ fontSize:24, fontWeight:600, letterSpacing:"-0.6px", color:C.text }}>Event Check-in</h1>
        <p style={{ color:C.muted, fontSize:13, marginTop:4 }}>QR scan, walk-in capture, live attendance tracking.</p></div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", paddingTop:60, gap:14, textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:4 }}>📱</div>
        <div style={{ fontSize:18, fontWeight:600, color:C.text }}>No event selected</div>
        <p style={{ fontSize:13, color:C.muted, maxWidth:340, lineHeight:1.6 }}>Select an event from the sidebar to open the check-in station.</p>
      </div>
    </div>
  );

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: C.text, letterSpacing: "-0.6px" }}>Event Check-in</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>{activeEvent.name} — live check-in dashboard · <span style={{ color: C.text, fontFamily: "monospace" }}>{clock.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span></p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {["host", "kiosk"].map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ fontSize: 13, padding: "7px 16px", borderRadius: 7, border: `1px solid ${mode === m ? C.blue + "80" : C.border}`, background: mode === m ? C.blue + "14" : "transparent", color: mode === m ? C.blue : C.muted, cursor: "pointer", textTransform: "capitalize" }}>
              {m === "host" ? "👤 Host Mode" : "🖥 Kiosk Mode"}
            </button>
          ))}
          <button onClick={() => {
            const url = `${window.location.origin}/checkin/${activeEvent?.id}`;
            navigator.clipboard?.writeText(url);
            fire("Check-in kiosk URL copied! Open on a tablet at the door.");
          }} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
            📋 Copy Kiosk URL
          </button>
          <button onClick={() => setShowQR(true)} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.blue}40`, background: C.blue+"10", color: C.blue, cursor: "pointer", display:"flex", alignItems:"center", gap:5 }}>
            📱 QR Code
          </button>
          <button onClick={() => {
            const attended = contacts.filter(c => c.status === "attended");
            const csv = ["Name,Email,Company,Dietary,Checked In"].concat(
              attended.map(ec => {
                const c = ec.contacts || {};
                return `"${c.first_name||""} ${c.last_name||""}","${c.email||""}","${c.company_name||""}","${ec.dietary||""}","${ec.attended_at ? new Date(ec.attended_at).toLocaleTimeString() : "yes"}"`;
              })
            ).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = `${activeEvent.name}-attended.csv`; a.click();
            fire(`✅ Exported ${attended.length} attendees`);
          }} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
            ⬇ Export attended
          </button>
          <button onClick={() => {
            const all = contacts.filter(c => c.contacts);
            const csv = ["Name,Email,Company,Dietary,Status"].concat(
              all.map(ec => {
                const c = ec.contacts || {};
                return `"${c.first_name||""} ${c.last_name||""}","${c.email||""}","${c.company_name||""}","${ec.dietary||""}","${ec.status||"pending"}"`;
              })
            ).join("\n");
            const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], {type:"text/csv"})); a.download = `${activeEvent.name}-all-guests.csv`; a.click();
            fire(`✅ Exported ${all.length} guests`);
          }} style={{ fontSize: 12, padding: "7px 12px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
            ⬇ All guests
          </button>
          <button onClick={() => setShowWalkin(true)}
            style={{ fontSize: 13, padding: "7px 16px", borderRadius: 7, border: "none", background: C.blue, color: "#fff", cursor: "pointer", fontWeight: 500 }}>
            + Walk-in
          </button>
        </div>
      </div>

      {/* Stats + attendance ring */}
      <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:16, marginBottom:16 }}>
        {/* Attendance ring */}
        <div style={{ background:C.card, borderRadius:12, border:`1px solid ${C.border}`, padding:"20px 24px", display:"flex", alignItems:"center", gap:20, minWidth:260 }}>
          <div style={{ position:"relative", width:80, height:80, flexShrink:0 }}>
            <svg viewBox="0 0 80 80" width="80" height="80">
              <circle cx="40" cy="40" r="32" fill="none" stroke={C.raised} strokeWidth="8" />
              <circle cx="40" cy="40" r="32" fill="none" stroke={C.green} strokeWidth="8"
                strokeDasharray={`${(attendancePct/100)*201.1} 201.1`}
                strokeLinecap="round" transform="rotate(-90 40 40)"
                style={{ transition:"stroke-dasharray .6s ease" }} />
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:20, fontWeight:800, color:C.green, lineHeight:1 }}>{attendancePct}%</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>Attendance Rate</div>
            <div style={{ fontSize:26, fontWeight:800, color:C.green, letterSpacing:"-1px" }}>{stats.attended}<span style={{ fontSize:14, color:C.muted, fontWeight:400 }}>/{stats.total}</span></div>
            <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>
              {stats.total - stats.attended > 0 ? `${stats.total - stats.attended} still pending` : "✓ Everyone in!"}
            </div>
          </div>
        </div>
        {/* Stat cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
          {STAT_CARDS.filter(s => s.label !== "Checked In").map(s => (
            <div key={s.label} style={{ background:C.card, borderRadius:10, padding:"14px", border:`1px solid ${C.border}`, borderTop:`2px solid ${s.color}40` }}>
              <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8 }}>{s.label}</div>
              <div style={{ fontSize:24, fontWeight:700, color:s.color }}>{s.val}</div>
              {s.sub && <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{s.sub}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: C.card, borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.border}`, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, color: C.muted }}>
          <span>Check-in progress</span>
          <span style={{ color: C.green }}>
            {stats.attended}/{stats.total} checked in
            {stats.total > 0 ? ` · ${Math.round(stats.attended/stats.total*100)}%` : ""}
          </span>
        </div>
        <div style={{ height: 8, background: C.raised, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", background: `linear-gradient(90deg, ${C.green}, ${C.teal})`, width: `${stats.total ? (stats.attended / stats.total) * 100 : 0}%`, borderRadius: 4, transition: "width .5s ease" }} />
        </div>
      </div>

      {/* Hourly check-in chart */}
      {hourlyData.length > 1 && (
        <div style={{ background: C.card, borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.border}`, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 10 }}>Check-in by hour</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60 }}>
            {hourlyData.map(({ hour, count }) => {
              const maxCount = Math.max(...hourlyData.map(d => d.count));
              const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={hour} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div style={{ fontSize: 9, color: C.muted }}>{count}</div>
                  <div style={{ width: "100%", background: C.green, borderRadius: "2px 2px 0 0", height: `${Math.max(4, pct * 0.44)}px`, opacity: 0.8 }} />
                  <div style={{ fontSize: 9, color: C.muted, whiteSpace: "nowrap" }}>{hour}:00</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Search + list */}
      <div style={{ background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 12px", flex: 1 }}>
            <Search size={13} color={C.muted} />
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder={mode === "kiosk" ? "Attendee types their name here…" : "Search by name, email, company…"}
              style={{ background: "none", border: "none", outline: "none", color: C.text, fontSize: 13, width: "100%" }} />
          </div>
          <button onClick={load} style={{ padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, cursor: "pointer" }}>Refresh</button>
        </div>
        {/* Bulk action bar */}
        {selCheckin.size > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px", background:`${C.green}10`, borderBottom:`1px solid ${C.green}25` }}>
            <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>{selCheckin.size} selected</span>
            <button onClick={bulkMarkAttended} disabled={bulkMarking} style={{ fontSize:12, padding:"5px 14px", background:C.green, border:"none", borderRadius:6, color:"#fff", cursor:"pointer", fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
              {bulkMarking ? <><Spin />Marking…</> : "✓ Mark all attended"}
            </button>
            <button onClick={() => setSelCheckin(new Set())} style={{ fontSize:12, padding:"5px 10px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:6, color:C.muted, cursor:"pointer", marginLeft:"auto" }}>✕ Clear</button>
          </div>
        )}
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><Spin />Loading guests…</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>
              <th style={{ padding:"9px 10px 9px 14px", width:32 }}>
                <input type="checkbox" onChange={e => setSelCheckin(e.target.checked ? new Set(filtered.filter(ec=>ec.status!=="attended").map(ec=>ec.id)) : new Set())} style={{ cursor:"pointer" }} />
              </th>
              {["Name", "Company", "Email", "Status", "Action"].map(h => (
                <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10.5, color: C.muted, fontWeight: 500, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: C.muted }}>No guests found</td></tr>
              ) : filtered.map((ec, i) => {
                const c = ec.contacts || {};
                const attended = ec.status === "attended";
                return (
                  <tr key={ec.id} className="rh" style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : undefined, background: attended ? `${C.green}06` : selCheckin.has(ec.id)?`${C.blue}05`:"transparent" }}>
                    <td style={{ padding:"12px 10px 12px 14px" }}>
                      {!attended && <input type="checkbox" checked={selCheckin.has(ec.id)} onChange={e => { setSelCheckin(p => { const n=new Set(p); e.target.checked?n.add(ec.id):n.delete(ec.id); return n; }); }} style={{ cursor:"pointer" }} />}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: attended ? `${C.green}20` : `${C.blue}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: attended ? C.green : C.blue }}>
                          {(c.first_name?.[0] || c.email?.[0] || "?").toUpperCase()}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{`${c.first_name || ""} ${c.last_name || ""}`.trim() || "—"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: C.muted }}>{c.company_name || "—"}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: C.muted }}>{c.email}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: attended ? C.green : C.amber }}>
                        {attended ? "✅ Checked in" : "⏳ Pending"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {!attended && (
                        <button onClick={() => checkIn(ec)} disabled={checkingIn === ec.id}
                          style={{ fontSize: 12, padding: "6px 16px", borderRadius: 6, border: "none", background: C.green, color: "#fff", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                          {checkingIn === ec.id ? <Spin size={11} /> : <CheckCircle size={12} />}
                          Check In
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* QR Code Modal */}
      {showQR && activeEvent && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:99 }}
          onClick={() => setShowQR(false)}>
          <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, padding:32, width:360, animation:"fadeUp .2s ease", textAlign:"center" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:16, fontWeight:700, color:C.text }}>Event Check-in QR</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>Point guests to scan at the door</div>
              </div>
              <button onClick={() => setShowQR(false)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:22, lineHeight:1 }}>×</button>
            </div>

            {/* Large QR */}
            <div style={{ background:"#fff", borderRadius:12, padding:16, display:"inline-block", marginBottom:18 }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=0&data=${encodeURIComponent(window.location.origin + "/checkin/" + activeEvent.id)}`}
                alt="Check-in QR Code"
                style={{ width:220, height:220, display:"block" }}
              />
            </div>

            {/* Event name & URL */}
            <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:4 }}>{activeEvent.name}</div>
            <div style={{ fontSize:11, color:C.muted, fontFamily:"monospace", marginBottom:20, wordBreak:"break-all" }}>
              {window.location.origin}/checkin/{activeEvent.id}
            </div>

            {/* Instructions */}
            <div style={{ background:C.raised, borderRadius:8, padding:"10px 14px", marginBottom:18, textAlign:"left" }}>
              <div style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:6 }}>Setup for event day</div>
              {["Print and post at the entrance", "Or open on a tablet — guests tap to self check-in", "All check-ins sync to your dashboard live"].map((tip, i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:7, marginBottom:4 }}>
                  <span style={{ color:C.green, fontSize:12, marginTop:1, flexShrink:0 }}>✓</span>
                  <span style={{ fontSize:12, color:C.sec, lineHeight:1.4 }}>{tip}</span>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => {
                navigator.clipboard?.writeText(`${window.location.origin}/checkin/${activeEvent.id}`);
                fire("📋 Check-in URL copied!");
              }} style={{ flex:1, padding:"9px 0", background:"transparent", border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, fontSize:13, cursor:"pointer" }}>
                📋 Copy URL
              </button>
              <button onClick={() => {
                const url = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=20&data=${encodeURIComponent(window.location.origin + "/checkin/" + activeEvent.id)}`;
                const a = document.createElement("a"); a.href = url; a.download = `${activeEvent.name}-checkin-qr.png`; a.target="_blank"; a.click();
                fire("⬇ QR image downloading…");
              }} style={{ flex:1, padding:"9px 0", background:C.blue, border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                ⬇ Download QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Walk-in Modal */}
      {showWalkin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99 }}>
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28, width: 420, animation: "fadeUp .2s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: C.text }}>Register walk-in</h2>
              <button onClick={() => setShowWalkin(false)} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer" }}><X size={16} /></button>
            </div>
            {[{ label: "Full name", val: walkinName, set: setWalkinName, ph: "Jane Smith" },
              { label: "Email *", val: walkinEmail, set: setWalkinEmail, ph: "jane@company.com" },
              { label: "Company", val: walkinCompany, set: setWalkinCompany, ph: "Acme Corp" }
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11.5, color: C.muted, marginBottom: 5 }}>{f.label}</label>
                <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                  style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, padding: "10px 12px", fontSize: 13, outline: "none" }}
                  onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 9, marginTop: 8 }}>
              <button onClick={() => setShowWalkin(false)} style={{ flex: 1, padding: 11, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={addWalkin} disabled={saving}
                style={{ flex: 2, padding: 11, background: C.blue, border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {saving ? <><Spin />Adding…</> : "Register & Check In →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI SOCIAL SUITE ──────────────────────────────────────────

export default CheckInView;