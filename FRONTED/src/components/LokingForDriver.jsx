import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { RidingContext } from "../context/ridingDataContext";
import { UserDataContext } from "../context/userContext";
import socket from "../socket";
import axios from "axios";

if (!document.getElementById("lfd-styles")) {
  const s = document.createElement("style");
  s.id = "lfd-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap');
    .lfd * { box-sizing: border-box; margin: 0; padding: 0; }
    .lfd { font-family: 'Plus Jakarta Sans', sans-serif; }
    @keyframes lfd-up   { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes lfd-ping { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.8);opacity:0} }
    @keyframes lfd-spin { to{transform:rotate(360deg)} }
    .lfd-anim-up { animation: lfd-up 0.44s cubic-bezier(0.16,1,0.3,1) both }
    .lfd-sheet {
      position:absolute; bottom:0; left:0; right:0; z-index:70;
      background:#fff; border-radius:28px 28px 0 0;
      border-top:1px solid #E8E8E8; padding:10px 24px 48px;
      box-shadow:0 -12px 40px rgba(0,0,0,0.08);
    }
    .lfd-handle { width:40px; height:4px; border-radius:2px; background:#DCDCDC; margin:0 auto 22px; }
    .lfd-radar-wrap { position:relative; width:120px; height:120px; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; }
    .lfd-ring { position:absolute; border-radius:50%; background:rgba(39,110,241,0.12); animation:lfd-ping 2s ease-out infinite; width:120px; height:120px; }
    .lfd-ring:nth-child(2) { animation-delay:0.65s; }
    .lfd-ring:nth-child(3) { animation-delay:1.3s; }
    .lfd-radar-core { position:relative; z-index:2; width:60px; height:60px; border-radius:50%; background:#111; border:3px solid #fff; box-shadow:0 4px 16px rgba(0,0,0,0.2); display:flex; align-items:center; justify-content:center; overflow:hidden; }
    .lfd-title { font-size:18px; font-weight:800; color:#111; text-align:center; margin-bottom:4px; }
    .lfd-sub   { font-size:13px; color:#AFAFAF; text-align:center; font-weight:500; margin-bottom:20px; }
    .lfd-progress-wrap { background:#F0F0F0; border-radius:100px; height:6px; margin-bottom:10px; overflow:hidden; }
    .lfd-progress-fill { height:100%; border-radius:100px; background:#276EF1; transition:width 1s linear; }
    .lfd-progress-fill.urgent   { background:#E67E00; }
    .lfd-progress-fill.critical { background:#C8102E; }
    .lfd-timer { font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:600; text-align:center; margin-bottom:20px; }
    .lfd-info-strip { display:flex; gap:8px; margin-bottom:20px; }
    .lfd-info-pill { flex:1; background:#F7F7F7; border:1px solid #E8E8E8; border-radius:12px; padding:10px 12px; }
    .lfd-info-label { font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#AFAFAF; margin-bottom:3px; }
    .lfd-info-val   { font-size:13px; font-weight:700; color:#111; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .lfd-cancel-btn { width:100%; padding:15px; border-radius:14px; border:1.5px solid #E8E8E8; background:#fff; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; font-weight:700; color:#C8102E; transition:background 0.15s; }
    .lfd-cancel-btn:hover { background:#FFF5F6; }
    .lfd-cancel-btn:disabled { opacity:0.4; cursor:not-allowed; }
    .lfd-spinner { width:16px; height:16px; border-radius:50%; border:2px solid rgba(200,16,46,0.2); border-top-color:#C8102E; animation:lfd-spin 0.7s linear infinite; display:inline-block; vertical-align:middle; margin-right:6px; }
  `;
  document.head.appendChild(s);
}

const TOTAL_TIME = 120;

const LookingForDriver = () => {
  const navigate = useNavigate();
  const { rideData, setRideData } = useContext(RidingContext);
  const { user } = useContext(UserDataContext);
  const [cancelling, setCancelling] = useState(false);

  const getEndTime = () => {
    const saved = localStorage.getItem("rideEndTime");
    if (saved) return parseInt(saved);
    const t = Date.now() + TOTAL_TIME * 1000;
    localStorage.setItem("rideEndTime", t);
    return t;
  };
  const [endTime] = useState(getEndTime);
  const [count, setCount] = useState(
    Math.max(0, Math.floor((endTime - Date.now()) / 1000))
  );

  /* ══════════════════════════════════════════════════════
     FIX 1 — Register user's socketId in DB
     Runs when user._id is available from context
     Also re-registers on every socket reconnect
  ══════════════════════════════════════════════════════ */
  useEffect(() => {
    const userId = user?._id;
    const rideId = localStorage.getItem("currentRide");

    if (!userId) {
      console.log(" Waiting for user context...");
      return;
    }

    if (!rideId) {
      console.log(" No currentRide in localStorage");
      return;
    }

    const registerAndJoin = () => {
    
      socket.emit("join-ride", rideId.toString());
    };

    // Register now if already connected
    if (socket.connected) {
      registerAndJoin();
    } else {
      // Wait for connection
      socket.once("connect", registerAndJoin);
    }

    // Re-register on every future reconnect
    socket.on("connect", registerAndJoin);

    return () => {
      socket.off("connect", registerAndJoin);
    };
  }, [user?._id]); // ← re-fires when user loads from context

  /* ══════════════════════════════════════════════════════
     FIX 2 — Listen for ride-accepted
     Compare rideId to ensure only the correct user navigates
  ══════════════════════════════════════════════════════ */
  useEffect(() => {
    const handleAccepted = (data) => {
      const currentRideId = localStorage.getItem("currentRide");

      console.log("🚀 ride-accepted event received");
      console.log("   data.rideId      :", String(data.rideId));
      console.log("   currentRide in LS:", String(currentRideId));

      if (!currentRideId) {
        console.log(" No currentRide — ignoring");
        return;
      }

      if (String(data.rideId) !== String(currentRideId)) {
        console.log(" Not my ride — ignoring");
        return;
      }

      console.log("✅ My ride was accepted → navigating to /user-arriving");

      setRideData((prev) => ({
        ...prev,
        status: data.status,
        caption: data.caption,
        otp: data.otp,
      }));

      localStorage.removeItem("rideEndTime");
      navigate("/user-arriving");
    };

    socket.on("ride-accepted", handleAccepted);
    return () => socket.off("ride-accepted", handleAccepted);
  }, [navigate, setRideData]);

  /* ── Countdown + auto-cancel ── */
  useEffect(() => {
    const timer = setInterval(async () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setCount(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        await cancelRide();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const cancelRide = async () => {
    setCancelling(true);
    const rideId = localStorage.getItem("currentRide");
    try {
      if (rideId) {
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/rides/cancel`,
          { rideId },
          { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } }
        );
      }
    } catch (err) {
      console.log("Cancel error:", err.message);
    } finally {
      localStorage.removeItem("currentRide");
      localStorage.removeItem("rideEndTime");
      navigate("/home");
      window.location.reload();
    }
  };

  const progress   = (count / TOTAL_TIME) * 100;
  const isUrgent   = count <= 30;
  const isCritical = count <= 10;
  const fillClass  = isCritical ? "critical" : isUrgent ? "urgent" : "";

  return (
    <div className="lfd">
      <div className="lfd-sheet lfd-anim-up">
        <div className="lfd-handle" />

        <div className="lfd-radar-wrap">
          <div className="lfd-ring" />
          <div className="lfd-ring" />
          <div className="lfd-ring" />
          <div className="lfd-radar-core">
            <img
              src="https://res.cloudinary.com/dju008haw/image/upload/v1770792339/ChatGPT_Image_Feb_11_2026_12_15_23_PM_k5mshs.png"
              alt="searching"
              style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }}
            />
          </div>
        </div>

        <p className="lfd-title">Finding your captain</p>
        <p className="lfd-sub">Looking for nearby drivers…</p>

        <div className="lfd-progress-wrap">
          <div className={`lfd-progress-fill ${fillClass}`} style={{ width:`${progress}%` }} />
        </div>

        <p className="lfd-timer" style={{ color: isCritical ? "#C8102E" : isUrgent ? "#E67E00" : "#AFAFAF" }}>
          {count}s remaining
        </p>

        <div className="lfd-info-strip">
          <div className="lfd-info-pill">
            <div className="lfd-info-label">From</div>
            <div className="lfd-info-val">{rideData?.pickup || "Pickup"}</div>
          </div>
          <div className="lfd-info-pill">
            <div className="lfd-info-label">To</div>
            <div className="lfd-info-val">{rideData?.destination || "Destination"}</div>
          </div>
          <div className="lfd-info-pill" style={{ flex:"0 0 72px" }}>
            <div className="lfd-info-label">Fare</div>
            <div className="lfd-info-val">{rideData?.fare ? `₹${rideData.fare}` : "--"}</div>
          </div>
        </div>

        <button className="lfd-cancel-btn" onClick={cancelRide} disabled={cancelling}>
          {cancelling ? <><span className="lfd-spinner" />Cancelling…</> : "Cancel Ride"}
        </button>
      </div>
    </div>
  );
};

export default LookingForDriver;