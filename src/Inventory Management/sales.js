


import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URLS from "./apiConfig";
import { Trash2, Save, Barcode, RefreshCw, Printer } from "lucide-react";
import "./salesManager.css";

const SalesManager = () => {
  const [activeTab, setActiveTab] = useState("billing");
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [selectedCust, setSelectedCust] = useState("");
  const [goldRate, setGoldRate] = useState("");
  const [salesHistory, setSalesHistory] = useState([]);
  const [paperSize, setPaperSize] = useState("A4");
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedSaleForPrint, setSelectedSaleForPrint] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

// Open print modal with selected sale
const openPrintDialog = (sale) => {
    setSelectedSaleForPrint(sale);
    setShowPrintModal(true);
};

  useEffect(() => {
    fetchCustomers();
    fetchSalesHistory();
  }, []);

  // Reset to page 1 when sales history updates
  useEffect(() => {
    setCurrentPage(1);
  }, [salesHistory]);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${BASE_URLS}/customers.php`);
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.customers || [];
      setCustomers(data);
    } catch (err) {
      setCustomers([]);
      console.error(err);
    }
  };

  const fetchSalesHistory = async () => {
    try {
      const res = await axios.get(`${BASE_URLS}/sales_api.php`);
      const finalData = Array.isArray(res.data)
        ? res.data
        : res.data.data || res.data.sales || [];
      const cleanData = finalData.filter(
        (item) => item !== null && typeof item === "object"
      );
      setSalesHistory(cleanData);
    } catch (err) {
      setSalesHistory([]);
      console.error(err);
    }
  };

  // --- Barcode Logic ---
  const handleBarcodeSearch = async (e) => {
    const val = e.target.value.toUpperCase().trim();
    setBarcode(val);
    if (val.length >= 6) {
      try {
        const res = await axios.get(
          `${BASE_URLS}/stock_api.php?action=search&barcode=${val}`
        );
        if (res.data && res.data.length > 0) {
          const item = res.data[0];
          if (cart.find((c) => c.id === item.id)) return setBarcode("");
          const newItem = {
            ...item,
            sale_rate: goldRate || item.rate || 0,
            m_type: "fixed",
            m_value: 0,
            sub_total: 0,
          };
          calculateItem(newItem, [...cart, newItem]);
          setBarcode("");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // --- Calculate Row ---
  const calculateItem = (item, currentCart) => {
    const weight = parseFloat(item.net_weight) || 0;
    const rate = parseFloat(item.sale_rate) || 0;
    const mVal = parseFloat(item.m_value) || 0;
    let makingAmt = 0;
    if (item.m_type === "per_gram") makingAmt = weight * mVal;
    else if (item.m_type === "fixed") makingAmt = mVal;
    else if (item.m_type === "percent") makingAmt = (weight * rate * mVal) / 100;
    item.sub_total = (weight * rate) + makingAmt;
    item.making_total = makingAmt;
    const updatedCart = currentCart.map((c) => (c.id === item.id ? item : c));
    setCart(updatedCart);
  };

  const updateRow = (id, field, value) => {
    const updatedCart = cart.map((item) => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value };
        calculateItem(newItem, cart);
        return newItem;
      }
      return item;
    });
    setCart(updatedCart);
  };



  // --- Totals ---
  const totalWeight = cart.reduce((s, i) => s + parseFloat(i.net_weight || 0), 0);
  const subTotalAll = cart.reduce((s, i) => s + (i.sub_total || 0), 0);
  const taxAmount = (subTotalAll * 3) / 100;
  const finalAmount = subTotalAll + taxAmount;

  // --- Save Bill ---
 const handleSaveBill = async () => {
    if (!selectedCust || cart.length === 0)
        return alert("Customer select karo aur item add karo!");

    const payload = {
        customer_id: selectedCust,
        total_weight: totalWeight,
        sub_total: subTotalAll,
        tax_amount: taxAmount,
        final_amount: finalAmount,
        items: cart,
    };

    try {
        const res = await axios.post(
            `${BASE_URLS}/sales_api.php?action=create`,
            payload
        );

        // Console mein check karein ki backend kya bhej raha hai
        console.log("Backend Response:", res.data);

        // Agar status 'success' string hai
        if (res.data.status === "success" || res.data.success === true) {
            alert("✅ Bill Saved! Invoice: " + (res.data.invoice_no || "N/A"));
            setCart([]);
            setSelectedCust("");
            fetchSalesHistory();
            setActiveTab("history");
        } else {
            // Agar backend error message bhej raha hai toh wahi dikhayein
            alert("Backend Error: " + (res.data.message || "Status success nahi mila"));
        }
    } catch (err) {
        console.error("Critical Error:", err);
        alert("API Error: Server respond nahi kar raha.");
    }
};
  // --- Delete Sale ---
  const handleDelete = async (id) => {
    if (window.confirm("Delete record?")) {
      await axios.get(`${BASE_URLS}/sales_api.php?action=delete&id=${id}`);
      fetchSalesHistory();
    }
  };

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = salesHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(salesHistory.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };



  // --- Helper Function: Number to Words ---
  const numberToWords = (num) => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      
      if (num === 0) return 'Zero';
      
      let words = '';
      const crore = Math.floor(num / 10000000);
      const lakh = Math.floor((num % 10000000) / 100000);
      const thousand = Math.floor((num % 100000) / 1000);
      const hundred = Math.floor((num % 1000) / 100);
      const remainder = Math.floor(num % 100);
      
      if (crore > 0) words += ones[crore] + ' Crore ';
      if (lakh > 0) words += ones[lakh] + ' Lakh ';
      if (thousand > 0) words += ones[thousand] + ' Thousand ';
      if (hundred > 0) words += ones[hundred] + ' Hundred ';
      
      if (remainder > 0) {
          if (words !== '') words += 'and ';
          if (remainder < 10) words += ones[remainder];
          else if (remainder < 20) words += teens[remainder - 10];
          else {
              words += tens[Math.floor(remainder / 10)];
              if (remainder % 10 > 0) words += ' ' + ones[remainder % 10];
          }
      }
      
      return words.trim() + ' Rupees';
  };

const handleConfirmPrint = async () => {
    if (!selectedSaleForPrint) return alert("Sale data missing!");

    try {
        const res = await fetch(`${BASE_URLS}/sales_api.php?action=get_items&sale_id=${selectedSaleForPrint.id}`);
        const resData = await res.json();
        const items = Array.isArray(resData.items) ? resData.items : [];
        
        // Final Calculations
        const subTotal = parseFloat(selectedSaleForPrint.sub_total || 0);
        const taxAmount = parseFloat(selectedSaleForPrint.tax_amount || 0);
        
        // GST ko aadha-aadha divide kiya
        const halfGst = (taxAmount / 2).toFixed(2);
        const finalAmount = parseFloat(selectedSaleForPrint.final_amount || 0);

        const printWindow = window.open('', '_blank');
        const html = `
          <html>
          <head>
              <title>Invoice - ${selectedSaleForPrint.invoice_no}</title>
              <style>
                  @page { 
                      size: ${paperSize === 'A5' ? 'A5' : 'A4'}; 
                      margin: 10mm; 
                  }
                  * { 
                      box-sizing: border-box; 
                      margin: 0; 
                      padding: 0; 
                  }
                  body { 
                      font-family: 'Times New Roman', Times, serif; 
                      background: #fff; 
                      color: #000; 
                      line-height: 1.4;
                  }
                  
                  .print-container {
                      width: 100%;
                      max-width: ${paperSize === 'A5' ? '148mm' : '210mm'};
                      min-height: ${paperSize === 'A5' ? '210mm' : '297mm'};
                      margin: 0 auto;
                      padding: 0;
                      position: relative;
                      background: #fff;
                  }

                  .content-wrapper { 
                      width: 100%; 
                      display: flex; 
                      flex-direction: column;
                      position: relative;
                      z-index: 1;
                      padding: ${paperSize === 'A5' ? '8mm 12mm' : '12mm 16mm'};
                  }

                  /* Professional Invoice Header */
                  .invoice-header {
                      text-align: center;
                      margin-bottom: ${paperSize === 'A5' ? '12px' : '18px'};
                      padding-bottom: ${paperSize === 'A5' ? '8px' : '12px'};
                      border-bottom: 3px double #000;
                  }
                  .invoice-header h1 { 
                      font-size: ${paperSize === 'A5' ? '18px' : '24px'};
                      font-weight: bold;
                      text-transform: uppercase;
                      letter-spacing: 2px;
                      margin-bottom: 4px;
                      color: #000;
                  }
                  .invoice-header p {
                      font-size: ${paperSize === 'A5' ? '10px' : '12px'};
                      color: #333;
                  }

                  /* Info Section with Border */
                  .info-section { 
                      width: 100%; 
                      border: 2px solid #000;
                      margin-bottom: ${paperSize === 'A5' ? '10px' : '15px'};
                      border-collapse: collapse;
                  }
                  .info-section td { 
                      border: 1px solid #000; 
                      padding: ${paperSize === 'A5' ? '6px 8px' : '10px 12px'};
                      font-size: ${paperSize === 'A5' ? '10px' : '12px'};
                      vertical-align: top;
                  }
                  .info-section strong {
                      font-size: ${paperSize === 'A5' ? '11px' : '13px'};
                  }

                  /* Professional Item Table */
                  .item-table { 
                      width: 100%; 
                      border-collapse: collapse; 
                      border: 2px solid #000;
                      margin-bottom: ${paperSize === 'A5' ? '10px' : '15px'};
                  }
                  .item-table th { 
                      border: 1px solid #000; 
                      background: #f5f5f5;
                      padding: ${paperSize === 'A5' ? '5px 6px' : '8px 10px'};
                      font-size: ${paperSize === 'A5' ? '9px' : '11px'};
                      text-transform: uppercase;
                      font-weight: bold;
                      text-align: center;
                      letter-spacing: 0.5px;
                  }
                  .item-table td { 
                      border: 1px solid #000; 
                      padding: ${paperSize === 'A5' ? '6px 8px' : '8px 10px'};
                      font-size: ${paperSize === 'A5' ? '10px' : '12px'};
                      text-align: center;
                  }
                  .item-table tbody tr:nth-child(even) {
                  
                      background-color: #fafafa;
                  }
                  .item-desc {
                      text-align: left !important;
                      font-weight: 500;
                  }
                  .item-desc small {
                      color: #555;
                      font-style: italic;
                  }

                  /* Calculation Section */
                  .calculation-section { 
                      display: flex; 
                      width: 100%; 
                      border: 2px solid #000;
                      border-top: none;
                      justify-content: flex-end;
                      margin-bottom: ${paperSize === 'A5' ? '15px' : '25px'};
                  }
                  .totals-side { 
                      width: ${paperSize === 'A5' ? '50%' : '45%'};
                  }
                  .totals-side table { 
                      width: 100%; 
                      border-collapse: collapse; 
                  }
                  .totals-side td { 
                      padding: ${paperSize === 'A5' ? '4px 10px' : '6px 15px'};
                      border-bottom: 1px solid #ddd;
                      font-size: ${paperSize === 'A5' ? '10px' : '12px'};
                  }
                  .totals-side tr:last-child td {
                      border-bottom: none;
                  }
                  .grand-total-row { 
                      background: #e8e8e8; 
                      font-weight: bold; 
                      font-size: ${paperSize === 'A5' ? '12px' : '14px'} !important;
                      border-top: 2px solid #000;
                  }

                  /* Signature Area */
                  .sig-area { 
                      margin-top: ${paperSize === 'A5' ? '30px' : '50px'};
                      margin-bottom: ${paperSize === 'A5' ? '20px' : '40px'};
                      display: flex; 
                      justify-content: space-between;
                      align-items: flex-end;
                  }
                  .sig-box { 
                      text-align: center; 
                      width: ${paperSize === 'A5' ? '140px' : '180px'};
                      font-size: ${paperSize === 'A5' ? '9px' : '11px'};
                  }
                  .sig-line { 
                      margin-top: ${paperSize === 'A5' ? '30px' : '40px'};
                      border-top: 1.5px solid #000;
                      padding-top: 5px;
                      font-weight: bold;
                      text-transform: uppercase;
                      letter-spacing: 0.5px;
                  }

                  /* Terms & Conditions */
                  .terms-section {
                      margin-top: ${paperSize === 'A5' ? '15px' : '20px'};
                      padding-top: ${paperSize === 'A5' ? '8px' : '12px'};
                      border-top: 1px dashed #999;
                      font-size: ${paperSize === 'A5' ? '8px' : '9px'};
                      color: #555;
                      line-height: 1.5;
                  }
                  .terms-section h4 {
                      font-size: ${paperSize === 'A5' ? '9px' : '10px'};
                      margin-bottom: 4px;
                      color: #000;
                      text-transform: uppercase;
                  }
                  .terms-section ul {
                      margin-left: 15px;
                      list-style-type: disc;
                  }

                  @media print {
                      body { 
                          background: white; 
                          -webkit-print-color-adjust: exact;
                          print-color-adjust: exact;
                      }
                      .print-container { 
                          box-shadow: none;
                          page-break-inside: avoid;
                          background: white !important;
                      }
                  }
              </style>
          </head>
          <body>
              <div class="print-container">
                  <div class="content-wrapper">
                      
                      <div class="invoice-header">
                          <h1>TAX INVOICE</h1>
                          <p>Original for Recipient</p>
                      </div>

                      <table class="info-section">
                          <tr>
                              <td width="60%">
                                  <strong style="font-size: ${paperSize === 'A5' ? '12px' : '14px'};">BILL TO:</strong><br/>
                                  <strong>${selectedSaleForPrint.customer_name}</strong><br/>
                                  ${selectedSaleForPrint.mobile ? `Mobile: ${selectedSaleForPrint.mobile}<br/>` : ''}
                                  ${selectedSaleForPrint.address ? `Address: ${selectedSaleForPrint.address}<br/>` : ''}
                                  Place: Ujjain (M.P.)
                              </td>
                              <td style="text-align: right;">
                                  <strong>INVOICE DETAILS</strong><br/><br/>
                                  <strong>Invoice No:</strong> ${selectedSaleForPrint.invoice_no}<br/>
                                  <strong>Date:</strong> ${new Date(selectedSaleForPrint.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                          </tr>
                      </table>

                      <table class="item-table">
                          <thead>
                              <tr>
                                  <th width="5%">#</th>
                                  <th width="35%" align="left">Description</th>
                                  <th width="15%">Weight (g)</th>
                                  <th width="15%">Rate (₹)</th>
                                  <th width="15%">Making (₹)</th>
                                  <th width="15%" align="right">Amount (₹)</th>
                              </tr>
                          </thead>
                          <tbody>
                              ${items.map((item, i) => {
                                  const weight = parseFloat(item.net_weight) || 0;
                                  const rate = parseFloat(item.sale_rate) || 0;
                                  const makingTotal = parseFloat(item.making_total) || 0;
                                  const totalAmount = (weight * rate) + makingTotal;
                                  const purity = item.purity || '22K';
                                  return `
                                  <tr>
                                      <td style="font-weight: bold;">${i + 1}</td>
                                      <td class="item-desc">
                                          <strong>${item.product_name || 'N/A'}</strong><br/>
                                          <small>Purity: ${purity}</small>
                                      </td>
                                      <td style="font-weight: 500;">${weight.toFixed(3)}</td>
                                      <td>₹${rate.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                      <td>₹${makingTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                      <td align="right" style="font-weight: bold;">₹${totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                  </tr>
                                  `;
                              }).join('')}
                              ${items.length < (paperSize === 'A5' ? 3 : 8) ? Array(paperSize === 'A5' ? 3 - items.length : 8 - items.length).fill('').map(() => `
                                  <tr style="height: ${paperSize === 'A5' ? '20px' : '25px'};">
                                      <td colspan="7"></td>
                                  </tr>
                              `).join('') : ''}
                          </tbody>
                      </table>

                      <div class="calculation-section">
                          <div class="totals-side">
                              <table>
                                  <tr>
                                      <td><strong>Sub Total:</strong></td>
                                      <td align="right"><strong>₹${subTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</strong></td>
                                  </tr>
                                  <tr>
                                      <td>CGST (1.5%):</td>
                                      <td align="right">₹${parseFloat(halfGst).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                  </tr>
                                  <tr>
                                      <td>SGST (1.5%):</td>
                                      <td align="right">₹${parseFloat(halfGst).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                  </tr>
                                  <tr style="border-top: 1px solid #000;">
                                      <td><strong>GST Total (3%):</strong></td>
                                      <td align="right"><strong>₹${taxAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</strong></td>
                                  </tr>
                                  <tr class="grand-total-row">
                                      <td><strong>TOTAL AMOUNT:</strong></td>
                                      <td align="right"><strong>₹${finalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</strong></td>
                                  </tr>
                                  <tr>
                                      <td colspan="2" style="font-size: ${paperSize === 'A5' ? '9px' : '10px'}; font-style: italic; padding-top: 8px;">
                                          Amount in Words: ${numberToWords(finalAmount)} Only
                                      </td>
                                  </tr>
                              </table>
                          </div>
                      </div>

                      <div class="sig-area">
                          <div class="sig-box">
                              <div class="sig-line">Customer's Signature</div>
                          </div>
                          <div class="sig-box">
                              <div style="margin-bottom: 5px; font-weight: bold;">For Shree Ji Jewellers</div>
                              <div class="sig-line">Authorized Signatory</div>
                          </div>
                      </div>
                  </div>
              </div>
              <script>
                  window.onload = () => {
                      setTimeout(() => {
                          window.print();
                          window.close();
                      }, 600);
                  };
              </script>
          </body>
          </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
        if(setShowPrintModal) setShowPrintModal(false);
    } catch (err) {
        console.error("Print Error:", err);
    }
};

  return (
    <div className="sales-container">
      
      <div className="sales-header">
        <div className="header-content">
          <h1 className="page-title">Sales Management</h1>
          <p className="page-subtitle">Manage your sales and billing efficiently</p>
        </div>
        <div className="header-actions">
          <div className="tab-group">
            <button
              onClick={() => setActiveTab("billing")}
              className={`tab-btn ${activeTab === "billing" ? "tab-btn-active" : ""}`}
            >
              <Save size={18} />
              <span>New Bill</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`tab-btn ${activeTab === "history" ? "tab-btn-active" : ""}`}
            >
              <RefreshCw size={18} />
              <span>Sales History</span>
            </button>
          </div>
          <button
            onClick={fetchSalesHistory}
            className="icon-btn"
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        {/* --- Billing Form --- */}
        {activeTab === "billing" ? (
          <div className="billing-card">
            <div className="card-header">
              <h2 className="card-title">Create New Invoice</h2>
              <p className="card-subtitle">Fill in the details to generate a new bill</p>
            </div>
            
            <div className="input-grid">
              <div className="input-field">
                <label className="input-label">
                  <span className="label-icon">💰</span>
                  Today's Gold Rate
                </label>
                <input
                  type="number"
                  className="styled-input"
                  value={goldRate}
                  onChange={(e) => setGoldRate(e.target.value)}
                  placeholder="Enter rate per gram"
                />
              </div>

              <div className="input-field">
                <label className="input-label">
                  <span className="label-icon">👤</span>
                  Select Customer
                </label>
                <select
                  className="styled-select"
                  value={selectedCust}
                  onChange={(e) => setSelectedCust(e.target.value)}
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.customer_id} value={c.customer_id}>
                      {c.customer_name} {c.mobile && `(${c.mobile})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-field">
                <label className="input-label">
                  <span className="label-icon">📷</span>
                  Scan Barcode
                </label>
                <div className="barcode-input-wrapper">
                  <Barcode className="barcode-icon" size={24} />
                  <input
                    type="text"
                    className="barcode-input"
                    value={barcode}
                    onChange={handleBarcodeSearch}
                    placeholder="Scan product barcode"
                    autoFocus
                  />
                </div>
              </div>
            </div>

            {/* Cart Table */}
            {cart.length > 0 && (
              <>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="text-left">Product Details</th>
                        <th>Weight (g)</th>
                        <th>Rate (₹)</th>
                        <th>Making Type</th>
                        <th>Making Value</th>
                        <th className="text-right">Making Amt (₹)</th>
                        <th className="text-right">Sub Total (₹)</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.id} className="table-row">
                          <td className="product-cell">
                            <div className="product-name">{item.product_name}</div>
                            <div className="product-meta">Purity: {item.purity || 'N/A'}</div>
                          </td>
                          <td className="text-center font-medium">{parseFloat(item.net_weight).toFixed(3)}</td>
                          <td className="text-center">
                            <input
                              type="number"
                              className="table-input"
                              value={item.sale_rate}
                              onChange={(e) => updateRow(item.id, "sale_rate", e.target.value)}
                            />
                          </td>
                          <td className="text-center">
                            <select
                              className="table-select"
                              value={item.m_type}
                              onChange={(e) => updateRow(item.id, "m_type", e.target.value)}
                            >
                              <option value="fixed">Fixed</option>
                              <option value="per_gram">Per Gram</option>
                              <option value="percent">Percent</option>
                            </select>
                          </td>
                          <td className="text-center">
                            <input
                              type="number"
                              className="table-input"
                              value={item.m_value}
                              onChange={(e) => updateRow(item.id, "m_value", e.target.value)}
                            />
                          </td>
                          <td className="text-right font-bold text-primary">₹{item.making_total?.toFixed(2)}</td>
                          <td className="text-right font-bold text-primary">₹{item.sub_total?.toFixed(2)}</td>
                          <td className="text-center">
                            <button 
                              className="delete-btn" 
                              onClick={() => setCart(cart.filter(c => c.id !== item.id))}
                              title="Remove Item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Empty State */}
            {cart.length === 0 && (
              <div className="empty-state">
                <Barcode size={64} className="empty-icon" />
                <h3 className="empty-title">No Items in Cart</h3>
                <p className="empty-subtitle">Scan a barcode or add items to start billing</p>
              </div>
            )}

            {/* Summary Box */}
            {cart.length > 0 && (
              <div className="summary-grid">
                <div className="summary-card">
                  <div className="summary-label">
                    <span className="summary-icon">⚖️</span>
                    Total Weight
                  </div>
                  <div className="summary-value">{totalWeight.toFixed(3)}g</div>
                </div>
                
                <div className="summary-card">
                  <div className="summary-label">
                    <span className="summary-icon">📦</span>
                    Total Items
                  </div>
                  <div className="summary-value">{cart.length}</div>
                </div>
                
                <div className="summary-card">
                  <div className="summary-label">
                    <span className="summary-icon">🔨</span>
                    Total Making
                  </div>
                  <div className="summary-value">₹{cart.reduce((s, i) => s + (i.making_total || 0), 0).toFixed(2)}</div>
                </div>
                
                <div className="summary-card">
                  <div className="summary-label">
                    <span className="summary-icon">🧾</span>
                    GST (3%)
                  </div>
                  <div className="summary-value">₹{taxAmount.toFixed(2)}</div>
                </div>
                
                <div className="summary-card highlight">
                  <div className="summary-label">
                    <span className="summary-icon">💵</span>
                    Grand Total
                  </div>
                  <div className="summary-value-large">₹{finalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>

                <button className="save-bill-btn" onClick={handleSaveBill}>
                  <Save size={22} />
                  <span>Save Bill</span>
                </button>
                <div className="input-field">
  <label className="input-label">Select Print Paper</label>
  <select 
    className="styled-select" 
    value={paperSize} 
    onChange={(e) => setPaperSize(e.target.value)}
  >
    <option value="A4">A4 Full Page (Multiple Items)</option>
    <option value="A5">A5 Half Page (1-2 Items)</option>
  </select>
</div>
              </div>
            )}
          </div>
        ) : (
          <div className="history-card">
            <div className="card-header">
              <h2 className="card-title">Sales History</h2>
              <p className="card-subtitle">View and manage all past transactions</p>
            </div>
            
            {currentItems.length > 0 ? (
              <div className="table-responsive">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th className="text-center">#</th>
                      <th className="text-left">Invoice Details</th>
                      <th>Customer Information</th>
                      <th className="text-right">Amount Paid</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((sale, index) => (
                      <tr key={sale.id} className="history-row">
                        <td className="text-center font-bold">{indexOfFirstItem + index + 1}</td>
                        <td className="invoice-cell">
                          <div className="invoice-number">#{sale.invoice_no}</div>
                          <div className="invoice-date">{new Date(sale.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </td>
                        <td className="customer-cell">
                          <div className="customer-name">{sale.customer_name}</div>
                          <div className="customer-mobile">{sale.mobile || 'N/A'}</div>
                        </td>
                        <td className="text-right">
                          <div className="amount-value">₹{parseFloat(sale.final_amount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                        </td>
                        <td className="text-center">
                          <div className="action-buttons">
                            <button 
                              className="action-btn print-btn" 
                              onClick={() => openPrintDialog(sale)}
                              title="Print"
                            >
                              <Printer size={18} />
                              <span>Print</span>
                            </button>
                            
                            <button 
                              className="action-btn delete-btn-action" 
                              onClick={() => handleDelete(sale.id)} 
                              title="Delete Record"
                            >
                              <Trash2 size={18} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <RefreshCw size={64} className="empty-icon" />
                <h3 className="empty-title">No Sales Records Found</h3>
                <p className="empty-subtitle">Start creating bills to see your sales history here</p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <button 
                  className="pagination-btn"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                
                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                      onClick={() => paginate(number)}
                    >
                      {number}
                    </button>
                  ))}
                </div>

                <button 
                  className="pagination-btn"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Print Modal */}
      {showPrintModal && selectedSaleForPrint && (
        <div className="print-modal-overlay">
          <div className="print-modal-content">
            <div className="modal-header">
              <h3>🖨️ Print Invoice</h3>
              <button className="close-x" onClick={() => setShowPrintModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="invoice-preview">
                <p className="invoice-label">Selected Invoice:</p>
                <p className="invoice-number-display">#{selectedSaleForPrint.invoice_no}</p>
                <p className="customer-name-display">{selectedSaleForPrint.customer_name}</p>
                <p className="amount-display">₹{parseFloat(selectedSaleForPrint.final_amount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
              </div>

              <div className="paper-selection">
                <label className="selection-label">Select Paper Size:</label>
                <div className="paper-options">
                  <div 
                    className={`paper-card ${paperSize === 'A4' ? 'active' : ''}`}
                    onClick={() => setPaperSize('A4')}
                  >
                    <div className="paper-icon">📄</div>
                    <div className="paper-details">
                      <strong>A4 Size</strong>
                      <span>Full Page - Multiple Items</span>
                    </div>
                  </div>

                  <div 
                    className={`paper-card ${paperSize === 'A5' ? 'active' : ''}`}
                    onClick={() => setPaperSize('A5')}
                  >
                    <div className="paper-icon">📝</div>
                    <div className="paper-details">
                      <strong>A5 Size</strong>
                      <span>Half Page - Compact Format</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowPrintModal(false)}>
                Cancel
              </button>
              <button className="confirm-print-btn" onClick={handleConfirmPrint}>
                <Printer size={18} /> 
                Save & Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesManager;