import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaArrowDown, FaArrowUp, FaBalanceScale, FaBoxOpen, FaCalendarAlt,
  FaChartLine, FaChevronLeft, FaChevronRight, FaCoins, FaDownload,
  FaFilter, FaGem, FaRecycle, FaRupeeSign, FaSearch, FaSpinner,
  FaWeightHanging
} from "react-icons/fa";
import BASE_URL from "./apiConfig";
import "./Profit.css";

const API = `${BASE_URL}/profit_loss_api.php`;
const today = new Date().toISOString().slice(0, 10);
const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
const money = (v) => Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const wt = (v) => Number(v || 0).toFixed(3);

export default function ProfitLoss() {
  const [metals, setMetals] = useState([]);
  const [filters, setFilters] = useState({ from: monthStart, to: today, metal_id: "all", search: "" });
  const [summary, setSummary] = useState({ sold: {}, available: {} });
  const [daily, setDaily] = useState([]);
  const [metalSummary, setMetalSummary] = useState([]);
  const [soldRows, setSoldRows] = useState([]);
  const [stockRows, setStockRows] = useState([]);
  const [soldPage, setSoldPage] = useState(1);
  const [stockPage, setStockPage] = useState(1);
  const [soldPages, setSoldPages] = useState(1);
  const [stockPages, setStockPages] = useState(1);
  const [soldTotal, setSoldTotal] = useState(0);
  const [stockTotal, setStockTotal] = useState(0);
  const [activeTab, setActiveTab] = useState("sold");
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const loadMasters = useCallback(async () => {
    try {
      const res = await axios.get(`${API}?action=masters`);
      if (res.data.status === "success") setMetals(res.data.metals || []);
    } catch {}
  }, []);

  const query = useCallback((action, page = 1) => {
    const p = new URLSearchParams({ action, from: filters.from, to: filters.to, metal_id: filters.metal_id, search: filters.search, page, limit });
    return `${API}?${p.toString()}`;
  }, [filters]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sum, sold, stock] = await Promise.all([
        axios.get(query("summary", 1)),
        axios.get(query("sold_list", soldPage)),
        axios.get(query("available_stock", stockPage)),
      ]);
      if (sum.data.status === "success") {
        setSummary(sum.data.summary || { sold: {}, available: {} });
        setDaily(sum.data.daily || []);
        setMetalSummary(sum.data.metal || []);
      }
      if (sold.data.status === "success") {
        setSoldRows(sold.data.data || []);
        setSoldPages(sold.data.pagination?.pages || 1);
        setSoldTotal(sold.data.pagination?.total || 0);
      }
      if (stock.data.status === "success") {
        setStockRows(stock.data.data || []);
        setStockPages(stock.data.pagination?.pages || 1);
        setStockTotal(stock.data.pagination?.total || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [query, soldPage, stockPage]);

  useEffect(() => { loadMasters(); }, [loadMasters]);
  useEffect(() => { loadAll(); }, [loadAll]);

  const sold = summary.sold || {};
  const available = summary.available || {};
  const profit = Number(sold.gross_profit || 0);
  const profitClass = profit >= 0 ? "profit" : "loss";

  const updateFilter = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value }));
    setSoldPage(1);
    setStockPage(1);
  };

  const exportCsv = () => {
    const rows = activeTab === "sold" ? soldRows : stockRows;
    const headers = activeTab === "sold"
      ? ["Bill", "Date", "Barcode", "Product", "Customer", "Sale", "Cost", "Profit"]
      : ["Barcode", "Product", "Metal", "Weight", "Rate", "Value"];
    const body = rows.map((r) => activeTab === "sold"
      ? [r.bill_no, r.sale_date, r.barcode_no, r.product_name, r.customer_name, r.sale_amount, r.cost_amount, r.profit_amount]
      : [r.barcode_no, r.product_name, r.metal_name, r.remaining_weight, r.rate_per_gram, r.total_amount]
    );
    const csv = [headers, ...body].map((a) => a.map((x) => `"${String(x ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profit-loss-${activeTab}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxDaily = Math.max(...daily.map((d) => Math.abs(Number(d.profit || 0))), 1);

  return (
    <div className="pl-page">
      <div className="pl-container">
        <header className="pl-hero">
          <div className="pl-hero-icon"><FaChartLine /></div>
          <div>
            <p>Jewellery Analytics</p>
            <h1>Profit / Loss & Stock Value</h1>
            <span>Barcode-wise sale profit, remaining stock value and metal-wise performance.</span>
          </div>
          <button onClick={loadAll}><FaRecycle /> Refresh</button>
        </header>

        <section className="pl-filters">
          <label><FaCalendarAlt /> From<input type="date" value={filters.from} onChange={(e) => updateFilter("from", e.target.value)} /></label>
          <label><FaCalendarAlt /> To<input type="date" value={filters.to} onChange={(e) => updateFilter("to", e.target.value)} /></label>
          <label><FaGem /> Metal<select value={filters.metal_id} onChange={(e) => updateFilter("metal_id", e.target.value)}><option value="all">All Metals</option>{metals.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
          <label className="search"><FaSearch /><input value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} placeholder="Search bill, barcode, product, customer" /></label>
          <button className="export" onClick={exportCsv}><FaDownload /> Export</button>
        </section>

        <section className="pl-stats">
          <div className="stat"><FaRupeeSign /><span>Sales Value</span><b>₹{money(sold.sales_value)}</b><small>{sold.sold_items || 0} sold items</small></div>
          <div className="stat"><FaCoins /><span>Stock Cost Sold</span><b>₹{money(sold.cost_value)}</b><small>Exact barcode cost</small></div>
          <div className={`stat ${profitClass}`}>{profit >= 0 ? <FaArrowUp /> : <FaArrowDown />}<span>{profit >= 0 ? "Gross Profit" : "Gross Loss"}</span><b>₹{money(Math.abs(profit))}</b><small>{money(sold.profit_percent)}%</small></div>
          <div className="stat"><FaBoxOpen /><span>Remaining Stock Value</span><b>₹{money(available.available_value)}</b><small>{available.available_items || 0} items • {wt(available.available_weight)}g</small></div>
        </section>

        <section className="pl-grid">
          <div className="pl-card chart-card">
            <div className="card-head"><h2>Daily Profit Trend</h2><span>{filters.from} to {filters.to}</span></div>
            {daily.length ? <div className="bars">{daily.map((d) => {
              const val = Number(d.profit || 0);
              const h = Math.max(8, Math.abs(val) / maxDaily * 120);
              return <div className="bar-item" key={d.sale_date}><div className={val >= 0 ? "bar up" : "bar down"} style={{ height: `${h}px` }} title={`₹${money(val)}`} /><small>{d.sale_date.slice(5)}</small></div>;
            })}</div> : <div className="empty">No sales in selected period</div>}
          </div>

          <div className="pl-card metal-card">
            <div className="card-head"><h2>Metal-wise Profit</h2><FaBalanceScale /></div>
            {metalSummary.length ? metalSummary.map((m) => <div className="metal-row" key={m.metal_name}><div><b>{m.metal_name}</b><small>{m.sold_items} items</small></div><span className={Number(m.profit) >= 0 ? "good" : "bad"}>₹{money(m.profit)}</span></div>) : <div className="empty">No metal summary</div>}
          </div>
        </section>

        <section className="pl-card list-card">
          <div className="tab-head">
            <div className="tabs"><button className={activeTab === "sold" ? "active" : ""} onClick={() => setActiveTab("sold")}>Sold Profit/Loss</button><button className={activeTab === "stock" ? "active" : ""} onClick={() => setActiveTab("stock")}>Remaining Stock</button></div>
            <span>{activeTab === "sold" ? soldTotal : stockTotal} records</span>
          </div>

          {activeTab === "sold" ? (
            <div className="table-wrap">{loading ? <div className="loader"><FaSpinner className="spin" /> Loading...</div> : <table><thead><tr><th>#</th><th>Bill / Date</th><th>Barcode</th><th>Product</th><th>Customer</th><th>Sale</th><th>Cost</th><th>Profit/Loss</th></tr></thead><tbody>{soldRows.length ? soldRows.map((r, idx) => <tr key={r.sale_item_id}><td>{(soldPage-1)*limit+idx+1}</td><td><b>{r.bill_no}</b><small>{r.sale_date}</small></td><td>{r.barcode_no}</td><td><b>{r.product_name}</b><small>{r.metal_name || "-"} • {wt(r.net_weight)}g</small></td><td>{r.customer_name}</td><td>₹{money(r.sale_amount)}<small>Rate ₹{money(r.sale_rate)}</small></td><td>₹{money(r.cost_amount)}<small>Stock ₹{money(r.stock_rate)}</small></td><td><b className={Number(r.profit_amount) >= 0 ? "good" : "bad"}>₹{money(r.profit_amount)}</b><small>{money(r.profit_percent)}%</small></td></tr>) : <tr><td colSpan="8" className="empty">No sold records</td></tr>}</tbody></table>}</div>
          ) : (
            <div className="table-wrap">{loading ? <div className="loader"><FaSpinner className="spin" /> Loading...</div> : <table><thead><tr><th>#</th><th>Barcode</th><th>Product</th><th>Metal</th><th>Remaining Wt</th><th>Rate</th><th>Making</th><th>Stock Value</th></tr></thead><tbody>{stockRows.length ? stockRows.map((r, idx) => <tr key={r.stock_id}><td>{(stockPage-1)*limit+idx+1}</td><td>{r.barcode_no}</td><td><b>{r.product_name}</b><small>{r.batch_type}</small></td><td>{r.metal_name || "-"}</td><td>{wt(r.remaining_weight)}g</td><td>₹{money(r.rate_per_gram)}</td><td>₹{money(r.making_charge)}</td><td><b>₹{money(r.total_amount)}</b></td></tr>) : <tr><td colSpan="8" className="empty">No available stock</td></tr>}</tbody></table>}</div>
          )}

          <div className="pager">
            {activeTab === "sold" ? <><button disabled={soldPage <= 1} onClick={() => setSoldPage((p) => p - 1)}><FaChevronLeft /></button><b>Page {soldPage} / {soldPages || 1}</b><button disabled={soldPage >= soldPages} onClick={() => setSoldPage((p) => p + 1)}><FaChevronRight /></button></> : <><button disabled={stockPage <= 1} onClick={() => setStockPage((p) => p - 1)}><FaChevronLeft /></button><b>Page {stockPage} / {stockPages || 1}</b><button disabled={stockPage >= stockPages} onClick={() => setStockPage((p) => p + 1)}><FaChevronRight /></button></>}
          </div>
        </section>
      </div>
    </div>
  );
}
