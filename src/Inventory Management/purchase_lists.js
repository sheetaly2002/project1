






// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import BASE_URLS from './apiConfig';

// const PurchaseBillEntry = () => {
//     const [suppliers, setSuppliers] = useState([]);
//     const [billFile, setBillFile] = useState(null);

//     const [formData, setFormData] = useState({
//         supplier_id: '',
//         bill_no: '',
//         bill_date: new Date().toISOString().split('T')[0],
//         purchase_type: 'Ready-made',
//         total_net_weight: '',
//         total_quantity: '',
//         making_charge_type: 'Fixed', // Enum: Fixed / Percent
//         making_charge_value: '',
//         total_making_amount: 0, // Calculated automatically
//         other_charges: 0,
//         tax_type: 'GST',
//         tax_percent: 3,
//         tax_amount: 0,
//         total_amount: 0,
//         paid_amount: 0,
//         due_amount: 0,
//         payment_status: 'Unpaid',
//         note: ''
//     });

//     // Fetch Suppliers
//     useEffect(() => {
//         axios.get(`${BASE_URLS}/suppliers_api.php?action=get_all`)
//             .then(res => setSuppliers(res.data))
//             .catch(err => console.log("Supplier Load Error"));
//     }, []);

//     // Master Calculation Logic
//     useEffect(() => {
//         const weight = parseFloat(formData.total_net_weight) || 0;
//         const mType = formData.making_charge_type;
//         const mVal = parseFloat(formData.making_charge_value) || 0;
//         const other = parseFloat(formData.other_charges) || 0;
//         const tPer = parseFloat(formData.tax_percent) || 0;
//         const paid = parseFloat(formData.paid_amount) || 0;

//         // Note: Asli Gold Rate yahan dynamic bhi ho sakta hai
//         const estimatedMetalCost = weight * 7500; 

//         // 1. Making Amount Calculation
//         let makingAmt = 0;
//         if (mType === 'Percent') {
//             makingAmt = (estimatedMetalCost * mVal) / 100;
//         } else {
//             makingAmt = mVal; // Fixed total making
//         }

//         // 2. Totals
//         const baseAmount = estimatedMetalCost + makingAmt + other;
//         const taxVal = (baseAmount * tPer) / 100;
//         const grandTotal = baseAmount + taxVal;
//         const due = grandTotal - paid;

//         setFormData(prev => ({
//             ...prev,
//             total_making_amount: makingAmt.toFixed(2),
//             tax_amount: taxVal.toFixed(2),
//             total_amount: grandTotal.toFixed(2),
//             due_amount: due.toFixed(2),
//             payment_status: due <= 0 ? 'Paid' : (paid > 0 ? 'Partial' : 'Unpaid')
//         }));
//     }, [formData.total_net_weight, formData.making_charge_type, formData.making_charge_value, formData.other_charges, formData.tax_percent, formData.paid_amount]);

//     const handleFileChange = (e) => setBillFile(e.target.files[0]);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
        
//         // Multi-part form data for File Upload
//         const sendData = new FormData();
//         Object.keys(formData).forEach(key => sendData.append(key, formData[key]));
//         if (billFile) sendData.append('bill_copy', billFile);

//         try {
//             const res = await axios.post(`${BASE_URLS}/purchase_api.php?action=save_full_bill`, sendData, {
//                 headers: { 'Content-Type': 'multipart/form-data' }
//             });
//             if (res.data.status === 'success') {
//                 alert("✅ Purchase Bill Saved Successfully!");
//                 window.location.reload();
//             } else {
//                 alert("❌ Error: " + res.data.message);
//             }
//         } catch (err) {
//             alert("Network Error: Check API Connection");
//         }
//     };

//     return (
//         <div className="max-w-7xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
//             <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
//                 <div className="bg-slate-900 p-8 flex justify-between items-center">
//                     <h2 className="text-white text-3xl font-black italic tracking-tighter">SHREEJI PURCHASE PANEL</h2>
//                     <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase">{formData.purchase_type}</span>
//                 </div>

//                 <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    
//                     {/* SECTION 1: HEADER INFO */}
//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                         <div className="md:col-span-2">
//                             <label className="text-xs font-black text-gray-400 uppercase">1. Supplier / Dealer</label>
//                             <select className="w-full mt-2 p-4 bg-gray-100 border-none rounded-2xl font-bold" value={formData.supplier_id} onChange={(e)=>setFormData({...formData, supplier_id: e.target.value})} required>
//                                 <option value="">Select Firm Name</option>
//                                 {suppliers.map(s => <option key={s.id} value={s.id}>{s.firm_name} ({s.phone})</option>)}
//                             </select>
//                         </div>
//                         <div>
//                             <label className="text-xs font-black text-gray-400 uppercase">Bill No.</label>
//                             <input className="w-full mt-2 p-4 bg-gray-100 border-none rounded-2xl" placeholder="Invoice #" onChange={(e)=>setFormData({...formData, bill_no: e.target.value})} required />
//                         </div>
//                         <div>
//                             <label className="text-xs font-black text-gray-400 uppercase">Bill Date</label>
//                             <input type="date" className="w-full mt-2 p-4 bg-gray-100 border-none rounded-2xl" value={formData.bill_date} onChange={(e)=>setFormData({...formData, bill_date: e.target.value})} />
//                         </div>
//                     </div>

//                     {/* SECTION 2: WEIGHT & MAKING */}
//                     <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-8 bg-blue-50 rounded-[2rem] border-2 border-dashed border-blue-200">
//                         <div>
//                             <label className="text-xs font-black text-blue-700 uppercase">Purchase Type</label>
//                             <select className="w-full mt-2 p-3 bg-white rounded-xl border-none shadow-sm" value={formData.purchase_type} onChange={(e)=>setFormData({...formData, purchase_type: e.target.value})}>
//                                 <option value="Ready-made">Ready-made</option>
//                                 <option value="Raw-Material">Raw-Material</option>
//                             </select>
//                         </div>
//                         <div>
//                             <label className="text-xs font-black text-blue-700 uppercase">Net Weight (g)</label>
//                             <input type="number" step="0.001" className="w-full mt-2 p-3 bg-white rounded-xl border-none font-bold" onChange={(e)=>setFormData({...formData, total_net_weight: e.target.value})} required />
//                         </div>
//                         <div>
//                             <label className="text-xs font-black text-blue-700 uppercase">Total Qty</label>
//                             <input type="number" className="w-full mt-2 p-3 bg-white rounded-xl border-none" value={formData.total_quantity} onChange={(e)=>setFormData({...formData, total_quantity: e.target.value})} required />
//                         </div>
//                         <div>
//                             <label className="text-xs font-black text-orange-700 uppercase">Making Type</label>
//                             <select className="w-full mt-2 p-3 bg-white rounded-xl border-none font-bold text-orange-600" value={formData.making_charge_type} onChange={(e)=>setFormData({...formData, making_charge_type: e.target.value})}>
//                                 <option value="Fixed">Fixed (₹)</option>
//                                 <option value="Percent">Percent (%)</option>
//                             </select>
//                         </div>
//                         <div>
//                             <label className="text-xs font-black text-orange-700 uppercase">Making Value</label>
//                             <input type="number" className="w-full mt-2 p-3 bg-white rounded-xl border-none" onChange={(e)=>setFormData({...formData, making_charge_value: e.target.value})} />
//                         </div>
//                     </div>

//                     {/* SECTION 3: TAX & OTHER */}
//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                         <div>
//                             <label className="text-xs font-black text-gray-400 uppercase">Tax Type</label>
//                             <select className="w-full mt-2 p-3 bg-gray-100 rounded-xl border-none" onChange={(e)=>setFormData({...formData, tax_type: e.target.value})}>
//                                 <option value="GST">GST (3%)</option>
//                                 <option value="IGST">IGST (3%)</option>
//                                 <option value="None">None</option>
//                             </select>
//                         </div>
//                         <div>
//                             <label className="text-xs font-black text-gray-400 uppercase">Other Charges</label>
//                             <input type="number" className="w-full mt-2 p-3 bg-gray-100 rounded-xl border-none" onChange={(e)=>setFormData({...formData, other_charges: e.target.value})} />
//                         </div>
//                         <div className="md:col-span-2">
//                             <label className="text-xs font-black text-purple-600 uppercase">Upload Bill Copy (JPG/PDF)</label>
//                             <input type="file" className="w-full mt-2 p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-purple-600 file:text-white hover:file:bg-purple-700" onChange={handleFileChange} />
//                         </div>
//                     </div>

//                     {/* SECTION 4: PAYMENT SUMMARY */}
//                     <div className="bg-slate-900 rounded-[2.5rem] p-10 flex flex-col md:flex-row justify-between items-center text-white gap-8 shadow-2xl">
//                         <div className="flex gap-10">
//                             <div>
//                                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Grand Total</p>
//                                 <p className="text-5xl font-black text-yellow-400">₹ {formData.total_amount}</p>
//                             </div>
//                             <div>
//                                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Due Balance</p>
//                                 <p className="text-3xl font-black text-red-400">₹ {formData.due_amount}</p>
//                             </div>
//                         </div>

//                         <div className="flex items-center gap-4 w-full md:w-auto">
//                             <div className="bg-slate-800 p-4 rounded-2xl">
//                                 <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Payment Received</p>
//                                 <input type="number" className="bg-transparent border-none text-2xl font-bold text-green-400 outline-none w-32" placeholder="₹ 0.00" onChange={(e)=>setFormData({...formData, paid_amount: e.target.value})} />
//                             </div>
//                             <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-6 rounded-3xl font-black text-2xl shadow-xl transition-all active:scale-95">
//                                 SAVE BILL 💾
//                             </button>
//                         </div>
//                     </div>

//                     <div className="w-full">
//                         <label className="text-xs font-black text-gray-400 uppercase">Note / Remarks</label>
//                         <textarea className="w-full mt-2 p-4 bg-gray-100 border-none rounded-2xl" rows="2" placeholder="Add any specific details here..." onChange={(e)=>setFormData({...formData, note: e.target.value})}></textarea>
//                     </div>

//                 </form>
//             </div>
//         </div>
//     );
// };

// export default PurchaseBillEntry;


import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URLS from "./apiConfig";
import "./PurchaseBillEntry.css";

import { Trash2, Edit3, FileText, X } from "lucide-react";

const PurchaseBillEntry = () => {

const [suppliers,setSuppliers]=useState([]);
const [bills,setBills]=useState([]);
const [billFile,setBillFile]=useState(null);
const [isEditing,setIsEditing]=useState(false);

const [currentPage,setCurrentPage]=useState(1);
const billsPerPage=8;

const initialForm={
id:"",
supplier_id:"",
bill_no:"",
bill_date:new Date().toISOString().split("T")[0],
purchase_type:"Ready-made",
total_net_weight:"",
total_quantity:"",
making_charge_type:"Fixed",
making_charge_value:"",
total_making_amount:0,
other_charges:0,
tax_type:"GST",
tax_percent:3,
tax_amount:0,
total_amount:0,
paid_amount:0,
due_amount:0,
payment_status:"Unpaid",
note:"",
bill_copy:""
};

const [formData,setFormData]=useState(initialForm);

const fetchData=async()=>{
const [s,b]=await Promise.all([
axios.get(`${BASE_URLS}/purchase_api.php?action=get_suppliers`),
axios.get(`${BASE_URLS}/purchase_api.php?action=get_all_bills`)
]);

setSuppliers(s.data||[]);
setBills(b.data||[]);
};

useEffect(()=>{fetchData();},[]);


/* =========================
CALCULATION LOGIC (UNCHANGED)
========================= */

useEffect(()=>{

const weight=parseFloat(formData.total_net_weight)||0;
const mVal=parseFloat(formData.making_charge_value)||0;
const other=parseFloat(formData.other_charges)||0;
const tPer=parseFloat(formData.tax_percent)||0;
const paid=parseFloat(formData.paid_amount)||0;

const metalCost=weight*7500;

const makingAmt=
formData.making_charge_type==="Percent"
? (metalCost*mVal)/100
: mVal;

const base=metalCost+makingAmt+other;

const taxVal=
formData.tax_type==="None"
?0
:(base*tPer)/100;

const grand=base+taxVal;

const due=grand-paid;

setFormData(prev=>({
...prev,
total_making_amount:makingAmt.toFixed(2),
tax_amount:taxVal.toFixed(2),
total_amount:grand.toFixed(2),
due_amount:due.toFixed(2),
payment_status:due<=0?"Paid":(paid>0?"Partial":"Unpaid")
}));

},[
formData.total_net_weight,
formData.making_charge_type,
formData.making_charge_value,
formData.other_charges,
formData.tax_percent,
formData.tax_type,
formData.paid_amount
]);



/* =========================
SUBMIT
========================= */

const handleSubmit=async(e)=>{
e.preventDefault();

const data=new FormData();

Object.keys(formData).forEach(k=>{
data.append(k,formData[k]);
});

if(billFile)data.append("bill_copy",billFile);

const res=await axios.post(
`${BASE_URLS}/purchase_api.php?action=${isEditing?"update_bill":"save_full_bill"}`,
data
);

if(res.data.status==="success"){
alert("Success");
setFormData(initialForm);
setIsEditing(false);
fetchData();
}

};



/* =========================
PAGINATION
========================= */

const indexLast=currentPage*billsPerPage;
const indexFirst=indexLast-billsPerPage;

const currentBills=bills.slice(indexFirst,indexLast);

const totalPages=Math.ceil(bills.length/billsPerPage);



return(

<div className="page">

<div className="layout">


{/* =====================
FORM
===================== */}

<div className="formCard">

<div className={`formHeader ${isEditing?"edit":"add"}`}>

<span>
{isEditing?"UPDATE BILL":"NEW PURCHASE ENTRY"}
</span>

{isEditing&&(
<X
className="closeBtn"
onClick={()=>{
setIsEditing(false);
setFormData(initialForm);
}}
/>
)}

</div>


<form onSubmit={handleSubmit} className="formBody">


<label>Supplier</label>

<select
value={formData.supplier_id}
onChange={(e)=>setFormData({...formData,supplier_id:e.target.value})}
required
>

<option value="">Select Supplier</option>

{suppliers.map(s=>(
<option key={s.id} value={s.id}>
{s.firm_name}
</option>
))}

</select>



<div className="grid2">

<input
placeholder="Bill No"
value={formData.bill_no}
onChange={(e)=>setFormData({...formData,bill_no:e.target.value})}
required
/>

<input
type="date"
value={formData.bill_date}
onChange={(e)=>setFormData({...formData,bill_date:e.target.value})}
/>

</div>



<div className="grid2">

<input
type="number"
step="0.001"
placeholder="Net Weight"
value={formData.total_net_weight}
onChange={(e)=>setFormData({...formData,total_net_weight:e.target.value})}
/>

<input
type="number"
placeholder="Quantity"
value={formData.total_quantity}
onChange={(e)=>setFormData({...formData,total_quantity:e.target.value})}
/>

</div>


<select
value={formData.purchase_type}
onChange={(e)=>setFormData({...formData,purchase_type:e.target.value})}
>
<option value="Ready-made">Ready-made</option>
<option value="Raw-Material">Raw-Material</option>
</select>



<div className="grid2">

<select
value={formData.making_charge_type}
onChange={(e)=>setFormData({...formData,making_charge_type:e.target.value})}
>
<option value="Fixed">Making Fixed</option>
<option value="Percent">Making %</option>
</select>

<input
type="number"
placeholder="Making Value"
value={formData.making_charge_value}
onChange={(e)=>setFormData({...formData,making_charge_value:e.target.value})}
/>

</div>



<div className="grid2">

<select
value={formData.tax_type}
onChange={(e)=>setFormData({...formData,tax_type:e.target.value})}
>
<option value="GST">GST</option>
<option value="IGST">IGST</option>
<option value="None">No Tax</option>
</select>

<input
type="number"
placeholder="Other Charges"
value={formData.other_charges}
onChange={(e)=>setFormData({...formData,other_charges:e.target.value})}
/>

</div>



<div className="amountBox">

<h3>Total ₹{formData.total_amount}</h3>

<input
type="number"
placeholder="Paid Amount"
value={formData.paid_amount}
onChange={(e)=>setFormData({...formData,paid_amount:e.target.value})}
/>

<p className="due">
Due ₹{formData.due_amount}
</p>

</div>



<div className="uploadBox">

{formData.bill_copy && !billFile && (
<div className="oldFile">

<p>Current Bill Copy:</p>

<a
href={`${BASE_URLS}/${formData.bill_copy}`}
target="_blank"
rel="noreferrer"
className="viewBtn"
>
View File
</a>

</div>
)}

<input
type="file"
onChange={(e)=>setBillFile(e.target.files[0])}
/>

</div>



<textarea
placeholder="Note"
value={formData.note}
onChange={(e)=>setFormData({...formData,note:e.target.value})}
/>


<button className="saveBtn">
{isEditing?"UPDATE BILL":"SAVE BILL"}
</button>

</form>

</div>



{/* =====================
TABLE
===================== */}

<div className="tableCard">

<div className="tableHeader">

<FileText size={18}/>

<span>TRANSACTION HISTORY</span>

</div>



<div className="tableWrap">

<table>

<thead>

<tr>
<th>Invoice</th>
<th>Supplier</th>
<th>Weight</th>
<th>Total</th>
<th>Due</th>
<th>Action</th>
</tr>

</thead>


<tbody>

{currentBills.map(b=>(
<tr key={b.id}>

<td>
#{b.bill_no}
<br/>
<small>{b.bill_date}</small>
</td>

<td>{b.firm_name}</td>

<td>{b.total_net_weight} g</td>

<td>₹{b.total_amount}</td>

<td className={parseFloat(b.due_amount)>0?"dueText":"paidText"}>
₹{b.due_amount}
</td>

<td>

<button
className="editBtn"
onClick={()=>{
setIsEditing(true);
setFormData(b);
window.scrollTo(0,0);
}}
>
<Edit3 size={15}/>
</button>

<button
className="deleteBtn"
onClick={async()=>{
if(window.confirm("Delete?")){
await axios.get(`${BASE_URLS}/purchase_api.php?action=delete_bill&id=${b.id}`);
fetchData();
}
}}
>
<Trash2 size={15}/>
</button>

</td>

</tr>
))}

</tbody>

</table>

</div>



{/* =====================
PAGINATION
===================== */}

<div className="pagination">

<button
disabled={currentPage===1}
onClick={()=>setCurrentPage(currentPage-1)}
>
Prev
</button>

<span>
Page {currentPage} / {totalPages}
</span>

<button
disabled={currentPage===totalPages}
onClick={()=>setCurrentPage(currentPage+1)}
>
Next
</button>

</div>

</div>

</div>

</div>

);

};

export default PurchaseBillEntry;