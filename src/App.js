import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URLS from "./Inventory Management/apiConfig";
import {
  FaBars,
  FaBook,
  FaBox,
  FaChartLine,
  FaChartPie,
  FaCrown,
  FaFileInvoiceDollar,
  FaGem,
  FaMoneyBillWave,
  FaPlusSquare,
  FaRecycle,
  FaRupeeSign,
  FaSignOutAlt,
  FaTags,
  FaTimes,
  FaTools,
  FaTruck,
  FaUserShield,
  FaUserTie,
  FaUsers,
  FaWarehouse,
  FaWeightHanging,
} from "react-icons/fa";
import { GiThreeLeaves } from "react-icons/gi";

import Login from "./Inventory Management/Login";
import AllUsers from "./Inventory Management/UserManagement";
import MasterSetup from "./Inventory Management/Category-Lists";
// import RateMaster from "./Inventory Management/RateMaster";
import Products from "./Inventory Management/Products";
import OpeningStock from "./Inventory Management/Opening_stock";
import StockInventory from "./Inventory Management/stock";
import Customers from "./Inventory Management/customers";
import SalesBilling from "./Inventory Management/sales";
import ProfitLoss from "./Inventory Management/ProfitLoss";
import RepairingModule from "./Inventory Management/Repairing";
import Cashbook from "./Inventory Management/cashbook";
import Reports from "./Inventory Management/Reports";
import SupplierMaster from "./Inventory Management/Suppliers";
import PurchaseManagement from "./Inventory Management/purchase_lists";

const colors = {
  deepDark: "#0f0f1a",
  luxuryGold: "#ffd700",
  softBg: "#f7f4ee",
  pureWhite: "#ffffff",
  accentBrown: "#d4af37",
  glassBorder: "rgba(255, 215, 0, 0.28)",
  gradientStart: "#17130f",
  gradientMid: "#2b2118",
  gradientEnd: "#130f0c",
  goldLight: "#ffe55c",
  goldDark: "#b8860b",
};

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const App = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    todaySales: 0,
    totalSales: 0,
    totalProfit: 0,
    cashIn: 0,
    cashOut: 0,
    cashBalance: 0,
    repairIncome: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalStockItems: 0,
    availableItems: 0,
    soldItems: 0,
    totalStockWeight: 0,
    stockValue: 0,
    pendingRepairs: 0,
  });

  const isMobile = windowWidth < 768;

  useEffect(() => {
    const savedUser = localStorage.getItem("shreeji_user");
    if (savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
      setMobileMenuOpen(false);
    } else {
      setCollapsed(false);
    }
  }, [isMobile]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URLS}/dashboard_api.php`);
      setDashboardData((prev) => ({ ...prev, ...(res.data || {}) }));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchDashboardData();
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("shreeji_user");
    setIsAuthenticated(false);
    setUser(null);
  };

  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: <FaChartLine /> },
    { id: "master", name: "Master Setup", icon: <FaTags /> },
    { id: "products", name: "Product Master", icon: <FaBox /> },
    { id: "opening_stock", name: "Opening Stock", icon: <FaPlusSquare /> },
    { id: "stock", name: "Stock Inventory", icon: <FaWarehouse /> },
    { id: "customers", name: "Customers", icon: <FaUsers /> },
    { id: "sales", name: "Sales Billing", icon: <FaFileInvoiceDollar /> },
    { id: "profit_loss", name: "Profit / Loss", icon: <FaGem /> },
    { id: "cashbook", name: "Cashbook", icon: <FaMoneyBillWave /> },
    { id: "repairing", name: "Repairing", icon: <FaTools /> },
    { id: "reports", name: "Reports", icon: <FaChartPie /> },
    { id: "suppliers", name: "Suppliers", icon: <FaUserTie /> },
    { id: "purchase", name: "Purchase", icon: <FaTruck /> },
    ...(user?.role === "admin"
      ? [{ id: "AllUsers", name: "Manage Users", icon: <FaUserShield /> }]
      : []),
  ];

  if (!isAuthenticated) {
    return (
      <Login
        setAuth={(userData) => {
          setIsAuthenticated(true);
          setUser(userData);
          localStorage.setItem("shreeji_user", JSON.stringify(userData));
        }}
        colors={colors}
      />
    );
  }

  const renderPage = () => {
    if (activePage === "dashboard") {
      return (
        <Dashboard
          user={user}
          loading={loading}
          data={dashboardData}
          refresh={fetchDashboardData}
          isMobile={isMobile}
        />
      );
    }

    return (
      <div style={pageContainerStyle(isMobile)}>
        {activePage === "AllUsers" && <AllUsers />}
        {activePage === "master" && <MasterSetup />}
        {activePage === "products" && <Products />}
        {activePage === "opening_stock" && <OpeningStock />}
        {activePage === "stock" && <StockInventory />}
        {activePage === "customers" && <Customers />}
        {activePage === "sales" && <SalesBilling />}
        {activePage === "profit_loss" && <ProfitLoss />}
        {activePage === "cashbook" && <Cashbook />}
        {activePage === "repairing" && <RepairingModule />}
        {activePage === "reports" && <Reports />}
        {activePage === "suppliers" && <SupplierMaster />}
        {activePage === "purchase" && <PurchaseManagement />}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: colors.softBg, fontFamily: "Poppins, Inter, sans-serif", overflow: "hidden" }}>
      {mobileMenuOpen && isMobile && <div style={overlayStyle} onClick={() => setMobileMenuOpen(false)} />}

      <aside style={sidebarStyle({ collapsed, isMobile, mobileMenuOpen })}>
        <div style={logoBlockStyle(collapsed, isMobile)}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed && !isMobile ? "center" : "space-between", gap: 12 }}>
            <GiThreeLeaves style={{ fontSize: collapsed && !isMobile ? 34 : 42, color: colors.luxuryGold, filter: `drop-shadow(0 0 12px ${colors.luxuryGold})` }} />
            {(!collapsed || isMobile) && (
              <div>
                <div style={{ color: colors.luxuryGold, fontSize: 16, fontWeight: 900, letterSpacing: 3 }}>SHREEJI</div>
                <div style={{ color: "#fff", fontSize: 11, letterSpacing: 2 }}>JEWELLERS</div>
              </div>
            )}
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {menuItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                if (isMobile) setMobileMenuOpen(false);
              }}
              style={{ ...menuStyle(activePage === item.id, collapsed || isMobile), animation: `slideInLeft ${0.22 + index * 0.035}s ease both` }}
            >
              <span style={{ fontSize: 18, minWidth: 24, display: "flex" }}>{item.icon}</span>
              {(!collapsed || isMobile) && <span style={{ marginLeft: 12, fontSize: 12, fontWeight: activePage === item.id ? 800 : 500 }}>{item.name}</span>}
            </div>
          ))}
        </nav>

        <div onClick={handleLogout} style={{ ...menuStyle(false, collapsed || isMobile), color: "#ff5a64", borderTop: "1px solid rgba(255,90,100,.28)", marginTop: 12, paddingTop: 14 }}>
          <FaSignOutAlt />
          {(!collapsed || isMobile) && <span style={{ marginLeft: 12, fontSize: 13, fontWeight: 700 }}>Logout</span>}
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={topbarStyle(isMobile)}>
          <button onClick={() => (isMobile ? setMobileMenuOpen(true) : setCollapsed(!collapsed))} style={iconBtnStyle}>
            {isMobile && mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div style={{ fontWeight: 900, color: colors.deepDark, letterSpacing: 0.4 }}>{menuItems.find((x) => x.id === activePage)?.name || "Dashboard"}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: colors.goldDark, fontWeight: 900, textTransform: "uppercase" }}>{user?.role}</div>
              <div style={{ fontSize: 14, fontWeight: 800, maxWidth: isMobile ? 120 : 190, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.full_name}</div>
            </div>
            <div style={avatarStyle}><FaUserTie /></div>
          </div>
        </header>

        <main style={{ padding: isMobile ? 14 : 24, flex: 1, overflowY: "auto", background: "linear-gradient(135deg,#faf7ef,#eef0f5)" }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

const Dashboard = ({ user, loading, data, refresh, isMobile }) => {
  const cards = [
    { title: "Today Sales", value: `₹${formatMoney(data.todaySales)}`, icon: <FaFileInvoiceDollar />, color: "#ffd700" },
    { title: "Total Sales", value: `₹${formatMoney(data.totalSales)}`, icon: <FaChartLine />, color: "#f6c343" },
    { title: "Profit / Loss", value: `₹${formatMoney(data.totalProfit)}`, icon: <FaGem />, color: Number(data.totalProfit) >= 0 ? "#16a34a" : "#dc2626" },
    { title: "Cash In", value: `₹${formatMoney(data.cashIn)}`, icon: <FaMoneyBillWave />, color: "#10b981" },
    { title: "Cash Out", value: `₹${formatMoney(data.cashOut)}`, icon: <FaBook />, color: "#ef4444" },
    { title: "Cash Balance", value: `₹${formatMoney(data.cashBalance)}`, icon: <FaRupeeSign />, color: "#0ea5e9" },
    { title: "Stock Value", value: `₹${formatMoney(data.stockValue)}`, icon: <FaWarehouse />, color: "#b8860b" },
    { title: "Stock Weight", value: `${Number(data.totalStockWeight || 0).toFixed(3)} g`, icon: <FaWeightHanging />, color: "#cd7f32" },
    { title: "Available Items", value: data.availableItems || 0, icon: <FaBox />, color: "#6366f1" },
    { title: "Sold Items", value: data.soldItems || 0, icon: <FaFileInvoiceDollar />, color: "#0ea5e9" },
    { title: "Customers", value: data.totalCustomers || 0, icon: <FaUsers />, color: "#ec4899" },
    { title: "Products", value: data.totalProducts || 0, icon: <FaTags />, color: "#a855f7" },
    { title: "Pending Repairs", value: data.pendingRepairs || 0, icon: <FaTools />, color: "#f97316" },
    { title: "Repair Revenue", value: `₹${formatMoney(data.repairIncome)}`, icon: <FaGem />, color: "#f59e0b" },
  ];

  return (
    <div>
      <section style={dashboardHeroStyle(isMobile)}>
        <div>
          <p style={{ margin: 0, color: colors.luxuryGold, fontWeight: 900, letterSpacing: 3 }}>WELCOME BACK</p>
          <h1 style={{ margin: "10px 0", color: "#fff", fontSize: isMobile ? 28 : 42 }}>{user?.full_name}</h1>
          <p style={{ margin: 0, color: "rgba(255,255,255,.8)" }}>Premium jewellery management dashboard: sales, stock, cashbook, profit and repairs.</p>
        </div>
        <button onClick={refresh} style={{ ...iconBtnStyle, width: "auto", padding: "12px 18px", gap: 8 }}>
          <FaRecycle className={loading ? "spin" : ""} /> Refresh
        </button>
        <FaCrown style={{ position: "absolute", right: -15, bottom: -28, fontSize: isMobile ? 90 : 170, color: "rgba(255,215,0,.1)" }} />
      </section>

      <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(220px,1fr))", gap: 18 }}>
        {cards.map((card, idx) => (
          <div key={card.title} style={statCardStyle(idx)}>
            <div style={{ width: 54, height: 54, borderRadius: 16, background: `linear-gradient(135deg, ${card.color}, #6b4e12)`, color: "#fff", display: "grid", placeItems: "center", fontSize: 24, boxShadow: `0 12px 25px ${card.color}55` }}>{card.icon}</div>
            <span style={{ display: "block", marginTop: 16, fontSize: 12, color: "#776b5f", fontWeight: 800 }}>{card.title}</span>
            <b style={{ display: "block", marginTop: 5, fontSize: 24, color: colors.deepDark }}>{loading ? "Loading..." : card.value}</b>
          </div>
        ))}
      </section>
    </div>
  );
};

const overlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 999, backdropFilter: "blur(4px)" };

const sidebarStyle = ({ collapsed, isMobile, mobileMenuOpen }) => ({
  width: collapsed && !isMobile ? 76 : 265,
  background: `linear-gradient(180deg, ${colors.gradientStart}, ${colors.gradientMid} 45%, ${colors.gradientEnd})`,
  padding: "18px 10px",
  transition: "all .35s ease",
  display: "flex",
  flexDirection: "column",
  position: isMobile ? "fixed" : "sticky",
  top: 0,
  height: "100vh",
  boxShadow: "5px 0 30px rgba(0,0,0,.28)",
  zIndex: isMobile ? 1000 : 100,
  transform: isMobile && !mobileMenuOpen ? "translateX(-100%)" : "translateX(0)",
  overflow: "hidden",
  borderRight: `1px solid ${colors.glassBorder}`,
});

const logoBlockStyle = (collapsed, isMobile) => ({
  textAlign: "center",
  marginBottom: 18,
  padding: collapsed && !isMobile ? "0 5px 16px" : "0 12px 16px",
  borderBottom: `1px solid ${colors.glassBorder}`,
});

const menuStyle = (active, centered) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: centered ? "center" : "flex-start",
  padding: "11px 14px",
  marginBottom: 7,
  borderRadius: 12,
  cursor: "pointer",
  background: active ? `linear-gradient(90deg, ${colors.luxuryGold}22, transparent)` : "transparent",
  color: active ? "#fff" : "rgba(255,255,255,.68)",
  borderLeft: active ? `3px solid ${colors.luxuryGold}` : "3px solid transparent",
  boxShadow: active ? "inset 0 0 15px rgba(255,215,0,.1)" : "none",
  transition: "all .25s ease",
});

const topbarStyle = (isMobile) => ({
  height: isMobile ? 62 : 72,
  background: "rgba(255,255,255,.9)",
  display: "flex",
  alignItems: "center",
  padding: isMobile ? "0 14px" : "0 28px",
  justifyContent: "space-between",
  boxShadow: "0 4px 25px rgba(0,0,0,.08)",
  zIndex: 90,
  borderBottom: `1px solid ${colors.glassBorder}`,
  position: "sticky",
  top: 0,
  backdropFilter: "blur(10px)",
});

const iconBtnStyle = {
  border: "none",
  background: "linear-gradient(135deg,#fff,#f4ead2)",
  padding: 11,
  borderRadius: 13,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: colors.deepDark,
  boxShadow: "0 4px 15px rgba(0,0,0,.08)",
  outline: `1px solid ${colors.glassBorder}`,
};

const avatarStyle = {
  width: 45,
  height: 45,
  borderRadius: 14,
  background: `linear-gradient(135deg, ${colors.luxuryGold}, ${colors.accentBrown})`,
  display: "grid",
  placeItems: "center",
  color: "#fff",
  boxShadow: `0 6px 20px ${colors.luxuryGold}55`,
  fontSize: 20,
};

const pageContainerStyle = (isMobile) => ({
  background: "#fff",
  borderRadius: isMobile ? 16 : 22,
  padding: isMobile ? 12 : 22,
  minHeight: "80vh",
  boxShadow: "0 10px 45px rgba(0,0,0,.08)",
  border: `1px solid ${colors.glassBorder}`,
  overflow: "hidden",
});

const dashboardHeroStyle = (isMobile) => ({
  position: "relative",
  overflow: "hidden",
  marginBottom: 25,
  padding: isMobile ? 24 : 42,
  borderRadius: 24,
  background: `linear-gradient(135deg, ${colors.gradientStart}, ${colors.gradientMid}, ${colors.gradientEnd})`,
  boxShadow: "0 15px 45px rgba(0,0,0,.22)",
  border: `1px solid ${colors.glassBorder}`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: isMobile ? "flex-start" : "center",
  gap: 16,
  flexDirection: isMobile ? "column" : "row",
});

const statCardStyle = (idx) => ({
  background: "#fff",
  borderRadius: 20,
  padding: 22,
  boxShadow: "0 10px 32px rgba(0,0,0,.08)",
  border: `1px solid ${colors.glassBorder}`,
  animation: `scaleIn ${0.25 + idx * 0.04}s ease both`,
});

export default App;
