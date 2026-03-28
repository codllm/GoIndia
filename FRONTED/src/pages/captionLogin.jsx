import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { captionDataContext } from "../context/captionContext";
import { Mail, Lock, Shield, Car } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const CaptionLogin = () => {
  const navigate = useNavigate();
  const { setcaption } = useContext(captionDataContext);

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true); setError("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captions/login`,
        { email: email.trim().toLowerCase(), password }
      );
      localStorage.setItem("captionToken", res.data.token);
      setcaption(res.data.caption);
      navigate("/caption-home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-top captain auth-fade">
        <p className="auth-logo">GoIndia</p>
        <h1 className="auth-headline">Captain Portal</h1>
        <p className="auth-sub">Drive when you want, earn what you need</p>
        <div className="auth-captain-badge"><Car size={11} /> Captain Mode</div>
        <div style={{ width: 200, height: 170 }}>
          <DotLottieReact src="https://lottie.host/a7de839d-8a0b-47d1-bd38-acb403ca0550/UXquDKqDj0.lottie" loop autoplay />
        </div>
      </div>

      <div className="auth-body">
        <div className="auth-up">
          <div className="auth-input-wrap">
            <div className="auth-input-icon"><Mail size={17} color="#BBBBBB" /></div>
            <input className="auth-input" type="email" placeholder="Email address"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="auth-input-wrap">
            <div className="auth-input-icon"><Lock size={17} color="#BBBBBB" /></div>
            <input className="auth-input" type="password" placeholder="Password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin(e)} />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn-primary" onClick={handleLogin}
            disabled={loading || !email || !password}>
            {loading ? <span className="auth-spinner" /> : "Sign In →"}
          </button>

          <div className="auth-secure" style={{ justifyContent: "center" }}>
            <Shield size={12} />
            Your data is safe and encrypted
          </div>

          <div className="auth-link-row">
            New captain?{" "}
            <span className="auth-link" onClick={() => navigate("/caption-sign")}>Register here</span>
          </div>

          <button className="auth-btn-secondary" onClick={() => navigate("/user-login")}>
            Switch to Rider Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaptionLogin;