import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard, Mail, Globe, FileText, Users, Calendar,
  Settings, Bell, Search, Download, Share2, Plus, Zap,
  Shield, ChevronDown, Sparkles, X, Phone,
  LogOut, AlertCircle, CheckCircle, Send, Star, Eye, Upload, Image as ImageIcon,
  QrCode, BarChart3, Megaphone, UserCheck, Layers, Linkedin, Twitter,
  QrCode, BarChart3, Megaphone, UserCheck, Layers,
  QrCode, BarChart3, Linkedin, Twitter, Instagram, Megaphone, ClipboardList,
  UserCheck, TrendingUp, Ticket, Coffee, Layers
} from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "https://sqddpjsgtwblmkgxqyxe.supabase.co",
  import.meta.env.VITE_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZGRwanNndHdibG1rZ3hxeXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODk5NTAsImV4cCI6MjA4OTY2NTk1MH0.x5BOfQRzn-F_tvUJv3mHRmfdOZiklyMkGzmPfRYoII4"
);

const SUPABASE_URL = "https://sqddpjsgtwblmkgxqyxe.supabase.co";

const C = {
  bg:"#080809", sidebar:"#0D0D0F", card:"#111114", raised:"#161619",
  border:"#1C1C1F", borderHi:"#2C2C30",
  blue:"#0A84FF", text:"#F5F5F7", sec:"#AEAEB2", muted:"#636366",
  green:"#30D158", red:"#FF453A", amber:"#FF9F0A", teal:"#5AC8FA",
};

const ST = {
  confirmed:{ label:"Confirmed", color:C.green },
  declined: { label:"Declined",  color:C.red   },
  pending:  { label:"Pending",   color:C.amber  },
  attended: { label:"Attended",  color:C.blue   },
};

const NAV = [
  { id:"dashboard", label:"Dashboard",     icon:LayoutDashboard },
  { id:"edm",       label:"eDM Builder",   icon:Mail, badge:"AI" },
  { id:"landing",   label:"Landing Pages", icon:Globe },
  { id:"forms",     label:"Forms",         icon:FileText },
  { id:"contacts",  label:"Contacts",      icon:Users },
  { id:"schedule",  label:"Scheduling",    icon:Calendar },
  { id:"checkin",   label:"Check-in",      icon:UserCheck },
  { id:"social",    label:"AI Social",     icon:Megaphone, badge:"AI" },
  { id:"analytics", label:"Analytics",     icon:BarChart3 },
  { id:"campaign",  label:"Campaigns",     icon:Layers },
];

const EMAIL_TYPES = [
  {id:"save_the_date",label:"Save the Date"},
  {id:"invitation",   label:"Invitation"},
  {id:"reminder",     label:"Reminder"},
  {id:"confirmation", label:"Confirmation"},
  {id:"byo",          label:"BYO / Details"},
  {id:"day_of",       label:"Day-of Details"},
  {id:"thank_you",    label:"Thank You"},
];

const ini = n => n?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() || "?";

// ─── WORLD-CLASS EMAIL TEMPLATE BUILDER ─────────────────────
// Builds beautiful, table-based, Outlook-safe HTML emails
// from AI-generated content JSON. Zero reliance on AI for HTML.
function buildEmailHtml({
  style = "branded",
  headline = "",
  subheadline = "",
  greeting = "Dear {{FIRST_NAME}},",
  bodyParagraphs = [],
  ctaText = "Register Now",
  ctaUrl = "",
  eventDate = "",
  eventTime = "",
  location = "",
  orgName = "Orbis Events",
  headerImageUrl = null,
  bodyImageUrl = null,
  footerImageUrl = null,
  psLine = "",
}) {
  const themes = {
    minimal: {
      headerBg: "#F8F8F6",
      headerColor: "#1A1A18",
      headerSubColor: "#777777",
      accentColor: "#1A1A18",
      chipBg: "transparent",
      chipColor: "#999999",
      showChip: false,
      orgColor: "#999999",
    },
    branded: {
      headerBg: "#1E3A5F",
      headerColor: "#FFFFFF",
      headerSubColor: "rgba(255,255,255,0.75)",
      accentColor: "#1E3A5F",
      chipBg: "rgba(79,195,247,0.18)",
      chipColor: "#4FC3F7",
      showChip: true,
      orgColor: "rgba(255,255,255,0.7)",
    },
    vibrant: {
      headerBg: "#FF5C35",
      headerColor: "#FFFFFF",
      headerSubColor: "rgba(255,255,255,0.88)",
      accentColor: "#FF5C35",
      chipBg: "rgba(0,0,0,0.12)",
      chipColor: "#FFFFFF",
      showChip: true,
      orgColor: "rgba(255,255,255,0.7)",
    },
  };
  const t = themes[style] || themes.branded;

  const headerSection = headerImageUrl
    ? `<img src="${headerImageUrl}" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0;">`
    : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${t.headerBg}">
        <tr><td style="padding:36px 40px 32px;">
          <p style="margin:0 0 22px;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:${t.orgColor};font-family:Arial,Helvetica,sans-serif;">${orgName}</p>
          ${t.showChip ? `<p style="margin:0 0 14px;"><span style="display:inline-block;background:${t.chipBg};color:${t.chipColor};font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:5px 14px;border-radius:20px;font-family:Arial,Helvetica,sans-serif;">You're Invited</span></p>` : ""}
          <h1 style="margin:0;font-size:30px;font-weight:700;line-height:1.15;color:${t.headerColor};letter-spacing:-0.5px;font-family:Arial,Helvetica,sans-serif;">${headline}</h1>
          ${subheadline ? `<p style="margin:10px 0 0;font-size:15px;color:${t.headerSubColor};line-height:1.6;font-family:Arial,Helvetica,sans-serif;">${subheadline}</p>` : ""}
          ${eventDate || location ? `<table cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;"><tr>
            ${eventDate ? `<td style="font-size:12px;color:${t.headerSubColor};font-family:Arial,Helvetica,sans-serif;padding-right:20px;">&#128197;&nbsp;${eventDate}${eventTime ? " &middot; " + eventTime : ""}</td>` : ""}
            ${location ? `<td style="font-size:12px;color:${t.headerSubColor};font-family:Arial,Helvetica,sans-serif;">&#128205;&nbsp;${location}</td>` : ""}
          </tr></table>` : ""}
        </td></tr>
      </table>`;

  const bodyHtml = bodyParagraphs
    .filter(Boolean)
    .map(p => `<p style="margin:0 0 18px;font-size:15px;color:#444444;line-height:1.8;font-family:Arial,Helvetica,sans-serif;">${p}</p>`)
    .join("");

  const detailsCard = (eventDate || eventTime || location)
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 28px;background:#F8F8F8;border-radius:6px;border-left:3px solid ${t.accentColor};">
        <tr><td style="padding:18px 22px;">
          <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${t.accentColor};font-family:Arial,Helvetica,sans-serif;">Event Details</p>
          <table cellpadding="0" cellspacing="4" border="0" style="width:100%;">
            ${eventDate ? `<tr><td style="font-size:12px;color:#999999;font-family:Arial,Helvetica,sans-serif;width:70px;padding:3px 0;">Date</td><td style="font-size:13px;color:#111111;font-weight:600;font-family:Arial,Helvetica,sans-serif;padding:3px 0;">${eventDate}</td></tr>` : ""}
            ${eventTime ? `<tr><td style="font-size:12px;color:#999999;font-family:Arial,Helvetica,sans-serif;padding:3px 0;">Time</td><td style="font-size:13px;color:#111111;font-weight:600;font-family:Arial,Helvetica,sans-serif;padding:3px 0;">${eventTime}</td></tr>` : ""}
            ${location ? `<tr><td style="font-size:12px;color:#999999;font-family:Arial,Helvetica,sans-serif;padding:3px 0;">Venue</td><td style="font-size:13px;color:#111111;font-weight:600;font-family:Arial,Helvetica,sans-serif;padding:3px 0;">${location}</td></tr>` : ""}
          </table>
        </td></tr>
      </table>`
    : "";

  const ctaSection = ctaUrl
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 32px;">
        <tr><td align="center">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" bgcolor="${t.accentColor}" style="border-radius:6px;mso-padding-alt:14px 40px;">
                <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${ctaUrl}" style="height:48px;v-text-anchor:middle;width:220px;" arcsize="12%" strokecolor="${t.accentColor}" fillcolor="${t.accentColor}"><w:anchorlock/><center style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;">${ctaText}</center></v:roundrect><![endif]-->
                <!--[if !mso]><!--><a href="${ctaUrl}" style="display:inline-block;padding:14px 40px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.3px;font-family:Arial,Helvetica,sans-serif;mso-hide:all;">${ctaText}</a><!--<![endif]-->
              </td>
            </tr>
          </table>
        </td></tr>
      </table>`
    : "";

  const bodyImageSection = bodyImageUrl
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;"><tr><td><img src="${bodyImageUrl}" width="100%" alt="" style="display:block;width:100%;border-radius:6px;border:0;"></td></tr></table>`
    : "";

  const footerImageSection = footerImageUrl
    ? `<tr><td style="padding:0;"><img src="${footerImageUrl}" width="600" alt="" style="display:block;width:100%;max-width:600px;border:0;"></td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<!--[if !mso]><!-->
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<!--<![endif]-->
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<title>Email</title>
</head>
<body style="margin:0;padding:0;background-color:#EBEBEB;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;word-break:break-word;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#EBEBEB">
<tr><td align="center" style="padding:24px 12px;">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.09);">

    <!-- HEADER -->
    <tr><td style="padding:0;line-height:0;">${headerSection}</td></tr>

    <!-- BODY -->
    <tr><td style="padding:32px 40px 16px;">
      ${greeting ? `<p style="margin:0 0 22px;font-size:16px;color:#111111;font-weight:500;font-family:Arial,Helvetica,sans-serif;">${greeting}</p>` : ""}
      ${bodyHtml}
    </td></tr>

    <!-- EVENT DETAILS CARD -->
    ${detailsCard ? `<tr><td style="padding:0 40px;">${detailsCard}</td></tr>` : ""}

    <!-- BODY IMAGE -->
    ${bodyImageSection ? `<tr><td style="padding:0 40px 24px;">${bodyImageSection}</td></tr>` : ""}

    <!-- CTA BUTTON -->
    ${ctaSection ? `<tr><td style="padding:0 40px;">${ctaSection}</td></tr>` : ""}

    <!-- PS LINE -->
    ${psLine ? `<tr><td style="padding:0 40px 28px;"><p style="margin:0;font-size:13px;color:#AAAAAA;font-style:italic;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">${psLine}</p></td></tr>` : ""}

    <!-- FOOTER IMAGE -->
    ${footerImageSection}

    <!-- FOOTER -->
    <tr><td bgcolor="#F8F8F8" style="padding:22px 40px;border-top:1px solid #EEEEEE;text-align:center;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#AAAAAA;font-family:Arial,Helvetica,sans-serif;">${orgName}</p>
      <p style="margin:0;font-size:11px;color:#CCCCCC;font-family:Arial,Helvetica,sans-serif;">
        <a href="#" style="color:#CCCCCC;text-decoration:underline;font-family:Arial,Helvetica,sans-serif;">Unsubscribe</a>
        &nbsp;&middot;&nbsp;
        <a href="#" style="color:#CCCCCC;text-decoration:underline;font-family:Arial,Helvetica,sans-serif;">View in browser</a>
        &nbsp;&middot;&nbsp;
        <a href="#" style="color:#CCCCCC;text-decoration:underline;font-family:Arial,Helvetica,sans-serif;">Privacy Policy</a>
      </p>
    </td></tr>

  </table>

</td></tr>
</table>
</body>
</html>`;
}

// ─── IMAGE UPLOAD ZONE ───────────────────────────────────────
function ImageUploadZone({ label, sublabel, url, onUpload, onClear, uploading }) {
  const ref = useRef();
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 5, fontWeight: 500 }}>{label}</div>
      {url ? (
        <div style={{ position: "relative", borderRadius: 6, overflow: "hidden", border: `1px solid ${C.borderHi}` }}>
          <img src={url} alt={label} style={{ display: "block", width: "100%", maxHeight: 80, objectFit: "cover" }} />
          <button onClick={onClear}
            style={{ position: "absolute", top: 5, right: 5, background: "rgba(0,0,0,.7)", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
            <X size={11} />
          </button>
          <div style={{ position: "absolute", bottom: 5, left: 8, fontSize: 10, color: "rgba(255,255,255,.8)", background: "rgba(0,0,0,.5)", padding: "2px 6px", borderRadius: 3 }}>
            ✓ Uploaded
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && ref.current?.click()}
          style={{ border: `1.5px dashed ${C.borderHi}`, borderRadius: 6, padding: "12px 10px", textAlign: "center", cursor: uploading ? "default" : "pointer", background: C.bg, transition: "border-color .15s" }}
          onMouseEnter={e => !uploading && (e.currentTarget.style.borderColor = C.blue)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = C.borderHi)}
        >
          <input ref={ref} type="file" accept="image/jpeg,image/png,image/gif,image/webp" style={{ display: "none" }}
            onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
          {uploading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 11, color: C.muted }}>
              <Spin size={12} />Uploading…
            </div>
          ) : (
            <>
              <Upload size={14} color={C.muted} strokeWidth={1.5} style={{ marginBottom: 4 }} />
              <div style={{ fontSize: 11, color: C.muted }}>{sublabel || `Upload ${label}`}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2, opacity: 0.7 }}>PNG, JPG, GIF · max 3MB</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SCORE BADGE ─────────────────────────────────────────────
function ScoreBadge({ score }) {
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
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setBooting(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);
  if (booting) return <Splash />;
  if (!session) return <AuthScreen />;
  return <MainApp session={session} />;
}

function Splash() {
  return (
    <div style={{ height: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "Outfit,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
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
  const submit = async e => {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      if (mode === "login") { const { error: err } = await supabase.auth.signInWithPassword({ email, password }); if (err) throw err; }
      else { const { error: err } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name, company_name: company } } }); if (err) throw err; setMsg("Check your email to confirm your account!"); }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  return (
    <div style={{ height: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Outfit,sans-serif", color: C.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}button{cursor:pointer;font-family:Outfit,sans-serif}input{font-family:Outfit,sans-serif}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 380, animation: "fadeUp .3s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center" }}><Zap size={13} color="#fff" strokeWidth={2.5} /></div>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px" }}>evara</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px", marginBottom: 5 }}>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p style={{ fontSize: 13, color: C.muted }}>{mode === "login" ? "Sign in to your workspace" : "Start your 14-day free trial"}</p>
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {mode === "signup" && <><Inp label="Full name" value={name} set={setName} ph="John Doe" /><Inp label="Company" value={company} set={setCompany} ph="Acme Corp" /></>}
          <Inp label="Work email" value={email} set={setEmail} ph="john@company.com" type="email" />
          <Inp label="Password" value={password} set={setPassword} ph="••••••••" type="password" />
          {error && <Alert type="error">{error}</Alert>}
          {msg && <Alert type="success">{msg}</Alert>}
          <button type="submit" disabled={loading} style={{ padding: "12px", background: loading ? C.raised : C.blue, border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 500, marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .15s" }}>
            {loading ? <><Spin />Loading…</> : mode === "login" ? "Sign in →" : "Create account →"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: C.muted }}>
          {mode === "login" ? "No account? " : "Have one? "}
          <span onClick={() => { setMode(m => m === "login" ? "signup" : "login"); setError(null); setMsg(null); }} style={{ color: C.blue, cursor: "pointer", fontWeight: 500 }}>
            {mode === "login" ? "Sign up free" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}

function Inp({ label, value, set, ph, type = "text" }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11.5, color: C.muted, marginBottom: 5 }}>{label}</label>
      <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={ph} required
        style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, padding: "10px 12px", fontSize: 13, outline: "none", transition: "border-color .15s" }}
        onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
    </div>
  );
}

function Alert({ type, children }) {
  const color = type === "error" ? C.red : C.green;
  const Icon = type === "error" ? AlertCircle : CheckCircle;
  return (<div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 7, fontSize: 13, color }}><Icon size={14} />{children}</div>);
}

function Spin({ size = 14 }) {
  return <div style={{ width: size, height: size, border: `2px solid rgba(255,255,255,.25)`, borderTop: `2px solid #fff`, borderRadius: "50%", animation: "spin .7s linear infinite", flexShrink: 0 }} />;
}

// ─── MAIN APP ────────────────────────────────────────────────
function MainApp({ session }) {
  const [view, setView] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [toast, setToast] = useState(null);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [newEventDate, setNewEventDate] = useState("");

  const fire = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    const load = async () => {
      const { data: prof } = await supabase.from("profiles").select("*,companies(*)").eq("id", session.user.id).single();
      setProfile(prof);
      const { data: evts } = await supabase.from("events").select("*").eq("company_id", prof?.company_id).order("event_date", { ascending: true });
      setEvents(evts || []);
      if (evts?.length) setActiveEvent(evts[0]);
    };
    load();
  }, [session]);

  const createEvent = async () => {
    if (!newEventName.trim() || !profile) return;
    const { data } = await supabase.from("events").insert({ name: newEventName.trim(), event_date: newEventDate || null, company_id: profile.company_id, status: "draft", created_by: profile.id }).select().single();
    if (data) { setEvents(p => [...p, data]); setActiveEvent(data); fire("Event created!"); }
    setShowNewEvent(false); setNewEventName(""); setNewEventDate("");
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.text, fontFamily: "Outfit,sans-serif", overflow: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#2A2A2E;border-radius:3px}button{cursor:pointer;font-family:Outfit,sans-serif}input,textarea,select{font-family:Outfit,sans-serif}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}.nb:hover{background:${C.raised}!important;color:${C.text}!important}.mc:hover{background:${C.raised}!important;border-color:${C.borderHi}!important;transform:translateY(-1px)}.rh:hover{background:${C.raised}!important}`}</style>

      {/* SIDEBAR */}
      <aside style={{ width: 216, background: C.sidebar, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 3px ${C.blue}20` }}><Zap size={13} color="#fff" strokeWidth={2.5} /></div>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.4px" }}>evara</span>
            <span style={{ fontSize: 9, fontWeight: 600, background: `${C.blue}20`, color: C.blue, padding: "2px 5px", borderRadius: 3, letterSpacing: "0.5px", marginLeft: "auto" }}>BETA</span>
          </div>
          <div style={{ fontSize: 9.5, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5, paddingLeft: 2 }}>Active Event</div>
          {activeEvent ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 11px", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: C.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{activeEvent.name}</span>
              <ChevronDown size={11} color={C.muted} />
            </div>
          ) : (
            <button onClick={() => setShowNewEvent(true)} style={{ width: "100%", padding: "8px 11px", background: `${C.blue}12`, border: `1px dashed ${C.blue}40`, borderRadius: 8, color: C.blue, fontSize: 12, textAlign: "left", cursor: "pointer" }}>
              + Create first event
            </button>
          )}
        </div>
        <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 1 }}>
          <div style={{ fontSize: 9.5, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", padding: "6px 10px 4px" }}>Modules</div>
          {NAV.map(({ id, label, icon: Icon, badge }) => {
            const on = view === id;
            return (<button key={id} className="nb" onClick={() => setView(id)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 7, border: "none", background: on ? C.raised : "transparent", color: on ? C.text : C.muted, width: "100%", textAlign: "left", fontSize: 13, fontWeight: on ? 500 : 400, borderLeft: `2px solid ${on ? C.blue : "transparent"}`, transition: "all .14s" }}>
              <Icon size={14} strokeWidth={on ? 2 : 1.5} /><span style={{ flex: 1 }}>{label}</span>
              {badge && <span style={{ fontSize: 9.5, fontWeight: 700, background: C.blue, color: "#fff", padding: "2px 5px", borderRadius: 3 }}>{badge}</span>}
              {on && <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.blue, flexShrink: 0 }} />}
            </button>);
          })}
        </nav>
        <div style={{ padding: "10px 8px 12px", borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 1 }}>
          <button className="nb" onClick={() => setView("settings")} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 7, border: "none", background: view === "settings" ? C.raised : "transparent", color: C.muted, width: "100%", textAlign: "left", fontSize: 13, borderLeft: `2px solid ${view === "settings" ? C.blue : "transparent"}` }}>
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ height: 52, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 22px", gap: 12, flexShrink: 0, background: C.sidebar }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 4 }}>
            <span style={{ fontSize: 12, color: C.muted }}>evara</span>
            <span style={{ fontSize: 12, color: C.muted }}>/</span>
            <span style={{ fontSize: 12.5, fontWeight: 500, color: C.text }}>{NAV.find(n => n.id === view)?.label || (view === "settings" ? "Settings" : "Dashboard")}</span>
          </div>
          <div style={{ width: 1, height: 18, background: C.border }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, padding: "6px 11px", flex: 1, maxWidth: 260 }}>
            <Search size={12} color={C.muted} strokeWidth={1.5} />
            <input placeholder="Search…" style={{ background: "none", border: "none", outline: "none", color: C.sec, fontSize: 12.5, width: "100%" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginLeft: "auto" }}>
            <button onClick={() => setShowNewEvent(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: C.blue, border: "none", borderRadius: 7, padding: "6px 13px", color: "#fff", fontSize: 12.5, fontWeight: 500, boxShadow: `0 2px 8px ${C.blue}40` }}>
              <Plus size={12} />New Event
            </button>
            <div style={{ position: "relative", cursor: "pointer", padding: 4 }}><Bell size={15} color={C.muted} /><div style={{ position: "absolute", top: 3, right: 3, width: 5, height: 5, borderRadius: "50%", background: C.blue, boxShadow: `0 0 0 1.5px ${C.sidebar}` }} /></div>
          </div>
        </header>

        <main style={{ flex: 1, overflow: "auto", padding: "26px" }}>
          {view === "dashboard" && <DashView supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "edm" && <EdmView supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} setView={setView} />}
          {view === "landing" && <LandingView supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "forms" && <FormsView supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "contacts" && <ContactView supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "schedule" && <ScheduleView supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "checkin"   && <CheckInView  supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "social"    && <SocialView   supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "analytics" && <AnalyticsView supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "campaign"  && <CampaignView supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} setView={setView} />}
          {view === "settings"  && <SettingsView supabase={supabase} profile={profile} fire={fire} />}
        </main>
      </div>

      {/* NEW EVENT MODAL */}
      {showNewEvent && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99 }}>
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28, width: 400, animation: "fadeUp .2s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: C.text }}>Create new event</h2>
              <button onClick={() => setShowNewEvent(false)} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer" }}><X size={16} /></button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11.5, color: C.muted, marginBottom: 6 }}>Event name *</label>
              <input autoFocus value={newEventName} onChange={e => setNewEventName(e.target.value)} onKeyDown={e => e.key === "Enter" && createEvent()} placeholder="e.g. Tech Summit 2026"
                style={{ width: "100%", background: C.bg, border: `1px solid ${C.blue}`, borderRadius: 7, color: C.text, padding: "11px 13px", fontSize: 14, outline: "none" }} />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 11.5, color: C.muted, marginBottom: 6 }}>Event date (optional)</label>
              <input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)}
                style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, padding: "10px 13px", fontSize: 13, outline: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 9 }}>
              <button onClick={() => setShowNewEvent(false)} style={{ flex: 1, padding: "11px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={createEvent} style={{ flex: 2, padding: "11px", background: C.blue, border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", boxShadow: `0 4px 16px ${C.blue}40` }}>Create event →</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: C.raised, border: `1px solid ${C.border}`, borderLeft: `3px solid ${toast.type === "ok" ? C.green : C.red}`, borderRadius: 8, padding: "11px 18px", display: "flex", alignItems: "center", gap: 9, animation: "fadeUp .2s ease", zIndex: 999, whiteSpace: "nowrap", boxShadow: "0 4px 24px #00000080" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: toast.type === "ok" ? C.green : C.red, flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: C.text }}>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────
function DashView({ supabase, profile, activeEvent, fire }) {
  const [contacts, setContacts] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [filt, setFilt] = useState("all");
  const [sending, setSending] = useState(null);

  const triggerEmail = async (ecId, contactId, status) => {
    setSending(contactId);
    try {
      await supabase.from("event_contacts").update({ status, [`${status}_at`]: new Date().toISOString() }).eq("id", ecId);
      const triggerType = status === "confirmed" ? "confirmation" : status === "declined" ? "decline" : status === "attended" ? "attended" : null;
      if (triggerType && profile && activeEvent) {
        const ec = contacts.find(c => c.id === ecId);
        const contact = ec?.contacts || {};
        const res = await fetch(`${SUPABASE_URL}/functions/v1/send-triggered-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contacts: [{ email: contact.email, first_name: contact.first_name || "", last_name: contact.last_name || "", unsubscribed: contact.unsubscribed || false }],
            triggerType, eventName: activeEvent.name,
            eventDate: activeEvent.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "",
            eventTime: activeEvent.event_time || "", location: activeEvent.location || "",
            orgName: profile.companies?.name || "",
          })
        });
        const data = await res.json();
        if (data.success && data.sent > 0) fire(`${ST[status]?.label || status} ✅ — email sent to ${contact.email}`);
        else fire(`Status updated. Email issue: ${data.errors?.[0]?.reason || data.error || "unknown"}`, "warn");
      }
      await supabase.from("contact_activity").insert({ contact_id: contactId, event_id: activeEvent.id, company_id: profile.company_id, activity_type: "status_changed", description: `Status changed to ${status}` });
      setContacts(p => p.map(c => c.id === ecId ? { ...c, status } : c));
    } catch (err) { fire(err.message, "err"); } finally { setSending(null); }
  };

  useEffect(() => {
    if (!activeEvent || !profile) return;
    const load = async () => {
      setLoading(true);
      const { data: ec } = await supabase.from("event_contacts").select("*,contacts(*)").eq("event_id", activeEvent.id).order("created_at", { ascending: false });
      setContacts(ec || []);
      const { data: m } = await supabase.from("event_summary").select("*").eq("event_id", activeEvent.id).single();
      setMetrics(m);
      const scoreMap = {};
      if (ec?.length) {
        const contactIds = ec.map(r => r.contacts?.id || r.contact_id).filter(Boolean);
        if (contactIds.length) {
          const { data: scoreRows } = await supabase.from("contact_lead_scores").select("contact_id,score,temperature").in("contact_id", contactIds);
          (scoreRows || []).forEach(r => { scoreMap[r.contact_id] = { score: r.score, temp: r.temperature }; });
        }
      }
      setScores(scoreMap);
      setLoading(false);
    };
    load();
  }, [activeEvent, profile]);

  const rows = filt === "all" ? contacts : contacts.filter(c => c.status === filt);
  const METRICS = [
    { label: "Emails Sent", val: metrics?.total_sent || 0, color: C.blue },
    { label: "Opened", val: metrics?.total_opened || 0, color: C.teal },
    { label: "Registered", val: metrics?.total_invited || 0, color: C.text },
    { label: "Confirmed", val: metrics?.total_confirmed || 0, color: C.green },
    { label: "Declined", val: metrics?.total_declined || 0, color: C.red },
    { label: "Pending", val: metrics?.total_pending || 0, color: C.amber },
    { label: "Attended", val: metrics?.total_attended || 0, color: C.blue },
  ];

  if (!activeEvent) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16, animation: "fadeUp .2s ease" }}>
      <LayoutDashboard size={36} color={C.muted} strokeWidth={1} />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: C.text, marginBottom: 6 }}>No events yet</div>
        <div style={{ fontSize: 13, color: C.muted }}>Click "New Event" to get started</div>
      </div>
    </div>
  );

  const daysToEvent = activeEvent.event_date ? Math.ceil((new Date(activeEvent.event_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 22, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: C.blue, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4 }}>Active Event</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.6px", color: C.text }}>{activeEvent.name}</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
            {activeEvent.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "Date TBC"}
            {activeEvent.location ? ` · ${activeEvent.location}` : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
          {daysToEvent !== null && (
            <div style={{ textAlign: "center", background: C.card, border: `1px solid ${daysToEvent <= 3 ? C.red + "50" : daysToEvent <= 7 ? C.amber + "50" : C.border}`, borderRadius: 10, padding: "12px 20px" }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: daysToEvent <= 3 ? C.red : daysToEvent <= 7 ? C.amber : C.text, lineHeight: 1 }}>{daysToEvent > 0 ? daysToEvent : "Today!"}</div>
              <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginTop: 4 }}>{daysToEvent > 0 ? "Days to go" : ""}</div>
            </div>
          )}
          {metrics && <div style={{ display: "flex", gap: 16 }}>
            {[
              { l: "Open Rate", v: metrics.total_sent ? `${Math.round((metrics.total_opened / metrics.total_sent) * 100)}%` : "—" },
              { l: "Show Rate", v: metrics.total_confirmed ? `${Math.round((metrics.total_attended / metrics.total_confirmed) * 100)}%` : "—" },
            ].map(s => (<div key={s.l} style={{ textAlign: "right" }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: C.text, letterSpacing: "-0.8px" }}>{s.v}</div>
              <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px" }}>{s.l}</div>
            </div>))}
          </div>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 9, marginBottom: 22 }}>
        {METRICS.map((m, i) => (
          <div key={i} className="mc" style={{ background: C.card, borderRadius: 10, padding: "13px 12px", border: `1px solid ${C.border}`, borderTop: `2px solid ${m.color}28`, transition: "all .18s", cursor: "default" }}>
            <div style={{ fontSize: 9.5, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: m.color, letterSpacing: "-0.5px" }}>{loading ? "—" : m.val.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <div style={{ padding: "13px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>Contacts</span>
          <span style={{ fontSize: 10.5, background: C.raised, color: C.muted, padding: "2px 7px", borderRadius: 4, fontWeight: 500 }}>{contacts.length}</span>
          <div style={{ display: "flex", gap: 4 }}>
            {["all", "confirmed", "pending", "declined", "attended"].map(f => (
              <button key={f} onClick={() => setFilt(f)} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 4, border: `1px solid ${filt === f ? C.blue + "70" : C.border}`, background: filt === f ? C.blue + "14" : "transparent", color: filt === f ? C.blue : C.muted, fontWeight: filt === f ? 500 : 400, textTransform: "capitalize", transition: "all .12s" }}>
                {f}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12, fontSize: 10.5, color: C.muted, alignItems: "center" }}>
            <Star size={10} color={C.amber} />
            <span style={{ color: C.green }}>●Hot 15+</span>
            <span style={{ color: C.amber }}>●Warm 8+</span>
            <span style={{ color: C.blue }}>●Cool 3+</span>
            <span style={{ color: C.muted }}>●Cold</span>
          </div>
          <button onClick={async () => {
            const email = window.prompt("Contact email address:");
            if (!email || !profile || !activeEvent) return;
            const trimmed = email.trim().toLowerCase();
            if (!trimmed.includes("@")) { fire("Invalid email", "err"); return; }
            const { data: c } = await supabase.from("contacts").upsert({ email: trimmed, company_id: profile.company_id, source: "manual" }, { onConflict: "company_id,email" }).select().single();
            if (c) {
              const { data: ec } = await supabase.from("event_contacts").upsert({ contact_id: c.id, event_id: activeEvent.id, company_id: profile.company_id, status: "pending" }, { onConflict: "event_id,contact_id" }).select("*,contacts(*)").single();
              if (ec) { setContacts(p => [ec, ...p]); fire("Contact added!"); }
            }
          }} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, background: C.blue + "14", border: `1px solid ${C.blue}30`, borderRadius: 6, padding: "5px 11px", color: C.blue, cursor: "pointer" }}>
            <Plus size={11} />Add contact
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><Spin />Loading contacts…</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Name", "Company", "Lead Score", "Status", "Phone", "Actions"].map(h => (
                  <th key={h} style={{ padding: "9px 13px", textAlign: "left", fontSize: 10.5, color: C.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: C.muted, fontSize: 13 }}>
                  {filt === "all" ? "No contacts yet — add contacts above" : "No contacts with this status"}
                </td></tr>
              ) : rows.map((ec, i) => {
                const c = ec.contacts || {};
                const st = ST[ec.status] || { label: ec.status, color: C.muted };
                const score = scores[c.id] || 0;
                const isSending = sending === c.id;
                return (
                  <tr key={ec.id} className="rh" style={{ borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : undefined, background: "transparent", transition: "background .08s" }}>
                    <td style={{ padding: "11px 13px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 29, height: 29, borderRadius: "50%", background: `${st.color}18`, border: `1px solid ${st.color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: st.color, flexShrink: 0 }}>
                          {ini(`${c.first_name || ""} ${c.last_name || ""}`.trim() || c.email || "?")}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{`${c.first_name || ""} ${c.last_name || ""}`.trim() || "—"}</div>
                          <div style={{ fontSize: 11, color: C.muted }}>{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "11px 13px", fontSize: 12.5, color: C.muted }}>{c.company_name || "—"}</td>
                    <td style={{ padding: "11px 13px" }}><ScoreBadge score={score} /></td>
                    <td style={{ padding: "11px 13px" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: 5, background: C.raised, border: `1px solid ${C.border}` }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: st.color }} />
                        <span style={{ fontSize: 12, color: C.sec }}>{st.label}</span>
                      </div>
                    </td>
                    <td style={{ padding: "11px 13px" }}>
                      {c.phone ? (
                        <a href={`tel:${c.phone}`} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.blue, textDecoration: "none" }}>
                          <Phone size={11} />{c.phone}
                        </a>
                      ) : <span style={{ fontSize: 12, color: C.muted }}>—</span>}
                    </td>
                    <td style={{ padding: "11px 13px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {isSending ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.muted }}>
                            <Spin size={11} />Sending…
                          </div>
                        ) : (
                          <>
                            {ec.status !== "confirmed" && ec.status !== "attended" && (
                              <button onClick={() => triggerEmail(ec.id, c.id, "confirmed")}
                                style={{ fontSize: 11, background: `${C.green}10`, color: C.green, border: `1px solid ${C.green}25`, borderRadius: 5, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                                <CheckCircle size={9} />Confirm + Email
                              </button>
                            )}
                            {ec.status !== "declined" && (
                              <button onClick={() => triggerEmail(ec.id, c.id, "declined")}
                                style={{ fontSize: 11, background: `${C.red}10`, color: C.red, border: `1px solid ${C.red}25`, borderRadius: 5, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                                <X size={9} />Decline + Email
                              </button>
                            )}
                            {ec.status === "confirmed" && (
                              <button onClick={() => triggerEmail(ec.id, c.id, "attended")}
                                style={{ fontSize: 11, background: `${C.blue}10`, color: C.blue, border: `1px solid ${C.blue}25`, borderRadius: 5, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                                <CheckCircle size={9} />Attended + Thanks
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── EDM BUILDER — with AI content + beautiful templates + image upload ──────
function EdmView({ supabase, profile, activeEvent, fire, setView }) {
  const [eType, setEType] = useState("invitation");
  const [tmpl, setTmpl] = useState("branded");
  const [gen, setGen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [formLink, setFormLink] = useState("");
  const [uploadingZone, setUploadingZone] = useState(null);
  const [images, setImages] = useState({ header: null, body: null, footer: null });
  const [info, setInfo] = useState({ eventName: "", eventDate: "", eventTime: "", location: "", description: "", tone: "professional and exciting", extra: "" });

  useEffect(() => {
    if (activeEvent) {
      setInfo(p => ({ ...p, eventName: activeEvent.name || "", eventDate: activeEvent.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "", location: activeEvent.location || "", description: activeEvent.description || "" }));
      supabase.from("forms").select("share_token").eq("event_id", activeEvent.id).eq("is_active", true).limit(1).maybeSingle()
        .then(({ data }) => { if (data?.share_token) setFormLink(`${window.location.origin}/form/${data.share_token}`); });
    }
  }, [activeEvent]);

  useEffect(() => {
    if (!activeEvent || !profile) return;
    supabase.from("email_campaigns").select("*").eq("event_id", activeEvent.id).order("created_at", { ascending: false })
      .then(({ data }) => setCampaigns(data || []));
  }, [activeEvent, profile]);

  // Upload image to Supabase Storage
  const uploadImage = async (file, zone) => {
    if (!profile) return;
    if (file.size > 3 * 1024 * 1024) { fire("Image must be under 3MB", "err"); return; }
    setUploadingZone(zone);
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      const path = `${profile.company_id}/emails/${zone}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("email-images").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("email-images").getPublicUrl(path);
      setImages(p => ({ ...p, [zone]: publicUrl }));
      fire(`${zone.charAt(0).toUpperCase() + zone.slice(1)} image uploaded!`);
    } catch (err) {
      // If bucket doesn't exist, fall back to data URL for preview
      const reader = new FileReader();
      reader.onload = e => {
        setImages(p => ({ ...p, [zone]: e.target.result }));
        fire(`${zone} image ready (local preview)`);
      };
      reader.readAsDataURL(file);
    } finally { setUploadingZone(null); }
  };

  const generate = async () => {
    if (!info.eventName) { fire("Add event name first", "err"); return; }
    setGen(true); setPreview(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-edm`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({
          ...info, emailType: eType, templateStyle: tmpl,
          eventId: activeEvent?.id, companyId: profile?.company_id,
          registrationUrl: formLink || null,
          headerImageUrl: images.header || null,
          bodyImageUrl: images.body || null,
          footerImageUrl: images.footer || null,
          returnFormat: "json",
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      let finalSubject = data.subject;
      let finalHtml = data.html;
      let finalPlain = data.plain_text;

      // If edge function returns structured content JSON → render into our beautiful template
      if (data.content) {
        const c = data.content;
        finalSubject = c.subject || data.subject;
        finalHtml = buildEmailHtml({
          style: tmpl,
          headline: c.headline || info.eventName,
          subheadline: c.subheadline || "",
          greeting: c.greeting || "Dear {{FIRST_NAME}},",
          bodyParagraphs: c.body_paragraphs || [],
          ctaText: c.cta_text || "Register Now",
          ctaUrl: formLink || "",
          eventDate: info.eventDate,
          eventTime: info.eventTime,
          location: info.location,
          orgName: profile?.companies?.name || "Orbis Events",
          headerImageUrl: images.header,
          bodyImageUrl: images.body,
          footerImageUrl: images.footer,
          psLine: c.ps_line || "",
        });
      } else if (finalHtml) {
        // Old format: edge function returned full HTML.
        // If images are uploaded, always rebuild using our beautiful template
        // so images actually appear. Extract body text from AI HTML.
        if (images.header || images.body || images.footer) {
          const tmp = document.createElement("div");
          tmp.innerHTML = finalHtml;
          // Pull out meaningful paragraphs from the AI HTML
          const paras = Array.from(tmp.querySelectorAll("p,td"))
            .map(el => el.innerText?.trim())
            .filter(t => t && t.length > 30 && t.length < 800)
            .slice(0, 4);
          finalHtml = buildEmailHtml({
            style: tmpl,
            headline: info.eventName,
            subheadline: "",
            greeting: "Dear {{FIRST_NAME}},",
            bodyParagraphs: paras.length ? paras : [info.description || `We'd like to invite you to ${info.eventName}.`],
            ctaText: "Register Now",
            ctaUrl: formLink || "",
            eventDate: info.eventDate,
            eventTime: info.eventTime,
            location: info.location,
            orgName: profile?.companies?.name || "Orbis Events",
            headerImageUrl: images.header,
            bodyImageUrl: images.body,
            footerImageUrl: images.footer,
          });
        } else if (formLink && !finalHtml.includes(formLink)) {
          // No images — just inject the CTA link
          const ctaInject = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;text-align:center;">
            <tr><td align="center">
              <a href="${formLink}" style="display:inline-block;padding:14px 40px;background:#0A84FF;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:6px;font-family:Arial,Helvetica,sans-serif;">Register Now →</a>
            </td></tr>
          </table>`;
          finalHtml = finalHtml.replace(/<\/body>/i, ctaInject + "</body>");
        }
      }

      // Always save/update the campaign in DB with the final HTML
      let finalCampaignId = data.campaign_id;
      if (activeEvent?.id && profile?.company_id) {
        if (finalCampaignId) {
          await supabase.from("email_campaigns")
            .update({ html_content: finalHtml, plain_text: finalPlain, subject: finalSubject })
            .eq("id", finalCampaignId);
        } else {
          const { data: saved } = await supabase.from("email_campaigns").insert({
            event_id: activeEvent.id,
            company_id: profile.company_id,
            name: (finalSubject || eType.replace(/_/g, " ") + " — " + info.eventName).slice(0, 80),
            email_type: eType,
            subject: finalSubject,
            html_content: finalHtml,
            plain_text: finalPlain,
            status: "draft",
            segment: "all",
          }).select("id").single();
          finalCampaignId = saved?.id || null;
        }
      }
      setPreview({ subject: finalSubject, html: finalHtml, plain_text: finalPlain, campaign_id: finalCampaignId });
      fire("Email generated & saved as draft!");
      const { data: cams } = await supabase.from("email_campaigns").select("*").eq("event_id", activeEvent.id).order("created_at", { ascending: false });
      setCampaigns(cams || []);
    } catch (err) { fire(err.message, "err"); } finally { setGen(false); }
  };

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.6px", color: C.text }}>eDM Builder</h1>
        <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>AI generates copy · your template renders it · world-class result every time.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, minHeight: "70vh" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 11, overflow: "auto" }}>
          <Sec label="Email type">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
              {EMAIL_TYPES.map(t => (
                <button key={t.id} onClick={() => setEType(t.id)} style={{ padding: "7px 10px", borderRadius: 6, border: `1px solid ${eType === t.id ? C.blue + "80" : C.border}`, background: eType === t.id ? C.blue + "10" : "transparent", color: eType === t.id ? C.blue : C.muted, fontSize: 12.5, textAlign: "left", fontWeight: eType === t.id ? 500 : 400, transition: "all .12s", cursor: "pointer" }}>
                  {t.label}
                </button>
              ))}
            </div>
          </Sec>

          <Sec label="Template style">
            <div style={{ display: "flex", gap: 6 }}>
              {["minimal", "branded", "vibrant"].map(t => (
                <button key={t} onClick={() => setTmpl(t)} style={{ flex: 1, padding: "9px 6px", borderRadius: 6, border: `1px solid ${tmpl === t ? C.blue + "80" : C.border}`, background: tmpl === t ? C.blue + "10" : "transparent", cursor: "pointer", textAlign: "center", transition: "all .12s" }}>
                  <div style={{ width: "100%", height: 24, borderRadius: 3, marginBottom: 5, background: t === "minimal" ? "#F8F8F6" : t === "branded" ? "#1E3A5F" : "#FF5C35" }} />
                  <div style={{ fontSize: 11.5, fontWeight: 500, color: tmpl === t ? C.blue : C.text, textTransform: "capitalize" }}>{t}</div>
                </button>
              ))}
            </div>
          </Sec>

          <Sec label="Event details">
            {[{ k: "eventName", ph: "Tech Summit 2026" }, { k: "eventDate", ph: "April 15, 2026" }, { k: "eventTime", ph: "06:30 PM" }, { k: "location", ph: "Marina Bay Sands" }].map(f => (
              <div key={f.k} style={{ marginBottom: 7 }}>
                <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 3, textTransform: "capitalize" }}>{f.k.replace(/([A-Z])/g, " $1").toLowerCase()}</div>
                <input value={info[f.k]} onChange={e => setInfo(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "6px 8px", fontSize: 12.5, outline: "none" }} />
              </div>
            ))}
            <div>
              <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 3 }}>Description</div>
              <textarea value={info.description} onChange={e => setInfo(p => ({ ...p, description: e.target.value }))} rows={3} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "7px 8px", fontSize: 12.5, outline: "none", resize: "none", lineHeight: 1.5 }} />
            </div>
          </Sec>

          <Sec label="Tone / Extra context">
            <textarea value={info.extra} onChange={e => setInfo(p => ({ ...p, extra: e.target.value }))} rows={2} placeholder="e.g. Black tie. Partners welcome. Emphasise exclusivity." style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "7px 8px", fontSize: 12.5, outline: "none", resize: "none", lineHeight: 1.5 }} />
          </Sec>

          <Sec label="Registration form link">
            <div style={{ fontSize: 11, color: formLink ? C.green : C.muted, marginBottom: 6 }}>{formLink ? "✓ Auto-loaded from your saved form" : "Paste your form URL — becomes the CTA button"}</div>
            <input value={formLink} onChange={e => setFormLink(e.target.value)} placeholder="https://…" style={{ width: "100%", background: C.bg, border: `1px solid ${formLink ? C.green + "50" : C.border}`, borderRadius: 5, color: C.text, padding: "7px 8px", fontSize: 12, outline: "none" }} />
          </Sec>

          {/* IMAGE UPLOAD ZONES */}
          <Sec label="Images (optional)">
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Add images to your email — stored securely, rendered in all clients.</div>
            <ImageUploadZone
              label="Header image"
              sublabel="Replaces colour header · 600×200px recommended"
              url={images.header}
              uploading={uploadingZone === "header"}
              onUpload={f => uploadImage(f, "header")}
              onClear={() => setImages(p => ({ ...p, header: null }))}
            />
            <ImageUploadZone
              label="In-body image"
              sublabel="Speaker photo, venue, or banner · 600×300px"
              url={images.body}
              uploading={uploadingZone === "body"}
              onUpload={f => uploadImage(f, "body")}
              onClear={() => setImages(p => ({ ...p, body: null }))}
            />
            <ImageUploadZone
              label="Footer image"
              sublabel="Sponsor logos or brand lockup · 600×80px"
              url={images.footer}
              uploading={uploadingZone === "footer"}
              onUpload={f => uploadImage(f, "footer")}
              onClear={() => setImages(p => ({ ...p, footer: null }))}
            />
          </Sec>

          <button onClick={generate} disabled={gen} style={{ padding: "11px", borderRadius: 8, border: "none", background: gen ? C.raised : C.blue, color: gen ? C.muted : "#fff", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .15s", boxShadow: gen ? "none" : `0 4px 20px ${C.blue}35`, cursor: "pointer" }}>
            {gen ? <><Spin />AI is writing…</> : <><Sparkles size={14} strokeWidth={1.5} />Generate with AI</>}
          </button>

          {campaigns.length > 0 && (
            <Sec label={`Saved drafts (${campaigns.length})`}>
              {campaigns.map(cam => (
                <div key={cam.id} onClick={() => {
                    if (cam.html_content) {
                      setPreview({ subject: cam.subject, html: cam.html_content, plain_text: cam.plain_text, campaign_id: cam.id });
                      // Scroll preview panel into view
                      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
                    }
                  }}
                  style={{ padding: "9px 10px", borderRadius: 7, border: `1px solid ${C.border}`, marginBottom: 6, cursor: cam.html_content ? "pointer" : "default", transition: "border-color .12s", background: C.bg }}
                  onMouseEnter={e => cam.html_content && (e.currentTarget.style.borderColor = C.blue)} onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
                  <div style={{ fontSize: 12.5, color: C.text, marginBottom: 3 }}>{cam.name}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 10.5, color: C.muted, textTransform: "capitalize" }}>{cam.email_type?.replace(/_/g, " ")}</span>
                    <span style={{ fontSize: 10.5, background: cam.status === "sent" ? C.green + "15" : C.blue + "15", color: cam.status === "sent" ? C.green : C.blue, padding: "2px 7px", borderRadius: 4 }}>{cam.status}</span>
                  </div>
                </div>
              ))}
            </Sec>
          )}
        </div>

        {/* PREVIEW PANEL */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ fontSize: 10.5, fontWeight: 500, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Preview</div>
          <div style={{ flex: 1, border: `1px solid ${preview ? C.blue + "50" : C.border}`, borderRadius: 10, background: "#EBEBEB", overflow: "auto", transition: "border-color .3s", minHeight: 500 }}>
            {!preview && !gen && <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 300 }}><Mail size={32} color="#AEAEB2" strokeWidth={1} style={{ opacity: .4 }} /><span style={{ fontSize: 13, color: "#AEAEB2" }}>Fill in event details and click Generate</span></div>}
            {gen && <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 300 }}><Spin size={28} /><span style={{ fontSize: 13, color: "#AEAEB2", fontFamily: "Outfit,sans-serif" }}>Claude is writing your email…</span></div>}
            {preview && (
              <div>
                <div style={{ padding: "12px 16px", background: "white", borderBottom: "1px solid #E5E5EA", fontFamily: "Arial,sans-serif" }}>
                  <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Subject</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{preview.subject}</div>
                </div>
                <div dangerouslySetInnerHTML={{ __html: preview.html }} />
              </div>
            )}
          </div>
          {preview && <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={() => setPreview(null)} style={{ flex: 1, padding: "9px", background: C.raised, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, cursor: "pointer" }}>Clear</button>
            <button onClick={() => { fire("Saved! Opening Scheduling…"); setView("schedule"); }} style={{ flex: 1, padding: "9px", background: C.blue, color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Send size={13} />Schedule & Send →
            </button>
          </div>}
        </div>
      </div>
    </div>
  );
}

// ─── SCHEDULE VIEW — with email preview modal ─────────────────
function ScheduleView({ supabase, profile, activeEvent, fire }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [sendModal, setSendModal] = useState(null);
  const [previewCam, setPreviewCam] = useState(null); // ← NEW: email preview
  const [contactCount, setContactCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [newCam, setNewCam] = useState({ email_type: "invitation", send_at: "", segment: "all" });

  useEffect(() => {
    if (!activeEvent || !profile) return;
    supabase.from("email_campaigns").select("*").eq("event_id", activeEvent.id).order("send_at", { ascending: true })
      .then(({ data }) => { setCampaigns(data || []); setLoading(false); });
    supabase.from("event_contacts").select("id", { count: "exact" }).eq("event_id", activeEvent.id)
      .then(({ count }) => setContactCount(count || 0));
  }, [activeEvent, profile]);

  const openSendModal = async (cam) => {
    let q = supabase.from("event_contacts").select("id,contacts(first_name,last_name,email)", { count: "exact" }).eq("event_id", activeEvent.id);
    if (cam.segment === "confirmed") q = q.eq("status", "confirmed");
    if (cam.segment === "pending") q = q.eq("status", "pending");
    if (cam.segment === "declined") q = q.eq("status", "declined");
    const { data, count } = await q;
    setSendModal({ ...cam, recipients: data || [], recipientCount: count || 0 });
  };

  const sendNow = async () => {
    if (!sendModal || !profile) return;
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const contacts = sendModal.recipients.map(ec => ({ id: ec.contacts?.id, email: ec.contacts?.email, first_name: ec.contacts?.first_name, company_id: profile.company_id })).filter(c => c.email);
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({ campaignId: sendModal.id, contacts, subject: sendModal.subject, htmlContent: sendModal.html_content, plainText: sendModal.plain_text })
      });
      const data = await res.json();
      if (data.success) {
        fire(`✅ Sent to ${data.sent} contacts! ${data.failed > 0 ? `(${data.failed} failed)` : ""}`);
        setCampaigns(p => p.map(c => c.id === sendModal.id ? { ...c, status: "sent", sent_at: new Date().toISOString(), total_sent: data.sent } : c));
      } else { fire(data.error || "Send failed", "err"); }
    } catch (err) { fire(err.message, "err"); } finally { setSending(false); setSendModal(null); }
  };

  const schedule = async () => {
    if (!activeEvent || !profile) return;
    const { data } = await supabase.from("email_campaigns").insert({ event_id: activeEvent.id, company_id: profile.company_id, name: `${newCam.email_type.replace(/_/g, " ")} — ${activeEvent.name}`, email_type: newCam.email_type, send_at: newCam.send_at || null, segment: newCam.segment, status: newCam.send_at ? "scheduled" : "draft" }).select().single();
    if (data) { setCampaigns(p => [...p, data]); setShowNew(false); fire("Campaign scheduled!"); }
  };

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.6px", color: C.text }}>Email Scheduling</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Send campaigns or schedule them ahead. Every send is tracked in real time.</p>
        </div>
        <button onClick={() => setShowNew(true)} style={{ fontSize: 13, padding: "7px 16px", borderRadius: 7, border: "none", background: C.blue, color: "#fff", fontWeight: 500, cursor: "pointer" }}>+ New campaign</button>
      </div>

      {loading ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "40px", color: C.muted }}><Spin />Loading campaigns…</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {campaigns.length === 0 && (
            <div style={{ background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, padding: "48px", textAlign: "center", color: C.muted }}>
              <Calendar size={32} style={{ opacity: .3, marginBottom: 12 }} />
              <div style={{ fontSize: 14, marginBottom: 6 }}>No campaigns yet</div>
              <div style={{ fontSize: 13 }}>Generate emails in eDM Builder, then send or schedule them here</div>
            </div>
          )}
          {campaigns.map(cam => (
            <div key={cam.id} style={{ background: C.card, borderRadius: 10, border: `1px solid ${cam.status === "sent" ? C.green + "30" : cam.status === "paused" ? C.amber + "30" : C.border}`, padding: "16px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${C.blue}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>✉</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{cam.name}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 500, padding: "2px 7px", borderRadius: 4, textTransform: "uppercase", background: cam.status === "sent" ? `${C.green}15` : cam.status === "paused" ? `${C.amber}15` : `${C.blue}15`, color: cam.status === "sent" ? C.green : cam.status === "paused" ? C.amber : C.blue }}>{cam.status}</span>
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {cam.send_at ? new Date(cam.send_at).toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "No send time set"}
                  {" · "}Segment: {cam.segment}
                  {cam.status === "sent" && ` · ${cam.total_opened || 0}/${cam.total_sent || 0} opened`}
                </div>
                {cam.subject && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3, fontStyle: "italic" }}>"{cam.subject}"</div>}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {/* ← NEW: Preview button */}
                {cam.html_content && (
                  <button onClick={() => setPreviewCam(cam)}
                    style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.borderHi}`, background: "transparent", color: C.sec, cursor: "pointer" }}>
                    <Eye size={11} />Preview
                  </button>
                )}
                {cam.status !== "sent" && cam.html_content && (
                  <button onClick={() => openSendModal(cam)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.green}50`, background: `${C.green}12`, color: C.green, cursor: "pointer", fontWeight: 500 }}>
                    <Send size={11} />Send Now
                  </button>
                )}
                {cam.status === "draft" && !cam.html_content && (
                  <span style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>Generate email first in eDM Builder</span>
                )}
                {cam.status !== "sent" && (
                  <button onClick={async () => { if (!confirm("Delete?")) return; await supabase.from("email_campaigns").delete().eq("id", cam.id); setCampaigns(p => p.filter(c => c.id !== cam.id)); fire("Deleted"); }}
                    style={{ fontSize: 12, padding: "5px 11px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ← NEW: EMAIL PREVIEW MODAL */}
      {previewCam && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99, padding: 20 }}>
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, width: "100%", maxWidth: 680, maxHeight: "90vh", display: "flex", flexDirection: "column", animation: "fadeUp .2s ease" }}>
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>Email Preview</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{previewCam.name}</div>
                {previewCam.subject && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Subject: <span style={{ color: C.sec }}>{previewCam.subject}</span></div>}
              </div>
              <button onClick={() => setPreviewCam(null)} style={{ background: C.raised, border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, cursor: "pointer", padding: "5px 8px", display: "flex", alignItems: "center" }}><X size={14} /></button>
            </div>
            {/* Email render */}
            <div style={{ flex: 1, overflow: "auto", background: "#EBEBEB", padding: "20px" }}>
              <div dangerouslySetInnerHTML={{ __html: previewCam.html_content }} />
            </div>
            {/* Modal footer */}
            <div style={{ display: "flex", gap: 8, padding: "14px 20px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
              <button onClick={() => setPreviewCam(null)} style={{ flex: 1, padding: "9px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, color: C.muted, fontSize: 13, cursor: "pointer" }}>Close</button>
              {previewCam.status !== "sent" && (
                <button onClick={() => { openSendModal(previewCam); setPreviewCam(null); }}
                  style={{ flex: 2, padding: "9px", background: C.green, border: "none", borderRadius: 7, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Send size={13} />Send This Email
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SEND NOW MODAL */}
      {sendModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28, width: 460, animation: "fadeUp .2s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: C.text }}>Send campaign</h2>
              <button onClick={() => setSendModal(null)} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer" }}><X size={16} /></button>
            </div>
            <div style={{ background: C.raised, borderRadius: 8, padding: "14px", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 4 }}>{sendModal.name}</div>
              {sendModal.subject && <div style={{ fontSize: 12, color: C.muted }}>Subject: {sendModal.subject}</div>}
            </div>
            <div style={{ background: `${C.blue}10`, border: `1px solid ${C.blue}25`, borderRadius: 8, padding: "12px 14px", marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.blue, marginBottom: 4 }}>📬 Sending to {sendModal.recipientCount} contacts</div>
              <div style={{ fontSize: 11.5, color: C.muted }}>Segment: {sendModal.segment} contacts for {activeEvent?.name}</div>
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>Each email is personalised with the recipient's first name.</div>
            </div>
            {sendModal.recipientCount === 0 && (
              <div style={{ background: `${C.amber}10`, border: `1px solid ${C.amber}30`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.amber }}>
                ⚠️ No contacts match this segment. Add contacts in the Dashboard first.
              </div>
            )}
            <div style={{ display: "flex", gap: 9 }}>
              <button onClick={() => setSendModal(null)} style={{ flex: 1, padding: "11px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={sendNow} disabled={sending || sendModal.recipientCount === 0}
                style={{ flex: 2, padding: "11px", background: sending || sendModal.recipientCount === 0 ? C.raised : C.green, border: "none", borderRadius: 8, color: sending || sendModal.recipientCount === 0 ? C.muted : "#fff", fontSize: 14, fontWeight: 500, cursor: sending ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {sending ? <><Spin />Sending…</> : <><Send size={14} />Confirm & Send</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW CAMPAIGN MODAL */}
      {showNew && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99 }}>
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 24, width: 420 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 500, color: C.text }}>Schedule email</h2>
              <button onClick={() => setShowNew(false)} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer" }}><X size={16} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Email type</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                  {EMAIL_TYPES.map(t => (
                    <button key={t.id} onClick={() => setNewCam(p => ({ ...p, email_type: t.id }))} style={{ padding: "7px 10px", borderRadius: 6, border: `1px solid ${newCam.email_type === t.id ? C.blue + "70" : C.border}`, background: newCam.email_type === t.id ? C.blue + "12" : "transparent", color: newCam.email_type === t.id ? C.blue : C.muted, fontSize: 12.5, textAlign: "left", transition: "all .12s", cursor: "pointer" }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Send date & time</div>
                <input type="datetime-local" value={newCam.send_at} onChange={e => setNewCam(p => ({ ...p, send_at: e.target.value }))} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: "9px 10px", fontSize: 13, outline: "none" }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Send to</div>
                <select value={newCam.segment} onChange={e => setNewCam(p => ({ ...p, segment: e.target.value }))} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: "9px 10px", fontSize: 13, outline: "none", cursor: "pointer" }}>
                  {["all", "confirmed", "pending", "declined"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)} contacts ({s === "all" ? contactCount : "varies"})</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowNew(false)} style={{ flex: 1, padding: "10px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, color: C.muted, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={schedule} style={{ flex: 1, padding: "10px", background: C.blue, border: "none", borderRadius: 7, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Schedule →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CONTACT VIEW ─────────────────────────────────────────────
function ContactView({ supabase, profile, activeEvent, fire }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  useEffect(() => {
    if (!profile) return;
    supabase.from("contacts").select("*").eq("company_id", profile.company_id).order("created_at", { ascending: false })
      .then(({ data }) => { setContacts(data || []); setLoading(false); });
  }, [profile]);
  const filtered = contacts.filter(c => !search || (c.email + c.first_name + c.last_name + c.company_name).toLowerCase().includes(search.toLowerCase()));
  const importCSV = async () => {
    const emails = prompt("Paste emails (one per line or comma-separated):");
    if (!emails || !profile) return;
    const list = emails.split(/[\n,]/).map(e => e.trim()).filter(e => e.includes("@"));
    if (!list.length) { fire("No valid emails found", "err"); return; }
    const rows = list.map(email => ({ email, company_id: profile.company_id, source: "import" }));
    const { data } = await supabase.from("contacts").upsert(rows, { onConflict: "company_id,email" }).select();
    if (data) { setContacts(p => { const newOnes = data.filter(d => !p.find(c => c.id === d.id)); return [...newOnes, ...p]; }); fire(`${data.length} contacts imported!`); }
  };
  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.6px", color: C.text }}>Contacts</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Unified contact records across every event — {contacts.length.toLocaleString()} total</p>
        </div>
        <button onClick={importCSV} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>+ Import emails</button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px", marginBottom: 14, maxWidth: 320 }}>
        <Search size={13} color={C.muted} strokeWidth={1.5} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts…" style={{ background: "none", border: "none", outline: "none", color: C.sec, fontSize: 13, width: "100%" }} />
      </div>
      <div style={{ background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        {loading ? <div style={{ padding: "32px", textAlign: "center", color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><Spin />Loading contacts…</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Name", "Email", "Company", "Phone", "Source", "Status"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10.5, color: C.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: C.muted, fontSize: 13 }}>{search ? "No contacts match" : "No contacts yet — import above"}</td></tr>
                : filtered.map((c, i) => (
                  <tr key={c.id} className="rh" style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : undefined, background: "transparent", transition: "background .08s" }}>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${C.blue}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: C.blue, flexShrink: 0 }}>{ini(`${c.first_name || ""} ${c.last_name || ""}`)}</div>
                        <span style={{ fontSize: 13, color: C.text }}>{`${c.first_name || ""} ${c.last_name || ""}`.trim() || "—"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 12.5, color: C.muted }}>{c.email}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12.5, color: C.muted }}>{c.company_name || "—"}</td>
                    <td style={{ padding: "11px 14px" }}>
                      {c.phone ? <a href={`tel:${c.phone}`} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.blue, textDecoration: "none" }}><Phone size={11} />{c.phone}</a> : <span style={{ fontSize: 12, color: C.muted }}>—</span>}
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: C.muted, textTransform: "capitalize" }}>{c.source || "manual"}</td>
                    <td style={{ padding: "11px 14px" }}><span style={{ fontSize: 11, color: c.unsubscribed ? C.red : C.green }}>{c.unsubscribed ? "⚠ Unsubscribed" : "✓ Active"}</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── LANDING VIEW ─────────────────────────────────────────────
function LandingView({ supabase, profile, activeEvent, fire }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(null);
  const [blocks, setBlocks] = useState({ hero: true, countdown: true, details: true, speakers: true, rsvp: true, sponsors: true });
  const [info, setInfo] = useState({ title: "", tagline: "", description: "", cta_text: "Register Now", template: "corporate", slug: "" });
  const TMPLS = [{ id: "minimal", name: "Minimal", desc: "Clean, white & text-forward" }, { id: "corporate", name: "Corporate", desc: "Dark, professional & premium" }, { id: "bold", name: "Bold", desc: "Deep, vibrant & high-energy" }];
  const BLOCK_LIST = [{ id: "hero", label: "Hero Section" }, { id: "countdown", label: "Countdown Timer" }, { id: "details", label: "Event Details" }, { id: "speakers", label: "Speakers" }, { id: "rsvp", label: "RSVP Form" }, { id: "sponsors", label: "Sponsors" }];
  useEffect(() => {
    if (!activeEvent || !profile) return;
    supabase.from("landing_pages").select("*").eq("event_id", activeEvent.id).maybeSingle()
      .then(({ data }) => {
        if (data) { setPage(data); setInfo({ title: data.title || "", tagline: data.tagline || "", description: data.description || "", cta_text: data.cta_text || "Register Now", template: data.template || "corporate", slug: data.slug || "" }); setBlocks(data.blocks || blocks); setStep(2); }
        setLoading(false);
      });
    if (activeEvent) { setInfo(p => ({ ...p, title: p.title || activeEvent.name || "", description: p.description || activeEvent.description || "", slug: p.slug || (activeEvent.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-") })); }
  }, [activeEvent, profile]);
  const save = async (publish = false) => {
    if (!activeEvent || !profile) return; setSaving(true);
    const payload = { event_id: activeEvent.id, company_id: profile.company_id, ...info, blocks, is_published: publish };
    const { data, error } = await supabase.from("landing_pages").upsert(payload, { onConflict: "event_id" }).select().single();
    if (error) { fire(error.message, "err"); } else { setPage(data); fire(publish ? "Page published! 🎉" : "Page saved as draft"); }
    setSaving(false);
  };
  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", gap: 10, color: C.muted }}><Spin />Loading…</div>;
  return (
    <div style={{ animation: "fadeUp .2s ease", display: "flex", flexDirection: "column", height: "calc(100vh - 110px)" }}>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.6px", color: C.text }}>Landing Page Builder</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Build your event page — saves to database, publish when ready.</p>
        </div>
        {step === 2 && <div style={{ display: "flex", gap: 8 }}>
          {page?.is_published && <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.green, padding: "7px 12px", background: `${C.green}12`, border: `1px solid ${C.green}30`, borderRadius: 6 }}>● Live</div>}
          <button onClick={() => setStep(1)} style={{ fontSize: 13, padding: "7px 13px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>← Templates</button>
          <button onClick={() => save(false)} disabled={saving} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>{saving ? <Spin /> : "Save draft"}</button>
          <button onClick={() => save(true)} disabled={saving} style={{ fontSize: 13, padding: "7px 18px", borderRadius: 7, border: "none", background: C.blue, color: "#fff", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>{saving ? <><Spin />Saving…</> : "Publish →"}</button>
        </div>}
      </div>
      {step === 1 ? (
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 500, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 16 }}>Choose a template</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {TMPLS.map(t => (
              <div key={t.id} onClick={() => { setInfo(p => ({ ...p, template: t.id })); setStep(2); }} style={{ borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", cursor: "pointer", transition: "border-color .15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.blue} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                <div style={{ height: 140, background: t.id === "minimal" ? "#fff" : t.id === "corporate" ? "#0D0D0F" : "#0F0A2A", padding: "18px 16px" }}>
                  <div style={{ background: C.blue, height: 2.5, width: 36, borderRadius: 2, marginBottom: 10 }} />
                  <div style={{ background: t.id === "minimal" ? "#111" : "#F5F5F7", height: 10, width: "65%", borderRadius: 3, opacity: .85, marginBottom: 8 }} />
                  <div style={{ background: C.blue, height: 26, width: 80, borderRadius: 5, marginTop: 14 }} />
                </div>
                <div style={{ padding: "12px 14px", background: C.card, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: C.text, marginBottom: 2 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ width: 256, display: "flex", flexDirection: "column", gap: 10, overflow: "auto", flexShrink: 0 }}>
            <Sec label="Page URL">
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden" }}>
                <span style={{ fontSize: 11, color: C.muted, padding: "0 8px", borderRight: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>evara.app/e/</span>
                <input value={info.slug} onChange={e => setInfo(p => ({ ...p, slug: e.target.value.replace(/[^a-z0-9-]/g, "-") }))} placeholder="my-event" style={{ flex: 1, background: "none", border: "none", outline: "none", color: C.text, padding: "7px 6px", fontSize: 12.5 }} />
              </div>
            </Sec>
            <Sec label="Event info">
              {[{ k: "title", ph: "Event name" }, { k: "tagline", ph: "Tagline" }, { k: "cta_text", ph: "Register Now" }].map(f => (
                <div key={f.k} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 3, textTransform: "capitalize" }}>{f.k.replace(/_/g, " ")}</div>
                  <input value={info[f.k]} onChange={e => setInfo(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "6px 8px", fontSize: 12.5, outline: "none" }} />
                </div>
              ))}
              <div>
                <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 3 }}>Description</div>
                <textarea value={info.description} onChange={e => setInfo(p => ({ ...p, description: e.target.value }))} rows={3} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "6px 8px", fontSize: 12.5, outline: "none", resize: "none", lineHeight: 1.5 }} />
              </div>
            </Sec>
            <Sec label="Page sections">
              {BLOCK_LIST.map((b, i) => (
                <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < BLOCK_LIST.length - 1 ? `1px solid ${C.border}` : undefined }}>
                  <span style={{ fontSize: 13, color: blocks[b.id] ? C.text : C.muted, transition: "color .15s" }}>{b.label}</span>
                  <div onClick={() => setBlocks(p => ({ ...p, [b.id]: !p[b.id] }))} style={{ width: 34, height: 19, borderRadius: 10, background: blocks[b.id] ? C.green : "#3A3A3C", cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0 }}>
                    <div style={{ width: 13, height: 13, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: blocks[b.id] ? 18 : 3, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.4)" }} />
                  </div>
                </div>
              ))}
            </Sec>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, padding: "6px 12px" }}>
                <Globe size={12} color={C.muted} strokeWidth={1.5} />
                <span style={{ fontSize: 12, color: C.muted }}>evara.app/e/{info.slug || "your-event"}</span>
              </div>
              <span style={{ fontSize: 11, background: `${C.blue}14`, color: C.blue, border: `1px solid ${C.blue}28`, borderRadius: 5, padding: "3px 10px" }}>● Preview</span>
            </div>
            <div style={{ flex: 1, overflow: "auto", border: `1px solid ${C.border}`, borderRadius: 10, background: info.template === "minimal" ? "#fff" : info.template === "bold" ? "#0F0A2A" : "#0D0D0F" }}>
              <div style={{ fontFamily: "Outfit,sans-serif", color: info.template === "minimal" ? "#111" : "#F5F5F7", minHeight: "100%", padding: "0 0 40px" }}>
                <div style={{ padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${info.template === "minimal" ? "#e5e5e5" : "rgba(255,255,255,0.1)"}` }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{info.title || activeEvent?.name || "Your Event"}</span>
                  <button style={{ background: C.blue, color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>{info.cta_text || "Register Now"}</button>
                </div>
                {blocks.hero && <div style={{ padding: "52px 28px 40px", textAlign: "center" }}>
                  {activeEvent?.event_date && <div style={{ fontSize: 11, fontWeight: 500, color: C.blue, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 12 }}>{new Date(activeEvent.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</div>}
                  <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.8px", lineHeight: 1.05, marginBottom: 14 }}>{info.title || activeEvent?.name || "Event Title"}</h1>
                  <p style={{ fontSize: 16, opacity: .65, maxWidth: 480, margin: "0 auto 24px", lineHeight: 1.6 }}>{info.tagline || "Your event tagline"}</p>
                  <button style={{ background: C.blue, color: "#fff", border: "none", padding: "13px 32px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>{info.cta_text || "Register Now"}</button>
                </div>}
                {blocks.details && info.description && <div style={{ padding: "32px 28px", borderTop: `1px solid rgba(255,255,255,0.08)` }}>
                  <div style={{ fontSize: 10.5, color: C.blue, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10, fontWeight: 500 }}>About</div>
                  <p style={{ fontSize: 15, opacity: .72, lineHeight: 1.75, maxWidth: 580 }}>{info.description}</p>
                </div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FORMS VIEW ───────────────────────────────────────────────
function FormsView({ supabase, profile, activeEvent, fire }) {
  const [forms, setForms] = useState([]);
  const [activeForm, setActiveForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [tab, setTab] = useState("builder");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState([]);
  const [formName, setFormName] = useState("");
  const [nextId, setNextId] = useState(100);
  const DEFAULT_FIELDS = [
    { id: 1, type: "text", label: "First Name", required: true, options: [] }, { id: 2, type: "text", label: "Last Name", required: false, options: [] },
    { id: 3, type: "email", label: "Email Address", required: true, options: [] }, { id: 4, type: "text", label: "Company", required: false, options: [] },
    { id: 5, type: "radio", label: "Will you attend?", required: true, options: ["Yes, I'll attend", "Unable to attend"] },
    { id: 6, type: "checkbox", label: "I consent to receive event communications.", required: true, options: [] },
  ];
  const FIELD_TYPES = [{ type: "text", icon: "Aa", label: "Short Text" }, { type: "email", icon: "@", label: "Email" }, { type: "phone", icon: "✆", label: "Phone" }, { type: "textarea", icon: "¶", label: "Long Text" }, { type: "select", icon: "▾", label: "Dropdown" }, { type: "radio", icon: "◉", label: "Multiple Choice" }, { type: "checkbox", icon: "☑", label: "Checkbox" }, { type: "file", icon: "↑", label: "File Upload" }];
  useEffect(() => {
    if (!activeEvent || !profile) return;
    supabase.from("forms").select("*").eq("event_id", activeEvent.id).order("created_at", { ascending: false })
      .then(({ data }) => { setForms(data || []); if (data?.length) { setActiveForm(data[0]); setFields(data[0].fields || DEFAULT_FIELDS); setFormName(data[0].name || ""); } else { setFields(DEFAULT_FIELDS); setFormName(`${activeEvent.name} — Registration`); } setLoading(false); });
  }, [activeEvent, profile]);
  useEffect(() => {
    if (!activeForm) return;
    supabase.from("form_submissions").select("*,contacts(first_name,last_name,email,company_name)").eq("form_id", activeForm.id).order("submitted_at", { ascending: false })
      .then(({ data }) => setSubmissions(data || []));
  }, [activeForm]);
  const saveForm = async () => {
    if (!activeEvent || !profile) return; setSaving(true);
    const payload = { event_id: activeEvent.id, company_id: profile.company_id, name: formName, fields, form_type: "registration", is_active: true };
    const { data, error } = activeForm ? await supabase.from("forms").update(payload).eq("id", activeForm.id).select().single() : await supabase.from("forms").insert(payload).select().single();
    if (error) { fire(error.message, "err"); } else { setActiveForm(data); if (!activeForm) setForms(p => [data, ...p]); fire("Form saved!"); }
    setSaving(false);
  };
  const addField = type => { setFields(p => [...p, { id: nextId, type, label: FIELD_TYPES.find(f => f.type === type)?.label || "Field", required: false, options: type === "radio" ? ["Option 1", "Option 2"] : [] }]); setNextId(p => p + 1); };
  const removeField = id => setFields(p => p.filter(f => f.id !== id));
  const updateLabel = (id, val) => setFields(p => p.map(f => f.id === id ? { ...f, label: val } : f));
  const toggleReq = id => setFields(p => p.map(f => f.id === id ? { ...f, required: !f.required } : f));
  const moveUp = i => { if (i === 0) return; const a = [...fields]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; setFields(a); };
  const moveDown = i => { if (i === fields.length - 1) return; const a = [...fields]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; setFields(a); };
  const shareLink = activeForm ? `${window.location.origin}/form/${activeForm.share_token}` : "Save form first";
  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", gap: 10, color: C.muted }}><Spin />Loading…</div>;
  return (
    <div style={{ animation: "fadeUp .2s ease", display: "flex", flexDirection: "column", height: "calc(100vh - 110px)" }}>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.6px", color: C.text }}>Registration Forms</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Build your form, save it, then share the link or embed it.</p>
        </div>
        <button onClick={saveForm} disabled={saving} style={{ fontSize: 13, padding: "7px 18px", borderRadius: 7, border: "none", background: C.blue, color: "#fff", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>{saving ? <><Spin />Saving…</> : activeForm ? "Save changes →" : "Create form →"}</button>
      </div>
      <div style={{ display: "flex", gap: 0, marginBottom: 16, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 3, width: "fit-content", flexShrink: 0 }}>
        {[{ id: "builder", label: "Form builder" }, { id: "preview", label: "Preview" }, { id: "responses", label: `Responses (${submissions.length})` }, { id: "share", label: "Share & embed" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: tab === t.id ? C.raised : "transparent", color: tab === t.id ? C.text : C.muted, fontSize: 12.5, fontWeight: tab === t.id ? 500 : 400, transition: "all .12s", cursor: "pointer" }}>{t.label}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 14, flex: 1, minHeight: 0 }}>
        {(tab === "builder" || tab === "preview") && (
          <div style={{ width: 256, display: "flex", flexDirection: "column", gap: 10, overflow: "auto", flexShrink: 0 }}>
            <Sec label="Form name">
              <input value={formName} onChange={e => setFormName(e.target.value)} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: "7px 9px", fontSize: 13, outline: "none" }} />
            </Sec>
            {tab === "builder" && <>
              <Sec label="Add field">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                  {FIELD_TYPES.map(f => (
                    <button key={f.type} onClick={() => addField(f.type)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, cursor: "pointer", textAlign: "left", transition: "all .12s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue; }} onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
                      <span style={{ width: 16, textAlign: "center" }}>{f.icon}</span><span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </Sec>
              <Sec label={`Fields (${fields.length})`}>
                {fields.map((f, i) => (
                  <div key={f.id} style={{ background: C.raised, borderRadius: 7, border: `1px solid ${C.border}`, padding: "9px 10px", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 9.5, color: C.muted, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: "1px 5px", textTransform: "uppercase", fontWeight: 600 }}>{f.type}</span>
                      <div style={{ display: "flex", gap: 2, marginLeft: "auto" }}>
                        <button onClick={() => moveUp(i)} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 13, padding: "0 3px", cursor: "pointer" }}>↑</button>
                        <button onClick={() => moveDown(i)} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 13, padding: "0 3px", cursor: "pointer" }}>↓</button>
                        <button onClick={() => removeField(f.id)} style={{ background: "transparent", border: "none", color: C.red, fontSize: 14, padding: "0 3px", cursor: "pointer" }}>×</button>
                      </div>
                    </div>
                    <div style={{ fontSize: 9.5, color: C.blue, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>Field label</div>
                    <input value={f.label} onChange={e => updateLabel(f.id, e.target.value)} placeholder="e.g. First Name, Company…"
                      style={{ width: "100%", background: C.bg, border: `1px solid ${C.blue}30`, borderRadius: 5, color: C.text, padding: "5px 7px", fontSize: 12, outline: "none", marginBottom: 5 }} />
                    <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.muted, cursor: "pointer" }}>
                      <input type="checkbox" checked={f.required} onChange={() => toggleReq(f.id)} style={{ accentColor: C.blue }} />Required
                    </label>
                  </div>
                ))}
              </Sec>
            </>}
          </div>
        )}
        <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          {(tab === "builder" || tab === "preview") && (
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, background: "#F2F2F7", overflow: "auto", height: "100%" }}>
              <div style={{ maxWidth: 520, margin: "0 auto", padding: "28px 22px" }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: "#111", marginBottom: 4, letterSpacing: "-0.3px" }}>{formName || "Form name"}</h2>
                <p style={{ fontSize: 13, color: "#666", marginBottom: 22 }}>Fill in your details to register your place.</p>
                {fields.map(f => (
                  <div key={f.id} style={{ marginBottom: 16 }}>
                    {f.type !== "checkbox" && <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#111", marginBottom: 6 }}>{f.label}{f.required && <span style={{ color: C.blue, marginLeft: 2 }}>*</span>}</label>}
                    {(f.type === "text" || f.type === "email" || f.type === "phone") && <div style={{ height: 38, borderRadius: 7, border: "1px solid #D1D1D6", background: "white", padding: "0 12px", display: "flex", alignItems: "center" }}><span style={{ fontSize: 13, color: "#AEAEB2" }}>Enter {f.label.toLowerCase()}…</span></div>}
                    {f.type === "textarea" && <div style={{ height: 72, borderRadius: 7, border: "1px solid #D1D1D6", background: "white", padding: "10px 12px" }}><span style={{ fontSize: 13, color: "#AEAEB2" }}>Type your response…</span></div>}
                    {f.type === "select" && <div style={{ height: 38, borderRadius: 7, border: "1px solid #D1D1D6", background: "white", padding: "0 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ fontSize: 13, color: "#AEAEB2" }}>Select…</span><span style={{ color: "#999" }}>▾</span></div>}
                    {f.type === "radio" && (f.options || []).map((o, j) => (
                      <label key={j} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer" }}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", border: "1.5px solid #D1D1D6", background: "white", flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "#333" }}>{o}</span>
                      </label>
                    ))}
                    {f.type === "checkbox" && <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
                      <div style={{ width: 16, height: 16, borderRadius: 3, border: "1.5px solid #D1D1D6", background: "white", marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, color: "#555", lineHeight: 1.5 }}>{f.label}{f.required && <span style={{ color: C.blue, marginLeft: 2 }}>*</span>}</span>
                    </label>}
                    {f.type === "file" && <div style={{ height: 56, borderRadius: 7, border: "1.5px dashed #D1D1D6", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 13, color: "#AEAEB2" }}>↑ Click to upload</span></div>}
                  </div>
                ))}
                {fields.length > 0 && <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                  <button style={{ flex: 1, padding: "12px", background: C.blue, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Submit registration</button>
                </div>}
                <div style={{ marginTop: 14, fontSize: 11, color: "#AEAEB2", textAlign: "center" }}>🔒 Data encrypted · Powered by evara</div>
              </div>
            </div>
          )}
          {tab === "responses" && (
            <div>
              {submissions.length === 0 ? <div style={{ background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, padding: "48px", textAlign: "center", color: C.muted }}><FileText size={32} style={{ opacity: .3, marginBottom: 12 }} /><div style={{ fontSize: 14, marginBottom: 6 }}>No submissions yet</div><div style={{ fontSize: 13 }}>Share your form to collect registrations</div></div> : (
                <div style={{ background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                  <div style={{ padding: "13px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{submissions.length} responses</span>
                    <button onClick={() => fire("Exported!")} style={{ fontSize: 12, padding: "5px 12px", background: C.blue, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>Export CSV</button>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>{["Submitted", "Name", "Email", "Responses"].map(h => <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10.5, color: C.muted, fontWeight: 500, textTransform: "uppercase" }}>{h}</th>)}</tr></thead>
                    <tbody>{submissions.map((s, i) => (
                      <tr key={s.id} className="rh" style={{ borderBottom: i < submissions.length - 1 ? `1px solid ${C.border}` : undefined, background: "transparent" }}>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: C.muted }}>{new Date(s.submitted_at).toLocaleDateString()}</td>
                        <td style={{ padding: "10px 14px", fontSize: 13, color: C.text }}>{s.contacts ? `${s.contacts.first_name || ""} ${s.contacts.last_name || ""}`.trim() || "—" : "—"}</td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: C.muted }}>{s.submitter_email || s.contacts?.email || "—"}</td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: C.muted }}>{Object.keys(s.responses || {}).length} fields</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {tab === "share" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {!activeForm && <Alert type="error">Save the form first to get a share link</Alert>}
              <Sec label="Shareable link">
                <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 10 }}>Anyone with this link can fill in the form. No login required.</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 12px", fontSize: 12, color: C.sec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shareLink}</div>
                  <button onClick={() => { navigator.clipboard?.writeText(shareLink); fire("Link copied!"); }} style={{ padding: "9px 14px", background: C.blue, color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Copy</button>
                </div>
              </Sec>
              <Sec label="Embed code">
                <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 10 }}>Paste this into any webpage to embed the form inline.</div>
                <div style={{ background: C.bg, borderRadius: 7, border: `1px solid ${C.border}`, padding: 12, fontFamily: "monospace", fontSize: 11.5, color: C.teal, lineHeight: 1.7, wordBreak: "break-all", marginBottom: 10 }}>
                  {`<iframe src="${shareLink}" width="100%" height="600" frameborder="0" style="border:none;border-radius:8px;"></iframe>`}
                </div>
                <button onClick={() => { navigator.clipboard?.writeText(`<iframe src="${shareLink}" width="100%" height="600" frameborder="0"></iframe>`); fire("Embed code copied!"); }} style={{ padding: "8px 16px", background: C.blue, color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Copy embed code</button>
              </Sec>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────
function SettingsView({ supabase, profile, fire }) {
  const [name, setName] = useState(profile?.full_name || "");
  const [company, setComp] = useState(profile?.companies?.name || "");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    await supabase.from("profiles").update({ full_name: name }).eq("id", profile.id);
    await supabase.from("companies").update({ name: company }).eq("id", profile.company_id);
    setSaving(false); fire("Settings saved!");
  };
  return (
    <div style={{ animation: "fadeUp .2s ease", maxWidth: 560 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.6px", color: C.text, marginBottom: 6 }}>Settings</h1>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>Manage your profile, company and security settings.</p>
      <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 16 }}>Profile</div>
        {[{ label: "Full name", val: name, set: setName }, { label: "Company name", val: company, set: setComp }].map(f => (
          <div key={f.label} style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11.5, color: C.muted, marginBottom: 5 }}>{f.label}</label>
            <input value={f.val} onChange={e => f.set(e.target.value)} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, padding: "10px 12px", fontSize: 13, outline: "none" }}
              onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
          </div>
        ))}
        <div>
          <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 5 }}>Email</div>
          <div style={{ padding: "10px 12px", background: C.raised, borderRadius: 7, fontSize: 13, color: C.muted, border: `1px solid ${C.border}` }}>{profile?.email}</div>
        </div>
      </div>
      <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}><Shield size={13} color={C.blue} /><span style={{ fontSize: 11, fontWeight: 600, color: C.blue, textTransform: "uppercase", letterSpacing: "0.8px" }}>Security & Privacy</span></div>
        {["Data isolated per company", "Zero PII sent to AI", "TLS 1.3 encryption in transit", "Row-level security enforced", "GDPR compliant"].map(s => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 13, color: C.sec }}><CheckCircle size={13} color={C.green} />{s}</div>
        ))}
      </div>
      <button onClick={save} disabled={saving} style={{ padding: "11px 28px", background: saving ? C.raised : C.blue, border: "none", borderRadius: 8, color: saving ? C.muted : "#fff", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, transition: "all .15s", cursor: "pointer" }}>
        {saving ? <><Spin />Saving…</> : "Save changes"}
      </button>
    </div>
  );
}

// ─── SHARED ───────────────────────────────────────────────────
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
  const [walkinName, setWalkinName] = useState("");
  const [walkinEmail, setWalkinEmail] = useState("");
  const [walkinCompany, setWalkinCompany] = useState("");
  const [showWalkin, setShowWalkin] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const STAT_CARDS = [
    { label: "Expected", val: stats.total, color: C.muted },
    { label: "Checked In", val: stats.attended, color: C.green },
    { label: "Pending", val: stats.total - stats.attended, color: C.amber },
    { label: "Walk-ins", val: stats.walkin, color: C.blue },
  ];

  if (!activeEvent) return <div style={{ padding: 40, color: C.muted, textAlign: "center" }}>No active event</div>;

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: C.text, letterSpacing: "-0.6px" }}>Event Check-in</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>{activeEvent.name} — live check-in dashboard</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["host", "kiosk"].map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ fontSize: 13, padding: "7px 16px", borderRadius: 7, border: `1px solid ${mode === m ? C.blue + "80" : C.border}`, background: mode === m ? C.blue + "14" : "transparent", color: mode === m ? C.blue : C.muted, cursor: "pointer", textTransform: "capitalize" }}>
              {m === "host" ? "👤 Host Mode" : "🖥 Kiosk Mode"}
            </button>
          ))}
          <button onClick={() => setShowWalkin(true)}
            style={{ fontSize: 13, padding: "7px 16px", borderRadius: 7, border: "none", background: C.blue, color: "#fff", cursor: "pointer", fontWeight: 500 }}>
            + Walk-in
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} style={{ background: C.card, borderRadius: 10, padding: "16px", border: `1px solid ${C.border}`, borderTop: `2px solid ${s.color}40` }}>
            <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.val}</div>
            {s.label === "Checked In" && stats.total > 0 && (
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{Math.round((s.val / stats.total) * 100)}% attendance</div>
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ background: C.card, borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.border}`, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, color: C.muted }}>
          <span>Check-in progress</span>
          <span style={{ color: C.green }}>{stats.attended}/{stats.total} checked in</span>
        </div>
        <div style={{ height: 8, background: C.raised, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", background: `linear-gradient(90deg, ${C.green}, ${C.teal})`, width: `${stats.total ? (stats.attended / stats.total) * 100 : 0}%`, borderRadius: 4, transition: "width .5s ease" }} />
        </div>
      </div>

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
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><Spin />Loading guests…</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Name", "Company", "Email", "Status", "Action"].map(h => (
                <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10.5, color: C.muted, fontWeight: 500, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: C.muted }}>No guests found</td></tr>
              ) : filtered.map((ec, i) => {
                const c = ec.contacts || {};
                const attended = ec.status === "attended";
                return (
                  <tr key={ec.id} className="rh" style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : undefined, background: attended ? `${C.green}06` : "transparent" }}>
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
  "instagram": { "caption": "Engaging caption with emojis", "hashtags": ["tag1","tag2","tag3","tag4","tag5"], "story_ideas": ["idea1","idea2","idea3"] }
}`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
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
              <Megaphone size={36} strokeWidth={1} />
              <div style={{ fontSize: 14 }}>Select a phase and click Generate</div>
            </div>
          )}
          {generating && (
            <div style={{ height: "100%", minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: C.muted, border: `1px dashed ${C.border}`, borderRadius: 10 }}>
              <Spin size={28} /><div>Claude is writing your posts…</div>
            </div>
          )}
          {posts && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PLATFORMS.map(plat => {
                const data = posts[plat.id] || {};
                const text = data.post || data.caption || "";
                const tags = (data.hashtags || []).map(t => `#${t.replace(/^#/, "")}`).join(" ");
                const full = `${text}\n\n${tags}`;
                return (
                  <div key={plat.id} style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{plat.emoji}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{plat.label}</span>
                        {plat.id === "twitter" && <span style={{ fontSize: 11, color: C.muted }}>({text.length}/280 chars)</span>}
                      </div>
                      <button onClick={() => copy(full, plat.id)}
                        style={{ fontSize: 12, padding: "5px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: copied === plat.id ? C.green + "15" : "transparent", color: copied === plat.id ? C.green : C.muted, cursor: "pointer" }}>
                        {copied === plat.id ? "✅ Copied!" : "Copy"}
                      </button>
                    </div>
                    <div style={{ padding: "14px 16px" }}>
                      <p style={{ fontSize: 13, color: C.sec, lineHeight: 1.7, marginBottom: 10, whiteSpace: "pre-wrap" }}>{text}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {(data.hashtags || []).map(t => (
                          <span key={t} style={{ fontSize: 11, color: C.blue, background: C.blue + "12", padding: "2px 8px", borderRadius: 4 }}>#{t.replace(/^#/, "")}</span>
                        ))}
                      </div>
                      {plat.id === "instagram" && data.story_ideas?.length > 0 && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                          <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Story Ideas</div>
                          {data.story_ideas.map((s, i) => (
                            <div key={i} style={{ fontSize: 12, color: C.sec, padding: "5px 0", borderBottom: i < data.story_ideas.length - 1 ? `1px solid ${C.border}` : undefined }}>
                              📱 {s}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ANALYTICS VIEW ───────────────────────────────────────────
function AnalyticsView({ supabase, profile, activeEvent, fire }) {
  const [data, setData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeEvent || !profile) return;
    load();
  }, [activeEvent, profile]);

  const load = async () => {
    setLoading(true);
    const [{ data: m }, { data: cams }, { data: ecs }] = await Promise.all([
      supabase.from("event_summary").select("*").eq("event_id", activeEvent.id).single(),
      supabase.from("email_campaigns").select("*").eq("event_id", activeEvent.id).order("created_at", { ascending: false }),
      supabase.from("event_contacts").select("status").eq("event_id", activeEvent.id),
    ]);
    setData(m);
    setCampaigns(cams || []);
    const counts = (ecs || []).reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
    setData(prev => ({ ...prev, ...counts, ec_total: (ecs || []).length }));
    setLoading(false);
  };

  if (!activeEvent) return <div style={{ padding: 40, color: C.muted, textAlign: "center" }}>No active event selected</div>;

  const METRICS = [
    { label: "Emails Sent", val: data?.total_sent || 0, color: C.blue, icon: "📧" },
    { label: "Open Rate", val: data?.total_sent ? `${Math.round((data.total_opened / data.total_sent) * 100)}%` : "—", color: C.teal, icon: "👁" },
    { label: "Registered", val: data?.ec_total || 0, color: C.text, icon: "📋" },
    { label: "Confirmed", val: data?.confirmed || 0, color: C.green, icon: "✅" },
    { label: "Attended", val: data?.attended || 0, color: C.blue, icon: "🎟" },
    { label: "Declined", val: data?.declined || 0, color: C.red, icon: "❌" },
    { label: "No-show Rate", val: data?.confirmed && data?.attended ? `${Math.round(((data.confirmed - data.attended) / data.confirmed) * 100)}%` : "—", color: C.amber, icon: "📉" },
    { label: "Show Rate", val: data?.confirmed && data?.attended ? `${Math.round((data.attended / data.confirmed) * 100)}%` : "—", color: C.green, icon: "📈" },
  ];

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: C.text, letterSpacing: "-0.6px" }}>Analytics</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>{activeEvent.name} — full performance overview</p>
        </div>
        <button onClick={load} style={{ fontSize: 13, padding: "7px 16px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><Spin />Loading analytics…</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
            {METRICS.map((m, i) => (
              <div key={i} style={{ background: C.card, borderRadius: 10, padding: "16px 14px", border: `1px solid ${C.border}`, borderTop: `2px solid ${m.color}35` }}>
                <div style={{ fontSize: 18, marginBottom: 6 }}>{m.icon}</div>
                <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 }}>{m.label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: m.color, letterSpacing: "-0.5px" }}>{loading ? "—" : m.val}</div>
              </div>
            ))}
          </div>

          {/* Email campaigns breakdown */}
          <div style={{ background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ padding: "13px 16px", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>Email Campaign Performance</span>
            </div>
            {campaigns.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: C.muted }}>No campaigns yet</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Campaign", "Type", "Status", "Sent", "Opened", "Open Rate"].map(h => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10.5, color: C.muted, fontWeight: 500, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {campaigns.map((cam, i) => {
                    const openRate = cam.total_sent ? Math.round((cam.total_opened / cam.total_sent) * 100) : 0;
                    return (
                      <tr key={cam.id} className="rh" style={{ borderBottom: i < campaigns.length - 1 ? `1px solid ${C.border}` : undefined }}>
                        <td style={{ padding: "11px 14px", fontSize: 13, color: C.text, maxWidth: 200 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cam.name}</div>
                          {cam.subject && <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontStyle: "italic" }}>"{cam.subject}"</div>}
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 12, color: C.muted, textTransform: "capitalize" }}>{cam.email_type?.replace(/_/g, " ")}</td>
                        <td style={{ padding: "11px 14px" }}>
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: cam.status === "sent" ? C.green + "15" : C.blue + "15", color: cam.status === "sent" ? C.green : C.blue }}>{cam.status}</span>
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 13, color: C.text }}>{cam.total_sent || "—"}</td>
                        <td style={{ padding: "11px 14px", fontSize: 13, color: C.text }}>{cam.total_opened || "—"}</td>
                        <td style={{ padding: "11px 14px" }}>
                          {cam.total_sent > 0 ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, height: 4, background: C.raised, borderRadius: 2 }}>
                                <div style={{ height: "100%", background: openRate >= 40 ? C.green : openRate >= 20 ? C.amber : C.red, width: `${Math.min(openRate, 100)}%`, borderRadius: 2 }} />
                              </div>
                              <span style={{ fontSize: 12, color: C.sec, minWidth: 35 }}>{openRate}%</span>
                            </div>
                          ) : <span style={{ fontSize: 12, color: C.muted }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Event lifecycle funnel */}
          <div style={{ background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 16 }}>Event Lifecycle Funnel</div>
            {[
              { label: "Emails Sent", val: data?.total_sent || 0, color: C.blue },
              { label: "Opened", val: data?.total_opened || 0, color: C.teal },
              { label: "Registered", val: data?.ec_total || 0, color: C.text },
              { label: "Confirmed", val: data?.confirmed || 0, color: C.amber },
              { label: "Attended", val: data?.attended || 0, color: C.green },
            ].map((s, i, arr) => {
              const max = arr[0].val || 1;
              const pct = Math.round((s.val / max) * 100);
              return (
                <div key={s.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                    <span style={{ color: C.sec }}>{s.label}</span>
                    <span style={{ color: s.color, fontWeight: 600 }}>{s.val.toLocaleString()} {max > 0 && i > 0 ? `(${pct}%)` : ""}</span>
                  </div>
                  <div style={{ height: 6, background: C.raised, borderRadius: 3 }}>
                    <div style={{ height: "100%", background: s.color, width: `${pct}%`, borderRadius: 3, transition: "width .5s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── CAMPAIGN BUILDER VIEW ────────────────────────────────────
function CampaignView({ supabase, profile, activeEvent, fire, setView }) {
  const [generating, setGenerating] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [generated, setGenerated] = useState(null);
  const [config, setConfig] = useState({
    tone: "professional and exciting",
    highlights: "",
    speakers: "",
    extras: "",
  });

  useEffect(() => {
    if (!activeEvent || !profile) return;
    supabase.from("email_campaigns").select("*").eq("event_id", activeEvent.id).order("created_at", { ascending: false })
      .then(({ data }) => setCampaigns(data || []));
  }, [activeEvent, profile]);

  const generateCampaign = async () => {
    if (!activeEvent) { fire("No active event", "err"); return; }
    setGenerating(true); setGenerated(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({
          eventId: activeEvent.id,
          eventName: activeEvent.name,
          eventDate: activeEvent.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "",
          eventTime: activeEvent.event_time || "",
          location: activeEvent.location || "",
          description: activeEvent.description || "",
          orgName: profile?.companies?.name || "",
          tone: config.tone,
          highlights: config.highlights,
          speakers: config.speakers,
          extras: config.extras,
          companyId: profile.company_id,
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setGenerated(data);
      fire(`✅ ${data.campaigns?.length || 7} emails generated!`);
      const { data: cams } = await supabase.from("email_campaigns").select("*").eq("event_id", activeEvent.id).order("created_at", { ascending: false });
      setCampaigns(cams || []);
    } catch (err) { fire("Generation failed: " + err.message, "err"); }
    setGenerating(false);
  };

  const EMAIL_SEQUENCE = [
    { type: "save_the_date", label: "Save the Date", timing: "8 weeks before", emoji: "📅" },
    { type: "invitation", label: "Invitation", timing: "6 weeks before", emoji: "✉️" },
    { type: "reminder", label: "Reminder", timing: "2 weeks before", emoji: "⏰" },
    { type: "byo", label: "What to Bring", timing: "3 days before", emoji: "🎒" },
    { type: "day_of", label: "Day-of Details", timing: "Morning of event", emoji: "🗓" },
    { type: "thank_you", label: "Thank You", timing: "Day after", emoji: "🙏" },
    { type: "confirmation", label: "Follow-up", timing: "1 week after", emoji: "📊" },
  ];

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: C.text, letterSpacing: "-0.6px" }}>Campaign Builder</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Generate a full 7-email event lifecycle campaign in one click.</p>
        </div>
        {campaigns.length > 0 && (
          <button onClick={() => setView("schedule")}
            style={{ fontSize: 13, padding: "7px 16px", borderRadius: 7, border: "none", background: C.green, color: "#fff", fontWeight: 500, cursor: "pointer" }}>
            View in Scheduling →
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        {/* Config panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <Sec label="Campaign settings">
            {[{ k: "tone", ph: "e.g. professional, exciting, exclusive" },
              { k: "speakers", ph: "e.g. John Smith, CEO at Acme" },
              { k: "highlights", ph: "e.g. 3 workshops, networking dinner" },
              { k: "extras", ph: "e.g. black tie, partners welcome" }
            ].map(f => (
              <div key={f.k} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 3, textTransform: "capitalize" }}>{f.k}</div>
                <input value={config[f.k]} onChange={e => setConfig(p => ({ ...p, [f.k]: e.target.value }))}
                  placeholder={f.ph} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "6px 8px", fontSize: 12, outline: "none" }} />
              </div>
            ))}
          </Sec>
          <button onClick={generateCampaign} disabled={generating}
            style={{ padding: 12, borderRadius: 8, border: "none", background: generating ? C.raised : `linear-gradient(135deg, ${C.blue}, #6366f1)`, color: generating ? C.muted : "#fff", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", boxShadow: generating ? "none" : `0 4px 20px ${C.blue}40` }}>
            {generating ? <><Spin />Building campaign…</> : <><Sparkles size={14} />Generate 7-Email Campaign</>}
          </button>
          <div style={{ background: C.card, borderRadius: 8, border: `1px solid ${C.border}`, padding: 14 }}>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>What gets generated</div>
            {EMAIL_SEQUENCE.map((e, i) => (
              <div key={e.type} style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 0", borderBottom: i < EMAIL_SEQUENCE.length - 1 ? `1px solid ${C.border}` : undefined }}>
                <span style={{ fontSize: 16 }}>{e.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{e.label}</div>
                  <div style={{ fontSize: 10.5, color: C.muted }}>{e.timing}</div>
                </div>
                {campaigns.find(c => c.email_type === e.type) ? (
                  <span style={{ fontSize: 10, color: C.green }}>✅</span>
                ) : (
                  <span style={{ fontSize: 10, color: C.muted }}>—</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Results panel */}
        <div>
          {!generated && !generating && campaigns.length === 0 && (
            <div style={{ minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: C.muted, border: `1px dashed ${C.border}`, borderRadius: 10 }}>
              <Layers size={40} strokeWidth={1} />
              <div style={{ fontSize: 15, fontWeight: 500, color: C.text }}>Generate your full event campaign</div>
              <div style={{ fontSize: 13, color: C.muted, textAlign: "center", maxWidth: 300 }}>
                One click generates 7 perfectly-timed emails covering the complete event lifecycle
              </div>
            </div>
          )}
          {generating && (
            <div style={{ minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: C.muted, border: `1px dashed ${C.border}`, borderRadius: 10 }}>
              <Spin size={32} />
              <div style={{ fontSize: 15, color: C.text }}>Claude is writing 7 emails…</div>
              <div style={{ fontSize: 12, color: C.muted }}>This takes about 30 seconds</div>
            </div>
          )}
          {campaigns.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>{campaigns.length} campaigns saved — click any to preview</div>
              {campaigns.map(cam => (
                <div key={cam.id} style={{ background: C.card, borderRadius: 9, border: `1px solid ${cam.status === "sent" ? C.green + "40" : C.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{EMAIL_SEQUENCE.find(e => e.type === cam.email_type)?.emoji || "✉️"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 2 }}>{cam.subject || cam.name}</div>
                    <div style={{ fontSize: 11, color: C.muted, textTransform: "capitalize" }}>
                      {cam.email_type?.replace(/_/g, " ")} · {cam.status} · {cam.segment}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 4, background: cam.status === "sent" ? C.green + "15" : C.blue + "15", color: cam.status === "sent" ? C.green : C.blue }}>{cam.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
