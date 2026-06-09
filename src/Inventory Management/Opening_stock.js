import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import {
  FaBarcode, FaBoxOpen, FaChevronLeft, FaChevronRight, FaCrown, FaPlus,
  FaPrint, FaRupeeSign, FaSearch, FaSpinner, FaTimes, FaTrash, FaGem,
  FaCheckCircle, FaExclamationCircle
} from "react-icons/fa";
import BASE_URL from "./apiConfig";
import "./OpeningStock.css";

const API = `${BASE_URL}/opening_stock.php`;
const today = new Date().toISOString().slice(0, 10);
const emptyCommon = { entry_date: today, metal_id: "", sub_cat_id: "", product_id: "", purity: "", making_type: "amount" };
const emptyPiece = { net_weight: "", rate_per_gram: "", making_value: "0" };

export default function OpeningStock() {
  const [metals, setMetals] = useState([]);
  const [subs, setSubs] = useState([]);
  const [products, setProducts] = useState([]);
  const [purities, setPurities] = useState([]);
  const [stock, setStock] = useState([]);
  const [common, setCommon] = useState(emptyCommon);
  const [pieces, setPieces] = useState([{ ...emptyPiece }]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });
  const [search, setSearch] = useState("");
  const [filterMetal, setFilterMetal] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const perPage = 10;

  const notify = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), 3500);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [m, list] = await Promise.all([
        axios.get(`${API}?action=masters`),
        axios.get(API)
      ]);
      const md = m.data || {};
      setMetals(md.metals || []);
      setSubs(md.subs || []);
      setProducts(md.products || []);
      setPurities(md.purities || []);
      setStock(list.data?.data || []);
    } catch {
      notify("error", "Opening stock data load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const selectedMetalName = useMemo(
    () => metals.find(m => String(m.id) === String(common.metal_id))?.name || "",
    [metals, common.metal_id]
  );

  const filteredSubs = useMemo(
    () => subs.filter(s => String(s.main_cat_id) === String(common.metal_id)),
    [subs, common.metal_id]
  );

  const filteredProducts = useMemo(
    () => products.filter(p => String(p.sub_cat_id) === String(common.sub_cat_id)),
    [products, common.sub_cat_id]
  );

  const filteredPurities = useMemo(
    () => purities.filter(p => String(p.main_cat_id) === String(common.metal_id)),
    [purities, common.metal_id]
  );

  const fetchRate = useCallback(async (metalId, purityText) => {
    if (!metalId) return;
    try {
      const res = await axios.get(`${API}?action=rate&main_cat_id=${metalId}&purity=${encodeURIComponent(purityText || "")}`);
      const rate = Number(res.data?.rate || 0);
      if (rate > 0) {
        setPieces(prev => prev.map(p => ({ ...p, rate_per_gram: p.rate_per_gram || String(rate) })));
        notify("success", `${selectedMetalName || "Metal"} rate auto-filled`);
      } else {
        notify("error", "Selected metal/purity ka rate nahi mila. Rate Master me rate add karo.");
      }
    } catch {
      notify("error", "Rate fetch failed");
    }
  }, [selectedMetalName]);

  useEffect(() => {
    if (common.metal_id) fetchRate(common.metal_id, common.purity);
  }, [common.metal_id, common.purity, fetchRate]);

  const reset = () => {
    setCommon(emptyCommon);
    setPieces([{ ...emptyPiece }]);
    setShowForm(false);
  };

  const updateCommon = (patch) => setCommon(prev => ({ ...prev, ...patch }));

  const selectMetal = (id) => {
    updateCommon({ metal_id: id, sub_cat_id: "", product_id: "", purity: "" });
    setPieces([{ ...emptyPiece }]);
  };

  const setPiece = (idx, key, value) => {
    setPieces(prev => prev.map((p, i) => i === idx ? { ...p, [key]: value } : p));
  };

  const addPiece = () => setPieces(prev => [...prev, { ...emptyPiece, rate_per_gram: prev[0]?.rate_per_gram || "" }]);
  const removePiece = (idx) => setPieces(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx));

  const createRowsByQty = (qty) => {
    const n = Math.max(1, Number(qty || 1));
    const rate = pieces[0]?.rate_per_gram || "";
    setPieces(Array.from({ length: n }, () => ({ ...emptyPiece, rate_per_gram: rate })));
  };

  const rowTotal = (p) => {
    const net = Number(p.net_weight || 0);
    const rate = Number(p.rate_per_gram || 0);
    const mv = Number(p.making_value || 0);
    const making = common.making_type === "percent" ? ((net * rate) * mv / 100) : mv;
    return { making, total: (net * rate) + making };
  };

  const save = async (e) => {
    e.preventDefault();
    if (!common.metal_id) return notify("error", "Metal select karo");
    if (!common.sub_cat_id) return notify("error", "Item Type select karo");
    if (!common.product_id) return notify("error", "Product select karo");
    if (pieces.some(p => Number(p.net_weight) <= 0)) return notify("error", "Har piece ka Net Weight daalo");
    if (pieces.some(p => Number(p.rate_per_gram) <= 0)) return notify("error", "Rate per gram required");

    setSaving(true);
    try {
      const res = await axios.post(API, { ...common, items: pieces });
      if (res.data.status === "success") {
        notify("success", res.data.message || "Opening stock saved");
        reset();
        loadAll();
      } else notify("error", res.data.message || "Save failed");
    } catch (err) {
      notify("error", err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const del = async (item) => {
    if (!window.confirm("Delete this stock item?")) return;
    const res = await axios.delete(API, { data: { opening_stock_id: item.opening_stock_id } });
    if (res.data.status === "success") { notify("success", "Deleted"); loadAll(); }
    else notify("error", res.data.message || "Delete failed");
  };

const buildTagHtml = (item) => {
  const barcodeText = item.barcode_no || `SJ-${item.stock_id}`;
  const logoUrl = "/Bar-code Logo.jpeg";

  return `
    <div class="tag-wrapper">
      <div class="side-brand">
        <div class="shop-title">श्रीजी ज्वेलर्स</div>
        <div class="logo-wrap">
          <img class="logo-icon" src="${logoUrl}" />
        </div>
        <div class="hallmark-line">916 Hallmark</div>
      </div>

      <div class="side-info">
        <div class="item-line">${item.product_name || ""}</div>
        <div class="weight-line">
          <span>Wt:</span> ${Number(item.net_weight || 0).toFixed(3)}g
        </div>
        <div class="barcode-area">
          <img
            class="barcode-img"
            src="https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(barcodeText)}&scale=3&height=14"
          />
          <div class="barcode-txt">${barcodeText}</div>
        </div>
      </div>
    </div>
  `;
};

const handlePrintTags = (items) => {
  const printItems = Array.isArray(items) ? items : [items];
  if (!printItems.length) {
    notify("error", "Print ke liye barcode select karo");
    return;
  }

  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
  <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@700;900&family=Cinzel:wght@700&family=Inter:wght@400;700;900&display=swap" rel="stylesheet">

      <style>
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        @page { size: A4; margin: 5mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { width: 210mm; background: #fff; padding: 4mm; font-family: 'Inter', sans-serif; }
        .tags-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; align-items: start; }
        .tag-wrapper { width: 55mm; height: 22mm; display: flex; overflow: hidden; border-radius: 8px; background: linear-gradient(135deg,#1c1108,#3b230d,#1d1209); border: 1.2px solid #d4af37; box-shadow: 0 0 6px rgba(212,175,55,.35); page-break-inside: avoid; break-inside: avoid; }
        .side-brand { width: 18mm; background: radial-gradient(circle,#4b2b10,#1b1108); display: flex; flex-direction: column; justify-content: center; align-items: center; border-right: 1px solid rgba(212,175,55,.4); padding: .5mm; }
        .shop-title { font-family: 'Noto Sans Devanagari', sans-serif; font-size: 8px; font-weight: 900; color: #ffd96b; text-align: center; line-height: 1.05; margin-bottom: .5mm; }
        .logo-wrap { width: 13mm; height: 13mm; border-radius: 50%; overflow: hidden; border: 1.2px solid #d4af37; background: linear-gradient(135deg,#41240d,#221208); display: flex; justify-content: center; align-items: center; box-shadow: 0 0 5px rgba(212,175,55,.45); }
        .logo-icon { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .hallmark-line { margin-top: .5mm; font-size: 3.5px; font-weight: 900; color: #f7d36a; text-align: center; letter-spacing: .2px; }
        .side-info { width: 34mm; padding: .8mm 1mm; background: linear-gradient(135deg,#fff9f0,#f6e5c3); display: flex; flex-direction: column; justify-content: center; }
        .item-line { font-size: 5.5px; font-weight: 900; color: #241507; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .weight-line { font-size: 5px; font-weight: 800; color: #6b4314; margin-top: .4mm; }
        .weight-line span { color: #9a6d2f; }
        .barcode-area { margin-top: .6mm; background: linear-gradient(135deg,#b5be5f,#4d2b11); border-radius: 4px; padding: .35mm; border: 1px solid rgba(212,175,55,.4); text-align: center; }
        .barcode-img { width: 100%; max-width: 34mm; height: 8.5mm; background: #fff; border-radius: 2px; padding: .5px; object-fit: contain; }
        .barcode-txt { margin-top: .2mm; font-size: 4.2px; line-height: 1; font-family: monospace; font-weight: 900; color: #f7d36a; letter-spacing: .2px; }
      </style>
    </head>
    <body>
      <div class="tags-container">
        ${printItems.map(buildTagHtml).join("")}
      </div>
      <script>
        window.onload = function () { setTimeout(() => { window.print(); window.close(); }, 500); };
      </script>
    </body>
  </html>
  `);

  printWindow.document.close();
};

const handlePrintSelected = () => {
  const selectedItems = filtered.filter((item) => selectedIds.includes(String(item.stock_id)));
  handlePrintTags(selectedItems);
};

const toggleSelect = (id) => {
  const key = String(id);
  setSelectedIds((prev) => prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]);
};

const toggleSelectAllCurrent = (checked) => {
  const currentIds = current.map((item) => String(item.stock_id));
  setSelectedIds((prev) => {
    if (checked) return Array.from(new Set([...prev, ...currentIds]));
    return prev.filter((id) => !currentIds.includes(id));
  });
};





  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return stock.filter(i => {
      const s = `${i.barcode_no || ""} ${i.product_name || ""} ${i.metal_name || ""} ${i.item_type || ""}`.toLowerCase().includes(q);
      const m = filterMetal === "all" || String(i.main_cat_id) === String(filterMetal);
      return s && m;
    });
  }, [stock, search, filterMetal]);

  const pages = Math.ceil(filtered.length / perPage);
  const current = filtered.slice((page - 1) * perPage, page * perPage);
  const totalWeight = filtered.reduce((a, b) => a + Number(b.net_weight || 0), 0);
  const totalValue = filtered.reduce((a, b) => a + Number(b.total_amount || 0), 0);
  const money = v => Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="os-page">
      {toast.message && <div className={`os-toast ${toast.type}`}>{toast.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />} {toast.message}</div>}
      <div className="os-container">
        <header className="os-hero">
          <div className="os-logo"><FaCrown /></div>
          <div>
            <h1>Opening Stock</h1>
            <p>Simple jewellery stock entry with auto rate, multiple pieces and separate barcode.</p>
          </div>
          <button onClick={() => setShowForm(true)}><FaPlus /> Add Stock</button>
        </header>

        <section className="os-stats">
          <div><FaBoxOpen /><span>Total Items</span><b>{stock.length}</b></div>
          <div><FaGem /><span>Net Weight</span><b>{totalWeight.toFixed(3)}g</b></div>
          <div><FaRupeeSign /><span>Total Value</span><b>₹{money(totalValue)}</b></div>
        </section>

        <section className="os-card">
          <div className="os-toolbar">
            <div className="os-search"><FaSearch /><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search barcode, product, metal..." /></div>
            <select value={filterMetal} onChange={e => { setFilterMetal(e.target.value); setPage(1); }}>
              <option value="all">All Metals</option>
              {metals.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            {selectedIds.length > 0 && (
              <button className="print-selected-btn" onClick={handlePrintSelected}>
                <FaPrint /> Print Selected ({selectedIds.length})
              </button>
            )}
          </div>

          <div className="os-table-wrap">
            {loading ? <div className="os-loader"><FaSpinner className="spin" /> Loading...</div> : (
              <table className="os-table">
                <thead><tr><th><input type="checkbox" checked={current.length > 0 && current.every(i => selectedIds.includes(String(i.stock_id)))} onChange={e => toggleSelectAllCurrent(e.target.checked)} /></th><th>#</th><th>Barcode</th><th>Product</th><th>Metal</th><th>Net Wt</th><th>Rate</th><th>Making</th><th>Total</th><th>Action</th></tr></thead>
                <tbody>
                  {current.length ? current.map((i, idx) => (
                    <tr key={i.stock_id} className={selectedIds.includes(String(i.stock_id)) ? "selected-row" : ""}>
                      <td><input type="checkbox" checked={selectedIds.includes(String(i.stock_id))} onChange={() => toggleSelect(i.stock_id)} /></td>
                      <td>{(page - 1) * perPage + idx + 1}</td>
                      <td><b className="code"><FaBarcode /> {i.barcode_no}</b></td>
                      <td><strong>{i.product_name}</strong><small>{i.item_type || "-"}</small></td>
                      <td>{i.metal_name || "-"}</td>
                      <td>{Number(i.net_weight || 0).toFixed(3)}g</td>
                      <td>₹{money(i.rate_per_gram)}</td>
                      <td>₹{money(i.making_charge)}</td>
                      <td><b>₹{money(i.total_amount)}</b></td>
                      <td><div className="os-actions"><button onClick={() => handlePrintTags(i)}><FaPrint /></button><button className="danger" onClick={() => del(i)}><FaTrash /></button></div></td>
                    </tr>
                  )) : <tr><td colSpan="10" className="empty">No opening stock found</td></tr>}
                </tbody>
              </table>
            )}
          </div>

          <div className="os-pagination">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}><FaChevronLeft /></button>
            <span>Page {page} / {pages || 1}</span>
            <button disabled={page === pages || pages === 0} onClick={() => setPage(p => p + 1)}><FaChevronRight /></button>
          </div>
        </section>

        {showForm && (
          <div className="os-modal">
            <form className="os-drawer" onSubmit={save}>
              <div className="drawer-head"><h2>Add Opening Stock</h2><button type="button" onClick={reset}><FaTimes /></button></div>

              <div className="form-grid">
                <label>Entry Date<input type="date" value={common.entry_date} onChange={e => updateCommon({ entry_date: e.target.value })} /></label>
                <label>Metal<select value={common.metal_id} onChange={e => selectMetal(e.target.value)}>
                  <option value="">Select Metal</option>{metals.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select></label>
                <label>Item Type<select disabled={!common.metal_id} value={common.sub_cat_id} onChange={e => updateCommon({ sub_cat_id: e.target.value, product_id: "" })}>
                  <option value="">{common.metal_id ? "Select Item Type" : "Select metal first"}</option>{filteredSubs.map(s => <option key={s.id} value={s.id}>{s.sub_name}</option>)}
                </select>{common.metal_id && filteredSubs.length === 0 && <small className="warn">No item type found for this metal.</small>}</label>
                <label>Product<select disabled={!common.sub_cat_id} value={common.product_id} onChange={e => updateCommon({ product_id: e.target.value })}>
                  <option value="">{common.sub_cat_id ? "Select Product" : "Select item type first"}</option>{filteredProducts.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}
                </select>{common.sub_cat_id && filteredProducts.length === 0 && <small className="warn">Please add Product first.</small>}</label>
                <label>Purity<select value={common.purity} onChange={e => updateCommon({ purity: e.target.value })}>
                  <option value="">Standard / No Purity</option>
                  {filteredPurities.map((p, idx) => <option key={`${p.purity_name}-${idx}`} value={p.purity_name}>{p.purity_name}</option>)}
                </select></label>
                <label>Making Type<select value={common.making_type} onChange={e => updateCommon({ making_type: e.target.value })}>
                  <option value="amount">Direct Amount</option><option value="percent">Percent (%)</option>
                </select></label>
              </div>

              <div className="qty-row">
                <span>How many pieces?</span>
                <input type="number" min="1" defaultValue={pieces.length} onBlur={e => createRowsByQty(e.target.value)} />
                <button type="button" onClick={addPiece}><FaPlus /> Add Row</button>
              </div>

              <div className="piece-list">
                {pieces.map((p, idx) => {
                  const calc = rowTotal(p);
                  return <div className="piece" key={idx}>
                    <div className="piece-title"><b>Piece {idx + 1}</b>{pieces.length > 1 && <button type="button" onClick={() => removePiece(idx)}><FaTrash /></button>}</div>
                    <div className="piece-grid">
                      <label>Net Weight (g)<input type="number" step="0.001" value={p.net_weight} onChange={e => setPiece(idx, "net_weight", e.target.value)} placeholder="5.000" /></label>
                      <label>Rate / Gram<input type="number" step="0.01" value={p.rate_per_gram} onChange={e => setPiece(idx, "rate_per_gram", e.target.value)} placeholder="Auto from Rate Master" /></label>
                      <label>{common.making_type === "percent" ? "Making %" : "Making Amount"}<input type="number" step="0.01" value={p.making_value} onChange={e => setPiece(idx, "making_value", e.target.value)} /></label>
                      <div className="total-box"><span>Total</span><b>₹{money(calc.total)}</b></div>
                    </div>
                  </div>;
                })}
              </div>

              <button className="save-btn" disabled={saving}>{saving ? <FaSpinner className="spin" /> : `Save ${pieces.length} Piece${pieces.length > 1 ? "s" : ""} & Generate Barcode`}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}