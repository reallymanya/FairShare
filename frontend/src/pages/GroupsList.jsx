import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';

export default function GroupsList() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    apiFetch(`/groups?userId=${userId}`).then(setGroups).catch(console.error);
  }, [userId]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const group = await apiFetch('/groups', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), description: 'A shared ledger' })
      });
      await apiFetch(`/groups/${group.id}/members`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      navigate(`/groups/${group.id}/dashboard`);
    } catch(err) { alert(err.message); }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '40px', color: '#1A2814' }}>Your Groups</h1>
      
      {groups.length === 0 ? (
        <p style={{ color: '#7D8A76', marginBottom: '32px' }}>You aren't part of any groups yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {groups.map(g => (
            <div key={g.id} className="list-card" onClick={() => navigate(`/groups/${g.id}/dashboard`)} style={{ cursor: 'pointer', padding: '32px', transition: 'transform 0.2s', border: '1px solid #E8EDE4' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#1A2814' }}>{g.name}</h2>
              <p style={{ color: '#7D8A76' }}>{g.members.length} members</p>
            </div>
          ))}
        </div>
      )}

      <div className="list-card" style={{ marginTop: '64px', padding: '40px' }}>
        <h2 style={{ color: '#1A2814', marginBottom: '16px' }}>Create a New Group</h2>
        <form onSubmit={handleCreateGroup} style={{ display: 'flex', gap: '16px' }}>
          <input 
            type="text" 
            placeholder="e.g. Goa Trip" 
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid #E8EDE4', fontSize: '1.1rem', outline: 'none' }}
          />
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '16px 32px', borderRadius: '16px' }}>Create</button>
        </form>
      </div>
    </div>
  );
}
