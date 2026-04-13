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
import {Spin, Alert, Inp, ViewHint, ScoreBadge, ImageUploadZone, ini, C} from "../components/Shared";

// ContactView
function ContactView({ supabase, profile, activeEvent, fire, globalSearch = "", setGlobalSearch, onContactsChanged }) {
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
  const [includePersonal, setIncludePersonal] = useState(false);
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
  const resetImport = () => { setShowImport(false); setImportText(""); setImportPreview(null); setImportStep("input"); setCsvHeaders([]); setColumnMap({}); setAddToEvent(false); setIncludePersonal(false); setDragOver(false); };

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
            const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
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
              if (added > 0) onContactsChanged?.();
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
              if (n > 0) onContactsChanged?.();
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
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${C.blue}40,${C.teal}30)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 700, color: C.blue, flexShrink: 0, border: `1px solid ${C.blue}20` }}>{ini(`${c.first_name || ""} ${c.last_name || ""}`)}</div>
                        <div>
                          <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{`${c.first_name || ""} ${c.last_name || ""}`.trim() || "—"}</div>
                          {c.job_title && <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{c.job_title}</div>}
                        </div>
                        {c.tags?.includes("vip") && <span onClick={e=>{e.stopPropagation();setTagFilter(f=>f==="vip"?"":"vip");}} style={{ fontSize:9.5, color:"#FFD60A", background:"#FFD60A15", border:"1px solid #FFD60A30", padding:"1px 6px", borderRadius:99, cursor:"pointer", fontWeight:600 }} title="Filter by VIP">VIP ⭐</span>}
                        {c.unsubscribed && <span style={{ fontSize: 9, padding:"1px 5px", borderRadius:99, background:C.red+"15", color:C.red, fontWeight:600 }}>unsub</span>}
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
                            if (!error) { fire(`✅ ${c.first_name || c.email} added to ${activeEvent.name}`); onContactsChanged?.(); }
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
                  {importStep === "input" ? "Add your guest list" : importStep === "map" ? "Map Columns" : "Preview & Import"}
                </h2>
                <p style={{ fontSize:12, color:C.muted, marginTop:4 }}>
                  {importStep === "input" ? "Paste anything — emails, CSV, a forwarded email, LinkedIn export. We'll figure it out." : ""}
                </p>
                <div style={{ display:"flex", gap:6, marginTop:8 }}>
                  {["input","map","preview"].map((s,i) => (
                    <div key={s} style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <div style={{ width:20, height:20, borderRadius:"50%", background: importStep===s ? C.blue : i < ["input","map","preview"].indexOf(importStep) ? C.green : C.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#fff", fontWeight:700, flexShrink:0, transition:"all .2s" }}>
                        {i < ["input","map","preview"].indexOf(importStep) ? "✓" : i+1}
                      </div>
                      <span style={{ fontSize:10.5, color: importStep===s ? C.text : C.muted, fontWeight: importStep===s ? 600 : 400 }}>
                        {{input:"Paste or Upload",map:"Map",preview:"Preview"}[s]}
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

                <textarea value={importText} onChange={e => setImportText(e.target.value)} rows={8}
                  placeholder={"Paste anything — any of these work:\n\n✓  john@acme.com\n✓  John Smith <john@acme.com>\n✓  first_name,last_name,email,company,title\n    John,Smith,john@acme.com,Acme Corp,CEO\n✓  LinkedIn export · Salesforce export · HubSpot export · Excel copy-paste\n✓  A forwarded email thread with email addresses\n\nevara figures out the format automatically."}
                  style={{ width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, padding:"10px 12px", fontSize:12, outline:"none", resize:"vertical", fontFamily:"monospace", boxSizing:"border-box", marginBottom:6, lineHeight:1.6 }}
                  onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border} />

                <div style={{ fontSize:11, color:C.muted, marginBottom:14 }}>
                  {importText.trim() ? `${parseImportText(importText).length} contacts detected` : "Paste data above or drop a file to continue"}
                </div>

                {activeEvent && (
                  <label style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:C.raised, borderRadius:8, border:`1px solid ${addToEvent?C.blue:C.border}`, marginBottom:12, cursor:"pointer", transition:"border-color .15s" }}>
                    <input type="checkbox" checked={addToEvent} onChange={e => setAddToEvent(e.target.checked)}
                      style={{ width:15, height:15, accentColor:C.blue, cursor:"pointer" }} />
                    <div>
                      <div style={{ fontSize:12.5, fontWeight:600, color:C.text }}>Add to "{activeEvent.name}"</div>
                      <div style={{ fontSize:11, color:C.muted }}>Contacts appear in this event's guest list immediately</div>
                    </div>
                  </label>
                )}
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
                    <React.Fragment key={f.key}>
                      <div style={{ fontSize:12.5, color:C.text, fontWeight: f.required ? 600 : 400 }}>
                        {f.label}{f.required && <span style={{ color:C.red, marginLeft:3 }}>*</span>}
                      </div>
                      <div style={{ textAlign:"center", color:C.muted, fontSize:16 }}>→</div>
                      <select value={columnMap[f.key] !== null && columnMap[f.key] !== undefined ? columnMap[f.key] : ""}
                        onChange={e => setColumnMap(m => ({ ...m, [f.key]: e.target.value === "" ? null : Number(e.target.value) }))}
                        style={{ fontSize:12, padding:"6px 10px", borderRadius:7, border:`1px solid ${columnMap[f.key] !== null && columnMap[f.key] !== undefined && columnMap[f.key] !== "" ? C.blue : C.border}`, background:C.raised, color: columnMap[f.key] !== null && columnMap[f.key] !== undefined && columnMap[f.key] !== "" ? C.text : C.muted, outline:"none" }}>
                        <option value="">— skip this field —</option>
                        {csvHeaders.map((h, i) => <option key={i} value={i}>{h || `Column ${i+1}`}</option>)}
                      </select>
                    </React.Fragment>
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
                    { label:"Ready to import", val: importPreview.filter(r=>!r._personal||includePersonal).length, col:C.green },
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
                  <label style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", background:`${C.amber}10`, borderRadius:7, border:`1px solid ${C.amber}30`, marginBottom:10, cursor:"pointer" }}>
                    <input type="checkbox" checked={includePersonal} onChange={e => setIncludePersonal(e.target.checked)}
                      style={{ width:14, height:14, accentColor:C.amber, cursor:"pointer", flexShrink:0 }} />
                    <span style={{ fontSize:11.5, color:C.amber }}>
                      {importPreview.filter(r=>r._personal).length} personal emails (Gmail, Yahoo…) detected — check to include them anyway
                    </span>
                  </label>
                )}



                <div style={{ display:"flex", gap:9 }}>
                  <button onClick={() => { setImportStep(csvHeaders.length ? "map" : "input"); }} style={{ padding:"10px 20px", background:"transparent", border:`1px solid ${C.border}`, borderRadius:8, color:C.muted, fontSize:13, cursor:"pointer" }}>← Back</button>
                  <button onClick={async () => {
                    const rows = importPreview.filter(r => !r._personal || includePersonal);
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
                    if (addToEvent && newOnes.length) onContactsChanged?.();
                    resetImport();
                    setImporting(false);
                  }} disabled={importing || !importPreview.filter(r=>!r._personal||includePersonal).length}
                    style={{ flex:1, padding:11, background:C.blue, border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                    {importing ? "Importing…" : `Import ${importPreview.filter(r=>!r._personal||includePersonal).length} Contact${importPreview.filter(r=>!r._personal||includePersonal).length!==1?"s":""}${addToEvent&&activeEvent?" + Add to Event":""} →`}
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
                    const contacts = toSend.map(c => ({ id: c.id, email: c.email, first_name: c.first_name || "", last_name: c.last_name || "" }));
                    const htmlContent = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#111;max-width:600px;margin:0 auto;padding:32px 24px">${
                      bulkBody.split("\n").map(line => line ? `<p style="margin:0 0 12px">${line.replace(/{first_name}/g,'[First Name]')}</p>` : '<br/>').join("")
                    }<hr style="border:none;border-top:1px solid #eee;margin:24px 0"/><p style="font-size:11px;color:#999">You received this because you're a contact of ${profile?.companies?.name||"our organisation"}. <a href="{{UNSUBSCRIBE_URL}}">Unsubscribe</a></p></div>`;
                    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
                      method:"POST",
                      headers:{"Content-Type":"application/json","Authorization":`Bearer ${session?.access_token}`},
                      body: JSON.stringify({ contacts, subject: bulkSubject, htmlContent, plainText: bulkBody, companyId: profile?.company_id, fromName: profile?.companies?.from_name || profile?.companies?.name || "evara", fromEmail: "hello@evarahq.com" })
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

export default ContactView;