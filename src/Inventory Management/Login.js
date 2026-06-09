import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaEye,
  FaEyeSlash,
  FaGem,
  FaLock,
  FaUser,
  FaUserShield,
  FaSpinner,
  FaCrown,
} from "react-icons/fa";
import BASE_URL from "./apiConfig";
import "./Login.css";

const API_URL = `${BASE_URL}/Login.php`;

export default function Login({ setAuth }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    action: "login",
  });
  const [profile, setProfile] = useState({
    shop_name: "SHREEJI JEWELLERS",
    logo: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}?action=shop_profile`)
      .then((res) => {
        if (res.data?.profile) setProfile(res.data.profile);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  const logoSrc = profile.logo ? `${BASE_URL}/${profile.logo}` : "/Bar-code Logo.jpeg";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/Login.php`, {
        action: "login",
        username: credentials.username.trim(),
        password: credentials.password,
      });

      if (response.data.status === "success") {
        localStorage.setItem("jewel_user", JSON.stringify(response.data.user));
        setAuth(response.data.user);
      } else {
        setError(response.data.message || "Invalid username or password");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  const LogoBlock = ({ splash = false }) => (
    <div className={splash ? "splash-logo-shell" : "brand-logo-box"}>
      <div className="logo-orbit" />
      <img
        src={logoSrc}
        alt="Shop Logo"
        className={splash ? "splash-logo" : "shop-logo"}
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const icon = e.currentTarget.parentElement?.querySelector(".fallback-gem");
          if (icon) icon.style.display = "block";
        }}
      />
      <FaGem className="fallback-gem" />
    </div>
  );

  return (
    <div className="login-page">
      <div className="login-bg-glow glow-one" />
      <div className="login-bg-glow glow-two" />
      <div className="login-bg-glow glow-three" />
      <div className="login-pattern" />

      {showSplash ? (
        <section className="splash-screen">
          <div className="splash-content">
            <LogoBlock splash />
            <h1>{profile.shop_name || "SHREEJI JEWELLERS"}</h1>
            <p>Premium Jewellery Management System</p>
            <div className="splash-loader">
              <span />
              <span />
              <span />
            </div>
          </div>
        </section>
      ) : (
        <main className="login-layout">
          <section className="login-brand-panel">
            <div className="brand-panel-inner">
              <FaCrown className="brand-crown" />
              <h2>{profile.shop_name || "SHREEJI JEWELLERS"}</h2>
              <p>Smart billing, barcode stock, sales, profit and repair management in one secure panel.</p>
              <div className="brand-highlights">
                <span>Barcode Inventory</span>
                <span>Sales Billing</span>
                <span>Profit Reports</span>
              </div>
            </div>
          </section>

          <section className="login-card">
            <LogoBlock />

            <div className="login-heading">
              <span>Welcome Back</span>
              <h1>Secure Login</h1>
              <p>{profile.shop_name || "SHREEJI JEWELLERS"}</p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              <label>
                <span>Username</span>
                <div className="input-wrap">
                  <FaUser />
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    placeholder="Enter username"
                    autoComplete="username"
                    required
                  />
                </div>
              </label>

              <label>
                <span>Password</span>
                <div className="input-wrap">
                  <FaLock />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </label>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? <><FaSpinner className="spin" /> VERIFYING...</> : "LOGIN TO DASHBOARD"}
              </button>
            </form>

            <div className="login-footer">
              <FaUserShield />
              <span>Authorized access only</span>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
