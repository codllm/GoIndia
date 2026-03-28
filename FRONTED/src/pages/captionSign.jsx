import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { captionDataContext } from "../context/captionContext";
import { Mail, Lock, Phone, Car, Hash, Palette, Users } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const CaptionSign = () => {
  const navigate = useNavigate();
  const { setcaption } = useContext(captionDataContext);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const [formData, setFormData] = useState({
    firstname: "", lastname: "", email: "", password: "", phone: "",
    color: "", plate: "", capacity: "", vehicleType: "car",
  });

  const set = (field) => (e) => setFormData((p) => ({ ...p, [field]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captions/register`,
        {
          firstname: formData.firstname,
          lastname:  formData.lastname,
          email:     formData.email.trim().toLowerCase(),
          password:  formData.password,
          phone:     formData.phone.trim(),
          vehicle: {
            color:       formData.color,
            plate:       formData.plate,
            capacity:    Number(formData.capacity),
            vehicleType: formData.vehicleType,
          },
        }
      );
      localStorage.setItem("captionToken", res.data.token);
      setcaption(res.data.caption);
      navigate("/caption-home");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    formData.firstname && formData.email && formData.password &&
    formData.phone && formData.plate && formData.color && formData.capacity;

  return (
    <div className="auth">
      <div className="auth-top captain auth-fade">
        <p className="auth-logo">GoIndia</p>
        <h1 className="auth-headline">Join the fleet</h1>
        <p className="auth-sub">Register as a captain and start earning</p>
        <div className="auth-captain-badge"><Car size={11} /> Captain Registration</div>
        <div style={{ width: 170, height: 160 }}>
          <DotLottieReact src="https://lottie.host/a7de839d-8a0b-47d1-bd38-acb403ca0550/UXquDKqDj0.lottie" loop autoplay />
        </div>
      </div>

      <div className="auth-body" style={{ overflowY: "auto" }}>
        <div className="auth-up">

          {/* ── Personal Info ── */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#AAA", marginBottom: 10 }}>
            Personal Info
          </p>

          <div className="auth-name-row">
            <input className="auth-name-input" placeholder="First name"
              value={formData.firstname} onChange={set("firstname")} />
            <input className="auth-name-input" placeholder="Last name"
              value={formData.lastname} onChange={set("lastname")} />
          </div>

          <div className="auth-input-wrap">
            <div className="auth-input-icon"><Mail size={17} color="#BBBBBB" /></div>
            <input className="auth-input" type="email" placeholder="Email address"
              value={formData.email} onChange={set("email")} />
          </div>

          <div className="auth-input-wrap">
            <div className="auth-input-icon"><Lock size={17} color="#BBBBBB" /></div>
            <input className="auth-input" type="password" placeholder="Create password (min 6)"
              value={formData.password} onChange={set("password")} />
          </div>

          <div className="auth-input-wrap">
            <div className="auth-input-icon"><Phone size={17} color="#BBBBBB" /></div>
            <input className="auth-input" type="tel" placeholder="Phone number (10 digits)"
              value={formData.phone} onChange={set("phone")} />
          </div>

          <div style={{ height: 1, background: "#F0F0F0", margin: "16px 0" }} />

          {/* ── Vehicle Info ── */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#AAA", marginBottom: 10 }}>
            Vehicle Info
          </p>

          {/* Color + Plate */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", border: "1.5px solid #E8E8E8", borderRadius: 14, background: "#F7F7F7" }}>
              <Palette size={15} color="#BBBBBB" />
              <input placeholder="Color" value={formData.color} onChange={set("color")}
                style={{ border: "none", outline: "none", width: "100%", fontSize: 14, background: "transparent" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", border: "1.5px solid #E8E8E8", borderRadius: 14, background: "#F7F7F7" }}>
              <Hash size={15} color="#BBBBBB" />
              <input placeholder="Plate no." value={formData.plate} onChange={set("plate")}
                style={{ border: "none", outline: "none", width: "100%", fontSize: 14, textTransform: "uppercase", background: "transparent" }} />
            </div>
          </div>

          {/* Seats + Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", border: "1.5px solid #E8E8E8", borderRadius: 14, background: "#F7F7F7" }}>
              <Users size={15} color="#BBBBBB" />
              <input type="number" placeholder="Seats" value={formData.capacity} onChange={set("capacity")}
                style={{ border: "none", outline: "none", width: "100%", fontSize: 14, background: "transparent" }} />
            </div>
            <div style={{ position: "relative" }}>
              <select value={formData.vehicleType} onChange={set("vehicleType")}
                style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid #E8E8E8", fontSize: 14, appearance: "none", background: "#F7F7F7", cursor: "pointer", outline: "none" }}>
                <option value="car">🚗 Car</option>
                <option value="motorcycle">🏍 Motorcycle</option>
                <option value="auto">🛺 Auto</option>
              </select>
              <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 11, color: "#AAA" }}>▼</div>
            </div>
          </div>

          {error && <p className="auth-error" style={{ textAlign: "center" }}>{error}</p>}

          <button className="auth-btn-primary" onClick={handleRegister}
            disabled={loading || !canSubmit}>
            {loading ? <span className="auth-spinner" /> : "Create Account →"}
          </button>

          <div className="auth-link-row">
            Already registered?{" "}
            <span className="auth-link" onClick={() => navigate("/caption-login")}>Sign in</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptionSign;