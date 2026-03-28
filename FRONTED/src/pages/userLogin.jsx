import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/userContext";
import { Mail, Lock, Shield } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

if (!document.getElementById("auth-styles")) {
  const s = document.createElement("style");
  s.id = "auth-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap');
    .auth * { box-sizing:border-box; margin:0; padding:0; }
    .auth { font-family:'Plus Jakarta Sans',sans-serif; width:100vw; min-height:100vh; background:#fff; display:flex; flex-direction:column; }
    @keyframes auth-up   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes auth-fade { from{opacity:0} to{opacity:1} }
    @keyframes auth-spin { to{transform:rotate(360deg)} }
    .auth-up   { animation:auth-up   0.4s cubic-bezier(0.16,1,0.3,1) both }
    .auth-fade { animation:auth-fade 0.3s ease both }
    .auth-top { background:#0A0A0A; padding:56px 28px 40px; position:relative; overflow:hidden; flex-shrink:0; }
    .auth-top::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 90% 10%, rgba(255,255,255,0.04) 0%, transparent 60%); }
    .auth-top.captain::before { background:radial-gradient(ellipse at 90% 10%, rgba(5,148,79,0.15) 0%, transparent 65%); }
    .auth-logo { font-family:'JetBrains Mono',monospace; font-size:22px; font-weight:600; color:#fff; letter-spacing:-0.02em; margin-bottom:32px; }
    .auth-headline { font-size:28px; font-weight:800; color:#fff; line-height:1.2; letter-spacing:-0.02em; }
    .auth-sub { font-size:14px; color:rgba(255,255,255,0.4); font-weight:500; margin-top:8px; line-height:1.5; }
    .auth-body { flex:1; padding:32px 28px 40px; display:flex; flex-direction:column; overflow-y:auto; }
    .auth-input-wrap { position:relative; margin-bottom:14px; }
    .auth-input-icon { position:absolute; left:16px; top:50%; transform:translateY(-50%); pointer-events:none; }
    .auth-input { width:100%; padding:17px 18px 17px 46px; border-radius:14px; border:1.5px solid #E8E8E8; background:#F7F7F7; font-family:'Plus Jakarta Sans',sans-serif; font-size:15px; font-weight:500; color:#111; outline:none; transition:border-color 0.18s,background 0.18s,box-shadow 0.18s; }
    .auth-input::placeholder { color:#BBBBBB; }
    .auth-input:focus { border-color:#111; background:#fff; box-shadow:0 0 0 4px rgba(0,0,0,0.05); }
    .auth-btn-primary { width:100%; padding:17px; border-radius:14px; border:none; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; font-size:15px; font-weight:800; color:#fff; background:#111; box-shadow:0 4px 20px rgba(0,0,0,0.18); transition:transform 0.12s,box-shadow 0.12s; display:flex; align-items:center; justify-content:center; gap:8px; }
    .auth-btn-primary:hover { box-shadow:0 6px 28px rgba(0,0,0,0.24); }
    .auth-btn-primary:active { transform:scale(0.97); }
    .auth-btn-primary:disabled { opacity:0.45; cursor:not-allowed; }
    .auth-btn-secondary { width:100%; padding:16px; border-radius:14px; border:1.5px solid #E8E8E8; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; font-weight:700; color:#555; background:#fff; transition:background 0.15s,border-color 0.15s; margin-top:10px; }
    .auth-btn-secondary:hover { background:#F7F7F7; border-color:#DDD; }
    .auth-link-row { text-align:center; margin-top:20px; font-size:13px; color:#AAA; }
    .auth-link { font-weight:700; color:#111; cursor:pointer; text-decoration:underline; text-underline-offset:2px; }
    .auth-footer { margin-top:auto; padding-top:20px; font-size:12px; color:#CCC; text-align:center; line-height:1.6; }
    .auth-spinner { width:17px; height:17px; border-radius:50%; border:2.5px solid rgba(255,255,255,0.3); border-top-color:#fff; animation:auth-spin 0.7s linear infinite; display:inline-block; vertical-align:middle; }
    .auth-secure { display:flex; align-items:center; gap:6px; font-size:12px; color:#AAA; font-weight:500; margin-top:12px; }
    .auth-error { font-size:13px; color:#C8102E; font-weight:600; margin-bottom:12px; }
    .auth-captain-badge { display:inline-flex; align-items:center; gap:6px; padding:5px 12px; border-radius:100px; margin-top:12px; font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; background:rgba(5,148,79,0.18); border:1px solid rgba(5,148,79,0.3); color:#4DC985; }
    .auth-name-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; }
    .auth-name-input { width:100%; padding:17px 16px; border-radius:14px; border:1.5px solid #E8E8E8; background:#F7F7F7; font-family:'Plus Jakarta Sans',sans-serif; font-size:15px; font-weight:500; color:#111; outline:none; transition:border-color 0.18s,background 0.18s,box-shadow 0.18s; }
    .auth-name-input::placeholder { color:#BBBBBB; }
    .auth-name-input:focus { border-color:#111; background:#fff; box-shadow:0 0 0 4px rgba(0,0,0,0.05); }
  `;
  document.head.appendChild(s);
}

const UserLogin = () => {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true); setError("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/login`,
        { email: email.trim().toLowerCase(), password }
      );
      if (res.data.token) {
        localStorage.setItem("userToken", res.data.token);
        setUser(res.data.user);
        navigate("/home");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-top auth-fade">
        <p className="auth-logo">GoIndia</p>
        <h1 className="auth-headline">Welcome back</h1>
        <p className="auth-sub">Sign in to continue your journey</p>
        <div style={{ width: 220, height: 190 }}>
          <DotLottieReact src="https://lottie.host/e47a65cb-a871-4c56-9532-ebc6c279d046/bWQpV10CrV.lottie" loop autoplay />
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

          <div className="auth-secure">
            <Shield size={12} />
            Your account is secured with encryption
          </div>

          <div className="auth-link-row">
            New here?{" "}
            <span className="auth-link" onClick={() => navigate("/user-sign")}>Create account</span>
          </div>

          <button className="auth-btn-secondary" onClick={() => navigate("/caption-login")}>
            Sign in as Captain
          </button>
        </div>

        <p className="auth-footer">
          By continuing, you agree to our{" "}
          <span style={{ color: "#888", cursor: "pointer" }}>Terms of Service</span> and{" "}
          <span style={{ color: "#888", cursor: "pointer" }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default UserLogin;