import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const [sheds, setSheds] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hardcoded check
  const checkAuth = (e) => {
    e.preventDefault();
    if (password === import.meta.env.VITE_ADMIN_PASSWORD || password === 'admin123') {
      setIsAuthenticated(true);
      fetchData();
    } else {
      alert('Incorrect password');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: shedsData } = await supabase.from('sheds').select('*').order('created_at', { ascending: false });
    const { data: reportsData } = await supabase.from('fuel_updates').select('*, sheds(name)').order('created_at', { ascending: false });
    
    if (shedsData) setSheds(shedsData);
    if (reportsData) setReports(reportsData);
    setLoading(false);
  };

  const handleDeleteShed = async (id) => {
    if (window.confirm('Delete this shed permanently?')) {
      await supabase.from('sheds').delete().eq('id', id);
      fetchData();
    }
  };

  const handleDeleteReport = async (id) => {
    if (window.confirm('Delete this report?')) {
      await supabase.from('fuel_updates').delete().eq('id', id);
      fetchData();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <form onSubmit={checkAuth} className="card" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Admin Access</h2>
          <div className="form-group">
            <input 
              type="password" 
              className="form-control" 
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Admin Dashboard</h1>
        <button className="btn" onClick={() => setIsAuthenticated(false)}>Logout</button>
      </div>

      {loading && <p>Loading data...</p>}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>Recent Reports</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-light)' }}>
                <th style={{ padding: '0.5rem' }}>Time</th>
                <th style={{ padding: '0.5rem' }}>Shed</th>
                <th style={{ padding: '0.5rem' }}>Status</th>
                <th style={{ padding: '0.5rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.5rem' }}>{new Date(r.created_at).toLocaleString()}</td>
                  <td style={{ padding: '0.5rem' }}>{r.sheds?.name}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <span className={`badge ${r.status}`}>{r.status}</span>
                  </td>
                  <td style={{ padding: '0.5rem' }}>
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleDeleteReport(r.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Sheds Directory</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-light)' }}>
                <th style={{ padding: '0.5rem' }}>Name</th>
                <th style={{ padding: '0.5rem' }}>Source</th>
                <th style={{ padding: '0.5rem' }}>Added</th>
                <th style={{ padding: '0.5rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sheds.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.5rem' }}>{s.name}</td>
                  <td style={{ padding: '0.5rem' }}>{s.source}</td>
                  <td style={{ padding: '0.5rem' }}>{new Date(s.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleDeleteShed(s.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Admin;
