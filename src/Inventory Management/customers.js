import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaUserPlus, FaEdit, FaTrash, FaPhoneAlt, FaSearch, 
  FaChevronLeft, FaChevronRight, FaFileUpload, FaTimes, 
  FaMapMarkerAlt, FaFilePdf, FaTimesCircle
} from 'react-icons/fa';
import BASE_URL from './apiConfig';

const API_BASE = `${BASE_URL}/customers.php`;

export default function CustomerDashboard() {
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
  
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customer_name: "", mobile: "", address: "", 
    dob: "", id_proof_type: "Aadhar Card", id_proof_number: ""
  });
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMobile ? 3 : 6;

  useEffect(() => { 
    fetchCustomers(); 
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(API_BASE);
      setCustomers(res.data.customers || []);
    } catch (err) { console.error("Error fetching data"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (file) data.append("id_proof_file", file);

    try {
      if (editId) {
        await axios.put(API_BASE, { ...formData, customer_id: editId });
        alert("Customer updated successfully! 💎");
      } else {
        await axios.post(API_BASE, data);
        alert("Customer added successfully! ✨");
      }
      resetForm();
      fetchCustomers();
    } catch (err) { 
      alert("Failed to save. Please try again."); 
    }
  };

  const resetForm = () => {
    setFormData({ customer_name: "", mobile: "", address: "", dob: "", id_proof_type: "Aadhar Card", id_proof_number: "" });
    setFile(null); setEditId(null); setIsFormVisible(false);
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await axios.delete(API_BASE, { data: { customer_id: id } });
      alert("Customer deleted successfully!");
      fetchCustomers();
    } catch (err) {
      alert("Failed to delete customer.");
    }
  };

  const filtered = customers.filter(c => 
    c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || c.mobile.includes(searchTerm)
  );

  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.softPink} 0%, ${colors.pureWhite} 100%)`,
      padding: isMobile ? '15px' : '30px',
      fontFamily: "'Poppins', sans-serif"
    }}>
      {/* Header Banner */}
      <header style={{
        background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientMid} 50%, ${colors.gradientEnd} 100%)`,
        padding: isMobile ? '25px 20px' : '40px 60px',
        borderRadius: '20px',
        marginBottom: isMobile ? '25px' : '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: `0 10px 40px rgba(0,0,0,0.2), inset 0 0 60px rgba(255, 215, 0, 0.1)`,
        border: `2px solid ${colors.glassBorder}`,
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: isMobile ? '24px' : '32px', 
            fontWeight: '900',
            background: `linear-gradient(135deg, ${colors.luxuryGold} 0%, ${colors.goldLight} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: '2px'
          }}>
            💎 Customer <span style={{fontWeight: '300'}}>Registry</span>
          </h1>
          <p style={{ 
            margin: '8px 0 0', 
            fontSize: isMobile ? '12px' : '14px', 
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: '0.5px'
          }}>
            Total {customers.length} premium members
          </p>
        </div>

        <div style={{display: 'flex', gap: isMobile ? '10px' : '20px', flexWrap: 'wrap', alignItems: 'center'}}>
          <div style={{
            background: '#fff',
            borderRadius: '100px',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: `2px solid ${colors.glassBorder}`,
            minWidth: isMobile ? '200px' : '280px',
            position: 'relative'
          }}>
            <FaSearch color={searchTerm ? colors.luxuryGold : '#ccc'} />
            <input 
              placeholder="Search clients..." 
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '14px',
                color: colors.deepDark,
                paddingLeft: '4px'
              }}
            />
            {searchTerm && (
              <FaTimesCircle 
                onClick={() => setSearchTerm('')}
                size={18}
                color="#999"
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.target.style.color = colors.goldDark}
                onMouseLeave={(e) => e.target.style.color = '#999'}
              />
            )}
          </div>
          <button 
            onClick={() => setIsFormVisible(true)}
            style={{
              background: `linear-gradient(135deg, ${colors.luxuryGold} 0%, ${colors.goldLight} 100%)`,
              color: colors.deepDark,
              border: 'none',
              padding: isMobile ? '10px 18px' : '12px 25px',
              borderRadius: '100px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: isMobile ? '13px' : '14px',
              boxShadow: `0 6px 20px ${colors.luxuryGold}66`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <FaUserPlus /> <span>{isMobile ? '' : 'New Customer'}</span>
          </button>
        </div>
      </header>

      {/* Main Table/Card Area */}
      <main style={{
        maxWidth: '1400px',
        margin: 'auto'
      }}>
        {isMobile ? (
          /* Mobile Card View */
          <div style={{
            display: 'grid',
            gap: '20px'
          }}>
            {currentData.map((c, index) => (
              <div key={c.customer_id} style={{
                background: '#fff',
                padding: '20px 15px',
                borderRadius: '18px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.1), 0 2px 10px rgba(255, 215, 0, 0.1)',
                border: `1px solid ${colors.glassBorder}`,
                position: 'relative'
              }}>
                {/* Serial Number Badge */}
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '15px',
                  background: `linear-gradient(135deg, ${colors.luxuryGold} 0%, ${colors.goldLight} 100%)`,
                  color: colors.deepDark,
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '16px',
                  boxShadow: `0 4px 15px ${colors.luxuryGold}66`,
                  border: `3px solid #fff`
                }}>
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '15px',
                  paddingBottom: '12px',
                  borderBottom: `2px solid ${colors.glassBorder}`
                }}>
                  <div style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${colors.luxuryGold} 0%, ${colors.goldLight} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: '700',
                    boxShadow: `0 4px 15px ${colors.luxuryGold}66`
                  }}>
                    {c.customer_name.charAt(0)}
                  </div>
                  <div style={{flex: 1}}>
                    <div style={{fontWeight: '800', fontSize: '16px', color: colors.deepDark}}>{c.customer_name}</div>
                    <div style={{fontSize: '11px', color: '#888'}}>Joined: {new Date(c.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px'}}>
                    <FaPhoneAlt size={14} color={colors.luxuryGold} />
                    <span style={{fontWeight: '600', color: colors.deepDark}}>{c.mobile}</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px'}}>
                    <FaMapMarkerAlt size={14} color={colors.luxuryGold} />
                    <span style={{fontWeight: '500', color: '#555', lineHeight: '1.4'}}>{c.address}</span>
                  </div>
                  <div style={{
                    padding: '10px',
                    background: `${colors.goldLight}22`,
                    borderRadius: '10px',
                    border: `1px solid ${colors.glassBorder}`
                  }}>
                    <div style={{fontSize: '11px', fontWeight: '700', color: colors.goldDark, marginBottom: '4px'}}>
                      {c.id_proof_type}
                    </div>
                    <code style={{fontSize: '12px', color: colors.deepDark, fontFamily: "'Poppins', sans-serif"}}>
                      {c.id_proof_number}
                    </code>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '15px',
                  paddingTop: '15px',
                  borderTop: `1px solid ${colors.glassBorder}`
                }}>
                  <button 
                    onClick={() => {setEditId(c.customer_id); setFormData(c); setIsFormVisible(true);}}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: `linear-gradient(135deg, #3498db 0%, #2980b9 100%)`,
                      border: 'none',
                      color: '#fff',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 15px rgba(52, 152, 219, 0.4)'
                    }}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(c.customer_id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: `linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)`,
                      border: 'none',
                      color: '#fff',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 15px rgba(231, 76, 60, 0.4)'
                    }}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop Table View */
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            border: `1px solid ${colors.glassBorder}`,
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr>
                  <th style={{
                    padding: '20px',
                    textAlign: 'center',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.9)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientMid} 100%)`,
                    borderBottom: `2px solid ${colors.glassBorder}`,
                    width: '80px'
                  }}>SR. NO.</th>
                  <th style={{
                    padding: '20px',
                    textAlign: 'left',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.9)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientMid} 100%)`,
                    borderBottom: `2px solid ${colors.glassBorder}`
                  }}>CLIENT</th>
                  <th style={{
                    padding: '20px',
                    textAlign: 'left',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.9)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientMid} 100%)`,
                    borderBottom: `2px solid ${colors.glassBorder}`
                  }}>CONTACT INFO</th>
                  <th style={{
                    padding: '20px',
                    textAlign: 'left',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.9)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientMid} 100%)`,
                    borderBottom: `2px solid ${colors.glassBorder}`
                  }}>KYC IDENTITY</th>
                  <th style={{
                    padding: '20px',
                    textAlign: 'left',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.9)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientMid} 100%)`,
                    borderBottom: `2px solid ${colors.glassBorder}`
                  }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((c, index) => (
                  <tr key={c.customer_id}>
                    <td style={{padding: '20px', borderBottom: `1px solid ${colors.glassBorder}`, textAlign: 'center'}}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        background: `linear-gradient(135deg, ${colors.luxuryGold} 0%, ${colors.goldLight} 100%)`,
                        color: colors.deepDark,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '14px',
                        margin: '0 auto',
                        boxShadow: `0 3px 10px ${colors.luxuryGold}66`
                      }}>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </div>
                    </td>
                    <td style={{padding: '20px', borderBottom: `1px solid ${colors.glassBorder}`}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          background: `linear-gradient(135deg, ${colors.luxuryGold} 0%, ${colors.goldLight} 100%)`,
                          color: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '18px',
                          boxShadow: `0 4px 15px ${colors.luxuryGold}66`
                        }}>
                          {c.customer_name.charAt(0)}
                        </div>
                        <div>
                          <div style={{fontWeight: '700', color: colors.deepDark, fontSize: '15px'}}>{c.customer_name}</div>
                          <div style={{fontSize: '11px', color: '#888'}}>Joined: {new Date(c.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding: '20px', borderBottom: `1px solid ${colors.glassBorder}`}}>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: colors.deepDark}}>
                          <FaPhoneAlt size={12} color={colors.luxuryGold} /> {c.mobile}
                        </div>
                        <span style={{fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px'}}>
                          <FaMapMarkerAlt size={11} color={colors.luxuryGold} /> {c.address}
                        </span>
                      </div>
                    </td>
                    <td style={{padding: '20px', borderBottom: `1px solid ${colors.glassBorder}`}}>
                      <div>
                        <span style={{
                          background: `${colors.goldLight}22`,
                          color: colors.goldDark,
                          border: `1px solid ${colors.glassBorder}`,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: '700',
                          display: 'inline-block',
                          marginBottom: '6px'
                        }}>{c.id_proof_type}</span>
                        <code style={{display: 'block', fontSize: '13px', color: colors.deepDark, fontFamily: "'Poppins', sans-serif"}}>
                          {c.id_proof_number}
                        </code>
                      </div>
                    </td>
                    <td style={{padding: '20px', borderBottom: `1px solid ${colors.glassBorder}`}}>
                      <div style={{display: 'flex', gap: '8px'}}>
                        <button 
                          title="Edit" 
                          onClick={() => {setEditId(c.customer_id); setFormData(c); setIsFormVisible(true);}}
                          style={{
                            background: 'none',
                            border: `2px solid ${colors.glassBorder}`,
                            padding: '8px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            color: '#3498db',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <FaEdit size={16} />
                        </button>
                        <button 
                          title="Delete" 
                          onClick={() => handleDelete(c.customer_id)}
                          style={{
                            background: 'none',
                            border: `2px solid ${colors.glassBorder}`,
                            padding: '8px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            color: '#e74c3c',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            <div style={{
              padding: '20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '20px',
              borderTop: `2px solid ${colors.glassBorder}`
            }}>
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)} 
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentPage === 1 ? '#ccc' : colors.luxuryGold,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '18px',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                <FaChevronLeft />
              </button>
              <div style={{display: 'flex', gap: '5px'}}>
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setCurrentPage(i+1)}
                    style={{
                      border: 'none',
                      background: currentPage === i+1 ? `linear-gradient(135deg, ${colors.luxuryGold} 0%, ${colors.goldLight} 100%)` : 'none',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      color: currentPage === i+1 ? colors.deepDark : '#999',
                      fontWeight: currentPage === i+1 ? '700' : '500',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {i+1}
                  </button>
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(p => p + 1)} 
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentPage === totalPages ? '#ccc' : colors.luxuryGold,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '18px',
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Elegant Side-Drawer Modal */}
      {isFormVisible && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(5px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            background: '#fff',
            width: isMobile ? '95%' : '450px',
            height: '100%',
            boxShadow: `-10px 0 50px rgba(0,0,0,0.2)`,
            animation: 'slideIn 0.4s ease-out',
            padding: isMobile ? '25px 20px' : '40px',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px',
              paddingBottom: '15px',
              borderBottom: `2px solid ${colors.glassBorder}`
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: isMobile ? '20px' : '22px',
                fontWeight: '800',
                background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientMid} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                {editId ? "✏️ Update Client" : "➕ Register Client"}
              </h3>
              <FaTimes 
                onClick={resetForm} 
                size={24} 
                color="#999" 
                style={{cursor: 'pointer', transition: 'all 0.3s ease'}}
                onMouseEnter={(e) => e.target.style.color = colors.goldDark}
                onMouseLeave={(e) => e.target.style.color = '#999'}
              />
            </div>
            
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <label style={{fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase'}}>Full Name *</label>
                <input 
                  required 
                  placeholder="Enter customer name" 
                  value={formData.customer_name} 
                  onChange={(e)=>setFormData({...formData, customer_name:e.target.value})}
                  style={{
                    padding: '14px',
                    border: `2px solid ${colors.glassBorder}`,
                    borderRadius: '12px',
                    outline: 'none',
                    fontSize: '14px',
                    backgroundColor: '#f8f9fa',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <label style={{fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase'}}>Mobile Number *</label>
                <div style={{position: 'relative'}}>
                  <FaPhoneAlt style={{position: 'absolute', left: '14px', top: '14px', color: colors.luxuryGold, fontSize: '16px'}} />
                  <input 
                    required 
                    placeholder="10-digit mobile number" 
                    value={formData.mobile} 
                    onChange={(e)=>setFormData({...formData, mobile:e.target.value})}
                    style={{
                      padding: '14px 14px 14px 45px',
                      border: `2px solid ${colors.glassBorder}`,
                      borderRadius: '12px',
                      outline: 'none',
                      fontSize: '14px',
                      backgroundColor: '#f8f9fa',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              </div>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <label style={{fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase'}}>Store Address</label>
                <textarea 
                  placeholder="Locality, City" 
                  value={formData.address} 
                  onChange={(e)=>setFormData({...formData, address:e.target.value})}
                  rows={isMobile ? 3 : 2}
                  style={{
                    padding: '14px',
                    border: `2px solid ${colors.glassBorder}`,
                    borderRadius: '12px',
                    outline: 'none',
                    fontSize: '14px',
                    backgroundColor: '#f8f9fa',
                    resize: 'vertical',
                    fontFamily: "'Poppins', sans-serif",
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
              
              <div style={{
                display: isMobile ? 'flex' : 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px'
              }}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase'}}>Identity Type</label>
                  <select 
                    value={formData.id_proof_type} 
                    onChange={(e)=>setFormData({...formData, id_proof_type:e.target.value})}
                    style={{
                      padding: '14px',
                      border: `2px solid ${colors.glassBorder}`,
                      borderRadius: '12px',
                      outline: 'none',
                      fontSize: '14px',
                      backgroundColor: '#f8f9fa',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <option>Aadhar Card</option>
                    <option>PAN Card</option>
                    <option>Voter ID</option>
                    <option>Passport</option>
                    <option>Driving License</option>
                  </select>
                </div>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase'}}>ID Number</label>
                  <input 
                    placeholder="Last 4 digits" 
                    value={formData.id_proof_number} 
                    onChange={(e)=>setFormData({...formData, id_proof_number:e.target.value})}
                    style={{
                      padding: '14px',
                      border: `2px solid ${colors.glassBorder}`,
                      borderRadius: '12px',
                      outline: 'none',
                      fontSize: '14px',
                      backgroundColor: '#f8f9fa',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              </div>
              
              <div style={{
                border: `2px dashed ${colors.glassBorder}`,
                padding: isMobile ? '25px' : '30px',
                borderRadius: '16px',
                textAlign: 'center',
                background: `${colors.goldLight}11`,
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}>
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%'
                  }}
                />
                <FaFileUpload size={32} color={colors.goldDark} style={{marginBottom: '10px'}} />
                <p style={{
                  margin: 0,
                  fontSize: '13px',
                  color: '#666',
                  fontWeight: '600'
                }}>
                  Click to upload KYC document
                </p>
                <p style={{
                  margin: '6px 0 0',
                  fontSize: '11px',
                  color: '#999'
                }}>
                  PDF or Image (Max 5MB)
                </p>
                {file && (
                  <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    background: '#fff',
                    borderRadius: '8px',
                    border: `1px solid ${colors.glassBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '12px',
                    color: colors.goldDark,
                    fontWeight: '600'
                  }}>
                    <FaFilePdf size={16} />
                    {file.name}
                  </div>
                )}
              </div>
              
              <button 
                type="submit"
                style={{
                  padding: '16px',
                  background: `linear-gradient(135deg, ${colors.gradientStart} 0%, ${colors.gradientMid} 100%)`,
                  color: colors.luxuryGold,
                  border: 'none',
                  borderRadius: '14px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `0 8px 25px ${colors.luxuryGold}44`,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginTop: '10px'
                }}
              >
                {editId ? "💫 Update Information" : "✨ Save Information"}
              </button>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideIn { 
          from { transform: translateX(100%); } 
          to { transform: translateX(0); } 
        }
      `}</style>
    </div>
  );
}