import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaFileUpload,
  FaFilePdf,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaIdCard,
  FaRupeeSign,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaExclamationCircle,
  FaUsers,
  FaDownload,
  FaUndo,
} from "react-icons/fa";
import BASE_URL from "./apiConfig";
import "./CustomerMaster.css";

const API_BASE = `${BASE_URL}/customers.php`;

const emptyForm = {
  customer_name: "",
  mobile: "",
  email: "",
  address: "",
  gstin: "",
  opening_balance: "0",
  balance_type: "due",
  dob: "",
  id_proof_type: "Aadhar Card",
  id_proof_number: "",
};

export default function CustomerMaster() {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [balanceFilter, setBalanceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const itemsPerPage = 8;

  const showStatus = (type, msg) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus({ type: "", msg: "" }), 3500);
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setCustomers(res.data.customers || []);
    } catch (error) {
      showStatus("error", "Unable to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const stats = useMemo(() => {
    const total = customers.length;
    const dueAmount = customers
      .filter((c) => c.balance_type === "due")
      .reduce((sum, c) => sum + Number(c.opening_balance || 0), 0);
    const advanceAmount = customers
      .filter((c) => c.balance_type === "advance")
      .reduce((sum, c) => sum + Number(c.opening_balance || 0), 0);
    return { total, dueAmount, advanceAmount };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return customers.filter((c) => {
      const matchesSearch =
        !q ||
        c.customer_name?.toLowerCase().includes(q) ||
        c.mobile?.includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.gstin?.toLowerCase().includes(q);

      const matchesBalance = balanceFilter === "all" || c.balance_type === balanceFilter;
      return matchesSearch && matchesBalance;
    });
  }, [customers, searchTerm, balanceFilter]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const currentData = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.customer_name.trim()) return "Customer name is required";
    if (!/^\d{10}$/.test(formData.mobile)) return "Mobile number must be 10 digits";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Enter a valid email address";
    }
    if (formData.gstin && formData.gstin.length !== 15) return "GSTIN must be 15 characters";
    if (Number(formData.opening_balance) < 0) return "Opening balance cannot be negative";
    if (file && file.size > 5 * 1024 * 1024) return "KYC file max size is 5MB";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) return showStatus("error", error);

    setSaving(true);
    try {
      if (editId) {
        await axios.put(API_BASE, { ...formData, customer_id: editId });
        showStatus("success", "Customer updated successfully");
      } else {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, value ?? ""));
        if (file) data.append("id_proof_file", file);
        await axios.post(API_BASE, data);
        showStatus("success", "Customer added successfully");
      }
      resetForm();
      fetchCustomers();
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to save customer";
      showStatus("error", msg);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setFile(null);
    setEditId(null);
    setDrawerOpen(false);
  };

  const openAdd = () => {
    setFormData(emptyForm);
    setFile(null);
    setEditId(null);
    setDrawerOpen(true);
  };

  const openEdit = (customer) => {
    setFormData({
      customer_name: customer.customer_name || "",
      mobile: customer.mobile || "",
      email: customer.email || "",
      address: customer.address || "",
      gstin: customer.gstin || "",
      opening_balance: customer.opening_balance || "0",
      balance_type: customer.balance_type || "due",
      dob: customer.dob || "",
      id_proof_type: customer.id_proof_type || "Aadhar Card",
      id_proof_number: customer.id_proof_number || "",
    });
    setFile(null);
    setEditId(customer.customer_id);
    setDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer? It will be hidden from active records.")) return;
    try {
      await axios.delete(API_BASE, { data: { customer_id: id } });
      showStatus("success", "Customer deleted");
      fetchCustomers();
    } catch (error) {
      showStatus("error", "Failed to delete customer");
    }
  };

  const formatMoney = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

  return (
    <div className="cm-page">
      {status.msg && (
        <div className={`cm-alert ${status.type}`}>
          {status.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}
          <span>{status.msg}</span>
        </div>
      )}

      <section className="cm-hero">
        <div>
          <p className="cm-kicker">Jewellery CRM</p>
          <h1>Customer Master</h1>
          <p className="cm-subtitle">Manage customer KYC, GSTIN, opening balance, due and advance records.</p>
        </div>
        <button className="cm-primary-btn" onClick={openAdd}>
          <FaUserPlus /> New Customer
        </button>
      </section>

      <section className="cm-stats-grid">
        <div className="cm-stat-card">
          <FaUsers />
          <div>
            <span>Total Customers</span>
            <strong>{stats.total}</strong>
          </div>
        </div>
        <div className="cm-stat-card due">
          <FaRupeeSign />
          <div>
            <span>Total Due</span>
            <strong>{formatMoney(stats.dueAmount)}</strong>
          </div>
        </div>
        <div className="cm-stat-card advance">
          <FaDownload />
          <div>
            <span>Total Advance</span>
            <strong>{formatMoney(stats.advanceAmount)}</strong>
          </div>
        </div>
      </section>

      <section className="cm-panel">
        <div className="cm-toolbar">
          <div className="cm-search-box">
            <FaSearch />
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search name, mobile, email or GSTIN..."
            />
            {searchTerm && <FaTimes className="cm-clear" onClick={() => setSearchTerm("")} />}
          </div>
          <select
            className="cm-filter"
            value={balanceFilter}
            onChange={(e) => {
              setBalanceFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Balance</option>
            <option value="due">Due Only</option>
            <option value="advance">Advance Only</option>
          </select>
          <button className="cm-refresh" onClick={fetchCustomers} title="Refresh">
            <FaUndo />
          </button>
        </div>

        <div className="cm-table-wrap">
          <table className="cm-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>GST / KYC</th>
                <th>Opening Balance</th>
                <th>Joined</th>
                <th className="cm-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="cm-empty">Loading customers...</td></tr>
              ) : currentData.length === 0 ? (
                <tr><td colSpan="6" className="cm-empty">No customer found</td></tr>
              ) : (
                currentData.map((c) => (
                  <tr key={c.customer_id}>
                    <td>
                      <div className="cm-customer-cell">
                        <div className="cm-avatar">{c.customer_name?.charAt(0)?.toUpperCase() || "C"}</div>
                        <div>
                          <strong>{c.customer_name}</strong>
                          <small>{c.address || "No address"}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="cm-info-line"><FaPhoneAlt /> {c.mobile}</div>
                      <div className="cm-info-line muted"><FaEnvelope /> {c.email || "No email"}</div>
                    </td>
                    <td>
                      <div className="cm-info-line"><FaIdCard /> {c.gstin || "No GSTIN"}</div>
                      <small>{c.id_proof_type || "KYC"}: {c.id_proof_number || "-"}</small>
                    </td>
                    <td>
                      <span className={`cm-balance ${c.balance_type === "advance" ? "advance" : "due"}`}>
                        {c.balance_type === "advance" ? "Advance" : "Due"} {formatMoney(c.opening_balance)}
                      </span>
                    </td>
                    <td>{c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN") : "-"}</td>
                    <td className="cm-actions">
                      <button className="cm-icon-btn edit" onClick={() => openEdit(c)}><FaEdit /></button>
                      <button className="cm-icon-btn delete" onClick={() => handleDelete(c.customer_id)}><FaTrash /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="cm-pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}><FaChevronLeft /></button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}><FaChevronRight /></button>
        </div>
      </section>

      {drawerOpen && (
        <div className="cm-drawer-backdrop">
          <aside className="cm-drawer">
            <div className="cm-drawer-head">
              <div>
                <p>{editId ? "Update Record" : "New Registration"}</p>
                <h2>{editId ? "Edit Customer" : "Add Customer"}</h2>
              </div>
              <button onClick={resetForm}><FaTimes /></button>
            </div>

            <form className="cm-form" onSubmit={handleSubmit}>
              <div className="cm-field">
                <label>Customer Name *</label>
                <input value={formData.customer_name} onChange={(e) => updateField("customer_name", e.target.value)} placeholder="Enter full name" />
              </div>

              <div className="cm-two-col">
                <div className="cm-field">
                  <label>Mobile *</label>
                  <input maxLength="10" value={formData.mobile} onChange={(e) => updateField("mobile", e.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile" />
                </div>
                <div className="cm-field">
                  <label>Email</label>
                  <input value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="customer@email.com" />
                </div>
              </div>

              <div className="cm-field">
                <label>Address</label>
                <textarea rows="3" value={formData.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Area, city, state" />
              </div>

              <div className="cm-two-col">
                <div className="cm-field">
                  <label>GSTIN</label>
                  <input maxLength="15" value={formData.gstin} onChange={(e) => updateField("gstin", e.target.value.toUpperCase())} placeholder="15-character GSTIN" />
                </div>
                <div className="cm-field">
                  <label>Date of Birth</label>
                  <input type="date" value={formData.dob || ""} onChange={(e) => updateField("dob", e.target.value)} />
                </div>
              </div>

              <div className="cm-two-col">
                <div className="cm-field">
                  <label>Opening Balance</label>
                  <input type="number" min="0" value={formData.opening_balance} onChange={(e) => updateField("opening_balance", e.target.value)} />
                </div>
                <div className="cm-field">
                  <label>Balance Type</label>
                  <select value={formData.balance_type} onChange={(e) => updateField("balance_type", e.target.value)}>
                    <option value="due">Due</option>
                    <option value="advance">Advance</option>
                  </select>
                </div>
              </div>

              <div className="cm-two-col">
                <div className="cm-field">
                  <label>ID Proof Type</label>
                  <select value={formData.id_proof_type} onChange={(e) => updateField("id_proof_type", e.target.value)}>
                    <option>Aadhar Card</option>
                    <option>PAN Card</option>
                    <option>Voter ID</option>
                    <option>Passport</option>
                    <option>Driving License</option>
                  </select>
                </div>
                <div className="cm-field">
                  <label>ID Number</label>
                  <input value={formData.id_proof_number} onChange={(e) => updateField("id_proof_number", e.target.value)} placeholder="ID number" />
                </div>
              </div>

              {!editId && (
                <label className="cm-upload">
                  <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <FaFileUpload />
                  <span>{file ? file.name : "Upload KYC document"}</span>
                  <small>PDF/Image, max 5MB</small>
                </label>
              )}

              {file && <div className="cm-file-chip"><FaFilePdf /> {file.name}</div>}

              <button className="cm-save-btn" disabled={saving} type="submit">
                {saving ? "Saving..." : editId ? "Update Customer" : "Save Customer"}
              </button>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
