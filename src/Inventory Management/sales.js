import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  FaBarcode, FaCheckCircle, FaChevronLeft, FaChevronRight, FaCrown,
  FaExclamationCircle, FaFileInvoice, FaPrint, FaReceipt, FaRecycle,
  FaRupeeSign, FaSave, FaSearch, FaSpinner, FaTimes, FaTrash, FaUser
} from "react-icons/fa";
import BASE_URL from "./apiConfig";
import "./salesManager.css";


const API = `${BASE_URL}/sales_billing_api.php`;
const today = new Date().toISOString().slice(0, 10);

const emptyBill = {
  customer_id: "",
  walkin_name: "Walk-in Customer",
  walkin_mobile: "",
  sale_date: today,
  tax_percent: "3",
  discount_amount: "0",
  paid_amount: "0",
  payment_mode: "Cash",
};

export default function SalesBilling() {
  const [customers, setCustomers] = useState([]);
  const [availableStock, setAvailableStock] = useState([]);
  const [items, setItems] = useState([]);
  const [bill, setBill] = useState(emptyBill);
  const [barcode, setBarcode] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [stockSearch, setStockSearch] = useState("");
  const [recentSales, setRecentSales] = useState([]);
  const [recentPage, setRecentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [lastSale, setLastSale] = useState(null);
  const [paperSize, setPaperSize] = useState("A4");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedSaleForPrint, setSelectedSaleForPrint] = useState(null);
  const [printLoading, setPrintLoading] = useState(false);
  const scanRef = useRef(null);
  const perPage = 8;

  const toast = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: "", message: "" }), 3500);
  };

  const money = (v) => Number(v || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const loadInit = async () => {
    setLoading(true);
    try {
      const [init, recent] = await Promise.all([
        axios.get(`${API}?action=init`),
        axios.get(`${API}?action=recent`),
      ]);
      setCustomers(init.data.customers || []);
      setAvailableStock(init.data.available_stock || []);
      setRecentSales(recent.data.sales || []);
    } catch (e) {
      toast("error", "Sales data load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInit(); }, []);
  useEffect(() => { setTimeout(() => scanRef.current?.focus(), 200); }, []);

  const selectedCustomer = useMemo(
    () => customers.find((c) => String(c.customer_id) === String(bill.customer_id)),
    [customers, bill.customer_id]
  );

  const customerOptions = useMemo(() => {
    const q = customerSearch.toLowerCase();
    return customers.filter(c =>
      (c.customer_name || "").toLowerCase().includes(q) ||
      (c.mobile || "").includes(q)
    ).slice(0, 20);
  }, [customers, customerSearch]);

  const stockOptions = useMemo(() => {
    const q = stockSearch.toLowerCase().trim();
    if (!q) return availableStock.slice(0, 8);
    return availableStock.filter(s =>
      (s.barcode_no || "").toLowerCase().includes(q) ||
      (s.product_name || "").toLowerCase().includes(q) ||
      (s.metal_name || "").toLowerCase().includes(q) ||
      (s.item_type || "").toLowerCase().includes(q)
    ).slice(0, 12);
  }, [availableStock, stockSearch]);

  const calcItem = (item) => {
    const net = Number(item.net_weight || item.remaining_weight || 0);
    const rate = Number(item.rate_per_gram || 0);
    const makingValue = Number(item.making_value ?? item.making_charge ?? 0);
    const metalAmount = net * rate;
    const makingTotal = item.making_charge_type === "percent" ? metalAmount * makingValue / 100 : makingValue;
    return {
      ...item,
      net_weight: net,
      stock_rate_per_gram: item.stock_rate_per_gram ?? item.rate_per_gram,
      rate_source: item.rate_source || "stock",
      making_value: makingValue,
      making_total: makingTotal,
      item_subtotal: metalAmount + makingTotal
    };
  };

  const addStockItem = (stock) => {
    if (!stock?.stock_id) return;
    if (items.some((i) => String(i.stock_id) === String(stock.stock_id))) {
      toast("error", "This barcode already added in bill");
      return;
    }
    const newItem = calcItem({
      ...stock,
      stock_rate_per_gram: stock.rate_per_gram,
      rate_source: "stock",
      making_charge_type: "amount",
      making_value: stock.making_charge || 0,
    });
    setItems((prev) => [...prev, newItem]);
    setBarcode("");
    setStockSearch("");
    setTimeout(() => scanRef.current?.focus(), 100);
  };

  const scanBarcode = async (e) => {
    e?.preventDefault?.();
    const code = barcode.trim();
    if (!code) return toast("error", "Barcode scan / enter karo");
    try {
      const res = await axios.get(`${API}?action=barcode&barcode=${encodeURIComponent(code)}`);
      if (res.data.status === "success") addStockItem(res.data.item);
      else toast("error", res.data.message || "Barcode not found");
    } catch (err) {
      toast("error", "Barcode search failed");
    }
  };

  const updateItem = (stockId, key, value) => {
    setItems((prev) => prev.map((i) => String(i.stock_id) === String(stockId) ? calcItem({ ...i, [key]: value }) : i));
  };

  const applyStockRate = (stockId) => {
    setItems((prev) => prev.map((i) => {
      if (String(i.stock_id) !== String(stockId)) return i;
      return calcItem({ ...i, rate_per_gram: i.stock_rate_per_gram || i.rate_per_gram, rate_source: "stock" });
    }));
  };

  const applyTodayRate = async (stockId) => {
    try {
      const res = await axios.get(`${API}?action=latest_rate&stock_id=${stockId}`);
      if (res.data.status !== "success") return toast("error", res.data.message || "Today rate not found");
      const rate = res.data.rate;
      setItems((prev) => prev.map((i) => {
        if (String(i.stock_id) !== String(stockId)) return i;
        return calcItem({
          ...i,
          rate_per_gram: rate.rate_per_gram,
          rate_source: "today",
          today_rate_date: rate.rate_date,
        });
      }));
      toast("success", `Today rate applied ₹${money(rate.rate_per_gram)}`);
    } catch (e) {
      toast("error", e.response?.data?.message || "Today rate not found");
    }
  };

  const removeItem = (stockId) => setItems(prev => prev.filter(i => String(i.stock_id) !== String(stockId)));

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + Number(i.item_subtotal || 0), 0);
    const discount = Number(bill.discount_amount || 0);
    const taxable = Math.max(subtotal - discount, 0);
    const tax = taxable * Number(bill.tax_percent || 0) / 100;
    const grand = taxable + tax;
    const paid = Number(bill.paid_amount || 0);
    return { subtotal, discount, taxable, tax, grand, paid, due: Math.max(grand - paid, 0) };
  }, [items, bill.discount_amount, bill.tax_percent, bill.paid_amount]);

  const saveSale = async () => {
    if (!items.length) return toast("error", "At least one barcode item add karo");
    if (!bill.customer_id && !bill.walkin_name.trim()) return toast("error", "Customer ya walk-in name required");
    if (Number(bill.paid_amount) < 0) return toast("error", "Paid amount invalid");

    setSaving(true);
    try {
      const payload = {
        ...bill,
        items: items.map(i => ({
          stock_id: i.stock_id,
          rate_per_gram: i.rate_per_gram,
          making_charge_type: i.making_charge_type,
          making_value: i.making_value,
          rate_source: i.rate_source || "stock",
        })),
      };
      const res = await axios.post(API, payload);
      if (res.data.status === "success") {
        toast("success", `Bill saved: ${res.data.bill_no}`);
        setLastSale({ sale_id: res.data.sale_id, bill_no: res.data.bill_no });
        setItems([]);
        setBill(emptyBill);
        await loadInit();
      } else toast("error", res.data.message || "Sale save failed");
    } catch (e) {
      toast("error", e.response?.data?.message || "Sale save failed");
    } finally {
      setSaving(false);
    }
  };

  const numberToWords = (num) => {
    const n = Math.round(Number(num || 0));
    if (n === 0) return "Zero Rupees";

    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const twoDigit = (x) => {
      if (x < 10) return ones[x];
      if (x < 20) return teens[x - 10];
      return `${tens[Math.floor(x / 10)]}${x % 10 ? " " + ones[x % 10] : ""}`;
    };

    const threeDigit = (x) => {
      const h = Math.floor(x / 100);
      const r = x % 100;
      return `${h ? ones[h] + " Hundred" : ""}${h && r ? " and " : ""}${r ? twoDigit(r) : ""}`.trim();
    };

    let value = n;
    const parts = [];
    const crore = Math.floor(value / 10000000); value %= 10000000;
    const lakh = Math.floor(value / 100000); value %= 100000;
    const thousand = Math.floor(value / 1000); value %= 1000;

    if (crore) parts.push(`${threeDigit(crore)} Crore`);
    if (lakh) parts.push(`${threeDigit(lakh)} Lakh`);
    if (thousand) parts.push(`${threeDigit(thousand)} Thousand`);
    if (value) parts.push(threeDigit(value));

    return `${parts.join(" ")} Rupees`;
  };

  const openPrintDialog = async (saleId) => {
    setPrintLoading(true);
    try {
      const res = await axios.get(`${API}?action=bill&id=${saleId}`);
      if (res.data.status !== "success") return toast("error", "Invoice not found");
      setSelectedSaleForPrint({ sale: res.data.sale, items: res.data.items || [] });
      setShowPrintModal(true);
    } catch {
      toast("error", "Invoice load failed");
    } finally {
      setPrintLoading(false);
    }
  };

  const printInvoice = () => {
    if (!selectedSaleForPrint) return toast("error", "Invoice not selected");

    const { sale, items: billItems } = selectedSaleForPrint;
    const subTotal = Number(sale.subtotal || sale.total_amount || 0);
    const discount = Number(sale.discount_amount || 0);
    const taxPercent = Number(sale.tax_percent || 0);
    const taxAmount = Number(sale.tax_amount || ((Math.max(subTotal - discount, 0) * taxPercent) / 100));
    const halfGst = taxAmount / 2;
    const finalAmount = Number(sale.grand_total || sale.total_amount || (subTotal - discount + taxAmount));
    const paidAmount = Number(sale.paid_amount || 0);
    const dueAmount = Number(sale.due_amount || Math.max(finalAmount - paidAmount, 0));

    const customerName = sale.customer_name || sale.walkin_name || "Walk-in Customer";
    const customerMobile = sale.mobile || sale.walkin_mobile || "-";
    const invoiceNo = sale.bill_no || sale.invoice_no || `SALE-${sale.sale_id}`;
    const invoiceDate = sale.sale_date || sale.created_at || today;
    const printWindow = window.open("", "_blank");

    const rows = billItems.map((item, i) => {
      const weight = Number(item.net_weight || item.remaining_weight || 0);
      const rate = Number(item.rate_per_gram || item.sale_rate || 0);
      const making = Number(item.making_total || item.making_charge || 0);
      const total = Number(item.total_amount || ((weight * rate) + making));
      const purity = item.purity_name || item.product_purity || item.purity || "-";
      return `
        <tr>
          <td class="center"><b>${i + 1}</b></td>
          <td class="desc">
            <b>${item.product_name || "Jewellery Item"}</b><br/>
            <small>${item.barcode_no || "-"} • ${item.metal_name || ""} ${item.item_type || ""} • Purity: ${purity}</small>
          </td>
          <td class="center">${weight.toFixed(3)}</td>
          <td class="right">₹${money(rate)}</td>
          <td class="right">₹${money(making)}</td>
          <td class="right"><b>₹${money(total)}</b></td>
        </tr>`;
    }).join("");

    const minRows = paperSize === "A5" ? 3 : 8;
    const fillerRows = Array(Math.max(minRows - billItems.length, 0)).fill("").map(() => `
      <tr class="blank-row"><td colspan="6">&nbsp;</td></tr>
    `).join("");

    const html = `
      <!doctype html>
      <html>
      <head>
        <title>Invoice - ${invoiceNo}</title>
        <style>
          @page { size: ${paperSize}; margin: ${paperSize === "A5" ? "8mm" : "10mm"}; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Times New Roman', serif; background: #fff; color: #000; }
          .print-container { width: 100%; min-height: ${paperSize === "A5" ? "194mm" : "277mm"}; display: flex; justify-content: center; }
          .invoice { width: 100%; max-width: ${paperSize === "A5" ? "132mm" : "190mm"}; padding: ${paperSize === "A5" ? "5mm" : "8mm"}; }
          .header { text-align: center; padding-bottom: ${paperSize === "A5" ? "7px" : "12px"}; border-bottom: 3px double #000; margin-bottom: ${paperSize === "A5" ? "10px" : "15px"}; }
          .header h1 { font-size: ${paperSize === "A5" ? "18px" : "25px"}; letter-spacing: 2px; text-transform: uppercase; }
          .header p { font-size: ${paperSize === "A5" ? "10px" : "12px"}; margin-top: 3px; }
          .info { width: 100%; border-collapse: collapse; border: 2px solid #000; margin-bottom: ${paperSize === "A5" ? "10px" : "14px"}; }
          .info td { border: 1px solid #000; padding: ${paperSize === "A5" ? "6px" : "10px"}; font-size: ${paperSize === "A5" ? "10px" : "12px"}; vertical-align: top; }
          .items { width: 100%; border-collapse: collapse; border: 2px solid #000; }
          .items th { background: #f2f2f2; border: 1px solid #000; padding: ${paperSize === "A5" ? "5px" : "8px"}; font-size: ${paperSize === "A5" ? "9px" : "11px"}; text-transform: uppercase; }
          .items td { border: 1px solid #000; padding: ${paperSize === "A5" ? "5px" : "8px"}; font-size: ${paperSize === "A5" ? "10px" : "12px"}; }
          .items small { color: #444; font-size: ${paperSize === "A5" ? "8px" : "10px"}; }
          .center { text-align: center; } .right { text-align: right; } .desc { text-align: left; }
          .blank-row td { height: ${paperSize === "A5" ? "18px" : "25px"}; }
          .bottom { display: flex; justify-content: flex-end; border: 2px solid #000; border-top: 0; margin-bottom: ${paperSize === "A5" ? "16px" : "25px"}; }
          .totals { width: ${paperSize === "A5" ? "58%" : "45%"}; border-collapse: collapse; }
          .totals td { padding: ${paperSize === "A5" ? "4px 8px" : "6px 12px"}; border-bottom: 1px solid #ddd; font-size: ${paperSize === "A5" ? "10px" : "12px"}; }
          .grand td { background: #e9e9e9; border-top: 2px solid #000; font-weight: 900; font-size: ${paperSize === "A5" ? "12px" : "14px"}; }
          .words { font-style: italic; font-size: ${paperSize === "A5" ? "9px" : "10px"}; }
          .signature { display: flex; justify-content: space-between; margin-top: ${paperSize === "A5" ? "28px" : "45px"}; }
          .sig-box { width: ${paperSize === "A5" ? "130px" : "180px"}; text-align: center; font-size: ${paperSize === "A5" ? "9px" : "11px"}; }
          .sig-line { border-top: 1.5px solid #000; padding-top: 5px; font-weight: bold; text-transform: uppercase; }
          .terms { margin-top: ${paperSize === "A5" ? "14px" : "22px"}; border-top: 1px dashed #999; padding-top: 8px; font-size: ${paperSize === "A5" ? "8px" : "9px"}; color: #444; line-height: 1.4; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="invoice">
            <div class="header">
              <h1>Tax Invoice</h1>
              <p>Original for Recipient</p>
            </div>

            <table class="info">
              <tr>
                <td width="60%">
                  <b style="font-size:${paperSize === "A5" ? "12px" : "14px"};">BILL TO:</b><br/>
                  <b>${customerName}</b><br/>
                  Mobile: ${customerMobile}<br/>
                  ${sale.address ? `Address: ${sale.address}<br/>` : ""}
                  Place: Ujjain (M.P.)
                </td>
                <td class="right">
                  <b>INVOICE DETAILS</b><br/><br/>
                  <b>Invoice No:</b> ${invoiceNo}<br/>
                  <b>Date:</b> ${new Date(invoiceDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}<br/>
                  <b>Payment:</b> ${sale.payment_mode || "-"}
                </td>
              </tr>
            </table>

            <table class="items">
              <thead>
                <tr>
                  <th width="5%">#</th>
                  <th width="37%">Description</th>
                  <th width="13%">Weight (g)</th>
                  <th width="15%">Rate</th>
                  <th width="15%">Making</th>
                  <th width="15%">Amount</th>
                </tr>
              </thead>
              <tbody>${rows}${fillerRows}</tbody>
            </table>

            <div class="bottom">
              <table class="totals">
                <tr><td><b>Sub Total:</b></td><td class="right"><b>₹${money(subTotal)}</b></td></tr>
                <tr><td>Discount:</td><td class="right">₹${money(discount)}</td></tr>
                <tr><td>CGST (${taxPercent / 2}%):</td><td class="right">₹${money(halfGst)}</td></tr>
                <tr><td>SGST (${taxPercent / 2}%):</td><td class="right">₹${money(halfGst)}</td></tr>
                <tr><td><b>GST Total (${taxPercent}%):</b></td><td class="right"><b>₹${money(taxAmount)}</b></td></tr>
                <tr class="grand"><td>TOTAL AMOUNT:</td><td class="right">₹${money(finalAmount)}</td></tr>
                <tr><td>Paid:</td><td class="right">₹${money(paidAmount)}</td></tr>
                <tr><td>Due:</td><td class="right">₹${money(dueAmount)}</td></tr>
                <tr><td colspan="2" class="words">Amount in Words: ${numberToWords(finalAmount)} Only</td></tr>
              </table>
            </div>

            <div class="signature">
              <div class="sig-box"><div class="sig-line">Customer's Signature</div></div>
              <div class="sig-box"><b>For Shree Ji Jewellers</b><div class="sig-line">Authorized Signatory</div></div>
            </div>

            <div class="terms">
              <b>Terms:</b> Goods once sold will not be returned without bill. Weight, rate and making charges checked and accepted by customer.
            </div>
          </div>
        </div>
        <script>window.onload=()=>setTimeout(()=>{window.print();window.close()},600)</script>
      </body>
      </html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    setShowPrintModal(false);
  };

  const recentPages = Math.ceil(recentSales.length / perPage) || 1;
  const recentData = recentSales.slice((recentPage - 1) * perPage, recentPage * perPage);

  return (
    <div className="sb-page">
      {status.message && <div className={`sb-toast ${status.type}`}>{status.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}<span>{status.message}</span></div>}

      <header className="sb-hero">
        <div className="sb-title"><FaCrown /><div><p>Jewellery Billing</p><h1>Sales Billing</h1><span>Scan barcode, auto-fill item details, save invoice and mark stock sold.</span></div></div>
        <div className="sb-hero-actions">
          {lastSale && <button onClick={() => openPrintDialog(lastSale.sale_id)}><FaPrint /> Print {lastSale.bill_no}</button>}
          <button onClick={loadInit}><FaRecycle /> Refresh</button>
        </div>
      </header>

      <div className="sb-grid">
        <section className="sb-card bill-card">
          <div className="sb-card-head"><FaReceipt /><h2>New Sale Bill</h2></div>

          <div className="sb-customer-box">
            <label>Customer</label>
            <div className="sb-customer-row">
              <div className="sb-search"><FaUser /><input value={customerSearch} onChange={(e)=>setCustomerSearch(e.target.value)} placeholder="Search customer by name/mobile" /></div>
              <select value={bill.customer_id} onChange={(e)=>setBill({...bill, customer_id:e.target.value})}>
                <option value="">Walk-in Customer</option>
                {customerOptions.map(c => <option key={c.customer_id} value={c.customer_id}>{c.customer_name} - {c.mobile}</option>)}
              </select>
            </div>
            {!selectedCustomer && <div className="sb-two"><input value={bill.walkin_name} onChange={(e)=>setBill({...bill, walkin_name:e.target.value})} placeholder="Walk-in name" /><input value={bill.walkin_mobile} onChange={(e)=>setBill({...bill, walkin_mobile:e.target.value.replace(/\D/g,'').slice(0,10)})} placeholder="Mobile optional" /></div>}
            {selectedCustomer && <div className="sb-selected"><b>{selectedCustomer.customer_name}</b><span>{selectedCustomer.mobile} • {selectedCustomer.address || "No address"}</span></div>}
          </div>

          <form className="sb-scan" onSubmit={scanBarcode}>
            <label>Barcode Scan / Search</label>
            <div className="scan-line"><FaBarcode /><input ref={scanRef} value={barcode} onChange={(e)=>setBarcode(e.target.value)} placeholder="Scan or enter barcode" /><button type="submit"><FaSearch /> Add</button></div>
          </form>

          <div className="stock-picker">
            <div className="sb-search"><FaSearch /><input value={stockSearch} onChange={(e)=>setStockSearch(e.target.value)} placeholder="Search available stock by barcode/product" /></div>
            {stockSearch && <div className="stock-results">{stockOptions.length ? stockOptions.map(s => <button key={s.stock_id} onClick={()=>addStockItem(s)}><b>{s.barcode_no || `STK-${s.stock_id}`}</b><span>{s.product_name} • {s.metal_name || '-'} • {Number(s.remaining_weight || s.net_weight || 0).toFixed(3)}g</span></button>) : <p>No available stock found</p>}</div>}
          </div>

          <div className="items-table-wrap">
            <table className="items-table"><thead><tr><th>#</th><th>Barcode</th><th>Item</th><th>Wt</th><th>Rate/g</th><th>Making</th><th>Total</th><th></th></tr></thead><tbody>
              {items.length ? items.map((i, idx) => <tr key={i.stock_id}>
                <td>{idx+1}</td><td><b>{i.barcode_no || `STK-${i.stock_id}`}</b></td><td><strong>{i.product_name}</strong><small>{i.metal_name || "-"} • {i.item_type || "-"} • {i.product_purity || ""}</small></td>
                <td>{Number(i.net_weight||0).toFixed(3)}g</td>
                <td>
                  <div className="rate-cell">
                    <input type="number" value={i.rate_per_gram} onChange={(e)=>updateItem(i.stock_id,"rate_per_gram",e.target.value)} />
                    <span className={`rate-badge ${i.rate_source === "today" ? "today" : "stock"}`}>{i.rate_source === "today" ? `Today ${i.today_rate_date || ""}` : "Stock rate"}</span>
                    <div className="rate-actions">
                      <button type="button" onClick={() => applyStockRate(i.stock_id)}>Stock</button>
                      <button type="button" onClick={() => applyTodayRate(i.stock_id)}>Today</button>
                    </div>
                  </div>
                </td>
                <td><div className="making-cell"><select value={i.making_charge_type} onChange={(e)=>updateItem(i.stock_id,"making_charge_type",e.target.value)}><option value="amount">₹ Amount</option><option value="percent">% Percent</option></select><input type="number" value={i.making_value} onChange={(e)=>updateItem(i.stock_id,"making_value",e.target.value)} /></div><small>₹{money(i.making_total)}</small></td>
                <td><b>₹{money(i.item_subtotal)}</b></td><td><button className="trash" onClick={()=>removeItem(i.stock_id)}><FaTrash /></button></td>
              </tr>) : <tr><td colSpan="8" className="empty">Scan barcode to add jewellery item</td></tr>}
            </tbody></table>
          </div>
        </section>

        <aside className="sb-card summary-card">
          <div className="sb-card-head"><FaFileInvoice /><h2>Bill Summary</h2></div>
          <label>Sale Date<input type="date" value={bill.sale_date} onChange={(e)=>setBill({...bill, sale_date:e.target.value})}/></label>
          <label>GST %<select value={bill.tax_percent} onChange={(e)=>setBill({...bill, tax_percent:e.target.value})}><option value="3">GST 3%</option><option value="0">No GST</option><option value="5">GST 5%</option></select></label>
          <label>Discount ₹<input type="number" value={bill.discount_amount} onChange={(e)=>setBill({...bill, discount_amount:e.target.value})}/></label>
          <label>Paid Amount ₹<input type="number" value={bill.paid_amount} onChange={(e)=>setBill({...bill, paid_amount:e.target.value})}/></label>
          <label>Payment Mode<select value={bill.payment_mode} onChange={(e)=>setBill({...bill, payment_mode:e.target.value})}><option>Cash</option><option>UPI</option><option>Card</option><option>Bank</option><option>Mixed</option></select></label>
          <div className="bill-lines"><div><span>Items</span><b>{items.length}</b></div><div><span>Subtotal</span><b>₹{money(totals.subtotal)}</b></div><div><span>Discount</span><b>₹{money(totals.discount)}</b></div><div><span>GST</span><b>₹{money(totals.tax)}</b></div><div className="grand"><span>Grand Total</span><b>₹{money(totals.grand)}</b></div><div><span>Paid</span><b>₹{money(totals.paid)}</b></div><div className={totals.due > 0 ? "due" : "paid"}><span>Due</span><b>₹{money(totals.due)}</b></div></div>
          <button className="save-sale" onClick={saveSale} disabled={saving || !items.length}>{saving ? <FaSpinner className="spin" /> : <FaSave />} Save Sale & Mark Sold</button>
        </aside>
      </div>

      <section className="sb-card recent-card">
        <div className="sb-card-head"><FaReceipt /><h2>Recent Sales</h2></div>
        <div className="recent-table-wrap"><table><thead><tr><th>Bill No</th><th>Date</th><th>Customer</th><th>Total</th><th>Paid</th><th>Due</th><th>Mode</th><th>Action</th></tr></thead><tbody>{loading ? <tr><td colSpan="8" className="empty">Loading...</td></tr> : recentData.length ? recentData.map(s => <tr key={s.sale_id}><td><b>{s.bill_no}</b></td><td>{s.sale_date}</td><td>{s.customer_name}</td><td>₹{money(s.grand_total || s.total_amount)}</td><td>₹{money(s.paid_amount)}</td><td>₹{money(s.due_amount)}</td><td>{s.payment_mode}</td><td><button onClick={()=>openPrintDialog(s.sale_id)}><FaPrint /> Print</button></td></tr>) : <tr><td colSpan="8" className="empty">No sales found</td></tr>}</tbody></table></div>
        <div className="sb-pagination"><button disabled={recentPage===1} onClick={()=>setRecentPage(p=>p-1)}><FaChevronLeft /></button><span>Page {recentPage} / {recentPages}</span><button disabled={recentPage===recentPages} onClick={()=>setRecentPage(p=>p+1)}><FaChevronRight /></button></div>
      </section>


      {showPrintModal && selectedSaleForPrint && (
        <div className="sb-print-modal">
          <div className="sb-print-box">
            <button className="sb-print-close" onClick={() => setShowPrintModal(false)}><FaTimes /></button>
            <h2>Print Invoice</h2>
            <p><b>Bill:</b> {selectedSaleForPrint.sale.bill_no || selectedSaleForPrint.sale.invoice_no}</p>
            <p><b>Customer:</b> {selectedSaleForPrint.sale.customer_name || selectedSaleForPrint.sale.walkin_name || "Walk-in Customer"}</p>
            <div className="sb-paper-options">
              <button className={paperSize === "A4" ? "active" : ""} onClick={() => setPaperSize("A4")}>A4 Full Page</button>
              <button className={paperSize === "A5" ? "active" : ""} onClick={() => setPaperSize("A5")}>A5 Half Page</button>
            </div>
            <button className="sb-confirm-print" onClick={printInvoice} disabled={printLoading}>
              <FaPrint /> {printLoading ? "Loading..." : "Print Invoice"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
