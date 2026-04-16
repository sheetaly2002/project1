import React, { useState, useEffect } from "react";
import { FaTrashAlt, FaPlus, FaEdit, FaPrint } from "react-icons/fa";
import "./App.css";

import BASE_URL from './apiConfig';
const API_URL = `${BASE_URL}/sales.php`;

const SalesForm = () => {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stockProducts, setStockProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingSale, setEditingSale] = useState(null);

  const [saleData, setSaleData] = useState({
    customer_id: "",
    bill_no: "",
    sale_date: new Date().toISOString().slice(0, 10),
    tax_type: "GST",
    tax_percent: 3,
    tax_amount: 0,
    total_amount: 0,
  });

  const [saleItems, setSaleItems] = useState([]);

  useEffect(() => {
    fetchSales();
    fetchCustomers();
    fetchStockProducts();
    fetchCategories();
  }, []);

  const fetchSales = () => {
    fetch(API_URL).then(res => res.json()).then(data => {
      if (data.status === "success") setSales(data.data);
    });
  };

  const fetchCustomers = () => {
    fetch(`${BASE_URL}/customers.php`).then(res => res.json()).then(data => {
      setCustomers(Array.isArray(data.customers) ? data.customers : []);
    });
  };

  const fetchCategories = () => {
    fetch(`${BASE_URL}/category.php`).then(res => res.json()).then(data => {
      // API check for both cases (array or object with key)
      const cats = Array.isArray(data) ? data : (data.categories || []);
      setCategories(cats);
    });
  };

  const fetchStockProducts = () => {
    fetch(`${BASE_URL}/stock.php?available=1`).then(res => res.json()).then(data => {
      setStockProducts(Array.isArray(data.data) ? data.data : []);
    });
  };

  const calculateItemTotal = (item) => {
    let baseAmount = (parseFloat(item.net_weight) || 0) * (parseFloat(item.rate_per_gram) || 0);
    let making = 0;
    if (item.making_charge_type === "percent") {
      making = baseAmount * ((parseFloat(item.making_charge) || 0) / 100);
    } else {
      making = parseFloat(item.making_charge || 0) * (parseFloat(item.quantity) || 1);
    }
    return parseFloat((baseAmount + making).toFixed(2));
  };

  const recalcGrandTotal = (items, taxPercent) => {
    const subTotal = items.reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0);
    const taxAmt = subTotal * ((parseFloat(taxPercent) || 0) / 100);
    setSaleData(prev => ({
      ...prev,
      tax_amount: parseFloat(taxAmt.toFixed(2)),
      total_amount: parseFloat((subTotal + taxAmt).toFixed(2)),
    }));
  };

  const handleProductChange = (index, stockId) => {
    const selected = stockProducts.find(p => p.stock_id.toString() === stockId.toString());
    const updated = [...saleItems];
    
    if (selected) {
      const unitWeight = parseFloat(selected.remaining_weight) / parseFloat(selected.remaining_qty);
      updated[index] = {
        ...updated[index],
        stock_id: selected.stock_id,
        product_id: selected.product_id,
        product_name: selected.product_name,
        max_qty: selected.remaining_qty, 
        unit_weight: unitWeight,
        quantity: 1,
        net_weight: unitWeight.toFixed(3),
        rate_per_gram: selected.purchase_rate || 0,
        making_charge: selected.purchase_making || 0,
        making_charge_type: "amount",
      };
      updated[index].total_amount = calculateItemTotal(updated[index]);
      setSaleItems(updated);
      recalcGrandTotal(updated, saleData.tax_percent);
    }
  };

  const updateItemField = (index, field, value) => {
    const updated = [...saleItems];
    
    // Logic for sequence selection
    if (field === "selected_cat") {
        updated[index].selected_cat = value;
        updated[index].selected_sub = ""; // Reset sub-cat
        updated[index].stock_id = "";    // Reset product
    } else if (field === "selected_sub") {
        updated[index].selected_sub = value;
        updated[index].stock_id = "";    // Reset product
    } else if (field === "quantity") {
      const qty = parseFloat(value) || 0;
      if (qty > updated[index].max_qty) {
        alert(`Limit: Only ${updated[index].max_qty} pieces in stock!`);
        return;
      }
      updated[index].quantity = qty;
      updated[index].net_weight = (updated[index].unit_weight * qty).toFixed(3);
    } else {
      updated[index][field] = value;
    }
    
    updated[index].total_amount = calculateItemTotal(updated[index]);
    setSaleItems(updated);
    recalcGrandTotal(updated, saleData.tax_percent);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (saleItems.length === 0) return alert("Add items!");
    fetch(API_URL, {
      method: editingSale ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...saleData, sale_items: saleItems, sale_id: editingSale }),
    }).then(res => res.json()).then(data => {
      alert(data.message);
      if (data.status === "success") window.location.reload();
    });
  };

  return (
    <div className="sales-container">
      <h2 className="title">{editingSale ? "Edit Bill" : "Jewellery Sales Invoice"}</h2>
      
      <form className="sale-form" onSubmit={handleSubmit}>
        <div className="sale-info grid-3">
          <div className="field">
            <select required value={saleData.customer_id} onChange={(e) => setSaleData({ ...saleData, customer_id: e.target.value })}>
              <option value="">Select Custovvvvmer</option>
              {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.customer_name}</option>)}
            </select>
            <label>Cuggstomer</label>
          </div>
          <div className="field">
            <input type="text" placeholder=" " value={saleData.bill_no} onChange={(e) => setSaleData({ ...saleData, bill_no: e.target.value })} />
            <label>Bill No</label>
          </div>
          <div className="field">
            <input type="date" value={saleData.sale_date} onChange={(e) => setSaleData({ ...saleData, sale_date: e.target.value })} />
            <label>Date</label>
          </div>
        </div>

        <div className="items-section">
          {saleItems.map((item, idx) => (
            <div className="item-card shadow" key={idx}>
              <div className="grid-5-items">
                {/* 1. CATEGORY */}
                <div className="field">
                  <select value={item.selected_cat} onChange={(e) => updateItemField(idx, "selected_cat", e.target.value)}>
                    <option value="">Category</option>
                    {[...new Set(categories.map(c => c.category_name))].map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>

                {/* 2. SUB-CATEGORY */}
                <div className="field">
                  <select value={item.selected_sub} onChange={(e) => updateItemField(idx, "selected_sub", e.target.value)}>
                    <option value="">Sub-Category</option>
                    {categories
                      .filter(c => c.category_name === item.selected_cat)
                      .map(c => <option key={c.id} value={c.subcategory_name}>{c.subcategory_name}</option>)}
                  </select>
                </div>

                {/* 3. PRODUCT FROM STOCK */}
                <div className="field product-select">
                  <select value={item.stock_id} onChange={(e) => handleProductChange(idx, e.target.value)}>
                    <option value="">Select Product</option>
                    {stockProducts
                      .filter(p => p.category_name === item.selected_cat && p.subcategory_name === item.selected_sub)
                      .map(p => (
                        <option key={p.stock_id} value={p.stock_id}>
                          {p.product_name} ({p.remaining_qty} pcs)
                        </option>
                      ))}
                  </select>
                </div>

                <div className="field">
                  <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItemField(idx, "quantity", e.target.value)} />
                </div>

                <div className="field">
                  <input type="number" placeholder="Weight" value={item.net_weight} readOnly className="readonly-input" />
                </div>
              </div>

              {item.stock_id && (
                <div className="grid-4 mt-10">
                  <div className="field">
                    <input type="number" placeholder="Rate/g" value={item.rate_per_gram} onChange={(e) => updateItemField(idx, "rate_per_gram", e.target.value)} />
                  </div>
                  <div className="field">
                    <select value={item.making_charge_type} onChange={(e) => updateItemField(idx, "making_charge_type", e.target.value)}>
                      <option value="amount">Fixed</option>
                      <option value="percent">%</option>
                    </select>
                  </div>
                  <div className="field">
                    <input type="number" placeholder="Making" value={item.making_charge} onChange={(e) => updateItemField(idx, "making_charge", e.target.value)} />
                  </div>
                  <div className="total-badge">
                    ₹{item.total_amount}
                    <button type="button" className="del-btn" onClick={() => {
                        const updated = saleItems.filter((_, i) => i !== idx);
                        setSaleItems(updated);
                        recalcGrandTotal(updated, saleData.tax_percent);
                    }}><FaTrashAlt /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button type="button" className="add-item-btn" onClick={() => setSaleItems([...saleItems, {selected_cat: "", selected_sub: "", stock_id: "", quantity: 0, net_weight: 0, total_amount: 0}])}>
          <FaPlus /> Add New Item
        </button>

        <div className="footer-bar shadow">
          <div className="tax-area">
            GST (%): <input type="number" value={saleData.tax_percent} onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              setSaleData({...saleData, tax_percent: val});
              recalcGrandTotal(saleItems, val);
            }} />
          </div>
          <div className="grand-total-text">
            Grand Total: <span>₹{saleData.total_amount}</span>
          </div>
          <button type="submit" className="save-btn">Save & Print</button>
        </div>
      </form>
    </div>
  );
};

export default SalesForm;