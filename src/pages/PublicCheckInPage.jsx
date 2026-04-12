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

// PublicCheckInPage
function PublicCheckInPage({ eventId }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [checkedIn, setCheckedIn] = useState(null);
  const [searching, setSearching] = useState(false);
  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState({ total: 0, attended: 0 });
  const [showWalkin, setShowWalkin] = useState(false);
  const [walkinName, setWalkinName] = useState("");
  const [walkinEmail, setWalkinEmail] = useState("");
  const [walkinCompany, setWalkinCompany] = useState("");
  const [savingWalkin, setSavingWalkin] = useState(false);

  useEffect(() => {
    supabase.from("events").select("*").eq("id", eventId).single()
      .then(({ data }) => setEvent(data));
    loadStats();
  }, [eventId]);

  const loadStats = async () => {
    const { data } = await supabase.from("event_contacts").select("status").eq("event_id", eventId);
    setStats({ total: (data||[]).length, attended: (data||[]).filter(r=>r.status==="attended").length });
  };

  const doSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    const { data } = await supabase.from("event_contacts")
      .select("*,contacts(*)")
      .eq("event_id", eventId)
      .or(`contacts.first_name.ilike.%${search}%,contacts.last_name.ilike.%${search}%,contacts.email.ilike.%${search}%`)
      .limit(8);
    setResults(data || []);
    setSearching(false);
  };

  const checkIn = async (ec) => {
    await supabase.from("event_contacts")
      .update({ status: "attended", attended_at: new Date().toISOString() })
      .eq("id", ec.id);
    setCheckedIn(ec.contacts);
    setResults([]); setSearch("");
    setStats(p => ({ ...p, attended: p.attended + 1 }));
  };

  const addWalkin = async () => {
    if (!walkinName.trim()) return;
    setSavingWalkin(true);
    const nameParts = walkinName.trim().split(" ");
    const { data: c } = await supabase.from("contacts").upsert({
      email: walkinEmail.trim().toLowerCase() || `walkin-${Date.now()}@noemail.evara`,
      first_name: nameParts[0]||"", last_name: nameParts.slice(1).join(" ")||"",
      company_name: walkinCompany, company_id: null, source: "walkin"
    }, { onConflict: "email,company_id" }).select().maybeSingle();
    if (c) {
      const { data: ec } = await supabase.from("event_contacts").upsert({
        contact_id: c.id, event_id: eventId, status: "attended",
        attended_at: new Date().toISOString()
      }, { onConflict: "event_id,contact_id" }).select("*,contacts(*)").maybeSingle();
      if (ec) {
        setCheckedIn(ec.contacts);
        setStats(p => ({ ...p, total: p.total+1, attended: p.attended+1 }));
        setWalkinName(""); setWalkinEmail(""); setWalkinCompany(""); setShowWalkin(false);
      }
    }
    setSavingWalkin(false);
  };

  const attendancePct = stats.total > 0 ? Math.round(stats.attended/stats.total*100) : 0;

  return (
    <div style={{ minHeight:"100vh", background:"#050505", color:"#fff", fontFamily:"Outfit,sans-serif", display:"flex", flexDirection:"column", alignItems:"center", padding:"24px 16px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes scaleIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}`}</style>

      {/* Header */}
      <div style={{ width:"100%", maxWidth:480, marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:7, background:"#0A84FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800 }}>e</div>
            <span style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.5)", letterSpacing:"1.5px", textTransform:"uppercase" }}>evara Check-in</span>
          </div>
          {/* Live attendance counter */}
          <div style={{ textAlign:"center", background:"#1C1C1E", borderRadius:10, padding:"6px 14px" }}>
            <div style={{ fontSize:22, fontWeight:800, color:"#30D158", lineHeight:1 }}>{stats.attended}</div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.8px" }}>checked in</div>
          </div>
        </div>
        <div style={{ fontSize:26, fontWeight:700, letterSpacing:"-0.5px", marginBottom:6 }}>{event?.name||"Event Check-in"}</div>
        {event?.event_date && <div style={{ fontSize:14, color:"rgba(255,255,255,0.45)" }}>{new Date(event.event_date).toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}{event?.location?` · ${event.location}`:""}</div>}
        {/* Progress bar */}
        {stats.total > 0 && (
          <div style={{ marginTop:14 }}>
            <div style={{ height:4, background:"rgba(255,255,255,0.08)", borderRadius:2, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${attendancePct}%`, background:"linear-gradient(90deg,#0A84FF,#30D158)", borderRadius:2, transition:"width .5s" }} />
            </div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:5 }}>{stats.attended} of {stats.total} registered guests checked in ({attendancePct}%)</div>
          </div>
        )}
      </div>

      <div style={{ width:"100%", maxWidth:480 }}>
        {checkedIn ? (
          <div style={{ textAlign:"center", animation:"scaleIn .3s ease", padding:"32px 0" }}>
            <div style={{ fontSize:72, marginBottom:12 }}>✅</div>
            <div style={{ fontSize:28, fontWeight:700, marginBottom:8 }}>Welcome{checkedIn.first_name?`, ${checkedIn.first_name}`:""}!</div>
            {checkedIn.company_name && <div style={{ fontSize:15, color:"rgba(255,255,255,0.5)", marginBottom:4 }}>{checkedIn.company_name}</div>}
            <div style={{ fontSize:15, color:"rgba(255,255,255,0.4)", marginBottom:32 }}>You're all checked in. Enjoy the event!</div>
            <button onClick={() => setCheckedIn(null)} style={{ padding:"12px 32px", borderRadius:12, border:"none", background:"#1C1C1E", color:"rgba(255,255,255,0.5)", fontSize:14, cursor:"pointer" }}>
              Next guest →
            </button>
          </div>
        ) : showWalkin ? (
          <div style={{ background:"#1C1C1E", borderRadius:16, padding:22, animation:"fadeUp .2s ease" }}>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:18 }}>Walk-in Registration</div>
            {[
              { label:"Full name *", value:walkinName, set:setWalkinName, ph:"John Smith", type:"text" },
              { label:"Email (optional)", value:walkinEmail, set:setWalkinEmail, ph:"john@company.com", type:"email" },
              { label:"Company (optional)", value:walkinCompany, set:setWalkinCompany, ph:"Acme Corp", type:"text" },
            ].map(f => (
              <div key={f.label} style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:11.5, color:"rgba(255,255,255,0.4)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>{f.label}</label>
                <input type={f.type} value={f.value} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
                  style={{ width:"100%", background:"#2C2C2E", border:"1px solid #3C3C3E", borderRadius:10, color:"#fff", padding:"12px 14px", fontSize:15, outline:"none" }}
                  onFocus={e=>e.target.style.borderColor="#0A84FF"} onBlur={e=>e.target.style.borderColor="#3C3C3E"} />
              </div>
            ))}
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowWalkin(false)} style={{ flex:1, padding:"12px", background:"transparent", border:"1px solid #3C3C3E", borderRadius:10, color:"rgba(255,255,255,0.4)", fontSize:14, cursor:"pointer" }}>Cancel</button>
              <button onClick={addWalkin} disabled={!walkinName.trim()||savingWalkin} style={{ flex:2, padding:"12px", background:walkinName.trim()?"#30D158":"#2C2C2E", border:"none", borderRadius:10, color:walkinName.trim()?"#000":"#666", fontSize:15, fontWeight:700, cursor:"pointer" }}>
                {savingWalkin?"Checking in…":"Check in →"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display:"flex", gap:10, marginBottom:12 }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()}
                placeholder="Search your name or email…" autoFocus
                style={{ flex:1, height:54, borderRadius:14, border:"1px solid #2C2C2E", background:"#1C1C1E", color:"#fff", padding:"0 18px", fontSize:16, outline:"none" }}
                onFocus={e=>e.target.style.borderColor="#0A84FF"} onBlur={e=>e.target.style.borderColor="#2C2C2E"} />
              <button onClick={doSearch} disabled={searching} style={{ padding:"0 22px", borderRadius:14, border:"none", background:"#0A84FF", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer" }}>
                {searching?"…":"Search"}
              </button>
            </div>

            {results.length > 0 && (
              <div style={{ background:"#1C1C1E", borderRadius:14, overflow:"hidden", marginBottom:12, animation:"fadeUp .2s ease" }}>
                {results.map((ec, i) => {
                  const c = ec.contacts||{};
                  const attended = ec.status==="attended";
                  return (
                    <div key={ec.id} style={{ padding:"14px 16px", borderBottom:i<results.length-1?"1px solid #2C2C2E":undefined, display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:42, height:42, borderRadius:"50%", background:attended?"#1E4D2B":"#0A84FF18", border:`1.5px solid ${attended?"#30D158":"#0A84FF40"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700, color:attended?"#30D158":"#0A84FF", flexShrink:0 }}>
                        {(c.first_name?.[0]||c.email?.[0]||"?").toUpperCase()}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:15, fontWeight:600 }}>{`${c.first_name||""} ${c.last_name||""}`.trim()||c.email}</div>
                        <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{c.company_name||c.email||""}</div>
                      </div>
                      {attended ? (
                        <span style={{ fontSize:12, color:"#30D158", background:"#1E4D2B", padding:"5px 12px", borderRadius:8, fontWeight:600 }}>✓ Checked in</span>
                      ) : (
                        <button onClick={() => checkIn(ec)} style={{ padding:"9px 20px", borderRadius:10, border:"none", background:"#30D158", color:"#000", fontSize:14, fontWeight:700, cursor:"pointer" }}>Check In ✓</button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {results.length===0 && search && !searching && (
              <div style={{ textAlign:"center", padding:"24px 0", color:"rgba(255,255,255,0.3)", fontSize:14 }}>
                Not found in guest list
              </div>
            )}

            {/* Walk-in button */}
            <div style={{ marginTop:16, textAlign:"center" }}>
              <button onClick={() => setShowWalkin(true)} style={{ fontSize:13, color:"rgba(255,255,255,0.35)", background:"transparent", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"10px 22px", cursor:"pointer" }}>
                + Walk-in / not on the list
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


// ─── EVENT CALENDAR VIEW ──────────────────────────────────────

export default PublicCheckInPage;