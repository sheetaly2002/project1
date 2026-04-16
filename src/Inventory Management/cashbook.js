import React, { useState, useEffect } from "react";
import { FaTrash, FaWallet, FaArrowUp, FaArrowDown, FaEdit, FaTimes } from "react-icons/fa";
import BASE_URLS from './apiConfig';

const BASE_URL = `${BASE_URLS}`;

const CashBook = () => {
  const [entries, setEntries] = useState([]);
  const [isEditing, setIsEditing] = useState(false); // Edit mode track karne ke liye
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: "",
    description: "",
    type: "OUT",
    amount: ""
  });

  const fetchCashBook = async () => {
    try {
      const res = await fetch(`${BASE_URL}/cashbook.php`);
      const data = await res.json();
      if (data.status === "success") setEntries(data.data);
    } catch (err) { console.error("Error fetching cashbook", err); }
  };

  useEffect(() => { fetchCashBook(); }, []);

  // Form Submit (Handle both Add and Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? "PUT" : "POST"; // Agar editing hai toh PUT request jayegi
    const payload = isEditing ? { ...formData, id: editId } : formData;

    try {
      const res = await fetch(`${BASE_URL}/cashbook.php`, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === "success") {
        alert(isEditing ? "Entry Updated!" : "Entry Saved!");
        resetForm();
        fetchCashBook();
      }
    } catch (err) { alert("Error saving data"); }
  };

  // Edit button par click karne ka function
  const handleEdit = (entry) => {
    setIsEditing(true);
    setEditId(entry.id);
    setFormData({
      date: entry.date,
      category: entry.category,
      description: entry.description,
      type: entry.type,
      amount: entry.amount
    });
    window.scrollTo(0, 0); // Form upar hota hai isliye scroll up
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: "",
      description: "",
      type: "OUT",
      amount: ""
    });
  };

  const deleteEntry = async (id) => {
    if (!window.confirm("Khatam karein?")) return;
    await fetch(`${BASE_URL}/cashbook.php`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    fetchCashBook();
  };

  const totalIn = entries.reduce((acc, curr) => curr.type === "IN" ? acc + parseFloat(curr.amount) : acc, 0);
  const totalOut = entries.reduce((acc, curr) => curr.type === "OUT" ? acc + parseFloat(curr.amount) : acc, 0);
  const balance = totalIn - totalOut;

  const colors = { gold: "#ad8b73", brown: "#5d4037", pink: "#fce4ec", green: "#2e7d32", red: "#d32f2f" };

  return (
    <div style={{ padding: "10px" }}>
      <h2 style={{ color: colors.brown, marginBottom: "20px" }}><FaWallet /> Daily Cash Book</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <StatCard title="Total Cash IN" value={`₹${totalIn.toLocaleString()}`} icon={<FaArrowUp />} color={colors.green} />
        <StatCard title="Total Cash OUT" value={`₹${totalOut.toLocaleString()}`} icon={<FaArrowDown />} color={colors.red} />
        <StatCard title="Cash in Hand" value={`₹${balance.toLocaleString()}`} icon={<FaWallet />} color={colors.gold} />
      </div>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, color: colors.brown }}>{isEditing ? "Entry Sudharein" : "Nayi Entry Karein"}</h4>
            {isEditing && <button onClick={resetForm} style={{ border: 'none', background: 'none', color: colors.red, cursor: 'pointer' }}><FaTimes /> Cancel</button>}
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: '15px' }}>
            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={inputStyle} required />
            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={inputStyle}>
              <option value="OUT">Paisa Gaya (OUT)</option>
              <option value="IN">Paisa Aaya (IN)</option>
            </select>
            <input type="text" placeholder="Category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={inputStyle} required />
            <input type="number" placeholder="Amount (₹)" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} style={inputStyle} required />
            <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={inputStyle} />
            <button type="submit" style={btnStyle(isEditing ? colors.gold : colors.brown)}>
              {isEditing ? "Update Entry" : "Save Entry"}
            </button>
          </form>
        </div>

        <div style={{ ...cardStyle, flex: 2 }}>
          <h4 style={{ marginTop: 0, color: colors.brown }}>Recent Transactions</h4>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: `2px solid ${colors.pink}` }}>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: "1px solid #f9f9f9" }}>
                    <td style={tdStyle}>{entry.date}</td>
                    <td style={tdStyle}><b>{entry.category}</b><br/><small>{entry.description}</small></td>
                    <td style={{ ...tdStyle, color: entry.type === "IN" ? colors.green : colors.red, fontWeight: 'bold' }}>{entry.type}</td>
                    <td style={tdStyle}>₹{parseFloat(entry.amount).toLocaleString()}</td>
                    <td style={tdStyle}>
                      <button onClick={() => handleEdit(entry)} style={{ border: 'none', background: 'none', color: colors.gold, cursor: 'pointer', marginRight: '10px' }}><FaEdit /></button>
                      <button onClick={() => deleteEntry(entry.id)} style={{ border: 'none', background: 'none', color: colors.red, cursor: 'pointer' }}><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ... Styles (Puraane waale hi rahenge)
const StatCard = ({ title, value, icon, color }) => (
    <div style={{ background: "white", padding: "20px", borderRadius: "15px", borderLeft: `6px solid ${color}`, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ margin: 0, fontSize: "12px", color: "#888", fontWeight: "bold" }}>{title}</p>
          <h2 style={{ margin: "5px 0 0 0", color: "#333" }}>{value}</h2>
        </div>
        <div style={{ color: color, fontSize: "25px" }}>{icon}</div>
      </div>
    </div>
  );
  
  const cardStyle = { background: "white", padding: "20px", borderRadius: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", minWidth: "300px" };
  const inputStyle = { padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" };
  const btnStyle = (color) => ({ background: color, color: "white", border: "none", padding: "12px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" });
  const thStyle = { padding: "12px", fontSize: "13px", color: "#888" };
  const tdStyle = { padding: "12px", fontSize: "14px" };

export default CashBook;