import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaCrown,
  FaGem,
  FaLayerGroup,
  FaPlus,
  FaRecycle,
  FaSave,
  FaSearch,
  FaSpinner,
  FaTrash,
  FaEdit,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaBoxOpen,
  FaRing,
} from "react-icons/fa";
import BASE_URL from "./apiConfig";
import "./JewelleryMaster.css";

const API_URL = `${BASE_URL}/jewellery_master_api.php`;

const emptyMetal = { id: "", name: "" };
const emptySub = { id: "", main_cat_id: "", sub_name: "" };
const emptyPurity = { id: "", main_cat_id: "", purity_name: "", purity_percent: "" };
const emptyProduct = {
  id: "",
  metal_id: "",
  sub_cat_id: "",
  purity_id: "",
  product_name: "",
  hsn_code: "7113",
  default_making_charge: "0",
};

export default function JewelleryMaster() {
  const [activeTab, setActiveTab] = useState("metal");
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [search, setSearch] = useState("");

  const [metals, setMetals] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [purities, setPurities] = useState([]);
  const [products, setProducts] = useState([]);

  const [metalForm, setMetalForm] = useState(emptyMetal);
  const [subForm, setSubForm] = useState(emptySub);
  const [purityForm, setPurityForm] = useState(emptyPurity);
  const [productForm, setProductForm] = useState(emptyProduct);

  const showStatus = (type, msg) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus({ type: "", msg: "" }), 3500);
  };

  const request = async (action, payload = null, method = "post") => {
    const url = `${API_URL}?action=${action}`;
    if (method === "get") return axios.get(url);
    return axios.post(url, payload);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [m, s, p, pr] = await Promise.all([
        request("get_main", null, "get"),
        request("get_sub", null, "get"),
        request("get_purity", null, "get"),
        request("get_products", null, "get"),
      ]);
      setMetals(Array.isArray(m.data) ? m.data : []);
      setSubCategories(Array.isArray(s.data) ? s.data : []);
      setPurities(Array.isArray(p.data) ? p.data : []);
      setProducts(Array.isArray(pr.data) ? pr.data : []);
    } catch (error) {
      showStatus("error", "Server connection failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filteredSubForProduct = useMemo(() => {
    if (!productForm.metal_id) return [];
    return subCategories.filter((s) => String(s.main_cat_id) === String(productForm.metal_id));
  }, [productForm.metal_id, subCategories]);

  const filteredPurityForProduct = useMemo(() => {
    if (!productForm.metal_id) return [];
    return purities.filter((p) => String(p.main_cat_id) === String(productForm.metal_id));
  }, [productForm.metal_id, purities]);

  const resetForms = () => {
    setMetalForm(emptyMetal);
    setSubForm(emptySub);
    setPurityForm(emptyPurity);
    setProductForm(emptyProduct);
  };

  const handleSaveMetal = async (e) => {
    e.preventDefault();
    if (!metalForm.name.trim()) return showStatus("error", "Metal name required");
    setBtnLoading(true);
    try {
      const res = await request("save_main", metalForm);
      if (res.data.status === "success") {
        showStatus("success", metalForm.id ? "Metal updated" : "Metal added");
        setMetalForm(emptyMetal);
        loadAll();
      } else showStatus("error", res.data.message || "Failed");
    } catch {
      showStatus("error", "Save failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleSaveSub = async (e) => {
    e.preventDefault();
    if (!subForm.main_cat_id || !subForm.sub_name.trim()) return showStatus("error", "Metal and item type required");
    setBtnLoading(true);
    try {
      const res = await request("save_sub", subForm);
      if (res.data.status === "success") {
        showStatus("success", subForm.id ? "Item type updated" : "Item type added");
        setSubForm(emptySub);
        loadAll();
      } else showStatus("error", res.data.message || "Failed");
    } catch {
      showStatus("error", "Save failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleSavePurity = async (e) => {
    e.preventDefault();
    if (!purityForm.main_cat_id || !purityForm.purity_name.trim()) return showStatus("error", "Metal and purity required");
    setBtnLoading(true);
    try {
      const res = await request("save_purity", purityForm);
      if (res.data.status === "success") {
        showStatus("success", purityForm.id ? "Purity updated" : "Purity added");
        setPurityForm(emptyPurity);
        loadAll();
      } else showStatus("error", res.data.message || "Failed");
    } catch {
      showStatus("error", "Save failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.sub_cat_id || !productForm.product_name.trim()) return showStatus("error", "Category and product name required");
    setBtnLoading(true);
    try {
      const res = await request("save_product", productForm);
      if (res.data.status === "success") {
        showStatus("success", productForm.id ? "Product updated" : "Product added");
        setProductForm(emptyProduct);
        loadAll();
      } else showStatus("error", res.data.message || "Failed");
    } catch {
      showStatus("error", "Save failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (action, id) => {
    if (!window.confirm("Delete permanent?")) return;
    try {
      const res = await axios.get(`${API_URL}?action=${action}&id=${id}`);
      if (res.data.status === "success") {
        showStatus("success", "Deleted");
        loadAll();
      } else showStatus("error", res.data.message || "Delete failed");
    } catch {
      showStatus("error", "Delete failed");
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.product_name || "").toLowerCase().includes(q) ||
      (p.product_code || "").toLowerCase().includes(q) ||
      (p.metal_name || "").toLowerCase().includes(q) ||
      (p.category_name || "").toLowerCase().includes(q) ||
      (p.purity_name || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="jm-page">
      {status.msg && (
        <div className={`jm-alert ${status.type}`}>
          {status.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}
          <span>{status.msg}</span>
        </div>
      )}

      <div className="jm-container">
        <header className="jm-hero">
          <div className="jm-hero-icon"><FaCrown /></div>
          <div>
            <h1>Jewellery Master Control</h1>
            <p>Metal, item type, purity and product design in one smart panel</p>
          </div>
          <button className="jm-refresh" onClick={loadAll}><FaRecycle /> Refresh</button>
        </header>

        <div className="jm-tabs">
          <button className={activeTab === "metal" ? "active" : ""} onClick={() => setActiveTab("metal")}><FaGem /> Metal</button>
          <button className={activeTab === "sub" ? "active" : ""} onClick={() => setActiveTab("sub")}><FaRing /> Item Type</button>
          <button className={activeTab === "purity" ? "active" : ""} onClick={() => setActiveTab("purity")}><FaLayerGroup /> Purity</button>
          <button className={activeTab === "product" ? "active" : ""} onClick={() => setActiveTab("product")}><FaBoxOpen /> Product</button>
        </div>

        {loading ? (
          <div className="jm-loading"><FaSpinner className="spin" /> Loading master data...</div>
        ) : (
          <>
            {activeTab === "metal" && (
              <div className="jm-grid">
                <form className="jm-card jm-form" onSubmit={handleSaveMetal}>
                  <h2>{metalForm.id ? "Update Metal" : "Add Metal"}</h2>
                  <label>Metal / Main Category</label>
                  <input value={metalForm.name} onChange={(e) => setMetalForm({ ...metalForm, name: e.target.value })} placeholder="Gold, Silver, Diamond" />
                  <div className="jm-actions">
                    <button className="jm-primary" disabled={btnLoading}>{btnLoading ? <FaSpinner className="spin" /> : <FaSave />} Save</button>
                    {metalForm.id && <button type="button" className="jm-secondary" onClick={() => setMetalForm(emptyMetal)}><FaTimes /> Cancel</button>}
                  </div>
                </form>

                <div className="jm-card">
                  <h2>Metal List</h2>
                  <div className="jm-list">
                    {metals.map((m) => (
                      <div className="jm-row" key={m.id}>
                        <span className="jm-pill gold">{m.name}</span>
                        <div>
                          <button className="jm-icon edit" onClick={() => setMetalForm({ id: m.id, name: m.name })}><FaEdit /></button>
                          <button className="jm-icon delete" onClick={() => handleDelete("delete_main", m.id)}><FaTrash /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "sub" && (
              <div className="jm-grid">
                <form className="jm-card jm-form" onSubmit={handleSaveSub}>
                  <h2>{subForm.id ? "Update Item Type" : "Add Item Type"}</h2>
                  <label>Metal</label>
                  <select value={subForm.main_cat_id} onChange={(e) => setSubForm({ ...subForm, main_cat_id: e.target.value })}>
                    <option value="">Select metal</option>
                    {metals.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <label>Item Type / Sub Category</label>
                  <input value={subForm.sub_name} onChange={(e) => setSubForm({ ...subForm, sub_name: e.target.value })} placeholder="Ring, Chain, Necklace" />
                  <div className="jm-actions">
                    <button className="jm-primary" disabled={btnLoading}>{btnLoading ? <FaSpinner className="spin" /> : <FaSave />} Save</button>
                    {subForm.id && <button type="button" className="jm-secondary" onClick={() => setSubForm(emptySub)}><FaTimes /> Cancel</button>}
                  </div>
                </form>

                <div className="jm-card">
                  <h2>Item Type List</h2>
                  <table className="jm-table"><thead><tr><th>Metal</th><th>Item Type</th><th>Action</th></tr></thead><tbody>
                    {subCategories.map((s) => <tr key={s.id}><td><span className="jm-pill">{s.main_cat_name}</span></td><td>{s.sub_name}</td><td><button className="jm-icon edit" onClick={() => setSubForm({ id: s.id, main_cat_id: s.main_cat_id, sub_name: s.sub_name })}><FaEdit /></button><button className="jm-icon delete" onClick={() => handleDelete("delete_sub", s.id)}><FaTrash /></button></td></tr>)}
                  </tbody></table>
                </div>
              </div>
            )}

            {activeTab === "purity" && (
              <div className="jm-grid">
                <form className="jm-card jm-form" onSubmit={handleSavePurity}>
                  <h2>{purityForm.id ? "Update Purity" : "Add Purity"}</h2>
                  <label>Metal</label>
                  <select value={purityForm.main_cat_id} onChange={(e) => setPurityForm({ ...purityForm, main_cat_id: e.target.value })}>
                    <option value="">Select metal</option>
                    {metals.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <label>Purity Name</label>
                  <input value={purityForm.purity_name} onChange={(e) => setPurityForm({ ...purityForm, purity_name: e.target.value })} placeholder="22K, 18K, 92.5 Silver" />
                  <label>Purity Percent</label>
                  <input type="number" step="0.01" value={purityForm.purity_percent} onChange={(e) => setPurityForm({ ...purityForm, purity_percent: e.target.value })} placeholder="91.60" />
                  <div className="jm-actions">
                    <button className="jm-primary" disabled={btnLoading}>{btnLoading ? <FaSpinner className="spin" /> : <FaSave />} Save</button>
                    {purityForm.id && <button type="button" className="jm-secondary" onClick={() => setPurityForm(emptyPurity)}><FaTimes /> Cancel</button>}
                  </div>
                </form>

                <div className="jm-card">
                  <h2>Purity List</h2>
                  <table className="jm-table"><thead><tr><th>Metal</th><th>Purity</th><th>%</th><th>Action</th></tr></thead><tbody>
                    {purities.map((p) => <tr key={p.id}><td><span className="jm-pill">{p.main_cat_name}</span></td><td>{p.purity_name}</td><td>{p.purity_percent}</td><td><button className="jm-icon edit" onClick={() => setPurityForm({ id: p.id, main_cat_id: p.main_cat_id, purity_name: p.purity_name, purity_percent: p.purity_percent })}><FaEdit /></button><button className="jm-icon delete" onClick={() => handleDelete("delete_purity", p.id)}><FaTrash /></button></td></tr>)}
                  </tbody></table>
                </div>
              </div>
            )}

            {activeTab === "product" && (
              <div className="jm-grid product-grid">
                <form className="jm-card jm-form" onSubmit={handleSaveProduct}>
                  <h2>{productForm.id ? "Update Product" : "Add Product"}</h2>
                  <label>Metal</label>
                  <select value={productForm.metal_id} onChange={(e) => setProductForm({ ...productForm, metal_id: e.target.value, sub_cat_id: "", purity_id: "" })}>
                    <option value="">Select metal</option>
                    {metals.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <label>Item Type</label>
                  <select disabled={!productForm.metal_id} value={productForm.sub_cat_id} onChange={(e) => setProductForm({ ...productForm, sub_cat_id: e.target.value })}>
                    <option value="">{productForm.metal_id ? "Select item type" : "Select metal first"}</option>
                    {filteredSubForProduct.map((s) => <option key={s.id} value={s.id}>{s.sub_name}</option>)}
                  </select>
                  <label>Purity</label>
                  <select disabled={!productForm.metal_id} value={productForm.purity_id} onChange={(e) => setProductForm({ ...productForm, purity_id: e.target.value })}>
                    <option value="">Optional purity</option>
                    {filteredPurityForProduct.map((p) => <option key={p.id} value={p.id}>{p.purity_name}</option>)}
                  </select>
                  <label>Product / Design Name</label>
                  <input value={productForm.product_name} onChange={(e) => setProductForm({ ...productForm, product_name: e.target.value })} placeholder="Antique Ring, Handmade Bangles" />
                  <label>HSN Code</label>
                  <input value={productForm.hsn_code} onChange={(e) => setProductForm({ ...productForm, hsn_code: e.target.value })} />
                  <label>Default Making Charge</label>
                  <input type="number" step="0.01" value={productForm.default_making_charge} onChange={(e) => setProductForm({ ...productForm, default_making_charge: e.target.value })} />
                  <div className="jm-actions">
                    <button className="jm-primary" disabled={btnLoading}>{btnLoading ? <FaSpinner className="spin" /> : <FaSave />} Save</button>
                    {productForm.id && <button type="button" className="jm-secondary" onClick={() => setProductForm(emptyProduct)}><FaTimes /> Cancel</button>}
                  </div>
                </form>

                <div className="jm-card product-list">
                  <div className="jm-list-head">
                    <h2>Product List</h2>
                    <div className="jm-search"><FaSearch /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product, code, metal" /></div>
                  </div>
                  <table className="jm-table"><thead><tr><th>Code</th><th>Metal</th><th>Item</th><th>Purity</th><th>Product</th><th>HSN</th><th>Making</th><th>Action</th></tr></thead><tbody>
                    {filteredProducts.map((p) => <tr key={p.id}><td><span className="jm-pill gold">{p.product_code}</span></td><td>{p.metal_name}</td><td>{p.category_name}</td><td>{p.purity_name || "-"}</td><td><b>{p.product_name}</b></td><td>{p.hsn_code}</td><td>{p.default_making_charge}</td><td><button className="jm-icon edit" onClick={() => setProductForm({ id: p.id, metal_id: p.main_cat_id || "", sub_cat_id: p.sub_cat_id || "", purity_id: p.purity_id || "", product_name: p.product_name || "", hsn_code: p.hsn_code || "7113", default_making_charge: p.default_making_charge || "0" })}><FaEdit /></button><button className="jm-icon delete" onClick={() => handleDelete("delete_product", p.id)}><FaTrash /></button></td></tr>)}
                    {!filteredProducts.length && <tr><td colSpan="8" className="no-data">No products found</td></tr>}
                  </tbody></table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
