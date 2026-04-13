import { LayoutDashboard, Calendar, BarChart2, Layout, UserCheck2, ClipboardList, Megaphone, Users, TrendingUp } from "lucide-react";
import { useState } from "react";

// ViewHint
export function ViewHint({ id, icon, title, steps, color = "#0A84FF" }) {
  const key = `evara_hint_${id}`;
  const [visible, setVisible] = useState(() => !localStorage.getItem(key));
  if (!visible) return null;
  const dismiss = () => { localStorage.setItem(key, "1"); setVisible(false); };
  return (
    <div style={{ background:`${color}08`, border:`1px solid ${color}25`, borderRadius:10, padding:"14px 16px", marginBottom:14, position:"relative", animation:"fadeUp .3s ease" }}>
      <button onClick={dismiss} style={{ position:"absolute", top:10, right:12, background:"transparent", border:"none", color:"#636366", cursor:"pointer", fontSize:16, lineHeight:1 }}>×</button>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
        <div style={{ width:30, height:30, borderRadius:8, background:`${color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>{icon}</div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"#F5F5F7" }}>{title}</div>
          <div style={{ fontSize:11, color:"#636366", marginTop:1 }}>Click × to dismiss — won't show again</div>
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:9 }}>
            <div style={{ width:18, height:18, borderRadius:5, background:`${color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color, flexShrink:0, marginTop:1 }}>{i+1}</div>
            <div style={{ fontSize:12.5, color:"#AEAEB2", lineHeight:1.5 }}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZGRwanNndHdibG1rZ3hxeXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODk5NTAsImV4cCI6MjA4OTY2NTk1MH0.x5BOfQRzn-F_tvUJv3mHRmfdOZiklyMkGzmPfRYoII4";

// Block personal/free email domains
const BLOCKED_DOMAINS = [
  "gmail.com","googlemail.com","yahoo.com","yahoo.co.in","yahoo.co.uk",
  "yahoo.com.au","ymail.com","hotmail.com","hotmail.co.uk","hotmail.co.in",
  "outlook.com","outlook.co.in","live.com","msn.com","rediffmail.com",
  "rediff.com","icloud.com","me.com","mac.com","aol.com","protonmail.com",
  "proton.me","tutanota.com","zoho.com","mail.com","inbox.com","gmx.com",
  "gmx.net","yandex.com","yandex.ru","mail.ru","qq.com","163.com","126.com",
  "tempmail.com","throwaway.email","mailinator.com","guerrillamail.com"
];

export const isBusinessEmail = (email) => {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1]?.toLowerCase();
  return domain && !BLOCKED_DOMAINS.includes(domain);
};

export const C = {
  bg:"#080809", sidebar:"#0D0D0F", card:"#111114", raised:"#161619",
  border:"#1C1C1F", borderHi:"#2C2C30",
  blue:"#0A84FF", text:"#F5F5F7", sec:"#AEAEB2", muted:"#636366",
  green:"#30D158", red:"#FF453A", amber:"#FF9F0A", teal:"#5AC8FA",
};

// Generate an ICS calendar file string
export const generateICS = (event) => {
  const formatDate = (dateStr, timeStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr + (timeStr ? "T" + timeStr.replace(/[^\d:]/g, "").replace(/^(\d):/, "0$1:") + ":00" : "T090000"));
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  };
  const start = formatDate(event.event_date, event.event_time);
  if (!start) return null;
  const end = formatDate(event.event_date, null); // Default 2hr event
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//evara//EN",
    "BEGIN:VEVENT",
    `DTSTART:${start}`,
    `DTEND:${end || start}`,
    `SUMMARY:${event.name}`,
    event.location ? `LOCATION:${event.location}` : "",
    event.description ? `DESCRIPTION:${event.description}` : "",
    "END:VEVENT", "END:VCALENDAR"
  ].filter(Boolean).join("\n");
  return ics;
};

export const ST = {
  confirmed:{ label:"Confirmed", color:C.green  },
  declined: { label:"Declined",  color:C.red    },
  pending:  { label:"Pending",   color:C.amber  },
  attended: { label:"Attended",  color:C.blue   },
  invited:  { label:"Invited",   color:C.teal   },
  waitlist: { label:"Waitlist",  color:"#8B5CF6" },
};

export const NAV_GROUPS = [
  { label: "Overview", items: [
    { id:"dashboard", label:"Dashboard",  icon:LayoutDashboard },
    { id:"calendar",  label:"Calendar",   icon:Calendar },
    { id:"analytics", label:"Analytics",  icon:BarChart2 },
    { id:"overview",  label:"All Events", icon:Layout },
  ]},
  { label: "Event Day", items: [
    { id:"checkin",   label:"Check-in",    icon:UserCheck2 },
    { id:"agenda",    label:"Agenda",      icon:ClipboardList },
    { id:"seating",   label:"Seating",     icon:Layout },
    { id:"qa",        label:"Live Q&A",    icon:Megaphone },
  ]},
  { label: "Intelligence", items: [
    { id:"contacts",  label:"Contacts",      icon:Users },
    { id:"lifecycle", label:"Contacts 360",  icon:TrendingUp },
    { id:"feedback",  label:"Feedback",      icon:ClipboardList, badge:"AI" },
    { id:"roi",       label:"ROI",           icon:BarChart2 },
  ]},
];

// Top bar BUILD tools — ordered by event flow
export const BUILD_NAV = [
  { id:"edm",      label:"Emails",       icon:"✉️", badge:"AI", step:1, hint:"Build & review your AI-generated emails" },
  { id:"landing",  label:"Landing Page", icon:"🌐", step:2,     hint:"Publish your event page — form lives here" },
  { id:"schedule", label:"Schedule",     icon:"📅", step:3,     hint:"Add contacts and set your send dates" },
  { id:"analytics",label:"Results",      icon:"📊", step:4,     hint:"Track opens, clicks and attendance" },
];
export const NAV = NAV_GROUPS.flatMap(g => g.items);

export const EMAIL_TYPES = [
  {id:"save_the_date",label:"Save the Date"},
  {id:"invitation",   label:"Invitation"},
  {id:"reminder",     label:"Reminder"},
  {id:"confirmation", label:"Confirmation"},
  {id:"byo",          label:"BYO / Details"},
  {id:"day_of",       label:"Day-of Details"},
  {id:"thank_you",    label:"Thank You"},
];

export const ini = n => n?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() || "?";

// ─── WORLD-CLASS EMAIL TEMPLATE BUILDER ─────────────────────
// Builds beautiful, table-based, Outlook-safe HTML emails
// from AI-generated content JSON. Zero reliance on AI for HTML.

// ImageUploadZone  
export function ImageUploadZone({ label, sublabel, url, onUpload, onClear, uploading }) {
  const ref = useRef();
  const [dragging, setDragging] = useState(false);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 5, fontWeight: 500 }}>{label}</div>
      {url ? (
        <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: `1px solid ${C.green}40` }}>
          <img src={url} alt={label} style={{ display: "block", width: "100%", maxHeight: 80, objectFit: "cover" }} />
          <button onClick={onClear}
            style={{ position: "absolute", top: 5, right: 5, background: "rgba(0,0,0,.75)", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
            <X size={11} />
          </button>
          <div style={{ position: "absolute", bottom: 5, left: 8, fontSize: 10, color: "rgba(255,255,255,.9)", background: "rgba(0,0,0,.5)", padding: "2px 6px", borderRadius: 3 }}>✓ Uploaded</div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && ref.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f && f.type.startsWith("image/")) onUpload(f); }}
          style={{ border: `1.5px dashed ${dragging?C.blue:C.borderHi}`, borderRadius: 8, padding: "14px 10px", textAlign: "center", cursor: uploading ? "default" : "pointer", background: dragging?`${C.blue}08`:C.bg, transition: "all .15s" }}
          onMouseEnter={e => !uploading && !dragging && (e.currentTarget.style.borderColor = C.blue)}
          onMouseLeave={e => !dragging && (e.currentTarget.style.borderColor = C.borderHi)}
        >
          <input ref={ref} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display: "none" }}
            onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
          {uploading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 11, color: C.muted }}>
              <Spin size={12} />Uploading…
            </div>
          ) : (
            <>
              <Upload size={16} color={dragging?C.blue:C.muted} strokeWidth={1.5} style={{ marginBottom: 5 }} />
              <div style={{ fontSize: 11.5, color: dragging?C.blue:C.muted, fontWeight: dragging?500:400 }}>{dragging?"Drop to upload":sublabel || `Upload ${label}`}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2, opacity: 0.7 }}>Drag & drop or click · PNG, JPG, GIF · max 3MB</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SCORE BADGE ─────────────────────────────────────────────

// ScoreBadge
export function ScoreBadge({ score }) {
  const pts = typeof score === "object" ? (score?.score || 0) : (score || 0);
  const color = pts >= 20 ? C.green : pts >= 10 ? C.amber : pts >= 3 ? C.blue : C.muted;
  const label = pts >= 20 ? "🔥 Hot" : pts >= 10 ? "⚡ Warm" : pts >= 3 ? "👀 Engaged" : "Cold";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ background: `${color}18`, border: `1px solid ${color}35`, borderRadius: 5, padding: "2px 7px", display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 11, color, fontWeight: 700 }}>{pts}</span>
        <span style={{ fontSize: 10, color, fontWeight: 400 }}>{label}</span>
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [booting, setBooting] = useState(true);
  
  // Public routes - no auth needed
  const path = window.location.pathname;
  if (path.startsWith('/form/')) {
    const token = path.replace('/form/', '');
    return <PublicFormPage token={token} />;
  }
  if (path.startsWith('/checkin/')) {
    const eventId = path.replace('/checkin/', '');
    return <PublicCheckInPage eventId={eventId} />;
  }
  if (path === '/unsubscribe') {
    return <UnsubscribePage />;
  }
  if (path.startsWith('/page/')) {
    const slug = path.replace('/page/', '');
    return <PublicLandingPage slug={slug} />;
  }
  if (path.startsWith('/share/')) {
    const shareToken = path.replace('/share/', '');
    return <PublicDashboardPage token={shareToken} />;
  }
  if (path === '/unsubscribe' || path.startsWith('/unsubscribe')) {
    return <UnsubscribePage />;
  }
  if (path === '/pricing' || path === '/waitlist') {
    return <PricingPage />;
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setBooting(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);
  if (booting) return <Splash />;
  if (!session) return <AuthScreen />;
  return <MainApp session={session} />;
}

// ─── ONBOARDING FLOW ─────────────────────────────────────────

// Inp, Alert, Spin
export function Inp({ label, value, set, ph, type = "text" }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11.5, color: C.muted, marginBottom: 5 }}>{label}</label>
      <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={ph} required
        style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, padding: "10px 12px", fontSize: 13, outline: "none", transition: "border-color .15s" }}
        onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
    </div>
  );
}


export function Alert({ type, children }) {
  const color = type === "error" ? C.red : C.green;
  const Icon = type === "error" ? AlertCircle : CheckCircle;
  return (<div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 7, fontSize: 13, color }}><Icon size={14} />{children}</div>);
}


export function Spin({ size = 14 }) {
  return <div style={{ width: size, height: size, border: `2px solid rgba(255,255,255,.25)`, borderTop: `2px solid #fff`, borderRadius: "50%", animation: "spin .7s linear infinite", flexShrink: 0 }} />;
}

// ─── MAIN APP ────────────────────────────────────────────────

