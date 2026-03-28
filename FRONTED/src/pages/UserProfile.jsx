import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Settings, LogOut, ChevronRight, MapPin, Clock,
  CreditCard, Phone, Mail, Star, TrendingUp, Shield,
  Navigation, X, ArrowUpRight, User
} from "lucide-react";

/* ─── Inject styles once ─── */
if (!document.getElementById("up-styles")) {
  const s = document.createElement("style");
  s.id = "up-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    .up * { box-sizing: border-box; margin: 0; padding: 0; }
    .up {
      font-family: 'Plus Jakarta Sans', sans-serif;
      --black:   #0A0A0A;
      --surface: #FFFFFF;
      --s2:      #F7F7F7;
      --s3:      #EFEFEF;
      --border:  #E8E8E8;
      --t1:      #111111;
      --t2:      #555555;
      --t3:      #AAAAAA;
      --blue:    #276EF1;
      --green:   #05944F;
      --red:     #C8102E;
      --amber:   #E67E00;
      min-height: 100vh;
      background: #F4F4F4;
    }

    @keyframes up-fade { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes up-pop  { 0%{transform:scale(0.96);opacity:0} 100%{transform:scale(1);opacity:1} }
    @keyframes up-spin { to{transform:rotate(360deg)} }

    .up-fade { animation: up-fade 0.4s ease both; }
    .up-pop  { animation: up-pop  0.35s cubic-bezier(0.34,1.4,0.64,1) both; }

    /* ── Header ── */
    .up-hero {
      background: var(--black);
      padding: 56px 24px 80px;
      position: relative;
      overflow: hidden;
    }
    .up-hero::before {
      content:'';
      position:absolute; inset:0;
      background: radial-gradient(ellipse at 80% 0%, rgba(39,110,241,0.18) 0%, transparent 65%);
      pointer-events:none;
    }
    .up-hero-noise {
      position:absolute; inset:0; pointer-events:none; opacity:0.04;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }

    /* ── Avatar ── */
    .up-avatar-ring {
      width: 80px; height: 80px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.12);
      padding: 3px;
      background: rgba(255,255,255,0.06);
      margin-bottom: 14px;
    }
    .up-avatar-inner {
      width:100%; height:100%; border-radius:50%; overflow:hidden;
      background: #1a1a1a;
      display:flex; align-items:center; justify-content:center;
    }
    .up-name { font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.01em; margin-bottom: 4px; }
    .up-sub  { font-size: 13px; color: rgba(255,255,255,0.45); font-weight: 500; }

    /* ── Badge ── */
    .up-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 5px 12px; border-radius: 100px; margin-top: 12px;
      font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
      background: rgba(39,110,241,0.18); border: 1px solid rgba(39,110,241,0.3);
      color: #7BAAFF;
    }

    /* ── Stats row ── */
    .up-stats-row {
      display: grid; grid-template-columns: repeat(3, 1fr);
      background: var(--surface);
      border-radius: 20px;
      margin: -36px 16px 0;
      position: relative; z-index: 2;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    .up-stat {
      padding: 20px 16px; text-align: center;
      border-right: 1px solid var(--border);
    }
    .up-stat:last-child { border-right: none; }
    .up-stat-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 22px; font-weight: 600; color: var(--t1); display: block; margin-bottom: 4px;
    }
    .up-stat-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--t3); }

    /* ── Section ── */
    .up-section { padding: 0 16px; margin-top: 16px; }
    .up-card {
      background: var(--surface); border-radius: 20px;
      border: 1px solid var(--border);
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }
    .up-card-title {
      font-size: 11px; font-weight: 800; letter-spacing: 0.1em;
      text-transform: uppercase; color: var(--t3);
      padding: 16px 20px 8px;
    }

    /* ── Info rows ── */
    .up-info-row {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 20px; border-bottom: 1px solid var(--border);
    }
    .up-info-row:last-child { border-bottom: none; }
    .up-info-icon {
      width: 36px; height: 36px; border-radius: 10px;
      background: var(--s2); display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .up-info-label { font-size: 11px; color: var(--t3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
    .up-info-val   { font-size: 14px; font-weight: 600; color: var(--t1); }

    /* ── Action buttons ── */
    .up-action-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; border-bottom: 1px solid var(--border); cursor: pointer;
      transition: background 0.15s;
    }
    .up-action-row:last-child { border-bottom: none; }
    .up-action-row:hover { background: var(--s2); }
    .up-action-left { display: flex; align-items: center; gap: 14px; }
    .up-action-icon {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .up-action-label { font-size: 15px; font-weight: 600; color: var(--t1); }
    .up-action-sub   { font-size: 12px; color: var(--t3); margin-top: 1px; }

    /* ── Ride card ── */
    .up-ride-card {
      padding: 16px 20px; border-bottom: 1px solid var(--border);
      cursor: pointer; transition: background 0.15s;
    }
    .up-ride-card:last-child { border-bottom: none; }
    .up-ride-card:hover { background: var(--s2); }
    .up-ride-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .up-ride-route { display: flex; flex-direction: column; gap: 6px; flex: 1; padding-right: 12px; }
    .up-ride-loc {
      display: flex; align-items: center; gap: 8px;
    }
    .up-ride-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .up-ride-dot.from { background: var(--blue); }
    .up-ride-dot.to   { background: var(--black); }
    .up-ride-connector { width: 1px; height: 10px; background: var(--border); margin-left: 3.5px; }
    .up-ride-addr { font-size: 13px; font-weight: 600; color: var(--t1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
    .up-ride-fare {
      font-family: 'JetBrains Mono', monospace;
      font-size: 16px; font-weight: 600; color: var(--t1);
      text-align: right; flex-shrink: 0;
    }
    .up-ride-meta { display: flex; align-items: center; gap: 12px; }
    .up-ride-pill {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 9px; border-radius: 100px;
      font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .up-ride-pill.completed { background: rgba(5,148,79,0.1); color: var(--green); }
    .up-ride-pill.pending   { background: rgba(230,126,0,0.1); color: var(--amber); }
    .up-ride-pill.cancelled { background: rgba(200,16,46,0.1);  color: var(--red); }
    .up-ride-pill.ongoing   { background: rgba(39,110,241,0.1); color: var(--blue); }
    .up-ride-time { font-size: 11px; color: var(--t3); font-weight: 500; }

    /* ── Status chip ── */
    .up-status-chip {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px; border-radius: 100px;
      font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      background: rgba(5,148,79,0.1); border: 1px solid rgba(5,148,79,0.2); color: var(--green);
    }
    .up-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

    /* ── Logout ── */
    .up-logout-btn {
      width: calc(100% - 32px); margin: 16px;
      padding: 15px; border-radius: 14px; border: none; cursor: pointer;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 14px; font-weight: 700; letter-spacing: 0.02em;
      background: var(--surface); color: var(--red);
      border: 1.5px solid rgba(200,16,46,0.2);
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: background 0.15s, border-color 0.15s;
    }
    .up-logout-btn:hover { background: #FFF5F6; border-color: rgba(200,16,46,0.4); }

    /* ── Modal ── */
    .up-modal-bg {
      position: fixed; inset: 0; background: rgba(0,0,0,0.45);
      backdrop-filter: blur(6px); z-index: 100;
      display: flex; align-items: flex-end; justify-content: center;
      animation: up-fade 0.2s ease;
    }
    .up-modal {
      background: var(--surface); width: 100%; max-width: 480px;
      border-radius: 28px 28px 0 0;
      padding: 12px 0 40px;
      max-height: 85vh; overflow-y: auto;
      animation: up-pop 0.3s cubic-bezier(0.34,1.4,0.64,1);
    }
    .up-modal-handle { width: 40px; height: 4px; border-radius: 2px; background: #DDD; margin: 0 auto 20px; }
    .up-modal-title  { font-size: 18px; font-weight: 800; color: var(--t1); padding: 0 24px 16px; border-bottom: 1px solid var(--border); }

    /* ── Empty ── */
    .up-empty {
      display: flex; flex-direction: column; align-items: center;
      padding: 48px 24px; text-align: center;
    }
    .up-empty-icon {
      width: 60px; height: 60px; border-radius: 50%;
      background: var(--s2); display: flex; align-items: center; justify-content: center;
      margin-bottom: 14px;
    }

    /* ── Spinner ── */
    .up-spinner {
      width: 36px; height: 36px; border-radius: 50%;
      border: 3px solid var(--s3); border-top-color: var(--black);
      animation: up-spin 0.7s linear infinite;
    }

    /* scrollbar */
    .up-scroll::-webkit-scrollbar { width: 0; }
  `;
  document.head.appendChild(s);
}

const statusPill = (status) => {
  const map = {
    completed: "completed", pending: "pending",
    cancelled: "cancelled", ongoing: "ongoing", active: "ongoing",
  };
  return map[status?.toLowerCase()] || "pending";
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const UserProfile = () => {
  const [user,         setUser]         = useState({});
  const [rides,        setRides]        = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` },
    }).then((r) => {
      setUser(r.data.user);
      setRides(r.data.rides || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalSpent    = rides.reduce((s, r) => s + (r.fare || 0), 0);
  const completedRides = rides.filter((r) => r.status === "completed").length;

  if (loading) return (
    <div className="up" style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh" }}>
      <div className="up-spinner" />
    </div>
  );

  return (
    <div className="up up-scroll" style={{ overflowY: "auto", paddingBottom: 32 }}>

      {/* ── HERO ── */}
      <div className="up-hero up-fade">
        <div className="up-hero-noise" />

        {/* Top nav */}
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom: 32 }}>
          <button style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"8px 14px", color:"rgba(255,255,255,0.6)", fontSize:12, fontWeight:700, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <Settings size={14} /> Settings
          </button>
        </div>

        {/* Avatar + info */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start" }}>
          <div className="up-avatar-ring">
            <div className="up-avatar-inner">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstname || "user"}`}
                alt="avatar"
                style={{ width:"100%", height:"100%", objectFit:"cover" }}
              />
            </div>
          </div>

          <p className="up-name">{user.firstname || "Rider"} {user.lastname || ""}</p>
          <p className="up-sub">{user.phone || user.email || "GoIndia Rider"}</p>

          <div className="up-badge">
            <Shield size={10} />
            Premium Rider
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="up-stats-row up-fade" style={{ animationDelay:"0.08s" }}>
        <div className="up-stat">
          <span className="up-stat-val">{rides.length}</span>
          <span className="up-stat-lbl">Rides</span>
        </div>
        <div className="up-stat">
          <span className="up-stat-val">₹{totalSpent}</span>
          <span className="up-stat-lbl">Spent</span>
        </div>
        <div className="up-stat">
          <span className="up-stat-val">{completedRides}</span>
          <span className="up-stat-lbl">Done</span>
        </div>
      </div>

      {/* ── PROFILE INFO ── */}
      <div className="up-section up-fade" style={{ animationDelay:"0.12s" }}>
        <div className="up-card" style={{ marginTop: 16 }}>
          <p className="up-card-title">Account</p>

          {user.phone && (
            <div className="up-info-row">
              <div className="up-info-icon"><Phone size={16} color="#555" /></div>
              <div>
                <div className="up-info-label">Phone</div>
                <div className="up-info-val">{user.phone}</div>
              </div>
            </div>
          )}
          {user.email && (
            <div className="up-info-row">
              <div className="up-info-icon"><Mail size={16} color="#555" /></div>
              <div>
                <div className="up-info-label">Email</div>
                <div className="up-info-val">{user.email}</div>
              </div>
            </div>
          )}
          <div className="up-info-row">
            <div className="up-info-icon"><Star size={16} color="#555" /></div>
            <div>
              <div className="up-info-label">Rating</div>
              <div className="up-info-val">5.0 ★</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="up-section up-fade" style={{ animationDelay:"0.16s" }}>
        <div className="up-card" style={{ marginTop: 16 }}>
          <p className="up-card-title">Quick Actions</p>

          <div className="up-action-row">
            <div className="up-action-left">
              <div className="up-action-icon" style={{ background:"#EBF2FE" }}><CreditCard size={17} color="#276EF1" /></div>
              <div>
                <div className="up-action-label">Payment Methods</div>
                <div className="up-action-sub">Cash, UPI</div>
              </div>
            </div>
            <ChevronRight size={18} color="#AAA" />
          </div>

          <div className="up-action-row">
            <div className="up-action-left">
              <div className="up-action-icon" style={{ background:"#E6F6EE" }}><MapPin size={17} color="#05944F" /></div>
              <div>
                <div className="up-action-label">Saved Places</div>
                <div className="up-action-sub">Home, Work</div>
              </div>
            </div>
            <ChevronRight size={18} color="#AAA" />
          </div>

          <div className="up-action-row">
            <div className="up-action-left">
              <div className="up-action-icon" style={{ background:"#FFF3E0" }}><Shield size={17} color="#E67E00" /></div>
              <div>
                <div className="up-action-label">Safety</div>
                <div className="up-action-sub">Emergency contacts, trips</div>
              </div>
            </div>
            <ChevronRight size={18} color="#AAA" />
          </div>
        </div>
      </div>

      {/* ── RIDE HISTORY ── */}
      <div className="up-section up-fade" style={{ animationDelay:"0.2s" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 0 8px" }}>
          <p style={{ fontSize:17, fontWeight:800, color:"#111" }}>Recent Trips</p>
          <p style={{ fontSize:12, fontWeight:700, color:"#AAA", letterSpacing:"0.06em", textTransform:"uppercase" }}>
            {rides.length} total
          </p>
        </div>

        <div className="up-card">
          {rides.length === 0 ? (
            <div className="up-empty">
              <div className="up-empty-icon"><Navigation size={24} color="#CCC" /></div>
              <p style={{ fontSize:15, fontWeight:700, color:"#555" }}>No trips yet</p>
              <p style={{ fontSize:13, color:"#AAA", marginTop:4 }}>Your ride history will appear here</p>
            </div>
          ) : (
            rides.slice(0, 20).map((ride) => (
              <div key={ride._id} className="up-ride-card" onClick={() => setSelectedRide(ride)}>
                <div className="up-ride-top">
                  <div className="up-ride-route">
                    <div className="up-ride-loc">
                      <div className="up-ride-dot from" />
                      <span className="up-ride-addr">{ride.pickup || "Pickup"}</span>
                    </div>
                    <div className="up-ride-connector" style={{ marginLeft: 3.5 }} />
                    <div className="up-ride-loc">
                      <div className="up-ride-dot to" />
                      <span className="up-ride-addr">{ride.destination || "Destination"}</span>
                    </div>
                  </div>
                  <div>
                    <div className="up-ride-fare">₹{ride.fare}</div>
                    <ArrowUpRight size={14} color="#AAA" style={{ marginTop:4, marginLeft:"auto", display:"block" }} />
                  </div>
                </div>
                <div className="up-ride-meta">
                  <span className={`up-ride-pill ${statusPill(ride.status)}`}>
                    {ride.status || "pending"}
                  </span>
                  <span className="up-ride-time">
                    <Clock size={11} style={{ display:"inline", marginRight:3, verticalAlign:"middle" }} />
                    {fmtDate(ride.createdAt)}
                  </span>
                  {ride.paymentMethod && (
                    <span className="up-ride-time">
                      <CreditCard size={11} style={{ display:"inline", marginRight:3, verticalAlign:"middle" }} />
                      {ride.paymentMethod}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── LOGOUT ── */}
      <button className="up-logout-btn up-fade" style={{ animationDelay:"0.24s" }}>
        <LogOut size={16} /> Sign Out
      </button>

      {/* ── RIDE DETAIL MODAL ── */}
      {selectedRide && (
        <div className="up-modal-bg" onClick={() => setSelectedRide(null)}>
          <div className="up-modal" onClick={(e) => e.stopPropagation()}>
            <div className="up-modal-handle" />

            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px 16px" }}>
              <p className="up-modal-title" style={{ padding:0, border:"none" }}>Trip Details</p>
              <button onClick={() => setSelectedRide(null)} style={{ width:32, height:32, borderRadius:"50%", background:"#F4F4F4", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <X size={16} color="#555" />
              </button>
            </div>

            <div style={{ height:1, background:"#E8E8E8", margin:"0 0 20px" }} />

            {/* Fare hero */}
            <div style={{ textAlign:"center", padding:"8px 24px 20px" }}>
              <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#AAA", marginBottom:6 }}>Total Fare</p>
              <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:48, fontWeight:600, color:"#111", letterSpacing:"-0.02em", lineHeight:1 }}>₹{selectedRide.fare}</p>
              <div style={{ display:"flex", justifyContent:"center", marginTop:10 }}>
                <span className={`up-ride-pill ${statusPill(selectedRide.status)}`} style={{ fontSize:11, padding:"5px 12px" }}>
                  {selectedRide.status}
                </span>
              </div>
            </div>

            <div style={{ height:1, background:"#E8E8E8", margin:"0 24px 20px" }} />

            {/* Route */}
            <div style={{ padding:"0 24px 20px" }}>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#AAA", marginBottom:14 }}>Route</p>
              <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:0, paddingTop:4, flexShrink:0 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:"#276EF1" }} />
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

            {/* Meta grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, padding:"0 24px 24px" }}>
              <div style={{ background:"#F7F7F7", borderRadius:14, padding:"14px 16px" }}>
                <p style={{ fontSize:10, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Payment</p>
                <p style={{ fontSize:14, fontWeight:700, color:"#111" }}>{selectedRide.paymentMethod || "Cash"}</p>
              </div>
              <div style={{ background:"#F7F7F7", borderRadius:14, padding:"14px 16px" }}>
                <p style={{ fontSize:10, color:"#AAA", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Date</p>
                <p style={{ fontSize:13, fontWeight:700, color:"#111" }}>{fmtDate(selectedRide.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;