import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Settings, LogOut, ChevronRight, MapPin, Clock,
  Phone, Mail, Star, Car, TrendingUp, Shield,
  Navigation, X, ArrowUpRight, Zap, User
} from "lucide-react";

/* ─── Inject styles once ─── */
if (!document.getElementById("cp-styles")) {
  const s = document.createElement("style");
  s.id = "cp-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    .cp * { box-sizing: border-box; margin: 0; padding: 0; }
    .cp {
      font-family: 'Plus Jakarta Sans', sans-serif;
      --black:   #0A0A0A;
      --surface: #FFFFFF;
      --s2:      #F7F7F7;
      --s3:      #EFEFEF;
      --border:  #E8E8E8;
      --t1:      #111111;
      --t2:      #555555;
      --t3:      #AAAAAA;
      --green:   #05944F;
      --blue:    #276EF1;
      --red:     #C8102E;
      --amber:   #E67E00;
      min-height: 100vh;
      background: #F4F4F4;
    }

    @keyframes cp-fade { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes cp-pop  { 0%{transform:scale(0.96);opacity:0} 100%{transform:scale(1);opacity:1} }
    @keyframes cp-spin { to{transform:rotate(360deg)} }
    @keyframes cp-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

    .cp-fade { animation: cp-fade 0.4s ease both; }
    .cp-pop  { animation: cp-pop  0.35s cubic-bezier(0.34,1.4,0.64,1) both; }

    /* ── Hero (green tint for captain) ── */
    .cp-hero {
      background: var(--black);
      padding: 56px 24px 80px;
      position: relative; overflow: hidden;
    }
    .cp-hero::before {
      content:''; position:absolute; inset:0;
      background: radial-gradient(ellipse at 80% 0%, rgba(5,148,79,0.2) 0%, transparent 65%);
      pointer-events:none;
    }
    .cp-hero-noise {
      position:absolute; inset:0; pointer-events:none; opacity:0.04;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }

    /* ── Avatar ── */
    .cp-avatar-ring {
      width:80px; height:80px; border-radius:50%;
      border:2px solid rgba(255,255,255,0.12); padding:3px;
      background:rgba(255,255,255,0.06); margin-bottom:14px;
    }
    .cp-avatar-inner {
      width:100%; height:100%; border-radius:50%; overflow:hidden;
      background:#1a1a1a; display:flex; align-items:center; justify-content:center;
    }
    .cp-name { font-size:24px; font-weight:800; color:#fff; letter-spacing:-0.01em; margin-bottom:4px; }
    .cp-sub  { font-size:13px; color:rgba(255,255,255,0.45); font-weight:500; }

    /* ── Online badge ── */
    .cp-online-badge {
      display:inline-flex; align-items:center; gap:6px;
      padding:5px 12px; border-radius:100px; margin-top:12px;
      font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase;
    }
    .cp-online-badge.active   { background:rgba(5,148,79,0.18);  border:1px solid rgba(5,148,79,0.3);  color:#4DC985; }
    .cp-online-badge.inactive { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); color:rgba(255,255,255,0.4); }
    .cp-pulse-dot { width:6px; height:6px; border-radius:50%; background:currentColor; animation:cp-pulse 1.5s ease infinite; }

    /* ── Stats ── */
    .cp-stats-row {
      display:grid; grid-template-columns:repeat(3,1fr);
      background:var(--surface); border-radius:20px;
      margin:-36px 16px 0; position:relative; z-index:2;
      box-shadow:0 4px 24px rgba(0,0,0,0.08); overflow:hidden;
    }
    .cp-stat { padding:20px 16px; text-align:center; border-right:1px solid var(--border); }
    .cp-stat:last-child { border-right:none; }
    .cp-stat-val { font-family:'JetBrains Mono',monospace; font-size:22px; font-weight:600; color:var(--t1); display:block; margin-bottom:4px; }
    .cp-stat-lbl { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--t3); }

    /* ── Section ── */
    .cp-section { padding:0 16px; margin-top:16px; }
    .cp-card {
      background:var(--surface); border-radius:20px;
      border:1px solid var(--border); overflow:hidden;
      box-shadow:0 1px 4px rgba(0,0,0,0.04);
    }
    .cp-card-title {
      font-size:11px; font-weight:800; letter-spacing:0.1em;
      text-transform:uppercase; color:var(--t3); padding:16px 20px 8px;
    }

    /* ── Vehicle card (special) ── */
    .cp-vehicle-card {
      background:var(--surface); border-radius:20px;
      border:1px solid var(--border);
      box-shadow:0 1px 4px rgba(0,0,0,0.04);
      overflow:hidden;
    }
    .cp-vehicle-header {
      background:var(--black); padding:20px;
      display:flex; align-items:center; gap:14px;
    }
    .cp-vehicle-icon {
      width:48px; height:48px; border-radius:14px;
      background:rgba(5,148,79,0.2); border:1px solid rgba(5,148,79,0.3);
      display:flex; align-items:center; justify-content:center;
    }
    .cp-vehicle-plate {
      font-family:'JetBrains Mono',monospace;
      font-size:16px; font-weight:600; color:#fff; letter-spacing:0.04em;
    }
    .cp-vehicle-type { font-size:12px; color:rgba(255,255,255,0.45); margin-top:2px; font-weight:500; }

    .cp-vehicle-grid {
      display:grid; grid-template-columns:1fr 1fr;
      gap:0;
    }
    .cp-vehicle-cell {
      padding:16px 20px; border-right:1px solid var(--border); border-bottom:1px solid var(--border);
    }
    .cp-vehicle-cell:nth-child(2) { border-right:none; }
    .cp-vehicle-cell:nth-child(3) { border-bottom:none; }
    .cp-vehicle-cell:nth-child(4) { border-right:none; border-bottom:none; }
    .cp-vehicle-lbl { font-size:10px; color:var(--t3); font-weight:700; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px; }
    .cp-vehicle-val { font-size:14px; font-weight:700; color:var(--t1); }

    /* ── Info rows ── */
    .cp-info-row { display:flex; align-items:center; gap:14px; padding:14px 20px; border-bottom:1px solid var(--border); }
    .cp-info-row:last-child { border-bottom:none; }
    .cp-info-icon { width:36px; height:36px; border-radius:10px; background:var(--s2); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .cp-info-label { font-size:11px; color:var(--t3); font-weight:600; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:2px; }
    .cp-info-val   { font-size:14px; font-weight:600; color:var(--t1); }

    /* ── Action rows ── */
    .cp-action-row { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid var(--border); cursor:pointer; transition:background 0.15s; }
    .cp-action-row:last-child { border-bottom:none; }
    .cp-action-row:hover { background:var(--s2); }
    .cp-action-left { display:flex; align-items:center; gap:14px; }
    .cp-action-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .cp-action-label { font-size:15px; font-weight:600; color:var(--t1); }
    .cp-action-sub   { font-size:12px; color:var(--t3); margin-top:1px; }

    /* ── Ride card ── */
    .cp-ride-card { padding:16px 20px; border-bottom:1px solid var(--border); cursor:pointer; transition:background 0.15s; }
    .cp-ride-card:last-child { border-bottom:none; }
    .cp-ride-card:hover { background:var(--s2); }
    .cp-ride-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; }
    .cp-ride-route { display:flex; flex-direction:column; gap:6px; flex:1; padding-right:12px; }
    .cp-ride-loc { display:flex; align-items:center; gap:8px; }
    .cp-ride-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .cp-ride-dot.from { background:var(--green); }
    .cp-ride-dot.to   { background:var(--black); }
    .cp-ride-addr { font-size:13px; font-weight:600; color:var(--t1); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px; }
    .cp-ride-fare { font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:600; color:var(--green); text-align:right; flex-shrink:0; }
    .cp-ride-meta { display:flex; align-items:center; gap:12px; }
    .cp-ride-pill { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:100px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; }
    .cp-ride-pill.completed { background:rgba(5,148,79,0.1);   color:var(--green); }
    .cp-ride-pill.pending   { background:rgba(230,126,0,0.1);  color:var(--amber); }
    .cp-ride-pill.cancelled { background:rgba(200,16,46,0.1);  color:var(--red);   }
    .cp-ride-pill.ongoing   { background:rgba(39,110,241,0.1); color:var(--blue);  }
    .cp-ride-time { font-size:11px; color:var(--t3); font-weight:500; }

    /* ── Logout ── */
    .cp-logout-btn {
      width:calc(100% - 32px); margin:16px;
      padding:15px; border-radius:14px; border:none; cursor:pointer;
      font-family:'Plus Jakarta Sans',sans-serif;
      font-size:14px; font-weight:700; letter-spacing:0.02em;
      background:var(--surface); color:var(--red);
      border:1.5px solid rgba(200,16,46,0.2);
      display:flex; align-items:center; justify-content:center; gap:8px;
      transition:background 0.15s, border-color 0.15s;
    }
    .cp-logout-btn:hover { background:#FFF5F6; border-color:rgba(200,16,46,0.4); }

    /* ── Modal ── */
    .cp-modal-bg { position:fixed; inset:0; background:rgba(0,0,0,0.45); backdrop-filter:blur(6px); z-index:100; display:flex; align-items:flex-end; justify-content:center; animation:cp-fade 0.2s ease; }
    .cp-modal { background:var(--surface); width:100%; max-width:480px; border-radius:28px 28px 0 0; padding:12px 0 40px; max-height:85vh; overflow-y:auto; animation:cp-pop 0.3s cubic-bezier(0.34,1.4,0.64,1); }
    .cp-modal-handle { width:40px; height:4px; border-radius:2px; background:#DDD; margin:0 auto 20px; }

    /* ── Empty ── */
    .cp-empty { display:flex; flex-direction:column; align-items:center; padding:48px 24px; text-align:center; }
    .cp-empty-icon { width:60px; height:60px; border-radius:50%; background:var(--s2); display:flex; align-items:center; justify-content:center; margin-bottom:14px; }

    /* ── Spinner ── */
    .cp-spinner { width:36px; height:36px; border-radius:50%; border:3px solid var(--s3); border-top-color:var(--black); animation:cp-spin 0.7s linear infinite; }

    .cp-scroll::-webkit-scrollbar { width:0; }
  `;
  document.head.appendChild(s);
}
import { useContext } from "react";
import { captionDataContext } from "../context/captionContext";
const statusPill = (status) => {
  const map = { completed:"completed", pending:"pending", cancelled:"cancelled", ongoing:"ongoing", active:"ongoing" };
  return map[status?.toLowerCase()] || "pending";
};
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });

const CaptainProfile = () => {
 
  const [rides,        setRides]        = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [loading,      setLoading]      = useState(true);


const { caption } = useContext(captionDataContext);

useEffect(() => {
  axios.get(`${import.meta.env.VITE_BASE_URL}/captions/profile`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("captionToken")}`,
    },
  })
    .then((r) => {
      setRides(r.data.rides || []);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
}, []);

  const totalEarned    = rides.reduce((s, r) => s + (r.fare || 0), 0);
  const completedRides = rides.filter((r) => r.status === "completed").length;
  const isActive       = caption?.status === "active";

  if (loading) return (
    <div className="cp" style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh" }}>
      <div className="cp-spinner" />
    </div>
  );

  if (!caption) return (
    <div className="cp" style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh" }}>
      <p style={{ color:"#AAA" }}>No data found</p>
    </div>
  );
  // 🔥 ADD THIS BELOW YOUR STATES
const ongoingRide = rides.find(
  (r) => r.status === "ongoing" || r.status === "accepted"
);

  return (
    <div className="cp cp-scroll" style={{ overflowY:"auto", paddingBottom:32 }}>
      {/* ── HERO ── */}
      <div className="cp-hero cp-fade">
        <div className="cp-hero-noise" />

        {/* Top nav */}
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:32 }}>
          <button style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"8px 14px", color:"rgba(255,255,255,0.6)", fontSize:12, fontWeight:700, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <Settings size={14} /> Settings
          </button>
        </div>

        {/* Avatar + info */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start" }}>
          <div className="cp-avatar-ring">
            <div className="cp-avatar-inner">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${caption.firstname || "captain"}`}
                alt="avatar"
                style={{ width:"100%", height:"100%", objectFit:"cover" }}
              />
            </div>
          </div>

          <p className="cp-name">{caption.firstname} {caption.lastname || ""}</p>
          <p className="cp-sub">{caption.phone || caption.email || "GoIndia Captain"}</p>

          <div className={`cp-online-badge ${isActive ? "active" : "inactive"}`}>
            <span className="cp-pulse-dot" style={{ animationPlayState: isActive ? "running" : "paused" }} />
            {isActive ? "Active Driver" : "Inactive"}
          </div>
        </div>
      </div>
      

      {/* ── STATS ── */}
      <div className="cp-stats-row cp-fade" style={{ animationDelay:"0.08s" }}>
        <div className="cp-stat">
          <span className="cp-stat-val">{rides.length}</span>
          <span className="cp-stat-lbl">Rides</span>
        </div>
        <div className="cp-stat">
          <span className="cp-stat-val" style={{ color:"#05944F" }}>₹{totalEarned}</span>
          <span className="cp-stat-lbl">Earned</span>
        </div>
        <div className="cp-stat">
          <span className="cp-stat-val">{completedRides}</span>
          <span className="cp-stat-lbl">Done</span>
        </div>
      </div>

      {/* ── VEHICLE CARD ── */}
      <div className="cp-section cp-fade" style={{ animationDelay:"0.1s" }}>
        <div className="cp-vehicle-card" style={{ marginTop:16 }}>
          <div className="cp-vehicle-header">
            <div className="cp-vehicle-icon">
              <Car size={22} color="#05944F" />
            </div>
            <div>
              <p className="cp-vehicle-plate">{caption.vehicle?.plate || "N/A"}</p>
              <p className="cp-vehicle-type capitalize">{caption.vehicle?.color} {caption.vehicle?.type || "Vehicle"}</p>
            </div>
          </div>
          <div className="cp-vehicle-grid">
            <div className="cp-vehicle-cell">
              <p className="cp-vehicle-lbl">Type</p>
              <p className="cp-vehicle-val capitalize">{caption.vehicle?.type || "--"}</p>
            </div>
            <div className="cp-vehicle-cell">
              <p className="cp-vehicle-lbl">Color</p>
              <p className="cp-vehicle-val capitalize">{caption.vehicle?.color || "--"}</p>
            </div>
            <div className="cp-vehicle-cell">
              <p className="cp-vehicle-lbl">Capacity</p>
              <p className="cp-vehicle-val">{caption.vehicle?.capacity || "--"} seats</p>
            </div>
            <div className="cp-vehicle-cell">
              <p className="cp-vehicle-lbl">Rating</p>
              <p className="cp-vehicle-val">5.0 ★</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACCOUNT INFO ── */}
      <div className="cp-section cp-fade" style={{ animationDelay:"0.14s" }}>
        <div className="cp-card" style={{ marginTop:16 }}>
          <p className="cp-card-title">Account</p>

          {caption.email && (
            <div className="cp-info-row">
              <div className="cp-info-icon"><Mail size={16} color="#555" /></div>
              <div>
                <div className="cp-info-label">Email</div>
                <div className="cp-info-val">{caption.email}</div>
              </div>
            </div>
          )}
          {caption.phone && (
            <div className="cp-info-row">
              <div className="cp-info-icon"><Phone size={16} color="#555" /></div>
              <div>
                <div className="cp-info-label">Phone</div>
                <div className="cp-info-val">{caption.phone}</div>
              </div>
            </div>
          )}
        
          <div className="cp-info-row">
            <div className="cp-info-icon"><TrendingUp size={16} color="#555" /></div>
            <div>
              <div className="cp-info-label">Acceptance Rate</div>
              <div className="cp-info-val">98%</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="cp-section cp-fade" style={{ animationDelay:"0.18s" }}>
        <div className="cp-card" style={{ marginTop:16 }}>
          <p className="cp-card-title">Quick Actions</p>

          <div className="cp-action-row">
            <div className="cp-action-left">
              <div className="cp-action-icon" style={{ background:"#E6F6EE" }}><Zap size={17} color="#05944F" /></div>
              <div>
                <div className="cp-action-label">Earnings Summary</div>
                <div className="cp-action-sub">Daily, weekly, monthly</div>
              </div>
            </div>
            <ChevronRight size={18} color="#AAA" />
          </div>

          <div className="cp-action-row">
            <div className="cp-action-left">
              <div className="cp-action-icon" style={{ background:"#EBF2FE" }}><Car size={17} color="#276EF1" /></div>
              <div>
                <div className="cp-action-label">Vehicle Documents</div>
                <div className="cp-action-sub">License, RC, Insurance</div>
              </div>
            </div>
            <ChevronRight size={18} color="#AAA" />
          </div>

          <div className="cp-action-row">
            <div className="cp-action-left">
              <div className="cp-action-icon" style={{ background:"#FFF3E0" }}><Shield size={17} color="#E67E00" /></div>
              <div>
                <div className="cp-action-label">Safety Centre</div>
                <div className="cp-action-sub">Emergency & support</div>
              </div>
            </div>
            <ChevronRight size={18} color="#AAA" />
          </div>
        </div>
      </div>


      {/* ── RIDE HISTORY ── */}
      <div className="cp-section cp-fade" style={{ animationDelay:"0.22s" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 0 8px" }}>
          <p style={{ fontSize:17, fontWeight:800, color:"#111" }}>Trip History</p>
          <p style={{ fontSize:12, fontWeight:700, color:"#AAA", letterSpacing:"0.06em", textTransform:"uppercase" }}>
            {rides.length} total
          </p>
        </div>

        <div className="cp-card">
          {rides.length === 0 ? (
            <div className="cp-empty">
              <div className="cp-empty-icon"><Car size={24} color="#CCC" /></div>
              <p style={{ fontSize:15, fontWeight:700, color:"#555" }}>No trips yet</p>
              <p style={{ fontSize:13, color:"#AAA", marginTop:4 }}>Start accepting rides to see them here</p>
            </div>
          ) : (
            rides.slice(0, 20).map((ride) => (
              <div key={ride._id} className="cp-ride-card" onClick={() => setSelectedRide(ride)}>
                <div className="cp-ride-top">
                  <div className="cp-ride-route">
                    <div className="cp-ride-loc">
                      <div className="cp-ride-dot from" />
                      <span className="cp-ride-addr">{ride.pickup || "Pickup"}</span>
                    </div>
                    <div style={{ width:1.5, height:10, background:"#E8E8E8", marginLeft:3.5 }} />
                    <div className="cp-ride-loc">
                      <div className="cp-ride-dot to" />
                      <span className="cp-ride-addr">{ride.destination || "Destination"}</span>
                    </div>
                  </div>
                  <div>
                    <div className="cp-ride-fare">₹{ride.fare}</div>
                    <ArrowUpRight size={14} color="#AAA" style={{ marginTop:4, marginLeft:"auto", display:"block" }} />
                  </div>
                </div>
                <div className="cp-ride-meta">
                  <span className={`cp-ride-pill ${statusPill(ride.status)}`}>{ride.status || "pending"}</span>
                  <span className="cp-ride-time">
                    <Clock size={11} style={{ display:"inline", marginRight:3, verticalAlign:"middle" }} />
                    {fmtDate(ride.createdAt)}
                  </span>
                  {ride.user?.fullname?.firstname && (
                    <span className="cp-ride-time">
                      <User size={11} style={{ display:"inline", marginRight:3, verticalAlign:"middle" }} />
                      {ride.user.fullname.firstname}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── LOGOUT ── */}
      <button className="cp-logout-btn cp-fade" style={{ animationDelay:"0.26s" }}>
        <LogOut size={16} /> Sign Out
      </button>

      {/* ── RIDE DETAIL MODAL ── */}
      {selectedRide && (
        <div className="cp-modal-bg" onClick={() => setSelectedRide(null)}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cp-modal-handle" />

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px 16px" }}>
              <p style={{ fontSize:18, fontWeight:800, color:"#111" }}>Trip Details</p>
              <button onClick={() => setSelectedRide(null)} style={{ width:32, height:32, borderRadius:"50%", background:"#F4F4F4", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <X size={16} color="#555" />
              </button>
            </div>

            <div style={{ height:1, background:"#E8E8E8", margin:"0 0 20px" }} />

            {/* Fare hero */}
            <div style={{ textAlign:"center", padding:"8px 24px 20px" }}>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#AAA", marginBottom:6 }}>Earned</p>
              <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:48, fontWeight:600, color:"#05944F", letterSpacing:"-0.02em", lineHeight:1 }}>₹{selectedRide.fare}</p>
              <div style={{ display:"flex", justifyContent:"center", marginTop:10 }}>
                <span className={`cp-ride-pill ${statusPill(selectedRide.status)}`} style={{ fontSize:11, padding:"5px 12px" }}>
                  {selectedRide.status}
                </span>
              </div>
            </div>

            <div style={{ height:1, background:"#E8E8E8", margin:"0 24px 20px" }} />

            {/* Route */}
            <div style={{ padding:"0 24px 20px" }}>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#AAA", marginBottom:14 }}>Route</p>
              <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:4, flexShrink:0 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:"#05944F" }} />
                  <div style={{ width:1.5, height:32, background:"#E8E8E8", margin:"4px 0" }} />
                  <div style={{ width:10, height:10, borderRadius:"50%", background:"#111" }} />
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:11, color:"#AAA", fontWeight:600, marginBottom:2 }}>Pickup</p>
                  <p style={{ fontSize:14, fontWeight:600, color:"#111", marginBottom:18 }}>{selectedRide.pickup}</p>
                  <p style={{ fontSize:11, color:"#AAA", fontWeight:600, marginBottom:2 }}>Destination</p>
                  <p style={{ fontSize:14, fontWeight:600, color:"#111" }}>{selectedRide.destination}</p>
                </div>
              </div>
            </div>

            {/* Passenger + meta */}
            {selectedRide.user && (
              <div style={{ margin:"0 24px 16px", background:"#F7F7F7", borderRadius:14, padding:"14px 16px" }}>
                <p style={{ fontSize:10, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Passenger</p>
                <p style={{ fontSize:14, fontWeight:700, color:"#111" }}>
                  {selectedRide.user.fullname?.firstname || "Unknown"} {selectedRide.user.fullname?.lastname || ""}
                </p>
                {selectedRide.user.phone && (
                  <p style={{ fontSize:13, color:"#555", marginTop:4, display:"flex", alignItems:"center", gap:5 }}>
                    <Phone size={12} /> {selectedRide.user.phone}
                  </p>
                )}
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, padding:"0 24px 24px" }}>
              <div style={{ background:"#F7F7F7", borderRadius:14, padding:"14px 16px" }}>
                <p style={{ fontSize:10, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Date</p>
                <p style={{ fontSize:13, fontWeight:700, color:"#111" }}>{fmtDate(selectedRide.createdAt)}</p>
              </div>
              <div style={{ background:"#F7F7F7", borderRadius:14, padding:"14px 16px" }}>
                <p style={{ fontSize:10, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Payment</p>
                <p style={{ fontSize:14, fontWeight:700, color:"#111" }}>{selectedRide.paymentMethod || "Cash"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaptainProfile;