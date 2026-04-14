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
import { Spin, Alert, Inp, ViewHint, ScoreBadge, ImageUploadZone } from "../components/Shared";

// PricingPage
function PricingPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [annual, setAnnual] = useState(false);

  const PLANS = [
    { name:"Starter", monthly:49, desc:"Small businesses, 1–2 events/month", color:"#0A84FF", features:["500 contacts","3 events/month","AI email generation","Registration forms","Basic analytics","Email support"] },
    { name:"Growth", monthly:199, desc:"SMBs managing 3–10 events", color:"#30D158", badge:"Most Popular", features:["5,000 contacts","Unlimited events","AI drip campaigns","Landing page builder","Advanced analytics + ROI","CRM export (Salesforce)","Priority support"] },
    { name:"Pro", monthly:599, desc:"Agencies, multi-client", color:"#FF9F0A", features:["Unlimited contacts","Multi-client white-label","Brand kit per client","Full Salesforce + nCino","Team roles & permissions","Dedicated onboarding","SLA support"] },
    { name:"Enterprise", monthly:null, desc:"Custom data residency & SSO", color:"#BF5AF2", features:["Everything in Pro","Custom data residency","SSO / SAML","Custom integrations","Legal agreements","Dedicated CSM"] },
  ];

  const REPLACED = [
    { tool:"Mailchimp", cost:350, icon:"✉️", what:"Email marketing" },
    { tool:"Eventbrite", cost:299, icon:"🎟", what:"Event ticketing" },
    { tool:"Typeform", cost:99, icon:"📋", what:"Registration forms" },
    { tool:"Unbounce", cost:200, icon:"🌐", what:"Landing pages" },
    { tool:"Zapier", cost:200, icon:"⚡", what:"Automation" },
  ];

  const COMPARE = [
    { feature:"AI email generation", evara:true, mailchimp:false, eventbrite:false },
    { feature:"Event lifecycle view", evara:true, mailchimp:false, eventbrite:false },
    { feature:"Built-in registration forms", evara:true, mailchimp:false, eventbrite:true },
    { feature:"Landing page builder", evara:true, mailchimp:true, eventbrite:false },
    { feature:"Contact deduplication", evara:true, mailchimp:false, eventbrite:false },
    { feature:"RSVP status tracking", evara:true, mailchimp:false, eventbrite:true },
    { feature:"QR code check-in", evara:true, mailchimp:false, eventbrite:true },
    { feature:"Salesforce export", evara:true, mailchimp:"paid", eventbrite:false },
    { feature:"GDPR compliance", evara:true, mailchimp:true, eventbrite:true },
    { feature:"Analytics dashboard", evara:true, mailchimp:"basic", eventbrite:"basic" },
  ];

  const FAQS = [
    { q:"Is there a free trial?", a:"Yes — sign up at evara-tau.vercel.app and get full access to all features during the beta. No credit card required." },
    { q:"Can I import my existing contacts?", a:"Yes. evara accepts CSV uploads, paste-in email lists, and 'First Last <email>' format. It deduplicates automatically and skips personal emails." },
    { q:"Does it replace Mailchimp?", a:"For event marketing, yes. evara handles everything from Save the Date through attendance tracking in one place. If you run a general newsletter, you may still want a separate tool for that." },
    { q:"How does AI email generation work?", a:"You give evara your event details (name, date, location, description). It calls Claude — Anthropic's AI — and generates a full, formatted email using your brand colours and sender name. No PII is ever sent to the AI." },
    { q:"Is my data safe?", a:"Each company's data is fully isolated using Supabase Row Level Security. Data is encrypted at rest (AES-256) and in transit (TLS 1.3). No contact data is ever shared across tenants." },
    { q:"What happens when I cancel?", a:"You can export all your data (contacts, emails, analytics) as CSV at any time. We honour right-to-erasure requests within 30 days." },
  ];

  const handleSubmit = async () => {
    if (!email?.includes("@")) return;
    setSubmitting(true);
    try { await supabase.from("waitlist").insert({ email, name, company, created_at: new Date().toISOString() }); } catch {}
    setSubmitted(true); setSubmitting(false);
  };

  const totalReplaced = REPLACED.reduce((s,t) => s+t.cost, 0);

  return (
    <div style={{ minHeight:"100vh", background:"#080809", fontFamily:"Outfit,sans-serif", color:"#F5F5F7" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}a{text-decoration:none}button{cursor:pointer;font-family:Outfit,sans-serif}input{font-family:Outfit,sans-serif}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Nav */}
      <nav style={{ borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"16px 40px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:"rgba(8,8,9,0.92)", backdropFilter:"blur(12px)", zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, background:"#0A84FF", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#fff" }}>e</div>
          <span style={{ fontSize:17, fontWeight:700, letterSpacing:"-0.4px" }}>evara</span>
          <span style={{ fontSize:10, background:"rgba(10,132,255,0.2)", color:"#0A84FF", padding:"2px 7px", borderRadius:4, fontWeight:600, letterSpacing:"0.5px" }}>BETA</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <a href="#compare" style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>Compare</a>
          <a href="#faq" style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>FAQ</a>
          <a href="/" style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>← Back to app</a>
          <a href="#waitlist" style={{ fontSize:13, fontWeight:600, background:"#0A84FF", color:"#fff", padding:"7px 18px", borderRadius:8 }}>Get early access →</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign:"center", padding:"88px 24px 64px", animation:"fadeUp .4s ease" }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:"2.5px", textTransform:"uppercase", color:"#0A84FF", marginBottom:18 }}>Simple, honest pricing</div>
        <h1 style={{ fontSize:"clamp(36px,5.5vw,64px)", fontWeight:800, letterSpacing:"-1.5px", lineHeight:1.05, marginBottom:20 }}>
          Replace 5 tools.<br /><span style={{ color:"#0A84FF" }}>One subscription.</span>
        </h1>
        <p style={{ fontSize:18, color:"rgba(255,255,255,0.5)", maxWidth:540, margin:"0 auto 40px", lineHeight:1.7 }}>
          Mailchimp + Eventbrite + Typeform + Unbounce + Zapier — all in evara, starting at $49/month.
        </p>

        {/* Billing toggle */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:12, background:"rgba(255,255,255,0.06)", borderRadius:999, padding:"6px 20px", marginBottom:56 }}>
          <span style={{ fontSize:13, color: !annual?"#fff":"rgba(255,255,255,0.4)", fontWeight: !annual?600:400 }}>Monthly</span>
          <div onClick={() => setAnnual(a=>!a)} style={{ width:44, height:24, borderRadius:12, background: annual?"#0A84FF":"rgba(255,255,255,0.15)", cursor:"pointer", position:"relative", transition:"background .2s" }}>
            <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left: annual?23:3, transition:"left .2s", boxShadow:"0 1px 4px rgba(0,0,0,.3)" }} />
          </div>
          <span style={{ fontSize:13, color: annual?"#fff":"rgba(255,255,255,0.4)", fontWeight: annual?600:400 }}>Annual <span style={{ fontSize:10, color:"#30D158", fontWeight:700 }}>-20%</span></span>
        </div>

        {/* Plan cards */}
        <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap", maxWidth:1080, margin:"0 auto 96px" }}>
          {PLANS.map((plan, i) => {
            const price = plan.monthly ? (annual ? Math.round(plan.monthly*0.8) : plan.monthly) : null;
            const isPopular = i === 1;
            return (
              <div key={plan.name} style={{ background: isPopular?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.03)", border:`1px solid ${isPopular?plan.color+"50":"rgba(255,255,255,0.09)"}`, borderRadius:18, padding:"28px 24px", width:240, textAlign:"left", position:"relative", flexShrink:0, transition:"transform .2s", boxShadow: isPopular?`0 0 40px ${plan.color}15`:"none" }}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                {plan.badge && <div style={{ position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)", background:plan.color, color:"#000", fontSize:10, fontWeight:800, padding:"3px 14px", borderRadius:999, letterSpacing:"0.8px", textTransform:"uppercase", whiteSpace:"nowrap" }}>{plan.badge}</div>}
                <div style={{ fontSize:11, fontWeight:700, color:plan.color, textTransform:"uppercase", letterSpacing:"1px", marginBottom:8 }}>{plan.name}</div>
                <div style={{ display:"flex", alignItems:"baseline", gap:2, marginBottom:6 }}>
                  {price ? <>
                    <span style={{ fontSize:44, fontWeight:800, letterSpacing:"-2px" }}>${price}</span>
                    <span style={{ fontSize:13, color:"rgba(255,255,255,0.35)" }}>/mo{annual?" billed annually":""}</span>
                  </> : <span style={{ fontSize:28, fontWeight:800 }}>Custom</span>}
                </div>
                <p style={{ fontSize:12.5, color:"rgba(255,255,255,0.4)", marginBottom:22, lineHeight:1.5 }}>{plan.desc}</p>
                <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:24 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:12.5, color:"rgba(255,255,255,0.7)" }}>
                      <span style={{ color:plan.color, flexShrink:0, marginTop:1 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <a href="#waitlist" onClick={e=>{e.preventDefault();document.getElementById("waitlist-email")?.focus();}}
                  style={{ display:"block", textAlign:"center", padding:"11px", background: isPopular?plan.color:"transparent", border:`1.5px solid ${isPopular?"transparent":plan.color+"60"}`, borderRadius:9, color: isPopular?"#000":"#fff", fontSize:13.5, fontWeight:700 }}>
                  {plan.monthly ? "Join waitlist →" : "Contact us →"}
                </a>
              </div>
            );
          })}
        </div>

        {/* Savings calculator */}
        <div style={{ maxWidth:680, margin:"0 auto 96px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"36px 40px" }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", marginBottom:12 }}>What you're replacing</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:28 }}>
            {REPLACED.map(r => (
              <div key={r.tool} style={{ textAlign:"center" }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{r.icon}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", textDecoration:"line-through" }}>${r.cost}/mo</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.2)", marginTop:2 }}>{r.tool}</div>
              </div>
            ))}
          </div>
          <div style={{ height:1, background:"rgba(255,255,255,0.07)", marginBottom:24 }} />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
            <div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.4)" }}>Current stack cost</div>
              <div style={{ fontSize:32, fontWeight:800, color:"rgba(255,255,255,0.4)", letterSpacing:"-1px", textDecoration:"line-through" }}>${totalReplaced.toLocaleString()}/mo</div>
            </div>
            <div style={{ fontSize:28, color:"rgba(255,255,255,0.2)" }}>→</div>
            <div>
              <div style={{ fontSize:13, color:"#30D158" }}>evara Growth plan</div>
              <div style={{ fontSize:32, fontWeight:800, color:"#30D158", letterSpacing:"-1px" }}>$199/mo</div>
            </div>
            <div style={{ background:"rgba(48,209,88,0.12)", border:"1px solid rgba(48,209,88,0.25)", borderRadius:12, padding:"14px 20px", textAlign:"center" }}>
              <div style={{ fontSize:11, color:"#30D158", fontWeight:600, textTransform:"uppercase", letterSpacing:"1px" }}>You save</div>
              <div style={{ fontSize:36, fontWeight:800, color:"#30D158", letterSpacing:"-1px" }}>${(totalReplaced-199).toLocaleString()}</div>
              <div style={{ fontSize:11, color:"rgba(48,209,88,0.6)" }}>per month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div id="compare" style={{ maxWidth:760, margin:"0 auto 96px", padding:"0 24px" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <h2 style={{ fontSize:36, fontWeight:800, letterSpacing:"-1px", marginBottom:10 }}>evara vs the alternatives</h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.4)" }}>Built specifically for event marketing — not a general-purpose tool bolted together</p>
        </div>
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                <th style={{ padding:"14px 20px", textAlign:"left", fontSize:12, color:"rgba(255,255,255,0.3)", fontWeight:500 }}>Feature</th>
                {[{n:"evara",c:"#0A84FF"},{n:"Mailchimp",c:null},{n:"Eventbrite",c:null}].map(h => (
                  <th key={h.n} style={{ padding:"14px 20px", textAlign:"center", fontSize:13, fontWeight:700, color:h.c||"rgba(255,255,255,0.4)" }}>{h.n}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row, i) => (
                <tr key={row.feature} style={{ borderBottom: i<COMPARE.length-1?"1px solid rgba(255,255,255,0.05)":"none" }}>
                  <td style={{ padding:"12px 20px", fontSize:13, color:"rgba(255,255,255,0.65)" }}>{row.feature}</td>
                  {[row.evara, row.mailchimp, row.eventbrite].map((v, j) => (
                    <td key={j} style={{ padding:"12px 20px", textAlign:"center" }}>
                      {v === true ? <span style={{ color:"#30D158", fontSize:16 }}>✓</span>
                       : v === false ? <span style={{ color:"rgba(255,255,255,0.15)", fontSize:14 }}>✗</span>
                       : <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)", background:"rgba(255,255,255,0.06)", padding:"2px 8px", borderRadius:4, fontWeight:500 }}>{v}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div id="faq" style={{ maxWidth:640, margin:"0 auto 96px", padding:"0 24px" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <h2 style={{ fontSize:36, fontWeight:800, letterSpacing:"-1px", marginBottom:10 }}>FAQ</h2>
        </div>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
            <button onClick={() => setOpenFaq(openFaq===i?null:i)} style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 0", background:"none", border:"none", color:"#F5F5F7", fontSize:15, fontWeight:500, textAlign:"left", cursor:"pointer" }}>
              {faq.q}
              <span style={{ fontSize:18, color:"rgba(255,255,255,0.3)", transform: openFaq===i?"rotate(45deg)":"none", transition:"transform .2s", flexShrink:0, marginLeft:16 }}>+</span>
            </button>
            {openFaq===i && <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.7, paddingBottom:18 }}>{faq.a}</p>}
          </div>
        ))}
      </div>

      {/* Waitlist */}
      <div id="waitlist" style={{ maxWidth:480, margin:"0 auto 80px", padding:"0 24px" }}>
        <div style={{ background:"rgba(10,132,255,0.06)", border:"1px solid rgba(10,132,255,0.2)", borderRadius:20, padding:"40px 36px" }}>
          {submitted ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
              <h2 style={{ fontSize:24, fontWeight:800, marginBottom:8 }}>You're on the list!</h2>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.6 }}>We'll email you with early access soon. You'll get 3 months free on any plan.</p>
            </div>
          ) : (
            <>
              <div style={{ textAlign:"center", marginBottom:24 }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:"#0A84FF", marginBottom:10 }}>Early Access</div>
                <h2 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.5px", marginBottom:8 }}>Join the waitlist</h2>
                <p style={{ fontSize:13.5, color:"rgba(255,255,255,0.45)", lineHeight:1.6 }}>Get early access + 3 months free on any plan at launch.</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, color:"#fff", padding:"12px 15px", fontSize:14, outline:"none" }} />
                <input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Company" style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, color:"#fff", padding:"12px 15px", fontSize:14, outline:"none" }} />
                <input id="waitlist-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} placeholder="Work email" style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, color:"#fff", padding:"12px 15px", fontSize:14, outline:"none" }} />
                <button onClick={handleSubmit} disabled={submitting||!email?.includes("@")} style={{ padding:"14px", background:submitting||!email?.includes("@")?"rgba(10,132,255,0.4)":"#0A84FF", border:"none", borderRadius:9, color:"#fff", fontSize:15, fontWeight:700, boxShadow:"0 4px 20px rgba(10,132,255,0.35)" }}>
                  {submitting ? "Joining…" : "Request Early Access →"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"20px 40px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <span style={{ fontSize:11, color:"rgba(255,255,255,0.2)" }}>© {new Date().getFullYear()} evara · evarahq.com</span>
        <div style={{ display:"flex", gap:20 }}>
          {["🔒 GDPR","✉️ SendGrid","🤖 Claude AI","🗄 Supabase"].map(t=><span key={t} style={{ fontSize:11, color:"rgba(255,255,255,0.2)" }}>{t}</span>)}
        </div>
        <div style={{ display:"flex", gap:16 }}>
          <a href="/" style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>← App</a>
          <a href="mailto:hello@evarahq.com" style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>Contact</a>
        </div>
      </div>
    </div>
  );
}

// ─── UNSUBSCRIBE PAGE ─────────────────────────────────────────

export default PricingPage;