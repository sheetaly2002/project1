import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaChartLine, FaDownload, FaFilter, FaPrint, FaRecycle, FaRupeeSign, FaSearch, FaSpinner, FaWarehouse, FaTools, FaWallet } from "react-icons/fa";
import BASE_URL from "./apiConfig";
import "./Reports.css";

const API = `${BASE_URL}/reports_api.php`;
const today = new Date().toISOString().slice(0, 10);
const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
const money = (v) => Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const wt = (v) => Number(v || 0).toFixed(3);

export default function Reports() {
  const [tab, setTab] = useState("sales");
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [search, setSearch] = useState("");
  const [summary, setSummary] = useState({});
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 12;

  const tabs = [
    ["sales", "Sales Report"],
    ["stock", "Stock Report"],
    ["profit", "Profit/Loss"],
    ["cashbook", "Cashbook"],
    ["repair", "Repairing"],
  ];

  const loadSummary = async () => {
    try {
      const res = await axios.get(`${API}?action=summary&from=${from}&to=${to}`);
      setSummary(res.data.summary || {});
    } catch {}
  };

  const loadRows = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}?action=${tab}&from=${from}&to=${to}&search=${encodeURIComponent(search)}`);
      setRows(res.data.data || []);
      setPage(1);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSummary(); }, [from, to]);
  useEffect(() => { loadRows(); }, [tab, from, to]);

  const current = useMemo(() => rows.slice((page - 1) * perPage, page * perPage), [rows, page]);
  const pages = Math.ceil(rows.length / perPage) || 1;

  const exportCSV = () => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","), ...rows.map(r => headers.map(h => `"${String(r[h] ?? "").replaceAll('"','""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${tab}_report_${from}_to_${to}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    const table = document.querySelector(".rp-table-wrap")?.innerHTML || "";
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>${tab} report</title><style>body{font-family:Arial;padding:20px}h2{color:#6b3d0b}table{width:100%;border-collapse:collapse}th{background:#111;color:#fff}th,td{border:1px solid #ddd;padding:8px;font-size:12px}</style></head><body><h2>Shreeji Jewellers - ${tab.toUpperCase()} Report</h2><p>${from} to ${to}</p>${table}<script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
  };

  const renderTable = () => {
    if (loading) return <div className="rp-loader"><FaSpinner className="spin" /> Loading report...</div>;
    if (!current.length) return <div className="rp-empty">No records found</div>;
    if (tab === "sales") return <table><thead><tr><th>Bill</th><th>Date</th><th>Customer</th><th>Mobile</th><th>Total</th><th>Paid</th><th>Due</th><th>Mode</th></tr></thead><tbody>{current.map(r=><tr key={r.sale_id}><td>{r.bill_no}</td><td>{r.sale_date || r.created_at}</td><td>{r.customer_name}</td><td>{r.mobile}</td><td>₹{money(r.grand_total || r.total_amount || r.final_amount)}</td><td>₹{money(r.paid_amount)}</td><td>₹{money(r.due_amount)}</td><td>{r.payment_mode}</td></tr>)}</tbody></table>;
    if (tab === "stock") return <table><thead><tr><th>Barcode</th><th>Product</th><th>Metal</th><th>Type</th><th>Net Wt</th><th>Rate</th><th>Total</th><th>Status</th></tr></thead><tbody>{current.map(r=><tr key={r.stock_id}><td>{r.barcode_no}</td><td>{r.product_name}</td><td>{r.metal_name}</td><td>{r.item_type}</td><td>{wt(r.net_weight)}g</td><td>₹{money(r.rate_per_gram)}</td><td>₹{money(r.total_amount)}</td><td><b className={r.stock_status === "AVAILABLE" ? "green" : "red"}>{r.stock_status}</b></td></tr>)}</tbody></table>;
    if (tab === "profit") return <table><thead><tr><th>Bill</th><th>Date</th><th>Barcode</th><th>Product</th><th>Metal</th><th>Cost</th><th>Sale</th><th>Profit/Loss</th></tr></thead><tbody>{current.map((r,i)=><tr key={i}><td>{r.bill_no}</td><td>{r.sale_date}</td><td>{r.barcode_no}</td><td>{r.product_name}</td><td>{r.metal_name}</td><td>₹{money(r.cost_amount)}</td><td>₹{money(r.sale_amount)}</td><td className={Number(r.profit_amount)>=0?"green":"red"}>₹{money(r.profit_amount)}</td></tr>)}</tbody></table>;
    if (tab === "cashbook") return <table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Mode</th><th>Notes</th></tr></thead><tbody>{current.map(r=><tr key={r.id}><td>{r.entry_date}</td><td><b className={r.entry_type === "income" ? "green" : "red"}>{r.entry_type}</b></td><td>{r.category}</td><td>₹{money(r.amount)}</td><td>{r.payment_mode}</td><td>{r.notes}</td></tr>)}</tbody></table>;
    return <table><thead><tr><th>Repair No</th><th>Customer</th><th>Mobile</th><th>Item</th><th>Receive</th><th>Expected</th><th>Status</th><th>Due</th></tr></thead><tbody>{current.map(r=><tr key={r.id}><td>{r.repair_no}</td><td>{r.customer_name}</td><td>{r.mobile}</td><td>{r.item_name}</td><td>{r.receive_date}</td><td>{r.expected_date}</td><td>{r.status}</td><td>₹{money(r.due_amount)}</td></tr>)}</tbody></table>;
  };

  return <div className="rp-page">
    <header className="rp-hero"><div><p>Business Reports</p><h1>Reports & Analytics</h1><span>Sales, stock, profit/loss, cashbook and repairing report in one panel.</span></div><button onClick={()=>{loadSummary();loadRows();}}><FaRecycle /> Refresh</button></header>
    <section className="rp-cards">
      <div><FaRupeeSign/><span>Sales</span><b>₹{money(summary.sales_amount)}</b></div>
      <div><FaChartLine/><span>Profit/Loss</span><b className={Number(summary.profit)>=0?"green":"red"}>₹{money(summary.profit)}</b></div>
      <div><FaWarehouse/><span>Stock Value</span><b>₹{money(summary.stock_value)}</b></div>
      <div><FaWallet/><span>Cash Balance</span><b>₹{money(Number(summary.cash_in||0)-Number(summary.cash_out||0))}</b></div>
      <div><FaTools/><span>Pending Repairs</span><b>{summary.repair_pending || 0}</b></div>
    </section>
    <section className="rp-panel">
      <div className="rp-tabs">{tabs.map(t=><button key={t[0]} className={tab===t[0]?"active":""} onClick={()=>setTab(t[0])}>{t[1]}</button>)}</div>
      <div className="rp-toolbar"><label>From<input type="date" value={from} onChange={e=>setFrom(e.target.value)} /></label><label>To<input type="date" value={to} onChange={e=>setTo(e.target.value)} /></label><div className="rp-search"><FaSearch/><input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')loadRows();}} placeholder="Search..." /></div><button onClick={loadRows}><FaFilter/> Apply</button><button onClick={exportCSV}><FaDownload/> CSV</button><button onClick={printReport}><FaPrint/> Print</button></div>
      <div className="rp-table-wrap">{renderTable()}</div>
      <div className="rp-pagination"><span>Total {rows.length}</span><button disabled={page===1} onClick={()=>setPage(p=>p-1)}>Prev</button><b>Page {page}/{pages}</b><button disabled={page===pages} onClick={()=>setPage(p=>p+1)}>Next</button></div>
    </section>
  </div>;
}
