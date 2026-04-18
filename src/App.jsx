// evara — All-in-One Event Marketing Platform v2.0 (modular)
import { useState, useEffect, useRef } from "react";
import StoryBar from "./StoryBar";
import { EmptyContacts, EmptyAnalytics, EmptySchedule } from "./EventEmptyStates";
import {
  LayoutDashboard, Mail, Globe, FileText, Users, Calendar,
  Settings, Bell, Search, Download, Share2, Plus, Zap,
  Shield, ChevronDown, Sparkles, X, Phone,
  LogOut, AlertCircle, CheckCircle, Send, Star, Eye, Upload, Image as ImageIcon,
  QrCode, BarChart3, BarChart2, Megaphone, UserCheck, UserCheck2,
  Layers, Layout, Link, ExternalLink, ClipboardList, TrendingUp, Radio
} from "lucide-react";
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY, getSender } from "./lib/evara";
import { buildEmailHtml } from "./lib/utils";
import { Spin, Alert, Inp, ViewHint, ScoreBadge, ImageUploadZone, C, ini, isBusinessEmail } from "./components/Shared";

// ── View imports ─────────────────────────────────────────────────────────────
import DashView from "./views/DashView";
import EdmView from "./views/EdmView";
import ScheduleView from "./views/ScheduleView";
import ContactView from "./views/ContactView";
import LandingView from "./views/LandingView";
import FormsView from "./views/FormsView";
import SettingsView from "./views/SettingsView";
import CheckInView from "./views/CheckInView";
import SocialView from "./views/SocialView";
import AnalyticsView from "./views/AnalyticsView";
import CampaignView from "./views/CampaignView";
import AgendaView from "./views/AgendaView";
import LifecycleView from "./views/LifecycleView";
import ROIView from "./views/ROIView";
import FeedbackView from "./views/FeedbackView";
import CalendarView from "./views/CalendarView";
import SeatingView from "./views/SeatingView";
import QAView from "./views/QAView";
import PublicLandingPage from "./pages/PublicLandingPage";
import MultiEventView from "./pages/MultiEventView";
import PricingPage from "./pages/PricingPage";
import UnsubscribePage from "./pages/UnsubscribePage";
import PublicFormPage from "./pages/PublicFormPage";
import PublicCheckInPage from "./pages/PublicCheckInPage";
import PublicDashboardPage from "./pages/PublicDashboardPage";

// ── Shared constants (re-exported for legacy use) ──────────────────────────
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZGRwanNndHdibG1rZ3hxeXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODk5NTAsImV4cCI6MjA4OTY2NTk1MH0.x5BOfQRzn-F_tvUJv3mHRmfdOZiklyMkGzmPfRYoII4";

// ── Nav structure (module-level) ─────────────────────────────────────────────
const NAV = [
  { id: "dashboard",  label: "Dashboard",    icon: LayoutDashboard },
  { id: "calendar",   label: "Calendar",      icon: Calendar },
  { id: "analytics",  label: "Analytics",     icon: BarChart3 },
  { id: "contacts",   label: "Contacts",      icon: Users },
  { id: "lifecycle",  label: "Lifecycle",     icon: TrendingUp },
  { id: "roi",        label: "ROI",           icon: BarChart2 },
];
const BUILD_NAV = [
  { id: "edm",      label: "Step 1 · Emails",            icon: Mail,     step: 1, hint: "Review & approve your AI-drafted emails" },
  { id: "landing",  label: "Step 2 · Landing Page + Form", icon: Globe,    step: 2, hint: "Review & publish your event page + registration form" },
  { id: "schedule", label: "Step 3 · Review & Send",     icon: Calendar, step: 3, hint: "Preview everything, then schedule" },
];
const POWER_NAV = [
  { id: "social",   label: "Social",    icon: Radio },
];
const NAV_GROUPS = [
  { label: "Manage",      items: NAV },
  { label: "Build",       items: BUILD_NAV },
  { label: "Power Tools", items: POWER_NAV },
  { label: "Event Day", items: [
    { id: "checkin",  label: "Check-in",  icon: QrCode },
    { id: "agenda",   label: "Agenda",    icon: ClipboardList },
    { id: "seating",  label: "Seating",   icon: Layers },
    { id: "qa",       label: "Live Q&A",  icon: Zap },
    { id: "feedback", label: "Feedback",  icon: UserCheck },
  ]},
];

function OnboardingFlow({ profile, supabase, onComplete }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);

  // Company (captured inline in brief)
  const [companyName, setCompanyName] = useState(profile?.companies?.name || "");

  // Brief fields
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("conference");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventTime, setEventTime] = useState("");

  // Generation state
  const [createdEventId, setCreatedEventId] = useState(null);
  const [draftsCreated, setDraftsCreated] = useState(0);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiDone, setAiDone] = useState(false);

  const EVENT_TYPES = ["conference","seminar","networking","workshop","gala","product launch","webinar","training","awards","other"];

  const totalSteps = 2;

  const handleNext = async () => {
    if (step === 1) {
      // Save company name if changed
      if (companyName.trim() && companyName.trim() !== profile?.companies?.name) {
        await supabase.from("companies").update({ name: companyName.trim() }).eq("id", profile.company_id);
      }
      if (!eventName.trim()) { setStep(2); return; }
      setCreatingEvent(true);
      const shareToken = Math.random().toString(36).substring(2,14) + Date.now().toString(36);
      const { data: newEvent } = await supabase.from("events").insert({
        name: eventName.trim(),
        event_date: eventDate || null,
        event_type: eventType,
        location: eventLocation || null,
        description: eventDescription || null,
        event_time: eventTime || null,
        company_id: profile.company_id,
        status: "draft",
        created_by: profile.id,
        share_token: shareToken,
      }).select().single();
      setCreatingEvent(false);
      setCreatedEventId(newEvent?.id || null);
      setStep(2);

      if (newEvent?.id) {
        setAiGenerating(true);
        try {
          const { data: { session: sess } } = await supabase.auth.getSession();
          const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-campaign`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sess?.access_token}`, "apikey": ANON_KEY },
            body: JSON.stringify({
              event_id: newEvent.id,
              company_id: profile.company_id,
              event_name: eventName.trim(),
              event_date: eventDate || "",
              event_time: eventTime || "",
              location: eventLocation || "",
              description: eventDescription || "",
              event_type: eventType,
              org_name: companyName || profile?.companies?.name || "",
            })
          });
          const data = await res.json();
          setDraftsCreated(data.drafts_created || 0);
        } catch(e) { console.log("AI generation failed:", e.message); }
        setAiGenerating(false);
        setAiDone(true);
      }
    } else if (step === 2) {
      setSaving(true);
      await supabase.from("companies").update({ onboarding_completed: true }).eq("id", profile.company_id);
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/send-triggered-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contacts: [{ email: profile.email, first_name: profile.full_name?.split(" ")[0] || "there", unsubscribed: false }],
            triggerType: "welcome",
            eventName: "evara",
            orgName: companyName || "evara",
          })
        });
      } catch(e) { console.log("Welcome email failed:", e.message); }
      setSaving(false);
      onComplete(createdEventId);
    }
  };

  const progress = ((step - 1) / (totalSteps - 1)) * 100;



  return (
    <div style={{ height:"100vh", background:C.bg, display:"flex", alignItems:"flex-start", justifyContent:"center", fontFamily:"Outfit,sans-serif", color:C.text, padding:"24px 24px", overflowY:"auto" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}button{cursor:pointer;font-family:Outfit,sans-serif}input,select{font-family:Outfit,sans-serif}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ width:"100%", maxWidth:520, animation:"fadeUp .35s ease", paddingTop:40, paddingBottom:100 }}>
        {/* Logo + progress */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:7, background:C.blue, display:"flex", alignItems:"center", justifyContent:"center" }}><Zap size={14} color="#fff" strokeWidth={2.5} /></div>
            <span style={{ fontSize:17, fontWeight:700, letterSpacing:"-0.4px" }}>evara</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:120, height:3, background:C.border, borderRadius:2, overflow:"hidden" }}>
              <div style={{ width:`${progress}%`, height:"100%", background:C.blue, borderRadius:2, transition:"width .4s ease" }} />
            </div>
            <span style={{ fontSize:12, color:C.muted }}>{step} / {totalSteps}</span>
          </div>
        </div>

        {/* Step 1 — Event Brief (first thing after login) */}
        {step === 1 && (
          <div key="s1" style={{ animation:"fadeUp .3s ease" }}>
            <h1 style={{ fontSize:26, fontWeight:700, letterSpacing:"-0.5px", marginBottom:6 }}>Tell us about your event 🎪</h1>
            <p style={{ fontSize:14, color:C.sec, marginBottom:22, lineHeight:1.5 }}>Fill in the details and AI will instantly draft all your emails, landing page, and registration form.</p>

            {/* Company name — inline, lightweight */}
            {!profile?.companies?.name && (
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", display:"block", marginBottom:7 }}>Your company / organisation *</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Events Co."
                  style={{ width:"100%", background:C.card, border:`1.5px solid ${companyName ? C.blue : C.border}`, borderRadius:10, color:C.text, padding:"11px 16px", fontSize:14, outline:"none", transition:"border .2s" }} />
              </div>
            )}

            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", display:"block", marginBottom:7 }}>Event name *</label>
              <input value={eventName} onChange={e => setEventName(e.target.value)} placeholder="Annual Leadership Summit 2025" autoFocus
                style={{ width:"100%", background:C.card, border:`1.5px solid ${eventName ? C.blue : C.border}`, borderRadius:10, color:C.text, padding:"12px 16px", fontSize:15, outline:"none", transition:"border .2s" }} />
            </div>

            <div style={{ display:"flex", gap:10, marginBottom:14 }}>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", display:"block", marginBottom:7 }}>Date</label>
                <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)}
                  style={{ width:"100%", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, padding:"11px 14px", fontSize:13, outline:"none", colorScheme:"dark" }} />
              </div>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", display:"block", marginBottom:7 }}>Time</label>
                <input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)}
                  style={{ width:"100%", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, padding:"11px 14px", fontSize:13, outline:"none", colorScheme:"dark" }} />
              </div>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", display:"block", marginBottom:7 }}>Type</label>
                <select value={eventType} onChange={e => setEventType(e.target.value)}
                  style={{ width:"100%", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, padding:"11px 14px", fontSize:13, outline:"none", appearance:"none" }}>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", display:"block", marginBottom:7 }}>Venue / Location</label>
              <input value={eventLocation} onChange={e => setEventLocation(e.target.value)} placeholder="Grand Hyatt, Sydney — or Online via Zoom"
                style={{ width:"100%", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, padding:"11px 16px", fontSize:13, outline:"none" }} />
            </div>

            <div style={{ marginBottom:18 }}>
              <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", display:"block", marginBottom:7 }}>
                What's this event about? <span style={{ fontSize:10, fontWeight:400, color:C.muted, textTransform:"none", letterSpacing:0 }}>(AI uses this to write your emails)</span>
              </label>
              <textarea value={eventDescription} onChange={e => setEventDescription(e.target.value)}
                placeholder="e.g. An exclusive leadership summit bringing together 200 senior executives to discuss the future of finance and technology. Keynotes from industry leaders, curated networking, and a gala dinner."
                rows={3}
                style={{ width:"100%", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, padding:"11px 16px", fontSize:13, outline:"none", resize:"vertical", lineHeight:1.5 }} />
            </div>

            {eventName.trim() && (
              <div style={{ marginBottom:18, padding:"10px 14px", background:C.blue+"08", border:`1px solid ${C.blue}20`, borderRadius:9 }}>
                <div style={{ fontSize:11, fontWeight:600, color:C.blue, marginBottom:6 }}>✨ AI will automatically generate for {eventName}:</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {["Save the Date","Invitation","Reminder","Day-of Details","Thank You"].map(t => (
                    <span key={t} style={{ fontSize:10.5, padding:"2px 8px", borderRadius:4, background:C.blue+"15", color:C.blue }}>{t}</span>
                  ))}
                  <span style={{ fontSize:10.5, padding:"2px 8px", borderRadius:4, background:C.teal+"15", color:C.teal }}>Landing Page</span>
                  <span style={{ fontSize:10.5, padding:"2px 8px", borderRadius:4, background:C.teal+"15", color:C.teal }}>Registration Form</span>
                </div>
              </div>
            )}

            <button onClick={handleNext} disabled={creatingEvent} style={{ position:"sticky", bottom:0, width:"100%", padding:"14px", borderRadius:10, border:"none", background:eventName.trim() ? C.blue : C.border, color:"#fff", fontSize:14, fontWeight:700, opacity:creatingEvent?0.7:1, cursor:eventName.trim()?"pointer":"default", boxShadow:"0 -8px 24px rgba(0,0,0,0.6)", zIndex:10 }}>
              {creatingEvent ? "Creating event…" : eventName.trim() ? "Generate campaign ✨" : "Fill in event name to continue"}
            </button>
          </div>
        )}

        {/* Step 2 — AI generating + done */}
        {step === 2 && (
          <div key="s4" style={{ animation:"fadeUp .3s ease", textAlign:"center" }}>
            {aiGenerating ? (
              /* ── AI is working ── */
              <div>
                <div style={{ width:72, height:72, borderRadius:20, background:`${C.blue}15`, border:`2px solid ${C.blue}30`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 28px", fontSize:32 }}>✨</div>
                <h1 style={{ fontSize:26, fontWeight:700, letterSpacing:"-0.5px", marginBottom:10 }}>AI is building your campaign…</h1>
                <p style={{ fontSize:14, color:C.sec, marginBottom:32, lineHeight:1.6 }}>Drafting all 7 emails, landing page copy, form fields and a LinkedIn post for <strong>{eventName}</strong>. This takes about 15 seconds.</p>
                <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:32 }}>
                  {["Save the Date","Invitation","Reminder","Day-of Details","Confirmation","BYO","Thank You"].map((t, i) => (
                    <div key={t} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", background:C.card, border:`1px solid ${C.border}`, borderRadius:8 }}>
                      <div style={{ width:16, height:16, borderRadius:"50%", border:`2px solid ${C.blue}`, borderTopColor:"transparent", animation:"spin .7s linear infinite", flexShrink:0, animationDelay:`${i*0.1}s` }} />
                      <span style={{ fontSize:13, color:C.sec }}>Drafting {t}…</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* ── Done ── */
              <div>
                <style>{`@keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(140px) rotate(720deg);opacity:0}}.confetti-piece{position:absolute;width:8px;height:8px;border-radius:2px;animation:confettiFall 2s ease forwards;pointer-events:none;}`}</style>
                <div style={{ position:"relative" }}>
                  {aiDone && ["#0A84FF","#30D158","#FF9F0A","#BF5AF2","#FF453A","#5AC8FA"].map((col,i) => (
                    Array.from({length:3}).map((_,j) => (
                      <div key={`${i}-${j}`} className="confetti-piece" style={{ background:col, left:`${8+i*14+j*4}%`, top:0, animationDelay:`${i*0.1+j*0.12}s` }} />
                    ))
                  ))}
                  <div style={{ width:72, height:72, borderRadius:20, background:`${C.green}18`, border:`2px solid ${C.green}35`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:32 }}>
                    {aiDone ? "🎉" : "✅"}
                  </div>
                </div>

                <h1 style={{ fontSize:26, fontWeight:700, letterSpacing:"-0.5px", marginBottom:8 }}>
                  {aiDone ? `${draftsCreated || 7} emails ready for ${eventName}!` : "You're all set!"}
                </h1>
                <p style={{ fontSize:14, color:C.sec, marginBottom:28, lineHeight:1.6 }}>
                  {aiDone
                    ? "AI has drafted your full campaign. Review each email, make edits, then set your send schedule."
                    : `${companyName} is live on evara. Start by building your first email campaign.`}
                </p>

                {/* What was generated */}
                {aiDone && (
                  <div style={{ marginBottom:24, padding:"12px 16px", background:C.card, border:`1px solid ${C.border}`, borderRadius:12, textAlign:"left" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:10 }}>Generated for {eventName}</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {["Save the Date","Invitation","Reminder","Confirmation","BYO","Day-of Details","Thank You"].map(t => (
                        <span key={t} style={{ fontSize:11, padding:"3px 9px", borderRadius:5, background:C.green+"12", color:C.green, border:`1px solid ${C.green}25` }}>✓ {t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next steps */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:28, textAlign:"left" }}>
                  {[
                    { icon:"✉️", step:"Step 1", title:"Review emails", desc:"Edit, preview, approve" },
                    { icon:"🌐", step:"Step 2", title:"Publish page", desc:"Your event landing page" },
                    { icon:"📅", step:"Step 3", title:"Schedule sends", desc:"Set dates, add contacts" },
                  ].map(item => (
                    <div key={item.step} style={{ background:C.raised, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px" }}>
                      <div style={{ fontSize:10, fontWeight:700, color:C.blue, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:4 }}>{item.step}</div>
                      <div style={{ fontSize:18, marginBottom:6 }}>{item.icon}</div>
                      <div style={{ fontSize:12.5, fontWeight:600, color:C.text, marginBottom:3 }}>{item.title}</div>
                      <div style={{ fontSize:11, color:C.muted, lineHeight:1.4 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>

                <button onClick={handleNext} disabled={saving || aiGenerating} style={{ width:"100%", padding:"15px", borderRadius:10, border:"none", background: aiGenerating ? C.border : C.blue, color:"#fff", fontSize:15, fontWeight:600, boxShadow: aiGenerating ? "none" : `0 0 28px ${C.blue}40`, transition:"all .2s" }}>
                  {saving ? "Loading…" : aiDone ? `Review your emails →` : "Enter evara →"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Splash() {
  return (
    <div style={{ height: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "Outfit,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <Zap size={26} color={C.blue} />
      <span style={{ fontSize: 18, fontWeight: 700, color: C.text }}>evara</span>
      <div style={{ width: 18, height: 18, border: `2px solid ${C.blue}25`, borderTop: `2px solid ${C.blue}`, borderRadius: "50%", animation: "spin .7s linear infinite" }} />
    </div>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [name, setName] = useState(""); const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState(null); const [msg, setMsg] = useState(null);
  const [confirmed, setConfirmed] = useState(false); // show post-signup confirmation screen
  const submit = async e => {
    e.preventDefault(); setLoading(true); setError(null);
    // Block personal email domains on signup
    if (mode === "signup" && !isBusinessEmail(email)) {
      setError("Please use a business email address. Personal emails (Gmail, Yahoo, Hotmail, etc.) are not allowed.");
      setLoading(false); return;
    }
    try {
      if (mode === "login") { const { error: err } = await supabase.auth.signInWithPassword({ email, password }); if (err) throw err; }
      else { const { error: err } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name, company_name: company } } }); if (err) throw err; setConfirmed(true); }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  // Post-signup confirmation screen
  if (confirmed) {
    return (
      <div style={{ height:"100vh", background:C.bg, display:"flex", alignItems:"flex-start", justifyContent:"center", fontFamily:"Outfit,sans-serif", color:C.text, padding:"24px 24px", overflowY:"auto" }}>
        <div style={{ maxWidth:460, width:"100%", textAlign:"center", animation:"fadeUp .35s ease" }}>
          <div style={{ width:72, height:72, borderRadius:20, background:`${C.blue}15`, border:`2px solid ${C.blue}30`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 28px", fontSize:36 }}>📧</div>
          <h1 style={{ fontSize:28, fontWeight:700, letterSpacing:"-0.5px", marginBottom:10 }}>Check your inbox</h1>
          <p style={{ fontSize:15, color:C.sec, lineHeight:1.7, marginBottom:8 }}>
            We sent a confirmation link to <strong style={{ color:C.text }}>{email}</strong>
          </p>
          <p style={{ fontSize:14, color:C.muted, lineHeight:1.6, marginBottom:36 }}>
            Click the link in that email to activate your account. It may take a minute or two to arrive. Check your spam folder if you don't see it.
          </p>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:"20px 24px", marginBottom:28, textAlign:"left" }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:14 }}>What happens next</div>
            {[
              { n:"1", text:"Click the confirmation link in your email" },
              { n:"2", text:"You'll land back here — log in automatically" },
              { n:"3", text:"Tell us about your first event" },
              { n:"4", text:"AI builds your full campaign in 15 seconds" },
            ].map(s => (
              <div key={s.n} style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:12 }}>
                <div style={{ width:22, height:22, borderRadius:"50%", background:C.blue+"18", border:`1.5px solid ${C.blue}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:C.blue, flexShrink:0, marginTop:1 }}>{s.n}</div>
                <span style={{ fontSize:13.5, color:C.sec, lineHeight:1.5 }}>{s.text}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { setConfirmed(false); setMode("login"); }} style={{ width:"100%", padding:"13px", borderRadius:10, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, fontSize:14, cursor:"pointer" }}>
            Already confirmed? Sign in →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-root" style={{ height: "100vh", background: C.bg, display: "flex", fontFamily: "Outfit,sans-serif", color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        button{cursor:pointer;font-family:Outfit,sans-serif}
        input,select,textarea{font-family:Outfit,sans-serif}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#2C2C30;border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:#3C3C40}
        ::selection{background:#0A84FF30;color:#F5F5F7}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideRight{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
        @keyframes shimmer{0%{background-position:-200px 0}100%{background-position:200px 0}}
        @keyframes toast-in{from{opacity:0;transform:translateY(-12px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes toast-out{from{opacity:1}to{opacity:0;transform:translateY(-8px)}}
        @keyframes ring-fill{from{stroke-dashoffset:var(--full)}to{stroke-dashoffset:var(--dash)}}
        .nb{outline:none!important}
        .nb:focus-visible{box-shadow:0 0 0 2px #0A84FF60!important}
        button:not(.nb):focus-visible{outline:2px solid #0A84FF60;outline-offset:2px}
        .evara-sidebar{scrollbar-width:none}
        .evara-sidebar::-webkit-scrollbar{display:none}
        .metric-card{transition:all .18s ease;cursor:pointer}
        .metric-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.4)!important}
        .nav-btn{transition:all .12s ease!important}
        .nav-btn:hover{color:#F5F5F7!important;background:rgba(255,255,255,.06)!important}
        /* ── MOBILE LOGIN FIX ── */
        @media(max-width:768px){
          .auth-left-panel{display:none!important}
          .auth-right-panel{flex:1!important;min-width:0!important;width:100%!important;padding:32px 24px!important;overflow-y:auto!important}
          .auth-root{flex-direction:column!important}
        }
      `}</style>
      {/* Left panel — product showcase */}
      <div className="auth-left-panel" style={{ flex:1, background:"linear-gradient(135deg,#060608 0%,#0a0f1e 100%)", padding:"48px 52px", display:"flex", flexDirection:"column", justifyContent:"space-between", minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:C.blue, display:"flex", alignItems:"center", justifyContent:"center" }}><Zap size={14} color="#fff" strokeWidth={2.5} /></div>
          <span style={{ fontSize:18, fontWeight:700, letterSpacing:"-0.4px" }}>evara</span>
          <span style={{ fontSize:10, background:`${C.blue}20`, color:C.blue, padding:"2px 6px", borderRadius:4, fontWeight:700 }}>BETA</span>
        </div>
        <div>
          <h2 style={{ fontSize:"clamp(24px,3vw,38px)", fontWeight:800, letterSpacing:"-1px", lineHeight:1.1, marginBottom:16, color:"#F5F5F7" }}>
            Your all-in-one<br/>event marketing<br/><span style={{ color:C.blue }}>platform.</span>
          </h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", lineHeight:1.65, marginBottom:28, maxWidth:380 }}>
            Replace Mailchimp, Eventbrite, Typeform, Unbounce and Zapier with a single AI-native platform built for event marketing teams.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              { icon:"✉️", label:"AI eDM Builder", desc:"Full emails from a sentence in seconds" },
              { icon:"👥", label:"Contact management", desc:"Deduplication, VIP tagging, lead scoring" },
              { icon:"📊", label:"Event analytics", desc:"Opens, clicks, registrations, attendance" },
              { icon:"🎪", label:"QR code check-in", desc:"Self-service kiosk + walk-in capture" },
            ].map(f => (
              <div key={f.label} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <span style={{ fontSize:18, flexShrink:0, marginTop:1 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.85)", marginBottom:2 }}>{f.label}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.2)" }}>
          © 2026 Orbis · evarahq.com · All data encrypted · GDPR compliant
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-right-panel" style={{ width:420, background:C.bg, padding:"48px 40px", display:"flex", flexDirection:"column", justifyContent:"center", borderLeft:`1px solid ${C.border}`, flexShrink:0 }}>
      <div style={{ animation: "fadeUp .3s ease" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 6 }}>{mode === "login" ? "Welcome back" : "Get started free"}</h1>
          <p style={{ fontSize: 13, color: C.muted }}>{mode === "login" ? "Sign in to your evara workspace" : "No credit card required · Setup in 2 minutes"}</p>
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {mode === "signup" && <><Inp label="Full name" value={name} set={setName} ph="John Doe" /><Inp label="Company" value={company} set={setCompany} ph="Acme Corp" /></>}
          <Inp label="Work email" value={email} set={setEmail} ph="john@company.com" type="email" />
          {mode === "signup" && email.includes("@") && !isBusinessEmail(email) && (
            <div style={{ fontSize: 12, color: "#FF9F0A", marginTop: -8, marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}>
              ⚠️ Please use a business email — personal emails are not allowed
            </div>
          )}
          {mode === "signup" && email.includes("@") && isBusinessEmail(email) && (
            <div style={{ fontSize: 12, color: "#30D158", marginTop: -8, marginBottom: 4 }}>
              ✅ Business email verified
            </div>
          )}
          <Inp label="Password" value={password} set={setPassword} ph="••••••••" type="password" />
          {error && <Alert type="error">{error}</Alert>}
          {msg && <Alert type="success">{msg}</Alert>}
          <button type="submit" disabled={loading} style={{ padding: "12px", background: (loading || (mode === "signup" && email.includes("@") && !isBusinessEmail(email))) ? C.raised : C.blue, border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 500, marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .15s" }}>
            {loading ? <><Spin />Loading…</> : mode === "login" ? "Sign in →" : "Create account →"}
          </button>
        </form>
        {mode === "login" && (
          <p style={{ textAlign: "center", marginTop: 10, fontSize: 12 }}>
            <button onClick={async () => {
              const email = document.querySelector("input[type=email]")?.value;
              if (!email?.includes("@")) { return; }
              const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
              error ? alert(error.message) : alert("Password reset email sent! Check your inbox.");
            }} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 12, textDecoration: "underline" }}>
              Forgot password?
            </button>
          </p>
        )}
        <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: C.muted }}>
          {mode === "login" ? "No account? " : "Have one? "}
          <span onClick={() => { setMode(m => m === "login" ? "signup" : "login"); setError(null); setMsg(null); }} style={{ color: C.blue, cursor: "pointer", fontWeight: 500 }}>
            {mode === "login" ? "Sign up free" : "Sign in"}
          </span>
        </p>
      </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────
function EventSwitcher({ events, activeEvent, setActiveEvent, setView, showArchived, C }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const filtered = events.filter(ev =>
    (showArchived || ev.status !== "archived") &&
    (!q || ev.name?.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <div>
      <button onClick={() => setOpen(p => !p)} style={{ width:"100%", background:C.card, border:`1px solid ${open?C.blue:C.border}`, borderRadius:8, color:C.text, padding:"7px 28px 7px 10px", fontSize:12, fontWeight:500, outline:"none", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{activeEvent?.name}</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && (
        <div style={{ position:"absolute", left:0, right:0, top:"100%", marginTop:3, background:C.card, border:`1px solid ${C.border}`, borderRadius:9, boxShadow:"0 8px 32px rgba(0,0,0,.5)", zIndex:300, overflow:"hidden" }}>
          <div style={{ padding:"6px 8px", borderBottom:`1px solid ${C.border}` }}>
            <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search events…"
              style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:5, color:C.text, padding:"4px 8px", fontSize:11.5, outline:"none" }} />
          </div>
          <div style={{ maxHeight:180, overflowY:"auto" }}>
            {filtered.length===0 && <div style={{ padding:"10px 10px", fontSize:12, color:C.muted }}>No events found</div>}
            {filtered.map(ev => {
              const days = ev.event_date ? Math.ceil((new Date(ev.event_date)-new Date())/(1000*60*60*24)) : null;
              const col = days===0?C.green:days>0&&days<=7?C.red:days>0?C.amber:C.muted;
              const isActive = ev.id === activeEvent?.id;
              return (
                <div key={ev.id} onClick={() => { setActiveEvent(ev); setOpen(false); setQ(""); }}
                  style={{ padding:"8px 10px", cursor:"pointer", background:isActive?`${C.blue}10`:"transparent", borderLeft:`2px solid ${isActive?C.blue:"transparent"}` }}
                  onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background=C.raised; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=isActive?`${C.blue}10`:"transparent"; }}>
                  <div style={{ fontSize:12, fontWeight:isActive?600:400, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ev.name}</div>
                  <div style={{ display:"flex", gap:6, marginTop:2 }}>
                    {ev.event_date && <span style={{ fontSize:9.5, color:col, fontWeight:600 }}>{days===0?"TODAY":days>0?`${days}d`:"past"}</span>}
                    <span style={{ fontSize:9.5, color:C.muted, textTransform:"uppercase" }}>{ev.status||"draft"}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ padding:"6px 8px", borderTop:`1px solid ${C.border}` }}>
            <div onClick={() => { setOpen(false); setView("overview"); }} style={{ fontSize:11, color:C.blue, cursor:"pointer", textAlign:"center" }}>View all events →</div>
          </div>
        </div>
      )}
    </div>
  );
}

function MainApp({ session }) {
  const [view, setView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== "undefined" ? window.innerWidth > 768 : true);
  const [globalSearch, setGlobalSearch] = useState("");
  const [notifs, setNotifs] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [metrics, setMetrics] = useState(null); // header quick-stats
  const [campaigns, setCampaigns] = useState([]); // shared across views
  const [campaignsVersion, setCampaignsVersion] = useState(0); // bump to force reload
  const [contactsVersion, setContactsVersion] = useState(0); // bump to force guest list reload
  const [formShareLink, setRootFormShareLink] = useState(""); // active event's registration form link
  const [lpPublished, setLpPublished] = useState(false); // landing page published status

  // Smart notifications — check events on load
  useEffect(() => {
    if (!session) return;
    const checkSmartNotifs = async () => {
      const { data: profileData } = await supabase.from("profiles").select("company_id").eq("id", session.user.id).single();
      const compId = profileData?.company_id;
      if (!compId) return;
      const [{ data: events }, { data: campaigns }, { data: unsubs }] = await Promise.all([
        supabase.from("events").select("id,name,event_date,status").eq("company_id", compId).order("event_date"),
        supabase.from("email_campaigns").select("id,name,email_type,status,total_sent,total_opened,scheduled_at").eq("company_id", compId).eq("status","scheduled").order("scheduled_at").limit(5),
        supabase.from("contacts").select("id",{count:"exact"}).eq("company_id", compId).eq("unsubscribed",true).limit(1),
      ]);
      const now = new Date();
      const newNotifs = [];

      // Event countdown alerts
      for (const ev of (events||[]).slice(0, 5)) {
        if (!ev.event_date) continue;
        const days = Math.ceil((new Date(ev.event_date) - now) / (1000*60*60*24));
        if (days === 0) newNotifs.push({ icon:"🎉", message:`${ev.name} is TODAY!`, time:"Today" });
        else if (days > 0 && days <= 7) newNotifs.push({ icon:"🔴", message:`${ev.name} is in ${days} day${days!==1?"s":""}!`, time:"Due soon" });
        else if (days > 0 && days <= 21 && ev.status==="draft") newNotifs.push({ icon:"⚠️", message:`${ev.name} is ${days}d away — still on Draft`, time:`${days}d to go` });
      }

      // Scheduled email alerts
      for (const cam of (campaigns||[])) {
        if (!cam.scheduled_at) continue;
        const hoursUntil = Math.round((new Date(cam.scheduled_at) - now) / (1000*60*60));
        if (hoursUntil <= 24 && hoursUntil > 0) {
          newNotifs.push({ icon:"📅", message:`"${cam.name?.slice(0,30)}" sends in ${hoursUntil}h`, time:"Scheduled" });
        }
      }

      // Unsubscribe alert
      if ((unsubs?.count || 0) > 0) {
        newNotifs.push({ icon:"🚫", message:`${unsubs.count} contact${unsubs.count>1?"s":""} unsubscribed — check Contacts`, time:"Action" });
      }

      if (newNotifs.length > 0) {
        setNotifs(newNotifs);
        setNotifCount(newNotifs.length);
      }
    };
    checkSmartNotifs();
  }, [session]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // Cmd/Ctrl+N = new event
      if ((e.metaKey || e.ctrlKey) && e.key === "n" && !e.shiftKey) {
        e.preventDefault();
        setShowNewEvent(true);
      }
      // Cmd/Ctrl+, = settings
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        setView("settings");
      }
      // Cmd/Ctrl+K = focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.querySelector("input[placeholder*='Search']")?.focus();
      }
      // N = new event (when not typing in an input)
      if (e.key === "n" && !e.metaKey && !e.ctrlKey && !["INPUT","TEXTAREA","SELECT"].includes(e.target?.tagName)) {
        e.preventDefault();
        setShowNewEvent(true);
      }
      // Escape = close modals
      if (e.key === "Escape") {
        setShowNewEvent(false);
        setShowNotifs(false);
      }
      // Cmd+D = Dashboard, Cmd+E = eDM Builder
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "D") { e.preventDefault(); setView("dashboard"); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "E") { e.preventDefault(); setView("edm"); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "C") { e.preventDefault(); setView("contacts"); }
      // Cmd+1-9 = navigate modules
      if ((e.metaKey || e.ctrlKey) && e.key >= "1" && e.key <= "9") {
        const allModules = ["dashboard","calendar","analytics","edm","schedule","campaign","social","landing","forms","contacts","checkin","agenda","seating","qa","feedback","lifecycle","roi","settings"];
        const idx = parseInt(e.key) - 1;
        if (allModules[idx]) { e.preventDefault(); setView(allModules[idx]); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const addNotif = (message, icon = "📬") => {
    const n = { message, icon, time: new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }) };
    setNotifs(p => [n, ...p.slice(0, 19)]);
    setNotifCount(p => p + 1);
  };
  const [profile, setProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [toast, setToast] = useState(null);
  const [showMorningBrief, setShowMorningBrief] = useState(() => {
    const key = `evara_brief_${new Date().toDateString()}`;
    return !localStorage.getItem(key);
  });
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [briefMode, setBriefMode] = useState(true);
  const [briefText, setBriefText] = useState("");
  const [briefParsing, setBriefParsing] = useState(false);
  const [briefParsed, setBriefParsed] = useState(null);
  const [selectedEmailTypes, setSelectedEmailTypes] = useState(["save_the_date","invite","reminder","confirmation","thank_you"]);
  const [showArchived, setShowArchived] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [showDupModal, setShowDupModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dupName, setDupName] = useState("");
  const [hoveredNav, setHoveredNav] = useState(null);
  const [dupDate, setDupDate] = useState("");
  const [duping, setDuping] = useState(false);

  // Load metrics for header strip whenever active event changes
  useEffect(() => {
    if (!activeEvent?.id) { setMetrics(null); setCampaigns([]); setRootFormShareLink(""); setLpPublished(false); return; }
    supabase.from("event_summary").select("*").eq("event_id", activeEvent.id).maybeSingle()
      .then(({ data }) => setMetrics(data));
    supabase.from("email_campaigns").select("*").eq("event_id", activeEvent.id).order("created_at", { ascending: false })
      .then(({ data }) => setCampaigns(data || []));
    supabase.from("forms").select("share_token").eq("event_id", activeEvent.id).eq("is_active", true).limit(1).maybeSingle()
      .then(({ data }) => setRootFormShareLink(data?.share_token ? `${window.location.origin}/form/${data.share_token}` : ""));
    supabase.from("landing_pages").select("is_published").eq("event_id", activeEvent.id).eq("page_type","event").eq("is_published", true).limit(1).maybeSingle()
      .then(({ data }) => setLpPublished(!!data));
  }, [activeEvent?.id]);
  const [newEventExtra, setNewEventExtra] = useState({ event_date: "", event_time: "", location: "" });


  const fire = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 4500); };

  // Track whether we've already done the initial navigation so that
  // subsequent session changes (e.g. token refresh, storage auth calls)
  // don't yank the user back to the dashboard mid-task.
  const didInitialNavRef = useRef(false);
  const lastUserIdRef = useRef(null);
  useEffect(() => {
    if (!session?.user?.id) return;
    const load = async () => {
      let { data: prof } = await supabase.from("profiles").select("*,companies(*)").eq("id", session.user.id).single();
      
      // Auto-setup on first login - create company + profile if missing
      if (!prof?.company_id) {
        // Create company
        const { data: company } = await supabase.from("companies").insert({
          name: session.user.email?.split("@")[1]?.split(".")[0] || "My Company",
          from_email: session.user.email,
        }).select().single();
        
        // Create or update profile
        if (company) {
          await supabase.from("profiles").upsert({
            id: session.user.id,
            company_id: company.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
            role: "admin",
          });
          // Reload profile
          const { data: newProf } = await supabase.from("profiles").select("*,companies(*)").eq("id", session.user.id).single();
          prof = newProf;
        }
      }
      
      setProfile(prof);
      // Show onboarding for new users (company not yet onboarded)
      if (prof?.companies && !prof.companies.onboarding_completed) {
        setShowOnboarding(true);
      }
      const { data: evts } = await supabase.from("events").select("*").eq("company_id", prof?.company_id).order("event_date", { ascending: true });
      setEvents(evts || []);
      setActiveEvent(prev => prev || evts?.[0] || null);

      // Only navigate to dashboard on the very first load for this user.
      // Token refreshes keep the same user.id but produce a new session object,
      // which previously caused unwanted navigation mid-task.
      const userChanged = lastUserIdRef.current !== session.user.id;
      if (!didInitialNavRef.current || userChanged) {
        setView("dashboard");
        didInitialNavRef.current = true;
        lastUserIdRef.current = session.user.id;
      }
    };
    load();
  }, [session]);

  const createEvent = async (overrideName, overrideExtra) => {
    const eventName = overrideName || newEventName;
    const eventExtra = overrideExtra || newEventExtra;
    if (!eventName?.trim() || !profile) { console.error('createEvent blocked: name=', eventName, 'profile=', profile); return; }
    const shareToken = Math.random().toString(36).substring(2, 14) + Date.now().toString(36);
    const { data } = await supabase.from("events").insert({ 
      name: eventName.trim(), 
      event_date: eventExtra?.event_date || null, 
      event_time: eventExtra?.event_time || null,
      location: eventExtra?.location || null,
      description: eventExtra?.description || null,
      event_type: eventExtra?.event_type || null,
      event_format: eventExtra?.event_format || null,
      rsvp_deadline: eventExtra?.rsvp_deadline || null,
      capacity: eventExtra?.capacity ? parseInt(eventExtra.capacity) : null,
      company_id: profile.company_id, status: "draft", created_by: profile.id,
      share_token: shareToken,
    }).select().single();
    if (data) {
      setEvents(p => [...p, data]);
      setActiveEvent(data);
      setShowNewEvent(false);
      setNewEventName("");
      setNewEventDate("");
      setNewEventExtra({ event_date: "", event_time: "", location: "" });

      // Auto-set from_name to company name if not already configured
      if (!profile?.companies?.from_name && profile?.companies?.name) {
        await supabase.from("companies").update({ from_name: profile.companies.name }).eq("id", profile.company_id);
      }
      
      // 🤖 AI-first: auto-draft the full email lifecycle in the background
      fire("✅ Event created! AI is drafting emails, landing page & form…");
      setView("edm"); // ← take them straight to Emails
      const { data: { session: sess } } = await supabase.auth.getSession();
      fetch(`${SUPABASE_URL}/functions/v1/auto-draft-lifecycle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sess?.access_token}` },
        body: JSON.stringify({
          eventId: data.id,
          companyId: profile.company_id,
          selectedEmailTypes: eventExtra?.selectedEmailTypes || null,
        })
      }).then(r => r.json()).then(res => {
        if (res.success && res.drafts_created > 0) {
          const parts = [`🤖 ${res.drafts_created} emails`];
          if (res.landing_page_created) parts.push("landing page");
          if (res.form_created) parts.push("registration form");
          fire(`✨ AI built your ${parts.join(", ")} — review and publish when ready.`);
          setCampaignsVersion(v => v + 1);
        }
      }).catch(() => {});
    }
    setNewEventExtra({ event_date: "", event_time: "", location: "" });
    setShowNewEvent(false); setNewEventName(""); setNewEventDate("");
  };

  // Show onboarding for new users
  if (showOnboarding && profile) {
    return <OnboardingFlow profile={profile} supabase={supabase} onComplete={(eventId) => {
      setShowOnboarding(false);
      // Reload events after onboarding, select the created event, land on EdmView
      supabase.from("events").select("*").eq("company_id", profile.company_id).order("event_date", { ascending: true })
        .then(({ data: evts }) => {
          setEvents(evts || []);
          const target = eventId ? evts?.find(e => e.id === eventId) : evts?.[0];
          if (target) setActiveEvent(target);
          setView("edm"); // ← Land them directly in their emails
        });
      // Reload profile with updated company
      supabase.from("profiles").select("*,companies(*)").eq("id", session.user.id).single()
        .then(({ data: prof }) => { if (prof) setProfile(prof); });
    }} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.text, fontFamily: "Outfit,sans-serif", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#2C2C30;border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:#3C3C42}
        ::selection{background:#0A84FF28;color:#F5F5F7}
        button{cursor:pointer;font-family:Outfit,sans-serif}
        input,textarea,select{font-family:Outfit,sans-serif}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes shimmer{0%{opacity:.5}50%{opacity:1}100%{opacity:.5}}
        @keyframes toast-in{from{opacity:0;transform:translateY(-12px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes toastProgress{from{width:100%}to{width:0%}}
        @keyframes slideRight{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
        .nb{outline:none!important}
        .nb:focus-visible{box-shadow:0 0 0 2px #0A84FF50!important}
        .nb:hover{background:rgba(255,255,255,.05)!important;color:${C.text}!important}
        .mc:hover{background:${C.raised}!important;border-color:${C.borderHi}!important;transform:translateY(-1px)}
        .rh{cursor:pointer;transition:background .1s}
        .rh:hover td{background:${C.raised}!important}
        .rh:hover{background:${C.raised}!important}
        .metric-card{transition:transform .18s ease,box-shadow .18s ease;cursor:pointer}
        .metric-card:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.5)!important}
        .nav-btn{transition:all .12s ease!important}
        .nav-btn:hover{color:${C.text}!important;background:rgba(255,255,255,.06)!important}
        .evara-sidebar{scrollbar-width:none}
        .evara-sidebar::-webkit-scrollbar{display:none}
        .mobile-hamburger{display:none!important}
        input:focus,textarea:focus,select:focus{outline:none;border-color:${C.blue}!important;box-shadow:0 0 0 3px ${C.blue}18}
        @media(max-width:768px){
          html,body{overflow-x:hidden!important;max-width:100vw!important}
          /* Sidebar — fixed, hidden by default, slides in */
          .evara-sidebar{position:fixed!important;z-index:200;transform:translateX(-100%)!important;transition:transform .25s ease!important;width:260px!important;top:0;bottom:0;left:0}
          .evara-sidebar.open{transform:translateX(0)!important}
          .evara-overlay{display:block!important}
          /* Main content — full width, no gap from fixed sidebar */
          .evara-main{margin-left:0!important;width:100%!important;max-width:100vw!important;flex:1!important}
          .mobile-hamburger{display:flex!important}
          .desktop-breadcrumb{display:none!important}
          .main-padding{padding:12px!important}
          /* Topbar — compact */
          .evara-topbar{padding:0 10px!important;gap:6px!important}
          /* BUILD nav — horizontal scroll, hide arrows */
          .evara-buildnav{overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;padding:0 8px!important}
          .evara-buildnav::-webkit-scrollbar{display:none!important}
          .evara-buildnav>span{display:none!important}
          /* Metric cards — 2 per row */
          .metrics-grid{grid-template-columns:1fr 1fr!important;gap:8px!important}
          /* Quick actions — scroll horizontally */
          .quick-actions{flex-wrap:nowrap!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;gap:6px!important;padding-bottom:4px!important}
          .quick-actions::-webkit-scrollbar{display:none!important}
          .quick-actions button{font-size:11px!important;padding:5px 9px!important;white-space:nowrap!important;flex-shrink:0!important}
          /* Event hero action buttons — horizontal scroll */
          .event-hero-actions{overflow-x:auto!important;flex-wrap:nowrap!important;-webkit-overflow-scrolling:touch!important}
          .event-hero-actions::-webkit-scrollbar{display:none!important}
          /* Journey strip scrollbar hidden */
          .journey-strip-inner::-webkit-scrollbar{display:none!important}
          /* Hide non-critical table columns */
          .guest-col-company{display:none!important}
          .guest-col-score{display:none!important}
          /* Modals — full width */
          .evara-modal{width:calc(100vw - 20px)!important;max-width:100vw!important;max-height:88vh!important;overflow-y:auto!important;border-radius:12px!important;margin:0 auto!important}
          /* Contact panel — full width */
          .contact-panel{width:100vw!important}
          /* eDM builder — single column */
          .edm-grid{grid-template-columns:1fr!important;min-height:auto!important}
          /* ROI — single column */
          .roi-grid{grid-template-columns:1fr!important}
          /* Event title — scale down */
          .event-hero-title{font-size:18px!important}
          /* Search bar — hidden on mobile topbar */
          .topbar-search{display:none!important}
          /* Stats strip — hidden on mobile */
          .topbar-stats{display:none!important}
          /* What next button — shrink */
          .what-next-btn{font-size:11px!important;padding:5px 8px!important}
        }
        @media(max-width:480px){
          .metrics-grid{grid-template-columns:1fr 1fr!important}
          h1{font-size:18px!important}
        }
      `}</style>

      {/* Mobile overlay — closes sidebar when tapping outside */}
      {sidebarOpen && <div className="evara-overlay" onClick={() => setSidebarOpen(false)} style={{ display:"none", position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:199 }} />}

      {/* SIDEBAR */}
      <aside className={`evara-sidebar${sidebarOpen?" open":""}`} style={{ width: sidebarOpen ? 216 : 56, background: C.sidebar, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, transition:"all .25s ease", overflow:"hidden" }}>
        <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: sidebarOpen ? 14 : 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 3px ${C.blue}20`, flexShrink:0 }}><Zap size={13} color="#fff" strokeWidth={2.5} /></div>
            {sidebarOpen && <>
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.4px" }}>evara</span>
              {profile?.companies?.name && <span style={{ fontSize: 10, color: C.muted, background: C.raised, padding: "1px 6px", borderRadius: 4 }}>{profile.companies.name.slice(0,14)}</span>}
              <span style={{ fontSize: 9, fontWeight: 600, background: `${C.blue}20`, color: C.blue, padding: "2px 5px", borderRadius: 3, letterSpacing: "0.5px", marginLeft: "auto" }}>BETA</span>
            </>}
            <button onClick={() => setSidebarOpen(p=>!p)} style={{ marginLeft:"auto", background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:16, padding:"2px 4px", lineHeight:1, flexShrink:0 }} title={sidebarOpen?"Collapse sidebar":"Expand sidebar"}>
              {sidebarOpen ? "◂" : "▸"}
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5, paddingLeft: 2, paddingRight: 2 }}>
            <div style={{ fontSize: 9.5, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "1px" }}>Active Event</div>
            {activeEvent?.event_date && (() => {
              const days = Math.ceil((new Date(activeEvent.event_date) - new Date()) / (1000*60*60*24));
              const color = days <= 3 ? C.red : days <= 14 ? C.amber : C.green;
              return <span style={{ fontSize: 9, fontWeight: 700, color, background: color + "15", padding: "1px 5px", borderRadius: 3 }}>{days > 0 ? `${days}d` : days === 0 ? "TODAY" : "DONE"}</span>;
            })()}
          </div>
          {events.length > 0 && (
            <div style={{ fontSize: 9, color: C.muted, padding: "2px 2px 0", display: "flex", gap: 8 }}>
              <span>{events.length} event{events.length !== 1 ? "s" : ""}</span>
              <span style={{ color: C.border }}>·</span>
              <span 
                onClick={() => setView("contacts")} 
                style={{ cursor: "pointer", textDecoration: "underline", textDecorationStyle: "dotted" }}
                title="Go to contacts"
              >
                Contacts
              </span>
            </div>
          )}
          {activeEvent ? (
            <div>
              <div style={{ position: "relative", marginBottom: 6 }}>
                <EventSwitcher events={events} activeEvent={activeEvent} setActiveEvent={setActiveEvent} setView={setView} showArchived={showArchived} C={C} />
              </div>
              {events.filter(e => e.status === "archived").length > 0 && (
                <button onClick={() => setShowArchived(p => !p)}
                  style={{ fontSize: 10, color: C.muted, background:"transparent", border:"none",
                    cursor:"pointer", padding:"2px 0 4px", textDecoration:"underline", display:"block" }}>
                  {showArchived ? "↑ Hide archived" : `+ ${events.filter(e=>e.status==="archived").length} archived event${events.filter(e=>e.status==="archived").length>1?"s":""}`}
                </button>
              )}
              <button onClick={() => { setDupName(activeEvent.name + " (Copy)"); setDupDate(activeEvent.event_date || ""); setShowDupModal(true); }} style={{ width: "100%", padding: "5px 8px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, fontSize: 11, cursor: "pointer", textAlign: "center" }}>
                ⧉ Duplicate event
              </button>
              {activeEvent.status !== "archived" ? (
                <button onClick={async () => {
                  // confirmed
                  await supabase.from("events").update({ status: "archived" }).eq("id", activeEvent.id);
                  setActiveEvent(p => ({ ...p, status: "archived" }));
                  setEvents(p => p.map(e => e.id === activeEvent.id ? { ...e, status: "archived" } : e));
                  fire("📦 Event archived");
                }} style={{ width: "100%", padding: "5px 8px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, fontSize: 11, cursor: "pointer", textAlign: "center", marginTop: 4 }}>
                  📦 Archive event
                </button>
              ) : (
                <button onClick={async () => {
                  await supabase.from("events").update({ status: "draft" }).eq("id", activeEvent.id);
                  setActiveEvent(p => ({ ...p, status: "draft" }));
                  setEvents(p => p.map(e => e.id === activeEvent.id ? { ...e, status: "draft" } : e));
                  fire("✅ Event unarchived");
                }} style={{ width: "100%", padding: "5px 8px", background: "transparent", border: `1px solid ${C.amber}40`, borderRadius: 6, color: C.amber, fontSize: 11, cursor: "pointer", textAlign: "center", marginTop: 4 }}>
                  ↩ Unarchive event
                </button>
              )}
              <button onClick={() => setShowDeleteModal(true)} style={{ width: "100%", padding: "5px 8px", background: "transparent", border: `1px solid ${C.red}30`, borderRadius: 6, color: C.red, fontSize: 11, cursor: "pointer", textAlign: "center", marginTop: 4 }}>
                  🗑 Delete event
                </button>
            </div>
          ) : (
            <button onClick={() => setShowNewEvent(true)} style={{ width: "100%", padding: "8px 11px", background: `${C.blue}12`, border: `1px dashed ${C.blue}40`, borderRadius: 8, color: C.blue, fontSize: 12, textAlign: "left", cursor: "pointer" }}>
              + Create first event
            </button>
          )}
        </div>
        <nav style={{ flex: 1, padding: "8px 8px", display: "flex", flexDirection: "column", gap: 0, overflowY: "auto" }}>
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              {sidebarOpen && <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1.2px", padding: "10px 10px 4px", opacity: 0.7 }}>{group.label}</div>}
              {!sidebarOpen && <div style={{ height:8 }} />}
              {group.items.map(({ id, label, icon: Icon, badge }) => {
                const on = view === id;
                const schedLocked = id === "schedule" && !(campaigns.length > 0 && campaigns.every(c => c.status === "approved" || c.status === "sent") && lpPublished);
                return (<button key={id} data-view={id} className="nb nav-btn" onClick={() => {
                  if (schedLocked) { fire("Approve all emails and publish your landing page first", "warn"); return; }
                  setView(id); if (window.innerWidth <= 768) setSidebarOpen(false);
                }} title={!sidebarOpen ? label : undefined} style={{ display: "flex", alignItems: "center", gap: sidebarOpen?8:0, padding: sidebarOpen?"7px 10px":"8px", justifyContent: sidebarOpen?"flex-start":"center", borderRadius: 7, border: "none", background: on ? `${C.blue}16` : "transparent", color: on ? C.blue : schedLocked ? C.muted : C.muted, width: "100%", textAlign: "left", fontSize: 12.5, fontWeight: on ? 600 : 400, borderLeft: sidebarOpen?`2px solid ${on ? C.blue : "transparent"}`:"2px solid transparent", marginBottom: 1, boxShadow: on && sidebarOpen ? `inset 0 0 0 1px ${C.blue}18` : "none", opacity: schedLocked ? 0.5 : 1, cursor: schedLocked ? "not-allowed" : "pointer" }}>
                  <Icon size={14} strokeWidth={on ? 2.5 : 1.5} color={on ? C.blue : C.muted} />
                  {sidebarOpen && <><span style={{ flex: 1 }}>{label}</span>
                  {schedLocked && <span style={{ fontSize:9 }}>🔒</span>}
                  {badge && !schedLocked && <span style={{ fontSize: 9, fontWeight: 700, background: on ? C.blue : `${C.blue}20`, color: on ? "#fff" : C.blue, padding: "1px 5px", borderRadius: 3, letterSpacing:"0.3px" }}>{badge}</span>}</>}
                </button>);
              })}
            </div>
          ))}
        </nav>
        <div style={{ padding: "10px 8px 12px", borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 1 }}>
          <div style={{ fontSize: 9.5, color: C.muted, padding: "0 10px 6px", opacity: 0.5, display: "flex", justifyContent: "space-between" }}>
          <span>⌘N new · ⌘K search · ⌘, settings · ESC close</span>
          <span>v2.3</span>
        </div>
        <button className="nb" onClick={() => { setView("settings"); if (window.innerWidth <= 768) setSidebarOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 7, border: "none", background: view === "settings" ? C.raised : "transparent", color: C.muted, width: "100%", textAlign: "left", fontSize: 13, borderLeft: `2px solid ${view === "settings" ? C.blue : "transparent"}` }}>
            <Settings size={14} strokeWidth={1.5} /><span>Settings</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 9, background: C.raised, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 10px", marginTop: 6, cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${C.blue},${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{ini(profile?.full_name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{profile?.full_name || "Loading…"}</div>
              <div style={{ fontSize: 10, color: C.muted, display: "flex", alignItems: "center", gap: 3 }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: C.green }} />{profile?.role || "owner"}</div>
            </div>
            <button onClick={() => supabase.auth.signOut()} style={{ background: "transparent", border: "none", color: C.muted, padding: 4 }} title="Sign out"><LogOut size={12} /></button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="evara-main" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* ── TOP ROW: breadcrumb + search + actions ── */}
        <header className="evara-topbar" style={{ height: 48, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 18px", gap: 10, flexShrink: 0, background: C.sidebar }}>
          <button className="mobile-hamburger" onClick={() => setSidebarOpen(p=>!p)}
            style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:7, color:C.muted, cursor:"pointer", fontSize:18, padding:"6px 11px", lineHeight:1, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, minWidth:40 }}>☰</button>
          <div className="desktop-breadcrumb" style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
            <span style={{ fontSize:12, color:C.muted }}>evara</span>
            {activeEvent && <><span style={{ fontSize:12, color:C.muted }}>/</span>
            <span style={{ fontSize:12, color:C.muted, maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{activeEvent.name}</span></>}
            <span style={{ fontSize:12, color:C.muted }}>/</span>
            {(() => {
              const allNav = [...NAV, ...BUILD_NAV, ...POWER_NAV];
              const label = allNav.find(n => n.id === view)?.label || (view==="settings"?"Settings":view==="calendar"?"Calendar":"Dashboard");
              document.title = `${label} · ${activeEvent?.name || "evara"}`;
              return <span style={{ fontSize:12.5, fontWeight:500, color:C.text }}>{label}</span>;
            })()}
          </div>
          <div style={{ width:1, height:16, background:C.border, flexShrink:0 }} />
          {/* Search */}
          <div className="topbar-search" style={{ position:"relative", flex:1, maxWidth:260 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, background:C.card, border:`1px solid ${globalSearch?C.blue:C.border}`, borderRadius:7, padding:"5px 10px" }}>
              <Search size={11} color={C.muted} strokeWidth={1.5} />
              <input placeholder="Search… (⌘K)" value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                onKeyDown={e => { if (e.key==="Escape"){setGlobalSearch("");e.target.blur();} if(e.key==="Enter"&&globalSearch.length>1){setView("contacts");} }}
                style={{ background:"none", border:"none", outline:"none", color:C.sec, fontSize:12, width:"100%" }} />
              {globalSearch && <button onClick={()=>setGlobalSearch("")} style={{ background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:13,lineHeight:1,padding:0 }}>×</button>}
            </div>
            {globalSearch.length > 0 && (() => {
              const q = globalSearch.toLowerCase();
              const matchedEvents = events.filter(e => e.name?.toLowerCase().includes(q)||e.location?.toLowerCase().includes(q)).slice(0,4);
              const modules = [...NAV,...BUILD_NAV,...POWER_NAV].filter(m=>m.label.toLowerCase().includes(q)).slice(0,4);
              if (!matchedEvents.length && !modules.length) return null;
              return (
                <div style={{ position:"absolute", top:"100%", left:0, right:0, marginTop:4, background:C.card, border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 8px 32px rgba(0,0,0,.5)", zIndex:300, overflow:"hidden" }}>
                  {matchedEvents.length > 0 && <>{<div style={{ padding:"6px 12px 3px", fontSize:9.5, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px" }}>Events</div>}
                    {matchedEvents.map(ev => (<div key={ev.id} onClick={() => { setActiveEvent(ev); setView("dashboard"); setGlobalSearch(""); fire(`Switched to ${ev.name}`); }}
                      style={{ padding:"8px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:9, fontSize:13 }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.raised} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <span>🎪</span><div><div style={{ color:C.text, fontWeight:500 }}>{ev.name}</div>{ev.event_date&&<div style={{ fontSize:11,color:C.muted }}>{new Date(ev.event_date).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})}</div>}</div>
                    </div>))}</>}
                  {modules.length > 0 && <><div style={{ padding:"6px 12px 3px", fontSize:9.5, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", borderTop:matchedEvents.length?`1px solid ${C.border}`:undefined }}>Go to</div>
                    {modules.map(m => (<div key={m.id} onClick={() => { setView(m.id); setGlobalSearch(""); }}
                      style={{ padding:"8px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:9, fontSize:13 }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.raised} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <span>{m.icon||"→"}</span><span style={{ color:C.text }}>{m.label}</span>
                    </div>))}</>}
                  <div style={{ padding:"6px 12px", borderTop:`1px solid ${C.border}` }}>
                    <div onClick={() => { setView("contacts"); }} style={{ fontSize:11, color:C.muted, cursor:"pointer" }}>Press Enter to search contacts for "{globalSearch}"</div>
                  </div>
                </div>
              );
            })()}
          </div>
          {/* Quick stats */}
          {activeEvent && metrics && (
            <div className="topbar-stats" style={{ display:"flex", gap:1, background:C.raised, borderRadius:7, border:`1px solid ${C.border}`, overflow:"hidden", flexShrink:0 }}>
              {[{label:"Sent",val:metrics?.total_sent||0,color:C.blue},{label:"Opened",val:metrics?.total_opened||0,color:C.teal},{label:"Confirmed",val:metrics?.total_confirmed||0,color:C.green}].map((s,i)=>(
                <div key={s.label} style={{ padding:"3px 9px", borderRight:i<2?`1px solid ${C.border}`:"none", textAlign:"center" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:s.color, lineHeight:1.2 }}>{s.val}</div>
                  <div style={{ fontSize:8.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.5px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:6, marginLeft:"auto" }}>
            <button onClick={() => setShowNewEvent(true)} style={{ display:"flex", alignItems:"center", gap:5, background:C.blue, border:"none", borderRadius:7, padding:"6px 13px", color:"#fff", fontSize:12, fontWeight:600, boxShadow:`0 2px 8px ${C.blue}40`, whiteSpace:"nowrap" }}>
              <Plus size={11} />New Event
            </button>
            <button onClick={() => setShowHelp(p=>!p)} title="Keyboard shortcuts (?)"
              style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:7, padding:"5px 9px", color:C.muted, cursor:"pointer", fontSize:12, fontWeight:700 }}>?</button>
            <div style={{ position:"relative", cursor:"pointer", padding:4 }} onClick={() => setShowNotifs(p=>!p)}>
            <Bell size={15} color={C.muted} />
            {notifCount > 0 && <div style={{ position:"absolute", top:2, right:2, width:7, height:7, borderRadius:"50%", background:C.red, boxShadow:`0 0 0 1.5px ${C.sidebar}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:6, color:"#fff", fontWeight:700 }}>{notifCount>9?"9+":notifCount}</span>
            </div>}
            {showNotifs && (
              <div style={{ position: "absolute", top: 28, right: 0, width: 300, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,.4)", zIndex: 200, overflow: "hidden" }}
                onClick={e => e.stopPropagation()}>
                <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Notifications</span>
                  <button onClick={() => { setNotifs([]); setNotifCount(0); setShowNotifs(false); }} style={{ fontSize: 11, color: C.muted, background: "transparent", border: "none", cursor: "pointer" }}>Clear all</button>
                </div>
                {notifs.length === 0 ? (
                  <div style={{ padding: "24px 14px", textAlign: "center", fontSize: 12, color: C.muted }}>No new notifications</div>
                ) : notifs.slice(0, 8).map((n, i) => (
                  <div key={i} style={{ padding: "10px 14px", borderBottom: i < notifs.length - 1 ? `1px solid ${C.border}` : undefined, display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, color: C.text, lineHeight: 1.4 }}>{n.message}</div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        </header>

        {/* ── JOURNEY PROGRESS STRIP — 3-step guided flow ── */}
        {activeEvent && (() => {
          // Step completion logic — driven by real data
          const step1Done = campaigns.length > 0 && campaigns.filter(c => c.html_content).every(c => c.status === "approved" || c.status === "scheduled" || c.status === "sent");
          const step2Done = lpPublished;
          const step3Done = campaigns.some(c => c.status === "sent");
          const stepDone = [step1Done, step2Done, step3Done];
          const stepsComplete = stepDone.filter(Boolean).length;
          const pct = Math.round((stepsComplete / 3) * 100);

          const activeStep = BUILD_NAV.findIndex(s => s.id === view);

          return (
            <div style={{ borderBottom:`1px solid ${C.border}`, background:C.card, flexShrink:0 }}>
              {/* Progress bar */}
              <div style={{ height:3, background:C.raised, position:"relative" }}>
                <div style={{ position:"absolute", top:0, left:0, height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${C.blue},${C.teal})`, borderRadius:"0 2px 2px 0", transition:"width .4s ease" }} />
              </div>

              {/* Step strip */}
              <div style={{ display:"flex", alignItems:"stretch", padding:"0 20px", gap:0 }}>
                {BUILD_NAV.map((item, i) => {
                  const isCurrent = view === item.id;
                  const isDone = stepDone[i];
                  const isPending = !isDone && !isCurrent;
                  const hovered = hoveredNav === item.id;
                  const isSchedule = item.id === "schedule";
                  const schedLocked = isSchedule && !(step1Done && step2Done);

                  const dotColor = isDone ? C.green : isCurrent ? C.blue : schedLocked ? C.red + "60" : C.border;
                  const labelColor = isDone ? C.green : isCurrent ? C.blue : schedLocked ? C.muted : hovered ? C.text : C.muted;
                  const numBg = isDone ? C.green + "20" : isCurrent ? C.blue + "18" : "transparent";
                  const numColor = isDone ? C.green : isCurrent ? C.blue : C.muted;

                  return (
                    <div key={item.id} style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
                      <button
                        onClick={() => {
                          if (schedLocked) {
                            fire(!step1Done ? "Approve all emails in Step 1 first" : "Publish your landing page in Step 2 first", "warn");
                            return;
                          }
                          setView(item.id);
                        }}
                        onMouseEnter={() => setHoveredNav(item.id)}
                        onMouseLeave={() => setHoveredNav(null)}
                        style={{
                          display:"flex", flexDirection:"column", alignItems:"flex-start",
                          gap:3, padding:"10px 14px",
                          background:"transparent", border:"none",
                          borderBottom:`2.5px solid ${isCurrent ? C.blue : "transparent"}`,
                          cursor: schedLocked ? "not-allowed" : "pointer",
                          transition:"all .12s", minWidth:120,
                          opacity: schedLocked ? 0.55 : 1,
                        }}>
                        {/* Top row: step number + icon + label + badge */}
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <div style={{
                            width:18, height:18, borderRadius:"50%",
                            background:numBg, border:`1.5px solid ${dotColor}`,
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:9.5, fontWeight:700, color:numColor, flexShrink:0
                          }}>
                            {isDone ? "✓" : schedLocked ? "🔒" : item.step}
                          </div>
                          <item.icon size={13} strokeWidth={1.8} />
                          <span style={{ fontSize:12.5, fontWeight:isCurrent ? 600 : 400, color:labelColor, whiteSpace:"nowrap" }}>
                            {item.label}
                          </span>
                          {item.badge && (
                            <span style={{ fontSize:8, fontWeight:700, background:isCurrent ? C.blue : `${C.blue}18`, color:isCurrent ? "#fff" : C.blue, padding:"1px 4px", borderRadius:3 }}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {/* Hint text — only shown for current step */}
                        {isCurrent && (
                          <div style={{ fontSize:10.5, color:C.muted, paddingLeft:24, whiteSpace:"nowrap" }}>
                            {item.hint}
                          </div>
                        )}
                        {/* Done status — for completed steps */}
                        {isDone && !isCurrent && (
                          <div style={{ fontSize:10, color:C.green + "99", paddingLeft:24, whiteSpace:"nowrap" }}>Complete</div>
                        )}
                        {/* Pending nudge — first incomplete non-current */}
                        {isPending && !isDone && i === stepDone.indexOf(false) && activeStep > i && (
                          <div style={{ fontSize:10, color:C.amber, paddingLeft:24, whiteSpace:"nowrap" }}>Needs attention</div>
                        )}
                      </button>

                      {/* Connector arrow */}
                      {i < BUILD_NAV.length - 1 && (
                        <div style={{ color: stepDone[i] ? C.green + "60" : C.border, fontSize:12, userSelect:"none", flexShrink:0, paddingBottom: isCurrent ? 14 : 0 }}>
                          →
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Right side: progress summary + extras */}
                <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:12, paddingRight:4, flexShrink:0 }}>
                  <div style={{ fontSize:11, color:C.muted }}>
                    <span style={{ color: stepsComplete === 3 ? C.green : C.blue, fontWeight:600 }}>{stepsComplete}/3</span> steps done
                  </div>
                  {/* Quick access to extras */}
                  <div style={{ display:"flex", gap:4 }}>
                    <button onClick={() => setView("campaign")} title="AI Campaign Builder — generate all emails from one brief" style={{ fontSize:10, padding:"3px 8px", borderRadius:5, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer", display:"flex", alignItems:"center", gap:3 }}>
                      ⚡ <span>Campaign</span>
                    </button>
                    <button onClick={() => setView("social")} title="Generate LinkedIn posts & social content" style={{ fontSize:10, padding:"3px 8px", borderRadius:5, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer", display:"flex", alignItems:"center", gap:3 }}>
                      📢 <span>Social</span>
                    </button>
                    <button onClick={() => setView("forms")} title="Standalone form builder" style={{ fontSize:10, padding:"3px 8px", borderRadius:5, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer", display:"flex", alignItems:"center", gap:3 }}>
                      📋 <span>Forms</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
        <main className="main-padding" style={{ flex: 1, overflow: "auto", padding: "22px" }}>
          {view === "dashboard" && <DashView key={`dash-${contactsVersion}`} supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} setView={setView} events={events} setActiveEvent={setActiveEvent} showMorningBrief={showMorningBrief} setShowMorningBrief={setShowMorningBrief} setShowNewEvent={setShowNewEvent} lpPublished={lpPublished} campaigns={campaigns} />}
          {view === "edm" && profile && <EdmView key={`edm-${campaignsVersion}`} supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} setView={setView} />}
          {view === "landing" && profile && <LandingView key="landing" supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} formShareLink={formShareLink} setLpPublished={setLpPublished} setView={setView} />}
          {view === "forms" && profile && <FormsView key="forms" supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} onFormSaved={() => {
            if (!activeEvent?.id) return;
            supabase.from("forms").select("share_token").eq("event_id", activeEvent.id).eq("is_active", true).limit(1).maybeSingle()
              .then(({ data }) => setRootFormShareLink(data?.share_token ? `${window.location.origin}/form/${data.share_token}` : ""));
          }} />}
          {view === "contacts" && profile && <ContactView key="contacts" supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} onContactsChanged={() => setContactsVersion(v => v + 1)} />}
          {view === "schedule" && profile && <ScheduleView key={`schedule-${campaignsVersion}`} supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} addNotif={addNotif} setView={setView} />}
          {view === "checkin"   && profile && <CheckInView key={`checkin-${contactsVersion}`}  supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "social"    && profile && <SocialView key="social"   supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "analytics" && profile && <AnalyticsView key="analytics" supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} campaigns={campaigns} events={events} />}
          {view === "campaign"  && profile && <CampaignView key="campaign"  supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} setView={setView} />}
          {view === "calendar"  && <CalendarView supabase={supabase} profile={profile} events={events} setActiveEvent={setActiveEvent} setView={setView} fire={fire} campaigns={campaigns} activeEvent={activeEvent} />}
          {view === "overview"  && <MultiEventView supabase={supabase} profile={profile} events={events} setActiveEvent={setActiveEvent} setView={setView} fire={fire} />}
          {view === "qa"        && <QAView      supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "seating"   && <SeatingView supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "agenda"    && <AgendaView   supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "feedback"  && profile && <FeedbackView key="feedback"  supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "lifecycle" && <LifecycleView supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "roi"       && <ROIView      supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "settings"  && <SettingsView supabase={supabase} profile={profile} fire={fire} />}
        </main>
        {/* ── NEXT STEP BANNER ── */}
        {activeEvent && (() => {
          const s1 = campaigns.some(c => c.html_content);
          const s2 = lpPublished;
          const s3 = !!formShareLink;
          const s4 = campaigns.some(c => c.status === "scheduled" || c.status === "sent");

          const cfg = {
            edm: {
              ready: s1, readyTip: "✅ Email drafted — next, build your Landing Page",
              pendingTip: "Draft and save at least one email to continue",
              nextView: "landing", nextLabel: "Build Landing Page",
            },
            landing: {
              ready: s2, readyTip: "✅ Landing page approved — now approve your registration form",
              pendingTip: "Approve your Invite Landing Page to continue",
              nextView: "forms", nextLabel: "✓ Approve Form →",
            },
            forms: {
              ready: s3, readyTip: "✅ Form active — next, schedule your emails",
              pendingTip: "Activate your form to continue",
              nextView: "schedule", nextLabel: "Go to Schedule",
            },
            schedule: {
              ready: s4, readyTip: "🎉 Campaign scheduled! Track performance in Analytics.",
              pendingTip: "Schedule at least one email to launch your campaign",
              nextView: "analytics", nextLabel: "View Analytics",
            },
          };

          const b = cfg[view];
          if (!b) return null;
          if (view === 'edm') return null; // User reviews emails individually — no bar needed

          const col = b.ready ? C.green : C.amber;
          return (
            <div style={{ borderTop:`1px solid ${col}25`, background:`${col}07`, padding:"9px 22px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:col, flexShrink:0 }} />
                <span style={{ fontSize:12.5, color: b.ready ? C.text : C.muted, lineHeight:1.4 }}>
                  {b.ready ? b.readyTip : b.pendingTip}
                </span>
              </div>
              {b.ready && (
                <button onClick={() => setView(b.nextView)}
                  style={{ background:C.blue, border:"none", borderRadius:7, color:"#fff", fontSize:12.5, fontWeight:600, padding:"7px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap", flexShrink:0, boxShadow:`0 4px 12px ${C.blue}40` }}>
                  {b.nextLabel} →
                </button>
              )}
            </div>
          );
        })()}
      </div>

      {/* NEW EVENT MODAL */}
      {showNewEvent && (() => {
        const closeModal = () => { setShowNewEvent(false); setBriefText(""); setBriefParsed(null); setBriefMode(true); setNewEventName(""); setNewEventExtra({ event_date:"", event_time:"", location:"" }); setSelectedEmailTypes(["save_the_date","invite","reminder","confirmation","thank_you"]); };
        const parseBrief = async () => {
          if (briefText.trim().length < 10 || briefParsing) return;
          setBriefParsing(true);
          try {
            const { data: { session: sess } } = await supabase.auth.getSession();
            const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
              method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${sess?.access_token}`},
              body: JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:700,
                messages:[{ role:"user", content:`Parse this event brief and extract structured data. Return ONLY valid JSON, no markdown.\n\nBrief: "${briefText}"\n\nReturn JSON:\n{"name":"event name (concise, professional)","event_date":"YYYY-MM-DD or null","event_time":"readable time like 6:30 PM or null","location":"venue name and city or null","event_type":"conference|dinner|workshop|webinar|networking|gala|launch|training|awards|other","description":"2-3 sentence summary of purpose, audience and tone","audience":"who is attending","tone":"formal|semi-formal|casual|energetic|intimate","capacity":null}` }]
              })
            });
            const d = await res.json();
            const text = (d.content?.[0]?.text || "{}").replace(/\`\`\`json|\`\`\`/g,"").trim();
            const parsed = JSON.parse(text);
            setBriefParsed(parsed);
            setNewEventName(parsed.name || "");
            setNewEventExtra({ event_date: parsed.event_date||"", event_time: parsed.event_time||"", location: parsed.location||"", event_type: parsed.event_type||"", description: parsed.description||"", event_format:"" });
          } catch(e) { fire("Couldn\'t parse brief — try being more specific", "err"); }
          finally { setBriefParsing(false); }
        };
        return (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.88)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:99, padding:20 }}>
          <div className="evara-modal" style={{ background:C.card, borderRadius:20, border:`1px solid ${C.border}`, width:580, animation:"fadeUp .22s cubic-bezier(.34,1.56,.64,1)", boxShadow:"0 32px 80px rgba(0,0,0,.9)", overflow:"hidden" }}>

            {/* Header */}
            <div style={{ background:`linear-gradient(135deg,${C.blue}18,${C.teal}08)`, padding:"22px 26px 18px", borderBottom:`1px solid ${C.border}`, position:"relative" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${C.blue},${C.teal})`, borderRadius:"20px 20px 0 0" }} />
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:"2px", color:briefParsed?C.green:C.blue, marginBottom:6 }}>
                    {briefParsed ? "✅ BRIEF UNDERSTOOD · REVIEW & CONFIRM" : "✨ EVENT BRIEF"}
                  </div>
                  <h2 style={{ fontSize:20, fontWeight:800, color:C.text, margin:0, letterSpacing:"-0.4px" }}>
                    {briefParsed ? briefParsed.name : "Tell me about your event"}
                  </h2>
                  {!briefParsed && <p style={{ fontSize:12, color:C.muted, marginTop:5, lineHeight:1.5 }}>The more you share, the better your AI-generated emails will be</p>}
                </div>
                <button onClick={closeModal} style={{ background:C.raised, border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, cursor:"pointer", width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>×</button>
              </div>
            </div>

            <div style={{ padding:"22px 26px" }}>

            {/* ── STEP 1: BRIEF INPUT ── */}
            {!briefParsed && (<>
              {/* What to include guide */}
              <div style={{ background:`${C.blue}08`, border:`1px solid ${C.blue}20`, borderRadius:10, padding:"12px 14px", marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:600, color:C.blue, marginBottom:8 }}>💡 Include as much as you can:</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 16px" }}>
                  {["Event name & type (dinner, conference, webinar…)","Date and time","Venue / location / city","Number of attendees","Who is attending (audience)","Goal or purpose of the event","Dress code or formality","Any key themes or agenda items"].map(tip => (
                    <div key={tip} style={{ fontSize:11, color:C.muted, display:"flex", gap:5, alignItems:"flex-start", lineHeight:1.4 }}>
                      <span style={{ color:C.blue, flexShrink:0 }}>·</span>{tip}
                    </div>
                  ))}
                </div>
              </div>

              {/* Example prompts */}
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
                {[
                  "Client appreciation dinner for 30 CFOs at Four Seasons Sydney, 20 June 6:30pm, formal, goal is Q3 relationship building",
                  "Product launch webinar for 500 marketers, 15 May 2pm AEST, casual energetic tone, showcasing our new AI platform",
                  "Annual leadership summit for 80 senior executives, Melbourne CBD, 2-day conference, formal, keynotes and roundtables",
                ].map(ex => (
                  <button key={ex} onClick={() => setBriefText(ex)}
                    style={{ fontSize:10.5, padding:"5px 10px", borderRadius:6, border:`1px solid ${C.border}`, background:C.raised, color:C.muted, cursor:"pointer", textAlign:"left", lineHeight:1.4, transition:"all .12s" }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.color=C.blue;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
                    💡 {ex.slice(0,55)}…
                  </button>
                ))}
              </div>

              {/* Brief textarea */}
              <textarea value={briefText} onChange={e => setBriefText(e.target.value)}
                onKeyDown={e => { if (e.key==="Enter" && (e.metaKey||e.ctrlKey) && briefText.trim().length>10) { e.preventDefault(); parseBrief(); } }}
                autoFocus rows={5}
                placeholder={"e.g. Annual client appreciation dinner for our top 25 banking clients at The Ritz-Carlton, Bangalore on 20 May 2026, 7pm. Black tie optional. Goal is to strengthen relationships ahead of Q3 renewals. 3-course dinner, live jazz, keynote from our CEO. Expect senior decision-makers — CFOs, MDs and board members."}
                style={{ width:"100%", background:C.bg, border:`1.5px solid ${briefText.length>10?C.blue:C.border}`, borderRadius:10, color:C.text, padding:"13px 15px", fontSize:13, outline:"none", resize:"none", lineHeight:1.65, boxSizing:"border-box", fontFamily:"Outfit,sans-serif", transition:"border-color .15s" }} />
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:6, marginBottom:18 }}>
                <span style={{ fontSize:11, color:C.muted }}>⌘+Enter to continue</span>
                <span style={{ fontSize:11, color:briefText.length>10?C.green:C.muted, fontWeight:600 }}>{briefText.length>10?"✓ Ready to parse":"Keep going…"}</span>
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={closeModal} style={{ flex:1, padding:12, background:C.raised, border:`1px solid ${C.border}`, borderRadius:9, color:C.muted, fontSize:13, fontWeight:500, cursor:"pointer" }}>Cancel</button>
                <button onClick={parseBrief} disabled={briefText.trim().length<10||briefParsing}
                  style={{ flex:2, padding:13, background:briefText.length>10&&!briefParsing?C.blue:C.border, border:"none", borderRadius:9, color:"#fff", fontSize:14, fontWeight:700, cursor:briefText.length>10&&!briefParsing?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:briefText.length>10&&!briefParsing?`0 6px 24px ${C.blue}50`:"none", transition:"all .15s" }}>
                  {briefParsing ? <><Spin />AI is reading your brief…</> : <><Sparkles size={14} />Parse with AI →</>}
                </button>
              </div>
            </>)}

            {/* ── STEP 2: CONFIRM PARSED ── */}
            {briefParsed && (<>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:18 }}>
                {[
                  { label:"Event Name", key:"name", val:briefParsed.name, edit:v=>setBriefParsed(p=>({...p,name:v})) },
                  { label:"Date", key:"event_date", val:briefParsed.event_date||"", edit:v=>setBriefParsed(p=>({...p,event_date:v})), type:"date" },
                  { label:"Time", key:"event_time", val:briefParsed.event_time||"", edit:v=>setBriefParsed(p=>({...p,event_time:v})) },
                  { label:"Venue / Location", key:"location", val:briefParsed.location||"", edit:v=>setBriefParsed(p=>({...p,location:v})) },
                  { label:"Audience", key:"audience", val:briefParsed.audience||"", edit:v=>setBriefParsed(p=>({...p,audience:v})) },
                ].map(f => (
                  <div key={f.key} style={{ display:"grid", gridTemplateColumns:"120px 1fr", alignItems:"center", gap:10 }}>
                    <div style={{ fontSize:10.5, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px" }}>{f.label}</div>
                    <input type={f.type||"text"} value={f.val} onChange={e=>f.edit(e.target.value)}
                      style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:7, color:C.text, padding:"8px 12px", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" }}
                      onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                  </div>
                ))}
                <div style={{ display:"grid", gridTemplateColumns:"120px 1fr", alignItems:"flex-start", gap:10 }}>
                  <div style={{ fontSize:10.5, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", paddingTop:8 }}>Description</div>
                  <textarea value={briefParsed.description||""} onChange={e=>setBriefParsed(p=>({...p,description:e.target.value}))} rows={2}
                    style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:7, color:C.text, padding:"8px 12px", fontSize:13, outline:"none", width:"100%", resize:"none", boxSizing:"border-box", fontFamily:"Outfit,sans-serif" }}
                    onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                </div>
              </div>

              {/* Email type picker */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:10, fontWeight:700, color:C.muted, letterSpacing:"1px", marginBottom:8 }}>WHICH EMAILS DO YOU NEED?</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {[
                    { id:"save_the_date", label:"Save the Date", emoji:"📅" },
                    { id:"invite",        label:"Invite",         emoji:"✉️" },
                    { id:"reminder",      label:"Reminder",       emoji:"⏰" },
                    { id:"confirmation",  label:"Confirmation",   emoji:"✅" },
                    { id:"byo",           label:"BYO / Details",  emoji:"📋" },
                    { id:"thank_you",     label:"Thank You",      emoji:"🙏" },
                  ].map(et => {
                    const sel = selectedEmailTypes.includes(et.id);
                    return (
                      <button key={et.id} onClick={() => setSelectedEmailTypes(prev => sel ? prev.filter(x=>x!==et.id) : [...prev, et.id])}
                        style={{ fontSize:11, padding:"5px 10px", borderRadius:20, border:`1.5px solid ${sel ? C.blue : C.border}`, background: sel ? `${C.blue}15` : "transparent", color: sel ? C.blue : C.muted, cursor:"pointer", display:"flex", alignItems:"center", gap:4, transition:"all .15s" }}>
                        <span style={{fontSize:12}}>{et.emoji}</span>{et.label}
                      </button>
                    );
                  })}
                </div>
                {selectedEmailTypes.length === 0 && <p style={{ fontSize:11, color:C.red, marginTop:6 }}>Select at least one email type</p>}
              </div>

              <div style={{ background:`${C.blue}08`, border:`1px solid ${C.blue}20`, borderRadius:9, padding:"10px 14px", marginBottom:18, display:"flex", alignItems:"center", gap:10 }}>
                <Sparkles size={14} color={C.blue} />
                <span style={{ fontSize:12, color:C.blue, lineHeight:1.5 }}><strong>AI will auto-draft</strong> {selectedEmailTypes.length} email{selectedEmailTypes.length!==1?"s":""}, a landing page and a registration form using this brief. Ready in seconds.</span>
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setBriefParsed(null)} style={{ flex:1, padding:12, background:C.raised, border:`1px solid ${C.border}`, borderRadius:9, color:C.muted, fontSize:13, fontWeight:500, cursor:"pointer" }}>← Re-brief</button>
                <button disabled={selectedEmailTypes.length === 0} onClick={async () => {
                  if (!profile || selectedEmailTypes.length === 0) return;
                  setNewEventName(briefParsed.name||"");
                  setNewEventExtra({ event_date:briefParsed.event_date||"", event_time:briefParsed.event_time||"", location:briefParsed.location||"", event_type:briefParsed.event_type||"", description:briefParsed.description||"", event_format:"", selectedEmailTypes });
                  closeModal();
                  await createEvent(briefParsed.name, { event_date:briefParsed.event_date||"", event_time:briefParsed.event_time||"", location:briefParsed.location||"", event_type:briefParsed.event_type||"", description:briefParsed.description||"", event_format:"", selectedEmailTypes });
                }} style={{ flex:2, padding:13, background: selectedEmailTypes.length === 0 ? C.border : C.blue, border:"none", borderRadius:9, color:"#fff", fontSize:14, fontWeight:700, cursor: selectedEmailTypes.length === 0 ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow: selectedEmailTypes.length === 0 ? "none" : `0 6px 24px ${C.blue}50`, transition:"all .15s" }}>
                  <Sparkles size={14} />✨ Create Event + AI Draft →
                </button>
              </div>
            </>)}

            </div>
          </div>
        </div>
        );
      })()}

      )

      {showDupModal && activeEvent && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}
          onClick={() => setShowDupModal(false)}>
          <div style={{ background:C.card, borderRadius:14, border:`1px solid ${C.border}`, padding:28, width:440, animation:"fadeUp .2s ease" }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:4 }}>Duplicate Event</h2>
            <p style={{ fontSize:12, color:C.muted, marginBottom:20 }}>Creates a new draft with all email templates copied. Date references and event name are automatically updated.</p>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:"block", fontSize:11.5, color:C.muted, marginBottom:5 }}>New event name *</label>
              <input value={dupName} onChange={e => setDupName(e.target.value)} autoFocus
                style={{ width:"100%", background:C.bg, border:`1.5px solid ${dupName?C.blue:C.border}`, borderRadius:8, color:C.text, padding:"10px 13px", fontSize:13, outline:"none", boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=dupName?C.blue:C.border} />
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:11.5, color:C.muted, marginBottom:5 }}>New event date <span style={{ opacity:.6 }}>(optional)</span></label>
              <input type="date" value={dupDate} onChange={e => setDupDate(e.target.value)}
                style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"10px 13px", fontSize:13, outline:"none", boxSizing:"border-box" }} />
            </div>
            <div style={{ background:C.raised, borderRadius:8, padding:"10px 14px", marginBottom:20, fontSize:12, color:C.muted }}>
              <div style={{ fontWeight:600, color:C.text, marginBottom:4 }}>What gets copied</div>
              {[`${campaigns.filter(c=>c.html_content).length} email templates → reset to draft`, "Event details (type, format, location, capacity)", "Landing page content"].map(t => (
                <div key={t} style={{ display:"flex", gap:6, marginBottom:2 }}>
                  <span style={{ color:C.green }}>✓</span><span>{t}</span>
                </div>
              ))}
              <div style={{ display:"flex", gap:6, marginTop:4, opacity:.5 }}>
                <span>✗</span><span>Contacts / RSVPs (not copied)</span>
              </div>
            </div>
            <div style={{ display:"flex", gap:9 }}>
              <button onClick={() => setShowDupModal(false)} style={{ flex:1, padding:"10px 0", background:"transparent", border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button disabled={!dupName.trim() || duping} onClick={async () => {
                if (!dupName.trim() || !profile) return;
                setDuping(true);
                const shareToken = Math.random().toString(36).substring(2,14) + Date.now().toString(36);
                const { data: newEv } = await supabase.from("events").insert({
                  name: dupName.trim(), event_date: dupDate || null,
                  event_time: activeEvent.event_time, location: activeEvent.location,
                  description: activeEvent.description, event_type: activeEvent.event_type,
                  event_format: activeEvent.event_format, capacity: activeEvent.capacity,
                  expected_attendees: activeEvent.expected_attendees,
                  company_id: profile.company_id, status:"draft",
                  created_by: profile.id, share_token: shareToken,
                }).select().single();
                if (!newEv) { fire("Failed to duplicate event","err"); setDuping(false); return; }
                setEvents(p => [...p, newEv]);
                setActiveEvent(newEv);
                setShowDupModal(false);
                // Copy campaigns — update date references if new date provided
                const { data: existingCams } = await supabase.from("email_campaigns").select("*").eq("event_id", activeEvent.id).limit(20);
                let camCount = 0;
                if (existingCams?.length) {
                  const oldDate = activeEvent.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU",{day:"numeric",month:"long",year:"numeric"}) : null;
                  const newDateFmt = dupDate ? new Date(dupDate).toLocaleDateString("en-AU",{day:"numeric",month:"long",year:"numeric"}) : null;
                  const dupCams = existingCams.filter(c => c.html_content).map(c => {
                    let html = c.html_content || "";
                    let plain = c.plain_text || "";
                    let subj = c.subject || "";
                    // Update old event name references
                    html = html.replace(new RegExp(activeEvent.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi'), dupName.trim());
                    plain = plain.replace(new RegExp(activeEvent.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi'), dupName.trim());
                    subj = subj.replace(new RegExp(activeEvent.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi'), dupName.trim());
                    // Update date references if both old and new dates exist
                    if (oldDate && newDateFmt) {
                      html = html.replace(new RegExp(oldDate, 'gi'), newDateFmt);
                      plain = plain.replace(new RegExp(oldDate, 'gi'), newDateFmt);
                    }
                    return {
                      event_id: newEv.id, company_id: profile.company_id,
                      name: c.name?.replace(activeEvent.name, dupName.trim()) || c.name,
                      email_type: c.email_type, subject: subj,
                      html_content: html, plain_text: plain,
                      template_style: c.template_style, status:"draft", segment: c.segment || "all",
                    };
                  });
                  if (dupCams.length) { await supabase.from("email_campaigns").insert(dupCams); camCount = dupCams.length; }
                }
                // Copy landing page
                const { data: lp } = await supabase.from("landing_pages").select("*").eq("event_id", activeEvent.id).maybeSingle();
                if (lp) {
                  const newSlug = dupName.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") + "-" + Date.now().toString(36);
                  await supabase.from("landing_pages").insert({ ...lp, id: undefined, event_id: newEv.id, slug: newSlug, created_at: undefined, updated_at: undefined });
                }
                fire(`✅ "${dupName.trim()}" created with ${camCount} email drafts!`);
                setDuping(false);
                setDupName(""); setDupDate("");
                setView("dashboard");
              }} style={{ flex:2, padding:"10px 0", background:dupName.trim()?C.blue:C.border, border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:600, cursor:dupName.trim()?"pointer":"default" }}>
                {duping ? "Duplicating…" : "⧉ Duplicate Event →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && activeEvent && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300 }}
          onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="evara-modal" style={{ background:C.card, borderRadius:14, border:`1.5px solid ${C.red}40`, padding:28, width:440, animation:"fadeUp .2s ease" }}
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:`${C.red}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>🗑</div>
              <div>
                <h2 style={{ fontSize:16, fontWeight:700, color:C.text, margin:0 }}>Delete Event</h2>
                <p style={{ fontSize:12, color:C.muted, margin:0, marginTop:2 }}>This action cannot be undone</p>
              </div>
            </div>
            {/* Event name pill */}
            <div style={{ background:C.raised, borderRadius:8, padding:"10px 14px", marginBottom:16, border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:3 }}>Event to be deleted</div>
              <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{activeEvent.name}</div>
            </div>
            {/* Warning list */}
            <div style={{ background:`${C.red}0a`, borderRadius:8, padding:"10px 14px", marginBottom:22, border:`1px solid ${C.red}20` }}>
              <div style={{ fontSize:11.5, fontWeight:600, color:C.red, marginBottom:6 }}>The following will be permanently removed:</div>
              {["All email drafts & campaigns", "Landing page", "Registration form", "All associated data"].map(item => (
                <div key={item} style={{ display:"flex", gap:6, alignItems:"center", marginBottom:3, fontSize:12, color:C.muted }}>
                  <span style={{ color:C.red, fontSize:10 }}>✕</span>{item}
                </div>
              ))}
            </div>
            {/* Actions */}
            <div style={{ display:"flex", gap:9 }}>
              <button onClick={() => setShowDeleteModal(false)} disabled={deleting}
                style={{ flex:1, padding:"10px 0", background:"transparent", border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, fontSize:13, fontWeight:500, cursor:"pointer" }}>
                Cancel
              </button>
              <button disabled={deleting} onClick={async () => {
                  setDeleting(true);
                  try {
                    await supabase.from("email_campaigns").delete().eq("event_id", activeEvent.id);
                    await supabase.from("landing_pages").delete().eq("event_id", activeEvent.id);
                    await supabase.from("forms").delete().eq("event_id", activeEvent.id);
                    await supabase.from("events").delete().eq("id", activeEvent.id);
                    const remaining = events.filter(e => e.id !== activeEvent.id);
                    setEvents(remaining);
                    setActiveEvent(remaining[0] || null);
                    setView("dashboard");
                    setShowDeleteModal(false);
                    fire("Event deleted");
                  } catch(err) {
                    fire("Delete failed — try again", "err");
                  } finally {
                    setDeleting(false);
                  }
                }}
                style={{ flex:1, padding:"10px 0", background:C.red, border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:600, cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.7 : 1 }}>
                {deleting ? "Deleting…" : "Yes, delete event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position:"fixed", top:20, right:20, background:"rgba(18,18,22,.96)", border:`1px solid ${toast.type==="ok"?C.green:toast.type==="err"?C.red:toast.type==="warn"?C.amber:C.blue}40`, borderRadius:14, padding:"0", display:"flex", flexDirection:"column", animation:"toast-in .22s cubic-bezier(.34,1.56,.64,1)", zIndex:9999, whiteSpace:"nowrap", boxShadow:`0 20px 60px rgba(0,0,0,.8),0 0 0 1px rgba(255,255,255,.04), inset 0 1px 0 rgba(255,255,255,.05)`, backdropFilter:"blur(20px)", overflow:"hidden", minWidth:300, maxWidth:420 }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${toast.type==="ok"?C.green:toast.type==="err"?C.red:toast.type==="warn"?C.amber:C.blue}80, transparent)` }} />
          <div style={{ display:"flex", alignItems:"flex-start", gap:11, padding:"14px 16px 12px" }}>
            <div style={{ width:28, height:28, borderRadius:8, background:`${toast.type==="ok"?C.green:toast.type==="err"?C.red:toast.type==="warn"?C.amber:C.blue}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
              <span style={{ fontSize:13 }}>{toast.type==="ok"?"✅":toast.type==="err"?"❌":toast.type==="warn"?"⚠️":"💬"}</span>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11, fontWeight:700, color:toast.type==="ok"?C.green:toast.type==="err"?C.red:toast.type==="warn"?C.amber:C.blue, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:3 }}>{toast.type==="ok"?"Success":toast.type==="err"?"Error":toast.type==="warn"?"Warning":"Info"}</div>
              <div style={{ fontSize:13, color:C.text, whiteSpace:"normal", lineHeight:1.5 }}>{toast.msg}</div>
            </div>
            <button onClick={() => setToast(null)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:18, padding:"0 2px", lineHeight:1, flexShrink:0, marginTop:2, opacity:.7 }}>×</button>
          </div>
          <div style={{ height:2, background:`${toast.type==="ok"?C.green:toast.type==="err"?C.red:toast.type==="warn"?C.amber:C.blue}20` }}>
            <div style={{ height:"100%", background:`linear-gradient(90deg,${toast.type==="ok"?C.green:toast.type==="err"?C.red:toast.type==="warn"?C.amber:C.blue},${toast.type==="ok"?C.teal:toast.type==="err"?"#FF6B6B":toast.type==="warn"?"#FFD93D":C.teal})`, animation:"toastProgress 4.5s linear forwards", borderRadius:1 }} />
          </div>
        </div>
      )}
      <style>{`@keyframes toastProgress{from{width:100%}to{width:0%}}`}</style>
    </div>
  );
}

// ─── EMAIL ACTIVITY TIMELINE ─────────────────────────────────
function App() {
  const path = window.location.pathname;

  // /form/:token
  if (path.startsWith("/form/")) {
    const token = path.split("/form/")[1]?.split("/")[0];
    if (token) return <PublicFormPage token={token} />;
  }

  // /page/:slug
  if (path.startsWith("/page/")) {
    const slug = path.split("/page/")[1]?.split("/")[0];
    if (slug) return <PublicLandingPage slug={slug} />;
  }

  // /unsubscribe
  if (path.startsWith("/unsubscribe")) return <UnsubscribePage />;

  // /checkin/:eventId
  if (path.startsWith("/checkin/")) {
    const eventId = path.split("/checkin/")[1]?.split("/")[0];
    if (eventId) return <PublicCheckInPage eventId={eventId} />;
  }

  // /dashboard/:token
  if (path.startsWith("/dashboard/")) {
    const token = path.split("/dashboard/")[1]?.split("/")[0];
    if (token) return <PublicDashboardPage token={token} />;
  }

  // /pricing
  if (path === "/pricing") return <PricingPage />;

  // Authenticated app
  return <AuthedApp />;
}

function AuthedApp() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <Splash />;
  if (!session) return <AuthScreen />;
  return <MainApp session={session} />;
}

export default App;



