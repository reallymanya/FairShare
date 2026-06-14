import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';

export default function Login() {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim() })
      });
      localStorage.setItem('userId', user.id);
      navigate('/groups');
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', backgroundColor: '#F8FAF7', color: '#1A2814', position: 'fixed', top: 0, left: 0, overflowY: 'auto', overflowX: 'hidden', zIndex: 1000, fontFamily: "'Outfit', sans-serif" }}>
      {/* Background abstract glowing orbs */}
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(152, 228, 118, 0.3) 0%, rgba(248, 250, 247, 0) 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(152, 228, 118, 0.2) 0%, rgba(248, 250, 247, 0) 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '700', fontSize: '1.5rem', letterSpacing: '-0.5px' }}>
            <div style={{ width: '24px', height: '24px', background: '#98E476', borderRadius: '6px' }}></div>
            FairShare.
          </div>
        </header>

        {/* Hero Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '48px' }}>
          {/* Left Text */}
          <div style={{ flex: 1, minWidth: '400px' }}>
            <div style={{ color: '#81D25C', fontWeight: '600', letterSpacing: '2px', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '24px' }}>Shared Expenses</div>
            <h1 style={{ fontSize: '4.5rem', lineHeight: '1.1', fontWeight: '700', marginBottom: '24px', letterSpacing: '-2px' }}>
              Information for <br/> financial clarity
            </h1>
            <p style={{ color: '#7D8A76', fontSize: '1.2rem', lineHeight: '1.6', maxWidth: '420px', marginBottom: '48px' }}>
              Upload your CSV, instantly resolve anomalies, and let our algorithm simplify your network debts.
            </p>
          </div>

          {/* Right Login Card (Glassmorphism replacing the credit card) */}
          <div style={{ flex: 1, minWidth: '400px', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ 
              background: '#ffffff', 
              border: '1px solid #E8EDE4', 
              borderRadius: '32px', 
              padding: '40px', 
              width: '100%', 
              maxWidth: '440px',
              boxShadow: '0 32px 64px rgba(152, 228, 118, 0.15)',
              transform: 'rotate(-2deg)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '48px' }}>
                <div style={{ width: '40px', height: '24px', background: '#F1F9EE', borderRadius: '4px' }}></div>
                <div style={{ fontSize: '1.5rem' }}>💸</div>
              </div>
              
              <p style={{ color: '#7D8A76', fontSize: '0.9rem', marginBottom: '8px' }}>Access your ledger</p>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '32px', letterSpacing: '-0.5px' }}>Enter your name</h2>
              
              <form onSubmit={handleLogin}>
                <input 
                  type="text" 
                  placeholder="e.g. Aisha" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    background: '#F1F9EE', 
                    border: '1px solid transparent', 
                    color: '#1A2814', 
                    padding: '16px 20px', 
                    borderRadius: '16px', 
                    fontSize: '1.1rem', 
                    outline: 'none',
                    marginBottom: '16px',
                    fontFamily: 'inherit'
                  }}
                />
                <button type="submit" style={{ 
                  width: '100%', 
                  background: '#98E476', 
                  color: '#1A2814', 
                  border: 'none', 
                  padding: '16px', 
                  borderRadius: '16px', 
                  fontSize: '1.1rem', 
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 14px rgba(152, 228, 118, 0.4)'
                }}>
                  Open Dashboard
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Features */}
        <div style={{ marginTop: '100px', borderTop: '1px solid #E8EDE4', paddingTop: '60px' }}>
          <h3 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '60px', letterSpacing: '-0.5px' }}>What do we offer?</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '32px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', maxWidth: '320px' }}>
              <div style={{ width: '48px', height: '48px', background: '#F1F9EE', color: '#1A2814', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🔒</div>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Smart Detection</h4>
                <p style={{ color: '#7D8A76', fontSize: '0.95rem', lineHeight: '1.6' }}>Automatically flags duplicate expenses and safely converts foreign currencies.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', maxWidth: '320px' }}>
              <div style={{ width: '48px', height: '48px', background: '#F1F9EE', color: '#1A2814', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>⚡</div>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Greedy Algorithm</h4>
                <p style={{ color: '#7D8A76', fontSize: '0.95rem', lineHeight: '1.6' }}>Reduces total group transactions by intelligently netting all debts.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', maxWidth: '320px' }}>
              <div style={{ width: '48px', height: '48px', background: '#F1F9EE', color: '#1A2814', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📊</div>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Clear Audits</h4>
                <p style={{ color: '#7D8A76', fontSize: '0.95rem', lineHeight: '1.6' }}>Every data anomaly and edge-case resolution is meticulously logged.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
