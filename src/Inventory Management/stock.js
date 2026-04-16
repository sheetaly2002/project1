import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaChartLine, FaRupeeSign, FaWeightHanging, FaBoxOpen, 
  FaArrowUp, FaCrown, FaCalendarAlt, FaSync, FaChartPie
} from 'react-icons/fa'; 
import BASE_URLS from './apiConfig';

const API_BASE = `${BASE_URLS}`;

export default function Dashboard() {
  const [data, setData] = useState({
    totalSales: 0,
    totalProfit: 0,
    totalStockWeight: 0,
    stockValue: 0,
    categoryWise: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    fetchAnalytics(); 
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/dashboard_api.php`);
      setData({
        totalSales: res.data.totalSales || 0,
        totalProfit: res.data.totalProfit || 0,
        totalStockWeight: res.data.totalStockWeight || 0,
        stockValue: res.data.stockValue || 0,
        categoryWise: res.data.categoryWise || []
      });
      setLoading(false);
    } catch (err) { 
      console.error("Dashboard Error:", err); 
      setLoading(false); 
    }
  };

  if (loading) return (
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#1a1a1a', color: '#d4af37'}}>
      <h2 style={{letterSpacing: '2px'}}>SHREEJI JEWELLERS</h2>
      <div style={{width: '100px', height: '2px', background: '#d4af37', marginTop: '10px'}}></div>
    </div>
  );

  return (
    <div style={{padding: '30px', background: '#fafafa', minHeight: '100vh', fontFamily: 'Arial, sans-serif'}}>
      
      {/* --- HEADER --- */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <div>
            <div style={{background: '#1a1a1a', color: '#d4af37', display: 'inline-block', padding: '4px 12px', borderRadius: '50px', fontSize: '10px', fontWeight: 'bold', marginBottom: '8px'}}><FaCrown /> BUSINESS ADMIN</div>
            <h1 style={{margin: 0, fontSize: '28px', fontWeight: '800', color: '#1a1a1a'}}>Inventory Intelligence</h1>
        </div>
        <div style={{display: 'flex', gap: '15px'}}>
            {/* FIXED: Yahan FaSync use kiya hai FaSyncAlt ki jagah */}
            <button onClick={fetchAnalytics} style={{padding: '12px 20px', borderRadius: '12px', border: '1px solid #d4af37', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', color: '#5d4037'}}>
                <FaSync style={{color: '#d4af37'}} /> REFRESH
            </button>
            <div style={{padding: '12px 20px', borderRadius: '12px', background: '#1a1a1a', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold'}}>
                <FaCalendarAlt /> MARCH 2026
            </div>
        </div>
      </div>

      {/* --- ANALYTICS CARDS --- */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px'}}>
        
        <div style={{background: 'white', padding: '25px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderBottom: '5px solid #2e7d32'}}>
            <div style={{width: '45px', height: '45px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px'}}><FaRupeeSign size={20}/></div>
            <p style={{margin: 0, fontSize: '11px', fontWeight: 'bold', color: '#aaa', textTransform: 'uppercase'}}>Gross Revenue</p>
            <h2 style={{margin: '5px 0', fontSize: '24px', fontWeight: '900'}}>₹{parseFloat(data.totalSales).toLocaleString('en-IN')}</h2>
        </div>

        <div style={{background: '#1a1a1a', padding: '25px', borderRadius: '25px', boxShadow: '0 15px 35px rgba(0,0,0,0.2)', color: 'white'}}>
            <div style={{width: '45px', height: '45px', background: 'rgba(212,175,55,0.1)', color: '#d4af37', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px'}}><FaChartLine size={20}/></div>
            <p style={{margin: 0, fontSize: '11px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase'}}>Net Profit</p>
            <h2 style={{margin: '5px 0', fontSize: '24px', fontWeight: '900', color: '#d4af37'}}>₹{parseFloat(data.totalProfit).toLocaleString('en-IN')}</h2>
        </div>

        <div style={{background: 'white', padding: '25px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderBottom: '5px solid #5d4037'}}>
            <div style={{width: '45px', height: '45px', background: '#efebe9', color: '#5d4037', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px'}}><FaBoxOpen size={20}/></div>
            <p style={{margin: 0, fontSize: '11px', fontWeight: 'bold', color: '#aaa', textTransform: 'uppercase'}}>Stock Investment</p>
            <h2 style={{margin: '5px 0', fontSize: '24px', fontWeight: '900'}}>₹{parseFloat(data.stockValue).toLocaleString('en-IN')}</h2>
        </div>

        <div style={{background: 'white', padding: '25px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderBottom: '5px solid #d4af37'}}>
            <div style={{width: '45px', height: '45px', background: '#fffde7', color: '#d4af37', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px'}}><FaWeightHanging size={20}/></div>
            <p style={{margin: 0, fontSize: '11px', fontWeight: 'bold', color: '#aaa', textTransform: 'uppercase'}}>Current Stock Wt</p>
            <h2 style={{margin: '5px 0', fontSize: '24px', fontWeight: '900'}}>{parseFloat(data.totalStockWeight).toFixed(3)} <small style={{fontSize: '12px'}}>g</small></h2>
        </div>

      </div>

      <div style={{display: 'flex', gap: '30px', flexWrap: 'wrap'}}>
        <div style={{flex: 2, background: 'white', borderRadius: '30px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', minWidth: '400px'}}>
            <h3 style={{marginTop: 0, marginBottom: '20px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                <FaChartPie style={{color: '#d4af37'}} /> Category Distribution
            </h3>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                    <tr style={{borderBottom: '2px solid #f4ece1', textAlign: 'left'}}>
                        <th style={{padding: '15px', color: '#888', fontSize: '12px'}}>CATEGORY</th>
                        <th style={{padding: '15px', color: '#888', fontSize: '12px'}}>QUANTITY</th>
                        <th style={{padding: '15px', color: '#888', fontSize: '12px', textAlign: 'right'}}>TOTAL WEIGHT</th>
                    </tr>
                </thead>
                <tbody>
                    {data.categoryWise && data.categoryWise.map((cat, i) => (
                        <tr key={i} style={{borderBottom: '1px solid #f9f9f9'}}>
                            <td style={{padding: '18px 15px', fontWeight: 'bold'}}>{cat.category}</td>
                            <td style={{padding: '18px 15px'}}>{cat.qty} Pcs</td>
                            <td style={{padding: '18px 15px', textAlign: 'right', fontWeight: '800'}}>{parseFloat(cat.wt).toFixed(3)} g</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}