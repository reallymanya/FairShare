import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../api';

export default function Dashboard() {
  const [details, setDetails] = useState(null);
  const [balances, setBalances] = useState([]);
  const [reviewItems, setReviewItems] = useState([]);
  const [userName, setUserName] = useState('User');

  const { groupId } = useParams();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    apiFetch('/auth/users').then(users => {
      const u = users.find(u => u.id === parseInt(userId));
      if (u) setUserName(u.name);
    }).catch(console.error);

    apiFetch(`/balances/${userId}/group/${groupId}`).then(setDetails).catch(console.error);
    apiFetch(`/balances/group/${groupId}`).then(setBalances).catch(console.error);
    apiFetch(`/review?groupId=${groupId}`).then(setReviewItems).catch(console.error);
  }, [userId, groupId]);

  const handleApprove = async (id) => {
    try {
      await apiFetch(`/review/${id}/approve`, { method: 'POST' });
      setReviewItems(reviewItems.filter(item => item.id !== id));
    } catch (e) { alert(e.message); }
  };

  const handleReject = async (id) => {
    try {
      await apiFetch(`/review/${id}/reject`, { method: 'POST' });
      setReviewItems(reviewItems.filter(item => item.id !== id));
    } catch (e) { alert(e.message); }
  };

  if (!details) return <div>Loading...</div>;

  const totalOwed = details.owedSplits.reduce((a, s) => a + s.amountOwed, 0);
  const totalPaid = details.paidExpenses.reduce((a, e) => a + e.amountINR, 0);
  const netBalance = totalPaid - totalOwed;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '60px' }}>
      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', background: '#F1F9EE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#1A2814', fontSize: '1.2rem' }}>
            {userName.charAt(0)}
          </div>
          <div>
            <div style={{ color: '#7D8A76', fontSize: '0.9rem', fontWeight: '500' }}>Hi, {userName}!</div>
            <div style={{ color: '#1A2814', fontWeight: '700', fontSize: '1.2rem' }}>Welcome back</div>
          </div>
        </div>
        <div style={{ width: '48px', height: '48px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '1.2rem' }}>
          🔔
        </div>
      </div>

      <div className="green-card" style={{ marginBottom: '32px', textAlign: 'center', padding: '40px 24px' }}>
        <p style={{ color: '#1A2814', opacity: 0.8, fontWeight: '600', fontSize: '1.1rem' }}>Net Balance</p>
        <h1 style={{ fontSize: '3.5rem', margin: '8px 0', color: '#1A2814', letterSpacing: '-1px' }}>
          {netBalance >= 0 ? '+' : '-'}₹{Math.abs(netBalance).toFixed(2)}
        </h1>
        <p style={{ color: '#1A2814', fontWeight: '500', opacity: 0.8 }}>
          {netBalance >= 0 ? 'You are owed in total' : 'You owe in total'}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>Transactions</h2>
        <span style={{ color: '#7D8A76', fontWeight: '600', cursor: 'pointer' }}>See all</span>
      </div>

      <div className="list-card" style={{ padding: '8px 24px', marginBottom: '32px' }}>
        {details.owedSplits.length === 0 && details.paidExpenses.length === 0 ? (
          <p style={{ color: '#7D8A76', padding: '16px 0' }}>No transactions found.</p>
        ) : (
          <>
            {details.owedSplits.map((s, i) => (
              <div key={`owed-${i}`} className="list-item" style={{ borderBottom: '1px solid #F1F9EE' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', background: '#FFF0F0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🔴</div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1A2814', fontSize: '1.1rem' }}>{s.expense.description}</div>
                    <div style={{ color: '#7D8A76', fontSize: '0.9rem' }}>You owe</div>
                  </div>
                </div>
                <div style={{ color: '#FF4A5A', fontWeight: '700', fontSize: '1.1rem' }}>-₹{s.amountOwed.toFixed(2)}</div>
              </div>
            ))}
            {details.paidExpenses.map((e, i) => (
              <div key={`paid-${i}`} className="list-item" style={{ borderBottom: '1px solid #F1F9EE' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', background: '#F1F9EE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🟢</div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1A2814', fontSize: '1.1rem' }}>{e.description}</div>
                    <div style={{ color: '#7D8A76', fontSize: '0.9rem' }}>You paid</div>
                  </div>
                </div>
                <div style={{ color: '#81D25C', fontWeight: '700', fontSize: '1.1rem' }}>+₹{e.amountINR.toFixed(2)}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {userName === 'Aisha' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>Aisha's View: Network Debts</h2>
          </div>
          <div className="list-card" style={{ padding: '8px 24px', marginBottom: '32px' }}>
            {balances.length === 0 ? <p style={{ padding: '16px 0', color: '#7D8A76' }}>No simplified debts found.</p> : (
              <div>
                {balances.map((b, i) => (
                  <div key={i} className="list-item" style={{ borderBottom: '1px solid #F1F9EE' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', background: '#F1F9EE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#1A2814' }}>{b.from.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1A2814', fontSize: '1.1rem' }}>{b.from}</div>
                        <div style={{ color: '#7D8A76', fontSize: '0.9rem' }}>owes {b.to}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1A2814' }}>₹{b.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {userName === 'Meera' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>Meera's View: Approve Changes</h2>
          </div>
          <div className="list-card" style={{ padding: '8px 24px', marginBottom: '32px' }}>
            {reviewItems.length === 0 ? <p style={{ color: '#7D8A76', padding: '16px 0' }}>No items need review!</p> : (
              <div>
                {reviewItems.map((item, i) => (
                  <div key={i} className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px', borderBottom: '1px solid #F1F9EE' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1A2814', fontSize: '1.1rem' }}>{item.description}</div>
                      <div style={{ color: '#7D8A76', fontSize: '0.9rem' }}>Flagged on {new Date(item.date).toLocaleDateString()}</div>
                    </div>
                    <div className="flex-between" style={{ width: '100%' }}>
                      <span style={{ fontWeight: '700', fontSize: '1.3rem', color: '#1A2814' }}>₹{item.amountINR}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-primary" style={{ width: 'auto', background: '#FFF0F0', color: '#FF4A5A', boxShadow: 'none', padding: '8px 24px' }} onClick={() => handleReject(item.id)}>Reject</button>
                        <button className="btn-primary" style={{ width: 'auto', padding: '8px 24px' }} onClick={() => handleApprove(item.id)}>Approve</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
