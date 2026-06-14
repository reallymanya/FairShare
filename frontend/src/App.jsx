import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import './index.css';

import Login from './pages/Login';
import GroupsList from './pages/GroupsList';
import Dashboard from './pages/Dashboard';
import DataImport from './pages/DataImport';

const isAuthenticated = () => !!localStorage.getItem('userId');

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const match = location.pathname.match(/\/groups\/(\d+)/);
  const groupId = match ? match[1] : null;

  if (!groupId) {
    return (
      <div className="sidebar">
        <div className="sidebar-icon" style={{ background: '#FCEBCC', color: '#111', fontWeight: 'bold', fontSize: '20px' }}>$</div>
        <div style={{ flex: 1 }}></div>
        <div className="sidebar-icon" onClick={() => { localStorage.removeItem('userId'); navigate('/login'); }} title="Logout">
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>OUT</span>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar-icon" onClick={() => navigate('/groups')} style={{ background: '#FCEBCC', color: '#111', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer' }} title="Back to Groups">$</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '40px' }}>
        <Link to={`/groups/${groupId}/dashboard`} className={`sidebar-icon ${location.pathname.includes('/dashboard') ? 'active' : ''}`} title="Dashboard" style={{ flexDirection: 'column', height: '64px', gap: '4px' }}>
          <div style={{ width: '20px', height: '20px', background: 'currentColor', borderRadius: '4px' }}></div>
          <span style={{ fontSize: '0.65rem', fontWeight: '600' }}>Home</span>
        </Link>
        <Link to={`/groups/${groupId}/import`} className={`sidebar-icon ${location.pathname.includes('/import') ? 'active' : ''}`} title="Import CSV" style={{ flexDirection: 'column', height: '64px', gap: '4px' }}>
          <div style={{ width: '20px', height: '20px', border: '2px solid currentColor', borderRadius: '4px' }}></div>
          <span style={{ fontSize: '0.65rem', fontWeight: '600' }}>Import</span>
        </Link>
      </div>
      <div className="sidebar-icon" onClick={() => { localStorage.removeItem('userId'); navigate('/login'); }} title="Logout">
        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>OUT</span>
      </div>
    </div>
  );
};

const ProtectedLayout = ({ children }) => {
  if (!isAuthenticated()) return <Navigate to="/login" />;
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/groups" element={<ProtectedLayout><GroupsList /></ProtectedLayout>} />
        <Route path="/groups/:groupId/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/groups/:groupId/import" element={<ProtectedLayout><DataImport /></ProtectedLayout>} />
        <Route path="/" element={<Navigate to="/groups" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
