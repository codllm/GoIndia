import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import axios from "axios";
import MapBg from "../components/mapBg";
import { captionDataContext } from "../context/captionContext";
import { RidingContext } from "../context/ridingDataContext";
import { ChevronLeft, ChevronRight, User } from "lucide-react";

if (!document.getElementById("ch-styles")) {
  const style = document.createElement("style");
  style.id = "ch-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .ch * { box-sizing:border-box; margin:0; padding:0; }
    .ch { font-family:'Plus Jakarta Sans',sans-serif; position:fixed; inset:0; width:100%; height:100%; overflow:hidden; }
    @keyframes ch-up    { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes ch-fade  { from{opacity:0} to{opacity:1} }
    @keyframes ch-ping  { 0%{transform:scale(1);opacity:1} 75%,100%{transform:scale(2);opacity:0} }
    @keyframes ch-slide-in { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }
    @keyframes ch-spin  { to{transform:rotate(360deg)} }
    .ch-anim-up   { animation:ch-up       0.42s cubic-bezier(0.16,1,0.3,1) both }
    .ch-slide-in  { animation:ch-slide-in 0.35s cubic-bezier(0.16,1,0.3,1) both }
    .ch-topbar { position:absolute; top:0; left:0; right:0; z-index:20; display:flex; align-items:center; justify-content:space-between; padding:14px 16px; background:linear-gradient(to bottom,rgba(0,0,0,0.5) 0%,transparent 100%); pointer-events:none; }
    .ch-topbar > * { pointer-events:all; }
    .ch-logo { background:rgba(255,255,255,0.95); backdrop-filter:blur(12px); padding:8px 16px; border-radius:12px; font-size:15px; font-weight:800; color:#111; letter-spacing:-0.02em; box-shadow:0 2px 16px rgba(0,0,0,0.15); }
    .ch-topbar-right { display:flex; align-items:center; gap:10px; }
    .ch-online-btn { padding:8px 18px; border-radius:100px; border:none; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; font-size:13px; font-weight:700; transition:all 0.2s; box-shadow:0 2px 12px rgba(0,0,0,0.15); }
    .ch-online-btn.online  { background:#05944F; color:#fff; box-shadow:0 4px 16px rgba(5,148,79,0.35); }
    .ch-online-btn.offline { background:rgba(255,255,255,0.92); color:#555; }
    .ch-avatar-btn { width:38px; height:38px; border-radius:50%; overflow:hidden; border:2px solid rgba(255,255,255,0.9); box-shadow:0 2px 12px rgba(0,0,0,0.2); cursor:pointer; }
    .ch-status-sheet { position:absolute; bottom:0; left:0; right:0; border-radius:24px 24px 0 0; padding:10px 22px 32px; z-index:20; animation:ch-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
    .ch-status-handle { width:40px; height:4px; border-radius:2px; margin:0 auto 16px; }
    .ch-ping-wrap { position:relative; width:8px; height:8px; flex-shrink:0; }
    .ch-ping-ring { position:absolute; inset:0; border-radius:50%; background:#05944F; animation:ch-ping 1.4s ease infinite; }
    .ch-ping-core { position:absolute; inset:1.5px; border-radius:50%; background:#05944F; }
    .ch-ride-card { position:absolute; bottom:0; left:0; right:0; background:#fff; border-radius:24px 24px 0 0; border-top:1px solid #E8E8E8; padding:10px 22px 32px; z-index:30; box-shadow:0 -8px 40px rgba(0,0,0,0.1); }
    .ch-ride-handle { width:40px; height:4px; border-radius:2px; background:#DDD; margin:0 auto 16px; }
    .ch-queue-bar { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
    .ch-live-badge { display:inline-flex; align-items:center; gap:7px; font-size:10px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; color:#888; }
    .ch-queue-dots { display:flex; gap:5px; align-items:center; }
    .ch-queue-dot { width:6px; height:6px; border-radius:50%; background:#E0E0E0; transition:all 0.2s; cursor:pointer; }
    .ch-queue-dot.active { background:#111; width:18px; border-radius:3px; }
    .ch-queue-count { font-size:11px; font-weight:700; color:#AAA; letter-spacing:0.08em; text-transform:uppercase; }
    .ch-nav-arrows { display:flex; gap:6px; }
    .ch-nav-btn { width:30px; height:30px; border-radius:50%; background:#F4F4F4; border:1px solid #E8E8E8; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.15s; }
    .ch-nav-btn:hover { background:#EAEAEA; }
    .ch-nav-btn:disabled { opacity:0.3; cursor:not-allowed; }
    .ch-route { margin-bottom:14px; }
    .ch-route-row { display:flex; align-items:flex-start; gap:12px; }
    .ch-route-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; margin-top:3px; }
    .ch-route-dot.green { background:#05944F; box-shadow:0 0 0 3px rgba(5,148,79,0.15); }
    .ch-route-dot.black { background:#111; box-shadow:0 0 0 3px rgba(0,0,0,0.08); }
    .ch-route-line { width:1.5px; height:14px; background:#E8E8E8; margin:3px 0 3px 4.25px; }
    .ch-route-tag  { font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#AAA; display:block; margin-bottom:1px; }
    .ch-route-addr { font-size:14px; font-weight:600; color:#111; line-height:1.3; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:calc(100vw - 80px); }
    .ch-fare-strip { display:flex; align-items:center; justify-content:space-between; background:#F7F7F7; border:1px solid #E8E8E8; border-radius:14px; padding:12px 16px; margin-bottom:14px; }
    .ch-fare-label { font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#AAA; margin-bottom:2px; }
    .ch-fare-val   { font-family:'JetBrains Mono',monospace; font-size:22px; font-weight:600; color:#111; }
    .ch-user-info  { display:flex; align-items:center; gap:6px; font-size:12px; font-weight:600; color:#888; }
    .ch-actions { display:grid; grid-template-columns:1fr 2fr; gap:10px; }
    .ch-btn-dismiss { padding:15px; border-radius:14px; background:#F4F4F4; border:1.5px solid #E8E8E8; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; font-weight:700; color:#888; transition:all 0.15s; }
    .ch-btn-dismiss:hover { background:#EDEDED; color:#555; }
    .ch-btn-dismiss:active { transform:scale(0.97); }
    .ch-btn-accept { padding:15px; border-radius:14px; border:none; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; font-size:15px; font-weight:800; color:#fff; background:#111; box-shadow:0 4px 20px rgba(0,0,0,0.2); transition:all 0.15s; display:flex; align-items:center; justify-content:center; gap:8px; }
    .ch-btn-accept:hover  { background:#05944F; box-shadow:0 4px 20px rgba(5,148,79,0.3); }
    .ch-btn-accept:active { transform:scale(0.97); }
    .ch-btn-accept:disabled { opacity:0.5; cursor:not-allowed; }
    .ch-spinner { width:18px; height:18px; border-radius:50%; border:2.5px solid rgba(255,255,255,0.3); border-top-color:#fff; animation:ch-spin 0.7s linear infinite; display:inline-block; vertical-align:middle; }
  `;
  document.head.appendChild(style);
}

const CaptionHome = () => {
  const navigate = useNavigate();
  const { caption, loading } = useContext(captionDataContext);
  const { rideData, setRideData } = useContext(RidingContext);

  const [online,    setOnline]    = useState(localStorage.getItem("captionOnline") === "true");
  const [rideQueue, setRideQueue] = useState([]);
  const [queueIdx,  setQueueIdx]  = useState(0);
  const [accepting, setAccepting] = useState(false);
  const [cardAnim,  setCardAnim]  = useState("ch-anim-up");
  const locationTimer = useRef(null);

  useEffect(() => {
    if (!caption?._id) return;
    const register = () => socket.emit("register-captain", caption._id);
    if (socket.connected) register();
    socket.on("connect", register);
    return () => socket.off("connect", register);
  }, [caption]);

  const updateLocation = () => {
    const token = localStorage.getItem("captionToken");
    if (!token) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await axios.post(`${import.meta.env.VITE_BASE_URL}/captions/update-location`,
          { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
          { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) { console.error("Location error:", err); }
    });
  };

  useEffect(() => {
    localStorage.setItem("captionOnline", online);
    if (online) { updateLocation(); locationTimer.current = setInterval(updateLocation, 10000); }
    return () => clearInterval(locationTimer.current);
  }, [online]);

  useEffect(() => {
    const handleRide = (data) => {
      setRideQueue((prev) => {
        if (prev.find((r) => r._id === data.ride._id)) return prev;
        return [...prev, { ...data.ride, _user: data.user }];
      });
    };
    socket.on("rideCreated", handleRide);
    return () => socket.off("rideCreated", handleRide);
  }, []);

  useEffect(() => {
    if (queueIdx >= rideQueue.length && rideQueue.length > 0) setQueueIdx(rideQueue.length - 1);
  }, [rideQueue]);

  const dismissRide = () => { setRideQueue((prev) => prev.filter((_, i) => i !== queueIdx)); setQueueIdx((prev) => Math.max(0, prev - 1)); };
  const goNext = () => { if (queueIdx < rideQueue.length - 1) { setCardAnim("ch-slide-in"); setQueueIdx((p) => p + 1); } };
  const goPrev = () => { if (queueIdx > 0) { setCardAnim("ch-slide-in"); setQueueIdx((p) => p - 1); } };

  const acceptRide = async () => {
    const ride  = rideQueue[queueIdx];
    const token = localStorage.getItem("captionToken");
    if (!ride || !token) return;
    setAccepting(true);
    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/accept`, { rideID: ride._id }, { headers: { Authorization: `Bearer ${token}` } });
      localStorage.setItem("currentRide", ride._id);
      setRideData(ride);
      navigate("/captain-arriving");
    } catch (err) {
      const msg = err.response?.data?.message || "Ride already taken";
      setRideQueue((prev) => prev.filter((r) => r._id !== ride._id));
      alert(msg);
    } finally { setAccepting(false); }
  };

  const currentRide = rideQueue[queueIdx];
  const hasRides    = rideQueue.length > 0;

  if (loading) return (
    <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"#F4F4F4" }}>
      <div style={{ width:32, height:32, borderRadius:"50%", border:"3px solid #EEE", borderTopColor:"#111", animation:"ch-spin 0.7s linear infinite" }} />
    </div>
  );
  if (!caption) return (
    <div style={{ position:"fixed", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"#F4F4F4" }}>
      <p style={{ color:"#AAA", fontFamily:"sans-serif" }}>No captain data</p>
    </div>
  );

  return (
    <div className="ch">
      <div style={{ position:"absolute", inset:0, zIndex:0 }}>
        <MapBg currentpanel={null} />
      </div>

      <div className="ch-topbar">
        <div className="ch-logo">GoIndia</div>
        <div className="ch-topbar-right">
          <button className={`ch-online-btn ${online ? "online" : "offline"}`} onClick={() => setOnline(!online)}>
            {online ? "● Online" : "○ Offline"}
          </button>
          <button className="ch-avatar-btn" onClick={() => navigate("/captain-profile")}>
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${caption.firstname}`} alt="profile" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </button>
        </div>
      </div>

      {!hasRides && (
        <div className="ch-status-sheet" style={{ background: online ? "#FAFFF8" : "#FFFFFF", border:"1px solid #E8E8E8" }}>
          <div className="ch-status-handle" style={{ background: online ? "#C8EDD8" : "#DDD" }} />
          {!online ? (
            <div style={{ textAlign:"center" }}>
              <p style={{ fontSize:16, fontWeight:700, color:"#111", marginBottom:4 }}>You're offline</p>
              <p style={{ fontSize:13, color:"#AAA" }}>Tap Online above to start receiving rides</p>
            </div>
          ) : (
            <div style={{ textAlign:"center" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:6 }}>
                <div className="ch-ping-wrap"><div className="ch-ping-ring" /><div className="ch-ping-core" /></div>
                <p style={{ fontSize:13, fontWeight:700, color:"#05944F" }}>Looking for ride requests…</p>
              </div>
              <p style={{ fontSize:12, color:"#AAA" }}>New rides will appear here automatically</p>
            </div>
          )}
        </div>
      )}

      {hasRides && currentRide && (
        <div className={`ch-ride-card ${cardAnim}`} key={currentRide._id} onAnimationEnd={() => setCardAnim("")}>
          <div className="ch-ride-handle" />
          <div className="ch-queue-bar">
            <div className="ch-live-badge">
              <div className="ch-ping-wrap"><div className="ch-ping-ring" /><div className="ch-ping-core" /></div>
              Live Request
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {rideQueue.length > 1 && (
                <div className="ch-queue-dots">
                  {rideQueue.map((_, i) => (
                    <div key={i} className={`ch-queue-dot ${i === queueIdx ? "active" : ""}`} onClick={() => setQueueIdx(i)} />
                  ))}
                </div>
              )}
              <span className="ch-queue-count">{queueIdx + 1} / {rideQueue.length}</span>
              {rideQueue.length > 1 && (
                <div className="ch-nav-arrows">
                  <button className="ch-nav-btn" onClick={goPrev} disabled={queueIdx === 0}><ChevronLeft size={13} color="#555" /></button>
                  <button className="ch-nav-btn" onClick={goNext} disabled={queueIdx === rideQueue.length - 1}><ChevronRight size={13} color="#555" /></button>
                </div>
              )}
            </div>
          </div>
          <div className="ch-route">
            <div className="ch-route-row">
              <div className="ch-route-dot green" />
              <div><span className="ch-route-tag">Pickup</span><span className="ch-route-addr">{currentRide.pickup || "Pickup location"}</span></div>
            </div>
            <div className="ch-route-line" />
            <div className="ch-route-row">
              <div className="ch-route-dot black" />
              <div><span className="ch-route-tag">Drop-off</span><span className="ch-route-addr">{currentRide.destination || "Destination"}</span></div>
            </div>
          </div>
          <div className="ch-fare-strip">
            <div>
              <div className="ch-fare-label">Estimated Fare</div>
              <div className="ch-fare-val">₹{currentRide.fare}</div>
            </div>
            {currentRide._user && (
              <div className="ch-user-info">
                <User size={13} color="#AAA" />
                {currentRide._user.fullname?.firstname || "Passenger"}
              </div>
            )}
          </div>
          <div className="ch-actions">
            <button className="ch-btn-dismiss" onClick={dismissRide}>Skip</button>
            <button className="ch-btn-accept" onClick={acceptRide} disabled={accepting}>
              {accepting ? <><span className="ch-spinner" /> Accepting…</> : "Accept Ride →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaptionHome;