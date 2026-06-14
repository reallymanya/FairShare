import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../api';
import Navbar from '../components/Navbar';

export default function ExpenseDetails() {
  const { id: groupId, expenseId } = useParams();
  const [comments, setComments] = useState([]);
  const [newText, setNewText] = useState('');

  useEffect(() => {
    fetchComments();
    const interval = setInterval(fetchComments, 3000); // Short polling every 3s
    return () => clearInterval(interval);
  }, [expenseId]);

  const fetchComments = async () => {
    try {
      const data = await apiFetch(`/chat/${expenseId}`);
      setComments(data);
    } catch(e) { console.error(e) }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newText) return;
    try {
      await apiFetch(`/chat/${expenseId}`, {
        method: 'POST',
        body: JSON.stringify({ text: newText })
      });
      setNewText('');
      fetchComments();
    } catch(e) { alert(e.message) }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="glass-panel" style={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
          <h2>Expense Chat</h2>
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {comments.map(c => (
              <div key={c.id} style={{ 
                alignSelf: c.userId === parseInt(localStorage.getItem('userId')) ? 'flex-end' : 'flex-start',
                background: c.userId === parseInt(localStorage.getItem('userId')) ? 'var(--primary-dark)' : 'rgba(255,255,255,0.1)',
                padding: '8px 12px', borderRadius: '16px', maxWidth: '70%'
              }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{c.user.name}</div>
                <div>{c.text}</div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
            <input type="text" className="input-field" style={{ marginBottom: 0 }} placeholder="Type a message..." value={newText} onChange={e=>setNewText(e.target.value)} />
            <button type="submit" className="btn-primary">Send</button>
          </form>
        </div>
      </div>
    </>
  );
}
