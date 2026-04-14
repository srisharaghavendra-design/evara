import { useState, useEffect, useRef, useCallback } from "react";
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

// ROIView
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

      <div className="roi-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 320px", gap: 14 }}>
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

export default ROIView;