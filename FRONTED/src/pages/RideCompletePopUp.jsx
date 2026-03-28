import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Star } from "lucide-react";

/* ─── Inject styles once ─── */
if (!document.getElementById("rcp-styles")) {
  const s = document.createElement("style");
  s.id = "rcp-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap');

    .rcp * { box-sizing: border-box; margin: 0; padding: 0; }
    .rcp { font-family: 'Plus Jakarta Sans', sans-serif; }

    @keyframes rcp-backdrop { from{opacity:0} to{opacity:1} }
    @keyframes rcp-modal-in { 
      from { opacity: 0; transform: scale(0.9) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    
    @keyframes rcp-check-pop {
      0% { transform: scale(0); }
      70% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    .rcp-backdrop {
      position: fixed; inset: 0; z-index: 2000;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      animation: rcp-backdrop 0.3s ease both;
    }

    .rcp-modal {
      width: 100%;
      max-width: 380px; 
      background: #FFFFFF;
      border-radius: 32px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      padding: 32px 24px;
      position: relative;
      overflow: hidden;
      animation: rcp-modal-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    /* ── Success Header ── */
    .rcp-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .rcp-check-outer {
      width: 80px; height: 80px;
      background: #ECFDF5;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
      animation: rcp-check-pop 0.6s 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    .rcp-title {
      font-size: 24px; font-weight: 800; color: #111;
      letter-spacing: -0.02em; margin-bottom: 4px;
    }
    .rcp-subtitle {
      font-size: 14px; color: #6B7280; font-weight: 500;
    }

    /* ── Earnings/Fare Card ── */
    .rcp-stats-card {
      background: #F9FAFB;
      border: 1px solid #F3F4F6;
      border-radius: 24px;
      padding: 20px;
      margin-bottom: 16px;
      text-align: center;
    }
    .rcp-stats-lbl {
      font-size: 12px; font-weight: 700; color: #9CA3AF;
      text-transform: uppercase; letter-spacing: 0.05em;
      margin-bottom: 4px;
    }
    .rcp-stats-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 36px; font-weight: 700; color: #111;
    }

    /* ── Details Grid ── */
    .rcp-details {
      display: flex; justify-content: space-around;
      border-top: 1px solid #F3F4F6;
      margin-top: 16px; padding-top: 16px;
    }
    .rcp-detail-item { text-align: center; }
    .rcp-detail-lbl { font-size: 10px; color: #9CA3AF; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
    .rcp-detail-val { font-size: 14px; color: #111; font-weight: 600; }

    /* ── Entity Info (Passenger/Captain) ── */
    .rcp-user-info {
      display: flex; align-items: center; gap: 12px;
      padding: 16px; background: #fff;
      border: 1px solid #F3F4F6; border-radius: 18px;
      margin-bottom: 24px;
    }
    .rcp-avatar {
      width: 44px; height: 44px; border-radius: 14px;
      background: #F3F4F6; display: flex; align-items: center;
      justify-content: center; font-weight: 700; color: #111;
      overflow: hidden;
    }

    /* ── Buttons ── */
    .rcp-actions { display: flex; flex-direction: column; gap: 10px; }
    .rcp-btn-main {
      width: 100%; padding: 16px; border-radius: 16px;
      border: none; background: #111; color: #fff;
      font-size: 16px; font-weight: 700; cursor: pointer;
      transition: all 0.2s;
    }
    .rcp-btn-main:active { transform: scale(0.98); opacity: 0.9; }
    
    .rcp-btn-sub {
      width: 100%; padding: 12px; border-radius: 16px;
      border: none; background: transparent; color: #6B7280;
      font-size: 14px; font-weight: 600; cursor: pointer;
    }
  `;
  document.head.appendChild(s);
}

const RideCompletePopup = ({ rideData, role , onClose, navigateTo }) => {
  const navigate = useNavigate();
  const isUser = role === "user";
  const homePath = navigateTo || (isUser ? "/home" : "/captain-home");

  useEffect(() => {
    localStorage.removeItem("currentRide");
  }, []);

  const goHome = () => {
    if (onClose) onClose();
    navigate(homePath);
  };

  const person = isUser ? rideData?.caption : rideData?.user;
  const personName = isUser
    ? `${person?.fullname?.firstname || ""} ${person?.fullname?.lastname || ""}`.trim() || "Captain"
    : `${person?.fullname?.firstname || ""} ${person?.fullname?.lastname || ""}`.trim() || "Passenger";

  return (
    <div className="rcp">
      <div className="rcp-backdrop" onClick={goHome}>
        <div className="rcp-modal" onClick={(e) => e.stopPropagation()}>
          
          <div className="rcp-header">
            <div className="rcp-check-outer">
              <CheckCircle2 size={40} color="#10B981" strokeWidth={2.5} />
            </div>
            <h2 className="rcp-title">{isUser ? "Ride Finished" : "Great job!"}</h2>
            <p className="rcp-subtitle">Hope you had a smooth trip</p>
          </div>

          <div className="rcp-stats-card">
            <p className="rcp-stats-lbl">{isUser ? "Total Paid" : "You Earned"}</p>
            <p className="rcp-stats-val">₹{rideData?.fare || "0"}</p>
            
            <div className="rcp-details">
              <div className="rcp-detail-item">
                <p className="rcp-detail-lbl">Distance</p>
                <p className="rcp-detail-val">{rideData?.distance ? (rideData.distance / 1000).toFixed(1) + ' km' : '--'}</p>
              </div>
              <div className="rcp-detail-item">
                <p className="rcp-detail-lbl">Duration</p>
                <p className="rcp-detail-val">{rideData?.duration ? Math.round(rideData.duration / 60) + ' min' : '--'}</p>
              </div>
            </div>
          </div>

          <div className="rcp-user-info">
            <div className="rcp-avatar">
              {person?.profilePhoto ? (
                <img src={person.profilePhoto} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}} />
              ) : (
                personName.charAt(0)
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>{personName}</p>
              <p style={{ fontSize: '12px', color: '#9CA3AF' }}>{isUser ? "Your Captain" : "Passenger"}</p>
            </div>
            {isUser && <div style={{ display: 'flex', gap: '2px'}}><Star size={14} fill="#F5A623" color="#F5A623" /> 5.0</div>}
          </div>


        </div>
      </div>
    </div>
  );
};

export default RideCompletePopup;