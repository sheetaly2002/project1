import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  FaBoxOpen, FaTrash, FaEdit, FaSearch, FaSpinner, FaCrown, 
  FaChevronLeft, FaChevronRight, FaGem, FaExclamationCircle, FaCheckCircle 
} from "react-icons/fa";
import BASE_URL from './apiConfig';

export default function ProductMaster() {
  const API_URL = `${BASE_URL}/products_api.php`;
  const CAT_URL = `${BASE_URL}/categories_api.php`;

  // --- States ---
  const [products, setProducts] = useState([]);
  const [mainCats, setMainCats] = useState([]); // Gold, Silver etc.
  const [subCats, setSubCats] = useState([]);   // Rings, Chains etc.
  const [filteredSubByMetal, setFilteredSubByMetal] = useState([]); // Form dependency
  
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [form, setForm] = useState({ 
    id: "", 
    metal_id: "", 
    sub_cat_id: "", 
    product_name: "", 
    hsn_code: "7113" 
  });

  // Status Handler
  const showStatus = (type, msg) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus({ type: "", msg: "" }), 4000);
  };

  // 1. Data Loading
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resProd, resMain, resSub] = await Promise.all([
        axios.get(`${API_URL}?action=get_all`),
        axios.get(`${CAT_URL}?action=get_main`),
        axios.get(`${CAT_URL}?action=get_all_sub`)
      ]);
      setProducts(resProd.data || []);
      setMainCats(resMain.data || []);
      setSubCats(resSub.data || []);
    } catch (err) { 
      showStatus("error", "Server connectivity issue!"); 
    } finally {
      setLoading(false);
    }
  }, [API_URL, CAT_URL]);

  useEffect(() => { loadData(); }, [loadData]);

  // 2. Smart Logic: Metal change hone par Sub-Category Filter karna
  useEffect(() => {
    if (form.metal_id) {
      const filtered = subCats.filter(s => s.main_cat_id.toString() === form.metal_id.toString());
      setFilteredSubByMetal(filtered);
    } else {
      setFilteredSubByMetal([]);
    }
  }, [form.metal_id, subCats]);

  // 3. Save / Update Function
  const handleSave = async (e) => {
    e.preventDefault();
    if(!form.metal_id || !form.sub_cat_id || !form.product_name) {
        return showStatus("error", "Please fill all required fields!");
    }
    setBtnLoading(true);
    try {
      const res = await axios.post(`${API_URL}?action=save`, form);
      if (res.data.status === "success") {
        showStatus("success", form.id ? "Design updated!" : "Design registered!");
        resetForm();
        loadData();
      }
    } catch (err) { 
      showStatus("error", "Failed to save record."); 
    } finally {
      setBtnLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ id: "", metal_id: "", sub_cat_id: "", product_name: "", hsn_code: "7113" });
  };

  const handleEdit = (p) => {
    setForm({
      id: p.id,
      metal_id: p.main_cat_id || "", 
      sub_cat_id: p.sub_cat_id,
      product_name: p.product_name,
      hsn_code: p.hsn_code
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this design?")) {
      try {
        const res = await axios.get(`${API_URL}?action=delete&id=${id}`);
        if(res.data.status === "success") {
            showStatus("success", "Item removed.");
            loadData();
        }
      } catch (err) { showStatus("error", "Delete failed."); }
    }
  };

  // 4. Search & Pagination logic
  const filteredProducts = products.filter(p => 
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.product_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="royal-page">
      <div className="royal-container">
        
        {/* Status Alerts */}
        {status.msg && (
          <div className={`royal-alert ${status.type}`}>
            {status.type === "error" ? <FaExclamationCircle /> : <FaCheckCircle />}
            {status.msg}
          </div>
        )}

        <header className="royal-header">
          <FaCrown className="crown-icon" />
          <h1>Product Design Master</h1>
          <p>Manage your jewellery designs and models</p>
          <div className="gold-line"></div>
        </header>

        <div className="royal-grid">
          
          {/* LEFT: ENTRY FORM */}
          <section className="royal-card form-panel">
            <div className="card-top">
              <h3>{form.id ? "Update Design" : "New Design Entry"}</h3>
            </div>
            
            <form onSubmit={handleSave} className="royal-form">
              <div className="field-group">
                <label>Metal Type (Gold/Silver)</label>
                <select 
                  value={form.metal_id} 
                  onChange={e => setForm({...form, metal_id: e.target.value, sub_cat_id: ""})}
                >
                  <option value="">-- Choose Metal --</option>
                  {mainCats.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>

              <div className="field-group">
                <label>Category (Ring/Chain)</label>
                <select 
                  value={form.sub_cat_id} 
                  onChange={e => setForm({...form, sub_cat_id: e.target.value})}
                  disabled={!form.metal_id}
                >
                  <option value="">{form.metal_id ? "-- Choose Category --" : "Select Metal First"}</option>
                  {filteredSubByMetal.map(s => <option key={s.id} value={s.id}>{s.sub_name}</option>)}
                </select>
              </div>

              <div className="field-group">
                <label>Design/Product Name</label>
                <input 
                  type="text" 
                  value={form.product_name} 
                  onChange={e => setForm({...form, product_name: e.target.value})}
                  placeholder="e.g. Handmade Bangles"
                />
              </div>

              <div className="field-group">
                <label>HSN Code (Jewellery Default)</label>
                <input 
                  type="text" 
                  value={form.hsn_code} 
                  onChange={e => setForm({...form, hsn_code: e.target.value})}
                />
              </div>

              <button type="submit" className="royal-submit" disabled={btnLoading}>
                {btnLoading ? <FaSpinner className="spin" /> : form.id ? "Update Design" : "Save Design"}
              </button>
              
              {form.id && (
                <button type="button" className="back-link" onClick={resetForm}>
                  Cancel & Add New
                </button>
              )}
            </form>
          </section>

          {/* RIGHT: DATA TABLE */}
          <section className="royal-card list-panel">
            <div className="card-top">
              <div className="search-input">
                <FaSearch />
                <input 
                  placeholder="Search code or design..." 
                  value={searchTerm}
                  onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                />
              </div>
            </div>

            <div className="scrollable-table">
              {loading ? (
                <div className="loader-box"><FaSpinner className="spin" /> <p>Loading Gallery...</p></div>
              ) : (
                <>
                <table className="royal-table">
                  <thead>
                    <tr>
                      <th>Serial</th>
                      <th>Category</th>
                      <th>Design Details</th>
                      <th className="text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? currentItems.map(p => (
                      <tr key={p.id}>
                        <td><span className="gold-pill">{p.product_code}</span></td>
                        <td>
                          <small className="metal-label">{p.metal_name}</small> <br/>
                          <span className="cat-label">{p.category_name}</span>
                        </td>
                        <td>
                          <div className="design-cell">
                            <FaGem className="gem-icon" />
                            <span>{p.product_name}</span>
                          </div>
                          <small className="hsn-label">HSN: {p.hsn_code}</small>
                        </td>
                        <td className="text-center actions-cell">
                          <button className="icon-btn edit" onClick={() => handleEdit(p)}><FaEdit /></button>
                          <button className="icon-btn delete" onClick={() => handleDelete(p.id)}><FaTrash /></button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="no-data">No designs found.</td></tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="pagination">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}><FaChevronLeft /></button>
                  <span>Page {currentPage} / {totalPages || 1}</span>
                  <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)}><FaChevronRight /></button>
                </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .royal-page { background: #fdfbf7; min-height: 100vh; padding: 40px 20px; font-family: 'Poppins', sans-serif; }
        .royal-container { max-width: 1200px; margin: 0 auto; position: relative; }
        
        .royal-header { text-align: center; margin-bottom: 40px; }
        .royal-header h1 { font-family: 'Playfair Display', serif; color: #3C2A21; font-size: 32px; margin: 0; }
        .royal-header p { color: #888; font-size: 14px; margin-top: 5px; }
        .crown-icon { font-size: 35px; color: #D4AF37; margin-bottom: 10px; }
        .gold-line { height: 3px; width: 60px; background: #D4AF37; margin: 15px auto; border-radius: 10px; }

        .royal-grid { display: grid; grid-template-columns: 350px 1fr; gap: 30px; align-items: start; }
        .royal-card { background: white; border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.05); border: 1px solid #eee; overflow: hidden; }
        
        .card-top { background: #3C2A21; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; }
        .card-top h3 { color: #D4AF37; margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }

        .royal-form { padding: 25px; }
        .field-group { margin-bottom: 20px; }
        .field-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #555; }
        
        input, select { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid #ddd; outline: none; transition: 0.3s; font-size: 14px; }
        input:focus, select:focus { border-color: #D4AF37; box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1); }
        select:disabled { background: #f9f9f9; cursor: not-allowed; }

        .royal-submit { width: 100%; padding: 14px; background: #D4AF37; color: white; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.3s; font-size: 15px; }
        .royal-submit:hover { background: #B8860B; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(184, 134, 11, 0.3); }

        .search-input { display: flex; align-items: center; background: rgba(255,255,255,0.1); padding: 5px 15px; border-radius: 10px; color: #D4AF37; flex: 1; border: 1px solid #555; }
        .search-input input { background: transparent; border: none; color: white; font-size: 14px; padding: 8px; }
        .search-input input::placeholder { color: #888; }

        .scrollable-table { padding: 20px; min-height: 400px; }
        .royal-table { width: 100%; border-collapse: collapse; }
        .royal-table th { text-align: left; font-size: 12px; color: #999; text-transform: uppercase; padding: 15px 10px; border-bottom: 2px solid #f8f8f8; }
        .royal-table td { padding: 15px 10px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
        
        .gold-pill { background: #3C2A21; color: #D4AF37; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 11px; }
        .metal-label { font-size: 10px; color: #B8860B; font-weight: bold; text-transform: uppercase; }
        .cat-label { font-weight: 600; color: #333; }
        .design-cell { display: flex; align-items: center; gap: 8px; font-weight: 500; }
        .gem-icon { color: #D4AF37; font-size: 12px; }
        .hsn-label { color: #aaa; font-size: 11px; }

        .actions-cell { display: flex; gap: 10px; justify-content: center; }
        .icon-btn { border: none; padding: 10px; border-radius: 10px; cursor: pointer; transition: 0.2s; font-size: 14px; }
        .icon-btn.edit { background: #EBF8FF; color: #3182CE; }
        .icon-btn.delete { background: #FFF5F5; color: #C53030; }
        .icon-btn:hover { transform: scale(1.1); }

        .pagination { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 30px; }
        .pagination button { background: white; border: 1px solid #D4AF37; color: #D4AF37; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
        .pagination button:disabled { opacity: 0.3; cursor: not-allowed; border-color: #ddd; color: #ddd; }
        .pagination button:hover:not(:disabled) { background: #D4AF37; color: white; }
        .pagination span { font-weight: bold; font-size: 13px; color: #3C2A21; }

        .royal-alert { position: fixed; top: 30px; right: 30px; z-index: 1000; padding: 15px 25px; border-radius: 12px; display: flex; align-items: center; gap: 12px; font-weight: bold; box-shadow: 0 10px 30px rgba(0,0,0,0.15); animation: slideIn 0.3s ease-out; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .royal-alert.success { background: #C6F6D5; color: #22543D; border-left: 5px solid #48BB78; }
        .royal-alert.error { background: #FED7D7; color: #822727; border-left: 5px solid #F56565; }

        .loader-box { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; color: #D4AF37; }
        .back-link { background: none; border: none; color: #C53030; font-size: 12px; margin-top: 15px; cursor: pointer; text-decoration: underline; width: 100%; }
        .spin { animation: spin 1s linear infinite; font-size: 24px; margin-bottom: 10px; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 900px) { .royal-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}