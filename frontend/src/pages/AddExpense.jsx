import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import Navbar from '../components/Navbar';

export default function AddExpense() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [splitType, setSplitType] = useState('EQUAL'); // EQUAL, UNEQUAL
  
  const [paidBy, setPaidBy] = useState(localStorage.getItem('userId'));
  const [customOwed, setCustomOwed] = useState({});

  useEffect(() => {
    apiFetch(`/groups/${groupId}`).then(setGroup);
  }, [groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(totalAmount);
    if (isNaN(amount) || amount <= 0) return alert('Invalid amount');

    let splits = [];
    if (splitType === 'EQUAL') {
      const splitAmount = amount / group.members.length;
      splits = group.members.map(m => ({
        userId: m.userId,
        amountPaid: m.userId === parseInt(paidBy) ? amount : 0,
        amountOwed: splitAmount
      }));
    } else {
      let totalOwed = 0;
      splits = group.members.map(m => {
        const owed = parseFloat(customOwed[m.userId] || 0);
        totalOwed += owed;
        return {
          userId: m.userId,
          amountPaid: m.userId === parseInt(paidBy) ? amount : 0,
          amountOwed: owed
        };
      });
      if (Math.abs(totalOwed - amount) > 0.01) {
        return alert(`Total owed (${totalOwed}) must equal total amount (${amount})`);
      }
    }

    try {
      await apiFetch('/expenses', {
        method: 'POST',
        body: JSON.stringify({ groupId, description, totalAmount: amount, splits })
      });
      navigate(`/groups/${groupId}`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (!group) return <><Navbar/><div className="container">Loading...</div></>;

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="glass-panel">
          <h2>Add Expense</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" className="input-field" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} required />
            <input type="number" step="0.01" className="input-field" placeholder="Total Amount" value={totalAmount} onChange={e=>setTotalAmount(e.target.value)} required />
            
            <div style={{ marginBottom: '16px' }}>
              <label>Paid by: </label>
              <select className="input-field" value={paidBy} onChange={e=>setPaidBy(e.target.value)}>
                {group.members.map(m => <option key={m.userId} value={m.userId}>{m.user.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label>Split Type: </label>
              <select className="input-field" value={splitType} onChange={e=>setSplitType(e.target.value)}>
                <option value="EQUAL">Equally</option>
                <option value="UNEQUAL">Unequally (exact amounts)</option>
              </select>
            </div>

            {splitType === 'UNEQUAL' && (
              <div style={{ marginBottom: '16px' }}>
                {group.members.map(m => (
                  <div key={m.userId} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ width: '100px' }}>{m.user.name}</span>
                    <input type="number" step="0.01" className="input-field" style={{ marginBottom: 0 }} placeholder="Amount owed" 
                      value={customOwed[m.userId] || ''} onChange={e => setCustomOwed({...customOwed, [m.userId]: e.target.value})} />
                  </div>
                ))}
              </div>
            )}

            <button type="submit" className="btn-primary">Add Expense</button>
          </form>
        </div>
      </div>
    </>
  );
}
