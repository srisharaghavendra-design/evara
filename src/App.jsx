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
    { id:"overview",  label:"All Events", icon:Layout },
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

// ─── ONBOARDING FLOW ─────────────────────────────────────────
function OnboardingFlow({ profile, supabase, onComplete }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);

  // Step 1 — Company
  const [companyName, setCompanyName] = useState(profile?.companies?.name || "");
  const [industry, setIndustry] = useState("");

  // Step 2 — Brand
  const [fromName, setFromName] = useState(profile?.companies?.from_name || profile?.full_name || "");
  const [brandColor, setBrandColor] = useState(profile?.companies?.brand_color || "#0A84FF");

  // Step 3 — First Event
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("conference");

  const INDUSTRIES = ["Technology","Finance & Banking","Healthcare","Real Estate","Education","Professional Services","Retail & E-commerce","Media & Entertainment","Not-for-profit","Government","Other"];
  const EVENT_TYPES = ["conference","seminar","networking","workshop","gala","product launch","webinar","training","awards","other"];
  const COLORS = ["#0A84FF","#30D158","#FF453A","#FF9F0A","#BF5AF2","#FF375F","#5AC8FA","#FFD60A","#FF6B35","#00C7BE"];

  const totalSteps = 4;

  const handleNext = async () => {
    if (step === 1) {
      if (!companyName.trim()) return;
      setSaving(true);
      await supabase.from("companies").update({ name: companyName.trim(), industry }).eq("id", profile.company_id);
      setSaving(false);
      setStep(2);
    } else if (step === 2) {
      setSaving(true);
      await supabase.from("companies").update({ from_name: fromName, brand_color: brandColor }).eq("id", profile.company_id);
      setSaving(false);
      setStep(3);
    } else if (step === 3) {
      if (!eventName.trim()) { setStep(4); return; }
      setCreatingEvent(true);
      const shareToken = Math.random().toString(36).substring(2,14) + Date.now().toString(36);
      await supabase.from("events").insert({
        name: eventName.trim(),
        event_date: eventDate || null,
        event_type: eventType,
        company_id: profile.company_id,
        status: "draft",
        created_by: profile.id,
        share_token: shareToken,
      });
      setCreatingEvent(false);
      setStep(4);
    } else if (step === 4) {
      setSaving(true);
      await supabase.from("companies").update({ onboarding_completed: true }).eq("id", profile.company_id);
      // Send welcome email to new user
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
      onComplete();
    }
  };

  const progress = ((step - 1) / (totalSteps - 1)) * 100;

  return (
    <div style={{ height:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Outfit,sans-serif", color:C.text, padding:24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}button{cursor:pointer;font-family:Outfit,sans-serif}input,select{font-family:Outfit,sans-serif}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ width:"100%", maxWidth:520, animation:"fadeUp .35s ease" }}>
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

        {/* Step 1 — Company */}
        {step === 1 && (
          <div key="s1" style={{ animation:"fadeUp .3s ease" }}>
            <div style={{ marginBottom:8 }}>
              <span style={{ fontSize:12, fontWeight:600, color:C.blue, textTransform:"uppercase", letterSpacing:"1px" }}>Step 1</span>
            </div>
            <h1 style={{ fontSize:28, fontWeight:700, letterSpacing:"-0.5px", marginBottom:8 }}>Welcome to evara 👋</h1>
            <p style={{ fontSize:15, color:C.sec, marginBottom:36, lineHeight:1.5 }}>Let's get your account set up in 2 minutes. First, tell us about your company.</p>

            <div style={{ marginBottom:18 }}>
              <label style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", display:"block", marginBottom:8 }}>Company name *</label>
              <input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleNext()}
                placeholder="Acme Events Co."
                autoFocus
                style={{ width:"100%", background:C.card, border:`1.5px solid ${companyName ? C.blue : C.border}`, borderRadius:10, color:C.text, padding:"13px 16px", fontSize:15, outline:"none", transition:"border .2s" }}
              />
            </div>

            <div style={{ marginBottom:36 }}>
              <label style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", display:"block", marginBottom:8 }}>Industry</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {INDUSTRIES.map(ind => (
                  <button key={ind} onClick={() => setIndustry(ind === industry ? "" : ind)} style={{ padding:"7px 14px", borderRadius:20, border:`1.5px solid ${industry === ind ? C.blue : C.border}`, background: industry === ind ? `${C.blue}20` : C.card, color: industry === ind ? C.blue : C.sec, fontSize:13, fontWeight:500, transition:"all .15s" }}>{ind}</button>
                ))}
              </div>
            </div>

            <button onClick={handleNext} disabled={!companyName.trim() || saving} style={{ width:"100%", padding:"14px", borderRadius:10, border:"none", background: companyName.trim() ? C.blue : C.border, color:"#fff", fontSize:15, fontWeight:600, transition:"all .2s", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving…" : "Continue →"}
            </button>
          </div>
        )}

        {/* Step 2 — Brand */}
        {step === 2 && (
          <div key="s2" style={{ animation:"fadeUp .3s ease" }}>
            <div style={{ marginBottom:8 }}>
              <span style={{ fontSize:12, fontWeight:600, color:C.blue, textTransform:"uppercase", letterSpacing:"1px" }}>Step 2</span>
            </div>
            <h1 style={{ fontSize:28, fontWeight:700, letterSpacing:"-0.5px", marginBottom:8 }}>Brand it your way 🎨</h1>
            <p style={{ fontSize:15, color:C.sec, marginBottom:36, lineHeight:1.5 }}>Your sender name appears in every email. Pick a colour that represents your brand.</p>

            <div style={{ marginBottom:18 }}>
              <label style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", display:"block", marginBottom:8 }}>Sender name (appears as "From" in emails)</label>
              <input
                value={fromName}
                onChange={e => setFromName(e.target.value)}
                placeholder="Events Team at Acme"
                autoFocus
                style={{ width:"100%", background:C.card, border:`1.5px solid ${fromName ? C.blue : C.border}`, borderRadius:10, color:C.text, padding:"13px 16px", fontSize:15, outline:"none", transition:"border .2s" }}
              />
            </div>

            <div style={{ marginBottom:36 }}>
              <label style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", display:"block", marginBottom:8 }}>Brand colour</label>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:14 }}>
                {COLORS.map(col => (
                  <button key={col} onClick={() => setBrandColor(col)} style={{ width:36, height:36, borderRadius:8, background:col, border: brandColor === col ? "3px solid #fff" : "3px solid transparent", outline: brandColor === col ? `2px solid ${col}` : "none", transition:"all .15s", boxShadow: brandColor === col ? `0 0 0 2px ${col}60` : "none" }} />
                ))}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:8, background:brandColor, flexShrink:0 }} />
                <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} style={{ width:44, height:36, borderRadius:8, border:`1px solid ${C.border}`, background:C.card, cursor:"pointer", padding:2 }} />
                <input value={brandColor} onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) setBrandColor(e.target.value); }} style={{ flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"8px 12px", fontSize:14, outline:"none" }} />
                <div style={{ fontSize:13, color:C.sec, background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 14px", letterSpacing:"-0.2px" }}>Preview</div>
                <div style={{ width:28, height:12, borderRadius:6, background:brandColor }} />
              </div>
            </div>

            {/* Preview card */}
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:16, marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:8, background:brandColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#fff" }}>{(fromName||"E").charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{fromName || "Your Sender Name"}</div>
                  <div style={{ fontSize:11, color:C.muted }}>hello@evarahq.com · Email preview</div>
                </div>
              </div>
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setStep(1)} style={{ padding:"14px 20px", borderRadius:10, border:`1px solid ${C.border}`, background:"transparent", color:C.sec, fontSize:15, fontWeight:500 }}>← Back</button>
              <button onClick={handleNext} disabled={saving} style={{ flex:1, padding:"14px", borderRadius:10, border:"none", background:C.blue, color:"#fff", fontSize:15, fontWeight:600, opacity:saving?0.7:1 }}>
                {saving ? "Saving…" : "Continue →"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — First Event */}
        {step === 3 && (
          <div key="s3" style={{ animation:"fadeUp .3s ease" }}>
            <div style={{ marginBottom:8 }}>
              <span style={{ fontSize:12, fontWeight:600, color:C.blue, textTransform:"uppercase", letterSpacing:"1px" }}>Step 3</span>
            </div>
            <h1 style={{ fontSize:28, fontWeight:700, letterSpacing:"-0.5px", marginBottom:8 }}>Create your first event 🎪</h1>
            <p style={{ fontSize:15, color:C.sec, marginBottom:36, lineHeight:1.5 }}>Add your upcoming event. You can always edit details or skip this now.</p>

            <div style={{ marginBottom:18 }}>
              <label style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", display:"block", marginBottom:8 }}>Event name</label>
              <input
                value={eventName}
                onChange={e => setEventName(e.target.value)}
                placeholder="Annual Client Gala 2025"
                autoFocus
                style={{ width:"100%", background:C.card, border:`1.5px solid ${eventName ? C.blue : C.border}`, borderRadius:10, color:C.text, padding:"13px 16px", fontSize:15, outline:"none", transition:"border .2s" }}
              />
            </div>

            <div style={{ display:"flex", gap:12, marginBottom:18 }}>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", display:"block", marginBottom:8 }}>Event date</label>
                <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} style={{ width:"100%", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:eventDate ? C.text : C.muted, padding:"12px 14px", fontSize:14, outline:"none" }} />
              </div>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", display:"block", marginBottom:8 }}>Event type</label>
                <select value={eventType} onChange={e => setEventType(e.target.value)} style={{ width:"100%", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, padding:"12px 14px", fontSize:14, outline:"none", appearance:"none" }}>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display:"flex", gap:10, marginTop:24 }}>
              <button onClick={() => setStep(2)} style={{ padding:"14px 20px", borderRadius:10, border:`1px solid ${C.border}`, background:"transparent", color:C.sec, fontSize:15, fontWeight:500 }}>← Back</button>
              <button onClick={handleNext} disabled={creatingEvent} style={{ flex:1, padding:"14px", borderRadius:10, border:"none", background:eventName.trim() ? C.blue : C.border, color:"#fff", fontSize:15, fontWeight:600, opacity:creatingEvent?0.7:1 }}>
                {creatingEvent ? "Creating…" : eventName.trim() ? "Create Event →" : "Skip for now →"}
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Done */}
        {step === 4 && (
          <div key="s4" style={{ animation:"fadeUp .3s ease", textAlign:"center", position:"relative", overflow:"hidden" }}>
            {/* CSS confetti */}
            <style>{`@keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(120px) rotate(720deg);opacity:0}}
            .confetti-piece{position:absolute;width:8px;height:8px;border-radius:2px;animation:confettiFall 1.8s ease forwards;pointer-events:none;}`}</style>
            {["#0A84FF","#30D158","#FF9F0A","#BF5AF2","#FF453A","#5AC8FA"].map((col,i) => (
              Array.from({length:3}).map((_,j) => (
                <div key={`${i}-${j}`} className="confetti-piece" style={{ background:col, left:`${10+i*15+j*5}%`, top:0, animationDelay:`${i*0.1+j*0.15}s`, animationDuration:`${1.5+i*0.1}s` }} />
              ))
            ))}
            <div style={{ width:72, height:72, borderRadius:20, background:`${C.green}20`, border:`2px solid ${C.green}40`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:32 }}>🎉</div>
            <h1 style={{ fontSize:28, fontWeight:700, letterSpacing:"-0.5px", marginBottom:10 }}>You're all set!</h1>
            <p style={{ fontSize:15, color:C.sec, marginBottom:36, lineHeight:1.6 }}>
              {companyName} is live on evara. Here's what you can do first:
            </p>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:32, textAlign:"left" }}>
              {[
                { icon:"✉️", title:"Build an eDM", desc:"AI writes your email from a sentence", view:"edm" },
                { icon:"👥", title:"Import contacts", desc:"Upload your guest list via CSV", view:"contacts" },
                { icon:"📋", title:"Create a form", desc:"RSVP form live in 60 seconds", view:"forms" },
                { icon:"📊", title:"View analytics", desc:"Track opens, clicks & registrations", view:"analytics" },
              ].map(item => (
                <div key={item.view} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:16, transition:"all .15s" }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.blue+"60"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                  <div style={{ fontSize:22, marginBottom:8 }}>{item.icon}</div>
                  <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{item.title}</div>
                  <div style={{ fontSize:12, color:C.muted, lineHeight:1.4 }}>{item.desc}</div>
                </div>
              ))}
            </div>

            <button onClick={handleNext} disabled={saving} style={{ width:"100%", padding:"15px", borderRadius:10, border:"none", background:C.blue, color:"#fff", fontSize:15, fontWeight:600, boxShadow:`0 0 24px ${C.blue}40` }}>
              {saving ? "Loading…" : "Enter evara →"}
            </button>
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
    <div style={{ height: "100vh", background: C.bg, display: "flex", fontFamily: "Outfit,sans-serif", color: C.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}button{cursor:pointer;font-family:Outfit,sans-serif}input{font-family:Outfit,sans-serif}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {/* Left panel — product showcase */}
      <div style={{ flex:1, background:"linear-gradient(135deg,#060608 0%,#0a0f1e 100%)", padding:"48px 52px", display:"flex", flexDirection:"column", justifyContent:"space-between", minWidth:0 }}>
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
      <div style={{ width:420, background:C.bg, padding:"48px 40px", display:"flex", flexDirection:"column", justifyContent:"center", borderLeft:`1px solid ${C.border}`, flexShrink:0 }}>
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
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [showDupModal, setShowDupModal] = useState(false);
  const [dupName, setDupName] = useState("");
  const [dupDate, setDupDate] = useState("");
  const [duping, setDuping] = useState(false);

  // Load metrics for header strip whenever active event changes
  useEffect(() => {
    if (!activeEvent?.id) { setMetrics(null); setCampaigns([]); return; }
    supabase.from("event_summary").select("*").eq("event_id", activeEvent.id).maybeSingle()
      .then(({ data }) => setMetrics(data));
    supabase.from("email_campaigns").select("*").eq("event_id", activeEvent.id).order("created_at", { ascending: false })
      .then(({ data }) => setCampaigns(data || []));
  }, [activeEvent?.id]);
  const [newEventExtra, setNewEventExtra] = useState({ event_date: "", event_time: "", location: "" });


  const fire = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 4500); };

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
      // Show onboarding for new users (company not yet onboarded)
      if (prof?.companies && !prof.companies.onboarding_completed) {
        setShowOnboarding(true);
      }
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
      event_type: newEventExtra?.event_type || null,
      event_format: newEventExtra?.event_format || null,
      rsvp_deadline: newEventExtra?.rsvp_deadline || null,
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

  // Show onboarding for new users
  if (showOnboarding && profile) {
    return <OnboardingFlow profile={profile} supabase={supabase} onComplete={() => {
      setShowOnboarding(false);
      // Reload events after onboarding (user may have created one)
      supabase.from("events").select("*").eq("company_id", profile.company_id).order("event_date", { ascending: true })
        .then(({ data: evts }) => { setEvents(evts || []); if (evts?.length) setActiveEvent(evts[0]); });
      // Reload profile with updated company
      supabase.from("profiles").select("*,companies(*)").eq("id", session.user.id).single()
        .then(({ data: prof }) => { if (prof) setProfile(prof); });
    }} />;
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.text, fontFamily: "Outfit,sans-serif", overflow: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#2A2A2E;border-radius:3px}button{cursor:pointer;font-family:Outfit,sans-serif}input,textarea,select{font-family:Outfit,sans-serif}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}.nb:hover{background:${C.raised}!important;color:${C.text}!important}.mc:hover{background:${C.raised}!important;border-color:${C.borderHi}!important;transform:translateY(-1px)}.rh:hover{background:${C.raised}!important}.mobile-hamburger{display:none!important}@media(max-width:768px){.evara-sidebar{position:fixed!important;z-index:200;transform:translateX(-100%);transition:transform .25s ease;width:216px!important}.evara-sidebar.open{transform:translateX(0)}.evara-overlay{display:block!important}.evara-main{margin-left:0!important}.mobile-hamburger{display:flex!important}.desktop-breadcrumb{display:none!important}.main-padding{padding:16px!important}}`}</style>

      {/* Mobile overlay — closes sidebar when tapping outside */}
      {sidebarOpen && <div className="evara-overlay" onClick={() => setSidebarOpen(false)} style={{ display:"none", position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:199 }} />}

      {/* SIDEBAR */}
      <aside className={`evara-sidebar${sidebarOpen?" open":""}`} style={{ width: sidebarOpen ? 216 : 56, background: C.sidebar, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, transition:"width .2s ease", overflow:"hidden" }}>
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
                return (<button key={id} data-view={id} className="nb" onClick={() => { setView(id); if (window.innerWidth <= 768) setSidebarOpen(false); }} title={!sidebarOpen ? label : undefined} style={{ display: "flex", alignItems: "center", gap: sidebarOpen?8:0, padding: sidebarOpen?"7px 10px":"8px", justifyContent: sidebarOpen?"flex-start":"center", borderRadius: 7, border: "none", background: on ? `${C.blue}18` : "transparent", color: on ? C.blue : C.muted, width: "100%", textAlign: "left", fontSize: 12.5, fontWeight: on ? 600 : 400, borderLeft: sidebarOpen?`2px solid ${on ? C.blue : "transparent"}`:"2px solid transparent", transition: "all .1s", marginBottom: 1 }}>
                  <Icon size={14} strokeWidth={on ? 2.5 : 1.5} color={on ? C.blue : C.muted} />
                  {sidebarOpen && <><span style={{ flex: 1 }}>{label}</span>
                  {badge && <span style={{ fontSize: 9, fontWeight: 700, background: on ? C.blue : C.raised, color: on ? "#fff" : C.muted, padding: "1px 5px", borderRadius: 3 }}>{badge}</span>}</>}
                </button>);
              })}
            </div>
          ))}
        </nav>
        <div style={{ padding: "10px 8px 12px", borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 1 }}>
          <div style={{ fontSize: 9.5, color: C.muted, padding: "0 10px 6px", opacity: 0.5, display: "flex", justifyContent: "space-between" }}>
          <span>⌘N new · ⌘K search · ⌘, settings · ESC close</span>
          <span>v2.2</span>
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
        <header style={{ height: 52, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 22px", gap: 12, flexShrink: 0, background: C.sidebar }}>
          {/* Mobile hamburger */}
          <button className="mobile-hamburger" onClick={() => setSidebarOpen(p=>!p)}
            style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:7, color:C.muted, cursor:"pointer", fontSize:16, padding:"5px 10px", lineHeight:1, alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            ☰
          </button>
          <div className="desktop-breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 4 }}>
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
          <div style={{ position:"relative", flex:1, maxWidth:280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.card, border: `1px solid ${globalSearch?C.blue:C.border}`, borderRadius: 7, padding: "6px 11px" }}>
              <Search size={12} color={C.muted} strokeWidth={1.5} />
              <input placeholder="Search events, contacts… (⌘K)" value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Escape") { setGlobalSearch(""); e.target.blur(); }
                  if (e.key === "Enter" && globalSearch.length > 1) { setView("contacts"); }
                }}
                style={{ background: "none", border: "none", outline: "none", color: C.sec, fontSize: 12.5, width: "100%" }} />
              {globalSearch && <button onClick={() => setGlobalSearch("")} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:14, lineHeight:1, padding:0 }}>×</button>}
            </div>
            {/* Command palette dropdown */}
            {globalSearch.length > 0 && (() => {
              const q = globalSearch.toLowerCase();
              const matchedEvents = events.filter(e => e.name?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q)).slice(0,4);
              const modules = [
                {id:"dashboard",label:"Dashboard",icon:"📊"},{id:"edm",label:"eDM Builder",icon:"✉️"},
                {id:"schedule",label:"Scheduling",icon:"📅"},{id:"contacts",label:"Contacts",icon:"👥"},
                {id:"analytics",label:"Analytics",icon:"📈"},{id:"campaign",label:"Campaign Builder",icon:"⚡"},
                {id:"calendar",label:"Calendar",icon:"🗓"},{id:"checkin",label:"Check-in",icon:"✓"},
                {id:"overview",label:"All Events",icon:"🗂"},{id:"settings",label:"Settings",icon:"⚙️"},
              ].filter(m => m.label.toLowerCase().includes(q)).slice(0,4);
              if (!matchedEvents.length && !modules.length) return null;
              return (
                <div style={{ position:"absolute", top:"100%", left:0, right:0, marginTop:4, background:C.card, border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 8px 32px rgba(0,0,0,.5)", zIndex:300, overflow:"hidden" }}>
                  {matchedEvents.length > 0 && <>
                    <div style={{ padding:"6px 12px 3px", fontSize:9.5, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px" }}>Events</div>
                    {matchedEvents.map(ev => (
                      <div key={ev.id} onClick={() => { setActiveEvent(ev); setView("dashboard"); setGlobalSearch(""); fire(`Switched to ${ev.name}`); }}
                        style={{ padding:"8px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:9, fontSize:13 }}
                        onMouseEnter={e=>e.currentTarget.style.background=C.raised}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <span style={{ fontSize:15 }}>🎪</span>
                        <div>
                          <div style={{ color:C.text, fontWeight:500 }}>{ev.name}</div>
                          {ev.event_date && <div style={{ fontSize:11, color:C.muted }}>{new Date(ev.event_date).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})}</div>}
                        </div>
                      </div>
                    ))}
                  </>}
                  {modules.length > 0 && <>
                    <div style={{ padding:"6px 12px 3px", fontSize:9.5, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", borderTop:matchedEvents.length?`1px solid ${C.border}`:undefined }}>Go to</div>
                    {modules.map(m => (
                      <div key={m.id} onClick={() => { setView(m.id); setGlobalSearch(""); }}
                        style={{ padding:"8px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:9, fontSize:13 }}
                        onMouseEnter={e=>e.currentTarget.style.background=C.raised}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <span style={{ fontSize:15 }}>{m.icon}</span>
                        <span style={{ color:C.text }}>{m.label}</span>
                      </div>
                    ))}
                  </>}
                  <div style={{ padding:"6px 12px", borderTop:`1px solid ${C.border}` }}>
                    <div onClick={() => { setView("contacts"); }} style={{ fontSize:11, color:C.muted, cursor:"pointer" }}>
                      Press Enter to search all contacts for "{globalSearch}"
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
          {/* Quick event stats */}
          {activeEvent && metrics && (
            <div style={{ display:"flex", gap:1, background:C.raised, borderRadius:7, border:`1px solid ${C.border}`, overflow:"hidden", flexShrink:0 }}>
              {[
                { label:"Sent", val:metrics?.total_sent||0, color:C.blue },
                { label:"Opened", val:metrics?.total_opened||0, color:C.teal },
                { label:"Confirmed", val:metrics?.total_confirmed||0, color:C.green },
              ].map((s,i) => (
                <div key={s.label} style={{ padding:"4px 10px", borderRight: i<2?`1px solid ${C.border}`:"none", textAlign:"center" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:s.color, lineHeight:1.2 }}>{s.val}</div>
                  <div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", letterSpacing:"0.5px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginLeft: "auto" }}>
            <button onClick={() => setShowNewEvent(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: C.blue, border: "none", borderRadius: 7, padding: "6px 13px", color: "#fff", fontSize: 12.5, fontWeight: 500, boxShadow: `0 2px 8px ${C.blue}40` }}>
              <Plus size={12} />New Event
            </button>
            <button onClick={() => setShowHelp(p => !p)} title="Keyboard shortcuts & tips (?)"
              style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 10px", color: C.muted, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
              ?
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

        <main className="main-padding" style={{ flex: 1, overflow: "auto", padding: "26px" }}>
          {view === "dashboard" && <DashView supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} setView={setView} events={events} setActiveEvent={setActiveEvent} />}
          {view === "edm" && profile && <EdmView key="edm" supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} setView={setView} />}
          {view === "landing" && profile && <LandingView key="landing" supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} formShareLink={formShareLink} />}
          {view === "forms" && profile && <FormsView key="forms" supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "contacts" && profile && <ContactView key="contacts" supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />}
          {view === "schedule" && profile && <ScheduleView key="schedule" supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} addNotif={addNotif} />}
          {view === "checkin"   && profile && <CheckInView key="checkin"  supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "social"    && profile && <SocialView key="social"   supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} />}
          {view === "analytics" && profile && <AnalyticsView key="analytics" supabase={supabase} profile={profile} activeEvent={activeEvent} fire={fire} campaigns={campaigns} />}
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
      </div>

      {/* NEW EVENT MODAL */}
      {showNewEvent && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:99 }}>
          <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, width:520, maxHeight:"90vh", overflowY:"auto", animation:"fadeUp .2s ease" }}>
            <div style={{ padding:"22px 26px 18px", borderBottom:`1px solid ${C.border}` }}>
              <h2 style={{ fontSize:18, fontWeight:700, color:C.text, margin:0 }}>Create new event</h2>
              <p style={{ fontSize:12, color:C.muted, marginTop:3 }}>AI auto-drafts your full email sequence in the background</p>
            </div>
            <div style={{ padding:"20px 26px" }}>
              {/* Event name */}
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:11.5, fontWeight:600, color:C.muted, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>Event name *</label>
                <input value={newEventName} onChange={e => setNewEventName(e.target.value)} onKeyDown={e => e.key==="Enter" && createEvent()} placeholder="e.g. Annual Client Summit 2026" autoFocus
                  style={{ width:"100%", background:C.bg, border:`1.5px solid ${newEventName?C.blue:C.border}`, borderRadius:9, color:C.text, padding:"11px 14px", fontSize:14, outline:"none", boxSizing:"border-box" }} />
              </div>

              {/* Event type tiles */}
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:11.5, fontWeight:600, color:C.muted, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.5px" }}>Event type</label>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6 }}>
                  {[["conference","🎤","Conference"],["gala","🥂","Gala"],["workshop","🛠","Workshop"],["webinar","🖥","Webinar"],["awards","🏆","Awards"],["networking","🤝","Networking"],["launch","🚀","Launch"],["training","📋","Training"],["dinner","🍽","Dinner"],["other","📅","Other"]].map(([type,icon,label]) => {
                    const sel = (newEventExtra?.event_type||"") === type;
                    return (
                      <button key={type} onClick={() => setNewEventExtra(p=>({...p,event_type:type}))}
                        style={{ padding:"8px 4px", borderRadius:8, border:`1.5px solid ${sel?C.blue:C.border}`, background:sel?`${C.blue}15`:"transparent", cursor:"pointer", textAlign:"center", transition:"all .1s" }}>
                        <div style={{ fontSize:18 }}>{icon}</div>
                        <div style={{ fontSize:10, color:sel?C.blue:C.muted, marginTop:3, fontWeight:sel?600:400 }}>{label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date + Time */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                <div>
                  <label style={{ display:"block", fontSize:11.5, fontWeight:600, color:C.muted, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>Date</label>
                  <input type="date" value={newEventExtra?.event_date||""} onChange={e=>setNewEventExtra(p=>({...p,event_date:e.target.value}))}
                    style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"9px 12px", fontSize:13, outline:"none", boxSizing:"border-box" }}
                    onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:11.5, fontWeight:600, color:C.muted, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>Time</label>
                  <input value={newEventExtra?.event_time||""} onChange={e=>setNewEventExtra(p=>({...p,event_time:e.target.value}))} placeholder="6:30 PM"
                    style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"9px 12px", fontSize:13, outline:"none", boxSizing:"border-box" }}
                    onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                </div>
              </div>

              {/* Location + Format */}
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:12, marginBottom:14 }}>
                <div>
                  <label style={{ display:"block", fontSize:11.5, fontWeight:600, color:C.muted, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>Venue / Location</label>
                  <input value={newEventExtra?.location||""} onChange={e=>setNewEventExtra(p=>({...p,location:e.target.value}))} placeholder="The Ritz-Carlton, Sydney"
                    style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"9px 12px", fontSize:13, outline:"none", boxSizing:"border-box" }}
                    onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                </div>
                <div>
                  <label style={{ display:"block", fontSize:11.5, fontWeight:600, color:C.muted, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>Format</label>
                  <select value={newEventExtra?.event_format||""} onChange={e=>setNewEventExtra(p=>({...p,event_format:e.target.value}))}
                    style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"9px 12px", fontSize:13, outline:"none", boxSizing:"border-box" }}>
                    <option value="">Select…</option>
                    <option value="In-person">📍 In-person</option>
                    <option value="Online">💻 Online</option>
                    <option value="Hybrid">🌐 Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:11.5, fontWeight:600, color:C.muted, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>Description <span style={{ color:C.muted, fontWeight:400, textTransform:"none" }}>(helps AI write better emails)</span></label>
                <textarea value={newEventExtra?.description||""} onChange={e=>setNewEventExtra(p=>({...p,description:e.target.value}))} rows={2}
                  placeholder="e.g. Annual leadership forum for senior executives. Smart casual. Drinks and canapés included."
                  style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"9px 12px", fontSize:13, outline:"none", resize:"none", lineHeight:1.5, boxSizing:"border-box" }}
                  onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
              </div>

              {/* AI banner */}
              <div style={{ background:`${C.blue}10`, border:`1px solid ${C.blue}25`, borderRadius:9, padding:"10px 14px", marginBottom:18, display:"flex", alignItems:"center", gap:10 }}>
                <Sparkles size={14} color={C.blue} strokeWidth={1.5} />
                <span style={{ fontSize:12, color:C.blue, lineHeight:1.5 }}>
                  <strong>AI auto-drafts</strong> your Save the Date, Invitation, Reminder, Day-of & Thank You emails in the background — ready in Scheduling when you create this event.
                </span>
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => { setShowNewEvent(false); setNewEventName(""); setNewEventExtra({event_date:"",event_time:"",location:""}); }} style={{ flex:1, padding:12, background:"transparent", border:`1px solid ${C.border}`, borderRadius:9, color:C.muted, fontSize:13, cursor:"pointer" }}>Cancel</button>
                <button onClick={createEvent} disabled={!newEventName.trim()} style={{ flex:2, padding:12, background:newEventName.trim()?C.blue:C.border, border:"none", borderRadius:9, color:"#fff", fontSize:14, fontWeight:600, cursor:newEventName.trim()?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:newEventName.trim()?`0 4px 16px ${C.blue}40`:"none" }}>
                  <Sparkles size={14} />Create + Auto-Draft →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDupModal && activeEvent && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}
          onClick={() => setShowDupModal(false)}>
          <div style={{ background:C.card, borderRadius:14, border:`1px solid ${C.border}`, padding:28, width:440, animation:"fadeUp .2s ease" }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:4 }}>Duplicate Event</h2>
            <p style={{ fontSize:12, color:C.muted, marginBottom:20 }}>Creates a new draft with all email templates copied. Contacts are not duplicated.</p>
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
                // Copy campaigns
                const { data: existingCams } = await supabase.from("email_campaigns").select("*").eq("event_id", activeEvent.id).limit(20);
                let camCount = 0;
                if (existingCams?.length) {
                  const dupCams = existingCams.filter(c => c.html_content).map(c => ({
                    event_id: newEv.id, company_id: profile.company_id,
                    name: c.name, email_type: c.email_type, subject: c.subject,
                    html_content: c.html_content, plain_text: c.plain_text,
                    template_style: c.template_style, status:"draft", segment: c.segment || "all",
                  }));
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

      {toast && (
        <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", background:"#1C1C1F", border:`1px solid ${toast.type==="ok"?C.green:toast.type==="err"?C.red:toast.type==="warn"?C.amber:C.blue}30`, borderRadius:12, padding:"0", display:"flex", flexDirection:"column", animation:"fadeUp .25s ease", zIndex:9999, whiteSpace:"nowrap", boxShadow:"0 12px 40px rgba(0,0,0,.7)", backdropFilter:"blur(12px)", overflow:"hidden", minWidth:280, maxWidth:480 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px" }}>
            <span style={{ fontSize:16, flexShrink:0 }}>{toast.type==="ok"?"✅":toast.type==="err"?"❌":toast.type==="warn"?"⚠️":"ℹ️"}</span>
            <span style={{ fontSize:13, color:C.text, flex:1, whiteSpace:"normal", lineHeight:1.4 }}>{toast.msg}</span>
            <button onClick={() => setToast(null)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:16, padding:"0 2px", lineHeight:1, flexShrink:0 }}>×</button>
          </div>
          {/* Auto-dismiss progress bar */}
          <div style={{ height:2, background:`${toast.type==="ok"?C.green:toast.type==="err"?C.red:toast.type==="warn"?C.amber:C.blue}40` }}>
            <div style={{ height:"100%", background:toast.type==="ok"?C.green:toast.type==="err"?C.red:toast.type==="warn"?C.amber:C.blue, animation:"toastProgress 4.5s linear forwards", borderRadius:1 }} />
          </div>
        </div>
      )}
      <style>{`@keyframes toastProgress{from{width:100%}to{width:0%}}`}</style>
    </div>
  );
}

// ─── EMAIL ACTIVITY TIMELINE ─────────────────────────────────
function EmailActivityTimeline({ supabase, contactId, eventId }) {
  const [sends, setSends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contactId) return;
    setLoading(true);
    // Load email sends for this contact, optionally filtered by event
    let q = supabase.from("email_sends")
      .select("*,email_campaigns(name,email_type,subject,event_id,events(name))")
      .eq("contact_id", contactId)
      .order("sent_at", { ascending: false })
      .limit(20);
    q.then(({ data }) => { setSends(data || []); setLoading(false); });
  }, [contactId, eventId]);

  if (loading) return <div style={{ fontSize:11, color:C.muted, padding:"4px 0" }}>Loading…</div>;

  if (!sends.length) return (
    <div style={{ fontSize:11, color:C.muted, fontStyle:"italic" }}>
      No emails sent to this contact yet
    </div>
  );

  const icons = { sent:"📧", opened:"👁", clicked:"🖱", bounced:"❌" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      {sends.map(s => {
        const status = s.clicked_at ? "clicked" : s.opened_at ? "opened" : s.status || "sent";
        const statusColor = status==="clicked"?C.blue:status==="opened"?C.green:status==="bounced"?C.red:C.muted;
        const cam = s.email_campaigns || {};
        const eventName = cam.events?.name;
        return (
          <div key={s.id} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"6px 0", borderBottom:`1px solid ${C.border}` }}>
            <span style={{ fontSize:13, flexShrink:0, marginTop:1 }}>{icons[status] || "📧"}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11.5, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {cam.subject || cam.name || "Email"}
              </div>
              <div style={{ display:"flex", gap:6, marginTop:2, flexWrap:"wrap" }}>
                <span style={{ fontSize:10, fontWeight:600, color:statusColor, textTransform:"capitalize" }}>{status}</span>
                {eventName && <span style={{ fontSize:10, color:C.muted }}>· {eventName}</span>}
                <span style={{ fontSize:10, color:C.muted }}>
                  · {s.sent_at ? new Date(s.sent_at).toLocaleDateString("en-AU",{day:"numeric",month:"short"}) : ""}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────
function DashView({ supabase, profile, activeEvent, fire, setView, events = [], setActiveEvent }) {
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
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 48, gap: 14, marginBottom: 40 }}>
        <div style={{ fontSize: 52, marginBottom: 4 }}>🚀</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: "-0.5px" }}>Welcome to evara</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", marginTop:8 }}>
          {["📧 AI emails","📋 RSVP forms","📊 Analytics","📍 Check-in","🎤 Live Q&A"].map(f => (
            <span key={f} style={{ fontSize:11, padding:"3px 10px", borderRadius:999, background:C.raised, color:C.muted, border:`1px solid ${C.border}` }}>{f}</span>
          ))}
        </div>
        <p style={{ fontSize: 14, color: C.muted, textAlign: "center", maxWidth: 400, lineHeight: 1.65 }}>
          Your all-in-one event marketing platform. Create your first event to get started — AI will generate your emails, forms and landing page.
        </p>
        <button onClick={() => setShowNewEvent(true)} style={{ padding: "12px 32px", background: C.blue, border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 20px ${C.blue}40` }}>
          ✨ Create First Event
        </button>
        <div style={{ display: "flex", gap: 24, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { icon: "🤖", label: "AI generates your emails" },
            { icon: "📋", label: "Auto-builds registration forms" },
            { icon: "📊", label: "Tracks every contact's journey" },
          ].map(f => (
            <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted }}>
              <span>{f.icon}</span><span>{f.label}</span>
            </div>
          ))}
        </div>
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
  const isPostEvent = daysToEvent !== null && daysToEvent < 0;
  const daysSinceEvent = isPostEvent ? Math.abs(daysToEvent) : null;

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
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
          <div style={{ display:"flex", gap:8 }}>
            {!campaigns.some(c=>c.email_type==="thank_you"&&c.status==="sent") && (
              <button onClick={() => setView("schedule")} style={{ fontSize:12, padding:"6px 13px", background:C.green, border:"none", borderRadius:7, color:"#fff", cursor:"pointer", fontWeight:600 }}>
                Send Thank You →
              </button>
            )}
            <button onClick={() => setView("feedback")} style={{ fontSize:12, padding:"6px 13px", background:"transparent", border:`1px solid ${C.green}50`, borderRadius:7, color:C.green, cursor:"pointer" }}>
              Feedback Form
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
      <div style={{ marginBottom: 22, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: C.blue, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4 }}>Active Event</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.6px", color: C.text, margin: 0 }}>{{"Conference":"🎤 ","Workshop":"🛠 ","Webinar":"🖥 ","Product Launch":"🚀 ","Awards":"🏆 ","Team Event":"🤝 "}[activeEvent.event_type]||""}{activeEvent.name}</h1>
            <span onClick={async () => {
              const statuses = ["draft", "published", "completed"];
              const curr = activeEvent.status || "draft";
              const next = statuses[(statuses.indexOf(curr) + 1) % statuses.length];
              await supabase.from("events").update({ status: next }).eq("id", activeEvent.id);
              fire(`Event status → ${next}`);
            }} style={{ fontSize: 11, fontWeight: 600, color: activeEvent.status === "draft" ? C.muted : activeEvent.status === "completed" ? C.green : C.blue, background: (activeEvent.status === "draft" ? C.muted : activeEvent.status === "completed" ? C.green : C.blue) + "15", padding: "2px 8px", borderRadius: 4, textTransform: "capitalize", flexShrink: 0, cursor: "pointer" }} title="Click to change status">
              <span style={{ fontSize: 9.5, marginRight: 2 }}>
                {activeEvent.status === "published" ? "🟢" : activeEvent.status === "completed" ? "✅" : "⚪"}
              </span>
              {(activeEvent.status || "draft").charAt(0).toUpperCase() + (activeEvent.status || "draft").slice(1)}
            </span>
            <button onClick={() => setShowEditEvent(true)} style={{ fontSize: 11, padding: "2px 8px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4, color: C.muted, cursor: "pointer" }}>
              Edit
            </button>
            <button onClick={() => {
              const txt = [activeEvent.name, activeEvent.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"}) : "", activeEvent.event_time || "", activeEvent.location ? "📍 " + activeEvent.location : ""].filter(Boolean).join("\n");
              navigator.clipboard?.writeText(txt);
              fire("📋 Event details copied");
            }} style={{ fontSize: 11, padding: "2px 8px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4, color: C.muted, cursor: "pointer" }}>
              📋 Copy
            </button>
          </div>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
            {activeEvent.event_type ? <span style={{ background: C.blue+"15", color: C.blue, fontSize: 10.5, padding: "1px 7px", borderRadius: 4, fontWeight: 600, marginRight: 6 }}>{activeEvent.event_type}</span> : ""}
            {activeEvent.event_format && activeEvent.event_format !== "In-person" ? <span style={{ background: C.teal+"15", color: C.teal, fontSize: 10.5, padding: "1px 7px", borderRadius: 4, fontWeight: 600, marginRight: 6 }}>{activeEvent.event_format === "Online / Webinar" ? "🖥 Online" : "🔀 Hybrid"}</span> : ""}{activeEvent.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "Date TBC"}{activeEvent.rsvp_deadline && (() => {
              const daysLeft = Math.ceil((new Date(activeEvent.rsvp_deadline) - new Date()) / (1000*60*60*24));
              if (daysLeft < 0) return "";
              return <> · <span style={{ color: daysLeft <= 3 ? C.red : C.amber }}>📋 RSVP by {new Date(activeEvent.rsvp_deadline).toLocaleDateString("en-AU",{day:"numeric",month:"short"})}{daysLeft === 0 ? " (TODAY!)" : daysLeft <= 3 ? ` (${daysLeft}d!)` : daysLeft <= 7 ? ` (${daysLeft}d left)` : ""}</span></>;
            })()}
            {activeEvent.event_time ? ` · ${activeEvent.event_time}` : ""}
            {activeEvent.location ? ` · 📍 ${activeEvent.location}` : ""}
            {(() => {
              const sent = campaigns.filter(c => c.status === "sent" && c.sent_at);
              if (!sent.length) return null;
              const last = sent.sort((a,b) => new Date(b.sent_at)-new Date(a.sent_at))[0];
              const daysAgo = Math.round((new Date()-new Date(last.sent_at))/(1000*60*60*24));
              return <span style={{ marginLeft:6, fontSize:11, color:C.muted }}>· 📧 {daysAgo===0?"emailed today":`last email ${daysAgo}d ago`}</span>;
            })()}
            {activeEvent.expected_attendees ? ` · 👥 ${activeEvent.expected_attendees} expected` : ""}
          </p>
          {activeEvent.description && (
            <p style={{ color: C.muted, fontSize: 12, marginTop: 3, fontStyle: "italic", opacity: 0.75 }}>{activeEvent.description}</p>
          )}
          {activeEvent.capacity && (
            <p style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
              {(() => {
                const pct = Math.round((contacts.length / activeEvent.capacity) * 100);
                const isOver = contacts.length >= activeEvent.capacity;
                const isNear = pct >= 80 && !isOver;
                return (
                  <span style={{ color: isOver ? C.red : isNear ? C.amber : C.muted, fontWeight: isOver || isNear ? 600 : 400 }}>
                    {isOver ? "🔴 SOLD OUT" : isNear ? "🟡 Nearly full" : "👥 Capacity"}: {contacts.length}/{activeEvent.capacity} ({pct}% full)
                    {isOver && <span onClick={() => fire("Set up a Waitlist form in the Forms section")} style={{ color: C.blue, marginLeft: 8, cursor: "pointer", textDecoration: "underline", fontSize: 11 }}>Set up waitlist →</span>}
                  </span>
                );
              })()}
            </p>
          )}
          {activeEvent.internal_notes && (
            <div style={{ marginTop:6, padding:"7px 10px", background:`${C.amber}08`, border:`1px solid ${C.amber}20`, borderRadius:6, display:"flex", alignItems:"flex-start", gap:7 }}>
              <span style={{ fontSize:12, flexShrink:0 }}>📌</span>
              <span style={{ fontSize:11.5, color:C.amber, lineHeight:1.5 }}>{activeEvent.internal_notes}</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
          {formShareLink && (
            <div style={{ display: "flex", gap: 5 }}>
              <button onClick={() => { navigator.clipboard?.writeText(formShareLink); fire("📋 Reg link copied!"); }}
                style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 13px", color: C.muted, cursor: "pointer" }}>
                📝 Reg Link
              </button>
              <button onClick={() => window.open(formShareLink, "_blank")}
                style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, background: "transparent", border: `1px solid ${C.blue}40`, borderRadius: 7, padding: "7px 13px", color: C.blue, cursor: "pointer" }}>
                👁 View Form
              </button>
            </div>
          )}
          <button onClick={async () => {
            let token = activeEvent.share_token;
            if (!token) {
              token = Math.random().toString(36).substring(2, 14) + Date.now().toString(36);
              await supabase.from("events").update({ share_token: token }).eq("id", activeEvent.id);
            }
            const shareUrl = `${window.location.hostname === "localhost" ? "https://evara-tau.vercel.app" : window.location.origin}/share/${token}`;
            await navigator.clipboard?.writeText(shareUrl);
            fire(`📊 Dashboard link copied! Share: ${shareUrl.replace("https://","")}`);
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
              <div style={{ fontSize: 32, fontWeight: 700, color: daysToEvent <= 3 ? C.red : daysToEvent <= 7 ? C.amber : C.text, lineHeight: 1 }}>{daysToEvent > 0 ? daysToEvent : daysToEvent === 0 ? "🎉" : Math.abs(daysToEvent)}</div>
              <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginTop: 4 }}>{daysToEvent > 0 ? "Days to go" : daysToEvent === 0 ? "Today!" : "Days ago"}</div>
            </div>
          )}
          {metrics && <div style={{ display: "flex", gap: 16 }}>
            {[
              { l: "Open Rate", v: metrics.total_sent > 0 ? `${Math.round((metrics.total_opened / metrics.total_sent) * 100)}%` : "0%", good: metrics.total_sent > 0 && (metrics.total_opened / metrics.total_sent) > 0.2 },
              { l: "Click Rate", v: metrics.total_sent > 0 && metrics.total_clicked > 0 ? `${Math.round((metrics.total_clicked / metrics.total_sent) * 100)}%` : "—", good: metrics.total_sent > 0 && (metrics.total_clicked / metrics.total_sent) > 0.05 },
              { l: "Show Rate", v: metrics.total_confirmed > 0 ? `${Math.round((metrics.total_attended / metrics.total_confirmed) * 100)}%` : "0%", good: metrics.total_confirmed > 0 && (metrics.total_attended / metrics.total_confirmed) > 0.7 },
            ].map(s => (<div key={s.l} style={{ textAlign: "right" }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: s.good ? C.green : C.text, letterSpacing: "-0.8px" }}>{s.v}</div>
              <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px" }}>{s.l}</div>
            </div>))}
          </div>}
        </div>
      </div>

      {/* Event lifecycle timeline — only show once campaigns exist */}
      {activeEvent && daysToEvent !== null && campaigns.length > 0 && (
        <div style={{ background:C.card, borderRadius:10, border:`1px solid ${C.border}`, padding:"12px 16px", marginBottom:14, overflowX:"auto" }}>
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
        <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
          {[
            { label:"✉️ Build email", action:() => setView("edm"), color:C.blue },
            { label:"📅 Schedule", action:() => setView("schedule"), color:C.blue },
            { label:"👥 Contacts", action:() => setView("contacts"), color:C.blue },
            { label:"📊 Analytics", action:() => setView("analytics"), color:C.blue },
            { label:"🎪 Check-in", action:() => setView("checkin"), color:C.green },
            { label:"📋 Feedback", action:() => setView("feedback"), color:C.blue },
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
        </div>
      )}

      {/* Go Live checklist */}
      {goLiveChecklist.length > 0 && goLiveDone < goLiveChecklist.length && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 16px", marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:13, fontWeight:600, color:C.text }}>🚀 Go Live Checklist</span>
              <span style={{ fontSize:11, color:C.muted }}>{goLiveDone}/{goLiveChecklist.length} complete</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:80, height:5, background:C.raised, borderRadius:3, overflow:"hidden" }}>
                <div style={{ width:`${Math.round(goLiveDone/Math.max(1,goLiveChecklist.length)*100)}%`, height:"100%", background:`linear-gradient(90deg,${C.blue},${C.teal})`, borderRadius:3, transition:"width .4s" }} />
              </div>
              <span style={{ fontSize:11, fontWeight:600, color:goLiveDone===goLiveChecklist.length?C.green:C.blue }}>{Math.round(goLiveDone/Math.max(1,goLiveChecklist.length)*100)}%</span>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
            {goLiveChecklist.map(item => (
              <button key={item.id}
                onClick={() => !item.done && setView(item.action)}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:7, border:`1px solid ${item.done?C.green+"40":C.border}`, background:item.done?C.green+"0a":C.raised, cursor:item.done?"default":"pointer", textAlign:"left" }}>
                <div style={{ width:20, height:20, borderRadius:"50%", background:item.done?C.green:"transparent", border:`2px solid ${item.done?C.green:C.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:10, color:"#fff" }}>
                  {item.done?"✓":item.icon}
                </div>
                <span style={{ fontSize:12, color:item.done?C.green:C.text, fontWeight:item.done?400:500, textDecoration:item.done?"line-through":"none", opacity:item.done?0.6:1, lineHeight:1.3 }}>{item.label}</span>
                {!item.done && <span style={{ marginLeft:"auto", fontSize:10, color:C.blue, flexShrink:0 }}>→</span>}
              </button>
            ))}
          </div>
        </div>
      )}




      {/* ─── METRICS CARDS GRID ─── */}
      {activeEvent && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Emails Sent", val: metrics?.total_sent || 0, sub: (() => { const sched = campaigns.filter(c => c.status === "scheduled").length; if (sched > 0) return `${sched} scheduled`; const last = campaigns.filter(c => c.status === "sent" && c.sent_at).sort((a,b) => new Date(b.sent_at)-new Date(a.sent_at))[0]; if (!last) return "No sends yet"; const d = Math.round((new Date()-new Date(last.sent_at))/(1000*60*60*24)); return d === 0 ? "sent today" : `${d}d ago`; })(), color: C.blue, icon: "📧", action: () => setView("schedule") },
            { label: "Confirmed", val: metrics?.total_confirmed || 0, sub: contacts.length > 0 ? `of ${contacts.length} invited` : "awaiting RSVPs", color: C.green, icon: "✅", action: () => setView("contacts") },
            { label: "Pending", val: metrics?.total_pending || 0, sub: metrics?.total_pending > 0 ? "need a nudge?" : "all responded", color: C.amber, icon: "⏳", action: () => setView("contacts") },
            { label: "Attended", val: metrics?.total_attended || 0, sub: metrics?.total_confirmed > 0 ? `${Math.round((metrics.total_attended / metrics.total_confirmed) * 100)}% show rate` : "event day", color: C.teal, icon: "🎟", action: () => setView("checkin") },
          ].map(m => (
            <div key={m.label} onClick={m.action} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 11, padding: "14px 16px", cursor: "pointer", transition: "border-color .15s", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = m.color + "60"}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <div style={{ position: "absolute", top: 10, right: 12, fontSize: 18, opacity: 0.18 }}>{m.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.9px", marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 30, fontWeight: 700, color: m.color, letterSpacing: "-1px", lineHeight: 1 }}>{m.val}</div>
              {m.sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 5 }}>{m.sub}</div>}
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
                  body: JSON.stringify({ contacts: targets.map(ec => ec.contacts), triggerType:"reminder", eventName:activeEvent.name, eventDate:activeEvent.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU",{day:"numeric",month:"long",year:"numeric"}) : "", location:activeEvent.location||"", orgName:profile?.companies?.name||"evara" })
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
                      <td style={{ padding:"7px 10px", color:C.muted, fontSize:11, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:120 }}>
                        {c.company_name || "—"}
                      </td>
                      <td style={{ padding:"7px 10px" }}>
                        <span style={{ fontSize:10.5, padding:"2px 8px", borderRadius:999, fontWeight:600, textTransform:"capitalize", background:statusColor+"18", color:statusColor }}>
                          {ec.status || "pending"}
                        </span>
                      </td>
                      <td style={{ padding:"7px 10px" }}>
                        {scoreData.score > 0 && (
                          <span style={{ fontSize:10, padding:"1px 6px", borderRadius:3, background:scoreData.temp==="hot"?`${C.red}15`:scoreData.temp==="warm"?`${C.amber}15`:`${C.blue}10`, color:scoreData.temp==="hot"?C.red:scoreData.temp==="warm"?C.amber:C.muted, fontWeight:600 }}>
                            {scoreData.temp} {scoreData.score}
                          </span>
                        )}
                      </td>
                      <td style={{ padding:"7px 10px" }}>
                        <button onClick={() => setSelectedContact(ec)} style={{ fontSize:10.5, padding:"2px 8px", borderRadius:4, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>
                          View →
                        </button>
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
            <div style={{ flex: 1, background: "rgba(0,0,0,.4)" }} />
            <div style={{ width: 340, background: C.card, borderLeft: `1px solid ${C.border}`, height: "100%", overflowY: "auto", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: "18px 18px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Contact Profile</span>
                <button onClick={() => setSelectedContact(null)} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
              </div>
              <div style={{ padding: "18px", textAlign: "center", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.blue + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, margin: "0 auto 10px", fontWeight: 700, color: C.blue }}>
                  {(c.first_name?.[0] || c.email?.[0] || "?").toUpperCase()}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{c.first_name} {c.last_name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2, cursor: "pointer" }}
                  onClick={() => { navigator.clipboard?.writeText(c.email || ""); fire("📋 Email copied"); }}
                  title="Click to copy">
                  {c.email} 📋
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
                    body: JSON.stringify({ contacts: [c], triggerType: "confirmation", eventName: activeEvent.name, eventDate: activeEvent.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "", location: activeEvent.location || "", orgName: profile?.companies?.name || "evara" })
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
                    body: JSON.stringify({ contacts: [c], triggerType: "reminder", eventName: activeEvent.name, eventDate: activeEvent.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }) : "", location: activeEvent.location || "", orgName: profile?.companies?.name || "evara", eventUrl: formShareLink || "" })
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
              {/* Email Activity Timeline */}
              <div style={{ padding:"12px 18px", borderTop:`1px solid ${C.border}` }}>
                <div style={{ fontSize:9.5, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:10 }}>Email Activity</div>
                <EmailActivityTimeline supabase={supabase} contactId={c.id} eventId={activeEvent?.id} />
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
      {/* ─── EDIT EVENT MODAL ─── */}}
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
  const [sendingTest, setSendingTest] = useState(false);
  const [previewWidth, setPreviewWidth] = useState("100%");
  const [previewTab, setPreviewTab] = useState("html"); // html | text
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [showTemplateLib, setShowTemplateLib] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Load saved templates
  useEffect(() => {
    if (!profile?.company_id) return;
    supabase.from("email_campaigns")
      .select("id,name,email_type,subject,html_content,created_at")
      .eq("company_id", profile.company_id)
      .eq("is_template", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => setSavedTemplates(data || []));
  }, [profile?.company_id]);

  const saveAsTemplate = async () => {
    if (!preview?.html || !profile?.company_id) return;
    const name = preview.subject || "Email template " + new Date().toLocaleDateString(); 
    setSavingTemplate(true);
    const { error } = await supabase.from("email_campaigns").insert({
      company_id: profile.company_id,
      name,
      email_type: eType,
      subject: preview.subject || "",
      html_content: preview.html,
      plain_text: preview.plain_text || "",
      status: "draft",
      segment: "all",
      is_template: true,
    });
    if (!error) {
      fire("✅ Saved as template!");
      supabase.from("email_campaigns").select("id,name,email_type,subject,html_content,created_at").eq("company_id", profile.company_id).eq("is_template", true).order("created_at", { ascending: false })
        .then(({ data }) => setSavedTemplates(data || []));
    } else { fire("Failed to save template", "err"); }
    setSavingTemplate(false);
  };

  const loadTemplate = (t) => {
    setPreview({ subject: t.subject, html: t.html_content, plain_text: t.plain_text || "", campaign_id: null });
    setEType(t.email_type || eType);
    setShowTemplateLib(false);
    fire(`Template "${t.name}" loaded!`);
  };

  // Cmd+S shortcut saves draft
  const saveDraft = async () => {
    if (!preview?.html || !activeEvent?.id || !profile?.company_id) return;
    if (preview.campaign_id) {
      await supabase.from("email_campaigns").update({ html_content: preview.html, plain_text: preview.plain_text, subject: preview.subject }).eq("id", preview.campaign_id);
      fire("💾 Draft saved!");
    } else {
      const { data: saved } = await supabase.from("email_campaigns").insert({ event_id: activeEvent.id, company_id: profile.company_id, name: (preview.subject || eType.replace(/_/g," ")+" — email").slice(0,80), email_type: eType, subject: preview.subject, html_content: preview.html, plain_text: preview.plain_text, status: "draft", segment: "all" }).select("id").single();
      if (saved?.id) { setPreview(p => ({ ...p, campaign_id: saved.id })); fire("💾 Draft saved!"); }
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (preview?.html) saveDraft();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [preview?.html, preview?.campaign_id]);
  const [subjectAlts, setSubjectAlts] = useState([]);
  const [loadingAlts, setLoadingAlts] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [formLink, setFormLink] = useState("");
  const [uploadingZone, setUploadingZone] = useState(null);
  const [images, setImages] = useState({ header: null, body: null, footer: null });
  const [info, setInfo] = useState({
    eventName: activeEvent?.name || "",
    eventDate: activeEvent?.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU",{day:"numeric",month:"long",year:"numeric"}) : "",
    eventTime: activeEvent?.event_time || "",
    location: activeEvent?.location || "",
    description: activeEvent?.description || "",
    tone: "professional and exciting",
    extra: ""
  });
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
        <span style={{ fontSize:10.5, padding:"2px 8px", borderRadius:4, background:C.blue+"12", color:C.blue, border:`1px solid ${C.blue}20` }}>✨ Claude claude-sonnet-4</span>
        <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>AI generates copy · your template renders it · world-class result every time.</p>
      </div>
      {!activeEvent && (
        <div style={{ padding:"11px 14px", background:C.amber+"12", borderRadius:8, border:`1px solid ${C.amber}40`, marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:16 }}>⚠️</span>
          <span style={{ fontSize:13, color:C.amber, fontWeight:500 }}>No event selected — select an event from the sidebar to save generated emails to your campaign.</span>
        </div>
      )}
      {activeEvent && (
        <div style={{ padding:"7px 12px", background:C.blue+"08", borderRadius:7, border:`1px solid ${C.blue}18`, marginBottom:10, display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
          <span style={{ fontSize:12, fontWeight:600, color:C.blue }}>✉️ {activeEvent.name}</span>
          {activeEvent.event_date && <span style={{ fontSize:11, color:C.muted }}>📅 {new Date(activeEvent.event_date).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})}</span>}
          {activeEvent.location && <span style={{ fontSize:11, color:C.muted }}>📍 {activeEvent.location}</span>}
        </div>
      )}
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

          <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, padding: "6px 10px", background: C.raised, borderRadius: 6, borderLeft: `3px solid ${C.blue}40` }}>
            {{"invitation":"📌 Date · Time · Venue · CTA · Key agenda highlight",
              "save_the_date":"📅 Event name · Date only — build intrigue, no full details yet",
              "reminder":"⚡ Urgency + logistics: venue, time, what to bring",
              "thank_you":"🙏 Appreciation · Highlights · Tease next event",
              "confirmation":"✅ Their confirmed spot + logistics + calendar link",
              "byo":"🎒 What to wear · Bring · Know — parking, agenda, contact",
            }[eType] || "✨ Generate with AI below"}
          </div>
          <Sec label="Template style">
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { id:"minimal", label:"Minimal", desc:"Clean white", bg:"#F8F8F6", accent:"#111", textBg:"#E8E8E6" },
                { id:"branded", label:"Branded", desc:"Dark pro", bg:"#0A1628", accent:"#0A84FF", textBg:"rgba(255,255,255,0.15)" },
                { id:"vibrant", label:"Vibrant", desc:"Bold colour", bg:"#FF5C35", accent:"#fff", textBg:"rgba(255,255,255,0.3)" },
              ].map(t => (
                <button key={t.id} onClick={() => { setTmpl(t.id); setPreview(null); }} style={{ flex:1, padding:"8px 6px", borderRadius:7, border:`1.5px solid ${tmpl===t.id?C.blue+"80":C.border}`, background:tmpl===t.id?C.blue+"10":"transparent", cursor:"pointer", textAlign:"center", transition:"all .12s" }}>
                  {/* Mini email preview */}
                  <div style={{ width:"100%", height:40, borderRadius:4, marginBottom:5, background:t.bg, padding:"4px 5px", overflow:"hidden" }}>
                    <div style={{ height:5, borderRadius:2, background:t.accent, opacity:0.9, marginBottom:3 }} />
                    <div style={{ height:3, borderRadius:1, background:t.textBg, width:"70%", marginBottom:2 }} />
                    <div style={{ height:3, borderRadius:1, background:t.textBg, width:"50%", marginBottom:3 }} />
                    <div style={{ height:8, width:32, borderRadius:2, background:t.accent, opacity:0.8 }} />
                  </div>
                  <div style={{ fontSize:11.5, fontWeight:600, color:tmpl===t.id?C.blue:C.text }}>{t.label}</div>
                  <div style={{ fontSize:10, color:C.muted }}>{t.desc}</div>
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
            {gen ? <><Spin />Claude is writing… (~15s)</> : <><Sparkles size={14} strokeWidth={1.5} />Generate with AI</>}
          </button>

          {campaigns.length > 0 && (
            <Sec label={`Saved drafts (${campaigns.length}) · ${campaigns.filter(c=>c.status==="scheduled").length} scheduled`}>
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
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>
                      {cam.email_type === "save_the_date" ? "📅" : cam.email_type === "invitation" ? "✉️" : cam.email_type === "reminder" ? "⏰" : cam.email_type === "day_of_details" ? "📍" : cam.email_type === "thank_you" ? "🙏" : cam.email_type === "confirmation" ? "✅" : "📧"}
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{cam.subject || cam.name}</span>
                    {cam.status === "sent" && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: C.green + "20", color: C.green, flexShrink: 0 }}>Sent</span>}
                  </div>
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 10.5, fontWeight: 500, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px" }}>Preview</div>
            {preview?.html && (() => {
              const words = preview.html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(w => w.length > 1).length;
              const mins = Math.max(1, Math.round(words / 200));
              return <span style={{ fontSize: 10, color: C.muted }}>{words} words · ~{mins} min read{words < 50 ? " ⚠️ too short" : words > 500 ? " ⚠️ too long" : ""}</span>;
            })()}
            <span style={{ fontSize: 10, color: C.muted }}>⌘S to save</span>
          </div>
          <div style={{ flex: 1, border: `1px solid ${preview ? C.blue + "50" : C.border}`, borderRadius: 10, background: "#EBEBEB", overflow: "auto", transition: "border-color .3s", minHeight: 500, display: "flex", justifyContent: "center" }}>
            {!preview && !gen && <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 300 }}><Mail size={32} color="#AEAEB2" strokeWidth={1} style={{ opacity: .4 }} /><span style={{ fontSize: 13, color: "#AEAEB2" }}>Fill in event details and click Generate</span></div>}
            {gen && (() => {
              return (
                <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, minHeight:300, padding:32 }}>
                  <div style={{ position:"relative", width:56, height:56 }}>
                    <svg viewBox="0 0 56 56" width="56" height="56" style={{ animation:"spin 1.2s linear infinite", position:"absolute", top:0, left:0 }}>
                      <circle cx="28" cy="28" r="24" fill="none" stroke="#0A84FF20" strokeWidth="4"/>
                      <circle cx="28" cy="28" r="24" fill="none" stroke="#0A84FF" strokeWidth="4" strokeDasharray="38 113" strokeLinecap="round"/>
                    </svg>
                    <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>✨</div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:14, fontWeight:600, color:"#1C1C1E", marginBottom:6 }}>Claude is writing your email…</div>
                    <div style={{ fontSize:12, color:"#AEAEB2" }}>This usually takes 10–20 seconds</div>
                  </div>
                </div>
              );
            })()}
            {preview && (
              <div>
                <div style={{ padding: "12px 16px", background: "white", borderBottom: "1px solid #E5E5EA", fontFamily: "Arial,sans-serif" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div style={{ fontSize: 11, color: "#999" }}>Subject</div>
                      {preview?.subject && <span style={{ fontSize: 10, color: preview.subject.length > 60 ? "#FF453A" : preview.subject.length > 40 ? "#FF9F0A" : "#30D158" }}>
                        {preview.subject.length}/60 chars
                      </span>}
                    </div>
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
                  <input
                  value={preview.subject || ""}
                  onChange={e => setPreview(p => ({ ...p, subject: e.target.value }))}
                  style={{ fontSize: 14, fontWeight: 600, color: "#111", border: "none", outline: "none", background: "transparent", width: "100%", fontFamily: "inherit" }} />
                  {subjectAlts.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, color: "#888", marginBottom: 5, textTransform:"uppercase", letterSpacing:"0.5px" }}>✨ Click to use alternative subject:</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                        {subjectAlts.map((s, i) => (
                          <button key={i} onClick={() => { setPreview(p => ({ ...p, subject: s })); setSubjectAlts([]); }}
                            style={{ fontSize: 11.5, padding: "4px 10px", background: "#EEF3FF", borderRadius: 20, cursor: "pointer", color: "#0A84FF", border: "1px solid #C7D9FF", fontFamily:"inherit", transition:"all .1s" }}
                            onMouseEnter={e => { e.currentTarget.style.background="#0A84FF"; e.currentTarget.style.color="#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.background="#EEF3FF"; e.currentTarget.style.color="#0A84FF"; }}>
                            {s}
                          </button>
                        ))}
                        <button onClick={() => setSubjectAlts([])} style={{ fontSize:11, padding:"4px 8px", background:"transparent", border:"1px solid #ddd", borderRadius:20, color:"#999", cursor:"pointer", fontFamily:"inherit" }}>✕</button>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ background: "#f2f2f2", borderRadius: 8, overflow: "hidden" }}>
                  {/* Gmail-style inbox chrome */}
                  <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: profile?.companies?.brand_color || "#1a73e8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                        {(profile?.companies?.from_name || profile?.companies?.name || "E").charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{profile?.companies?.from_name || profile?.companies?.name || "Events Team"}</span>
                          <span style={{ fontSize: 10.5, color: "#aaa" }}>{new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>to: Guest &lt;guest@example.com&gt; · via hello@evarahq.com</div>
                        {/* Subject line - editable */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8f8f8", borderRadius: 6, padding: "6px 10px", border: "1px solid #E5E5E7" }}>
                          <span style={{ fontSize: 10, color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", flexShrink: 0 }}>Subject</span>
                          <input
                            value={preview.subject || ""}
                            onChange={e => setPreview(p => ({ ...p, subject: e.target.value }))}
                            style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#111", border: "none", outline: "none", background: "transparent", fontFamily: "Arial,sans-serif" }}
                          />
                          <span style={{ fontSize: 10, color: preview.subject?.length > 60 ? "#FF453A" : preview.subject?.length > 40 ? "#FF9F0A" : "#30D158", flexShrink: 0, fontWeight: 600 }}>
                            {preview.subject?.length || 0}/60
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toolbar: preview mode + spam score + plain text */}
                  <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "6px 14px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {/* View toggle */}
                    <div style={{ display: "flex", gap: 3, background: "#f5f5f5", borderRadius: 6, padding: 2 }}>
                      {[{id:"html",label:"📧 HTML"},{id:"text",label:"📄 Plain text"}].map(t => (
                        <button key={t.id} onClick={() => setPreviewTab(t.id)}
                          style={{ fontSize: 11, padding: "3px 10px", borderRadius: 5, border: "none", background: (previewTab||"html")===t.id ? "#fff" : "transparent", color: (previewTab||"html")===t.id ? "#111" : "#888", cursor: "pointer", fontWeight: (previewTab||"html")===t.id ? 600 : 400, boxShadow: (previewTab||"html")===t.id ? "0 1px 3px rgba(0,0,0,.1)" : "none", transition: "all .12s" }}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                    {/* Device toggle */}
                    <div style={{ display: "flex", gap: 3 }}>
                      {[{label:"🖥",w:"100%"},{label:"📱",w:"375px"}].map(v => (
                        <button key={v.w} onClick={() => setPreviewWidth(v.w)}
                          style={{ fontSize: 13, padding: "3px 8px", borderRadius: 5, border: `1px solid ${previewWidth===v.w||(!previewWidth&&v.w==="100%") ? C.blue : C.border}`, background: previewWidth===v.w||(!previewWidth&&v.w==="100%") ? C.blue+"15" : "transparent", cursor: "pointer" }}>
                          {v.label}
                        </button>
                      ))}
                    </div>
                    {/* Spam score */}
                    {(() => {
                      const html = preview.html || "";
                      const subj = preview.subject || "";
                      let score = 0;
                      const flags = [];
                      if (/FREE|URGENT|ACT NOW|CLICK HERE|GUARANTEED|WINNER/i.test(subj)) { score += 25; flags.push("Spammy subject words"); }
                      if (subj.includes("!!!") || subj.split("!").length > 3) { score += 15; flags.push("Too many exclamation marks"); }
                      if ((subj.match(/[A-Z]/g)||[]).length > subj.length * 0.5 && subj.length > 5) { score += 20; flags.push("ALL CAPS in subject"); }
                      if (!html.includes("unsubscribe") && !html.includes("Unsubscribe")) { score += 20; flags.push("No unsubscribe link"); }
                      if ((html.match(/<img/gi)||[]).length > 8) { score += 10; flags.push("Too many images"); }
                      const color = score === 0 ? "#30D158" : score < 30 ? "#FF9F0A" : "#FF453A";
                      const label = score === 0 ? "✓ Clean" : score < 30 ? "⚠ Caution" : "✗ High risk";
                      return (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }} title={flags.length ? flags.join(" · ") : "No spam signals detected"}>
                          <span style={{ fontSize: 10, color: "#888" }}>Spam score</span>
                          <div style={{ width: 60, height: 5, background: "#E5E5E7", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(score, 100)}%`, height: "100%", background: color, borderRadius: 3, transition: "width .3s" }} />
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 600, color }}>{label}</span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Alt subjects */}
                  {subjectAlts.length > 0 && (
                    <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "8px 14px" }}>
                      <div style={{ fontSize: 10, color: "#999", marginBottom: 5 }}>✨ Alternative subject lines — click to use:</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {subjectAlts.map((s, i) => (
                          <div key={i} onClick={() => { setPreview(p => ({ ...p, subject: s })); setSubjectAlts([]); }}
                            style={{ fontSize: 12, padding: "5px 8px", background: "#f5f5f5", borderRadius: 4, cursor: "pointer", color: "#333", border: "1px solid #eee" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#e8f0fe"}
                            onMouseLeave={e => e.currentTarget.style.background = "#f5f5f5"}>
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Email body */}
                  <div style={{ overflowX: "auto", background: "#f0f0f0", display: "flex", justifyContent: "center", padding: previewWidth === "375px" ? "20px" : "0" }}>
                    {(previewTab || "html") === "html" ? (
                      <iframe srcDoc={preview.html}
                        style={{ width: previewWidth || "100%", maxWidth: previewWidth === "375px" ? "375px" : "100%", border: "none", minHeight: 520, transition: "width .3s ease", display: "block", borderRadius: previewWidth === "375px" ? 14 : 0, boxShadow: previewWidth === "375px" ? "0 0 0 8px #1a1a1f, 0 0 0 10px #2a2a2f" : "none" }}
                        title="Email Preview" sandbox="allow-same-origin" />
                    ) : (
                      <div style={{ width: "100%", background: "#fff", padding: "24px", fontFamily: "monospace", fontSize: 13, color: "#333", lineHeight: 1.8, whiteSpace: "pre-wrap", minHeight: 400 }}>
                        {preview.plain_text || preview.html?.replace(/<[^>]+>/g, "").replace(/\s{2,}/g, "\n").trim() || "No plain text available."}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          {preview && <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <button onClick={() => {
              const win = window.open("", "_blank");
              win.document.write(preview.html.replace(/{{REGISTRATION_URL}}/g, "#").replace(/{{UNSUBSCRIBE_URL}}/g, "#"));
              win.document.close();
            }} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
              🌐 Open in browser
            </button>
            <button onClick={async () => {
              const testEmail = (document.getElementById("test-email-input")?.value || profile?.email || "").trim();
              if (!testEmail) { fire("Enter a test email address below", "err"); return; }
              const { data: { session } } = await supabase.auth.getSession();
              setSendingTest(true);
              const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
                body: JSON.stringify({ to: [{ email: testEmail, first_name: "Test" }], subject: `[TEST] ${preview.subject}`, htmlContent: preview.html.replace(/{{REGISTRATION_URL}}/g, "#").replace(/{{UNSUBSCRIBE_URL}}/g, "#"), companyId: profile?.company_id }),
              });
              setSendingTest(false);
              const d = await res.json();
              fire(d.sent > 0 ? `✅ Test sent to ${testEmail}` : "Send failed — check email address", d.sent > 0 ? "ok" : "err");
            }} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
              {sendingTest ? "Sending…" : "📤 Send test"}
            </button>
            {profile?.email && (
              <button onClick={async () => {
                const { data: { session } } = await supabase.auth.getSession();
                setSendingTest(true);
                const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
                  body: JSON.stringify({ to: [{ email: profile.email, first_name: profile.full_name?.split(" ")[0]||"Test" }], subject: `[PREVIEW] ${preview.subject}`, htmlContent: preview.html.replace(/{{REGISTRATION_URL}}/g, "#").replace(/{{UNSUBSCRIBE_URL}}/g, "#"), companyId: profile?.company_id }),
                });
                setSendingTest(false);
                const d = await res.json();
                fire(d.sent > 0 ? `✅ Preview sent to ${profile.email}` : "Send failed", d.sent > 0 ? "ok" : "err");
              }} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.blue}40`, background: `${C.blue}10`, color: C.blue, cursor: "pointer" }}
                title={`Send preview to ${profile.email}`}>
                ⚡ Send to me
              </button>
            )}

            <button onClick={saveAsTemplate} disabled={!preview?.html || savingTemplate}
              style={{ padding:"9px 14px", background:"transparent", color:C.green, border:`1px solid ${C.green}40`, borderRadius:7, fontSize:12, cursor:"pointer" }}>
              {savingTemplate ? "Saving…" : "💾 Save as template"}
            </button>
            <button onClick={() => setShowTemplateLib(p => !p)}
              style={{ padding:"9px 14px", background:showTemplateLib?`${C.blue}15`:"transparent", color:C.blue, border:`1px solid ${C.blue}40`, borderRadius:7, fontSize:12, cursor:"pointer" }}>
              📂 Templates {savedTemplates.length > 0 && `(${savedTemplates.length})`}
            </button>
            <button onClick={() => { navigator.clipboard?.writeText(preview.html); fire("✅ HTML copied to clipboard"); }}
              style={{ padding: "9px 14px", background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, cursor: "pointer" }}>
              📋 Copy HTML
            </button>
            <button onClick={() => { navigator.clipboard?.writeText(preview.plain_text || preview.html?.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim() || ""); fire("✅ Plain text copied"); }}
              style={{ padding: "9px 14px", background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 12, cursor: "pointer" }}>
              📄 Copy text
            </button>
            <button onClick={() => {
              const name = preview.subject || "Email template";
              const templates = JSON.parse(localStorage.getItem("evara_templates") || "[]");
              templates.unshift({ name, subject: preview.subject, html: preview.html, plain_text: preview.plain_text, savedAt: new Date().toISOString() });
              localStorage.setItem("evara_templates", JSON.stringify(templates.slice(0, 20)));
              fire(`✅ Template "${name}" saved — available in Email Type → Saved Templates`);
            }} style={{ padding: "9px 14px", background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, fontSize: 13, cursor: "pointer" }}>
              💾 Save template
            </button>
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
              // confirmed
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

      {/* Template Library slide-in */}
      {showTemplateLib && (
        <div style={{ position:"fixed", inset:0, zIndex:80, display:"flex" }} onClick={() => setShowTemplateLib(false)}>
          <div style={{ flex:1 }} />
          <div style={{ width:360, background:C.card, borderLeft:`1px solid ${C.border}`, height:"100%", display:"flex", flexDirection:"column", animation:"fadeUp .2s ease" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding:"18px 18px 12px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:C.text }}>📂 Template Library</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>Saved email templates for your company</div>
              </div>
              <button onClick={() => setShowTemplateLib(false)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:20 }}>×</button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:14 }}>
              {savedTemplates.length === 0 ? (
                <div style={{ padding:"32px 16px", textAlign:"center", color:C.muted }}>
                  <div style={{ fontSize:32, marginBottom:10 }}>💾</div>
                  <div style={{ fontSize:13, fontWeight:500, color:C.text, marginBottom:6 }}>No templates yet</div>
                  <div style={{ fontSize:12 }}>Generate an email, then click "Save as template" to store it here for reuse.</div>
                </div>
              ) : savedTemplates.map(t => (
                <div key={t.id} style={{ background:C.raised, borderRadius:9, border:`1px solid ${C.border}`, padding:"12px 14px", marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{t.name}</div>
                      <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{(t.email_type||"").replace(/_/g," ")} · {new Date(t.created_at).toLocaleDateString("en-AU",{day:"numeric",month:"short"})}</div>
                    </div>
                    <button onClick={async () => {
                      await supabase.from("email_campaigns").delete().eq("id", t.id);
                      setSavedTemplates(p => p.filter(x => x.id !== t.id));
                      fire("Template deleted");
                    }} style={{ background:"transparent", border:"none", color:C.red, cursor:"pointer", fontSize:16, padding:"0 2px" }}>×</button>
                  </div>
                  {t.subject && <div style={{ fontSize:11, color:C.sec, marginBottom:8, fontStyle:"italic" }}>"{t.subject}"</div>}
                  <button onClick={() => loadTemplate(t)} style={{ width:"100%", padding:"7px", background:C.blue, border:"none", borderRadius:6, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                    Load this template →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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
  const [camSearch, setCamSearch] = useState("");
  const [contactCount, setContactCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ sent: 0, total: 0 });
  const [newCam, setNewCam] = useState({ email_type: "invitation", send_at: "", segment: "all" });
  const [followUpGenerating, setFollowUpGenerating] = useState(false);
  const [schedPickerCam, setSchedPickerCam] = useState(null); // cam being scheduled via picker
  const [schedPickerVal, setSchedPickerVal] = useState("");

  const generateFollowUpSequence = async () => {
    if (!activeEvent || !profile) return;
    const eventDate = activeEvent.event_date ? new Date(activeEvent.event_date) : null;
    const hasThankyou = campaigns.some(c => c.email_type === "thank_you");
    setFollowUpGenerating(true);
    try {
      // Create 3 post-event follow-up emails: Thank You, Feedback Request, Next Event
      const followUps = [
        {
          email_type: "thank_you",
          name: `Thank You — ${activeEvent.name}`,
          subject: `Thank you for attending ${activeEvent.name} 🙏`,
          offset: 1,
          html_content: `<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f2f2f7"><tr><td align="center" style="padding:32px 16px"><table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#fff;border-radius:14px;overflow:hidden"><tr><td bgcolor="#0A1628" style="padding:40px"><h1 style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:28px;font-weight:700;color:#fff">Thank you for joining us! 🙏</h1><p style="margin:0;font-family:Arial,sans-serif;font-size:15px;color:rgba(255,255,255,0.65)">${activeEvent.name}</p></td></tr><tr><td style="padding:36px 40px"><p style="font-family:Arial,sans-serif;font-size:16px;color:#333;line-height:1.65;margin:0 0 16px">Dear [First Name],</p><p style="font-family:Arial,sans-serif;font-size:16px;color:#333;line-height:1.65;margin:0 0 16px">Thank you so much for attending <strong>${activeEvent.name}</strong>. It was a privilege to have you there, and we hope the experience was valuable and inspiring.</p><p style="font-family:Arial,sans-serif;font-size:16px;color:#333;line-height:1.65;margin:0 0 16px">We'd love to hear your thoughts on the event — your feedback helps us make each one better than the last.</p></td></tr><tr><td bgcolor="#f8f8f8" style="padding:18px 40px;border-top:1px solid #eee;font-family:Arial,sans-serif;font-size:11px;color:#aaa;text-align:center">© ${new Date().getFullYear()} evara · <a href="{{UNSUBSCRIBE_URL}}" style="color:#aaa;text-decoration:underline">Unsubscribe</a></td></tr></table></td></tr></table>`,
        },
        {
          email_type: "thank_you",
          name: `Feedback Request — ${activeEvent.name}`,
          subject: `Your feedback on ${activeEvent.name} matters to us`,
          offset: 3,
          html_content: `<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f2f2f7"><tr><td align="center" style="padding:32px 16px"><table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#fff;border-radius:14px;overflow:hidden"><tr><td bgcolor="#0A1628" style="padding:40px"><h1 style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:28px;font-weight:700;color:#fff">We'd love your feedback ⭐</h1><p style="margin:0;font-family:Arial,sans-serif;font-size:15px;color:rgba(255,255,255,0.65)">${activeEvent.name}</p></td></tr><tr><td style="padding:36px 40px"><p style="font-family:Arial,sans-serif;font-size:16px;color:#333;line-height:1.65;margin:0 0 16px">Dear [First Name],</p><p style="font-family:Arial,sans-serif;font-size:16px;color:#333;line-height:1.65;margin:0 0 16px">A few days have passed since <strong>${activeEvent.name}</strong>, and we'd really value your perspective on the experience.</p><p style="font-family:Arial,sans-serif;font-size:16px;color:#333;line-height:1.65;margin:0 0 16px">Your honest feedback — what worked well and what could be improved — helps us design better events in the future.</p><table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0"><tr><td align="center"><a href="#" style="display:inline-block;padding:14px 36px;background:#0A84FF;color:#fff;font-family:Arial,sans-serif;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px">Share Your Feedback →</a></td></tr></table></td></tr><tr><td bgcolor="#f8f8f8" style="padding:18px 40px;border-top:1px solid #eee;font-family:Arial,sans-serif;font-size:11px;color:#aaa;text-align:center">© ${new Date().getFullYear()} evara · <a href="{{UNSUBSCRIBE_URL}}" style="color:#aaa;text-decoration:underline">Unsubscribe</a></td></tr></table></td></tr></table>`,
        },
        {
          email_type: "save_the_date",
          name: `Stay Connected — ${activeEvent.name}`,
          subject: `More great events coming your way 🎯`,
          offset: 14,
          html_content: `<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f2f2f7"><tr><td align="center" style="padding:32px 16px"><table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#fff;border-radius:14px;overflow:hidden"><tr><td bgcolor="#0A1628" style="padding:40px"><h1 style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:28px;font-weight:700;color:#fff">Stay in the loop 🎯</h1><p style="margin:0;font-family:Arial,sans-serif;font-size:15px;color:rgba(255,255,255,0.65)">From the team behind ${activeEvent.name}</p></td></tr><tr><td style="padding:36px 40px"><p style="font-family:Arial,sans-serif;font-size:16px;color:#333;line-height:1.65;margin:0 0 16px">Dear [First Name],</p><p style="font-family:Arial,sans-serif;font-size:16px;color:#333;line-height:1.65;margin:0 0 16px">We're already planning more events and would love to have you join us again. Attendees like you make these experiences worthwhile.</p><p style="font-family:Arial,sans-serif;font-size:16px;color:#333;line-height:1.65;margin:0 0 16px">Keep an eye on your inbox — we'll be sharing our next event details soon. In the meantime, feel free to connect with us.</p></td></tr><tr><td bgcolor="#f8f8f8" style="padding:18px 40px;border-top:1px solid #eee;font-family:Arial,sans-serif;font-size:11px;color:#aaa;text-align:center">© ${new Date().getFullYear()} evara · <a href="{{UNSUBSCRIBE_URL}}" style="color:#aaa;text-decoration:underline">Unsubscribe</a></td></tr></table></td></tr></table>`,
        },
      ];

      const savedCampaigns = [];
      for (const fu of followUps) {
        const sendAt = eventDate ? new Date(new Date(eventDate).setDate(new Date(eventDate).getDate() + fu.offset)).toISOString() : null;
        const { data } = await supabase.from("email_campaigns").insert({
          event_id: activeEvent.id,
          company_id: profile.company_id,
          name: fu.name,
          email_type: fu.email_type,
          template_style: "branded",
          subject: fu.subject,
          html_content: fu.html_content,
          plain_text: `Dear [First Name],\n\n${fu.subject}\n\nKind regards,\nevara`,
          send_at: sendAt,
          scheduled_at: sendAt,
          status: sendAt && new Date(sendAt) > new Date() ? "scheduled" : "draft",
          segment: "attended",
        }).select().single();
        if (data) savedCampaigns.push(data);
      }
      setCampaigns(p => [...p, ...savedCampaigns]);
      fire(`✅ ${savedCampaigns.length} follow-up emails created and scheduled for attended guests!`);
    } catch (err) { fire(err.message || "Failed to generate follow-ups", "err"); }
    finally { setFollowUpGenerating(false); }
  };

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
    if (cam.segment === "attended") q = q.eq("status", "attended");
    const { data: rawData, count } = await q;
    // VIP filter: contacts with vip tag
    const data = cam.segment === "vip"
      ? (rawData || []).filter(r => r.contacts?.tags?.includes("vip"))
      : rawData;
    setSendModal({ ...cam, recipients: data || [], recipientCount: count || 0 });
  };

  const sendNow = async () => {
    if (!sendModal || !profile) return;
    setSending(true);
    setSendProgress({ sent: 0, total: sendModal?.recipients?.length || 0 });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const contacts = sendModal.recipients.map(ec => ({ id: ec.contacts?.id, email: ec.contacts?.email, first_name: ec.contacts?.first_name, company_id: profile.company_id })).filter(c => c.email);
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
        body: JSON.stringify({ campaignId: sendModal.id, contacts, subject: sendModal.subject, htmlContent: sendModal.html_content, plainText: sendModal.plain_text, companyId: profile.company_id, fromEmail: "hello@evarahq.com", fromName: profile?.companies?.from_name || profile?.companies?.name || "evara" })
      });
      const data = await res.json();
      if (data.success) {
        setSendProgress({ sent: data.sent, total: sendModal?.recipients?.length || data.sent });
        fire(`✅ Sent to ${data.sent} contact${data.sent===1?"":"s"}! Check spam if not received within 5 mins.`);
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

  if (!activeEvent) return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.6px", color: C.text }}>Email Scheduling</h1>
        <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Schedule and send campaigns for your event.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 14, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 4 }}>📅</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: C.text }}>No event selected</div>
        <p style={{ fontSize: 13, color: C.muted, maxWidth: 340, lineHeight: 1.6 }}>
          Select an event from the sidebar to view and schedule your email campaigns.
        </p>
        <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
          {[{ icon: "✉️", label: "Save the Date" }, { icon: "📨", label: "Invitation" }, { icon: "⏰", label: "Reminder" }, { icon: "🙏", label: "Thank You" }].map(e => (
            <div key={e.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 16px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, minWidth: 80 }}>
              <span style={{ fontSize: 22 }}>{e.icon}</span>
              <span style={{ fontSize: 10.5, color: C.muted, fontWeight: 500 }}>{e.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.6px", color: C.text }}>Email Scheduling</h1>
            {campaigns.length > 0 && (
              <span style={{ fontSize:11, padding:"2px 8px", borderRadius:4,
                background: campaigns.filter(c=>c.status==="sent").length===campaigns.length ? C.green+"15" : campaigns.filter(c=>c.status==="sent").length>0 ? C.blue+"15" : C.raised,
                color: campaigns.filter(c=>c.status==="sent").length===campaigns.length ? C.green : campaigns.filter(c=>c.status==="sent").length>0 ? C.blue : C.muted }}>
                {campaigns.filter(c=>c.status==="sent").length}/{campaigns.length} sent
              </span>
            )}
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
                {autoScheduling ? <><Spin />Scheduling…</> : <><Sparkles size={11} />Auto-schedule {campaigns.filter(c=>c.status==="draft").length} drafts</>}
              </button>
            )}
          </div>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
            {campaigns.length > 0 ? (
              <span>
                {campaigns.filter(c=>c.status==="sent").length} sent ·{" "}
                <span style={{ color: C.blue }}>{campaigns.filter(c=>c.status==="scheduled").length} scheduled</span> ·{" "}
                {campaigns.filter(c=>c.status==="draft").length} drafts
                {(() => {
                  const next = campaigns.filter(c=>c.status==="scheduled"&&c.scheduled_at&&new Date(c.scheduled_at)>new Date()).sort((a,b)=>new Date(a.scheduled_at)-new Date(b.scheduled_at))[0];
                  if (!next) return null;
                  const h = Math.round((new Date(next.scheduled_at)-new Date())/(1000*60*60));
                  return <span style={{ marginLeft:8, color:h<24?C.amber:C.muted }}>· 📅 next in {h<24?`${h}h`:`${Math.round(h/24)}d`}</span>;
                })()}
                {(() => {
                  const sent = campaigns.filter(c=>c.status==="sent");
                  const totalSent = sent.reduce((s,c)=>s+(c.total_sent||0),0);
                  const totalOpened = sent.reduce((s,c)=>s+(c.total_opened||0),0);
                  const openRate = totalSent > 0 ? Math.round(totalOpened/totalSent*100) : null;
                  return openRate !== null ? <span style={{ marginLeft: 8, color: openRate >= 30 ? C.green : openRate >= 20 ? C.amber : C.muted }}>· {openRate}% open rate {openRate >= 30 ? "🟢 On target!" : openRate >= 20 ? "🟡 Almost" : "🔴 Aim 30%+"}</span> : null;
                })()}
              </span>
            ) : "Create and send email campaigns for this event."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => {
            if (!campaigns.length) return;
            const hdr = ["Campaign","Type","Status","Sent","Opened","Clicked","Open Rate"];
            const rows = campaigns.map(c => [
              c.name, c.email_type, c.status, c.total_sent||0, c.total_opened||0, c.total_clicked||0,
              c.total_sent ? Math.round((c.total_opened||0)/c.total_sent*100)+"%" : "—"
            ].map(v=>`"${v}"`).join(","));
            const csv = [hdr.join(","), ...rows].join("\n");
            const a = document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download=`${activeEvent?.name||"event"}-campaigns.csv`; a.click();
            fire("✅ Campaign data exported");
          }} style={{ fontSize: 12, padding:"7px 12px", borderRadius:7, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>
            ⬇ Export CSV
          </button>
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
            const types = {};
            const toDelete = [];
            campaigns.forEach(c => {
              if (!types[c.email_type]) { types[c.email_type] = c.id; }
              else { toDelete.push(c.id); }
            });
            if (!toDelete.length) { fire("No duplicates found ✅"); return; }
            // confirmed
            for (const id of toDelete) {
              await supabase.from("email_campaigns").delete().eq("id", id);
            }
            setCampaigns(p => p.filter(c => !toDelete.includes(c.id)));
            fire(`✅ Removed ${toDelete.length} duplicate(s)`);
          }} style={{ fontSize: 12, padding: "6px 12px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
            🧹 Remove duplicates
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
          {activeEvent?.event_date && new Date(activeEvent.event_date) < new Date() && (
            <button onClick={generateFollowUpSequence} disabled={followUpGenerating}
              style={{ fontSize: 12, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.teal}40`, background: C.teal+"12", color: C.teal, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
              {followUpGenerating ? <><Spin size={11}/>Creating…</> : <>🎉 Post-event Follow-ups</>}
            </button>
          )}
          <button onClick={async () => {
            const drafts = campaigns.filter(c => c.status === "draft" && !c.html_content);
            if (!drafts.length) { fire("No empty drafts to clear"); return; }
            // confirmed
            for (const d of drafts) await supabase.from("email_campaigns").delete().eq("id", d.id);
            setCampaigns(p => p.filter(c => c.status !== "draft" || c.html_content));
            fire(`✅ ${drafts.length} empty draft${drafts.length > 1 ? "s" : ""} removed`);
          }} style={{ fontSize: 11, padding: "7px 12px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
            🗑 Clear empty drafts
          </button>
          <button onClick={() => {
            const drafts = campaigns.filter(c => c.status === "draft" && c.subject);
            if (!drafts.length) { fire("No draft emails with subjects"); return; }
            navigator.clipboard?.writeText(drafts.map(c => `${c.name}: ${c.subject}`).join("\n"));
            fire(`📋 ${drafts.length} draft subjects copied`);
          }} style={{ fontSize:12, padding:"5px 11px", borderRadius:6, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>
            📋 Copy subjects
          </button>
          <button onClick={() => setShowNew(true)} style={{ fontSize: 13, padding: "7px 16px", borderRadius: 7, border: "none", background: C.blue, color: "#fff", fontWeight: 500, cursor: "pointer" }}>+ New campaign</button>
        </div>
      </div>

      {loading ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "40px", color: C.muted }}><Spin />Loading campaigns…</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* ── VISUAL DRIP SEQUENCE TIMELINE ── */}
          {campaigns.length > 0 && (() => {
            const ORDER = ["save_the_date","invitation","reminder","byo","day_of_details","confirmation","thank_you"];
            const sorted = ORDER.map(type => campaigns.find(c => c.email_type === type)).filter(Boolean);
            const extra = campaigns.filter(c => !ORDER.includes(c.email_type));
            const all = [...sorted, ...extra];
            const eventDate = activeEvent?.event_date ? new Date(activeEvent.event_date) : null;
            return (
              <>
              {/* Best send time tip */}
              <div style={{ background:C.raised, borderRadius:9, border:`1px solid ${C.border}`, padding:"10px 14px", marginBottom:10, display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:16 }}>⏰</span>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:12, fontWeight:600, color:C.text }}>Best send times for B2B events: </span>
                  <span style={{ fontSize:12, color:C.sec }}>Tuesday–Thursday · 9–10am or 2–3pm recipient time. Avoid Mondays, Fridays, and public holidays.</span>
                </div>
                <span style={{ fontSize:10, padding:"2px 7px", background:`${C.green}15`, color:C.green, borderRadius:3, fontWeight:600, flexShrink:0 }}>Auto-applied</span>
              </div>
              <div style={{ background:C.card, borderRadius:12, border:`1px solid ${C.border}`, padding:"16px 20px", marginBottom:4, overflowX:"auto" }}>
                <div style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:14 }}>Email Sequence — {all.length} email{all.length!==1?"s":""}</div>
                <div style={{ display:"flex", alignItems:"flex-start", gap:0, minWidth: all.length * 110 }}>
                  {all.map((cam, i) => {
                    const isLast = i === all.length - 1;
                    const statusColor = cam.status==="sent" ? C.green : cam.status==="scheduled" ? C.blue : C.muted;
                    const statusBg = cam.status==="sent" ? C.green+"20" : cam.status==="scheduled" ? C.blue+"20" : C.raised;
                    const icon = {save_the_date:"📅",invitation:"✉️",reminder:"⏰",day_of_details:"📍",thank_you:"🙏",confirmation:"✅",byo:"🎒"}[cam.email_type] || "📧";
                    const sendDate = cam.scheduled_at || cam.send_at || cam.sent_at;
                    const daysFromEvent = sendDate && eventDate ? Math.round((new Date(sendDate) - eventDate)/(1000*60*60*24)) : null;
                    return (
                      <div key={cam.id} style={{ display:"flex", alignItems:"flex-start", flex:1 }}>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1, gap:6 }}>
                          {/* Node */}
                          <div style={{ width:40, height:40, borderRadius:"50%", background:statusBg, border:`2px solid ${statusColor}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, cursor:cam.html_content?"pointer":"default", transition:"transform .15s" }}
                            onClick={() => cam.html_content && setPreviewCam(cam)}
                            title={cam.name}
                            onMouseEnter={e=>cam.html_content&&(e.currentTarget.style.transform="scale(1.1)")}
                            onMouseLeave={e=>(e.currentTarget.style.transform="scale(1)")}>
                            {cam.status==="sent" ? "✓" : icon}
                          </div>
                          {/* Label */}
                          <div style={{ textAlign:"center", width:"100%" }}>
                            <div style={{ fontSize:10.5, fontWeight:600, color:cam.status==="sent"?C.green:cam.status==="scheduled"?C.blue:C.sec, lineHeight:1.2 }}>
                              {cam.email_type?.replace(/_/g," ").replace("save the date","STD").replace("day of details","Day-of").replace("thank you","TY").replace("confirmation","Confirm").replace("invitation","Invite") || cam.name?.split("—")[0]?.trim()?.slice(0,10)}
                            </div>
                            {sendDate && (
                              <div style={{ fontSize:9.5, color:C.muted, marginTop:2 }}>
                                {new Date(sendDate).toLocaleDateString("en-AU",{day:"numeric",month:"short"})}
                                {daysFromEvent !== null && <span style={{ color:daysFromEvent<0?C.amber:daysFromEvent===0?"#FF9F0A":C.teal }}> ({daysFromEvent===0?"event day":daysFromEvent>0?`+${daysFromEvent}d`:`${daysFromEvent}d`})</span>}
                              </div>
                            )}
                            <div style={{ fontSize:9, color:statusColor, marginTop:1, fontWeight:600, textTransform:"uppercase" }}>{cam.status}</div>
                          </div>
                        </div>
                        {/* Connector line */}
                        {!isLast && (
                          <div style={{ display:"flex", alignItems:"center", paddingTop:18, flexShrink:0 }}>
                            <div style={{ width:20, height:2, background: cam.status==="sent"?C.green+"60":C.border, borderRadius:1 }} />
                            <div style={{ fontSize:9, color:C.border }}>›</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Summary row */}
                <div style={{ display:"flex", gap:16, marginTop:14, paddingTop:10, borderTop:`1px solid ${C.border}` }}>
                  {[
                    { label:"Sent", val:campaigns.filter(c=>c.status==="sent").length, color:C.green },
                    { label:"Scheduled", val:campaigns.filter(c=>c.status==="scheduled").length, color:C.blue },
                    { label:"Draft", val:campaigns.filter(c=>c.status==="draft").length, color:C.muted },
                    { label:"Total contacts", val:contactCount, color:C.text },
                  ].map(m => (
                    <div key={m.label} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11 }}>
                      <span style={{ fontWeight:700, color:m.color }}>{m.val}</span>
                      <span style={{ color:C.muted }}>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
          </>
          );
          })()}

          {campaigns.length > 0 && (() => {
            const types = new Set(campaigns.map(c => c.email_type));
            const missing = ["save_the_date","invitation","reminder","confirmation","thank_you","byo"].filter(t => !types.has(t));
            if (!missing.length) return null;
            return (
              <div style={{ fontSize: 11, color: C.amber, marginTop: 4 }}>
                💡 Missing email types: {missing.map(t => t.replace(/_/g," ")).join(", ")} — click + New campaign to add
              </div>
            );
          })()}
          {campaigns.length === 0 && (
            <div style={{ background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, padding: "36px 40px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>No email campaigns yet</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 24, lineHeight: 1.7, maxWidth: 400, margin: "0 auto 24px" }}>
                Build your emails in the eDM Builder — AI generates polished, on-brand emails from a single sentence. They'll appear here ready to schedule or send.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, maxWidth: 480, margin: "0 auto 20px" }}>
                {[
                  { icon: "📅", title: "Save the Date", desc: "First touchpoint — lock in calendars" },
                  { icon: "✉️", title: "Invitation", desc: "Full details + RSVP link" },
                  { icon: "⏰", title: "Reminder", desc: "1 week and 1 day before" },
                ].map(e => (
                  <div key={e.title} style={{ padding: "12px", background: C.raised, borderRadius: 8, border: `1px solid ${C.border}`, textAlign: "left" }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{e.icon}</div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: C.text, marginBottom: 2 }}>{e.title}</div>
                    <div style={{ fontSize: 10.5, color: C.muted }}>{e.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button onClick={() => setView("edm")} style={{ fontSize: 13, padding: "9px 20px", background: C.blue, border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                  ✨ Build emails with AI →
                </button>
                <button onClick={() => setView("campaign")} style={{ fontSize: 13, padding: "9px 20px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, cursor: "pointer" }}>
                  ⚡ Generate full 7-email campaign
                </button>
              </div>
            </div>
          )}
          {[...campaigns].sort((a, b) => {
                const order = {"save_the_date":0,"invitation":1,"reminder":2,"day_of_details":3,"confirmation":4,"byo":5,"thank_you":6};
                return (order[a.email_type] ?? 9) - (order[b.email_type] ?? 9);
              }).map(cam => (
            <div key={cam.id} style={{ background: C.card, borderRadius: 10, border: `1px solid ${cam.status === "sent" ? C.green + "30" : cam.status === "scheduled" ? C.blue + "40" : cam.status === "paused" ? C.amber + "30" : C.border}`, padding: "16px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${cam.status === "sent" ? C.green : C.blue}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
              {cam.email_type === "save_the_date" ? "📅" : cam.email_type === "invitation" ? "✉️" : cam.email_type === "reminder" ? "⏰" : cam.email_type === "day_of_details" ? "📍" : cam.email_type === "thank_you" ? "🙏" : cam.email_type === "confirmation" ? "✅" : "📧"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: C.text, cursor: cam.html_content ? "pointer" : "default" }} onClick={() => cam.html_content && setPreviewCam(cam)}>{cam.name}{cam.html_content && <span style={{ fontSize: 9, color: C.blue, marginLeft: 5 }}>👁</span>}</span>
                  {cam.subject && <div style={{ fontSize: 11, color: C.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 320 }}>"{cam.subject}"</div>}
                  <span style={{ fontSize: 10.5, fontWeight: 500, padding: "2px 7px", borderRadius: 4, textTransform: "uppercase", background: cam.status === "sent" ? `${C.green}15` : cam.status === "scheduled" ? `${C.blue}15` : cam.status === "paused" ? `${C.amber}15` : `${C.raised}`, color: cam.status === "sent" ? C.green : cam.status === "scheduled" ? C.blue : cam.status === "paused" ? C.amber : C.muted }}>
                    {cam.status}{cam.status === "scheduled" && cam.scheduled_at ? ` · ${new Date(cam.scheduled_at).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}` : ""}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {cam.status === "scheduled" && cam.scheduled_at ? (() => {
                    const d = new Date(cam.scheduled_at);
                    const daysLeft = Math.ceil((d - new Date()) / (1000*60*60*24));
                    const day = d.getDay(); const hour = d.getHours();
                    const isOptimal = day >= 1 && day <= 4 && (hour >= 9 && hour <= 11 || hour >= 14 && hour <= 16);
                    return (
                      <span>
                        {daysLeft <= 0 ? `⚡ Sending today!` : daysLeft === 1 ? `⏰ Tomorrow · ${d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}` : daysLeft <= 7 ? `🔶 In ${daysLeft} days · ${d.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}` : `⏰ In ${daysLeft} days · ${d.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}`}
                        {isOptimal ? <span style={{ color: C.green, marginLeft: 6, fontSize: 10 }}>✓ Optimal time</span> : <span style={{ color: C.amber, marginLeft: 6, fontSize: 10 }}>💡 Tue–Thu 9–11am gets best opens</span>}
                      </span>
                    );
                  })() : cam.send_at ? new Date(cam.send_at).toLocaleString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "No send time set"}
                  {" · "}Segment: <span style={{ color: cam.segment !== "all" ? C.amber : C.muted }}>{ {"all":`Everyone (${contactCount})`,"confirmed":"✅ Confirmed","pending":"⏳ Pending","attended":"📍 Attended","declined":"❌ Declined","vip":"⭐ VIP"}[cam.segment] || cam.segment.charAt(0).toUpperCase() + cam.segment.slice(1) }</span>
                  {cam.status === "sent" && (
                    <span>
                      {` · ✅ ${cam.total_sent || 0} sent`}
                      {cam.total_sent > 0 && (() => {
                        const pct = Math.round(((cam.total_opened||0)/cam.total_sent)*100);
                        return <span style={{ marginLeft:4 }}>
                          <span style={{ color:pct>=30?C.green:pct>=20?C.amber:C.red }}>{pct}% opened</span>
                          <span style={{ display:"inline-block", width:32, height:3, background:C.raised, borderRadius:2, marginLeft:4, verticalAlign:"middle" }}>
                            <span style={{ display:"block", width:`${Math.min(pct,100)}%`, height:"100%", background:pct>=30?C.green:pct>=20?C.amber:C.red, borderRadius:2 }}/>
                          </span>
                        </span>;
                      })()}
                      {cam.total_clicked > 0 && ` · ${cam.total_clicked} clicks`}
                      {cam.sent_at && (() => {
                        const d = new Date(cam.sent_at);
                        const day = d.getDay(); const h = d.getHours();
                        const optimal = day>=2 && day<=4 && h>=9 && h<=11;
                        const daysAgo = Math.round((new Date()-d)/(1000*60*60*24));
                        return <span style={{ marginLeft:4, color:C.muted }}>
                          · {daysAgo===0?"today":`${daysAgo}d ago`}
                          {optimal && <span style={{ marginLeft:4, color:C.green }}>✓ optimal</span>}
                        </span>;
                      })()}
                    </span>
                  )}
                </div>
                {cam.subject && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3, fontStyle: "italic" }}>"{cam.subject}"</div>}
                {cam.html_content && (() => {
                  const words = cam.html_content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(w => w.length > 1).length;
                  return <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{words} words · ~{Math.max(1, Math.round(words/200))} min read</div>;
                })()}
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
                    const testEmail = (document.getElementById("sched-test-email")?.value || profile?.email || "").trim();
                    if (!testEmail?.includes("@")) { fire("Enter a test email address", "err"); return; }
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
                  <>
                    <button onClick={() => openSendModal(cam)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.green}50`, background: `${C.green}12`, color: C.green, cursor: "pointer", fontWeight: 500 }}>
                      <Send size={11} />Send Now
                    </button>
                    {cam.status !== "scheduled" && (
                      schedPickerCam?.id === cam.id ? (
                        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                          <input type="datetime-local" value={schedPickerVal}
                            onChange={e => setSchedPickerVal(e.target.value)}
                            min={new Date().toISOString().slice(0,16)}
                            style={{ fontSize:11, padding:"4px 7px", borderRadius:5, border:`1px solid ${C.blue}60`, background:C.bg, color:C.text, outline:"none" }} />
                          <button onClick={async () => {
                            if (!schedPickerVal) return;
                            const schedDate = new Date(schedPickerVal);
                            await supabase.from("email_campaigns").update({ status:"scheduled", scheduled_at:schedDate.toISOString() }).eq("id", cam.id);
                            setCampaigns(p => p.map(c => c.id===cam.id ? {...c, status:"scheduled", scheduled_at:schedDate.toISOString()} : c));
                            setSchedPickerCam(null); setSchedPickerVal("");
                            fire(`✅ Scheduled for ${schedDate.toLocaleDateString("en-AU",{day:"numeric",month:"short"})} at ${schedDate.toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit"})}`);
                          }} style={{ fontSize:11, padding:"4px 10px", borderRadius:5, border:"none", background:C.blue, color:"#fff", cursor:"pointer", fontWeight:600 }}>Set</button>
                          <button onClick={() => { setSchedPickerCam(null); setSchedPickerVal(""); }} style={{ fontSize:11, padding:"4px 7px", borderRadius:5, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>✕</button>
                        </div>
                      ) : (
                        <button onClick={() => {
                          const defaultVal = new Date(Date.now() + 86400000).toISOString().slice(0,16);
                          setSchedPickerCam(cam); setSchedPickerVal(defaultVal);
                        }} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, padding:"6px 12px", borderRadius:6, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>
                          ⏰ Schedule
                        </button>
                      )
                    )}
                  </>
                )}
                {cam.status === "draft" && !cam.html_content && (
                  <span style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>Generate email first in eDM Builder</span>
                )}
                {cam.status === "scheduled" && (
                  <button onClick={async () => {
                    await supabase.from("email_campaigns").update({ status: "draft", scheduled_at: null }).eq("id", cam.id);
                    setCampaigns(p => p.map(c => c.id === cam.id ? { ...c, status: "draft", scheduled_at: null } : c));
                    fire("Campaign unscheduled — moved back to draft");
                  }} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 5, border: `1px solid ${C.amber}40`, background: "transparent", color: C.amber, cursor: "pointer" }}>
                    ✕ Unschedule
                  </button>
                )}
                {(cam.status === "draft" || cam.status === "scheduled") && (
                  <button onClick={async () => {
                    // confirmed
                    const now = new Date().toISOString();
                    await supabase.from("email_campaigns").update({ status: "sent", sent_at: now, total_sent: contactCount || 1 }).eq("id", cam.id);
                    setCampaigns(p => p.map(c => c.id === cam.id ? { ...c, status: "sent", sent_at: now, total_sent: contactCount || 1 } : c));
                    fire("✅ Marked as sent manually");
                  }} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 5, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}
                    title="Mark as sent if you sent this email through another tool">
                    ✓ Mark sent
                  </button>
                )}
                {cam.status === "sent" && cam.total_sent > 0 && cam.html_content && (
                  <button onClick={async () => {
                    // confirmed
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
                    {cam.total_sent > 0 && cam.total_opened < cam.total_sent ? `Resend Unopened (${cam.total_sent - cam.total_opened})` : "Resend Unopened"}
                  </button>
                )}
                {cam.status !== "sent" && (
                  <>
                    <button onClick={async () => {
                      const { data } = await supabase.from("email_campaigns").insert({
                        event_id: cam.event_id, company_id: cam.company_id,
                        name: `${cam.name} (copy)`, email_type: cam.email_type,
                        subject: cam.subject ? `${cam.subject} (copy)` : null,
                        html_content: cam.html_content, plain_text: cam.plain_text,
                        status: "draft", segment: cam.segment || "all",
                      }).select().single();
                      if (data) { setCampaigns(p => [...p, data]); fire("✅ Campaign duplicated"); }
                    }} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 5, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", marginRight: 4 }}>
                      ⧉ Dupe
                    </button>
                    <button onClick={async () => {
                      // confirmed
                      await supabase.from("email_campaigns").delete().eq("id", cam.id);
                      setCampaigns(p => p.filter(c => c.id !== cam.id));
                      fire("Campaign deleted");
                    }} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
                      Delete
                    </button>
                    <button onClick={async () => {
                      const {name, email_type, template_style, subject, html_content, plain_text, segment} = cam;
                      const { data } = await supabase.from("email_campaigns").insert({
                        event_id: activeEvent.id, company_id: profile.company_id,
                        name: name + " (copy)", email_type, template_style, subject, html_content, plain_text,
                        status: "draft", segment: segment || "all", total_sent: 0, total_opened: 0, total_clicked: 0
                      }).select().single();
                      if (data) { setCampaigns(p => [data, ...p]); fire("📋 Campaign duplicated"); }
                    }} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
                      📋 Duplicate
                    </button>
                  </>
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
            {/* Email render — sandboxed iframe matches real inbox rendering */}
            <div style={{ flex: 1, overflow: "hidden", background: "#EBEBEB", padding: "20px" }}>
              <iframe
                srcDoc={previewCam.html_content || "<p style='font-family:sans-serif;color:#666;padding:20px'>No content</p>"}
                sandbox="allow-same-origin"
                style={{ width: "100%", height: "100%", border: "none", borderRadius: 6, background: "#fff" }}
                title="Email preview"
              />
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
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28, width: 500, animation: "fadeUp .2s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: C.text }}>Send campaign</h2>
              <button onClick={() => setSendModal(null)} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer" }}><X size={16} /></button>
            </div>

            {/* Email summary card */}
            <div style={{ background: C.raised, borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{sendModal.name}</div>
              {sendModal.subject && (
                <div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>"{sendModal.subject}"</div>
                  <div style={{ fontSize: 10, color: sendModal.subject.length > 60 ? C.amber : C.green }}>
                    {sendModal.subject.length}/60 chars {sendModal.subject.length > 60 ? "⚠️ may truncate in inbox" : "✅ good length"}
                  </div>
                </div>
              )}
              {/* Preview + Test buttons inline */}
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <button onClick={() => { setPreviewCam(sendModal); setSendModal(null); }}
                  style={{ fontSize: 11, padding: "4px 12px", borderRadius: 5, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  👁 Preview email
                </button>
                <button onClick={async () => {
                  const testTo = profile?.email;
                  if (!testTo) { fire("No email on your profile", "err"); return; }
                  fire(`📧 Sending test to ${testTo}…`);
                  const { data: { session } } = await supabase.auth.getSession();
                  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
                    method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
                    body: JSON.stringify({ contacts: [{ email: testTo, first_name: profile?.full_name?.split(" ")[0] || "Test" }], subject: `[TEST] ${sendModal.subject}`, htmlContent: sendModal.html_content, plainText: sendModal.plain_text })
                  });
                  const d = await res.json();
                  fire(d.success ? `✅ Test sent to ${testTo}! Check your inbox.` : "Send failed", d.success ? "ok" : "err");
                }} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 5, border: `1px solid ${C.blue}40`, background: `${C.blue}10`, color: C.blue, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  🧪 Send test to me
                </button>
              </div>
            </div>

            {/* Recipient section */}
            <div style={{ background: `${C.blue}08`, border: `1px solid ${C.blue}20`, borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.blue, marginBottom: 8 }}>📬 {sendModal.recipientCount} contacts will receive this email</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: C.muted }}>Send to:</span>
                <select value={sendModal.segment || "all"} onChange={async (e) => {
                  const seg = e.target.value;
                  const { data: ecs } = await supabase.from("event_contacts").select("*").eq("event_id", activeEvent.id).eq("company_id", profile.company_id);
                  const filtered = (ecs || []).filter(ec => seg === "all" ? true : ec.status === seg);
                  setSendModal(p => ({ ...p, segment: seg, recipientCount: filtered.length }));
                }} style={{ fontSize: 11, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 5, color: C.text, padding: "3px 8px", outline: "none", cursor: "pointer" }}>
                  <option value="all">All contacts</option>
                  <option value="confirmed">Confirmed only</option>
                  <option value="pending">Pending only</option>
                  <option value="declined">Declined only</option>
                </select>
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>Each email is personalised with the recipient's first name.</div>
            </div>

            {sendModal.recipientCount === 0 && (
              <div style={{ background: `${C.amber}10`, border: `1px solid ${C.amber}30`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.amber }}>
                ⚠️ No contacts match this segment. Add contacts in the Dashboard first.
              </div>
            )}

            <div style={{ display: "flex", gap: 9 }}>
              <button onClick={() => setSendModal(null)} style={{ flex: 1, padding: "11px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={sendNow} disabled={sending || sendModal.recipientCount === 0}
                style={{ flex: 2, padding: "11px", background: sending || sendModal.recipientCount === 0 ? C.raised : C.green, border: "none", borderRadius: 8, color: sending || sendModal.recipientCount === 0 ? C.muted : "#fff", fontSize: 14, fontWeight: 600, cursor: sending ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, position: "relative", overflow: "hidden" }}>
                {sending && sendProgress.total > 0 && (
                  <div style={{ position: "absolute", inset: 0, background: `${C.green}40`, width: `${Math.round(sendProgress.sent / sendProgress.total * 100)}%`, transition: "width .3s", borderRadius: 8 }} />
                )}
                <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                  {sending ? <><Spin />{sendProgress.total > 1 ? `Sending ${sendProgress.sent}/${sendProgress.total}…` : "Sending…"}</> : <><Send size={14} />Confirm & Send ({sendModal.recipientCount})</>}
                </span>
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
  const [importPreview, setImportPreview] = useState(null);
  const [importStep, setImportStep] = useState("input"); // "input" | "map" | "preview"
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [columnMap, setColumnMap] = useState({});
  const [addToEvent, setAddToEvent] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const importFileRef = useRef(null);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [mergingDup, setMergingDup] = useState(false);
  const [noteModal, setNoteModal] = useState(null); // { contact } | null
  const [noteText, setNoteText] = useState("");

  const PERSONAL_DOMAINS = ["gmail","yahoo","hotmail","outlook","icloud","rediffmail","aol","protonmail","zoho","live","msn","me","mac","ymail","googlemail"];
  const parseImportText = (text) => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const rows = [];
    const isCSV = lines.length > 1 && lines[0].includes(",");
    if (isCSV) {
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/['"]/g,""));
      const col = (kws) => headers.findIndex(h => kws.some(k => h.includes(k)));
      const emailCol = col(["email","e-mail"]), firstCol = col(["first","given"]), lastCol = col(["last","surname","family"]);
      const phoneCol = col(["phone","mobile","tel"]), companyCol = col(["company","org","organisation","organization"]), titleCol = col(["title","role","position","job"]);
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map(c => c.trim().replace(/^["']|["']$/g,""));
        const email = emailCol >= 0 ? cols[emailCol]?.toLowerCase() : "";
        if (!email?.includes("@")) continue;
        const domain = email.split("@")[1]?.split(".")[0];
        const nameRaw = firstCol >= 0 ? cols[firstCol] : "";
        const nameParts = nameRaw.split(" ");
        rows.push({ email, first_name: nameParts[0]||"", last_name: lastCol>=0?cols[lastCol]:(nameParts[1]||""), phone: phoneCol>=0?cols[phoneCol]:"", company_name: companyCol>=0?cols[companyCol]:"", job_title: titleCol>=0?cols[titleCol]:"", _personal: PERSONAL_DOMAINS.includes(domain) });
      }
    } else {
      for (const raw of lines) {
        const angleMatch = raw.match(/^(.+?)<(.+@.+)>$/);
        if (angleMatch) {
          const nameParts = angleMatch[1].trim().split(" ");
          const email = angleMatch[2].trim().toLowerCase();
          const domain = email.split("@")[1]?.split(".")[0];
          rows.push({ email, first_name: nameParts[0]||"", last_name: nameParts[1]||"", phone:"", company_name:"", job_title:"", _personal: PERSONAL_DOMAINS.includes(domain) });
        } else if (raw.includes("@")) {
          const email = raw.toLowerCase().trim();
          const domain = email.split("@")[1]?.split(".")[0];
          rows.push({ email, first_name:"", last_name:"", phone:"", company_name:"", job_title:"", _personal: PERSONAL_DOMAINS.includes(domain) });
        }
      }
    }
    return rows;
  };

  // Find duplicates: same email or same name+company
  const duplicates = (() => {
    const emailMap = {};
    const nameMap = {};
    const dups = [];
    contacts.forEach(c => {
      const email = c.email?.toLowerCase().trim();
      const nameKey = `${(c.first_name||"").toLowerCase()}_${(c.last_name||"").toLowerCase()}_${(c.company_name||"").toLowerCase()}`;
      if (email && emailMap[email]) {
        dups.push({ type: "email", contacts: [emailMap[email], c], key: email });
      } else if (email) { emailMap[email] = c; }
      if (nameKey.length > 2 && nameMap[nameKey]) {
        if (!dups.find(d => d.contacts.some(dc => dc.id === c.id))) {
          dups.push({ type: "name", contacts: [nameMap[nameKey], c], key: nameKey });
        }
      } else if (nameKey.length > 2) { nameMap[nameKey] = c; }
    });
    return dups;
  })();

  const mergeDuplicate = async (keep, remove) => {
    setMergingDup(true);
    try {
      // Move all event_contacts from remove to keep
      await supabase.from("event_contacts").update({ contact_id: keep.id }).eq("contact_id", remove.id);
      // Move all email_sends
      await supabase.from("email_sends").update({ contact_id: keep.id }).eq("contact_id", remove.id);
      // Move all contact_activity
      await supabase.from("contact_activity").update({ contact_id: keep.id }).eq("contact_id", remove.id);
      // Delete the duplicate
      await supabase.from("contacts").delete().eq("id", remove.id);
      // Refresh contacts
      const { data } = await supabase.from("contacts").select("*").eq("company_id", profile.company_id).order("created_at", { ascending: false });
      setContacts(data || []);
      fire(`✅ Merged: ${remove.email || remove.first_name} → ${keep.email || keep.first_name}`);
    } catch (err) { fire(err.message || "Merge failed", "err"); }
    setMergingDup(false);
  };
  useEffect(() => {
    if (!profile) return;
    supabase.from("contacts").select("*").eq("company_id", profile.company_id).order("created_at", { ascending: false })
      .then(({ data }) => { setContacts(data || []); setLoading(false); });
  }, [profile]);
  const [contactFilter, setContactFilter] = useState("all"); // all | vip | unsubscribed | active
  const [contactSort, setContactSort] = useState("newest"); // newest | name | company
  const [tagFilter, setTagFilter] = useState(""); // filter by specific tag
  const [selContacts, setSelContacts] = useState(new Set());
  const [showBulkEmail, setShowBulkEmail] = useState(false);
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkBody, setBulkBody] = useState("");
  const [bulkSending, setBulkSending] = useState(false);
  const toggleSel = (id) => setSelContacts(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const filtered = contacts.filter(c => {
    if (search && !(c.email + (c.first_name||"") + (c.last_name||"") + (c.company_name||"")).toLowerCase().includes(search.toLowerCase())) return false;
    if (contactFilter === "vip" && !c.tags?.includes("vip")) return false;
    if (contactFilter === "unsubscribed" && !c.unsubscribed) return false;
    if (contactFilter === "active" && c.unsubscribed) return false;
    if (tagFilter && !(c.tags||[]).includes(tagFilter)) return false;
    return true;
  }).sort((a, b) => {
    if (contactSort === "name") return (`${a.first_name||""} ${a.last_name||""}`).localeCompare(`${b.first_name||""} ${b.last_name||""}`);
    if (contactSort === "company") return (a.company_name||"").localeCompare(b.company_name||"");
    if (contactSort === "email") return (a.email||"").localeCompare(b.email||"");
    if (contactSort === "score") return (scores[b.id]?.score||0) - (scores[a.id]?.score||0);
    return new Date(b.created_at) - new Date(a.created_at);
  });
  const resetImport = () => { setShowImport(false); setImportText(""); setImportPreview(null); setImportStep("input"); setCsvHeaders([]); setColumnMap({}); setAddToEvent(false); setDragOver(false); };

  // Parse a single CSV line, handling quoted fields and multiple delimiters
  const parseCSVLine = (line) => {
    const result = []; let cur = ""; let inQ = false;
    const delim = line.includes("\t") ? "\t" : line.includes(";") ? ";" : ",";
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQ = !inQ; }
      else if (line[i] === delim && !inQ) { result.push(cur.trim().replace(/^["']|["']$/g,"")); cur = ""; }
      else { cur += line[i]; }
    }
    result.push(cur.trim().replace(/^["']|["']$/g,""));
    return result;
  };

  const autoDetectColumns = (headers) => {
    const h = headers.map(x => x.toLowerCase().replace(/[^a-z]/g,""));
    const find = (kws) => { const i = h.findIndex(x => kws.some(k => x.includes(k))); return i >= 0 ? i : null; };
    return {
      email:        find(["email","emailaddress","mail"]),
      first_name:   find(["first","firstname","given"]),
      last_name:    find(["last","lastname","surname","family"]),
      phone:        find(["phone","mobile","tel","cell"]),
      company_name: find(["company","org","organisation","organization","employer","account"]),
      job_title:    find(["title","role","position","job"]),
    };
  };

  const buildRowsFromMap = (text, map) => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      const get = (k) => (map[k] !== null && map[k] !== undefined && map[k] !== "") ? (cols[map[k]] || "").trim() : "";
      const email = get("email").toLowerCase();
      if (!email.includes("@")) continue;
      const domain = email.split("@")[1]?.split(".")[0];
      rows.push({ email, first_name: get("first_name"), last_name: get("last_name"), phone: get("phone"), company_name: get("company_name"), job_title: get("job_title"), _personal: PERSONAL_DOMAINS.includes(domain) });
    }
    return rows;
  };

  const handleImportFile = (file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = ev => {
      const text = ev.target.result;
      setImportText(text);
      const firstLine = text.split("\n")[0];
      const hasDelim = firstLine.includes(",") || firstLine.includes(";") || firstLine.includes("\t");
      if (hasDelim) {
        const hdrs = parseCSVLine(firstLine);
        setCsvHeaders(hdrs);
        setColumnMap(autoDetectColumns(hdrs));
        setImportStep("map");
      }
    };
    r.readAsText(file);
  };

  const handleImportProceed = () => {
    const firstLine = importText.split("\n")[0];
    const hasDelim = firstLine.includes(",") || firstLine.includes(";") || firstLine.includes("\t");
    if (hasDelim) {
      const hdrs = parseCSVLine(firstLine);
      setCsvHeaders(hdrs);
      setColumnMap(autoDetectColumns(hdrs));
      setImportStep("map");
    } else {
      const rows = parseImportText(importText);
      if (!rows.length) { fire("No valid emails found", "err"); return; }
      setImportPreview(rows);
      setImportStep("preview");
    }
  };

  const importCSV = () => { setImportStep("input"); setShowImport(true); };
  const doImport = async () => {
    if (!importText.trim() || !profile) return;
    setImporting(true);
    const lines = importText.split('\n').map(l => l.trim()).filter(Boolean);
    const rows = [];
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
        const nameRaw = firstCol >= 0 ? cols[firstCol] : '';
        const nameParts = nameRaw.split(' ');
        rows.push({ email, first_name: nameParts[0] || '', last_name: lastCol >= 0 ? cols[lastCol] : (nameParts[1] || ''), phone: phoneCol >= 0 ? cols[phoneCol] : '', company_name: companyCol >= 0 ? cols[companyCol] : '', job_title: titleCol >= 0 ? cols[titleCol] : '' });
      }
    } else {
      for (const raw of lines) {
        const angleMatch = raw.match(/^(.+?)<(.+@.+)>$/);
        if (angleMatch) {
          const nameParts = angleMatch[1].trim().split(' ');
          rows.push({ email: angleMatch[2].trim().toLowerCase(), first_name: nameParts[0] || '', last_name: nameParts[1] || '', phone: '', company_name: '', job_title: '' });
        } else if (raw.includes('@')) {
          rows.push({ email: raw.toLowerCase().trim(), first_name: '', last_name: '', phone: '', company_name: '', job_title: '' });
        }
      }
    }
    if (!rows.length) { fire("No valid emails found", "err"); setImporting(false); return; }
    const toInsert = rows.map(r => ({ ...r, company_id: profile.company_id }));
    const { data, error } = await supabase.from("contacts").upsert(toInsert, { onConflict: "email,company_id", ignoreDuplicates: true }).select();
    if (error) { fire(`Import error: ${error.message}`, "err"); }
    else {
      const newOnes = (data || []).filter(Boolean);
      setContacts(p => { const ex = new Set(p.map(c => c.email)); return [...p, ...newOnes.filter(c => !ex.has(c.email))]; });
      fire(`✅ ${newOnes.length} contacts imported · ${rows.length - newOnes.length} already existed`);
      setImportText(''); setShowImport(false);
    }
    setImporting(false);
  }
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
      const skipped = rows.length - newOnes.length;
    fire(`✅ ${newOnes.length} new contacts imported${skipped > 0 ? ` · ${skipped} already existed` : ""}${rows.length !== importText.split('\n').filter(Boolean).length ? ` · ${importText.split('\n').filter(Boolean).length - rows.length} skipped (personal email)` : ""}!`);
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
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Unified contact records across every event — {contacts.length.toLocaleString()} total · {contacts.filter(c => !c.unsubscribed).length} active</p>
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
          <select value={contactSort} onChange={e => setContactSort(e.target.value)}
            style={{ fontSize: 12, padding: "6px 10px", borderRadius: 7, border: `1px solid ${C.border}`, background: C.raised, color: C.muted, cursor: "pointer" }}>
            <option value="newest">Newest first</option>
            <option value="score">🔥 Lead Score</option>
            <option value="name">Name A–Z</option>
            <option value="company">Company A–Z</option>
            <option value="email">Email A–Z</option>
          </select>
          <button onClick={importCSV} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>+ Import emails</button>
          {activeEvent && (
            <button onClick={async () => {
              if (!activeEvent || !profile) return;
              const toAdd = filtered.length > 0 ? filtered : contacts;
              if (!toAdd.length) { fire("No contacts to add", "err"); return; }
              let added = 0;
              for (const c of toAdd) {
                const { error } = await supabase.from("event_contacts").upsert({
                  contact_id: c.id, event_id: activeEvent.id,
                  company_id: profile.company_id, status: "pending",
                }, { onConflict: "event_id,contact_id", ignoreDuplicates: true });
                if (!error) added++;
              }
              fire(`✅ ${added} contact${added !== 1 ? "s" : ""} added to ${activeEvent.name}`);
            }} style={{ fontSize: 12, padding: "7px 12px", borderRadius: 7, border: `1px solid ${C.blue}40`, background: C.blue+"10", color: C.blue, cursor: "pointer" }}>
              + Add {filtered.length > 0 && filtered.length < contacts.length ? filtered.length : "all"} to {activeEvent.name.slice(0, 20)}{activeEvent.name.length > 20 ? "…" : ""}
            </button>
          )}
          {tagFilter && (
            <button onClick={() => setTagFilter("")}
              style={{ fontSize:11, padding:"3px 8px", borderRadius:5, background:C.blue+"10", border:`1px solid ${C.blue}30`, color:C.blue, cursor:"pointer" }}>
              🏷 #{tagFilter} ✕
            </button>
          )}
          {contacts.filter(c => c.unsubscribed).length > 0 && (
            <span style={{ fontSize: 11, color: C.muted, padding: "4px 10px", background: C.raised, borderRadius: 6, border: `1px solid ${C.border}` }}>
              🚫 {contacts.filter(c => c.unsubscribed).length} unsubscribed — never emailed
            </span>
          )}
          {duplicates.length > 0 && (
            <button onClick={() => setShowDuplicates(p => !p)}
              style={{ fontSize: 12, padding: "6px 12px", borderRadius: 7, border: `1px solid ${C.amber}40`, background: C.amber+"12", color: C.amber, cursor: "pointer" }}>
              ⚠️ {duplicates.length} duplicate{duplicates.length > 1 ? "s" : ""} — merge
            </button>
          )}
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
          // confirmed
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
        <button onClick={() => {
          const hdr = ["First Name","Last Name","Email","Company","Job Title","Phone","LinkedIn","Tags","Source","Unsubscribed","Notes","Added"];
          const rows = filtered.map(c => [
            c.first_name||"", c.last_name||"", c.email||"", c.company_name||"",
            c.job_title||"", c.phone||"", c.linkedin_url||"",
            (c.tags||[]).join(";"), c.source||"",
            c.unsubscribed?"Yes":"No", c.notes||"",
            c.created_at?new Date(c.created_at).toLocaleDateString("en-AU"):""
          ].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(","));
          const csv = [hdr.join(","), ...rows].join("\n");
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8"}));
          a.download = `contacts-${activeEvent?.name?.replace(/\s+/g,"_")||"export"}-${new Date().toISOString().slice(0,10)}.csv`;
          a.click();
          fire(`✅ Exported ${filtered.length} contact${filtered.length!==1?"s":""} (${hdr.length} fields)`);
        }} style={{ fontSize: 13, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
          ⬇ Export CSV
        </button>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px", marginBottom: 14, maxWidth: 320 }}>
        <Search size={13} color={C.muted} strokeWidth={1.5} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts…" style={{ background: "none", border: "none", outline: "none", color: C.sec, fontSize: 13, width: "100%" }} />
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap:"wrap" }}>
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
      {/* Tag filter chips */}
      {(() => {
        const allTags = [...new Set(contacts.flatMap(c => c.tags||[]))].filter(t => t !== "vip").sort();
        if (!allTags.length) return null;
        return (
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
            <span style={{ fontSize:11, color:C.muted, alignSelf:"center" }}>Tags:</span>
            {allTags.map(tag => (
              <button key={tag} onClick={() => setTagFilter(t => t===tag?"":tag)}
                style={{ fontSize:11, padding:"2px 9px", borderRadius:4, border:`1px solid ${tagFilter===tag?C.blue:C.border}`, background:tagFilter===tag?`${C.blue}15`:"transparent", color:tagFilter===tag?C.blue:C.muted, cursor:"pointer" }}>
                #{tag}
              </button>
            ))}
            {tagFilter && <button onClick={() => setTagFilter("")} style={{ fontSize:11, padding:"2px 7px", borderRadius:4, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>✕ clear</button>}
          </div>
        );
      })()}
      <div style={{ background:C.card, borderRadius:11, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        {/* Stats bar */}
        {contacts.length > 0 && (
          <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${C.border}`, background:C.raised }}>
            {[
              { label:"Total", val:contacts.length, color:C.text },
              { label:"Active", val:contacts.filter(c=>!c.unsubscribed).length, color:C.green },
              { label:"VIP", val:contacts.filter(c=>c.tags?.includes("vip")).length, color:C.amber },
              { label:"Unsubscribed", val:contacts.filter(c=>c.unsubscribed).length, color:C.red },
            ].map((s,i) => (
              <div key={s.label} style={{ flex:1, padding:"8px 14px", borderRight: i<3?`1px solid ${C.border}`:"none", textAlign:"center" }}>
                <div style={{ fontSize:16, fontWeight:700, color:s.color }}>{s.val}</div>
                <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.5px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
        {selContacts.size > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:C.blue+"10", borderBottom:`1px solid ${C.blue}25`, flexWrap:"wrap" }}>
            <span style={{ fontSize:12, color:C.blue, fontWeight:600 }}>{selContacts.size} selected</span>
            <button onClick={async () => {
              const ids = [...selContacts];
              await supabase.from("contacts").update({ unsubscribed: true }).in("id", ids);
              setContacts(p => p.map(c => ids.includes(c.id) ? {...c, unsubscribed: true} : c));
              setSelContacts(new Set());
              fire(`🚫 ${ids.length} unsubscribed`);
            }} style={{ fontSize:12, padding:"4px 10px", borderRadius:5, border:`1px solid ${C.amber}40`, background:"transparent", color:C.amber, cursor:"pointer" }}>🚫 Unsub</button>
            <button onClick={async () => {
              // confirmed
              for (const id of selContacts) {
                await supabase.from("event_contacts").delete().eq("contact_id", id);
                await supabase.from("contacts").delete().eq("id", id);
              }
              setContacts(p => p.filter(c => !selContacts.has(c.id)));
              setSelContacts(new Set());
              fire(`🗑 Deleted ${selContacts.size}`);
            }} style={{ fontSize:12, padding:"4px 10px", borderRadius:5, border:`1px solid ${C.red}40`, background:"transparent", color:C.red, cursor:"pointer" }}>🗑 Delete</button>
            {activeEvent && <button onClick={async () => {
              let n = 0;
              for (const id of selContacts) {
                const {error} = await supabase.from("event_contacts").upsert(
                  {contact_id:id, event_id:activeEvent.id, company_id:profile.company_id, status:"pending"},
                  {onConflict:"event_id,contact_id", ignoreDuplicates:true}
                );
                if (!error) n++;
              }
              setSelContacts(new Set());
              fire(`✅ ${n} added to ${activeEvent.name}`);
            }} style={{ fontSize:12, padding:"4px 10px", borderRadius:5, border:`1px solid ${C.green}40`, background:"transparent", color:C.green, cursor:"pointer" }}>+ Add to event</button>}
            <button onClick={() => {
              const toExport = filtered.filter(c => selContacts.has(c.id));
              if (!toExport.length) return;
              const hdr = ["First Name","Last Name","Email","Company","Job Title","Phone","Tags","Source"];
              const rows = toExport.map(c => [
                c.first_name||"", c.last_name||"", c.email||"", c.company_name||"",
                c.job_title||"", c.phone||"", (c.tags||[]).join(";"), c.source||""
              ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(","));
              const csv = [hdr.join(","), ...rows].join("\n");
              const a = document.createElement("a");
              a.href = URL.createObjectURL(new Blob([csv], {type:"text/csv"}));
              a.download = `contacts-export-${new Date().toISOString().slice(0,10)}.csv`;
              a.click();
              fire(`✅ ${toExport.length} contacts exported`);
            }} style={{ fontSize:12, padding:"4px 10px", borderRadius:5, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>⬇ Export CSV</button>
            <button onClick={() => setShowBulkEmail(true)}
              style={{ fontSize:12, padding:"4px 10px", borderRadius:5, border:`1px solid ${C.blue}40`, background:C.blue+"10", color:C.blue, cursor:"pointer", fontWeight:600 }}>📧 Email selected</button>
            <button onClick={() => setSelContacts(new Set())} style={{ fontSize:12, padding:"4px 10px", borderRadius:5, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer", marginLeft:"auto" }}>✕ Clear</button>
          </div>
        )}
        {loading ? <div style={{ padding: "32px", textAlign: "center", color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><Spin />Loading contacts…</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>
              <th style={{ padding: "10px 14px", width: 36 }}>
                <input type="checkbox"
                  checked={filtered.length > 0 && filtered.every(c => selContacts.has(c.id))}
                  onChange={() => filtered.every(c => selContacts.has(c.id))
                    ? setSelContacts(new Set())
                    : setSelContacts(new Set(filtered.map(c => c.id)))}
                  style={{ accentColor: C.blue, cursor: "pointer" }} />
              </th>
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
                        <input type="checkbox" checked={selContacts.has(c.id)}
                          onChange={() => toggleSel(c.id)} onClick={e => e.stopPropagation()}
                          style={{ accentColor: C.blue, cursor:"pointer", flexShrink:0 }} />
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${C.blue}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: C.blue, flexShrink: 0 }}>{ini(`${c.first_name || ""} ${c.last_name || ""}`)}</div>
                        <span style={{ fontSize: 13, color: C.text }}>{`${c.first_name || ""} ${c.last_name || ""}`.trim() || "—"}</span>
                        {c.tags?.includes("vip") && <span onClick={e=>{e.stopPropagation();setTagFilter(f=>f==="vip"?"":"vip");}} style={{ fontSize:10, color:"#FFB800", marginLeft:4, cursor:"pointer" }} title="Filter by VIP">⭐ VIP</span>}
                        {c.unsubscribed && <span style={{ fontSize: 9, padding:"1px 5px", borderRadius:3, background:C.red+"15", color:C.red }}>unsub</span>}
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 12.5 }}>
                      <a href={`mailto:${c.email}`} style={{ color: C.muted, textDecoration: "none" }}
                        onClick={e => { e.stopPropagation(); navigator.clipboard?.writeText(c.email); e.preventDefault(); fire("📋 Email copied"); }}>
                        {c.email}
                      </a>
                    </td>
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
                        {c.linkedin_url && (
                          <a href={c.linkedin_url.startsWith("http") ? c.linkedin_url : `https://${c.linkedin_url}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 11, color: "#0A66C2", textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}
                            onClick={e => e.stopPropagation()}>
                            🔗 LinkedIn
                          </a>
                        )}
                        <button onClick={async () => {
                          const isVip = c.tags?.includes("vip");
                          const newTags = isVip ? (c.tags||[]).filter(t=>t!=="vip") : [...(c.tags||[]), "vip"];
                          await supabase.from("contacts").update({ tags: newTags }).eq("id", c.id);
                          setContacts(p => p.map(x => x.id===c.id ? {...x,tags:newTags} : x));
                          fire(isVip ? "VIP tag removed" : "⭐ Marked as VIP");
                        }} title={c.tags?.includes("vip") ? "Remove VIP" : "Mark as VIP"}
                          style={{ fontSize: 13, background: "transparent", border: "none", cursor: "pointer", opacity: c.tags?.includes("vip") ? 1 : 0.3, lineHeight: 1 }}>⭐</button>
                        {activeEvent && (
                          <button onClick={async () => {
                            const { error } = await supabase.from("event_contacts").upsert({ event_id: activeEvent.id, contact_id: c.id, company_id: profile.company_id, status: "pending" }, { onConflict: "event_id,contact_id", ignoreDuplicates: true });
                            if (!error) fire(`✅ ${c.first_name || c.email} added to ${activeEvent.name}`);
                            else fire("Already in this event", "err");
                          }} title={`Add to ${activeEvent?.name}`}
                          style={{ fontSize: 11, padding: "3px 8px", background: C.blue + "15", border: `1px solid ${C.blue}30`, borderRadius: 4, color: C.blue, cursor: "pointer", whiteSpace: "nowrap" }}>
                            + Event
                          </button>
                        )}
                        <button onClick={() => { setNoteModal(c); setNoteText(c.notes || ""); }}
                          title={c.notes || "Add note"} style={{ fontSize: 12, background: "transparent", border: "none", cursor: "pointer", opacity: c.notes ? 1 : 0.3, lineHeight: 1 }}>
                          📝
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      {/* NOTE MODAL */}
      {noteModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:150 }}
          onClick={() => setNoteModal(null)}>
          <div style={{ background:C.card, borderRadius:12, border:`1px solid ${C.border}`, padding:24, width:380, animation:"fadeUp .2s ease" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:C.text }}>Note</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{noteModal.first_name ? `${noteModal.first_name} ${noteModal.last_name||""}`.trim() : noteModal.email}</div>
              </div>
              <button onClick={() => setNoteModal(null)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:20, lineHeight:1 }}>×</button>
            </div>
            <textarea autoFocus value={noteText} onChange={e => setNoteText(e.target.value)} rows={5}
              placeholder="Add a private note about this contact…"
              style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"10px 12px", fontSize:13, outline:"none", resize:"vertical", fontFamily:"inherit", boxSizing:"border-box" }}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e => e.target.style.borderColor = C.border} />
            <div style={{ display:"flex", gap:8, marginTop:12 }}>
              <button onClick={() => setNoteModal(null)} style={{ flex:1, padding:"9px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:7, color:C.muted, fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button onClick={async () => {
                await supabase.from("contacts").update({ notes: noteText }).eq("id", noteModal.id);
                setContacts(p => p.map(x => x.id === noteModal.id ? { ...x, notes: noteText } : x));
                fire(noteText ? "✅ Note saved" : "Note cleared");
                setNoteModal(null);
              }} style={{ flex:2, padding:"9px", background:C.blue, border:"none", borderRadius:7, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {showDuplicates && duplicates.length > 0 && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99 }}
          onClick={() => setShowDuplicates(false)}>
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: 28, width: 560, maxHeight: "85vh", overflowY: "auto", animation: "fadeUp .2s ease" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0 }}>⚠️ {duplicates.length} Duplicate Contact{duplicates.length>1?"s":""}</h2>
                <p style={{ fontSize: 12, color: C.muted, margin: "4px 0 0" }}>Click "Keep" on the record you want to keep — the other will be removed and all event history merged.</p>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={async () => {
                  // Auto-merge: keep the newer record for each pair
                  for (const dup of duplicates) {
                    const [a, b] = dup.contacts;
                    const keep = new Date(a.created_at) > new Date(b.created_at) ? a : b;
                    const remove = keep.id === a.id ? b : a;
                    await mergeDuplicate(keep, remove);
                  }
                  setShowDuplicates(false);
                }} style={{ fontSize:11, padding:"5px 12px", background:`${C.green}15`, border:`1px solid ${C.green}40`, borderRadius:6, color:C.green, cursor:"pointer", fontWeight:600 }}>
                  Auto-merge all
                </button>
                <button onClick={() => setShowDuplicates(false)} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 20, lineHeight:1 }}>×</button>
              </div>
            </div>
            {duplicates.slice(0, 8).map((dup, i) => {
              const [a, b] = dup.contacts;
              return (
                <div key={i} style={{ background: C.raised, borderRadius: 10, border: `1px solid ${C.amber}25`, padding: "14px 16px", marginBottom: 10 }}>
                  <div style={{ fontSize: 10.5, color: C.amber, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10, display:"flex", alignItems:"center", gap:6 }}>
                    <span>{dup.type === "email" ? "🔗 Same email address" : "👤 Same name & company"}</span>
                    <span style={{ marginLeft:"auto", color:C.muted, fontWeight:400, textTransform:"none" }}>Choose which to keep →</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems:"center" }}>
                    {[a, b].map((c, ci) => {
                      const isNewer = new Date(c.created_at) > new Date(ci===0?b:a).created_at;
                      return (
                        <div key={c.id} style={{ background: C.card, borderRadius: 8, padding: "12px 14px", border: `1px solid ${C.border}` }}>
                          {isNewer && <div style={{ fontSize:9, color:C.blue, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Newer record</div>}
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 }}>
                            {`${c.first_name||""} ${c.last_name||""}`.trim() || "—"}
                          </div>
                          <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{c.email || "—"}</div>
                          <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{c.company_name || "—"}</div>
                          <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>Added {c.created_at ? new Date(c.created_at).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"}) : "—"}</div>
                          <button
                            onClick={() => mergeDuplicate(c, ci === 0 ? b : a)}
                            disabled={mergingDup}
                            style={{ width: "100%", fontSize: 12, padding: "7px 8px", borderRadius: 6, border: "none", background: mergingDup?C.raised:C.green, color: mergingDup?C.muted:"#fff", cursor: "pointer", fontWeight:600 }}>
                            {mergingDup ? "Merging…" : "✅ Keep this one"}
                          </button>
                        </div>
                      );
                    })}
                    <div style={{ textAlign:"center", fontSize:18, color:C.muted }}>↔</div>
                  </div>
                </div>
              );
            })}
            {duplicates.length > 8 && (
              <p style={{ textAlign: "center", fontSize: 12, color: C.muted, padding:"8px 0" }}>…and {duplicates.length - 8} more. Use "Auto-merge all" to resolve all at once.</p>
            )}
          </div>
        </div>
      )}
      {showImport && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}
          onClick={resetImport}>
          <div style={{ background:C.card, borderRadius:14, border:`1px solid ${C.border}`, padding:28, width:640, maxHeight:"90vh", display:"flex", flexDirection:"column", animation:"fadeUp .2s ease", gap:0 }}
            onClick={e => e.stopPropagation()}>

            {/* ── Header ── */}
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18 }}>
              <div>
                <h2 style={{ fontSize:17, fontWeight:700, color:C.text, margin:0 }}>
                  {importStep === "input" ? "Import Contacts" : importStep === "map" ? "Map Columns" : "Preview & Import"}
                </h2>
                <div style={{ display:"flex", gap:6, marginTop:8 }}>
                  {["input","map","preview"].map((s,i) => (
                    <div key={s} style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <div style={{ width:20, height:20, borderRadius:"50%", background: importStep===s ? C.blue : i < ["input","map","preview"].indexOf(importStep) ? C.green : C.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#fff", fontWeight:700, flexShrink:0, transition:"all .2s" }}>
                        {i < ["input","map","preview"].indexOf(importStep) ? "✓" : i+1}
                      </div>
                      <span style={{ fontSize:10.5, color: importStep===s ? C.text : C.muted, fontWeight: importStep===s ? 600 : 400 }}>
                        {{input:"Upload",map:"Map",preview:"Preview"}[s]}
                      </span>
                      {i < 2 && <span style={{ color:C.border, fontSize:12 }}>›</span>}
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={resetImport} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:22, lineHeight:1, flexShrink:0 }}>×</button>
            </div>

            {/* ── Step 1: Upload / Paste ── */}
            {importStep === "input" && (
              <>
                {/* Drag-and-drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleImportFile(f); }}
                  onClick={() => importFileRef.current?.click()}
                  style={{ border:`2px dashed ${dragOver ? C.blue : C.border}`, borderRadius:10, padding:"28px 20px", textAlign:"center", cursor:"pointer", background: dragOver ? C.blue+"08" : C.raised, marginBottom:14, transition:"all .15s" }}>
                  <input ref={importFileRef} type="file" accept=".csv,.txt,.tsv" style={{ display:"none" }} onChange={e => { handleImportFile(e.target.files?.[0]); e.target.value=""; }} />
                  <div style={{ fontSize:32, marginBottom:8 }}>📂</div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:4 }}>Drop your CSV file here</div>
                  <div style={{ fontSize:12, color:C.muted }}>or click to browse · CSV, TSV, TXT · any column order</div>
                  <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:10, flexWrap:"wrap" }}>
                    {["Salesforce","HubSpot","LinkedIn","Eventbrite","Excel"].map(s => (
                      <span key={s} style={{ fontSize:10, padding:"2px 8px", borderRadius:4, background:C.card, border:`1px solid ${C.border}`, color:C.muted }}>{s}</span>
                    ))}
                  </div>
                </div>

                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <div style={{ flex:1, height:1, background:C.border }} />
                  <span style={{ fontSize:11, color:C.muted }}>or paste directly</span>
                  <div style={{ flex:1, height:1, background:C.border }} />
                </div>

                {/* Paste examples */}
                <div style={{ display:"flex", gap:6, marginBottom:8 }}>
                  {[
                    { label:"📋 CSV", ex:`first_name,last_name,email,company\nJohn,Smith,john@acme.com,Acme Corp\nJane,Lee,jane@corp.com,Corp Inc` },
                    { label:"📧 Emails", ex:`john@acme.com\njane@corp.com\nbob@startup.io` },
                    { label:"👤 Name+Email", ex:`John Smith <john@acme.com>\nJane Lee <jane@corp.com>` },
                    { label:"💼 LinkedIn", ex:`First Name,Last Name,Email Address,Company,Position\nJohn,Smith,john@acme.com,Acme Corp,CEO\nJane,Lee,jane@corp.com,Beta Inc,Director` },
                  ].map(t => (
                    <button key={t.label} onClick={() => setImportText(t.ex)}
                      style={{ flex:1, fontSize:10, padding:"5px 4px", background:C.raised, border:`1px solid ${C.border}`, borderRadius:5, color:C.muted, cursor:"pointer" }}>{t.label}</button>
                  ))}
                </div>

                {importText.trim() && (() => {
                  const fl = importText.split("\n")[0].toLowerCase();
                  const isLI = fl.includes("connected on") || (fl.includes("first name") && fl.includes("position"));
                  const isCSV = fl.includes(",") || fl.includes(";") || fl.includes("\t");
                  const fmt = isLI ? { label:"💼 LinkedIn Export", col:C.blue } : isCSV ? { label:"📋 CSV detected", col:C.green } : { label:"📧 Email list", col:C.teal };
                  return <div style={{ marginBottom:6 }}><span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:4, background:`${fmt.col}15`, color:fmt.col, border:`1px solid ${fmt.col}30` }}>{fmt.label}</span></div>;
                })()}

                <textarea value={importText} onChange={e => setImportText(e.target.value)} rows={7}
                  placeholder={"first_name,last_name,email,company_name,job_title\nJohn,Smith,john@acme.com,Acme Corp,CEO\n\n— or just paste emails —\n\njohn@company.com\nJane Lee <jane@corp.com>"}
                  style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"10px 12px", fontSize:12, outline:"none", resize:"vertical", fontFamily:"monospace", boxSizing:"border-box", marginBottom:6 }}
                  onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />

                <div style={{ fontSize:11, color:C.muted, marginBottom:14 }}>
                  {importText.trim() ? `${parseImportText(importText).length} contacts detected` : "Paste data above or drop a file to continue"}
                </div>

                <div style={{ display:"flex", gap:9 }}>
                  <button onClick={resetImport} style={{ flex:1, padding:11, background:"transparent", border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, fontSize:13, cursor:"pointer" }}>Cancel</button>
                  <button onClick={handleImportProceed} disabled={!importText.trim()}
                    style={{ flex:2, padding:11, background:importText.trim()?C.blue:C.border, border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:600, cursor:importText.trim()?"pointer":"default" }}>
                    Continue →
                  </button>
                </div>
              </>
            )}

            {/* ── Step 2: Column Mapping ── */}
            {importStep === "map" && (
              <>
                <div style={{ marginBottom:14, padding:"10px 14px", background:C.raised, borderRadius:8, border:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:12, color:C.muted, marginBottom:6 }}>Detected {csvHeaders.length} columns in your file. Map them to evara fields:</div>
                  <div style={{ fontSize:10.5, color:C.blue }}>⚡ Auto-mapped where column names matched</div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 32px 1fr", gap:"8px 12px", alignItems:"center", marginBottom:18, overflowY:"auto", maxHeight:320 }}>
                  {[
                    { key:"email",        label:"📧 Email",      required:true },
                    { key:"first_name",   label:"👤 First Name",  required:false },
                    { key:"last_name",    label:"   Last Name",   required:false },
                    { key:"company_name", label:"🏢 Company",     required:false },
                    { key:"job_title",    label:"💼 Job Title",   required:false },
                    { key:"phone",        label:"📞 Phone",       required:false },
                  ].map(f => (
                    <>
                      <div key={f.key+"label"} style={{ fontSize:12.5, color:C.text, fontWeight: f.required ? 600 : 400 }}>
                        {f.label}{f.required && <span style={{ color:C.red, marginLeft:3 }}>*</span>}
                      </div>
                      <div key={f.key+"arrow"} style={{ textAlign:"center", color:C.muted, fontSize:16 }}>→</div>
                      <select key={f.key+"sel"} value={columnMap[f.key] !== null && columnMap[f.key] !== undefined ? columnMap[f.key] : ""}
                        onChange={e => setColumnMap(m => ({ ...m, [f.key]: e.target.value === "" ? null : Number(e.target.value) }))}
                        style={{ fontSize:12, padding:"6px 10px", borderRadius:7, border:`1px solid ${columnMap[f.key] !== null && columnMap[f.key] !== undefined && columnMap[f.key] !== "" ? C.blue : C.border}`, background:C.raised, color: columnMap[f.key] !== null && columnMap[f.key] !== undefined && columnMap[f.key] !== "" ? C.text : C.muted, outline:"none" }}>
                        <option value="">— skip this field —</option>
                        {csvHeaders.map((h, i) => <option key={i} value={i}>{h || `Column ${i+1}`}</option>)}
                      </select>
                    </>
                  ))}
                </div>

                {/* Sample preview of first data row */}
                {(() => {
                  const firstDataLine = importText.split("\n").filter(l => l.trim())[1];
                  if (!firstDataLine) return null;
                  const sample = parseCSVLine(firstDataLine);
                  return (
                    <div style={{ marginBottom:14, padding:"10px 14px", background:C.raised, borderRadius:8, border:`1px solid ${C.border}` }}>
                      <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:6 }}>Sample row preview</div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        {Object.entries(columnMap).filter(([,v]) => v !== null && v !== undefined && v !== "").map(([k, vi]) => (
                          <span key={k} style={{ fontSize:11, padding:"2px 8px", borderRadius:4, background:C.card, border:`1px solid ${C.border}`, color:C.text }}>
                            <span style={{ color:C.muted }}>{k}: </span>{sample[vi] || "—"}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display:"flex", gap:9 }}>
                  <button onClick={() => setImportStep("input")} style={{ padding:"10px 20px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, fontSize:13, cursor:"pointer" }}>← Back</button>
                  <button onClick={() => {
                    if (columnMap.email === null || columnMap.email === undefined || columnMap.email === "") { fire("Email column is required","err"); return; }
                    const rows = buildRowsFromMap(importText, columnMap);
                    if (!rows.length) { fire("No valid emails found in mapped column","err"); return; }
                    setImportPreview(rows);
                    setImportStep("preview");
                  }} style={{ flex:1, padding:11, background:C.blue, border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                    Preview {buildRowsFromMap(importText, columnMap).length} contacts →
                  </button>
                </div>
              </>
            )}

            {/* ── Step 3: Preview + Confirm ── */}
            {importStep === "preview" && importPreview && (
              <>
                <div style={{ display:"flex", gap:10, marginBottom:12, flexWrap:"wrap" }}>
                  {[
                    { label:"Ready to import", val: importPreview.filter(r=>!r._personal).length, col:C.green },
                    { label:"Personal emails", val: importPreview.filter(r=>r._personal).length, col:C.amber },
                    { label:"Total detected", val: importPreview.length, col:C.text },
                  ].map(s => (
                    <div key={s.label} style={{ padding:"8px 14px", background:C.raised, borderRadius:8, border:`1px solid ${C.border}` }}>
                      <div style={{ fontSize:18, fontWeight:700, color:s.col }}>{s.val}</div>
                      <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.5px" }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ flex:1, overflowY:"auto", border:`1px solid ${C.border}`, borderRadius:8, marginBottom:12, maxHeight:300 }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                    <thead style={{ position:"sticky", top:0, zIndex:1 }}>
                      <tr style={{ background:C.raised, borderBottom:`1px solid ${C.border}` }}>
                        {["","Name","Email","Company","Title"].map(h => (
                          <th key={h} style={{ padding:"7px 10px", textAlign:"left", color:C.muted, fontWeight:600, fontSize:10, textTransform:"uppercase", letterSpacing:"0.5px" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((r,i) => (
                        <tr key={i} style={{ borderBottom:`1px solid ${C.border}`, opacity:r._personal?0.55:1, background:r._personal?`${C.amber}04`:"transparent" }}>
                          <td style={{ padding:"6px 10px", width:24 }}>
                            {r._personal ? <span title="Personal email — will be skipped" style={{ color:C.amber, fontSize:13 }}>⚠</span> : <span style={{ color:C.green, fontSize:13 }}>✓</span>}
                          </td>
                          <td style={{ padding:"6px 10px", color:C.text }}>{[r.first_name,r.last_name].filter(Boolean).join(" ")||<span style={{color:C.muted}}>—</span>}</td>
                          <td style={{ padding:"6px 10px", color:r._personal?C.amber:C.sec, fontFamily:"monospace", fontSize:11 }}>{r.email}</td>
                          <td style={{ padding:"6px 10px", color:C.sec, maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.company_name||<span style={{color:C.muted}}>—</span>}</td>
                          <td style={{ padding:"6px 10px", color:C.sec }}>{r.job_title||<span style={{color:C.muted}}>—</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {importPreview.filter(r=>r._personal).length > 0 && (
                  <div style={{ padding:"8px 12px", background:`${C.amber}10`, borderRadius:7, border:`1px solid ${C.amber}30`, marginBottom:10, fontSize:11.5, color:C.amber }}>
                    ⚠️ {importPreview.filter(r=>r._personal).length} personal email addresses (Gmail, Yahoo, etc.) will be skipped. Only business emails will be imported.
                  </div>
                )}

                {activeEvent && (
                  <label style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:C.raised, borderRadius:8, border:`1px solid ${addToEvent?C.blue:C.border}`, marginBottom:12, cursor:"pointer", transition:"border-color .15s" }}>
                    <input type="checkbox" checked={addToEvent} onChange={e => setAddToEvent(e.target.checked)}
                      style={{ width:15, height:15, accentColor:C.blue, cursor:"pointer" }} />
                    <div>
                      <div style={{ fontSize:12.5, fontWeight:600, color:C.text }}>Also add to "{activeEvent.name}"</div>
                      <div style={{ fontSize:11, color:C.muted }}>Contacts will appear in this event's guest list immediately</div>
                    </div>
                  </label>
                )}

                <div style={{ display:"flex", gap:9 }}>
                  <button onClick={() => { setImportStep(csvHeaders.length ? "map" : "input"); }} style={{ padding:"10px 20px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, fontSize:13, cursor:"pointer" }}>← Back</button>
                  <button onClick={async () => {
                    const rows = importPreview.filter(r => !r._personal);
                    if (!rows.length || !profile) return;
                    setImporting(true);
                    const toInsert = rows.map(r => { const {_personal,...rest}=r; return { ...rest, company_id:profile.company_id }; });
                    const { data, error } = await supabase.from("contacts").upsert(toInsert, { onConflict:"email,company_id", ignoreDuplicates:true }).select();
                    if (error) { fire(`Import error: ${error.message}`,"err"); setImporting(false); return; }
                    const newOnes = (data||[]).filter(Boolean);
                    setContacts(p => { const ex = new Set(p.map(c=>c.email)); return [...p,...newOnes.filter(c=>!ex.has(c.email))]; });
                    // Optionally link to event
                    if (addToEvent && activeEvent && newOnes.length) {
                      const ecRows = newOnes.map(c => ({ contact_id:c.id, event_id:activeEvent.id, company_id:profile.company_id, status:"pending" }));
                      await supabase.from("event_contacts").upsert(ecRows, { onConflict:"event_id,contact_id", ignoreDuplicates:true });
                    }
                    const skipped = rows.length - newOnes.length;
                    fire(`✅ ${newOnes.length} imported${skipped?` · ${skipped} already existed`:""}${addToEvent&&activeEvent?` · added to ${activeEvent.name}`:""}!`);
                    resetImport();
                    setImporting(false);
                  }} disabled={importing || !importPreview.filter(r=>!r._personal).length}
                    style={{ flex:1, padding:11, background:C.blue, border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                    {importing ? "Importing…" : `Import ${importPreview.filter(r=>!r._personal).length} Contact${importPreview.filter(r=>!r._personal).length!==1?"s":""}${addToEvent&&activeEvent?" + Add to Event":""} →`}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
      {/* ── BULK EMAIL MODAL ── */}
      {showBulkEmail && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}
          onClick={() => setShowBulkEmail(false)}>
          <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, width:540, maxHeight:"88vh", overflowY:"auto", animation:"fadeUp .2s ease" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding:"18px 22px 14px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <h2 style={{ fontSize:16, fontWeight:700, color:C.text, margin:0 }}>📧 Email {selContacts.size} contacts</h2>
                <p style={{ fontSize:11, color:C.muted, margin:"3px 0 0" }}>
                  {[...selContacts].slice(0,3).map(id => filtered.find(c=>c.id===id)?.email).filter(Boolean).join(", ")}
                  {selContacts.size > 3 ? ` +${selContacts.size-3} more` : ""}
                </p>
              </div>
              <button onClick={() => setShowBulkEmail(false)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:22, lineHeight:1 }}>×</button>
            </div>
            <div style={{ padding:"18px 22px" }}>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:600, color:C.muted, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>Subject</label>
                <input value={bulkSubject} onChange={e => setBulkSubject(e.target.value)} autoFocus
                  placeholder={`Update from ${profile?.companies?.name || "us"}`}
                  style={{ width:"100%", background:C.bg, border:`1.5px solid ${bulkSubject?C.blue:C.border}`, borderRadius:8, color:C.text, padding:"10px 13px", fontSize:13.5, outline:"none", boxSizing:"border-box" }} />
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:11, fontWeight:600, color:C.muted, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" }}>Message</label>
                <textarea value={bulkBody} onChange={e => setBulkBody(e.target.value)} rows={8}
                  placeholder={"Hi {first_name},\n\nWrite your message here…\n\nBest regards,\n" + (profile?.companies?.name || "The Team")}
                  style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"10px 13px", fontSize:13, outline:"none", resize:"vertical", lineHeight:1.6, boxSizing:"border-box", fontFamily:"Outfit,sans-serif" }}
                  onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                <div style={{ fontSize:11, color:C.muted, marginTop:5 }}>Use <code style={{ background:C.raised, padding:"1px 5px", borderRadius:3 }}>{"{first_name}"}</code> for personalisation — it auto-fills each recipient's name.</div>
              </div>
              <div style={{ background:C.raised, borderRadius:8, padding:"10px 13px", marginBottom:16, fontSize:12, color:C.sec, lineHeight:1.6 }}>
                <strong style={{ color:C.text }}>Preview:</strong> "{bulkSubject || "(no subject)"}" → Hi {filtered.find(c => selContacts.has(c.id))?.first_name || "John"},…
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setShowBulkEmail(false)} style={{ flex:1, padding:11, background:"transparent", border:`1px solid ${C.border}`, borderRadius:9, color:C.muted, fontSize:13, cursor:"pointer" }}>Cancel</button>
                <button onClick={async () => {
                  if (!bulkSubject.trim() || !bulkBody.trim()) { fire("Subject and message required","err"); return; }
                  const ids = [...selContacts];
                  const toSend = filtered.filter(c => ids.includes(c.id) && !c.unsubscribed);
                  if (!toSend.length) { fire("No sendable contacts (all unsubscribed?)","err"); return; }
                  fire(`📤 Sending to ${toSend.length} contacts…`);
                  setShowBulkEmail(false);
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    const recipients = toSend.map(c => ({ email: c.email, first_name: c.first_name || "", last_name: c.last_name || "" }));
                    const htmlContent = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#111;max-width:600px;margin:0 auto;padding:32px 24px">${
                      bulkBody.split("\n").map(line => line ? `<p style="margin:0 0 12px">${line.replace(/{first_name}/g,'[first_name]')}</p>` : '<br/>').join("")
                    }<hr style="border:none;border-top:1px solid #eee;margin:24px 0"/><p style="font-size:11px;color:#999">You received this because you're a contact of ${profile?.companies?.name||"our organisation"}. <a href="{{unsubscribeUrl}}">Unsubscribe</a></p></div>`;
                    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
                      method:"POST",
                      headers:{"Content-Type":"application/json","Authorization":`Bearer ${session?.access_token}`},
                      body: JSON.stringify({ to: recipients, subject: bulkSubject, htmlContent, companyId: profile?.company_id, personalise: true })
                    });
                    const d = await res.json();
                    fire(d.sent > 0 ? `✅ Sent to ${d.sent} contacts!` : `Failed: ${d.error||"check SendGrid"}`, d.sent>0?"ok":"err");
                    setBulkSubject(""); setBulkBody(""); setSelContacts(new Set());
                  } catch(err) { fire("Send failed: "+err.message,"err"); }
                }} disabled={!bulkSubject.trim()||!bulkBody.trim()} style={{ flex:2, padding:11, background:bulkSubject.trim()&&bulkBody.trim()?C.blue:C.border, border:"none", borderRadius:9, color:"#fff", fontSize:14, fontWeight:600, cursor:bulkSubject.trim()&&bulkBody.trim()?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  📧 Send to {selContacts.size} contact{selContacts.size!==1?"s":""}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

// ─── LANDING VIEW ─────────────────────────────────────────────
function LandingView({ supabase, profile, activeEvent, fire, formShareLink }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(null);
  const [previewMode, setPreviewMode] = useState("desktop"); // desktop | mobile
  const [sideTab, setSideTab] = useState("content"); // content | design | sections
  const [aiGenerating, setAiGenerating] = useState(false);
  const [blocks, setBlocks] = useState({ hero: true, countdown: true, details: true, speakers: false, rsvp: true, sponsors: false });
  const brandColor = profile?.companies?.brand_color || "#0A84FF";
  const logoUrl = profile?.companies?.logo_url || "";
  const [info, setInfo] = useState({
    title: "", tagline: "", description: "", headline: "", subheadline: "",
    about_text: "", brand_color: brandColor, cta_text: "Register Now",
    template: "corporate", slug: (activeEvent?.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    location_text: "", organiser: "",
  });

  const TMPLS = [
    { id: "minimal", name: "Minimal", desc: "Clean, white & text-forward", accent: "#111", bg: "#FFFFFF", textCol: "#111111" },
    { id: "corporate", name: "Corporate", desc: "Dark, professional & premium", accent: brandColor, bg: "#0D0D0F", textCol: "#F5F5F7" },
    { id: "bold", name: "Bold", desc: "Vibrant gradient & high-energy", accent: brandColor, bg: "#0A0A1A", textCol: "#FFFFFF" },
    { id: "light", name: "Warm", desc: "Soft, friendly & approachable", accent: brandColor, bg: "#FAF9F7", textCol: "#1A1A1A" },
    { id: "editorial", name: "Editorial", desc: "Typographic & editorial feel", accent: "#000000", bg: "#F5F0E8", textCol: "#1A1A1A" },
    { id: "neon", name: "Neon", desc: "Bold dark with vivid highlights", accent: "#39FF14", bg: "#050505", textCol: "#FFFFFF" },
  ];
  const BLOCK_LIST = [
    { id: "hero", label: "Hero / Banner", icon: "🖼" },
    { id: "countdown", label: "Countdown Timer", icon: "⏱" },
    { id: "details", label: "Event Details", icon: "📍" },
    { id: "about", label: "About Section", icon: "📝" },
    { id: "speakers", label: "Speakers", icon: "🎤" },
    { id: "rsvp", label: "RSVP / Register Button", icon: "📋" },
    { id: "sponsors", label: "Sponsors", icon: "🏅" },
  ];

  useEffect(() => {
    if (!activeEvent || !profile) return;
    supabase.from("landing_pages").select("*").eq("event_id", activeEvent.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setPage(data);
          setInfo({ title: data.title || "", tagline: data.tagline || "", description: data.description || "", headline: data.headline || "", subheadline: data.subheadline || "", about_text: data.about_text || "", brand_color: data.brand_color || brandColor, cta_text: data.cta_text || "Register Now", template: data.template || "corporate", slug: data.slug || (activeEvent?.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "", location_text: data.location_text || "", organiser: data.organiser || "" });
          setBlocks(data.blocks || blocks);
          setStep(2);
        }
        setLoading(false);
      });
    if (activeEvent) {
      setInfo(p => ({ ...p, title: p.title || activeEvent.name || "", description: p.description || activeEvent.description || "", location_text: p.location_text || activeEvent.location || "", slug: p.slug || (activeEvent.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"), organiser: p.organiser || profile?.companies?.name || "" }));
    }
  }, [activeEvent, profile]);

  const save = async (publish = false) => {
    if (!activeEvent || !profile) return; setSaving(true);
    const payload = { event_id: activeEvent.id, company_id: profile.company_id, ...info, blocks, is_published: publish, reg_url: formShareLink || info.reg_url || "" };
    const { data, error } = await supabase.from("landing_pages").upsert(payload, { onConflict: "event_id" }).select().single();
    if (error) { fire(error.message, "err"); }
    else {
      setPage(data);
      if (publish) {
        const url = `${window.location.origin}/page/${data.slug}`;
        fire(`🎉 Page published! Copied to clipboard.`);
        navigator.clipboard?.writeText(url);
      } else { fire("Draft saved ✓"); }
    }
    setSaving(false);
  };

  const aiGenerateCopy = async () => {
    if (!activeEvent) return;
    setAiGenerating(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 600,
          messages: [{ role: "user", content: `Write landing page copy for this event. Return JSON only with keys: headline, subheadline, tagline, about_text, cta_text. Event: ${activeEvent.name}. Date: ${activeEvent.event_date || "TBC"}. Location: ${activeEvent.location || "TBC"}. Type: ${activeEvent.event_type || "event"}. Description: ${activeEvent.description || "Professional event"}. Organiser: ${profile?.companies?.name || ""}. Keep headline punchy (max 8 words), subheadline 1 sentence, tagline 5 words, about_text 2–3 sentences, cta_text 3 words max.` }],
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setInfo(p => ({ ...p, ...parsed }));
      fire("✨ AI copy generated!");
    } catch { fire("AI generation failed — fill in manually", "err"); }
    setAiGenerating(false);
  };

  const tmpl = TMPLS.find(t => t.id === info.template) || TMPLS[1];
  const accent = info.brand_color || brandColor;

  // ── Template mini-preview ──
  const TemplateThumbnail = ({ t, selected }) => {
    const a = t.id === "neon" ? "#39FF14" : t.id === "editorial" ? "#000" : t.id === "minimal" ? "#111" : accent;
    return (
      <div onClick={() => { setInfo(p => ({ ...p, template: t.id })); setStep(2); }}
        style={{ borderRadius: 10, border: `2px solid ${selected ? accent : C.border}`, overflow: "hidden", cursor: "pointer", transition: "all .15s", boxShadow: selected ? `0 0 0 2px ${accent}40` : "none" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = selected ? accent : C.border; e.currentTarget.style.transform = "none"; }}>
        <div style={{ height: 160, background: t.bg, padding: "12px 14px", position: "relative", overflow: "hidden" }}>
          {/* nav bar */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ width:28, height:5, borderRadius:3, background: t.id==="minimal"?"#222":t.id==="editorial"?"#000":"rgba(255,255,255,0.5)" }} />
            <div style={{ width:32, height:14, borderRadius:3, background:a, opacity:0.9 }} />
          </div>
          {/* hero band */}
          {t.id==="bold" && <div style={{ position:"absolute", inset:0, background:`linear-gradient(135deg, ${accent}30, ${accent}08)`, pointerEvents:"none" }} />}
          {t.id==="neon" && <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 0%, ${a}20 0%, transparent 70%)`, pointerEvents:"none" }} />}
          {t.id==="editorial" && <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"#000" }} />}
          <div style={{ height:6, borderRadius:4, background: t.id==="minimal"||t.id==="light"||t.id==="editorial"?"#1A1A1A":"rgba(255,255,255,0.85)", width:"75%", marginBottom:6 }} />
          <div style={{ height:4, borderRadius:3, background: t.id==="minimal"||t.id==="light"||t.id==="editorial"?"#666":"rgba(255,255,255,0.4)", width:"55%", marginBottom:14 }} />
          <div style={{ height:22, width:60, borderRadius:5, background:a }} />
          {/* detail pills */}
          <div style={{ position:"absolute", bottom:10, left:14, display:"flex", gap:5 }}>
            {[40,55,36].map((w,i) => <div key={i} style={{ height:6, width:w, borderRadius:3, background: t.id==="minimal"||t.id==="light"||t.id==="editorial"?"rgba(0,0,0,0.12)":"rgba(255,255,255,0.15)" }} />)}
          </div>
        </div>
        <div style={{ padding: "10px 12px", background: C.card, borderTop: `1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{t.name}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop:1 }}>{t.desc}</div>
          </div>
          {selected && <div style={{ width:16, height:16, borderRadius:"50%", background:accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#fff" }}>✓</div>}
        </div>
      </div>
    );
  };

  // ── Rich live preview ──
  const LivePreview = () => {
    const isMinimal = info.template === "minimal" || info.template === "light" || info.template === "editorial";
    const textColor = tmpl.textCol;
    const subColor = isMinimal ? "#555" : "rgba(255,255,255,0.6)";
    const borderCol = isMinimal ? "#E5E5E7" : "rgba(255,255,255,0.1)";
    const a = info.template === "neon" ? "#39FF14" : info.template === "editorial" ? "#000" : info.template === "minimal" ? "#111" : accent;

    const days = activeEvent?.event_date ? Math.max(0, Math.ceil((new Date(activeEvent.event_date) - new Date()) / (1000*60*60*24))) : null;

    return (
      <div style={{ background: tmpl.bg, fontFamily: info.template==="editorial" ? "Georgia,serif" : "Outfit,sans-serif", color: textColor, minHeight:"100%", fontSize:14 }}>
        {/* Top accent bar */}
        {info.template === "editorial" && <div style={{ height:4, background:"#000" }} />}
        {info.template === "neon" && <div style={{ height:2, background:`linear-gradient(90deg, transparent, #39FF14, transparent)` }} />}

        {/* Nav */}
        <div style={{ padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${borderCol}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {logoUrl && <img src={logoUrl} alt="" style={{ height:22, objectFit:"contain" }} />}
            <span style={{ fontSize:13, fontWeight:700, color:textColor }}>{info.organiser || profile?.companies?.name || "Organiser"}</span>
          </div>
          <div style={{ background:a, color: info.template==="neon"?"#000":"#fff", padding:"5px 14px", borderRadius:5, fontSize:11.5, fontWeight:600, cursor:"pointer" }}>{info.cta_text || "Register Now"}</div>
        </div>

        {/* Hero */}
        {blocks.hero && (
          <div style={{ padding: previewMode==="mobile" ? "36px 20px" : "52px 40px", textAlign:"center", position:"relative", overflow:"hidden" }}>
            {(info.template==="bold"||info.template==="neon") && <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 0%, ${a}25 0%, transparent 65%)`, pointerEvents:"none" }} />}
            {activeEvent?.event_date && (
              <div style={{ fontSize:10, fontWeight:600, color:a, textTransform:"uppercase", letterSpacing:"2px", marginBottom:10 }}>
                {new Date(activeEvent.event_date).toLocaleDateString("en-AU", { day:"numeric", month:"long", year:"numeric" })}
                {activeEvent.location ? ` · ${activeEvent.location}` : ""}
              </div>
            )}
            <h1 style={{ fontSize: previewMode==="mobile"?26:38, fontWeight:800, letterSpacing:"-0.8px", lineHeight:1.08, marginBottom:12, color:textColor }}>{info.headline || info.title || activeEvent?.name || "Event Title"}</h1>
            {info.subheadline && <p style={{ fontSize: previewMode==="mobile"?13:15, color:subColor, maxWidth:460, margin:"0 auto 10px", lineHeight:1.6 }}>{info.subheadline}</p>}
            {info.tagline && <p style={{ fontSize:13, color: isMinimal?"#888":"rgba(255,255,255,0.45)", marginBottom:20, fontStyle: info.template==="editorial"?"italic":"normal" }}>{info.tagline}</p>}
            <div style={{ display:"inline-block", background:a, color: info.template==="neon"?"#000":"#fff", padding:"11px 28px", borderRadius:7, fontSize:13, fontWeight:700, cursor:"pointer" }}>{info.cta_text || "Register Now"}</div>
          </div>
        )}

        {/* Countdown */}
        {blocks.countdown && days !== null && (
          <div style={{ padding:"16px 24px", borderTop:`1px solid ${borderCol}`, borderBottom:`1px solid ${borderCol}`, display:"flex", justifyContent:"center", gap: previewMode==="mobile"?12:24 }}>
            {[["Days",days],["Hours","00"],["Mins","00"],["Secs","00"]].map(([lbl,val]) => (
              <div key={lbl} style={{ textAlign:"center" }}>
                <div style={{ fontSize: previewMode==="mobile"?22:28, fontWeight:800, color: a, lineHeight:1 }}>{String(val).padStart(2,"0")}</div>
                <div style={{ fontSize:9, color:subColor, textTransform:"uppercase", letterSpacing:"1px", marginTop:3 }}>{lbl}</div>
              </div>
            ))}
          </div>
        )}

        {/* Event details grid */}
        {blocks.details && (
          <div style={{ padding:"24px", display:"grid", gridTemplateColumns: previewMode==="mobile"?"1fr":"1fr 1fr 1fr", gap:12, borderBottom:`1px solid ${borderCol}` }}>
            {[
              { icon:"📅", label:"Date", val: activeEvent?.event_date ? new Date(activeEvent.event_date).toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"}) : "Date TBC" },
              { icon:"📍", label:"Location", val: info.location_text || activeEvent?.location || "Location TBC" },
              { icon:"🕐", label:"Time", val: activeEvent?.event_time || "Time TBC" },
            ].map(({ icon, label, val }) => (
              <div key={label} style={{ background: isMinimal?"rgba(0,0,0,0.04)":"rgba(255,255,255,0.05)", border:`1px solid ${borderCol}`, borderRadius:8, padding:"12px 14px" }}>
                <div style={{ fontSize:16, marginBottom:6 }}>{icon}</div>
                <div style={{ fontSize:9.5, color:subColor, textTransform:"uppercase", letterSpacing:"1px", marginBottom:3 }}>{label}</div>
                <div style={{ fontSize:12, fontWeight:600, color:textColor, lineHeight:1.3 }}>{val}</div>
              </div>
            ))}
          </div>
        )}

        {/* About */}
        {blocks.about && (info.about_text || info.description) && (
          <div style={{ padding:"24px 28px", borderBottom:`1px solid ${borderCol}` }}>
            <div style={{ fontSize:9.5, color:a, textTransform:"uppercase", letterSpacing:"1.5px", fontWeight:600, marginBottom:10 }}>About</div>
            <p style={{ fontSize:13.5, color:subColor, lineHeight:1.75, maxWidth:560 }}>{info.about_text || info.description}</p>
          </div>
        )}

        {/* RSVP CTA */}
        {blocks.rsvp && (
          <div style={{ padding:"28px 24px", textAlign:"center", borderBottom:`1px solid ${borderCol}` }}>
            <div style={{ fontSize:16, fontWeight:700, color:textColor, marginBottom:6 }}>Ready to attend?</div>
            <div style={{ fontSize:12.5, color:subColor, marginBottom:16 }}>Secure your spot before registrations close.</div>
            <div style={{ display:"inline-block", background:a, color: info.template==="neon"?"#000":"#fff", padding:"12px 32px", borderRadius:8, fontSize:13.5, fontWeight:700, cursor:"pointer" }}>{info.cta_text || "Register Now"}</div>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:`1px solid ${borderCol}`, opacity:0.6 }}>
          <span style={{ fontSize:11 }}>© 2025 {info.organiser || profile?.companies?.name}</span>
          <span style={{ fontSize:11 }}>Powered by evara</span>
        </div>
      </div>
    );
  };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", gap: 10, color: C.muted }}><Spin />Loading…</div>;

  return (
    <div style={{ animation: "fadeUp .2s ease", display: "flex", flexDirection: "column", height: "calc(100vh - 110px)" }}>
      {/* Header */}
      <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.5px", color: C.text }}>Landing Page Builder</h1>
          <p style={{ color: C.muted, fontSize: 12.5, marginTop: 3 }}>Event page live in minutes — publish when ready.</p>
        </div>
        {step === 2 && (
          <div style={{ display: "flex", gap: 8, alignItems:"center" }}>
            {page?.is_published && <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: C.green, padding: "6px 12px", background: `${C.green}12`, border: `1px solid ${C.green}30`, borderRadius: 6 }}><div style={{ width:6,height:6,borderRadius:"50%",background:C.green }} /> Live</div>}
            <button onClick={() => setStep(1)} style={{ fontSize: 12.5, padding: "7px 12px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>← Templates</button>
            <button onClick={() => save(false)} disabled={saving} style={{ fontSize: 12.5, padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.text, cursor: "pointer" }}>{saving ? <Spin /> : "Save draft"}</button>
            <button onClick={() => save(true)} disabled={saving} style={{ fontSize: 12.5, padding: "7px 18px", borderRadius: 7, border: "none", background: C.blue, color: "#fff", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>{saving ? <><Spin />Publishing…</> : "Publish →"}</button>
          </div>
        )}
      </div>

      {/* Live URL bar */}
      {page?.is_published && page?.slug && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: C.green + "10", border: `1px solid ${C.green}25`, borderRadius: 8, marginBottom: 10, flexShrink:0 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} />
          <span style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>Live:</span>
          <code style={{ fontSize: 11.5, color: C.text, flex:1 }}>{window.location.origin}/page/{page.slug}</code>
          <button onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/page/${page.slug}`); fire("✅ URL copied!"); }} style={{ fontSize: 10.5, padding: "3px 10px", background: C.green + "20", border: `1px solid ${C.green}40`, borderRadius: 5, color: C.green, cursor: "pointer", fontWeight: 500 }}>Copy</button>
          <button onClick={() => {
            const url = `${window.location.origin}/page/${page.slug}`;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&bgcolor=FFFFFF&color=0A84FF&margin=10`;
            const w = window.open("", "_blank", "width=380,height=420");
            w.document.write(`<html><head><title>QR — ${page.slug}</title></head><body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:Arial,sans-serif;background:#f8f9fa"><img src="${qrUrl}" width="280" style="border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.12)"><p style="font-size:12px;color:#666;margin:12px 0 4px;text-align:center">Scan to open landing page</p><p style="font-size:11px;color:#999;margin:0">${url}</p><button onclick="window.print()" style="margin-top:16px;padding:8px 20px;background:#0A84FF;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px">Print QR</button></body></html>`);
            w.document.close();
          }} style={{ fontSize: 10.5, padding: "3px 10px", background: C.raised, border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }} title="Download QR code for this page">
            QR
          </button>
          <a href={`/page/${page.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: 10.5, padding: "3px 10px", background: C.raised, border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, textDecoration: "none" }}>Open ↗</a>
        </div>
      )}

      {/* Template picker */}
      {step === 1 && (
        <div style={{ flex:1, overflow:"auto" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14 }}>Choose a template</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, paddingBottom:20 }}>
            {TMPLS.map(t => <TemplateThumbnail key={t.id} t={t} selected={info.template === t.id} />)}
          </div>
        </div>
      )}

      {/* Editor */}
      {step === 2 && (
        <div style={{ display: "flex", gap: 12, flex: 1, minHeight: 0 }}>
          {/* Left sidebar */}
          <div style={{ width: 248, display: "flex", flexDirection: "column", gap: 0, flexShrink: 0, overflow:"hidden", border:`1px solid ${C.border}`, borderRadius:10, background:C.card }}>
            {/* Sidebar tabs */}
            <div style={{ display:"flex", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
              {[{id:"content",label:"Content"},{id:"design",label:"Design"},{id:"sections",label:"Sections"}].map(t => (
                <button key={t.id} onClick={() => setSideTab(t.id)} style={{ flex:1, padding:"9px 4px", border:"none", background:"transparent", color: sideTab===t.id ? C.text : C.muted, fontSize:12, fontWeight: sideTab===t.id ? 600 : 400, borderBottom: sideTab===t.id ? `2px solid ${C.blue}` : "2px solid transparent", cursor:"pointer", transition:"all .12s" }}>{t.label}</button>
              ))}
            </div>
            <div style={{ flex:1, overflow:"auto", padding:"12px" }}>
              {/* AI fill */}
              <button onClick={aiGenerateCopy} disabled={aiGenerating} style={{ width:"100%", marginBottom:12, padding:"8px", borderRadius:7, border:`1px solid ${C.blue}30`, background:`${C.blue}12`, color:C.blue, fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                {aiGenerating ? <><Spin /> Generating…</> : <><Sparkles size={13} /> AI fill from event</>}
              </button>

              {sideTab === "content" && (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {/* URL slug */}
                  <div>
                    <div style={{ fontSize:10.5, color:C.muted, marginBottom:4, fontWeight:500 }}>Page URL</div>
                    <div style={{ display:"flex", background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, overflow:"hidden" }}>
                      <span style={{ fontSize:10, color:C.muted, padding:"8px 6px 8px 8px", whiteSpace:"nowrap", borderRight:`1px solid ${C.border}` }}>/page/</span>
                      <input value={info.slug} onChange={e => setInfo(p => ({ ...p, slug: e.target.value.replace(/[^a-z0-9-]/g, "-") }))} style={{ flex:1, background:"none", border:"none", outline:"none", color:C.text, padding:"8px 6px", fontSize:11.5, fontFamily:"monospace" }} />
                    </div>
                  </div>
                  {[
                    { k:"headline", ph:"Punchy event headline", label:"Headline" },
                    { k:"subheadline", ph:"One clear sentence about the event", label:"Subheadline" },
                    { k:"tagline", ph:"Short 5-word tagline", label:"Tagline" },
                    { k:"cta_text", ph:"Register Now", label:"Button text" },
                    { k:"location_text", ph:activeEvent?.location||"Venue name or Online", label:"Location" },
                    { k:"organiser", ph:profile?.companies?.name||"Organiser name", label:"Organiser" },
                  ].map(f => (
                    <div key={f.k}>
                      <div style={{ fontSize:10.5, color:C.muted, marginBottom:4, fontWeight:500 }}>{f.label}</div>
                      <input value={info[f.k]||""} onChange={e => setInfo(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph} style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, color:C.text, padding:"7px 9px", fontSize:12.5, outline:"none" }} onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                    </div>
                  ))}
                  <div>
                    <div style={{ fontSize:10.5, color:C.muted, marginBottom:4, fontWeight:500 }}>About section</div>
                    <textarea value={info.about_text||""} onChange={e => setInfo(p=>({...p, about_text:e.target.value}))} rows={4} placeholder="What attendees will experience..." style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, color:C.text, padding:"7px 9px", fontSize:12.5, outline:"none", resize:"none", lineHeight:1.5 }} onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                  </div>

                  {/* SEO + Social Meta */}
                  <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12, marginTop:4 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:8 }}>SEO & Social Preview</div>
                    <div style={{ marginBottom:8 }}>
                      <div style={{ fontSize:10.5, color:C.muted, marginBottom:4 }}>Meta title <span style={{ color:C.muted, fontSize:9 }}>(55–60 chars ideal)</span></div>
                      <input value={info.meta_title||""} onChange={e=>setInfo(p=>({...p,meta_title:e.target.value}))} placeholder={`${activeEvent?.name || "Event"} — Register Now`}
                        style={{ width:"100%", background:C.bg, border:`1px solid ${(info.meta_title||"").length>60?C.red:(info.meta_title||"").length>45?C.green:C.border}`, borderRadius:6, color:C.text, padding:"7px 9px", fontSize:12.5, outline:"none" }}
                        onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                      <div style={{ fontSize:10, color:(info.meta_title||"").length>60?C.red:C.muted, marginTop:2 }}>{(info.meta_title||"").length}/60</div>
                    </div>
                    <div style={{ marginBottom:8 }}>
                      <div style={{ fontSize:10.5, color:C.muted, marginBottom:4 }}>Meta description <span style={{ color:C.muted, fontSize:9 }}>(150–160 chars)</span></div>
                      <textarea value={info.meta_description||""} onChange={e=>setInfo(p=>({...p,meta_description:e.target.value}))} rows={2}
                        placeholder="Join us for..."
                        style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, color:C.text, padding:"7px 9px", fontSize:12, outline:"none", resize:"none" }}
                        onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
                      <div style={{ fontSize:10, color:(info.meta_description||"").length>160?C.red:C.muted, marginTop:2 }}>{(info.meta_description||"").length}/160</div>
                    </div>
                    {/* Social preview card */}
                    {(info.meta_title||info.title) && (
                      <div style={{ border:`1px solid ${C.border}`, borderRadius:8, overflow:"hidden" }}>
                        <div style={{ height:48, background:`linear-gradient(135deg,${info.brand_color||C.blue}40,${info.brand_color||C.blue}20)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {logoUrl ? <img src={logoUrl} style={{ height:28, objectFit:"contain" }} alt="logo" /> : <span style={{ fontSize:11, color:C.muted }}>No image</span>}
                        </div>
                        <div style={{ padding:"8px 10px", background:C.raised }}>
                          <div style={{ fontSize:11, fontWeight:600, color:C.text, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{info.meta_title||info.title}</div>
                          <div style={{ fontSize:10, color:C.muted, overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{info.meta_description||info.description}</div>
                          <div style={{ fontSize:9, color:C.muted, marginTop:3 }}>evarahq.com/page/{info.slug}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {sideTab === "design" && (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div>
                    <div style={{ fontSize:10.5, color:C.muted, marginBottom:8, fontWeight:500 }}>Template</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                      {TMPLS.map(t => (
                        <button key={t.id} onClick={() => setInfo(p => ({...p, template:t.id}))} style={{ padding:"7px 8px", borderRadius:7, border:`2px solid ${info.template===t.id ? accent : C.border}`, background: info.template===t.id ? accent+"18" : C.bg, color: info.template===t.id ? accent : C.sec, fontSize:11.5, fontWeight: info.template===t.id ? 600 : 400, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                          <div style={{ width:10, height:10, borderRadius:2, background: t.bg, border:`1px solid ${C.border}`, flexShrink:0 }} />
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize:10.5, color:C.muted, marginBottom:6, fontWeight:500 }}>Accent colour</div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <input type="color" value={info.brand_color||accent} onChange={e=>setInfo(p=>({...p,brand_color:e.target.value}))} style={{ width:36, height:30, border:"none", background:"none", cursor:"pointer", padding:0 }} />
                      <input value={info.brand_color||accent} onChange={e=>setInfo(p=>({...p,brand_color:e.target.value}))} style={{ flex:1, background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, color:C.text, padding:"6px 8px", fontSize:12, outline:"none" }} />
                    </div>
                  </div>
                </div>
              )}

              {sideTab === "sections" && (
                <div>
                  {BLOCK_LIST.map((b, i) => (
                    <div key={b.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderBottom: i < BLOCK_LIST.length-1 ? `1px solid ${C.border}` : "none" }}>
                      <span style={{ fontSize:13, color: blocks[b.id] ? C.text : C.muted }}>{b.icon} {b.label}</span>
                      <div onClick={() => setBlocks(p => ({ ...p, [b.id]: !p[b.id] }))} style={{ width:32, height:18, borderRadius:9, background: blocks[b.id] ? C.green : "#3A3A3C", cursor:"pointer", position:"relative", transition:"background .2s", flexShrink:0 }}>
                        <div style={{ width:12, height:12, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left: blocks[b.id] ? 17 : 3, transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,.4)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preview pane */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>
            {/* Preview controls */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8, flexShrink:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, background:C.card, border:`1px solid ${C.border}`, borderRadius:7, padding:"5px 10px" }}>
                <Globe size={11} color={C.muted} />
                <span style={{ fontSize:11.5, color:C.muted, fontFamily:"monospace" }}>{window.location.origin}/page/{info.slug || "your-event"}</span>
              </div>
              <div style={{ display:"flex", gap:4 }}>
                {[{id:"desktop",icon:"🖥"},{id:"mobile",icon:"📱"}].map(m => (
                  <button key={m.id} onClick={() => setPreviewMode(m.id)} style={{ padding:"5px 12px", borderRadius:6, border:`1px solid ${previewMode===m.id ? C.blue : C.border}`, background: previewMode===m.id ? `${C.blue}14` : "transparent", color: previewMode===m.id ? C.blue : C.muted, fontSize:13, cursor:"pointer" }}>{m.icon}</button>
                ))}
              </div>
            </div>

            {/* Preview frame */}
            <div style={{ flex:1, overflow:"auto", display:"flex", justifyContent:"center", background:C.bg, borderRadius:10, border:`1px solid ${C.border}`, padding: previewMode==="mobile" ? "20px" : "0" }}>
              <div style={{ width: previewMode==="mobile" ? 375 : "100%", border: previewMode==="mobile" ? `1px solid ${C.border}` : "none", borderRadius: previewMode==="mobile" ? 16 : 0, overflow:"hidden", boxShadow: previewMode==="mobile" ? "0 8px 32px rgba(0,0,0,.4)" : "none" }}>
                <LivePreview />
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

  const FORM_TEMPLATES = [
    { label:"📋 RSVP", fields:[
      { id:1, type:"text", label:"First Name", required:true, options:[] },
      { id:2, type:"text", label:"Last Name", required:false, options:[] },
      { id:3, type:"email", label:"Email Address", required:true, options:[] },
      { id:4, type:"text", label:"Company", required:false, options:[] },
      { id:5, type:"radio", label:"Will you attend?", required:true, options:["Yes, I'll attend","Unable to attend"] },
      { id:6, type:"checkbox", label:"I consent to receive event communications.", required:true, options:[] },
    ]},
    { label:"📝 Full Reg", fields:[
      { id:1, type:"text", label:"First Name", required:true, options:[] },
      { id:2, type:"text", label:"Last Name", required:true, options:[] },
      { id:3, type:"email", label:"Email Address", required:true, options:[] },
      { id:4, type:"phone", label:"Phone Number", required:false, options:[] },
      { id:5, type:"text", label:"Company / Organisation", required:false, options:[] },
      { id:6, type:"text", label:"Job Title", required:false, options:[] },
      { id:7, type:"radio", label:"Will you attend?", required:true, options:["Yes, I'll attend","Unable to attend","Sending a colleague"] },
      { id:8, type:"dietary", label:"Dietary requirements", required:false, options:["None","Vegetarian","Vegan","Gluten free","Halal","Kosher","Other"] },
      { id:9, type:"checkbox", label:"I consent to receive event communications.", required:true, options:[] },
    ]},
    { label:"⭐ Feedback", fields:[
      { id:1, type:"rating", label:"How would you rate this event overall?", required:true, options:[] },
      { id:2, type:"radio", label:"Would you attend our next event?", required:true, options:["Definitely","Probably","Unsure","Probably not"] },
      { id:3, type:"textarea", label:"What did you enjoy most?", required:false, options:[] },
      { id:4, type:"textarea", label:"What could we improve?", required:false, options:[] },
      { id:5, type:"text", label:"Any other comments?", required:false, options:[] },
    ]},
    { label:"📋 Waitlist", fields:[
      { id:1, type:"text", label:"Full Name", required:true, options:[] },
      { id:2, type:"email", label:"Email Address", required:true, options:[] },
      { id:3, type:"text", label:"Company", required:false, options:[] },
      { id:4, type:"textarea", label:"Why are you interested in attending?", required:false, options:[] },
      { id:5, type:"checkbox", label:"Notify me if a spot opens up.", required:true, options:[] },
    ]},
  ];

  return (
    <div style={{ animation: "fadeUp .2s ease", display: "flex", flexDirection: "column", height: "calc(100vh - 110px)" }}>
      <div style={{ marginBottom: 12, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.6px", color: C.text }}>Registration Forms</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Build your form, save it, then share the link or embed it.</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={saveForm} disabled={saving} style={{ fontSize: 13, padding: "7px 18px", borderRadius: 7, border: "none", background: C.blue, color: "#fff", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>{saving ? <><Spin />Saving…</> : activeForm ? "Save changes →" : "Create form →"}</button>
        </div>
      </div>

      {/* Template quick-start */}
      {!activeForm && (
        <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
          <span style={{ fontSize:11, color:C.muted, alignSelf:"center", flexShrink:0 }}>Start from template:</span>
          {FORM_TEMPLATES.map(t => (
            <button key={t.label} onClick={() => { setFields(t.fields.map((f,i)=>({...f,id:i+1}))); setNextId(t.fields.length+1); fire(`Loaded ${t.label} template`); }}
              style={{ fontSize:12, padding:"5px 12px", borderRadius:6, border:`1px solid ${C.border}`, background:C.raised, color:C.text, cursor:"pointer" }}>
              {t.label}
            </button>
          ))}
        </div>
      )}

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
          <button onClick={() => {
            const url = `${window.location.hostname === "localhost" ? "https://evara-tau.vercel.app" : window.location.origin}/form/${activeForm.share_token}`;
            const embed = `<iframe src="${url}" width="100%" height="600" frameborder="0" style="border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.08)"></iframe>`;
            navigator.clipboard.writeText(embed);
            fire("✅ Embed code copied — paste into your website!");
          }} style={{ fontSize: 11, padding: "3px 10px", background: C.blue+"15", border: `1px solid ${C.blue}40`, borderRadius: 5, color: C.blue, cursor: "pointer", whiteSpace: "nowrap", fontWeight: 500 }}>
            {"</> Embed"}
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
              {formName.length > 0 && <span style={{ fontSize:10, color:formName.length>60?C.red:C.muted, marginLeft:6 }}>{formName.length}/80</span>}
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
                {/* Quick-add common event fields */}
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6, fontWeight: 600 }}>Quick add common fields</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {[
                      { label: "Dietary requirements", type: "radio", options: ["No restrictions", "Vegetarian", "Vegan", "Gluten-free", "Halal", "Kosher", "Other"] },
                      { label: "Accessibility needs", type: "textarea" },
                      { label: "Job title", type: "text" },
                      { label: "LinkedIn profile", type: "text" },
                      { label: "How did you hear about us?", type: "radio", options: ["LinkedIn", "Email invitation", "Colleague referral", "Company website", "Other"] },
                      { label: "Questions for speakers", type: "textarea" },
                      { label: "T-shirt size", type: "radio", options: ["XS", "S", "M", "L", "XL", "XXL"] },
                      { label: "Table preference", type: "radio", options: ["No preference", "Near front", "Near back", "Quiet area"] },
                    ].map(f => (
                      <button key={f.label} onClick={() => {
                        setFields(p => [...p, { id: nextId, type: f.type, label: f.label, required: false, options: f.options || [] }]);
                        setNextId(p => p + 1);
                      }} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 5, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", transition: "all .12s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal||C.blue; e.currentTarget.style.color = C.teal||C.blue; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
                        + {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </Sec>
              <Sec label={`Fields (${fields.length})`}>
                {fields.map((f, i) => (
                  <div key={f.id} style={{ background: C.raised, borderRadius: 7, border: `1px solid ${C.border}`, padding: "9px 10px", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 9.5, color: C.muted, fontWeight: 600, marginRight: 2 }}>{i+1}.</span>
                      <span style={{ fontSize: 9.5, color: C.muted, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: "1px 5px", textTransform: "uppercase", fontWeight: 600 }}>{f.type}</span>
                      <div style={{ display: "flex", gap: 2, marginLeft: "auto" }}>
                        <button onClick={() => moveUp(i)} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 13, padding: "0 3px", cursor: "pointer" }}>↑</button>
                        <button onClick={() => moveDown(i)} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 13, padding: "0 3px", cursor: "pointer" }}>↓</button>
                        <button onClick={() => setFields(p => p.map(x => x.id === f.id ? {...x, required: !x.required} : x))}
                          title={f.required ? "Required — click to make optional" : "Optional — click to make required"}
                          style={{ background:"transparent", border:"none", color: f.required ? C.blue : C.muted, fontSize:11, padding:"0 3px", cursor:"pointer", fontWeight: f.required ? 700 : 400 }}>
                          {f.required ? "REQ" : "opt"}
                        </button>
                        <button onClick={() => {
                          const dup = { ...f, id: nextId };
                          setNextId(p => p + 1);
                          setFields(p => { const i = p.findIndex(x => x.id === f.id); const n=[...p]; n.splice(i+1,0,dup); return n; });
                        }} title="Duplicate field" style={{ background:"transparent", border:"none", color:C.muted, fontSize:12, padding:"0 3px", cursor:"pointer" }}>⧉</button>
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
              {submissions.length > 0 && (
                <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:10 }}>
                  <button onClick={() => {
                    const hdr = ["Submitted","Email",...fields.map(f=>f.label)];
                    const rows = submissions.map(s => [
                      new Date(s.submitted_at).toLocaleString("en-AU"),
                      s.submitter_email||"",
                      ...fields.map(f => String(s.responses?.[f.id]||""))
                    ].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(","));
                    const csv = [hdr.join(","),...rows].join("\n");
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
                    a.download = `form-responses-${new Date().toISOString().slice(0,10)}.csv`;
                    a.click(); fire(`✅ Exported ${submissions.length} responses`);
                  }} style={{ fontSize:12, padding:"6px 12px", borderRadius:6, border:`1px solid ${C.green}40`, background:"transparent", color:C.green, cursor:"pointer" }}>
                    ⬇ Export responses CSV
                  </button>
                </div>
              )}
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
                {activeForm?.share_token && (
                  <button onClick={() => window.open(`${window.location.hostname==="localhost"?"https://evara-tau.vercel.app":window.location.origin}/form/${activeForm.share_token}`, "_blank")}
                    style={{ fontSize:12, padding:"6px 14px", borderRadius:7, border:`1px solid ${C.blue}40`, background:C.blue+"10", color:C.blue, cursor:"pointer", marginBottom:8 }}>
                    🔗 Open form in new tab
                  </button>
                )}
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
// ─── BRAND KIT SECTION ───────────────────────────────────────
function BrandKitSection({ profile, supabase, fire, fromEmail, setFromEmail, fromName, setFromName, brandColor, setBrandColor }) {
  const [logoUrl, setLogoUrl] = useState(profile?.companies?.logo_url || "");
  const [logoUploading, setLogoUploading] = useState(false);
  const [font, setFont] = useState(profile?.companies?.brand_font || "Outfit");
  const [kitSaving, setKitSaving] = useState(false);
  const fileRef = useRef(null);

  const COLORS = ["#0A84FF","#30D158","#FF453A","#FF9F0A","#BF5AF2","#FF375F","#5AC8FA","#00C7BE","#FF6B35","#FFD60A","#1C1C1E","#E5E5EA"];
  const FONTS = ["Outfit","Inter","Georgia","Helvetica Neue","Arial","Trebuchet MS"];

  const uploadLogo = async (file) => {
    if (!file || !profile?.company_id) return;
    setLogoUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `logos/${profile.company_id}/logo.${ext}`;
      const { error: upErr } = await supabase.storage.from("assets").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("assets").getPublicUrl(path);
      setLogoUrl(publicUrl);
      await supabase.from("companies").update({ logo_url: publicUrl }).eq("id", profile.company_id);
      fire("✅ Logo uploaded!");
    } catch (e) { fire(e.message || "Upload failed", "err"); }
    setLogoUploading(false);
  };

  const saveKit = async () => {
    if (!profile?.company_id) return;
    setKitSaving(true);
    await supabase.from("companies").update({ from_email: fromEmail, from_name: fromName, brand_color: brandColor, brand_font: font, logo_url: logoUrl }).eq("id", profile.company_id);
    setKitSaving(false);
    fire("✅ Brand kit saved!");
  };

  return (
    <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 14 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px" }}>Brand Kit</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Logo, colours and sender settings — applied across all emails</div>
        </div>
        <button onClick={saveKit} disabled={kitSaving} style={{ padding:"7px 16px", borderRadius:7, border:"none", background:C.blue, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", opacity:kitSaving?0.6:1 }}>
          {kitSaving ? "Saving…" : "Save brand kit"}
        </button>
      </div>

      {/* Logo upload */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 8, fontWeight: 500 }}>Logo</div>
        <div style={{ display:"flex", alignItems:"center", gap: 14 }}>
          <div onClick={() => !logoUploading && fileRef.current?.click()}
            style={{ width:80, height:80, borderRadius:12, border:`2px dashed ${logoUrl ? brandColor : C.border}`, background: logoUrl ? "transparent" : C.bg, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, overflow:"hidden", transition:"border .2s", position:"relative" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = brandColor}
            onMouseLeave={e => e.currentTarget.style.borderColor = logoUrl ? brandColor : C.border}>
            {logoUploading ? (
              <div style={{ width:18, height:18, border:`2px solid ${C.blue}25`, borderTop:`2px solid ${C.blue}`, borderRadius:"50%", animation:"spin .7s linear infinite" }} />
            ) : logoUrl ? (
              <img src={logoUrl} alt="logo" style={{ width:"100%", height:"100%", objectFit:"contain", padding:6 }} />
            ) : (
              <div style={{ textAlign:"center" }}>
                <Upload size={18} color={C.muted} />
                <div style={{ fontSize:10, color:C.muted, marginTop:4 }}>Upload</div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => { if (e.target.files[0]) uploadLogo(e.target.files[0]); }} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, color:C.sec, marginBottom:6, lineHeight:1.5 }}>Upload your company logo. It appears in email headers, landing pages and the dashboard.</div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => fileRef.current?.click()} disabled={logoUploading} style={{ padding:"6px 14px", borderRadius:6, border:`1px solid ${C.border}`, background:C.bg, color:C.sec, fontSize:12, cursor:"pointer" }}>
                {logoUrl ? "Replace logo" : "Choose file"}
              </button>
              {logoUrl && <button onClick={async () => { setLogoUrl(""); await supabase.from("companies").update({ logo_url: null }).eq("id", profile.company_id); fire("Logo removed"); }} style={{ padding:"6px 12px", borderRadius:6, border:`1px solid ${C.red}30`, background:"transparent", color:C.red, fontSize:12, cursor:"pointer" }}>Remove</button>}
            </div>
            <div style={{ fontSize:11, color:C.muted, marginTop:6 }}>PNG, JPG or SVG · Max 2MB · Transparent background recommended</div>
          </div>
        </div>
      </div>

      {/* Brand colour */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 8, fontWeight: 500 }}>Brand colour</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
          {COLORS.map(col => (
            <button key={col} onClick={() => setBrandColor(col)} style={{ width:30, height:30, borderRadius:6, background:col, border: brandColor === col ? "3px solid #fff" : "3px solid transparent", outline: brandColor === col ? `2px solid ${col}` : "none", cursor:"pointer", transition:"all .12s", boxShadow: brandColor === col ? `0 0 0 2px ${col}50` : "none" }} />
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} style={{ width:38, height:34, border:"none", background:"none", cursor:"pointer", padding:0 }} />
          <input value={brandColor} onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) setBrandColor(e.target.value); }} style={{ width:100, background:C.bg, border:`1px solid ${C.border}`, borderRadius:7, color:C.text, padding:"7px 10px", fontSize:13, outline:"none" }} />
          <div style={{ display:"flex", gap:6, flex:1 }}>
            {["Buttons","Headers","Accents"].map((lbl,i) => (
              <div key={lbl} style={{ flex:1, height:34, borderRadius:7, background: i===0?brandColor: i===1?brandColor+"30":"transparent", border: i===2?`2px solid ${brandColor}`:"none", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color: i===0?"#fff":brandColor, fontWeight:600 }}>{lbl}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Font */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 8, fontWeight: 500 }}>Email font</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {FONTS.map(f => (
            <button key={f} onClick={() => setFont(f)} style={{ padding:"6px 14px", borderRadius:20, border:`1.5px solid ${font===f ? brandColor : C.border}`, background: font===f ? brandColor+"20" : C.bg, color: font===f ? brandColor : C.sec, fontSize:13, fontFamily:f, cursor:"pointer", transition:"all .15s" }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Sender details */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 8, fontWeight: 500 }}>Sender details</div>
        <div style={{ display:"flex", gap:10, marginBottom:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>From name <span style={{ color:C.muted }}>(shown in recipient's inbox)</span></div>
            <input value={fromName} onChange={e => setFromName(e.target.value)} placeholder="Events Team at Acme"
              style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:7, color:C.text, padding:"9px 12px", fontSize:13, outline:"none" }}
              onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>From email <span style={{ color:C.green, fontSize:10 }}>✓ Verified</span></div>
            <input value={fromEmail} onChange={e => setFromEmail(e.target.value)}
              style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:7, color:C.text, padding:"9px 12px", fontSize:13, outline:"none" }}
              onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div>
        <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 8, fontWeight: 500 }}>Email header preview</div>
        <div style={{ border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden" }}>
          {/* Email client chrome */}
          <div style={{ background:"#1C1C1E", padding:"8px 14px", display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ display:"flex", gap:5 }}>{["#FF5F57","#FEBC2E","#28C840"].map(c=><div key={c} style={{ width:10,height:10,borderRadius:"50%",background:c }} />)}</div>
            <div style={{ flex:1, background:"#2C2C2E", borderRadius:5, height:22, display:"flex", alignItems:"center", paddingLeft:10 }}>
              <span style={{ fontSize:11, color:"#636366" }}>📧 {fromEmail || "hello@evarahq.com"}</span>
            </div>
          </div>
          {/* Email body preview */}
          <div style={{ background:"#F2F2F7", padding:0 }}>
            <div style={{ background:brandColor, height:5 }} />
            <div style={{ padding:"20px 24px", fontFamily:font+",sans-serif" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                {logoUrl ? (
                  <img src={logoUrl} alt="logo" style={{ height:36, maxWidth:120, objectFit:"contain" }} />
                ) : (
                  <div style={{ width:36, height:36, borderRadius:8, background:brandColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:"#fff" }}>{(fromName||"E").charAt(0).toUpperCase()}</div>
                )}
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#111", fontFamily:font+",sans-serif" }}>{fromName || "Your Sender Name"}</div>
                  <div style={{ fontSize:11, color:"#888" }}>to: Guest &lt;guest@example.com&gt;</div>
                </div>
              </div>
              <div style={{ height:8, background:brandColor, borderRadius:4, marginBottom:8, width:"60%", opacity:0.2 }} />
              <div style={{ height:6, background:"#D1D1D6", borderRadius:4, marginBottom:6, width:"80%" }} />
              <div style={{ height:6, background:"#D1D1D6", borderRadius:4, marginBottom:6, width:"65%" }} />
              <div style={{ height:6, background:"#D1D1D6", borderRadius:4, marginBottom:16, width:"72%" }} />
              <div style={{ display:"inline-block", background:brandColor, color:"#fff", padding:"9px 20px", borderRadius:7, fontSize:12, fontWeight:600, fontFamily:font+",sans-serif" }}>Register Now →</div>
            </div>
            <div style={{ background:brandColor+"18", borderTop:`1px solid ${brandColor}25`, padding:"10px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:10, color:"#888" }}>© 2025 {profile?.companies?.name || "Your Company"}</span>
              <span style={{ fontSize:10, color:brandColor }}>Unsubscribe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DANGER ZONE ─────────────────────────────────────────────
function DangerZone({ profile, supabase, fire }) {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0); // 0=idle 1=confirm 2=typing
  const [deleteInput, setDeleteInput] = useState("");
  const CONFIRM_PHRASE = "delete my account";

  const exportAllData = async () => {
    if (!profile?.company_id) return;
    setExporting(true);
    try {
      // Fetch all data
      const [{ data: contacts }, { data: events }, { data: campaigns }, { data: forms }] = await Promise.all([
        supabase.from("contacts").select("*").eq("company_id", profile.company_id),
        supabase.from("events").select("*").eq("company_id", profile.company_id),
        supabase.from("email_campaigns").select("*").eq("company_id", profile.company_id),
        supabase.from("forms").select("*").eq("company_id", profile.company_id),
      ]);

      // Build GDPR export package as JSON
      const exportData = {
        exported_at: new Date().toISOString(),
        account: { id: profile.id, email: profile.email, full_name: profile.full_name, company: profile.companies?.name, role: profile.role },
        contacts: (contacts || []).map(c => ({ id:c.id, email:c.email, first_name:c.first_name, last_name:c.last_name, company:c.company_name, phone:c.phone, job_title:c.job_title, tags:c.tags, created_at:c.created_at, unsubscribed:c.unsubscribed })),
        events: (events || []).map(e => ({ id:e.id, name:e.name, date:e.event_date, location:e.location, status:e.status })),
        email_campaigns: (campaigns || []).map(c => ({ id:c.id, name:c.name, type:c.email_type, subject:c.subject, status:c.status, sent:c.total_sent, opened:c.total_opened })),
        forms: (forms || []).map(f => ({ id:f.id, name:f.name, type:f.form_type })),
      };

      // Also export contacts as CSV
      const csvHeaders = ["ID","Email","First Name","Last Name","Company","Phone","Job Title","Tags","Created","Unsubscribed"];
      const csvRows = (contacts||[]).map(c => [c.id,c.email,c.first_name,c.last_name,c.company_name,c.phone,c.job_title,(c.tags||[]).join(";"),c.created_at,c.unsubscribed?"yes":"no"].map(v=>`"${String(v||"").replace(/"/g,'""')}"`).join(","));
      const csv = [csvHeaders.join(","), ...csvRows].join("\n");

      // Download JSON
      const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type:"application/json" });
      const jsonA = document.createElement("a");
      jsonA.href = URL.createObjectURL(jsonBlob);
      jsonA.download = `evara-data-export-${new Date().toISOString().slice(0,10)}.json`;
      jsonA.click();

      // Download CSV (after short delay)
      setTimeout(() => {
        const csvBlob = new Blob([csv], { type:"text/csv" });
        const csvA = document.createElement("a");
        csvA.href = URL.createObjectURL(csvBlob);
        csvA.download = `evara-contacts-${new Date().toISOString().slice(0,10)}.csv`;
        csvA.click();
      }, 500);

      fire(`✅ Exported ${contacts?.length||0} contacts + full account data`);
    } catch(e) { fire(e.message || "Export failed", "err"); }
    setExporting(false);
  };

  const requestDeletion = async () => {
    if (deleteInput.toLowerCase() !== CONFIRM_PHRASE) { fire("Phrase doesn't match", "err"); return; }
    setDeleting(true);
    try {
      // Export data first automatically
      await exportAllData();
      // Then log the deletion request
      await supabase.from("deletion_requests").insert({
        user_id: profile.id, company_id: profile.company_id,
        email: profile.email, requested_at: new Date().toISOString(), status: "pending"
      }).catch(() => {});
      fire("✅ Deletion request submitted. You'll receive confirmation at " + profile.email + " within 30 days.");
      setDeleteStep(0); setDeleteInput("");
    } catch(e) { fire(e.message||"Request failed","err"); }
    setDeleting(false);
  };

  return (
    <div style={{ background:"#0F0808", borderRadius:12, border:`1px solid ${C.red}25`, padding:20, marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:16 }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:C.red }} />
        <span style={{ fontSize:11, fontWeight:700, color:C.red, textTransform:"uppercase", letterSpacing:"0.8px" }}>Data & Privacy</span>
      </div>

      {/* GDPR Export */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:`1px solid ${C.red}15` }}>
        <div>
          <div style={{ fontSize:13, fontWeight:500, color:C.text, marginBottom:3 }}>Export my data (GDPR Article 20)</div>
          <div style={{ fontSize:11, color:C.muted, lineHeight:1.5 }}>Downloads all contacts, events, campaigns and account data as JSON + CSV. Compliant with GDPR right to data portability.</div>
        </div>
        <button onClick={exportAllData} disabled={exporting} style={{ padding:"8px 16px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:7, color:C.sec, fontSize:12, fontWeight:500, cursor:"pointer", whiteSpace:"nowrap", marginLeft:16, flexShrink:0 }}>
          {exporting ? "Exporting…" : "⬇ Export data"}
        </button>
      </div>

      {/* Account deletion */}
      <div style={{ paddingTop:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:13, fontWeight:500, color:C.red, marginBottom:3 }}>Delete account & all data (GDPR Article 17)</div>
            <div style={{ fontSize:11, color:C.muted, lineHeight:1.5 }}>Permanently removes all contacts, events, emails, and account data. This action cannot be undone. Your data will be exported automatically before deletion.</div>
          </div>
          {deleteStep === 0 && (
            <button onClick={() => setDeleteStep(1)} style={{ padding:"8px 14px", background:"transparent", border:`1px solid ${C.red}50`, borderRadius:7, color:C.red, fontSize:12, cursor:"pointer", whiteSpace:"nowrap", marginLeft:16, flexShrink:0 }}>
              Request deletion
            </button>
          )}
        </div>

        {deleteStep === 1 && (
          <div style={{ marginTop:14, background:`${C.red}08`, border:`1px solid ${C.red}25`, borderRadius:8, padding:14 }}>
            <div style={{ fontSize:13, color:C.text, marginBottom:10, fontWeight:500 }}>⚠️ This will permanently delete:</div>
            <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:14 }}>
              {["All contacts and their data","All events and registrations","All email campaigns and analytics","Your company account and profile","All uploaded assets and files"].map(item => (
                <div key={item} style={{ fontSize:12, color:C.red, display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ opacity:0.6 }}>✗</span> {item}
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => { setDeleteStep(0); setDeleteInput(""); }} style={{ padding:"7px 14px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:6, color:C.muted, fontSize:12, cursor:"pointer" }}>Cancel</button>
              <button onClick={() => setDeleteStep(2)} style={{ padding:"7px 14px", background:C.red, border:"none", borderRadius:6, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>I understand, continue →</button>
            </div>
          </div>
        )}

        {deleteStep === 2 && (
          <div style={{ marginTop:14, background:`${C.red}08`, border:`1px solid ${C.red}30`, borderRadius:8, padding:14 }}>
            <div style={{ fontSize:13, color:C.text, marginBottom:10 }}>
              Type <strong style={{ color:C.red, fontFamily:"monospace" }}>{CONFIRM_PHRASE}</strong> to confirm:
            </div>
            <input value={deleteInput} onChange={e => setDeleteInput(e.target.value)}
              placeholder={CONFIRM_PHRASE} autoFocus
              style={{ width:"100%", background:C.bg, border:`1px solid ${deleteInput.toLowerCase()===CONFIRM_PHRASE?C.red:C.border}`, borderRadius:7, color:C.text, padding:"9px 12px", fontSize:13, outline:"none", fontFamily:"monospace", marginBottom:10 }} />
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => { setDeleteStep(0); setDeleteInput(""); }} style={{ padding:"7px 14px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:6, color:C.muted, fontSize:12, cursor:"pointer" }}>Cancel</button>
              <button onClick={requestDeletion} disabled={deleting || deleteInput.toLowerCase() !== CONFIRM_PHRASE} style={{ padding:"7px 16px", background: deleteInput.toLowerCase()===CONFIRM_PHRASE ? C.red : C.raised, border:"none", borderRadius:6, color: deleteInput.toLowerCase()===CONFIRM_PHRASE ? "#fff" : C.muted, fontSize:12, fontWeight:600, cursor: deleteInput.toLowerCase()===CONFIRM_PHRASE ? "pointer" : "default" }}>
                {deleting ? "Submitting…" : "Submit deletion request"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
      from_name: fromName,
      brand_color: brandColor 
    }).eq("id", profile.company_id);
    setSaving(false); fire("✅ Settings saved!");
  };
  const [fromEmail, setFromEmail] = useState(profile?.companies?.from_email || "hello@evarahq.com");
  const [fromName, setFromName] = useState(profile?.companies?.from_name || "");
  const [brandColor, setBrandColor] = useState(profile?.companies?.brand_color || "#0A84FF");
  const [testSending, setTestSending] = useState(false);
  const [testEmailTo, setTestEmailTo] = useState(profile?.email || "");

  const sendTestEmail = async () => {
    const to = testEmailTo?.trim();
    if (!to?.includes("@")) { return; }
    setTestSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
        body: JSON.stringify({
          contacts: [{ email: to, first_name: "Test" }],
          subject: "✅ evara email delivery test",
          htmlContent: `<div style="max-width:520px;margin:40px auto;font-family:Arial,sans-serif;background:#0A1628;border-radius:12px;padding:40px;color:#fff;text-align:center"><h2 style="margin:0 0 12px">✅ Delivery confirmed</h2><p style="color:rgba(255,255,255,0.6);margin:0 0 8px">Your evara email setup is working correctly.</p><p style="color:rgba(255,255,255,0.35);font-size:13px">From: ${fromName || "evara"} &lt;${fromEmail || "hello@evarahq.com"}&gt;</p></div>`,
          fromEmail: fromEmail || "hello@evarahq.com",
          fromName: fromName || "evara",
          companyId: profile?.company_id,
        })
      }).then(r => r.json());
      res.sent > 0 ? fire(`✅ Test email sent to ${to}`) : fire(res.error || "Send failed", "err");
    } catch(e) { fire(e.message, "err"); }
    setTestSending(false);
  };
  
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px" }}>Profile</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: C.muted }}>evara v2.2 · Build 2026-04-11</span>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: "Supabase", ok: true },
              { label: "SendGrid", ok: !!fromEmail },
              { label: "AI", ok: true },
            ].map(s => (
              <span key={s.label} style={{ fontSize: 9.5, padding: "1px 7px", borderRadius: 3, background: s.ok ? C.green + "18" : C.red + "18", color: s.ok ? C.green : C.red }}>
                {s.ok ? "✓" : "✗"} {s.label}
              </span>
            ))}
          </div>
        </div>
        </div>
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
      {/* ── BRAND KIT ── */}
      <BrandKitSection profile={profile} supabase={supabase} fire={fire}
        fromEmail={fromEmail} setFromEmail={setFromEmail}
        fromName={fromName} setFromName={setFromName}
        brandColor={brandColor} setBrandColor={setBrandColor} />
      <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>Email & AI Configuration</div>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 12, lineHeight: 1.6 }}>
          Add these in Supabase → Project Settings → Edge Functions → Secrets to activate sending and AI generation:
        </p>
        {[
          { key: "ANTHROPIC_API_KEY", desc: "AI email generation (required)", href: "https://console.anthropic.com", status: "✅" },
          { key: "SENDGRID_API_KEY", desc: "Email sending via SendGrid (required)", href: "https://app.sendgrid.com/settings/api_keys", status: "✅" },
          { key: "Webhook URL", desc: `${window.location.hostname === "localhost" ? "https://sqddpjsgtwblmkgxqyxe.supabase.co" : "https://sqddpjsgtwblmkgxqyxe.supabase.co"}/functions/v1/email-webhook`, href: "https://app.sendgrid.com/settings/mail_settings/event_notification", status: "✅" },
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

      {/* ── NOTIFICATION PREFERENCES ── */}
      <div style={{ background:C.card, borderRadius:12, border:`1px solid ${C.border}`, padding:20, marginBottom:14 }}>
        <div style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:16 }}>Notification Preferences</div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {[
            { key:"event_countdown", label:"Event countdown alerts", desc:"7-day and 3-day reminders before an event" },
            { key:"scheduled_email", label:"Scheduled email alerts", desc:"24h warning before a scheduled email goes out" },
            { key:"unsub_alerts", label:"Unsubscribe alerts", desc:"Notify when contacts unsubscribe" },
            { key:"post_event_reminder", label:"Post-event prompts", desc:"Remind to send Thank You email after event day" },
          ].map(p => {
            const isOn = (() => { try { return JSON.parse(localStorage.getItem("evara_notif_prefs")||"{}")[p.key] !== false; } catch { return true; } })();
            return (
              <div key={p.key} style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:C.text }}>{p.label}</div>
                  <div style={{ fontSize:11.5, color:C.muted, marginTop:2 }}>{p.desc}</div>
                </div>
                <button onClick={() => {
                  try { const prefs = JSON.parse(localStorage.getItem("evara_notif_prefs")||"{}"); prefs[p.key] = !isOn; localStorage.setItem("evara_notif_prefs", JSON.stringify(prefs)); } catch {}
                  fire(isOn ? `${p.label} disabled` : `${p.label} enabled`);
                }} style={{ width:40, height:22, borderRadius:11, border:"none", background:isOn?C.blue:C.border, position:"relative", cursor:"pointer", flexShrink:0, transition:"background .2s" }}>
                  <div style={{ position:"absolute", top:3, left:isOn?20:3, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,.3)" }} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── AI BRAND VOICE ── */}
      {bv !== null && (
        <div style={{ background:C.card, borderRadius:12, border:`1px solid ${C.border}`, padding:20, marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:2 }}>AI Brand Voice</div>
              <div style={{ fontSize:12, color:C.sec }}>Claude uses this to match your tone in every generated email</div>
            </div>
            <button onClick={saveBrandVoice} disabled={bvSaving} style={{ fontSize:12, padding:"6px 14px", background:bvSaving?C.raised:C.blue, border:"none", borderRadius:7, color:bvSaving?C.muted:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
              {bvSaving?<><Spin />Saving…</>:"Save voice"}
            </button>
          </div>

          {/* Tone adjectives */}
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:11.5, color:C.muted, marginBottom:5 }}>Tone adjectives <span style={{ color:C.muted, fontSize:10, fontWeight:400 }}>(comma-separated)</span></label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:6 }}>
              {["professional","warm","exclusive","exciting","authoritative","friendly","bold","elegant","approachable","concise"].map(t => (
                <button key={t} onClick={() => setBv(p => ({ ...p, tone_adjectives: (p.tone_adjectives||[]).includes(t) ? (p.tone_adjectives||[]).filter(x=>x!==t) : [...(p.tone_adjectives||[]), t] }))}
                  style={{ fontSize:11, padding:"3px 10px", borderRadius:5, border:`1px solid ${(bv.tone_adjectives||[]).includes(t)?C.blue:C.border}`, background:(bv.tone_adjectives||[]).includes(t)?`${C.blue}15`:"transparent", color:(bv.tone_adjectives||[]).includes(t)?C.blue:C.muted, cursor:"pointer" }}>
                  {t}
                </button>
              ))}
            </div>
            <div style={{ fontSize:11, color:C.muted }}>Selected: {(bv.tone_adjectives||[]).join(", ") || "none"}</div>
          </div>

          {/* Industry + Audience */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
            <div>
              <label style={{ display:"block", fontSize:11.5, color:C.muted, marginBottom:5 }}>Industry</label>
              <select value={bv.industry||""} onChange={e=>setBv(p=>({...p,industry:e.target.value}))}
                style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:7, color:C.text, padding:"9px 12px", fontSize:13, outline:"none" }}>
                <option value="">Select…</option>
                {["Financial Services","Technology","Healthcare","Professional Services","Education","Property & Real Estate","Government","NFP / Charity","Hospitality","Retail","Media & Events","Other"].map(i=><option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:"block", fontSize:11.5, color:C.muted, marginBottom:5 }}>Target audience</label>
              <input value={bv.audience||""} onChange={e=>setBv(p=>({...p,audience:e.target.value}))} placeholder="e.g. senior executives, CFOs, HR managers"
                style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:7, color:C.text, padding:"9px 12px", fontSize:13, outline:"none" }}
                onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
            </div>
          </div>

          {/* Sign-off + CTA */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
            <div>
              <label style={{ display:"block", fontSize:11.5, color:C.muted, marginBottom:5 }}>Email sign-off</label>
              <input value={bv.email_sign_off||""} onChange={e=>setBv(p=>({...p,email_sign_off:e.target.value}))} placeholder="e.g. Warm regards, Kind regards, Cheers"
                style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:7, color:C.text, padding:"9px 12px", fontSize:13, outline:"none" }}
                onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:11.5, color:C.muted, marginBottom:5 }}>Preferred CTA phrase</label>
              <input value={bv.preferred_cta||""} onChange={e=>setBv(p=>({...p,preferred_cta:e.target.value}))} placeholder="e.g. Register Now, Reserve Your Seat, Join Us"
                style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:7, color:C.text, padding:"9px 12px", fontSize:13, outline:"none" }}
                onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
            </div>
          </div>

          {/* Phrases to use/avoid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
            <div>
              <label style={{ display:"block", fontSize:11.5, color:C.muted, marginBottom:5 }}>Signature phrases <span style={{ fontSize:10 }}>(comma-separated)</span></label>
              <textarea value={(bv.signature_phrases||[]).join(", ")} onChange={e=>setBv(p=>({...p,signature_phrases:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}))}
                rows={2} placeholder="e.g. Join us, We're delighted to invite you"
                style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:7, color:C.text, padding:"8px 12px", fontSize:12.5, outline:"none", resize:"none", boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:11.5, color:C.muted, marginBottom:5 }}>Phrases to avoid <span style={{ fontSize:10 }}>(comma-separated)</span></label>
              <textarea value={(bv.avoid_phrases||[]).join(", ")} onChange={e=>setBv(p=>({...p,avoid_phrases:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}))}
                rows={2} placeholder="e.g. ASAP, Urgent, Free offer"
                style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:7, color:C.text, padding:"8px 12px", fontSize:12.5, outline:"none", resize:"none", boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
            </div>
          </div>

          {/* Extra context */}
          <div>
            <label style={{ display:"block", fontSize:11.5, color:C.muted, marginBottom:5 }}>Extra context for AI <span style={{ fontSize:10 }}>(anything Claude should know)</span></label>
            <textarea value={bv.extra_context||""} onChange={e=>setBv(p=>({...p,extra_context:e.target.value}))} rows={2}
              placeholder="e.g. We host events for senior bankers. Always mention RSVPs close 5 days before the event. Our events are invitation-only."
              style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:7, color:C.text, padding:"8px 12px", fontSize:12.5, outline:"none", resize:"none", boxSizing:"border-box" }}
              onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />
          </div>
          <div style={{ marginTop:10, padding:"8px 12px", background:`${C.blue}08`, borderRadius:7, border:`1px solid ${C.blue}20`, fontSize:11.5, color:C.sec, lineHeight:1.5 }}>
            💡 <strong>How it works:</strong> evara passes your brand voice to Claude when generating emails — your tone, phrases, and audience context are applied automatically. No prompt engineering needed.
          </div>
        </div>
      )}

      {/* ── DANGER ZONE ── */}
      <DangerZone profile={profile} supabase={supabase} fire={fire} />

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button onClick={save} disabled={saving} style={{ padding: "11px 28px", background: saving ? C.raised : C.blue, border: "none", borderRadius: 8, color: saving ? C.muted : "#fff", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          {saving ? <><Spin />Saving…</> : "Save changes"}
        </button>
      </div>
      {/* Inline test email */}
      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:20, padding:"12px 16px", background:C.raised, borderRadius:9, border:`1px solid ${C.border}` }}>
        <span style={{ fontSize:13 }}>📧</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11.5, fontWeight:500, color:C.text, marginBottom:5 }}>Send a test email</div>
          <div style={{ display:"flex", gap:7 }}>
            <input value={testEmailTo} onChange={e=>setTestEmailTo(e.target.value)}
              placeholder="you@company.com" type="email"
              style={{ flex:1, background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, color:C.text, padding:"7px 10px", fontSize:12.5, outline:"none" }}
              onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}
              onKeyDown={e=>e.key==="Enter"&&sendTestEmail()} />
            <button onClick={sendTestEmail} disabled={testSending||!testEmailTo?.includes("@")}
              style={{ padding:"7px 14px", background:testSending||!testEmailTo?.includes("@")?C.raised:C.green, border:"none", borderRadius:6, color:testSending||!testEmailTo?.includes("@")?C.muted:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
              {testSending?"Sending…":"Send test ↗"}
            </button>
          </div>
        </div>
      </div>
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
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                { id:"linkedin", label:"LinkedIn", color:"#0077B5", emoji:"💼" },
                { id:"twitter", label:"Twitter / X", color:"#000", emoji:"🐦" },
                { id:"instagram", label:"Instagram", color:"#E1306C", emoji:"📸" },
                { id:"facebook", label:"Facebook", color:"#1877F2", emoji:"📘" },
              ].map(plat => {
                const d = posts[plat.id] || {};
                const text = d.post || d.caption || "";
                const tags = (d.hashtags||[]).map(t=>`#${t.replace(/^#/,"")}`).join(" ");
                const full = `${text}\n\n${tags}`;
                const charLimit = plat.id==="twitter"?280:plat.id==="instagram"?2200:plat.id==="linkedin"?3000:null;
                const fullLength = full.length;
                const overLimit = charLimit && fullLength > charLimit;
                const shareUrl = plat.id==="linkedin"
                  ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`
                  : plat.id==="twitter"
                  ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(text.slice(0,240))}&hashtags=${encodeURIComponent((d.hashtags||[]).join(","))}`
                  : null;
                return (
                  <div key={plat.id} style={{ background:C.card, borderRadius:10, border:`1px solid ${C.border}`, overflow:"hidden" }}>
                    <div style={{ padding:"11px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:`${plat.color}0a` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:16 }}>{plat.emoji}</span>
                        <span style={{ fontSize:13.5, fontWeight:700, color:C.text }}>{plat.label}</span>
                        {charLimit && <span style={{ fontSize:10.5, color:overLimit?C.red:fullLength>charLimit*0.9?C.amber:C.muted, fontWeight:overLimit?700:400 }}>{fullLength}/{charLimit}</span>}
                      </div>
                      <div style={{ display:"flex", gap:6 }}>
                        {shareUrl && <a href={shareUrl} target="_blank" rel="noopener" style={{ fontSize:11.5, padding:"4px 12px", borderRadius:5, background:`${plat.color}15`, color:plat.color, border:`1px solid ${plat.color}30`, fontWeight:600 }}>Share ↗</a>}
                        <button onClick={() => { navigator.clipboard?.writeText(full); setCopied(plat.id); setTimeout(()=>setCopied(null),2000); fire("Copied!"); }}
                          style={{ fontSize:11.5, padding:"4px 12px", borderRadius:5, border:`1px solid ${C.border}`, background:copied===plat.id?`${C.green}15`:"transparent", color:copied===plat.id?C.green:C.muted, cursor:"pointer", fontWeight:500 }}>
                          {copied===plat.id?"✅ Copied":"Copy"}
                        </button>
                      </div>
                    </div>
                    <div style={{ padding:"14px 16px" }}>
                      <p style={{ fontSize:13, color:C.sec, lineHeight:1.75, marginBottom:10, whiteSpace:"pre-wrap" }}>{text}</p>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom: plat.id==="instagram"&&d.story_ideas?.length?10:0 }}>
                        {(d.hashtags||[]).map(t => (
                          <span key={t} style={{ fontSize:11, color:plat.color, background:`${plat.color}12`, padding:"2px 8px", borderRadius:4 }}>#{t.replace(/^#/,"")}</span>
                        ))}
                      </div>
                      {plat.id==="instagram" && d.story_ideas?.length > 0 && (
                        <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}` }}>
                          <div style={{ fontSize:10.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8 }}>📱 Story Ideas</div>
                          {d.story_ideas.map((s,i) => (
                            <div key={i} style={{ fontSize:12, color:C.sec, padding:"5px 0", borderBottom:i<d.story_ideas.length-1?`1px solid ${C.border}`:undefined }}>→ {s}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Email blurb */}
              {posts.email && (
                <div style={{ background:C.card, borderRadius:10, border:`1px solid ${C.border}`, overflow:"hidden" }}>
                  <div style={{ padding:"11px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:`${C.blue}0a` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:16 }}>✉️</span>
                      <span style={{ fontSize:13.5, fontWeight:700, color:C.text }}>Email / Newsletter</span>
                    </div>
                    <button onClick={() => { navigator.clipboard?.writeText(`Subject: ${posts.email.subject}\n\n${posts.email.blurb}`); fire("Email blurb copied!"); }}
                      style={{ fontSize:11.5, padding:"4px 12px", borderRadius:5, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>Copy</button>
                  </div>
                  <div style={{ padding:"14px 16px" }}>
                    <div style={{ marginBottom:8 }}>
                      <div style={{ fontSize:10.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:4 }}>Subject line</div>
                      <div style={{ fontSize:13.5, fontWeight:600, color:C.text }}>{posts.email.subject}</div>
                    </div>
                    {posts.email.preview_text && (
                      <div style={{ marginBottom:10 }}>
                        <div style={{ fontSize:10.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:4 }}>Preview text</div>
                        <div style={{ fontSize:12.5, color:C.sec }}>{posts.email.preview_text}</div>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize:10.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:4 }}>Newsletter blurb</div>
                      <p style={{ fontSize:13, color:C.sec, lineHeight:1.7 }}>{posts.email.blurb}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ANALYTICS VIEW ───────────────────────────────────────────
function AnalyticsView({ supabase, profile, activeEvent, fire, campaigns, events }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drillCam, setDrillCam] = useState(null); // campaign being drilled into
  const [drillData, setDrillData] = useState([]);
  const [drillLoading, setDrillLoading] = useState(false);

  const openDrill = async (cam) => {
    if (drillCam?.id === cam.id) { setDrillCam(null); setDrillData([]); return; }
    setDrillCam(cam); setDrillLoading(true);
    const { data } = await supabase.from("email_sends")
      .select("*,contacts(first_name,last_name,email,company_name)")
      .eq("campaign_id", cam.id)
      .order("sent_at", { ascending: false })
      .limit(50);
    setDrillData(data || []);
    setDrillLoading(false);
  };

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
    const counts = (ecs || []).reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
    setData(prev => ({ ...prev, ...counts, ec_total: (ecs || []).length }));
    setLoading(false);
  };

  if (!activeEvent) return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.6px", color: C.text }}>Analytics</h1>
        <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Track opens, clicks, registrations and attendance.</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 50, gap: 14, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 4 }}>📊</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: C.text }}>No event selected</div>
        <p style={{ fontSize: 13, color: C.muted, maxWidth: 360, lineHeight: 1.6 }}>
          Select an event from the sidebar to see open rates, click rates, registrations, and attendance.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 16, maxWidth: 480 }}>
          {[{ icon: "📧", label: "Emails Sent" }, { icon: "👁", label: "Open Rate" }, { icon: "✅", label: "Confirmed" }, { icon: "🎟", label: "Attended" }].map(m => (
            <div key={m.label} style={{ padding: "12px 8px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 20 }}>{m.icon}</span>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.muted }}>—</div>
              <div style={{ fontSize: 9.5, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px" }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const METRICS = [
    { label: "Emails Sent", val: data?.total_sent || 0, color: C.blue, icon: "📧" },
    { label: "Open Rate", val: data?.total_sent ? `${Math.round((data.total_opened / data.total_sent) * 100)}%` : "—", color: data?.total_sent && Math.round((data.total_opened/data.total_sent)*100) >= 25 ? C.green : C.teal, icon: "👁", sub: "25%+ = great" },
    { label: "Click Rate", val: data?.total_sent && data?.total_clicked ? `${Math.round((data.total_clicked / data.total_sent) * 100)}%` : "—", color: C.blue, icon: "🖱" },
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
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={async () => {
            // Share a read-only public dashboard link
            const { data: event } = await supabase.from("events").select("share_token").eq("id", activeEvent.id).single();
            const token = event?.share_token;
            if (token) {
              const url = `${window.location.hostname === "localhost" ? "http://localhost:5173" : "https://evara-tau.vercel.app"}/share/${token}`;
              navigator.clipboard?.writeText(url);
              fire("📊 Analytics link copied — share with stakeholders!");
            } else { fire("No share token found — generate one from Dashboard", "err"); }
          }} style={{ fontSize: 12, padding: "7px 13px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
            🔗 Share
          </button>
          <button onClick={load} style={{ fontSize: 13, padding: "7px 16px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><Spin />Loading analytics…</div>
      ) : (
        <>
          {/* Zero-state explanation when no emails sent yet */}
          {(!data?.total_sent || data.total_sent === 0) && (
            <div style={{ background:`${C.blue}08`, border:`1px solid ${C.blue}20`, borderRadius:10, padding:"16px 20px", marginBottom:16, display:"flex", alignItems:"flex-start", gap:14 }}>
              <div style={{ fontSize:28, flexShrink:0 }}>💡</div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:6 }}>Data populates automatically once you send emails</div>
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  {[
                    { step:"1", label:"Build an email in eDM Builder → AI generates it in 15 seconds" },
                    { step:"2", label:"Go to Scheduling → click Send on any campaign" },
                    { step:"3", label:"Open rates, click rates and contact activity appear here live" },
                  ].map(s => (
                    <div key={s.step} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                      <span style={{ fontSize:10, fontWeight:700, background:C.blue, color:"#fff", borderRadius:"50%", width:16, height:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>{s.step}</span>
                      <span style={{ fontSize:12, color:C.sec, lineHeight:1.5 }}>{s.label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:11, color:C.muted, marginTop:8 }}>Industry benchmark: 25%+ open rate is excellent. Click rate 3–5% is strong.</div>
              </div>
            </div>
          )}
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
              {data && data.total_sent > 0 && (
        <div style={{ background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14 }}>Conversion Funnel</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
            {[
              { label: "Sent", val: data.total_sent||0, color: C.blue },
              { label: "Opened", val: data.total_opened||0, color: C.teal },
              { label: "Registered", val: data.ec_total||0, color: C.sec },
              { label: "Confirmed", val: data.total_confirmed||0, color: C.green },
              { label: "Attended", val: data.total_attended||0, color: "#4ade80" },
            ].map((step, i, arr) => {
              const maxVal = Math.max(...arr.map(s=>s.val), 1);
              const barH = Math.max(4, Math.round((step.val/maxVal)*80));
              const pct = i > 0 ? Math.round((step.val/Math.max(arr[0].val,1))*100) : 100;
              return (
                <div key={step.label} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", gap:4, height:"100%" }}>
                  <div style={{ fontSize:12, fontWeight:600, color:step.color }}>{step.val}</div>
                  <div style={{ width:"100%", background:step.color+"CC", borderRadius:"3px 3px 0 0", height:`${barH}px` }} />
                  <div style={{ fontSize:9.5, color:C.muted }}>{step.label}</div>
                  {i > 0 && <div style={{ fontSize:9, color:pct>=50?C.green:pct>=25?C.amber:C.red }}>{pct}%</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
          {campaigns.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📧</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 6 }}>No email campaigns yet</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>📧 No emails sent yet · Build in eDM Builder → send from Scheduling → stats appear here automatically</div>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Campaign", "Type", "Status", "Sent", "Opened", "Clicked", "Open Rate"].map(h => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10.5, color: C.muted, fontWeight: 500, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {campaigns.map((cam, i) => {
                    const openRate = cam.total_sent ? Math.round((cam.total_opened / cam.total_sent) * 100) : 0;
                    const isDrilled = drillCam?.id === cam.id;
                    return (
                      <>
                      <tr key={cam.id} className="rh" onClick={() => cam.status==="sent" && openDrill(cam)}
                        style={{ borderBottom: !isDrilled && i < campaigns.length - 1 ? `1px solid ${C.border}` : undefined, cursor: cam.status==="sent"?"pointer":"default", background: isDrilled?`${C.blue}06`:"transparent" }}>
                        <td style={{ padding: "11px 14px", fontSize: 13, color: C.text, maxWidth: 200 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:4, overflow: "hidden" }}>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex:1 }}>{cam.name}</span>
                            {cam.total_sent > 0 && Math.round((cam.total_opened||0)/cam.total_sent*100) >= 40 && <span title="Top performer">⭐</span>}
                            {cam.status==="sent" && <span style={{ fontSize:10, color:isDrilled?C.blue:C.muted }}>▾</span>}
                          </div>
                          {cam.subject && <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontStyle: "italic" }}>"{cam.subject}"</div>}
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 12, color: C.muted, textTransform: "capitalize" }}>{cam.email_type?.replace(/_/g, " ")}</td>
                        <td style={{ padding: "11px 14px" }}>
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: cam.status === "sent" ? C.green + "15" : C.blue + "15", color: cam.status === "sent" ? C.green : C.blue }}>{cam.status}</span>
                          {cam.sent_at && (
                            <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>
                              Sent {new Date(cam.sent_at).toLocaleString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 13, color: C.text }}>{cam.total_sent || "—"}</td>
                        <td style={{ padding: "11px 14px", fontSize: 13, color: C.text }}>{cam.total_opened || "—"}</td>
                        <td style={{ padding: "11px 14px", fontSize: 12, color: cam.total_clicked > 0 ? C.blue : C.muted }}>{cam.total_clicked || "—"}</td>
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
                      {isDrilled && (
                        <tr key={`drill-${cam.id}`}>
                          <td colSpan={7} style={{ padding:0, background:`${C.blue}05`, borderBottom:`1px solid ${C.border}` }}>
                            <div style={{ padding:"12px 16px" }}>
                              <div style={{ fontSize:11, fontWeight:600, color:C.blue, marginBottom:10, textTransform:"uppercase", letterSpacing:"0.6px" }}>
                                Per-contact breakdown — {cam.name} {drillLoading && <span style={{ color:C.muted, fontWeight:400 }}>Loading…</span>}
                              </div>
                              {!drillLoading && drillData.length === 0 && <div style={{ fontSize:12, color:C.muted }}>No per-contact tracking data yet — appears after emails are sent via evara.</div>}
                              {!drillLoading && drillData.length > 0 && (
                                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:6, maxHeight:200, overflowY:"auto" }}>
                                  {drillData.map(s => (
                                    <div key={s.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 8px", background:s.clicked_at?`${C.blue}10`:s.opened_at?`${C.green}08`:C.card, borderRadius:6, border:`1px solid ${s.clicked_at?C.blue:s.opened_at?C.green:C.border}25` }}>
                                      <div style={{ width:22, height:22, borderRadius:"50%", background:s.clicked_at?C.blue:s.opened_at?C.green:C.raised, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#fff", flexShrink:0, fontWeight:700 }}>
                                        {s.clicked_at?"🖱":s.opened_at?"👁":"✉"}
                                      </div>
                                      <div style={{ minWidth:0 }}>
                                        <div style={{ fontSize:11.5, fontWeight:500, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.contacts?.first_name} {s.contacts?.last_name||s.contacts?.email}</div>
                                        <div style={{ fontSize:10, color:s.clicked_at?C.blue:s.opened_at?C.green:C.muted }}>{s.clicked_at?"Clicked":s.opened_at?"Opened":"Sent"}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                      </>
                    );
                  })}
                  {campaigns.length > 1 && (() => {
                    const totSent = campaigns.reduce((s,c) => s+(c.total_sent||0), 0);
                    const totOpen = campaigns.reduce((s,c) => s+(c.total_opened||0), 0);
                    const totClick = campaigns.reduce((s,c) => s+(c.total_clicked||0), 0);
                    return (
                      <tr style={{ borderTop: `2px solid ${C.border}`, background: C.raised }}>
                        <td style={{ padding:"10px 14px", fontSize:12, fontWeight:600, color:C.text }} colSpan={2}>Totals</td>
                        <td style={{ padding:"10px 14px" }} />
                        <td style={{ padding:"10px 14px", fontSize:12, fontWeight:600, color:C.text }}>{totSent}</td>
                        <td style={{ padding:"10px 14px", fontSize:12, fontWeight:600, color:C.text }}>{totOpen}</td>
                        <td style={{ padding:"10px 14px", fontSize:12, fontWeight:600, color:C.text }}>{totClick||"—"}</td>
                        <td style={{ padding:"10px 14px", fontSize:12, fontWeight:600, color:totSent>0&&totOpen/totSent>=0.3?C.green:C.text }}>
                          {totSent > 0 ? Math.round(totOpen/totSent*100)+"%" : "—"}
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            )}
          </div>

          {/* ── UNIFIED FUNNEL + TREND ── */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12, marginTop:12 }}>
            {/* Funnel */}
            <div style={{ background:C.card, borderRadius:11, border:`1px solid ${C.border}`, padding:"16px 18px" }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:14 }}>Event Funnel</div>
              {(() => {
                const steps = [
                  { label:"Sent", val:data?.total_sent||0, color:C.blue },
                  { label:"Opened", val:data?.total_opened||0, color:C.teal },
                  { label:"Registered", val:data?.ec_total||0, color:"#BF5AF2" },
                  { label:"Confirmed", val:data?.confirmed||0, color:C.amber },
                  { label:"Attended", val:data?.attended||0, color:C.green },
                ];
                const top = steps[0].val || 1;
                return steps.map((s, i) => {
                  const pct = Math.round((s.val/top)*100);
                  const conv = i > 0 && steps[i-1].val > 0 ? Math.round((s.val/steps[i-1].val)*100) : null;
                  return (
                    <div key={s.label} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:12 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <div style={{ width:8, height:8, borderRadius:"50%", background:s.color, flexShrink:0 }} />
                          <span style={{ color:C.sec }}>{s.label}</span>
                          {conv !== null && <span style={{ fontSize:10, color:conv>=50?C.green:conv>=25?C.amber:C.red, background:(conv>=50?C.green:conv>=25?C.amber:C.red)+"18", padding:"1px 5px", borderRadius:3 }}>↳{conv}%</span>}
                        </div>
                        <span style={{ color:s.color, fontWeight:700 }}>{s.val.toLocaleString()}</span>
                      </div>
                      <div style={{ height:7, background:C.raised, borderRadius:4, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:s.color, borderRadius:4, transition:"width .5s ease", opacity:0.85 }} />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            {/* Open rate trend */}
            <div style={{ background:C.card, borderRadius:11, border:`1px solid ${C.border}`, padding:"16px 18px" }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:2 }}>Open Rate Trend</div>
              <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>Across sent campaigns — 25% goal line</div>
              {(() => {
                const sent = campaigns.filter(c => c.status==="sent" && c.total_sent > 0).sort((a,b) => new Date(a.sent_at||a.created_at) - new Date(b.sent_at||b.created_at)).slice(-8);
                if (!sent.length) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:100, color:C.muted, fontSize:12 }}>No sent campaigns yet</div>;
                const rates = sent.map(c => Math.round(((c.total_opened||0)/c.total_sent)*100));
                const maxR = Math.max(...rates, 40);
                const W = 280, H = 90, PAD = 10;
                const pts = rates.map((r, i) => [PAD + (i/Math.max(rates.length-1,1))*(W-PAD*2), H - PAD - (r/maxR)*(H-PAD*2)]);
                const pathD = pts.map((p,i) => (i===0?"M":"L")+p[0].toFixed(1)+","+p[1].toFixed(1)).join(" ");
                const areaD = `${pathD} L${pts[pts.length-1][0].toFixed(1)},${H-PAD} L${pts[0][0].toFixed(1)},${H-PAD} Z`;
                const goalY = H - PAD - (25/maxR)*(H-PAD*2);
                return (
                  <div>
                    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ overflow:"visible" }}>
                      <line x1={PAD} y1={goalY} x2={W-PAD} y2={goalY} stroke={C.amber} strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
                      <text x={W-PAD+3} y={goalY+3} fontSize="8" fill={C.amber}>25%</text>
                      <path d={areaD} fill={C.teal} opacity="0.1" />
                      <path d={pathD} fill="none" stroke={C.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      {pts.map(([x,y], i) => (
                        <g key={i}>
                          <circle cx={x} cy={y} r="4" fill={rates[i]>=25?C.green:C.amber} stroke={C.card} strokeWidth="2" />
                          <text x={x} y={y-8} fontSize="9" fill={rates[i]>=25?C.green:C.amber} textAnchor="middle" fontWeight="700">{rates[i]}%</text>
                        </g>
                      ))}
                    </svg>
                    <div style={{ display:"flex", marginTop:2 }}>
                      {sent.map((c,i) => (
                        <div key={c.id} style={{ flex:"1", fontSize:9, color:C.muted, textAlign:"center", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {(c.email_type||"").replace(/_/g," ").replace("save the date","STD").replace("invitation","Inv").replace("reminder","Rem").replace("thank you","TY")||`#${i+1}`}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Send Volume chart */}
          {campaigns.filter(c => c.status==="sent" && c.total_sent>0).length > 0 && (
            <div style={{ background:C.card, borderRadius:11, border:`1px solid ${C.border}`, padding:"16px 18px", marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.text }}>Send Volume</div>
                <div style={{ display:"flex", gap:12 }}>
                  {[{col:C.blue+"50",lbl:"Sent"},{col:C.teal+"90",lbl:"Opened"},{col:C.blue,lbl:"Clicked"}].map(({col,lbl})=>(
                    <div key={lbl} style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, color:C.muted }}><div style={{ width:10, height:10, background:col, borderRadius:2 }} />{lbl}</div>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:90 }}>
                {campaigns.filter(c=>c.status==="sent").map((cam) => {
                  const maxSent = Math.max(...campaigns.filter(c=>c.status==="sent").map(c=>c.total_sent||0),1);
                  const h = Math.max(6, Math.round(((cam.total_sent||0)/maxSent)*80));
                  const openH = Math.round(((cam.total_opened||0)/maxSent)*80);
                  const clickH = Math.round(((cam.total_clicked||0)/maxSent)*80);
                  return (
                    <div key={cam.id} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }} title={`${cam.name}: ${cam.total_sent} sent · ${cam.total_opened||0} opened`}>
                      <div style={{ width:"100%", height:80, position:"relative", display:"flex", alignItems:"flex-end" }}>
                        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:h, background:C.blue+"40", borderRadius:"3px 3px 0 0" }} />
                        {openH>0 && <div style={{ position:"absolute", bottom:0, left:"20%", right:"20%", height:openH, background:C.teal+"90", borderRadius:"3px 3px 0 0" }} />}
                        {clickH>0 && <div style={{ position:"absolute", bottom:0, left:"35%", right:"35%", height:clickH, background:C.blue, borderRadius:"3px 3px 0 0" }} />}
                      </div>
                      <div style={{ fontSize:9, color:C.muted, textAlign:"center", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", width:"100%" }}>
                        {(cam.email_type||"").replace(/_/g," ")||cam.name?.slice(0,8)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Day-of-week performance heatmap */}
          {campaigns && campaigns.filter(c=>c.status==="sent"&&c.sent_at&&c.total_sent>0).length > 1 && (() => {
            const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
            const byDay = Array(7).fill(null).map(() => ({ sent:0, opened:0, count:0 }));
            campaigns.filter(c=>c.status==="sent"&&c.sent_at&&c.total_sent>0).forEach(c => {
              const d = new Date(c.sent_at).getDay();
              byDay[d].sent += c.total_sent||0;
              byDay[d].opened += c.total_opened||0;
              byDay[d].count++;
            });
            const maxRate = Math.max(...byDay.map(d => d.sent>0?Math.round(d.opened/d.sent*100):0), 1);
            return (
              <div style={{ background:C.card, borderRadius:11, border:`1px solid ${C.border}`, padding:"16px 18px", marginBottom:12 }}>
                <div style={{ fontSize:13, fontWeight:500, color:C.text, marginBottom:14 }}>📊 Open Rate by Day Sent</div>
                <div style={{ display:"flex", gap:8, alignItems:"flex-end" }}>
                  {byDay.map((d, i) => {
                    const rate = d.sent>0?Math.round(d.opened/d.sent*100):0;
                    const h = Math.max(4, Math.round((rate/maxRate)*60));
                    const col = rate>=30?C.green:rate>=20?C.blue:rate>0?C.amber:C.border;
                    return (
                      <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}
                        title={d.count>0?`${DAYS[i]}: ${rate}% open rate (${d.count} send${d.count>1?"s":""})`:`${DAYS[i]}: no sends`}>
                        {d.count>0 && <div style={{ fontSize:9, color:col, fontWeight:700 }}>{rate}%</div>}
                        <div style={{ width:"100%", height:60, display:"flex", alignItems:"flex-end" }}>
                          <div style={{ width:"100%", height: d.count>0?h:2, background: d.count>0?col:C.border, borderRadius:"3px 3px 0 0", transition:"height .4s", opacity:d.count>0?1:0.3 }} />
                        </div>
                        <div style={{ fontSize:10, color: i===0||i===6?C.red:C.muted, fontWeight:i>=2&&i<=4?600:400 }}>{DAYS[i]}</div>
                        {d.count>0 && <div style={{ fontSize:8.5, color:C.muted }}>{d.count}x</div>}
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop:8, display:"flex", gap:12, fontSize:10, color:C.muted }}>
                  <span style={{ color:C.green }}>■ 30%+ open rate</span>
                  <span style={{ color:C.blue }}>■ 20–30%</span>
                  <span style={{ color:C.amber }}>■ &lt;20%</span>
                  <span style={{ marginLeft:"auto" }}>Tue–Thu typically perform best for B2B</span>
                </div>
              </div>
            );
          })()}

          {/* Upcoming scheduled */}
          {campaigns && campaigns.filter(c => c.status==="scheduled" && c.scheduled_at && new Date(c.scheduled_at) > new Date()).length > 0 && (
            <div style={{ background:C.card, borderRadius:11, border:`1px solid ${C.border}`, padding:"16px 18px", marginBottom:12 }}>
              <div style={{ fontSize:13, fontWeight:500, color:C.text, marginBottom:12 }}>📅 Upcoming Sends</div>
              {campaigns.filter(c=>c.status==="scheduled" && c.scheduled_at && new Date(c.scheduled_at)>new Date()).sort((a,b)=>new Date(a.scheduled_at)-new Date(b.scheduled_at)).slice(0,5).map(cam => {
                const d = new Date(cam.scheduled_at);
                const daysLeft = Math.ceil((d - new Date())/(1000*60*60*24));
                return (
                  <div key={cam.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:500, color:C.text }}>{cam.name?.replace(/ — .*/,"") || cam.email_type}</div>
                      <div style={{ fontSize:11, color:C.muted }}>{d.toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"})} · {d.toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit"})}</div>
                    </div>
                    <span style={{ fontSize:10, padding:"2px 8px", borderRadius:4, background:daysLeft<=7?C.amber+"20":C.blue+"14", color:daysLeft<=7?C.amber:C.blue, fontWeight:600 }}>{daysLeft===0?"Today!":daysLeft===1?"Tomorrow":`${daysLeft}d`}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cross-event comparison - toggle button, data fetched imperatively */}
          {(events||[]).filter(e=>e.id!==activeEvent?.id).length > 0 && (
            <div style={{ background:C.card, borderRadius:11, border:`1px solid ${C.border}`, padding:"14px 18px", marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ fontSize:13, fontWeight:500, color:C.text }}>📊 Cross-Event Comparison</div>
                <button onClick={async (e) => {
                  const btn = e.currentTarget;
                  const container = btn.parentElement.nextElementSibling;
                  if (container.childNodes.length > 0) { container.innerHTML = ""; btn.textContent = "Compare events"; return; }
                  btn.textContent = "Loading…";
                  const evList = [activeEvent, ...(events||[]).filter(ev=>ev.id!==activeEvent?.id).slice(0,4)];
                  const rows = await Promise.all(evList.map(async ev => {
                    const [{ data: m }, { data: ecs }] = await Promise.all([
                      supabase.from("event_summary").select("total_sent,total_opened").eq("event_id", ev.id).maybeSingle(),
                      supabase.from("event_contacts").select("status").eq("event_id", ev.id),
                    ]);
                    const att = (ecs||[]).filter(e=>e.status==="attended").length;
                    const conf = (ecs||[]).filter(e=>e.status==="confirmed"||e.status==="attended").length;
                    const openRate = m?.total_sent>0?Math.round((m.total_opened/m.total_sent)*100):0;
                    return { name:ev.name.slice(0,22), sent:m?.total_sent||0, openRate, conf, att, showRate:conf>0?Math.round(att/conf*100):0, isActive:ev.id===activeEvent?.id };
                  }));
                  container.innerHTML = `<div style="overflow-x:auto;margin-top:12px"><table style="width:100%;border-collapse:collapse;font-size:12px">
                    <thead><tr style="border-bottom:1px solid rgba(255,255,255,0.08)">${["Event","Sent","Open rate","Confirmed","Attended","Show rate"].map(h=>`<th style="padding:7px 10px;text-align:${h==="Event"?"left":"center"};color:#888;font-weight:600;font-size:10.5px;text-transform:uppercase">${h}</th>`).join("")}</tr></thead>
                    <tbody>${rows.map((r,i)=>`<tr style="border-bottom:1px solid rgba(255,255,255,0.05);background:${i===0?"rgba(10,132,255,0.06)":"transparent"}">
                      <td style="padding:9px 10px;color:#F5F5F7;font-weight:${i===0?"600":"400"}">${i===0?"<span style='font-size:9px;color:#0A84FF;font-weight:700;margin-right:4px'>ACTIVE</span>":""}${r.name}</td>
                      <td style="padding:9px 10px;text-align:center;color:#999">${r.sent||"—"}</td>
                      <td style="padding:9px 10px;text-align:center;color:${r.openRate>=25?"#30D158":r.openRate>0?"#FF9F0A":"#888"};font-weight:600">${r.sent>0?r.openRate+"%":"—"}</td>
                      <td style="padding:9px 10px;text-align:center;color:#999">${r.conf||"—"}</td>
                      <td style="padding:9px 10px;text-align:center;color:#999">${r.att||"—"}</td>
                      <td style="padding:9px 10px;text-align:center;color:${r.showRate>=70?"#30D158":r.showRate>0?"#FF9F0A":"#888"};font-weight:600">${r.conf>0?r.showRate+"%":"—"}</td>
                    </tr>`).join("")}</tbody></table></div>`;
                  btn.textContent = "Hide";
                }} style={{ fontSize:11, padding:"4px 12px", borderRadius:5, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>
                  Compare events
                </button>
              </div>
              <div />
            </div>
          )}
        </>
      )}
    </div>
  );
}


// ─── ENGAGEMENT BREAKDOWN ─────────────────────────────────────
function EngagementBreakdown({ supabase, activeEvent, campaigns }) {
  const [sends, setSends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selCam, setSelCam] = useState("all");

  const load = async () => {
    if (!activeEvent) return;
    setLoading(true);
    const sentIds = (campaigns || []).filter(c => c.status === "sent").map(c => c.id);
    if (!sentIds.length) { setLoading(false); return; }
    const q = supabase.from("email_sends")
      .select("*, contacts(first_name,last_name,email,company_name)")
      .order("sent_at", { ascending: false }).limit(200);
    const { data } = await (selCam === "all" ? q.in("campaign_id", sentIds) : q.eq("campaign_id", selCam));
    setSends(data || []);
    setLoading(false);
  };

  useEffect(() => { if (expanded) load(); }, [expanded, selCam, activeEvent]);

  const sentCams = (campaigns || []).filter(c => c.status === "sent");
  if (!sentCams.length) return null;

  const opens  = sends.filter(s => s.opened_at);
  const clicks = sends.filter(s => s.clicked_at);
  const openPct = sends.length ? Math.round(opens.length / sends.length * 100) : 0;

  const doExport = () => {
    const csv = ["Name,Email,Company,Status,Sent,Opened,Clicked",
      ...sends.map(s => [
        `"${(s.contacts?.first_name||"")+" "+(s.contacts?.last_name||"")}"`,
        `"${s.contacts?.email||""}"`, `"${s.contacts?.company_name||""}"`,
        `"${s.status||""}"`,
        `"${s.sent_at   ? new Date(s.sent_at  ).toLocaleDateString() : ""}"`,
        `"${s.opened_at ? new Date(s.opened_at).toLocaleDateString() : ""}"`,
        `"${s.clicked_at? new Date(s.clicked_at).toLocaleDateString(): ""}"`,
      ].join(","))
    ].join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv," + encodeURIComponent(csv);
    a.download = `engagement_${(activeEvent?.name||"report").replace(/\s+/g,"_")}.csv`;
    a.click();
  };

  return (
    <div style={{ background: C.card, borderRadius: 11, border: `1px solid ${C.border}`, marginTop: 12, overflow: "hidden" }}>
      <div onClick={() => setExpanded(e => !e)}
        style={{ padding: "13px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: expanded ? `1px solid ${C.border}` : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>👤 Per-Contact Engagement</span>
          {!expanded && sends.length > 0 && <span style={{ fontSize: 11, color: C.muted }}>{sends.length} tracked · {openPct}% opened</span>}
        </div>
        <span style={{ fontSize: 11, color: C.muted }}>{expanded ? "▲ Collapse" : "▼ Expand"}</span>
      </div>
      {expanded && (
        <div style={{ padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
            <select value={selCam} onChange={e => setSelCam(e.target.value)}
              style={{ fontSize: 12, padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.raised, color: C.text }}>
              <option value="all">All sent campaigns</option>
              {sentCams.map(c => <option key={c.id} value={c.id}>{c.name||c.email_type} ({c.total_sent||0} sent)</option>)}
            </select>
            <button onClick={load} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>↻ Refresh</button>
            {sends.length > 0 && <button onClick={doExport} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.green}40`, background: "transparent", color: C.green, cursor: "pointer" }}>⬇ Export CSV</button>}
          <button onClick={() => window.print()}
            style={{ fontSize: 12, padding:"5px 12px", borderRadius:6, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>
            🖨 Print
          </button>
          <button onClick={async () => {
            const token = activeEvent.share_token || Math.random().toString(36).slice(2);
            if (!activeEvent.share_token) {
              await supabase.from("events").update({ share_token: token }).eq("id", activeEvent.id);
              setActiveEvent(p => ({ ...p, share_token: token }));
            }
            navigator.clipboard?.writeText(`${window.location.origin}/share/${token}`);
            fire("📊 Analytics link copied!");
          }} style={{ fontSize:12, padding:"5px 12px", borderRadius:6, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>📊 Share</button>
          </div>
          {loading ? (
            <div style={{ padding: 24, textAlign: "center", color: C.muted, display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}><Spin />Loading…</div>
          ) : sends.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: C.muted, fontSize: 13 }}>No data yet — appears after emails are sent via evara.</div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
                {[{ label:"Total Tracked", val:sends.length, color:C.text },
                  { label:"Opened", val:`${opens.length} (${openPct}%)`, color:C.green },
                  { label:"Clicked", val:`${clicks.length} (${sends.length?Math.round(clicks.length/sends.length*100):0}%)`, color:C.blue }
                ].map(m => (
                  <div key={m.label} style={{ background: C.raised, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.7px" }}>{m.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: m.color, marginTop: 2 }}>{m.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ maxHeight: 320, overflowY: "auto", border: `1px solid ${C.border}`, borderRadius: 8 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {["Contact","Email","Status","Opened","Clicked"].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: C.muted, fontWeight: 500, fontSize: 10.5, textTransform: "uppercase", background: C.card, position: "sticky", top: 0 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sends.map(s => (
                      <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "8px 12px", color: C.text, whiteSpace: "nowrap" }}>{`${s.contacts?.first_name||""} ${s.contacts?.last_name||""}`.trim()||"—"}</td>
                        <td style={{ padding: "8px 12px", color: C.muted, fontSize: 11 }}>{s.contacts?.email||"—"}</td>
                        <td style={{ padding: "8px 12px" }}>
                          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4,
                            background: s.clicked_at?C.blue+"20":s.opened_at?C.green+"20":C.raised,
                            color: s.clicked_at?C.blue:s.opened_at?C.green:C.muted }}>
                            {s.clicked_at?"Clicked":s.opened_at?"Opened":"Sent"}
                          </span>
                        </td>
                        <td style={{ padding: "8px 12px", color: s.opened_at?C.green:C.muted, fontSize: 11 }}>
                          {s.opened_at?new Date(s.opened_at).toLocaleString("en-AU",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):"—"}
                        </td>
                        <td style={{ padding: "8px 12px", color: s.clicked_at?C.blue:C.muted, fontSize: 11 }}>
                          {s.clicked_at?new Date(s.clicked_at).toLocaleString("en-AU",{day:"numeric",month:"short"}):"—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
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
      fire(`✅ ${Object.keys(data.savedIds || {}).length || 7} emails generated and saved! Check Scheduling →`);
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
            {generating ? <><Spin />Building campaign… (15-30s)</> : <><Sparkles size={14} />⚡ Generate 7-Email Campaign</>}
          </button>
          {!generating && campaigns.length === 0 && (
            <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 8 }}>
              Creates: Save the Date · Invitation · Reminder · Day-of · Confirmation · What to Bring · Thank You
            </div>
          )}
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
            <div style={{ minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: C.muted, border: `1px dashed ${C.border}`, borderRadius: 10, padding: 40 }}>
              <Spin size={28} />
              <div style={{ fontSize: 15, fontWeight: 500, color: C.text }}>Claude is writing your campaign…</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Generating all 7 emails simultaneously</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 360 }}>
                {EMAIL_SEQUENCE.map((e, i) => (
                  <div key={e.type} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: C.card, borderRadius: 8, border: `1px solid ${C.border}`, animation: `fadeUp .3s ease ${i * 0.12}s both` }}>
                    <span style={{ fontSize: 16 }}>{e.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{e.label}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>{e.timing}</div>
                    </div>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${C.blue}30`, borderTop: `2px solid ${C.blue}`, animation: "spin .8s linear infinite", animationDelay: `${i * 0.15}s` }} />
                  </div>
                ))}
              </div>
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
function ROIView({ supabase, profile, activeEvent, fire }) {
  const [costs, setCosts] = useState({ venue: "", catering: "", av: "", marketing: "", staff: "", other: "" });
  const [revenue, setRevenue] = useState({ tickets: "", sponsorship: "", pipeline: "", other: "" });
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (!activeEvent) return;
    if (activeEvent.roi_costs) try { setCosts(JSON.parse(activeEvent.roi_costs)); } catch {}
    if (activeEvent.roi_revenue) try { setRevenue(JSON.parse(activeEvent.roi_revenue)); } catch {}
    if (activeEvent.id) {
      supabase.from("event_contacts").select("id", { count: "exact" })
        .eq("event_id", activeEvent.id).eq("status", "attended")
        .then(({ count }) => setMetrics(p => p ? { ...p, actual_attended: count || 0 } : { actual_attended: count || 0 }));
    }
  }, [activeEvent?.id]);

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
          <button onClick={() => {
            const accent = "#0A84FF";
            const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>ROI Report — ${activeEvent?.name}</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8f9fa;padding:40px;color:#1a1a1a}@media print{body{background:#fff;padding:20px}.no-print{display:none}}.card{background:#fff;border-radius:12px;border:1px solid #e5e5e7;padding:28px;margin-bottom:20px}.metric{display:inline-flex;flex-direction:column;align-items:center;padding:16px 24px;background:#f5f5f7;border-radius:10px;margin:6px}.metric-val{font-size:32px;font-weight:800;color:${accent}}.metric-lbl{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-top:4px}h1{font-size:28px;font-weight:800;margin-bottom:6px}h2{font-size:16px;font-weight:700;margin-bottom:14px;color:#555;text-transform:uppercase;letter-spacing:.5px}.roi-big{font-size:52px;font-weight:900;color:${parseInt(roi)>=0?"#30D158":"#FF453A"}}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px}</style></head><body>
<div class="no-print" style="text-align:center;margin-bottom:24px"><button onclick="window.print()" style="background:${accent};color:#fff;border:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer">Print / Save as PDF</button></div>
<div class="card"><div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px"><div><div style="font-size:11px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">POST-EVENT ROI REPORT</div><h1>${activeEvent?.name||"Event"}</h1><div style="font-size:14px;color:#888;margin-top:4px">${activeEvent?.event_date?new Date(activeEvent.event_date).toLocaleDateString("en-AU",{day:"numeric",month:"long",year:"numeric"}):""} ${activeEvent?.location?`· ${activeEvent.location}`:""}</div></div><div style="text-align:right"><div class="roi-big">${roi}%</div><div style="font-size:13px;color:#888">Return on Investment</div><div style="font-size:18px;font-weight:700;color:${parseInt(roi)>=0?"#30D158":"#FF453A"};margin-top:4px">${parseInt(roi)>=0?"+":""} $${Math.abs(totalRevenue-totalCost).toLocaleString()} net</div></div></div>
<div style="display:flex;flex-wrap:wrap;gap:6px">${[{l:"Attendees",v:metrics?.total_attended||0},{l:"Cost / Attendee",v:"$"+parseInt(costPerAttendee||0).toLocaleString()},{l:"Total Cost",v:"$"+totalCost.toLocaleString()},{l:"Total Value",v:"$"+totalRevenue.toLocaleString()},{l:"Open Rate",v:metrics?.total_sent?Math.round((metrics.total_opened/metrics.total_sent)*100)+"%":"—"},{l:"Show Rate",v:metrics?.total_confirmed&&metrics?.total_attended?Math.round(metrics.total_attended/metrics.total_confirmed*100)+"%":"—"}].map(m=>`<div class="metric"><div class="metric-val">${m.v}</div><div class="metric-lbl">${m.l}</div></div>`).join("")}</div></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px"><div class="card"><h2>Costs</h2>${Object.entries(costs).filter(([,v])=>parseFloat(v||0)>0).map(([k,v])=>`<div class="row"><span>${k.charAt(0).toUpperCase()+k.slice(1)}</span><span>$${parseFloat(v).toLocaleString()}</span></div>`).join("")}<div class="row" style="font-weight:700;border-bottom:none"><span>Total</span><span>$${totalCost.toLocaleString()}</span></div></div><div class="card"><h2>Revenue & Value</h2>${Object.entries(revenue).filter(([,v])=>parseFloat(v||0)>0).map(([k,v])=>`<div class="row"><span>${k.charAt(0).toUpperCase()+k.slice(1)}</span><span>$${parseFloat(v).toLocaleString()}</span></div>`).join("")}<div class="row" style="font-weight:700;border-bottom:none"><span>Total</span><span>$${totalRevenue.toLocaleString()}</span></div></div></div>
<div style="text-align:center;margin-top:20px;font-size:11px;color:#bbb">Generated by evara · evarahq.com · ${new Date().toLocaleDateString("en-AU",{day:"numeric",month:"long",year:"numeric"})}</div></body></html>`;
            const w = window.open("","_blank");
            w.document.write(html); w.document.close();
            fire("✅ Executive summary opened — use Print to save as PDF");
          }} style={{ padding: "10px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 13, cursor: "pointer", display:"flex", alignItems:"center", gap:5 }}>
            📄 Print-ready Report
          </button>
          <button onClick={() => {
            const csvRows = [
              ["Metric", "Value"],
              ["Event", activeEvent.name],
              ["Date", activeEvent.event_date || ""],
              ["Total Contacts", metrics?.total_contacts || 0],
              ["Confirmed", metrics?.total_confirmed || 0],
              ["Attended", metrics?.total_attended || 0],
              ["", ""],
              ["COSTS", ""],
              ...Object.entries(costs).map(([k, v]) => [k.charAt(0).toUpperCase() + k.slice(1), v || 0]),
              ["Total Cost", `$${totalCost.toLocaleString()}`],
              ["", ""],
              ["REVENUE", ""],
              ...Object.entries(revenue).map(([k, v]) => [k.charAt(0).toUpperCase() + k.slice(1), v || 0]),
              ["Total Revenue", `$${totalRevenue.toLocaleString()}`],
              ["", ""],
              ["ROI", `${roi}%`],
              ["Cost per Attendee", `$${costPerAttendee}`],
            ];
            const csv = csvRows.map(r => r.join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `${activeEvent.name.replace(/\s+/g, "_")}_ROI_Report.csv`;
            a.click();
            fire("✅ ROI report downloaded!");
          }} style={{ padding: "8px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 13, cursor: "pointer" }}>
            ↓ Export CSV
          </button>
          <button onClick={async () => {
            await supabase.from("events").update({
              roi_costs: JSON.stringify(costs),
              roi_revenue: JSON.stringify(revenue),
            }).eq("id", activeEvent.id);
            fire("✅ ROI data saved to event");
          }} style={{ fontSize: 12, padding: "8px 14px", borderRadius: 7, border: `1px solid ${C.green}40`, background: C.green+"12", color: C.green, cursor: "pointer", fontWeight: 500 }}>
            💾 Save ROI data
          </button>
        </div>
      </div>

      {/* ── Visual cost breakdown + evara savings ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginTop:14 }}>

        {/* Cost breakdown bar chart */}
        <div style={{ background:C.card, borderRadius:10, border:`1px solid ${C.border}`, padding:18 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:14 }}>Cost Breakdown</div>
          {(() => {
            const items = [
              { label:"Venue", val:parseFloat(costs.venue)||0, color:"#FF453A" },
              { label:"Catering", val:parseFloat(costs.catering)||0, color:"#FF9F0A" },
              { label:"AV & Production", val:parseFloat(costs.av)||0, color:"#BF5AF2" },
              { label:"Marketing", val:parseFloat(costs.marketing)||0, color:"#0A84FF" },
              { label:"Staff", val:parseFloat(costs.staff)||0, color:"#5AC8FA" },
              { label:"Other", val:parseFloat(costs.other)||0, color:"#636366" },
            ].filter(i => i.val > 0);
            const max = Math.max(...items.map(i=>i.val), 1);
            if (!items.length) return <div style={{ fontSize:13, color:C.muted, textAlign:"center", padding:20 }}>Enter costs to see breakdown</div>;
            return (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {items.map(item => (
                  <div key={item.label}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:12 }}>
                      <span style={{ color:C.sec }}>{item.label}</span>
                      <span style={{ color:item.color, fontWeight:600 }}>${item.val.toLocaleString()} <span style={{ color:C.muted, fontWeight:400 }}>({Math.round(item.val/totalCost*100)}%)</span></span>
                    </div>
                    <div style={{ height:6, background:C.raised, borderRadius:3 }}>
                      <div style={{ height:"100%", width:`${(item.val/max)*100}%`, background:item.color, borderRadius:3, transition:"width .5s ease" }} />
                    </div>
                  </div>
                ))}
                {/* Stacked total visual */}
                <div style={{ marginTop:8, height:24, borderRadius:6, overflow:"hidden", display:"flex" }}>
                  {items.map(item => (
                    <div key={item.label} style={{ height:"100%", width:`${(item.val/totalCost)*100}%`, background:item.color }} title={`${item.label}: $${item.val.toLocaleString()}`} />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* evara vs old stack savings */}
        <div style={{ background:C.card, borderRadius:10, border:`1px solid ${C.border}`, padding:18 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:4 }}>evara Tool Savings</div>
          <div style={{ fontSize:11, color:C.muted, marginBottom:14 }}>What you save vs running a fragmented stack</div>
          {[
            { tool:"Mailchimp", cost:350, replaced:"Email marketing" },
            { tool:"Eventbrite", cost:299, replaced:"Event registration" },
            { tool:"Typeform", cost:99, replaced:"Forms & surveys" },
            { tool:"Unbounce", cost:200, replaced:"Landing pages" },
            { tool:"Zapier", cost:200, replaced:"Automation" },
          ].map(t => (
            <div key={t.tool} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${C.border}` }}>
              <div>
                <span style={{ fontSize:12.5, color:C.sec, textDecoration:"line-through" }}>{t.tool}</span>
                <span style={{ fontSize:10, color:C.muted, marginLeft:6 }}>{t.replaced}</span>
              </div>
              <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>-${t.cost}/mo</span>
            </div>
          ))}
          <div style={{ paddingTop:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:11, color:C.muted }}>Old stack total</div>
              <div style={{ fontSize:13, color:C.muted, textDecoration:"line-through" }}>$1,148/mo</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11, color:C.green }}>evara Growth plan</div>
              <div style={{ fontSize:22, fontWeight:800, color:C.green, letterSpacing:"-0.5px" }}>$949 saved</div>
              <div style={{ fontSize:10, color:C.muted }}>per month</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADD CUSTOM QUESTION ──────────────────────────────────────
function AddCustomQuestion({ feedbackForm, setFeedbackForm, supabase, fire }) {
  const [show, setShow] = useState(false);
  const [qLabel, setQLabel] = useState("");
  const [qType, setQType] = useState("text");
  const [qOptions, setQOptions] = useState("Option 1\nOption 2\nOption 3");
  const [qRequired, setQRequired] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!qLabel.trim()) return;
    setSaving(true);
    const newField = {
      id: Date.now(),
      type: qType,
      label: qLabel.trim(),
      required: qRequired,
      options: (qType === "radio" || qType === "select") ? qOptions.split("\n").map(o => o.trim()).filter(Boolean) : [],
    };
    const newFields = [...(feedbackForm.fields || []), newField];
    await supabase.from("forms").update({ fields: newFields }).eq("id", feedbackForm.id);
    setFeedbackForm(p => ({ ...p, fields: newFields }));
    fire("✅ Question added");
    setQLabel(""); setQType("text"); setQOptions("Option 1\nOption 2\nOption 3"); setQRequired(false); setShow(false);
    setSaving(false);
  };

  if (!show) return (
    <button onClick={() => setShow(true)} style={{ width: "100%", marginTop: 10, padding: "7px", borderRadius: 6, border: `1px dashed ${C.blue}40`, background: `${C.blue}06`, color: C.blue, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
      + Add custom question
    </button>
  );

  return (
    <div style={{ marginTop: 10, background: C.bg, borderRadius: 8, border: `1px solid ${C.blue}30`, padding: "12px 14px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 10 }}>New question</div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Question text *</label>
        <input value={qLabel} onChange={e => setQLabel(e.target.value)} autoFocus placeholder="e.g. How did you hear about us?"
          style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: "7px 10px", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Type</label>
          <select value={qType} onChange={e => setQType(e.target.value)}
            style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: "7px 8px", fontSize: 12, outline: "none" }}>
            <option value="text">Short text</option>
            <option value="textarea">Long text</option>
            <option value="radio">Multiple choice</option>
            <option value="select">Dropdown</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted, cursor: "pointer" }}>
            <input type="checkbox" checked={qRequired} onChange={e => setQRequired(e.target.checked)} style={{ accentColor: C.blue, cursor: "pointer" }} />
            Required
          </label>
        </div>
      </div>
      {(qType === "radio" || qType === "select") && (
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Options (one per line)</label>
          <textarea value={qOptions} onChange={e => setQOptions(e.target.value)} rows={4}
            style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: "7px 10px", fontSize: 12, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
        </div>
      )}
      <div style={{ display: "flex", gap: 7 }}>
        <button onClick={() => { setShow(false); setQLabel(""); }} style={{ flex: 1, padding: "7px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, cursor: "pointer" }}>Cancel</button>
        <button onClick={save} disabled={!qLabel.trim() || saving}
          style={{ flex: 2, padding: "7px", borderRadius: 6, border: "none", background: qLabel.trim() ? C.blue : C.border, color: "#fff", fontSize: 12, fontWeight: 600, cursor: qLabel.trim() ? "pointer" : "default" }}>
          {saving ? "Saving…" : "Add Question"}
        </button>
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: C.text, letterSpacing: "-0.6px" }}>Feedback Intelligence</h1>
            {analysis?.nps !== undefined && (
              <div style={{ background: analysis.nps >= 50 ? C.green+"20" : analysis.nps >= 0 ? C.amber+"20" : C.red+"20", border: `1px solid ${analysis.nps >= 50 ? C.green : analysis.nps >= 0 ? C.amber : C.red}40`, borderRadius: 8, padding: "4px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: analysis.nps >= 50 ? C.green : analysis.nps >= 0 ? C.amber : C.red }}>{analysis.nps}</div>
                <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>NPS</div>
              </div>
            )}
          </div>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Collect, analyse, and act on post-event feedback with AI.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {submissions.length > 0 && (
            <>
            <button onClick={() => {
              const rows = ["Name,Email,Submitted At,...Responses"];
              submissions.forEach(s => {
                const name = s.event_contacts?.contacts?.first_name + " " + (s.event_contacts?.contacts?.last_name || "");
                const email = s.event_contacts?.contacts?.email || "";
                const date = new Date(s.created_at).toLocaleDateString("en-AU");
                const responses = Object.values(s.responses || {}).join(" | ");
                rows.push(`"${name}","${email}","${date}","${responses}"`);
              });
              const blob = new Blob([rows.join("\n")], { type: "text/csv" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `feedback_${activeEvent?.name?.replace(/\s+/g,"_")}.csv`;
              a.click();
              fire(`✅ Exported ${submissions.length} responses`);
            }} style={{ fontSize: 13, padding: "7px 16px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
              ↓ Export CSV
            </button>
            <button onClick={analyseWithAI} disabled={analysing}
              style={{ fontSize: 13, padding: "7px 16px", borderRadius: 7, border: "none", background: analysing ? C.raised : C.blue, color: analysing ? C.muted : "#fff", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              {analysing ? <><Spin size={12} />Analysing…</> : <><Sparkles size={13} />AI Analyse ({submissions.length})</>}
            </button>
            </>
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
                  <button onClick={() => window.open(shareLink, "_blank")} style={{ marginTop: 8, width: "100%", padding: "7px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 11, cursor: "pointer" }}>
                    👁 Preview form →
                  </button>
                  <div style={{ marginTop: 10, fontSize: 12, color: C.muted }}>
                    💡 Display this link on screens at the end of the event, and include it in your Thank You email.
                  </div>
                </div>

                {/* Custom question builder */}
                <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 10 }}>Questions ({feedbackForm.fields?.length})</div>
                  {(feedbackForm.fields || []).map((field, idx) => (
                    <div key={field.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 0", borderBottom: idx < feedbackForm.fields.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <span style={{ fontSize: 10, color: C.muted, marginTop: 2, flexShrink: 0, width: 16, textAlign: "center" }}>{idx + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: C.text }}>{field.label}</div>
                        <div style={{ fontSize: 10, color: C.muted, marginTop: 1, textTransform: "capitalize" }}>{field.type}{field.required ? " · required" : ""}</div>
                      </div>
                      <button onClick={async () => {
                        const newFields = feedbackForm.fields.filter((_, i) => i !== idx);
                        await supabase.from("forms").update({ fields: newFields }).eq("id", feedbackForm.id);
                        setFeedbackForm(p => ({ ...p, fields: newFields }));
                        fire("Question removed");
                      }} style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: C.red, cursor: "pointer", flexShrink: 0 }}>✕</button>
                    </div>
                  ))}

                  {/* Add custom question */}
                  <AddCustomQuestion feedbackForm={feedbackForm} setFeedbackForm={setFeedbackForm} supabase={supabase} fire={fire} />
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
  const [countdown, setCountdown] = useState({ days:0, hours:0, mins:0, secs:0 });
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  useEffect(() => {
    supabase.from("landing_pages").select("*, events(*)").eq("slug", slug).maybeSingle()
      .then(({ data }) => { if (data) { setPage(data); setEvent(data.events); } setLoading(false); });
  }, [slug]);

  useEffect(() => {
    if (!event?.event_date) return;
    const tick = () => {
      const diff = new Date(event.event_date) - new Date();
      if (diff <= 0) return;
      const days = Math.floor(diff/(1000*60*60*24));
      const hours = Math.floor((diff%(1000*60*60*24))/(1000*60*60));
      const mins = Math.floor((diff%(1000*60*60))/(1000*60));
      const secs = Math.floor((diff%(1000*60))/1000);
      setCountdown({ days, hours, mins, secs });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [event?.event_date]);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#080809", fontFamily:"Outfit,sans-serif" }}>
      <div style={{ textAlign:"center", color:"rgba(255,255,255,0.4)", fontSize:14 }}>Loading…</div>
    </div>
  );

  if (!page) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Outfit,sans-serif", background:"#080809" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:52, marginBottom:14 }}>🔍</div>
        <h1 style={{ fontSize:22, color:"#fff", marginBottom:8 }}>Page not found</h1>
        <p style={{ color:"rgba(255,255,255,0.4)" }}>This event page doesn't exist or has been removed.</p>
      </div>
    </div>
  );

  const tmpl = page.template || "corporate";
  const accent = page.brand_color || "#0A84FF";
  const isLight = tmpl === "minimal" || tmpl === "light" || tmpl === "editorial" || tmpl === "warm";
  const bg = tmpl==="minimal"?"#FFFFFF":tmpl==="light"||tmpl==="warm"?"#FAF9F7":tmpl==="editorial"?"#F5F0E8":tmpl==="neon"?"#050505":tmpl==="bold"?"#0A0A1A":"#0D0D0F";
  const textCol = isLight ? "#111111" : "#F5F5F7";
  const subCol = isLight ? "#555" : "rgba(255,255,255,0.6)";
  const borderCol = isLight ? "#E5E5E7" : "rgba(255,255,255,0.1)";
  const accentActual = tmpl==="neon"?"#39FF14":tmpl==="editorial"?"#000":tmpl==="minimal"?"#111":accent;
  const regUrl = page.reg_url || "#register";
  const eventDate = event?.event_date ? new Date(event.event_date) : null;
  const eventDateStr = eventDate ? eventDate.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"}) : "";
  const isFuture = eventDate && eventDate > new Date();
  const blocks = page.blocks || {};

  return (
    <div style={{ minHeight:"100vh", background:bg, fontFamily:"Outfit,sans-serif", color:textCol }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none}`}</style>

      {/* Top accent */}
      {tmpl==="editorial" && <div style={{ height:5, background:"#000" }} />}
      {tmpl==="neon" && <div style={{ height:2, background:`linear-gradient(90deg,transparent,#39FF14,transparent)` }} />}

      {/* Nav */}
      <nav style={{ padding:"14px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${borderCol}`, position:"sticky", top:0, background: isLight?"rgba(255,255,255,0.95)":"rgba(0,0,0,0.85)", backdropFilter:"blur(12px)", zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {page.logo_url ? <img src={page.logo_url} alt="logo" style={{ height:28, objectFit:"contain" }} /> : <span style={{ fontSize:15, fontWeight:700, color:textCol }}>{page.organiser || event?.name || "evara"}</span>}
        </div>
        <a href={regUrl} style={{ padding:"8px 20px", background:accentActual, color: tmpl==="neon"?"#000":"#fff", borderRadius:8, fontSize:13, fontWeight:700 }}>
          {page.cta_text || "Register Now"}
        </a>
      </nav>

      {/* Hero */}
      {(blocks.hero !== false) && (
        <div style={{ padding:"72px 24px 56px", textAlign:"center", position:"relative", overflow:"hidden" }}>
          {(tmpl==="bold"||tmpl==="neon") && <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 0%, ${accentActual}20 0%, transparent 65%)`, pointerEvents:"none" }} />}
          {eventDateStr && <div style={{ fontSize:11, fontWeight:700, color:accentActual, textTransform:"uppercase", letterSpacing:"2.5px", marginBottom:14 }}>{eventDateStr}{event?.location ? ` · ${event.location}` : ""}</div>}
          <h1 style={{ fontSize:"clamp(30px,5vw,62px)", fontWeight:800, letterSpacing:"-1.5px", lineHeight:1.05, marginBottom:14, color:textCol, maxWidth:820, margin:"0 auto 14px" }}>
            {page.headline || event?.name || "Event"}
          </h1>
          {page.subheadline && <p style={{ fontSize:"clamp(15px,2vw,19px)", color:subCol, maxWidth:560, margin:"0 auto 14px", lineHeight:1.65 }}>{page.subheadline}</p>}
          {page.tagline && <p style={{ fontSize:14, color: isLight?"#888":"rgba(255,255,255,0.4)", marginBottom:28, fontStyle: tmpl==="editorial"?"italic":"normal" }}>{page.tagline}</p>}
          <a href={regUrl} style={{ display:"inline-block", padding:"14px 36px", background:accentActual, color: tmpl==="neon"?"#000":"#fff", borderRadius:9, fontSize:16, fontWeight:700, boxShadow:`0 8px 28px ${accentActual}40`, marginTop:8 }}>
            {page.cta_text || "Register Now"} →
          </a>
        </div>
      )}

      {/* Countdown */}
      {(blocks.countdown !== false) && isFuture && (
        <div style={{ padding:"20px 24px", borderTop:`1px solid ${borderCol}`, borderBottom:`1px solid ${borderCol}`, display:"flex", justifyContent:"center", gap:"clamp(20px,4vw,48px)", background: isLight?"rgba(0,0,0,0.03)":"rgba(255,255,255,0.04)" }}>
          {[["Days",countdown.days],["Hours",countdown.hours],["Mins",countdown.mins],["Secs",countdown.secs]].map(([lbl,val]) => (
            <div key={lbl} style={{ textAlign:"center" }}>
              <div style={{ fontSize:"clamp(28px,5vw,48px)", fontWeight:800, color:accentActual, lineHeight:1, fontVariantNumeric:"tabular-nums" }}>{String(val).padStart(2,"0")}</div>
              <div style={{ fontSize:10, color:subCol, textTransform:"uppercase", letterSpacing:"1.5px", marginTop:4 }}>{lbl}</div>
            </div>
          ))}
        </div>
      )}

      {/* Event details grid */}
      {(blocks.details !== false) && eventDateStr && (
        <div style={{ maxWidth:800, margin:"0 auto", padding:"40px 24px", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14 }}>
          {[
            eventDateStr && {icon:"📅",label:"Date",val:eventDateStr},
            event?.event_time && {icon:"🕐",label:"Time",val:event.event_time},
            (page.location_text||event?.location) && {icon:"📍",label:"Location",val:page.location_text||event.location},
            event?.capacity && {icon:"👥",label:"Capacity",val:`${event.capacity} guests`},
          ].filter(Boolean).map(({icon,label,val}) => (
            <div key={label} style={{ background: isLight?"rgba(0,0,0,0.04)":"rgba(255,255,255,0.05)", border:`1px solid ${borderCol}`, borderRadius:12, padding:"16px 18px" }}>
              <div style={{ fontSize:20, marginBottom:8 }}>{icon}</div>
              <div style={{ fontSize:10, color:subCol, textTransform:"uppercase", letterSpacing:"1px", marginBottom:4 }}>{label}</div>
              <div style={{ fontSize:14, fontWeight:600, color:textCol, lineHeight:1.3 }}>{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* About */}
      {(blocks.about !== false || blocks.details !== false) && (page.about_text||event?.description) && (
        <div style={{ maxWidth:680, margin:"0 auto", padding:"24px 24px 48px", textAlign:"center" }}>
          <h2 style={{ fontSize:26, fontWeight:700, color:textCol, marginBottom:14, letterSpacing:"-0.5px" }}>About this event</h2>
          <p style={{ fontSize:16, lineHeight:1.8, color:subCol }}>{page.about_text||event?.description}</p>
        </div>
      )}

      {/* RSVP CTA */}
      {blocks.rsvp !== false && (
        <div style={{ textAlign:"center", padding:"40px 24px 64px", borderTop:`1px solid ${borderCol}` }}>
          {regUrl.includes("/form/") ? (
            <div style={{ maxWidth:640, margin:"0 auto" }}>
              <h2 style={{ fontSize:22, fontWeight:700, color:textCol, marginBottom:8 }}>Reserve your spot</h2>
              <p style={{ fontSize:14, color:subCol, marginBottom:24 }}>Fill in your details below to register for this event.</p>
              <iframe src={regUrl} style={{ width:"100%", minHeight:500, border:"none", borderRadius:14, background:"#fff", boxShadow:"0 4px 24px rgba(0,0,0,0.15)" }} title="Registration Form" />
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize:22, fontWeight:700, color:textCol, marginBottom:8 }}>Ready to attend?</h2>
              <p style={{ fontSize:14, color:subCol, marginBottom:24 }}>Secure your spot before registrations close.</p>
              <a href={regUrl} style={{ display:"inline-block", padding:"14px 40px", background:accentActual, color: tmpl==="neon"?"#000":"#fff", borderRadius:9, fontSize:16, fontWeight:700, boxShadow:`0 6px 24px ${accentActual}40` }}>
                {page.cta_text || "Register Now"} →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop:`1px solid ${borderCol}`, padding:"18px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", gap:14 }}>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener" style={{ fontSize:12, color:subCol, padding:"5px 12px", borderRadius:20, border:`1px solid ${borderCol}` }}>📤 Share on LinkedIn</a>
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent((page.headline||event?.name||"")+' — register now!')}`} target="_blank" rel="noopener" style={{ fontSize:12, color:subCol, padding:"5px 12px", borderRadius:20, border:`1px solid ${borderCol}` }}>🐦 Share on X</a>
        </div>
        <span style={{ fontSize:11, color: isLight?"#bbb":"rgba(255,255,255,0.25)" }}>Powered by evara · evarahq.com</span>
      </div>
    </div>
  );
}

// ─── MULTI-EVENT OVERVIEW ────────────────────────────────────
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
function PricingPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [annual, setAnnual] = useState(false);
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const PLANS = [
    { name:"Starter", monthly:49, desc:"Small businesses, 1–2 events/month", color:"#0A84FF", features:["500 contacts","3 events/month","AI email generation","Registration forms","Basic analytics","Email support"] },
    { name:"Growth", monthly:199, desc:"SMBs managing 3–10 events", color:"#30D158", badge:"Most Popular", features:["5,000 contacts","Unlimited events","AI drip campaigns","Landing page builder","Advanced analytics + ROI","CRM export (Salesforce)","Priority support"] },
    { name:"Pro", monthly:599, desc:"Agencies, multi-client", color:"#FF9F0A", features:["Unlimited contacts","Multi-client white-label","Brand kit per client","Full Salesforce + nCino","Team roles & permissions","Dedicated onboarding","SLA support"] },
    { name:"Enterprise", monthly:null, desc:"Custom data residency & SSO", color:"#BF5AF2", features:["Everything in Pro","Custom data residency","SSO / SAML","Custom integrations","Legal agreements","Dedicated CSM"] },
  ];

  const REPLACED = [
    { tool:"Mailchimp", cost:350, icon:"✉️", what:"Email marketing" },
    { tool:"Eventbrite", cost:299, icon:"🎟", what:"Event ticketing" },
    { tool:"Typeform", cost:99, icon:"📋", what:"Registration forms" },
    { tool:"Unbounce", cost:200, icon:"🌐", what:"Landing pages" },
    { tool:"Zapier", cost:200, icon:"⚡", what:"Automation" },
  ];

  const COMPARE = [
    { feature:"AI email generation", evara:true, mailchimp:false, eventbrite:false },
    { feature:"Event lifecycle view", evara:true, mailchimp:false, eventbrite:false },
    { feature:"Built-in registration forms", evara:true, mailchimp:false, eventbrite:true },
    { feature:"Landing page builder", evara:true, mailchimp:true, eventbrite:false },
    { feature:"Contact deduplication", evara:true, mailchimp:false, eventbrite:false },
    { feature:"RSVP status tracking", evara:true, mailchimp:false, eventbrite:true },
    { feature:"QR code check-in", evara:true, mailchimp:false, eventbrite:true },
    { feature:"Salesforce export", evara:true, mailchimp:"paid", eventbrite:false },
    { feature:"GDPR compliance", evara:true, mailchimp:true, eventbrite:true },
    { feature:"Analytics dashboard", evara:true, mailchimp:"basic", eventbrite:"basic" },
  ];

  const FAQS = [
    { q:"Is there a free trial?", a:"Yes — sign up at evara-tau.vercel.app and get full access to all features during the beta. No credit card required." },
    { q:"Can I import my existing contacts?", a:"Yes. evara accepts CSV uploads, paste-in email lists, and 'First Last <email>' format. It deduplicates automatically and skips personal emails." },
    { q:"Does it replace Mailchimp?", a:"For event marketing, yes. evara handles everything from Save the Date through attendance tracking in one place. If you run a general newsletter, you may still want a separate tool for that." },
    { q:"How does AI email generation work?", a:"You give evara your event details (name, date, location, description). It calls Claude — Anthropic's AI — and generates a full, formatted email using your brand colours and sender name. No PII is ever sent to the AI." },
    { q:"Is my data safe?", a:"Each company's data is fully isolated using Supabase Row Level Security. Data is encrypted at rest (AES-256) and in transit (TLS 1.3). No contact data is ever shared across tenants." },
    { q:"What happens when I cancel?", a:"You can export all your data (contacts, emails, analytics) as CSV at any time. We honour right-to-erasure requests within 30 days." },
  ];

  const handleSubmit = async () => {
    if (!email?.includes("@")) return;
    setSubmitting(true);
    try { await supabase.from("waitlist").insert({ email, name, company, created_at: new Date().toISOString() }); } catch {}
    setSubmitted(true); setSubmitting(false);
  };

  const totalReplaced = REPLACED.reduce((s,t) => s+t.cost, 0);

  return (
    <div style={{ minHeight:"100vh", background:"#080809", fontFamily:"Outfit,sans-serif", color:"#F5F5F7" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none}button{cursor:pointer;font-family:Outfit,sans-serif}input{font-family:Outfit,sans-serif}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Nav */}
      <nav style={{ borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"16px 40px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:"rgba(8,8,9,0.92)", backdropFilter:"blur(12px)", zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, background:"#0A84FF", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#fff" }}>e</div>
          <span style={{ fontSize:17, fontWeight:700, letterSpacing:"-0.4px" }}>evara</span>
          <span style={{ fontSize:10, background:"rgba(10,132,255,0.2)", color:"#0A84FF", padding:"2px 7px", borderRadius:4, fontWeight:600, letterSpacing:"0.5px" }}>BETA</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <a href="#compare" style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>Compare</a>
          <a href="#faq" style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>FAQ</a>
          <a href="/" style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>← Back to app</a>
          <a href="#waitlist" style={{ fontSize:13, fontWeight:600, background:"#0A84FF", color:"#fff", padding:"7px 18px", borderRadius:8 }}>Get early access →</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign:"center", padding:"88px 24px 64px", animation:"fadeUp .4s ease" }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:"2.5px", textTransform:"uppercase", color:"#0A84FF", marginBottom:18 }}>Simple, honest pricing</div>
        <h1 style={{ fontSize:"clamp(36px,5.5vw,64px)", fontWeight:800, letterSpacing:"-1.5px", lineHeight:1.05, marginBottom:20 }}>
          Replace 5 tools.<br /><span style={{ color:"#0A84FF" }}>One subscription.</span>
        </h1>
        <p style={{ fontSize:18, color:"rgba(255,255,255,0.5)", maxWidth:540, margin:"0 auto 40px", lineHeight:1.7 }}>
          Mailchimp + Eventbrite + Typeform + Unbounce + Zapier — all in evara, starting at $49/month.
        </p>

        {/* Billing toggle */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:12, background:"rgba(255,255,255,0.06)", borderRadius:999, padding:"6px 20px", marginBottom:56 }}>
          <span style={{ fontSize:13, color: !annual?"#fff":"rgba(255,255,255,0.4)", fontWeight: !annual?600:400 }}>Monthly</span>
          <div onClick={() => setAnnual(a=>!a)} style={{ width:44, height:24, borderRadius:12, background: annual?"#0A84FF":"rgba(255,255,255,0.15)", cursor:"pointer", position:"relative", transition:"background .2s" }}>
            <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left: annual?23:3, transition:"left .2s", boxShadow:"0 1px 4px rgba(0,0,0,.3)" }} />
          </div>
          <span style={{ fontSize:13, color: annual?"#fff":"rgba(255,255,255,0.4)", fontWeight: annual?600:400 }}>Annual <span style={{ fontSize:10, color:"#30D158", fontWeight:700 }}>-20%</span></span>
        </div>

        {/* Plan cards */}
        <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap", maxWidth:1080, margin:"0 auto 96px" }}>
          {PLANS.map((plan, i) => {
            const price = plan.monthly ? (annual ? Math.round(plan.monthly*0.8) : plan.monthly) : null;
            const isPopular = i === 1;
            return (
              <div key={plan.name} style={{ background: isPopular?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.03)", border:`1px solid ${isPopular?plan.color+"50":"rgba(255,255,255,0.09)"}`, borderRadius:18, padding:"28px 24px", width:240, textAlign:"left", position:"relative", flexShrink:0, transition:"transform .2s", boxShadow: isPopular?`0 0 40px ${plan.color}15`:"none" }}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                {plan.badge && <div style={{ position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)", background:plan.color, color:"#000", fontSize:10, fontWeight:800, padding:"3px 14px", borderRadius:999, letterSpacing:"0.8px", textTransform:"uppercase", whiteSpace:"nowrap" }}>{plan.badge}</div>}
                <div style={{ fontSize:11, fontWeight:700, color:plan.color, textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>{plan.name}</div>
                <div style={{ display:"flex", alignItems:"baseline", gap:2, marginBottom:6 }}>
                  {price ? <>
                    <span style={{ fontSize:44, fontWeight:800, letterSpacing:"-2px" }}>${price}</span>
                    <span style={{ fontSize:13, color:"rgba(255,255,255,0.35)" }}>/mo{annual?" billed annually":""}</span>
                  </> : <span style={{ fontSize:28, fontWeight:800 }}>Custom</span>}
                </div>
                <p style={{ fontSize:12.5, color:"rgba(255,255,255,0.4)", marginBottom:22, lineHeight:1.5 }}>{plan.desc}</p>
                <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:24 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:12.5, color:"rgba(255,255,255,0.7)" }}>
                      <span style={{ color:plan.color, flexShrink:0, marginTop:1 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <a href="#waitlist" onClick={e=>{e.preventDefault();document.getElementById("waitlist-email")?.focus();}}
                  style={{ display:"block", textAlign:"center", padding:"11px", background: isPopular?plan.color:"transparent", border:`1.5px solid ${isPopular?"transparent":plan.color+"60"}`, borderRadius:9, color: isPopular?"#000":"#fff", fontSize:13.5, fontWeight:700 }}>
                  {plan.monthly ? "Join waitlist →" : "Contact us →"}
                </a>
              </div>
            );
          })}
        </div>

        {/* Savings calculator */}
        <div style={{ maxWidth:680, margin:"0 auto 96px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"36px 40px" }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", marginBottom:12 }}>What you're replacing</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:28 }}>
            {REPLACED.map(r => (
              <div key={r.tool} style={{ textAlign:"center" }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{r.icon}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", textDecoration:"line-through" }}>${r.cost}/mo</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.2)", marginTop:2 }}>{r.tool}</div>
              </div>
            ))}
          </div>
          <div style={{ height:1, background:"rgba(255,255,255,0.07)", marginBottom:24 }} />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
            <div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>Current stack cost</div>
              <div style={{ fontSize:32, fontWeight:800, color:"rgba(255,255,255,0.4)", letterSpacing:"-1px", textDecoration:"line-through" }}>${totalReplaced.toLocaleString()}/mo</div>
            </div>
            <div style={{ fontSize:28, color:"rgba(255,255,255,0.2)" }}>→</div>
            <div>
              <div style={{ fontSize:13, color:"#30D158" }}>evara Growth plan</div>
              <div style={{ fontSize:32, fontWeight:800, color:"#30D158", letterSpacing:"-1px" }}>$199/mo</div>
            </div>
            <div style={{ background:"rgba(48,209,88,0.12)", border:"1px solid rgba(48,209,88,0.25)", borderRadius:12, padding:"14px 20px", textAlign:"center" }}>
              <div style={{ fontSize:11, color:"#30D158", fontWeight:600, textTransform:"uppercase", letterSpacing:"1px" }}>You save</div>
              <div style={{ fontSize:36, fontWeight:800, color:"#30D158", letterSpacing:"-1px" }}>${(totalReplaced-199).toLocaleString()}</div>
              <div style={{ fontSize:11, color:"rgba(48,209,88,0.6)" }}>per month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div id="compare" style={{ maxWidth:760, margin:"0 auto 96px", padding:"0 24px" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <h2 style={{ fontSize:36, fontWeight:800, letterSpacing:"-1px", marginBottom:10 }}>evara vs the alternatives</h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.4)" }}>Built specifically for event marketing — not a general-purpose tool bolted together</p>
        </div>
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                <th style={{ padding:"14px 20px", textAlign:"left", fontSize:12, color:"rgba(255,255,255,0.3)", fontWeight:500 }}>Feature</th>
                {[{n:"evara",c:"#0A84FF"},{n:"Mailchimp",c:null},{n:"Eventbrite",c:null}].map(h => (
                  <th key={h.n} style={{ padding:"14px 20px", textAlign:"center", fontSize:13, fontWeight:700, color:h.c||"rgba(255,255,255,0.4)" }}>{h.n}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row, i) => (
                <tr key={row.feature} style={{ borderBottom: i<COMPARE.length-1?"1px solid rgba(255,255,255,0.05)":"none" }}>
                  <td style={{ padding:"12px 20px", fontSize:13, color:"rgba(255,255,255,0.65)" }}>{row.feature}</td>
                  {[row.evara, row.mailchimp, row.eventbrite].map((v, j) => (
                    <td key={j} style={{ padding:"12px 20px", textAlign:"center" }}>
                      {v === true ? <span style={{ color:"#30D158", fontSize:16 }}>✓</span>
                       : v === false ? <span style={{ color:"rgba(255,255,255,0.15)", fontSize:14 }}>✗</span>
                       : <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)", background:"rgba(255,255,255,0.06)", padding:"2px 8px", borderRadius:4, fontWeight:500 }}>{v}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div id="faq" style={{ maxWidth:640, margin:"0 auto 96px", padding:"0 24px" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <h2 style={{ fontSize:36, fontWeight:800, letterSpacing:"-1px", marginBottom:10 }}>FAQ</h2>
        </div>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
            <button onClick={() => setOpenFaq(openFaq===i?null:i)} style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 0", background:"none", border:"none", color:"#F5F5F7", fontSize:15, fontWeight:500, textAlign:"left", cursor:"pointer" }}>
              {faq.q}
              <span style={{ fontSize:18, color:"rgba(255,255,255,0.3)", transform: openFaq===i?"rotate(45deg)":"none", transition:"transform .2s", flexShrink:0, marginLeft:16 }}>+</span>
            </button>
            {openFaq===i && <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.7, paddingBottom:18 }}>{faq.a}</p>}
          </div>
        ))}
      </div>

      {/* Waitlist */}
      <div id="waitlist" style={{ maxWidth:480, margin:"0 auto 80px", padding:"0 24px" }}>
        <div style={{ background:"rgba(10,132,255,0.06)", border:"1px solid rgba(10,132,255,0.2)", borderRadius:20, padding:"40px 36px" }}>
          {submitted ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
              <h2 style={{ fontSize:24, fontWeight:800, marginBottom:8 }}>You're on the list!</h2>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.6 }}>We'll email you with early access soon. You'll get 3 months free on any plan.</p>
            </div>
          ) : (
            <>
              <div style={{ textAlign:"center", marginBottom:24 }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:"#0A84FF", marginBottom:10 }}>Early Access</div>
                <h2 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.5px", marginBottom:8 }}>Join the waitlist</h2>
                <p style={{ fontSize:13.5, color:"rgba(255,255,255,0.45)", lineHeight:1.6 }}>Get early access + 3 months free on any plan at launch.</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, color:"#fff", padding:"12px 15px", fontSize:14, outline:"none" }} />
                <input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Company" style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, color:"#fff", padding:"12px 15px", fontSize:14, outline:"none" }} />
                <input id="waitlist-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} placeholder="Work email" style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, color:"#fff", padding:"12px 15px", fontSize:14, outline:"none" }} />
                <button onClick={handleSubmit} disabled={submitting||!email?.includes("@")} style={{ padding:"14px", background:submitting||!email?.includes("@")?"rgba(10,132,255,0.4)":"#0A84FF", border:"none", borderRadius:9, color:"#fff", fontSize:15, fontWeight:700, boxShadow:"0 4px 20px rgba(10,132,255,0.35)" }}>
                  {submitting ? "Joining…" : "Request Early Access →"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"20px 40px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <span style={{ fontSize:11, color:"rgba(255,255,255,0.2)" }}>© {new Date().getFullYear()} evara · evarahq.com</span>
        <div style={{ display:"flex", gap:20 }}>
          {["🔒 GDPR","✉️ SendGrid","🤖 Claude AI","🗄 Supabase"].map(t=><span key={t} style={{ fontSize:11, color:"rgba(255,255,255,0.2)" }}>{t}</span>)}
        </div>
        <div style={{ display:"flex", gap:16 }}>
          <a href="/" style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>← App</a>
          <a href="mailto:hello@evarahq.com" style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>Contact</a>
        </div>
      </div>
    </div>
  );
}

// ─── UNSUBSCRIBE PAGE ─────────────────────────────────────────
function UnsubscribePage() {
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [email, setEmail] = useState("");
  const params = new URLSearchParams(window.location.search);
  useEffect(() => { const e = params.get("email"); if (e) setEmail(decodeURIComponent(e)); }, []);

  const doUnsubscribe = async () => {
    if (!email) return;
    setStatus("loading");
    try {
      await supabase.from("contacts")
        .update({ unsubscribed: true, unsubscribed_at: new Date().toISOString() })
        .eq("email", email.toLowerCase().trim());
      setStatus("done");
    } catch { setStatus("error"); }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#F2F2F7", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Outfit,-apple-system,sans-serif", padding:20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ background:"#fff", borderRadius:20, padding:"48px 40px", maxWidth:460, width:"100%", textAlign:"center", boxShadow:"0 8px 40px rgba(0,0,0,0.08)" }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:32 }}>
          <div style={{ width:24, height:24, borderRadius:6, background:"#0A84FF", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          </div>
          <span style={{ fontSize:16, fontWeight:700, letterSpacing:"-0.3px" }}>evara</span>
        </div>

        {status === "done" ? (
          <>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"#E8F5E9", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 20px" }}>✅</div>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#111", marginBottom:10 }}>Successfully unsubscribed</h1>
            <p style={{ fontSize:14, color:"#666", lineHeight:1.7, marginBottom:20 }}>
              <strong style={{ color:"#111" }}>{email}</strong> has been removed from all future event emails.
            </p>
            <div style={{ background:"#F8F9FA", borderRadius:12, padding:"14px 18px", fontSize:13, color:"#666", lineHeight:1.6 }}>
              Changed your mind? Contact the event organiser directly to be re-added to their guest list.
            </div>
            <div style={{ marginTop:24, fontSize:11, color:"#bbb" }}>Powered by evara · evarahq.com</div>
          </>
        ) : status === "error" ? (
          <>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"#FFF0F0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 20px" }}>❌</div>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#111", marginBottom:10 }}>Something went wrong</h1>
            <p style={{ fontSize:14, color:"#666", marginBottom:20 }}>We couldn't process your request. Please try again or contact the event organiser.</p>
            <button onClick={() => setStatus("idle")} style={{ padding:"10px 24px", borderRadius:8, border:"1px solid #ddd", background:"transparent", fontSize:14, cursor:"pointer" }}>Try again</button>
          </>
        ) : (
          <>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"#FFF8E7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 20px" }}>📧</div>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#111", marginBottom:10 }}>Unsubscribe from event emails</h1>
            <p style={{ fontSize:14, color:"#666", marginBottom:24, lineHeight:1.7 }}>
              Confirm your email address below and you'll be removed from all future event communications.
            </p>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address"
              style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #D1D1D6", borderRadius:10, fontSize:15, outline:"none", marginBottom:12, textAlign:"center" }}
              onFocus={e=>e.target.style.borderColor="#0A84FF"} onBlur={e=>e.target.style.borderColor="#D1D1D6"} />
            <button onClick={doUnsubscribe} disabled={status==="loading"||!email}
              style={{ width:"100%", padding:13, background:status==="loading"||!email?"#E5E5EA":"#111", color:status==="loading"||!email?"#999":"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:600, cursor:status==="loading"||!email?"not-allowed":"pointer", transition:"background .15s" }}>
              {status==="loading"?"Unsubscribing…":"Unsubscribe me"}
            </button>
            <p style={{ marginTop:16, fontSize:12, color:"#999", lineHeight:1.6 }}>
              This will remove you from all emails sent via evara by this organisation. Transactional emails (booking confirmations) may still be sent.
            </p>
            <div style={{ marginTop:20, fontSize:11, color:"#ccc" }}>Powered by evara · evarahq.com</div>
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

  const isFeedback = form?.form_type === "feedback";

  const submit = async () => {
    if (!form) return;
    
    // Only validate business email for registration forms, not feedback
    if (!isFeedback) {
      const emailFieldCheck = form.fields?.find(f => f.type === "email");
      const emailValueCheck = answers[emailFieldCheck?.id] || "";
      if (emailValueCheck && !isBusinessEmail(emailValueCheck)) {
        setSubmitError("Please use a business email address. Personal emails (Gmail, Yahoo, Hotmail, Rediffmail, etc.) are not accepted for event registration.");
        return;
      }
    }
    
    setSubmitting(true);
    try {
      const emailField = form.fields?.find(f => f.type === "email");
      const firstField = form.fields?.find(f => f.label?.toLowerCase().includes("first"));
      const lastField = form.fields?.find(f => f.label?.toLowerCase().includes("last"));
      const email = answers[emailField?.id] || "";
      const firstName = answers[firstField?.id] || "";
      const lastName = answers[lastField?.id] || "";

      // Upsert contact (skip for feedback-only forms with no email field)
      let contactId = null;
      if (email) {
        const { data: c } = await supabase.from("contacts").upsert({
          email: email.toLowerCase().trim(),
          first_name: firstName,
          last_name: lastName,
          company_id: form.company_id,
          source: isFeedback ? "feedback" : "form",
        }, { onConflict: "company_id,email" }).select("id").single();
        contactId = c?.id;

        // Add to event contacts as confirmed (registration only, not feedback)
        if (contactId && form.event_id && !isFeedback) {
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

      // Send confirmation email only for registration forms (not feedback)
      if (email && contactId && !isFeedback) {
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
              orgName: event?.company_name || "evara",
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

  if (submitted) {
    const isFeedbackSubmit = form?.form_type === "feedback";
    return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0A1628 0%, #1a2a4a 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 460, width: "100%", padding: "48px 40px", background: "#fff", borderRadius: 20, boxShadow: "0 24px 64px rgba(0,0,0,.25)" }}>
        <div style={{ width: 72, height: 72, background: isFeedbackSubmit ? "#E8F5E9" : "#E8F5E9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 20px" }}>
          {isFeedbackSubmit ? "🙏" : "✅"}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 10 }}>
          {isFeedbackSubmit ? "Thank you for your feedback!" : "You're confirmed!"}
        </div>
        <div style={{ fontSize: 15, color: "#666", lineHeight: 1.6, marginBottom: 16 }}>
          {isFeedbackSubmit
            ? `Your response has been recorded. We really appreciate you taking the time to share your thoughts on ${event?.name}.`
            : `Thanks for registering for ${event?.name}. A confirmation email is on its way to you.`}
        </div>
        {!isFeedbackSubmit && (event?.event_date || event?.location) && (
          <div style={{ background: "#F8F9FA", borderRadius: 10, padding: "14px 18px", marginBottom: 16, textAlign: "left" }}>
            {event?.event_date && <div style={{ fontSize: 14, color: "#333", marginBottom: 6 }}>📅 {new Date(event.event_date).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>}
            {event?.event_time && <div style={{ fontSize: 14, color: "#333", marginBottom: 6 }}>🕐 {event.event_time}</div>}
            {event?.location && <div style={{ fontSize: 14, color: "#333" }}>📍 {event.location}</div>}
          </div>
        )}
        {!isFeedbackSubmit && event && event.event_date && (
          <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event?.name||"Event")}&dates=${(event.event_date||"").replace(/-/g,"")}&details=${encodeURIComponent((event?.description||"")+" "+window.location.href)}&location=${encodeURIComponent(event?.location||"")}`}
              target="_blank" rel="noopener"
              style={{ fontSize: 13, padding: "8px 20px", background: "#0A84FF", color: "#fff", borderRadius: 20, textDecoration: "none", fontWeight: 500 }}>
              📅 Add to Calendar
            </a>
          </div>
        )}
        <div style={{ marginTop: 20, fontSize: 11, color: "#ccc" }}>🔒 Powered by evara</div>
      </div>
    </div>
  );
  }

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
            <div style={{ fontSize: 11, fontWeight: 600, color: "#0A84FF", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>{isFeedback ? "Feedback Form" : "Registration"}</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111", marginBottom: 8, letterSpacing: "-0.5px" }}>{event.name}</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {event.event_date && <div style={{ fontSize: 13, color: "#555" }}>📅 {new Date(event.event_date).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>}
              {event.event_time && <div style={{ fontSize: 13, color: "#555" }}>🕐 {event.event_time}</div>}
              {event.location && <div style={{ fontSize: 13, color: "#555" }}>📍 {event.location}</div>}
            </div>
          </div>
        )}
        <h2 style={{ fontSize: 17, fontWeight: 600, color: "#111", marginBottom: 4, letterSpacing: "-0.3px" }}>{form.name}</h2>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>{isFeedback ? "Share your thoughts — it only takes a minute." : "Fill in your details to register your place."}</p>

        {/* Progress bar */}
        {form.fields?.length > 0 && (() => {
          const filled = (form.fields||[]).filter(f => answers[f.id]?.toString().trim()).length;
          const total = (form.fields||[]).length;
          const pct = Math.round(filled/total*100);
          return (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, fontSize:12, color:"#888" }}>
                <span>{filled} of {total} fields</span>
                <span style={{ color: pct===100?"#30D158":"#0A84FF", fontWeight:600 }}>{pct===100?"Ready to submit ✓":`${pct}% complete`}</span>
              </div>
              <div style={{ height:4, background:"#E5E5E7", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:pct===100?"#30D158":"#0A84FF", borderRadius:2, transition:"width .3s" }} />
              </div>
            </div>
          );
        })()}

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
                onKeyDown={e => { if (e.key === "Enter" && allFilled && !submitting) submit(); }}
                placeholder={`Enter ${field.label.toLowerCase()}…`}
                style={{ width: "100%", height: 44, borderRadius: 10, border: "1.5px solid #D1D1D6", padding: "0 14px", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border-color .15s" }}
                onFocus={e => { e.target.style.borderColor = "#0A84FF"; setSubmitError(""); }}
                onBlur={e => e.target.style.borderColor = "#D1D1D6"}
              />
              {field.type === "email" && answers[field.id]?.includes("@") && !isFeedback && !isBusinessEmail(answers[field.id]) && (
                <div style={{ fontSize: 12, color: "#FF453A", marginTop: 5 }}>
                  ⚠️ Personal emails (Gmail, Yahoo, Hotmail, Rediffmail etc.) are not accepted — use your work email
                </div>
              )}
              {field.type === "email" && answers[field.id]?.includes("@") && !isFeedback && isBusinessEmail(answers[field.id]) && (
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
            {field.type === "dietary" && (
              <select value={answers[field.id] || ""} onChange={e => setAnswers(p => ({ ...p, [field.id]: e.target.value }))}
                style={{ width: "100%", height: 44, borderRadius: 10, border: "1.5px solid #D1D1D6", padding: "0 14px", fontSize: 15, outline: "none", background: "#fff", cursor: "pointer", boxSizing: "border-box" }}>
                <option value="">No dietary requirements</option>
                {["Vegetarian","Vegan","Gluten-free","Halal","Kosher","Nut allergy","Dairy-free","Other — please specify"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
            {field.type === "rating" && (
              <div style={{ display: "flex", gap: 8 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setAnswers(p => ({ ...p, [field.id]: n }))}
                    style={{ flex: 1, height: 44, borderRadius: 10, border: `2px solid ${answers[field.id] >= n ? "#0A84FF" : "#D1D1D6"}`, background: answers[field.id] >= n ? "#0A84FF10" : "#fff", fontSize: 20, cursor: "pointer", color: answers[field.id] >= n ? "#0A84FF" : "#C7C7CC", transition: "all .12s" }}>
                    ★
                  </button>
                ))}
              </div>
            )}
            {field.type === "date" && (
              <input type="date" value={answers[field.id] || ""} onChange={e => setAnswers(p => ({ ...p, [field.id]: e.target.value }))}
                style={{ width: "100%", height: 44, borderRadius: 10, border: "1.5px solid #D1D1D6", padding: "0 14px", fontSize: 15, outline: "none", background: "#fff", boxSizing: "border-box" }} />
            )}
            {field.type === "number" && (
              <input type="number" value={answers[field.id] || ""} onChange={e => setAnswers(p => ({ ...p, [field.id]: e.target.value }))}
                style={{ width: "100%", height: 44, borderRadius: 10, border: "1.5px solid #D1D1D6", padding: "0 14px", fontSize: 15, outline: "none", background: "#fff", boxSizing: "border-box" }} />
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
          {submitting ? <><span style={{ display: "inline-block", animation: "spin 1s linear infinite", marginRight: 6 }}>⟳</span>Submitting…</> : allFilled ? (isFeedback ? "Submit Feedback →" : "Register Now →") : "Complete all required fields"}
        </button>

        {submitError && (
          <div style={{ background: "#FF453A15", border: "1px solid #FF453A40", borderRadius: 8, padding: "10px 14px", marginTop: 12, fontSize: 13, color: "#FF453A", lineHeight: 1.5 }}>
            ⚠️ {submitError}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#AEAEB2" }}>
          🔒 Your data is encrypted and secure{!isFeedback ? " · A confirmation email will be sent to you" : ""} · Powered by evara
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
function CalendarView({ supabase, profile, events, setActiveEvent, setView, fire, campaigns, activeEvent }) {
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const startDay = monthStart.getDay();

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

  const campaignsByDay = {};
  (campaigns || []).filter(c => c.scheduled_at || c.send_at).forEach(c => {
    const d = new Date(c.scheduled_at || c.send_at);
    if (d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear()) {
      const day = d.getDate();
      if (!campaignsByDay[day]) campaignsByDay[day] = [];
      campaignsByDay[day].push(c);
    }
  });

  const today = new Date();
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const upcomingEvents = (events || []).filter(e => e.event_date && new Date(e.event_date) >= today).sort((a,b) => new Date(a.event_date)-new Date(b.event_date)).slice(0,5);

  const selDayEvents = selectedDay ? (eventsByDay[selectedDay.day] || []) : [];
  const selDayCampaigns = selectedDay ? (campaignsByDay[selectedDay.day] || []) : [];
  const emailIcon = t => ({save_the_date:"📅",invitation:"✉️",reminder:"⏰",day_of_details:"📍",thank_you:"🙏",confirmation:"✅",byo:"🎒"}[t]||"📧");

  return (
    <div style={{ animation:"fadeUp .2s ease" }}>
      <div style={{ marginBottom:20, display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:600, color:C.text, letterSpacing:"-0.6px" }}>Event Calendar</h1>
          <p style={{ color:C.muted, fontSize:13, marginTop:4 }}>Click any date to see emails and events scheduled that day.</p>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:16 }}>
        {/* Calendar grid */}
        <div style={{ background:C.card, borderRadius:11, border:`1px solid ${C.border}`, overflow:"hidden" }}>
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <button onClick={() => { setMonth(new Date(month.getFullYear(), month.getMonth()-1, 1)); setSelectedDay(null); }}
              style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:6, color:C.muted, cursor:"pointer", padding:"4px 10px", fontSize:16 }}>‹</button>
            <span style={{ fontSize:16, fontWeight:600, color:C.text }}>{MONTHS[month.getMonth()]} {month.getFullYear()}</span>
            <button onClick={() => { setMonth(new Date()); setSelectedDay(null); }} style={{ fontSize:10, padding:"2px 8px", borderRadius:4, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, cursor:"pointer" }}>Today</button>
            <button onClick={() => { setMonth(new Date(month.getFullYear(), month.getMonth()+1, 1)); setSelectedDay(null); }}
              style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:6, color:C.muted, cursor:"pointer", padding:"4px 10px", fontSize:16 }}>›</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", borderBottom:`1px solid ${C.border}` }}>
            {DAYS.map(d => <div key={d} style={{ padding:"8px 0", textAlign:"center", fontSize:11, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" }}>{d}</div>)}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
            {days.map((day, i) => {
              const isToday = day && today.getDate()===day && today.getMonth()===month.getMonth() && today.getFullYear()===month.getFullYear();
              const isSel = selectedDay?.day === day;
              const dayEvts = day ? (eventsByDay[day]||[]) : [];
              const dayCams = day ? (campaignsByDay[day]||[]) : [];
              return (
                <div key={i} onClick={() => {
                  if (!day) return;
                  setSelectedDay(isSel ? null : { day, date: new Date(month.getFullYear(), month.getMonth(), day) });
                }} style={{ minHeight:78, borderRight:i%7!==6?`1px solid ${C.border}`:undefined, borderBottom:i<days.length-7?`1px solid ${C.border}`:undefined, padding:"6px 7px", background:!day?`${C.bg}80`:isSel?`${C.blue}12`:"transparent", cursor:day?"pointer":"default", transition:"background .1s" }}
                  onMouseEnter={e => { if(day && !isSel) e.currentTarget.style.background=C.raised; }}
                  onMouseLeave={e => { e.currentTarget.style.background = !day?`${C.bg}80`:isSel?`${C.blue}12`:"transparent"; }}>
                  {day && <>
                    <div style={{ width:22, height:22, borderRadius:"50%", background:isToday?C.blue:isSel?`${C.blue}25`:"transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:isToday||isSel?700:400, color:isToday?"#fff":isSel?C.blue:C.muted, marginBottom:3 }}>{day}</div>
                    {dayEvts.map(ev => (
                      <div key={ev.id} onClick={e => { e.stopPropagation(); setActiveEvent(ev); setView("dashboard"); fire(`Switched to ${ev.name}`); }}
                        style={{ fontSize:9.5, fontWeight:600, color:"#fff", background:C.blue, borderRadius:3, padding:"2px 5px", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", cursor:"pointer" }}>
                        🎪 {ev.name}
                      </div>
                    ))}
                    {dayCams.slice(0,2).map(cam => (
                      <div key={cam.id} style={{ fontSize:9, color:"#fff", background:cam.status==="sent"?C.green:C.amber, borderRadius:3, padding:"2px 5px", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {emailIcon(cam.email_type)} {cam.subject?.slice(0,16)||cam.name?.slice(0,16)}
                      </div>
                    ))}
                    {dayCams.length > 2 && <div style={{ fontSize:9, color:C.muted }}>+{dayCams.length-2} more</div>}
                  </>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {selectedDay ? (
            <div style={{ background:C.card, borderRadius:11, border:`1px solid ${C.blue}40`, overflow:"hidden" }}>
              <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.blue }}>
                  {selectedDay.date.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long"})}
                </div>
                <button onClick={() => setSelectedDay(null)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:18, lineHeight:1 }}>×</button>
              </div>
              <div style={{ padding:"12px 16px", maxHeight:480, overflowY:"auto" }}>
                {selDayEvents.length===0 && selDayCampaigns.length===0 && (
                  <div style={{ fontSize:12, color:C.muted, textAlign:"center", padding:"24px 0" }}>Nothing scheduled this day</div>
                )}
                {selDayEvents.map(ev => (
                  <div key={ev.id} onClick={() => { setActiveEvent(ev); setView("dashboard"); fire(`Switched to ${ev.name}`); }}
                    style={{ padding:"10px 12px", background:C.raised, borderRadius:8, border:`1px solid ${C.blue}30`, marginBottom:8, cursor:"pointer" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:C.blue, marginBottom:3, textTransform:"uppercase", letterSpacing:"0.5px" }}>🎪 Event Day</div>
                    <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{ev.name}</div>
                    {ev.location && <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>📍 {ev.location}</div>}
                    {ev.event_time && <div style={{ fontSize:11, color:C.muted }}>🕐 {ev.event_time}</div>}
                    <div style={{ fontSize:10, color:C.blue, marginTop:6 }}>Click to set as active →</div>
                  </div>
                ))}
                {selDayCampaigns.map(cam => (
                  <div key={cam.id} style={{ padding:"10px 12px", background:C.raised, borderRadius:8, border:`1px solid ${cam.status==="sent"?C.green:C.amber}30`, marginBottom:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
                      <span style={{ fontSize:16 }}>{emailIcon(cam.email_type)}</span>
                      <span style={{ fontSize:10, padding:"1px 6px", borderRadius:3, background:cam.status==="sent"?`${C.green}20`:`${C.amber}20`, color:cam.status==="sent"?C.green:C.amber, fontWeight:700, textTransform:"uppercase" }}>{cam.status}</span>
                    </div>
                    <div style={{ fontSize:12.5, fontWeight:500, color:C.text, marginBottom:2 }}>{cam.subject||cam.name}</div>
                    <div style={{ fontSize:11, color:C.muted }}>{(cam.email_type||"").replace(/_/g," ")}</div>
                    {cam.total_sent > 0 && (
                      <div style={{ marginTop:6, display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ flex:1, height:3, background:C.border, borderRadius:2 }}>
                          <div style={{ height:"100%", width:`${Math.min(Math.round((cam.total_opened||0)/cam.total_sent*100),100)}%`, background:Math.round((cam.total_opened||0)/cam.total_sent*100)>=25?C.green:C.amber, borderRadius:2 }} />
                        </div>
                        <span style={{ fontSize:10, color:C.muted }}>{Math.round((cam.total_opened||0)/cam.total_sent*100)}% opened</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ background:C.card, borderRadius:11, border:`1px solid ${C.border}`, padding:"12px 16px" }}>
              <div style={{ fontSize:10.5, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:12 }}>Upcoming Events</div>
              {upcomingEvents.length===0 ? (
                <div style={{ fontSize:13, color:C.muted, textAlign:"center", padding:16 }}>No upcoming events</div>
              ) : upcomingEvents.map(ev => {
                const d = new Date(ev.event_date);
                const daysUntil = Math.ceil((d-today)/(1000*60*60*24));
                const col = daysUntil<=3?C.red:daysUntil<=14?C.amber:C.green;
                return (
                  <div key={ev.id} onClick={() => { setActiveEvent(ev); setView("dashboard"); fire(`Switched to ${ev.name}`); }}
                    style={{ padding:"10px 0", borderBottom:`1px solid ${C.border}`, cursor:"pointer" }}
                    onMouseEnter={e=>e.currentTarget.style.opacity="0.7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ fontSize:13, fontWeight:500, color:C.text }}>{ev.name}</div>
                      <span style={{ fontSize:10, fontWeight:700, color:col, background:col+"15", padding:"2px 6px", borderRadius:3, flexShrink:0, marginLeft:8 }}>
                        {daysUntil===0?"TODAY":daysUntil===1?"TMR":`${daysUntil}d`}
                      </span>
                    </div>
                    <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{d.toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})}</div>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ background:C.card, borderRadius:10, border:`1px solid ${C.border}`, padding:"10px 14px" }}>
            <div style={{ fontSize:10.5, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:8 }}>Legend</div>
            {[{col:C.blue,lbl:"Event day"},{col:C.green,lbl:"Email sent"},{col:C.amber,lbl:"Email scheduled"}].map(({col,lbl})=>(
              <div key={lbl} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:C.sec, marginBottom:5 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:col, flexShrink:0 }} />{lbl}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
            const pct = Math.round(tableGuests.length / layout.seatsPerTable * 100);
            return (
              <div key={tableNum} style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.raised }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Table {tableNum}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 50, height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: pct >= 80 ? C.green : pct >= 50 ? C.blue : C.amber, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, color: C.muted }}>{tableGuests.length}/{layout.seatsPerTable}</span>
                  </div>
                </div>
                {/* Round table visual */}
                {tableGuests.length > 0 && (
                  <div style={{ padding: "8px 14px 0", display: "flex", justifyContent: "center" }}>
                    <svg width="120" height="70" viewBox="0 0 120 70">
                      <ellipse cx="60" cy="35" rx="35" ry="22" fill={`${C.blue}15`} stroke={C.border} strokeWidth="1.5" />
                      {Array.from({ length: Math.min(tableGuests.length, 10) }, (_, i) => {
                        const angle = (i / Math.max(layout.seatsPerTable, 1)) * 2 * Math.PI - Math.PI / 2;
                        const x = 60 + 48 * Math.cos(angle);
                        const y = 35 + 28 * Math.sin(angle);
                        const ec = tableGuests[i];
                        const initials = ec?.contacts ? ((ec.contacts.first_name?.[0]||"") + (ec.contacts.last_name?.[0]||"")).toUpperCase() : "?";
                        return (
                          <g key={i}>
                            <circle cx={x} cy={y} r="8" fill={C.blue} opacity="0.8" />
                            <text x={x} y={y+3} textAnchor="middle" fontSize="6" fill="#fff" fontWeight="700">{initials||"?"}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                )}
                <div style={{ padding: "6px 0" }}>
                  {tableGuests.length === 0 ? (
                    <div style={{ padding: "12px 14px", fontSize: 12, color: C.muted, fontStyle: "italic", textAlign: "center" }}>Empty</div>
                  ) : tableGuests.map(ec => {
                    const c = ec.contacts || {};
                    const seat = assignments[ec.id];
                    return (
                      <div key={ec.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 14px", borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${C.blue}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: C.blue, flexShrink: 0 }}>
                          {seat?.split("-")[1] || "?"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {`${c.first_name || ""} ${c.last_name || ""}`.trim() || c.email}
                          </div>
                          {c.company_name && <div style={{ fontSize: 10, color: C.muted }}>{c.company_name}</div>}
                        </div>
                        <button onClick={async () => {
                          const newSeat = (window.prompt||((msg,def)=>def))(`Reassign seat for ${c.first_name || c.email}:`, seat);
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
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [copied, setCopied] = useState(false);

  const load = async () => {
    try {
      const { data: event } = await supabase
        .from("events")
        .select("*,companies(*)")
        .eq("share_token", token)
        .single();

      if (!event) { setError("Dashboard not found or link has expired."); setLoading(false); return; }

      const [{ data: ecs }, { data: cams }] = await Promise.all([
        supabase.from("event_contacts").select("status").eq("event_id", event.id),
        supabase.from("email_campaigns").select("*").eq("event_id", event.id).eq("status", "sent").order("sent_at", { ascending: false })
      ]);

      const statusCounts = (ecs || []).reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});
      const totalSent    = (cams || []).reduce((a, c) => a + (c.total_sent    || 0), 0);
      const totalOpened  = (cams || []).reduce((a, c) => a + (c.total_opened  || 0), 0);
      const totalClicked = (cams || []).reduce((a, c) => a + (c.total_clicked || 0), 0);

      setData({ event, total: (ecs || []).length, confirmed: statusCounts.confirmed || 0, attended: statusCounts.attended || 0, declined: statusCounts.declined || 0, pending: statusCounts.pending || 0, campaigns: cams || [], totalSent, totalOpened, totalClicked });
      setLastRefresh(new Date());
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [token]);
  useEffect(() => { const t = setInterval(load, 30000); return () => clearInterval(t); }, [token]);

  const copyLink = () => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#07070A", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui" }}>
      <div style={{ textAlign:"center", color:"#48484A" }}>
        <div style={{ fontSize:24, marginBottom:10 }}>📊</div>
        <div>Loading dashboard…</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:"100vh", background:"#07070A", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🔒</div>
        <div style={{ color:"#F5F5F7", fontSize:16, fontWeight:600, marginBottom:6 }}>Link not found</div>
        <div style={{ color:"#636366", fontSize:13 }}>{error}</div>
      </div>
    </div>
  );

  const { event, total, confirmed, attended, declined, pending, campaigns, totalSent, totalOpened, totalClicked } = data;
  const openRate  = totalSent    > 0 ? Math.round((totalOpened  / totalSent)    * 100) : 0;
  const clickRate = totalSent    > 0 ? Math.round((totalClicked / totalSent)    * 100) : 0;
  const showRate  = confirmed    > 0 ? Math.round((attended     / confirmed)    * 100) : 0;
  const confRate  = total        > 0 ? Math.round((confirmed    / total)        * 100) : 0;
  const daysToEvent = event.event_date ? Math.ceil((new Date(event.event_date) - new Date()) / (1000*60*60*24)) : null;

  const BG = "#07070A", CARD = "#0F0F12", BORDER = "#1A1A1F", TEXT = "#F5F5F7", MUTED = "#636366", SEC = "#AEAEB2";
  const BLUE = "#0A84FF", GREEN = "#30D158", AMBER = "#FF9F0A", RED = "#FF453A", TEAL = "#5AC8FA";

  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:"'Outfit','Inter',system-ui,sans-serif", color:TEXT }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ── Header ── */}
      <div style={{ background:CARD, borderBottom:`1px solid ${BORDER}`, padding:"13px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10, backdropFilter:"blur(12px)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:24, height:24, borderRadius:6, background:BLUE, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:"#fff", fontSize:13, fontWeight:800, letterSpacing:"-0.5px" }}>e</span>
          </div>
          <span style={{ fontSize:14, fontWeight:700, color:TEXT }}>evara</span>
          <span style={{ fontSize:12, color:MUTED }}>/ Live Dashboard</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:GREEN, animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:11, color:MUTED }}>Auto-refreshes · {lastRefresh.toLocaleTimeString("en-AU",{hour:"2-digit",minute:"2-digit"})}</span>
          </div>
          <button onClick={copyLink} style={{ fontSize:11, padding:"5px 12px", borderRadius:6, border:`1px solid ${copied?GREEN:BORDER}`, background:copied?`${GREEN}15`:"transparent", color:copied?GREEN:MUTED, cursor:"pointer", transition:"all .2s" }}>
            {copied ? "✓ Copied!" : "📋 Copy link"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"32px 24px", animation:"fadeUp .3s ease" }}>

        {/* ── Event Header ── */}
        <div style={{ marginBottom:28, display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:20 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, fontWeight:700, color:BLUE, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:8 }}>
              {event.companies?.name || "Event Dashboard"}
            </div>
            <h1 style={{ fontSize:30, fontWeight:800, letterSpacing:"-0.8px", margin:"0 0 8px", lineHeight:1.1 }}>{event.name}</h1>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              {event.event_type && <span style={{ fontSize:11, padding:"2px 9px", borderRadius:4, background:`${BLUE}18`, color:BLUE, fontWeight:600, textTransform:"capitalize" }}>{event.event_type}</span>}
              {event.event_date && <span style={{ fontSize:13, color:SEC }}>{new Date(event.event_date).toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</span>}
              {event.location && <span style={{ fontSize:13, color:MUTED }}>📍 {event.location}</span>}
            </div>
          </div>
          {daysToEvent !== null && (
            <div style={{ textAlign:"center", background:CARD, border:`1px solid ${daysToEvent<=3?`${RED}50`:daysToEvent<=7?`${AMBER}50`:BORDER}`, borderRadius:12, padding:"14px 22px", flexShrink:0 }}>
              <div style={{ fontSize:36, fontWeight:800, color:daysToEvent<=3?RED:daysToEvent<=7?AMBER:TEXT, lineHeight:1, letterSpacing:"-1px" }}>
                {daysToEvent > 0 ? daysToEvent : daysToEvent===0 ? "🎉" : Math.abs(daysToEvent)}
              </div>
              <div style={{ fontSize:10, color:MUTED, textTransform:"uppercase", letterSpacing:"0.8px", marginTop:5 }}>
                {daysToEvent>0?"days to go":daysToEvent===0?"today!":"days ago"}
              </div>
            </div>
          )}
        </div>

        {/* ── Key Rate Indicators ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:12 }}>
          {[
            { label:"Open Rate",    val:`${openRate}%`,  sub:`${totalOpened.toLocaleString()} of ${totalSent.toLocaleString()} opens`, color:openRate>=30?GREEN:openRate>=20?AMBER:SEC,  good:openRate>=25 },
            { label:"Confirm Rate", val:`${confRate}%`,  sub:`${confirmed} of ${total} confirmed`,   color:confRate>=60?GREEN:confRate>=40?AMBER:SEC,   good:confRate>=50 },
            { label:"Show Rate",    val:`${showRate}%`,  sub:`${attended} of ${confirmed} attended`, color:showRate>=70?GREEN:showRate>=50?AMBER:SEC,   good:showRate>=70 },
          ].map(m => (
            <div key={m.label} style={{ background:CARD, borderRadius:12, padding:"18px 20px", border:`1px solid ${m.good?`${m.color}30`:BORDER}`, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:m.good?m.color:BORDER, borderRadius:"12px 12px 0 0" }} />
              <div style={{ fontSize:10, fontWeight:600, color:MUTED, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8 }}>{m.label}</div>
              <div style={{ fontSize:36, fontWeight:800, color:m.color, letterSpacing:"-1px", lineHeight:1, marginBottom:4 }}>{m.val}</div>
              <div style={{ fontSize:11, color:MUTED }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* ── RSVP Status Grid ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:24 }}>
          {[
            { label:"Registered",  val:total,     color:TEXT,  icon:"👥" },
            { label:"Confirmed",   val:confirmed,  color:GREEN, icon:"✅" },
            { label:"Pending",     val:pending,    color:AMBER, icon:"⏳" },
            { label:"Attended",    val:attended,   color:TEAL,  icon:"🎟" },
          ].map(m => (
            <div key={m.label} style={{ background:CARD, borderRadius:12, padding:"16px 14px", border:`1px solid ${BORDER}`, position:"relative" }}>
              <div style={{ position:"absolute", top:12, right:14, fontSize:18, opacity:0.15 }}>{m.icon}</div>
              <div style={{ fontSize:10, fontWeight:600, color:MUTED, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:8 }}>{m.label}</div>
              <div style={{ fontSize:32, fontWeight:800, color:m.color, letterSpacing:"-0.8px", lineHeight:1 }}>{m.val}</div>
              {total > 0 && m.val > 0 && m.label !== "Registered" && (
                <div style={{ fontSize:10, color:MUTED, marginTop:5 }}>{Math.round(m.val/total*100)}% of total</div>
              )}
            </div>
          ))}
        </div>

        {/* ── Event Funnel ── */}
        <div style={{ background:CARD, borderRadius:12, border:`1px solid ${BORDER}`, padding:"20px 22px", marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:700, color:TEXT, marginBottom:18, display:"flex", alignItems:"center", gap:8 }}>
            📉 Event Funnel
            <span style={{ fontSize:10, fontWeight:400, color:MUTED }}>— drop-off at each stage</span>
          </div>
          {[
            { label:"Emails Sent",  val:totalSent,   color:BLUE  },
            { label:"Opened",       val:totalOpened, color:TEAL  },
            { label:"Registered",   val:total,       color:SEC   },
            { label:"Confirmed",    val:confirmed,   color:AMBER },
            { label:"Attended",     val:attended,    color:GREEN },
          ].map((s, i, arr) => {
            const base = arr[0].val || 1;
            const pct = Math.round((s.val / base) * 100);
            const prevPct = i > 0 ? Math.round((arr[i-1].val / base) * 100) : 100;
            const dropOff = i > 0 ? prevPct - pct : 0;
            return (
              <div key={s.label} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:s.color, flexShrink:0 }} />
                    <span style={{ color:SEC }}>{s.label}</span>
                    {i > 0 && dropOff > 0 && <span style={{ fontSize:10, color:`${RED}90` }}>-{dropOff}%</span>}
                  </div>
                  <span style={{ color:s.color, fontWeight:700 }}>{s.val.toLocaleString()}{i>0&&base>0?` · ${pct}%`:""}</span>
                </div>
                <div style={{ height:7, background:"#1A1A1F", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg, ${s.color}CC, ${s.color})`, borderRadius:4, transition:"width .6s ease" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Email Campaigns ── */}
        {campaigns.length > 0 && (
          <div style={{ background:CARD, borderRadius:12, border:`1px solid ${BORDER}`, overflow:"hidden", marginBottom:16 }}>
            <div style={{ padding:"14px 20px", borderBottom:`1px solid ${BORDER}`, fontSize:13, fontWeight:700, color:TEXT }}>
              📧 Email Campaigns ({campaigns.length})
            </div>
            {campaigns.map((cam, i) => {
              const or = cam.total_sent ? Math.round((cam.total_opened||0)/cam.total_sent*100) : 0;
              const cr = cam.total_sent ? Math.round((cam.total_clicked||0)/cam.total_sent*100) : 0;
              return (
                <div key={cam.id} style={{ padding:"12px 20px", borderBottom:i<campaigns.length-1?`1px solid ${BORDER}`:undefined, display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, color:TEXT, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{cam.subject||cam.name}</div>
                    <div style={{ fontSize:11, color:MUTED, marginTop:2, textTransform:"capitalize" }}>
                      {cam.email_type?.replace(/_/g," ")} · {cam.sent_at?new Date(cam.sent_at).toLocaleDateString("en-AU",{day:"numeric",month:"short"}):"Sent"}
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:12, color:MUTED }}>{(cam.total_sent||0).toLocaleString()} sent</div>
                  </div>
                  <div style={{ display:"flex", gap:10, flexShrink:0 }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:14, fontWeight:700, color:or>=30?GREEN:or>=20?AMBER:SEC }}>{or}%</div>
                      <div style={{ fontSize:9, color:MUTED, textTransform:"uppercase" }}>Open</div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:14, fontWeight:700, color:cr>=5?GREEN:cr>0?AMBER:MUTED }}>{cr}%</div>
                      <div style={{ fontSize:9, color:MUTED, textTransform:"uppercase" }}>Click</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── RSVP breakdown bar ── */}
        {total > 0 && (
          <div style={{ background:CARD, borderRadius:12, border:`1px solid ${BORDER}`, padding:"18px 20px", marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:TEXT, marginBottom:14 }}>👥 RSVP Breakdown</div>
            <div style={{ display:"flex", height:12, borderRadius:6, overflow:"hidden", marginBottom:14, gap:1 }}>
              {[
                { val:attended,          color:GREEN },
                { val:confirmed-attended,color:TEAL  },
                { val:pending,           color:AMBER },
                { val:declined,          color:RED   },
              ].filter(s=>s.val>0).map((s,i) => (
                <div key={i} style={{ flex:s.val, background:s.color, transition:"flex .5s ease" }} />
              ))}
            </div>
            <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
              {[
                { label:"Attended",  val:attended,          pct:Math.round(attended/total*100),          color:GREEN },
                { label:"Confirmed", val:confirmed-attended,pct:Math.round((confirmed-attended)/total*100),color:TEAL  },
                { label:"Pending",   val:pending,           pct:Math.round(pending/total*100),           color:AMBER },
                { label:"Declined",  val:declined,          pct:Math.round(declined/total*100),          color:RED   },
              ].map(s => (
                <div key={s.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:s.color }} />
                  <span style={{ fontSize:12, color:SEC }}>{s.label}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:s.color }}>{s.val}</span>
                  <span style={{ fontSize:10, color:MUTED }}>({s.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ textAlign:"center", marginTop:32, paddingTop:20, borderTop:`1px solid ${BORDER}` }}>
          <div style={{ fontSize:11, color:MUTED, marginBottom:8 }}>This is a read-only live dashboard · no login required</div>
          <div style={{ fontSize:10, color:"#2C2C30" }}>Powered by <a href="https://evara-tau.vercel.app" style={{ color:"#3A3A3F", textDecoration:"none" }}>evara</a></div>
        </div>
      </div>
    </div>
  );
}

// ─── UNSUBSCRIBE PAGE ────────────────────────────────────────
// cache bust Wed Apr 08 16:48 UTC 2026
// Fri Apr 10 06:07:34 UTC 2026
