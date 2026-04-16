import React, { useState, useEffect } from "react";
import { FaArrowUp, FaArrowDown, FaMoneyBillWave, FaChartBar, FaCalendarAlt, FaSearch, FaExclamationTriangle } from "react-icons/fa";
import BASE_URLS from './apiConfig';

const BASE_URL = `${BASE_URLS}`;

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const fetchReports = () => {
    setLoading(true);
    fetch(`${BASE_URL}/sales.php`) 
      .then(res => res.json())
      .then(data => {
        if(data.status === "success") {
          const filtered = data.data.filter(sale => 
            sale.sale_date >= fromDate && sale.sale_date <= toDate
          );
          setSalesData(filtered);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // --- Calculations ---
  const totalSales = salesData.reduce((acc, sale) => acc + parseFloat(sale.total_amount || 0), 0);
  
  // Sirf Profit calculate karne ke liye
  const totalProfit = salesData.reduce((acc, sale) => {
    const res = parseFloat(sale.net_profit_loss || 0);
    return res > 0 ? acc + res : acc;
  }, 0);

  // Sirf Loss calculate karne ke liye
  const totalLoss = salesData.reduce((acc, sale) => {
    const res = parseFloat(sale.net_profit_loss || 0);
    return res < 0 ? acc + Math.abs(res) : acc;
  }, 0);

  const totalBills = salesData.length;

  const colors = { 
    gold: "#ad8b73", 
    brown: "#5d4037", 
    pink: "#fce4ec", 
    lightPink: "#fff5f7",
    profit: "#2e7d32",
    loss: "#d32f2f",
    gray: "#757575"
  };

  return (
    <div style={{ padding: "10px" }}>
      {/* --- Header & Date Filter --- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "15px" }}>
        <h2 style={{ color: colors.brown, margin: 0 }}>Business Analytics</h2>
        
        <div style={{ display: "flex", gap: "10px", alignItems: "center", background: "white", padding: "10px", borderRadius: "10px", border: `1px solid ${colors.pink}` }}>
          <FaCalendarAlt style={{ color: colors.gold }} />
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={dateInputStyle} />
          <span>to</span>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={dateInputStyle} />
          <button onClick={fetchReports} style={searchBtnStyle(colors)}>
            <FaSearch /> Get Report
          </button>
        </div>
      </div>
      
      {/* --- Quick Stats Header --- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
        <StatCard title="Total Revenue" value={`₹${totalSales.toLocaleString()}`} icon={<FaMoneyBillWave />} color="#4caf50" />
        
        {/* Profit Card */}
        <StatCard title="Total Profit" value={`₹${totalProfit.toLocaleString()}`} icon={<FaArrowUp />} color={colors.profit} />
        
        {/* Loss Card (Yahan check hai agar loss 0 hai toh) */}
        <StatCard 
            title="Total Loss" 
            value={totalLoss > 0 ? `₹${totalLoss.toLocaleString()}` : "No Loss"} 
            icon={totalLoss > 0 ? <FaArrowDown /> : <FaExclamationTriangle />} 
            color={totalLoss > 0 ? colors.loss : colors.gray} 
        />
        
        <StatCard title="Total Invoices" value={totalBills} icon={<FaChartBar />} color={colors.brown} />
      </div>

      {loading ? (
        <p style={{ textAlign: "center", marginTop: "50px" }}>Fetching data...</p>
      ) : (
        <div style={{ marginTop: "30px", backgroundColor: "white", borderRadius: "15px", border: `1px solid ${colors.pink}`, overflow: "hidden" }}>
          <div style={{ padding: "15px", background: colors.lightPink, borderBottom: `1px solid ${colors.pink}`, fontWeight: "bold", color: colors.brown }}>
            Sales & Loss Analysis ({fromDate} to {toDate})
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", background: colors.pink }}>
                  <th style={tableHeader}>Date</th>
                  <th style={tableHeader}>Bill No</th>
                  <th style={tableHeader}>Customer</th>
                  <th style={tableHeader}>Amount</th>
                  <th style={tableHeader}>Profit</th>
                  <th style={tableHeader}>Loss</th>
                </tr>
              </thead>
              <tbody>
                {salesData.length > 0 ? salesData.map((sale, i) => {
                  const net = parseFloat(sale.net_profit_loss || 0);
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={tableCell}>{sale.sale_date}</td>
                      <td style={tableCell}><b>#{sale.bill_no}</b></td>
                      <td style={tableCell}>{sale.customer_name}</td>
                      <td style={tableCell}>₹{parseFloat(sale.total_amount).toLocaleString()}</td>
                      
                      {/* Profit Column */}
                      <td style={{ ...tableCell, color: colors.profit, fontWeight: "bold" }}>
                         {net > 0 ? `₹${net.toLocaleString()}` : "-"}
                      </td>

                      {/* Loss Column */}
                      <td style={{ ...tableCell, color: colors.loss, fontWeight: "bold" }}>
                         {net < 0 ? `₹${Math.abs(net).toLocaleString()}` : "-"}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>No data found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div style={{ background: "white", padding: "20px", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", borderLeft: `6px solid ${color}` }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <p style={{ margin: 0, fontSize: "11px", color: "#888", fontWeight: "bold", textTransform: "uppercase" }}>{title}</p>
        <h2 style={{ margin: "5px 0 0 0", color: color, fontSize: "20px" }}>{value}</h2>
      </div>
      <div style={{ color: color, fontSize: "24px", opacity: 0.5 }}>{icon}</div>
    </div>
  </div>
);

const dateInputStyle = { border: "none", outline: "none", fontSize: "14px", color: "#333", cursor: "pointer" };
const searchBtnStyle = (colors) => ({
  background: colors.brown, color: "white", border: "none", padding: "8px 15px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", marginLeft: "10px"
});
const tableHeader = { padding: "15px", fontSize: "13px", color: "#5d4037", fontWeight: "bold" };
const tableCell = { padding: "15px", fontSize: "14px" };

export default Reports;