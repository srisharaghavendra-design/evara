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

// UnsubscribePage
function UnsubscribePage() {
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [email, setEmail] = useState("");
  const params = new URLSearchParams(window.location.search);
  useEffect(() => { const e = params.get("email"); if (e) setEmail(decodeURIComponent(e)); }, []);

  const doUnsubscribe = async () => {
    if (!email) return;
    setStatus("loading");
    try {
      await supabase.from("contacts")
        .update({ unsubscribed: true, unsubscribed_at: new Date().toISOString(), opted_in: false })
        .eq("email", email.toLowerCase().trim());
      setStatus("done");
    } catch { setStatus("error"); }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#F2F2F7", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Outfit,-apple-system,sans-serif", padding:20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ background:"#fff", borderRadius:20, padding:"48px 40px", maxWidth:460, width:"100%", textAlign:"center", boxShadow:"0 8px 40px rgba(0,0,0,0.08)" }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:32 }}>
          <div style={{ width:24, height:24, borderRadius:6, background:"#0A84FF", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          </div>
          <span style={{ fontSize:16, fontWeight:700, letterSpacing:"-0.3px" }}>evara</span>
        </div>

        {status === "done" ? (
          <>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"#E8F5E9", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 20px" }}>✅</div>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#111", marginBottom:10 }}>Successfully unsubscribed</h1>
            <p style={{ fontSize:14, color:"#666", lineHeight:1.7, marginBottom:20 }}>
              <strong style={{ color:"#111" }}>{email}</strong> has been removed from all future event emails.
            </p>
            <div style={{ background:"#F8F9FA", borderRadius:12, padding:"14px 18px", fontSize:13, color:"#666", lineHeight:1.6 }}>
              Changed your mind? Contact the event organiser directly to be re-added to their guest list.
            </div>
            <div style={{ marginTop:24, fontSize:11, color:"#bbb" }}>Powered by evara · evarahq.com</div>
          </>
        ) : status === "error" ? (
          <>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"#FFF0F0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 20px" }}>❌</div>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#111", marginBottom:10 }}>Something went wrong</h1>
            <p style={{ fontSize:14, color:"#666", marginBottom:20 }}>We couldn't process your request. Please try again or contact the event organiser.</p>
            <button onClick={() => setStatus("idle")} style={{ padding:"10px 24px", borderRadius:8, border:"1px solid #ddd", background:"transparent", fontSize:14, cursor:"pointer" }}>Try again</button>
          </>
        ) : (
          <>
            <div style={{ width:64, height:64, borderRadius:"50%", background:"#FFF8E7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 20px" }}>📧</div>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#111", marginBottom:10 }}>Unsubscribe from event emails</h1>
            <p style={{ fontSize:14, color:"#666", marginBottom:24, lineHeight:1.7 }}>
              Confirm your email address below and you'll be removed from all future event communications.
            </p>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address"
              style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #D1D1D6", borderRadius:10, fontSize:15, outline:"none", marginBottom:12, textAlign:"center" }}
              onFocus={e=>e.target.style.borderColor="#0A84FF"} onBlur={e=>e.target.style.borderColor="#D1D1D6"} />
            <button onClick={doUnsubscribe} disabled={status==="loading"||!email}
              style={{ width:"100%", padding:13, background:status==="loading"||!email?"#E5E5EA":"#111", color:status==="loading"||!email?"#999":"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:600, cursor:status==="loading"||!email?"not-allowed":"pointer", transition:"background .15s" }}>
              {status==="loading"?"Unsubscribing…":"Unsubscribe me"}
            </button>
            <p style={{ marginTop:16, fontSize:12, color:"#999", lineHeight:1.6 }}>
              This will remove you from all emails sent via evara by this organisation. Transactional emails (booking confirmations) may still be sent.
            </p>
            <div style={{ marginTop:20, fontSize:11, color:"#ccc" }}>Powered by evara · evarahq.com</div>
          </>
        )}
      </div>
    </div>
  );
}


// ─── PUBLIC FORM PAGE ─────────────────────────────────────────
// Rendered when someone visits /form/:token — no auth required

export default UnsubscribePage;