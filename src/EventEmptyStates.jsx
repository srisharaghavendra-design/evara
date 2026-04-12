// EventEmptyStates — empty state components for evara views

const C = {
  blue: "#3B82F6",
  green: "#22C55E",
  amber: "#F59E0B",
  teal: "#14B8A6",
  muted: "#64748b",
  sec: "#94a3b8",
  border: "rgba(255,255,255,0.07)",
  card: "#1a1f2e",
  raised: "rgba(255,255,255,0.04)",
  text: "#f1f5f9",
};

// ── Contacts view empty state ─────────────────────────────────────────────────
export function EmptyContacts({ onImport, onManual }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: "44px 32px",
      textAlign: "center",
      maxWidth: 560,
      margin: "0 auto",
    }}>
      {/* Icon cluster */}
      <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto 20px" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: `${C.blue}14`,
          border: `2px solid ${C.blue}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32,
        }}>👥</div>
        <div style={{
          position: "absolute", bottom: -2, right: -2,
          width: 26, height: 26, borderRadius: "50%",
          background: C.amber,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, border: `2px solid #1a1f2e`,
        }}>!</div>
      </div>

      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>
        No contacts yet
      </div>
      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 28, maxWidth: 380, margin: "0 auto 28px" }}>
        Add your guest list to start tracking RSVPs, send invitations, and see who's coming. Every contact gets their own status — confirmed, pending, attended.
      </div>

      {/* Import methods */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20, maxWidth: 420, margin: "0 auto 20px" }}>
        {[
          { icon: "📋", title: "Paste from spreadsheet", desc: "Copy rows from Excel or Sheets — we handle the rest" },
          { icon: "📁", title: "Upload CSV file", desc: "Name, email, company — standard format" },
          { icon: "✍️", title: "Add manually", desc: "Type contacts one at a time" },
          { icon: "🔗", title: "Use RSVP form", desc: "Share a link — contacts self-register" },
        ].map(m => (
          <div key={m.title} style={{
            padding: "12px 14px",
            background: C.raised,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            textAlign: "left",
            cursor: "default",
          }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{m.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2 }}>{m.title}</div>
            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button
          onClick={onImport}
          style={{
            padding: "10px 22px",
            background: C.blue,
            border: "none",
            borderRadius: 9,
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}>
          📁 Import contacts →
        </button>
        <button
          onClick={onManual}
          style={{
            padding: "10px 18px",
            background: "transparent",
            border: `1px solid ${C.border}`,
            borderRadius: 9,
            color: C.muted,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}>
          ✍️ Add manually
        </button>
      </div>

      <div style={{ marginTop: 20, fontSize: 11, color: C.sec }}>
        💡 Tip — contacts added here sync automatically with your RSVP forms
      </div>
    </div>
  );
}

// ── Analytics view empty state ────────────────────────────────────────────────
export function EmptyAnalytics({ onGoToEdm, onGoToSchedule }) {
  const steps = [
    { n: 1, icon: "✨", label: "Build an email", desc: "AI generates a polished invite in ~15 seconds", action: onGoToEdm, cta: "Open eDM Builder" },
    { n: 2, icon: "🚀", label: "Send to your list", desc: "Click Send in Scheduling — reaches all contacts instantly", action: onGoToSchedule, cta: "Go to Scheduling" },
    { n: 3, icon: "📊", label: "Watch data flow in", desc: "Open rates, clicks, and RSVP stats appear here live", action: null, cta: null },
  ];

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: "40px 32px",
      maxWidth: 540,
      margin: "0 auto",
    }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>📈</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 8 }}>Analytics wake up when you send</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
          Three steps and your dashboard comes alive — open rates, click rates, conversions, and the full RSVP funnel.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{ display: "flex", gap: 16, paddingBottom: i < steps.length - 1 ? 0 : 0 }}>
            {/* Timeline */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `${C.blue}18`,
                border: `2px solid ${C.blue}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, flexShrink: 0,
              }}>{s.icon}</div>
              {i < steps.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 24, background: `${C.blue}20`, margin: "4px 0" }} />
              )}
            </div>
            {/* Content */}
            <div style={{ paddingBottom: i < steps.length - 1 ? 20 : 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: s.action ? 8 : 0 }}>{s.desc}</div>
              {s.action && (
                <button onClick={s.action} style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: C.blue,
                  background: "transparent",
                  border: `1px solid ${C.blue}40`,
                  borderRadius: 6,
                  padding: "4px 12px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}>{s.cta} →</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, padding: "12px 16px", background: `${C.teal}0a`, border: `1px solid ${C.teal}20`, borderRadius: 9 }}>
        <div style={{ fontSize: 11.5, color: C.teal, fontWeight: 600, marginBottom: 3 }}>Industry benchmarks to aim for</div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[["Open rate", "25%+"], ["Click rate", "3–5%"], ["RSVP conversion", "40%+"]].map(([k, v]) => (
            <div key={k} style={{ fontSize: 11, color: C.muted }}>
              <span style={{ fontWeight: 600, color: C.teal }}>{v}</span> {k}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Scheduling view empty state (upgraded) ────────────────────────────────────
export function EmptySchedule({ onGoToEdm, onGoToCampaign }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: "44px 32px",
      textAlign: "center",
      maxWidth: 540,
      margin: "0 auto",
    }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>📅</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 8 }}>No emails drafted yet</div>
      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 24, maxWidth: 380, margin: "0 auto 24px" }}>
        Draft emails in the eDM Builder — AI writes them in seconds from your event brief. Once drafted, they appear here ready to send or schedule.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, maxWidth: 420, margin: "0 auto 24px" }}>
        {[
          { icon: "📅", title: "Save the Date", desc: "Lock in calendars early" },
          { icon: "✉️", title: "Invitation", desc: "Full details + RSVP" },
          { icon: "⏰", title: "Reminders", desc: "1 week + 1 day before" },
          { icon: "📍", title: "Day-of Details", desc: "Location, parking, agenda" },
          { icon: "✅", title: "Confirmation", desc: "Sent on RSVP confirm" },
          { icon: "🙏", title: "Thank You", desc: "Post-event follow-up" },
        ].map(e => (
          <div key={e.title} style={{
            padding: "10px 12px",
            background: C.raised,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            textAlign: "left",
          }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{e.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginBottom: 2 }}>{e.title}</div>
            <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.3 }}>{e.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={onGoToEdm} style={{
          padding: "10px 22px",
          background: C.blue,
          border: "none",
          borderRadius: 9,
          color: "#fff",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "inherit",
        }}>✨ Build emails with AI →</button>
        <button onClick={onGoToCampaign} style={{
          padding: "10px 18px",
          background: "transparent",
          border: `1px solid ${C.border}`,
          borderRadius: 9,
          color: C.muted,
          fontSize: 13,
          cursor: "pointer",
          fontFamily: "inherit",
        }}>⚡ Generate 7-email campaign</button>
      </div>
    </div>
  );
}

// ── Generic metric placeholder (for empty metric cards) ───────────────────────
export function EmptyMetric({ label, hint }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.15)", letterSpacing: "-1px" }}>—</div>
      {hint && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>{hint}</div>}
    </div>
  );
}
