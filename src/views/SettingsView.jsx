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

// BrandKitSection + DangerZone + SettingsView
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
  const [fromName, setFromName] = useState(profile?.companies?.from_name || profile?.companies?.name || "");
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
          <span style={{ fontSize: 10, color: C.muted }}>evara v2.3 · Build 2026-04-12</span>
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

export default SettingsView;