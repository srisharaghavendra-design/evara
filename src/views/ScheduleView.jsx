import { useState, useEffect, useRef, useCallback } from "react";
import { EmptySchedule } from "../EventEmptyStates";
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
import {Spin, Alert, Inp, ViewHint, ScoreBadge, ImageUploadZone, EMAIL_TYPES, C} from "../components/Shared";

// ScheduleView
function ScheduleView({ supabase, profile, activeEvent, fire, addNotif, setView }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [sendModal, setSendModal] = useState(null);
  const [previewCam, setPreviewCam] = useState(null); // ← NEW: email preview
  const [autoScheduling, setAutoScheduling] = useState(false);
  const [camSearch, setCamSearch] = useState("");
  const [contactCount, setContactCount] = useState(0);
  const [lpPublished, setLpPublished] = useState(false);
  const [lpUrl, setLpUrl] = useState("");
  const [formActive, setFormActive] = useState(false);
  const [formUrl, setFormUrl] = useState("");
  const [reviewMode, setReviewMode] = useState(true); // show review panel by default
  const [reviewEmailIdx, setReviewEmailIdx] = useState(0); // which email tab in review
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ sent: 0, total: 0 });
  const [newCam, setNewCam] = useState({ email_type: "invitation", send_at: "", segment: "all" });
  const [followUpGenerating, setFollowUpGenerating] = useState(false);
  const [schedPickerCam, setSchedPickerCam] = useState(null); // cam being scheduled via picker
  const [schedPickerVal, setSchedPickerVal] = useState("");
  const [editingSubjectId, setEditingSubjectId] = useState(null); // cam id being edited inline
  const [editingSubjectVal, setEditingSubjectVal] = useState("");
  const [aiSubjectLoading, setAiSubjectLoading] = useState(null); // cam id loading AI subjects
  const [aiSubjectOptions, setAiSubjectOptions] = useState({}); // camId → [subjects]
  const [showInlineContacts, setShowInlineContacts] = useState(false);
  const [inlineImportText, setInlineImportText] = useState("");
  const [inlineImporting, setInlineImporting] = useState(false);
  const inlineFileRef = useRef(null);
  const [eventContactsList, setEventContactsList] = useState([]);
  const [contactsListLoading, setContactsListLoading] = useState(false);
  const [contactTab, setContactTab] = useState("import"); // "import" | "pool"
  const [contactPool, setContactPool] = useState([]);
  const [poolSearch, setPoolSearch] = useState("");
  const [poolLoading, setPoolLoading] = useState(false);
  const [addingFromPool, setAddingFromPool] = useState(false);

  const saveSubject = async (camId, newSubject) => {
    if (!newSubject.trim()) return;
    await supabase.from("email_campaigns").update({ subject: newSubject.trim() }).eq("id", camId);
    setCampaigns(p => p.map(c => c.id === camId ? { ...c, subject: newSubject.trim() } : c));
    setEditingSubjectId(null);
    fire("✅ Subject updated");
  };

  const generateAiSubjects = async (cam) => {
    setAiSubjectLoading(cam.id);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": ANON_KEY },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 300,
          messages: [{ role: "user", content: `Generate 4 alternative email subject lines for this event email. Make each one different in style (curiosity, urgency, benefit, question). Keep each under 50 chars.\n\nEmail type: ${cam.email_type?.replace(/_/g," ")}\nEvent: ${activeEvent?.name}\nCurrent subject: "${cam.subject}"\n\nReturn ONLY a JSON array of 4 strings, no markdown.` }]
        })
      });
      const d = await res.json();
      const text = d.content?.[0]?.text || "[]";
      const options = JSON.parse(text.replace(/```json|```/g,"").trim());
      setAiSubjectOptions(p => ({ ...p, [cam.id]: options }));
    } catch(e) { fire("Subject generation failed","err"); }
    setAiSubjectLoading(null);
  };

  const doInlineImport = async (text) => {
    if (!activeEvent || !profile) return;
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const contacts = [];
    for (const line of lines) {
      // Support: email, "First Last, email@x.com", CSV with email column
      const parts = line.split(",").map(s => s.trim());
      let email = "", first = "", last = "";
      for (const p of parts) {
        if (p.includes("@")) { email = p.toLowerCase(); }
        else if (!first) first = p;
        else last = p;
      }
      if (!email) continue;
      contacts.push({ email, first_name: first || null, last_name: last || null });
    }
    if (!contacts.length) { fire("No valid emails found", "err"); return; }
    setInlineImporting(true);
    let added = 0;
    for (const c of contacts) {
      // Upsert contact
      const { data: existing } = await supabase.from("contacts")
        .select("id").eq("email", c.email).eq("company_id", profile.company_id).single();
      let contactId = existing?.id;
      if (!contactId) {
        const { data: created } = await supabase.from("contacts").insert({
          email: c.email, first_name: c.first_name, last_name: c.last_name,
          company_id: profile.company_id, status: "active"
        }).select("id").single();
        contactId = created?.id;
      }
      if (!contactId) continue;
      // Link to event
      await supabase.from("event_contacts").upsert({
        event_id: activeEvent.id, contact_id: contactId, status: "pending"
      }, { onConflict: "event_id,contact_id" });
      added++;
    }
    // Refresh count
    const { count } = await supabase.from("event_contacts")
      .select("id", { count: "exact", head: true }).eq("event_id", activeEvent.id);
    setContactCount(count || 0);
    setInlineImporting(false);
    setInlineImportText("");
    setShowInlineContacts(false);
    fire(`✅ ${added} contacts imported`);
    loadEventContacts(); // refresh list
  };

  const loadEventContacts = async () => {
    if (!activeEvent) return;
    setContactsListLoading(true);
    const { data } = await supabase.from("event_contacts")
      .select("id,status,contacts(id,first_name,last_name,email)")
      .eq("event_id", activeEvent.id)
      .order("created_at", { ascending: false });
    setEventContactsList(data || []);
    setContactsListLoading(false);
  };

  const loadContactPool = async () => {
    if (!activeEvent || !profile) return;
    setPoolLoading(true);
    // Load company contacts not already in this event
    const { data: evContacts } = await supabase.from("event_contacts").select("contact_id").eq("event_id", activeEvent.id);
    const usedIds = new Set((evContacts || []).map(ec => ec.contact_id));
    const { data: allContacts } = await supabase.from("contacts")
      .select("id,first_name,last_name,email,company_name")
      .eq("company_id", profile.company_id)
      .eq("unsubscribed", false)
      .order("first_name");
    setContactPool((allContacts || []).filter(c => !usedIds.has(c.id)));
    setPoolLoading(false);
  };

  const addFromPool = async (contactIds) => {
    if (!activeEvent || !contactIds.length) return;
    setAddingFromPool(true);
    for (const id of contactIds) {
      await supabase.from("event_contacts").upsert({ event_id: activeEvent.id, contact_id: id, status: "pending" }, { onConflict: "event_id,contact_id" });
    }
    const { count } = await supabase.from("event_contacts").select("*", { count: "exact" }).eq("event_id", activeEvent.id);
    setContactCount(count || 0);
    await loadContactPool();
    fire(`✅ ${contactIds.length} contact${contactIds.length !== 1 ? "s" : ""} added to this event`);
    setAddingFromPool(false);
  };

  const removeEventContact = async (ecId) => {
    await supabase.from("event_contacts").delete().eq("id", ecId);
    setEventContactsList(p => p.filter(ec => ec.id !== ecId));
    setContactCount(p => Math.max(0, p - 1));
  };

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

  const [segmentCounts, setSegmentCounts] = useState({ all:0, confirmed:0, pending:0, declined:0, attended:0 });

  // Load contact list whenever the panel opens
  useEffect(() => {
    if (showInlineContacts) loadEventContacts();
  }, [showInlineContacts, activeEvent]);

  useEffect(() => {
    if (!activeEvent || !profile) return;
    supabase.from("email_campaigns").select("*").eq("event_id", activeEvent.id)
      .order("scheduled_at", { ascending: true, nullsFirst: false })
      .then(({ data }) => { setCampaigns(data || []); setLoading(false); });
    // Load all segment counts in one query
    supabase.from("event_contacts").select("status").eq("event_id", activeEvent.id)
      .then(({ data }) => {
        const counts = { all: 0, confirmed: 0, pending: 0, declined: 0, attended: 0 };
        (data || []).forEach(ec => { counts.all++; if (counts[ec.status] !== undefined) counts[ec.status]++; });
        setContactCount(counts.all);
        setSegmentCounts(counts);
      });
    supabase.from("landing_pages").select("is_published,slug").eq("event_id", activeEvent.id).eq("page_type","event").maybeSingle()
      .then(({ data }) => { setLpPublished(!!data?.is_published); if (data?.slug && data?.is_published) setLpUrl(`${window.location.origin}/page/${data.slug}`); });
    supabase.from("forms").select("is_active,share_token").eq("event_id", activeEvent.id).eq("is_active", true).limit(1).maybeSingle()
      .then(({ data }) => { setFormActive(!!data); if (data?.share_token) setFormUrl(`${window.location.origin}/form/${data.share_token}`); });
  }, [activeEvent, profile]);

  const openSendModal = async (cam) => {
    let q = supabase.from("event_contacts").select("id,contacts(id,first_name,last_name,email,tags,unsubscribed)", { count: "exact" }).eq("event_id", activeEvent.id);
    if (cam.segment === "confirmed") q = q.eq("status", "confirmed");
    else if (cam.segment === "pending") q = q.eq("status", "pending");
    else if (cam.segment === "declined") q = q.eq("status", "declined");
    else if (cam.segment === "attended") q = q.eq("status", "attended");
    else q = q.neq("status", "declined"); // "all" = everyone except declined
    const { data: rawData, count } = await q;
    // VIP filter: contacts with vip tag
    const data = cam.segment === "vip"
      ? (rawData || []).filter(r => (r.contacts?.tags || []).includes("vip"))
      : rawData;
    // Filter out unsubscribed
    const eligible = (data || []).filter(r => !r.contacts?.unsubscribed && r.contacts?.email);
    setSendModal({ ...cam, recipients: eligible, recipientCount: eligible.length });
  };

  const sendNow = async () => {
    if (!sendModal || !profile) return;
    setSending(true);
    setSendProgress({ sent: 0, total: sendModal?.recipients?.length || 0 });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const contacts = sendModal.recipients.map(ec => ({ id: ec.contacts?.id, email: ec.contacts?.email, first_name: ec.contacts?.first_name || "", last_name: ec.contacts?.last_name || "" })).filter(c => c.email);
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
    const { data } = await supabase.from("email_campaigns").insert({ event_id: activeEvent.id, company_id: profile.company_id, name: `${newCam.email_type.replace(/_/g, " ")} — ${activeEvent.name}`, email_type: newCam.email_type, send_at: newCam.send_at || null, scheduled_at: newCam.send_at || null, segment: newCam.segment, status: newCam.send_at ? "scheduled" : "draft" }).select().single();
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

  // Ready-to-send checklist
  const hasEmailDraft = campaigns.some(c => c.html_content);
  const approvedEmails = campaigns.filter(c => (c.status === "approved" || c.status === "sent") && c.html_content);
  const hasApprovedEmails = approvedEmails.length > 0;
  const hasContacts = contactCount > 0;
  const readyChecks = [
    { label: "Emails drafted", done: hasEmailDraft, action: "Go to Emails view", actionId: null },
    { label: lpPublished ? "Landing page live" : "Landing page not published", done: lpPublished, action: "Go to Landing Page", actionId: null },
    { label: formActive ? "Form active" : "Form not active", done: formActive, action: "Go to Form", actionId: null },
    { label: `Contacts added (${contactCount})`, done: hasContacts, action: "Add contacts below", actionId: "contacts", onClick: () => setShowInlineContacts(true) },
  ];
  const allReady = readyChecks.every(c => c.done);

  const TYPE_LABEL = { save_the_date:"📅 Save the Date", invitation:"✉️ Invite", reminder:"⏰ Reminder", reminder_week:"⏰ Reminder", reminder_day:"🌅 Day Before", confirmation:"✅ Confirmation", byo:"🎒 BYO Details", thank_you:"🙏 Thank You" };

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>

      {/* ── STATUS PILLS ── */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {[
          { ok: hasApprovedEmails, label: `${approvedEmails.length} email${approvedEmails.length!==1?"s":""} approved`, onClick: () => setView("edm") },
          { ok: lpPublished, label: `Landing page ${lpPublished?"live":"not approved"}`, link: lpUrl, onClick: () => setView("landing") },
          { ok: formActive, label: `Form ${formActive?"active":"inactive"}`, link: formUrl, onClick: () => setView("landing") },
          { ok: hasContacts, label: `${contactCount} contact${contactCount!==1?"s":""}`, onClick: () => setShowInlineContacts(p=>!p) },
        ].map((p,i) => (
          <div key={i} onClick={p.onClick} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 12px", background:p.ok?`${C.green}12`:C.raised, border:`1px solid ${p.ok?C.green+"40":C.border}`, borderRadius:20, fontSize:12, cursor:"pointer" }}>
            <span>{p.ok?"✅":"○"}</span>
            <span style={{ color:p.ok?C.green:C.muted, fontWeight:500 }}>{p.label}</span>
            {p.link && <a href={p.link} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{ fontSize:10, color:C.blue, textDecoration:"none" }}>View ↗</a>}
          </div>
        ))}
      </div>

      {/* ── CONTACTS PANEL ── */}
      {(!hasContacts || showInlineContacts) && (
        <div style={{ marginBottom:20, background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 18px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ fontSize:14, fontWeight:600, color:C.text }}>👥 {hasContacts ? `${contactCount} contacts · manage list` : "Add contacts to send emails"}</div>
            {hasContacts && showInlineContacts && <button onClick={() => setShowInlineContacts(false)} style={{ fontSize:11, color:C.muted, background:"none", border:"none", cursor:"pointer" }}>✕ Close</button>}
          </div>
          {/* Tabs */}
          <div style={{ display:"flex", gap:0, marginBottom:12, background:C.raised, borderRadius:8, padding:3, alignSelf:"flex-start", width:"fit-content" }}>
            {["import","pool"].map(t => (
              <button key={t} onClick={() => { setContactTab(t); if(t==="pool") loadContactPool(); }}
                style={{ padding:"5px 14px", borderRadius:6, border:"none", background:contactTab===t?C.blue:"transparent", color:contactTab===t?"#fff":C.muted, fontSize:12, fontWeight:contactTab===t?600:400, cursor:"pointer" }}>
                {t==="import"?"Paste / Upload":"From Contact Pool"}
              </button>
            ))}
          </div>
          {contactTab === "import" ? (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <textarea value={inlineImportText} onChange={e => setInlineImportText(e.target.value)}
                placeholder="Paste emails or CSV: john@company.com or First Last, email@company.com"
                rows={4} style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"10px 12px", fontSize:12.5, outline:"none", resize:"vertical", lineHeight:1.5, boxSizing:"border-box" }} />
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => inlineFileRef.current?.click()} style={{ padding:"8px 16px", borderRadius:7, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, fontSize:12, cursor:"pointer" }}>📎 Upload CSV</button>
                <input ref={inlineFileRef} type="file" accept=".csv,.txt" style={{ display:"none" }} onChange={async e => {
                  const file = e.target.files?.[0]; if (!file) return;
                  const text = await file.text(); setInlineImportText(text);
                }} />
                <button onClick={() => doInlineImport(inlineImportText)} disabled={!inlineImportText.trim() || inlineImporting}
                  style={{ flex:1, padding:"8px 16px", borderRadius:7, border:"none", background:C.blue, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                  {inlineImporting ? "Importing…" : "Import →"}
                </button>
              </div>
              {eventContactsList.length > 0 && (
                <div style={{ maxHeight:160, overflowY:"auto", border:`1px solid ${C.border}`, borderRadius:8, marginTop:4 }}>
                  {eventContactsList.map(ec => (
                    <div key={ec.id} style={{ display:"flex", alignItems:"center", padding:"7px 12px", borderBottom:`1px solid ${C.border}`, fontSize:12 }}>
                      <span style={{ flex:1, color:C.text }}>{ec.contacts?.first_name} {ec.contacts?.last_name} <span style={{ color:C.muted }}>· {ec.contacts?.email}</span></span>
                      <button onClick={() => removeEventContact(ec.id)} style={{ background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:13 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <input value={poolSearch} onChange={e => setPoolSearch(e.target.value)} placeholder="Search contacts…"
                style={{ width:"100%", marginBottom:8, background:C.bg, border:`1px solid ${C.border}`, borderRadius:7, color:C.text, padding:"7px 10px", fontSize:12, outline:"none", boxSizing:"border-box" }} />
              <div style={{ maxHeight:200, overflowY:"auto", border:`1px solid ${C.border}`, borderRadius:8 }}>
                {poolLoading ? <div style={{ padding:16, color:C.muted, fontSize:12 }}>Loading…</div> :
                  contactPool.filter(c => !poolSearch || `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(poolSearch.toLowerCase())).map(c => (
                    <div key={c.id} style={{ display:"flex", alignItems:"center", padding:"7px 12px", borderBottom:`1px solid ${C.border}`, fontSize:12 }}>
                      <span style={{ flex:1, color:C.text }}>{c.first_name} {c.last_name} <span style={{ color:C.muted }}>· {c.email}</span></span>
                      <button onClick={() => addFromPool([c.id])} disabled={addingFromPool}
                        style={{ padding:"3px 10px", borderRadius:5, border:`1px solid ${C.blue}40`, background:`${C.blue}10`, color:C.blue, fontSize:11, cursor:"pointer" }}>Add</button>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── EMAIL CARDS ── */}
      <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:10 }}>
        Your emails — {campaigns.filter(c=>c.html_content).length} ready
      </div>
      {campaigns.length === 0 && <EmptySchedule onGoToEdm={() => setView("edm")} onGoToCampaign={() => setView("campaign")} />}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {[...campaigns].filter(c=>c.html_content).sort((a,b) => {
          const ORDER = ["save_the_date","invitation","reminder","byo","day_of_details","confirmation","thank_you"];
          return (ORDER.indexOf(a.email_type)-ORDER.indexOf(b.email_type)) || (new Date(a.scheduled_at||"9")-new Date(b.scheduled_at||"9"));
        }).map(cam => {
          const icon = {save_the_date:"📅",invitation:"✉️",reminder:"⏰",day_of_details:"📍",thank_you:"🙏",confirmation:"✅",byo:"🎒"}[cam.email_type]||"📧";
          const statusColor = cam.status==="sent"?C.green:cam.status==="scheduled"?C.blue:cam.status==="approved"?C.teal:C.muted;
          const sendDate = cam.scheduled_at||cam.send_at;
          return (
            <div key={cam.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
              {/* Top row */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <span style={{ fontSize:20 }}>{icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{TYPE_LABEL[cam.email_type]||cam.email_type?.replace(/_/g," ")}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{cam.subject}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6, padding:"3px 10px", background:statusColor+"15", border:`1px solid ${statusColor}40`, borderRadius:6, fontSize:11, fontWeight:600, color:statusColor, flexShrink:0 }}>
                  {cam.status}
                </div>
              </div>
              {/* Schedule date row */}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <span style={{ fontSize:11, color:C.muted, whiteSpace:"nowrap" }}>📅 Send date:</span>
                {schedPickerCam?.id === cam.id ? (
                  <div style={{ display:"flex", gap:6, flex:1 }}>
                    <input type="datetime-local" value={schedPickerVal} onChange={e => setSchedPickerVal(e.target.value)}
                      style={{ flex:1, background:C.bg, border:`1px solid ${C.blue}`, borderRadius:6, color:C.text, padding:"4px 8px", fontSize:11.5, outline:"none" }} />
                    <button onClick={async () => {
                      if (!schedPickerVal) return;
                      await supabase.from("email_campaigns").update({ scheduled_at: new Date(schedPickerVal).toISOString(), send_at: new Date(schedPickerVal).toISOString(), status:"scheduled" }).eq("id", cam.id);
                      setCampaigns(p => p.map(c => c.id===cam.id ? {...c, scheduled_at:new Date(schedPickerVal).toISOString(), send_at:new Date(schedPickerVal).toISOString(), status:"scheduled"} : c));
                      setSchedPickerCam(null); fire("✅ Scheduled!");
                    }} style={{ padding:"4px 12px", borderRadius:6, border:"none", background:C.blue, color:"#fff", fontSize:11, fontWeight:600, cursor:"pointer" }}>Save</button>
                    <button onClick={() => setSchedPickerCam(null)} style={{ padding:"4px 8px", borderRadius:6, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, fontSize:11, cursor:"pointer" }}>✕</button>
                  </div>
                ) : (
                  <button onClick={() => { setSchedPickerCam(cam); setSchedPickerVal(sendDate ? new Date(sendDate).toISOString().slice(0,16) : ""); }}
                    style={{ fontSize:11.5, color:sendDate?C.text:C.blue, background:"none", border:`1px dashed ${sendDate?C.border:C.blue}`, borderRadius:6, padding:"3px 10px", cursor:"pointer" }}>
                    {sendDate ? new Date(sendDate).toLocaleString("en-AU",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "Set date →"}
                  </button>
                )}
              </div>
              {/* Segment row */}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                <span style={{ fontSize:11, color:C.muted }}>👥 Send to:</span>
                <select value={cam.segment||"all"} onChange={async e => {
                  const seg = e.target.value;
                  await supabase.from("email_campaigns").update({ segment:seg }).eq("id", cam.id);
                  setCampaigns(p => p.map(c => c.id===cam.id ? {...c, segment:seg} : c));
                }} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, color:C.text, padding:"3px 8px", fontSize:11.5, outline:"none", cursor:"pointer" }}>
                  {["all","confirmed","pending","attended"].map(s => (
                    <option key={s} value={s}>{s==="all"?"Everyone":s.charAt(0).toUpperCase()+s.slice(1)} ({segmentCounts[s]||0})</option>
                  ))}
                </select>
              </div>
              {/* Action buttons */}
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={() => setPreviewCam(cam)} style={{ padding:"6px 14px", borderRadius:7, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, fontSize:12, cursor:"pointer" }}>👁 Preview</button>
                {cam.status !== "sent" && (
                  <button onClick={() => openSendModal(cam)} disabled={!hasContacts}
                    style={{ padding:"6px 14px", borderRadius:7, border:"none", background:hasContacts?C.green:C.border, color:hasContacts?"#fff":C.muted, fontSize:12, fontWeight:600, cursor:hasContacts?"pointer":"not-allowed" }}>
                    {hasContacts ? "Send Now" : `Send (add contacts first)`}
                  </button>
                )}
                {cam.status === "sent" && <span style={{ fontSize:12, color:C.green, padding:"6px 0" }}>✅ Sent · {cam.total_sent||0} recipients</span>}
                <button onClick={async () => { if (!window.confirm("Delete this email?")) return; await supabase.from("email_campaigns").delete().eq("id",cam.id); setCampaigns(p=>p.filter(c=>c.id!==cam.id)); }}
                  style={{ marginLeft:"auto", padding:"6px 10px", borderRadius:7, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, fontSize:12, cursor:"pointer" }}>🗑</button>
              </div>
            </div>
          );
        })}
      </div>

      {previewCam && (() => {
        const [prevMode, setPrevMode] = React.useState("desktop");
        return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99, padding: 16 }}>
          <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, width: "100%", maxWidth: prevMode === "mobile" ? 420 : 700, height: "90vh", display: "flex", flexDirection: "column", animation: "fadeUp .2s ease" }}>
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Email Preview</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{previewCam.name}</div>
                {previewCam.subject && <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>Subject: <span style={{ color: C.sec }}>{previewCam.subject}</span></div>}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                {/* Desktop / Mobile toggle */}
                <div style={{ display: "flex", background: C.raised, borderRadius: 7, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                  {[{id:"desktop",icon:"🖥"},{id:"mobile",icon:"📱"}].map(m => (
                    <button key={m.id} onClick={() => setPrevMode(m.id)}
                      style={{ padding: "5px 10px", fontSize: 13, border: "none", background: prevMode === m.id ? C.blue : "transparent", color: prevMode === m.id ? "#fff" : C.muted, cursor: "pointer", transition: "all .15s" }}>
                      {m.icon}
                    </button>
                  ))}
                </div>
                <button onClick={() => setPreviewCam(null)} style={{ background: C.raised, border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, cursor: "pointer", padding: "5px 8px", display: "flex", alignItems: "center" }}><X size={14} /></button>
              </div>
            </div>
            {/* Email render */}
            <div style={{ flex: 1, overflow: "auto", background: "#E8E8E8", padding: prevMode === "mobile" ? "16px 12px" : "20px", display: "flex", justifyContent: "center" }}>
              <div style={{ width: prevMode === "mobile" ? "100%" : "100%", maxWidth: prevMode === "mobile" ? 375 : "100%", background: "#fff", borderRadius: prevMode === "mobile" ? 12 : 4, overflow: "hidden", boxShadow: "0 2px 20px rgba(0,0,0,.15)", height: "fit-content", minHeight: 400 }}>
                <iframe
                  srcDoc={previewCam.html_content || "<p style='font-family:sans-serif;color:#666;padding:20px'>No content yet</p>"}
                  sandbox="allow-same-origin"
                  style={{ width: "100%", minHeight: 500, height: "600px", border: "none", display: "block" }}
                  title="Email preview"
                />
              </div>
            </div>
            {/* Modal footer */}
            <div style={{ display: "flex", gap: 8, padding: "12px 18px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
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
        );
      })()}

      {/* SEND NOW MODAL */}
      {sendModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, width: 500, animation: "fadeUp .22s ease", boxShadow: "0 32px 80px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.06)", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "20px 22px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: `linear-gradient(180deg,${C.raised},${C.card})` }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 2 }}>Send Campaign</h2>
                <div style={{ fontSize: 11, color: C.muted }}>Review before sending — this action cannot be undone</div>
              </div>
              <button onClick={() => setSendModal(null)} style={{ background: C.raised, border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, cursor: "pointer", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={14} /></button>
            </div>

            <div style={{ padding: "20px 22px" }}>
            {/* Email summary card */}
            <div style={{ background: C.raised, borderRadius: 10, padding: "14px 16px", marginBottom: 12, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.blue}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                  {sendModal.email_type === "save_the_date" ? "📅" : sendModal.email_type === "invitation" ? "✉️" : sendModal.email_type === "reminder" ? "⏰" : sendModal.email_type === "thank_you" ? "🙏" : "📧"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sendModal.name}</div>
                  {sendModal.subject && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{sendModal.subject}"</div>}
                </div>
                {sendModal.subject && <div style={{ fontSize: 9.5, color: sendModal.subject.length > 60 ? C.amber : C.green, whiteSpace: "nowrap", flexShrink: 0 }}>{sendModal.subject.length > 60 ? "⚠️ Long" : "✅ Good"}</div>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => { setPreviewCam(sendModal); setSendModal(null); }}
                  style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.card, color: C.muted, cursor: "pointer" }}>
                  👁 Preview
                </button>
                <button onClick={async () => {
                  const testTo = profile?.email;
                  if (!testTo) { fire("No email on your profile", "err"); return; }
                  fire(`📧 Sending test to ${testTo}…`);
                  const { data: { session } } = await supabase.auth.getSession();
                  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
                    method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
                    body: JSON.stringify({ contacts: [{ email: testTo, first_name: profile?.full_name?.split(" ")[0] || "Test" }], subject: `[TEST] ${sendModal.subject}`, htmlContent: sendModal.html_content, plainText: sendModal.plain_text, ...getSender(profile) })
                  });
                  const d = await res.json();
                  fire(d.success ? `✅ Test sent to ${testTo}! Check your inbox.` : "Send failed", d.success ? "ok" : "err");
                }} style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.blue}40`, background: `${C.blue}10`, color: C.blue, cursor: "pointer" }}>
                  🧪 Send test to me
                </button>
              </div>
            </div>

            {/* Pre-send readiness checks */}
            {(() => {
              const checks = [
                { label: "Subject line set", ok: !!sendModal.subject, warn: "Add a subject line" },
                { label: `Subject length OK (${sendModal.subject?.length || 0} chars)`, ok: (sendModal.subject?.length || 0) <= 60, warn: "Subject is over 60 chars — may get cut off in inbox" },
                { label: "Email has content", ok: !!sendModal.html_content, warn: "No HTML content — regenerate in eDM Builder" },
                { label: `${sendModal.recipientCount || 0} contacts to send to`, ok: (sendModal.recipientCount || 0) > 0, warn: "No contacts in this segment" },
                { label: "Unsubscribe link included", ok: (sendModal.html_content||"").includes("UNSUBSCRIBE_URL") || (sendModal.html_content||"").toLowerCase().includes("unsubscribe"), warn: "No unsubscribe link found" },
              ];
              const allOk = checks.every(c => c.ok);
              const issues = checks.filter(c => !c.ok);
              return (
                <div style={{ background: allOk ? `${C.green}06` : `${C.amber}08`, border: `1px solid ${allOk ? C.green+"30" : C.amber+"40"}`, borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: allOk ? C.green : C.amber, marginBottom: 6 }}>
                    {allOk ? "✅ Ready to send" : `⚠️ ${issues.length} thing${issues.length>1?"s":""} to review`}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {checks.map((c, i) => (
                      <div key={i} style={{ fontSize: 11, color: c.ok ? C.muted : C.amber, display: "flex", alignItems: "center", gap: 5 }}>
                        <span>{c.ok ? "✓" : "⚠"}</span>
                        <span>{c.ok ? c.label : c.warn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Recipient section */}
            <div style={{ background: `${C.blue}08`, border: `1px solid ${C.blue}22`, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.blue, letterSpacing: "-0.5px" }}>{sendModal.recipientCount}</div>
                <div style={{ fontSize: 11.5, color: C.blue, fontWeight: 600 }}>contacts will receive this</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: C.muted }}>Segment:</span>
                <select value={sendModal.segment || "all"} onChange={async (e) => {
                  const seg = e.target.value;
                  const { data: ecs } = await supabase.from("event_contacts").select("*").eq("event_id", activeEvent.id).eq("company_id", profile.company_id);
                  const filtered = (ecs || []).filter(ec => seg === "all" ? true : ec.status === seg);
                  setSendModal(p => ({ ...p, segment: seg, recipientCount: filtered.length }));
                }} style={{ fontSize: 11, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: "4px 8px", outline: "none", cursor: "pointer" }}>
                  <option value="all">Everyone (excl. declined)</option>
                  <option value="confirmed">Confirmed only</option>
                  <option value="pending">Pending only</option>
                  <option value="attended">Attended only</option>
                </select>
              </div>
              <div style={{ fontSize: 10.5, color: C.muted, marginTop: 6 }}>📝 Personalised with each recipient's name · unsubscribed contacts auto-excluded</div>
            </div>

            {sendModal.recipientCount === 0 && (
              <div style={{ background: `${C.amber}10`, border: `1px solid ${C.amber}30`, borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 12.5, color: C.amber }}>
                ⚠️ No contacts match this segment. Add contacts in the Dashboard first.
              </div>
            )}

            <div style={{ display: "flex", gap: 9 }}>
              <button onClick={() => setSendModal(null)} style={{ flex: 1, padding: "12px", background: C.raised, border: `1px solid ${C.border}`, borderRadius: 9, color: C.muted, fontSize: 13, cursor: "pointer", fontWeight: 500 }}>Cancel</button>
              <button onClick={sendNow} disabled={sending || sendModal.recipientCount === 0}
                style={{ flex: 2, padding: "12px", background: sending || sendModal.recipientCount === 0 ? C.raised : C.green, border: "none", borderRadius: 9, color: sending || sendModal.recipientCount === 0 ? C.muted : "#fff", fontSize: 14, fontWeight: 700, cursor: sending ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, position: "relative", overflow: "hidden", boxShadow: !sending && sendModal.recipientCount > 0 ? `0 4px 16px ${C.green}40` : "none" }}>
                {sending && sendProgress.total > 0 && (
                  <div style={{ position: "absolute", inset: 0, background: `${C.green}40`, width: `${Math.round(sendProgress.sent / sendProgress.total * 100)}%`, transition: "width .3s", borderRadius: 9 }} />
                )}
                <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                  {sending ? <><Spin />{sendProgress.total > 1 ? `Sending ${sendProgress.sent}/${sendProgress.total}…` : "Sending…"}</> : <><Send size={14} />Send to {sendModal.recipientCount} contact{sendModal.recipientCount !== 1 ? "s" : ""} →</>}
                </span>
              </button>
            </div>
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
                  {["all", "confirmed", "pending", "declined", "attended"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)} contacts ({segmentCounts[s] ?? 0})</option>)}
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

export default ScheduleView;
