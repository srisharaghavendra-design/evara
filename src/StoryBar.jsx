import { useMemo } from 'react';

function detectChapter(event, stats) {
  if (!event?.event_date) return 1;
  const daysTo = Math.ceil((new Date(event.event_date) - new Date()) / 86400000);
  if (daysTo < -1) return 4;
  if (daysTo <= 1)  return 3;
  if (stats.emailsSent > 0 || stats.contacts > 0) return 2;
  return 1;
}

function chapterCopy(n, event, stats) {
  const name   = event?.name ?? 'your event';
  const daysTo = event?.event_date ? Math.ceil((new Date(event.event_date) - new Date()) / 86400000) : null;
  const chapters = {
    1: {
      label:'The Setup', icon:'🏗',
      palette:{ bg:'#FFF9F0', accent:'#C2540A', pill:'#FEE9D0', track:'#FED7AA' },
      heading: stats.emailDrafts > 0 ? 'Emails are ready. Now your guests need to exist.' : 'Lets lay the foundation for ' + name + '.',
      body: stats.emailDrafts > 0
        ? 'You have drafted ' + stats.emailDrafts + ' email' + (stats.emailDrafts !== 1 ? 's' : '') + ' - the hard part is done. Import contacts and the whole campaign unlocks.'
        : 'Every great event starts with two things: knowing who is coming and what to say to them.',
      cta:'Import guest list', ctaKey:'contacts',
      next:'Once you add contacts, you can send your first email and RSVPs will start flowing in.',
    },
    2: {
      label:'Getting the Word Out', icon:'📣',
      palette:{ bg:'#F0F7FF', accent:'#1D4ED8', pill:'#DBEAFE', track:'#BFDBFE' },
      heading: stats.emailsSent === 0
        ? stats.contacts + ' contact' + (stats.contacts !== 1 ? 's' : '') + ' imported. They just do not know yet.'
        : stats.confirmed > 0
          ? stats.confirmed + ' people said yes. Keep the momentum going.'
          : stats.emailsSent + ' email' + (stats.emailsSent !== 1 ? 's' : '') + ' sent - waiting for your first RSVP.',
      body: stats.emailsSent === 0
        ? 'Your guest list is ready.' + (daysTo ? ' You have ' + daysTo + ' days until the event.' : '') + ' Send the save-the-date now.'
        : stats.confirmed === 0
          ? 'Open rates take 24-48 hours to peak. A second touch doubles response rates.'
          : stats.confirmed + ' confirmed' + (daysTo ? ', ' + daysTo + ' days to go' : '') + '. Anyone who has not responded yet needs one more nudge.',
      cta: stats.emailsSent === 0 ? 'Send save-the-date' : 'Send reminder',
      ctaKey:'schedule',
      next: daysTo && daysTo <= 14
        ? 'Event is in ' + daysTo + ' days - confirm final numbers and set up check-in.'
        : 'A reminder 7 days out and 1 day out will bring your no-response rate down significantly.',
    },
    3: {
      label:'Event Day', icon:'🎪',
      palette:{ bg:'#F0FDF4', accent:'#15803D', pill:'#DCFCE7', track:'#BBF7D0' },
      heading: stats.checkedIn > 0
        ? stats.checkedIn + ' people are already in the room.'
        : stats.confirmed > 0
          ? stats.confirmed + ' people confirmed. Doors open - check-in is ready.'
          : 'Today is the day. Lets get people through the door.',
      body: stats.checkedIn > 0
        ? stats.checkedIn + ' checked in so far. The kiosk is live - walk-ins can be added on the spot.'
        : 'Your check-in kiosk is set up and waiting. Guests can scan their QR or be looked up by name.',
      cta:'Open check-in kiosk', ctaKey:'checkin',
      next:'After the event wraps, come back here to send thank-you emails in one click.',
    },
    4: {
      label:'The Afterglow', icon:'✨',
      palette:{ bg:'#FDF4FF', accent:'#7E22CE', pill:'#F3E8FF', track:'#E9D5FF' },
      heading: stats.checkedIn > 0
        ? stats.checkedIn + ' people showed up. Now close the loop.'
        : 'The event is done. Time to make it count.',
      body: stats.checkedIn > 0
        ? 'Send thank-you emails while the memory is fresh - people who get one are 3x more likely to attend the next event.'
        : 'A thank-you email to everyone who confirmed goes a long way.',
      cta:'Send thank-you emails', ctaKey:'thankyou',
      next:'Download your attendee report to share with whoever asked how it went.',
    },
  };
  return chapters[n];
}

const META = [
  { n:1, label:'Setup',     icon:'🏗' },
  { n:2, label:'Word Out',  icon:'📣' },
  { n:3, label:'Event Day', icon:'🎪' },
  { n:4, label:'Afterglow', icon:'✨' },
];

export default function StoryBar({ event, stats = {}, onAction }) {
  const s = { contacts:0, emailsSent:0, emailDrafts:0, confirmed:0, checkedIn:0, ...stats };
  const chapter = useMemo(() => detectChapter(event, s), [event, JSON.stringify(s)]);
  const copy    = useMemo(() => chapterCopy(chapter, event, s), [chapter, event, JSON.stringify(s)]);
  const { palette } = copy;
  return (
    <div style={{ background:palette.bg, border:'1px solid ' + palette.track, borderRadius:16, overflow:'hidden', fontFamily:'system-ui,sans-serif', marginBottom:18 }}>
      <div style={{ padding:'12px 18px', display:'flex', alignItems:'center', borderBottom:'1px solid ' + palette.track, overflowX:'auto', gap:0 }}>
        {META.map((c, i) => {
          const done = c.n < chapter, active = c.n === chapter, future = c.n > chapter;
          return (
            <div key={c.n} style={{ display:'flex', alignItems:'center', flex: active ? '1 1 auto' : '0 0 auto' }}>
              {i > 0 && <div style={{ height:2, width:18, minWidth:18, background: done||active ? palette.accent : palette.track, opacity: future ? 0.4 : 1 }} />}
              <div style={{ display:'flex', alignItems:'center', gap:5, padding: active ? '5px 13px' : '4px 9px', borderRadius:99, background: active ? palette.accent : done ? palette.pill : 'transparent', border:'1.5px solid ' + (active ? palette.accent : palette.track), opacity: future ? 0.45 : 1, whiteSpace:'nowrap' }}>
                {done ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={palette.accent} strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg> : <span style={{ fontSize: active ? 13 : 11 }}>{c.icon}</span>}
                <span style={{ fontSize: active ? 12 : 11, fontWeight: active ? 700 : done ? 500 : 400, color: active ? '#fff' : done ? palette.accent : '#94a3b8' }}>{c.label}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ padding:'18px 22px 16px' }}>
        <h2 style={{ margin:'0 0 8px', fontSize:18, fontWeight:800, color:'#0f172a', lineHeight:1.25 }}>{copy.heading}</h2>
        <p style={{ margin:'0 0 14px', fontSize:13, lineHeight:1.7, color:'#475569', maxWidth:580 }}>{copy.body}</p>
        <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <button onClick={() => onAction?.(copy.ctaKey)} style={{ background:palette.accent, color:'#fff', border:'none', borderRadius:9, padding:'10px 20px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            {copy.cta} →
          </button>
          <p style={{ margin:0, fontSize:11, color:'#94a3b8', lineHeight:1.6, maxWidth:360 }}>
            <span style={{ color:palette.accent, fontWeight:600 }}>Coming up: </span>{copy.next}
          </p>
        </div>
      </div>
    </div>
  );
      }
