import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  FaUniversity, FaUserTie, FaPhoneAlt, FaSearch, FaCrown, 
  FaBuilding, FaTrash, FaEdit, FaChevronLeft, FaChevronRight,
  FaSpinner
} from "react-icons/fa";
import BASE_URL from './apiConfig';

export default function SupplierMaster() {
  const API_URL = `${BASE_URL}/suppliers_api.php`;

  // --- States ---
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const initialForm = { 
    id: "", firm_name: "", contact_person: "", phone: "", 
    gst_no: "", bank_name: "", account_no: "", ifsc_code: "", address: "" 
  };
  const [form, setForm] = useState(initialForm);

  // --- Load Data ---
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?action=get_all`);
      setSuppliers(res.data || []);
    } catch (err) { console.error("API Error"); }
    setLoading(false);
  }, [API_URL]);

  useEffect(() => { loadData(); }, [loadData]);

  // --- Save / Update ---
  const handleSave = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      const res = await axios.post(`${API_URL}?action=save`, form);
      if (res.data.status === "success") {
        setForm(initialForm);
        loadData();
      }
    } catch (err) { alert("Save failed"); }
    setBtnLoading(false);
  };

  // --- Delete ---
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this supplier?")) {
      await axios.get(`${API_URL}?action=delete&id=${id}`);
      loadData();
    }
  };

  // --- Filter & Pagination Logic ---
  const filtered = suppliers.filter(s => 
    s.firm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact_person.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="royal-page">
      <div className="royal-container">
        
        <header className="royal-header">
          <FaCrown className="crown-icon" />
          <h1>Supplier Master</h1>
          <p>Manage Business Partners & Banking Details</p>
          <div className="gold-line"></div>
        </header>

        <div className="royal-grid">
          
          {/* LEFT: FORM SECTION */}
          <section className="royal-card form-panel">
            <div className="card-top">
              <h3>{form.id ? "Edit Supplier" : "Register New Firm"}</h3>
            </div>
            
            <form onSubmit={handleSave} className="royal-form">
              <div className="form-section-label"><FaBuilding /> FIRM DETAILS</div>
              
              <div className="field-group">
                <label>Firm Name *</label>
                <input type="text" value={form.firm_name} onChange={e => setForm({...form, firm_name: e.target.value})} required placeholder="e.g. Laxmi Gold Refinery" />
              </div>

              <div className="flex-row">
                <div className="field-group">
                  <label>Contact Person</label>
                  <input type="text" value={form.contact_person} onChange={e => setForm({...form, contact_person: e.target.value})} placeholder="Owner Name" />
                </div>
                <div className="field-group">
                  <label>Phone Number</label>
                  <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Mobile" />
                </div>
              </div>

              <div className="field-group">
                <label>GST Number (Optional)</label>
                <input type="text" value={form.gst_no} onChange={e => setForm({...form, gst_no: e.target.value})} placeholder="08AAAAA0000A1Z5" />
              </div>

              <div className="form-section-label mt-20"><FaUniversity /> BANKING INFORMATION</div>

              <div className="field-group">
                <label>Bank Name</label>
                <input type="text" value={form.bank_name} onChange={e => setForm({...form, bank_name: e.target.value})} placeholder="e.g. ICICI Bank" />
              </div>

              <div className="flex-row">
                <div className="field-group" style={{ flex: 2 }}>
                  <label>Account Number</label>
                  <input type="text" value={form.account_no} onChange={e => setForm({...form, account_no: e.target.value})} placeholder="A/c No." />
                </div>
                <div className="field-group" style={{ flex: 1 }}>
                  <label>IFSC</label>
                  <input type="text" value={form.ifsc_code} onChange={e => setForm({...form, ifsc_code: e.target.value})} placeholder="IFSC" />
                </div>
              </div>

              <button type="submit" className="royal-submit" disabled={btnLoading}>
                {btnLoading ? <FaSpinner className="spin" /> : (form.id ? "Update Record" : "Save Supplier")}
              </button>
              {form.id && <button type="button" className="cancel-btn" onClick={() => setForm(initialForm)}>Cancel Edit</button>}
            </form>
          </section>

          {/* RIGHT: LIST SECTION */}
          <section className="royal-card list-panel">
            <div className="card-top">
              <div className="search-box">
                <FaSearch />
                <input 
                  placeholder="Search by Firm or Contact..." 
                  value={searchTerm}
                  onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                />
              </div>
            </div>

            <div className="table-container">
              {loading ? (
                <div className="loader"><FaSpinner className="spin" /> <p>Fetching Dealers...</p></div>
              ) : (
                <>
                <table className="royal-table">
                  <thead>
                    <tr>
                      <th>Firm Details</th>
                      <th>Banking Info</th>
                      <th className="text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? currentItems.map(s => (
                      <tr key={s.id}>
                        <td>
                          <div className="firm-name">{s.firm_name}</div>
                          <div className="firm-sub">
                            <FaUserTie size={10}/> {s.contact_person || 'N/A'} • <FaPhoneAlt size={10}/> {s.phone}
                          </div>
                          {s.gst_no && <div className="gst-badge">GST: {s.gst_no}</div>}
                        </td>
                        <td>
                          <div className="bank-info">
                            <strong>{s.bank_name || 'No Bank Info'}</strong>
                            <span>{s.account_no && `A/c: ${s.account_no}`}</span>
                            <small>{s.ifsc_code && `IFSC: ${s.ifsc_code}`}</small>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="action-btns">
                            <button className="btn-edit" onClick={() => {setForm(s); window.scrollTo({top:0, behavior:'smooth'})}}><FaEdit /></button>
                            <button className="btn-delete" onClick={() => handleDelete(s.id)}><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="3" className="no-data">No suppliers found.</td></tr>
                    )}
                  </tbody>
                </table>

                <div className="pagination">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><FaChevronLeft /></button>
                  <span>Page {currentPage} of {totalPages || 1}</span>
                  <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}><FaChevronRight /></button>
                </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .royal-page { background: #fdfaf2; min-height: 100vh; padding: 40px 20px; font-family: 'Inter', sans-serif; }
        .royal-container { max-width: 1300px; margin: 0 auto; }
        .royal-header { text-align: center; margin-bottom: 40px; }
        .crown-icon { font-size: 40px; color: #D4AF37; margin-bottom: 10px; }
        .royal-header h1 { font-family: 'Playfair Display', serif; font-size: 36px; color: #2C1E16; margin: 0; }
        .gold-line { height: 4px; width: 70px; background: #D4AF37; margin: 15px auto; border-radius: 10px; }

        .royal-grid { display: grid; grid-template-columns: 420px 1fr; gap: 30px; align-items: start; }
        .royal-card { background: #fff; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.06); overflow: hidden; border: 1px solid #e0e0e0; }
        
        .card-top { background: #2C1E16; padding: 18px 25px; color: #D4AF37; }
        .card-top h3 { margin: 0; font-size: 15px; letter-spacing: 1px; text-transform: uppercase; }

        .royal-form { padding: 30px; }
        .form-section-label { font-size: 12px; font-weight: 800; color: #D4AF37; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
        .mt-20 { margin-top: 25px; }

        .field-group { margin-bottom: 18px; }
        .field-group label { display: block; font-size: 13px; font-weight: 600; color: #555; margin-bottom: 6px; }
        .field-group input { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd; outline: none; transition: 0.3s; }
        .field-group input:focus { border-color: #D4AF37; box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1); }
        .flex-row { display: flex; gap: 15px; }

        .royal-submit { width: 100%; padding: 15px; background: #D4AF37; color: #fff; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; margin-top: 10px; transition: 0.3s; }
        .royal-submit:hover { background: #b8860b; transform: translateY(-2px); }
        .cancel-btn { width: 100%; background: none; border: none; color: #e74c3c; cursor: pointer; margin-top: 10px; font-weight: 600; font-size: 13px; }

        .search-box { background: rgba(255,255,255,0.1); border: 1px solid #555; border-radius: 10px; display: flex; align-items: center; padding: 0 15px; }
        .search-box input { background: transparent; border: none; color: #fff; padding: 10px; width: 100%; outline: none; }
        .search-box input::placeholder { color: #aaa; }

        .table-container { padding: 20px; min-height: 450px; }
        .royal-table { width: 100%; border-collapse: collapse; }
        .royal-table th { text-align: left; padding: 15px; color: #888; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #f5f5f5; }
        .royal-table td { padding: 20px 15px; border-bottom: 1px solid #f9f9f9; }

        .firm-name { font-weight: 800; color: #2C1E16; font-size: 16px; }
        .firm-sub { font-size: 12px; color: #777; margin: 4px 0; }
        .gst-badge { display: inline-block; background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; color: #555; }

        .bank-info { display: flex; flex-direction: column; gap: 2px; }
        .bank-info strong { font-size: 13px; color: #D4AF37; }
        .bank-info span { font-size: 12px; color: #555; }
        .bank-info small { font-size: 11px; color: #aaa; }

        .action-btns { display: flex; gap: 10px; justify-content: center; }
        .action-btns button { border: none; padding: 10px; border-radius: 10px; cursor: pointer; transition: 0.2s; }
        .btn-edit { background: #e3f2fd; color: #1976d2; }
        .btn-delete { background: #ffebee; color: #d32f2f; }
        .action-btns button:hover { transform: scale(1.1); }

        .pagination { display: flex; justify-content: center; align-items: center; gap: 20px; padding: 30px 0; }
        .pagination button { background: #fff; border: 1px solid #D4AF37; color: #D4AF37; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; }
        .pagination button:disabled { opacity: 0.3; cursor: not-allowed; }
        .pagination button:hover:not(:disabled) { background: #D4AF37; color: #fff; }
        .pagination span { font-weight: 700; font-size: 13px; color: #2C1E16; }

        .loader { text-align: center; padding: 50px; color: #D4AF37; }
        .spin { animation: rotate 1s linear infinite; font-size: 30px; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        @media (max-width: 1000px) { .royal-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}