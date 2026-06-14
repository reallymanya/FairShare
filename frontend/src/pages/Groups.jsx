import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import Navbar from '../components/Navbar';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await apiFetch('/groups');
      setGroups(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/groups', {
        method: 'POST',
        body: JSON.stringify({ name: newGroupName })
      });
      setNewGroupName('');
      fetchGroups();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <h2>Create Group</h2>
          <form onSubmit={handleCreateGroup} style={{ display: 'flex', gap: '16px' }}>
            <input 
              type="text" 
              className="input-field" 
              style={{ marginBottom: 0 }}
              placeholder="Group Name (e.g. Vegas Trip)" 
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary">Create</button>
          </form>
        </div>

        <div className="glass-panel">
          <h2>Your Groups</h2>
          {groups.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No groups yet.</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {groups.map(g => (
                <li key={g.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <Link to={`/groups/${g.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>{g.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{g.members.length} members</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
