import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaChevronLeft, FaChevronRight, FaDownload, FaEdit, FaMoneyBillWave,
  FaPlus, FaPrint, FaRecycle, FaRupeeSign, FaSearch, FaSpinner, FaTimes,
  FaTrash, FaWallet
} from "react-icons/fa";
import BASE_URL from "./apiConfig";
import "./Cashbook.css";

const API = `${BASE_URL}/cashbook_api.php`;
const today = new Date().toISOString().slice(0, 10);
const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
const emptyForm = { id: "", date: today, type: "OUT", category: "Expense", amount: "", payment_mode: "Cash", description: "" };
const money = (v) => Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Cashbook() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [filters, setFilters] = useState({ from: monthStart, to: today, type: "all", search: "" });
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ type: "", msg: "" });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const notify = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast({ type: "", msg: "" }), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ action: "list", page, limit, ...filters });
      const res = await axios.get(`${API}?${qs.toString()}`);
      if (res.data.status === "success") {
        setRows(res.data.data || []);
        setSummary(res.data.summary || {});
        setPages(res.data.pagination?.pages || 1);
        setTotal(res.data.pagination?.total || 0);
      } else notify("error", res.data.message || "Cashbook load failed");
    } catch {
      notify("error", "Server connection failed");
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => { loadData(); }, [loadData]);

  const setFilter = (key, value) => {
    setPage(1);
    setFilters((p) => ({ ...p, [key]: value }));
  };

  const openAdd = () => {
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (row) => {
    if ((row.source_type || "manual") !== "manual") return notify("error", "Auto entries edit nahi honge. Source module se change karo.");
    setForm({
      id: row.id,
      date: row.date || today,
      type: row.type || "OUT",
      category: row.category || "Expense",
      amount: row.amount || "",
      payment_mode: row.payment_mode || "Cash",
      description: row.description || "",
    });
    setShowForm(true);
  };

  const saveEntry = async (e) => {
    e.preventDefault();
    if (!form.category.trim()) return notify("error", "Category required");
    if (Number(form.amount) <= 0) return notify("error", "Amount greater than 0 required");
    setSaving(true);
    try {
      const res = await axios.post(`${API}?action=save`, { ...form, source_type: "manual" });
      if (res.data.status === "success") {
        notify("success", res.data.message || "Saved");
        setShowForm(false);
        setForm(emptyForm);
        loadData();
      } else notify("error", res.data.message || "Save failed");
    } catch (err) {
      notify("error", err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const del = async (row) => {
    if ((row.source_type || "manual") !== "manual") return notify("error", "Auto entry delete nahi hogi");
    if (!window.confirm("Delete this cashbook entry?")) return;
    try {
      const res = await axios.delete(API, { data: { id: row.id } });
      if (res.data.status === "success") { notify("success", "Deleted"); loadData(); }
      else notify("error", res.data.message || "Delete failed");
    } catch { notify("error", "Delete failed"); }
  };

  const sync = async (kind) => {
    try {
      const res = await axios.post(`${API}?action=${kind === "sales" ? "sync_sales" : "sync_repairs"}`);
      notify(res.data.status === "success" ? "success" : "error", res.data.message || "Sync done");
      loadData();
    } catch { notify("error", "Sync failed"); }
  };

  const exportCsv = () => {
    const header = ["Date", "Type", "Category", "Amount", "Payment Mode", "Source", "Description"];
    const lines = rows.map(r => [r.date, r.type, r.category, r.amount, r.payment_mode, r.source_type, (r.description || "").replace(/\n/g, " ")]);
    const csv = [header, ...lines].map(a => a.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `cashbook_${filters.from}_to_${filters.to}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const html = `<!doctype html><html><head><title>Cashbook</title><style>
      body{font-family:Arial;margin:22px;color:#1f2937}h1{margin:0;color:#6f450e}.sub{color:#666;margin-bottom:14px}.cards{display:flex;gap:12px;margin:14px 0}.card{border:1px solid #ddd;padding:10px 14px;border-radius:8px}table{width:100%;border-collapse:collapse}th{background:#2b1a0d;color:#ffd56a;padding:8px;text-align:left}td{border-bottom:1px solid #eee;padding:8px;font-size:12px}.in{color:#15803d;font-weight:bold}.out{color:#b91c1c;font-weight:bold}.right{text-align:right}</style></head><body>
      <h1>Shreeji Jewellers - Cashbook</h1><div class="sub">${filters.from} to ${filters.to}</div>
      <div class="cards"><div class="card">Cash In: ₹${money(summary.cash_in)}</div><div class="card">Cash Out: ₹${money(summary.cash_out)}</div><div class="card">Balance: ₹${money(summary.balance)}</div></div>
      <table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Mode</th><th>Description</th><th class="right">Amount</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.date}</td><td class="${r.type==='IN'?'in':'out'}">${r.type}</td><td>${r.category||''}</td><td>${r.payment_mode||''}</td><td>${r.description||''}</td><td class="right">₹${money(r.amount)}</td></tr>`).join("")}</tbody></table><script>window.onload=()=>window.print()</script></body></html>`;
    const w = window.open("", "_blank"); w.document.write(html); w.document.close();
  };

  const categoryOptions = useMemo(() => form.type === "IN"
    ? ["Sale Payment", "Repair Payment", "Other Income", "Cash Deposit", "Opening Cash"]
    : ["Expense", "Rent", "Salary", "Electricity", "Tea/Snacks", "Cash Withdraw", "Other Expense"], [form.type]);

  return (
    <div className="cb-page">
      {toast.msg && <div className={`cb-toast ${toast.type}`}>{toast.msg}</div>}

      <header className="cb-hero">
        <div className="cb-hero-icon"><FaWallet /></div>
        <div>
          <h1>Cashbook & Expense</h1>
          <p>Track daily cash in, cash out, expenses, sale payments and repair advances.</p>
        </div>
        <button onClick={openAdd}><FaPlus /> Add Entry</button>
      </header>

      <section className="cb-stats">
        <div className="stat in"><FaMoneyBillWave /><span>Cash In</span><b>₹{money(summary.cash_in)}</b></div>
        <div className="stat out"><FaRupeeSign /><span>Cash Out</span><b>₹{money(summary.cash_out)}</b></div>
        <div className="stat balance"><FaWallet /><span>Balance</span><b>₹{money(summary.balance)}</b></div>
      </section>

      <section className="cb-card">
        <div className="cb-toolbar">
          <div className="cb-search"><FaSearch /><input value={filters.search} onChange={(e) => setFilter("search", e.target.value)} placeholder="Search category, description, payment mode..." /></div>
          <button onClick={() => sync("sales")}><FaRecycle /> Sync Sales</button>
          <button onClick={() => sync("repairs")}><FaRecycle /> Sync Repairs</button>
          <button onClick={exportCsv}><FaDownload /> CSV</button>
          <button onClick={printReport}><FaPrint /> Print</button>
        </div>

        <div className="cb-filters">
          <label>From<input type="date" value={filters.from} onChange={(e) => setFilter("from", e.target.value)} /></label>
          <label>To<input type="date" value={filters.to} onChange={(e) => setFilter("to", e.target.value)} /></label>
          <label>Type<select value={filters.type} onChange={(e) => setFilter("type", e.target.value)}><option value="all">All</option><option value="IN">Cash In</option><option value="OUT">Cash Out</option></select></label>
          <label>Per Page<select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}><option value="10">10</option><option value="25">25</option><option value="50">50</option></select></label>
        </div>

        <div className="cb-table-wrap">
          {loading ? <div className="cb-loader"><FaSpinner className="spin" /> Loading cashbook...</div> : (
            <table className="cb-table">
              <thead><tr><th>#</th><th>Date</th><th>Type</th><th>Category</th><th>Mode</th><th>Description</th><th>Source</th><th className="right">Amount</th><th>Action</th></tr></thead>
              <tbody>{rows.length ? rows.map((r, idx) => (
                <tr key={r.id}>
                  <td>{(page - 1) * limit + idx + 1}</td>
                  <td>{r.date}</td>
                  <td><span className={`type-pill ${r.type === "IN" ? "in" : "out"}`}>{r.type === "IN" ? "IN" : "OUT"}</span></td>
                  <td><b>{r.category}</b></td>
                  <td>{r.payment_mode || "Cash"}</td>
                  <td>{r.description || "-"}</td>
                  <td><span className="source-pill">{r.source_type || "manual"}</span></td>
                  <td className={`right amount ${r.type === "IN" ? "green" : "red"}`}>₹{money(r.amount)}</td>
                  <td><div className="cb-actions"><button disabled={(r.source_type || "manual") !== "manual"} onClick={() => openEdit(r)}><FaEdit /></button><button className="danger" disabled={(r.source_type || "manual") !== "manual"} onClick={() => del(r)}><FaTrash /></button></div></td>
                </tr>
              )) : <tr><td colSpan="9" className="empty">No cashbook entry found</td></tr>}</tbody>
            </table>
          )}
        </div>

        <div className="cb-pagination">
          <span>Total {total} records</span>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}><FaChevronLeft /></button>
          <b>Page {page} / {pages || 1}</b>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}><FaChevronRight /></button>
        </div>
      </section>

      {showForm && <div className="cb-modal">
        <form className="cb-drawer" onSubmit={saveEntry}>
          <div className="drawer-head"><h2>{form.id ? "Edit Entry" : "Add Cash Entry"}</h2><button type="button" onClick={() => setShowForm(false)}><FaTimes /></button></div>
          <div className="form-grid">
            <label>Date<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
            <label>Type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, category: e.target.value === "IN" ? "Other Income" : "Expense" })}><option value="IN">Cash In</option><option value="OUT">Cash Out</option></select></label>
            <label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
            <label>Payment Mode<select value={form.payment_mode} onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}><option>Cash</option><option>UPI</option><option>Card</option><option>Bank</option><option>Mixed</option></select></label>
            <label>Amount<input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" /></label>
            <label className="wide">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Notes / details" /></label>
          </div>
          <button className="save-btn" disabled={saving}>{saving ? <FaSpinner className="spin" /> : "Save Entry"}</button>
        </form>
      </div>}
    </div>
  );
}
