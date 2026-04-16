import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  FaTrash, FaCrown, FaSpinner, FaFilter, FaEdit,
  FaGem, FaExclamationCircle, FaCheckCircle, FaSearch, FaChevronLeft, FaChevronRight 
} from "react-icons/fa";
import BASE_URL from './apiConfig';

export default function CategoryPage() {
  const API_URL = `${BASE_URL}/categories_api.php`;

  // --- States ---
  const [mainCats, setMainCats] = useState([]);
  const [subCats, setSubCats] = useState([]);
  const [filteredSubCats, setFilteredSubCats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });
  
  const [isAddingMetal, setIsAddingMetal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({ id: "", main_cat_id: "", sub_name: "" });
  const [newMetal, setNewMetal] = useState("");

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  const showStatus = (type, msg) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus({ type: "", msg: "" }), 4000);
  };

  // 1. Data Load Function
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resMain, resSub] = await Promise.all([
        axios.get(`${API_URL}?action=get_main`),
        axios.get(`${API_URL}?action=get_all_sub`)
      ]);
      setMainCats(resMain.data || []);
      setSubCats(resSub.data || []);
      setFilteredSubCats(resSub.data || []);
    } catch (err) {
      showStatus("error", "Database connection fail!");
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => { loadData(); }, [loadData]);

  // 2. Search aur Filter Logic
  useEffect(() => {
    let result = subCats;
    if (filter !== "all") {
      result = result.filter(s => s.main_cat_id.toString() === filter.toString());
    }
    if (searchTerm) {
      result = result.filter(s => s.sub_name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredSubCats(result);
    setCurrentPage(1); 
  }, [filter, searchTerm, subCats]);

  // 3. Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubCats.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSubCats.length / itemsPerPage);

  // 4. Save/Update Function
  const handleSave = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      let res;
      if (isAddingMetal) {
        if(!newMetal) return showStatus("error", "Metal name empty!");
        res = await axios.post(`${API_URL}?action=add_main`, { name: newMetal });
      } else {
        if(!form.main_cat_id || !form.sub_name) return showStatus("error", "Fields empty!");
        // save_sub handles both Insert and Update in PHP
        res = await axios.post(`${API_URL}?action=save_sub`, form);
      }

      if (res.data.status === "success") {
        showStatus("success", "Done!");
        resetForm();
        loadData();
      }
    } catch (err) {
      showStatus("error", "Operation failed!");
    } finally {
      setBtnLoading(false);
    }
  };

  // 5. Edit Button click
  const handleEdit = (item) => {
    setForm({ id: item.id, main_cat_id: item.main_cat_id, sub_name: item.sub_name });
    setIsEditing(true);
    setIsAddingMetal(false);
  };

  const resetForm = () => {
    setForm({ id: "", main_cat_id: "", sub_name: "" });
    setNewMetal("");
    setIsAddingMetal(false);
    setIsEditing(false);
  };

  // 6. Delete Function
  const handleDelete = async (id) => {
    if (window.confirm("Delete permanent?")) {
      try {
        const res = await axios.get(`${API_URL}?action=delete_sub&id=${id}`);
        if(res.data.status === "success") {
          showStatus("success", "Deleted!");
          loadData();
        }
      } catch (err) { showStatus("error", "Error deleting!"); }
    }
  };

  return (
    <div className="royal-page">
      <div className="royal-container">
        
        {/* Alert Box */}
        {status.msg && (
          <div className={`royal-alert ${status.type}`}>
            {status.type === "error" ? <FaExclamationCircle /> : <FaCheckCircle />}
            {status.msg}
          </div>
        )}

        <header className="royal-header">
          <FaCrown className="crown-icon" />
          <h1>Jewellery Master Control</h1>
          <div className="gold-line"></div>
        </header>

        <div className="royal-grid">
          
          {/* LEFT: FORM SECTION */}
          <section className="royal-card form-panel">
            <div className="card-top">
              <h3>{isAddingMetal ? "New Metal Type" : isEditing ? "Modify Category" : "Add Sub-Category"}</h3>
            </div>
            
            <form onSubmit={handleSave} className="royal-form">
              {isAddingMetal ? (
                <div className="field-group">
                  <label>Enter Metal Name (e.g. Platinum)</label>
                  <input type="text" value={newMetal} onChange={e => setNewMetal(e.target.value)} autoFocus />
                  <button type="button" onClick={resetForm} className="back-link">Cancel</button>
                </div>
              ) : (
                <>
                  <div className="field-group">
                    <label>Select Metal Group</label>
                    <div className="flex-row">
                      <select value={form.main_cat_id} onChange={e => setForm({...form, main_cat_id: e.target.value})}>
                        <option value="">-- Choose --</option>
                        {mainCats.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                      {!isEditing && <button type="button" className="add-btn-small" onClick={() => setIsAddingMetal(true)}>+</button>}
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Category Name</label>
                    <input type="text" value={form.sub_name} onChange={e => setForm({...form, sub_name: e.target.value})} placeholder="e.g. Ring" />
                  </div>
                  {isEditing && <button type="button" onClick={resetForm} className="back-link">Cancel Edit</button>}
                </>
              )}

              <button type="submit" className="royal-submit" disabled={btnLoading}>
                {btnLoading ? <FaSpinner className="spin" /> : isEditing ? "Update Data" : "Save Data"}
              </button>
            </form>
          </section>

          {/* RIGHT: DATA LIST */}
          <section className="royal-card list-panel">
            <div className="card-top">
              <div className="filter-controls">
                <div className="search-input">
                  <FaSearch />
                  <input placeholder="Search..." onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="filter-dropdown">
                  <FaFilter />
                  <select value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="all">All Metals</option>
                    {mainCats.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="scrollable-table">
              {loading ? (
                <div className="loader-box"><FaSpinner className="spin" /></div>
              ) : (
                <>
                <table className="royal-table">
                  <thead>
                    <tr>
                      <th>Metal</th>
                      <th>Category</th>
                      <th className="text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? currentItems.map(item => (
                      <tr key={item.id}>
                        <td><span className="gold-pill">{item.main_cat_name}</span></td>
                        <td className="sub-name"><FaGem className="gem-icon" /> {item.sub_name}</td>
                        <td className="text-center actions-cell">
                          <button className="icon-btn edit" onClick={() => handleEdit(item)}><FaEdit /></button>
                          <button className="icon-btn delete" onClick={() => handleDelete(item.id)}><FaTrash /></button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="3" className="no-data">Data Not Found</td></tr>
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
        .royal-page { background: #f8f6f0; min-height: 100vh; padding: 30px; font-family: sans-serif; }
        .royal-container { max-width: 1100px; margin: 0 auto; position: relative; }
        .royal-header { text-align: center; margin-bottom: 30px; }
        .crown-icon { font-size: 30px; color: #D4AF37; }
        .gold-line { height: 2px; width: 50px; background: #D4AF37; margin: 10px auto; }

        .royal-grid { display: grid; grid-template-columns: 320px 1fr; gap: 20px; }
        .royal-card { background: white; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #ddd; }
        
        .card-top { background: #3C2A21; padding: 12px 20px; color: #D4AF37; display: flex; justify-content: space-between; align-items: center; }
        .card-top h3 { margin: 0; font-size: 13px; text-transform: uppercase; }

        .royal-form { padding: 20px; }
        .field-group { margin-bottom: 15px; }
        .field-group label { display: block; font-size: 12px; font-weight: bold; margin-bottom: 5px; color: #555; }
        input, select { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ccc; outline: none; }
        
        .flex-row { display: flex; gap: 5px; }
        .add-btn-small { background: #D4AF37; color: white; border: none; width: 40px; border-radius: 8px; cursor: pointer; }
        
        .royal-submit { width: 100%; padding: 12px; background: #D4AF37; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
        .royal-submit:hover { background: #B8860B; }

        .filter-controls { display: flex; gap: 10px; width: 100%; }
        .search-input, .filter-dropdown { display: flex; align-items: center; background: rgba(255,255,255,0.1); padding: 2px 10px; border-radius: 5px; border: 1px solid #555; flex: 1; }
        .search-input input, .filter-dropdown select { background: transparent; border: none; color: white; font-size: 11px; }

        .scrollable-table { padding: 15px; }
        .royal-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .royal-table th { text-align: left; padding: 10px; border-bottom: 2px solid #f0f0f0; color: #888; }
        .royal-table td { padding: 12px 10px; border-bottom: 1px solid #eee; }
        
        .gold-pill { background: #FFF9E6; color: #B8860B; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
        .actions-cell { display: flex; gap: 8px; justify-content: center; }
        
        .icon-btn { border: none; padding: 6px; border-radius: 6px; cursor: pointer; }
        .icon-btn.edit { background: #E3F2FD; color: #1976D2; }
        .icon-btn.delete { background: #FFEBEE; color: #D32F2F; }

        .pagination { display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 15px; font-size: 12px; }
        .pagination button { background: none; border: 1px solid #D4AF37; color: #D4AF37; padding: 5px; border-radius: 4px; cursor: pointer; }
        .pagination button:disabled { opacity: 0.3; }

        .royal-alert { position: fixed; top: 20px; right: 20px; padding: 12px 20px; border-radius: 8px; color: white; z-index: 1000; font-weight: bold; display: flex; align-items: center; gap: 10px; }
        .royal-alert.success { background: #4CAF50; }
        .royal-alert.error { background: #F44336; }

        .back-link { background: none; border: none; color: #D4AF37; font-size: 11px; cursor: pointer; text-decoration: underline; margin-bottom: 10px; display: block; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}