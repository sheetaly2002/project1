import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaCalendarAlt, FaCheckCircle, FaChevronLeft, FaChevronRight, FaCrown,
  FaEdit, FaExclamationCircle, FaEye, FaGem, FaMoneyBillWave, FaPhoneAlt,
  FaPlus, FaPrint, FaRecycle, FaRupeeSign, FaSearch, FaSpinner, FaTimes,
  FaTools, FaTrash, FaTruck, FaUser
} from "react-icons/fa";
import BASE_URL from "./apiConfig";
import "./Repairing.css";

const API = `${BASE_URL}/repairing_api.php`;
const today = new Date().toISOString().slice(0, 10);

const blankForm = {
  id: "",
  customer_id: "",
  customer_name: "",
  mobile: "",
  item_name: "",
  metal_id: "",
  problem_details: "",
  weight: "",
  receive_date: today,
  expected_date: "",
  estimated_cost: "0",
  repair_charge: "0",
  extra_charge: "0",
  discount_amount: "0",
  advance_taken: "0",
  paid_amount: "0",
  payment_mode: "Cash",
  status: "Pending",
  notes: "",
};

const statuses = ["Pending", "In Progress", "Ready", "Delivered", "Cancelled"];
const money = (v) => Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const wt = (v) => Number(v || 0).toFixed(3);

export default function RepairingModule() {
  const [customers, setCustomers] = useState([]);
  const [metals, setMetals] = useState([]);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [form, setForm] = useState(blankForm);
  const [showForm, setShowForm] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [deliverItem, setDeliverItem] = useState(null);
  const [deliverPay, setDeliverPay] = useState({ paid_amount: "0", payment_mode: "Cash" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });
  const [filters, setFilters] = useState({ search: "", status: "all", from_date: "", to_date: "" });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const notify = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), 3500);
  };

  const loadInit = useCallback(async () => {
    try {
      const res = await axios.get(`${API}?action=init`);
      if (res.data.status === "success") {
        setCustomers(res.data.customers || []);
        setMetals(res.data.metals || []);
      }
    } catch {
      notify("error", "Repair master data load failed");
    }
  }, []);

  const loadRepairs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ action: "list", page, limit, ...filters });
      const res = await axios.get(`${API}?${params.toString()}`);
      if (res.data.status === "success") {
        setRows(res.data.data || []);
        setSummary(res.data.summary || {});
        setPages(res.data.pagination?.pages || 1);
        setTotal(res.data.pagination?.total || 0);
      } else notify("error", res.data.message || "Repair list load failed");
    } catch {
      notify("error", "Server connection failed");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { loadInit(); }, [loadInit]);
  useEffect(() => { loadRepairs(); }, [loadRepairs]);

  const totals = useMemo(() => {
    const totalAmount = Math.max(Number(form.repair_charge || 0) + Number(form.extra_charge || 0) - Number(form.discount_amount || 0), 0);
    const received = Number(form.advance_taken || 0) + Number(form.paid_amount || 0);
    return { totalAmount, due: Math.max(totalAmount - received, 0) };
  }, [form.repair_charge, form.extra_charge, form.discount_amount, form.advance_taken, form.paid_amount]);

  const customerOptions = useMemo(() => {
    const q = `${form.customer_name || form.mobile || ""}`.toLowerCase();
    if (!q) return customers.slice(0, 25);
    return customers.filter(c =>
      (c.customer_name || "").toLowerCase().includes(q) ||
      (c.mobile || "").includes(q)
    ).slice(0, 25);
  }, [customers, form.customer_name, form.mobile]);

  const setField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const selectCustomer = (id) => {
    const c = customers.find(x => String(x.customer_id) === String(id));
    setForm(prev => ({
      ...prev,
      customer_id: id,
      customer_name: c?.customer_name || prev.customer_name,
      mobile: c?.mobile || prev.mobile,
    }));
  };

  const openAdd = () => {
    setForm(blankForm);
    setShowForm(true);
  };

  const openEdit = (r) => {
    setForm({
      id: r.id || "",
      customer_id: r.customer_id || "",
      customer_name: r.final_customer_name || r.customer_name || "",
      mobile: r.final_mobile || r.mobile || "",
      item_name: r.item_name || "",
      metal_id: r.metal_id || "",
      problem_details: r.problem_details || "",
      weight: r.weight || "",
      receive_date: r.receive_date || today,
      expected_date: r.expected_date || "",
      estimated_cost: r.estimated_cost || "0",
      repair_charge: r.repair_charge || r.estimated_cost || "0",
      extra_charge: r.extra_charge || "0",
      discount_amount: r.discount_amount || "0",
      advance_taken: r.advance_taken || "0",
      paid_amount: r.paid_amount || "0",
      payment_mode: r.payment_mode || "Cash",
      status: r.status || "Pending",
      notes: r.notes || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(blankForm);
    setShowForm(false);
  };

  const saveRepair = async (e) => {
    e.preventDefault();
    if (!form.customer_id && !form.customer_name.trim()) return notify("error", "Customer select karo ya walk-in name daalo");
    if (form.mobile && !/^\d{10}$/.test(form.mobile)) return notify("error", "Mobile 10 digit hona chahiye");
    if (!form.item_name.trim()) return notify("error", "Item name required");
    if (!form.problem_details.trim()) return notify("error", "Problem / issue required");

    setSaving(true);
    try {
      const action = form.id ? "update" : "save";
      const res = await axios.post(`${API}?action=${action}`, { ...form, total_amount: totals.totalAmount, due_amount: totals.due });
      if (res.data.status === "success") {
        notify("success", res.data.message || "Repair saved");
        resetForm();
        loadRepairs();
      } else notify("error", res.data.message || "Save failed");
    } catch (err) {
      notify("error", err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (item, status) => {
    try {
      const res = await axios.post(`${API}?action=status`, { id: item.id, status });
      if (res.data.status === "success") {
        notify("success", "Status updated");
        loadRepairs();
      } else notify("error", res.data.message || "Status update failed");
    } catch {
      notify("error", "Status update failed");
    }
  };

  const openDeliver = (item) => {
    setDeliverItem(item);
    setDeliverPay({ paid_amount: String(item.due_amount || 0), payment_mode: item.payment_mode || "Cash" });
  };

  const deliverRepair = async (e) => {
    e.preventDefault();
    if (!deliverItem) return;
    try {
      const res = await axios.post(`${API}?action=deliver`, { id: deliverItem.id, ...deliverPay });
      if (res.data.status === "success") {
        notify("success", "Repair delivered");
        setDeliverItem(null);
        loadRepairs();
      } else notify("error", res.data.message || "Delivery failed");
    } catch {
      notify("error", "Delivery failed");
    }
  };

  const delRepair = async (item) => {
    if (item.status === "Delivered") return notify("error", "Delivered repair delete nahi hoga");
    if (!window.confirm(`Delete repair ${item.repair_no}?`)) return;
    try {
      const res = await axios.delete(API, { data: { id: item.id } });
      if (res.data.status === "success") {
        notify("success", "Repair deleted");
        loadRepairs();
      } else notify("error", res.data.message || "Delete failed");
    } catch {
      notify("error", "Delete failed");
    }
  };

  const printReceipt = async (item) => {
    try {
      const res = await axios.get(`${API}?action=receipt&id=${item.id}`);
      if (res.data.status !== "success") return notify("error", "Receipt data not found");
      const r = res.data.repair;
      const html = `<!doctype html><html><head><title>${r.repair_no}</title><style>
        @page{size:A5;margin:8mm}*{box-sizing:border-box}body{font-family:Arial, sans-serif;color:#20140a;margin:0}.receipt{border:2px solid #9b6a20;border-radius:14px;padding:18px}.head{text-align:center;border-bottom:2px solid #d4af37;padding-bottom:10px;margin-bottom:12px}.head h1{margin:0;color:#6d430d;font-size:24px}.head p{margin:4px 0 0;font-size:12px}.row{display:flex;justify-content:space-between;border-bottom:1px dashed #cbb58b;padding:7px 0;font-size:13px}.row b{color:#3d2508}.badge{background:#2b1a0a;color:#f4d477;border-radius:20px;padding:4px 10px}.total{margin-top:14px;border:1.5px solid #d4af37;border-radius:10px;padding:10px;background:#fff8e8}.total .row{border-bottom:0}.foot{text-align:center;margin-top:18px;font-size:11px;color:#6b5d4a}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
      </style></head><body><div class="receipt"><div class="head"><h1>श्रीजी ज्वेलर्स</h1><p>Repair Receipt</p><p><b>${r.repair_no}</b></p></div><div class="row"><span>Customer</span><b>${r.final_customer_name || '-'}</b></div><div class="row"><span>Mobile</span><b>${r.final_mobile || '-'}</b></div><div class="row"><span>Item</span><b>${r.item_name || '-'}</b></div><div class="row"><span>Metal</span><b>${r.metal_name || '-'}</b></div><div class="row"><span>Weight</span><b>${wt(r.weight)}g</b></div><div class="row"><span>Issue</span><b>${r.problem_details || '-'}</b></div><div class="row"><span>Receive Date</span><b>${r.receive_date || '-'}</b></div><div class="row"><span>Expected Date</span><b>${r.expected_date || '-'}</b></div><div class="row"><span>Status</span><b class="badge">${r.status}</b></div><div class="total"><div class="row"><span>Total</span><b>₹${money(r.total_amount)}</b></div><div class="row"><span>Advance</span><b>₹${money(r.advance_taken)}</b></div><div class="row"><span>Paid</span><b>₹${money(r.paid_amount)}</b></div><div class="row"><span>Due</span><b>₹${money(r.due_amount)}</b></div></div><div class="foot">Please bring this receipt at delivery time.<br/>Thank you.</div></div><script>window.onload=()=>setTimeout(()=>{window.print();window.close()},500)</script></body></html>`;
      const w = window.open("", "_blank");
      w.document.write(html);
      w.document.close();
    } catch {
      notify("error", "Print failed");
    }
  };

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="rm-page">
      {toast.message && <div className={`rm-toast ${toast.type}`}>{toast.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />} {toast.message}</div>}

      <div className="rm-container">
        <header className="rm-hero">
          <div className="rm-hero-icon"><FaCrown /></div>
          <div>
            <h1>Repairing Module</h1>
            <p>Customer linked jewellery repair entry, tracking, payment and receipt.</p>
          </div>
          <div className="rm-hero-actions">
            <button onClick={loadRepairs}><FaRecycle /> Refresh</button>
            <button className="primary" onClick={openAdd}><FaPlus /> New Repair</button>
          </div>
        </header>

        <section className="rm-stats">
          <div><FaTools /><span>Total Jobs</span><b>{summary.total_jobs || 0}</b></div>
          <div><FaCalendarAlt /><span>Pending</span><b>{summary.pending_jobs || 0}</b></div>
          <div><FaGem /><span>Ready</span><b>{summary.ready_jobs || 0}</b></div>
          <div><FaTruck /><span>Delivered</span><b>{summary.delivered_jobs || 0}</b></div>
          <div><FaRupeeSign /><span>Received</span><b>₹{money(summary.total_received)}</b></div>
          <div><FaMoneyBillWave /><span>Due</span><b>₹{money(summary.total_due)}</b></div>
        </section>

        <section className="rm-card">
          <div className="rm-toolbar">
            <div className="rm-search"><FaSearch /><input value={filters.search} onChange={e => updateFilter("search", e.target.value)} placeholder="Search repair no, customer, mobile, item..." /></div>
            <select value={filters.status} onChange={e => updateFilter("status", e.target.value)}><option value="all">All Status</option>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
            <input type="date" value={filters.from_date} onChange={e => updateFilter("from_date", e.target.value)} />
            <input type="date" value={filters.to_date} onChange={e => updateFilter("to_date", e.target.value)} />
          </div>

          <div className="rm-table-wrap">
            {loading ? <div className="rm-loader"><FaSpinner className="spin" /> Loading repairing jobs...</div> : <table className="rm-table">
              <thead><tr><th>#</th><th>Repair No</th><th>Customer</th><th>Item / Issue</th><th>Dates</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>{rows.length ? rows.map((r, idx) => <tr key={r.id}>
                <td>{(page - 1) * limit + idx + 1}</td>
                <td><b>{r.repair_no}</b><small>{r.metal_name || '-'}</small></td>
                <td><strong>{r.final_customer_name || '-'}</strong><small><FaPhoneAlt /> {r.final_mobile || '-'}</small></td>
                <td><strong>{r.item_name}</strong><small>{r.problem_details}</small></td>
                <td><b>In: {r.receive_date}</b><small>Exp: {r.expected_date || '-'}</small></td>
                <td><b>₹{money(r.total_amount)}</b><small>Due ₹{money(r.due_amount)}</small></td>
                <td><select className={`status-select ${String(r.status).toLowerCase().replaceAll(' ', '-')}`} value={r.status} onChange={e => updateStatus(r, e.target.value)}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></td>
                <td><div className="rm-actions"><button onClick={() => setViewItem(r)}><FaEye /></button><button onClick={() => printReceipt(r)}><FaPrint /></button><button disabled={r.status === "Delivered"} onClick={() => openEdit(r)}><FaEdit /></button><button disabled={r.status === "Delivered"} onClick={() => openDeliver(r)}><FaTruck /></button><button disabled={r.status === "Delivered"} className="danger" onClick={() => delRepair(r)}><FaTrash /></button></div></td>
              </tr>) : <tr><td colSpan="8" className="empty">No repairing jobs found</td></tr>}</tbody>
            </table>}
          </div>

          <div className="rm-pagination">
            <span>Total {total} records</span>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}><FaChevronLeft /></button>
            <b>Page {page} / {pages || 1}</b>
            <button disabled={page >= pages} onClick={() => setPage(p => p + 1)}><FaChevronRight /></button>
          </div>
        </section>
      </div>

      {showForm && <div className="rm-modal"><form className="rm-drawer" onSubmit={saveRepair}>
        <div className="drawer-head"><div><p>{form.id ? "Update Repair" : "New Repair"}</p><h2>{form.id ? "Edit Repair Job" : "Create Repair Job"}</h2></div><button type="button" onClick={resetForm}><FaTimes /></button></div>

        <h3>Customer Details</h3>
        <div className="form-grid two">
          <label>Customer Search / Select<select value={form.customer_id} onChange={e => selectCustomer(e.target.value)}><option value="">Walk-in / Manual Customer</option>{customerOptions.map(c => <option key={c.customer_id} value={c.customer_id}>{c.customer_name} - {c.mobile}</option>)}</select></label>
          <label>Customer Name<input value={form.customer_name} onChange={e => setField("customer_name", e.target.value)} placeholder="Customer name" /></label>
          <label>Mobile<input maxLength="10" value={form.mobile} onChange={e => setField("mobile", e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile" /></label>
          <label>Payment Mode<select value={form.payment_mode} onChange={e => setField("payment_mode", e.target.value)}><option>Cash</option><option>UPI</option><option>Card</option><option>Bank</option></select></label>
        </div>

        <h3>Repair Details</h3>
        <div className="form-grid two">
          <label>Item Name *<input value={form.item_name} onChange={e => setField("item_name", e.target.value)} placeholder="Ring, Chain, Bangle" /></label>
          <label>Metal<select value={form.metal_id} onChange={e => setField("metal_id", e.target.value)}><option value="">Select Metal</option>{metals.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
          <label>Weight (g)<input type="number" step="0.001" value={form.weight} onChange={e => setField("weight", e.target.value)} placeholder="0.000" /></label>
          <label>Status<select value={form.status} onChange={e => setField("status", e.target.value)}>{statuses.map(s => <option key={s}>{s}</option>)}</select></label>
          <label>Receive Date<input type="date" value={form.receive_date} onChange={e => setField("receive_date", e.target.value)} /></label>
          <label>Expected Delivery<input type="date" value={form.expected_date} onChange={e => setField("expected_date", e.target.value)} /></label>
        </div>
        <label className="full">Problem / Issue *<textarea value={form.problem_details} onChange={e => setField("problem_details", e.target.value)} placeholder="Chain soldering, ring size, polish, stone fitting..." /></label>

        <h3>Charges</h3>
        <div className="form-grid three">
          <label>Repair Charge<input type="number" value={form.repair_charge} onChange={e => setField("repair_charge", e.target.value)} /></label>
          <label>Extra Charge<input type="number" value={form.extra_charge} onChange={e => setField("extra_charge", e.target.value)} /></label>
          <label>Discount<input type="number" value={form.discount_amount} onChange={e => setField("discount_amount", e.target.value)} /></label>
          <label>Advance Taken<input type="number" value={form.advance_taken} onChange={e => setField("advance_taken", e.target.value)} /></label>
          <label>Paid Amount<input type="number" value={form.paid_amount} onChange={e => setField("paid_amount", e.target.value)} /></label>
          <div className="total-box"><span>Total</span><b>₹{money(totals.totalAmount)}</b><small>Due ₹{money(totals.due)}</small></div>
        </div>
        <label className="full">Notes<textarea value={form.notes} onChange={e => setField("notes", e.target.value)} placeholder="Internal notes" /></label>

        <button className="save-btn" disabled={saving}>{saving ? <FaSpinner className="spin" /> : form.id ? "Update Repair" : "Save Repair"}</button>
      </form></div>}

      {viewItem && <div className="rm-modal"><div className="rm-dialog"><button className="close" onClick={() => setViewItem(null)}><FaTimes /></button><h2>Repair Details</h2><div className="detail-grid"><span>Repair No</span><b>{viewItem.repair_no}</b><span>Customer</span><b>{viewItem.final_customer_name}</b><span>Mobile</span><b>{viewItem.final_mobile}</b><span>Item</span><b>{viewItem.item_name}</b><span>Metal</span><b>{viewItem.metal_name}</b><span>Problem</span><b>{viewItem.problem_details}</b><span>Weight</span><b>{wt(viewItem.weight)}g</b><span>Receive</span><b>{viewItem.receive_date}</b><span>Expected</span><b>{viewItem.expected_date || '-'}</b><span>Total</span><b>₹{money(viewItem.total_amount)}</b><span>Due</span><b>₹{money(viewItem.due_amount)}</b><span>Status</span><b>{viewItem.status}</b></div></div></div>}

      {deliverItem && <div className="rm-modal"><form className="rm-dialog small" onSubmit={deliverRepair}><button type="button" className="close" onClick={() => setDeliverItem(null)}><FaTimes /></button><h2>Deliver Repair</h2><p>{deliverItem.repair_no} • {deliverItem.final_customer_name}</p><div className="due-panel">Pending Due: ₹{money(deliverItem.due_amount)}</div><label>Final Paid Amount<input type="number" value={deliverPay.paid_amount} onChange={e => setDeliverPay({ ...deliverPay, paid_amount: e.target.value })} /></label><label>Payment Mode<select value={deliverPay.payment_mode} onChange={e => setDeliverPay({ ...deliverPay, payment_mode: e.target.value })}><option>Cash</option><option>UPI</option><option>Card</option><option>Bank</option></select></label><button className="save-btn"><FaTruck /> Mark Delivered</button></form></div>}
    </div>
  );
}
