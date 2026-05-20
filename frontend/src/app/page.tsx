"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const CYCLING = ["closes deals faster", "moves pipelines", "forecasts revenue", "never loses context", "stays organized"];

const FEATURES = [
  { icon: "⬡", title: "Kanban Pipeline", desc: "Drag deals across 6 stages. Column totals update live.", tag: "P0" },
  { icon: "⌘", title: "Global Search", desc: "Cmd+K palette across all customers, deals, activities.", tag: "P0" },
  { icon: "✎", title: "Notes", desc: "Rich notes pinned to any customer or deal.", tag: "P0" },
  { icon: "⊡", title: "Task Queue", desc: "Due-today + overdue views so nothing slips.", tag: "P0" },
  { icon: "◎", title: "Status Lifecycle", desc: "Lead → Prospect → Active → Churned, tracked.", tag: "P0" },
  { icon: "♥", title: "Deal Health Score", desc: "0–100 heuristic: recency, velocity, close date.", tag: "P1" },
  { icon: "⊞", title: "Audit Log", desc: "Every change logged. Who did what, and when.", tag: "P1" },
  { icon: "⬡", title: "Webhooks", desc: "HMAC-signed delivery with 3-retry backoff.", tag: "P1" },
  { icon: "↯", title: "CSV Import/Export", desc: "Migrate from spreadsheets in seconds.", tag: "P1" },
  { icon: "◫", title: "Date Range Filter", desc: "Slice every dashboard metric by period.", tag: "P1" },
  { icon: "◉", title: "Contacts Model", desc: "Multiple contacts per company, starred primary.", tag: "P1" },
  { icon: "✦", title: "AI Enrichment", desc: "Auto-populate company data from a single click.", tag: "P2" },
  { icon: "⬡", title: "JWT Auth", desc: "bcrypt passwords. Short-lived tokens. Secure.", tag: "P2" },
  { icon: "⊛", title: "RBAC", desc: "Admins vs members. Granular per-endpoint guards.", tag: "P2" },
  { icon: "▲", title: "Revenue Forecast", desc: "Weighted pipeline, commit, best-case — live.", tag: "P2" },
];

const STATS = [
  { value: "17", label: "Deals seeded", sub: "across 6 pipeline stages" },
  { value: "12", label: "Companies", sub: "with contacts & history" },
  { value: "15", label: "Features", sub: "shipped in v1.2" },
  { value: "0", label: "Extra deps", sub: "native HTML5 drag & drop" },
];

const TAG_COLOR: Record<string, string> = {
  P0: "bg-[#E6F4EC] text-[#2E8B57]",
  P1: "bg-[#F1EEF8] text-[#7660A8]",
  P2: "bg-[#FBF1DC] text-[#C28A00]",
};

export default function LandingPage() {
  const { user } = useAuth();
  const [wordIdx, setWordIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIdx((i) => (i + 1) % CYCLING.length);
        setVisible(true);
      }, 350);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes floatSlow { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-14px) rotate(2deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(1.5);opacity:0} }
        @keyframes slideRight { from{transform:translateX(-100%)} to{transform:translateX(100%)} }
        .fade-up { animation: fadeUp .7s ease both; }
        .float { animation: float 4s ease-in-out infinite; }
        .float-slow { animation: floatSlow 6s ease-in-out infinite; }
        .shimmer-text {
          background: linear-gradient(90deg,#7660A8 0%,#C9C0DE 40%,#7660A8 60%,#5C4A8E 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .card-hover { transition: transform .24s cubic-bezier(.22,1,.36,1), box-shadow .24s cubic-bezier(.22,1,.36,1); }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(118,96,168,.18); }
        .stripe { background: repeating-linear-gradient(135deg,transparent,transparent 12px,rgba(118,96,168,.04) 12px,rgba(118,96,168,.04) 24px); }
      `}</style>

      <div style={{ fontFamily: "'Poppins',system-ui,sans-serif" }} className="min-h-screen bg-white text-[#0F0F12] overflow-x-hidden">

        {/* ── NAV ──────────────────────────────────────────────────────── */}
        <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-[#E8E8EC]">
          <Link href="/" className="text-lg font-bold tracking-tight text-[#7660A8]">DClaw CRM</Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {["Features","Stack","Pricing"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="px-3 py-1.5 rounded-lg text-[#7A7A85] hover:text-[#7660A8] hover:bg-[#F1EEF8] transition-all">{l}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {!user && (
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-[#404049] hover:text-[#7660A8] transition-colors">Sign in</Link>
            )}
            <Link href="/dashboard" className="px-5 py-2 text-sm font-semibold text-white bg-[#7660A8] rounded-full hover:bg-[#5C4A8E] shadow-[0_4px_16px_rgba(118,96,168,.35)] transition-all">
              {user ? "Dashboard →" : "Open App →"}
            </Link>
          </div>
        </header>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,#EDE8F8,transparent_70%)]" />
          <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-[#F1EEF8] blur-3xl opacity-60" />
          <div className="absolute top-1/4 -right-32 w-80 h-80 rounded-full bg-[#E8E4F5] blur-3xl opacity-50" />

          {/* Floating badges */}
          <div className="absolute top-32 left-12 float hidden lg:flex items-center gap-2 bg-white border border-[#E8E8EC] rounded-full px-4 py-2 shadow-md text-xs font-semibold text-[#7660A8]">
            <span className="w-2 h-2 rounded-full bg-[#2E8B57] animate-pulse" /> Live pipeline
          </div>
          <div className="absolute top-48 right-16 float-slow hidden lg:flex items-center gap-2 bg-white border border-[#E8E8EC] rounded-full px-4 py-2 shadow-md text-xs font-semibold text-[#C28A00]" style={{animationDelay:'.8s'}}>
            ▲ $487k weighted
          </div>
          <div className="absolute bottom-40 left-20 float hidden lg:flex items-center gap-2 bg-white border border-[#E8E8EC] rounded-full px-4 py-2 shadow-md text-xs font-semibold text-[#2E8B57]" style={{animationDelay:'1.2s'}}>
            ✓ Deal health: 87
          </div>
          <div className="absolute bottom-56 right-12 float-slow hidden lg:flex items-center gap-2 bg-white border border-[#E8E8EC] rounded-full px-4 py-2 shadow-md text-xs font-semibold text-[#7660A8]" style={{animationDelay:'0.4s'}}>
            ⌘K Global search
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <div className="fade-up inline-flex items-center gap-2 mb-6 bg-[#F1EEF8] border border-[#C9C0DE] rounded-full px-5 py-2 text-xs font-semibold text-[#7660A8]">
              ✦ v1.2 · 15 features · production-ready
            </div>

            <h1 className="fade-up text-6xl sm:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-4" style={{animationDelay:'.1s'}}>
              The CRM that
            </h1>

            {/* Kinetic word */}
            <div className="h-[1.15em] flex items-center justify-center mb-4 overflow-hidden">
              <h1
                className="text-6xl sm:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight shimmer-text"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(16px)",
                  transition: "opacity 0.35s ease, transform 0.35s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {CYCLING[wordIdx]}
              </h1>
            </div>

            <h1 className="fade-up text-6xl sm:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-8 text-[#0F0F12]" style={{animationDelay:'.15s'}}>
              for modern teams.
            </h1>

            <p className="fade-up max-w-2xl mx-auto text-xl text-[#7A7A85] mb-10 leading-relaxed" style={{animationDelay:'.2s'}}>
              Kanban pipeline, AI deal scoring, global search, webhooks, revenue forecast — every tool your sales team needs, in one beautiful CRM.
            </p>

            <div className="fade-up flex flex-wrap items-center justify-center gap-4 mb-16" style={{animationDelay:'.3s'}}>
              <Link href="/dashboard" className="group px-8 py-4 text-base font-semibold text-white bg-[#7660A8] rounded-full shadow-[0_8px_32px_rgba(118,96,168,.4)] hover:bg-[#5C4A8E] hover:shadow-[0_12px_40px_rgba(118,96,168,.5)] hover:-translate-y-0.5 transition-all duration-300">
                {user ? "Go to Dashboard" : "Start for free"} <span className="group-hover:translate-x-1 inline-block transition-transform">→</span>
              </Link>
              {!user && (
                <Link href="/login" className="px-8 py-4 text-base font-semibold text-[#7660A8] bg-white border-2 border-[#7660A8] rounded-full hover:bg-[#F1EEF8] hover:-translate-y-0.5 transition-all duration-300">
                  Sign in
                </Link>
              )}
            </div>

            {/* Mini dashboard mockup */}
            <div className="fade-up relative mx-auto max-w-4xl" style={{animationDelay:'.4s'}}>
              <div className="rounded-2xl border border-[#E8E8EC] bg-white shadow-[0_32px_80px_rgba(118,96,168,.2)] overflow-hidden">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#F8F8FA] border-b border-[#E8E8EC]">
                  <div className="w-3 h-3 rounded-full bg-[#FBE9E7]" /><div className="w-3 h-3 rounded-full bg-[#FBF1DC]" /><div className="w-3 h-3 rounded-full bg-[#E6F4EC]" />
                  <div className="mx-auto flex items-center gap-2 bg-white border border-[#E8E8EC] rounded-lg px-4 py-1 text-xs text-[#A3A3AC]">
                    <span>🔒</span> dclaw-crm.vercel.app/dashboard
                  </div>
                </div>
                {/* Kanban preview */}
                <div className="p-6 bg-[#F8F8FA]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm text-[#0F0F12]">Pipeline</span>
                      <div className="flex gap-1">
                        {["Table","Kanban"].map((v,i) => (
                          <span key={v} className={`text-xs px-3 py-1 rounded-lg font-medium ${i===1?"bg-[#7660A8] text-white":"text-[#7A7A85]"}`}>{v}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-[#E8E8EC] rounded-lg px-3 py-1 text-xs text-[#7A7A85]">⌘K Search</div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 overflow-hidden">
                    {[
                      { stage:"Prospecting", color:"#F1EEF8", text:"#7660A8", deals:[{t:"API Bundle",v:"$42k",p:20},{t:"Growth Pack",v:"$48k",p:25}] },
                      { stage:"Proposal", color:"#E5EFF9", text:"#2C6CB0", deals:[{t:"Starter Plan",v:"$18k",p:55},{t:"Dashboard Lic.",v:"$31k",p:60}] },
                      { stage:"Negotiation", color:"#FBF1DC", text:"#C28A00", deals:[{t:"Enterprise Lic.",v:"$120k",p:80},{t:"Finance Mod.",v:"$54k",p:85}] },
                      { stage:"Closed Won", color:"#E6F4EC", text:"#2E8B57", deals:[{t:"SaaS Sub.",v:"$85k",p:100},{t:"Multi-Cloud",v:"$98k",p:100}] },
                    ].map(col => (
                      <div key={col.stage}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold" style={{color:col.text}}>{col.stage}</span>
                          <span className="text-xs text-[#A3A3AC]">{col.deals.length}</span>
                        </div>
                        <div className="space-y-2">
                          {col.deals.map(d => (
                            <div key={d.t} className="bg-white rounded-xl border border-[#E8E8EC] p-3 text-left shadow-sm">
                              <div className="text-xs font-semibold text-[#0F0F12] mb-1 truncate">{d.t}</div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#7660A8]">{d.v}</span>
                                <span className="text-xs text-[#A3A3AC]">{d.p}%</span>
                              </div>
                              <div className="mt-1.5 h-1 rounded-full bg-[#F1EEF8] overflow-hidden">
                                <div className="h-full rounded-full" style={{width:`${d.p}%`,background:col.text}} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Glow */}
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(118,96,168,.2),transparent)]" />
            </div>
          </div>
        </section>

        {/* ── STATS BAND ───────────────────────────────────────────────── */}
        <section className="bg-[#7660A8] py-14">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {STATS.map(s => (
              <div key={s.label}>
                <div className="text-5xl font-bold mb-1">{s.value}</div>
                <div className="text-sm font-semibold text-[#D4CCEA]">{s.label}</div>
                <div className="text-xs text-[#B0A5CC] mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURE BANNER 1: Kanban ─────────────────────────────────── */}
        <section className="py-28 bg-white overflow-hidden" id="features">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block mb-4 bg-[#E6F4EC] text-[#2E8B57] text-xs font-semibold px-3 py-1 rounded-full">P0 · Core</span>
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                See your pipeline,<br /><span className="shimmer-text">not a spreadsheet.</span>
              </h2>
              <p className="text-lg text-[#7A7A85] mb-8 leading-relaxed">Drag deals across 6 stages. Column headers show live count and total pipeline value. Switch between Table and Kanban in one click — no reload, no friction.</p>
              <ul className="space-y-3">
                {["Native HTML5 drag-and-drop — zero extra dependencies","Deal cards: title, customer, value, probability bar","Stage totals update instantly on drop","Closed Won column highlighted in green"].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-[#404049]">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#E6F4EC] text-[#2E8B57] flex items-center justify-center text-xs">✓</span>{f}
                  </li>
                ))}
              </ul>
            </div>
            {/* Visual */}
            <div className="relative">
              <div className="rounded-2xl border border-[#E8E8EC] shadow-[0_24px_64px_rgba(118,96,168,.15)] overflow-hidden bg-[#F8F8FA] p-5">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { stage:"Qualification", c:"#E5EFF9", t:"#2C6CB0", deals:[{title:"Pilot Program",v:"$9.5k",p:35},{title:"SaaS Sub.",v:"$85k",p:55}] },
                    { stage:"Negotiation",   c:"#FBF1DC", t:"#C28A00", deals:[{title:"Enterprise Lic.",v:"$120k",p:80},{title:"Finance Mod.",v:"$54k",p:85}] },
                    { stage:"Closed Won",    c:"#E6F4EC", t:"#2E8B57", deals:[{title:"Multi-Cloud",v:"$98k",p:100},{title:"Analytics Suite",v:"$85k",p:100}] },
                  ].map(col=>(
                    <div key={col.stage}>
                      <div className="rounded-lg px-2 py-1.5 mb-2 flex justify-between items-center" style={{background:col.c}}>
                        <span className="text-xs font-semibold" style={{color:col.t}}>{col.stage}</span>
                        <span className="text-xs font-bold" style={{color:col.t}}>{col.deals.length}</span>
                      </div>
                      {col.deals.map((d)=>(
                        <div key={d.title} className="bg-white rounded-xl border border-[#E8E8EC] p-3 mb-2 shadow-sm card-hover cursor-grab">
                          <div className="text-xs font-semibold text-[#0F0F12] mb-2 truncate">{d.title}</div>
                          <div className="flex justify-between text-xs text-[#A3A3AC]">
                            <span>{d.v}</span>
                            <span>{d.p}%</span>
                          </div>
                          <div className="mt-1.5 h-1 bg-[#F1EEF8] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{width:`${d.p}%`,background:col.t}}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#F1EEF8] rounded-2xl -z-10 float" />
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-[#E6F4EC] rounded-xl -z-10 float-slow" />
            </div>
          </div>
        </section>

        {/* ── FEATURE BANNER 2: Search ─────────────────────────────────── */}
        <section className="py-28 bg-[#F8F8FA] stripe overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            {/* Visual */}
            <div className="relative order-2 lg:order-1">
              <div className="rounded-2xl border border-[#E8E8EC] shadow-[0_24px_64px_rgba(118,96,168,.15)] bg-white overflow-hidden">
                <div className="p-5 border-b border-[#E8E8EC] flex items-center gap-3">
                  <span className="text-[#A3A3AC]">⌘</span>
                  <span className="flex-1 text-sm text-[#A3A3AC]">Search customers, deals, activities…</span>
                  <span className="text-xs bg-[#F1EEF8] text-[#7660A8] px-2 py-0.5 rounded font-mono">K</span>
                </div>
                <div className="divide-y divide-[#F2F2F4]">
                  {[
                    {type:"Customer",icon:"👤",title:"Acme Corp",sub:"hello@acme.com · active",c:"#7660A8"},
                    {type:"Deal",icon:"💼",title:"Enterprise Platform License",sub:"$120,000 · negotiation",c:"#C28A00"},
                    {type:"Customer",icon:"👤",title:"TechNova Inc",sub:"sales@technova.io · active",c:"#7660A8"},
                    {type:"Deal",icon:"💼",title:"Data Analytics Suite",sub:"$67,000 · negotiation",c:"#C28A00"},
                    {type:"Activity",icon:"📞",title:"Discovery call — Acme Corp",sub:"5 days ago · completed",c:"#2E8B57"},
                  ].map((r,i)=>(
                    <div key={i} className={`flex items-center gap-3 px-5 py-3 text-sm ${i===0?"bg-[#F8F6FB]":""} hover:bg-[#F8F6FB] cursor-pointer transition-colors`}>
                      <span className="text-base">{r.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#0F0F12] truncate">{r.title}</div>
                        <div className="text-xs text-[#A3A3AC] truncate">{r.sub}</div>
                      </div>
                      <span className="text-xs rounded-full px-2 py-0.5 flex-shrink-0" style={{background:`${r.c}18`,color:r.c}}>{r.type}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-[#E8E4F5] rounded-full -z-10 float-slow" />
            </div>
            <div className="order-1 lg:order-2">
              <span className="inline-block mb-4 bg-[#F1EEF8] text-[#7660A8] text-xs font-semibold px-3 py-1 rounded-full">P0 · Core</span>
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Find anything<br /><span className="shimmer-text">in under a second.</span>
              </h2>
              <p className="text-lg text-[#7A7A85] mb-8 leading-relaxed">Press Cmd+K from anywhere in the app. Results appear instantly — customers by name or email, deals by title, activities by description. Click to navigate directly.</p>
              <ul className="space-y-3">
                {["Debounced search — no extra API calls","Results grouped by type: Customers / Deals / Activities","Keyboard navigable — never touch the mouse","ilike matching catches partial names and typos"].map(f=>(
                  <li key={f} className="flex items-start gap-3 text-sm text-[#404049]">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#F1EEF8] text-[#7660A8] flex items-center justify-center text-xs">✓</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── FEATURE BANNER 3: Forecast ───────────────────────────────── */}
        <section className="py-28 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block mb-4 bg-[#FBF1DC] text-[#C28A00] text-xs font-semibold px-3 py-1 rounded-full">P2 · Intelligence</span>
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Revenue you can<br /><span className="shimmer-text">actually predict.</span>
              </h2>
              <p className="text-lg text-[#7A7A85] mb-8 leading-relaxed">Three numbers every sales leader asks for — weighted pipeline, commit, and best-case — calculated live from deal probability and stage. Filter by any date range.</p>
              <ul className="space-y-3">
                {["Weighted = Σ(value × probability/100)","Commit = negotiation stage deals with probability ≥80%","Best Case = all open deals in the period","Updates instantly when you move a deal stage"].map(f=>(
                  <li key={f} className="flex items-start gap-3 text-sm text-[#404049]">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#FBF1DC] text-[#C28A00] flex items-center justify-center text-xs">✓</span>{f}
                  </li>
                ))}
              </ul>
            </div>
            {/* Forecast visual */}
            <div className="relative">
              <div className="rounded-2xl border border-[#E8E8EC] shadow-[0_24px_64px_rgba(118,96,168,.15)] bg-white p-6">
                <div className="flex gap-2 mb-6">
                  {["Today","This Week","This Month","This Quarter"].map((l,i)=>(
                    <button key={l} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${i===3?"bg-[#7660A8] text-white":"bg-[#F2F2F4] text-[#7A7A85] hover:bg-[#F1EEF8]"}`}>{l}</button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    {label:"Weighted Pipeline",value:"$312k",sub:"Σ(value × probability)",color:"#7660A8",bg:"#F1EEF8"},
                    {label:"Commit",value:"$174k",sub:"Negotiation ≥80%",color:"#C28A00",bg:"#FBF1DC"},
                    {label:"Best Case",value:"$541k",sub:"All open deals",color:"#2E8B57",bg:"#E6F4EC"},
                  ].map(m=>(
                    <div key={m.label} className="rounded-xl p-4" style={{background:m.bg}}>
                      <div className="text-xs font-semibold mb-2" style={{color:m.color}}>{m.label}</div>
                      <div className="text-2xl font-bold text-[#0F0F12]">{m.value}</div>
                      <div className="text-xs mt-1" style={{color:m.color}}>{m.sub}</div>
                    </div>
                  ))}
                </div>
                {/* Bar chart */}
                <div className="space-y-2">
                  {[
                    {label:"Closed Won",v:183,max:541,c:"#2E8B57"},
                    {label:"Negotiation",v:174,max:541,c:"#C28A00"},
                    {label:"Proposal",v:112,max:541,c:"#7660A8"},
                    {label:"Qualification",v:52,max:541,c:"#9384BD"},
                  ].map(b=>(
                    <div key={b.label} className="flex items-center gap-3 text-xs">
                      <span className="w-24 text-[#7A7A85] truncate">{b.label}</span>
                      <div className="flex-1 h-2 bg-[#F2F2F4] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{width:`${(b.v/b.max)*100}%`,background:b.c}}/>
                      </div>
                      <span className="w-12 text-right font-semibold text-[#0F0F12]">${b.v}k</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#FBF1DC] rounded-2xl -z-10 float" />
            </div>
          </div>
        </section>

        {/* ── ALL FEATURES BENTO ───────────────────────────────────────── */}
        <section className="py-24 bg-[#F8F8FA] stripe" id="features">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#7660A8]">Complete feature set</span>
              <h2 className="mt-2 text-4xl font-bold text-[#0F0F12]">Everything. Out of the box.</h2>
              <p className="mt-3 text-[#7A7A85] max-w-xl mx-auto">No plugins. No tier paywalls. Every feature ships in one <code className="bg-[#F1EEF8] text-[#7660A8] px-2 py-0.5 rounded text-sm">docker compose up</code>.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map(({ icon, title, desc, tag }, i) => (
                <div
                  key={title}
                  className="card-hover bg-white rounded-2xl border border-[#E8E8EC] p-6 shadow-sm group cursor-default"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#F1EEF8] text-xl text-[#7660A8] group-hover:bg-[#7660A8] group-hover:text-white transition-all duration-300">
                      {icon}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TAG_COLOR[tag]}`}>{tag}</span>
                  </div>
                  <h3 className="font-semibold text-[#0F0F12] mb-1.5">{title}</h3>
                  <p className="text-sm text-[#7A7A85] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TECH STACK ───────────────────────────────────────────────── */}
        <section className="py-16 bg-white border-t border-[#E8E8EC]" id="stack">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#A3A3AC] mb-8">Built with battle-tested tech</p>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {[
                {l:"FastAPI",c:"#E6F4EC",t:"#2E8B57"},
                {l:"Next.js 14",c:"#F1EEF8",t:"#7660A8"},
                {l:"PostgreSQL",c:"#E5EFF9",t:"#2C6CB0"},
                {l:"SQLAlchemy",c:"#FBF1DC",t:"#C28A00"},
                {l:"Alembic",c:"#F2F2F4",t:"#7A7A85"},
                {l:"Tailwind",c:"#E5EFF9",t:"#2C6CB0"},
                {l:"shadcn/ui",c:"#F1EEF8",t:"#7660A8"},
                {l:"Docker",c:"#E6F4EC",t:"#2E8B57"},
              ].map(s=>(
                <div key={s.l} className="rounded-xl p-3 text-center card-hover" style={{background:s.c}}>
                  <div className="text-xs font-semibold leading-tight" style={{color:s.t}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section className="py-24 px-6 bg-[#F8F8FA]">
          <div className="max-w-4xl mx-auto rounded-3xl bg-[#7660A8] p-16 text-center shadow-[0_24px_80px_rgba(118,96,168,.4)] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,255,255,.12),transparent)]" />
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/3" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-xs font-semibold text-white mb-6">
                <span className="w-2 h-2 rounded-full bg-[#4EDA8B] animate-pulse" /> Live · 3 services running
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">Ready to close more deals?</h2>
              <p className="text-[#D4CCEA] text-lg mb-8 max-w-lg mx-auto">One command to run the full stack. Database, backend, and frontend — all wired up and ready.</p>
              <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-6 py-3 font-mono text-sm text-white mb-8">
                <span className="text-[#4EDA8B]">$</span> docker compose up -d --build
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/dashboard" className="px-8 py-4 bg-white text-[#7660A8] font-semibold rounded-full hover:bg-[#F1EEF8] hover:-translate-y-0.5 transition-all shadow-[0_4px_16px_rgba(0,0,0,.15)]">
                  Open Dashboard →
                </Link>
                <a href="https://github.com/dclawstack/dclaw-crm" target="_blank" rel="noopener noreferrer"
                  className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 hover:-translate-y-0.5 transition-all">
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <footer className="bg-[#0F0F12] text-[#7A7A85] pt-16 pb-8 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div className="md:col-span-1">
                <div className="text-lg font-bold text-white mb-3">DClaw CRM</div>
                <p className="text-sm leading-relaxed mb-4">The modern CRM built for sales teams who move fast and close deals.</p>
                <div className="flex gap-3">
                  <a href="https://github.com/dclawstack/dclaw-crm" target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-sm transition-colors">
                    ⌥
                  </a>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-[#A3A3AC] mb-4">App</div>
                <ul className="space-y-3 text-sm">
                  {[["Dashboard","/dashboard"],["Customers","/customers"],["Deals","/deals"],["Activities","/activities"],["Tasks","/tasks"]].map(([l,h])=>(
                    <li key={l}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-[#A3A3AC] mb-4">Settings</div>
                <ul className="space-y-3 text-sm">
                  {[["Webhooks","/settings/webhooks"],["Login","/login"]].map(([l,h])=>(
                    <li key={l}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
                  ))}
                </ul>
                <div className="text-xs font-semibold uppercase tracking-widest text-[#A3A3AC] mt-8 mb-4">API</div>
                <ul className="space-y-3 text-sm">
                  {[["Swagger Docs","http://localhost:8095/docs"],["ReDoc","http://localhost:8095/redoc"],["Health","http://localhost:8095/health/"]].map(([l,h])=>(
                    <li key={l}><a href={h} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-[#A3A3AC] mb-4">Features</div>
                <ul className="space-y-3 text-sm">
                  {["Kanban Pipeline","Global Search","Deal Health Score","Revenue Forecast","Outbound Webhooks","CSV Import/Export","Audit Log","JWT Auth + RBAC"].map(f=>(
                    <li key={f} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#7660A8] flex-shrink-0"/>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
              <p>© 2026 DClaw CRM · Built by <span className="text-[#9384BD] font-semibold">Satish Manpuri</span></p>
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#2E8B57]"/>v1.2 Production</span>
                <span>FastAPI · Next.js 14 · PostgreSQL 16</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
