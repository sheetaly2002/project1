import React, { useState, useEffect } from "react";
import { FaTools, FaTrash, FaSearch, FaClock, FaCheckCircle } from "react-icons/fa";

import BASE_URLS from './apiConfig';

const BASE_URL = `${BASE_URLS}`;

const Repairing = () => {
  const [repairs, setRepairs] = useState([]); // Default empty array
  const [customers, setCustomers] = useState([]); // Default empty array
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    customer_id: "",
    item_name: "",
    problem_details: "",
    estimated_cost: "",
    advance_taken: "",
    receive_date: new Date().toISOString().split('T')[0],
    delivery_date: "",
    status: "Pending"
  });

const fetchData = async () => {
  setLoading(true);
  try {
    // 1. Repairing Data (Ye "data" bhejta hai)
    const repRes = await fetch(`${BASE_URL}/Repairing.php`);
    const repData = await repRes.json();
    if (repData.status === "success" && Array.isArray(repData.data)) {
      setRepairs(repData.data);
    }

    // 2. Customers List (Aapki PHP file "customers" bhej rahi hai)
    const custRes = await fetch(`${BASE_URL}/customers.php`);
    const custData = await custRes.json();
    
    // DHAYAN DEIN: Yahan custData.data ki jagah custData.customers likha hai
    if (custData.status === "success" && Array.isArray(custData.customers)) {
      setCustomers(custData.customers);
    } else {
      console.error("Customers nahi mile:", custData);
      setCustomers([]);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
  setLoading(false);
};

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_id) return alert("Pehle Customer chunein!");

    try {
      const res = await fetch(`${BASE_URL}/Repairing.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.status === "success") {
        alert("Repairing Order Saved!");
        setFormData({ ...formData, item_name: "", problem_details: "", estimated_cost: "", advance_taken: "", delivery_date: "" });
        fetchData();
      }
    } catch (err) {
      alert("Save karne mein galti hui");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await fetch(`${BASE_URL}/Repairing.php`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      fetchData();
    } catch (err) {
      console.error("Update error");
    }
  };

  const colors = { gold: "#ad8b73", brown: "#5d4037", pink: "#fce4ec", red: "#d32f2f", green: "#2e7d32", orange: "#ef6c00" };

  return (
    <div style={{ padding: "10px" }}>
      <h2 style={{ color: colors.brown }}><FaTools /> Repairing Management</h2>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "20px" }}>
        
        {/* --- Left Side: Entry Form --- */}
        <div style={cardStyle}>
          <h4 style={{ marginTop: 0, color: colors.brown }}>Naya Repair Order</h4>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            
            <label style={labelStyle}>Customer Chunein</label>
            <select 
              value={formData.customer_id} 
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              style={inputStyle} required
            >
              <option value="">-- Select Customer --</option>
              {Array.isArray(customers) && customers.map(c => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.customer_name} ({c.mobile})
                </option>
              ))}
            </select>

            <input type="text" placeholder="Item (e.g. Payal/Chain)" value={formData.item_name} onChange={e => setFormData({ ...formData, item_name: e.target.value })} style={inputStyle} required />
            <textarea placeholder="Problem details..." value={formData.problem_details} onChange={e => setFormData({ ...formData, problem_details: e.target.value })} style={inputStyle} />
            
            <div style={{ display: "flex", gap: "10px" }}>
              <input type="number" placeholder="Cost" value={formData.estimated_cost} onChange={e => setFormData({ ...formData, estimated_cost: e.target.value })} style={inputStyle} />
              <input type="number" placeholder="Advance" value={formData.advance_taken} onChange={e => setFormData({ ...formData, advance_taken: e.target.value })} style={inputStyle} />
            </div>

            <label style={labelStyle}>Delivery Date</label>
            <input type="date" value={formData.delivery_date} onChange={e => setFormData({ ...formData, delivery_date: e.target.value })} style={inputStyle} required />

            <button type="submit" style={btnStyle(colors.brown)}>Save Order</button>
          </form>
        </div>

        {/* --- Right Side: List Table --- */}
        <div style={{ ...cardStyle, flex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
            <h4 style={{ margin: 0 }}>Repair List</h4>
            <div style={{ position: 'relative' }}>
               <FaSearch style={{ position: 'absolute', left: '10px', top: '10px', color: '#ccc' }} />
               <input 
                type="text" 
                placeholder="Search..." 
                style={{ ...inputStyle, paddingLeft: '35px' }} 
                onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: colors.pink }}>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Item & Problem</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Change Status</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(repairs) && repairs
                  .filter(r => 
                    r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    r.item_name?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={tdStyle}>#{r.id}</td>
                    <td style={tdStyle}>
                      <b>{r.customer_name}</b><br/><small>{r.mobile}</small>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: colors.gold, fontWeight: 'bold' }}>{r.item_name}</span><br/>
                      <small>{r.problem_details}</small>
                    </td>
                    <td style={tdStyle}>
                      <span style={statusBadge(r.status, colors)}>{r.status}</span>
                    </td>
                    <td style={tdStyle}>
                      <select 
                        value={r.status} 
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                        style={{ padding: '5px', borderRadius: '5px', fontSize: '12px' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Workshop">In Workshop</option>
                        <option value="Ready">Ready</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {repairs.length === 0 && !loading && <p style={{textAlign:'center', padding:'20px'}}>Koi data nahi mila.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Styles (Fixed) ---
const cardStyle = { background: "white", padding: "20px", borderRadius: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", minWidth: "320px" };
const inputStyle = { padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" };
const labelStyle = { fontSize: "12px", fontWeight: "bold", color: "#888", marginBottom: "-5px" };
const btnStyle = (color) => ({ background: color, color: "white", border: "none", padding: "12px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" });
const thStyle = { padding: "12px", textAlign: "left", fontSize: "13px" };
const tdStyle = { padding: "12px", fontSize: "14px" };

const statusBadge = (status, colors) => ({
  padding: "4px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "bold",
  background: status === "Pending" ? "#ffebee" : status === "Ready" ? "#e8f5e9" : "#fff3e0",
  color: status === "Pending" ? colors.red : status === "Ready" ? colors.green : colors.orange
});

export default Repairing;