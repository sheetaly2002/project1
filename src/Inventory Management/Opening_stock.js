// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import BASE_URLS from './apiConfig';
// import { Trash2, Edit3, Package, Search, X, Printer, Hash } from 'lucide-react';

// const StockEntryForm = () => {
//     // 1. States
//     const [mainCats, setMainCats] = useState([]);
//     const [subCats, setSubCats] = useState([]);
//     const [allProducts, setAllProducts] = useState([]);
//     const [bills, setBills] = useState([]); 
//     const [stockList, setStockList] = useState([]);
//     const [filteredSubs, setFilteredSubs] = useState([]);
//     const [filteredProducts, setFilteredProducts] = useState([]);

//     const [isEditing, setIsEditing] = useState(false);
//     const [editId, setEditId] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');

//     const [stockType, setStockType] = useState('Opening');
//     const [billId, setBillId] = useState('');
//     const [mainCatId, setMainCatId] = useState('');
//     const [subCatId, setSubCatId] = useState('');
//     const [productId, setProductId] = useState('');
//     const [netWeight, setNetWeight] = useState('');
//     const [quantity, setQuantity] = useState(1);
//     const [rate, setRate] = useState('');
//     const [purity, setPurity] = useState('22K');
//     const [makingType, setMakingType] = useState('per_gram');
//     const [makingValue, setMakingValue] = useState(0);
//     const [totalCost, setTotalCost] = useState(0);

//     // 2. Fetch Initial Data
//     const fetchAllData = async () => {
//         try {
//             const [m, s, p, b, st] = await Promise.all([
//                 axios.get(`${BASE_URLS}/categories_api.php?action=get_main`),
//                 axios.get(`${BASE_URLS}/categories_api.php?action=get_all_sub`),
//                 axios.get(`${BASE_URLS}/products_api.php?action=get_all`),
//                 axios.get(`${BASE_URLS}/purchase_api.php?action=get_all_bills`),
//                 axios.get(`${BASE_URLS}/stock_api.php?action=get_all`)
//             ]);
//             setMainCats(m.data || []);
//             setSubCats(s.data || []);
//             setAllProducts(p.data || []);
//             setBills(b.data || []);
//             setStockList(st.data || []);
//         } catch (err) { console.error("Fetch Error"); }
//     };

//     useEffect(() => { fetchAllData(); }, []);

//     // 3. BARCODE PRINT LOGIC (Aapka Design)
//     const handlePrintTag = (item) => {
//         const printWindow = window.open("", "_blank");
//         const barcodeText = item.barcode || `SJ-${item.id}`;
//         const logoUrl = "https://upload.wikimedia.org/wikipedia/en/thumb/0/0b/Bureau_of_Indian_Standards_Logo.svg/1200px-Bureau_of_Indian_Standards_Logo.svg.png";

//         printWindow.document.write(`
//           <html>
//             <head>
//               <link href="https://fonts.googleapis.com/css2?family=Hind:wght@700&family=Inter:wght@700&display=swap" rel="stylesheet">
//               <style>
//                 @media print { body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
//                 @page { size: 85mm 25mm; margin: 0 !important; }
//                 * { box-sizing: border-box; margin: 0; padding: 0; }
//                 body { width: 85mm; height: 25mm; display: flex; align-items: center; justify-content: center; background: #fff; font-family: 'Inter', sans-serif; }
//                 .tag-wrapper { width: 82mm; height: 22mm; display: flex; border: 1.5px solid #d4af37; border-radius: 4px; overflow: hidden; background: white; }
//                 .side-brand { width: 38mm; background: #1a1a1a !important; color: #d4af37 !important; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2mm; border-right: 1.5px solid #d4af37; }
//                 .hindi-title { font-family: 'Hind', sans-serif; font-size: 17px; color: #f1c40f !important; margin-bottom: 2px; }
//                 .logo-icon { height: 6mm; width: auto; margin-bottom: 3px; }
//                 .hallmark-text { font-size: 7.5px; color: #ffffff !important; font-weight: bold; border-top: 1px solid #d4af37; padding-top: 2px; }
//                 .side-info { width: 44mm; padding: 2mm 4mm; display: flex; flex-direction: column; justify-content: center; background: #ffffff !important; }
//                 .v-stack { display: flex; flex-direction: column; gap: 2px; margin-bottom: 4px; }
//                 .item-line { font-size: 10px; font-weight: 800; color: #000 !important; text-transform: uppercase; }
//                 .weight-line { font-size: 10px; font-weight: 700; color: #333 !important; }
//                 .weight-line span { color: #777; font-weight: 400; margin-right: 4px; }
//                 .barcode-area { text-align: center; }
//                 .barcode-img { width: 100%; max-width: 35mm; height: 6.5mm; }
//                 .barcode-txt { font-size: 8px; font-family: monospace; color: #444 !important; font-weight: bold; }
//               </style>
//             </head>
//             <body>
//               <div class="tag-wrapper">
//                 <div class="side-brand">
//                   <div class="hindi-title">श्रीजी ज्वेलर्स</div>
//                   <img src="${logoUrl}" class="logo-icon" />
//                   <div class="hallmark-text">916 HALLMARK GOLD</div>
//                 </div>
//                 <div class="side-info">
//                   <div class="v-stack">
//                     <div class="item-line">${item.product_name} (${item.purity})</div>
//                     <div class="weight-line"><span>Net Wt:</span>${parseFloat(item.net_weight).toFixed(3)}g</div>
//                   </div>
//                   <div class="barcode-area">
//                     <img class="barcode-img" src="https://bwipjs-api.metafloor.com/?bcid=code128&text=${barcodeText}&scale=2&height=10" />
//                     <div class="barcode-txt">${barcodeText}</div>
//                   </div>
//                 </div>
//               </div>
//               <script>window.onload = function() { setTimeout(() => { window.print(); window.close(); }, 500); };</script>
//             </body>
//           </html>
//         `);
//         printWindow.document.close();
//     };

//     // 4. Dropdown Cascading Logic
//     useEffect(() => {
//         if (!isEditing) {
//             setFilteredSubs(subCats.filter(s => String(s.main_cat_id) === String(mainCatId)));
//             setSubCatId(''); setProductId('');
//         }
//     }, [mainCatId, subCats, isEditing]);

//     useEffect(() => {
//         if (!isEditing) {
//             setFilteredProducts(allProducts.filter(p => String(p.sub_cat_id) === String(subCatId)));
//             setProductId('');
//         }
//     }, [subCatId, allProducts, isEditing]);

//     // 5. Cost Calculation
//     useEffect(() => {
//         const w = parseFloat(netWeight) || 0;
//         const r = parseFloat(rate) || 0;
//         const mv = parseFloat(makingValue) || 0;
//         const q = parseInt(quantity) || 1;
//         let metalCost = w * r;
//         let makingCharge = 0;
//         if (makingType === 'per_gram') makingCharge = w * mv;
//         else if (makingType === 'fixed') makingCharge = mv;
//         else if (makingType === 'percent') makingCharge = (metalCost * mv) / 100;
//         setTotalCost(((metalCost + makingCharge) * q).toFixed(2));
//     }, [netWeight, rate, makingType, makingValue, quantity]);

//     // 6. Action Handlers
//     const handleEdit = (item) => {
//         setIsEditing(true);
//         setEditId(item.id);
//         setStockType(item.stock_type);
//         setBillId(item.purchase_bill_id || '');
        
//         const prod = allProducts.find(p => String(p.id) === String(item.product_id));
//         if (prod) {
//             const sub = subCats.find(s => String(s.id) === String(prod.sub_cat_id));
//             const mId = sub ? sub.main_cat_id : '';
//             setMainCatId(mId);
//             setSubCatId(prod.sub_cat_id);
//             setProductId(item.product_id);
//             setFilteredSubs(subCats.filter(s => String(s.main_cat_id) === String(mId)));
//             setFilteredProducts(allProducts.filter(p => String(p.sub_cat_id) === String(prod.sub_cat_id)));
//         }

//         setNetWeight(item.net_weight);
//         setQuantity(item.quantity);
//         setRate(item.rate);
//         setPurity(item.purity);
//         setMakingType(item.making_type);
//         setMakingValue(item.making_value);
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//     };

//     const resetForm = () => {
//         setIsEditing(false); setEditId(null);
//         setStockType('Opening'); setBillId('');
//         setMainCatId(''); setSubCatId(''); setProductId('');
//         setNetWeight(''); setQuantity(1); setRate(''); setMakingValue(0);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const payload = {
//             id: editId, stock_type: stockType, purchase_bill_id: stockType === 'Purchase' ? billId : null,
//             product_id: productId, net_weight: netWeight, quantity: quantity, rate: rate,
//             making_type: makingType, making_value: makingValue, total_cost: totalCost, purity: purity, status: 'Available'
//         };

//         try {
//             const res = await axios.post(`${BASE_URLS}/stock_api.php`, payload);
//             if (res.data.status === 'success') {
//                 alert(isEditing ? "Updated!" : "Stock Added!");
//                 resetForm(); fetchAllData();
//             }
//         } catch (err) { alert("Save Failed"); }
//     };

//     const handleDelete = async (id) => {
//         if (window.confirm("Delete this item?")) {
//             await axios.get(`${BASE_URLS}/stock_api.php?action=delete&id=${id}`);
//             fetchAllData();
//         }
//     };

//     return (
//         <div className="max-w-[1500px] mx-auto p-4 md:p-6 bg-[#f4f7f6] min-h-screen">
//             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
//                 {/* --- FORM SECTION --- */}
//                 <div className="lg:col-span-4">
//                     <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden sticky top-6">
//                         <div className={`p-6 text-white flex justify-between items-center ${isEditing ? 'bg-orange-600' : 'bg-[#1a1a1a]'}`}>
//                             <h2 className="font-black italic text-xl uppercase">
//                                 {isEditing ? 'Edit Stock Item' : 'New Stock Entry'}
//                             </h2>
//                             {isEditing && <X className="cursor-pointer" onClick={resetForm} />}
//                         </div>

//                         <form onSubmit={handleSubmit} className="p-8 space-y-5">
//                             <div className="grid grid-cols-2 gap-4">
//                                 <select value={stockType} onChange={(e) => setStockType(e.target.value)} className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl font-bold">
//                                     <option value="Opening">📦 Opening</option>
//                                     <option value="Purchase">🧾 Purchase</option>
//                                 </select>
//                                 <select value={purity} onChange={(e) => setPurity(e.target.value)} className="p-3 bg-gray-50 border rounded-xl font-bold">
//                                     <option value="22K">22K Gold</option>
//                                     <option value="24K">24K Gold</option>
//                                     <option value="18K">18K Gold</option>
//                                 </select>
//                             </div>

//                             {stockType === 'Purchase' && (
//                                 <select value={billId} onChange={(e) => setBillId(e.target.value)} className="w-full p-3 border-2 border-yellow-500 rounded-xl font-bold" required>
//                                     <option value="">-- Link to Bill --</option>
//                                     {bills.map(b => <option key={b.id} value={b.id}>{b.firm_name} (No: {b.bill_no})</option>)}
//                                 </select>
//                             )}

//                             <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border">
//                                 <select value={mainCatId} onChange={(e) => setMainCatId(e.target.value)} className="w-full p-3 border rounded-xl" required>
//                                     <option value="">Select Metal</option>
//                                     {mainCats.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
//                                 </select>
//                                 <select value={subCatId} onChange={(e) => setSubCatId(e.target.value)} className="w-full p-3 border rounded-xl" disabled={!mainCatId} required>
//                                     <option value="">Select Category</option>
//                                     {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.sub_name}</option>)}
//                                 </select>
//                                 <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full p-3 border-2 border-red-100 rounded-xl font-black bg-red-50" disabled={!subCatId} required>
//                                     <option value="">Select Product</option>
//                                     {filteredProducts.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}
//                                 </select>
//                             </div>

//                             <div className="grid grid-cols-2 gap-4">
//                                 <input type="number" step="0.001" value={netWeight} onChange={(e) => setNetWeight(e.target.value)} className="p-3 border rounded-xl font-black" placeholder="Weight (g)" required />
//                                 <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="p-3 border-2 border-blue-500 rounded-xl font-black text-center text-blue-600" required />
//                             </div>

//                             <div className="p-4 bg-blue-50 rounded-2xl border space-y-3">
//                                 <div className="grid grid-cols-2 gap-3">
//                                     <select value={makingType} onChange={(e) => setMakingType(e.target.value)} className="p-2 border rounded-lg text-xs font-bold bg-white">
//                                         <option value="per_gram">Making/Gram</option>
//                                         <option value="fixed">Fixed Making</option>
//                                         <option value="percent">Making %</option>
//                                     </select>
//                                     <input type="number" value={makingValue} onChange={(e) => setMakingValue(e.target.value)} placeholder="Value" className="p-2 border rounded-lg font-bold" />
//                                 </div>
//                                 <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="Rate ₹ (per g)" className="w-full p-3 border rounded-xl font-bold text-green-700" required />
//                             </div>

//                             <div className="bg-[#1a1a1a] p-5 rounded-[2rem] text-center">
//                                 <h3 className="text-4xl font-black text-yellow-400 italic">₹{totalCost}</h3>
//                             </div>

//                             <button type="submit" className={`w-full py-5 rounded-[2rem] font-black text-xl text-white shadow-xl ${isEditing ? 'bg-orange-600' : 'bg-[#b48c36]'}`}>
//                                 {isEditing ? 'UPDATE STOCK 🔄' : 'SAVE TO STOCK 💾'}
//                             </button>
//                         </form>
//                     </div>
//                 </div>

//                 {/* --- TABLE SECTION --- */}
//                 <div className="lg:col-span-8">
//                     <div className="bg-white rounded-[2.5rem] shadow-xl border overflow-hidden min-h-[85vh]">
//                         <div className="p-8 border-b flex flex-col md:flex-row justify-between items-center gap-4">
//                             <h3 className="text-2xl font-black italic flex items-center gap-3"><Package className="text-yellow-600" size={30}/> STOCK LEDGER</h3>
//                             <div className="relative w-full md:w-72">
//                                 <Search className="absolute left-4 top-3.5 text-gray-400" size={20}/>
//                                 <input type="text" placeholder="Search Barcode..." className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-full border-none" onChange={(e)=>setSearchTerm(e.target.value)} />
//                             </div>
//                         </div>

//                         <div className="overflow-x-auto">
//                             <table className="w-full text-left">
//                                 <thead className="bg-gray-50 border-b">
//                                     <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
//                                         <th className="p-6">Barcode / Type</th>
//                                         <th className="p-6">Product</th>
//                                         <th className="p-6">Wt / Qty</th>
//                                         <th className="p-6">Costing</th>
//                                         <th className="p-6 text-center">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-50">
//                                     {stockList.filter(i => i.barcode.toLowerCase().includes(searchTerm.toLowerCase()) || i.product_name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
//                                         <tr key={item.id} className="hover:bg-yellow-50/30 transition-all group">
//                                             <td className="p-6">
//                                                 <span className="font-black text-black bg-gray-100 px-3 py-1.5 rounded-lg text-xs block w-fit mb-1">{item.barcode}</span>
//                                                 <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${item.stock_type === 'Purchase' ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50'}`}>{item.stock_type}</span>
//                                             </td>
//                                             <td className="p-6">
//                                                 <p className="font-black text-gray-800 uppercase text-sm">{item.product_name}</p>
//                                                 <p className="text-[10px] text-gray-400 font-bold">{item.purity}</p>
//                                             </td>
//                                             <td className="p-6">
//                                                 <p className="font-black">{item.net_weight}g</p>
//                                                 <p className="text-[11px] font-black text-blue-500">Qty: {item.quantity}</p>
//                                             </td>
//                                             <td className="p-6">
//                                                 <p className="font-black text-gray-900">₹{item.total_cost}</p>
//                                             </td>
//                                             <td className="p-6">
//                                                 <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                                                     {/* TAG PRINT BUTTON ADDED */}
//                                                     <button onClick={() => handlePrintTag(item)} className="p-3 bg-yellow-50 text-yellow-700 rounded-xl hover:bg-yellow-600 hover:text-white" title="Print Tag">
//                                                         <Printer size={18}/>
//                                                     </button>
//                                                     <button onClick={() => handleEdit(item)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white"><Edit3 size={18}/></button>
//                                                     <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white"><Trash2 size={18}/></button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>

//             </div>
//         </div>
//     );
// };

// export default StockEntryForm;




import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URLS from "./apiConfig";
import {
Trash2,
Edit3,
Search,
X,
Printer
} from "lucide-react";

import "./StockEntryForm.css";

const StockEntryForm = () => {

const [mainCats,setMainCats]=useState([]);
const [subCats,setSubCats]=useState([]);
const [allProducts,setAllProducts]=useState([]);
const [stockList,setStockList]=useState([]);
const [bills,setBills]=useState([]);

const [showForm,setShowForm]=useState(false);
const [isEditing,setIsEditing]=useState(false);
const [editId,setEditId]=useState(null);

const [searchTerm,setSearchTerm]=useState("");
const [typeFilter,setTypeFilter]=useState("All");
const [catFilter,setCatFilter]=useState("All");

const [stockType,setStockType]=useState("Opening");
const [billId,setBillId]=useState("");

const [mainCatId,setMainCatId]=useState("");
const [subCatId,setSubCatId]=useState("");
const [productId,setProductId]=useState("");

const [netWeight,setNetWeight]=useState("");
const [quantity,setQuantity]=useState(1);
const [rate,setRate]=useState("");
const [purity,setPurity]=useState("22K");

const [makingType,setMakingType]=useState("per_gram");
const [makingValue,setMakingValue]=useState(0);
const [totalCost,setTotalCost]=useState(0);

const [filteredSubs,setFilteredSubs]=useState([]);
const [filteredProducts,setFilteredProducts]=useState([]);

const [currentPage,setCurrentPage]=useState(1);
const itemsPerPage=10;

const fetchAllData=async()=>{

const [m,s,p,b,st]=await Promise.all([

axios.get(`${BASE_URLS}/categories_api.php?action=get_main`),
axios.get(`${BASE_URLS}/categories_api.php?action=get_all_sub`),
axios.get(`${BASE_URLS}/products_api.php?action=get_all`),
axios.get(`${BASE_URLS}/purchase_api.php?action=get_all_bills`),
axios.get(`${BASE_URLS}/stock_api.php?action=get_all`)

]);

setMainCats(m.data||[]);
setSubCats(s.data||[]);
setAllProducts(p.data||[]);
setBills(b.data||[]);
setStockList(st.data||[]);

};

useEffect(()=>{
fetchAllData();
},[]);

useEffect(()=>{

setFilteredSubs(
subCats.filter(s=>String(s.main_cat_id)===String(mainCatId))
);

if(!isEditing){
setSubCatId("");
setProductId("");
}

},[mainCatId,subCats,isEditing]);

useEffect(()=>{

setFilteredProducts(
allProducts.filter(p=>String(p.sub_cat_id)===String(subCatId))
);

if(!isEditing){
setProductId("");
}

},[subCatId,allProducts,isEditing]);

useEffect(()=>{

const w=parseFloat(netWeight)||0;
const r=parseFloat(rate)||0;
const mv=parseFloat(makingValue)||0;
const q=parseInt(quantity)||1;

let metalCost=w*r;
let makingCharge=0;

if(makingType==="per_gram") makingCharge=w*mv;
else if(makingType==="fixed") makingCharge=mv;
else if(makingType==="percent") makingCharge=(metalCost*mv)/100;

setTotalCost(((metalCost+makingCharge)*q).toFixed(2));

},[netWeight,rate,makingType,makingValue,quantity]);

const filteredStock=stockList.filter(item=>{

const matchesType=
typeFilter==="All"||
item.stock_type?.toLowerCase()===typeFilter.toLowerCase();

const matchesCat=
catFilter==="All"||
String(item.main_cat_id)===String(catFilter);

const s=searchTerm.toLowerCase();

const matchesSearch=
item.product_name?.toLowerCase().includes(s)||
item.barcode?.toLowerCase().includes(s);

return matchesType && matchesCat && matchesSearch;

});

const indexLast=currentPage*itemsPerPage;
const indexFirst=indexLast-itemsPerPage;

const currentItems=filteredStock.slice(indexFirst,indexLast);
const totalPages=Math.ceil(filteredStock.length/itemsPerPage);

const handleSave=async(e)=>{

e.preventDefault();

const payload={
id:editId,
stock_type:stockType,
purchase_bill_id:stockType==="Purchase" ? billId : null,
product_id:productId,
net_weight:netWeight,
quantity,
rate,
making_type:makingType,
making_value:makingValue,
total_cost:totalCost,
purity,
status:"Available"
};

await axios.post(`${BASE_URLS}/stock_api.php`,payload);

resetForm();
setShowForm(false);
setIsEditing(false);

fetchAllData();

};
const resetForm = () => {

setEditId(null);

setStockType("Opening");
setBillId("");

setMainCatId("");
setSubCatId("");
setProductId("");

setNetWeight("");
setQuantity(1);
setRate("");

setPurity("22K");

setMakingType("per_gram");
setMakingValue(0);
setTotalCost(0);

};
const handleEdit = (item) => {

setIsEditing(true);
setEditId(item.id);

setStockType(item.stock_type);
setBillId(item.purchase_bill_id || "");

setNetWeight(item.net_weight);
setQuantity(item.quantity);
setRate(item.rate);
setPurity(item.purity);
setMakingType(item.making_type);
setMakingValue(item.making_value);
setMainCatId(item.main_cat_id);
setSubCatId(item.sub_cat_id);
setProductId(item.product_id);
setStockType(item.stock_type);
setBillId(item.purchase_bill_id || "");
// product find
const product = allProducts.find(
p => String(p.id) === String(item.product_id)
);

if(product){

setProductId(product.id);

const sub = subCats.find(
s => String(s.id) === String(product.sub_cat_id)
);

if(sub){
setSubCatId(sub.id);
setMainCatId(sub.main_cat_id);
}

}

setShowForm(true);

};

    const handlePrintTag = (item) => {
        const printWindow = window.open("", "_blank");
        const barcodeText = item.barcode || `SJ-${item.id}`;
        const logoUrl = "https://upload.wikimedia.org/wikipedia/en/thumb/0/0b/Bureau_of_Indian_Standards_Logo.svg/1200px-Bureau_of_Indian_Standards_Logo.svg.png";

        printWindow.document.write(`
          <html>
            <head>
              <link href="https://fonts.googleapis.com/css2?family=Hind:wght@700&family=Inter:wght@700&display=swap" rel="stylesheet">
              <style>
                @media print { body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
                @page { size: 85mm 25mm; margin: 0 !important; }
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { width: 85mm; height: 25mm; display: flex; align-items: center; justify-content: center; background: #fff; font-family: 'Inter', sans-serif; }
                .tag-wrapper { width: 82mm; height: 22mm; display: flex; border: 1.5px solid #d4af37; border-radius: 4px; overflow: hidden; background: white; }
                .side-brand { width: 38mm; background: #1a1a1a !important; color: #d4af37 !important; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2mm; border-right: 1.5px solid #d4af37; }
                .hindi-title { font-family: 'Hind', sans-serif; font-size: 17px; color: #f1c40f !important; margin-bottom: 2px; }
                .logo-icon { height: 6mm; width: auto; margin-bottom: 3px; }
                .hallmark-text { font-size: 7.5px; color: #ffffff !important; font-weight: bold; border-top: 1px solid #d4af37; padding-top: 2px; }
                .side-info { width: 44mm; padding: 2mm 4mm; display: flex; flex-direction: column; justify-content: center; background: #ffffff !important; }
                .v-stack { display: flex; flex-direction: column; gap: 2px; margin-bottom: 4px; }
                .item-line { font-size: 10px; font-weight: 800; color: #000 !important; text-transform: uppercase; }
                .weight-line { font-size: 10px; font-weight: 700; color: #333 !important; }
                .weight-line span { color: #777; font-weight: 400; margin-right: 4px; }
                .barcode-area { text-align: center; }
                .barcode-img { width: 100%; max-width: 35mm; height: 6.5mm; }
                .barcode-txt { font-size: 8px; font-family: monospace; color: #444 !important; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="tag-wrapper">
                <div class="side-brand">
                  <div class="hindi-title">श्रीजी ज्वेलर्स</div>
                  <img src="${logoUrl}" class="logo-icon" />
                  <div class="hallmark-text">916 HALLMARK GOLD</div>
                </div>
                <div class="side-info">
                  <div class="v-stack">
                    <div class="item-line">${item.product_name} (${item.purity})</div>
                    <div class="weight-line"><span>Net Wt:</span>${parseFloat(item.net_weight).toFixed(3)}g</div>
                  </div>
                  <div class="barcode-area">
                    <img class="barcode-img" src="https://bwipjs-api.metafloor.com/?bcid=code128&text=${barcodeText}&scale=2&height=10" />
                    <div class="barcode-txt">${barcodeText}</div>
                  </div>
                </div>
              </div>
              <script>window.onload = function() { setTimeout(() => { window.print(); window.close(); }, 500); };</script>
            </body>
          </html>
        `);
        printWindow.document.close();
    };


return(

<div className="stock-page">

<div className="header">

<h2>Shreeji Jewellery Stock</h2>

<button
className="add-btn"
onClick={()=>{

resetForm();
setIsEditing(false);
setShowForm(true);

}}
>

* Add Stock

</button>

</div>

<div className="filters">

<div className="search">

<Search size={18}/>

<input
placeholder="Search item or barcode"
value={searchTerm}
onChange={(e)=>setSearchTerm(e.target.value)}
/>

</div>

<select
value={typeFilter}
onChange={(e)=>setTypeFilter(e.target.value)}

>

<option>All</option>
<option>Opening</option>
<option>Purchase</option>

</select>

<select
value={catFilter}
onChange={(e)=>setCatFilter(e.target.value)}

>

<option value="All">All Metals</option>

{mainCats.map(m=>(

<option key={m.id} value={m.id}>{m.name}</option>
))}

</select>

</div>

<div className="table-box">

<table>

<thead>

<tr>

<th>Barcode</th>
<th>Item</th>
<th>Weight</th>
<th>Value</th>
<th>Action</th>

</tr>

</thead>

<tbody>

{currentItems.map(item=>(

<tr key={item.id}>

<td>{item.barcode}</td>

<td>
<strong>{item.product_name}</strong>
<p>{item.purity}</p>
</td>

<td>{item.net_weight} g</td>

<td>₹{item.total_cost}</td>

<td className="actions">

<button onClick={()=>handleEdit(item)}> <Edit3 size={16}/> </button>

<button onClick={()=>handlePrintTag(item)}> <Printer size={16}/> </button>

<button
onClick={()=>{
if(window.confirm("Delete item?"))
axios.get(`${BASE_URLS}/stock_api.php?action=delete&id=${item.id}`).then(fetchAllData)
}}

>

<Trash2 size={16}/>

</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

<div className="pagination">

{Array.from({length:totalPages}).map((_,i)=>(

<button
key={i}
className={currentPage===i+1?"active":""}
onClick={()=>setCurrentPage(i+1)}

>

{i+1}

</button>

))}

</div>

{showForm && (

<div className="modal">

<div className="modal-box">

<div className="modal-header">

<h3>{isEditing?"Edit Stock":"New Stock Entry"}</h3>

<button onClick={()=>setShowForm(false)}> <X/> </button>

</div>

<form onSubmit={handleSave} className="form-grid">

{/* STOCK TYPE */}
<select value={stockType} onChange={(e)=>setStockType(e.target.value)}>
<option value="Opening">Opening</option>
<option value="Purchase">Purchase</option>
</select>

{/* PURCHASE BILL */}
{stockType==="Purchase" && (
<select
value={billId}
onChange={(e)=>setBillId(e.target.value)}
required
>
<option value="">Select Purchase Bill</option>
{bills.map(b=>(
<option key={b.id} value={b.id}>
{b.firm_name} - {b.bill_no}
</option>
))}
</select>
)}

{/* PURITY */}
<select value={purity} onChange={(e)=>setPurity(e.target.value)}>
<option>22K</option>
<option>24K</option>
<option>18K</option>
<option>Silver</option>
</select>

{/* MAIN CATEGORY */}
<select
value={mainCatId}
onChange={(e)=>setMainCatId(e.target.value)}
required
>
<option value="">Select Metal</option>
{mainCats.map(m=>(
<option key={m.id} value={m.id}>{m.name}</option>
))}
</select>

{/* SUB CATEGORY */}
<select
value={subCatId}
onChange={(e)=>setSubCatId(e.target.value)}
disabled={!mainCatId}
required
>
<option value="">Select Category</option>
{filteredSubs.map(s=>(
<option key={s.id} value={s.id}>{s.sub_name}</option>
))}
</select>

{/* PRODUCT */}
<select
value={productId}
onChange={(e)=>setProductId(e.target.value)}
disabled={!subCatId}
required
>
<option value="">Select Product</option>
{filteredProducts.map(p=>(
<option key={p.id} value={p.id}>{p.product_name}</option>
))}
</select>

{/* NET WEIGHT */}
<input
placeholder="Net Weight"
value={netWeight}
onChange={(e)=>setNetWeight(e.target.value)}
required
/>

{/* QUANTITY */}
<input
placeholder="Quantity"
value={quantity}
onChange={(e)=>setQuantity(e.target.value)}
required
/>

{/* RATE */}
<input
placeholder="Gold Rate"
value={rate}
onChange={(e)=>setRate(e.target.value)}
required
/>

{/* MAKING TYPE */}
<select value={makingType} onChange={(e)=>setMakingType(e.target.value)}>
{/* <option value="per_gram">Per Gram</option> */}
<option value="fixed">Fixed</option>
<option value="percent">Percent</option>
</select>

{/* MAKING VALUE */}
<input
placeholder="Making Value"
value={makingValue}
onChange={(e)=>setMakingValue(e.target.value)}
/>

{/* TOTAL */}
<div className="total">
Total ₹ {totalCost}
</div>

<button className="save-btn">
Save Stock
</button>

</form>

</div>

</div>

)}

</div>

);

};

export default StockEntryForm;
