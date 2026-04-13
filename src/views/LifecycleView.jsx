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

// LifecycleView
function LifecycleView({ supabase, profile, activeEvent, fire }) {
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!profile) return;
    supabase.from("contacts").select("*").eq("company_id", profile.company_id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setContacts(data || []); setLoading(false); });
  }, [profile]);

  const loadActivity = async (contact) => {
    setSelected(contact);
    const { data } = await supabase.from("contact_activity")
      .select("*, events(name)")
      .eq("contact_id", contact.id)
      .order("created_at", { ascending: false });
    setActivity(data || []);
  };

  const filtered = contacts.filter(c => !search ||
    (c.email + c.first_name + c.last_name + c.company_name).toLowerCase().includes(search.toLowerCase()));

  const getScore = (c) => {
    const actCount = activity.filter(a => a.contact_id === c.id).length;
    return Math.min(100, actCount * 15 + (c.source === "walkin" ? 10 : 5));
  };

  return (
    <div style={{ animation: "fadeUp .2s ease", display: "flex", gap: 16, height: "calc(100vh - 130px)" }}>
      {/* Contact list */}
      <div style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 14 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: C.text, letterSpacing: "-0.5px" }}>Contact Lifecycle</h1>
          <p style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>Full journey across every event</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 12px", marginBottom: 10 }}>
          <Search size={13} color={C.muted} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts…"
            style={{ background: "none", border: "none", outline: "none", color: C.text, fontSize: 13, width: "100%" }} />
        </div>
        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
          {loading ? <div style={{ padding: 20, color: C.muted, textAlign: "center" }}><Spin /></div> :
            filtered.map(c => (
              <div key={c.id} onClick={() => loadActivity(c)}
                style={{ background: selected?.id === c.id ? C.raised : C.card, border: `1px solid ${selected?.id === c.id ? C.blue + "60" : C.border}`, borderRadius: 8, padding: "10px 12px", cursor: "pointer", transition: "all .12s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${C.blue}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.blue, flexShrink: 0 }}>
                    {(c.first_name?.[0] || c.email?.[0] || "?").toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {`${c.first_name || ""} ${c.last_name || ""}`.trim() || c.email}
                      </div>
                      {c.unsubscribed && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: C.red+"15", color: C.red, flexShrink: 0 }}>unsub</span>}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted }}>{c.company_name || c.email}</div>
                  </div>
                  <span style={{ fontSize: 10, color: C.green, background: C.green + "12", padding: "2px 6px", borderRadius: 3 }}>
                    {c.source === "walkin" ? "Walk-in" : c.source || "manual"}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Contact detail */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {!selected ? (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: C.muted, border: `1px dashed ${C.border}`, borderRadius: 10 }}>
            <Users size={40} strokeWidth={1} />
            <div style={{ fontSize: 14 }}>Select a contact to see their journey</div>
          </div>
        ) : (
          <div>
            {/* Profile card */}
            <div style={{ background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, padding: 20, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blue}, ${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#fff" }}>
                  {(selected.first_name?.[0] || selected.email?.[0] || "?").toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: C.text }}>{`${selected.first_name || ""} ${selected.last_name || ""}`.trim() || "—"}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{selected.email}</div>
                  {selected.company_name && <div style={{ fontSize: 12, color: C.muted }}>{selected.company_name}</div>}
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: C.green }}>{activity.length}</div>
                  <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px" }}>Touchpoints</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {[
                  { label: "Events", val: [...new Set(activity.map(a => a.event_id))].length, color: C.blue },
                  { label: "Check-ins", val: activity.filter(a => a.activity_type === "checked_in").length, color: C.green },
                  { label: "Emails opened", val: activity.filter(a => a.activity_type === "email_opened").length, color: C.teal },
                  { label: "Status changes", val: activity.filter(a => a.activity_type === "status_changed").length, color: C.amber },
                  { label: "Source", val: selected.source || "manual", color: C.teal },
                ].map(s => (
                  <div key={s.label} style={{ background: C.raised, borderRadius: 8, padding: "10px 12px", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity timeline */}
            <div style={{ background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, padding: 20 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Journey Timeline</div>
                <span style={{ fontSize:11, color:C.muted }}>{activity.length} touchpoint{activity.length!==1?"s":""}</span>
              </div>
              {activity.length === 0 ? (
                <div style={{ textAlign: "center", color: C.muted, padding: 24 }}>No activity recorded yet</div>
              ) : (
                <div style={{ position:"relative" }}>
                  {/* Vertical connector line */}
                  <div style={{ position:"absolute", left:15, top:8, bottom:8, width:2, background:`linear-gradient(to bottom, ${C.blue}40, ${C.green}40)`, borderRadius:2 }} />
                  {activity.map((a, i) => {
                    const typeColor = a.activity_type==="checked_in"?C.green:a.activity_type==="status_changed"?C.amber:a.activity_type==="email_opened"?C.teal:a.activity_type==="email_clicked"?C.blue:C.muted;
                    const typeIcon = a.activity_type==="checked_in"?"✓":a.activity_type==="email_opened"?"👁":a.activity_type==="email_clicked"?"🖱":a.activity_type==="email_sent"?"📧":a.activity_type==="status_changed"?"↔":"•";
                    return (
                      <div key={a.id} style={{ display:"flex", gap:14, marginBottom:14, paddingBottom: i<activity.length-1?14:0, borderBottom: i<activity.length-1?`1px solid ${C.border}00`:undefined }}>
                        {/* Timeline dot */}
                        <div style={{ width:30, height:30, borderRadius:"50%", background:`${typeColor}20`, border:`2px solid ${typeColor}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0, zIndex:1, position:"relative" }}>
                          {typeIcon}
                        </div>
                        <div style={{ flex:1, paddingTop:4 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:2 }}>
                            <span style={{ fontSize:13, color:C.text, fontWeight:500 }}>{a.description}</span>
                            <span style={{ fontSize:10, padding:"1px 6px", borderRadius:3, background:`${typeColor}18`, color:typeColor, fontWeight:600, textTransform:"capitalize" }}>{a.activity_type?.replace(/_/g," ")}</span>
                          </div>
                          {a.events?.name && <div style={{ fontSize:11, color:C.blue, marginBottom:2 }}>📅 {a.events.name}</div>}
                          <div style={{ fontSize:10.5, color:C.muted }}>{new Date(a.created_at).toLocaleString("en-AU",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROI CALCULATOR ───────────────────────────────────────────

export default LifecycleView;