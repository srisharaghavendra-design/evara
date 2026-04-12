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
  const hasContacts = contactCount > 0;
  const readyChecks = [
    { label: "Emails drafted", done: hasEmailDraft, action: "Go to Step 1 — Emails", actionId: null },
    { label: `Contacts added (${contactCount})`, done: hasContacts, action: "Add contacts", actionId: "contacts", onClick: () => setShowInlineContacts(true) },
  ];
  const allReady = readyChecks.every(c => c.done);

  return (
    <div style={{ animation: "fadeUp .2s ease" }}>
      {/* ── Ready-to-send gate ── */}
      {!allReady && campaigns.length > 0 && (
        <div style={{ marginBottom: 16, padding: "12px 16px", background: C.amber + "10", border: `1px solid ${C.amber}35`, borderRadius: 10, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14 }}>⚡</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: C.amber, marginBottom: 5 }}>Before you send — check these off</div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {readyChecks.map(c => (
                <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: c.done ? C.green : C.muted }}>
                  <span style={{ fontSize: 13 }}>{c.done ? "✅" : "○"}</span>
                  <span style={{ fontWeight: c.done ? 500 : 400 }}>{c.label}</span>
                  {!c.done && (
                    c.onClick
                      ? <span onClick={c.onClick} style={{ fontSize: 11, color: C.blue, cursor: "pointer", textDecoration: "underline" }}>— {c.action}</span>
                      : <span style={{ fontSize: 11, color: C.amber }}>— {c.action}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {allReady && campaigns.length > 0 && (
        <div style={{ marginBottom: 16, padding: "10px 16px", background: C.green + "10", border: `1px solid ${C.green}30`, borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14 }}>✅</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: C.green }}>You're ready to send — set your dates below and hit Send</span>
        </div>
      )}
      {/* ── Inline Contacts Panel ── */}
      {(!hasContacts || showInlineContacts) && campaigns.length > 0 && (
        <div style={{ marginBottom: 16, padding: "14px 16px", background: C.raised, border: `1px solid ${C.border}`, borderRadius: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>👥 Add contacts for this event</div>
            {showInlineContacts && hasContacts && (
              <button onClick={() => setShowInlineContacts(false)} style={{ fontSize: 11, color: C.muted, background: "none", border: "none", cursor: "pointer" }}>✕ Close</button>
            )}
          </div>
          <textarea
            value={inlineImportText}
            onChange={e => setInlineImportText(e.target.value)}
            placeholder={"Paste emails or CSV rows here, one per line:\nemail@example.com\nJane Doe, jane@example.com\nJohn, Smith, john@example.com"}
            style={{ width: "100%", minHeight: 90, fontSize: 12, fontFamily: "monospace", padding: "8px 10px", borderRadius: 7, border: `1px solid ${C.border}`, background: C.bg, color: C.text, resize: "vertical", boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <button onClick={() => inlineFileRef.current?.click()} style={{ fontSize: 12, padding: "6px 12px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>
              📎 Upload CSV
            </button>
            <input ref={inlineFileRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={e => {
              const file = e.target.files?.[0]; if (!file) return;
              const reader = new FileReader();
              reader.onload = ev => setInlineImportText(ev.target.result);
              reader.readAsText(file);
              e.target.value = "";
            }} />
            <button onClick={() => doInlineImport(inlineImportText)} disabled={inlineImporting || !inlineImportText.trim()}
              style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, border: "none", background: C.blue, color: "#fff", cursor: inlineImporting || !inlineImportText.trim() ? "not-allowed" : "pointer", opacity: inlineImporting || !inlineImportText.trim() ? 0.6 : 1, fontWeight: 600 }}>
              {inlineImporting ? "Importing…" : "Import"}
            </button>
            {setView && (
              <button onClick={() => setView("contacts")} style={{ fontSize: 12, padding: "6px 12px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.blue, cursor: "pointer", marginLeft: "auto" }}>
                Manage all contacts →
              </button>
            )}
          </div>
        </div>
      )}
      {hasContacts && !showInlineContacts && (
        <div style={{ marginBottom: 16, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: C.green + "12", border: `1px solid ${C.green}30`, borderRadius: 20 }}>
          <span style={{ fontSize: 13 }}>👥</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: C.green }}>{contactCount} contacts</span>
          <span onClick={() => setShowInlineContacts(true)} style={{ fontSize: 11, color: C.blue, cursor: "pointer", textDecoration: "underline" }}>Edit</span>
          {setView && <span onClick={() => setView("contacts")} style={{ fontSize: 11, color: C.blue, cursor: "pointer", textDecoration: "underline" }}>Manage →</span>}
        </div>
      )}
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
            const missingTypes = (() => {
              const types = new Set(campaigns.map(c => c.email_type));
              return ["save_the_date","invitation","reminder","confirmation","thank_you","byo"].filter(t => !types.has(t));
            })();
            return (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {/* Best send time tip */}
              <div style={{ background:C.raised, borderRadius:9, border:`1px solid ${C.border}`, padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:16 }}>⏰</span>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:12, fontWeight:600, color:C.text }}>Best send times for B2B events: </span>
                  <span style={{ fontSize:12, color:C.sec }}>Tuesday–Thursday · 9–10am or 2–3pm recipient time. Avoid Mondays, Fridays, and public holidays.</span>
                </div>
                <span style={{ fontSize:10, padding:"2px 7px", background:`${C.green}15`, color:C.green, borderRadius:3, fontWeight:600, flexShrink:0 }}>Auto-applied</span>
              </div>
              {/* Sequence strip */}
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
                          <div style={{ width:40, height:40, borderRadius:"50%", background:statusBg, border:`2px solid ${statusColor}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, cursor:cam.html_content?"pointer":"default", transition:"transform .15s" }}
                            onClick={() => cam.html_content && setPreviewCam(cam)}
                            title={cam.name}
                            onMouseEnter={e=>cam.html_content&&(e.currentTarget.style.transform="scale(1.1)")}
                            onMouseLeave={e=>(e.currentTarget.style.transform="scale(1)")}>
                            {cam.status==="sent" ? "✓" : icon}
                          </div>
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
              {/* Missing types nudge */}
              {missingTypes.length > 0 && (
                <div style={{ fontSize: 11, color: C.amber }}>
                  💡 Missing email types: {missingTypes.map(t => t.replace(/_/g," ")).join(", ")} — click + New campaign to add
                </div>
              )}
              </div>
            );
          })()}
          {campaigns.length === 0 && (
            <EmptySchedule onGoToEdm={() => setView("edm")} onGoToCampaign={() => setView("campaign")} />
          )}
          {[...campaigns].sort((a, b) => {
                const order = {"save_the_date":0,"invitation":1,"reminder":2,"day_of_details":3,"confirmation":4,"byo":5,"thank_you":6};
                return (order[a.email_type] ?? 9) - (order[b.email_type] ?? 9);
              }).map(cam => (
            <div key={cam.id} className="metric-card" style={{ background: C.card, borderRadius: 10, border: `1px solid ${cam.status === "sent" ? C.green + "28" : cam.status === "scheduled" ? C.blue + "35" : cam.status === "paused" ? C.amber + "28" : C.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, position: "relative", overflow: "hidden" }}>
              {/* Left accent */}
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: cam.status === "sent" ? C.green : cam.status === "scheduled" ? C.blue : cam.status === "paused" ? C.amber : C.border, borderRadius: "3px 0 0 3px" }} />
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cam.status === "sent" ? C.green : cam.status === "scheduled" ? C.blue : C.raised}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
              {cam.email_type === "save_the_date" ? "📅" : cam.email_type === "invitation" ? "✉️" : cam.email_type === "reminder" ? "⏰" : cam.email_type === "day_of_details" ? "📍" : cam.email_type === "thank_you" ? "🙏" : cam.email_type === "confirmation" ? "✅" : "📧"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: C.text, cursor: cam.html_content ? "pointer" : "default" }} onClick={() => cam.html_content && setPreviewCam(cam)}>{cam.name}{cam.html_content && <span style={{ fontSize: 9, color: C.blue, marginLeft: 5 }}>👁</span>}</span>
                  {cam.subject && <div style={{ fontSize: 11, color: C.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 320 }}>{editingSubjectId === cam.id ? null : `"${cam.subject}"`}</div>}
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
                  {" · "}Segment: <span style={{ color: cam.segment !== "all" ? C.amber : C.muted }}>{ {"all":`Everyone (${segmentCounts.all})`,"confirmed":`✅ Confirmed (${segmentCounts.confirmed})`,"pending":`⏳ Pending (${segmentCounts.pending})`,"attended":`📍 Attended (${segmentCounts.attended})`,"declined":`❌ Declined (${segmentCounts.declined})`,"vip":`⭐ VIP`}[cam.segment] || cam.segment.charAt(0).toUpperCase() + cam.segment.slice(1) }</span>
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
                {/* Inline subject editor */}
                {cam.subject && (
                  <div style={{ marginTop: 6 }}>
                    {editingSubjectId === cam.id ? (
                      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                        <input autoFocus value={editingSubjectVal}
                          onChange={e => setEditingSubjectVal(e.target.value)}
                          onKeyDown={e => { if(e.key==="Enter") saveSubject(cam.id, editingSubjectVal); if(e.key==="Escape") setEditingSubjectId(null); }}
                          style={{ flex:1, background:C.bg, border:`1px solid ${C.blue}60`, borderRadius:6, color:C.text, padding:"5px 9px", fontSize:12, outline:"none" }} />
                        <button onClick={() => saveSubject(cam.id, editingSubjectVal)} style={{ padding:"4px 10px", borderRadius:5, border:"none", background:C.blue, color:"#fff", fontSize:11, cursor:"pointer", fontWeight:600 }}>Save</button>
                        <button onClick={() => setEditingSubjectId(null)} style={{ padding:"4px 8px", borderRadius:5, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, fontSize:11, cursor:"pointer" }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                        <span style={{ fontSize:11.5, color:C.muted, fontStyle:"italic", cursor:"pointer" }}
                          onClick={() => { setEditingSubjectId(cam.id); setEditingSubjectVal(cam.subject); setAiSubjectOptions(p=>({...p,[cam.id]:null})); }}
                          title="Click to edit subject line">
                          "{cam.subject}" <span style={{ fontSize:10, color:C.blue }}>✏️</span>
                        </span>
                        {cam.status !== "sent" && (
                          <button onClick={() => generateAiSubjects(cam)} disabled={aiSubjectLoading === cam.id}
                            style={{ fontSize:10, padding:"2px 8px", borderRadius:4, border:`1px solid ${C.blue}30`, background:`${C.blue}08`, color:C.blue, cursor:"pointer", display:"flex", alignItems:"center", gap:3 }}>
                            {aiSubjectLoading === cam.id ? <Spin size={8}/> : "✨"} AI alternatives
                          </button>
                        )}
                      </div>
                    )}
                    {/* AI subject alternatives */}
                    {aiSubjectOptions[cam.id]?.length > 0 && editingSubjectId !== cam.id && (
                      <div style={{ marginTop:8, background:C.raised, borderRadius:8, border:`1px solid ${C.border}`, padding:"10px 12px" }}>
                        <div style={{ fontSize:10, color:C.muted, marginBottom:6, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" }}>✨ AI Subject Alternatives</div>
                        {aiSubjectOptions[cam.id].map((s, i) => (
                          <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0", borderBottom: i < aiSubjectOptions[cam.id].length-1 ? `1px solid ${C.border}` : "none" }}>
                            <span style={{ flex:1, fontSize:12, color:C.sec }}>{s}</span>
                            <button onClick={() => saveSubject(cam.id, s)}
                              style={{ fontSize:10, padding:"2px 8px", borderRadius:4, border:`1px solid ${C.green}40`, background:`${C.green}08`, color:C.green, cursor:"pointer", flexShrink:0 }}>Use</button>
                          </div>
                        ))}
                        <button onClick={() => setAiSubjectOptions(p=>({...p,[cam.id]:null}))} style={{ marginTop:6, fontSize:10, color:C.muted, background:"none", border:"none", cursor:"pointer" }}>Dismiss</button>
                      </div>
                    )}
                  </div>
                )}
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
                    const unopenedCount = (cam.total_sent||0) - (cam.total_opened||0);
                    if (unopenedCount <= 0) { fire("No unopened contacts — great open rate!"); return; }

                    // Step 1: AI generates a new subject line
                    fire("🧠 AI is writing a new subject line…");
                    let newSubject = "Following up: " + cam.subject;
                    try {
                      const { data: { session } } = await supabase.auth.getSession();
                      const aiRes = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
                        method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${session?.access_token}`},
                        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:100,
                          messages:[{ role:"user", content:`Write ONE alternative email subject line for a follow-up to contacts who didn't open this email. Original subject: "${cam.subject}". Event: ${activeEvent?.name}. Return ONLY the subject line, no quotes, no explanation.` }]
                        })
                      });
                      const aiData = await aiRes.json();
                      newSubject = aiData.content?.[0]?.text?.trim() || newSubject;
                    } catch(e) { /* use fallback */ }

                    // Step 2: Confirm with user
                    const confirmed = window.confirm(
                      `Resend to ${unopenedCount} unopened contact${unopenedCount===1?"":"s"}?\n\nNew AI subject line:\n"${newSubject}"\n\nClick OK to send, Cancel to abort.`
                    );
                    if (!confirmed) { fire("Resend cancelled"); return; }

                    // Step 3: Send
                    fire(`📧 Sending to ${unopenedCount} contacts…`);
                    const { data: { session } } = await supabase.auth.getSession();
                    const { data: ecs } = await supabase.from("event_contacts")
                      .select("contacts(email,first_name,last_name)").eq("event_id", activeEvent?.id);
                    const { data: opens } = await supabase.from("email_sends")
                      .select("email").eq("campaign_id", cam.id).not("opened_at","is",null);
                    const openedEmails = new Set((opens||[]).map(o => o.email));
                    const unopened = (ecs||[]).map(ec => ec.contacts).filter(c => c?.email && !openedEmails.has(c.email));
                    if (!unopened.length) { fire("No unopened contacts found"); return; }
                    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
                      method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${session.access_token}`},
                      body: JSON.stringify({ contacts:unopened, subject:newSubject, htmlContent:cam.html_content, plainText:cam.plain_text, ...getSender(profile) })
                    }).then(r=>r.json()).catch(e=>({error:e.message}));
                    res.success ? fire(`✅ Resent to ${res.sent} contacts with new subject`) : fire(res.error||"Send failed","err");
                  }} style={{ fontSize:12, padding:"5px 10px", borderRadius:6, border:`1px solid ${C.amber}40`, background:C.amber+"10", color:C.amber, cursor:"pointer", fontWeight:500 }}>
                    🧠 Resend to unopened ({Math.max(0,(cam.total_sent||0)-(cam.total_opened||0))})
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