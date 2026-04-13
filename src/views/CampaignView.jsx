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
import {Spin, Alert, Inp, ViewHint, ScoreBadge, ImageUploadZone, C} from "../components/Shared";

// CampaignView
function Sec({ label, children }) {
  return (
    <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 14 }}>
      <div style={{ fontSize: 10.5, fontWeight: 500, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 11 }}>{label}</div>
      {children}
    </div>
  );
}

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

export default CampaignView;