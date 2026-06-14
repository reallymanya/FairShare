import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../api';
import Navbar from '../components/Navbar';

export default function GroupDetails() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  const fetchGroupData = async () => {
    try {
      const groupData = await apiFetch(`/groups/${id}`);
      setGroup(groupData);
      
      const debtsData = await apiFetch(`/settlements/debts/${id}`);
      setDebts(debtsData);
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSettle = async (payeeId, amount) => {
    try {
      await apiFetch('/settlements', {
        method: 'POST',
        body: JSON.stringify({ groupId: id, payeeId, amount })
      });
      alert('Settlement requested!');
      fetchGroupData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleConfirmSettlement = async (settlementId) => {
    try {
      await apiFetch(`/settlements/${settlementId}/confirm`, { method: 'POST' });
      fetchGroupData();
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <><Navbar/><div className="container">Loading...</div></>;

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 style={{ color: 'var(--primary)', marginBottom: '8px' }}>{group.name}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{group.members.length} members</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          <div>
            <div className="glass-panel" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2>Expenses</h2>
                <Link to={`/groups/${id}/expenses/new`} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>+ Add</Link>
              </div>
              
              {group.expenses.length === 0 ? <p>No expenses yet.</p> : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {group.expenses.map(e => (
                    <li key={e.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <Link to={`/groups/${id}/expenses/${e.id}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 'bold' }}>{e.description}</span>
                          <span style={{ color: 'var(--primary)' }}>${e.totalAmount}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Paid by {e.createdBy.name}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <div className="glass-panel" style={{ marginBottom: '24px' }}>
              <h2>Balances</h2>
              {debts.length === 0 ? <p>All settled up!</p> : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {debts.map((d, i) => (
                    <li key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                        <strong style={{ color: 'var(--danger)' }}>{d.from.name}</strong> owes <strong>{d.to.name}</strong> <span style={{ color: 'var(--primary)' }}>${d.amount}</span>
                      </span>
                      {d.from.id === parseInt(localStorage.getItem('userId')) && (
                        <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleSettle(d.to.id, d.amount)}>Settle</button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="glass-panel">
              <h2>Recent Settlements</h2>
              {group.settlements.length === 0 ? <p>No settlements.</p> : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {group.settlements.map(s => (
                    <li key={s.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{s.payer.name} paid {s.payee.name} <strong>${s.amount}</strong></span>
                        <span style={{ fontSize: '0.8rem', color: s.status === 'CONFIRMED' ? 'var(--primary)' : 'orange' }}>{s.status}</span>
                      </div>
                      {s.status === 'PENDING' && s.payeeId === parseInt(localStorage.getItem('userId')) && (
                        <button className="btn-primary" style={{ marginTop: '8px', padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleConfirmSettlement(s.id)}>Confirm Received</button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
