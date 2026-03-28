import React, { useEffect, useState, useContext, useRef } from "react";
import { RidingContext } from "../context/ridingDataContext";
import { Phone, Shield, MapPin, Navigation2, Clock, Star } from "lucide-react";
import socket from "../socket";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RideCompletePopup from "./RideCompletePopUp";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

/* ─── Inject styles once ─── */
if (!document.getElementById("ua-styles")) {
  const style = document.createElement("style");
  style.id = "ua-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    .ua * { box-sizing: border-box; margin: 0; padding: 0; }
    .ua {
      font-family: 'Plus Jakarta Sans', sans-serif;
      --blue:      #276EF1;
      --blue-dim:  rgba(39,110,241,0.1);
      --green:     #05944F;
      --green-dim: rgba(5,148,79,0.1);
      --black:     #111111;
      --warn:      #E67E00;
      --surface:   #FFFFFF;
      --s2:        #F6F6F6;
      --s3:        #EEEEEE;
      --border:    #E2E2E2;
      --t1:        #111111;
      --t2:        #545454;
      --t3:        #AFAFAF;
    }

    @keyframes ua-up   { from{transform:translateY(32px);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes ua-fade { from{opacity:0} to{opacity:1} }
    @keyframes ua-pop  { 0%{transform:scale(0.88);opacity:0} 65%{transform:scale(1.03)} 100%{transform:scale(1);opacity:1} }
    @keyframes ua-pulse{ 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.7);opacity:0.35} }
    @keyframes ua-spin { to{transform:rotate(360deg)} }
    @keyframes ua-otp-glow {
      0%,100% { box-shadow: 0 0 0 0 rgba(39,110,241,0.0); }
      50%      { box-shadow: 0 0 0 8px rgba(39,110,241,0.12); }
    }
    @keyframes ua-bounce {
      0%,100%{transform:translateY(0)} 40%{transform:translateY(-4px)} 70%{transform:translateY(-2px)}
    }

    .ua-anim-up   { animation: ua-up   0.44s cubic-bezier(0.16,1,0.3,1) both }
    .ua-anim-fade { animation: ua-fade 0.3s ease both }
    .ua-anim-pop  { animation: ua-pop  0.4s cubic-bezier(0.34,1.4,0.64,1) both }

    /* Map overlay */
    .ua-map-overlay {
      position:absolute; inset:0; pointer-events:none; z-index:1;
      background: linear-gradient(to bottom,
        rgba(255,255,255,0.06) 0%, transparent 22%,
        transparent 60%, rgba(255,255,255,0.6) 100%);
    }

    /* HUD */
    .ua-hud {
      position:absolute; top:48px; left:50%; transform:translateX(-50%);
      width:calc(100% - 32px); max-width:400px; z-index:20;
      background:rgba(255,255,255,0.97);
      backdrop-filter:blur(20px) saturate(1.8);
      border:1px solid rgba(0,0,0,0.07);
      border-radius:20px; padding:14px 20px;
      display:flex; align-items:center; justify-content:space-between;
      box-shadow:0 4px 24px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06);
      animation:ua-fade 0.5s ease;
    }
    .ua-hud-sep  { width:1px; height:36px; background:#E8E8E8; flex-shrink:0; }
    .ua-hud-stat { display:flex; flex-direction:column; gap:3px; }
    .ua-hud-lbl  { font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--t3); }
    .ua-hud-val  { font-family:'JetBrains Mono',monospace; font-size:20px; font-weight:600; color:var(--t1); line-height:1; }
    .ua-hud-val.blue  { color:var(--blue); }
    .ua-hud-val.green { color:var(--green); }

    /* Badge */
    .ua-badge {
      display:inline-flex; align-items:center; gap:6px;
      padding:5px 10px; border-radius:100px;
      font-size:11px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase;
    }
    .ua-badge.arriving { background:var(--blue-dim);  color:var(--blue);  border:1px solid rgba(39,110,241,0.2); }
    .ua-badge.ongoing  { background:var(--green-dim); color:var(--green); border:1px solid rgba(5,148,79,0.2);   }
    .ua-dot { width:6px; height:6px; border-radius:50%; animation:ua-pulse 1.6s ease infinite; }
    .ua-dot.blue  { background:var(--blue); }
    .ua-dot.green { background:var(--green); }

    /* Bottom sheet */
    .ua-sheet {
      position:absolute; bottom:0; left:0; width:100%;
      background:var(--surface);
      border-radius:24px 24px 0 0;
      border-top:1px solid var(--border);
      padding:10px 22px 48px;
      z-index:20;
      box-shadow:0 -12px 40px rgba(0,0,0,0.08);
      animation:ua-up 0.44s cubic-bezier(0.16,1,0.3,1) both;
    }
    .ua-handle { width:40px; height:4px; border-radius:2px; background:#DCDCDC; margin:0 auto 20px; }

    /* Captain card */
    .ua-captain-card {
      display:flex; align-items:center; gap:14px;
      padding:14px; border-radius:16px;
      background:var(--s2); border:1px solid var(--border);
      margin-bottom:16px;
    }
    .ua-avatar {
      width:52px; height:52px; border-radius:50%;
      background:var(--s3); border:2px solid var(--border);
      display:flex; align-items:center; justify-content:center;
      font-size:22px; flex-shrink:0; overflow:hidden;
    }
    .ua-captain-name { font-size:16px; font-weight:700; color:var(--t1); margin-bottom:2px; }
    .ua-captain-sub  { font-size:12px; color:var(--t2); font-weight:500; }
    .ua-rating { display:flex; align-items:center; gap:3px; margin-top:4px; }
    .ua-rating span { font-size:12px; font-weight:700; color:var(--t1); }
    .ua-call-btn {
      margin-left:auto; width:42px; height:42px; border-radius:50%;
      background:var(--black); border:none; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      box-shadow:0 4px 12px rgba(0,0,0,0.2);
      transition:transform 0.15s, box-shadow 0.15s;
      flex-shrink:0;
    }
    .ua-call-btn:hover  { box-shadow:0 6px 18px rgba(0,0,0,0.28); }
    .ua-call-btn:active { transform:scale(0.93); }

    /* OTP display pill */
    .ua-otp-pill {
      display:flex; align-items:center; justify-content:space-between;
      background:var(--blue-dim);
      border:1.5px solid rgba(39,110,241,0.25);
      border-radius:16px; padding:14px 18px;
      margin-bottom:16px;
      animation:ua-otp-glow 2.5s ease infinite;
    }
    .ua-otp-label { font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--blue); opacity:0.7; }
    .ua-otp-code  {
      font-family:'JetBrains Mono',monospace;
      font-size:28px; font-weight:700; color:var(--blue);
      letter-spacing:0.3em; line-height:1;
    }
    .ua-otp-hint  { font-size:11px; color:var(--blue); opacity:0.6; font-weight:500; margin-top:4px; }
    .ua-shield    { width:32px; height:32px; border-radius:50%; background:rgba(39,110,241,0.15); display:flex; align-items:center; justify-content:center; }

    /* Location rows */
    .ua-route-card {
      background:var(--s2); border:1px solid var(--border);
      border-radius:16px; padding:14px 16px; margin-bottom:16px;
    }
    .ua-route-row { display:flex; align-items:flex-start; gap:12px; }
    .ua-route-dot {
      width:10px; height:10px; border-radius:50%; flex-shrink:0; margin-top:4px;
    }
    .ua-route-dot.blue  { background:var(--blue);  box-shadow:0 0 0 3px rgba(39,110,241,0.18); }
    .ua-route-dot.green { background:var(--green); box-shadow:0 0 0 3px rgba(5,148,79,0.18); }
    .ua-route-tag  { font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--t3); display:block; margin-bottom:2px; }
    .ua-route-addr { font-size:13px; font-weight:600; color:var(--t1); line-height:1.4; display:block; }
    .ua-route-sep  {
      width:1px; background:var(--border); margin:6px 0 6px 4px; height:14px;
    }

    /* ETA strip */
    .ua-eta-strip {
      display:flex; align-items:center; gap:8px;
      background:var(--s2); border:1px solid var(--border);
      border-radius:12px; padding:10px 14px; margin-bottom:16px;
    }
    .ua-eta-strip span { font-size:13px; font-weight:600; color:var(--t2); }
    .ua-eta-val { font-family:'JetBrains Mono',monospace !important; color:var(--t1) !important; }

    /* Ongoing ride banner */
    .ua-ride-banner {
      display:flex; align-items:center; gap:10px;
      background:var(--green-dim); border:1.5px solid rgba(5,148,79,0.2);
      border-radius:14px; padding:14px 16px; margin-bottom:16px;
    }
    .ua-ride-banner-icon {
      width:36px; height:36px; border-radius:50%;
      background:rgba(5,148,79,0.15);
      display:flex; align-items:center; justify-content:center; flex-shrink:0;
    }
    .ua-ride-banner-title { font-size:14px; font-weight:700; color:var(--green); }
    .ua-ride-banner-sub   { font-size:12px; color:#04723C; margin-top:2px; }

    /* Fare strip */
    .ua-fare-strip {
      display:flex; align-items:center; justify-content:space-between;
      background:var(--s2); border:1px solid var(--border);
      border-radius:12px; padding:12px 16px; margin-bottom:16px;
    }
    .ua-fare-lbl { font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:var(--t3); }
    .ua-fare-val { font-family:'JetBrains Mono',monospace; font-size:22px; font-weight:700; color:var(--t1); }

    /* Status pill button */
    .ua-status-btn {
      width:100%; padding:16px; border-radius:14px; border:none;
      font-family:'Plus Jakarta Sans',sans-serif;
      font-size:15px; font-weight:700; letter-spacing:0.01em;
      cursor:default;
    }
    .ua-status-btn.arriving { background:var(--black); color:#fff; }
    .ua-status-btn.ongoing  { background:var(--green); color:#fff; }

    .ua-div { height:1px; background:var(--border); margin:14px 0; }
  `;
  document.head.appendChild(style);
}

/* ─── Haversine ─── */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000, r = (d) => (d * Math.PI) / 180;
  const a =
    Math.sin(r(lat2 - lat1) / 2) ** 2 +
    Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lng2 - lng1) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ─── Bearing ─── */
function calcBearing(lat1, lng1, lat2, lng2) {
  const r = (d) => (d * Math.PI) / 180;
  const y = Math.sin(r(lng2 - lng1)) * Math.cos(r(lat2));
  const x =
    Math.cos(r(lat1)) * Math.sin(r(lat2)) -
    Math.sin(r(lat1)) * Math.cos(r(lat2)) * Math.cos(r(lng2 - lng1));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/* ─── Trim polyline ─── */
function trimPolyline(coords, capLat, capLng) {
  if (!coords || coords.length < 2) return coords || [];
  let minDist = Infinity, idx = 0;
  for (let i = 0; i < coords.length; i++) {
    const d = haversine(capLat, capLng, coords[i][1], coords[i][0]);
    if (d < minDist) { minDist = d; idx = i; }
  }
  return [[capLng, capLat], ...coords.slice(idx + 1)];
}

const fmtDist = (m) => m == null ? "--" : m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
const fmtEta  = (s) => s == null ? "--" : Math.round(s / 60) < 1 ? "<1 min" : `${Math.round(s / 60)} min`;

/* ════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════ */
const UserArriving = () => {
  const { rideData, setRideData } = useContext(RidingContext);
  const [rideCompleted, setrideCompleted] = useState(false);

  const [captionLocation, setCaptionLocation] = useState(null);
  const [prevCaptainLoc,  setPrevCaptainLoc]  = useState(null);
  const [routeCoords,     setRouteCoords]     = useState([]);
  const [distanceMeters,  setDistanceMeters]  = useState(null);
  const [etaSeconds,      setEtaSeconds]      = useState(null);
  const [carBearing,      setCarBearing]      = useState(0);

  const mapContainer   = useRef(null);
  const mapRef         = useRef(null);
  const captainMarker  = useRef(null);
  const destMarker     = useRef(null);
  const routeTimer     = useRef(null);
  const mapReady       = useRef(false);
  const navigate = useNavigate();

  const isOngoing = rideData?.status === "ongoing";

  useEffect(() => {
    const handler = (ride) => {
      console.log("🏁 ride-ended event received:", ride);
  
      
  
      setrideCompleted(true);
    };
  
    socket.on("ride-ended", handler);
  
    return () => {
      socket.off("ride-ended", handler);
    };
  }, []);

  /* ── Derived coords ── */
  const pickup = rideData?.pickupLocation
    ? { lat: rideData.pickupLocation.latitude, lng: rideData.pickupLocation.longitude } : null;
  const destination = rideData?.destinationLocation
    ? { lat: rideData.destinationLocation.latitude, lng: rideData.destinationLocation.longitude } : null;

  //fetch ride
  useEffect(() => {
    const fetchRide = async () => {
      const rideId = localStorage.getItem("currentRide");
      if (!rideId) return;
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/rides/details?rideId=${rideId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } }
        );
        setRideData(res.data);
      } catch (err) { console.log("❌ Ride fetch error:", err.message); }
    };
    fetchRide();
  }, []);

  /* ── SOCKET ── */
  useEffect(() => {
    if (!rideData?._id) return;
    socket.emit("join-ride", rideData._id);

    const locationHandler = (data) => {
      setPrevCaptainLoc((p) => captionLocation || p);
      setCaptionLocation({ lat: data.latitude, lng: data.longitude });
    };

    const otpHandler = (rideId) => {
      if (rideData._id === rideId) {
        setRideData((prev) => ({ ...prev, status: "ongoing" }));
        // Clear route so it refetches to destination
        setRouteCoords([]);
        setDistanceMeters(null);
        setEtaSeconds(null);
        if (destMarker.current) { destMarker.current.remove(); destMarker.current = null; }
        const map = mapRef.current;
        if (map) {
          ["route", "route-shadow"].forEach((id) => { if (map.getLayer(id)) map.removeLayer(id); });
          if (map.getSource("route")) map.removeSource("route");
        }
      }
    };

    socket.on("caption-location", locationHandler);
    socket.on("otp-verified-success", otpHandler);

    return () => {
      socket.off("caption-location", locationHandler);
      socket.off("otp-verified-success", otpHandler);
    };
  }, [rideData]);

  /* Reconnect rejoin */
  useEffect(() => {
    const rejoin = () => { if (rideData?._id) socket.emit("join-ride", rideData._id); };
    socket.on("connect", rejoin);
    return () => socket.off("connect", rejoin);
  }, [rideData]);

  /* ── BEARING ── */
  useEffect(() => {
    if (!captionLocation || !prevCaptainLoc) return;
    setCarBearing(calcBearing(prevCaptainLoc.lat, prevCaptainLoc.lng, captionLocation.lat, captionLocation.lng));
  }, [captionLocation]);

  /* ── ROUTE FETCH (debounced) ── */
  useEffect(() => {
    if (!captionLocation) return;
    const target = isOngoing ? destination : pickup;
    if (!target) return;

    clearTimeout(routeTimer.current);
    routeTimer.current = setTimeout(() => {
      axios
        .get(
          `https://api.mapbox.com/directions/v5/mapbox/driving/` +
          `${captionLocation.lng},${captionLocation.lat};${target.lng},${target.lat}` +
          `?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`
        )
        .then((res) => {
          const route = res.data.routes[0];
          setRouteCoords(route.geometry.coordinates);
          setDistanceMeters(route.distance);
          setEtaSeconds(route.duration);
        })
        .catch((err) => console.log("❌ ROUTE ERROR:", err.message));
    }, 1200);

    return () => clearTimeout(routeTimer.current);
  }, [captionLocation, isOngoing]);

  /* ── MAP INIT ── */
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [85.43, 23.42],
      zoom: 15,
    });
    map.on("load", () => { mapReady.current = true; });
    mapRef.current = map;
    setTimeout(() => map.resize(), 400);
  }, []);

  /* ── MAP UPDATE ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !captionLocation) return;

    /* Camera — smooth follow */
    map.easeTo({ center: [captionLocation.lng, captionLocation.lat], duration: 900 });

    /* Captain marker */
    if (!captainMarker.current) {
      const el = document.createElement("div");
      el.style.cssText = `
        width:46px; height:46px; border-radius:50%;
        background:#111;
        display:flex; align-items:center; justify-content:center;
        box-shadow:0 0 0 5px rgba(0,0,0,0.1), 0 4px 18px rgba(0,0,0,0.28);
      `;
      el.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/744/744465.png"
        style="width:24px;height:24px;filter:invert(1);" />`;
      captainMarker.current = new mapboxgl.Marker({ element: el, rotationAlignment: "map" })
        .setLngLat([captionLocation.lng, captionLocation.lat])
        .addTo(map);
    } else {
      captainMarker.current
        .setLngLat([captionLocation.lng, captionLocation.lat])
        .setRotation(carBearing);
    }

    /* Target marker */
    const target = isOngoing ? destination : pickup;
    const mColor = isOngoing ? "#05944F" : "#276EF1";

    if (target) {
      if (!destMarker.current) {
        const pin = document.createElement("div");
        pin.style.cssText = `
          width:20px; height:20px; border-radius:50%;
          background:${mColor}; border:3px solid white;
          box-shadow:0 2px 12px rgba(0,0,0,0.22);
        `;
        destMarker.current = new mapboxgl.Marker({ element: pin })
          .setLngLat([target.lng, target.lat])
          .addTo(map);
      } else {
        destMarker.current.setLngLat([target.lng, target.lat]);
        destMarker.current.getElement().style.background = mColor;
      }
    }

    /* Shrinking polyline */
    const trimmed = trimPolyline(routeCoords, captionLocation.lat, captionLocation.lng);
    const geojson = { type: "Feature", geometry: { type: "LineString", coordinates: trimmed } };
    const lineColor = isOngoing ? "#05944F" : "#276EF1";

    const applyRoute = () => {
      if (map.getSource("route")) {
        map.getSource("route").setData(geojson);
        if (map.getLayer("route")) map.setPaintProperty("route", "line-color", lineColor);
      } else {
        map.addSource("route", { type: "geojson", data: geojson });
        map.addLayer({ id: "route-shadow", type: "line", source: "route",
          paint: { "line-color": "#000", "line-width": 8, "line-opacity": 0.05, "line-blur": 5 } });
        map.addLayer({ id: "route", type: "line", source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": lineColor, "line-width": 5, "line-opacity": 0.95 } });
      }
    };

    if (mapReady.current) applyRoute();
    else map.once("load", applyRoute);

  }, [captionLocation, routeCoords, isOngoing, carBearing]);

  /* Captain display name */
  const captainName = rideData?.caption?.fullname
    ? `${rideData.caption.fullname.firstname} ${rideData.caption.fullname.lastname || ""}`.trim()
    : "Your Captain";

  /* ════ RENDER ════ */
  return (
    <div className="ua" style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#E8E8E8" }}>

      {/* profile */}
      <div className="absolute top-4 right-4 z-50">
  <button
    onClick={() => navigate('/user-profile')}
    className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-lg bg-gray-200 flex items-center justify-center"
  >
    <img
      src="https://api.dicebear.com/7.x/avataaars/svg?seed=$%7Buser.firstname%7D" // or user.profileImage
      alt="profile"
      className="w-full h-full object-cover"
    />
  </button>
</div>

      {/* MAP */}
      <div ref={mapContainer} style={{ position: "absolute", inset: 0, zIndex: 0 }} />
      <div className="ua-map-overlay" />

      {/* ── HUD ── */}
      <div className="ua-hud">
        <div className="ua-hud-stat">
          <span className="ua-hud-lbl">Distance</span>
          <span className={`ua-hud-val ${isOngoing ? "green" : "blue"}`}>
            {fmtDist(distanceMeters)}
          </span>
        </div>

        <div className="ua-hud-sep" />

        <div className="ua-hud-stat" style={{ alignItems: "center" }}>
          <span className="ua-hud-lbl">ETA</span>
          <span className="ua-hud-val">{fmtEta(etaSeconds)}</span>
        </div>

        <div className="ua-hud-sep" />

        <div className="ua-hud-stat" style={{ alignItems: "flex-end" }}>
          <span className="ua-hud-lbl">Status</span>
          <div className={`ua-badge ${isOngoing ? "ongoing" : "arriving"}`}>
            <span className={`ua-dot ${isOngoing ? "green" : "blue"}`} />
            {isOngoing ? "In Ride" : "Arriving"}
          </div>
        </div>
      </div>

      {/* ── BOTTOM SHEET ── */}
      <div className="ua-sheet">
        <div className="ua-handle" />

        {/* ── PHASE 1: Captain approaching pickup ── */}
        {!isOngoing && (
          <div className="ua-anim-fade">

            {/* ETA strip */}
            <div className="ua-eta-strip">
              <Clock size={15} color="#545454" />
              <span>Captain arriving in</span>
              <span className="ua-eta-val" style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: "#111" }}>
                {fmtEta(etaSeconds)}
              </span>
              <span style={{ marginLeft: "auto", color: "#AFAFAF", fontSize: 12 }}>
                {fmtDist(distanceMeters)} away
              </span>
            </div>

            {/* Captain card */}
            <div className="ua-captain-card">
              <div className="ua-avatar">
                {rideData?.caption?.profilePhoto
                  ? <img src={rideData.caption.profilePhoto} alt="captain" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  : "🧑‍✈️"
                }
              </div>
              <div style={{ flex: 1 }}>
                <div className="ua-captain-name">{captainName}</div>
                <div className="ua-captain-sub">
                  {rideData?.caption?.vehicle?.vehicleType || "Cab"} &middot; {rideData?.caption?.vehicle?.plate || ""}
                </div>
                <div className="ua-rating">
                  <Star size={12} fill="#111" color="#111" />
                  <Star size={12} fill="#111" color="#111" />
                  <Star size={12} fill="#111" color="#111" />
                  <Star size={12} fill="#111" color="#111" />
                  <Star size={12} fill="#111" color="#111" />
                  <span style={{ marginLeft: 4 }}>5.0</span>
                </div>
              </div>
              <button
                className="ua-call-btn"
                onClick={() => rideData?.caption?.phone && window.open(`tel:${rideData.caption.phone}`)}
              >
                <Phone size={16} color="white" />
              </button>
              <div className="">
                <div className="ua-otp-label">Your Ride OTP</div>
                <div className="ua-otp-code">{rideData?.otp || "----"}</div>
                <div className="ua-otp-hint">Share this with your captain</div>
              </div>
            </div>


            <button className="ua-status-btn arriving">
              Meeting Your Captain
            </button>
          </div>
        )}

        {/* ── PHASE 2: Ride ongoing — captain heading to destination ── */}
        {isOngoing && (
          <div className="ua-anim-pop">

            {/* Ongoing banner */}
            <div className="ua-ride-banner">
              <div className="ua-ride-banner-icon">
                <Navigation2 size={18} color="#05944F" />
              </div>
              <div>
                <div className="ua-ride-banner-title">Ride In Progress</div>
                <div className="ua-ride-banner-sub">Enjoy your journey!</div>
              </div>
              <button
                className="ua-call-btn"
                style={{ marginLeft: "auto", background: "#05944F", boxShadow: "0 4px 12px rgba(5,148,79,0.25)" }}
                onClick={() => rideData?.caption?.phone && window.open(`tel:${rideData.caption.phone}`)}
              >
                <Phone size={16} color="white" />
              </button>
            </div>

          
            {/* Destination */}
            <div className="ua-route-card">
              <div className="ua-route-row">
                <div className="ua-route-dot green" />
                <div>
                  <span className="ua-route-tag">Heading to</span>
                  <span className="ua-route-addr">
                    {rideData?.destinationLocation?.address || "Your destination"}
                  </span>
                </div>
              </div>
            </div>

            {/* Fare */}
            <div className="ua-fare-strip">
              <span className="ua-fare-lbl">Estimated Fare</span>
              <span className="ua-fare-val">₹{rideData?.fare || "--"}</span>
            </div>
          </div>
        )}

{rideCompleted && (
          <RideCompletePopup
            rideData={rideData}
            role="user"
            navigateTo="/home"
          />
        )}
      </div>
    </div>
  );
};

export default UserArriving;