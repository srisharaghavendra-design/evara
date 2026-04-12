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

// SeatingView
function SeatingView({ supabase, profile, activeEvent, fire }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [layout, setLayout] = useState({ tables: 8, seatsPerTable: 10 });
  const [assignments, setAssignments] = useState({});
  const [dragOver, setDragOver] = useState(null);
  const [editingSeat, setEditingSeat] = useState(null); // { ecId, value }

  if (!activeEvent) return (
    <div style={{ padding: 40, textAlign: "center", color: C.muted }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>💺</div>
      <div style={{ fontSize: 15, fontWeight: 500 }}>Select an event to manage seating</div>
    </div>
  );

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

  if (!activeEvent) return (
    <div style={{ animation:"fadeUp .2s ease" }}>
      <div style={{ marginBottom:24 }}><h1 style={{ fontSize:24, fontWeight:600, letterSpacing:"-0.6px", color:C.text }}>Seating Planner</h1>
        <p style={{ color:C.muted, fontSize:13, marginTop:4 }}>Auto-assign seats for confirmed guests.</p></div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", paddingTop:60, gap:14, textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:4 }}>🪑</div>
        <div style={{ fontSize:18, fontWeight:600, color:C.text }}>No event selected</div>
        <p style={{ fontSize:13, color:C.muted, maxWidth:340, lineHeight:1.6 }}>Select an event from the sidebar to manage its seating plan.</p>
      </div>
    </div>
  );

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
                        {editingSeat?.ecId === ec.id ? (
                          <div style={{ display: "flex", gap: 4 }}>
                            <input autoFocus value={editingSeat.value}
                              onChange={e => setEditingSeat(p => ({ ...p, value: e.target.value }))}
                              onKeyDown={async e => {
                                if (e.key === "Enter") {
                                  const newSeat = editingSeat.value.trim();
                                  if (newSeat && newSeat !== seat) {
                                    await supabase.from("event_contacts").update({ seat_number: newSeat }).eq("id", ec.id);
                                    setAssignments(p => ({ ...p, [ec.id]: newSeat }));
                                    fire("Seat updated");
                                  }
                                  setEditingSeat(null);
                                }
                                if (e.key === "Escape") setEditingSeat(null);
                              }}
                              style={{ width: 50, fontSize: 10, padding: "2px 5px", background: C.bg, border: `1px solid ${C.blue}`, borderRadius: 4, color: C.text, outline: "none" }} />
                            <button onClick={async () => {
                                const newSeat = editingSeat.value.trim();
                                if (newSeat && newSeat !== seat) {
                                  await supabase.from("event_contacts").update({ seat_number: newSeat }).eq("id", ec.id);
                                  setAssignments(p => ({ ...p, [ec.id]: newSeat }));
                                  fire("Seat updated");
                                }
                                setEditingSeat(null);
                              }} style={{ fontSize: 10, padding: "2px 6px", background: C.blue, border: "none", borderRadius: 4, color: "#fff", cursor: "pointer" }}>✓</button>
                          </div>
                        ) : (
                        <button onClick={() => setEditingSeat({ ecId: ec.id, value: seat })}
                          style={{ fontSize: 10, padding: "2px 7px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 4, color: C.muted, cursor: "pointer" }}>Edit</button>
                        )}
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

export default SeatingView;