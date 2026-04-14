import { useState, useEffect, useRef, useCallback } from "react";
import { EmptyAnalytics } from "../EventEmptyStates";
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

// AnalyticsView + EngagementBreakdown
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

  const openRate = data?.total_sent > 0 ? Math.round((data.total_opened / data.total_sent) * 100) : null;
  const clickRate = data?.total_sent && data?.total_clicked ? Math.round((data.total_clicked / data.total_sent) * 100) : null;
  const showRate = data?.confirmed && data?.attended ? Math.round((data.attended / data.confirmed) * 100) : null;

  // Benchmark context labels
  const getOpenBenchmark = (r) => {
    if (r === null) return null;
    if (r >= 50) return { label: "🏆 Top 5% of B2B events", color: C.green };
    if (r >= 35) return { label: "✅ Above average", color: C.green };
    if (r >= 25) return { label: "👍 Industry average (25–35%)", color: C.teal };
    if (r >= 15) return { label: "⚠️ Below average", color: C.amber };
    return { label: "🔴 Needs improvement — try a new subject", color: C.red };
  };

  const METRICS = [
    { label: "Emails Sent", val: data?.total_sent || 0, color: C.blue, icon: "📧", sub: data?.total_sent > 0 ? `${campaigns.filter(c=>c.status==="sent").length} campaigns` : "No emails sent yet" },
    { label: "Open Rate", val: openRate !== null ? `${openRate}%` : "—", color: openRate >= 35 ? C.green : openRate >= 25 ? C.teal : openRate !== null ? C.amber : C.muted, icon: "👁", sub: openRate !== null ? getOpenBenchmark(openRate)?.label : "Send emails to track opens", benchmark: getOpenBenchmark(openRate) },
    { label: "Click Rate", val: clickRate !== null ? `${clickRate}%` : "—", color: clickRate >= 5 ? C.green : clickRate >= 3 ? C.teal : clickRate !== null ? C.amber : C.muted, icon: "🖱", sub: clickRate !== null ? (clickRate >= 5 ? "🏆 Excellent (3–5% is strong)" : clickRate >= 3 ? "✅ Good click rate" : "⚠️ Aim for 3%+ clicks") : "No clicks yet" },
    { label: "Registered", val: data?.ec_total || 0, color: C.text, icon: "📋", sub: "total in guest list" },
    { label: "Confirmed", val: data?.confirmed || 0, color: C.green, icon: "✅", sub: data?.ec_total > 0 ? `${Math.round(((data?.confirmed||0)/data.ec_total)*100)}% confirmation rate` : "" },
    { label: "Attended", val: data?.attended || 0, color: C.blue, icon: "🎟", sub: showRate !== null ? `${showRate}% show rate` : "" },
    { label: "Declined", val: data?.declined || 0, color: C.red, icon: "❌", sub: "" },
    { label: "Show Rate", val: showRate !== null ? `${showRate}%` : "—", color: showRate >= 80 ? C.green : showRate >= 60 ? C.teal : showRate !== null ? C.amber : C.muted, icon: "📈", sub: showRate !== null ? (showRate >= 80 ? "🏆 Excellent retention" : showRate >= 60 ? "✅ Good show rate" : "⚠️ Follow up with no-shows") : "" },
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
              <div key={i} style={{ background: C.card, borderRadius: 10, padding: "16px 14px", border: `1px solid ${C.border}`, borderTop: `2px solid ${m.color}50` }}>
                <div style={{ fontSize: 18, marginBottom: 6 }}>{m.icon}</div>
                <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 }}>{m.label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: m.color, letterSpacing: "-0.5px", marginBottom: m.sub ? 4 : 0 }}>{loading ? "—" : m.val}</div>
                {m.sub && <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.4 }}>{m.sub}</div>}
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
              <EmptyAnalytics onGoToEdm={() => setView("edm")} onGoToSchedule={() => setView("schedule")} />
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

export default EngagementBreakdown;