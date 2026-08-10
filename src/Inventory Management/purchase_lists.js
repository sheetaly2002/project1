import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaChevronLeft, FaChevronRight, FaExclamationCircle, FaGem, FaPlus, FaRecycle, FaRupeeSign, FaSave, FaSearch, FaSpinner, FaTimes, FaTrash, FaTruck, FaWarehouse } from "react-icons/fa";
import BASE_URL from "./apiConfig";
import "./PurchaseBillEntry.css";

const API = `${BASE_URL}/purchase_api.php`;
const today = new Date().toISOString().slice(0,10);
const emptyBill = { supplier_id:"", purchase_type:"jewellery", bill_no:"", purchase_date:today, tax_percent:"0", discount_amount:"0", paid_amount:"0", payment_mode:"Cash", notes:"" };
const emptyJewellery = { product_id:"", purity_id:"", quantity:"1", net_weight:"", rate_per_gram:"", making_type:"amount", making_value:"0" };
const emptyRaw = { main_cat_id:"", purity_id:"", quantity:"1", net_weight:"", rate_per_gram:"", making_type:"amount", making_value:"0" };
const money = (v)=>Number(v||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});

export default function Purchase(){
  const [masters,setMasters]=useState({suppliers:[],metals:[],purities:[],products:[]});
  const [bill,setBill]=useState(emptyBill);
  const [items,setItems]=useState([{...emptyJewellery}]);
  const [rows,setRows]=useState([]);
  const [page,setPage]=useState(1); const [pages,setPages]=useState(1); const [search,setSearch]=useState(""); const [typeFilter,setTypeFilter]=useState("all");
  const [loading,setLoading]=useState(false); const [saving,setSaving]=useState(false); const [toast,setToast]=useState({type:"",msg:""});
  const limit=10;
  const show=(type,msg)=>{setToast({type,msg}); setTimeout(()=>setToast({type:"",msg:""}),3500)};
  const loadMasters=useCallback(async()=>{try{const r=await axios.get(`${API}?action=masters`); if(r.data.status==="success")setMasters(r.data);}catch{show("error","Masters load failed")}},[]);
  const loadList=useCallback(async()=>{setLoading(true); try{const q=new URLSearchParams({action:"list",page,limit,type:typeFilter,search}); const r=await axios.get(`${API}?${q}`); if(r.data.status==="success"){setRows(r.data.data||[]); setPages(r.data.pagination?.pages||1)} }catch{show("error","Purchase list failed")} finally{setLoading(false)}},[page,typeFilter,search]);
  useEffect(()=>{loadMasters()},[loadMasters]); useEffect(()=>{loadList()},[loadList]);
  const changeType=(type)=>{setBill({...emptyBill,purchase_type:type}); setItems([type==="raw"?{...emptyRaw}:{...emptyJewellery}]);};
  const puritiesFor=(metalId)=> (masters.purities||[]).filter(p=>String(p.main_cat_id)===String(metalId));
  const productById=(id)=> (masters.products||[]).find(p=>String(p.product_id)===String(id));
  const itemTotal=(it)=>{const net=Number(it.net_weight||0), rate=Number(it.rate_per_gram||0), base=net*rate; const mv=Number(it.making_value||0); const making=bill.purchase_type==="raw"?0:(it.making_type==="percent"?base*mv/100:mv); return {base,making,total:base+making};};
  const totals=useMemo(()=>{const sub=items.reduce((s,i)=>s+itemTotal(i).total,0); const discount=Number(bill.discount_amount||0); const taxable=Math.max(sub-discount,0); const tax=taxable*Number(bill.tax_percent||0)/100; const grand=taxable+tax; const paid=Number(bill.paid_amount||0); return {sub,discount,tax,grand,paid,due:Math.max(grand-paid,0)}},[items,bill]);
  const setItem=(idx,key,val)=>setItems(prev=>prev.map((x,i)=>i===idx?{...x,[key]:val}:x));
  const addItem=()=>setItems(prev=>[...prev,bill.purchase_type==="raw"?{...emptyRaw}:{...emptyJewellery}]);
  const removeItem=(idx)=>setItems(prev=>prev.length===1?prev:prev.filter((_,i)=>i!==idx));
  const save=async()=>{
    if(!bill.supplier_id)return show("error","Supplier select karo");
    for(const it of items){ if(bill.purchase_type==="jewellery"&&!it.product_id)return show("error","Product select karo"); if(bill.purchase_type==="raw"&&!it.main_cat_id)return show("error","Raw metal select karo"); if(Number(it.net_weight)<=0||Number(it.rate_per_gram)<=0)return show("error","Weight aur rate required"); }
    setSaving(true); try{const payload={...bill,items:items.map(it=>{const p=productById(it.product_id)||{}; return {...it,main_cat_id:it.main_cat_id||p.main_cat_id||""}})}; const r=await axios.post(`${API}?action=save`,payload); if(r.data.status==="success"){show("success","Purchase saved"); setBill(emptyBill); setItems([{...emptyJewellery}]); loadList();} else show("error",r.data.message||"Save failed");}catch(e){show("error",e.response?.data?.message||"Save failed")}finally{setSaving(false)}
  };
  return <div className="pu-page">
    {toast.msg&&<div className={`pu-toast ${toast.type}`}>{toast.type==="success"?<FaCheckCircle/>:<FaExclamationCircle/>}{toast.msg}</div>}
    <header className="pu-hero"><div><FaTruck/><p>Supplier Purchase</p><h1>Raw Metal & Jewellery Purchase</h1><span>Raw purchase goes to raw stock. Finished jewellery creates barcode stock.</span></div><button onClick={loadList}><FaRecycle/> Refresh</button></header>
    <section className="pu-form-card">
      <div className="pu-switch"><button className={bill.purchase_type==="jewellery"?"active":""} onClick={()=>changeType("jewellery")}><FaGem/> Finished Jewellery</button><button className={bill.purchase_type==="raw"?"active":""} onClick={()=>changeType("raw")}><FaWarehouse/> Raw Metal</button></div>
      <div className="pu-grid">
        <label>Supplier<select value={bill.supplier_id} onChange={e=>setBill({...bill,supplier_id:e.target.value})}><option value="">Select Supplier</option>{masters.suppliers.map(s=><option key={s.id} value={s.id}>{s.firm_name} {s.phone?`- ${s.phone}`:""}</option>)}</select></label>
        <label>Bill No<input value={bill.bill_no} onChange={e=>setBill({...bill,bill_no:e.target.value})} placeholder="Supplier bill no"/></label>
        <label>Date<input type="date" value={bill.purchase_date} onChange={e=>setBill({...bill,purchase_date:e.target.value})}/></label>
        <label>Payment Mode<select value={bill.payment_mode} onChange={e=>setBill({...bill,payment_mode:e.target.value})}><option>Cash</option><option>UPI</option><option>Bank</option><option>Card</option><option>Credit</option></select></label>
      </div>
      <div className="pu-items">{items.map((it,idx)=>{const p=productById(it.product_id); const metalId=bill.purchase_type==="raw"?it.main_cat_id:p?.main_cat_id; const calc=itemTotal(it); return <div className="pu-item" key={idx}><div className="pu-item-head"><b>{bill.purchase_type==="raw"?`Raw Metal ${idx+1}`:`Jewellery Piece ${idx+1}`}</b>{items.length>1&&<button onClick={()=>removeItem(idx)}><FaTrash/></button>}</div><div className="pu-item-grid">
        {bill.purchase_type==="jewellery" ? <label>Product<select value={it.product_id} onChange={e=>setItem(idx,"product_id",e.target.value)}><option value="">Select Product</option>{masters.products.map(p=><option key={p.product_id} value={p.product_id}>{p.product_name} - {p.metal_name||""}</option>)}</select></label> : <label>Metal<select value={it.main_cat_id} onChange={e=>setItem(idx,"main_cat_id",e.target.value)}><option value="">Select Metal</option>{masters.metals.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>}
        <label>Purity<select value={it.purity_id} onChange={e=>setItem(idx,"purity_id",e.target.value)}><option value="">Standard</option>{puritiesFor(metalId).map(p=><option key={p.id} value={p.id}>{p.purity_name}</option>)}</select></label>
        <label>Net Weight(g)<input type="number" step="0.001" value={it.net_weight} onChange={e=>setItem(idx,"net_weight",e.target.value)}/></label>
        <label>Rate/g<input type="number" step="0.01" value={it.rate_per_gram} onChange={e=>setItem(idx,"rate_per_gram",e.target.value)}/></label>
        {bill.purchase_type==="jewellery"&&<><label>Making Type<select value={it.making_type} onChange={e=>setItem(idx,"making_type",e.target.value)}><option value="amount">Amount</option><option value="percent">Percent</option></select></label><label>{it.making_type==="percent"?"Making %":"Making ₹"}<input type="number" step="0.01" value={it.making_value} onChange={e=>setItem(idx,"making_value",e.target.value)}/></label></>}
        <div className="pu-total"><span>Total</span><b>₹{money(calc.total)}</b></div>
      </div></div>})}</div>
      <button className="pu-add" onClick={addItem}><FaPlus/> Add Row</button>
      <div className="pu-summary"><label>Discount<input type="number" value={bill.discount_amount} onChange={e=>setBill({...bill,discount_amount:e.target.value})}/></label><label>GST %<input type="number" value={bill.tax_percent} onChange={e=>setBill({...bill,tax_percent:e.target.value})}/></label><label>Paid<input type="number" value={bill.paid_amount} onChange={e=>setBill({...bill,paid_amount:e.target.value})}/></label><div><span>Grand</span><b>₹{money(totals.grand)}</b><small>Due ₹{money(totals.due)}</small></div><button className="pu-save" onClick={save} disabled={saving}>{saving?<FaSpinner className="spin"/>:<FaSave/>} Save Purchase</button></div>
    </section>
    <section className="pu-list"><div className="pu-toolbar"><div className="pu-search"><FaSearch/><input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search bill/supplier"/></div><select value={typeFilter} onChange={e=>{setTypeFilter(e.target.value);setPage(1)}}><option value="all">All Purchase</option><option value="jewellery">Jewellery</option><option value="raw">Raw Metal</option></select></div><div className="pu-table-wrap"><table><thead><tr><th>#</th><th>Bill</th><th>Supplier</th><th>Type</th><th>Items</th><th>Total</th><th>Paid</th><th>Due</th></tr></thead><tbody>{loading?<tr><td colSpan="8">Loading...</td></tr>:rows.length?rows.map((r,idx)=><tr key={r.purchase_id}><td>{(page-1)*limit+idx+1}</td><td><b>{r.bill_no||`PUR-${r.purchase_id}`}</b><small>{r.purchase_date}</small></td><td>{r.firm_name}</td><td><span className={`type ${r.purchase_type}`}>{r.purchase_type}</span></td><td>{r.item_count}</td><td>₹{money(r.grand_total)}</td><td>₹{money(r.paid_amount)}</td><td>₹{money(r.due_amount)}</td></tr>):<tr><td colSpan="8">No purchases found</td></tr>}</tbody></table></div><div className="pu-pager"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}><FaChevronLeft/></button><b>Page {page}/{pages||1}</b><button disabled={page>=pages} onClick={()=>setPage(p=>p+1)}><FaChevronRight/></button></div></section>
  </div>
}
