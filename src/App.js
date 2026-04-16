import React, { useState, useEffect } from "react";
import { 
  FaFileInvoiceDollar, FaWarehouse, FaBox, FaShoppingCart, 
  FaUserTie, FaUsers, FaPlusSquare, FaChartLine, FaTags, FaBars, FaGem, FaWallet, FaTools, FaSignOutAlt, FaUserShield, FaTimes
} from "react-icons/fa";
import { GiThreeLeaves } from "react-icons/gi";

// --- IMPORT SECTIONS ---
import Reports from "./Inventory Management/Reports"; 
import SalesDashboard from "./Inventory Management/sales"; 
import StockDashboard from "./Inventory Management/stock"; 
import CategoryPage from "./Inventory Management/Category-Lists"; 
import SupplierPage from "./Inventory Management/Suppliers"; 
import CustomerPage from "./Inventory Management/customers"; 
import PurchasePage from "./Inventory Management/purchase_lists"; 
import OpeningStockPage from "./Inventory Management/Opening_stock";
import CashBook from "./Inventory Management/cashbook";
import Repairing from "./Inventory Management/Repairing";
import Products from "./Inventory Management/Products";
import AllUsers from "./Inventory Management/AllUsers";
import Login from "./Inventory Management/Login";

const App = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Responsive breakpoint
  const isMobile = windowWidth < 768;

  // Check login on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("shreeji_user");
    if (savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
      setMobileMenuOpen(false);
    } else {
      setCollapsed(false);
    }
  }, [isMobile]);

  const handleLogout = () => {
    localStorage.removeItem("shreeji_user");
    setIsAuthenticated(false);
    setUser(null);
  };

  const colors = {
    deepDark: "#0f0f1a",
    luxuryGold: "#ffd700",
    softPink: "#fafbfc",
    pureWhite: "#ffffff",
    accentBrown: "#d4af37",
    glassBorder: "rgba(255, 215, 0, 0.3)",
    gradientStart: "#1e1e2f",
    gradientMid: "#2d2d44",
    gradientEnd: "#1a1a2e",
    goldLight: "#ffe55c",
    goldDark: "#b8860b"
  };

  // --- ROLE BASED MENU FILTERING ---
  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: <FaChartLine /> },
    ...(user?.role === "admin" ? [{ id: "AllUsers", name: "Manage Users", icon: <FaUserShield /> }] : []),
    { id: "Reports", name: "Reports & Analytics", icon: <FaGem /> },
    { id: "cashbook", name: "Cash Book", icon: <FaWallet /> },
    { id: "repairing", name: "Repairs", icon: <FaTools /> },
    { id: "sales", name: "Sales", icon: <FaFileInvoiceDollar /> },
    { id: "purchase", name: "Purchase", icon: <FaShoppingCart /> },
    { id: "stock", name: "Inventory", icon: <FaWarehouse /> },
    { id: "opening_stock", name: "Opening Stock", icon: <FaPlusSquare /> },
    { id: "products", name: "Products", icon: <FaBox /> },
    { id: "category", name: "Categories", icon: <FaTags /> },
    { id: "suppliers", name: "Suppliers", icon: <FaUserTie /> },
    { id: "customers", name: "Customers", icon: <FaUsers /> },
  ];

  // 1. Show Login Page if not authenticated
  if (!isAuthenticated) {
    return <Login setAuth={(userData) => {
      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem("shreeji_user", JSON.stringify(userData));
    }} colors={colors} />;
  }

  // 2. Show Dashboard if authenticated
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors.softPink, fontFamily: "'Poppins', sans-serif", overflow: "hidden" }}>
      
      {/* --- MOBILE OVERLAY --- */}
      {mobileMenuOpen && isMobile && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
            backdropFilter: "blur(4px)"
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* --- SIDEBAR --- */}
      <aside style={{ 
        width: collapsed && !isMobile ? "75px" : "260px", 
        background: `linear-gradient(180deg, ${colors.gradientStart} 0%, ${colors.gradientMid} 35%, ${colors.gradientEnd} 100%)`,
        padding: "18px 10px",
        transition: "all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        display: "flex", 
        flexDirection: "column",
        position: isMobile ? "fixed" : "sticky", 
        top: 0, 
        height: "100vh",
        boxShadow: "5px 0 30px rgba(0,0,0,0.3), inset 0 0 60px rgba(255, 215, 0, 0.05)", 
        zIndex: isMobile ? 1000 : 100,
        transform: isMobile && !mobileMenuOpen ? "translateX(-100%)" : "translateX(0)",
        overflow: "hidden",
        borderRight: `1px solid ${colors.glassBorder}`
      }}>
        {/* Logo Section */}
        <div style={{ 
          textAlign: "center", 
          marginBottom: "20px", 
          padding: collapsed && !isMobile ? "0 5px" : "0 12px",
          borderBottom: `2px solid ${colors.glassBorder}`,
          paddingBottom: "18px",
          position: "relative"
        }}>
          <div style={{ 
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80px",
            height: "80px",
            background: `radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)`,
            borderRadius: "50%",
            zIndex: 0
          }} />
          <div style={{ 
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed && !isMobile ? "center" : "space-between",
            gap: "12px",
            position: "relative",
            zIndex: 1
          }}>
            <div style={{
              position: "relative",
              animation: "float 3s ease-in-out infinite"
            }}>
              <GiThreeLeaves style={{ 
                fontSize: collapsed && !isMobile ? "36px" : "42px", 
                color: colors.luxuryGold,
                filter: `drop-shadow(0 0 15px ${colors.luxuryGold}) brightness(1.2)`,
                animation: "pulse 2s ease-in-out infinite"
              }} />
            </div>
            {(!collapsed || isMobile) && (
              <div style={{
                animation: "slideInLeft 0.5s ease"
              }}>
                <div style={{ 
                  background: `linear-gradient(135deg, ${colors.luxuryGold} 0%, ${colors.goldLight} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: "16px", 
                  fontWeight: "900", 
                  letterSpacing: "4px",
                  textShadow: "0 0 30px rgba(255, 215, 0, 0.5)",
                  marginBottom: "4px"
                }}>
                  SHREEJI
                </div>
                <div style={{ 
                  color: "#ffffff", 
                  fontSize: "11px", 
                  fontWeight: "400", 
                  letterSpacing: "3px",
                  opacity: 0.9,
                  textTransform: "uppercase"
                }}>
                  Jewellers
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ 
          flex: 1, 
          overflowY: "auto", 
          overflowX: "hidden", 
          paddingRight: "3px"
        }}>
          {menuItems.map((item, index) => (
            <div 
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                if (isMobile) setMobileMenuOpen(false);
              }}
              style={{
                ...menuStyle(activePage === item.id, colors, collapsed || isMobile),
                animation: `slideInLeft ${0.3 + (index * 0.05)}s ease both`
              }}
            >
              <span style={{ 
                fontSize: "18px", 
                display: "flex", 
                alignItems: "center", 
                minWidth: "24px",
                position: "relative",
                filter: activePage === item.id ? `drop-shadow(0 0 8px ${colors.luxuryGold})` : "none"
              }}>
                {item.icon}
              </span>
              {(!collapsed || isMobile) && (
                <span style={{ 
                  marginLeft: "12px", 
                  fontWeight: activePage === item.id ? "700" : "400", 
                  fontSize: "12px",
                  color: activePage === item.id ? "#ffffff" : "rgba(255,255,255,0.6)",
                  whiteSpace: "nowrap",
                  letterSpacing: activePage === item.id ? "0.5px" : "0",
                  transition: "all 0.3s ease"
                }}>
                  {item.name}
                </span>
              )}
              {activePage === item.id && !collapsed && (
                <div style={{
                  position: "absolute",
                  right: "12px",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${colors.luxuryGold} 0%, ${colors.goldLight} 100%)`,
                  boxShadow: `0 0 10px ${colors.luxuryGold}, 0 0 20px ${colors.goldDark}`,
                  animation: "pulse 1.5s ease-in-out infinite"
                }} />
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div 
          onClick={handleLogout} 
          style={{ 
            ...menuStyle(false, colors, collapsed || isMobile), 
            color: "#ff4757", 
            marginTop: "15px",
            borderTop: `2px solid rgba(255, 71, 87, 0.3)`,
            paddingTop: "15px",
            background: "linear-gradient(90deg, rgba(255, 71, 87, 0.1) 0%, transparent 100%)",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(90deg, rgba(255, 71, 87, 0.2) 0%, rgba(255, 71, 87, 0.05) 100%)";
            e.currentTarget.style.transform = "translateX(5px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(90deg, rgba(255, 71, 87, 0.1) 0%, transparent 100%)";
            e.currentTarget.style.transform = "translateX(0)";
          }}
        >
          <FaSignOutAlt style={{ fontSize: "18px", filter: "drop-shadow(0 0 8px rgba(255, 71, 87, 0.5))" }} />
          {(!collapsed || isMobile) && <span style={{ marginLeft: "12px", fontWeight: "600", fontSize: "13px" }}>Logout</span>}
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        
        {/* Header */}
        <header style={{ 
          height: isMobile ? "60px" : "70px", 
          background: `linear-gradient(135deg, ${colors.pureWhite} 0%, #f8f9fa 100%)`,
          display: "flex", 
          alignItems: "center", 
          padding: isMobile ? "0 15px" : "0 30px", 
          justifyContent: "space-between", 
          boxShadow: "0 4px 25px rgba(0,0,0,0.08), 0 1px 3px rgba(255, 215, 0, 0.1)", 
          zIndex: 90,
          borderBottom: `2px solid ${colors.glassBorder}`,
          position: "sticky",
          top: 0,
          backdropFilter: "blur(10px)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "10px" : "15px" }}>
            <button 
              onClick={() => {
                if (isMobile) {
                  setMobileMenuOpen(true);
                } else {
                  setCollapsed(!collapsed);
                }
              }} 
              style={{
                ...iconBtnStyle(colors),
                position: "relative",
                overflow: "hidden"
              }}
            >
              <span style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "100%",
                height: "100%",
                background: `radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)`,
                opacity: 0,
                transition: "opacity 0.3s ease"
              }} />
              {isMobile && mobileMenuOpen ? <FaTimes size={18} style={{ position: "relative" }} /> : <FaBars size={18} style={{ position: "relative" }} />}
            </button>
            
            {isMobile && (
              <div style={{ 
                color: colors.luxuryGold, 
                fontSize: "16px", 
                fontWeight: "700",
                letterSpacing: "1px"
              }}>
                SHREEJI JEWELLERS
              </div>
            )}
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "12px" : "18px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ 
                fontSize: isMobile ? "9px" : "10px", 
                background: `linear-gradient(135deg, ${colors.luxuryGold} 0%, ${colors.goldLight} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "800", 
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "3px"
              }}>
                {user?.role}
              </div>
              <div style={{ 
                fontSize: isMobile ? "13px" : "14px", 
                color: colors.deepDark, 
                fontWeight: "700",
                maxWidth: isMobile ? "120px" : "180px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textShadow: "0 1px 2px rgba(0,0,0,0.1)"
              }}>
                {user?.full_name}
              </div>
            </div>
            <div style={{
              ...avatarStyle(colors),
              width: isMobile ? "40px" : "45px",
              height: isMobile ? "40px" : "45px",
              fontSize: isMobile ? "18px" : "20px",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                inset: 0,
                borderRadius: "14px",
                background: `linear-gradient(135deg, ${colors.luxuryGold} 0%, ${colors.accentBrown} 100%)`,
                opacity: 0.3,
                filter: "blur(8px)",
                zIndex: -1
              }} />
              <FaUserTie style={{ filter: "drop-shadow(0 2px 8px rgba(255, 215, 0, 0.4))" }} />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main style={{ 
          padding: isMobile ? "15px" : "25px", 
          flex: 1, 
          overflowY: "auto",
          background: `linear-gradient(135deg, #fafbfc 0%, #f0f2f5 50%, #e8eaf0 100%)`
        }}>
          <div style={{ animation: "fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }}>
            {activePage === "dashboard" && <WelcomeOverview colors={colors} user={user} isMobile={isMobile} />}
            
            {activePage !== "dashboard" && (
              <div style={{
                ...pageContainerStyle(colors),
                padding: isMobile ? "18px 12px" : "28px",
                borderRadius: isMobile ? "16px" : "20px"
              }}>
                {activePage === "AllUsers" && <AllUsers />}
                {activePage === "Reports" && <Reports />}
                {activePage === "cashbook" && <CashBook />}
                {activePage === "repairing" && <Repairing />}
                {activePage === "sales" && <SalesDashboard />}
                {activePage === "stock" && <StockDashboard />}
                {activePage === "products" && <Products />}
                {activePage === "category" && <CategoryPage />}
                {activePage === "suppliers" && <SupplierPage />}
                {activePage === "customers" && <CustomerPage />}
                {activePage === "purchase" && <PurchasePage />}
                {activePage === "opening_stock" && <OpeningStockPage />}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS & STYLES ---

const WelcomeOverview = ({ colors, user, isMobile }) => (
  <div>
    <div style={{
      ...bannerStyle(colors),
      padding: isMobile ? "30px 20px" : "50px 40px",
      marginBottom: isMobile ? "25px" : "35px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Animated background elements */}
      <div style={{
        position: "absolute",
        top: "-50%",
        right: "-50%",
        width: "200%",
        height: "200%",
        background: `radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)`,
        animation: "rotate 20s linear infinite"
      }} />
      <div style={{
        position: "absolute",
        top: "20%",
        left: "10%",
        width: "150px",
        height: "150px",
        background: `radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)`,
        borderRadius: "50%",
        filter: "blur(40px)",
        animation: "float 4s ease-in-out infinite"
      }} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <h4 style={{ 
          color: colors.luxuryGold, 
          margin: 0, 
          letterSpacing: "4px",
          fontSize: isMobile ? "12px" : "14px",
          fontWeight: "800",
          textShadow: "0 0 20px rgba(255, 215, 0, 0.5)",
          animation: "slideInLeft 0.6s ease"
        }}>
          WELCOME BACK
        </h4>
        <h1 style={{ 
          margin: isMobile ? "10px 0" : "15px 0", 
          fontSize: isMobile ? "28px" : "40px", 
          fontWeight: "900",
          background: `linear-gradient(135deg, #ffffff 0%, ${colors.goldLight} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 4px 20px rgba(255, 215, 0, 0.3)",
          animation: "scaleIn 0.7s ease",
          letterSpacing: "1.5px"
        }}>
          {user?.full_name}
        </h1>
        <p style={{ 
          opacity: 0.95, 
          fontSize: isMobile ? "13px" : "16px",
          color: "rgba(255,255,255,0.95)",
          margin: isMobile ? "8px 0 0" : "12px 0 0",
          fontWeight: "400",
          letterSpacing: "0.8px",
          animation: "fadeIn 0.8s ease"
        }}>
          Premium Jewellery Management System
        </p>
      </div>
      <FaGem style={{
        position: 'absolute', 
        right: isMobile ? "-10px" : "-20px", 
        bottom: isMobile ? "-10px" : "-20px", 
        fontSize: isMobile ? "100px" : "200px", 
        background: `linear-gradient(135deg, ${colors.luxuryGold} 0%, ${colors.goldLight} 100%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: 'rgba(255, 215, 0, 0.08)',
        transform: isMobile ? "rotate(-15deg)" : "rotate(0deg)",
        filter: "drop-shadow(0 0 30px rgba(255, 215, 0, 0.3))",
        animation: "pulse 3s ease-in-out infinite"
      }} />
    </div>
    
    {/* Quick Stats Cards */}
    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))",
      gap: isMobile ? "15px" : "20px",
      marginBottom: isMobile ? "20px" : "30px"
    }}>
      {[
        { title: "Today's Sales", value: "₹0", icon: <FaFileInvoiceDollar />, color: "#ffd700" },
        { title: "Total Products", value: "0", icon: <FaBox />, color: "#ffe55c" },
        { title: "Active Customers", value: "0", icon: <FaUsers />, color: "#ffec8b" },
        { title: "Pending Orders", value: "0", icon: <FaShoppingCart />, color: "#daa520" }
      ].map((stat, index) => (
        <div 
          key={index} 
          style={{
            background: "white",
            borderRadius: isMobile ? "14px" : "18px",
            padding: isMobile ? "20px 15px" : "28px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12), 0 2px 10px rgba(255, 215, 0, 0.1)",
            border: `1px solid ${colors.glassBorder}`,
            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            animation: `scaleIn ${0.4 + (index * 0.1)}s ease both`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
            e.currentTarget.style.boxShadow = "0 15px 50px rgba(0,0,0,0.15), 0 5px 20px rgba(255, 215, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.12), 0 2px 10px rgba(255, 215, 0, 0.1)";
          }}
        >
          {/* Hover gradient effect */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${stat.color}15 0%, transparent 100%)`,
            opacity: 0,
            transition: "opacity 0.4s ease"
          }} />
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "15px",
            position: "relative"
          }}>
            <div style={{
              width: isMobile ? "50px" : "60px",
              height: isMobile ? "50px" : "60px",
              borderRadius: "14px",
              background: `linear-gradient(135deg, ${stat.color} 0%, ${colors.goldDark} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: isMobile ? "22px" : "26px",
              boxShadow: `0 6px 20px ${stat.color}66, 0 3px 10px ${colors.goldDark}44`,
              transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            }}>
              {stat.icon}
            </div>
          </div>
          <div style={{ color: "#888", fontSize: isMobile ? "12px" : "13px", marginBottom: "6px", fontWeight: "600", letterSpacing: "0.5px" }}>
            {stat.title}
          </div>
          <div style={{ 
            color: colors.deepDark, 
            fontSize: isMobile ? "24px" : "32px", 
            fontWeight: "800",
            textShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const menuStyle = (isActive, colors, isCollapsed) => ({
  display: "flex", 
  alignItems: "center", 
  justifyContent: isCollapsed ? "center" : "space-between",
  padding: "10px 14px", 
  marginBottom: "6px", 
  borderRadius: "10px", 
  cursor: "pointer",
  background: isActive 
    ? `linear-gradient(90deg, ${colors.luxuryGold}22 0%, ${colors.goldDark}11 100%)`
    : "transparent",
  color: isActive ? "#ffffff" : "rgba(255,255,255,0.6)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  borderLeft: isActive 
    ? `3px solid ${colors.luxuryGold}`
    : "3px solid transparent",
  position: "relative",
  fontWeight: isActive ? "700" : "500",
  fontSize: "12px",
  backdropFilter: "blur(10px)",
  overflow: "hidden",
  transform: "translateX(0)",
  boxShadow: isActive 
    ? "inset 0 0 15px rgba(255, 215, 0, 0.1), 0 2px 10px rgba(0,0,0,0.2)" 
    : "none"
});

const pageContainerStyle = (colors) => ({
  backgroundColor: colors.pureWhite, 
  borderRadius: "20px", 
  padding: "30px", 
  minHeight: "80vh", 
  boxShadow: "0 10px 50px rgba(0,0,0,0.1), 0 2px 15px rgba(255, 215, 0, 0.15)", 
  border: `1px solid ${colors.glassBorder}`,
  background: "white",
  position: "relative",
  overflow: "hidden"
});

const bannerStyle = (colors) => ({
  background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientMid} 50%, ${colors.gradientEnd} 100%)`,
  padding: '50px 40px', 
  borderRadius: '20px', 
  color: 'white', 
  position: 'relative', 
  marginBottom: '35px',
  boxShadow: "0 15px 50px rgba(0,0,0,0.3), inset 0 0 80px rgba(255, 215, 0, 0.1)",
  overflow: "hidden",
  border: `2px solid ${colors.glassBorder}`
});

const iconBtnStyle = (colors) => ({ 
  border: 'none', 
  background: `linear-gradient(135deg, ${colors.softPink} 0%, #ffffff 100%)`, 
  padding: "10px", 
  borderRadius: "12px", 
  cursor: 'pointer',
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: colors.deepDark,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: "0 4px 15px rgba(0,0,0,0.1), inset 0 0 20px rgba(255, 255, 255, 0.8)",
  outline: `2px solid ${colors.glassBorder}`,
  transform: "scale(1)",
  WebkitTapHighlightColor: "transparent"
});

const avatarStyle = (colors) => ({ 
  width: "45px", 
  height: "45px", 
  borderRadius: "14px", 
  background: `linear-gradient(135deg, ${colors.luxuryGold} 0%, ${colors.accentBrown} 100%)`,
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center", 
  color: "#fff",
  boxShadow: `0 6px 20px ${colors.luxuryGold}66, 0 3px 10px ${colors.goldDark}44`,
  fontSize: "20px",
  position: "relative",
  zIndex: 1
});

export default App;