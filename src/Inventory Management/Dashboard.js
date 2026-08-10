import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FaChartLine, FaFileInvoiceDollar, FaGem, FaRecycle, FaTools, FaUsers, FaWarehouse, FaWallet } from 'react-icons/fa';
import BASE_URL from './apiConfig';
import './Dashboard.css';

const API = `${BASE_URL}/dashboard_api.php`;
const money = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const wt = (v) => Number(v || 0).toFixed(3);

export default function Dashboard() {
  const [data, setData] = useState({ recentSales: [], recentCash: [], recentRepairs: [], monthlySales: [] });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API);
      setData(res.data || {});
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const cards = [
    { title: 'Today Sales', value: `₹${money(data.todaySales)}`, icon: <FaFileInvoiceDollar />, cls: 'gold' },
    { title: 'Today Profit', value: `₹${money(data.todayProfit)}`, icon: <FaChartLine />, cls: Number(data.todayProfit) >= 0 ? 'green' : 'red' },
    { title: 'Cash In Today', value: `₹${money(data.cashInToday)}`, icon: <FaWallet />, cls: 'green' },
    { title: 'Cash Out Today', value: `₹${money(data.cashOutToday)}`, icon: <FaWallet />, cls: 'red' },
    { title: 'Stock Value', value: `₹${money(data.stockValue)}`, icon: <FaWarehouse />, cls: 'brown' },
    { title: 'Stock Weight', value: `${wt(data.totalStockWeight)}g`, icon: <FaGem />, cls: 'violet' },
    { title: 'Customers', value: data.totalCustomers || 0, icon: <FaUsers />, cls: 'blue' },
    { title: 'Pending Repairs', value: data.pendingRepairs || 0, icon: <FaTools />, cls: 'orange' },
  ];

  const maxSales = useMemo(() => Math.max(1, ...(data.monthlySales || []).map(x => Number(x.sales || 0))), [data.monthlySales]);

  return <div className="ad-page">
    <section className="ad-hero">
      <div>
        <span>SHREEJI JEWELLERS</span>
        <h1>Advanced Dashboard</h1>
        <p>Sales, profit, cashbook, stock and repairing summary in one smart panel.</p>
      </div>
      <button onClick={load}><FaRecycle className={loading ? 'spin' : ''}/> Refresh</button>
    </section>

    <section className="ad-cards">
      {cards.map((c) => <div className={`ad-card ${c.cls}`} key={c.title}>
        <div className="ad-icon">{c.icon}</div>
        <span>{c.title}</span>
        <b>{loading ? 'Loading...' : c.value}</b>
      </div>)}
    </section>

    <section className="ad-grid">
      <div className="ad-panel chart-panel">
        <h2>Monthly Sales Trend</h2>
        <div className="bar-chart">
          {(data.monthlySales || []).length ? data.monthlySales.map((m, i) => <div className="bar-item" key={i}>
            <div className="bar" style={{height: `${Math.max(8, Number(m.sales || 0) / maxSales * 180)}px`}}><small>₹{money(m.sales)}</small></div>
            <span>{m.month}</span>
          </div>) : <p className="empty">No sales trend found</p>}
        </div>
      </div>

      <div className="ad-panel">
        <h2>Recent Sales</h2>
        <table><tbody>{(data.recentSales || []).map(s => <tr key={s.sale_id}><td><b>{s.bill_no}</b><small>{s.sale_date}</small></td><td>{s.customer_name}</td><td>₹{money(s.grand_total)}</td></tr>)}{!(data.recentSales || []).length && <tr><td className="empty">No recent sales</td></tr>}</tbody></table>
      </div>

      <div className="ad-panel">
        <h2>Recent Cashbook</h2>
        <table><tbody>{(data.recentCash || []).map(c => <tr key={c.id}><td><b>{c.category}</b><small>{c.entry_date} • {c.payment_mode}</small></td><td><span className={c.entry_type}>{c.entry_type}</span></td><td>₹{money(c.amount)}</td></tr>)}{!(data.recentCash || []).length && <tr><td className="empty">No cash entries</td></tr>}</tbody></table>
      </div>

      <div className="ad-panel">
        <h2>Repairing Status</h2>
        <table><tbody>{(data.recentRepairs || []).map(r => <tr key={r.id}><td><b>{r.repair_no}</b><small>{r.customer_name} • {r.item_name}</small></td><td>{r.status}</td><td>₹{money(r.due_amount)}</td></tr>)}{!(data.recentRepairs || []).length && <tr><td className="empty">No repairs found</td></tr>}</tbody></table>
      </div>
    </section>
  </div>;
}
