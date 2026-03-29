import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { RidingContext } from "../context/ridingDataContext";
import { captionDataContext } from "../context/captionContext";
import socket from "../socket";
import axios from "axios";
import {
  ChevronLeft,
  Navigation2,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import RideCompletePopup from "./RideCompletePopUp";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

/* ─── Inject styles once ─── */
if (!document.getElementById("ca-uber-styles")) {
  const style = document.createElement("style");
  style.id = "ca-uber-styles";
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap');

    .cau * { box-sizing: border-box; margin: 0; padding: 0; }

    .cau {
      font-family: 'Plus Jakarta Sans', sans-serif;
      --blue:      #276EF1;
      --blue-dim:  rgba(39,110,241,0.1);
      --blue-mid:  rgba(39,110,241,0.18);
      --green:     #05944F;
      --green-dim: rgba(5,148,79,0.1);
      --black:     #111111;
      --warn:      #E67E00;
      --warn-dim:  rgba(230,126,0,0.1);
      --red:       #C8102E;
      --surface:   #FFFFFF;
      --s2:        #F6F6F6;
      --s3:        #EEEEEE;
      --border:    #E2E2E2;
      --t1:        #111111;
      --t2:        #545454;
      --t3:        #AFAFAF;
    }

    @keyframes cau-up    { from{transform:translateY(28px);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes cau-fade  { from{opacity:0} to{opacity:1} }
    @keyframes cau-pop   { 0%{transform:scale(0.9);opacity:0} 65%{transform:scale(1.02)} 100%{transform:scale(1);opacity:1} }
    @keyframes cau-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:0.4} }
    @keyframes cau-shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
    @keyframes cau-spin  { to{transform:rotate(360deg)} }
    @keyframes cau-warn-glow { 0%,100%{box-shadow:0 4px 16px rgba(230,126,0,0.15)} 50%{box-shadow:0 4px 24px rgba(230,126,0,0.35)} }

    .cau-anim-up   { animation: cau-up   0.42s cubic-bezier(0.16,1,0.3,1) both }
    .cau-anim-fade { animation: cau-fade 0.28s ease both }
    .cau-anim-pop  { animation: cau-pop  0.38s cubic-bezier(0.34,1.4,0.64,1) both }

    .cau-map-overlay {
      position: absolute; inset: 0; pointer-events: none; z-index: 1;
      background: linear-gradient(to bottom,
        rgba(255,255,255,0.05) 0%, transparent 20%,
        transparent 62%, rgba(255,255,255,0.55) 100%);
    }

    /* ── HUD ── */
    .cau-hud {
      position: absolute; top: 48px; left: 50%; transform: translateX(-50%);
      width: calc(100% - 32px); max-width: 400px; z-index: 20;
      background: rgba(255,255,255,0.97);
      backdrop-filter: blur(20px) saturate(1.8);
      border: 1px solid rgba(0,0,0,0.07);
      border-radius: 20px; padding: 14px 20px;
      display: flex; align-items: center; justify-content: space-between;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06);
      animation: cau-fade 0.5s ease;
    }
    .cau-hud-sep { width:1px; height:36px; background:#E8E8E8; flex-shrink:0; }
    .cau-hud-stat { display:flex; flex-direction:column; gap:3px; }
    .cau-hud-label { font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--t3); }
    .cau-hud-val   {
      font-family:'JetBrains Mono',monospace;
      font-size:20px; font-weight:600; color:var(--t1); line-height:1;
    }
    .cau-hud-val.blue  { color:var(--blue); }
    .cau-hud-val.green { color:var(--green); }

    /* ── Status badge ── */
    .cau-badge {
      display:inline-flex; align-items:center; gap:6px;
      padding:5px 10px; border-radius:100px;
      font-size:11px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase;
    }
    .cau-badge.approach { background:var(--blue-dim);  color:var(--blue);  border:1px solid rgba(39,110,241,0.2); }
    .cau-badge.transit  { background:var(--green-dim); color:var(--green); border:1px solid rgba(5,148,79,0.2);   }
    .cau-dot { width:6px; height:6px; border-radius:50%; animation:cau-pulse 1.6s ease infinite; }
    .cau-dot.blue  { background:var(--blue); }
    .cau-dot.green { background:var(--green); }

    /* ── Wrong direction banner ── */
    .cau-warn-banner {
      position:absolute; top:134px; left:50%; transform:translateX(-50%);
      width:calc(100% - 32px); max-width:400px; z-index:20;
      background:#FFF8F0; border:1.5px solid #E67E00; border-radius:14px;
      padding:12px 16px; display:flex; align-items:center; gap:10px;
      animation:cau-fade 0.3s ease, cau-warn-glow 2s ease infinite;
    }
    .cau-warn-text { font-size:13px; font-weight:700; color:var(--warn); }
    .cau-warn-sub  { font-size:11px; color:#B36000; font-weight:400; margin-top:2px; }

    /* ── Bottom sheet ── */
    .cau-sheet {
      position:absolute; bottom:0; left:0; width:100%;
      background:var(--surface);
      border-radius:24px 24px 0 0;
      border-top:1px solid var(--border);
      padding:10px 22px 44px;
      z-index:20;
      box-shadow:0 -12px 40px rgba(0,0,0,0.08);
      animation:cau-up 0.44s cubic-bezier(0.16,1,0.3,1) both;
    }
    .cau-handle { width:40px; height:4px; border-radius:2px; background:#DCDCDC; margin:0 auto 20px; }

    /* ── Buttons ── */
    .cau-btn {
      width:100%; padding:16px; border-radius:14px; border:none; cursor:pointer;
      font-family:'Plus Jakarta Sans',sans-serif;
      font-size:15px; font-weight:700; letter-spacing:0.01em;
      transition:transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s;
    }
    .cau-btn:active { transform:scale(0.97); }
    .cau-btn.black  { background:var(--black); color:#fff; box-shadow:0 4px 16px rgba(0,0,0,0.2); }
    .cau-btn.black:hover { box-shadow:0 6px 24px rgba(0,0,0,0.28); }
    .cau-btn.green  { background:var(--green); color:#fff; box-shadow:0 4px 16px rgba(5,148,79,0.25); }
    .cau-btn.green:hover { box-shadow:0 6px 24px rgba(5,148,79,0.35); }
    .cau-btn.ghost  { background:var(--s2); color:var(--t2); border:1px solid var(--border); box-shadow:none; }
    .cau-btn.ghost:hover { background:var(--s3); }
    .cau-btn:disabled { opacity:0.45; cursor:not-allowed; transform:none !important; box-shadow:none !important; }

    /* ── OTP input ── */
    .cau-otp {
      width:100%; padding:18px;
      border-radius:14px; border:2px solid var(--border);
      background:var(--s2);
      font-family:'JetBrains Mono',monospace;
      font-size:34px; font-weight:600;
      letter-spacing:0.55em; text-align:center; color:var(--t1);
      outline:none;
      transition:border-color 0.2s, box-shadow 0.2s, background 0.2s;
      /* hide number input arrows */
      -moz-appearance:textfield;
    }
    .cau-otp::-webkit-inner-spin-button,
    .cau-otp::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
    .cau-otp::placeholder { color:#CCCCCC; letter-spacing:0.35em; }
    .cau-otp:focus { border-color:var(--black); background:#fff; box-shadow:0 0 0 4px rgba(0,0,0,0.05); }
    .cau-otp.error { border-color:var(--red); background:#FFF5F5; animation:cau-shake 0.4s ease; }

    /* ── ETA strip ── */
    .cau-eta-strip {
      display:flex; align-items:center; gap:8px;
      background:var(--s2); border:1px solid var(--border);
      border-radius:12px; padding:10px 14px; margin-bottom:16px;
    }
    .cau-eta-strip span { font-size:13px; font-weight:600; color:var(--t2); }
    .cau-eta-val { font-family:'JetBrains Mono',monospace !important; color:var(--t1) !important; font-size:14px !important; }

    /* ── Location row ── */
    .cau-loc-row {
      display:flex; align-items:flex-start; gap:12px;
      padding:12px 0; border-bottom:1px solid var(--border); margin-bottom:16px;
    }
    .cau-loc-icon {
      width:34px; height:34px; border-radius:50%; flex-shrink:0;
      display:flex; align-items:center; justify-content:center;
    }
    .cau-loc-tag  { font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--t3); display:block; margin-bottom:3px; }
    .cau-loc-addr { font-size:14px; font-weight:600; color:var(--t1); line-height:1.4; display:block; }

    /* ── Payment ── */
    .cau-pay-btn {
      flex:1; padding:14px; border-radius:12px;
      border:2px solid var(--border); cursor:pointer;
      font-family:'Plus Jakarta Sans',sans-serif;
      font-size:14px; font-weight:700;
      background:var(--s2); color:var(--t2);
      transition:all 0.18s;
    }
    .cau-pay-btn.active { border-color:var(--black); background:var(--black); color:#fff; }
    .cau-pay-btn:not(.active):hover { background:var(--s3); }

    /* ── Fare ── */
    .cau-fare-num {
      font-family:'JetBrains Mono',monospace;
      font-size:52px; font-weight:600; color:var(--t1);
      letter-spacing:-0.02em; line-height:1;
    }

    /* ── QR ── */
    .cau-qr-box {
      display:flex; flex-direction:column; align-items:center;
      background:var(--s2); border:1px solid var(--border);
      border-radius:18px; padding:20px; margin-bottom:14px;
    }
    .cau-qr-wrap {
      background:white; padding:8px; border-radius:12px;
      box-shadow:0 4px 16px rgba(0,0,0,0.08); margin-bottom:10px;
    }

    .cau-div { height:1px; background:var(--border); margin:16px 0; }

    .cau-back {
      display:flex; align-items:center; gap:4px;
      cursor:pointer; margin-bottom:18px; width:fit-content;
      color:var(--t3); transition:color 0.15s;
    }
    .cau-back:hover { color:var(--t1); }
    .cau-back span { font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; }

    .cau-err { font-size:12px; font-weight:600; color:var(--red); text-align:center; margin-top:10px; animation:cau-fade 0.2s ease; }

    @keyframes cau-spin { to{transform:rotate(360deg)} }
    .cau-spinner {
      width:17px; height:17px; border-radius:50%;
      border:2.5px solid rgba(255,255,255,0.3);
      border-top-color:#fff;
      animation:cau-spin 0.7s linear infinite;
      display:inline-block; vertical-align:middle;
    }
  `;
  document.head.appendChild(style);
}

/* ─── Haversine distance (meters) ─── */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ─── Bearing (degrees) ─── */
function calcBearing(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/* ─── Trim polyline: cut coords the captain has already passed ─── */
function trimPolyline(coords, capLat, capLng) {
  if (!coords || coords.length < 2) return coords || [];
  let minDist = Infinity;
  let closestIdx = 0;
  for (let i = 0; i < coords.length; i++) {
    const d = haversine(capLat, capLng, coords[i][1], coords[i][0]);
    if (d < minDist) {
      minDist = d;
      closestIdx = i;
    }
  }
  // Start from closest point so polyline shrinks as captain moves
  return [[capLng, capLat], ...coords.slice(closestIdx + 1)];
}

/* ─── Format helpers ─── */
const fmtDist = (m) => {
  if (m == null) return "--";
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
};
const fmtEta = (s) => {
  if (s == null) return "--";
  const m = Math.round(s / 60);
  return m < 1 ? "<1 min" : `${m} min`;
};


const CaptainArriving = () => {
  const [rideCompleted, setrideCompleted] = useState(false);
  const { rideData, setRideData } = useContext(RidingContext);
  const { caption } = useContext(captionDataContext);

  /* UI */
  const [otpPanelVisible, setOtpPanelVisible] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  /* Map / Nav */
  const [captainLocation, setCaptainLocation] = useState(null);
  const [prevLocation, setPrevLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distanceMeters, setDistanceMeters] = useState(null);
  const [etaSeconds, setEtaSeconds] = useState(null);
  const [wrongDirection, setWrongDirection] = useState(false);
  const [carBearing, setCarBearing] = useState(0);

  const navigate = useNavigate();

  /* Refs */
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const captainMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const routeTimer = useRef(null);
  const mapReady = useRef(false);

  const isOngoing = rideData?.status === "ongoing";

  /* ── Derived coords ── */
  const pickup = rideData?.pickupLocation
    ? [rideData.pickupLocation.longitude, rideData.pickupLocation.latitude]
    : null;
  const destination = rideData?.destinationLocation
    ? [
        rideData.destinationLocation.longitude,
        rideData.destinationLocation.latitude,
      ]
    : null;

  /* ── FETCH RIDE ── */
  useEffect(() => {
    const fetchRide = async () => {
      if (rideData?._id) return;
      const rideId = localStorage.getItem("currentRide");
      const token = localStorage.getItem("captionToken");
      if (!rideId || !token) return;
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_BASE_URL
          }/rides/caption/details-by-id?rideId=${rideId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
    
        setRideData(res.data);
      } catch (err) {
        console.log(" FETCH RIDE ERROR", err.message);
      }
    };
    fetchRide();
  }, []);

  /* ── SOCKET JOIN ── */
  useEffect(() => {
    if (rideData?._id) socket.emit("join-ride", rideData._id);
  }, [rideData]);

  /* ── LIVE LOCATION ── */
  useEffect(() => {
    const interval = setInterval(() => {
      if (!rideData?._id) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCaptainLocation((prev) => {
            if (prev) setPrevLocation(prev);
            return { lat: latitude, lng: longitude };
          });
          socket.emit("caption-location-update", {
            rideId: rideData._id,
            latitude,
            longitude,
          });
        },
        null,
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [rideData]);

  /* ── BEARING + WRONG DIRECTION ── */
  useEffect(() => {
    if (!captainLocation || !prevLocation) return;
    const b = calcBearing(
      prevLocation.lat,
      prevLocation.lng,
      captainLocation.lat,
      captainLocation.lng
    );
    setCarBearing(b);

    // Wrong direction: moving away from target by >40m
    const target = isOngoing ? destination : pickup;
    if (!target) return;
    const dNow = haversine(
      captainLocation.lat,
      captainLocation.lng,
      target[1],
      target[0]
    );
    const dPrev = haversine(
      prevLocation.lat,
      prevLocation.lng,
      target[1],
      target[0]
    );
    setWrongDirection(dNow > dPrev + 40);
  }, [captainLocation]);

  /* ── ROUTE FETCH (debounced) ── */
  useEffect(() => {
    if (!captainLocation) return;
    const target = isOngoing ? destination : pickup;
    if (!target) return;

    clearTimeout(routeTimer.current);
    routeTimer.current = setTimeout(() => {
      axios
        .get(
          `https://api.mapbox.com/directions/v5/mapbox/driving/` +
            `${captainLocation.lng},${captainLocation.lat};${target[0]},${target[1]}` +
            `?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`
        )
        .then((res) => {
          const route = res.data.routes[0];
          setRouteCoords(route.geometry.coordinates);
          setDistanceMeters(route.distance);
          setEtaSeconds(route.duration);
        })
        .catch((err) => console.log("ROUTE ERROR", err.message));
    }, 1200);

    return () => clearTimeout(routeTimer.current);
  }, [captainLocation, isOngoing]);

  /* ── MAP INIT ── */
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [85.43, 23.42],
      zoom: 15,
    });
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "bottom-right"
    );
    map.on("load", () => {
      mapReady.current = true;
    });
    mapRef.current = map;
  }, []);

  /* ── MAP UPDATE ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !captainLocation) return;

    /* Camera */
    map.easeTo({
      center: [captainLocation.lng, captainLocation.lat],
      duration: 900,
      essential: true,
    });

    /* Captain marker */
    if (!captainMarkerRef.current) {
      const el = document.createElement("div");
      el.style.cssText = `
        width:46px; height:46px; border-radius:50%;
        background:#111111;
        display:flex; align-items:center; justify-content:center;
        box-shadow:0 0 0 5px rgba(0,0,0,0.1), 0 4px 18px rgba(0,0,0,0.3);
      `;
      el.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/744/744465.png"
        style="width:24px;height:24px;filter:invert(1);" />`;
      captainMarkerRef.current = new mapboxgl.Marker({
        element: el,
        rotationAlignment: "map",
      })
        .setLngLat([captainLocation.lng, captainLocation.lat])
        .addTo(map);
    } else {
      captainMarkerRef.current
        .setLngLat([captainLocation.lng, captainLocation.lat])
        .setRotation(carBearing);
    }

    /* Destination / Pickup marker */
    const target = isOngoing ? destination : pickup;
    const markerColor = isOngoing ? "#05944F" : "#276EF1";

    if (target) {
      if (!destMarkerRef.current) {
        const pin = document.createElement("div");
        pin.style.cssText = `
          width:20px; height:20px; border-radius:50%;
          background:${markerColor}; border:3px solid white;
          box-shadow:0 2px 12px rgba(0,0,0,0.22);
          transition:background 0.3s;
        `;
        destMarkerRef.current = new mapboxgl.Marker({ element: pin })
          .setLngLat(target)
          .addTo(map);
      } else {
        destMarkerRef.current.setLngLat(target);
        destMarkerRef.current.getElement().style.background = markerColor;
      }
    }

    /* Trimmed polyline — shrinks as captain progresses */
    const trimmed = trimPolyline(
      routeCoords,
      captainLocation.lat,
      captainLocation.lng
    );
    const geojson = {
      type: "Feature",
      geometry: { type: "LineString", coordinates: trimmed },
    };

    const lineColor = isOngoing ? "#05944F" : "#276EF1";

    const applyRoute = () => {
      if (map.getSource("route")) {
        map.getSource("route").setData(geojson);
        if (map.getLayer("route")) {
          map.setPaintProperty("route", "line-color", lineColor);
        }
      } else {
        map.addSource("route", { type: "geojson", data: geojson });
        // Subtle shadow
        map.addLayer({
          id: "route-shadow",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#000",
            "line-width": 8,
            "line-opacity": 0.05,
            "line-blur": 5,
          },
        });
        // Main route
        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": lineColor,
            "line-width": 5,
            "line-opacity": 0.95,
          },
        });
      }
    };

    if (mapReady.current) {
      applyRoute();
    } else {
      map.once("load", applyRoute);
    }
  }, [captainLocation, routeCoords, isOngoing, carBearing]);

  /* ── VERIFY OTP ── */
  const verifyOtp = async () => {
    if (otp.length < 4) {
      setOtpError("Enter the 4-digit OTP");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/start`,
        { rideId: rideData._id, otp },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("captionToken")}`,
          },
        }
      );

      if (res.status === 200) {
        setRideData((prev) => ({ ...prev, status: "ongoing" }));
        socket.emit("otp-verified", { rideId: rideData._id });

        setRouteCoords([]);
        setDistanceMeters(null);
        setEtaSeconds(null);
        setOtpPanelVisible(false);
        setOtp("");

        if (destMarkerRef.current) {
          destMarkerRef.current.remove();
          destMarkerRef.current = null;
        }

        const map = mapRef.current;
        if (map) {
          ["route", "route-shadow"].forEach((id) => {
            if (map.getLayer(id)) map.removeLayer(id);
          });
          if (map.getSource("route")) map.removeSource("route");
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid OTP. Try again.";
      setOtpError(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  /* ── FINISH RIDE ── */
  const finishRide = async () => {
    console.log("👉 FINAL URL:", `${import.meta.env.VITE_BASE_URL}/rides/end`);
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/end`,
        { rideId: rideData._id, paymentMethod },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("captionToken")}`,
          },
        }
      );
      setrideCompleted(true);
      localStorage.removeItem("currentRide");
    } catch (err) {
      console.log("END RIDE ERROR", err.message);
    }
  };

  /* ════ RENDER ════ */
  return (
    <div
      className="cau"
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#E8E8E8",
      }}
    >
      {/* profile */}
      {/* <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => navigate("/captain-profile")}
          className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-lg bg-gray-200 flex items-center justify-center"
        >
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=$%7Bcaption.firstname%7D"
            alt="profile"
            className="w-full h-full object-cover"
          />
        </button>
      </div> */}
      {/* MAP */}
      <div
        ref={mapContainer}
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
      />
      <div className="cau-map-overlay" />

      {/* ── HUD ── */}
      <div className="cau-hud">
        <div className="cau-hud-stat">
          <span className="cau-hud-label">Distance</span>
          <span className={`cau-hud-val ${isOngoing ? "green" : "blue"}`}>
            {fmtDist(distanceMeters)}
          </span>
        </div>

        <div className="cau-hud-sep" />

        <div className="cau-hud-stat" style={{ alignItems: "center" }}>
          <span className="cau-hud-label">ETA</span>
          <span className="cau-hud-val">{fmtEta(etaSeconds)}</span>
        </div>

        <div className="cau-hud-sep" />

        <div className="cau-hud-stat" style={{ alignItems: "flex-end" }}>
          <span className="cau-hud-label">Status</span>
          <div className={`cau-badge ${isOngoing ? "transit" : "approach"}`}>
            <span className={`cau-dot ${isOngoing ? "green" : "blue"}`} />
            {isOngoing ? "In Ride" : "Arriving"}
          </div>
        </div>
      </div>

      {/* ── WRONG DIRECTION ALERT ── */}
      {wrongDirection && (
        <div className="cau-warn-banner cau-anim-fade">
          <AlertTriangle size={20} color="#E67E00" style={{ flexShrink: 0 }} />
          <div>
            <div className="cau-warn-text">Wrong Direction</div>
            <div className="cau-warn-sub">Recalculating best route…</div>
          </div>
        </div>
      )}

      {/* ── BOTTOM SHEET ── */}
      <div className="cau-sheet">
        <div className="cau-handle" />

        {/* STATE 1 — APPROACHING: Confirm arrival */}
        {!isOngoing && !otpPanelVisible && (
          <div className="cau-anim-fade">
            <div className="cau-eta-strip">
              <Clock size={15} color="#545454" />
              <span>Arriving in</span>
              <span className="cau-eta-val">{fmtEta(etaSeconds)}</span>
              <span
                style={{ marginLeft: "auto", color: "#AFAFAF", fontSize: 12 }}
              >
                {fmtDist(distanceMeters)} away
              </span>
            </div>

            <div className="cau-loc-row">
              <div className="cau-loc-icon" style={{ background: "#EBF2FE" }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#276EF1",
                  }}
                />
              </div>
              <div>
                <span className="cau-loc-tag">Pickup</span>
                <span className="cau-loc-addr">
                  {rideData?.pickupLocation?.address ||
                    "Passenger pickup point"}
                </span>
              </div>
            </div>

            <button
              className="cau-btn black"
              onClick={() => setOtpPanelVisible(true)}
            >
              Confirm Arrival
            </button>
          </div>
        )}

        {/* STATE 2 — OTP */}
        {!isOngoing && otpPanelVisible && (
          <div className="cau-anim-pop">
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#AFAFAF",
                textAlign: "center",
                marginBottom: 6,
              }}
            >
              Passenger OTP
            </p>
            <p
              style={{
                fontSize: 13,
                color: "#545454",
                textAlign: "center",
                marginBottom: 18,
                lineHeight: 1.55,
              }}
            >
              Ask the passenger for the 4-digit code on their app
            </p>

            <input
              className={`cau-otp ${otpError ? "error" : ""}`}
              type="number"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.slice(0, 4));
                setOtpError("");
              }}
              placeholder="0000"
            />

            {otpError && <p className="cau-err">{otpError}</p>}

            <div style={{ height: 14 }} />

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="cau-btn ghost"
                style={{ flex: "0 0 90px" }}
                onClick={() => {
                  setOtpPanelVisible(false);
                  setOtp("");
                  setOtpError("");
                }}
                disabled={otpLoading}
              >
                Back
              </button>
              <button
                className="cau-btn green"
                style={{ flex: 1 }}
                onClick={verifyOtp}
                disabled={otpLoading || otp.length < 4}
              >
                {otpLoading ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <span className="cau-spinner" /> Verifying…
                  </span>
                ) : (
                  "Start Ride →"
                )}
              </button>
            </div>
          </div>
        )}

        {/* STATE 3 — ONGOING: heading to destination */}
        {isOngoing && !isFinishing && (
          <div className="cau-anim-fade">
            <div className="cau-eta-strip">
              <Clock size={15} color="#545454" />
              <span>Arriving in</span>
              <span className="cau-eta-val">{fmtEta(etaSeconds)}</span>
              <span
                style={{ marginLeft: "auto", color: "#AFAFAF", fontSize: 12 }}
              >
                {fmtDist(distanceMeters)} left
              </span>
            </div>

            <div className="cau-loc-row">
              <div className="cau-loc-icon" style={{ background: "#E6F6EE" }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#05944F",
                  }}
                />
              </div>
              <div>
                <span className="cau-loc-tag">Destination</span>
                <span className="cau-loc-addr">
                  {rideData?.destinationLocation?.address || "Drop-off point"}
                </span>
              </div>
            </div>

            <button
              className="cau-btn black"
              onClick={() => setIsFinishing(true)}
            >
              Complete Ride
            </button>
          </div>
        )}

        {/* STATE 4 — PAYMENT */}
        {isOngoing && isFinishing && (
          <div className="cau-anim-pop">
            <div className="cau-back" onClick={() => setIsFinishing(false)}>
              <ChevronLeft size={16} />
              <span>Back</span>
            </div>

            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#AFAFAF",
                  marginBottom: 6,
                }}
              >
                Total Fare
              </p>
              <p className="cau-fare-num">₹{rideData?.fare || "0"}</p>
            </div>

            <div className="cau-div" />

            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#AFAFAF",
                marginBottom: 10,
              }}
            >
              Payment Method
            </p>

            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <button
                className={`cau-pay-btn ${
                  paymentMethod === "cash" ? "active" : ""
                }`}
                onClick={() => setPaymentMethod("cash")}
              >
                💵 &nbsp;Cash
              </button>
              <button
                className={`cau-pay-btn ${
                  paymentMethod === "upi" ? "active" : ""
                }`}
                onClick={() => setPaymentMethod("upi")}
              >
                📲 &nbsp;UPI
              </button>
            </div>

            {paymentMethod === "UPI" && (
              <div className="cau-qr-box cau-anim-fade">
                <div className="cau-qr-wrap">
                  <img
                    src="https://res.cloudinary.com/dju008haw/image/upload/v1772892045/WhatsApp_Image_2026-03-07_at_19.29.27_vmbw2w.jpg"
                    alt="QR Code"
                    style={{
                      width: 118,
                      height: 118,
                      borderRadius: 8,
                      display: "block",
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#AFAFAF",
                  }}
                >
                  Scan to Pay
                </p>
              </div>
            )}

            <button className="cau-btn green" onClick={finishRide}>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <CheckCircle2 size={18} />
                Finish Ride
              </span>
            </button>
          </div>
        )}
        {rideCompleted && (
          <RideCompletePopup
            rideData={rideData}
            role="captain"
            navigateTo="/caption-home"
          />
        )}
      </div>
    </div>
  );
};

export default CaptainArriving;
