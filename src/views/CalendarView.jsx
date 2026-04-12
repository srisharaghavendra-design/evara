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

// CalendarView
function CalendarView({ supabase, profile, events, setActiveEvent, setView, fire, campaigns: propCampaigns, activeEvent }) {
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [allCampaigns, setAllCampaigns] = useState(propCampaigns || []);

  useEffect(() => {
    if (!profile?.company_id) return;
    supabase.from("email_campaigns")
      .select("id,name,email_type,status,scheduled_at,send_at,event_id,subject")
      .eq("company_id", profile.company_id)
      .not("scheduled_at", "is", null)
      .order("scheduled_at")
      .then(({ data }) => setAllCampaigns(data || []));
  }, [profile?.company_id]);

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
  (allCampaigns || []).filter(c => c.scheduled_at || c.send_at).forEach(c => {
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

export default CalendarView;