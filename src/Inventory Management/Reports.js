import React, { useState, useEffect } from "react";
import axios from 'axios';
import { FaArrowUp, FaArrowDown, FaMoneyBillWave, FaChartBar, FaCalendarAlt, FaSearch, FaExclamationTriangle, FaFileInvoice, FaSpinner } from "react-icons/fa";
import BASE_URLS from './apiConfig';

const BASE_URL = `${BASE_URLS}`;

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Set default date range to last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const [fromDate, setFromDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(today.toISOString().split('T')[0]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${BASE_URL}/sales_api.php`);
      
      // sales_api.php returns array directly, not wrapped in object
      const allSales = Array.isArray(response.data) ? response.data : [];
      
      // Filter by date range
      const filtered = allSales.filter(sale => {
        const saleDate = sale.created_at ? sale.created_at.split(' ')[0] : sale.sale_date;
        return saleDate >= fromDate && saleDate <= toDate;
      });
      
      setSalesData(filtered);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load sales data. Please try again.');
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // --- Calculations ---
  const totalSales = salesData.reduce((acc, sale) => acc + parseFloat(sale.final_amount || 0), 0);
  
  // Profit calculation from total_profit column
  const totalProfit = salesData.reduce((acc, sale) => {
    const profit = parseFloat(sale.total_profit || 0);
    return profit > 0 ? acc + profit : acc;
  }, 0);

  // Loss calculation
  const totalLoss = salesData.reduce((acc, sale) => {
    const profit = parseFloat(sale.total_profit || 0);
    return profit < 0 ? acc + Math.abs(profit) : acc;
  }, 0);

  const totalBills = salesData.length;
  
  // Average bill value
  const avgBillValue = totalBills > 0 ? totalSales / totalBills : 0;

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
    <div style={{ padding: isMobile ? "5px" : "10px" }}>
      {/* --- Header & Date Filter --- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "15px" }}>
        <h2 style={{ color: colors.brown, margin: 0, fontSize: isMobile ? "18px" : "24px" }}>Business Analytics</h2>
        
        <div style={{ display: "flex", gap: "10px", alignItems: "center", background: "white", padding: isMobile ? "8px" : "10px", borderRadius: "10px", border: `1px solid ${colors.pink}`, flexWrap: "wrap" }}>
          <FaCalendarAlt style={{ color: colors.gold }} />
          <input 
            type="date" 
            value={fromDate} 
            onChange={(e) => setFromDate(e.target.value)} 
            style={{...dateInputStyle, fontSize: isMobile ? "12px" : "14px"}} 
          />
          <span>to</span>
          <input 
            type="date" 
            value={toDate} 
            onChange={(e) => setToDate(e.target.value)} 
            style={{...dateInputStyle, fontSize: isMobile ? "12px" : "14px"}} 
          />
          <button 
            onClick={fetchReports} 
            style={searchBtnStyle(colors)}
            disabled={loading}
          >
            {loading ? <FaSpinner className="spin" /> : <FaSearch />} 
            {loading ? "Loading..." : "Get Report"}
          </button>
        </div>
      </div>
      
      {/* --- Quick Stats Header --- */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
        <StatCard title="Total Revenue" value={`₹${totalSales.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} icon={<FaMoneyBillWave />} color="#4caf50" />
        
        {/* Profit Card */}
        <StatCard title="Total Profit" value={`₹${totalProfit.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} icon={<FaArrowUp />} color={colors.profit} />
        
        {/* Loss Card */}
        <StatCard 
            title="Total Loss" 
            value={totalLoss > 0 ? `₹${totalLoss.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : "No Loss"} 
            icon={totalLoss > 0 ? <FaArrowDown /> : <FaExclamationTriangle />} 
            color={totalLoss > 0 ? colors.loss : colors.gray} 
        />
        
        <StatCard title="Total Invoices" value={totalBills.toString()} icon={<FaFileInvoice />} color={colors.brown} />
      </div>

      {error && (
        <div style={{ background: "#ffebee", color: "#c62828", padding: "15px", borderRadius: "10px", marginBottom: "20px", border: "1px solid #ef9a9a" }}>
          ⚠️ {error}
        </div>
      )}

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
                  const net = parseFloat(sale.total_profit || 0);
                  const saleDate = sale.created_at ? sale.created_at.split(' ')[0] : sale.sale_date;
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={tableCell}>{saleDate}</td>
                      <td style={tableCell}><b>#{sale.invoice_no || sale.id}</b></td>
                      <td style={tableCell}>{sale.customer_name || 'Walk-in'}</td>
                      <td style={tableCell}>₹{parseFloat(sale.final_amount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      
                      {/* Profit Column */}
                      <td style={{ ...tableCell, color: colors.profit, fontWeight: "bold" }}>
                         {net > 0 ? `₹${net.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : "-"}
                      </td>

                      {/* Loss Column */}
                      <td style={{ ...tableCell, color: colors.loss, fontWeight: "bold" }}>
                         {net < 0 ? `₹${Math.abs(net).toLocaleString('en-IN', {minimumFractionDigits: 2})}` : "-"}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>No sales found for this date range.</td></tr>
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
  <div style={{ background: "white", padding: "20px", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", borderLeft: `6px solid ${color}`, transition: "transform 0.2s ease" }}
    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
  >
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