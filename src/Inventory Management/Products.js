import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaChevronLeft, FaChevronRight, FaCrown, FaEdit, FaExclamationCircle, FaRupeeSign, FaSearch, FaSpinner, FaSyncAlt, FaTrash } from "react-icons/fa";
import BASE_URL from "./apiConfig";
import "./RateMaster.css";

const API_URL = `${BASE_URL}/rate_master_api.php`;
const MASTER_API = `${BASE_URL}/jewellery_master_api.php`;
const today = new Date().toISOString().slice(0, 10);
const blank = {
  id: "",
  main_cat_id: "",
  purity_id: "",
  from_date: today,
  to_date: today,
  rate_per_gram: "",
  status: "active"
};
export default function RateMaster() {
  const [metals, setMetals] = useState([]);
  const [purities, setPurities] = useState([]);
  const [rates, setRates] = useState([]);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [search, setSearch] = useState("");
  const [metalFilter, setMetalFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const toast = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: "", text: "" }), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, p, r] = await Promise.all([
        axios.get(`${MASTER_API}?action=get_main`),
        axios.get(`${MASTER_API}?action=get_purity`),
        axios.get(`${API_URL}?action=get_all`),
      ]);
      setMetals(Array.isArray(m.data) ? m.data : []);
      setPurities(Array.isArray(p.data) ? p.data : []);
      setRates(Array.isArray(r.data) ? r.data : []);
    } catch { toast("error", "Server connection failed"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const metalPurities = useMemo(() => purities.filter(p => String(p.main_cat_id) === String(form.main_cat_id)), [purities, form.main_cat_id]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rates.filter(r => {
      const okSearch =
  (r.metal_name || "").toLowerCase().includes(q) ||
  (r.purity_name || "").toLowerCase().includes(q) ||
  (r.from_date || "").includes(q) ||
  (r.to_date || "").includes(q);
      const okMetal = metalFilter === "all" || String(r.main_cat_id) === String(metalFilter);
      return okSearch && okMetal;
    });
  }, [rates, search, metalFilter]);

  const current = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const money = v => Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

 const save = async (e) => {
  e.preventDefault();

  // Metal validation
  if (!form.main_cat_id) {
    return toast("error", "Please select a metal.");
  }

  // Date validation
  if (!form.from_date) {
    return toast("error", "Please select a From Date.");
  }

  if (!form.to_date) {
    return toast("error", "Please select a To Date.");
  }

  // Date range validation
  if (form.to_date < form.from_date) {
    return toast(
      "error",
      "To Date must be on or after From Date."
    );
  }

  // Rate validation
  if (
    !form.rate_per_gram ||
    Number(form.rate_per_gram) <= 0
  ) {
    return toast(
      "error",
      "Please enter a valid rate greater than 0."
    );
  }

  setSaving(true);

  try {
    const res = await axios.post(
      `${API_URL}?action=save`,
      {
        id: form.id || "",
        main_cat_id: form.main_cat_id,
        purity_id: form.purity_id || "",
        from_date: form.from_date,
        to_date: form.to_date,
        rate_per_gram: Number(form.rate_per_gram),
        status: form.status || "active",
      }
    );

    if (res.data?.status === "success") {

      toast(
        "success",
        res.data.message || "Rate saved successfully."
      );

      // Reset form
      setForm({
        ...blank,
        from_date: today,
        to_date: today,
      });

      // Reload rates
      await load();

    } else {

      toast(
        "error",
        res.data?.message || "Unable to save the rate."
      );
    }

  } catch (error) {

    console.error("Rate save error:", error);

    toast(
      "error",
      error.response?.data?.message ||
      "Unable to connect to the server. Please try again."
    );

  } finally {
    setSaving(false);
  }
};
const edit = r => {
  setForm({
    id: r.id,
    main_cat_id: r.main_cat_id || "",
    purity_id: r.purity_id || "",
    from_date: r.from_date || r.rate_date || today,
    to_date: r.to_date || r.rate_date || today,
    rate_per_gram: r.rate_per_gram || "",
    status: r.status || "active"
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};

  const del = async id => {
    if (!window.confirm("Delete this rate?")) return;
    const res = await axios.get(`${API_URL}?action=delete&id=${id}`);
    if (res.data.status === "success") { toast("success", "Deleted"); load(); }
    else toast("error", res.data.message || "Delete failed");
  };

  return <div className="rate-page"><div className="rate-container">
    {msg.text && <div className={`rate-alert ${msg.type}`}>{msg.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}<span>{msg.text}</span></div>}
    <header className="rate-header"><FaCrown className="rate-crown"/><h1>Rate Master</h1><p>Metal and purity linked with Master Setup foreign keys</p><div className="rate-line"/></header>
    <div className="rate-grid">
      <section className="rate-card form-card"><h3>{form.id ? "Update Rate" : "Add Rate"}</h3>
        <form className="rate-form" onSubmit={save}>
          <div className="field-group"><label>Metal *</label><select value={form.main_cat_id} onChange={e => setForm({ ...form, main_cat_id: e.target.value, purity_id: "" })}><option value="">Select Metal</option>{metals.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
          <div className="field-group"><label>Purity</label><select disabled={!form.main_cat_id} value={form.purity_id} onChange={e => setForm({ ...form, purity_id: e.target.value })}><option value="">Standard / No Purity</option>{metalPurities.map(p => <option key={p.id} value={p.id}>{p.purity_name} {p.purity_percent ? `(${p.purity_percent}%)` : ""}</option>)}</select>{form.main_cat_id && !metalPurities.length && <small>No purity found for selected metal. Add purity in Master Setup.</small>}</div>
          <div className="field-row"><div className="field-group"><label>Date *</label><div className="date-range-row">

  <div className="form-group">
    <label>From Date *</label>

    <input
      type="date"
      value={form.from_date}
      onChange={e =>
        setForm({
          ...form,
          from_date: e.target.value
        })
      }
    />
  </div>


  <div className="form-group">
    <label>To Date *</label>

    <input
      type="date"
      min={form.from_date}
      value={form.to_date}
      onChange={e =>
        setForm({
          ...form,
          to_date: e.target.value
        })
      }
    />
  </div>

</div></div><div className="field-group"><label>Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></div></div>
          <div className="field-group"><label>Rate / Gram *</label><div className="money-input"><FaRupeeSign/><input type="number" step="0.01" value={form.rate_per_gram} onChange={e => setForm({ ...form, rate_per_gram: e.target.value })} placeholder="9800"/></div></div>
          <button className="save-btn" disabled={saving}>{saving ? <FaSpinner className="spin"/> : form.id ? "Update Rate" : "Save Rate"}</button>{form.id && <button type="button" className="cancel-btn" onClick={() => setForm(blank)}>Cancel</button>}
        </form>
      </section>
      <section className="rate-card list-card">
        <div className="card-top list-top"><div className="search-box"><FaSearch/><input value={search} onChange={e => {setSearch(e.target.value); setPage(1);}} placeholder="Search metal, purity, date..."/></div><button className="refresh-btn" onClick={load}><FaSyncAlt/></button></div>
        <div className="filters"><select value={metalFilter} onChange={e => {setMetalFilter(e.target.value); setPage(1);}}><option value="all">All Metals</option>{metals.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
        <div className="table-wrap">{loading ? <div className="loader"><FaSpinner className="spin"/> Loading...</div> : <table className="rate-table"><thead><tr><th>#</th><th>Metal</th><th>Purity</th><th>Validity</th><th>Rate</th><th>Status</th><th>Action</th></tr></thead><tbody>{current.length ? current.map((r, i) => <tr key={r.id}><td>{(page-1)*perPage+i+1}</td><td><b>{r.metal_name}</b></td><td>{r.purity_name || "Standard"}</td><td>
  <div className="date-range-display">
    <span>{r.from_date}</span>
    <span className="date-arrow">→</span>
    <span>{r.to_date}</span>
  </div>
</td><td className="amount">₹{money(r.rate_per_gram)}</td><td><span className={`status-pill ${r.status}`}>{r.status}</span></td><td><button className="edit-btn" onClick={() => edit(r)}><FaEdit/></button><button className="delete-btn" onClick={() => del(r.id)}><FaTrash/></button></td></tr>) : <tr><td colSpan="7" className="no-data">No rate found</td></tr>}</tbody></table>}</div>
        <div className="pagination"><button disabled={page===1} onClick={()=>setPage(p=>p-1)}><FaChevronLeft/></button><span>Page {page} / {totalPages}</span><button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}><FaChevronRight/></button></div>
      </section>
    </div>
  </div></div>;
}
