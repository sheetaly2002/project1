import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaHistory, FaKey, FaSearch, FaTimesCircle, FaTrash, FaUserEdit, FaUsers, FaUserShield } from "react-icons/fa";
import BASE_URL from "./apiConfig";
import "./UserManagement.css";

const API_URL = `${BASE_URL}/Login.php`;

const MODULES = ["dashboard","customers","suppliers","master_setup","opening_stock","purchase","stock","sales","payments","old_gold","repairing","returns","reports","users","settings"];

const blankPermissions = MODULES.reduce((acc, m) => {
  acc[m] = { can_view: 0, can_add: 0, can_edit: 0, can_delete: 0 };
  return acc;
}, {});

const initialForm = {
  id: "", username: "", password: "", full_name: "", email: "", mobile: "",
  role: "staff", is_active: 1, permissions: JSON.parse(JSON.stringify(blankPermissions))
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("users");
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  const notify = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 3500);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?action=get_users`);
      setUsers(res.data.data || []);
    } catch {
      notify("error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}?action=login_history&limit=100`);
      setHistory(res.data.data || []);
    } catch {}
  };

  useEffect(() => { fetchUsers(); fetchHistory(); }, []);

  const resetForm = () => setForm(JSON.parse(JSON.stringify(initialForm)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.username || (!form.id && !form.password)) {
      return notify("error", "Name, username and password required");
    }

    try {
      const payload = { ...form };
      if (payload.role === "admin") payload.permissions = {};
      const res = form.id ? await axios.put(API_URL, payload) : await axios.post(`${API_URL}?action=save_user`, payload);

      if (res.data.status === "success") {
        notify("success", res.data.message || "Saved");
        resetForm();
        fetchUsers();
      } else {
        notify("error", res.data.message || "Save failed");
      }
    } catch {
      notify("error", "Save failed");
    }
  };

  const editUser = (u) => {
    const perms = JSON.parse(JSON.stringify(blankPermissions));
    if (u.permissions) Object.keys(u.permissions).forEach((m) => { perms[m] = { ...perms[m], ...u.permissions[m] }; });

    setForm({
      id: u.id, username: u.username, password: "", full_name: u.full_name || "",
      email: u.email || "", mobile: u.mobile || "", role: u.role || "staff",
      is_active: Number(u.is_active ?? 1), permissions: perms
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deactivateUser = async (id) => {
    if (!window.confirm("Deactivate this user?")) return;
    try {
      const res = await axios.delete(API_URL, { data: { id } });
      if (res.data.status === "success") { notify("success", "User deactivated"); fetchUsers(); }
      else notify("error", res.data.message || "Failed");
    } catch { notify("error", "Failed"); }
  };

  const setPerm = (module, key, value) => {
    setForm((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [module]: { ...prev.permissions[module], [key]: value ? 1 : 0 } }
    }));
  };

  const quickAllowView = () => {
    const next = JSON.parse(JSON.stringify(form.permissions));
    MODULES.forEach((m) => next[m].can_view = 1);
    setForm({ ...form, permissions: next });
  };

  const quickFullStaff = () => {
    const next = JSON.parse(JSON.stringify(form.permissions));
    MODULES.forEach((m) => next[m] = { can_view: 1, can_add: 1, can_edit: 1, can_delete: 0 });
    setForm({ ...form, permissions: next });
  };

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => (u.full_name || "").toLowerCase().includes(q) || (u.username || "").toLowerCase().includes(q) || (u.role || "").toLowerCase().includes(q));
  }, [users, search]);

  return (
    <div className="um-page">
      {msg.text && <div className={`um-toast ${msg.type}`}>{msg.type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}{msg.text}</div>}

      <header className="um-header">
        <FaUserShield />
        <h1>User & Role Management</h1>
        <p>Create staff accounts, assign permissions, and track login history</p>
      </header>

      <div className="um-tabs">
        <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}><FaUsers /> Users</button>
        <button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}><FaHistory /> Login History</button>
      </div>

      {tab === "users" ? (
        <div className="um-grid">
          <section className="um-card form-card">
            <div className="card-top"><h3>{form.id ? "Edit User" : "Create User"}</h3></div>
            <form onSubmit={handleSubmit} className="um-form">
              <div className="field"><label>Full Name *</label><input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
              <div className="field"><label>Username *</label><input disabled={!!form.id} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
              <div className="field"><label>{form.id ? "New Password (optional)" : "Password *"}</label><div className="key-input"><FaKey /><input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div></div>

              <div className="field-row">
                <div className="field"><label>Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div className="field"><label>Mobile</label><input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></div>
              </div>

              <div className="field-row">
                <div className="field"><label>Role</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="staff">Staff</option><option value="admin">Admin</option></select></div>
                <div className="field"><label>Status</label><select value={form.is_active} onChange={(e) => setForm({ ...form, is_active: Number(e.target.value) })}><option value={1}>Active</option><option value={0}>Inactive</option></select></div>
              </div>

              {form.role === "staff" && (
                <div className="permission-box">
                  <div className="permission-head"><strong>Permissions</strong><div><button type="button" onClick={quickAllowView}>View All</button><button type="button" onClick={quickFullStaff}>Staff Default</button></div></div>
                  <div className="perm-table-wrap">
                    <table className="perm-table">
                      <thead><tr><th>Module</th><th>View</th><th>Add</th><th>Edit</th><th>Delete</th></tr></thead>
                      <tbody>
                        {MODULES.map((m) => (
                          <tr key={m}>
                            <td>{m.replace("_", " ")}</td>
                            {["can_view","can_add","can_edit","can_delete"].map((k) => (
                              <td key={k}><input type="checkbox" checked={!!form.permissions[m]?.[k]} onChange={(e) => setPerm(m, k, e.target.checked)} /></td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <button className="save-btn" type="submit">{form.id ? "Update User" : "Create User"}</button>
              {form.id && <button type="button" className="cancel-btn" onClick={resetForm}>Cancel Edit</button>}
            </form>
          </section>

          <section className="um-card list-card">
            <div className="card-top list-top"><h3>System Users</h3><div className="search-box"><FaSearch /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." /></div></div>
            <div className="users-list">
              {loading ? <div className="loader">Loading...</div> : filteredUsers.length ? filteredUsers.map((u) => (
                <div className="user-row" key={u.id}>
                  <div><strong>{u.full_name}</strong><span>@{u.username}</span><small>{u.email || "No email"} • {u.mobile || "No mobile"}</small></div>
                  <div className="user-meta"><em className={u.role === "admin" ? "admin" : "staff"}>{u.role}</em><em className={Number(u.is_active) === 1 ? "active" : "inactive"}>{Number(u.is_active) === 1 ? "Active" : "Inactive"}</em><small>Last: {u.last_login || "Never"}</small></div>
                  <div className="user-actions"><button onClick={() => editUser(u)}><FaUserEdit /></button><button onClick={() => deactivateUser(u.id)}><FaTrash /></button></div>
                </div>
              )) : <div className="empty">No users found.</div>}
            </div>
          </section>
        </div>
      ) : (
        <section className="um-card history-card">
          <div className="card-top"><h3>Recent Login History</h3></div>
          <div className="history-wrap">
            <table><thead><tr><th>User</th><th>Username</th><th>Status</th><th>IP</th><th>Time</th></tr></thead>
              <tbody>{history.map((h) => <tr key={h.id}><td>{h.full_name || "-"}</td><td>{h.username}</td><td><em className={h.login_status}>{h.login_status}</em></td><td>{h.ip_address}</td><td>{h.login_time}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
