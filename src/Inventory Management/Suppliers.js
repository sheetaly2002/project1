import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaUniversity, FaUserTie, FaPhoneAlt, FaSearch, FaCrown, FaBuilding,
  FaTrash, FaEdit, FaChevronLeft, FaChevronRight, FaSpinner, FaMapMarkerAlt,
  FaIdCard, FaTimes, FaCheckCircle, FaExclamationCircle, FaPlus, FaWallet,
  FaUndo, FaFileInvoiceDollar
} from "react-icons/fa";
import BASE_URL from "./apiConfig";
import "./Suppliers.css";

const API_URL = `${BASE_URL}/suppliers_api.php`;

const initialForm = {
  id: "",
  firm_name: "",
  contact_person: "",
  phone: "",
  gst_no: "",
  opening_balance: "0",
  balance_type: "due",
  bank_name: "",
  account_no: "",
  ifsc_code: "",
  address: "",
};

const money = (v) => Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SupplierMaster() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [balanceFilter, setBalanceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const itemsPerPage = 7;

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: "", message: "" }), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?action=get_all`);
      const list = Array.isArray(res.data) ? res.data : res.data.suppliers || [];
      setSuppliers(list);
    } catch {
      showStatus("error", "Unable to load suppliers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const resetForm = () => {
    setForm(initialForm);
    setDrawerOpen(false);
  };

  const validateForm = () => {
    if (!form.firm_name.trim()) return "Supplier/Firm name is required";
    if (form.phone && !/^\d{10}$/.test(form.phone)) return "Mobile number must be 10 digits";
    if (form.gst_no && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{3}$/.test(form.gst_no)) return "Invalid GSTIN";
    if (form.ifsc_code && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc_code)) return "Invalid IFSC code";
    if (Number(form.opening_balance) < 0) return "Opening balance cannot be negative";
    return "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) return showStatus("error", validationError);

    setBtnLoading(true);
    try {
      const payload = { ...form, opening_balance: form.opening_balance === "" ? 0 : Number(form.opening_balance) };
      const res = await axios.post(`${API_URL}?action=save`, payload);
      if (res.data?.status === "success") {
        showStatus("success", res.data.message || "Supplier saved successfully");
        resetForm();
        loadData();
      } else showStatus("error", res.data?.message || "Save failed");
    } catch (error) {
      showStatus("error", error.response?.data?.message || "Server error while saving supplier");
    } finally {
      setBtnLoading(false);
    }
  };

  const openAdd = () => {
    setForm(initialForm);
    setDrawerOpen(true);
  };

  const handleEdit = (supplier) => {
    setForm({
      id: supplier.id || "",
      firm_name: supplier.firm_name || "",
      contact_person: supplier.contact_person || "",
      phone: supplier.phone || "",
      gst_no: supplier.gst_no || "",
      opening_balance: supplier.opening_balance || "0",
      balance_type: supplier.balance_type || "due",
      bank_name: supplier.bank_name || "",
      account_no: supplier.account_no || "",
      ifsc_code: supplier.ifsc_code || "",
      address: supplier.address || "",
    });
    setDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this supplier from active list?")) return;
    try {
      const res = await axios.get(`${API_URL}?action=delete&id=${id}`);
      if (res.data?.status === "success") {
        showStatus("success", "Supplier removed");
        loadData();
      } else showStatus("error", res.data?.message || "Delete failed");
    } catch {
      showStatus("error", "Server error while deleting supplier");
    }
  };

  const filteredSuppliers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return suppliers.filter((s) => {
      const matchText = !term || [s.firm_name, s.contact_person, s.phone, s.gst_no, s.bank_name, s.address]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
      const matchBalance = balanceFilter === "all" || s.balance_type === balanceFilter;
      return matchText && matchBalance;
    });
  }, [suppliers, searchTerm, balanceFilter]);

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage) || 1;
  const currentItems = filteredSuppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = useMemo(() => {
    const totalDue = suppliers.filter((s) => s.balance_type === "due").reduce((sum, s) => sum + Number(s.opening_balance || 0), 0);
    const totalAdvance = suppliers.filter((s) => s.balance_type === "advance").reduce((sum, s) => sum + Number(s.opening_balance || 0), 0);
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const newThisMonth = suppliers.filter((s) => {
      if (!s.created_at) return false;
      const d = new Date(s.created_at);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length;
    return { total: suppliers.length, totalDue, totalAdvance, newThisMonth };
  }, [suppliers]);

  return (
    <div className="supplier-page">
      {status.message && (
        <div className={`supplier-alert ${status.type}`}>
          {status.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}
          <span>{status.message}</span>
        </div>
      )}

      <div className="supplier-container">
        <header className="supplier-hero">
          <div className="supplier-hero-text">
            <div className="hero-badge"><FaCrown /> Supplier Network</div>
            <h1>Supplier Master</h1>
            <p>Manage supplier partners, GST, opening balance and bank details for future purchase entries.</p>
          </div>
          <button className="primary-action" onClick={openAdd}><FaPlus /> New Supplier</button>
        </header>

        <section className="stats-grid">
          <div className="stat-card"><FaBuilding /><span>Total Suppliers</span><strong>{stats.total}</strong></div>
          <div className="stat-card danger"><FaFileInvoiceDollar /><span>Total Due</span><strong>₹{money(stats.totalDue)}</strong></div>
          <div className="stat-card success"><FaWallet /><span>Total Advance</span><strong>₹{money(stats.totalAdvance)}</strong></div>
          <div className="stat-card"><FaUserTie /><span>New This Month</span><strong>{stats.newThisMonth}</strong></div>
        </section>

        <section className="supplier-card">
          <div className="card-toolbar">
            <div className="search-box"><FaSearch /><input value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Search firm, mobile, GSTIN, bank or address..." /></div>
            <select value={balanceFilter} onChange={(e) => { setBalanceFilter(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Balance</option>
              <option value="due">Due Only</option>
              <option value="advance">Advance Only</option>
            </select>
            <button className="refresh-btn" onClick={loadData}><FaUndo /></button>
          </div>

          {loading ? (
            <div className="empty-state"><FaSpinner className="spin" /><p>Loading suppliers...</p></div>
          ) : currentItems.length === 0 ? (
            <div className="empty-state"><FaBuilding /><p>No suppliers found.</p></div>
          ) : (
            <div className="table-wrap">
              <table className="supplier-table">
                <thead><tr><th>#</th><th>Supplier</th><th>GST / Address</th><th>Opening Balance</th><th>Bank Details</th><th>Actions</th></tr></thead>
                <tbody>
                  {currentItems.map((s, idx) => (
                    <tr key={s.id}>
                      <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td>
                        <div className="supplier-name">{s.firm_name}</div>
                        <div className="muted-line"><FaUserTie /> {s.contact_person || "N/A"}</div>
                        <div className="muted-line"><FaPhoneAlt /> {s.phone || "No mobile"}</div>
                      </td>
                      <td><div className="gst-pill"><FaIdCard /> {s.gst_no || "No GSTIN"}</div><div className="address-line"><FaMapMarkerAlt /> {s.address || "No address"}</div></td>
                      <td><div className={`balance-pill ${s.balance_type || "due"}`}><FaWallet /> ₹{money(s.opening_balance)}</div><small className="balance-type">{s.balance_type || "due"}</small></td>
                      <td><div className="bank-name"><FaUniversity /> {s.bank_name || "No bank"}</div><small>{s.account_no ? `A/c: ${s.account_no}` : ""}</small><small>{s.ifsc_code ? `IFSC: ${s.ifsc_code}` : ""}</small></td>
                      <td><div className="action-buttons"><button className="icon-button edit" onClick={() => handleEdit(s)} title="Edit"><FaEdit /></button><button className="icon-button delete" onClick={() => handleDelete(s.id)} title="Delete"><FaTrash /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pagination">
            <span>{filteredSuppliers.length} records</span>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}><FaChevronLeft /></button>
            <b>Page {currentPage} of {totalPages}</b>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}><FaChevronRight /></button>
          </div>
        </section>
      </div>

      {drawerOpen && (
        <div className="drawer-overlay">
          <aside className="supplier-drawer">
            <div className="drawer-header"><div><h2>{form.id ? "Edit Supplier" : "Register Supplier"}</h2><p>{form.id ? "Update supplier details" : "Add a new supplier partner"}</p></div><button className="close-btn" onClick={resetForm}><FaTimes /></button></div>

            <form onSubmit={handleSave} className="supplier-form">
              <div className="section-title"><FaBuilding /> Firm Details</div>
              <label>Supplier/Firm Name *</label><input required value={form.firm_name} onChange={(e) => setForm({ ...form, firm_name: e.target.value })} placeholder="e.g. Laxmi Gold Refinery" />
              <div className="two-col"><div><label>Contact Person</label><input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} placeholder="Owner / Manager" /></div><div><label>Mobile</label><input value={form.phone} maxLength="10" onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} placeholder="10-digit mobile" /></div></div>
              <label>GSTIN</label><input value={form.gst_no} maxLength="15" onChange={(e) => setForm({ ...form, gst_no: e.target.value.toUpperCase() })} placeholder="08AAAAA0000A1Z5" />
              <label>Address</label><textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Supplier address" rows="3" />

              <div className="section-title"><FaWallet /> Opening Balance</div>
              <div className="two-col"><div><label>Opening Balance</label><input type="number" min="0" step="0.01" value={form.opening_balance} onChange={(e) => setForm({ ...form, opening_balance: e.target.value })} placeholder="0.00" /></div><div><label>Balance Type</label><select value={form.balance_type} onChange={(e) => setForm({ ...form, balance_type: e.target.value })}><option value="due">Due</option><option value="advance">Advance</option></select></div></div>

              <div className="section-title"><FaUniversity /> Bank Information</div>
              <label>Bank Name</label><input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} placeholder="e.g. ICICI Bank" />
              <div className="two-col"><div><label>Account Number</label><input value={form.account_no} onChange={(e) => setForm({ ...form, account_no: e.target.value })} placeholder="A/c number" /></div><div><label>IFSC</label><input value={form.ifsc_code} maxLength="11" onChange={(e) => setForm({ ...form, ifsc_code: e.target.value.toUpperCase() })} placeholder="IFSC" /></div></div>

              <button className="save-button" type="submit" disabled={btnLoading}>{btnLoading ? <FaSpinner className="spin small" /> : form.id ? "Update Supplier" : "Save Supplier"}</button>
              {form.id && <button type="button" className="link-button" onClick={() => setForm(initialForm)}>Cancel Edit</button>}
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
