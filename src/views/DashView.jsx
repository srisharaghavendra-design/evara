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
import {Spin, Alert, Inp, ViewHint, ScoreBadge, ImageUploadZone, ST, C} from "../components/Shared";

// EmailActivityTimeline + DashView
function EmailActivityTimeline({ supabase, contactId, eventId, contact, eventContact }) {
  const [sends, setSends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contactId) return;
    setLoading(true);
    supabase.from("email_sends")
      .select("*,email_campaigns(name,email_type,subject,event_id,events(name))")
      .eq("contact_id", contactId)
      .order("sent_at", { ascending: true })
      .limit(30)
      .then(({ data }) => { setSends(data || []); setLoading(false); });
  }, [contactId]);

  if (loading) return <div style={{ fontSize:11, color:C.muted }}>Loading journey…</div>;

  // Build full chronological story from all touchpoints
  const events_list = [];

  // Registration
  if (eventContact?.created_at) {
    events_list.push({ date: eventContact.created_at, type:"registered", label:"Added to event", icon:"📋", color:C.blue });
  }

  // Email sends + opens + clicks
  sends.forEach(s => {
    const cam = s.email_campaigns || {};
    const emailLabel = cam.subject || cam.name || cam.email_type?.replace(/_/g," ") || "Email";
    if (s.sent_at) events_list.push({ date:s.sent_at, type:"sent", label:`Received: ${emailLabel}`, icon:"📧", color:C.muted });
    if (s.opened_at) events_list.push({ date:s.opened_at, type:"opened", label:`Opened: ${emailLabel}`, icon:"👁", color:C.green });
    if (s.clicked_at) events_list.push({ date:s.clicked_at, type:"clicked", label:`Clicked link in: ${emailLabel}`, icon:"🖱", color:C.blue });
    if (s.bounced_at) events_list.push({ date:s.bounced_at, type:"bounced", label:`Bounced: ${emailLabel}`, icon:"❌", color:C.red });
  });

  // Confirmation
  if (eventContact?.confirmed_at) {
    events_list.push({ date: eventContact.confirmed_at, type:"confirmed", label:"Confirmed attendance", icon:"✅", color:C.green });
  }

  // Attendance
  if (eventContact?.attended_at || eventContact?.status === "attended") {
    events_list.push({ date: eventContact?.attended_at || eventContact?.updated_at, type:"attended", label:"Attended the event", icon:"🎪", color:C.teal });
  }

  // Sort by date
  events_list.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!events_list.length) return (
    <div style={{ fontSize:11, color:C.muted, fontStyle:"italic" }}>No journey events yet — emails will appear here as they're sent</div>
  );

  const fmtDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-AU", { day:"numeric", month:"short" }) + " · " + date.toLocaleTimeString("en-AU", { hour:"2-digit", minute:"2-digit" });
  };

  return (
    <div style={{ position:"relative" }}>
      {/* Vertical line */}
      <div style={{ position:"absolute", left:10, top:8, bottom:8, width:1, background:C.border }} />
      <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
        {events_list.map((ev, i) => (
          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, paddingBottom:12, position:"relative" }}>
            {/* Dot */}
            <div style={{ width:20, height:20, borderRadius:"50%", background:C.card, border:`2px solid ${ev.color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, flexShrink:0, zIndex:1 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:ev.color }} />
            </div>
            <div style={{ flex:1, paddingTop:1 }}>
              <div style={{ fontSize:12, color:ev.type==="confirmed"||ev.type==="attended"?ev.color:ev.type==="opened"||ev.type==="clicked"?C.text:C.sec, fontWeight:ev.type==="confirmed"||ev.type==="attended"?600:400, lineHeight:1.3 }}>{ev.label}</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{fmtDate(ev.date)}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Current status */}
      <div style={{ marginTop:4, padding:"8px 10px", background:C.raised, borderRadius:6, display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:6, height:6, borderRadius:"50%", background: eventContact?.status==="attended"?C.teal:eventContact?.status==="confirmed"?C.green:eventContact?.status==="declined"?C.red:C.amber, flexShrink:0 }} />
        <span style={{ fontSize:11, color:C.muted }}>Current status: </span>
        <span style={{ fontSize:11, fontWeight:600, color:C.text, textTransform:"capitalize" }}>{eventContact?.status || "pending"}</span>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────
function DashView({ supabase, profile, activeEvent, fire, setView, events = [], setActiveEvent, showMorningBrief, setShowMorningBrief }) {
  const [contacts, setContacts] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [scores, setScores] = useState({});
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showHelp, setShowHelp] = useState(false);
  const [scoreFilter, setScoreFilter] = useState(""); // "hot"|"warm"|"cool"|"cold"|""
  const [editingContactFields, setEditingContactFields] = useState(false);
  const [contactEditForm, setContactEditForm] = useState({});
  const [savingContact, setSavingContact] = useState(false);
  const toggleRow = (id) => setSelectedRows(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = (rows) => setSelectedRows(p => p.size === rows.length ? new Set() : new Set(rows.map(r => r.id)));
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Escape key closes contact panel
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") { setSelectedContact(null); setShowHelp(false); setEditingContactFields(false); }
      if (e.key === "?" && !["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)) setShowHelp(p => !p);
      if (e.key === "n" && !["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName) && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setShowNewEvent(true); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedContact]);
  const [loading, setLoading] = useState(true);
  const [filt, setFilt] = useState("all");
  const [formShareLink, setFormShareLink] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ email: "", first_name: "", last_name: "", phone: "", company_name: "" });
  const [sending, setSending] = useState(null);
  const [liveMode, setLiveMode] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [whatNextLoading, setWhatNextLoading] = useState(false);
  const [whatNextResult, setWhatNextResult] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [campaigns, setCampaigns] = useState([]);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(false);
  const [nlQuery, setNlQuery] = useState("");
  const [nlFiltered, setNlFiltered] = useState(null);   // null = not filtering
  const [nlLabel, setNlLabel] = useState("");
  const [nlLoading, setNlLoading] = useState(false);

  // Auto-refresh in live mode every 10 seconds
  useEffect(() => {
    if (!liveMode) return;
    const interval = setInterval(() => {
      if (activeEvent && profile) {
        supabase.from("event_contacts").select("*,contacts(*)").eq("event_id", activeEvent.id)
          .order("created_at", { ascending: false })
          .then(({ data }) => { if (data) setContacts(data); });
        supabase.from("event_summary").select("*").eq("event_id", activeEvent.id).maybeSingle()
          .then(({ data }) => { if (data) setMetrics(data); });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [liveMode, activeEvent, profile]);

  const triggerEmail = async (ecId, contactId, status) => {
    setSending(contactId);
    try {
      const updatePayload = { status };
      if (status === "confirmed") updatePayload.confirmed_at = new Date().toISOString();
      if (status === "attended") updatePayload.attended_at = new Date().toISOString();
      await supabase.from("event_contacts").update(updatePayload).eq("id", ecId);
      const triggerType = status === "confirmed" ? "confirmation" : status === "declined" ? "decline" : status === "attended" ? "attended" : null;
      if (triggerType && profile && activeEvent) {
        const ec = contacts.find(c => c.id === ecId);
        const contact = ec?.contacts || {};
        const { data: { session: triggerSess } } = await supabase.auth.getSession();
        const res = await fetch(`${SUPABASE_URL}/functions/v1/send-triggered-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${triggerSess?.access_token}` },
          body: JSON.stringify({
            contacts: [{ email: contact.email, first_name: contact.first_name || "", last_name: contact.last_name || "", unsubscribed: contact.unsubscribed || false }],
            triggerType, eventName: activeEvent.name,
            eventDate: activeEvent.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "",
            eventTime: activeEvent.event_time || "", location: activeEvent.location || "",
            orgName: profile.companies?.name || "",
          })
        });
        const data = await res.json();
        if (data.success && data.sent > 0) fire(`${ST[status]?.label || status} ✅ — confirmation sent to ${contact.email}. Check spam if not received.`);
        else fire(`Status updated. Email issue: ${data.errors?.[0]?.reason || data.error || "unknown"}`, "warn");
      }
      await supabase.from("contact_activity").insert({ contact_id: contactId, event_id: activeEvent.id, company_id: profile.company_id, activity_type: "status_changed", description: `Status changed to ${status}` });
      setContacts(p => p.map(c => c.id === ecId ? { ...c, status } : c));
    } catch (err) { fire(err.message, "err"); } finally { setSending(null); }
  };

  useEffect(() => {
    if (!activeEvent || !profile) return;
    // Clear stale data immediately when event changes
    setContacts([]);
    setMetrics(null);
    setFormShareLink("");
    const load = async () => {
      setLoading(true);
      try {
        const [ecRes, camRes, metricsRes, formRes] = await Promise.all([
          supabase.from("event_contacts").select("*,contacts(*)").eq("event_id", activeEvent.id).order("created_at", { ascending: false }),
          supabase.from("email_campaigns").select("id,name,email_type,status,total_sent,html_content,subject,scheduled_at").eq("event_id", activeEvent.id).limit(20),
          supabase.from("event_summary").select("*").eq("event_id", activeEvent.id).maybeSingle(),
          supabase.from("forms").select("share_token").eq("event_id", activeEvent.id).eq("is_active", true).limit(1).maybeSingle(),
        ]);
        const ecData = ecRes.data || [];
        setContacts(ecData);
        setCampaigns(camRes.data || []);
        if (metricsRes.data) setMetrics(metricsRes.data);
        if (formRes.data?.share_token) setFormShareLink(`${window.location.origin}/form/${formRes.data.share_token}`);
        
        // Load lead scores
        if (ecData.length) {
          const contactIds = ecData.map(r => r.contacts?.id || r.contact_id).filter(Boolean).slice(0, 100);
          if (contactIds.length) {
            const { data: scoreRows } = await supabase.from("contact_lead_scores").select("contact_id,score,temperature").in("contact_id", contactIds);
            const scoreMap = {};
            (scoreRows || []).forEach(r => { scoreMap[r.contact_id] = { score: r.score, temp: r.temperature }; });
            setScores(scoreMap);
          }
        }
      } catch(e) {
        console.error("Dashboard load error:", e);
        setContacts([]);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }

      // Load AI insights after core data
      setInsights(null);
      setInsightsError(false);
    };
    load();
  }, [activeEvent, profile]);

  const loadInsights = async () => {
    if (!activeEvent || !profile) return;
    setInsightsLoading(true);
    setInsightsError(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
        body: JSON.stringify({ eventId: activeEvent.id, companyId: profile.company_id })
      });
      const data = await res.json();
      if (data.success) setInsights(data.insights);
      else setInsightsError(true);
    } catch { setInsightsError(true); }
    finally { setInsightsLoading(false); }
  };

  const runNLFilter = async (q) => {
    if (!q.trim() || !contacts.length) { setNlFiltered(null); setNlLabel(""); return; }
    setNlLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/nl-filter`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
        body: JSON.stringify({ query: q, contacts })
      });
      const data = await res.json();
      if (data.success) {
        const ids = new Set(data.matched_ids || []);
        setNlFiltered(contacts.filter(c => ids.has(c.id)));
        setNlLabel(data.filter_description || q);
        fire(`🔍 ${data.matched_ids?.length || 0} contacts: ${data.filter_description}`);
      }
    } catch(e) { fire("Filter failed", "err"); }
    finally { setNlLoading(false); }
  };

  // Apply NL filter first, then status filter on top
  const baseContacts = nlFiltered !== null ? nlFiltered : contacts;
  const rows = (filt === "all" ? [...baseContacts].sort((a,b) => {
    // Pending first, then confirmed, then rest
    const order = { pending: 0, confirmed: 1, attended: 2, declined: 3 };
    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
  }) : baseContacts.filter(c => c.status === filt)).filter(ec => {
    if (!scoreFilter) return true;
    const s = scores[ec.contacts?.id]?.score || 0;
    if (scoreFilter === "hot")  return s >= 15;
    if (scoreFilter === "warm") return s >= 8 && s < 15;
    if (scoreFilter === "cool") return s >= 3 && s < 8;
    if (scoreFilter === "cold") return s < 3;
    if (scoreFilter === "pending_status") return ec.status === "pending";
    if (scoreFilter === "declined_status") return ec.status === "declined";
    if (scoreFilter === "vip") return (ec.contacts?.tags || []).includes("vip");
    return true;
  });
  const noContactsYet = contacts.length === 0 && !loading;
  // Go Live checklist items
  const goLiveChecklist = activeEvent ? [
    { id: "contacts", label: contacts.length > 0 ? `Contacts added (${contacts.length})` : "Import contacts", done: contacts.length > 0 || (metrics?.total_contacts || 0) > 0, action: "contacts", icon: "👥" },
    { id: "form", label: "Create registration form", done: !!formShareLink, action: "forms", icon: "📋" },
    { id: "email", label: "Draft invite email", done: campaigns.length > 0 && campaigns.some(c => c.html_content && c.html_content.length > 200), action: "edm", icon: "✉️" },
    { id: "sent", label: campaigns.filter(c => c.status === "draft").length > 0 ? `Send first email (${campaigns.filter(c => c.status === "draft").length} ready)` : "Send first email", done: (metrics?.total_sent || 0) > 0 || campaigns.some(c => c.status === "sent"), action: "schedule", icon: "🚀" },
  ] : [];
  const goLiveDone = goLiveChecklist.filter(i => i.done).length;

  const METRICS = [
    { label: "Emails Sent", val: metrics?.total_sent || 0, color: C.blue,
      sub: (() => {
        const sched = campaigns.filter(c => c.status === "scheduled").length;
        if (sched > 0) return `${sched} scheduled`;
        const lastSent = campaigns.filter(c => c.status === "sent" && c.sent_at).sort((a,b) => new Date(b.sent_at)-new Date(a.sent_at))[0];
        if (!lastSent) return null;
        const d = Math.round((new Date()-new Date(lastSent.sent_at))/(1000*60*60*24));
        return d === 0 ? "sent today" : d > 7 ? `⚠️ ${d}d ago` : `last sent ${d}d ago`;
      })()
    },
    { label: "Opened", val: metrics?.total_opened || 0, color: C.teal, sub: metrics?.total_sent > 0 ? Math.round((metrics.total_opened / metrics.total_sent) * 100) + "% open rate" : "No sends yet" },
    { label: "Registered", val: metrics?.total_contacts || metrics?.total_invited || 0, color: C.text },
    { label: "Confirmed", val: metrics?.total_confirmed || 0, color: C.green },
    { label: "Declined", val: metrics?.total_declined || 0, color: C.red },
    { label: "Pending", val: metrics?.total_pending || 0, color: C.amber },
    { label: "Attended", val: metrics?.total_attended || 0, color: C.blue, sub: metrics?.total_confirmed > 0 ? Math.round((metrics.total_attended / metrics.total_confirmed) * 100) + "%" : null },
  ];

  if (!activeEvent) return (
    <div style={{ animation: "fadeUp .25s ease", maxWidth: 640, margin: "0 auto", padding: "40px 0 0" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg,${C.blue},${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: `0 8px 32px ${C.blue}40`, fontSize: 28 }}>⚡</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.8px", color: C.text, marginBottom: 10, lineHeight: 1.15 }}>Welcome to evara</h1>
        <p style={{ fontSize: 14, color: C.muted, maxWidth: 380, margin: "0 auto 24px", lineHeight: 1.7 }}>Your AI-powered event marketing platform. Create an event and AI instantly generates your emails, forms, and campaign schedule.</p>
        <button onClick={() => setShowNewEvent(true)} style={{ padding: "13px 36px", background: C.blue, border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: `0 6px 24px ${C.blue}50`, letterSpacing: "-0.2px" }}>
          ✨ Create Your First Event →
        </button>
      </div>

      {/* Feature pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
        {[["📧","AI eDM Builder"],["📋","RSVP Forms"],["📊","Analytics"],["📍","Check-in"],["🎤","Live Q&A"],["🤖","Campaign AI"]].map(([icon, label]) => (
          <span key={label} style={{ fontSize: 11.5, padding: "5px 12px", borderRadius: 999, background: C.card, color: C.sec, border: `1px solid ${C.border}`, fontWeight: 500 }}>{icon} {label}</span>
        ))}
      </div>

      {/* Getting started steps */}
      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.blue, boxShadow: `0 0 6px ${C.blue}` }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1.2px" }}>Getting started</span>
        </div>
        {[
          { num: "1", title: "Create your first event", desc: "Add name, date, and location — takes 30 seconds", icon: "🎪" },
          { num: "2", title: "AI drafts your email campaign", desc: "5 polished emails generated automatically — just review and send", icon: "🤖" },
          { num: "3", title: "Import your contact list", desc: "Paste emails or upload CSV — no formatting required", icon: "👥" },
          { num: "4", title: "Set up registration form", desc: "Share the link — contacts self-register, data flows in", icon: "📋" },
          { num: "5", title: "Schedule and send", desc: "AI suggests optimal send times — one click to launch", icon: "🚀" },
        ].map((item, i, arr) => (
          <div key={item.num} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < arr.length-1 ? `1px solid ${C.border}` : "none", cursor: i === 0 ? "pointer" : "default" }}
            onClick={i === 0 ? () => setShowNewEvent(true) : undefined}
            onMouseEnter={i === 0 ? e => e.currentTarget.style.background = C.raised : undefined}
            onMouseLeave={i === 0 ? e => e.currentTarget.style.background = "transparent" : undefined}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: i === 0 ? `${C.blue}18` : C.raised, border: `1px solid ${i === 0 ? C.blue+"30" : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: i === 0 ? C.text : C.sec, marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.4 }}>{item.desc}</div>
            </div>
            {i === 0 && <span style={{ fontSize: 14, color: C.blue, opacity: 0.7 }}>→</span>}
          </div>
        ))}
      </div>
    </div>
  );
  const daysToEvent = activeEvent.event_date ? Math.ceil((new Date(activeEvent.event_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
  const isPostEvent = daysToEvent !== null && daysToEvent < 0;
  const daysSinceEvent = isPostEvent ? Math.abs(daysToEvent) : null;



  return (
    <div style={{ animation: "fadeUp .2s ease" }}>

      {/* ── MORNING BRIEFING CARD ── */}
      {activeEvent && showMorningBrief && (() => {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
        const firstName = profile?.full_name?.split(" ")[0] || "there";
        const daysLeft = daysToEvent;
        const sentCount = campaigns.filter(c => c.status === "sent").length;
        const pendingCount = metrics?.total_pending || 0;
        const openRate = metrics?.total_sent > 0 ? Math.round((metrics.total_opened / metrics.total_sent) * 100) : 0;

        // Smart insight
        let insight = null;
        if (sentCount === 0 && campaigns.length > 0) insight = { msg: `You have ${campaigns.length} email draft${campaigns.length>1?"s":""} ready — approve them in Step 1 then schedule.`, cta: null, color: C.blue };
        else if (pendingCount > 5 && daysLeft !== null && daysLeft < 14) insight = { msg: `${pendingCount} contacts haven't responded yet — ${daysLeft} days to go.`, cta: null, color: C.amber };
        else if (openRate > 0 && openRate < 30) insight = { msg: `${openRate}% open rate is below average. Consider updating your subject line in Step 1.`, cta: null, color: C.red };
        else if (openRate >= 60) insight = { msg: `${openRate}% open rate — that's exceptional. Your subject line is working.`, cta: null, color: C.green };
        else if (daysLeft !== null && daysLeft <= 7 && daysLeft > 0) insight = { msg: `${daysLeft} day${daysLeft===1?"":"s"} to go. Check your day-of details email is scheduled.`, cta: null, color: C.amber };
        else if (contacts.length === 0) insight = { msg: "No contacts imported yet. Add your guest list to get started.", cta: "Import contacts →", action: () => setView("contacts"), color: C.blue };

        return (
          <div style={{ background:`linear-gradient(135deg,${C.blue}12,${C.teal}06)`, border:`1px solid ${C.blue}25`, borderRadius:12, padding:"14px 18px", marginBottom:14, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, animation:"fadeUp .4s ease" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:4 }}>
                {greeting}, {firstName}. <span style={{ color:C.blue }}>{activeEvent.name}</span>{daysLeft !== null && !isPostEvent ? ` is in ${daysLeft} day${daysLeft===1?"":"s"}.` : isPostEvent ? " is complete." : "."}
              </div>
              {insight && (
                <div style={{ fontSize:12, color:C.muted, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <span style={{ color:insight.color }}>●</span>
                  <span>{insight.msg}</span>
                  {insight.cta && insight.action && (
                    <button onClick={insight.action} style={{ fontSize:11, fontWeight:600, color:insight.color, background:"transparent", border:`1px solid ${insight.color}40`, borderRadius:5, padding:"2px 8px", cursor:"pointer" }}>{insight.cta}</button>
                  )}
                </div>
              )}
            </div>
            <button onClick={() => { localStorage.setItem(`evara_brief_${new Date().toDateString()}`,"1"); setShowMorningBrief(false); }}
              style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:16, lineHeight:1, flexShrink:0, padding:"4px 6px" }} title="Dismiss for today">×</button>
          </div>
        );
      })()}

      {/* ── STORY BAR — only once campaign is live ── */}
      {campaigns.filter(c => c.status === "sent").length > 0 && (
      <StoryBar
        event={activeEvent}
        stats={{
          contacts:    contacts.length,
          emailsSent:  campaigns.filter(c => c.status === "sent").length,
          emailDrafts: campaigns.filter(c => c.status === "draft").length,
          confirmed:   metrics?.total_confirmed || 0,
          checkedIn:   metrics?.total_attended || 0,
        }}
        onAction={(key) => {
          if (key === "contacts") setView("contacts");
          if (key === "checkin")  window.open(`/checkin/${activeEvent?.id}`, "_blank");
        }}
      />
      )}

      {/* Post-event mode banner */}
      {isPostEvent && (
        <div style={{ background:`linear-gradient(135deg, ${C.green}15, ${C.teal}10)`, border:`1px solid ${C.green}30`, borderRadius:11, padding:"12px 18px", marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:24 }}>🎉</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.green }}>Event complete — {daysSinceEvent} day{daysSinceEvent!==1?"s":""} ago</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>
              {contacts.filter(c=>c.status==="attended").length} attended · 
              {!campaigns.some(c=>c.email_type==="thank_you"&&c.status==="sent") ? " Send a thank you email →" : " Thank you email sent ✓"}
            </div>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button onClick={() => setView("feedback")} style={{ fontSize:12, padding:"6px 13px", background:"transparent", border:`1px solid ${C.green}50`, borderRadius:7, color:C.green, cursor:"pointer" }}>
              Feedback Form
            </button>
            <button onClick={() => { setShowDupModal(true); setDupName(`${activeEvent.name} — Next`); }} style={{ fontSize:12, padding:"6px 13px", background:"transparent", border:`1px solid ${C.blue}50`, borderRadius:7, color:C.blue, cursor:"pointer", fontWeight:600 }}>
              ⧉ Run it again →
            </button>
            <button onClick={async () => {
              fire("🤖 Generating AI report…");
              const { data: { session } } = await supabase.auth.getSession();
              const res = await fetch(`${SUPABASE_URL}/functions/v1/post-event-report`, {
                method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${session?.access_token}`},
                body: JSON.stringify({ eventId: activeEvent.id, companyId: profile?.company_id })
              });
              const d = await res.json();
              if (d.success && d.html) { const w = window.open("","_blank"); w.document.write(d.html); w.document.close(); fire("✅ Report ready!"); }
              else fire("Report failed","err");
            }} style={{ fontSize:12, padding:"6px 13px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:7, color:C.muted, cursor:"pointer" }}>
              ✨ AI Report
            </button>
          </div>
        </div>
      )}
      {/* ─── EVENT HERO HEADER ─── */}
      <div style={{ marginBottom: 20, background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
        {/* Subtle gradient accent */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${C.blue},${C.teal},${C.blue}00)` }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: C.blue, textTransform: "uppercase", letterSpacing: "1.8px", marginBottom: 6 }}>Active Event</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.6px", color: C.text, margin: 0, lineHeight: 1.2 }}>{{"Conference":"🎤 ","Workshop":"🛠 ","Webinar":"🖥 ","Product Launch":"🚀 ","Awards":"🏆 ","Team Event":"🤝 "}[activeEvent.event_type]||""}{activeEvent.name}</h1>
              <span onClick={async () => {
                const statuses = ["draft", "published", "completed"];
                const curr = activeEvent.status || "draft";
                const next = statuses[(statuses.indexOf(curr) + 1) % statuses.length];
                await supabase.from("events").update({ status: next }).eq("id", activeEvent.id);
                fire(`Event status → ${next}`);
              }} style={{ fontSize: 10, fontWeight: 700, color: activeEvent.status === "draft" ? C.muted : activeEvent.status === "completed" ? C.green : C.blue, background: (activeEvent.status === "draft" ? C.muted : activeEvent.status === "completed" ? C.green : C.blue) + "18", padding: "3px 9px", borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.6px", flexShrink: 0, cursor: "pointer", border: `1px solid ${(activeEvent.status === "draft" ? C.muted : activeEvent.status === "completed" ? C.green : C.blue)}30` }} title="Click to change status">
                {activeEvent.status === "published" ? "🟢 " : activeEvent.status === "completed" ? "✅ " : "⚪ "}
                {(activeEvent.status || "draft").charAt(0).toUpperCase() + (activeEvent.status || "draft").slice(1)}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {activeEvent.event_type && <span style={{ background: `${C.blue}14`, color: C.blue, fontSize: 10.5, padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>{activeEvent.event_type}</span>}
              {activeEvent.event_format && activeEvent.event_format !== "In-person" && <span style={{ background: `${C.teal}14`, color: C.teal, fontSize: 10.5, padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>{activeEvent.event_format === "Online / Webinar" ? "🖥 Online" : "🔀 Hybrid"}</span>}
              {activeEvent.event_date && <span style={{ fontSize: 12, color: C.sec }}>📅 {new Date(activeEvent.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}{activeEvent.event_time ? ` · ${activeEvent.event_time}` : ""}</span>}
              {activeEvent.location && <span style={{ fontSize: 12, color: C.muted }}>📍 {activeEvent.location}</span>}
              {activeEvent.expected_attendees && <span style={{ fontSize: 12, color: C.muted }}>👥 {activeEvent.expected_attendees} expected</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button onClick={() => setShowEditEvent(true)} style={{ fontSize: 11, padding: "6px 12px", background: C.raised, border: `1px solid ${C.border}`, borderRadius: 7, color: C.muted, cursor: "pointer", fontWeight: 500 }}>
              Edit
            </button>
            <button onClick={async () => {
              fire("🤖 Generating AI report…");
              const { data: { session } } = await supabase.auth.getSession();
              const res = await fetch(`${SUPABASE_URL}/functions/v1/post-event-report`, {
                method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${session?.access_token}`},
                body: JSON.stringify({ eventId: activeEvent.id, companyId: profile?.company_id })
              });
              const d = await res.json();
              if (d.success && d.html) { const w = window.open("","_blank"); w.document.write(d.html); w.document.close(); fire("✅ Report ready!"); }
              else fire("Report failed","err");
            }} style={{ fontSize: 11, padding: "6px 12px", background: `${C.blue}14`, border: `1px solid ${C.blue}30`, borderRadius: 7, color: C.blue, cursor: "pointer", fontWeight: 600 }}>
              ✨ AI Report
            </button>
          </div>
        </div>
      </div>
      {/* Description / notes row */}
      {(activeEvent.description || activeEvent.capacity || activeEvent.internal_notes) && (
        <div style={{ marginBottom: 14, padding: "12px 16px", background: C.card, borderRadius: 10, border: `1px solid ${C.border}` }}>
          {activeEvent.description && <p style={{ color: C.muted, fontSize: 12, fontStyle: "italic", marginBottom: activeEvent.capacity || activeEvent.internal_notes ? 6 : 0 }}>{activeEvent.description}</p>}
          {activeEvent.capacity && (() => {
            const pct = Math.round((contacts.length / activeEvent.capacity) * 100);
            const isOver = contacts.length >= activeEvent.capacity;
            const isNear = pct >= 80 && !isOver;
            return <p style={{ color: isOver ? C.red : isNear ? C.amber : C.muted, fontSize: 12, fontWeight: isOver || isNear ? 600 : 400 }}>
              {isOver ? "🔴 SOLD OUT" : isNear ? "🟡 Nearly full" : "👥 Capacity"}: {contacts.length}/{activeEvent.capacity} ({pct}% full)
            </p>;
          })()}
          {activeEvent.internal_notes && <div style={{ marginTop:6, padding:"6px 10px", background:`${C.amber}08`, border:`1px solid ${C.amber}20`, borderRadius:6, display:"flex", gap:7 }}>
            <span style={{ fontSize:12 }}>📌</span>
            <span style={{ fontSize:11.5, color:C.amber, lineHeight:1.5 }}>{activeEvent.internal_notes}</span>
          </div>}
        </div>
      )}
      {/* Quick action row — form link + shared dashboard */}
      {(formShareLink || activeEvent.share_token) && (
        <div className="event-hero-actions" style={{ marginBottom:14, display:"flex", gap:8, flexWrap:"wrap", overflowX:"auto" }}>
          {formShareLink && <>
            <button onClick={() => { navigator.clipboard?.writeText(formShareLink); fire("📋 Reg link copied!"); }}
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, background: C.raised, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 13px", color: C.muted, cursor: "pointer" }}>
              📝 Copy Reg Link
            </button>
            <button onClick={() => window.open(formShareLink, "_blank")}
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, background: `${C.blue}10`, border: `1px solid ${C.blue}30`, borderRadius: 7, padding: "7px 13px", color: C.blue, cursor: "pointer" }}>
              👁 Preview Form
            </button>
          </>}
          <button onClick={async () => {
            let token = activeEvent.share_token;
            if (!token) {
              token = Math.random().toString(36).substring(2, 14) + Date.now().toString(36);
              await supabase.from("events").update({ share_token: token }).eq("id", activeEvent.id);
            }
            const shareUrl = `${window.location.hostname === "localhost" ? "https://evara-tau.vercel.app" : window.location.origin}/share/${token}`;
            await navigator.clipboard?.writeText(shareUrl);
            fire(`📊 Dashboard link copied!`);
          }} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, background: C.raised, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 13px", color: C.muted, cursor: "pointer" }}>
            📊 Share Dashboard
          </button>
          <button onClick={() => setLiveMode(p => !p)}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "7px 14px", borderRadius: 7, border: `1px solid ${liveMode ? C.green + "60" : C.border}`, background: liveMode ? `${C.green}10` : C.raised, color: liveMode ? C.green : C.muted, cursor: "pointer" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: liveMode ? C.green : C.muted, animation: liveMode ? "pulse 1.5s infinite" : "none" }} />
            {liveMode ? "Live ✓" : "Live Mode"}
          </button>
        </div>
      )}

      {/* Event lifecycle timeline — only show once campaigns exist */}
      {activeEvent && daysToEvent !== null && campaigns.length > 0 && (
        <div style={{ background:C.card, borderRadius:10, border:`1px solid ${C.border}`, padding:"12px 16px", marginBottom:14, overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
          <div style={{ display:"flex", alignItems:"center", gap:0, minWidth:520 }}>
            {[
              { label:"Save the Date", icon:"📅", phase:"pre", daysKey:"save_the_date", refDay:-56 },
              { label:"Invitation", icon:"✉️", phase:"pre", daysKey:"invitation", refDay:-28 },
              { label:"Reminder", icon:"⏰", phase:"pre", daysKey:"reminder", refDay:-7 },
              { label:"Event Day", icon:"🎪", phase:"event", refDay:0 },
              { label:"Thank You", icon:"🙏", phase:"post", daysKey:"thank_you", refDay:1 },
              { label:"Feedback", icon:"⭐", phase:"post", daysKey:"confirmation", refDay:7 },
            ].map((stage, i, arr) => {
              const isEvent = stage.phase === "event";
              const isPast = !isEvent && daysToEvent > -stage.refDay;
              const isCurrent = isEvent && daysToEvent === 0;
              const sentCam = stage.daysKey && campaigns.find(c => c.email_type === stage.daysKey && c.status === "sent");
              const scheduledCam = stage.daysKey && campaigns.find(c => c.email_type === stage.daysKey && c.status === "scheduled");
              const hasDraft = stage.daysKey && campaigns.find(c => c.email_type === stage.daysKey && c.status === "draft");
              const dotCol = isCurrent ? C.green : sentCam ? C.green : scheduledCam ? C.blue : isPast ? C.muted+"60" : C.muted;
              const dotBg = isCurrent ? C.green+"20" : sentCam ? C.green+"20" : scheduledCam ? C.blue+"15" : "transparent";
              return (
                <div key={stage.label} style={{ display:"flex", alignItems:"center", flex:1 }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, flex:1 }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:dotBg, border:`2px solid ${dotCol}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, transition:"all .2s" }}
                      title={sentCam?"Sent":scheduledCam?"Scheduled":hasDraft?"Draft":"Not started"}>
                      {sentCam?"✓":isCurrent?stage.icon:stage.icon}
                    </div>
                    <div style={{ fontSize:9.5, color:sentCam?C.green:scheduledCam?C.blue:isCurrent?C.text:C.muted, fontWeight:sentCam||scheduledCam||isCurrent?600:400, textAlign:"center", lineHeight:1.2 }}>{stage.label}</div>
                    <div style={{ fontSize:8.5, color:C.muted, textAlign:"center" }}>
                      {sentCam?"✓ sent":scheduledCam?"scheduled":hasDraft?"draft":stage.refDay===0?"Event day":stage.refDay>0?`+${stage.refDay}d`:`${stage.refDay}d`}
                    </div>
                  </div>
                  {i < arr.length-1 && (
                    <div style={{ height:2, flex:0.5, background:sentCam?`${C.green}60`:scheduledCam?`${C.blue}40`:C.border, marginBottom:20, borderRadius:1 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick actions strip */}
      {activeEvent && (
        <div className="quick-actions" style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"1px", flexShrink:0 }}>Track & Manage</span>
          {[
            { label:"👥 Contacts", action:() => setView("contacts"), color:C.blue },
            { label:"📊 Analytics", action:() => setView("analytics"), color:C.blue },
            { label:"🎪 Check-in", action:() => setView("checkin"), color:C.green },
            { label:"📋 Feedback", action:() => setView("feedback"), color:C.blue },
            { label:"⬇️ Export CSV", action: () => {
              const rows = [["First Name","Last Name","Email","Company","Job Title","Status","Confirmed At","Attended"]];
              contacts.forEach(ec => {
                const c = ec.contacts || {};
                rows.push([c.first_name||"",c.last_name||"",c.email||"",c.company_name||"",c.job_title||"",ec.status||"pending",ec.confirmed_at?new Date(ec.confirmed_at).toLocaleDateString("en-AU"):"",ec.status==="attended"?"Yes":"No"]);
              });
              const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
              const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
              a.download = `${activeEvent.name} — Guest List.csv`; a.click();
              fire(`✅ Exported ${contacts.length} contacts`);
            }, color:C.teal },
            { label:"✨ AI Report", action: async () => {
              fire("🤖 Generating…");
              const { data: { session } } = await supabase.auth.getSession();
              const res = await fetch(`${SUPABASE_URL}/functions/v1/post-event-report`, {
                method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${session?.access_token}`},
                body: JSON.stringify({ eventId: activeEvent.id, companyId: profile?.company_id })
              });
              const d = await res.json();
              if (d.success && d.html) { const w = window.open("","_blank"); w.document.write(d.html); w.document.close(); fire("✅ Report ready!"); }
              else fire("Report failed","err");
            }, color:"#BF5AF2" },
          ].map(({label, action, color}) => (
            <button key={label} onClick={action} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, padding:"6px 13px", borderRadius:7, border:`1px solid ${color}30`, background:`${color}0a`, color, cursor:"pointer", fontWeight:500, transition:"all .1s" }}
              onMouseEnter={e=>{ e.currentTarget.style.background=`${color}18`; }}
              onMouseLeave={e=>{ e.currentTarget.style.background=`${color}0a`; }}>
              {label}
            </button>
          ))}

          {/* ── WHAT SHOULD I DO NEXT? ── */}
          <div style={{ marginLeft:"auto", position:"relative" }}>
            <button onClick={async () => {
              if (whatNextLoading) return;
              if (whatNextResult) { setWhatNextResult(null); return; }
              setWhatNextLoading(true);
              try {
                const { data: { session } } = await supabase.auth.getSession();
                const context = `Event: ${activeEvent.name}\nDays to event: ${daysToEvent ?? "unknown"}\nEmails sent: ${campaigns.filter(c=>c.status==="sent").length}/${campaigns.length}\nOpen rate: ${metrics?.total_sent>0?Math.round((metrics.total_opened/metrics.total_sent)*100):0}%\nConfirmed: ${metrics?.total_confirmed||0}\nPending: ${metrics?.total_pending||0}\nContacts: ${contacts.length}\nLanding page: ${formShareLink?"yes":"no"}`;
                const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
                  method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${session?.access_token}`},
                  body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:200,
                    messages:[{ role:"user", content:`You are an event marketing expert. Based on this campaign status, tell me the ONE most important thing to do right now. Be direct, specific, 1-2 sentences max. No fluff.\n\n${context}` }]
                  })
                });
                const d = await res.json();
                setWhatNextResult(d.content?.[0]?.text || "Keep going — you're on track!");
              } catch { setWhatNextResult("Check your campaign status and make sure all emails are scheduled."); }
              finally { setWhatNextLoading(false); }
            }} className="what-next-btn" style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, padding:"6px 14px", borderRadius:7, border:`1px solid ${C.blue}50`, background:`${C.blue}12`, color:C.blue, cursor:"pointer", fontWeight:600, whiteSpace:"nowrap" }}>
              {whatNextLoading ? <><Spin />Thinking…</> : "🧠 What next?"}
            </button>
            {whatNextResult && (
              <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, width:"min(320px, calc(100vw - 24px))", background:C.card, border:`1px solid ${C.blue}40`, borderRadius:10, padding:"14px 16px", zIndex:50, boxShadow:"0 8px 32px rgba(0,0,0,.5)", animation:"fadeUp .2s ease" }}>
                <div style={{ fontSize:10, fontWeight:700, color:C.blue, letterSpacing:"1px", marginBottom:8 }}>🧠 AI RECOMMENDS</div>
                <div style={{ fontSize:13, color:C.text, lineHeight:1.6 }}>{whatNextResult}</div>
                <button onClick={() => setWhatNextResult(null)} style={{ marginTop:10, fontSize:11, color:C.muted, background:"transparent", border:"none", cursor:"pointer", padding:0 }}>Dismiss ×</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Go Live checklist replaced by StoryBar above */}

      {/* ── SMART NUDGES — proactive AI watching your campaign ── */}
      {activeEvent && (() => {
        const nudges = [];
        const sentCount = campaigns.filter(c=>c.status==="sent").length;
        const pendingCount = metrics?.total_pending || 0;
        const openRate = metrics?.total_sent>0 ? Math.round((metrics.total_opened/metrics.total_sent)*100) : null;
        const scheduledCount = campaigns.filter(c=>c.status==="scheduled").length;

        if (sentCount===0 && campaigns.length>0)
          nudges.push({ icon:"📧", color:C.blue, msg:`You have ${campaigns.length} email draft${campaigns.length>1?"s":""} ready — approve in Step 1 then schedule.`, cta:null, action:null });

        if (openRate !== null && openRate < 25 && sentCount > 0)
          nudges.push({ icon:"⚠️", color:C.amber, msg:`${openRate}% open rate is below average. Consider updating your subject line in Step 1.`, cta:null, action:null });

        if (pendingCount > 0 && daysToEvent !== null && daysToEvent <= 7 && daysToEvent > 0)
          nudges.push({ icon:"⏰", color:C.red, msg:`${pendingCount} contacts haven't responded — event is in ${daysToEvent} day${daysToEvent===1?"":"s"}.`, cta:null, action:null });
        else if (pendingCount > 10 && daysToEvent !== null && daysToEvent <= 14)
          nudges.push({ icon:"📣", color:C.amber, msg:`${pendingCount} contacts are still pending. A reminder email could improve your confirmation rate.`, cta:null, action:null });

        if (contacts.length === 0 && activeEvent)
          nudges.push({ icon:"👥", color:C.blue, msg:"No contacts imported yet. Add your guest list to start tracking RSVPs.", cta:"Add contacts →", action:()=>setView("contacts") });

        if (openRate !== null && openRate >= 65 && sentCount > 0)
          nudges.push({ icon:"🎉", color:C.green, msg:`${openRate}% open rate — that's exceptional! Your subject lines are working really well.`, cta:null, action:null });

        if (!nudges.length) return null;
        return (
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
            {nudges.slice(0,2).map((n, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", background:`${n.color}08`, border:`1px solid ${n.color}25`, borderRadius:9, animation:"fadeUp .3s ease" }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{n.icon}</span>
                <div style={{ flex:1, fontSize:12.5, color:C.sec, lineHeight:1.5 }}>{n.msg}</div>
                {n.cta && n.action && (
                  <button onClick={n.action} style={{ fontSize:11.5, fontWeight:600, color:n.color, background:"transparent", border:`1px solid ${n.color}40`, borderRadius:6, padding:"4px 10px", cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>{n.cta}</button>
                )}
              </div>
            ))}
          </div>
        );
      })()}

      {/* ─── CAMPAIGN HEALTH SCORE ─── */}
      {activeEvent && campaigns.length > 0 && (() => {
        let score = 0;
        const reasons = [];
        const draftedTypes = new Set(campaigns.map(c => c.email_type)).size;
        score += Math.min(20, draftedTypes * 4);
        if (draftedTypes < 3) reasons.push({ text:`Only ${draftedTypes} email type${draftedTypes===1?"":"s"} drafted`, color:C.amber });
        const sentCount = campaigns.filter(c => c.status === "sent").length;
        score += Math.min(20, sentCount * 5);
        if (sentCount === 0) reasons.push({ text:"No emails sent yet", color:C.red });
        const openRate = metrics?.total_sent > 0 ? (metrics.total_opened / metrics.total_sent) : 0;
        score += Math.round(openRate * 25);
        if (metrics?.total_sent > 0 && openRate === 0) reasons.push({ text:"0% open rate — no opens recorded yet", color:C.red });
        else if (openRate > 0 && openRate < 0.3) reasons.push({ text:`${Math.round(openRate*100)}% open rate — below average`, color:C.amber });
        else if (openRate >= 0.5) reasons.push({ text:`${Math.round(openRate*100)}% open rate — excellent`, color:C.green });
        score += contacts.length > 0 ? Math.min(15, Math.floor(contacts.length/5)*3) : 0;
        if (contacts.length === 0) reasons.push({ text:"No contacts imported", color:C.red });
        if (formShareLink) score += 10;
        else reasons.push({ text:"No landing page live", color:C.muted });
        score += Math.round((contacts.length > 0 ? (metrics?.total_confirmed||0)/contacts.length : 0) * 10);
        score = Math.min(100, score);
        const health = score >= 80 ? {label:"Strong",color:C.green} : score >= 60 ? {label:"On track",color:C.blue} : score >= 40 ? {label:"Needs attention",color:C.amber} : {label:"At risk",color:C.red};
        return (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 16px", marginBottom:12, display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ position:"relative", width:56, height:56, flexShrink:0 }}>
              <svg width="56" height="56" style={{ transform:"rotate(-90deg)" }}>
                <circle cx="28" cy="28" r="22" fill="none" stroke={C.raised} strokeWidth="5" />
                <circle cx="28" cy="28" r="22" fill="none" stroke={health.color} strokeWidth="5"
                  strokeDasharray={`${2*Math.PI*22}`} strokeDashoffset={`${2*Math.PI*22*(1-score/100)}`}
                  strokeLinecap="round" style={{ transition:"stroke-dashoffset .8s ease" }} />
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:14, fontWeight:800, color:health.color }}>{score}</span>
              </div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                <span style={{ fontSize:12.5, fontWeight:700, color:C.text }}>Campaign Health</span>
                <span style={{ fontSize:10.5, fontWeight:700, color:health.color, background:`${health.color}15`, padding:"1px 8px", borderRadius:4 }}>{health.label}</span>
              </div>
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                {reasons.length===0 && score >= 80
                  ? <span style={{ fontSize:11, color:C.green }}>● Campaign is firing on all cylinders</span>
                  : reasons.length===0 && score >= 60
                  ? <span style={{ fontSize:11, color:C.blue }}>● Looking good — keep building momentum</span>
                  : reasons.length===0
                  ? <span style={{ fontSize:11, color:C.amber }}>● Add more details to improve your score</span>
                  : reasons.slice(0,3).map((r,i) => <span key={i} style={{ fontSize:11, color:r.color }}>● {r.text}</span>)
                }
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── METRICS CARDS GRID ─── */}
      {activeEvent && campaigns.filter(c => c.status === "sent").length === 0 && campaigns.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 28 }}>📊</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>No emails sent yet</div>
            <div style={{ fontSize: 12, color: C.muted }}>Metrics will populate here once your first email is sent. Approve your emails in Step 1, then schedule them in Step 4.</div>
          </div>
        </div>
      )}
      {activeEvent && campaigns.filter(c => c.status === "sent").length > 0 && (
        <div className="metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Emails Sent", val: metrics?.total_sent || 0, sub: (() => { const sched = campaigns.filter(c => c.status === "scheduled").length; if (sched > 0) return `${sched} scheduled`; const last = campaigns.filter(c => c.status === "sent" && c.sent_at).sort((a,b) => new Date(b.sent_at)-new Date(a.sent_at))[0]; if (!last) return "No sends yet"; const d = Math.round((new Date()-new Date(last.sent_at))/(1000*60*60*24)); return d === 0 ? "sent today" : `${d}d ago`; })(), color: C.blue, icon: "📧", action: null, pct: null },
            { label: "Confirmed", val: metrics?.total_confirmed || 0, sub: contacts.length > 0 ? `of ${contacts.length} invited` : "awaiting RSVPs", color: C.green, icon: "✅", action: () => setView("contacts"), pct: contacts.length > 0 ? Math.round(((metrics?.total_confirmed||0)/contacts.length)*100) : 0 },
            { label: "Pending", val: metrics?.total_pending || 0, sub: metrics?.total_pending > 0 ? "need a nudge?" : "all responded", color: C.amber, icon: "⏳", action: () => setView("contacts"), pct: contacts.length > 0 ? Math.round(((metrics?.total_pending||0)/contacts.length)*100) : 0 },
            { label: "Attended", val: metrics?.total_attended || 0, sub: metrics?.total_confirmed > 0 ? `${Math.round((metrics.total_attended / metrics.total_confirmed) * 100)}% show rate` : "event day", color: C.teal, icon: "🎟", action: () => setView("checkin"), pct: (metrics?.total_confirmed||0) > 0 ? Math.round(((metrics?.total_attended||0)/(metrics?.total_confirmed||1))*100) : 0 },
          ].map(m => (
            <div key={m.label} onClick={m.action} className="metric-card"
              style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px", cursor: "pointer", position: "relative", overflow: "hidden", boxShadow: `0 1px 3px rgba(0,0,0,.3)` }}>
              {/* Top accent line */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${m.color},${m.color}00)` }} />
              {/* Background icon watermark */}
              <div style={{ position: "absolute", bottom: 8, right: 12, fontSize: 32, opacity: 0.07, userSelect: "none" }}>{m.icon}</div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 8 }}>{m.label}</div>
              <div style={{ fontSize: 34, fontWeight: 800, color: m.color, letterSpacing: "-1.5px", lineHeight: 1, marginBottom: 6 }}>
                {loading ? <span style={{ opacity:.3 }}>—</span> : m.val.toLocaleString()}
              </div>
              {m.pct !== null && m.pct > 0 && (
                <div style={{ height: 3, background: C.raised, borderRadius: 99, marginBottom: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(m.pct,100)}%`, background: m.color, borderRadius: 99, transition: "width .6s ease" }} />
                </div>
              )}
              {m.sub && <div style={{ fontSize: 10.5, color: C.muted, lineHeight: 1.3 }}>{m.sub}</div>}
            </div>
          ))}
        </div>
      )}

      {/* ─── GUEST LIST WITH BULK ACTIONS ─── */}
      {activeEvent && loading && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:11, padding:"20px 16px", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
            <div style={{ width:80, height:14, background:C.raised, borderRadius:4 }} />
          </div>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:`1px solid ${C.border}`, alignItems:"center" }}>
              <div style={{ width:16, height:16, background:C.raised, borderRadius:3 }} />
              <div style={{ flex:2, height:13, background:C.raised, borderRadius:4 }} />
              <div style={{ flex:1.5, height:12, background:C.raised, borderRadius:4, opacity:0.6 }} />
              <div style={{ width:64, height:20, background:C.raised, borderRadius:999 }} />
            </div>
          ))}
        </div>
      )}
      {activeEvent && !loading && contacts.length > 0 && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:11, overflow:"hidden", marginBottom:16 }}>
          {/* Header + filter tabs */}
          <div style={{ padding:"11px 14px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span style={{ fontSize:13, fontWeight:600, color:C.text, marginRight:4 }}>Guest List</span>
            {["all","pending","confirmed","attended","declined"].map(f => {
              const count = f === "all" ? contacts.length : contacts.filter(c => c.status === f).length;
              return (
                <button key={f} onClick={() => setFilt(f)}
                  style={{ fontSize:11, padding:"3px 10px", borderRadius:5, border:`1px solid ${filt===f?(f==="pending"?C.amber:f==="confirmed"?C.green:f==="attended"?C.teal:f==="declined"?C.red:C.blue):C.border}`, background:filt===f?`${f==="pending"?C.amber:f==="confirmed"?C.green:f==="attended"?C.teal:f==="declined"?C.red:C.blue}15`:"transparent", color:filt===f?(f==="pending"?C.amber:f==="confirmed"?C.green:f==="attended"?C.teal:f==="declined"?C.red:C.blue):C.muted, cursor:"pointer", fontWeight:filt===f?600:400 }}>
                  {f === "all" ? "All" : f.charAt(0).toUpperCase()+f.slice(1)} ({count})
                </button>
              );
            })}
            <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
              <button onClick={() => setView("contacts")} style={{ fontSize:11, padding:"3px 10px", borderRadius:5, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>
                Manage all →
              </button>
            </div>
          </div>

          {/* Bulk action bar — shown when rows selected */}
          {selectedRows.size > 0 && (
            <div style={{ padding:"8px 14px", background:`${C.blue}10`, borderBottom:`1px solid ${C.blue}25`, display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <span style={{ fontSize:12, fontWeight:600, color:C.blue }}>{selectedRows.size} selected</span>
              <button onClick={async () => {
                const ids = [...selectedRows];
                await supabase.from("event_contacts").update({ status:"confirmed", confirmed_at:new Date().toISOString() }).in("id", ids);
                setContacts(p => p.map(ec => ids.includes(ec.id) ? { ...ec, status:"confirmed", confirmed_at:new Date().toISOString() } : ec));
                setSelectedRows(new Set());
                fire(`✅ ${ids.length} marked confirmed`);
              }} style={{ fontSize:11, padding:"4px 10px", borderRadius:5, border:`1px solid ${C.green}40`, background:`${C.green}12`, color:C.green, cursor:"pointer", fontWeight:500 }}>
                ✅ Mark Confirmed
              </button>
              <button onClick={async () => {
                const ids = [...selectedRows];
                await supabase.from("event_contacts").update({ status:"attended", attended_at:new Date().toISOString() }).in("id", ids);
                setContacts(p => p.map(ec => ids.includes(ec.id) ? { ...ec, status:"attended", attended_at:new Date().toISOString() } : ec));
                setSelectedRows(new Set());
                fire(`✅ ${ids.length} marked attended`);
              }} style={{ fontSize:11, padding:"4px 10px", borderRadius:5, border:`1px solid ${C.teal}40`, background:`${C.teal}12`, color:C.teal, cursor:"pointer", fontWeight:500 }}>
                🎟 Mark Attended
              </button>
              <button onClick={async () => {
                const ids = [...selectedRows];
                const targets = contacts.filter(ec => ids.includes(ec.id) && ec.contacts?.email);
                if (!targets.length) { fire("No valid emails in selection","err"); return; }
                fire(`📧 Sending reminder to ${targets.length} contacts…`);
                const { data:{ session } } = await supabase.auth.getSession();
                const res = await fetch(`${SUPABASE_URL}/functions/v1/send-triggered-email`, {
                  method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${session?.access_token}`},
                  body: JSON.stringify({ contacts: targets.map(ec => ec.contacts), triggerType:"reminder", eventName:activeEvent.name, eventDate:activeEvent.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU",{day:"numeric",month:"long",year:"numeric"}) : "", location:activeEvent.location||"", orgName:profile?.companies?.from_name||profile?.companies?.name||"evara" })
                });
                const d = await res.json();
                setSelectedRows(new Set());
                fire(d.sent > 0 ? `✅ Reminder sent to ${d.sent} contacts` : "Send failed", d.sent > 0 ? "ok" : "err");
              }} style={{ fontSize:11, padding:"4px 10px", borderRadius:5, border:`1px solid ${C.amber}40`, background:`${C.amber}12`, color:C.amber, cursor:"pointer", fontWeight:500 }}>
                ⏰ Send Reminder
              </button>
              <button onClick={async () => {
                const ids = [...selectedRows];
                await supabase.from("event_contacts").update({ status:"declined" }).in("id", ids);
                setContacts(p => p.map(ec => ids.includes(ec.id) ? { ...ec, status:"declined" } : ec));
                setSelectedRows(new Set());
                fire(`${ids.length} marked declined`);
              }} style={{ fontSize:11, padding:"4px 10px", borderRadius:5, border:`1px solid ${C.red}30`, background:"transparent", color:C.red, cursor:"pointer" }}>
                ✗ Mark Declined
              </button>
              <button onClick={() => setSelectedRows(new Set())} style={{ fontSize:11, padding:"4px 8px", borderRadius:5, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer", marginLeft:"auto" }}>
                Clear
              </button>
            </div>
          )}

          {/* Table */}
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ background:C.raised, borderBottom:`1px solid ${C.border}` }}>
                  <th style={{ padding:"7px 12px", width:32 }}>
                    <input type="checkbox"
                      checked={rows.length > 0 && selectedRows.size === rows.length}
                      onChange={() => toggleAll(rows)}
                      style={{ cursor:"pointer", accentColor:C.blue }} />
                  </th>
                  {["Name","Company","Status","Score",""].map(h => (
                    <th key={h} style={{ padding:"7px 10px", textAlign:"left", color:C.muted, fontWeight:600, fontSize:10, textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map(ec => {
                  const c = ec.contacts || {};
                  const scoreData = scores[c.id] || {};
                  const statusColor = ec.status==="confirmed"?C.green:ec.status==="attended"?C.teal:ec.status==="declined"?C.red:C.amber;
                  const isSelected = selectedRows.has(ec.id);
                  return (
                    <tr key={ec.id} style={{ borderBottom:`1px solid ${C.border}`, background:isSelected?`${C.blue}06`:"transparent", transition:"background .1s" }}
                      onMouseEnter={e=>{ if(!isSelected) e.currentTarget.style.background=C.raised; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background=isSelected?`${C.blue}06`:"transparent"; }}>
                      <td style={{ padding:"7px 12px" }} onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleRow(ec.id)}
                          style={{ cursor:"pointer", accentColor:C.blue }} />
                      </td>
                      <td style={{ padding:"7px 10px", cursor:"pointer" }} onClick={() => setSelectedContact(ec)}>
                        <div style={{ fontWeight:500, color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:160 }}>
                          {[c.first_name, c.last_name].filter(Boolean).join(" ") || c.email || "Unknown"}
                        </div>
                        <div style={{ fontSize:10.5, color:C.muted, overflow:"hidden", textOverflow:"ellipsis", maxWidth:160 }}>{c.email}</div>
                      </td>
                      <td className="guest-col-company" style={{ padding:"7px 10px", color:C.muted, fontSize:11, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:120 }}>
                        {c.company_name || "—"}
                      </td>
                      <td style={{ padding:"7px 10px" }}>
                        <span onClick={async (e) => {
                          e.stopPropagation();
                          const cycle = { pending:"confirmed", confirmed:"attended", attended:"declined", declined:"pending" };
                          const next = cycle[ec.status || "pending"] || "pending";
                          await supabase.from("event_contacts").update({ status:next, ...(next==="confirmed"?{confirmed_at:new Date().toISOString()}:{}) }).eq("id", ec.id);
                          setContacts(p => p.map(x => x.id===ec.id ? {...x, status:next} : x));
                          fire(`${c.first_name||c.email} → ${next}`);
                        }} title="Click to change status" style={{ fontSize:10.5, padding:"2px 8px", borderRadius:999, fontWeight:600, textTransform:"capitalize", background:statusColor+"18", color:statusColor, cursor:"pointer", userSelect:"none" }}>
                          {ec.status || "pending"}
                        </span>
                      </td>
                      <td className="guest-col-score" style={{ padding:"7px 10px" }}>
                      </td>
                      <td style={{ padding:"7px 10px" }}>
                        <div style={{ display:"flex", gap:5, alignItems:"center" }}>
                          <button onClick={() => setSelectedContact(ec)} style={{ fontSize:10.5, padding:"2px 8px", borderRadius:4, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>
                            View →
                          </button>
                          {c.phone && (
                            <a href={`tel:${c.phone}`} style={{ fontSize:10.5, padding:"2px 6px", borderRadius:4, border:`1px solid ${C.green}30`, background:`${C.green}08`, color:C.green, textDecoration:"none" }}
                              title={`Call ${c.phone}`}>📞</a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length > 50 && (
              <div style={{ padding:"10px 14px", textAlign:"center", fontSize:12, color:C.muted, borderTop:`1px solid ${C.border}` }}>
                Showing 50 of {rows.length} — <span onClick={() => setView("contacts")} style={{ color:C.blue, cursor:"pointer" }}>View all in Contacts →</span>
              </div>
            )}
            {rows.length === 0 && (
              <div style={{ padding:"24px", textAlign:"center", color:C.muted, fontSize:13 }}>
                No contacts match this filter
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── CONTACT PROFILE SIDE PANEL ─── */}
      {selectedContact && (() => {
        const c = selectedContact.contacts || {};
        const scoreData = scores[c.id] || {};
        const tempColor = scoreData.temp === "hot" ? C.red : scoreData.temp === "warm" ? C.amber : scoreData.temp === "cool" ? C.blue : C.muted;
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex" }} onClick={() => setSelectedContact(null)}>
            <div style={{ flex: 1, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)" }} />
            <div className="contact-panel" style={{ width: 360, background: C.card, borderLeft: `1px solid ${C.border}`, height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", animation: "slideRight .2s ease" }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "1px" }}>Contact Profile</span>
                <button onClick={() => setSelectedContact(null)} style={{ background: C.raised, border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, cursor: "pointer", fontSize: 16, lineHeight: 1, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>
              <div style={{ padding: "24px 20px 18px", textAlign: "center", borderBottom: `1px solid ${C.border}`, background: `linear-gradient(180deg,${C.raised},${C.card})` }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: `linear-gradient(135deg,${C.blue}50,${C.teal}30)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 12px", fontWeight: 800, color: C.blue, border: `2px solid ${C.blue}25`, boxShadow: `0 4px 16px ${C.blue}20` }}>
                  {(c.first_name?.[0] || c.email?.[0] || "?").toUpperCase()}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: "-0.3px" }}>{c.first_name} {c.last_name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
                  onClick={() => { navigator.clipboard?.writeText(c.email || ""); fire("📋 Email copied"); }}
                  title="Click to copy">
                  {c.email} <span style={{ opacity: 0.5, fontSize: 10 }}>📋</span>

                </div>
                {(c.job_title || c.company_name) && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{[c.job_title, c.company_name].filter(Boolean).join(" · ")}</div>}
                <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10.5, padding: "2px 9px", borderRadius: 999, fontWeight: 600, textTransform: "capitalize", background: selectedContact.status === "confirmed" ? C.green + "20" : selectedContact.status === "declined" ? C.red + "20" : C.raised, color: selectedContact.status === "confirmed" ? C.green : selectedContact.status === "declined" ? C.red : C.muted }}>
                    {selectedContact.status || "pending"}
                  </span>
                  {scoreData.score > 0 && <span style={{ fontSize: 10.5, padding: "2px 9px", borderRadius: 999, background: tempColor + "20", color: tempColor, fontWeight: 600 }}>{scoreData.temp} · {scoreData.score}pts</span>}
                </div>
              </div>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px" }}>Details</div>
                  {!editingContactFields ? (
                    <button onClick={() => { setEditingContactFields(true); setContactEditForm({ first_name: c.first_name||"", last_name: c.last_name||"", phone: c.phone||"", company_name: c.company_name||"", job_title: c.job_title||"", linkedin_url: c.linkedin_url||"" }); }}
                      style={{ fontSize:11, padding:"2px 9px", borderRadius:5, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>
                      Edit
                    </button>
                  ) : (
                    <div style={{ display:"flex", gap:5 }}>
                      <button onClick={() => setEditingContactFields(false)} style={{ fontSize:11, padding:"2px 9px", borderRadius:5, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>Cancel</button>
                      <button disabled={savingContact} onClick={async () => {
                        setSavingContact(true);
                        await supabase.from("contacts").update(contactEditForm).eq("id", c.id);
                        setContacts(p => p.map(ec => ec.id === selectedContact.id ? { ...ec, contacts: { ...ec.contacts, ...contactEditForm } } : ec));
                        setSelectedContact(p => ({ ...p, contacts: { ...p.contacts, ...contactEditForm } }));
                        setEditingContactFields(false);
                        setSavingContact(false);
                        fire("✅ Contact updated");
                      }} style={{ fontSize:11, padding:"2px 9px", borderRadius:5, border:"none", background:C.blue, color:"#fff", cursor:"pointer", fontWeight:600 }}>
                        {savingContact ? "Saving…" : "Save"}
                      </button>
                    </div>
                  )}
                </div>
                {editingContactFields ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                    {[
                      { key:"first_name", label:"First name", ph:"Jane" },
                      { key:"last_name",  label:"Last name",  ph:"Smith" },
                      { key:"phone",      label:"Phone",      ph:"+61 400 000 000" },
                      { key:"company_name", label:"Company",  ph:"Acme Corp" },
                      { key:"job_title",  label:"Job title",  ph:"Head of Marketing" },
                      { key:"linkedin_url",label:"LinkedIn",  ph:"linkedin.com/in/..." },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ display:"block", fontSize:10, color:C.muted, marginBottom:2 }}>{f.label}</label>
                        <input value={contactEditForm[f.key]||""} onChange={e => setContactEditForm(p => ({...p,[f.key]:e.target.value}))}
                          placeholder={f.ph}
                          style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:5, color:C.text, padding:"5px 8px", fontSize:12, outline:"none", boxSizing:"border-box" }}
                          onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {[
                      { label: "Email", val: c.email }, { label: "Phone", val: c.phone },
                      { label: "Company", val: c.company_name }, { label: "Title", val: c.job_title },
                      { label: "LinkedIn", val: c.linkedin_url },
                      { label: "Registered", val: selectedContact.created_at ? new Date(selectedContact.created_at).toLocaleDateString("en-AU") : null },
                      { label: "Confirmed", val: selectedContact.confirmed_at ? new Date(selectedContact.confirmed_at).toLocaleDateString("en-AU") : null },
                    ].filter(f => f.val).map(f => (
                      <div key={f.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11.5, color: C.muted }}>{f.label}</span>
                        <span style={{ fontSize: 11.5, color: C.text, maxWidth:160, textAlign:"right", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.val}</span>
                      </div>
                    ))}
                    {![c.email,c.phone,c.company_name,c.job_title].some(Boolean) && (
                      <div style={{ fontSize:11, color:C.muted, fontStyle:"italic" }}>No details — click Edit to add</div>
                    )}
                  </>
                )}
              </div>
              <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 7 }}>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Actions</div>
                {selectedContact.status !== "confirmed" && (
                  <button onClick={async () => {
                    await supabase.from("event_contacts").update({ status: "confirmed", confirmed_at: new Date().toISOString() }).eq("id", selectedContact.id);
                    setContacts(p => p.map(ec => ec.id === selectedContact.id ? { ...ec, status: "confirmed", confirmed_at: new Date().toISOString() } : ec));
                    setSelectedContact(p => ({ ...p, status: "confirmed" }));
                    fire("✅ Marked confirmed");
                  }} style={{ padding: "8px 12px", background: C.green + "14", border: `1px solid ${C.green}30`, borderRadius: 6, color: C.green, cursor: "pointer", fontSize: 12, fontWeight: 500, textAlign: "left" }}>
                    ✅ Mark Confirmed
                  </button>
                )}
                {selectedContact.status !== "attended" && (
                  <button onClick={async () => {
                    await supabase.from("event_contacts").update({ status: "attended", attended_at: new Date().toISOString() }).eq("id", selectedContact.id);
                    setContacts(p => p.map(ec => ec.id === selectedContact.id ? { ...ec, status: "attended", attended_at: new Date().toISOString() } : ec));
                    setSelectedContact(p => ({ ...p, status: "attended" }));
                    fire("✅ Marked attended");
                  }} style={{ padding: "8px 12px", background: C.blue + "14", border: `1px solid ${C.blue}30`, borderRadius: 6, color: C.blue, cursor: "pointer", fontSize: 12, fontWeight: 500, textAlign: "left" }}>
                    📍 Mark Attended
                  </button>
                )}
                <button onClick={async () => {
                  const { data: { session } } = await supabase.auth.getSession();
                  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-triggered-email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
                    body: JSON.stringify({ contacts: [c], triggerType: "confirmation", eventName: activeEvent.name, eventDate: activeEvent.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "", location: activeEvent.location || "", orgName: profile?.companies?.from_name || profile?.companies?.name || "evara" })
                  });
                  const d = await res.json();
                  fire(d.sent > 0 ? `✅ Confirmation sent to ${c.email}` : `Send failed`, d.sent > 0 ? "ok" : "err");
                }} style={{ padding: "8px 12px", background: C.raised, border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, cursor: "pointer", fontSize: 12, textAlign: "left" }}>
                  ✉️ Send Confirmation
                </button>
                <button onClick={async () => {
                  const { data: { session } } = await supabase.auth.getSession();
                  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-triggered-email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
                    body: JSON.stringify({ contacts: [c], triggerType: "reminder", eventName: activeEvent.name, eventDate: activeEvent.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "", location: activeEvent.location || "", orgName: profile?.companies?.from_name || profile?.companies?.name || "evara", eventUrl: formShareLink || "" })
                  });
                  const d = await res.json();
                  fire(d.sent > 0 ? `✅ Reminder sent to ${c.email}` : "Send failed", d.sent > 0 ? "ok" : "err");
                }} style={{ padding: "8px 12px", background: C.raised, border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, cursor: "pointer", fontSize: 12, textAlign: "left" }}>
                  ⏰ Send Reminder
                </button>
                <button onClick={async () => {
                  // confirmed
                  await supabase.from("event_contacts").delete().eq("id", selectedContact.id);
                  setContacts(p => p.filter(ec => ec.id !== selectedContact.id));
                  setSelectedContact(null);
                  fire("Removed from event");
                }} style={{ padding: "8px 12px", background: "transparent", border: `1px solid ${C.red}30`, borderRadius: 6, color: C.red, cursor: "pointer", fontSize: 12, textAlign: "left" }}>
                  🗑️ Remove from event
                </button>
              </div>
              {/* Tags */}
              <div style={{ padding: "10px 18px", borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Tags</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>
                  {(c.tags || []).map(tag => (
                    <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, padding: "2px 8px", borderRadius: 999, background: C.raised, border: `1px solid ${C.border}`, color: C.text }}>
                      {tag}
                      <button onClick={async () => {
                        const newTags = (c.tags||[]).filter(t => t !== tag);
                        await supabase.from("contacts").update({ tags: newTags }).eq("id", c.id);
                        setSelectedContact(p => ({ ...p, contacts: { ...p.contacts, tags: newTags } }));
                        fire("Tag removed");
                      }} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 12, lineHeight: 1, padding: 0 }}>×</button>
                    </span>
                  ))}
                  {/* Inline tag input — no window.prompt */}
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const input = e.currentTarget.querySelector("input");
                    const tag = input?.value?.trim().toLowerCase();
                    if (!tag) return;
                    const newTags = [...new Set([...(c.tags||[]), tag])];
                    await supabase.from("contacts").update({ tags: newTags }).eq("id", c.id);
                    setSelectedContact(p => ({ ...p, contacts: { ...p.contacts, tags: newTags } }));
                    input.value = "";
                    fire(`Tag "${tag}" added`);
                  }} style={{ display:"inline-flex", alignItems:"center" }}>
                    <input placeholder="+ tag" maxLength={20}
                      style={{ width:52, fontSize:11, padding:"2px 7px", borderRadius:999, background:"transparent", border:`1px dashed ${C.border}`, color:C.muted, outline:"none", fontFamily:"inherit" }}
                      onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                  </form>
                </div>
              </div>
              {/* Notes */}
              <div style={{ padding: "12px 18px", borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Notes</div>
                <textarea
                  placeholder="Private note about this contact..."
                  defaultValue={selectedContact.notes || ""}
                  onBlur={async (e) => {
                    await supabase.from("event_contacts").update({ notes: e.target.value }).eq("id", selectedContact.id);
                    fire("Note saved");
                  }}
                  style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: "7px 9px", fontSize: 12, outline: "none", resize: "vertical", minHeight: 56, fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>
              {/* Contact Journey Timeline */}
              <div style={{ padding:"14px 18px", borderTop:`1px solid ${C.border}` }}>
                <div style={{ fontSize:9.5, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:12 }}>📍 Contact Journey</div>
                <EmailActivityTimeline supabase={supabase} contactId={c.id} eventId={activeEvent?.id} contact={c} eventContact={selectedContact} />
              </div>
            </div>
          </div>
        );
      })()}

      {showHelp && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}
          onClick={() => setShowHelp(false)}>
          <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, padding:28, width:560, animation:"fadeUp .2s ease", maxHeight:"88vh", overflowY:"auto" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
              <div>
                <h2 style={{ fontSize:17, fontWeight:700, color:C.text, margin:0, marginBottom:3 }}>⌨️ Shortcuts & Tips</h2>
                <p style={{ fontSize:12, color:C.muted, margin:0 }}>Everything you can do faster with evara</p>
              </div>
              <button onClick={() => setShowHelp(false)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:22, lineHeight:1 }}>×</button>
            </div>

            {/* Keyboard shortcuts */}
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:10 }}>Keyboard Shortcuts</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:22 }}>
              {[
                ["⌘K","Focus search / filter contacts"],
                ["⌘N","Create new event"],
                ["⌘,","Open settings"],
                ["?","Toggle this help panel"],
                ["Esc","Close modals & side panels"],
                ["⌘S","Save draft in eDM Builder"],
                ["⌘⇧D","Go to Dashboard"],
                ["⌘⇧E","Go to eDM Builder"],
                ["⌘⇧C","Go to Contacts"],
                ["⌘1–9","Navigate modules by number"],
              ].map(([key, desc]) => (
                <div key={key} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", background:C.raised, borderRadius:7 }}>
                  <kbd style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:5, padding:"2px 8px", fontSize:11, fontFamily:"monospace", color:C.blue, flexShrink:0, fontWeight:600 }}>{key}</kbd>
                  <span style={{ fontSize:12, color:C.sec }}>{desc}</span>
                </div>
              ))}
            </div>

            {/* Power user tips */}
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:10 }}>Power User Tips</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:22 }}>
              {[
                {icon:"🖱",tip:"Click any contact row to open their full profile side panel"},
                {icon:"☑️",tip:"Tick checkboxes in Contacts to bulk-email, export, or delete"},
                {icon:"🤖",tip:"eDM Builder: AI writes a full polished email in ~15 seconds"},
                {icon:"📅",tip:"Calendar: click any date to see what emails and events are that day"},
                {icon:"📊",tip:"Analytics: click 'Share' to get a read-only link for stakeholders"},
                {icon:"🎪",tip:"Check-in: copy the Kiosk URL — guests scan QR at the venue door"},
                {icon:"🎉",tip:"Post-event: use Scheduling → Post-event Follow-ups after event day"},
                {icon:"⚙️",tip:"Settings → Brand Kit: set your logo, colour and sender name once"},
              ].map(({icon,tip}) => (
                <div key={tip} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"8px 10px", background:C.raised, borderRadius:7 }}>
                  <span style={{ fontSize:15, flexShrink:0 }}>{icon}</span>
                  <span style={{ fontSize:12, color:C.sec, lineHeight:1.5 }}>{tip}</span>
                </div>
              ))}
            </div>

            {/* Module reference */}
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:10 }}>Module Reference</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6 }}>
              {[
                {n:"Dashboard",d:"RSVP statuses, contact actions"},
                {n:"eDM Builder",d:"AI email generation"},
                {n:"Scheduling",d:"Schedule & send campaigns"},
                {n:"Analytics",d:"Opens, clicks, attendance"},
                {n:"Contacts",d:"Guest list management"},
                {n:"Landing Pages",d:"Event microsite builder"},
                {n:"Forms",d:"RSVP & registration forms"},
                {n:"Check-in",d:"Day-of attendance tracking"},
                {n:"Calendar",d:"Timeline of events & emails"},
              ].map(({n,d}) => (
                <div key={n} style={{ padding:"8px 10px", background:C.raised, borderRadius:7 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:2 }}>{n}</div>
                  <div style={{ fontSize:10.5, color:C.muted }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* ─── EDIT EVENT MODAL ─── */}
      {showEditEvent && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99 }}>
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28, width: 480, animation: "fadeUp .2s ease" }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: C.text, marginBottom: 20 }}>Edit event</h2>
            {[
              { key: "name", label: "Event name *", ph: "e.g. Tech Summit 2026", type: "text" },
              { key: "event_date", label: "Date", ph: "", type: "date" },
              { key: "event_time", label: "Time", ph: "e.g. 6:30 PM", type: "text" },
              { key: "location", label: "Venue / Location", ph: "e.g. The Ritz-Carlton", type: "text" },
              { key: "expected_attendees", label: "Expected attendees", ph: "e.g. 150", type: "text" },
              { key: "description", label: "Description", ph: "Brief description of the event", type: "text" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 11.5, color: C.muted, marginBottom: 4 }}>{f.label}</label>
                <input type={f.type} value={editForm[f.key] ?? activeEvent[f.key] ?? ""} placeholder={f.ph}
                  onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11.5, color: C.muted, marginBottom: 4 }}>Status</label>
              <select value={editForm.status ?? activeEvent.status ?? "draft"}
                onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, padding: "8px 12px", fontSize: 13, outline: "none", cursor: "pointer" }}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={async () => {
                const updates = { ...editForm };
                if (!updates.name && !activeEvent.name) { fire("Event name required", "err"); return; }
                const { error } = await supabase.from("events").update(updates).eq("id", activeEvent.id);
                if (error) { fire(error.message, "err"); return; }
                setActiveEvent(p => ({ ...p, ...updates }));
                setShowEditEvent(false);
                setEditForm({});
                fire("✅ Event updated");
              }} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: C.blue, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                Save changes
              </button>
              <button onClick={() => { setShowEditEvent(false); setEditForm({}); }}
                style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", fontSize: 14 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddContact && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28, width: 420, animation: "fadeUp .2s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: C.text }}>Add contact</h2>
              <button onClick={() => { setShowAddContact(false); setNewContact({ email: "", first_name: "", last_name: "", phone: "", company_name: "" }); }} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer" }}><X size={16} /></button>
            </div>
            <div style={{ marginBottom: 14, padding: "10px 12px", background: C.bg, borderRadius: 7, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.6px" }}>Quick add — paste emails (one per line)</div>
              <textarea placeholder={"alice@acme.com\nbob@corp.com"} rows={2}
                onBlur={async (e) => {
                  const emails = e.target.value.split(/[\n\r,;]+/).map(s => s.trim().toLowerCase()).filter(s => s.includes("@"));
                  if (!emails.length) return;
                  let added = 0;
                  for (const email of emails) {
                    const { data: c } = await supabase.from("contacts").upsert({ email, company_id: profile.company_id, source: "manual" }, { onConflict: "email,company_id" }).select().single();
                    if (c) { await supabase.from("event_contacts").upsert({ event_id: activeEvent.id, contact_id: c.id, company_id: profile.company_id, status: "pending" }, { onConflict: "event_id,contact_id", ignoreDuplicates: true }); added++; }
                  }
                  if (added) {
                    fire(`✅ ${added} contact${added !== 1 ? "s" : ""} added!`);
                    e.target.value = "";
                    const { data: fresh } = await supabase.from("event_contacts").select("*,contacts(*)").eq("event_id", activeEvent.id).order("created_at", { ascending: false });
                    if (fresh) setContacts(fresh);
                  }
                }}
                style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 12, resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, textAlign: "center" }}>— or add one contact manually —</div>
            {[
              { key: "email", label: "Email *", ph: "name@company.com", type: "email" },
              { key: "first_name", label: "First name", ph: "Jane", type: "text" },
              { key: "last_name", label: "Last name", ph: "Smith", type: "text" },
              { key: "phone", label: "Phone", ph: "+61 400 000 000", type: "text" },
              { key: "company_name", label: "Company", ph: "Acme Corp", type: "text" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>{f.label}</label>
                <input type={f.type} value={newContact[f.key]} onChange={e => setNewContact(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.ph} autoFocus={f.key === "email"}
                  style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={() => { setShowAddContact(false); setNewContact({ email: "", first_name: "", last_name: "", phone: "", company_name: "" }); }}
                style={{ flex: 1, padding: "10px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={async () => {
                if (!newContact.email?.includes("@")) { fire("Valid email required", "err"); return; }
                const { data: c } = await supabase.from("contacts").upsert({ 
                  email: newContact.email.trim().toLowerCase(), 
                  first_name: newContact.first_name || null,
                  last_name: newContact.last_name || null,
                  phone: newContact.phone || null,
                  company_name: newContact.company_name || null,
                  company_id: profile.company_id, source: "manual" 
                }, { onConflict: "company_id,email" }).select().single();
                if (c) {
                  const { data: ec } = await supabase.from("event_contacts").upsert({ contact_id: c.id, event_id: activeEvent.id, company_id: profile.company_id, status: "pending" }, { onConflict: "event_id,contact_id" }).select("*,contacts(*)").single();
                  if (ec) { setContacts(p => [ec, ...p.filter(x => x.id !== ec.id)]); }
                }
                setShowAddContact(false);
                setNewContact({ email: "", first_name: "", last_name: "", phone: "", company_name: "" });
                fire(`✅ ${newContact.first_name || newContact.email} added!`);
              }} style={{ flex: 2, padding: "10px", background: C.blue, border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                Add Contact →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BRAND VOICE BADGE ───────────────────────────────────────

export default DashView;