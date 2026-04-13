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

// QAView
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
    const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
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

export default QAView;