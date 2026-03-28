import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/userContext";
import { Mail, Lock, Phone, Shield } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const UserSign = () => {
  const [formData, setFormData] = useState({
    firstname: "", lastname: "", email: "", password: "", phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const { setUser } = useContext(UserDataContext);
  const navigate = useNavigate();

  const set = (field) => (e) => setFormData((p) => ({ ...p, [field]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.firstname || !formData.phone) return;
    setLoading(true); setError("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/register`,
        {
          firstname: formData.firstname,
          lastname:  formData.lastname,
          email:     formData.email.trim().toLowerCase(),
          password:  formData.password,
          phone:     formData.phone.trim(),
        }
      );
      if (res.data.token) {
        localStorage.setItem("userToken", res.data.token);
        setUser(res.data.user);
        navigate("/home");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = formData.firstname && formData.email && formData.password && formData.phone;

  return (
    <div className="auth">
      <div className="auth-top auth-fade">
        <p className="auth-logo">GoIndia</p>
        <h1 className="auth-headline">Create your account</h1>
        <p className="auth-sub">Join GoIndia and start riding</p>
        <div style={{ width: 220, height: 190 }}>
          <DotLottieReact src="https://lottie.host/e47a65cb-a871-4c56-9532-ebc6c279d046/bWQpV10CrV.lottie" loop autoplay />
        </div>
      </div>

      <div className="auth-body">
        <div className="auth-up">

          {/* Name row */}
          <div className="auth-name-row">
            <input className="auth-name-input" placeholder="First name"
              value={formData.firstname} onChange={set("firstname")} />
            <input className="auth-name-input" placeholder="Last name"
              value={formData.lastname} onChange={set("lastname")} />
          </div>

          {/* Email */}
          <div className="auth-input-wrap">
            <div className="auth-input-icon"><Mail size={17} color="#BBBBBB" /></div>
            <input className="auth-input" type="email" placeholder="Email address"
              value={formData.email} onChange={set("email")} />
          </div>

          {/* Password */}
          <div className="auth-input-wrap">
            <div className="auth-input-icon"><Lock size={17} color="#BBBBBB" /></div>
            <input className="auth-input" type="password" placeholder="Create password (min 6)"
              value={formData.password} onChange={set("password")} />
          </div>

          {/* Phone */}
          <div className="auth-input-wrap">
            <div className="auth-input-icon"><Phone size={17} color="#BBBBBB" /></div>
            <input className="auth-input" type="tel" placeholder="Phone number (10 digits)"
              value={formData.phone} onChange={set("phone")} />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn-primary" onClick={handleRegister}
            disabled={loading || !canSubmit}>
            {loading ? <span className="auth-spinner" /> : "Create Account →"}
          </button>

          <div className="auth-secure">
            <Shield size={12} />
            Your data is private and secure
          </div>

          <div className="auth-link-row">
            Already have an account?{" "}
            <span className="auth-link" onClick={() => navigate("/user-login")}>Sign in</span>
          </div>
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

export default UserSign;