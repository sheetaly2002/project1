import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserShield, FaUserEdit, FaTrash, FaUsers, FaKey } from 'react-icons/fa';
import BASE_URLS from './apiConfig';

const USERS_API = `${BASE_URLS}/Login.php`;

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id: "", username: "", password: "", full_name: "", role: "staff" });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const isMobile = windowWidth < 768;
  
  const colors = {
      deepDark: "#0f0f1a",
      luxuryGold: "#ffd700",
      softPink: "#fafbfc",
      pureWhite: "#ffffff",
      accentBrown: "#d4af37",
      glassBorder: "rgba(255, 215, 0, 0.3)",
      gradientStart: "#1e1e2f",
      gradientMid: "#2d2d44",
      gradientEnd: "#1a1a2e",
      goldLight: "#ffe55c",
      goldDark: "#b8860b"
    };

  useEffect(() => { 
    fetchUsers(); 
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(USERS_API);
      setUsers(res.data.data || []);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        // UPDATE
        await axios.put(USERS_API, form);
        alert("User Updated Successfully!");
      } else {
        // CREATE
        await axios.post(USERS_API, form);
        alert("New User Created!");
      }
      resetForm();
      fetchUsers();
    } catch (err) { alert("Error saving user"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await axios.delete(USERS_API, { data: { id } });
      fetchUsers();
    }
  };

  const resetForm = () => {
    setForm({ id: "", username: "", password: "", full_name: "", role: "staff" });
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading Users...</div>;

  return (
    <div style={{ 
      padding: isMobile ? '15px' : '25px', 
      background: `linear-gradient(135deg, ${colors.softPink} 0%, ${colors.pureWhite} 100%)`, 
      minHeight: '100vh',
      fontFamily: "'Poppins', sans-serif"
    }}>
      
      {/* Header Section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: isMobile ? '30px' : '40px',
        padding: isMobile ? '20px 15px' : '30px',
        background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientMid} 50%, ${colors.gradientEnd} 100%)`,
        borderRadius: '20px',
        boxShadow: `0 10px 40px rgba(0,0,0,0.2), inset 0 0 60px rgba(255, 215, 0, 0.1)`,
        border: `2px solid ${colors.glassBorder}`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: `radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)`,
          animation: 'rotate 20s linear infinite'
        }} />
        <h2 style={{ 
          color: colors.luxuryGold, 
          margin: '0 0 10px 0',
          fontSize: isMobile ? '24px' : '32px',
          fontWeight: '900',
          letterSpacing: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          position: 'relative',
          zIndex: 1,
          textShadow: '0 0 30px rgba(255, 215, 0, 0.5)'
        }}>
          <FaUserShield /> User & Staff Management
        </h2>
        <p style={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontSize: isMobile ? '13px' : '14px',
          margin: 0,
          letterSpacing: '1px',
          position: 'relative',
          zIndex: 1
        }}>
          Manage permissions and system access
        </p>
      </div>

      <div style={styles.mainGrid(colors, isMobile)}>
        {/* --- LEFT SIDE: CREATE/EDIT FORM --- */}
        <div style={styles.card(colors, isMobile)}>
          <h3 style={{ 
            color: colors.luxuryGold, 
            borderBottom: `2px solid ${colors.glassBorder}`, 
            paddingBottom: '12px',
            margin: '0 0 20px 0',
            fontSize: '18px',
            fontWeight: '800',
            letterSpacing: '1px'
          }}>
            {form.id ? "Edit User Details" : "Create New Account"}
          </h3>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={{fontSize: '12px', fontWeight: '600', color: '#555'}}>Full Name</label>
              <input 
                value={form.full_name} 
                onChange={e => setForm({...form, full_name: e.target.value})} 
                placeholder="Staff Member Name" 
                required 
                style={styles.input(colors)}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={{fontSize: '12px', fontWeight: '600', color: '#555'}}>Username (Login ID)</label>
              <input 
                value={form.username} 
                onChange={e => setForm({...form, username: e.target.value})} 
                placeholder="unique_username" 
                required 
                style={styles.input(colors)}
                disabled={form.id}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={{fontSize: '12px', fontWeight: '600', color: '#555'}}>Password</label>
              <div style={{position: 'relative'}}>
                <FaKey style={{position: 'absolute', left: '14px', top: '14px', color: colors.luxuryGold, fontSize: '16px'}} />
                <input 
                  type="text"
                  value={form.password} 
                  onChange={e => setForm({...form, password: e.target.value})} 
                  placeholder="Set Password" 
                  required 
                  style={{...styles.input(colors), paddingLeft: '40px'}}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={{fontSize: '12px', fontWeight: '600', color: '#555'}}>System Role</label>
              <select 
                value={form.role} 
                onChange={e => setForm({...form, role: e.target.value})} 
                style={styles.input(colors)}
              >
                <option value="staff">Staff (Limited Access)</option>
                <option value="admin">Admin (Full Access)</option>
              </select>
            </div>

            <button type="submit" style={styles.saveBtn(colors)}>
              {form.id ? "Update User" : "Add User to System"}
            </button>
            {form.id && <button type="button" onClick={resetForm} style={styles.cancelBtn}>Cancel Edit</button>}
          </form>
        </div>

        {/* --- RIGHT SIDE: USERS LIST --- */}
        <div style={styles.tableCard(colors, isMobile)}>
          <div style={{
            padding: isMobile ? '16px 18px' : '20px', 
            background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientMid} 100%)`, 
            color: colors.luxuryGold, 
            fontWeight: '800', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            fontSize: '14px',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            <FaUsers /> Current System Users
          </div>
          <table width="100%" cellPadding="0" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={styles.thRow(colors)}>
                <th style={{padding: '14px 18px'}}>NAME</th>
                <th style={{padding: '14px 18px'}}>USERNAME</th>
                <th style={{padding: '14px 18px'}}>ROLE</th>
                <th style={{padding: '14px 18px'}}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{
                  ...styles.tr(colors),
                  backgroundColor: `${colors.goldLight}08`
                }}>
                  <td style={{padding: '16px 18px'}}>
                    <div style={{fontWeight: '700', fontSize: '14px', color: colors.deepDark}}>{u.full_name}</div>
                    <small style={{color: '#999', fontSize: '11px'}}>Joined: {new Date(u.created_at).toLocaleDateString()}</small>
                  </td>
                  <td style={{padding: '16px 18px'}}>
                    <code style={styles.userCode(colors)}>{u.username}</code>
                  </td>
                  <td style={{padding: '16px 18px'}}>
                    <span style={styles.roleBadge(colors, u.role === 'admin')}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{padding: '16px 18px'}}>
                    <button onClick={() => setForm(u)} style={styles.editBtn}><FaUserEdit /></button>
                    <button onClick={() => handleDelete(u.id)} style={styles.deleteBtn}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  mainGrid: (colors, isMobile) => ({ 
    display: 'grid', 
    gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', 
    gap: isMobile ? '20px' : '30px', 
    alignItems: 'start' 
  }),
  card: (colors, isMobile) => ({ 
    background: '#fff', 
    padding: isMobile ? '20px 15px' : '25px', 
    borderRadius: '20px', 
    boxShadow: '0 10px 40px rgba(0,0,0,0.1), 0 2px 10px rgba(255, 215, 0, 0.1)',
    border: `1px solid ${colors.glassBorder}`
  }),
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '16px', 
    marginTop: '20px' 
  },
  inputGroup: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '6px' 
  },
  input: (colors) => ({ 
    padding: '13px 14px', 
    borderRadius: '12px', 
    border: `2px solid ${colors.glassBorder}`, 
    fontSize: '14px', 
    outline: 'none',
    backgroundColor: '#f8f9fa',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontWeight: '500'
  }),
  saveBtn: (colors) => ({ 
    background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientMid} 100%)`, 
    color: colors.luxuryGold, 
    border: 'none', 
    padding: '14px', 
    borderRadius: '12px', 
    fontWeight: '800', 
    cursor: 'pointer', 
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: `0 6px 20px ${colors.luxuryGold}44`,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    fontSize: '13px'
  }),
  cancelBtn: { 
    background: 'transparent', 
    border: 'none', 
    color: '#888', 
    marginTop: '10px', 
    cursor: 'pointer', 
    textDecoration: 'underline',
    fontSize: '13px',
    fontWeight: '500'
  },
  tableCard: (colors, isMobile) => ({ 
    background: '#fff', 
    borderRadius: '20px', 
    overflow: 'hidden', 
    boxShadow: '0 10px 40px rgba(0,0,0,0.1), 0 2px 10px rgba(255, 215, 0, 0.1)',
    border: `1px solid ${colors.glassBorder}`
  }),
  thRow: (colors) => ({ 
    textAlign: 'left', 
    background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientMid} 100%)`,
    color: colors.luxuryGold,
    fontSize: '11px', 
    textTransform: 'uppercase',
    letterSpacing: '1px'
  }),
  tr: (colors) => ({ 
    borderBottom: `1px solid ${colors.glassBorder}`,
    transition: 'background-color 0.3s ease'
  }),
  userCode: (colors) => ({ 
    background: `${colors.goldLight}22`, 
    padding: '4px 8px', 
    borderRadius: '6px', 
    fontSize: '13px',
    color: colors.goldDark,
    fontWeight: '600'
  }),
  roleBadge: (colors, isAdmin) => ({ 
    padding: '5px 12px', 
    borderRadius: '50px', 
    fontSize: '10px', 
    fontWeight: '800',
    backgroundColor: isAdmin ? colors.luxuryGold : '#e0e0e0',
    color: isAdmin ? colors.deepDark : '#555',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: isAdmin ? `0 2px 10px ${colors.luxuryGold}66` : 'none'
  }),
  editBtn: { 
    background: `linear-gradient(135deg, #3498db 0%, #2980b9 100%)`, 
    color: '#fff', 
    border: 'none', 
    padding: '9px', 
    borderRadius: '8px', 
    marginRight: '6px', 
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(52, 152, 219, 0.4)'
  },
  deleteBtn: { 
    background: `linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)`, 
    color: '#fff', 
    border: 'none', 
    padding: '9px', 
    borderRadius: '8px', 
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(231, 76, 60, 0.4)'
  }
};