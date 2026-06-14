import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <nav style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', borderBottom: 'var(--glass-border)', background: 'var(--surface)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>Shared Expenses App</div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Link to="/dashboard" style={{ color: 'var(--text-main)', fontWeight: '500' }}>Dashboard</Link>
        <Link to="/import" style={{ color: 'var(--text-main)', fontWeight: '500' }}>Data Import</Link>
        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', fontWeight: '500' }}>Logout</button>
      </div>
    </nav>
  );
}
