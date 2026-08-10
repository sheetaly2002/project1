import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaBarcode, FaBoxOpen, FaChevronLeft, FaChevronRight, FaEdit,
  FaEye, FaFilter, FaGem, FaPrint, FaRecycle, FaRupeeSign,
  FaSearch, FaSpinner, FaTimes, FaTrash, FaWeightHanging
} from "react-icons/fa";
import BASE_URL from "./apiConfig";
import "./StockEntryForm.css";

const API_URL = `${BASE_URL}/stock_inventory_api.php`;
const money = (v) => Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const weight = (v) => Number(v || 0).toFixed(3);

export default function StockInventory() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [masters, setMasters] = useState({ metals: [], item_types: [], products: [], purities: [] });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ type: "", msg: "" });
  const [filters, setFilters] = useState({ search: "", metal_id: "all", item_type_id: "all", product_id: "all", status: "all", batch_type: "all" });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const show = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast({ type: "", msg: "" }), 3500);
  };

  const loadMasters = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}?action=masters`);
      if (res.data.status === "success") setMasters(res.data);
    } catch {
      show("error", "Master data load failed");
    }
  }, []);

  const loadStock = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ action: "list", page, limit, ...filters });
      const res = await axios.get(`${API_URL}?${params.toString()}`);
      if (res.data.status === "success") {
        setRows(res.data.data || []);
        setSummary(res.data.summary || {});
        setPages(res.data.pagination?.pages || 1);
        setTotal(res.data.pagination?.total || 0);
      } else show("error", res.data.message || "Stock load failed");
    } catch {
      show("error", "Server connection failed");
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => { loadMasters(); }, [loadMasters]);
  useEffect(() => { loadStock(); }, [loadStock]);

  const filteredItems = useMemo(() => {
    if (filters.metal_id === "all") return masters.item_types || [];
    return (masters.item_types || []).filter((x) => String(x.main_cat_id) === String(filters.metal_id));
  }, [masters.item_types, filters.metal_id]);

  const filteredProducts = useMemo(() => {
    if (filters.item_type_id === "all") return masters.products || [];
    return (masters.products || []).filter((x) => String(x.sub_category_id) === String(filters.item_type_id));
  }, [masters.products, filters.item_type_id]);

  const updateFilter = (key, val) => {
    setPage(1);
    setFilters((p) => {
      const next = { ...p, [key]: val };
      if (key === "metal_id") {
        next.item_type_id = "all";
        next.product_id = "all";
      }
      if (key === "item_type_id") next.product_id = "all";
      return next;
    });
  };

  const resetFilters = () => {
    setPage(1);
    setFilters({ search: "", metal_id: "all", item_type_id: "all", product_id: "all", status: "all", batch_type: "all" });
  };

  const fixBarcodes = async () => {
    try {
      const res = await axios.get(`${API_URL}?action=fix_missing_barcodes`);
      show(res.data.status === "success" ? "success" : "error", res.data.message || "Done");
      loadStock();
    } catch {
      show("error", "Barcode fix failed");
    }
  };

  const openEdit = (item) => {
    if (item.stock_status !== "AVAILABLE") return show("error", "Sold item edit nahi ho sakta");
    setEditItem({
      stock_id: item.stock_id,
      barcode_no: item.barcode_no,
      product_name: item.product_name,
      net_weight: item.net_weight || "",
      rate_per_gram: item.rate_per_gram || "",
      making_charge: item.making_charge || "0",
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post(`${API_URL}?action=update`, editItem);
      if (res.data.status === "success") {
        show("success", "Stock updated");
        setEditItem(null);
        loadStock();
      } else show("error", res.data.message || "Update failed");
    } catch {
      show("error", "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const del = async (item) => {
    if (item.stock_status !== "AVAILABLE") return show("error", "Sold item delete nahi ho sakta");
    if (item.batch_type !== "opening") return show("error", "Purchase stock purchase module se manage karo");
    if (!window.confirm(`Delete barcode ${item.barcode_no}?`)) return;
    try {
      const res = await axios.delete(API_URL, { data: { stock_id: item.stock_id } });
      if (res.data.status === "success") {
        show("success", "Stock deleted");
        loadStock();
      } else show("error", res.data.message || "Delete failed");
    } catch {
      show("error", "Delete failed");
    }
  };

  const barcodeHtml = (item) => `
    <html><head><title>${item.barcode_no}</title><style>
      @page{size:70mm 35mm;margin:3mm}body{font-family:Arial;margin:0;color:#17130f}.tag{height:29mm;border:1.5px solid #b88a2b;border-radius:8px;display:flex;overflow:hidden}.brand{width:28mm;background:#17130f;color:#d4af37;display:flex;align-items:center;justify-content:center;flex-direction:column;font-weight:900}.brand small{font-size:8px;color:white;margin-top:3px}.info{flex:1;text-align:center;padding:4px;display:flex;flex-direction:column;justify-content:center}.info b{font-size:10px}.info span{font-size:9px;margin:2px}.info img{height:28px;margin:2px auto;max-width:130px}.code{font-family:monospace;font-size:8px}
    </style></head><body><div class="tag"><div class="brand">JEWEL<small>${item.metal_name || ""}</small></div><div class="info"><b>${item.product_name || "Item"}</b><span>Net: ${weight(item.net_weight)}g</span><img src="https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(item.barcode_no)}&scale=2&height=10"/><div class="code">${item.barcode_no}</div></div></div><script>window.onload=()=>setTimeout(()=>{window.print();window.close()},400)</script></body></html>`;

  const printBarcode = (item) => {
    const w = window.open("", "_blank");
    w.document.write(barcodeHtml(item));
    w.document.close();
  };

  return (
    <div className="si-page">
      {toast.msg && <div className={`si-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="si-container">
        <header className="si-hero">
          <div className="si-hero-icon"><FaBoxOpen /></div>
          <div>
            <h1>Stock Inventory</h1>
            <p>Barcode wise jewellery stock, weight, value and availability control</p>
          </div>
          <button className="si-refresh" onClick={loadStock}><FaRecycle /> Refresh</button>
        </header>

        <section className="si-stats">
          <div className="stat-card"><FaBoxOpen /><span>Total Items</span><strong>{summary.total_items || 0}</strong></div>
          <div className="stat-card"><FaWeightHanging /><span>Total Weight</span><strong>{weight(summary.total_net_weight)}g</strong></div>
          <div className="stat-card"><FaGem /><span>Available</span><strong>{summary.available_items || 0}</strong></div>
          <div className="stat-card"><FaRupeeSign /><span>Stock Value</span><strong>₹{money(summary.total_value)}</strong></div>
        </section>

        <section className="si-card">
          <div className="si-toolbar">
            <div className="si-search"><FaSearch /><input value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} placeholder="Search barcode, product, metal..." /></div>
            <button className="si-fix" onClick={fixBarcodes}><FaBarcode /> Fix Missing Barcode</button>
          </div>

          <div className="si-filters">
            <select value={filters.metal_id} onChange={(e) => updateFilter("metal_id", e.target.value)}><option value="all">All Metals</option>{(masters.metals || []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
            <select value={filters.item_type_id} onChange={(e) => updateFilter("item_type_id", e.target.value)}><option value="all">All Item Types</option>{filteredItems.map((i) => <option key={i.id} value={i.id}>{i.sub_name}</option>)}</select>
            <select value={filters.product_id} onChange={(e) => updateFilter("product_id", e.target.value)}><option value="all">All Products</option>{filteredProducts.map((p) => <option key={p.product_id} value={p.product_id}>{p.product_name}</option>)}</select>
            <select value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}><option value="all">All Status</option><option value="available">Available</option><option value="sold">Sold</option></select>
            <select value={filters.batch_type} onChange={(e) => updateFilter("batch_type", e.target.value)}><option value="all">All Sources</option><option value="opening">Opening</option><option value="purchase">Purchase</option></select>
            <button className="si-clear" onClick={resetFilters}><FaFilter /> Clear</button>
          </div>

          <div className="si-table-wrap">
            {loading ? <div className="si-loader"><FaSpinner className="spin" /> Loading stock...</div> : (
              <table className="si-table">
                <thead><tr><th>#</th><th>Product</th><th>Metal / Type</th><th>Weight</th><th>Rate</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {rows.length ? rows.map((item, idx) => (
                    <tr key={item.stock_id}>
                      <td>{(page - 1) * limit + idx + 1}</td>
                      {/* <td><button className="barcode-btn" onClick={() => printBarcode(item)}><FaBarcode /> {item.barcode_no}</button><small>{item.batch_type}</small></td> */}
                      <td><b>{item.product_name || "-"}</b><small>HSN {item.product_hsn || item.hsn_code || "-"}</small></td>
                      <td><b>{item.metal_name || "-"}</b><small>{item.item_type_name || "-"}</small></td>
                      <td><b>{weight(item.net_weight)}g</b><small>Remain {weight(item.remaining_weight)}g</small></td>
                      <td>₹{money(item.rate_per_gram)}<small>Making ₹{money(item.making_charge)}</small></td>
                      <td><b>₹{money(item.total_amount)}</b></td>
                      <td><span className={`status ${item.stock_status?.toLowerCase()}`}>{item.stock_status}</span></td>
                      <td><div className="si-actions"><button onClick={() => setViewItem(item)}><FaEye /></button><button onClick={() => printBarcode(item)}><FaPrint /></button><button disabled={item.stock_status !== "AVAILABLE"} onClick={() => openEdit(item)}><FaEdit /></button><button disabled={item.stock_status !== "AVAILABLE" || item.batch_type !== "opening"} onClick={() => del(item)}><FaTrash /></button></div></td>
                    </tr>
                  )) : <tr><td colSpan="9" className="no-data">No stock found</td></tr>}
                </tbody>
              </table>
            )}
          </div>

          <div className="si-pagination">
            <span>Total {total} records</span>
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}><option value="10">10 / page</option><option value="25">25 / page</option><option value="50">50 / page</option></select>
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><FaChevronLeft /></button>
            <b>Page {page} / {pages || 1}</b>
            <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}><FaChevronRight /></button>
          </div>
        </section>
      </div>

      {viewItem && <div className="si-modal"><div className="si-dialog"><button className="close" onClick={() => setViewItem(null)}><FaTimes /></button><h2>Stock Details</h2><div className="detail-grid"><span>Barcode</span><b>{viewItem.barcode_no}</b><span>Product</span><b>{viewItem.product_name}</b><span>Metal</span><b>{viewItem.metal_name}</b><span>Item Type</span><b>{viewItem.item_type_name}</b><span>Net Weight</span><b>{weight(viewItem.net_weight)}g</b><span>Rate</span><b>₹{money(viewItem.rate_per_gram)}</b><span>Making</span><b>₹{money(viewItem.making_charge)}</b><span>Total</span><b>₹{money(viewItem.total_amount)}</b><span>Status</span><b>{viewItem.stock_status}</b></div></div></div>}

      {editItem && <div className="si-modal"><form className="si-dialog edit" onSubmit={saveEdit}><button type="button" className="close" onClick={() => setEditItem(null)}><FaTimes /></button><h2>Edit Unsold Stock</h2><p>{editItem.product_name} • {editItem.barcode_no}</p><label>Net Weight<input type="number" step="0.001" value={editItem.net_weight} onChange={(e) => setEditItem({ ...editItem, net_weight: e.target.value })} /></label><label>Rate / Gram<input type="number" step="0.01" value={editItem.rate_per_gram} onChange={(e) => setEditItem({ ...editItem, rate_per_gram: e.target.value })} /></label><label>Making Charge<input type="number" step="0.01" value={editItem.making_charge} onChange={(e) => setEditItem({ ...editItem, making_charge: e.target.value })} /></label><div className="edit-total">Total: ₹{money((Number(editItem.net_weight || 0) * Number(editItem.rate_per_gram || 0)) + Number(editItem.making_charge || 0))}</div><button className="save" disabled={saving}>{saving ? <FaSpinner className="spin" /> : "Save Changes"}</button></form></div>}
    </div>
  );
}
