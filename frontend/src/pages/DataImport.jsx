import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function DataImport() {
  const [file, setFile] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(false);
  const { groupId } = useParams();

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return alert('Select a file');
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`http://localhost:3000/api/import/${groupId}`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setAnomalies(data.anomalies);
      alert('Import successful!');
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="glass-panel" style={{ marginBottom: '24px' }}>
          <h2>Data Import</h2>
          <form onSubmit={handleImport}>
            <input type="file" className="input-field" accept=".csv" onChange={e => setFile(e.target.files[0])} />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Importing...' : 'Upload & Process CSV'}
            </button>
          </form>
        </div>

        {anomalies.length > 0 && (
          <div className="glass-panel">
            <h2>Import Report (Anomalies)</h2>
            <p style={{ color: 'var(--text-muted)' }}>Found {anomalies.length} data issues in the CSV.</p>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '16px' }}>
              {anomalies.map((a, i) => (
                <li key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 'bold' }}>Row {a.rowNum}: {a.issueType}</span>
                    <span style={{ fontSize: '0.8rem', color: a.issueType.includes('Review') || a.issueType.includes('Duplicate') ? 'orange' : 'var(--primary)' }}>
                      {a.actionTaken}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{a.description}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
