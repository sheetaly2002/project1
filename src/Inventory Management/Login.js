import React, { useState } from "react";
import axios from "axios";
import { FaUserShield, FaUser, FaLock, FaGem } from 'react-icons/fa';
import BASE_URLS from './apiConfig';

export default function Login({ setAuth, colors }) {
  const [credentials, setCredentials] = useState({ 
    username: "", 
    password: "", 
    action: "login" // Backend switch ke liye
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Aapki users_api.php file ko call karega
      const res = await axios.post(`${BASE_URLS}/Login.php`, credentials);
      
      if (res.data.status === "success") {
        // Dashboard ko user ka data bhej raha hai
        setAuth(res.data.user);
      } else {
        setError(res.data.message || "Invalid Credentials");
      }
    } catch (err) {
      setError("Server connection failed. Please check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle(colors)}>
      <div style={loginCardStyle}>
        {/* Logo Section */}
        <div style={logoCircleStyle(colors)}>
          <FaGem size={40} color="#fff" />
        </div>
        
        <h2 style={titleStyle}>SHREEJI <span style={{fontWeight: '300'}}>JEWELLERS</span></h2>
        <p style={subtitleStyle}>Inventory Management System</p>

        <form onSubmit={handleLogin} style={formStyle}>
          {/* Username Input */}
          <div style={inputWrapperStyle}>
            <FaUser style={iconStyle(colors)} />
            <input 
              type="text" 
              placeholder="Username" 
              required
              style={inputStyle(colors)}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            />
          </div>

          {/* Password Input */}
          <div style={inputWrapperStyle}>
            <FaLock style={iconStyle(colors)} />
            <input 
              type="password" 
              placeholder="Password" 
              required
              style={inputStyle(colors)}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
          </div>

          {error && <div style={errorBoxStyle}>{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            style={loginBtnStyle(colors, loading)}
          >
            {loading ? "VERIFYING..." : "SECURE LOGIN"}
          </button>
        </form>

        <div style={footerTextStyle}>
          <FaUserShield size={12} /> Authorized Access Only
        </div>
      </div>
    </div>
  );
}

// --- SEPARATE STYLE FUNCTIONS ---
const containerStyle = (colors) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientMid} 50%, ${colors.gradientEnd} 100%)`,
  padding: '20px',
  position: 'relative',
  overflow: 'hidden'
});

const loginCardStyle = {
  width: '100%',
  maxWidth: '420px',
  background: '#ffffff',
  padding: '45px 35px',
  borderRadius: '28px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255, 215, 0, 0.2)',
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  animation: 'scaleIn 0.5s ease'
};

const logoCircleStyle = (colors) => ({
  width: '90px',
  height: '90px',
  background: `linear-gradient(135deg, ${colors.luxuryGold} 0%, ${colors.goldLight} 100%)`,
  borderRadius: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 25px',
  boxShadow: `0 10px 30px ${colors.luxuryGold}66, 0 5px 15px ${colors.goldDark}44`,
  position: 'relative',
  zIndex: 1
});

const titleStyle = {
  margin: '0',
  fontSize: '26px',
  background: `linear-gradient(135deg, #1e1e2f 0%, #1a1a2e 100%)`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  letterSpacing: '3px',
  fontWeight: '900',
  marginBottom: '8px'
};

const subtitleStyle = {
  fontSize: '12px',
  color: '#888',
  marginBottom: '35px',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  fontWeight: '500'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
};

const inputWrapperStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const iconStyle = (colors) => ({
  position: 'absolute',
  left: '16px',
  color: colors.luxuryGold,
  fontSize: '18px',
  zIndex: 1
});

const inputStyle = (colors) => ({
  width: '100%',
  padding: '15px 16px 15px 50px',
  borderRadius: '14px',
  border: `2px solid ${colors.glassBorder}`,
  backgroundColor: '#f8f9fa',
  outline: 'none',
  fontSize: '14px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  fontWeight: '500',
});

const loginBtnStyle = (colors, loading) => ({
  background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientMid} 100%)`,
  color: colors.luxuryGold,
  padding: '16px',
  borderRadius: '14px',
  border: 'none',
  fontWeight: '800',
  fontSize: '14px',
  cursor: loading ? 'not-allowed' : 'pointer',
  letterSpacing: '2px',
  marginTop: '10px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: `0 8px 25px ${colors.luxuryGold}44, 0 4px 12px ${colors.goldDark}33`,
  textTransform: 'uppercase',
  position: 'relative',
  overflow: 'hidden',
  transform: loading ? 'scale(1)' : 'scale(1)',
});

const errorBoxStyle = {
  color: '#e74c3c',
  fontSize: '13px',
  background: '#fdf2f2',
  padding: '12px',
  borderRadius: '12px',
  border: `1px solid rgba(255, 215, 0, 0.3)`,
  animation: 'fadeIn 0.3s ease'
};

const footerTextStyle = {
  marginTop: '25px',
  fontSize: '11px',
  color: '#bbb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  fontWeight: '500'
};