// evara — All-in-One Event Marketing Platform v1.2
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard, Mail, Globe, FileText, Users, Calendar,
  Settings, Bell, Search, Download, Share2, Plus, Zap,
  Shield, ChevronDown, Sparkles, X, Phone,
  LogOut, AlertCircle, CheckCircle, Send, Star, Eye, Upload, Image as ImageIcon,
  QrCode, BarChart3, BarChart2, Megaphone, UserCheck, UserCheck2,
  Layers, Layout, Link, ExternalLink, ClipboardList, TrendingUp,
  Radio
} from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "https://sqddpjsgtwblmkgxqyxe.supabase.co",
  import.meta.env.VITE_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZGRwanNndHdibG1rZ3hxeXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODk5NTAsImV4cCI6MjA4OTY2NTk1MH0.x5BOfQRzn-F_tvUJv3mHRmfdOZiklyMkGzmPfRYoII4"
);

const SUPABASE_URL = "https://sqddpjsgtwblmkgxqyxe.supabase.co";
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

const isBusinessEmail = (email) => {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1]?.toLowerCase();
  return domain && !BLOCKED_DOMAINS.includes(domain);
};

const C = {
  bg:"#080809", sidebar:"#0D0D0F", card:"#111114", raised:"#161619",
  border:"#1C1C1F", borderHi:"#2C2C30",
  blue:"#0A84FF", text:"#F5F5F7", sec:"#AEAEB2", muted:"#636366",
  green:"#30D158", red:"#FF453A", amber:"#FF9F0A", teal:"#5AC8FA",
};

// Generate an ICS calendar file string
const generateICS = (event) => {
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

const ST = {
  confirmed:{ label:"Confirmed", color:C.green  },
  declined: { label:"Declined",  color:C.red    },
  pending:  { label:"Pending",   color:C.amber  },
  attended: { label:"Attended",  color:C.blue   },
  invited:  { label:"Invited",   color:C.teal   },
  waitlist: { label:"Waitlist",  color:"#8B5CF6" },
};

const NAV_GROUPS = [
  { label: "Overview", items: [
    { id:"dashboard", label:"Dashboard",  icon:LayoutDashboard },
    { id:"calendar",  label:"Calendar",   icon:Calendar },
    { id:"analytics", label:"Analytics",  icon:BarChart2 },
  ]},
  { label: "Marketing", items: [
    { id:"edm",       label:"eDM Builder",   icon:Mail, badge:"AI" },
    { id:"schedule",  label:"Scheduling",    icon:Calendar },
    { id:"campaign",  label:"Campaigns",     icon:Layout, badge:"AI" },
    { id:"social",    label:"AI Social",     icon:Radio, badge:"AI" },
    { id:"landing",   label:"Landing Pages", icon:Globe },
    { id:"forms",     label:"Forms",         icon:FileText },
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
const NAV = NAV_GROUPS.flatMap(g => g.items);

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
  const submit = async e => {
    e.preventDefault(); setLoading(true); setError(null);
    // Block personal email domains on signup
    if (mode === "signup" && !isBusinessEmail(email)) {
      setError("Please use a business email address. Personal emails (Gmail, Yahoo, Hotmail, etc.) are not allowed.");
      setLoading(false); return;
    }
    try {
      if (mode === "login") { const { error: err } = await supabase.auth.signInWithPassword({ email, password }); if (err) throw err; }
      else { const { error: err } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name, company_name: company } } }); if (err) throw err; setMsg("Check your email to confirm your account!"); }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  return (
    <div style={{ height: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Outfit,sans-serif", color: C.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}button{cursor:pointer;font-family:Outfit,sans-serif}input{font-family:Outfit,sans-serif}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div style={{ width: 380, animation: "fadeUp .3s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center" }}><Zap size={13} color="#fff" strokeWidth={2.5} /></div>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px" }}>evara</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px", marginBottom: 5 }}>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p style={{ fontSize: 13, color: C.muted }}>{mode === "login" ? "Sign in to your workspace" : "Replace Mailchimp + Eventbrite + Typeform in one tool"}</p>
          {mode === "signup" && (
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
              {["eDM Builder", "Check-in", "Analytics", "AI Social"].map(f => (
                <span key={f} style={{ fontSize: 11, color: C.muted, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: C.green }}>✓</span> {f}
                </span>
              ))}
            </div>
          )}
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
  const [globalSearch, setGlobalSearch] = useState("");
  const [notifs, setNotifs] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

  // Smart notifications — check events on load
  useEffect(() => {
    if (!session) return;
    const checkSmartNotifs = async () => {
      const { data: profileData } = await supabase.from("profiles").select("company_id").eq("id", session.user.id).single();
      const compId = profileData?.company_id;
      if (!compId) return;
      const { data: events } = await supabase.from("events").select("id,name,event_date,status").eq("company_id", compId).order("event_date");
      if (!events?.length) return;
      const now = new Date();
      const newNotifs = [];
      for (const ev of events.slice(0, 5)) {
        if (!ev.event_date) continue;
        const days = Math.ceil((new Date(ev.event_date) - now) / (1000*60*60*24));
        if (days > 0 && days <= 7) newNotifs.push({ icon: "🔴", message: `${ev.name} is in ${days} day${days !== 1 ? "s" : ""}!`, time: "Due soon" });
        else if (days === 0) newNotifs.push({ icon: "🎉", message: `${ev.name} is TODAY!`, time: "Today" });
        else if (days > 0 && days <= 21 && ev.status === "draft") newNotifs.push({ icon: "⚠️", message: `${ev.name} is ${days} days away — still on Draft`, time: `${days}d to go` });
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
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [toast, setToast] = useState(null);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [newEventExtra, setNewEventExtra] = useState({ event_date: "", event_time: "", location: "" });


  const fire = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
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
      const { data: evts } = await supabase.from("events").select("*").eq("company_id", prof?.company_id).order("event_date", { ascending: true });
      setEvents(evts || []);
      if (evts?.length) setActiveEvent(evts[0]);
    };
    load();
  }, [session]);

  const createEvent = async () => {
    if (!newEventName.trim() || !profile) return;
    const shareToken = Math.random().toString(36).substring(2, 14) + Date.now().toString(36);
    const { data } = await supabase.from("events").insert({ 
      name: newEventName.trim(), 
      event_date: newEventExtra?.event_date || null, 
      event_time: newEventExtra?.event_time || null,
      location: newEventExtra?.location || null,
      description: newEventExtra?.description || null,
      capacity: newEventExtra?.capacity ? parseInt(newEventExtra.capacity) : null,
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
      
      // 🤖 AI-first: auto-draft the full email lifecycle in the background
      fire("✅ Event created! AI is drafting your email sequence…");
      const { data: { session: sess } } = await supabase.auth.getSession();
      fetch(`${SUPABASE_URL}/functions/v1/auto-draft-lifecycle`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sess?.access_token}` },
        body: JSON.stringify({ eventId: data.id, companyId: profile.company_id })
      }).then(r => r.json()).then(res => {
        if (res.success && res.drafts_created > 0) {
          fire(`🤖 ${res.drafts_created} email drafts ready in eDM Builder — review & send!`);
        }
      }).catch(() => {});
    }
    setNewEventExtra({ event_date: "", event_time: "", location: "" });
    setShowNewEvent(false); setNewEventName(""); setNewEventDate("");
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.text, fontFamily: "Outfit,sans-serif", overflow: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#2A2A2E;border-radius:3px}button{cursor:pointer;font-family:Outfit,sans-serif}input,textarea,select{font-family:Outfit,sans-serif}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}.nb:hover{background:${C.raised}!important;color:${C.text}!important}.mc:hover{background:${C.raised}!important;border-color:${C.borderHi}!important;transform:translateY(-1px)}.rh:hover{background:${C.raised}!important}`}</style>

      {/* SIDEBAR */}
      <aside style={{ width: 216, background: C.sidebar, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 3px ${C.blue}20` }}><Zap size={13} color="#fff" strokeWidth={2.5} /></div>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.4px" }}>evara</span>
            <span style={{ fontSize: 9, fontWeight: 600, background: `${C.blue}20`, color: C.blue, padding: "2px 5px", borderRadius: 3, letterSpacing: "0.5px", marginLeft: "auto" }}>BETA</span>
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
                <select value={activeEvent.id} onChange={e => {
                  const ev = events.find(x => x.id === e.target.value);
                  if (ev) setActiveEvent(ev);
                }} style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "7px 28px 7px 10px", fontSize: 12, fontWeight: 500, outline: "none", cursor: "pointer", appearance: "none", WebkitAppearance: "none" }}>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
                <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <ChevronDown size={11} color={C.muted} />
                </div>
              </div>
              <button onClick={async () => {
                const newName = window.prompt("Duplicate event as:", activeEvent.name + " (Copy)");
                if (!newName || !profile) return;
                const shareToken = Math.random().toString(36).substring(2, 14) + Date.now().toString(36);
                const { data } = await supabase.from("events").insert({
                  name: newName, event_date: activeEvent.event_date,
                  event_time: activeEvent.event_time, location: activeEvent.location,
                  description: activeEvent.description,
                  company_id: profile.company_id, status: "draft",
                  created_by: profile.id, share_token: shareToken,
                }).select().single();
                if (data) {
                    setEvents(p => [...p, data]);
                    setActiveEvent(data);
                    fire("✅ Event duplicated! Copying email drafts…");
                    const { data: existingCams } = await supabase.from("email_campaigns")
                      .select("*").eq("event_id", activeEvent.id).limit(20);
                    if (existingCams?.length) {
                      const dupCams = existingCams.map(c => ({
                        event_id: data.id,
                        company_id: profile.company_id,
                        name: c.name, email_type: c.email_type,
                        subject: c.subject, html_content: c.html_content,
                        plain_text: c.plain_text, status: "draft", segment: c.segment || "all",
                      }));
                      await supabase.from("email_campaigns").insert(dupCams);
                      fire(`✅ Duplicated with ${existingCams.length} email drafts!`);
                    }
                  }
                }} style={{ width: "100%", padding: "5px 8px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, fontSize: 11, cursor: "pointer", textAlign: "center" }}>
                + Duplicate event
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
              <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1.2px", padding: "10px 10px 4px", opacity: 0.7 }}>{group.label}</div>
              {group.items.map(({ id, label, icon: Icon, badge }) => {
                const on = view === id;
                return (<button key={id} data-view={id} className="nb" onClick={() => setView(id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6, border: "none", background: on ? C.raised : "transparent", color: on ? C.text : C.muted, width: "100%", textAlign: "left", fontSize: 12.5, fontWeight: on ? 500 : 400, borderLeft: `2px solid ${on ? C.blue : "transparent"}`, transition: "all .12s", marginBottom: 1 }}>
                  <Icon size={13} strokeWidth={on ? 2 : 1.5} /><span style={{ flex: 1 }}>{label}</span>
                  {badge && <span style={{ fontSize: 9, fontWeight: 700, background: C.blue, color: "#fff", padding: "1px 5px", borderRadius: 3 }}>{badge}</span>}
                </button>);
              })}
            </div>
          ))}
        </nav>
        <div style={{ padding: "10px 8px 12px", borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 1 }}>
          <div style={{ fontSize: 9.5, color: C.muted, padding: "0 10px 6px", opacity: 0.5, display: "flex", justifyContent: "space-between" }}>
          <span>⌘N new · ⌘K search · ⌘, settings</span>
          <span>v1.4</span>
        </div>
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
            {activeEvent && <><span style={{ fontSize: 12, color: C.muted }}>/</span>
            <span style={{ fontSize: 12, color: C.muted, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeEvent.name}</span></>}
            <span style={{ fontSize: 12, color: C.muted }}>/</span>
            {(() => {
              const label = NAV.find(n => n.id === view)?.label || (view === "settings" ? "Settings" : view === "calendar" ? "Calendar" : "Dashboard");
              // Update page title
              document.title = `${label} · ${activeEvent?.name || "evara"}`;
              return <span style={{ fontSize: 12.5, fontWeight: 500, color: C.text }}>{label}</span>;
            })()}
          </div>
          <div style={{ width: 1, height: 18, background: C.border }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, padding: "6px 11px", flex: 1, maxWidth: 260 }}>
            <Search size={12} color={C.muted} strokeWidth={1.5} />
            <input placeholder="Search… (⌘K)" value={globalSearch} 
              onChange={e => { setGlobalSearch(e.target.value); if (e.target.value.length > 1) setView("contacts"); }}
              onKeyDown={e => { if (e.key === "Escape") { setGlobalSearch(""); e.target.blur(); } }}
              style={{ background: "none", border: "none", outline: "none", color: C.sec, fontSize: 12.5, width: "100%" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginLeft: "auto" }}>
            <button onClick={() => setShowNewEvent(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: C.blue, border: "none", borderRadius: 7, padding: "6px 13px", color: "#fff", fontSize: 12.5, fontWeight: 500, boxShadow: `0 2px 8px ${C.blue}40` }}>
              <Plus size={12} />New Event
            </button>
            <div style={{ position: "relative", cursor: "pointer", padding: 4 }} onClick={() => setShowNotifs(p => !p)}>
            <Bell size={15} color={C.muted} />
            {notifCount > 0 && <div style={{ position: "absolute", top: 2, right: 2, width: 7, height: 7, borderRadius: "50%", background: C.red, boxShadow: `0 0 0 1.5px ${C.sidebar}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 6, color: "#fff", fontWeight: 700 }}>{notifCount > 9 ? "9+" : notifCount}</span>
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

        <main style={{ flex: 1, overflow: "auto", padding: "26px" }}>
          {view === "dashboard" && <DashView supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "edm" && profile && <EdmView key="edm" supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} setView={setView} />}
          {view === "landing" && profile && <LandingView key="landing" supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "forms" && profile && <FormsView key="forms" supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "contacts" && profile && <ContactView key="contacts" supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />}
          {view === "schedule" && profile && <ScheduleView key="schedule" supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} addNotif={addNotif} />}
          {view === "checkin"   && profile && <CheckInView key="checkin"  supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "social"    && profile && <SocialView key="social"   supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "analytics" && profile && <AnalyticsView key="analytics" supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "campaign"  && profile && <CampaignView key="campaign"  supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} setView={setView} />}
          {view === "calendar"  && <CalendarView supabase={supabase} profile={profile} events={events} setActiveEvent={setActiveEvent} setView={setView} fire={fire} />}
          {view === "qa"        && <QAView      supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "seating"   && <SeatingView supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "agenda"    && <AgendaView   supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "feedback"  && profile && <FeedbackView key="feedback"  supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "lifecycle" && <LifecycleView supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "roi"       && <ROIView      supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "settings"  && <SettingsView supabase={supabase} profile={profile} fire={fire} />}
        </main>
      </div>

      {/* NEW EVENT MODAL */}
      {showNewEvent && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99 }}>
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28, width: 460, animation: "fadeUp .2s ease" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 20 }}>New event</h2>
            {[
              { key: "name",        label: "Event name *",    ph: "e.g. Tech Summit 2026",              type: "text" },
              { key: "event_date",  label: "Date",            ph: "",                                    type: "date" },
              { key: "event_time",  label: "Time",            ph: "e.g. 6:30 PM",                       type: "text" },
              { key: "location",    label: "Venue / Location", ph: "e.g. Marina Bay Sands, Singapore", type: "text" },
              { key: "description", label: "Description",     ph: "Brief description of the event",     type: "text" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 11.5, color: C.muted, marginBottom: 4 }}>{f.label}</label>
                <input type={f.type}
                  value={f.key === "name" ? newEventName : (newEventExtra?.[f.key] || "")}
                  onChange={e => f.key === "name" ? setNewEventName(e.target.value) : setNewEventExtra(p => ({ ...p, [f.key]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && createEvent()}
                  placeholder={f.ph} autoFocus={f.key === "name"}
                  style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = C.blue}
                  onBlur={e => e.target.style.borderColor = C.border} />
              </div>
            ))}
            <div style={{ background: C.blue + "10", border: `1px solid ${C.blue}25`, borderRadius: 8, padding: "10px 12px", marginTop: 4, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={13} color={C.blue} strokeWidth={1.5} />
              <span style={{ fontSize: 11.5, color: C.blue, lineHeight: 1.4 }}>
                <strong>AI will auto-draft</strong> your Save the Date, Invitation, Reminder, Day-of and Thank You emails the moment you create this event.
              </span>
            </div>
            <div style={{ display: "flex", gap: 9, marginTop: 8 }}>
              <button onClick={() => setShowNewEvent(false)} style={{ flex: 1, padding: 11, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={createEvent} style={{ flex: 1, padding: 11, background: C.blue, border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Sparkles size={13} />Create + Auto-Draft →</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1C1C1F", border: `1px solid ${toast.type === "ok" ? C.green + "40" : C.red + "40"}`, borderLeft: `3px solid ${toast.type === "ok" ? C.green : C.red}`, borderRadius: 10, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10, animation: "fadeUp .2s ease", zIndex: 9999, whiteSpace: "nowrap", boxShadow: "0 8px 32px rgba(0,0,0,.6)", backdropFilter: "blur(8px)" }}>
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
  const [formShareLink, setFormShareLink] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ email: "", first_name: "", last_name: "", phone: "", company_name: "" });
  const [sending, setSending] = useState(null);
  const [liveMode, setLiveMode] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
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
        if (data.success && data.sent > 0) fire(`${ST[status]?.label || status} ✅ — email sent to ${contact.email}`);
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
          supabase.from("email_campaigns").select("id,email_type,status,total_sent").eq("event_id", activeEvent.id).limit(50),
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
  const rows = filt === "all" ? baseContacts : baseContacts.filter(c => c.status === filt);
  const noContactsYet = contacts.length === 0 && !loading;
  // Go Live checklist items
  const goLiveChecklist = activeEvent ? [
    { id: "contacts", label: "Import contacts", done: contacts.length > 0, action: "contacts", icon: "👥" },
    { id: "form", label: "Create registration form", done: !!formShareLink, action: "forms", icon: "📋" },
    { id: "email", label: "Draft invite email", done: campaigns.some(c => c.html_content), action: "edm", icon: "✉️" },
    { id: "sent", label: "Send first email", done: campaigns.some(c => c.status === "sent"), action: "schedule", icon: "🚀" },
  ] : [];
  const goLiveDone = goLiveChecklist.filter(i => i.done).length;

  const METRICS = [
    { label: "Emails Sent", val: metrics?.total_sent || 0, color: C.blue },
    { label: "Opened", val: metrics?.total_opened || 0, color: C.teal, sub: metrics?.total_sent > 0 ? Math.round((metrics.total_opened / metrics.total_sent) * 100) + "%" : null },
    { label: "Registered", val: metrics?.total_invited || 0, color: C.text },
    { label: "Confirmed", val: metrics?.total_confirmed || 0, color: C.green },
    { label: "Declined", val: metrics?.total_declined || 0, color: C.red },
    { label: "Pending", val: metrics?.total_pending || 0, color: C.amber },
    { label: "Attended", val: metrics?.total_attended || 0, color: C.blue, sub: metrics?.total_confirmed > 0 ? Math.round((metrics.total_attended / metrics.total_confirmed) * 100) + "%" : null },
  ];

  if (!activeEvent) return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 48, gap: 14, marginBottom: 40 }}>
        <div style={{ fontSize: 48 }}>🚀</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: C.text, letterSpacing: "-0.4px" }}>Welcome to evara</div>
        <p style={{ fontSize: 14, color: C.muted, textAlign: "center", maxWidth: 380, lineHeight: 1.6 }}>
          Your all-in-one event marketing platform. Create your first event to get started.
        </p>
        <button onClick={() => setShowNewEvent(true)} style={{ padding: "10px 24px", background: C.blue, border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 20px ${C.blue}40` }}>
          + Create First Event
        </button>
      </div>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>Getting started checklist</div>
        {[
          { num: 1, title: "Create your first event", desc: "Add event name, date, location" },
          { num: 2, title: "Import your contact list", desc: "Add attendees — paste emails or import CSV" },
          { num: 3, title: "Generate your invite email", desc: "AI writes a polished invite in 10 seconds" },
          { num: 4, title: "Set up registration form", desc: "Share the link — contacts self-register" },
          { num: 5, title: "Send your campaign", desc: "Schedule or send immediately to all contacts" },
        ].map((item) => (
          <div key={item.num} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", background: C.card, borderRadius: 9, border: `1px solid ${C.border}`, marginBottom: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${C.border}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{item.num}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{item.title}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  const daysToEvent = activeEvent.event_date ? Math.ceil((new Date(activeEvent.event_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 22, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: C.blue, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4 }}>Active Event</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.6px", color: C.text, margin: 0 }}>{activeEvent.name}</h1>
            <span onClick={async () => {
              const statuses = ["draft", "published", "completed"];
              const curr = activeEvent.status || "draft";
              const next = statuses[(statuses.indexOf(curr) + 1) % statuses.length];
              await supabase.from("events").update({ status: next }).eq("id", activeEvent.id);
              fire(`Event status → ${next}`);
            }} style={{ fontSize: 11, fontWeight: 600, color: activeEvent.status === "draft" ? C.muted : activeEvent.status === "completed" ? C.green : C.blue, background: (activeEvent.status === "draft" ? C.muted : activeEvent.status === "completed" ? C.green : C.blue) + "15", padding: "2px 8px", borderRadius: 4, textTransform: "capitalize", flexShrink: 0, cursor: "pointer" }} title="Click to change status">
              {activeEvent.status || "draft"}
            </span>
            <button onClick={() => setShowEditEvent(true)} style={{ fontSize: 11, padding: "2px 8px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4, color: C.muted, cursor: "pointer" }}>
              Edit
            </button>
          </div>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
            {activeEvent.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "Date TBC"}
            {activeEvent.event_time ? ` · ${activeEvent.event_time}` : ""}
            {activeEvent.location ? ` · 📍 ${activeEvent.location}` : ""}
          </p>
          {activeEvent.description && (
            <p style={{ color: C.muted, fontSize: 12, marginTop: 3, fontStyle: "italic", opacity: 0.75 }}>{activeEvent.description}</p>
          )}
          {activeEvent.capacity && (
            <p style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
              👥 Capacity: {activeEvent.capacity} · {contacts.length} registered ({Math.round((contacts.length / activeEvent.capacity) * 100)}% full)
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
          {formShareLink && (
            <button onClick={() => { navigator.clipboard?.writeText(formShareLink); fire("📋 Reg link copied!"); }}
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 13px", color: C.muted, cursor: "pointer" }}>
              📝 Reg Link
            </button>
          )}
          <button onClick={async () => {
            // Get or create share token for this event
            let token = activeEvent.share_token;
            if (!token) {
              token = Math.random().toString(36).substring(2, 14) + Date.now().toString(36);
              await supabase.from("events").update({ share_token: token }).eq("id", activeEvent.id);
            }
            const shareUrl = `${window.location.hostname === "localhost" ? "https://evara-tau.vercel.app" : window.location.origin}/share/${token}`;
            navigator.clipboard?.writeText(shareUrl);
            fire("📊 Read-only dashboard link copied! Share with stakeholders.");
          }} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 13px", color: C.muted, cursor: "pointer" }}>
            📊 Share Dashboard
          </button>
          <button onClick={() => setLiveMode(p => !p)}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "7px 14px", borderRadius: 7, border: `1px solid ${liveMode ? C.green + "60" : C.border}`, background: liveMode ? C.green + "12" : "transparent", color: liveMode ? C.green : C.muted, cursor: "pointer" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: liveMode ? C.green : C.muted, animation: liveMode ? "pulse 1.5s infinite" : "none" }} />
            {liveMode ? "Live ✓ (10s refresh)" : "Enable Live Mode"}
          </button>
          <button onClick={async () => {
              fire("🤖 Generating AI report…");
              const { data: { session } } = await supabase.auth.getSession();
              const res = await fetch(`${SUPABASE_URL}/functions/v1/post-event-report`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
                body: JSON.stringify({ eventId: activeEvent.id, companyId: profile?.company_id })
              });
              const data = await res.json();
              if (data.success && data.html) {
                const win = window.open("", "_blank");
                win.document.write(data.html);
                win.document.close();
                fire("✅ Report ready — print or save as PDF!");
              } else { fire("Report generation failed", "err"); }
            }} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "7px 13px", borderRadius: 7, border: `1px solid ${C.blue}40`, background: C.blue + "10", color: C.blue, cursor: "pointer" }}>
              <Sparkles size={11} />✨ AI Report
          </button>
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

      {/* Go Live progress bar */}
      {goLiveChecklist.length > 0 && goLiveDone < goLiveChecklist.length && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>🚀 Go Live Checklist</span>
            <span style={{ fontSize: 11, color: C.muted }}>{goLiveDone}/{goLiveChecklist.length} done</span>
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {goLiveChecklist.map(item => (
              <button key={item.id}
                onClick={() => !item.done && document.querySelector(`button[data-view="${item.action}"]`)?.click()}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 6, border: `1px solid ${item.done ? C.green + "40" : C.border}`, background: item.done ? C.green + "10" : C.raised, cursor: item.done ? "default" : "pointer", fontSize: 11, color: item.done ? C.green : C.text }}>
                {item.done ? "✓" : item.icon} <span style={{ textDecoration: item.done ? "line-through" : "none", opacity: item.done ? 0.6 : 1 }}>{item.label}</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 10, height: 3, background: C.raised, borderRadius: 999 }}>
            <div style={{ width: `${(goLiveDone / goLiveChecklist.length) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.blue}, ${C.teal})`, borderRadius: 999, transition: "width .5s" }} />
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 9, marginBottom: 22 }}>
        {METRICS.map((m, i) => (
          <div key={i} className="mc" style={{ background: C.card, borderRadius: 10, padding: "13px 12px", border: `1px solid ${C.border}`, borderTop: `2px solid ${m.color}28`, transition: "all .18s", cursor: "default" }}>
            <div style={{ fontSize: 9.5, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: m.color, letterSpacing: "-0.5px" }}>{loading ? "—" : m.val.toLocaleString()}</div>
            {m.sub && !loading && <div style={{ fontSize: 10, color: m.color, opacity: 0.7, marginTop: 2 }}>{m.sub}</div>}
          </div>
        ))}
      </div>

      {liveMode && (
        <div style={{ background: C.card, borderRadius: 9, border: `1px solid ${C.green}30`, padding: "10px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, animation: "pulse 1.5s infinite", flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>LIVE</span>
          <span style={{ fontSize: 12, color: C.muted }}>Auto-refreshing every 10s ·</span>
          <span style={{ fontSize: 12, color: C.text }}>{contacts.filter(c => c.status === "attended").length} checked in · {contacts.filter(c => c.status === "pending").length} pending</span>
          <button onClick={() => setLiveMode(false)} style={{ marginLeft: "auto", fontSize: 11, color: C.muted, background: "transparent", border: "none", cursor: "pointer" }}>✕ Stop</button>
        </div>
      )}
      {/* ─── POST-EVENT NUDGE ─── */}
      {activeEvent?.event_date && Math.ceil((new Date(activeEvent.event_date) - new Date()) / (1000*60*60*24)) < 0 && !campaigns.some(c => c.email_type === "thank_you" && c.status === "sent") && (
        <div style={{ background: C.teal + "10", border: `1px solid ${C.teal}30`, borderRadius: 10, padding: "12px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>🎉</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>Event complete! Time to follow up.</div>
            <div style={{ fontSize: 11.5, color: C.muted }}>Send your Thank You email and generate the AI post-event report while it's fresh.</div>
          </div>
          <button onClick={() => document.querySelector('button[data-view="schedule"]')?.click()}
            style={{ fontSize: 11.5, padding: "6px 14px", background: C.teal, border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap" }}>
            Send Thank You →
          </button>
        </div>
      )}

      {/* ─── EVENT LIFECYCLE PROGRESS ─── */}
      {activeEvent?.event_date && (() => {
        const now = new Date();
        const eventDate = new Date(activeEvent.event_date);
        const daysLeft = Math.ceil((eventDate - now) / (1000*60*60*24));
        const totalDays = 90;
        const daysPast = Math.max(0, totalDays - daysLeft);
        const pct = Math.min(100, Math.round((daysPast / totalDays) * 100));
        
        const milestones = [
          { label: "Save the Date", day: -90, done: campaigns?.some(c => c.email_type === "save_the_date" && c.status === "sent") },
          { label: "Invitation", day: -60, done: campaigns?.some(c => c.email_type === "invitation" && c.status === "sent") },
          { label: "Reminder", day: -14, done: campaigns?.some(c => c.email_type === "reminder" && c.status === "sent") },
          { label: "Event Day", day: 0, done: daysLeft <= 0 },
          { label: "Follow Up", day: 1, done: campaigns?.some(c => c.email_type === "thank_you" && c.status === "sent") },
        ];
        
        return (
          <div style={{ background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, padding: "14px 18px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>Event Lifecycle</span>
              <span style={{ fontSize: 11, color: daysLeft <= 7 ? C.red : daysLeft <= 21 ? C.amber : C.muted }}>
                {daysLeft > 0 ? `${daysLeft} days to go` : daysLeft === 0 ? "Today!" : `${Math.abs(daysLeft)} days ago`}
              </span>
            </div>
            <div style={{ position: "relative", height: 6, background: C.raised, borderRadius: 999, marginBottom: 12 }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${C.blue}, ${C.teal})`, borderRadius: 999, transition: "width .4s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {milestones.map((m, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: m.done ? C.green : C.raised, border: `2px solid ${m.done ? C.green : C.border}`, boxShadow: m.done ? `0 0 6px ${C.green}60` : "none" }} />
                  <span style={{ fontSize: 9, color: m.done ? C.green : C.muted, textAlign: "center", lineHeight: 1.3 }}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ─── AI INSIGHTS PANEL ─── */}
      {activeEvent && (
        <div style={{ background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Sparkles size={13} color={C.blue} strokeWidth={1.5} />
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>AI Insights</span>
              {insights && <span style={{ fontSize: 10, color: C.muted, background: C.raised, padding: "2px 6px", borderRadius: 3 }}>{insights.length} recommendations</span>}
            </div>
            <button onClick={loadInsights} disabled={insightsLoading}
              style={{ fontSize: 11, padding: "4px 10px", background: insightsLoading ? C.raised : C.blue + "15", border: `1px solid ${insightsLoading ? C.border : C.blue + "40"}`, borderRadius: 5, color: insightsLoading ? C.muted : C.blue, cursor: insightsLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              {insightsLoading ? <><Spin />Analysing…</> : insights ? "↻ Refresh" : "✨ Analyse event"}
            </button>
          </div>
          {!insights && !insightsLoading && !insightsError && (
            <div style={{ padding: "20px 16px", textAlign: "center", color: C.muted, fontSize: 12 }}>
              Click "Analyse event" to get AI-powered recommendations based on your event data.
            </div>
          )}
          {insightsLoading && (
            <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: C.muted, fontSize: 12 }}>
              <Spin /><span>Claude is analysing your event data…</span>
            </div>
          )}
          {insightsError && (
            <div style={{ padding: "14px 16px", fontSize: 12, color: C.red }}>Failed to load insights. Please try again.</div>
          )}
          {insights && insights.length > 0 && (
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
              {insights.map((ins, i) => {
                const typeColors = {
                  urgent: { bg: C.red + "12", border: C.red + "30", dot: C.red },
                  warning: { bg: C.amber + "12", border: C.amber + "30", dot: C.amber },
                  success: { bg: C.green + "12", border: C.green + "30", dot: C.green },
                  info: { bg: C.blue + "12", border: C.blue + "30", dot: C.blue },
                };
                const tc = typeColors[ins.type] || typeColors.info;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", background: tc.bg, border: `1px solid ${tc.border}`, borderRadius: 8, transition: "all .15s" }}>
                    <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.3 }}>{ins.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text, marginBottom: 2 }}>{ins.title}</div>
                      <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.4 }}>{ins.body}</div>
                    </div>
                    {ins.action && ins.action_target !== "null" && ins.action_target && (
                      <button onClick={() => {
                        const targets = { edm: "edm", schedule: "schedule", contacts: "contacts", forms: "forms", campaigns: "campaign" };
                        const t = targets[ins.action_target];
                        if (t) document.querySelector(`button[data-view="${t}"]`)?.click();
                      }} style={{ fontSize: 10.5, padding: "4px 10px", background: tc.dot + "20", border: `1px solid ${tc.dot}40`, borderRadius: 5, color: tc.dot, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, fontWeight: 500 }}>
                        {ins.action} →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div style={{ background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <div style={{ padding: "13px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>Contacts</span>
          <span style={{ fontSize: 10.5, background: C.raised, color: C.muted, padding: "2px 7px", borderRadius: 4, fontWeight: 500 }}>{contacts.length} total</span>
          {contacts.length > 0 && (
            <div style={{ display: "flex", gap: 3, fontSize: 10 }}>
              {[["confirmed", C.green], ["attended", C.blue], ["pending", C.amber], ["declined", C.red]].map(([s, col]) => {
                const n = contacts.filter(c => c.status === s).length;
                return n > 0 ? <span key={s} style={{ color: col, background: col + "15", padding: "1px 6px", borderRadius: 3, fontWeight: 500 }}>{n} {s}</span> : null;
              })}
            </div>
          )}
          <div style={{ display: "flex", gap: 4 }}>
            {/* NL filter pill shown when active */}
            {nlFiltered !== null && (
              <span style={{ fontSize: 10.5, padding: "3px 8px", borderRadius: 4, background: C.blue + "15", color: C.blue, border: `1px solid ${C.blue}40`, display: "flex", alignItems: "center", gap: 4 }}>
                <Sparkles size={9} />
                {nlLabel}
                <button onClick={() => { setNlFiltered(null); setNlLabel(""); setNlQuery(""); }} style={{ background: "transparent", border: "none", color: C.blue, cursor: "pointer", padding: "0 2px", fontSize: 12, lineHeight: 1 }}>✕</button>
              </span>
            )}
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
            const pending = contacts.filter(c => c.status === "pending");
            if (!pending.length) { fire("No pending contacts", "err"); return; }
            if (!window.confirm(`Send reminder to ${pending.length} pending contacts?`)) return;
            for (const ec of pending.slice(0, 50)) {
              const c = ec.contacts || {};
              if (!c.email || c.unsubscribed) continue;
              await fetch(`${SUPABASE_URL}/functions/v1/send-triggered-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contacts: [{ email: c.email, first_name: c.first_name || "", last_name: c.last_name || "", unsubscribed: false }],
                  triggerType: "reminder",
                  eventName: activeEvent.name,
                  eventDate: activeEvent.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "",
                  eventTime: activeEvent.event_time || "",
                  location: activeEvent.location || "",
                  orgName: profile?.companies?.name || "",
                })
              });
            }
            fire(`✅ Reminder sent to ${pending.length} pending contacts!`);
          }} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, background: C.amber + "14", border: `1px solid ${C.amber}30`, borderRadius: 6, padding: "5px 11px", color: C.amber, cursor: "pointer" }}>
            ⏰ Remind All Pending ({contacts.filter(c => c.status === "pending").length})
          </button>
          {campaigns.filter(c => c.status === "draft" && c.html_content).length > 0 && contacts.length > 0 && (
            <button onClick={() => {
              const draft = campaigns.filter(c => c.status === "draft" && c.html_content)[0];
              if (!draft) return;
              if (!window.confirm(`Send "${draft.subject}" to all ${contacts.filter(c => !c.contacts?.unsubscribed).length} contacts?`)) return;
              fire("📨 Sending…");
              supabase.auth.getSession().then(({ data: { session } }) => {
                fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
                  body: JSON.stringify({
                    campaignId: draft.id,
                    contacts: contacts.map(ec => ({ email: ec.contacts?.email, first_name: ec.contacts?.first_name, last_name: ec.contacts?.last_name, unsubscribed: ec.contacts?.unsubscribed })).filter(c => c.email && !c.unsubscribed),
                    subject: draft.subject,
                    htmlContent: draft.html_content,
                    plainText: draft.plain_text || draft.subject,
                  })
                }).then(r => r.json()).then(data => {
                  if (data.sent > 0) fire(`✅ Sent to ${data.sent} contacts!`);
                  else fire(`Send failed: ${data.error || "unknown"}`, "err");
                });
              });
            }} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "4px 10px", background: C.blue + "14", border: `1px solid ${C.blue}30`, borderRadius: 5, color: C.blue, cursor: "pointer", fontWeight: 500 }}>
              📨 Send draft to all
            </button>
          )}
          {campaigns.filter(c => c.status === "draft" && c.html_content).length > 0 && contacts.length > 0 && (
            <button onClick={() => { fire("Go to Scheduling → select a draft → Send to send to all contacts"); }}
              title="Go to Scheduling to send"
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, padding: "4px 10px", background: C.blue + "14", border: `1px solid ${C.blue}30`, borderRadius: 5, color: C.blue, cursor: "pointer" }}>
              📨 {campaigns.filter(c => c.status === "draft" && c.html_content).length} draft{campaigns.filter(c => c.status === "draft" && c.html_content).length !== 1 ? "s" : ""} ready
            </button>
          )}
          <button onClick={async () => {
            const confirmed = contacts.filter(c => c.status === "confirmed");
            if (!confirmed.length) { fire("No confirmed contacts to mark as attended", "err"); return; }
            if (!window.confirm(`Mark all ${confirmed.length} confirmed contacts as attended?`)) return;
            await supabase.from("event_contacts").update({ status: "attended", attended_at: new Date().toISOString() })
              .eq("event_id", activeEvent.id).eq("status", "confirmed");
            setContacts(p => p.map(ec => ec.status === "confirmed" ? { ...ec, status: "attended" } : ec));
            fire(`✅ ${confirmed.length} contacts marked as attended`);
          }} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, background: C.blue + "12", border: `1px solid ${C.blue}30`, borderRadius: 6, padding: "5px 11px", color: C.blue, cursor: "pointer" }}>
            ✅ Mark All Attended
          </button>
          <button onClick={async () => {
            const attended = contacts.filter(c => c.status === "attended");
            if (!attended.length) { fire("No attended contacts to send thank you", "err"); return; }
            if (!window.confirm(`Send thank you email to all ${attended.length} attendees?`)) return;
            const { data: { session } } = await supabase.auth.getSession();
            const contactsToSend = attended.map(ec => ({
              email: ec.contacts?.email, first_name: ec.contacts?.first_name, last_name: ec.contacts?.last_name, unsubscribed: false
            })).filter(c => c.email);
            const res = await fetch(`${SUPABASE_URL}/functions/v1/send-triggered-email`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
              body: JSON.stringify({
                contacts: contactsToSend, triggerType: "thank_you",
                eventName: activeEvent.name,
                eventDate: activeEvent.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long" }) : "",
                orgName: profile?.companies?.name || "evara",
              })
            }).then(r => r.json()).catch(e => ({ error: e.message }));
            res.success ? fire(`✅ Thank you emails sent to ${res.sent} attendees!`) : fire(res.error || "Send failed", "err");
          }} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, background: C.green + "12", border: `1px solid ${C.green}30`, borderRadius: 6, padding: "5px 11px", color: C.green, cursor: "pointer" }}>
            🙏 Thank Attendees
          </button>
          <button onClick={() => {
            const cols = ["First Name","Last Name","Email","Phone","Company","Job Title","Status","Lead Score","Confirmed At","Attended At","Registered At"];
            const rows_csv = contacts.map(ec => {
              const c = ec.contacts || {};
              const scoreData = scores[c.id] || {};
              return [c.first_name||"",c.last_name||"",c.email||"",c.phone||"",c.company_name||"",c.job_title||"",ec.status||"",
                scoreData.score || 0,
                ec.confirmed_at ? new Date(ec.confirmed_at).toLocaleDateString() : "",
                ec.attended_at ? new Date(ec.attended_at).toLocaleDateString() : "",
                ec.created_at ? new Date(ec.created_at).toLocaleDateString() : ""
              ].map(v => `"${v}"`).join(",");
            });
            const csv = [cols.join(","), ...rows_csv].join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = `${activeEvent.name}-contacts.csv`; a.click();
            fire(`✅ Exported ${contacts.length} contacts`);
          }} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, padding: "5px 11px", color: C.muted, cursor: "pointer" }}>
            <Download size={11}/>Export CSV
          </button>
        </div>

        {/* ✨ Natural Language Filter Bar */}
        <div style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 7, background: C.bg, border: `1px solid ${nlFiltered !== null ? C.blue + "60" : C.border}`, borderRadius: 7, padding: "7px 11px", transition: "border-color .15s" }}>
            <Sparkles size={12} color={nlFiltered !== null ? C.blue : C.muted} strokeWidth={1.5} style={{ flexShrink: 0 }} />
            <input
              value={nlQuery}
              onChange={e => setNlQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") runNLFilter(nlQuery); if (e.key === "Escape") { setNlFiltered(null); setNlLabel(""); setNlQuery(""); } }}
              placeholder="Ask AI to filter… e.g. hot leads who haven't confirmed, all VIPs, everyone from Acme"
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: C.text, fontSize: 12 }}
            />
            {nlLoading && <Spin />}
            {nlQuery && !nlLoading && (
              <button onClick={() => runNLFilter(nlQuery)} style={{ fontSize: 10.5, padding: "3px 9px", background: C.blue, border: "none", borderRadius: 4, color: "#fff", cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap" }}>
                Filter →
              </button>
            )}
            {nlFiltered !== null && !nlLoading && (
              <button onClick={() => { setNlFiltered(null); setNlLabel(""); setNlQuery(""); }} style={{ fontSize: 10.5, padding: "3px 8px", background: C.raised, border: `1px solid ${C.border}`, borderRadius: 4, color: C.muted, cursor: "pointer" }}>
                Clear
              </button>
            )}
          </div>
          {nlFiltered !== null && (
            <span style={{ fontSize: 11, color: C.blue, whiteSpace: "nowrap" }}>{rows.length} result{rows.length !== 1 ? "s" : ""}</span>
          )}
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
      {/* EDIT EVENT MODAL */}
      {showEditEvent && activeEvent && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={() => setShowEditEvent(false)}>
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28, width: 460, animation: "fadeUp .2s ease" }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 20 }}>Edit event</h2>
            {[
              { key: "name",        label: "Event name",       ph: "Tech Summit 2026",              type: "text" },
              { key: "event_date",  label: "Date",             ph: "",                               type: "date" },
              { key: "event_time",  label: "Time",             ph: "6:30 PM",                       type: "text" },
              { key: "location",    label: "Venue / Location", ph: "Marina Bay Sands",              type: "text" },
              { key: "description", label: "Description",      ph: "Brief description",             type: "text" },
              { key: "capacity",    label: "Capacity",             ph: "e.g. 150",                      type: "number" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 11.5, color: C.muted, marginBottom: 4 }}>{f.label}</label>
                <input type={f.type}
                  value={editForm[f.key] ?? activeEvent[f.key] ?? ""}
                  onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.ph}
                  style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = C.blue}
                  onBlur={e => e.target.style.borderColor = C.border} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 9, marginTop: 8 }}>
              <button onClick={() => { setShowEditEvent(false); setEditForm({}); }} style={{ flex: 1, padding: 11, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={async () => {
                const updates = {};
                ["name","event_date","event_time","location","description"].forEach(k => {
                  if (editForm[k] !== undefined) updates[k] = editForm[k] || null;
                });
                if (!updates.name && !activeEvent.name) return;
                await supabase.from("events").update(updates).eq("id", activeEvent.id);
                setActiveEvent(p => ({ ...p, ...updates }));
                setEvents(p => p.map(e => e.id === activeEvent.id ? { ...e, ...updates } : e));
                setEditForm({});
                setShowEditEvent(false);
                fire("✅ Event updated");
              }} style={{ flex: 1, padding: 11, background: C.blue, border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Save changes</button>
            </div>
          </div>
        </div>
      )}
      </div>
      {showAddContact && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28, width: 420, animation: "fadeUp .2s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: C.text }}>Add contact</h2>
              <button onClick={() => { setShowAddContact(false); setNewContact({ email: "", first_name: "", last_name: "", phone: "", company_name: "" }); }} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer" }}><X size={16} /></button>
            </div>
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
function BrandVoiceBadge({ supabase, profile }) {
  const [bv, setBv] = useState(null);
  useEffect(() => {
    if (!profile?.company_id) return;
    supabase.from("brand_voice").select("industry,tone_adjectives,audience").eq("company_id", profile.company_id).maybeSingle()
      .then(({ data }) => setBv(data));
  }, [profile]);
  if (!bv || (!bv.industry && !bv.tone_adjectives?.length && !bv.audience)) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: "#30D15810", border: "1px solid #30D15830", borderRadius: 6, marginBottom: 2 }}>
      <Sparkles size={11} color="#30D158" strokeWidth={2} />
      <span style={{ fontSize: 11, color: "#30D158", fontWeight: 500 }}>Brand voice active</span>
      <span style={{ fontSize: 10, color: "#30D15880" }}>· {[bv.industry, bv.tone_adjectives?.[0]].filter(Boolean).join(" · ")}</span>
    </div>
  );
}

// ─── EDM BUILDER — with AI content + beautiful templates + image upload ──────
function EdmView({ supabase, profile, activeEvent, fire, setView }) {
  const [eType, setEType] = useState("invitation");
  const [tmpl, setTmpl] = useState("branded");
  const [gen, setGen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewWidth, setPreviewWidth] = useState("100%");
  const [subjectAlts, setSubjectAlts] = useState([]);
  const [loadingAlts, setLoadingAlts] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [formLink, setFormLink] = useState("");
  const [uploadingZone, setUploadingZone] = useState(null);
  const [images, setImages] = useState({ header: null, body: null, footer: null });
  const [info, setInfo] = useState({ eventName: "", eventDate: "", eventTime: "", location: "", description: "", tone: "professional and exciting", extra: "" });
  const [resources, setResources] = useState({ photos: "", slides: "", recording: "", nextEvent: "" });
  const [showResources, setShowResources] = useState(false);

  useEffect(() => {
    if (activeEvent) {
      setInfo(p => ({ ...p, 
          eventName: activeEvent.name || "", 
          eventDate: activeEvent.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "",
          eventTime: activeEvent.event_time || p.eventTime || "",
          location: activeEvent.location || p.location || "", 
          description: activeEvent.description || p.description || "",
          orgName: p.orgName || ""
        }));
      supabase.from("forms").select("share_token").eq("event_id", activeEvent.id).eq("is_active", true).limit(1).maybeSingle()
        .then(({ data }) => { if (data?.share_token) setFormLink(`${window.location.origin}/form/${data.share_token}`); });
    }
  }, [activeEvent]);

  useEffect(() => {
    if (!activeEvent || !profile) return;
    supabase.from("email_campaigns").select("*").eq("event_id", activeEvent.id).order("created_at", { ascending: false })
      .then(({ data: d }) => setCampaigns(d || []));
    supabase.from("event_summary").select("*").eq("event_id", activeEvent.id).maybeSingle()
      .then(({ data: d }) => setData(d));
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
          tone: info.tone || "professional and exciting",
          orgName: info.orgName || profile?.companies?.name || "",
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
      fire(`Email generated & saved as draft!${data.brand_voice_applied ? " ✨ Brand voice applied." : ""}`);
      const { data: cams } = await supabase.from("email_campaigns").select("*").eq("event_id", activeEvent.id).order("created_at", { ascending: false });
      setCampaigns(cams || []);
    } catch (err) {
      const msg = err.message?.includes("ANTHROPIC_API_KEY") 
        ? "❌ AI key not configured — add ANTHROPIC_API_KEY in Supabase → Edge Function Secrets"
        : err.message?.includes("fetch") 
        ? "❌ Network error — check your connection and try again"
        : err.message || "Generation failed";
      fire(msg, "err");
    } finally { setGen(false); }
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
                <button key={t} onClick={() => { setTmpl(t); setPreview(null); }} style={{ flex: 1, padding: "9px 6px", borderRadius: 6, border: `1px solid ${tmpl === t ? C.blue + "80" : C.border}`, background: tmpl === t ? C.blue + "10" : "transparent", cursor: "pointer", textAlign: "center", transition: "all .12s" }}>
                  <div style={{ width: "100%", height: 24, borderRadius: 3, marginBottom: 5, background: t === "minimal" ? "#F8F8F6" : t === "branded" ? "#1E3A5F" : "#FF5C35" }} />
                  <div style={{ fontSize: 11.5, fontWeight: 500, color: tmpl === t ? C.blue : C.text, textTransform: "capitalize" }}>{t}</div>
                </button>
              ))}
            </div>
          </Sec>

          <Sec label="Tone">
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {["professional", "exciting", "formal", "friendly", "urgent"].map(t => (
                <button key={t} onClick={() => setInfo(p => ({ ...p, tone: t }))}
                  style={{ fontSize: 11, padding: "4px 10px", borderRadius: 4, border: `1px solid ${(info.tone||"professional") === t ? C.blue + "80" : C.border}`, background: (info.tone||"professional") === t ? C.blue + "10" : "transparent", cursor: "pointer", color: (info.tone||"professional") === t ? C.blue : C.muted, textTransform: "capitalize" }}>
                  {t}
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
          {eType === "thank_you" && (
            <Sec label="Post-event resources (Thank You)">
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>AI includes these links in the thank you email</div>
              {[
                { k: "photos", ph: "https://photos.google.com/...", label: "Event photos URL" },
                { k: "slides", ph: "https://slides.com/...", label: "Presentation slides URL" },
                { k: "recording", ph: "https://youtube.com/...", label: "Recording URL" },
                { k: "nextEvent", ph: "https://...", label: "Next event URL" },
              ].map(f => (
                <div key={f.k} style={{ marginBottom: 7 }}>
                  <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>{f.label}</div>
                  <input value={resources[f.k]} onChange={e => setResources(p => ({ ...p, [f.k]: e.target.value }))}
                    placeholder={f.ph} style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "6px 8px", fontSize: 11.5, outline: "none" }} />
                </div>
              ))}
            </Sec>
          )}

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

          <BrandVoiceBadge supabase={supabase} profile={profile} />
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
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: C.text, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cam.subject || cam.name}</div>
                  {cam.subject && cam.name !== cam.subject && <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cam.name}</div>}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 10.5, color: C.muted, textTransform: "capitalize" }}>{cam.email_type?.replace(/_/g, " ")}{cam.total_sent > 0 ? ` · ${cam.total_sent} sent` : ""}</span>
                    <span style={{ fontSize: 10.5, background: cam.status === "sent" ? C.green + "15" : C.blue + "15", color: cam.status === "sent" ? C.green : C.blue, padding: "2px 7px", borderRadius: 4 }}>{cam.status}</span>
                  </div>
                </div>
              ))}
            </Sec>
          )}
        </div>

        {/* PREVIEW PANEL */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ fontSize: 10.5, fontWeight: 500, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Preview</div>
          <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
            {[{ label: "📱 Mobile", width: "375px" }, { label: "🖥 Desktop", width: "100%" }].map(v => (
              <button key={v.width} onClick={() => setPreviewWidth(v.width)}
                style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, border: `1px solid ${(previewWidth || "100%") === v.width ? C.blue : C.border}`, background: (previewWidth || "100%") === v.width ? C.blue + "14" : "transparent", color: (previewWidth || "100%") === v.width ? C.blue : C.muted, cursor: "pointer" }}>
                {v.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, border: `1px solid ${preview ? C.blue + "50" : C.border}`, borderRadius: 10, background: "#EBEBEB", overflow: "auto", transition: "border-color .3s", minHeight: 500, display: "flex", justifyContent: "center" }}>
            {!preview && !gen && <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 300 }}><Mail size={32} color="#AEAEB2" strokeWidth={1} style={{ opacity: .4 }} /><span style={{ fontSize: 13, color: "#AEAEB2" }}>Fill in event details and click Generate</span></div>}
            {gen && <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 300 }}><Spin size={28} /><span style={{ fontSize: 13, color: "#AEAEB2", fontFamily: "Outfit,sans-serif" }}>Claude is writing your email…</span></div>}
            {preview && (
              <div>
                <div style={{ padding: "12px 16px", background: "white", borderBottom: "1px solid #E5E5EA", fontFamily: "Arial,sans-serif" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ fontSize: 11, color: "#999" }}>Subject</div>
                    <button onClick={async () => {
                      setLoadingAlts(true); setSubjectAlts([]);
                      const { data: { session: s } } = await supabase.auth.getSession();
                      const res = await fetch(`${SUPABASE_URL}/functions/v1/subject-suggestions`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${s?.access_token}` },
                        body: JSON.stringify({ subject: preview.subject, emailType: eType, eventName: info.eventName })
                      }).then(r => r.json()).catch(() => ({ suggestions: [] }));
                      setSubjectAlts(res.suggestions || []);
                      setLoadingAlts(false);
                    }} disabled={loadingAlts} style={{ fontSize: 10, padding: "2px 8px", background: "#0A84FF15", border: "1px solid #0A84FF30", borderRadius: 4, color: "#0A84FF", cursor: "pointer" }}>
                      {loadingAlts ? "…" : "✨ Alt subjects"}
                    </button>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{preview.subject}</div>
                  {subjectAlts.length > 0 && (
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ fontSize: 10, color: "#999", marginBottom: 2 }}>Alternative subject lines — click to use:</div>
                      {subjectAlts.map((s, i) => (
                        <div key={i} onClick={() => { setPreview(p => ({ ...p, subject: s })); setSubjectAlts([]); }}
                          style={{ fontSize: 12, padding: "5px 8px", background: "#f5f5f5", borderRadius: 4, cursor: "pointer", color: "#333", border: "1px solid #eee" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#e8f0fe"}
                          onMouseLeave={e => e.currentTarget.style.background = "#f5f5f5"}>
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <iframe srcDoc={preview.html} style={{ width: previewWidth || "100%", maxWidth: "100%", border: "none", minHeight: 600, transition: "width .3s ease" }} title="Email Preview" sandbox="allow-same-origin" />
              </div>
            )}
          </div>
          {preview && <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={() => setPreview(null)} style={{ padding: "9px 14px", background: C.raised, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, cursor: "pointer" }}>Clear</button>
            <button onClick={() => {
              const w = window.open("", "_blank");
              w.document.write(preview.html);
              w.document.close();
            }} style={{ padding: "9px 14px", background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12, cursor: "pointer" }}>
              🔍 Full View
            </button>
            <button onClick={async () => {
              if (!profile || !activeEvent) { fire("Select an event first", "err"); return; }
              const { data: { session } } = await supabase.auth.getSession();
              const { data: ecs } = await supabase.from("event_contacts").select("contacts(email,first_name)").eq("event_id", activeEvent.id);
              const contacts = (ecs || []).map(ec => ec.contacts).filter(c => c?.email);
              if (!contacts.length) { fire("No contacts in this event yet", "err"); return; }
              if (!window.confirm(`Send to all ${contacts.length} contacts now?`)) return;
              const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
                body: JSON.stringify({ contacts, subject: preview.subject, htmlContent: preview.html, plainText: preview.plain_text, campaignId: preview.campaign_id })
              }).then(r => r.json()).catch(e => ({ error: e.message }));
              if (res.success) {
              fire(`✅ Sent to ${res.sent} contacts! Dashboard will update.`);
            } else {
              const msg = res.error?.includes("SENDGRID") ? "❌ SendGrid API key not configured"
                : res.error?.includes("Forbidden") ? "❌ Sender not verified in SendGrid"
                : `❌ ${res.error || "Send failed"}`;
              fire(msg, "err");
            }
            }} style={{ padding: "9px 16px", background: C.green + "15", color: C.green, border: `1px solid ${C.green}40`, borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Send size={13} />Send Now
            </button>
            <button onClick={() => { fire("Saved! Opening Scheduling…"); setView("schedule"); }} style={{ flex: 1, padding: "9px", background: C.blue, color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Calendar size={13} />Schedule →
            </button>
          </div>}
          {preview && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, padding: "8px 12px", background: C.raised, borderRadius: 7, border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap" }}>📧 Test to:</span>
              <input
                id="test-email-input"
                defaultValue={profile?.email || ""}
                placeholder="your@email.com"
                style={{ flex: 1, fontSize: 11, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "4px 8px", outline: "none" }}
              />
              <button onClick={async () => {
                const testEmail = document.getElementById("test-email-input")?.value?.trim() || profile?.email;
                if (!testEmail?.includes("@")) { fire("Enter a valid email address", "err"); return; }
                const { data: { session } } = await supabase.auth.getSession();
                const r = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
                  body: JSON.stringify({ contacts: [{ email: testEmail, first_name: "Test" }], subject: "[TEST] " + preview.subject, htmlContent: preview.html, plainText: preview.plain_text })
                }).then(r => r.json()).catch(e => ({ error: e.message }));
                if (r.success) {
                  fire(`✅ Test sent to ${testEmail}! Check your inbox.`);
                } else {
                  const msg = r.error?.includes("SENDGRID") ? "❌ SendGrid API key not configured in Supabase secrets"
                    : r.error?.includes("Forbidden") ? "❌ Sender not verified — check SendGrid"
                    : r.error?.includes("Unauthorized") ? "❌ Session expired — please refresh"
                    : `❌ ${r.error || "Send failed"}`;
                  fire(msg, "err");
                }
              }} style={{ fontSize: 11, padding: "4px 14px", background: C.blue, color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap" }}>
                Send Test
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SCHEDULE VIEW — with email preview modal ─────────────────
function ScheduleView({ supabase, profile, activeEvent, fire, addNotif }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [sendModal, setSendModal] = useState(null);
  const [previewCam, setPreviewCam] = useState(null); // ← NEW: email preview
  const [autoScheduling, setAutoScheduling] = useState(false);
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
        if (addNotif) addNotif(`📧 "${sendModal.subject}" sent to ${data.sent} contacts`, "📧");
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
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.6px", color: C.text }}>Email Scheduling</h1>
            {activeEvent?.event_date && campaigns.filter(c => c.status === "draft").length > 0 && (
              <button onClick={async () => {
                if (!activeEvent?.event_date) { fire("Set an event date first", "err"); return; }
                setAutoScheduling(true);
                const eventDate = new Date(activeEvent.event_date);
                const now = new Date();
                const daysLeft = Math.ceil((eventDate - now) / (1000*60*60*24));
                
                // Smart schedule: assign send dates based on email type
                const scheduleMap = {
                  save_the_date: -56, invitation: -28, reminder: -7,
                  day_of_details: -1, thank_you: 1,
                };
                const drafts = campaigns.filter(c => c.status === "draft");
                let scheduled = 0;
                for (const draft of drafts) {
                  const offsetDays = scheduleMap[draft.email_type] || -14;
                  const sendDate = new Date(eventDate);
                  sendDate.setDate(sendDate.getDate() + offsetDays);
                  if (sendDate < now) sendDate.setDate(now.getDate() + 1); // don't schedule in past
                  await supabase.from("email_campaigns").update({ 
                    scheduled_at: sendDate.toISOString(), status: "scheduled" 
                  }).eq("id", draft.id);
                  scheduled++;
                }
                // Refresh
                const { data } = await supabase.from("email_campaigns").select("*").eq("event_id", activeEvent.id).order("created_at", { ascending: true });
                setCampaigns(data || []);
                setAutoScheduling(false);
                fire(`✅ ${scheduled} emails auto-scheduled based on your event date!`);
              }} disabled={autoScheduling} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "6px 12px", background: C.blue + "15", border: `1px solid ${C.blue}40`, borderRadius: 7, color: C.blue, cursor: "pointer", fontWeight: 500 }}>
                {autoScheduling ? <><Spin />Scheduling…</> : <><Sparkles size={11} />Auto-schedule sequence</>}
              </button>
            )}
          </div>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Send campaigns or schedule them ahead. Every send is tracked in real time.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={async () => {
            const latestWithHtml = campaigns.find(c => c.html_content && c.status !== "sent");
            if (!latestWithHtml) { fire("No draft with content found — generate one in eDM Builder first", "err"); return; }
            openSendModal(latestWithHtml);
          }} style={{ fontSize: 13, padding: "7px 16px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
            Quick Send Latest →
          </button>
          <button onClick={async () => {
            // Send test email to self
            const latest = campaigns.find(c => c.html_content);
            if (!latest) { fire("No draft with content yet — generate one in eDM Builder first", "err"); return; }
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
              body: JSON.stringify({
                contacts: [{ email: profile?.email, first_name: profile?.full_name?.split(" ")[0] || "Test", unsubscribed: false }],
                subject: "[TEST] " + latest.subject,
                htmlContent: latest.html_content,
                plainText: latest.plain_text || latest.subject,
              })
            }).then(r => r.json()).catch(e => ({ error: e.message }));
            res.success ? fire(`✅ Test email sent to ${profile?.email}!`) : fire(res.error || "Send failed", "err");
          }} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            ✉️ Test Email
          </button>
          <button onClick={async () => {
            // Auto-schedule all draft campaigns with intelligent timing
            const drafts = campaigns.filter(c => c.status === "draft" && !c.send_at);
            if (drafts.length === 0) { fire("No unscheduled drafts found — generate a campaign first", "err"); return; }
            const now = new Date();
            const eventDate = activeEvent?.event_date ? new Date(activeEvent.event_date) : null;
            const SCHEDULE_MAP = {
              save_the_date: -56, invitation: -42, reminder: -14,
              byo: -3, day_of: 0, thank_you: 1, confirmation: 7,
            };
            let scheduled = 0;
            for (const draft of drafts) {
              const dayOffset = SCHEDULE_MAP[draft.email_type] ?? -7;
              let sendAt;
              if (eventDate) {
                sendAt = new Date(eventDate);
                sendAt.setDate(sendAt.getDate() + dayOffset);
                sendAt.setHours(9, 0, 0, 0); // 9am
              } else {
                sendAt = new Date(now);
                sendAt.setDate(sendAt.getDate() + scheduled);
              }
              if (sendAt < now) sendAt = new Date(now.getTime() + 300000 * (scheduled + 1));
              await supabase.from("email_campaigns")
                .update({ send_at: sendAt.toISOString() })
                .eq("id", draft.id);
              scheduled++;
            }
            const { data } = await supabase.from("email_campaigns").select("*")
              .eq("event_id", activeEvent.id).order("created_at", { ascending: false });
            setCampaigns(data || []);
            fire(`✅ ${scheduled} campaigns auto-scheduled based on event date!`);
          }} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
            📅 Auto-Schedule
          </button>
          <button onClick={async () => {
            fire("⚡ Running scheduler…");
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`${SUPABASE_URL}/functions/v1/send-scheduled`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
            });
            const data = await res.json();
            if (data.fired > 0) {
              fire(`✅ ${data.fired} scheduled email${data.fired !== 1 ? "s" : ""} sent!`);
              // Refresh campaigns
              const { data: cams } = await supabase.from("email_campaigns").select("*").eq("event_id", activeEvent.id).order("created_at", { ascending: false });
              setCampaigns(cams || []);
            } else {
              fire(data.message || "No campaigns due to send right now");
            }
          }} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
            ⚡ Run Scheduler
          </button>
          <button onClick={() => setShowNew(true)} style={{ fontSize: 13, padding: "7px 16px", borderRadius: 7, border: "none", background: C.blue, color: "#fff", fontWeight: 500, cursor: "pointer" }}>+ New campaign</button>
        </div>
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
            <div key={cam.id} style={{ background: C.card, borderRadius: 10, border: `1px solid ${cam.status === "sent" ? C.green + "30" : cam.status === "scheduled" ? C.blue + "40" : cam.status === "paused" ? C.amber + "30" : C.border}`, padding: "16px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${cam.status === "sent" ? C.green : C.blue}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
              {cam.email_type === "save_the_date" ? "📅" : cam.email_type === "invitation" ? "✉️" : cam.email_type === "reminder" ? "⏰" : cam.email_type === "day_of_details" ? "📍" : cam.email_type === "thank_you" ? "🙏" : cam.email_type === "confirmation" ? "✅" : "📧"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{cam.name}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 500, padding: "2px 7px", borderRadius: 4, textTransform: "uppercase", background: cam.status === "sent" ? `${C.green}15` : cam.status === "paused" ? `${C.amber}15` : `${C.blue}15`, color: cam.status === "sent" ? C.green : cam.status === "paused" ? C.amber : C.blue }}>{cam.status}</span>
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {cam.scheduled_at ? `⏰ Scheduled: ${new Date(cam.scheduled_at).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : cam.send_at ? new Date(cam.send_at).toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "No send time set"}
                  {" · "}Segment: {cam.segment}
                  {cam.status === "sent" && ` · ✅ ${cam.total_sent || 0} sent · ${cam.total_sent > 0 ? Math.round(((cam.total_opened || 0) / cam.total_sent) * 100) : 0}% opened`}
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
                {cam.html_content && cam.status !== "sent" && (
                  <button onClick={async () => {
                    const testEmail = window.prompt("Send test to:", profile?.email || "");
                    if (!testEmail) return;
                    fire("📨 Sending test…");
                    const { data: { session } } = await supabase.auth.getSession();
                    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
                      body: JSON.stringify({
                        contacts: [{ email: testEmail, first_name: "Test" }],
                        subject: `[TEST] ${cam.subject}`,
                        htmlContent: cam.html_content,
                        plainText: cam.plain_text || cam.subject,
                      })
                    });
                    const d = await res.json();
                    fire(d.sent > 0 ? `✅ Test sent to ${testEmail}` : `Failed: ${d.error || "unknown"}`, d.sent > 0 ? "ok" : "err");
                  }} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "6px 12px", borderRadius: 6, border: `1px solid ${C.blue}40`, background: C.blue + "10", color: C.blue, cursor: "pointer" }}>
                    <Send size={11} />Test
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
                {cam.status === "sent" && cam.total_sent > 0 && cam.html_content && (
                  <button onClick={async () => {
                    if (!window.confirm(`Resend to contacts who haven't opened "${cam.subject}"?`)) return;
                    const { data: { session } } = await supabase.auth.getSession();
                    // Get all contacts who didn't open
                    const { data: ecs } = await supabase.from("event_contacts")
                      .select("contacts(email,first_name,last_name)")
                      .eq("event_id", activeEvent?.id);
                    const { data: opens } = await supabase.from("email_sends")
                      .select("email").eq("campaign_id", cam.id).not("opened_at", "is", null);
                    const openedEmails = new Set((opens || []).map(o => o.email));
                    const unopened = (ecs || []).map(ec => ec.contacts).filter(c => c?.email && !openedEmails.has(c.email));
                    if (!unopened.length) { fire("No unopened contacts found — great open rate!"); return; }
                    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
                      body: JSON.stringify({ contacts: unopened, subject: "Following up: " + cam.subject, htmlContent: cam.html_content, plainText: cam.plain_text })
                    }).then(r => r.json()).catch(e => ({ error: e.message }));
                    res.success ? fire(`✅ Resent to ${res.sent} unopened contacts`) : fire(res.error || "Failed", "err");
                  }} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.amber}40`, background: C.amber + "10", color: C.amber, cursor: "pointer" }}>
                    Resend Unopened
                  </button>
                )}
                {cam.status !== "sent" && (
                  <button onClick={async () => {
                    if (!window.confirm("Delete this campaign?")) return;
                    await supabase.from("email_campaigns").delete().eq("id", cam.id);
                    setCampaigns(p => p.filter(c => c.id !== cam.id));
                    fire("Campaign deleted");
                  }} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
                    Delete
                  </button>
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
              {sendModal.subject && (
              <div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>"{sendModal.subject}"</div>
                <div style={{ fontSize: 10, color: sendModal.subject.length > 60 ? C.amber : C.green }}>
                  {sendModal.subject.length}/60 chars {sendModal.subject.length > 60 ? "⚠️ may truncate in inbox" : "✅ good length"}
                </div>
              </div>
            )}
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
function ContactView({ supabase, profile, activeEvent, fire, globalSearch = "", setGlobalSearch }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(globalSearch || "");
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  useEffect(() => {
    if (!profile) return;
    supabase.from("contacts").select("*").eq("company_id", profile.company_id).order("created_at", { ascending: false })
      .then(({ data }) => { setContacts(data || []); setLoading(false); });
  }, [profile]);
  const [contactFilter, setContactFilter] = useState("all"); // all | vip | unsubscribed | active
  const filtered = contacts.filter(c => {
    if (search && !(c.email + (c.first_name||"") + (c.last_name||"") + (c.company_name||"")).toLowerCase().includes(search.toLowerCase())) return false;
    if (contactFilter === "vip" && !c.tags?.includes("vip")) return false;
    if (contactFilter === "unsubscribed" && !c.unsubscribed) return false;
    if (contactFilter === "active" && c.unsubscribed) return false;
    return true;
  });
  const importCSV = () => { setShowImport(true); };
  const doImport = async () => {
    if (!importText.trim() || !profile) return;
    setImporting(true);
    
    const lines = importText.split('\n').map(l => l.trim()).filter(Boolean);
    const rows = [];
    const BUSINESS_DOMAINS = ["gmail","yahoo","hotmail","outlook","icloud","rediffmail","aol","protonmail","zoho","live","msn"];
    
    // Detect if it's CSV (has commas consistently)
    const isCSV = lines.length > 1 && lines[0].includes(',');
    
    if (isCSV) {
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
      const emailCol = headers.findIndex(h => h.includes('email') || h.includes('e-mail'));
      const firstCol = headers.findIndex(h => h.includes('first') || h === 'name' || h === 'firstname');
      const lastCol = headers.findIndex(h => h.includes('last') || h === 'surname' || h === 'lastname');
      const phoneCol = headers.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('tel'));
      const companyCol = headers.findIndex(h => h.includes('company') || h.includes('organisation') || h.includes('organization') || h.includes('org'));
      const titleCol = headers.findIndex(h => h.includes('title') || h.includes('role') || h.includes('position') || h.includes('job'));
      
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        const email = emailCol >= 0 ? cols[emailCol]?.toLowerCase() : '';
        if (!email || !email.includes('@')) continue;
        const domain = email.split('@')[1]?.split('.')[0];
        if (BUSINESS_DOMAINS.includes(domain)) continue;
        const nameRaw = firstCol >= 0 ? cols[firstCol] : '';
        const nameParts = nameRaw.split(' ');
        rows.push({
          email,
          first_name: nameParts[0] || '',
          last_name: lastCol >= 0 ? cols[lastCol] : (nameParts[1] || ''),
          phone: phoneCol >= 0 ? cols[phoneCol] : '',
          company_name: companyCol >= 0 ? cols[companyCol] : '',
          job_title: titleCol >= 0 ? cols[titleCol] : '',
        });
      }
    } else {
      // Line-by-line: email, "First Last <email>", or "First, Last, email"
      for (const raw of lines) {
        const angleMatch = raw.match(/^(.+?)<(.+@.+)>$/);
        if (angleMatch) {
          const nameParts = angleMatch[1].trim().split(' ');
          const email = angleMatch[2].trim().toLowerCase();
          const domain = email.split('@')[1]?.split('.')[0];
          if (BUSINESS_DOMAINS.includes(domain)) continue;
          rows.push({ email, first_name: nameParts[0] || '', last_name: nameParts[1] || '', phone: '', company_name: '', job_title: '' });
        } else if (raw.includes('@')) {
          const email = raw.toLowerCase().trim();
          const domain = email.split('@')[1]?.split('.')[0];
          if (BUSINESS_DOMAINS.includes(domain)) continue;
          rows.push({ email, first_name: '', last_name: '', phone: '', company_name: '', job_title: '' });
        }
      }
    }
    
    if (!rows.length) { fire("No valid business emails found", "err"); setImporting(false); return; }
    
    // Batch upsert to Supabase
    const toInsert = rows.map(r => ({ ...r, company_id: profile.company_id }));
    const { data, error } = await supabase.from("contacts").upsert(toInsert, { onConflict: "email,company_id", ignoreDuplicates: true }).select();
    
    if (error) { fire(`Import error: ${error.message}`, "err"); }
    else {
      const newOnes = (data || []).filter(Boolean);
      setContacts(p => {
        const existing = new Set(p.map(c => c.email));
        return [...p, ...newOnes.filter(c => !existing.has(c.email))];
      });
      fire(`✅ ${rows.length} contacts imported! (${newOnes.length} new)`);
      setImportText('');
      setShowImport(false);
    }
    setImporting(false);
  }

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.6px", color: C.text }}>Contacts</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Unified contact records across every event — {contacts.length.toLocaleString()} total</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={async () => {
            if (contacts.length === 0) { fire("No contacts to brief", "err"); return; }
            fire("Generating AI Sales Brief…");
            const topContacts = contacts.slice(0, 10);
            const res = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "claude-sonnet-4-20250514", max_tokens: 1500,
                messages: [{ role: "user", content: "Generate a concise sales brief for each of these event contacts. For each person write 2-3 lines: who they are, what to talk about, and the best approach.\n\nContacts:\n" + topContacts.map(c => "- " + (c.first_name||"") + " " + (c.last_name||"") + ", " + (c.company_name||"unknown") + " (" + c.email + ")").join("\n") + "\n\nFormat: Name: brief" }]
              })
            }).then(r => r.json()).catch(() => null);
            const text = res?.content?.[0]?.text || "Could not generate brief";
            navigator.clipboard?.writeText(text);
            fire("📋 AI Sales Brief copied to clipboard!");
          }} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.blue}40`, background: C.blue + "10", color: C.blue, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <Sparkles size={12}/>AI Sales Brief
          </button>
          <button onClick={importCSV} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>+ Import emails</button>
        <button onClick={async () => {
          // Find duplicates by email
          const seen = {};
          const dupes = [];
          contacts.forEach(c => {
            const key = c.email?.toLowerCase().trim();
            if (!key) return;
            if (seen[key]) { dupes.push(c.id); }
            else seen[key] = true;
          });
          if (!dupes.length) { fire("No duplicates found ✅"); return; }
          if (!window.confirm(`Found ${dupes.length} duplicate contact(s). Delete them?`)) return;
          await supabase.from("contacts").delete().in("id", dupes);
          fire(`✅ Removed ${dupes.length} duplicate(s)`);
          // Reload
          const { data } = await supabase.from("contacts").select("*").eq("company_id", profile.company_id).order("created_at", { ascending: false });
          setContacts(data || []);
        }} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
          Deduplicate
        </button>
        <button onClick={() => {
          const emails = filtered.map(c => c.email).filter(Boolean).join(', ');
          navigator.clipboard?.writeText(emails);
          fire(`📋 ${filtered.length} email(s) copied to clipboard`);
        }} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
          Copy Emails
        </button>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px", marginBottom: 14, maxWidth: 320 }}>
        <Search size={13} color={C.muted} strokeWidth={1.5} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts…" style={{ background: "none", border: "none", outline: "none", color: C.sec, fontSize: 13, width: "100%" }} />
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[
          { id: "all", label: `All (${contacts.length})` },
          { id: "vip", label: `⭐ VIP (${contacts.filter(c => c.tags?.includes("vip")).length})` },
          { id: "active", label: `✓ Active (${contacts.filter(c => !c.unsubscribed).length})` },
          { id: "unsubscribed", label: `🚫 Unsub (${contacts.filter(c => c.unsubscribed).length})` },
        ].map(f => (
          <button key={f.id} onClick={() => setContactFilter(f.id)}
            style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, border: `1px solid ${contactFilter === f.id ? C.blue : C.border}`, background: contactFilter === f.id ? C.blue + "15" : "transparent", color: contactFilter === f.id ? C.blue : C.muted, cursor: "pointer", fontWeight: contactFilter === f.id ? 500 : 400 }}>
            {f.label}
          </button>
        ))}
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
                        {c.tags?.includes("vip") && <span style={{ fontSize: 10, color: "#FFB800", marginLeft: 4 }}>⭐ VIP</span>}
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 12.5, color: C.muted }}>{c.email}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12.5, color: C.muted }}>{c.company_name || "—"}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 500, color: c.unsubscribed ? C.red : C.green, background: (c.unsubscribed ? C.red : C.green) + "12", padding: "2px 8px", borderRadius: 4 }}>
                        {c.unsubscribed ? "🚫 Unsub" : "✓ Active"}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 11, color: C.muted, textTransform: "capitalize" }}>{c.source || "manual"}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                        {c.phone && <a href={`tel:${c.phone}`} style={{ fontSize: 11, color: C.blue, textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}><Phone size={10} />{c.phone}</a>}
                        <button onClick={async () => {
                          const isVip = c.tags?.includes("vip");
                          const newTags = isVip ? (c.tags||[]).filter(t=>t!=="vip") : [...(c.tags||[]), "vip"];
                          await supabase.from("contacts").update({ tags: newTags }).eq("id", c.id);
                          setContacts(p => p.map(x => x.id===c.id ? {...x,tags:newTags} : x));
                          fire(isVip ? "VIP tag removed" : "⭐ Marked as VIP");
                        }} title={c.tags?.includes("vip") ? "Remove VIP" : "Mark as VIP"}
                          style={{ fontSize: 13, background: "transparent", border: "none", cursor: "pointer", opacity: c.tags?.includes("vip") ? 1 : 0.3, lineHeight: 1 }}>⭐</button>
                        <button onClick={async () => {
                          const note = window.prompt("Add note for " + (c.first_name || c.email) + ":", c.notes || "");
                          if (note === null) return;
                          await supabase.from("contacts").update({ notes: note }).eq("id", c.id);
                          setContacts(p => p.map(x => x.id === c.id ? { ...x, notes: note } : x));
                          fire(note ? "Note saved" : "Note cleared");
                        }} title={c.notes || "Add note"} style={{ fontSize: 12, background: "transparent", border: "none", cursor: "pointer", opacity: c.notes ? 1 : 0.3, lineHeight: 1 }}>
                          📝
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      {/* IMPORT MODAL */}
      {showImport && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={() => setShowImport(false)}>
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28, width: 500, animation: "fadeUp .2s ease" }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: C.text, marginBottom: 4 }}>Import Contacts</h2>
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Paste emails, CSV data, or "First Last &lt;email&gt;" format. Business emails only.</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {[
                { label: "CSV format", ex: `first_name,last_name,email,phone,company\nJohn,Smith,john@acme.com,+1234,Acme Corp` },
                { label: "Email list", ex: `john@acme.com\njane@corp.com\nbob@startup.io` },
                { label: "Name + email", ex: `John Smith <john@acme.com>\nJane Lee <jane@corp.com>` },
              ].map(t => (
                <button key={t.label} onClick={() => setImportText(t.ex)} style={{ flex: 1, fontSize: 10, padding: "4px 6px", background: C.raised, border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>
                  {t.label}
                </button>
              ))}
            </div>
            <textarea value={importText} onChange={e => setImportText(e.target.value)}
              placeholder={"Paste CSV, emails, or names here…\n\nfirst_name,last_name,email,phone,company\nJohn,Smith,john@acme.com,,Acme Corp\n\n— or —\n\njohn@company.com\nJane Lee <jane@corp.com>"}
              rows={9} autoFocus
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "10px 12px", fontSize: 12, outline: "none", resize: "vertical", fontFamily: "monospace", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e => e.target.style.borderColor = C.border} />
            <div style={{ fontSize: 11, color: C.muted, marginTop: 6, marginBottom: 16 }}>
              {importText.split(/[\n,]/).filter(e => e.includes("@")).length} email(s) detected
            </div>
            <div style={{ display: "flex", gap: 9 }}>
              <button onClick={() => { setShowImport(false); setImportText(""); }}
                style={{ flex: 1, padding: 11, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={doImport} disabled={importing || !importText.trim()}
                style={{ flex: 1, padding: 11, background: importing ? C.raised : C.blue, border: "none", borderRadius: 8, color: importing ? C.muted : "#fff", fontSize: 13, fontWeight: 500, cursor: importing ? "default" : "pointer" }}>
                {importing ? "Importing…" : "Import Contacts"}
              </button>
            </div>
          </div>
        </div>
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
    if (error) { fire(error.message, "err"); }
    else {
      setPage(data);
      if (publish) {
        const url = `${window.location.origin}/page/${data.slug}`;
        fire(`🎉 Page published! ${url}`);
        navigator.clipboard?.writeText(url);
      } else {
        fire("Draft saved");
      }
    }
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

      {/* Live page URL bar */}
      {page?.is_published && page?.slug && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: C.green + "10", border: `1px solid ${C.green}25`, borderRadius: 8, marginBottom: 12 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
          <span style={{ fontSize: 11.5, color: C.green, fontWeight: 600 }}>Live:</span>
          <code style={{ flex: 1, fontSize: 11, color: C.text }}>{window.location.origin}/page/{page.slug}</code>
          <button onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/page/${page.slug}`); fire("✅ URL copied!"); }}
            style={{ fontSize: 10.5, padding: "3px 10px", background: C.green + "20", border: `1px solid ${C.green}40`, borderRadius: 5, color: C.green, cursor: "pointer", fontWeight: 500 }}>Copy</button>
          <a href={`/page/${page.slug}`} target="_blank" rel="noreferrer"
            style={{ fontSize: 10.5, padding: "3px 10px", background: C.raised, border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, textDecoration: "none" }}>Open ↗</a>
        </div>
      )}

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
  const FIELD_TYPES = [{ type: "text", icon: "Aa", label: "Short Text" }, { type: "email", icon: "@", label: "Email" }, { type: "phone", icon: "✆", label: "Phone" }, { type: "textarea", icon: "¶", label: "Long Text" }, { type: "select", icon: "▾", label: "Dropdown" }, { type: "radio", icon: "◉", label: "Multiple Choice" }, { type: "checkbox", icon: "☑", label: "Checkbox" }, { type: "file", icon: "↑", label: "File Upload" }, 
  { type: "date", icon: "📅", label: "Date" }, 
  { type: "number", icon: "#", label: "Number" }, 
  { type: "rating", icon: "⭐", label: "Rating (1-5)" },
  { type: "dietary", icon: "🍽", label: "Dietary Needs" }];
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
  const shareLink = activeForm 
    ? `${window.location.hostname === 'localhost' ? 'https://evara-tau.vercel.app' : window.location.origin}/form/${activeForm.share_token}`
    : "Save form first";
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

      {/* ── Prominent form URL bar ── */}
      {activeForm?.share_token && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: C.green + "10", border: `1px solid ${C.green}30`, borderRadius: 9, marginBottom: 14 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: C.green, fontWeight: 600, flexShrink: 0 }}>Form live:</span>
          <code style={{ flex: 1, fontSize: 11.5, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {`${window.location.hostname === "localhost" ? "https://evara-tau.vercel.app" : window.location.origin}/form/${activeForm.share_token}`}
          </code>
          <button onClick={() => {
            const url = `${window.location.hostname === "localhost" ? "https://evara-tau.vercel.app" : window.location.origin}/form/${activeForm.share_token}`;
            navigator.clipboard.writeText(url);
            fire("✅ Form URL copied!");
          }} style={{ fontSize: 11, padding: "3px 10px", background: C.green + "20", border: `1px solid ${C.green}40`, borderRadius: 5, color: C.green, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 500 }}>
            Copy Link
          </button>
          <a href={`${window.location.hostname === "localhost" ? "https://evara-tau.vercel.app" : window.location.origin}/form/${activeForm.share_token}`} target="_blank" rel="noreferrer"
            style={{ fontSize: 11, padding: "3px 10px", background: C.raised, border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer", whiteSpace: "nowrap", textDecoration: "none" }}>
            Open ↗
          </a>
        </div>
      )}

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
                    <button onClick={() => {
                      if (!submissions.length) return;
                      // Build headers from first submission
                      const fields = activeForm?.fields || [];
                      const headers = ["Submitted", "Email", ...fields.map(f => f.label)];
                      const rows = submissions.map(s => [
                        new Date(s.submitted_at).toLocaleString(),
                        s.submitter_email || "",
                        ...fields.map(f => (s.responses?.[f.id] || "").toString().replace(/"/g, '""'))
                      ]);
                      const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url; a.download = `${activeForm?.name || "form"}-responses.csv`;
                      a.click(); URL.revokeObjectURL(url);
                      fire("CSV exported!");
                    }} style={{ fontSize: 12, padding: "5px 12px", background: C.blue, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                    <Download size={11} style={{ display: "inline", marginRight: 4 }} />Export CSV
                    </button>
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
              <Sec label="QR Code">
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Display this QR code on screen, print it at the venue, or include it in printed invites. Attendees scan to register instantly.</div>
                <div style={{ background: "#fff", borderRadius: 10, padding: 16, display: "inline-block", marginBottom: 12 }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareLink)}`} alt="QR Code" width={160} height={160} style={{ display: "block", borderRadius: 4 }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => {
                    const a = document.createElement("a");
                    a.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(shareLink)}`;
                    a.download = "evara-registration-qr.png";
                    a.target = "_blank";
                    a.click();
                    fire("QR code downloading…");
                  }} style={{ padding: "8px 16px", background: C.blue, color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                    ⬇ Download QR Code
                  </button>
                  <button onClick={() => { navigator.clipboard?.writeText(shareLink); fire("Link copied!"); }}
                    style={{ padding: "8px 16px", background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 7, fontSize: 13, cursor: "pointer" }}>
                    📋 Copy Link
                  </button>
                </div>
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
    await supabase.from("companies").update({ 
      name: company, 
      from_email: fromEmail, 
      brand_color: brandColor 
    }).eq("id", profile.company_id);
    setSaving(false); fire("✅ Settings saved!");
  };
  const [fromEmail, setFromEmail] = useState(profile?.companies?.from_email || "hello@evarahq.com");
  const [brandColor, setBrandColor] = useState(profile?.companies?.brand_color || "#0A84FF");
  
  // Brand Voice states
  const [bv, setBv] = useState(null);
  const [bvSaving, setBvSaving] = useState(false);

  useEffect(() => {
    if (!profile?.company_id) return;
    supabase.from("brand_voice").select("*").eq("company_id", profile.company_id).maybeSingle()
      .then(({ data }) => setBv(data || {
        tone_adjectives: [], industry: "", audience: "", signature_phrases: [],
        avoid_phrases: [], preferred_cta: "", sender_name: "", email_sign_off: "",
        performance_notes: "", extra_context: ""
      }));
  }, [profile]);

  const saveBrandVoice = async () => {
    if (!profile?.company_id || !bv) return;
    setBvSaving(true);
    await supabase.from("brand_voice").upsert({ ...bv, company_id: profile.company_id }, { onConflict: "company_id" });
    setBvSaving(false);
    fire("✅ Brand voice saved!");
  };

  return (
    <div style={{ animation: "fadeUp .2s ease", maxWidth: 560 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.6px", color: C.text, marginBottom: 6 }}>Settings</h1>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>Manage your profile, company, branding and security settings.</p>
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
        <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 16 }}>Brand Kit</div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11.5, color: C.muted, marginBottom: 5 }}>From email address</label>
          <input value={fromEmail} onChange={e => setFromEmail(e.target.value)}
            style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, padding: "10px 12px", fontSize: 13, outline: "none" }}
            onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11.5, color: C.muted, marginBottom: 5 }}>Brand colour</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)}
              style={{ width: 40, height: 36, border: "none", background: "none", cursor: "pointer" }} />
            <input value={brandColor} onChange={e => setBrandColor(e.target.value)}
              style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, padding: "10px 12px", fontSize: 13, outline: "none" }} />
            <div style={{ width: 36, height: 36, borderRadius: 6, background: brandColor, flexShrink: 0, border: `1px solid ${C.border}` }} />
          </div>
        </div>
      </div>
      <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>Email & AI Configuration</div>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 1.6 }}>
          Add these in Supabase → Project Settings → Edge Functions → Secrets to activate sending and AI generation:
        </p>
        {[
          { key: "ANTHROPIC_API_KEY", desc: "AI email generation (required)", href: "https://console.anthropic.com", status: "✅" },
          { key: "SENDGRID_API_KEY", desc: "Email sending via SendGrid (required)", href: "https://app.sendgrid.com/settings/api_keys", status: "✅" },
          { key: "FROM_EMAIL", desc: "e.g. hello@evarahq.com", href: null, status: "✅" },
          { key: "FROM_NAME", desc: "e.g. Your Company Name", href: null, status: "✅" },
        ].map(s => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: C.bg, borderRadius: 6, border: `1px solid ${s.status ? C.green + "30" : C.border}`, marginBottom: 6 }}>
            {s.status && <span style={{ fontSize: 12 }}>{s.status}</span>}
            <code style={{ fontSize: 11, color: C.teal, fontFamily: "monospace", flex: 1 }}>{s.key}</code>
            <span style={{ fontSize: 11, color: C.muted }}>{s.desc}</span>
            {s.href && <a href={s.href} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: C.blue, textDecoration: "none" }}>Get →</a>}
          </div>
        ))}
      </div>
      <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}><Shield size={13} color={C.blue} /><span style={{ fontSize: 11, fontWeight: 600, color: C.blue, textTransform: "uppercase", letterSpacing: "0.8px" }}>Security & Privacy</span></div>
        {["Data isolated per company", "Zero PII sent to AI", "TLS 1.3 encryption in transit", "Row-level security enforced", "GDPR compliant"].map(s => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 13, color: C.sec }}><CheckCircle size={13} color={C.green} />{s}</div>
        ))}
      </div>
      <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 14 }}>Team Access</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Invite colleagues to access your evara workspace.</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input id="invite-email" placeholder="colleague@company.com"
            style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, padding: "8px 12px", fontSize: 13, outline: "none" }}
            onFocus={e => e.target.style.borderColor = C.blue}
            onBlur={e => e.target.style.borderColor = C.border} />
          <select id="invite-role" style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, color: C.text, padding: "8px 12px", fontSize: 13, outline: "none", cursor: "pointer" }}>
            <option value="admin">Admin</option><option value="editor">Editor</option><option value="viewer">Viewer</option>
          </select>
          <button onClick={async () => {
            const email = document.getElementById("invite-email")?.value?.trim();
            const role = document.getElementById("invite-role")?.value || "editor";
            if (!email?.includes("@")) { fire("Enter a valid email", "err"); return; }
            if (!profile?.company_id) return;
            // Send real invite email via send-email function
            const { data: { session: sess } } = await supabase.auth.getSession();
            const companyName = profile?.companies?.name || "evara";
            const inviterName = profile?.full_name || "Your team";
            const inviteUrl = `https://evara-tau.vercel.app/?invite=${profile.company_id}&role=${role}&email=${encodeURIComponent(email)}`;
            const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sess?.access_token}` },
              body: JSON.stringify({
                contacts: [{ email, first_name: "" }],
                subject: `${inviterName} invited you to ${companyName} on evara`,
                htmlContent: `<div style="font-family:Arial;max-width:500px;padding:40px"><h2 style="color:#0A84FF">You're invited! 🎉</h2><p><strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong>'s event marketing workspace on evara.</p><p style="margin:24px 0"><a href="${inviteUrl}" style="background:#0A84FF;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Accept Invitation →</a></p><p style="color:#999;font-size:13px">You'll be added as <strong>${role}</strong>. If you don't have an evara account, you can create one for free.</p><p style="color:#bbb;font-size:12px">Powered by evara · evarahq.com</p></div>`,
                plainText: `${inviterName} invited you to ${companyName} on evara. Accept here: ${inviteUrl}`,
              })
            });
            const data = await res.json();
            if (data.sent > 0) {
              fire(`✅ Invite sent to ${email}!`);
              document.getElementById("invite-email").value = "";
            } else { fire(`Invite failed: ${data.error || "unknown error"}`, "err"); }
          }} style={{ padding: "8px 18px", background: C.blue, border: "none", borderRadius: 7, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            Send Invite
          </button>
        </div>
        <div style={{ fontSize: 11, color: C.muted }}>
          ℹ️ They'll receive a real email with a link to join your workspace on evara.
        </div>
      </div>
      {/* ── Email deliverability & webhook setup ── */}
      <div style={{ background: "#FF9F0A08", border: "1px solid #FF9F0A25", borderRadius: 12, padding: 20, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#FF9F0A", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>Email Deliverability</div>
        <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 12 }}>
          Add these DNS records in Namecheap for <strong style={{ color: C.text }}>evarahq.com</strong> to prevent emails going to spam:
        </p>
        {[
          { type: "TXT (SPF)", host: "@", value: "v=spf1 include:sendgrid.net ~all" },
          { type: "CNAME (DKIM)", host: "s1._domainkey", value: "s1.domainkey.u[id].wl.sendgrid.net" },
        ].map(r => (
          <div key={r.type} style={{ background: C.bg, borderRadius: 6, padding: "7px 10px", marginBottom: 6, fontFamily: "monospace", fontSize: 11, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ color: "#FF9F0A", fontWeight: 600, flexShrink: 0 }}>{r.type}</span>
            <span style={{ color: C.muted, flexShrink: 0 }}>Host: <span style={{ color: C.text }}>{r.host}</span></span>
            <span style={{ color: C.muted, flex: 1 }}>Value: <span style={{ color: C.teal }}>{r.value}</span></span>
          </div>
        ))}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 6 }}>📡 Open & Click Tracking Webhook</div>
          <div style={{ background: C.bg, borderRadius: 6, padding: "8px 10px", fontFamily: "monospace", fontSize: 11, color: C.teal, marginBottom: 8, wordBreak: "break-all" }}>
            https://sqddpjsgtwblmkgxqyxe.supabase.co/functions/v1/email-webhook
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
            SendGrid → Settings → Mail Settings → Event Webhook → paste URL above → check Opens, Clicks, Bounces, Unsubscribes → Save
          </div>
          <button onClick={() => { navigator.clipboard?.writeText("https://sqddpjsgtwblmkgxqyxe.supabase.co/functions/v1/email-webhook"); fire("✅ Webhook URL copied!"); }}
            style={{ fontSize: 11, padding: "4px 12px", background: C.blue + "15", border: `1px solid ${C.blue}30`, borderRadius: 5, color: C.blue, cursor: "pointer" }}>
            Copy Webhook URL
          </button>
        </div>
      </div>

      <div style={{ background: "#1a0808", borderRadius: 12, border: `1px solid ${C.red}30`, padding: 20, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 14 }}>Danger Zone</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, color: C.text, marginBottom: 4 }}>Export all data and delete account</div>
            <div style={{ fontSize: 11, color: C.muted }}>Downloads your data then permanently removes all account data.</div>
          </div>
          <button onClick={() => {
            if (window.confirm("Are you absolutely sure? This cannot be undone.")) {
              fire("Please contact hello@evarahq.com to delete your account and data.", "err");
            }
          }} style={{ padding: "7px 14px", background: "transparent", border: `1px solid ${C.red}50`, borderRadius: 7, color: C.red, fontSize: 12, cursor: "pointer" }}>
            Request Deletion
          </button>
        </div>
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
          <button onClick={() => {
            const url = `${window.location.origin}/checkin/${activeEvent?.id}`;
            navigator.clipboard?.writeText(url);
            fire("Check-in kiosk URL copied! Open on a tablet at the door.");
          }} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
            📋 Copy Kiosk URL
          </button>
          <button onClick={() => {
            const attended = contacts.filter(c => c.status === "attended");
            const csv = ["Name,Email,Company,Checked In"].concat(
              attended.map(ec => {
                const c = ec.contacts || {};
                return `"${c.first_name||""} ${c.last_name||""}","${c.email||""}","${c.company_name||""}","${ec.attended_at ? new Date(ec.attended_at).toLocaleTimeString() : "yes"}"`;
              })
            ).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = `${activeEvent.name}-attended.csv`; a.click();
            fire(`✅ Exported ${attended.length} attendees`);
          }} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
            ⬇ Export
          </button>
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
  "instagram": { "caption": "Engaging caption with emojis", "hashtags": ["tag1","tag2","tag3","tag4","tag5"], "story_ideas": ["idea1","idea2","idea3"] },
  "facebook": { "post": "Conversational 100-150 word post, good for sharing event details", "hashtags": ["tag1","tag2"] },
  "email": { "subject": "Compelling email subject line", "preview_text": "Email preview text under 90 chars", "blurb": "2-3 sentence newsletter blurb about the event" }
}`

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
              <Radio size={36} strokeWidth={1} />
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
      supabase.from("event_summary").select("*").eq("event_id", activeEvent.id).maybeSingle(),
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
                          {cam.send_at && cam.status !== "sent" && (
                            <div style={{ fontSize: 10, color: C.amber, marginTop: 3 }}>
                              📅 {new Date(cam.send_at).toLocaleDateString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </div>
                          )}
                          {cam.sent_at && (
                            <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>
                              Sent {new Date(cam.sent_at).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                            </div>
                          )}
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
          {/* ── Visual email timeline chart ── */}
          {campaigns.filter(c => c.status === "sent" && c.total_sent > 0).length > 0 && (
            <div style={{ background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, padding: "16px 18px", marginTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 14 }}>Send Volume by Campaign</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
                {campaigns.filter(c => c.status === "sent").map((cam, i) => {
                  const maxSent = Math.max(...campaigns.filter(c => c.status === "sent").map(c => c.total_sent || 0), 1);
                  const h = Math.max(6, Math.round(((cam.total_sent || 0) / maxSent) * 72));
                  const openH = Math.max(0, Math.round(((cam.total_opened || 0) / maxSent) * 72));
                  return (
                    <div key={cam.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "default" }} title={`${cam.name}: ${cam.total_sent} sent, ${cam.total_opened || 0} opened`}>
                      <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 72, gap: 2 }}>
                        <div style={{ width: "100%", height: openH, background: C.teal + "80", borderRadius: "3px 3px 0 0", minHeight: openH > 0 ? 3 : 0 }} />
                        <div style={{ width: "100%", height: h - openH, background: C.blue + "60", borderRadius: openH > 0 ? 0 : "3px 3px 0 0", minHeight: 3 }} />
                      </div>
                      <div style={{ fontSize: 9, color: C.muted, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%", maxWidth: 60 }}>
                        {cam.email_type?.replace(/_/g, " ") || cam.name?.slice(0, 8)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.muted }}>
                  <div style={{ width: 10, height: 10, background: C.blue + "60", borderRadius: 2 }} />Sent
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.muted }}>
                  <div style={{ width: 10, height: 10, background: C.teal + "80", borderRadius: 2 }} />Opened
                </div>
              </div>
            </div>
          )}
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
  const [data, setData] = useState(null);
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
      fire(`✅ 7 emails generated! View in Scheduling →`);
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
          {data?.total_sent > 0 && (() => {
            const openRate = (data.total_sent||0) > 0 ? Math.round(((data.total_opened||0) / data.total_sent) * 100) : 0;
            const convRate = (data.total_sent||0) > 0 ? Math.round((((data.ec_total||data.total_registered)||0) / data.total_sent) * 100) : 0;
            const showRate = (data.confirmed||0) > 0 ? Math.round(((data.attended||0) / data.confirmed) * 100) : 0;
            return (
              <Sec label="Industry Benchmarks">
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>How your event compares to B2B event industry averages</div>
                {[
                  { label: "Email Open Rate", yours: openRate, benchmark: 28, unit: "%" },
                  { label: "Email → Registration", yours: convRate, benchmark: 5, unit: "%" },
                  { label: "Confirmed → Attended", yours: showRate, benchmark: 72, unit: "%" },
                ].map(m => {
                  const good = m.yours >= m.benchmark;
                  return (
                    <div key={m.label} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                        <span style={{ color: C.text }}>{m.label}</span>
                        <div style={{ display: "flex", gap: 10 }}>
                          <span style={{ color: good ? C.green : C.amber, fontWeight: 600 }}>You: {m.yours}{m.unit}</span>
                          <span style={{ color: C.muted }}>Avg: {m.benchmark}{m.unit}</span>
                        </div>
                      </div>
                      <div style={{ position: "relative", height: 8, background: C.raised, borderRadius: 4 }}>
                        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${Math.min(m.yours, 100)}%`, background: good ? C.green : C.amber, borderRadius: 4, transition: "width .5s" }} />
                        <div style={{ position: "absolute", left: `${m.benchmark}%`, top: -3, width: 2, height: 14, background: C.blue, borderRadius: 1 }} title={`Industry avg: ${m.benchmark}${m.unit}`} />
                      </div>
                      <div style={{ fontSize: 10, color: good ? C.green : C.amber, marginTop: 4 }}>
                        {good ? `✅ ${m.yours - m.benchmark}${m.unit} above industry average` : `⚠️ ${m.benchmark - m.yours}${m.unit} below industry average`}
                      </div>
                    </div>
                  );
                })}
              </Sec>
            );
          })()}
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
              <Layout size={40} strokeWidth={1} />
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

// ─── AI AGENDA BUILDER ────────────────────────────────────────
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
      const res = await fetch("https://api.anthropic.com/v1/messages", {
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
              return (
                <div key={s.id} style={{ padding: "12px 16px", borderBottom: i < sessions.length - 1 ? `1px solid ${C.border}` : undefined, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{typeInfo.emoji}</span>
                  <div style={{ flex: 1, display: "flex", gap: 10, alignItems: "center" }}>
                    <input value={s.title} onChange={e => setSessions(p => p.map(x => x.id === s.id ? { ...x, title: e.target.value } : x))}
                      style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "6px 8px", fontSize: 13, outline: "none" }} />
                    <select value={s.type} onChange={e => setSessions(p => p.map(x => x.id === s.id ? { ...x, type: e.target.value } : x))}
                      style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: typeInfo.color, padding: "6px 8px", fontSize: 12, outline: "none", cursor: "pointer" }}>
                      {SESSION_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input type="number" value={s.duration} min={5} max={480} onChange={e => setSessions(p => p.map(x => x.id === s.id ? { ...x, duration: parseInt(e.target.value) || 30 } : x))}
                        style={{ width: 60, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "6px 6px", fontSize: 12, outline: "none", textAlign: "center" }} />
                      <span style={{ fontSize: 11, color: C.muted }}>min</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 3 }}>
                    <button onClick={() => { if (i === 0) return; setSessions(p => { const a = [...p]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; }); }}
                      style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, padding: "0 3px" }}>↑</button>
                    <button onClick={() => { if (i === sessions.length - 1) return; setSessions(p => { const a = [...p]; [a[i], a[i+1]] = [a[i+1], a[i]]; return a; }); }}
                      style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, padding: "0 3px" }}>↓</button>
                    <button onClick={() => setSessions(p => p.filter(x => x.id !== s.id))}
                      style={{ background: "transparent", border: "none", color: C.red, cursor: "pointer", fontSize: 16, padding: "0 3px" }}>×</button>
                  </div>
                  {s.tip && <div style={{ fontSize: 10, color: C.amber, background: C.amber + "10", padding: "2px 6px", borderRadius: 3, maxWidth: 120 }}>💡 {s.tip}</div>}
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
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {`${c.first_name || ""} ${c.last_name || ""}`.trim() || c.email}
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
              <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 16 }}>Activity Timeline</div>
              {activity.length === 0 ? (
                <div style={{ textAlign: "center", color: C.muted, padding: 24 }}>No activity recorded yet</div>
              ) : activity.map((a, i) => (
                <div key={a.id} style={{ display: "flex", gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: i < activity.length - 1 ? `1px solid ${C.border}` : undefined }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.activity_type === "checked_in" ? C.green : a.activity_type === "status_changed" ? C.amber : C.blue, flexShrink: 0, marginTop: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: C.text }}>{a.description}</div>
                    {a.events?.name && <div style={{ fontSize: 11, color: C.blue, marginTop: 2 }}>📅 {a.events.name}</div>}
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{new Date(a.created_at).toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                  <span style={{ fontSize: 10, color: C.muted, background: C.raised, padding: "2px 7px", borderRadius: 3, height: "fit-content", textTransform: "capitalize" }}>
                    {a.activity_type?.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROI CALCULATOR ───────────────────────────────────────────
function ROIView({ supabase, profile, activeEvent, fire }) {
  const [costs, setCosts] = useState({ venue: "", catering: "", av: "", marketing: "", staff: "", other: "" });
  const [revenue, setRevenue] = useState({ tickets: "", sponsorship: "", pipeline: "", other: "" });
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (!activeEvent || !profile) return;
    supabase.from("event_summary").select("*").eq("event_id", activeEvent.id).maybeSingle()
      .then(({ data }) => {
        setMetrics(data);
      });
  }, [activeEvent, profile]);

  const totalCost = Object.values(costs).reduce((a, v) => a + (parseFloat(v) || 0), 0);
  const totalRevenue = Object.values(revenue).reduce((a, v) => a + (parseFloat(v) || 0), 0);
  const roi = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost * 100).toFixed(0) : 0;
  const costPerAttendee = metrics?.total_attended > 0 ? (totalCost / metrics.total_attended).toFixed(0) : 0;
  const roiColor = roi >= 0 ? C.green : C.red;

  const inputStyle = { width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "7px 10px", fontSize: 13, outline: "none" };

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: C.text, letterSpacing: "-0.6px" }}>ROI Calculator</h1>
        <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Measure and report event return on investment to your stakeholders.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 320px", gap: 14 }}>
        {/* Costs */}
        <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.red, marginBottom: 14 }}>💸 Costs</div>
          {[["venue", "Venue"], ["catering", "Catering & Drinks"], ["av", "AV & Production"], ["marketing", "Marketing"], ["staff", "Staff & Speakers"], ["other", "Other"]].map(([k, l]) => (
            <div key={k} style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>{l}</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: 13 }}>$</span>
                <input type="number" value={costs[k]} onChange={e => setCosts(p => ({ ...p, [k]: e.target.value }))}
                  placeholder="0" style={{ ...inputStyle, paddingLeft: 22 }} />
              </div>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: C.muted }}>Total Costs</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.red }}>${totalCost.toLocaleString()}</span>
          </div>
        </div>

        {/* Revenue */}
        <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.green, marginBottom: 14 }}>💰 Revenue & Value</div>
          {[["tickets", "Ticket Revenue"], ["sponsorship", "Sponsorship"], ["pipeline", "Pipeline Generated"], ["other", "Other Value"]].map(([k, l]) => (
            <div key={k} style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>{l}</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: 13 }}>$</span>
                <input type="number" value={revenue[k]} onChange={e => setRevenue(p => ({ ...p, [k]: e.target.value }))}
                  placeholder="0" style={{ ...inputStyle, paddingLeft: 22 }} />
              </div>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: C.muted }}>Total Value</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.green }}>${totalRevenue.toLocaleString()}</span>
          </div>
        </div>

        {/* Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: C.card, borderRadius: 10, border: `2px solid ${roiColor}40`, padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>Return on Investment</div>
            <div style={{ fontSize: 48, fontWeight: 800, color: roiColor, letterSpacing: "-2px" }}>{roi}%</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
              {roi >= 0 ? `$${(totalRevenue - totalCost).toLocaleString()} net gain` : `$${(totalCost - totalRevenue).toLocaleString()} net loss`}
            </div>
          </div>
          {[
            { label: "Cost per Attendee", val: `$${parseInt(costPerAttendee || 0).toLocaleString()}`, color: C.amber },
            { label: "Total Attendees", val: metrics?.total_attended || 0, color: C.blue },
            { label: "Emails Sent", val: metrics?.total_sent || 0, color: C.teal },
            { label: "Open Rate", val: metrics?.total_sent ? `${Math.round((metrics.total_opened / metrics.total_sent) * 100)}%` : "—", color: C.green },
          ].map(s => (
            <div key={s.label} style={{ background: C.card, borderRadius: 8, border: `1px solid ${C.border}`, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: C.muted }}>{s.label}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.val}</span>
            </div>
          ))}
          <button onClick={() => {
            const report = `EVARA EVENT ROI REPORT\n${"=".repeat(30)}\nEvent: ${activeEvent?.name}\n\nCOSTS\nVenue: $${costs.venue || 0}\nCatering: $${costs.catering || 0}\nAV/Production: $${costs.av || 0}\nMarketing: $${costs.marketing || 0}\nStaff: $${costs.staff || 0}\nOther: $${costs.other || 0}\nTOTAL COSTS: $${totalCost.toLocaleString()}\n\nREVENUE & VALUE\nTickets: $${revenue.tickets || 0}\nSponsorship: $${revenue.sponsorship || 0}\nPipeline: $${revenue.pipeline || 0}\nOther: $${revenue.other || 0}\nTOTAL VALUE: $${totalRevenue.toLocaleString()}\n\nROI: ${roi}%\nNet: $${(totalRevenue - totalCost).toLocaleString()}\nCost/Attendee: $${costPerAttendee}\nAttendees: ${metrics?.total_attended || 0}\nOpen Rate: ${metrics?.total_sent ? Math.round((metrics.total_opened / metrics.total_sent) * 100) + '%' : 'N/A'}`;
            navigator.clipboard?.writeText(report);
            fire("ROI report copied to clipboard!");
          }} style={{ padding: "10px", borderRadius: 7, border: "none", background: C.blue, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            📋 Copy ROI Report
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FEEDBACK VIEW ────────────────────────────────────────────
// AI-powered post-event feedback collection and analysis
function FeedbackView({ supabase, profile, activeEvent, fire }) {
  const [tab, setTab] = useState("collect"); // collect | analyse | report
  const [submissions, setSubmissions] = useState([]);
  const [analysing, setAnalysing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [sending, setSending] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState(null);
  const [shareLink, setShareLink] = useState("");

  useEffect(() => {
    if (!activeEvent || !profile) return;
    // Load existing feedback form for this event
    supabase.from("forms").select("*").eq("event_id", activeEvent.id).eq("form_type", "feedback")
      .maybeSingle().then(({ data }) => {
        if (data) {
          setFeedbackForm(data);
          setShareLink(`${window.location.origin}/form/${data.share_token}`);
          // Load submissions
          supabase.from("form_submissions").select("*").eq("form_id", data.id)
            .order("submitted_at", { ascending: false })
            .then(({ data: subs }) => setSubmissions(subs || []));
        }
      });
  }, [activeEvent, profile]);

  const createFeedbackForm = async () => {
    if (!activeEvent || !profile) return;
    setSending(true);
    const feedbackFields = [
      { id: 1, type: "radio", label: "How would you rate this event overall?", required: true, options: ["⭐⭐⭐⭐⭐ Excellent", "⭐⭐⭐⭐ Very Good", "⭐⭐⭐ Good", "⭐⭐ Fair", "⭐ Poor"] },
      { id: 2, type: "radio", label: "How likely are you to recommend this event to a colleague?", required: true, options: ["10 - Extremely likely", "9", "8", "7", "6", "5 - Neutral", "4", "3", "2", "1 - Not at all"] },
      { id: 3, type: "textarea", label: "What did you enjoy most about the event?", required: false, options: [] },
      { id: 4, type: "textarea", label: "What could we improve for next time?", required: false, options: [] },
      { id: 5, type: "radio", label: "Would you attend our next event?", required: true, options: ["Yes, definitely", "Probably yes", "Not sure", "Probably not", "No"] },
      { id: 6, type: "text", label: "Any other comments or suggestions?", required: false, options: [] },
    ];
    const { data, error } = await supabase.from("forms").insert({
      event_id: activeEvent.id,
      company_id: profile.company_id,
      name: `${activeEvent.name} — Feedback`,
      fields: feedbackFields,
      form_type: "feedback",
      is_active: true,
    }).select().single();
    if (error) { fire(error.message, "err"); }
    else {
      setFeedbackForm(data);
      setShareLink(`${window.location.origin}/form/${data.share_token}`);
      fire("✅ Feedback form created!");
    }
    setSending(false);
  };

  const analyseWithAI = async () => {
    if (submissions.length === 0) { fire("No submissions to analyse yet", "err"); return; }
    setAnalysing(true);
    try {
      const responses = submissions.map(s => JSON.stringify(s.responses)).join("\n\n");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1200,
          messages: [{
            role: "user",
            content: `Analyse these ${submissions.length} event feedback responses and return ONLY valid JSON:

Event: ${activeEvent.name}
Responses: ${responses.slice(0, 8000)}

Return this exact JSON structure:
{
  "nps": number (0-10 average from "likely to recommend" answers),
  "overall_rating": number (1-5 average),
  "sentiment": "positive" | "neutral" | "negative",
  "top_positives": ["phrase1", "phrase2", "phrase3"],
  "top_improvements": ["phrase1", "phrase2", "phrase3"],
  "would_attend_again": number (percentage),
  "key_quotes": ["quote1", "quote2"],
  "recommendations": ["action1", "action2", "action3"],
  "summary": "2-3 sentence executive summary"
}`
          }]
        })
      });
      const d = await res.json();
      const text = d.content?.[0]?.text?.replace(/```json|```/g, "").trim();
      setAnalysis(JSON.parse(text));
      fire("✅ AI analysis complete!");
      setTab("analyse");
    } catch(e) { fire("Analysis failed: " + e.message, "err"); }
    setAnalysing(false);
  };

  const copyReport = () => {
    if (!analysis) return;
    const report = `
POST-EVENT FEEDBACK REPORT
${activeEvent?.name}
${"=".repeat(40)}

SUMMARY
${analysis.summary}

KEY METRICS
• NPS Score: ${analysis.nps}/10
• Overall Rating: ${analysis.overall_rating}/5 ⭐
• Would attend again: ${analysis.would_attend_again}%
• Responses received: ${submissions.length}

TOP POSITIVES
${analysis.top_positives?.map(p => `✅ ${p}`).join("\n")}

AREAS FOR IMPROVEMENT
${analysis.top_improvements?.map(p => `⚠️ ${p}`).join("\n")}

ATTENDEE QUOTES
${analysis.key_quotes?.map(q => `"${q}"`).join("\n")}

RECOMMENDED ACTIONS
${analysis.recommendations?.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Generated by evara
`.trim();
    navigator.clipboard?.writeText(report);
    fire("📋 Report copied to clipboard!");
  };

  const npsColor = !analysis ? C.muted : analysis.nps >= 8 ? C.green : analysis.nps >= 6 ? C.amber : C.red;
  const ratingColor = !analysis ? C.muted : analysis.overall_rating >= 4 ? C.green : analysis.overall_rating >= 3 ? C.amber : C.red;

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: C.text, letterSpacing: "-0.6px" }}>Feedback Intelligence</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Collect, analyse, and act on post-event feedback with AI.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {submissions.length > 0 && (
            <button onClick={analyseWithAI} disabled={analysing}
              style={{ fontSize: 13, padding: "7px 16px", borderRadius: 7, border: "none", background: analysing ? C.raised : C.blue, color: analysing ? C.muted : "#fff", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              {analysing ? <><Spin size={12} />Analysing…</> : <><Sparkles size={13} />AI Analyse ({submissions.length})</>}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 20, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 3, width: "fit-content" }}>
        {[{ id: "collect", label: "Collect Feedback" }, { id: "analyse", label: `AI Analysis${analysis ? " ✅" : ""}` }, { id: "report", label: "Report" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "6px 16px", borderRadius: 6, border: "none", background: tab === t.id ? C.raised : "transparent", color: tab === t.id ? C.text : C.muted, fontSize: 13, fontWeight: tab === t.id ? 500 : 400, cursor: "pointer" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* COLLECT TAB */}
      {tab === "collect" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            {!feedbackForm ? (
              <div style={{ background: C.card, borderRadius: 10, border: `1px dashed ${C.border}`, padding: 32, textAlign: "center" }}>
                <ClipboardList size={40} color={C.muted} strokeWidth={1} style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 15, fontWeight: 500, color: C.text, marginBottom: 8 }}>No feedback form yet</div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Create a pre-built NPS + feedback form for {activeEvent?.name}</div>
                <button onClick={createFeedbackForm} disabled={sending}
                  style={{ padding: "10px 24px", borderRadius: 7, border: "none", background: C.blue, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                  {sending ? "Creating…" : "Create Feedback Form"}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 4 }}>{feedbackForm.name}</div>
                  <div style={{ fontSize: 12, color: C.green, marginBottom: 14 }}>✅ {feedbackForm.fields?.length} questions · Active</div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Share link</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", fontSize: 11, color: C.sec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shareLink}</div>
                    <button onClick={() => { navigator.clipboard?.writeText(shareLink); fire("Link copied!"); }}
                      style={{ padding: "8px 14px", background: C.blue, color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>Copy</button>
                  </div>
                  <div style={{ marginTop: 12, fontSize: 12, color: C.muted }}>
                    💡 Display this link on screens at the end of the event, and include it in your Thank You email.
                  </div>
                </div>
                <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 18 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: C.blue, marginBottom: 4 }}>{submissions.length}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Responses received</div>
                  {submissions.length > 0 && (
                    <button onClick={analyseWithAI} disabled={analysing}
                      style={{ marginTop: 12, width: "100%", padding: "9px", borderRadius: 6, border: "none", background: C.blue, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                      {analysing ? "Analysing with AI…" : "Analyse with AI →"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Embed code */}
          {feedbackForm && (
            <Sec label="Email template — Thank You with feedback link">
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Copy this into your Thank You email to collect feedback automatically.</div>
              <div style={{ background: C.bg, borderRadius: 7, border: `1px solid ${C.border}`, padding: 12, fontSize: 12, color: C.teal, fontFamily: "monospace", lineHeight: 1.7, marginBottom: 10 }}>
                {`<a href="${shareLink}" style="display:inline-block;padding:12px 28px;background:#0A84FF;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Share Your Feedback →</a>`}
              </div>
              <button onClick={() => { navigator.clipboard?.writeText(`<a href="${shareLink}" style="display:inline-block;padding:12px 28px;background:#0A84FF;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Share Your Feedback →</a>`); fire("Embed code copied!"); }}
                style={{ width: "100%", padding: "8px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, cursor: "pointer" }}>Copy embed code</button>
            </Sec>
          )}
        </div>
      )}

      {/* ANALYSE TAB */}
      {tab === "analyse" && (
        !analysis ? (
          <div style={{ background: C.card, borderRadius: 10, border: `1px dashed ${C.border}`, padding: 48, textAlign: "center", color: C.muted }}>
            <Sparkles size={36} strokeWidth={1} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14 }}>Collect responses first, then click "AI Analyse"</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Score cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {[
                { label: "NPS Score", val: `${analysis.nps}/10`, color: npsColor, note: analysis.nps >= 8 ? "Excellent" : analysis.nps >= 6 ? "Good" : "Needs work" },
                { label: "Overall Rating", val: `${analysis.overall_rating}/5`, color: ratingColor, note: "★".repeat(Math.round(analysis.overall_rating)) },
                { label: "Would Attend Again", val: `${analysis.would_attend_again}%`, color: C.green, note: `${submissions.length} responses` },
                { label: "Sentiment", val: analysis.sentiment, color: analysis.sentiment === "positive" ? C.green : analysis.sentiment === "neutral" ? C.amber : C.red, note: "" },
              ].map(s => (
                <div key={s.label} style={{ background: C.card, borderRadius: 10, padding: "16px", border: `1px solid ${C.border}`, borderTop: `2px solid ${s.color}40`, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: "-0.5px", textTransform: "capitalize" }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{s.note}</div>
                </div>
              ))}
            </div>

            {/* Analysis cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.green, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>✅ What Worked Well</div>
                {analysis.top_positives?.map((p, i) => (
                  <div key={i} style={{ fontSize: 13, color: C.sec, padding: "6px 0", borderBottom: i < analysis.top_positives.length - 1 ? `1px solid ${C.border}` : undefined }}>
                    • {p}
                  </div>
                ))}
              </div>
              <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.amber, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>⚠️ Areas to Improve</div>
                {analysis.top_improvements?.map((p, i) => (
                  <div key={i} style={{ fontSize: 13, color: C.sec, padding: "6px 0", borderBottom: i < analysis.top_improvements.length - 1 ? `1px solid ${C.border}` : undefined }}>
                    • {p}
                  </div>
                ))}
              </div>
            </div>

            {/* Quotes & actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.teal, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>💬 Attendee Quotes</div>
                {analysis.key_quotes?.map((q, i) => (
                  <div key={i} style={{ fontSize: 13, color: C.sec, fontStyle: "italic", padding: "8px 12px", borderLeft: `3px solid ${C.teal}`, background: `${C.teal}08`, borderRadius: "0 6px 6px 0", marginBottom: 8 }}>
                    "{q}"
                  </div>
                ))}
              </div>
              <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.blue, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>🎯 Recommended Actions</div>
                {analysis.recommendations?.map((r, i) => (
                  <div key={i} style={{ fontSize: 13, color: C.sec, padding: "6px 0", borderBottom: i < analysis.recommendations.length - 1 ? `1px solid ${C.border}` : undefined }}>
                    {i + 1}. {r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* REPORT TAB */}
      {tab === "report" && (
        <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 24 }}>
          {!analysis ? (
            <div style={{ textAlign: "center", color: C.muted, padding: 32 }}>
              Run AI Analysis first to generate the report
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Post-Event Feedback Report</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{activeEvent?.name} · {submissions.length} responses</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                <button onClick={async () => {
                  fire("Generating AI executive debrief…");
                  const res = await fetch("https://api.anthropic.com/v1/messages", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      model: "claude-sonnet-4-20250514", max_tokens: 1200,
                      messages: [{ role: "user", content: "Write a professional 400-word executive debrief for " + (activeEvent?.name||"this event") + "\n\nData: NPS=" + analysis.nps + "/10, Rating=" + analysis.overall_rating + "/5, Would attend again=" + analysis.would_attend_again + "%, Responses=" + submissions.length + "\nPositives: " + (analysis.top_positives||[]).join(", ") + "\nImprovements: " + (analysis.top_improvements||[]).join(", ") + "\nQuotes: " + (analysis.key_quotes||[]).join(" | ") + "\n\nInclude: Executive Summary, KPIs, What Worked, Improvements, Next Steps. Professional tone for CMO/MD." }]
                    })
                  }).then(r => r.json()).catch(() => null);
                  const text = res?.content?.[0]?.text || "Generation failed";
                  navigator.clipboard?.writeText(text);
                  fire("📋 AI Executive Debrief copied to clipboard!");
                }} style={{ padding: "8px 16px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles size={12} />AI Debrief
                </button><button onClick={copyReport}
                  style={{ padding: "8px 18px", borderRadius: 7, border: "none", background: C.blue, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                  📋 Copy Full Report
                </button></div>
              </div>
              <div style={{ background: C.bg, borderRadius: 8, padding: 20, border: `1px solid ${C.border}`, fontFamily: "monospace", fontSize: 12, color: C.sec, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
{`POST-EVENT FEEDBACK REPORT
${activeEvent?.name}
${"=".repeat(40)}

EXECUTIVE SUMMARY
${analysis.summary}

KEY METRICS
• NPS Score: ${analysis.nps}/10  
• Overall Rating: ${analysis.overall_rating}/5 ⭐
• Would attend again: ${analysis.would_attend_again}%
• Total responses: ${submissions.length}

TOP POSITIVES
${analysis.top_positives?.map(p => `✅ ${p}`).join("\n")}

AREAS FOR IMPROVEMENT  
${analysis.top_improvements?.map(p => `⚠️ ${p}`).join("\n")}

ATTENDEE QUOTES
${analysis.key_quotes?.map(q => `"${q}"`).join("\n")}

RECOMMENDED ACTIONS
${analysis.recommendations?.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Generated by evara`}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── FEEDBACK VIEW ────────────────────────────────────────────

// ─── PUBLIC LANDING PAGE ─────────────────────────────────────
function PublicLandingPage({ slug }) {
  const [page, setPage] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  useEffect(() => {
    supabase.from("landing_pages").select("*, events(*)").eq("slug", slug).maybeSingle()
      .then(({ data }) => {
        if (data) { setPage(data); setEvent(data.events); }
        setLoading(false);
      });
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial,sans-serif", background: "#f4f4f4" }}>
      <div style={{ fontSize: 14, color: "#999" }}>Loading…</div>
    </div>
  );

  if (!page) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial,sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <h1 style={{ fontSize: 20, color: "#111" }}>Page not found</h1>
        <p style={{ color: "#999", marginTop: 8 }}>This event page doesn't exist or has been removed.</p>
      </div>
    </div>
  );

  const bg = page.template === "bold" ? "#0d0d1a" : page.template === "corporate" ? "#0A1628" : "#ffffff";
  const fg = page.template === "minimal" ? "#111" : "#ffffff";
  const accent = page.brand_color || "#0A84FF";
  const eventDate = event?.event_date ? new Date(event.event_date).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";
  const regUrl = page.reg_url || "#register";

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "Arial,Helvetica,sans-serif" }}>
      {/* Hero */}
      <div style={{ background: page.template === "minimal" ? "#f8f9fa" : "linear-gradient(135deg, #0A1628, #1a2a4a)", padding: "80px 24px 60px", textAlign: "center" }}>
        {page.logo_url && <img src={page.logo_url} alt="logo" style={{ height: 48, marginBottom: 24, objectFit: "contain" }} />}
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: page.template === "minimal" ? "#999" : "rgba(255,255,255,0.5)", marginBottom: 16 }}>
          {event?.location || ""}
        </div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 56px)", fontWeight: 800, color: page.template === "minimal" ? "#111" : "#fff", lineHeight: 1.15, margin: "0 auto 16px", maxWidth: 800 }}>
          {page.headline || event?.name || "Event"}
        </h1>
        <p style={{ fontSize: 18, color: page.template === "minimal" ? "#555" : "rgba(255,255,255,0.7)", maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.6 }}>
          {page.subheadline || event?.description || ""}
        </p>
        {eventDate && (
          <div style={{ display: "inline-flex", gap: 24, background: page.template === "minimal" ? "#fff" : "rgba(255,255,255,0.1)", borderRadius: 12, padding: "16px 32px", marginBottom: 32, flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ fontSize: 14, color: page.template === "minimal" ? "#333" : "#fff" }}>📅 {eventDate}</span>
            {event?.location && <span style={{ fontSize: 14, color: page.template === "minimal" ? "#333" : "#fff" }}>📍 {event.location}</span>}
          </div>
        )}
        <a href={regUrl} style={{ display: "inline-block", padding: "16px 48px", background: accent, color: "#fff", textDecoration: "none", borderRadius: 10, fontSize: 17, fontWeight: 700, boxShadow: `0 8px 32px ${accent}60` }}>
          {page.cta_text || "Register Now"} →
        </a>
      </div>

      {/* About section */}
      {(page.about_text || event?.description) && (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: fg, marginBottom: 16 }}>About this event</h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: page.template === "minimal" ? "#555" : "rgba(255,255,255,0.75)" }}>
            {page.about_text || event?.description}
          </p>
        </div>
      )}

      {/* Second CTA */}
      <div style={{ textAlign: "center", padding: "32px 24px 64px" }}>
        <a href={regUrl} style={{ display: "inline-block", padding: "14px 40px", background: accent, color: "#fff", textDecoration: "none", borderRadius: 8, fontSize: 15, fontWeight: 600 }}>
          {page.cta_text || "Register Now"} →
        </a>
      </div>

      <div style={{ borderTop: `1px solid ${page.template === "minimal" ? "#eee" : "rgba(255,255,255,0.1)"}`, padding: "20px 24px", textAlign: "center" }}>
        <span style={{ fontSize: 11, color: page.template === "minimal" ? "#bbb" : "rgba(255,255,255,0.3)" }}>Powered by evara · evarahq.com</span>
      </div>
    </div>
  );
}

// ─── PRICING / WAITLIST PAGE ─────────────────────────────────
function PricingPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const PLANS = [
    { name: "Starter", price: "$49", period: "/mo", desc: "For small businesses running 1–2 events per month", color: "#0A84FF", features: ["Up to 500 contacts", "3 email templates per type", "AI email generation", "Registration forms", "Basic analytics", "Email support"] },
    { name: "Growth", price: "$199", period: "/mo", desc: "For SMBs managing 3–10 events", color: "#30D158", badge: "Most Popular", features: ["Up to 5,000 contacts", "Unlimited email drafts", "AI drip campaigns", "Landing page builder", "Advanced analytics + ROI", "Priority support", "Custom export formats"] },
    { name: "Pro", price: "$599", period: "/mo", desc: "For agencies managing multiple clients", color: "#FF9F0A", features: ["Unlimited contacts", "Multi-client / white-label", "Brand kit per client", "Salesforce export", "Team access & roles", "Dedicated onboarding", "SLA support"] },
  ];

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) return;
    setSubmitting(true);
    try {
      await supabase.from("waitlist").insert({ email, name, company, created_at: new Date().toISOString() });
    } catch {}
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "Arial,Helvetica,sans-serif", color: "#fff" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "#0A84FF", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>e</div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>evara</span>
          <span style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 4, color: "rgba(255,255,255,0.5)", marginLeft: 4 }}>BETA</span>
        </div>
        <a href="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>← Back to app</a>
      </div>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "72px 24px 48px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "#0A84FF", marginBottom: 16 }}>Simple Pricing</div>
        <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 800, margin: "0 0 16px", letterSpacing: "-1px", lineHeight: 1.1 }}>
          Replace 6 tools with one.
        </h1>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", maxWidth: 520, margin: "0 auto 48px", lineHeight: 1.6 }}>
          Mailchimp + Eventbrite + Typeform + Unbounce + Zapier + reporting — all in evara, at a fraction of the cost.
        </p>

        {/* Plans */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", maxWidth: 1000, margin: "0 auto 80px" }}>
          {PLANS.map((plan, i) => (
            <div key={plan.name} style={{ background: i === 1 ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${i === 1 ? plan.color + "40" : "rgba(255,255,255,0.1)"}`, borderRadius: 16, padding: "28px 24px", width: 280, textAlign: "left", position: "relative", flexShrink: 0 }}>
              {plan.badge && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: plan.color, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 999, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>{plan.badge}</div>}
              <div style={{ fontSize: 12, fontWeight: 600, color: plan.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{plan.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 6 }}>
                <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-1px" }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>{plan.period}</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 20, lineHeight: 1.5 }}>{plan.desc}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
                    <span style={{ color: plan.color, fontSize: 14, flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <a href="#waitlist" onClick={e => { e.preventDefault(); document.getElementById("waitlist-email")?.focus(); }}
                style={{ display: "block", textAlign: "center", padding: "11px", background: i === 1 ? plan.color : "transparent", border: `1px solid ${i === 1 ? "transparent" : "rgba(255,255,255,0.2)"}`, borderRadius: 8, color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Join Waitlist →
              </a>
            </div>
          ))}
        </div>

        {/* Waitlist CTA */}
        <div id="waitlist" style={{ maxWidth: 480, margin: "0 auto", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "36px 32px" }}>
          {submitted ? (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>You're on the list!</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>We'll be in touch soon with early access. You'll be one of the first to know when we launch.</p>
            </>
          ) : (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#0A84FF", marginBottom: 10 }}>Early Access</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Join the waitlist</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 24, lineHeight: 1.6 }}>Get early access + 3 months free on any plan when we launch.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input id="waitlist-name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", padding: "11px 14px", fontSize: 14, outline: "none" }} />
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", padding: "11px 14px", fontSize: 14, outline: "none" }} />
                <input id="waitlist-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Work email" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", padding: "11px 14px", fontSize: 14, outline: "none" }} />
                <button onClick={handleSubmit} disabled={submitting || !email}
                  style={{ padding: "13px", background: submitting ? "rgba(10,132,255,0.5)" : "#0A84FF", border: "none", borderRadius: 8, color: "#fff", fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer" }}>
                  {submitting ? "Joining…" : "Request Early Access →"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Social proof */}
        <div style={{ marginTop: 64, padding: "0 24px" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", marginBottom: 24 }}>Replacing tools that cost</p>
          <div style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
            {[["Mailchimp", "$350"], ["Eventbrite", "$299"], ["Typeform", "$99"], ["Zapier", "$200"], ["Unbounce", "$200"]].map(([tool, cost]) => (
              <div key={tool} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "line-through" }}>{cost}/mo</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>{tool}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, fontSize: 13, color: "rgba(255,255,255,0.3)" }}>= $1,148/month → replaced by evara from $49/month</div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 32px", textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
        © {new Date().getFullYear()} evara · evarahq.com · hello@evarahq.com
      </div>
    </div>
  );
}

// ─── UNSUBSCRIBE PAGE ─────────────────────────────────────────
function UnsubscribePage() {
  const [status, setStatus] = useState("idle");
  const [email, setEmail] = useState("");
  const params = new URLSearchParams(window.location.search);
  useEffect(() => { const e = params.get("email"); if (e) setEmail(e); }, []);

  const doUnsubscribe = async () => {
    if (!email) return;
    setStatus("loading");
    try {
      const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
      const sb = createClient("https://sqddpjsgtwblmkgxqyxe.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZGRwanNndHdibG1rZ3hxeXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODk5NTAsImV4cCI6MjA4OTY2NTk1MH0.x5BOfQRzn-F_tvUJv3mHRmfdOZiklyMkGzmPfRYoII4");
      await sb.from("contacts").update({ unsubscribed: true, unsubscribed_at: new Date().toISOString() }).eq("email", email.toLowerCase().trim());
      setStatus("done");
    } catch { setStatus("error"); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f4", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial,sans-serif", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "48px 40px", maxWidth: 440, width: "100%", textAlign: "center", boxShadow: "0 4px 32px rgba(0,0,0,0.08)" }}>
        {status === "done" ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 8 }}>You've been unsubscribed</h1>
            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}><strong>{email}</strong> will receive no further event emails from us.</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 8 }}>Unsubscribe</h1>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 24, lineHeight: 1.6 }}>You'll be removed from all future event emails.</p>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address"
              style={{ width: "100%", padding: "11px 14px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
            <button onClick={doUnsubscribe} disabled={status === "loading" || !email}
              style={{ width: "100%", padding: 12, background: status === "loading" ? "#eee" : "#111", color: status === "loading" ? "#999" : "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: status === "loading" ? "not-allowed" : "pointer" }}>
              {status === "loading" ? "Unsubscribing…" : "Unsubscribe me"}
            </button>
            {status === "error" && <p style={{ fontSize: 12, color: "#FF3B30", marginTop: 8 }}>Something went wrong. Please try again.</p>}
            <p style={{ fontSize: 11, color: "#aaa", marginTop: 20 }}>Powered by <strong>evara</strong></p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── PUBLIC FORM PAGE ─────────────────────────────────────────
// Rendered when someone visits /form/:token — no auth required
function PublicFormPage({ token }) {
  const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZGRwanNndHdibG1rZ3hxeXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODk5NTAsImV4cCI6MjA4OTY2NTk1MH0.x5BOfQRzn-F_tvUJv3mHRmfdOZiklyMkGzmPfRYoII4";
  const [form, setForm] = useState(null);
  const [event, setEvent] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data: f } = await supabase.from("forms").select("*, events(*)").eq("share_token", token).single();
      if (!f) { setError("Form not found or no longer active."); setLoading(false); return; }
      if (!f.is_active) { setError("This form is no longer accepting responses."); setLoading(false); return; }
      setForm(f);
      setEvent(f.events);
      setLoading(false);
    };
    load();
  }, [token]);

  const submit = async () => {
    if (!form) return;
    
    // Validate business email
    const emailFieldCheck = form.fields?.find(f => f.type === "email");
    const emailValueCheck = answers[emailFieldCheck?.id] || "";
    if (emailValueCheck && !isBusinessEmail(emailValueCheck)) {
      setSubmitError("Please use a business email address. Personal emails (Gmail, Yahoo, Hotmail, Rediffmail, etc.) are not accepted for event registration.");
      return;
    }
    
    setSubmitting(true);
    try {
      const emailField = form.fields?.find(f => f.type === "email");
      const firstField = form.fields?.find(f => f.label?.toLowerCase().includes("first"));
      const lastField = form.fields?.find(f => f.label?.toLowerCase().includes("last"));
      const email = answers[emailField?.id] || "";
      const firstName = answers[firstField?.id] || "";
      const lastName = answers[lastField?.id] || "";

      // Upsert contact
      let contactId = null;
      if (email) {
        const { data: c } = await supabase.from("contacts").upsert({
          email: email.toLowerCase().trim(),
          first_name: firstName,
          last_name: lastName,
          company_id: form.company_id,
          source: "form",
        }, { onConflict: "company_id,email" }).select("id").single();
        contactId = c?.id;

        // Add to event contacts
        if (contactId && form.event_id) {
          await supabase.from("event_contacts").upsert({
            contact_id: contactId,
            event_id: form.event_id,
            company_id: form.company_id,
            status: "confirmed",
          }, { onConflict: "event_id,contact_id" });
        }
      }

      // Save submission
      await supabase.from("form_submissions").insert({
        form_id: form.id,
        event_id: form.event_id,
        company_id: form.company_id,
        contact_id: contactId,
        submitter_email: email,
        responses: answers,
        submitted_at: new Date().toISOString(),
      });

      // Send confirmation email automatically
      if (email && contactId) {
        try {
          await fetch(`${SUPABASE_URL}/functions/v1/send-triggered-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${ANON_KEY}` },
            body: JSON.stringify({
              contacts: [{ email, first_name: firstName, last_name: lastName, unsubscribed: false }],
              triggerType: "confirmation",
              eventName: event?.name || "the event",
              eventDate: event?.event_date ? new Date(event.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "",
              eventTime: event?.event_time || "",
              location: event?.location || "",
              orgName: "evara",
            })
          });
        } catch(e) { console.log("Confirmation email failed:", e.message); }
      }

      setSubmitted(true);
    } catch(e) {
      setError("Submission failed. Please try again.");
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F2F2F7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ fontSize: 14, color: "#666" }}>Loading form…</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#F2F2F7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: 400, padding: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#111", marginBottom: 8 }}>Form unavailable</div>
        <div style={{ fontSize: 14, color: "#666" }}>{error}</div>
      </div>
    </div>
  );

  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "#F2F2F7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: 480, padding: 40, background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 10 }}>You're confirmed!</div>
        <div style={{ fontSize: 15, color: "#666", lineHeight: 1.6, marginBottom: 16 }}>
          Thanks for registering for <strong>{event?.name}</strong>. A confirmation email is on its way to you.
        </div>
        {(event?.event_date || event?.location) && (
          <div style={{ background: "#F8F9FA", borderRadius: 10, padding: "14px 18px", marginBottom: 16, textAlign: "left" }}>
            {event?.event_date && <div style={{ fontSize: 14, color: "#333", marginBottom: 6 }}>📅 {new Date(event.event_date).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>}
            {event?.event_time && <div style={{ fontSize: 14, color: "#333", marginBottom: 6 }}>🕐 {event.event_time}</div>}
            {event?.location && <div style={{ fontSize: 14, color: "#333" }}>📍 {event.location}</div>}
          </div>
        )}
        {event?.location && <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>📍 {event.location}</div>}
        {event && event.event_date && (
          <button onClick={() => {
            const ics = generateICS(event);
            if (!ics) return;
            const blob = new Blob([ics], { type: "text/calendar" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = `${event.name}.ics`; a.click();
          }} style={{ marginTop: 20, padding: "10px 24px", borderRadius: 8, border: "1px solid #0A84FF", background: "transparent", color: "#0A84FF", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            📅 Add to Calendar
          </button>
        )}
        <div style={{ marginTop: 16, fontSize: 12, color: "#aaa" }}>A confirmation email will be sent to you shortly.</div>
        <div style={{ marginTop: 8, fontSize: 11, color: "#ccc" }}>🔒 Powered by evara</div>
      </div>
    </div>
  );

  const requiredIds = form.fields?.filter(f => f.required).map(f => f.id) || [];
  const allFilled = requiredIds.every(id => answers[id]?.toString().trim());

  return (
    <div style={{ minHeight: "100vh", background: "#F2F2F7", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E5EA", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          {event?.name && <div style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>{event.name}</div>}
          {event?.event_date && <div style={{ fontSize: 12, color: "#999" }}>
            {new Date(event.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
            {event.location ? ` · ${event.location}` : ""}
          </div>}
        </div>
        <div style={{ fontSize: 11, color: "#0A84FF", fontWeight: 600, letterSpacing: "0.5px" }}>evara</div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px 60px" }}>
        {event && (
          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #E5E5E5" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#0A84FF", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Registration</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111", marginBottom: 8, letterSpacing: "-0.5px" }}>{event.name}</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {event.event_date && <div style={{ fontSize: 13, color: "#555" }}>📅 {new Date(event.event_date).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>}
              {event.event_time && <div style={{ fontSize: 13, color: "#555" }}>🕐 {event.event_time}</div>}
              {event.location && <div style={{ fontSize: 13, color: "#555" }}>📍 {event.location}</div>}
            </div>
          </div>
        )}
        <h2 style={{ fontSize: 17, fontWeight: 600, color: "#111", marginBottom: 4, letterSpacing: "-0.3px" }}>{form.name}</h2>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 24 }}>Fill in your details to register your place.</p>

        {form.fields?.map(field => (
          <div key={field.id} style={{ marginBottom: 20 }}>
            {field.type !== "checkbox" && (
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#111", marginBottom: 7 }}>
                {field.label}
                {field.required && <span style={{ color: "#0A84FF", marginLeft: 3 }}>*</span>}
              </label>
            )}
            {(field.type === "text" || field.type === "email" || field.type === "phone") && (<>
              <input
                type={field.type}
                value={answers[field.id] || ""}
                onChange={e => setAnswers(p => ({ ...p, [field.id]: e.target.value }))}
                placeholder={`Enter ${field.label.toLowerCase()}…`}
                style={{ width: "100%", height: 44, borderRadius: 10, border: "1.5px solid #D1D1D6", padding: "0 14px", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border-color .15s" }}
                onFocus={e => { e.target.style.borderColor = "#0A84FF"; setSubmitError(""); }}
                onBlur={e => e.target.style.borderColor = "#D1D1D6"}
              />
              {field.type === "email" && answers[field.id]?.includes("@") && !isBusinessEmail(answers[field.id]) && (
                <div style={{ fontSize: 12, color: "#FF453A", marginTop: 5 }}>
                  ⚠️ Personal emails (Gmail, Yahoo, Hotmail, Rediffmail etc.) are not accepted — use your work email
                </div>
              )}
              {field.type === "email" && answers[field.id]?.includes("@") && isBusinessEmail(answers[field.id]) && (
                <div style={{ fontSize: 12, color: "#30D158", marginTop: 5 }}>✅ Business email accepted</div>
              )}
            </>)}
            {field.type === "textarea" && (
              <textarea
                value={answers[field.id] || ""}
                onChange={e => setAnswers(p => ({ ...p, [field.id]: e.target.value }))}
                placeholder="Type your response…"
                rows={3}
                style={{ width: "100%", borderRadius: 10, border: "1.5px solid #D1D1D6", padding: "10px 14px", fontSize: 15, outline: "none", resize: "vertical", lineHeight: 1.5, boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "#0A84FF"}
                onBlur={e => e.target.style.borderColor = "#D1D1D6"}
              />
            )}
            {field.type === "radio" && (field.options || []).map(opt => (
              <label key={opt} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, cursor: "pointer", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${answers[field.id] === opt ? "#0A84FF" : "#D1D1D6"}`, background: answers[field.id] === opt ? "#F0F7FF" : "#fff", transition: "all .12s" }}
                onClick={() => setAnswers(p => ({ ...p, [field.id]: opt }))}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${answers[field.id] === opt ? "#0A84FF" : "#C7C7CC"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {answers[field.id] === opt && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0A84FF" }} />}
                </div>
                <span style={{ fontSize: 14, color: "#333" }}>{opt}</span>
              </label>
            ))}
            {field.type === "select" && (
              <select value={answers[field.id] || ""} onChange={e => setAnswers(p => ({ ...p, [field.id]: e.target.value }))}
                style={{ width: "100%", height: 44, borderRadius: 10, border: "1.5px solid #D1D1D6", padding: "0 14px", fontSize: 15, outline: "none", background: "#fff", cursor: "pointer", boxSizing: "border-box" }}>
                <option value="">Select…</option>
                {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
            {field.type === "checkbox" && (
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}
                onClick={() => setAnswers(p => ({ ...p, [field.id]: !p[field.id] }))}>
                <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${answers[field.id] ? "#0A84FF" : "#C7C7CC"}`, background: answers[field.id] ? "#0A84FF" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all .12s" }}>
                  {answers[field.id] && <span style={{ color: "#fff", fontSize: 13, lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{ fontSize: 14, color: "#333", lineHeight: 1.5 }}>
                  {field.label}
                  {field.required && <span style={{ color: "#0A84FF", marginLeft: 3 }}>*</span>}
                </span>
              </label>
            )}
          </div>
        ))}

        <button onClick={submit} disabled={submitting || !allFilled}
          style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: submitting || !allFilled ? "#C7C7CC" : "#0A84FF", color: "#fff", fontSize: 16, fontWeight: 600, cursor: submitting || !allFilled ? "not-allowed" : "pointer", marginTop: 8, transition: "background .15s" }}>
          {submitting ? <><span style={{ display: "inline-block", animation: "spin 1s linear infinite", marginRight: 6 }}>⟳</span>Submitting…</> : allFilled ? "Register Now →" : "Complete all required fields"}
        </button>

        {submitError && (
          <div style={{ background: "#FF453A15", border: "1px solid #FF453A40", borderRadius: 8, padding: "10px 14px", marginTop: 12, fontSize: 13, color: "#FF453A", lineHeight: 1.5 }}>
            ⚠️ {submitError}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#AEAEB2" }}>
          🔒 Your data is encrypted and secure · A confirmation email will be sent to you · Powered by evara
        </div>
      </div>
    </div>
  );
}

// ─── PUBLIC SELF CHECK-IN PAGE ────────────────────────────────
function PublicCheckInPage({ eventId }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [checkedIn, setCheckedIn] = useState(null);
  const [searching, setSearching] = useState(false);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    supabase.from("events").select("*").eq("id", eventId).single()
      .then(({ data }) => setEvent(data));
  }, [eventId]);

  const doSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    const { data } = await supabase.from("event_contacts")
      .select("*,contacts(*)")
      .eq("event_id", eventId)
      .or(`contacts.first_name.ilike.%${search}%,contacts.last_name.ilike.%${search}%,contacts.email.ilike.%${search}%`)
      .limit(5);
    setResults(data || []);
    setSearching(false);
  };

  const checkIn = async (ec) => {
    await supabase.from("event_contacts")
      .update({ status: "attended", attended_at: new Date().toISOString() })
      .eq("id", ec.id);
    setCheckedIn(ec.contacts);
    setResults([]);
    setSearch("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#0A84FF", marginBottom: 8 }}>evara Check-in</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{event?.name || "Event Check-in"}</div>
          {event?.event_date && <div style={{ fontSize: 14, color: "#aaa", marginTop: 6 }}>
            {new Date(event.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
          </div>}
        </div>

        {checkedIn ? (
          <div style={{ textAlign: "center", animation: "fadeUp .3s ease" }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Welcome, {checkedIn.first_name || checkedIn.email}!</div>
            <div style={{ fontSize: 15, color: "#aaa", marginBottom: 32 }}>You&apos;re checked in. Enjoy the event!</div>
            <button onClick={() => setCheckedIn(null)}
              style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: "#1C1C1E", color: "#aaa", fontSize: 14, cursor: "pointer" }}>
              Next Guest
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && doSearch()}
                placeholder="Type your name or email…" autoFocus
                style={{ flex: 1, height: 52, borderRadius: 12, border: "none", background: "#1C1C1E", color: "#fff", padding: "0 16px", fontSize: 16, outline: "none" }} />
              <button onClick={doSearch} disabled={searching}
                style={{ padding: "0 20px", borderRadius: 12, border: "none", background: "#0A84FF", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                {searching ? "…" : "Find"}
              </button>
            </div>

            {results.length > 0 && (
              <div style={{ background: "#1C1C1E", borderRadius: 12, overflow: "hidden" }}>
                {results.map((ec, i) => {
                  const c = ec.contacts || {};
                  const attended = ec.status === "attended";
                  return (
                    <div key={ec.id} style={{ padding: "14px 16px", borderBottom: i < results.length - 1 ? "1px solid #2C2C2E" : undefined, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: attended ? "#1E4D2B" : "#0A84FF20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: attended ? "#30D158" : "#0A84FF", flexShrink: 0 }}>
                        {(c.first_name?.[0] || c.email?.[0] || "?").toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>{`${c.first_name || ""} ${c.last_name || ""}`.trim() || c.email}</div>
                        <div style={{ fontSize: 12, color: "#aaa" }}>{c.company_name || c.email}</div>
                      </div>
                      {attended ? (
                        <span style={{ fontSize: 12, color: "#30D158", background: "#1E4D2B", padding: "4px 10px", borderRadius: 6 }}>Already checked in</span>
                      ) : (
                        <button onClick={() => checkIn(ec)}
                          style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#30D158", color: "#000", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                          Check In
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {results.length === 0 && search && !searching && (
              <div style={{ textAlign: "center", color: "#666", fontSize: 14, padding: 24 }}>
                No guest found. Please check with the event team.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── EVENT CALENDAR VIEW ──────────────────────────────────────
function CalendarView({ supabase, profile, events, setActiveEvent, setView, fire }) {
  const [month, setMonth] = useState(new Date());
  const [hoveredEvent, setHoveredEvent] = useState(null);

  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const startDay = monthStart.getDay(); // 0=Sun

  // Build calendar grid
  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= monthEnd.getDate(); d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);

  const eventsThisMonth = (events || []).filter(e => {
    if (!e.event_date) return false;
    const d = new Date(e.event_date);
    return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
  });

  const eventsByDay = {};
  eventsThisMonth.forEach(e => {
    const day = new Date(e.event_date).getDate();
    if (!eventsByDay[day]) eventsByDay[day] = [];
    eventsByDay[day].push(e);
  });

  const today = new Date();
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const upcomingEvents = (events || [])
    .filter(e => e.event_date && new Date(e.event_date) >= today)
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
    .slice(0, 5);

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: C.text, letterSpacing: "-0.6px" }}>Event Calendar</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>All your events across time — click to switch active event.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16 }}>
        {/* Calendar */}
        <div style={{ background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          {/* Month header */}
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, cursor: "pointer", padding: "4px 10px", fontSize: 16 }}>‹</button>
            <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{MONTHS[month.getMonth()]} {month.getFullYear()}</span>
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, cursor: "pointer", padding: "4px 10px", fontSize: 16 }}>›</button>
          </div>
          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${C.border}` }}>
            {DAYS.map(d => <div key={d} style={{ padding: "8px 0", textAlign: "center", fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{d}</div>)}
          </div>
          {/* Calendar grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {days.map((day, i) => {
              const isToday = day && today.getDate() === day && today.getMonth() === month.getMonth() && today.getFullYear() === month.getFullYear();
              const dayEvents = day ? (eventsByDay[day] || []) : [];
              return (
                <div key={i} style={{ minHeight: 72, borderRight: i % 7 !== 6 ? `1px solid ${C.border}` : undefined, borderBottom: i < days.length - 7 ? `1px solid ${C.border}` : undefined, padding: "6px 8px", background: !day ? `${C.bg}80` : "transparent" }}>
                  {day && (
                    <>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: isToday ? C.blue : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? "#fff" : C.muted, marginBottom: 4 }}>{day}</div>
                      {dayEvents.map(ev => (
                        <div key={ev.id} onClick={() => { setActiveEvent(ev); setView("dashboard"); fire(`Switched to ${ev.name}`); }}
                          title={ev.name}
                          style={{ fontSize: 10, fontWeight: 500, color: "#fff", background: C.blue, borderRadius: 3, padding: "2px 5px", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer", opacity: 0.9 }}>
                          {ev.name}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar — upcoming events */}
        <div>
          <Sec label="Upcoming events">
            {upcomingEvents.length === 0 ? (
              <div style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: 20 }}>No upcoming events</div>
            ) : upcomingEvents.map(ev => {
              const d = new Date(ev.event_date);
              const daysUntil = Math.ceil((d - today) / (1000*60*60*24));
              const color = daysUntil <= 3 ? C.red : daysUntil <= 14 ? C.amber : C.green;
              return (
                <div key={ev.id} onClick={() => { setActiveEvent(ev); setView("dashboard"); fire(`Switched to ${ev.name}`); }}
                  style={{ padding: "11px 12px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 8, cursor: "pointer", transition: "border-color .12s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.blue}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 4 }}>{ev.name}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: C.muted }}>{d.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color, background: color + "15", padding: "2px 6px", borderRadius: 3 }}>
                      {daysUntil === 0 ? "TODAY" : daysUntil === 1 ? "TOMORROW" : `${daysUntil}d`}
                    </span>
                  </div>
                </div>
              );
            })}
          </Sec>
          <Sec label="All events">
            {(events || []).map(ev => (
              <div key={ev.id} onClick={() => { setActiveEvent(ev); setView("dashboard"); }}
                style={{ padding: "8px 10px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}`, marginBottom: 6, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.blue}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{ev.name}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{ev.event_date ? new Date(ev.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "No date"}</div>
                </div>
                <span style={{ fontSize: 10, color: ev.status === "draft" ? C.muted : C.green, background: ev.status === "draft" ? C.raised : C.green + "15", padding: "2px 6px", borderRadius: 3, textTransform: "capitalize" }}>{ev.status}</span>
              </div>
            ))}
          </Sec>
          
          {/* AI Calendar Intelligence */}
          {(() => {
            const warnings = [];
            const sorted = (events||[]).filter(e => e.event_date).sort((a,b) => new Date(a.event_date) - new Date(b.event_date));
            for (let i = 0; i < sorted.length - 1; i++) {
              const a = new Date(sorted[i].event_date);
              const b = new Date(sorted[i+1].event_date);
              const daysBetween = Math.ceil((b - a) / 86400000);
              if (daysBetween <= 7) {
                warnings.push({ type: "overlap", msg: `"${sorted[i].name}" and "${sorted[i+1].name}" are only ${daysBetween} day(s) apart — contacts may receive too many emails` });
              }
            }
            if (!warnings.length) return null;
            return (
              <div style={{ background: C.card, borderRadius: 9, border: `1px solid ${C.amber}30`, padding: 14, marginTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.amber, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>⚠️ Calendar Intelligence</div>
                {warnings.map((w, i) => (
                  <div key={i} style={{ fontSize: 12, color: C.sec, marginBottom: 6, lineHeight: 1.5 }}>• {w.msg}</div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─── EVENT CALENDAR VIEW ──────────────────────────────────────

// ─── SEATING VIEW ────────────────────────────────────────────
function SeatingView({ supabase, profile, activeEvent, fire }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [layout, setLayout] = useState({ tables: 8, seatsPerTable: 10 });
  const [assignments, setAssignments] = useState({});
  const [dragOver, setDragOver] = useState(null);

  useEffect(() => {
    if (!activeEvent || !profile) return;
    supabase.from("event_contacts")
      .select("*,contacts(*)")
      .eq("event_id", activeEvent.id)
      .in("status", ["confirmed", "attended"])
      .order("created_at")
      .then(({ data }) => {
        const rows = data || [];
        setContacts(rows);
        // Load existing seat assignments
        const existing = {};
        rows.forEach(ec => {
          if (ec.seat_number) existing[ec.id] = ec.seat_number;
        });
        setAssignments(existing);
        setLoading(false);
      });
  }, [activeEvent, profile]);

  const autoAssign = async () => {
    if (!contacts.length) { fire("No confirmed contacts to seat", "err"); return; }
    setAssigning(true);
    const newAssignments = {};
    contacts.forEach((ec, i) => {
      const table = Math.floor(i / layout.seatsPerTable) + 1;
      const seat = (i % layout.seatsPerTable) + 1;
      newAssignments[ec.id] = `T${table}-${seat}`;
    });
    setAssignments(newAssignments);
    // Save to DB
    for (const [ecId, seat] of Object.entries(newAssignments)) {
      await supabase.from("event_contacts").update({ seat_number: seat }).eq("id", ecId);
    }
    fire(`✅ ${contacts.length} guests auto-assigned to ${layout.tables} tables`);
    setAssigning(false);
  };

  const copyChart = () => {
    const lines = [`SEATING CHART — ${activeEvent?.name}`, "=".repeat(40)];
    for (let t = 1; t <= layout.tables; t++) {
      const tableGuests = contacts.filter(ec => assignments[ec.id]?.startsWith(`T${t}-`));
      if (!tableGuests.length) continue;
      lines.push(`\nTABLE ${t}`);
      tableGuests.forEach(ec => {
        const c = ec.contacts || {};
        lines.push(`  ${assignments[ec.id]?.split("-")[1] || "?"}: ${`${c.first_name || ""} ${c.last_name || ""}`.trim() || c.email} ${c.company_name ? `(${c.company_name})` : ""}`);
      });
    }
    navigator.clipboard?.writeText(lines.join("\n"));
    fire("Seating chart copied to clipboard!");
  };

  const unassigned = contacts.filter(ec => !assignments[ec.id]);
  const totalTables = Math.ceil(contacts.length / layout.seatsPerTable);

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: C.text, letterSpacing: "-0.6px" }}>Seating Planner</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Auto-assign seats for confirmed guests. {contacts.length} confirmed attendees.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={copyChart} disabled={Object.keys(assignments).length === 0}
            style={{ fontSize: 13, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
            📋 Copy Chart
          </button>
          <button onClick={autoAssign} disabled={assigning || loading}
            style={{ fontSize: 13, padding: "7px 16px", borderRadius: 7, border: "none", background: assigning ? C.raised : C.blue, color: assigning ? C.muted : "#fff", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            {assigning ? <><Spin size={12} />Assigning…</> : <><Sparkles size={13} />Auto-Assign Seats</>}
          </button>
        </div>
      </div>

      {/* Config */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {[{ label: "Tables", key: "tables", min: 1, max: 50 }, { label: "Seats per table", key: "seatsPerTable", min: 2, max: 20 }].map(f => (
          <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px" }}>
            <span style={{ fontSize: 12, color: C.muted }}>{f.label}:</span>
            <input type="number" value={layout[f.key]} min={f.min} max={f.max}
              onChange={e => setLayout(p => ({ ...p, [f.key]: parseInt(e.target.value) || f.min }))}
              style={{ width: 50, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "4px 6px", fontSize: 13, outline: "none", textAlign: "center" }} />
          </div>
        ))}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: C.muted }}>Capacity:</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{layout.tables * layout.seatsPerTable}</span>
          {contacts.length > layout.tables * layout.seatsPerTable && (
            <span style={{ fontSize: 11, color: C.red }}>⚠ Overflow: need {contacts.length - layout.tables * layout.seatsPerTable} more seats</span>
          )}
        </div>
        {unassigned.length > 0 && (
          <div style={{ background: C.amber + "14", border: `1px solid ${C.amber}30`, borderRadius: 8, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: C.amber }}>{unassigned.length} unassigned</span>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><Spin />Loading guests…</div>
      ) : contacts.length === 0 ? (
        <div style={{ background: C.card, borderRadius: 10, border: `1px dashed ${C.border}`, padding: 60, textAlign: "center", color: C.muted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🪑</div>
          <div style={{ fontSize: 14 }}>No confirmed guests yet</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Guests with status "confirmed" or "attended" appear here</div>
        </div>
      ) : (
        /* Table grid */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {Array.from({ length: totalTables }, (_, ti) => {
            const tableNum = ti + 1;
            const tableGuests = contacts.filter(ec => assignments[ec.id]?.startsWith(`T${tableNum}-`));
            return (
              <div key={tableNum} style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.raised }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Table {tableNum}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>{tableGuests.length}/{layout.seatsPerTable} seats</span>
                </div>
                <div style={{ padding: "8px 0" }}>
                  {tableGuests.length === 0 ? (
                    <div style={{ padding: "12px 14px", fontSize: 12, color: C.muted, fontStyle: "italic", textAlign: "center" }}>Empty</div>
                  ) : tableGuests.map(ec => {
                    const c = ec.contacts || {};
                    const seat = assignments[ec.id];
                    return (
                      <div key={ec.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 14px", borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${C.blue}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: C.blue, flexShrink: 0 }}>
                          {seat?.split("-")[1] || "?"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {`${c.first_name || ""} ${c.last_name || ""}`.trim() || c.email}
                          </div>
                          {c.company_name && <div style={{ fontSize: 10, color: C.muted }}>{c.company_name}</div>}
                        </div>
                        <button onClick={async () => {
                          const newSeat = window.prompt(`Reassign seat for ${c.first_name || c.email}:`, seat);
                          if (newSeat && newSeat !== seat) {
                            await supabase.from("event_contacts").update({ seat_number: newSeat }).eq("id", ec.id);
                            setAssignments(p => ({ ...p, [ec.id]: newSeat }));
                            fire("Seat updated");
                          }
                        }} style={{ fontSize: 10, padding: "2px 7px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4, color: C.muted, cursor: "pointer" }}>Edit</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── LIVE Q&A / POLLING VIEW ─────────────────────────────────
function QAView({ supabase, profile, activeEvent, fire }) {
  const [questions, setQuestions] = useState([]);
  const [polls, setPolls] = useState([]);
  const [tab, setTab] = useState("qa");
  const [newPollQ, setNewPollQ] = useState("");
  const [newPollOpts, setNewPollOpts] = useState(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [activePoll, setActivePoll] = useState(null);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (!activeEvent) return;
    setShareUrl(`${window.location.hostname === "localhost" ? "https://evara-tau.vercel.app" : window.location.origin}/checkin/${activeEvent.id}`);
    // Load Q&A from DB - stored as contact_activity
    supabase.from("contact_activity")
      .select("*,contacts(*)")
      .eq("event_id", activeEvent.id)
      .eq("activity_type", "question_submitted")
      .order("created_at", { ascending: false })
      .then(({ data }) => setQuestions(data || []));
  }, [activeEvent]);

  // Simulated poll results (since we don't have real-time infra wired)
  const createPoll = async () => {
    if (!newPollQ.trim()) { fire("Enter a poll question", "err"); return; }
    const opts = newPollOpts.filter(o => o.trim());
    if (opts.length < 2) { fire("Add at least 2 options", "err"); return; }
    const poll = {
      id: Date.now().toString(),
      question: newPollQ,
      options: opts.map(o => ({ text: o, votes: 0 })),
      active: true,
      created_at: new Date().toISOString(),
    };
    setPolls(p => [poll, ...p]);
    setActivePoll(poll.id);
    setNewPollQ("");
    setNewPollOpts(["", "", ""]);
    fire("Poll created! Share your screen to display it.");
  };

  const simulateVotes = (pollId) => {
    // Demo: add random votes for demonstration
    setPolls(p => p.map(poll => {
      if (poll.id !== pollId) return poll;
      const total = Math.floor(Math.random() * 30) + 10;
      const randVotes = poll.options.map(() => Math.floor(Math.random() * total));
      const sum = randVotes.reduce((a, b) => a + b, 0);
      return { ...poll, options: poll.options.map((o, i) => ({ ...o, votes: randVotes[i] })) };
    }));
  };

  const closePoll = (pollId) => {
    setPolls(p => p.map(poll => poll.id === pollId ? { ...poll, active: false } : poll));
    if (activePoll === pollId) setActivePoll(null);
    fire("Poll closed");
  };

  const markAnswered = async (q) => {
    await supabase.from("contact_activity")
      .update({ metadata: { ...q.metadata, answered: true } })
      .eq("id", q.id);
    setQuestions(p => p.map(x => x.id === q.id ? { ...x, metadata: { ...x.metadata, answered: true } } : x));
  };

  const aiSummary = async () => {
    if (!questions.length) { fire("No questions to summarise", "err"); return; }
    fire("Generating AI summary…");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 600,
        messages: [{ role: "user", content: `Summarise these ${questions.length} event Q&A questions into 3-4 key themes with percentages:\n\n${questions.map(q => q.description).join("\n")}\n\nReturn a brief summary paragraph then bullet points of top themes.` }]
      })
    }).then(r => r.json()).catch(() => null);
    const text = res?.content?.[0]?.text || "";
    navigator.clipboard?.writeText(text);
    fire("AI summary copied to clipboard!");
  };

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: C.text, letterSpacing: "-0.6px" }}>Live Q&A + Polling</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Run real-time audience Q&A and polls during your event.</p>
        </div>
        {tab === "qa" && questions.length > 0 && (
          <button onClick={aiSummary}
            style={{ fontSize: 13, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.blue}40`, background: C.blue + "10", color: C.blue, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <Sparkles size={12} />AI Summary
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 20, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 3, width: "fit-content" }}>
        {[{ id: "qa", label: `Q&A (${questions.length})` }, { id: "poll", label: `Polls (${polls.length})` }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "6px 20px", borderRadius: 6, border: "none", background: tab === t.id ? C.raised : "transparent", color: tab === t.id ? C.text : C.muted, fontSize: 13, fontWeight: tab === t.id ? 500 : 400, cursor: "pointer" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Share box */}
      <div style={{ background: C.card, borderRadius: 9, border: `1px solid ${C.border}`, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 20 }}>📱</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>Attendees submit questions via their phone</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Display this QR code on screen — questions appear here instantly</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ fontSize: 11, color: C.muted, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, padding: "5px 10px", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shareUrl}</div>
          <button onClick={() => { navigator.clipboard?.writeText(shareUrl); fire("Link copied!"); }}
            style={{ fontSize: 12, padding: "5px 12px", background: C.blue, color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" }}>Copy</button>
        </div>
      </div>

      {tab === "qa" && (
        <div>
          {questions.length === 0 ? (
            <div style={{ background: C.card, borderRadius: 10, border: `1px dashed ${C.border}`, padding: 60, textAlign: "center", color: C.muted }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🙋</div>
              <div style={{ fontSize: 14 }}>No questions yet</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>Share the link above — attendees submit questions from their phones</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {questions.map((q, i) => (
                <div key={q.id} style={{ background: C.card, borderRadius: 9, border: `1px solid ${q.metadata?.answered ? C.green + "40" : C.border}`, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start", opacity: q.metadata?.answered ? 0.7 : 1 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${C.blue}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.blue, flexShrink: 0 }}>
                    {(q.contacts?.first_name?.[0] || "?").toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>{q.description}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                      {q.contacts?.first_name || "Anonymous"} · {new Date(q.created_at).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <button onClick={() => markAnswered(q)} disabled={q.metadata?.answered}
                    style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, border: `1px solid ${q.metadata?.answered ? C.green + "40" : C.border}`, background: q.metadata?.answered ? C.green + "10" : "transparent", color: q.metadata?.answered ? C.green : C.muted, cursor: q.metadata?.answered ? "default" : "pointer" }}>
                    {q.metadata?.answered ? "✅ Answered" : "Mark answered"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "poll" && (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
          {/* Create poll */}
          <div>
            <Sec label="Create poll">
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Question</div>
                <input value={newPollQ} onChange={e => setNewPollQ(e.target.value)}
                  placeholder="e.g. Which topic should we cover next?" 
                  style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: "8px 10px", fontSize: 13, outline: "none" }} />
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Options</div>
              {newPollOpts.map((opt, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                  <input value={opt} onChange={e => setNewPollOpts(p => p.map((o, j) => j === i ? e.target.value : o))}
                    placeholder={`Option ${i + 1}`}
                    style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "6px 8px", fontSize: 12, outline: "none" }} />
                  {newPollOpts.length > 2 && (
                    <button onClick={() => setNewPollOpts(p => p.filter((_, j) => j !== i))}
                      style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 16 }}>×</button>
                  )}
                </div>
              ))}
              {newPollOpts.length < 6 && (
                <button onClick={() => setNewPollOpts(p => [...p, ""])}
                  style={{ fontSize: 12, color: C.blue, background: "transparent", border: "none", cursor: "pointer", padding: "4px 0", marginBottom: 8 }}>+ Add option</button>
              )}
              <button onClick={createPoll}
                style={{ width: "100%", padding: "9px", borderRadius: 7, border: "none", background: C.blue, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", marginTop: 4 }}>
                Launch Poll
              </button>
            </Sec>
          </div>

          {/* Active polls */}
          <div>
            {polls.length === 0 ? (
              <div style={{ background: C.card, borderRadius: 10, border: `1px dashed ${C.border}`, padding: 60, textAlign: "center", color: C.muted }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
                <div style={{ fontSize: 14 }}>No polls yet</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Create a poll and display it on screen during your event</div>
              </div>
            ) : polls.map(poll => {
              const totalVotes = poll.options.reduce((a, o) => a + o.votes, 0);
              return (
                <div key={poll.id} style={{ background: C.card, borderRadius: 10, border: `1px solid ${poll.active ? C.blue + "40" : C.border}`, overflow: "hidden", marginBottom: 12 }}>
                  <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{poll.question}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{totalVotes} votes · {poll.active ? "🟢 Live" : "⚫ Closed"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => simulateVotes(poll.id)}
                        style={{ fontSize: 12, padding: "5px 10px", background: C.raised, border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>+ Votes</button>
                      {poll.active && <button onClick={() => closePoll(poll.id)}
                        style={{ fontSize: 12, padding: "5px 10px", background: C.red + "12", border: `1px solid ${C.red}30`, borderRadius: 5, color: C.red, cursor: "pointer" }}>Close</button>}
                    </div>
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    {poll.options.map((opt, i) => {
                      const pct = totalVotes ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      return (
                        <div key={i} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.text, marginBottom: 4 }}>
                            <span>{opt.text}</span>
                            <span style={{ color: C.muted, fontWeight: 500 }}>{pct}% ({opt.votes})</span>
                          </div>
                          <div style={{ height: 8, background: C.raised, borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ height: "100%", background: C.blue, width: `${pct}%`, borderRadius: 4, transition: "width .4s ease" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PUBLIC SHARED DASHBOARD ──────────────────────────────────
// Read-only view at /share/:token — no login needed
function PublicDashboardPage({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = async () => {
    try {
      // Lookup event by share token stored in event metadata
      const { data: event } = await supabase
        .from("events")
        .select("*,companies(*)")
        .eq("share_token", token)
        .single();

      if (!event) { setError("Dashboard not found or link has expired."); setLoading(false); return; }

      const [{ data: ecs }, { data: cams }] = await Promise.all([
        supabase.from("event_contacts").select("status").eq("event_id", event.id),
        supabase.from("email_campaigns").select("*").eq("event_id", event.id).eq("status", "sent")
      ]);

      const statusCounts = (ecs || []).reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {});

      setData({
        event,
        total: (ecs || []).length,
        confirmed: statusCounts.confirmed || 0,
        attended: statusCounts.attended || 0,
        declined: statusCounts.declined || 0,
        pending: statusCounts.pending || 0,
        totalSent: (cams || []).reduce((a, c) => a + (c.total_sent || 0), 0),
        totalOpened: (cams || []).reduce((a, c) => a + (c.total_opened || 0), 0),
        campaigns: cams || [],
      });
      setLastRefresh(new Date());
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [token]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [token]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#080809", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
      <div style={{ color: "#636366" }}>Loading dashboard…</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#080809", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
      <div style={{ textAlign: "center", color: "#636366" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <div style={{ color: "#F5F5F7" }}>{error}</div>
      </div>
    </div>
  );

  const { event, total, confirmed, attended, declined, pending, totalSent, totalOpened, campaigns: eventCampaigns } = data;
  const openRate = totalSent ? Math.round((totalOpened / totalSent) * 100) : 0;
  const showRate = confirmed ? Math.round((attended / confirmed) * 100) : 0;

  const METRICS = [
    { label: "Total Registered", val: total, color: "#F5F5F7" },
    { label: "Confirmed", val: confirmed, color: "#30D158" },
    { label: "Attended", val: attended, color: "#0A84FF" },
    { label: "Pending", val: pending, color: "#FF9F0A" },
    { label: "Declined", val: declined, color: "#FF453A" },
    { label: "Emails Sent", val: totalSent, color: "#5AC8FA" },
    { label: "Open Rate", val: `${openRate}%`, color: "#5AC8FA" },
    { label: "Show Rate", val: `${showRate}%`, color: "#30D158" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#080809", fontFamily: "system-ui, -apple-system, sans-serif", color: "#F5F5F7" }}>
      {/* Header */}
      <div style={{ background: "#0D0D0F", borderBottom: "1px solid #1C1C1F", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: "#0A84FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>e</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#F5F5F7" }}>evara</span>
          <span style={{ fontSize: 12, color: "#636366" }}>/ Event Dashboard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#30D158", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 11, color: "#636366" }}>Live · Updated {lastRefresh.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        {/* Event info */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#0A84FF", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 6 }}>
            {event.companies?.name || "Event"}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px", margin: "0 0 6px" }}>{event.name}</h1>
          <div style={{ fontSize: 14, color: "#636366" }}>
            {event.event_date && new Date(event.event_date).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {event.location && ` · ${event.location}`}
          </div>
        </div>

        {/* Metric grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
          {METRICS.map(m => (
            <div key={m.label} style={{ background: "#111114", borderRadius: 10, padding: "16px 14px", border: "1px solid #1C1C1F" }}>
              <div style={{ fontSize: 10, color: "#636366", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>{m.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: m.color, letterSpacing: "-0.5px" }}>{m.val}</div>
            </div>
          ))}
        </div>

        {/* Attendance funnel */}
        <div style={{ background: "#111114", borderRadius: 10, border: "1px solid #1C1C1F", padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#F5F5F7", marginBottom: 16 }}>Event Funnel</div>
          {[
            { label: "Emails Sent", val: totalSent, color: "#0A84FF" },
            { label: "Opened", val: totalOpened, color: "#5AC8FA" },
            { label: "Registered", val: total, color: "#AEAEB2" },
            { label: "Confirmed", val: confirmed, color: "#FF9F0A" },
            { label: "Attended", val: attended, color: "#30D158" },
          ].map((s, i, arr) => {
            const pct = arr[0].val ? Math.round((s.val / arr[0].val) * 100) : 0;
            return (
              <div key={s.label} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 12 }}>
                  <span style={{ color: "#AEAEB2" }}>{s.label}</span>
                  <span style={{ color: s.color, fontWeight: 600 }}>{s.val.toLocaleString()} {i > 0 && arr[0].val > 0 ? `(${pct}%)` : ""}</span>
                </div>
                <div style={{ height: 6, background: "#1C1C1F", borderRadius: 3 }}>
                  <div style={{ height: "100%", background: s.color, width: `${pct}%`, borderRadius: 3, transition: "width .5s ease" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Campaigns */}
        {campaigns.length > 0 && (
          <div style={{ background: "#111114", borderRadius: 10, border: "1px solid #1C1C1F", overflow: "hidden" }}>
            <div style={{ padding: "13px 16px", borderBottom: "1px solid #1C1C1F", fontSize: 13, fontWeight: 500, color: "#F5F5F7" }}>
              Email Campaigns
            </div>
            {campaigns.map((cam, i) => {
              const or = cam.total_sent ? Math.round((cam.total_opened / cam.total_sent) * 100) : 0;
              return (
                <div key={cam.id} style={{ padding: "11px 16px", borderBottom: i < campaigns.length - 1 ? "1px solid #1C1C1F" : undefined, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#F5F5F7" }}>{cam.subject || cam.name}</div>
                    <div style={{ fontSize: 11, color: "#636366", marginTop: 2, textTransform: "capitalize" }}>{cam.email_type?.replace(/_/g, " ")}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#636366" }}>{cam.total_sent} sent</div>
                  <div style={{ fontSize: 12, color: or >= 30 ? "#30D158" : "#FF9F0A", fontWeight: 600 }}>{or}% open</div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 32, fontSize: 11, color: "#2C2C30" }}>
          Powered by evara · evara-tau.vercel.app
        </div>
      </div>
    </div>
  );
}

// ─── UNSUBSCRIBE PAGE ────────────────────────────────────────
// cache bust Wed Apr 08 16:48 UTC 2026
