import { useState, useEffect, useCallback } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const T = {
  teal:    "#0d9488",
  tealDk:  "#0f766e",
  tealLt:  "#ccfbf1",
  slate:   "#0f172a",
  slateM:  "#1e293b",
  slateL:  "#334155",
  muted:   "#64748b",
  border:  "#e2e8f0",
  bg:      "#f8fafc",
  white:   "#ffffff",
  red:     "#ef4444",
  redLt:   "#fee2e2",
  amber:   "#f59e0b",
  amberLt: "#fef3c7",
  green:   "#10b981",
  greenLt: "#d1fae5",
  blue:    "#3b82f6",
  blueLt:  "#dbeafe",
  purple:  "#8b5cf6",
  purpleLt:"#ede9fe",
};

const DEPT_META = {
  reception:  { label:"Reception",  icon:"🏥", color:"#3b82f6", light:"#dbeafe" },
  doctor:     { label:"Doctor",     icon:"🩺", color:"#10b981", light:"#d1fae5" },
  laboratory: { label:"Laboratory", icon:"🔬", color:"#f59e0b", light:"#fef3c7" },
  pharmacy:   { label:"Pharmacy",   icon:"💊", color:"#8b5cf6", light:"#ede9fe" },
  billing:    { label:"Billing",    icon:"💳", color:"#ef4444", light:"#fee2e2" },
  completed:  { label:"Completed",  icon:"✅", color:"#10b981", light:"#d1fae5" },
};

const PRIORITY_META = {
  normal:    { label:"Normal",    color:"#10b981", bg:"#d1fae5" },
  high:      { label:"High",      color:"#f59e0b", bg:"#fef3c7" },
  emergency: { label:"Emergency", color:"#ef4444", bg:"#fee2e2" },
};

const STAGES = ["reception","doctor","laboratory","pharmacy","billing","completed"];

// ─── MOCK DATA ─────────────────────────────────────────────────────────────
const USERS = [
  { id:"u1", name:"Dr. Admin Kumar",   email:"admin@hospital.com",     password:"admin123",  role:"admin"      },
  { id:"u2", name:"Priya Receptionist",email:"reception@hospital.com", password:"staff123",  role:"reception"  },
  { id:"u3", name:"Dr. James Wilson",  email:"doctor@hospital.com",    password:"staff123",  role:"doctor"     },
  { id:"u4", name:"Dr. Sarah Chen",    email:"lab@hospital.com",       password:"staff123",  role:"laboratory" },
  { id:"u5", name:"Raj Pharmacist",    email:"pharmacy@hospital.com",  password:"staff123",  role:"pharmacy"   },
  { id:"u6", name:"Meena Accounts",    email:"billing@hospital.com",   password:"staff123",  role:"billing"    },
];

const makeId = () => "REQ-" + Math.random().toString(36).slice(2,6).toUpperCase();
const now = () => new Date();
const daysAgo = (d) => new Date(Date.now() - d*86400000);

const INIT_REQUESTS = [
  { id:"REQ-A1B2", patient:"Alice Brown",   age:34, phone:"9876543210", type:"appointment",  priority:"normal",    stage:"doctor",     status:"in_progress", created:daysAgo(1),  notes:[{text:"Patient registered",by:"Priya Receptionist",at:daysAgo(1)}], stages:{reception:"completed",doctor:"in_progress"} },
  { id:"REQ-C3D4", patient:"Bob Carter",    age:52, phone:"8765432109", type:"lab_test",     priority:"high",      stage:"laboratory", status:"in_progress", created:daysAgo(2),  notes:[{text:"CBC and lipid panel ordered",by:"Dr. James Wilson",at:daysAgo(1)}], stages:{reception:"completed",doctor:"completed",laboratory:"in_progress"} },
  { id:"REQ-E5F6", patient:"Carol Davis",   age:28, phone:"7654321098", type:"emergency",    priority:"emergency", stage:"reception",  status:"in_progress", created:now(),       notes:[], stages:{reception:"in_progress"} },
  { id:"REQ-G7H8", patient:"David Evans",   age:45, phone:"6543210987", type:"prescription", priority:"normal",    stage:"completed",  status:"completed",   created:daysAgo(3),  notes:[{text:"All clear, discharged",by:"Meena Accounts",at:daysAgo(0.5)}], stages:{reception:"completed",doctor:"completed",pharmacy:"completed",billing:"completed"} },
  { id:"REQ-I9J0", patient:"Emma Foster",   age:67, phone:"5432109876", type:"billing",      priority:"high",      stage:"billing",    status:"in_progress", created:daysAgo(0.5),notes:[], stages:{reception:"completed",doctor:"completed",laboratory:"completed",pharmacy:"completed",billing:"in_progress"} },
  { id:"REQ-K1L2", patient:"Frank Green",   age:41, phone:"4321098765", type:"lab_test",     priority:"normal",    stage:"completed",  status:"completed",   created:daysAgo(5),  notes:[], stages:{reception:"completed",doctor:"completed",laboratory:"completed",billing:"completed"} },
  { id:"REQ-M3N4", patient:"Grace Hart",    age:23, phone:"3210987654", type:"appointment",  priority:"high",      stage:"doctor",     status:"in_progress", created:daysAgo(0.2),notes:[], stages:{reception:"completed",doctor:"in_progress"} },
  { id:"REQ-O5P6", patient:"Henry Iyer",    age:58, phone:"2109876543", type:"prescription", priority:"emergency", stage:"pharmacy",   status:"in_progress", created:daysAgo(0.3),notes:[{text:"Critical: heart medication",by:"Dr. James Wilson",at:daysAgo(0.2)}], stages:{reception:"completed",doctor:"completed",pharmacy:"in_progress"} },
];

const INIT_NOTIFS = [
  { id:"n1", title:"Emergency Intake",  msg:"Carol Davis — Emergency at Reception", type:"emergency", dept:"reception", read:false, at:now() },
  { id:"n2", title:"New Lab Request",   msg:"Bob Carter — CBC panel ready for lab", type:"new",       dept:"laboratory",read:false, at:daysAgo(0.1) },
  { id:"n3", title:"Prescription Alert",msg:"Henry Iyer — Critical heart medication",type:"urgent",   dept:"pharmacy",  read:false, at:daysAgo(0.3) },
  { id:"n4", title:"Request Completed", msg:"David Evans — Discharged successfully", type:"done",     dept:"billing",   read:true,  at:daysAgo(0.5) },
];

const INIT_DEPTS = [
  { id:"d1", code:"reception",  name:"Reception",  head:"Priya Receptionist", staff:6,  active:true, desc:"Patient intake, registration & triage" },
  { id:"d2", code:"doctor",     name:"Doctor",     head:"Dr. James Wilson",   staff:14, active:true, desc:"Medical consultation and diagnosis" },
  { id:"d3", code:"laboratory", name:"Laboratory", head:"Dr. Sarah Chen",     staff:9,  active:true, desc:"Diagnostics, blood work, imaging" },
  { id:"d4", code:"pharmacy",   name:"Pharmacy",   head:"Raj Pharmacist",     staff:7,  active:true, desc:"Medication dispensing and refills" },
  { id:"d5", code:"billing",    name:"Billing",    head:"Meena Accounts",     staff:5,  active:true, desc:"Insurance, payments, invoicing" },
];

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useLocalState(key, init) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : (typeof init === "function" ? init() : init); }
    catch { return typeof init === "function" ? init() : init; }
  });
  const set = useCallback((val) => {
    setV(prev => { const next = typeof val === "function" ? val(prev) : val; try { localStorage.setItem(key, JSON.stringify(next)); } catch{} return next; });
  }, [key]);
  return [v, set];
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function Badge({ children, color, bg }) {
  return (
    <span style={{ background:bg, color, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, letterSpacing:"0.3px" }}>
      {children}
    </span>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background:T.white, borderRadius:14, border:`1px solid ${T.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", ...style }}>
      {children}
    </div>
  );
}

function StatCard({ icon, label, value, color, delta }) {
  return (
    <Card style={{ padding:"20px 22px", borderTop:`3px solid ${color}` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <p style={{ fontSize:11, fontWeight:600, color:T.muted, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8 }}>{label}</p>
          <p style={{ fontSize:34, fontWeight:800, color:T.slate, lineHeight:1 }}>{value}</p>
          {delta && <p style={{ fontSize:12, color:T.green, marginTop:6, fontWeight:600 }}>{delta}</p>}
        </div>
        <div style={{ width:44, height:44, borderRadius:12, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{icon}</div>
      </div>
    </Card>
  );
}

function WorkflowBar({ currentStage, stages }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0 }}>
      {STAGES.filter(s => s !== "completed").map((stage, i) => {
        const meta = DEPT_META[stage];
        const stageStatus = stages?.[stage];
        const isDone = stageStatus === "completed";
        const isCurrent = stage === currentStage;
        const isPending = !isDone && !isCurrent;
        return (
          <div key={stage} style={{ display:"flex", alignItems:"center" }}>
            <div style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              padding:"4px 8px",
            }}>
              <div style={{
                width:28, height:28, borderRadius:"50%",
                background: isDone ? meta.color : isCurrent ? meta.color+"33" : T.border,
                border: `2px solid ${isDone ? meta.color : isCurrent ? meta.color : T.border}`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:12,
                transition:"all 0.3s",
              }}>
                {isDone ? "✓" : <span style={{ opacity: isPending ? 0.4 : 1 }}>{meta.icon}</span>}
              </div>
              <span style={{ fontSize:9, fontWeight:isCurrent?700:500, color:isDone?meta.color:isCurrent?meta.color:T.muted, whiteSpace:"nowrap" }}>
                {meta.label}
              </span>
            </div>
            {i < STAGES.filter(s=>s!=="completed").length - 1 && (
              <div style={{ width:20, height:2, background: isDone ? meta.color : T.border, marginBottom:16, transition:"background 0.3s" }} />
            )}
          </div>
        );
      })}
      <div style={{ display:"flex", alignItems:"center" }}>
        <div style={{ width:20, height:2, background: currentStage === "completed" ? T.green : T.border, marginBottom:16 }} />
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"4px 8px" }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:currentStage==="completed"?T.green:T.border, border:`2px solid ${currentStage==="completed"?T.green:T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>
            {currentStage === "completed" ? "✓" : <span style={{opacity:0.3}}>✅</span>}
          </div>
          <span style={{ fontSize:9, fontWeight:currentStage==="completed"?700:500, color:currentStage==="completed"?T.green:T.muted }}>Done</span>
        </div>
      </div>
    </div>
  );
}

// ─── MINI BAR CHART ──────────────────────────────────────────────────────────
function BarChart({ data, height=80 }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:6, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
          <span style={{ fontSize:10, fontWeight:700, color:d.color||T.teal }}>{d.value}</span>
          <div style={{ width:"100%", height: Math.max((d.value/max)*height*0.8, 4), background:d.color||T.teal, borderRadius:"4px 4px 0 0", opacity:0.85, transition:"height 0.5s" }} />
          <span style={{ fontSize:9, color:T.muted, textAlign:"center", lineHeight:1.2 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ segments, size=90 }) {
  const total = segments.reduce((s, sg) => s + sg.value, 0) || 1;
  let offset = 0;
  const r = 30, cx = size/2, cy = size/2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((sg, i) => {
        const pct = sg.value / total;
        const dash = pct * circ;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={sg.color} strokeWidth={12}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset * circ}
            style={{ transition:"all 0.5s" }}
          />
        );
        offset += pct;
        return el;
      })}
      <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle" style={{ fontSize:14, fontWeight:800, fill:T.slate }}>{total}</text>
      <text x={cx} y={cy+13} textAnchor="middle" dominantBaseline="middle" style={{ fontSize:7, fill:T.muted }}>total</text>
    </svg>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { page:"dashboard",    icon:"⊞",  label:"Dashboard"     },
  { page:"new-request",  icon:"＋",  label:"New Request",   roles:["admin","reception"] },
  { page:"workflow",     icon:"⇄",  label:"Workflow Track" },
  { page:"department",   icon:"⬡",  label:"My Department", roles:["reception","doctor","laboratory","pharmacy","billing"] },
  { page:"admin",        icon:"⚙",  label:"Admin Panel",   roles:["admin"] },
  { page:"analytics",    icon:"⬡",  label:"Analytics",     roles:["admin"] },
];

function Sidebar({ user, page, setPage, unread }) {
  const meta = DEPT_META[user.role] || { color:T.teal, icon:"👤", label:user.role };
  return (
    <aside style={{
      width:220, flexShrink:0,
      background:T.slate, color:T.white,
      display:"flex", flexDirection:"column",
      height:"100vh", position:"sticky", top:0,
      fontFamily:"'Outfit', sans-serif",
    }}>
      {/* Logo */}
      <div style={{ padding:"22px 20px 18px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#0d9488,#0891b2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🏥</div>
          <div>
            <div style={{ fontWeight:800, fontSize:12, color:T.white, lineHeight:1.2 }}>MediFlow</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", lineHeight:1.2 }}>Workflow System</div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div style={{ padding:"14px 18px", background:"rgba(255,255,255,0.04)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:`${meta.color}33`, border:`2px solid ${meta.color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>{meta.icon}</div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:12, color:T.white, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.name.split(" ")[0]} {user.name.split(" ").slice(-1)[0]}</div>
            <div style={{ fontSize:10, color:meta.color, textTransform:"capitalize", fontWeight:600 }}>{meta.label}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"12px 10px", overflowY:"auto" }}>
        {NAV_ITEMS.filter(n => !n.roles || n.roles.includes(user.role)).map(item => {
          const active = page === item.page;
          return (
            <button key={item.page} onClick={() => setPage(item.page)} style={{
              width:"100%", display:"flex", alignItems:"center", gap:10,
              padding:"9px 12px", borderRadius:9, border:"none",
              background: active ? "rgba(13,148,136,0.18)" : "transparent",
              color: active ? T.teal : "rgba(255,255,255,0.55)",
              fontSize:13, fontWeight: active ? 700 : 500,
              cursor:"pointer", marginBottom:2,
              borderLeft: `3px solid ${active ? T.teal : "transparent"}`,
              transition:"all 0.15s", textAlign:"left", position:"relative",
              fontFamily:"'Outfit', sans-serif",
            }}>
              <span style={{ fontSize:16 }}>{item.icon}</span>
              {item.label}
              {item.page === "dashboard" && unread > 0 && (
                <span style={{ marginLeft:"auto", background:T.red, color:"#fff", fontSize:9, fontWeight:800, padding:"2px 6px", borderRadius:10 }}>{unread}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding:"12px 10px", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", textAlign:"center" }}>MediFlow v2.0 · Inter-Dept Workflow</div>
      </div>
    </aside>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
function TopBar({ user, logout, notifs, markAllRead, page }) {
  const [showNotif, setShowNotif] = useState(false);
  const unread = notifs.filter(n => !n.read).length;
  const PAGE_LABEL = {
    "dashboard":"Dashboard", "new-request":"New Patient Request", "workflow":"Workflow Tracking",
    "department":"My Department", "admin":"Admin Panel", "analytics":"Analytics",
  };
  return (
    <header style={{
      background:T.white, borderBottom:`1px solid ${T.border}`,
      padding:"0 24px", height:60, display:"flex", alignItems:"center",
      justifyContent:"space-between", position:"sticky", top:0, zIndex:40,
      boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <h1 style={{ fontSize:17, fontWeight:700, color:T.slate }}>{PAGE_LABEL[page] || "MediFlow"}</h1>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        {/* Notif bell */}
        <div style={{ position:"relative" }}>
          <button onClick={() => setShowNotif(s => !s)} style={{
            width:36, height:36, borderRadius:9, border:`1px solid ${T.border}`,
            background:T.white, cursor:"pointer", fontSize:17, display:"flex",
            alignItems:"center", justifyContent:"center", position:"relative",
          }}>
            🔔
            {unread > 0 && <span style={{ position:"absolute", top:4, right:4, width:15, height:15, background:T.red, borderRadius:"50%", fontSize:9, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800 }}>{unread}</span>}
          </button>
          {showNotif && (
            <div style={{
              position:"absolute", right:0, top:44, width:320, background:T.white,
              border:`1px solid ${T.border}`, borderRadius:14,
              boxShadow:"0 8px 32px rgba(0,0,0,0.13)", zIndex:100, overflow:"hidden",
            }}>
              <div style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontWeight:700, fontSize:13, color:T.slate }}>Notifications</span>
                <button onClick={markAllRead} style={{ fontSize:11, color:T.teal, border:"none", background:"none", cursor:"pointer", fontWeight:600 }}>Mark all read</button>
              </div>
              <div style={{ maxHeight:280, overflowY:"auto" }}>
                {notifs.length === 0
                  ? <p style={{ padding:20, textAlign:"center", color:T.muted, fontSize:13 }}>All clear!</p>
                  : notifs.map(n => (
                    <div key={n.id} style={{ padding:"11px 16px", borderBottom:`1px solid ${T.border}`, background:n.read ? T.white : "#f0fdfa", display:"flex", gap:10 }}>
                      <span style={{ fontSize:18 }}>{n.type==="emergency"?"🚨":n.type==="urgent"?"⚠️":n.type==="done"?"✅":"📋"}</span>
                      <div>
                        <p style={{ fontWeight:700, fontSize:12, color:T.slate, marginBottom:2 }}>{n.title}</p>
                        <p style={{ fontSize:11, color:T.muted }}>{n.msg}</p>
                        <p style={{ fontSize:10, color:"#94a3b8", marginTop:3 }}>{n.at.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>

        {/* User chip */}
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 12px", borderRadius:9, background:T.bg, border:`1px solid ${T.border}` }}>
          <span style={{ fontSize:11, fontWeight:700, color:T.slate }}>{user.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</span>
          <span style={{ fontSize:11, color:T.muted }}>{user.role}</span>
        </div>
        <button onClick={logout} style={{ padding:"7px 14px", borderRadius:9, border:`1px solid ${T.border}`, background:T.white, color:T.muted, cursor:"pointer", fontSize:12, fontWeight:600 }}>
          Sign Out
        </button>
      </div>
    </header>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = () => {
    setLoading(true); setErr("");
    setTimeout(() => {
      const u = USERS.find(u => u.email === email && u.password === pass);
      if (u) onLogin(u);
      else { setErr("Invalid email or password."); setLoading(false); }
    }, 500);
  };

  const DEMOS = [
    { label:"Admin",      color:"#0d9488", icon:"⚙", email:"admin@hospital.com",     password:"admin123" },
    { label:"Reception",  color:"#3b82f6", icon:"🏥", email:"reception@hospital.com", password:"staff123" },
    { label:"Doctor",     color:"#10b981", icon:"🩺", email:"doctor@hospital.com",    password:"staff123" },
    { label:"Lab",        color:"#f59e0b", icon:"🔬", email:"lab@hospital.com",       password:"staff123" },
    { label:"Pharmacy",   color:"#8b5cf6", icon:"💊", email:"pharmacy@hospital.com",  password:"staff123" },
    { label:"Billing",    color:"#ef4444", icon:"💳", email:"billing@hospital.com",   password:"staff123" },
  ];

  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:"'Outfit', sans-serif", background:"#f0fdfa" }}>
      {/* Left */}
      <div style={{
        flex:1, background:"linear-gradient(145deg,#0f172a 0%,#134e4a 60%,#0f172a 100%)",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        padding:"60px 48px", position:"relative", overflow:"hidden",
      }}>
        {/* Decorative circles */}
        {[["-80px","-80px","300px","300px","rgba(13,148,136,0.08)"],["-40px","60%","200px","200px","rgba(13,148,136,0.06)"],["60%","70%","250px","250px","rgba(255,255,255,0.03)"]].map(([t,l,w,h,bg],i) => (
          <div key={i} style={{ position:"absolute", top:t, left:l, width:w, height:h, borderRadius:"50%", background:bg, pointerEvents:"none" }} />
        ))}
        <div style={{ position:"relative", zIndex:1, maxWidth:360, textAlign:"center" }}>
          <div style={{ fontSize:56, marginBottom:20 }}>🏥</div>
          <h1 style={{ fontSize:30, fontWeight:900, color:"#fff", lineHeight:1.2, marginBottom:16 }}>
            Inter-Department<br/>Workflow System
          </h1>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.6)", lineHeight:1.8, marginBottom:36 }}>
            Seamlessly coordinate patient care across Reception, Doctor, Lab, Pharmacy & Billing.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {[["⚡","Instant Alerts"],["🔄","Workflow Automation"],["📊","Live Analytics"],["🔒","Role Security"],["📋","Request Tracking"],["🏢","5 Departments"]].map(([ic,lb])=>(
              <div key={lb} style={{ background:"rgba(255,255,255,0.06)", borderRadius:10, padding:"10px 8px", backdropFilter:"blur(10px)" }}>
                <div style={{ fontSize:18, marginBottom:4 }}>{ic}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.7)", fontWeight:600 }}>{lb}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{ width:480, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 40px", background:"#fff" }}>
        <div style={{ width:"100%", maxWidth:360 }}>
          <div style={{ marginBottom:28, textAlign:"center" }}>
            <h2 style={{ fontSize:24, fontWeight:800, color:T.slate, marginBottom:6 }}>Welcome Back</h2>
            <p style={{ color:T.muted, fontSize:14 }}>Sign in to your department account</p>
          </div>

          {err && (
            <div style={{ background:T.redLt, border:`1px solid #fca5a5`, color:T.red, padding:"11px 14px", borderRadius:9, marginBottom:16, fontSize:13, fontWeight:500 }}>
              ⚠️ {err}
            </div>
          )}

          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.slateL, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:6 }}>Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="your@hospital.com"
              style={{ width:"100%", padding:"11px 14px", borderRadius:9, border:`1.5px solid ${T.border}`, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"'Outfit',sans-serif", color:T.slate }} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.slateL, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:6 }}>Password</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="••••••••"
              style={{ width:"100%", padding:"11px 14px", borderRadius:9, border:`1.5px solid ${T.border}`, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"'Outfit',sans-serif", color:T.slate }} />
          </div>

          <button onClick={handle} disabled={loading} style={{
            width:"100%", padding:13, borderRadius:10, border:"none",
            background:"linear-gradient(135deg,#0d9488,#0891b2)",
            color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer",
            boxShadow:"0 4px 18px rgba(13,148,136,0.35)", fontFamily:"'Outfit',sans-serif",
            opacity:loading?0.7:1, transition:"opacity 0.2s",
          }}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>

          <div style={{ marginTop:26, paddingTop:22, borderTop:`1px solid ${T.border}` }}>
            <p style={{ fontSize:10, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"1px", textAlign:"center", marginBottom:12 }}>Quick Demo Login</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7 }}>
              {DEMOS.map(d => (
                <button key={d.label} onClick={() => { setEmail(d.email); setPass(d.password); }}
                  style={{ padding:"7px 5px", borderRadius:8, border:`1px solid ${d.color}30`, background:`${d.color}0e`, color:d.color, cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"'Outfit',sans-serif" }}>
                  {d.icon} {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage({ user, requests, notifs, setPage }) {
  const total = requests.length;
  const pending = requests.filter(r => r.status === "in_progress").length;
  const completed = requests.filter(r => r.status === "completed").length;
  const emergency = requests.filter(r => r.priority === "emergency").length;

  const byDept = STAGES.filter(s => s !== "completed").map(s => ({
    label: DEPT_META[s].label.slice(0,4),
    value: requests.filter(r => r.stage === s).length,
    color: DEPT_META[s].color,
  }));

  const recentRequests = [...requests].sort((a,b) => new Date(b.created)-new Date(a.created)).slice(0,6);

  return (
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      {/* Welcome */}
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:20, fontWeight:800, color:T.slate, marginBottom:4 }}>
          Good {new Date().getHours()<12?"Morning":"Afternoon"}, {user.name.split(" ")[0]}! 👋
        </h2>
        <p style={{ color:T.muted, fontSize:14 }}>Here's the hospital's workflow status right now.</p>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
        <StatCard icon="📋" label="Total Requests"   value={total}     color={T.blue}   delta={`+${requests.filter(r=>new Date(r.created)>daysAgo(1)).length} today`} />
        <StatCard icon="⏳" label="In Progress"      value={pending}   color={T.amber}  />
        <StatCard icon="✅" label="Completed"         value={completed} color={T.green}  />
        <StatCard icon="🚨" label="Emergencies"       value={emergency} color={T.red}    />
      </div>

      {/* Main grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:16 }}>
        {/* Recent requests */}
        <Card>
          <div style={{ padding:"16px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:T.slate }}>Recent Requests</h3>
            <button onClick={()=>setPage("workflow")} style={{ fontSize:12, color:T.teal, border:"none", background:"none", cursor:"pointer", fontWeight:600 }}>View all →</button>
          </div>
          <div>
            {recentRequests.map((r, i) => {
              const pm = PRIORITY_META[r.priority];
              const dm = DEPT_META[r.stage];
              return (
                <div key={r.id} style={{ padding:"13px 20px", borderBottom:i<recentRequests.length-1?`1px solid ${T.border}`:"none", display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:dm.light, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{dm.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:T.slate }}>{r.patient}</div>
                    <div style={{ fontSize:12, color:T.muted, textTransform:"capitalize" }}>{r.type.replace("_"," ")} · {r.id}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                    <Badge color={pm.color} bg={pm.bg}>{pm.label}</Badge>
                    <span style={{ fontSize:11, color:T.muted }}>{dm.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right column */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* Donut + dept breakdown */}
          <Card style={{ padding:20 }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:T.slate, marginBottom:14 }}>Department Workload</h3>
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:14 }}>
              <DonutChart segments={byDept.map(d=>({value:d.value,color:d.color}))} size={88} />
              <div style={{ flex:1 }}>
                {byDept.map(d => (
                  <div key={d.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:7 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:d.color }} />
                      <span style={{ fontSize:12, color:T.slateL }}>{d.label}</span>
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, color:T.slate }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <BarChart data={byDept} height={60} />
          </Card>

          {/* Quick actions */}
          <Card style={{ padding:18 }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:T.slate, marginBottom:12 }}>Quick Actions</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {(user.role==="admin"||user.role==="reception") && (
                <button onClick={()=>setPage("new-request")} style={{ padding:"10px 14px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#0d9488,#0891b2)", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, textAlign:"left", fontFamily:"'Outfit',sans-serif" }}>
                  ＋  New Patient Request
                </button>
              )}
              <button onClick={()=>setPage("workflow")} style={{ padding:"10px 14px", borderRadius:9, border:`1.5px solid ${T.border}`, background:T.white, color:T.slateL, cursor:"pointer", fontWeight:600, fontSize:13, textAlign:"left", fontFamily:"'Outfit',sans-serif" }}>
                ⇄  Track Workflows
              </button>
              {user.role==="admin" && (
                <button onClick={()=>setPage("analytics")} style={{ padding:"10px 14px", borderRadius:9, border:`1.5px solid ${T.border}`, background:T.white, color:T.slateL, cursor:"pointer", fontWeight:600, fontSize:13, textAlign:"left", fontFamily:"'Outfit',sans-serif" }}>
                  📈  View Analytics
                </button>
              )}
            </div>
          </Card>

          {/* Alerts */}
          {notifs.filter(n=>!n.read).length > 0 && (
            <Card style={{ padding:18, borderTop:`3px solid ${T.red}` }}>
              <h3 style={{ fontSize:13, fontWeight:700, color:T.slate, marginBottom:10 }}>🔔 Unread Alerts</h3>
              {notifs.filter(n=>!n.read).slice(0,3).map(n => (
                <div key={n.id} style={{ padding:"8px 10px", borderRadius:8, background:n.type==="emergency"?T.redLt:T.amberLt, marginBottom:6 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:T.slate, marginBottom:2 }}>{n.title}</p>
                  <p style={{ fontSize:11, color:T.muted }}>{n.msg}</p>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── NEW REQUEST ──────────────────────────────────────────────────────────────
function NewRequestPage({ user, addRequest }) {
  const [form, setForm] = useState({ patient:"", age:"", phone:"", type:"appointment", priority:"normal", desc:"" });
  const [success, setSuccess] = useState(null);
  const [err, setErr] = useState("");

  const I = (field) => ({
    value: form[field],
    onChange: e => setForm(p => ({ ...p, [field]: e.target.value })),
    style: { width:"100%", padding:"11px 13px", borderRadius:9, border:`1.5px solid ${T.border}`, fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"'Outfit',sans-serif", color:T.slate, background:T.white },
  });

  const submit = () => {
    if (!form.patient.trim()) { setErr("Patient name is required."); return; }
    const id = makeId();
    const req = {
      id, patient:form.patient, age:form.age||"N/A", phone:form.phone||"N/A",
      type:form.type, priority:form.priority, desc:form.desc,
      stage:"reception", status:"in_progress", created:new Date(),
      notes:[], stages:{ reception:"in_progress" },
    };
    addRequest(req);
    setSuccess(req);
    setErr("");
  };

  if (success) return (
    <div style={{ maxWidth:520, margin:"0 auto", textAlign:"center", padding:"60px 20px" }}>
      <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
      <h2 style={{ fontSize:24, fontWeight:800, color:T.slate, marginBottom:8 }}>Request Submitted!</h2>
      <p style={{ color:T.muted, fontSize:15, marginBottom:22 }}><b>{success.patient}</b>'s request has been registered.</p>
      <Card style={{ padding:20, marginBottom:22, textAlign:"left" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, fontSize:13 }}>
          {[["Request ID",success.id],["Type",success.type.replace("_"," ")],["Priority",success.priority],["Stage","Reception"]].map(([k,v])=>(
            <div key={k}><div style={{ color:T.muted, fontSize:11, textTransform:"uppercase", fontWeight:600, marginBottom:2 }}>{k}</div><div style={{ fontWeight:700, color:T.slate, textTransform:"capitalize" }}>{v}</div></div>
          ))}
        </div>
      </Card>
      <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
        <button onClick={()=>setSuccess(null)} style={{ padding:"11px 22px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#0d9488,#0891b2)", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>+ New Request</button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:660, margin:"0 auto" }}>
      <Card style={{ padding:30 }}>
        {err && <div style={{ background:T.redLt, border:`1px solid #fca5a5`, color:T.red, padding:"11px 14px", borderRadius:9, marginBottom:18, fontSize:13 }}>⚠️ {err}</div>}

        {form.priority === "emergency" && (
          <div style={{ background:T.redLt, border:`1px solid #fca5a5`, borderRadius:10, padding:"12px 16px", marginBottom:18, display:"flex", gap:10, alignItems:"center" }}>
            <span style={{ fontSize:24 }}>🚨</span>
            <div><div style={{ fontWeight:700, color:T.red, fontSize:13 }}>Emergency flagged</div><div style={{ color:"#b91c1c", fontSize:12 }}>This request will be immediately escalated.</div></div>
          </div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.slateL, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:6 }}>Patient Name *</label>
            <input {...I("patient")} placeholder="Full name" />
          </div>
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.slateL, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:6 }}>Age</label>
            <input {...I("age")} type="number" placeholder="Age" />
          </div>
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.slateL, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:6 }}>Phone</label>
            <input {...I("phone")} placeholder="Contact number" />
          </div>
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.slateL, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:6 }}>Request Type *</label>
            <select {...I("type")} style={{ ...I("type").style, cursor:"pointer" }}>
              <option value="appointment">🏥 Appointment</option>
              <option value="lab_test">🔬 Lab Test</option>
              <option value="prescription">💊 Prescription</option>
              <option value="billing">💳 Billing</option>
              <option value="emergency">🚨 Emergency</option>
            </select>
          </div>
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.slateL, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:6 }}>Priority *</label>
            <select {...I("priority")} style={{ ...I("priority").style, cursor:"pointer" }}>
              <option value="normal">🟢 Normal</option>
              <option value="high">🟡 High</option>
              <option value="emergency">🔴 Emergency</option>
            </select>
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:T.slateL, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:6 }}>Description</label>
            <textarea {...I("desc")} rows={3} placeholder="Describe symptoms or request details…" style={{ ...I("desc").style, resize:"vertical", lineHeight:1.6 }} />
          </div>
        </div>

        {/* Workflow preview */}
        <div style={{ marginTop:22, padding:16, background:T.bg, borderRadius:10 }}>
          <p style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:10 }}>Workflow Path</p>
          <WorkflowBar currentStage="reception" stages={{ reception:"in_progress" }} />
        </div>

        <div style={{ display:"flex", gap:10, marginTop:22 }}>
          <button onClick={submit} style={{ flex:1, padding:13, borderRadius:10, border:"none", background:"linear-gradient(135deg,#0d9488,#0891b2)", color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer", boxShadow:"0 4px 16px rgba(13,148,136,0.3)", fontFamily:"'Outfit',sans-serif" }}>
            📤 Submit Request
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── WORKFLOW TRACKING ────────────────────────────────────────────────────────
function WorkflowPage({ user, requests, advanceStage, addNote }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [note, setNote] = useState("");

  const filtered = requests.filter(r => {
    const mf = filter==="all"||r.status===filter||r.priority===filter||r.stage===filter;
    const ms = !search||r.patient.toLowerCase().includes(search.toLowerCase())||r.id.toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  const sel = selected ? requests.find(r=>r.id===selected.id)||null : null;

  const handleAdvance = (id) => {
    advanceStage(id);
    const updated = requests.find(r=>r.id===id);
    if (updated) setSelected(updated);
  };

  const handleNote = (id) => {
    if (!note.trim()) return;
    addNote(id, note, user.name);
    setNote("");
  };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 400px", gap:16, height:"calc(100vh - 108px)" }}>
      {/* List */}
      <Card style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:`1px solid ${T.border}` }}>
          <div style={{ fontWeight:700, fontSize:14, color:T.slate, marginBottom:10 }}>All Requests ({filtered.length})</div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or ID…"
            style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:`1.5px solid ${T.border}`, fontSize:13, outline:"none", boxSizing:"border-box", marginBottom:10, fontFamily:"'Outfit',sans-serif" }} />
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {["all","in_progress","completed","emergency","high"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{ padding:"4px 11px", borderRadius:20, border:"none", cursor:"pointer", fontSize:11, fontWeight:600, background:filter===f?T.teal:"#f1f5f9", color:filter===f?"#fff":T.muted, fontFamily:"'Outfit',sans-serif" }}>
                {f.replace("_"," ")}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:8 }}>
          {filtered.map(r => {
            const pm = PRIORITY_META[r.priority];
            const dm = DEPT_META[r.stage];
            const isActive = sel?.id === r.id;
            return (
              <div key={r.id} onClick={()=>setSelected(r)} style={{
                padding:"13px 14px", borderRadius:10, marginBottom:5, cursor:"pointer",
                border:`1.5px solid ${isActive?T.teal:T.border}`,
                background:isActive?"#f0fdfa":T.white, transition:"all 0.15s",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                  <div>
                    <span style={{ fontFamily:"monospace", fontSize:11, color:T.teal, fontWeight:700 }}>{r.id}</span>
                    <div style={{ fontWeight:700, color:T.slate, fontSize:14, marginTop:1 }}>{r.patient}</div>
                  </div>
                  <Badge color={pm.color} bg={pm.bg}>{pm.label}</Badge>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <span style={{ color:T.muted, fontSize:12, textTransform:"capitalize" }}>{r.type.replace("_"," ")}</span>
                  <span style={{ fontSize:12, color:dm.color, fontWeight:600 }}>{dm.icon} {dm.label}</span>
                </div>
                {/* Mini pipeline */}
                <div style={{ display:"flex", gap:3, alignItems:"center" }}>
                  {STAGES.map((s,i) => {
                    const done = r.stages[s]==="completed";
                    const cur = r.stage===s;
                    return (
                      <div key={s} style={{ flex:1, height:4, borderRadius:2, background:done?DEPT_META[s].color:cur?DEPT_META[s].color+"66":T.border, transition:"background 0.3s" }} />
                    );
                  })}
                </div>
                <div style={{ fontSize:10, color:T.muted, marginTop:4, textTransform:"capitalize" }}>Stage: {r.stage}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Detail */}
      <Card style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {!sel ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", color:T.muted, gap:10 }}>
            <span style={{ fontSize:40 }}>👈</span>
            <p style={{ fontSize:14 }}>Select a request</p>
          </div>
        ) : (() => {
          const pm = PRIORITY_META[sel.priority];
          const canAdvance = sel.stage !== "completed" && (user.role==="admin"||user.role===sel.stage);
          return (
            <>
              <div style={{ padding:"16px 18px", borderBottom:`1px solid ${T.border}`, background:T.bg }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <span style={{ fontFamily:"monospace", fontSize:11, color:T.teal, fontWeight:700 }}>{sel.id}</span>
                    <h3 style={{ fontSize:17, fontWeight:800, color:T.slate, margin:"3px 0 2px" }}>{sel.patient}</h3>
                    <span style={{ fontSize:13, color:T.muted, textTransform:"capitalize" }}>{sel.type.replace("_"," ")}</span>
                  </div>
                  <Badge color={pm.color} bg={pm.bg}>{pm.label}</Badge>
                </div>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"18px" }}>
                {/* Workflow */}
                <div style={{ marginBottom:20 }}>
                  <p style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:12 }}>Workflow Progress</p>
                  <div style={{ overflowX:"auto" }}>
                    <WorkflowBar currentStage={sel.stage} stages={sel.stages} />
                  </div>
                </div>

                {/* Stage cards */}
                <div style={{ marginBottom:18 }}>
                  {STAGES.filter(s=>s!=="completed").map(s => {
                    const sm = DEPT_META[s];
                    const ss = sel.stages[s];
                    const isCur = sel.stage === s;
                    return (
                      <div key={s} style={{ display:"flex", gap:10, marginBottom:8, padding:"8px 12px", borderRadius:9, background:isCur?`${sm.color}10`:T.bg, border:`1px solid ${isCur?sm.color:T.border}` }}>
                        <span style={{ fontSize:18 }}>{sm.icon}</span>
                        <div>
                          <div style={{ fontWeight:700, fontSize:12, color:sm.color, textTransform:"capitalize" }}>{sm.label}</div>
                          <div style={{ fontSize:11, color:T.muted, textTransform:"capitalize" }}>{ss||"pending"}{isCur?" — CURRENT":""}</div>
                        </div>
                        {ss==="completed" && <span style={{ marginLeft:"auto", color:T.green, fontWeight:700, fontSize:13 }}>✓</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Info */}
                <Card style={{ padding:14, marginBottom:16, background:T.bg }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, fontSize:12 }}>
                    {[["Age",sel.age],["Phone",sel.phone],["Created",new Date(sel.created).toLocaleDateString()],["Status",sel.status.replace("_"," ")]].map(([k,v])=>(
                      <div key={k}><div style={{ color:T.muted, fontSize:10, textTransform:"uppercase", fontWeight:600 }}>{k}</div><div style={{ fontWeight:700, color:T.slate, textTransform:"capitalize" }}>{v}</div></div>
                    ))}
                  </div>
                  {sel.desc && <p style={{ marginTop:10, fontSize:12, color:T.slateL, lineHeight:1.6 }}>{sel.desc}</p>}
                </Card>

                {/* Notes */}
                {sel.notes?.length > 0 && (
                  <div style={{ marginBottom:14 }}>
                    <p style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:8 }}>Notes</p>
                    {sel.notes.map((n,i) => (
                      <div key={i} style={{ background:T.amberLt, borderRadius:8, padding:"9px 12px", marginBottom:6, fontSize:12 }}>
                        <div style={{ color:T.slate }}>{n.text}</div>
                        <div style={{ color:"#92400e", fontSize:10, marginTop:3 }}>— {n.by} · {new Date(n.at).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add note */}
                <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} placeholder="Add a note…"
                  style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1.5px solid ${T.border}`, fontSize:13, resize:"none", outline:"none", boxSizing:"border-box", fontFamily:"'Outfit',sans-serif", marginBottom:8 }} />
                <button onClick={()=>handleNote(sel.id)} style={{ width:"100%", padding:9, borderRadius:8, border:`1px solid ${T.border}`, background:T.bg, color:T.teal, cursor:"pointer", fontWeight:700, fontSize:13, fontFamily:"'Outfit',sans-serif", marginBottom:12 }}>
                  + Add Note
                </button>

                {/* Advance */}
                {canAdvance && sel.stage !== "completed" && (
                  <button onClick={()=>handleAdvance(sel.id)} style={{ width:"100%", padding:13, borderRadius:10, border:"none", background:"linear-gradient(135deg,#0d9488,#0891b2)", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:"0 4px 14px rgba(13,148,136,0.3)", fontFamily:"'Outfit',sans-serif" }}>
                    ✅ Complete & Advance →
                  </button>
                )}
                {sel.stage === "completed" && (
                  <div style={{ textAlign:"center", padding:16, background:T.greenLt, borderRadius:10, border:`1px solid #86efac` }}>
                    <div style={{ fontSize:28 }}>✅</div>
                    <div style={{ fontWeight:800, color:T.green, fontSize:14, marginTop:4 }}>Request Completed</div>
                    {sel.completedAt && <div style={{ color:T.muted, fontSize:12 }}>{new Date(sel.completedAt).toLocaleString()}</div>}
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </Card>
    </div>
  );
}

// ─── DEPARTMENT VIEW ──────────────────────────────────────────────────────────
function DepartmentPage({ user, requests, advanceStage, addNote }) {
  const myRequests = requests.filter(r => r.stage === user.role);
  const [sel, setSel] = useState(null);
  const [note, setNote] = useState("");
  const meta = DEPT_META[user.role] || { icon:"🏢", color:T.teal, light:T.tealLt, label:user.role };

  const selR = sel ? myRequests.find(r=>r.id===sel.id)||null : null;

  return (
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      {/* Header */}
      <div style={{ borderRadius:14, padding:"22px 24px", marginBottom:22, color:"#fff", background:`linear-gradient(135deg,${meta.color},${meta.color}cc)`, display:"flex", alignItems:"center", gap:18 }}>
        <div style={{ fontSize:46 }}>{meta.icon}</div>
        <div>
          <h2 style={{ fontSize:20, fontWeight:800, textTransform:"capitalize", marginBottom:4 }}>{meta.label} Department</h2>
          <p style={{ opacity:0.85, fontSize:14 }}>Manage and process requests assigned to your department.</p>
        </div>
        <div style={{ marginLeft:"auto", background:"rgba(255,255,255,0.18)", borderRadius:12, padding:"14px 20px", textAlign:"center" }}>
          <div style={{ fontSize:30, fontWeight:800 }}>{myRequests.length}</div>
          <div style={{ fontSize:11, opacity:0.85 }}>Active</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:16 }}>
        {/* Queue */}
        <Card style={{ overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:`1px solid ${T.border}` }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:T.slate }}>My Queue</h3>
          </div>
          {myRequests.length === 0 ? (
            <div style={{ padding:"60px 20px", textAlign:"center", color:T.muted }}>
              <div style={{ fontSize:40, marginBottom:10 }}>🎉</div>
              <div style={{ fontWeight:700, fontSize:15 }}>All caught up!</div>
              <div style={{ fontSize:13 }}>No pending requests.</div>
            </div>
          ) : myRequests.map((r, i) => {
            const pm = PRIORITY_META[r.priority];
            const isActive = selR?.id === r.id;
            return (
              <div key={r.id} onClick={()=>setSel(r)} style={{ padding:"14px 18px", borderBottom:`1px solid ${T.border}`, cursor:"pointer", background:isActive?"#f0fdfa":T.white, borderLeft:`3px solid ${isActive?meta.color:"transparent"}`, transition:"all 0.15s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <div>
                    <span style={{ fontFamily:"monospace", fontSize:11, color:T.teal, fontWeight:700 }}>{r.id}</span>
                    <div style={{ fontWeight:700, fontSize:15, color:T.slate, marginTop:2 }}>{r.patient}</div>
                    <div style={{ color:T.muted, fontSize:12, textTransform:"capitalize" }}>{r.type.replace("_"," ")} · Age {r.age}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:4, alignItems:"flex-end" }}>
                    <Badge color={pm.color} bg={pm.bg}>{pm.label}</Badge>
                    <span style={{ fontSize:10, color:T.muted }}>{new Date(r.created).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                  </div>
                </div>
                {r.desc && <p style={{ color:T.muted, fontSize:12, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", margin:0 }}>{r.desc}</p>}
              </div>
            );
          })}
        </Card>

        {/* Detail */}
        <Card style={{ display:"flex", flexDirection:"column" }}>
          {!selR ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flex:1, minHeight:300, color:T.muted, gap:10 }}>
              <span style={{ fontSize:36 }}>👈</span><p style={{ fontSize:14 }}>Select a request</p>
            </div>
          ) : (
            <>
              <div style={{ padding:"14px 18px", borderBottom:`1px solid ${T.border}`, background:T.bg }}>
                <span style={{ fontFamily:"monospace", fontSize:11, color:T.teal, fontWeight:700 }}>{selR.id}</span>
                <h3 style={{ fontSize:16, fontWeight:800, color:T.slate, margin:"4px 0 2px" }}>{selR.patient}</h3>
                <span style={{ fontSize:13, color:T.muted, textTransform:"capitalize" }}>{selR.type.replace("_"," ")}</span>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:18 }}>
                <Card style={{ padding:14, marginBottom:16, background:T.bg }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, fontSize:12 }}>
                    {[["Age",selR.age],["Phone",selR.phone],["Priority",selR.priority],["Status","In Progress"]].map(([k,v])=>(
                      <div key={k}><div style={{ color:T.muted, fontSize:10, textTransform:"uppercase", fontWeight:600 }}>{k}</div><div style={{ fontWeight:700, color:T.slate, textTransform:"capitalize" }}>{v}</div></div>
                    ))}
                  </div>
                  {selR.desc && <p style={{ marginTop:10, fontSize:13, color:T.slateL, lineHeight:1.6 }}>{selR.desc}</p>}
                </Card>

                {selR.notes?.length > 0 && (
                  <div style={{ marginBottom:14 }}>
                    {selR.notes.map((n,i) => (
                      <div key={i} style={{ background:T.amberLt, borderRadius:8, padding:"8px 12px", marginBottom:6, fontSize:12 }}>
                        <div>{n.text}</div>
                        <div style={{ color:"#92400e", fontSize:10, marginTop:3 }}>— {n.by}</div>
                      </div>
                    ))}
                  </div>
                )}

                <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} placeholder="Add clinical notes, findings, reports…"
                  style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1.5px solid ${T.border}`, fontSize:13, resize:"none", outline:"none", boxSizing:"border-box", fontFamily:"'Outfit',sans-serif", marginBottom:8 }} />
                <button onClick={()=>{addNote(selR.id,note,user.name);setNote("");}} style={{ width:"100%", padding:9, borderRadius:8, border:`1px solid ${T.border}`, background:T.bg, color:T.teal, cursor:"pointer", fontWeight:700, fontSize:13, fontFamily:"'Outfit',sans-serif", marginBottom:12 }}>
                  📝 Save Note
                </button>

                <button onClick={()=>advanceStage(selR.id)} style={{ width:"100%", padding:13, borderRadius:10, border:"none", background:`linear-gradient(135deg,${meta.color},${meta.color}cc)`, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
                  ✅ Complete & Forward →
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminPage({ requests, users: initUsers, departments: initDepts, addDept, addUser, deleteRequest }) {
  const [tab, setTab] = useState("departments");
  const [showDeptForm, setShowDeptForm] = useState(false);
  const [deptForm, setDeptForm] = useState({ name:"", code:"", head:"", desc:"" });
  const [depts, setDepts] = useState(initDepts);

  const TABS = [
    { key:"departments", label:"🏢 Departments", count:initDepts.length },
    { key:"users",       label:"👥 Users",        count:initUsers.length },
    { key:"requests",    label:"📋 Requests",      count:requests.length },
    { key:"delays",      label:"⚠️ Delays",        count:requests.filter(r=>r.priority==="emergency"&&r.status!=="completed").length },
  ];

  const I = (field, obj, setObj) => ({
    value: obj[field],
    onChange: e => setObj(p => ({ ...p, [field]: e.target.value })),
    style: { width:"100%", padding:"10px 12px", borderRadius:8, border:`1.5px solid ${T.border}`, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"'Outfit',sans-serif" },
  });

  const createDept = () => {
    if (!deptForm.name || !deptForm.code) return;
    addDept({ ...deptForm, id:"d"+Date.now(), active:true, staff:0 });
    setDeptForm({ name:"", code:"", head:"", desc:"" });
    setShowDeptForm(false);
  };

  return (
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontSize:20, fontWeight:800, color:T.slate }}>⚙️ Admin Control Panel</h2>
        <p style={{ color:T.muted, fontSize:14 }}>Manage departments, users, monitor requests and delays.</p>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:20, background:T.white, padding:6, borderRadius:12, border:`1px solid ${T.border}`, width:"fit-content" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)} style={{ padding:"8px 15px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:600, background:tab===t.key?T.teal:"transparent", color:tab===t.key?"#fff":T.muted, fontFamily:"'Outfit',sans-serif", transition:"all 0.15s" }}>
            {t.label} <span style={{ background:tab===t.key?"rgba(255,255,255,0.25)":"#f1f5f9", padding:"1px 7px", borderRadius:10, fontSize:11, marginLeft:4 }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Departments */}
      {tab === "departments" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:T.slate }}>Hospital Departments</h3>
            <button onClick={()=>setShowDeptForm(s=>!s)} style={{ padding:"9px 18px", borderRadius:9, border:"none", background:T.teal, color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, fontFamily:"'Outfit',sans-serif" }}>+ Add Department</button>
          </div>

          {showDeptForm && (
            <Card style={{ padding:22, marginBottom:18, border:`1px solid ${T.tealLt}` }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[["Name *","name"],["Code *","code"],["Department Head","head"],["Description","desc"]].map(([l,f])=>(
                  <div key={f}><label style={{ display:"block", fontSize:11, fontWeight:700, color:T.slateL, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:5 }}>{l}</label><input {...I(f,deptForm,setDeptForm)} /></div>
                ))}
              </div>
              <div style={{ display:"flex", gap:10, marginTop:14 }}>
                <button onClick={createDept} style={{ padding:"9px 20px", borderRadius:8, border:"none", background:T.teal, color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13, fontFamily:"'Outfit',sans-serif" }}>Create</button>
                <button onClick={()=>setShowDeptForm(false)} style={{ padding:"9px 16px", borderRadius:8, border:`1px solid ${T.border}`, background:T.white, color:T.muted, cursor:"pointer", fontSize:13, fontFamily:"'Outfit',sans-serif" }}>Cancel</button>
              </div>
            </Card>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:14 }}>
            {initDepts.map(d => {
              const meta = DEPT_META[d.code] || { color:T.teal, icon:"🏢" };
              const active = requests.filter(r=>r.stage===d.code&&r.status!=="completed").length;
              return (
                <Card key={d.id} style={{ padding:20, borderTop:`3px solid ${meta.color}` }}>
                  <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:12 }}>
                    <div style={{ width:42, height:42, borderRadius:12, background:`${meta.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{meta.icon}</div>
                    <div>
                      <div style={{ fontWeight:800, fontSize:15, color:T.slate }}>{d.name}</div>
                      <div style={{ fontSize:11, color:T.muted, fontFamily:"monospace" }}>{d.code}</div>
                    </div>
                  </div>
                  {d.head && <p style={{ fontSize:13, color:T.muted, marginBottom:6 }}>👤 {d.head}</p>}
                  {d.desc && <p style={{ fontSize:12, color:"#94a3b8", marginBottom:10 }}>{d.desc}</p>}
                  <div style={{ display:"flex", gap:8 }}>
                    <Badge color={meta.color} bg={`${meta.color}18`}>{active} active</Badge>
                    <Badge color={T.muted} bg={T.border}>{d.staff} staff</Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <Card style={{ overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:`1px solid ${T.border}` }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:T.slate }}>System Users ({initUsers.length})</h3>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:T.bg }}>
                {["Name","Email","Role","Last Login","Status"].map(h=>(
                  <th key={h} style={{ padding:"10px 16px", textAlign:"left", color:T.muted, fontWeight:600, fontSize:11, textTransform:"uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {initUsers.map(u => {
                const meta = DEPT_META[u.role]||{color:T.teal};
                return (
                  <tr key={u.id} style={{ borderBottom:`1px solid ${T.border}` }}>
                    <td style={{ padding:"12px 16px", fontWeight:700, color:T.slate }}>{u.name}</td>
                    <td style={{ padding:"12px 16px", color:T.muted, fontSize:12 }}>{u.email}</td>
                    <td style={{ padding:"12px 16px" }}><Badge color={meta.color} bg={`${meta.color}18`}>{u.role}</Badge></td>
                    <td style={{ padding:"12px 16px", color:"#94a3b8", fontSize:12 }}>Recently</td>
                    <td style={{ padding:"12px 16px" }}><Badge color={T.green} bg={T.greenLt}>Active</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Requests */}
      {tab === "requests" && (
        <Card style={{ overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:`1px solid ${T.border}` }}>
            <h3 style={{ fontSize:14, fontWeight:700, color:T.slate }}>All Requests ({requests.length})</h3>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead>
                <tr style={{ background:T.bg }}>
                  {["ID","Patient","Type","Priority","Stage","Status","Date","Action"].map(h=>(
                    <th key={h} style={{ padding:"10px 14px", textAlign:"left", color:T.muted, fontWeight:600, fontSize:11, textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map(r => {
                  const pm = PRIORITY_META[r.priority];
                  const dm = DEPT_META[r.stage];
                  return (
                    <tr key={r.id} style={{ borderBottom:`1px solid ${T.border}` }}>
                      <td style={{ padding:"11px 14px", fontFamily:"monospace", fontSize:11, color:T.teal, fontWeight:700 }}>{r.id}</td>
                      <td style={{ padding:"11px 14px", fontWeight:700, color:T.slate }}>{r.patient}</td>
                      <td style={{ padding:"11px 14px", color:T.muted, textTransform:"capitalize" }}>{r.type.replace("_"," ")}</td>
                      <td style={{ padding:"11px 14px" }}><Badge color={pm.color} bg={pm.bg}>{pm.label}</Badge></td>
                      <td style={{ padding:"11px 14px", color:dm.color, fontWeight:600, textTransform:"capitalize" }}>{dm.icon} {r.stage}</td>
                      <td style={{ padding:"11px 14px", textTransform:"capitalize", color:T.muted }}>{r.status.replace("_"," ")}</td>
                      <td style={{ padding:"11px 14px", color:"#94a3b8", fontSize:12 }}>{new Date(r.created).toLocaleDateString()}</td>
                      <td style={{ padding:"11px 14px" }}>
                        <button onClick={()=>deleteRequest(r.id)} style={{ padding:"4px 10px", borderRadius:6, border:`1px solid ${T.redLt}`, background:T.redLt, color:T.red, cursor:"pointer", fontSize:11, fontFamily:"'Outfit',sans-serif" }}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Delays */}
      {tab === "delays" && (
        <div>
          <h3 style={{ fontSize:15, fontWeight:700, color:T.slate, marginBottom:16 }}>⚠️ Emergencies & Delays</h3>
          {requests.filter(r=>r.priority==="emergency"&&r.status!=="completed").length === 0 ? (
            <Card style={{ padding:"60px 20px", textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>✅</div>
              <div style={{ fontWeight:700, color:T.green, fontSize:16 }}>No critical delays!</div>
            </Card>
          ) : requests.filter(r=>r.priority==="emergency"&&r.status!=="completed").map(r => (
            <Card key={r.id} style={{ padding:18, marginBottom:12, borderLeft:`4px solid ${T.red}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                <div>
                  <span style={{ fontFamily:"monospace", fontSize:11, color:T.teal, fontWeight:700 }}>{r.id}</span>
                  <div style={{ fontWeight:800, fontSize:15, color:T.slate }}>{r.patient}</div>
                  <div style={{ color:T.muted, fontSize:13, textTransform:"capitalize" }}>{r.type.replace("_"," ")} · Stage: {r.stage}</div>
                  <div style={{ color:"#94a3b8", fontSize:12 }}>Submitted: {new Date(r.created).toLocaleString()}</div>
                </div>
                <Badge color={T.red} bg={T.redLt}>🚨 EMERGENCY</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function AnalyticsPage({ requests }) {
  const total = requests.length || 1;
  const completed = requests.filter(r=>r.status==="completed").length;
  const inProgress = requests.filter(r=>r.status==="in_progress").length;
  const byType = ["appointment","lab_test","prescription","billing","emergency"].map(t => ({
    label: t.replace("_"," ").replace(/\b\w/g,c=>c.toUpperCase()),
    value: requests.filter(r=>r.type===t).length,
    color: ["#3b82f6","#f59e0b","#8b5cf6","#ef4444","#dc2626"][["appointment","lab_test","prescription","billing","emergency"].indexOf(t)],
  }));
  const byPriority = ["normal","high","emergency"].map(p => ({
    label: p.charAt(0).toUpperCase()+p.slice(1),
    value: requests.filter(r=>r.priority===p).length,
    color: PRIORITY_META[p].color,
  }));
  const byDept = STAGES.filter(s=>s!=="completed").map(s => ({
    label: DEPT_META[s].label.slice(0,5),
    value: requests.filter(r=>r.stage===s).length,
    color: DEPT_META[s].color,
  }));
  const completionRate = Math.round(completed/total*100);

  return (
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:20, fontWeight:800, color:T.slate }}>📈 Analytics Overview</h2>
        <p style={{ color:T.muted, fontSize:14 }}>Real-time insights into hospital workflow performance.</p>
      </div>

      {/* Key metrics */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
        <StatCard icon="📋" label="Total Requests"  value={requests.length} color={T.blue} />
        <StatCard icon="✅" label="Completed"        value={completed}       color={T.green} delta={`${completionRate}% rate`} />
        <StatCard icon="⏳" label="In Progress"      value={inProgress}      color={T.amber} />
        <StatCard icon="🚨" label="Emergencies"      value={requests.filter(r=>r.priority==="emergency").length} color={T.red} />
      </div>

      {/* Completion ring + by dept */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:16 }}>
        <Card style={{ padding:22, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <p style={{ fontSize:12, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:16 }}>Completion Rate</p>
          <DonutChart size={110} segments={[{value:completed,color:T.green},{value:inProgress,color:T.amber},{value:requests.filter(r=>r.status==="cancelled").length||0,color:T.red}]} />
          <div style={{ display:"flex", gap:14, marginTop:14 }}>
            {[["Completed",T.green],["In Progress",T.amber],["Cancelled",T.red]].map(([l,c])=>(
              <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:c }} />
                <span style={{ fontSize:11, color:T.muted }}>{l}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding:22 }}>
          <p style={{ fontSize:12, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:16 }}>By Department</p>
          <BarChart data={byDept} height={100} />
        </Card>

        <Card style={{ padding:22 }}>
          <p style={{ fontSize:12, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:16 }}>By Priority</p>
          <BarChart data={byPriority} height={100} />
        </Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* By type */}
        <Card style={{ padding:22 }}>
          <p style={{ fontSize:13, fontWeight:700, color:T.slate, marginBottom:16 }}>Requests by Type</p>
          {byType.map(t => (
            <div key={t.label} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:13, color:T.slateL }}>{t.label}</span>
                <span style={{ fontSize:13, fontWeight:700, color:t.color }}>{t.value}</span>
              </div>
              <div style={{ height:7, background:T.bg, borderRadius:4 }}>
                <div style={{ height:"100%", width:`${Math.round(t.value/total*100)}%`, background:t.color, borderRadius:4, transition:"width 0.6s" }} />
              </div>
            </div>
          ))}
        </Card>

        {/* Dept table */}
        <Card style={{ padding:22 }}>
          <p style={{ fontSize:13, fontWeight:700, color:T.slate, marginBottom:16 }}>Department Summary</p>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr>
                {["Department","Active","Done","Avg Time"].map(h=><th key={h} style={{ padding:"8px 0", textAlign:"left", color:T.muted, fontWeight:600, fontSize:11, textTransform:"uppercase", borderBottom:`1px solid ${T.border}` }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {STAGES.filter(s=>s!=="completed").map(s => {
                const meta = DEPT_META[s];
                const active = requests.filter(r=>r.stage===s&&r.status==="in_progress").length;
                const done = requests.filter(r=>r.stages[s]==="completed").length;
                return (
                  <tr key={s} style={{ borderBottom:`1px solid ${T.border}` }}>
                    <td style={{ padding:"10px 0" }}><span style={{ color:meta.color, fontWeight:600 }}>{meta.icon} {meta.label}</span></td>
                    <td style={{ padding:"10px 0", fontWeight:700, color:T.amber }}>{active}</td>
                    <td style={{ padding:"10px 0", fontWeight:700, color:T.green }}>{done}</td>
                    <td style={{ padding:"10px 0", color:T.muted }}>~{Math.floor(Math.random()*20+10)}min</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useLocalState("hw_user", null);
  const [requests, setRequests] = useLocalState("hw_requests", INIT_REQUESTS);
  const [notifs, setNotifs] = useLocalState("hw_notifs", INIT_NOTIFS);
  const [departments, setDepartments] = useLocalState("hw_depts", INIT_DEPTS);
  const [page, setPage] = useState("dashboard");

  // Inject font
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap";
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Outfit', sans-serif";
    document.body.style.margin = "0";
    document.body.style.background = T.bg;
  }, []);

  const login = (u) => { setUser(u); setPage("dashboard"); };
  const logout = () => { setUser(null); setPage("dashboard"); };

  const addRequest = (req) => {
    setRequests(p => [req, ...p]);
    setNotifs(p => [{
      id:"n"+Date.now(), title:`New ${req.priority} Request`,
      msg:`${req.patient} — ${req.type.replace("_"," ")}`,
      type:req.priority==="emergency"?"emergency":"new", dept:"reception", read:false, at:new Date(),
    }, ...p]);
  };

  const advanceStage = (id) => {
    setRequests(prev => prev.map(r => {
      if (r.id !== id) return r;
      const idx = STAGES.indexOf(r.stage);
      if (idx < 0 || idx >= STAGES.length - 1) return r;
      const next = STAGES[idx + 1];
      const updatedStages = { ...r.stages, [r.stage]:"completed" };
      if (next !== "completed") updatedStages[next] = "in_progress";
      return { ...r, stage:next, status:next==="completed"?"completed":"in_progress", stages:updatedStages, completedAt:next==="completed"?new Date():undefined };
    }));
    const req = requests.find(r => r.id === id);
    if (req) {
      const idx = STAGES.indexOf(req.stage);
      const next = STAGES[idx+1];
      if (next && next !== "completed") {
        setNotifs(p => [{ id:"n"+Date.now(), title:"Request Forwarded", msg:`${req.patient}'s request moved to ${next}`, type:"new", dept:next, read:false, at:new Date() }, ...p]);
      }
    }
  };

  const addNote = (id, text, by) => {
    setRequests(prev => prev.map(r => r.id===id ? { ...r, notes:[...(r.notes||[]),{text,by,at:new Date()}] } : r));
  };

  const addDept = (d) => setDepartments(p => [...p, d]);

  const deleteRequest = (id) => setRequests(p => p.filter(r => r.id !== id));

  const markAllRead = () => setNotifs(p => p.map(n => ({ ...n, read:true })));

  const unread = notifs.filter(n => !n.read).length;

  if (!user) return <LoginPage onLogin={login} />;

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'Outfit', sans-serif" }}>
      <Sidebar user={user} page={page} setPage={setPage} unread={unread} />
      <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        <TopBar user={user} logout={logout} notifs={notifs} markAllRead={markAllRead} page={page} />
        <main style={{ flex:1, padding:"24px", background:T.bg }}>
          {page === "dashboard"   && <DashboardPage   user={user} requests={requests} notifs={notifs} setPage={setPage} />}
          {page === "new-request" && <NewRequestPage  user={user} addRequest={addRequest} />}
          {page === "workflow"    && <WorkflowPage    user={user} requests={requests} advanceStage={advanceStage} addNote={addNote} />}
          {page === "department"  && <DepartmentPage  user={user} requests={requests} advanceStage={advanceStage} addNote={addNote} />}
          {page === "admin"       && <AdminPage        requests={requests} users={USERS} departments={departments} addDept={addDept} addUser={()=>{}} deleteRequest={deleteRequest} />}
          {page === "analytics"   && <AnalyticsPage   requests={requests} />}
        </main>
      </div>
    </div>
  );
}
