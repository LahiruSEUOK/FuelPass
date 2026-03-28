import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useSheds } from '../hooks/useSheds';

function ShedDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sheds, loading: shedsLoading, refresh } = useSheds();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [reportStep, setReportStep] = useState(0); // 0 = view, 1 = status, 2 = queue, 3 = fuels
  const [reportData, setReportData] = useState({
    status: 'open',
    queue: 'none',
    fuel_petrol: false,
    fuel_diesel: false,
    fuel_kerosene: false
  });

  const shed = sheds.find(s => s.id === id);

  if (shedsLoading) return <div className="container">Loading...</div>;
  if (!shed) return <div className="container">Shed not found.</div>;

  const currentStatus = shed.latestReport ? shed.latestReport.status : 'unknown';
  const queueStatus = shed.latestReport ? shed.latestReport.queue.replace('_', ' ').toUpperCase() : 'N/A';
  
  const handleConfirm = async () => {
    if (!shed.latestReport) return;
    setLoading(true);
    const { status, queue, fuel_type } = shed.latestReport;
    
    await supabase.from('fuel_updates').insert([{
      shed_id: id,
      status, queue, fuel_type
    }]);
    
    await refresh();
    setLoading(false);
    alert('Thank you! Report confirmed.');
  };

  const handleSubmitReport = async () => {
    setLoading(true);
    // Determine main fuel_type based on selection for schematic compliance
    let fuel_type = 'none';
    if (reportData.fuel_petrol) fuel_type = 'petrol';
    else if (reportData.fuel_diesel) fuel_type = 'diesel';
    else if (reportData.fuel_kerosene) fuel_type = 'kerosene';

    await supabase.from('fuel_updates').insert([{
      shed_id: id,
      status: reportData.status,
      queue: reportData.queue,
      fuel_type: fuel_type
    }]);
    
    await refresh();
    setReportStep(0);
    setLoading(false);
    alert('Thank you for your report!');
  };

  return (
    <div className="container">
      <button className="btn" style={{ marginBottom: '1rem', padding: '0.5rem 1rem', border: '1px solid var(--border-color)', backgroundColor: 'transparent' }} onClick={() => navigate(-1)}>
        &larr; Back
      </button>

      <div className="card">
        <h1 style={{ marginBottom: '0.5rem' }}>{shed.name}</h1>
        <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>{shed.address}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius)' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>Status</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }} className={currentStatus === 'open' ? 'text-success' : currentStatus === 'closed' ? 'text-danger' : ''}>
              {currentStatus.toUpperCase()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>Queue</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{queueStatus}</div>
          </div>
        </div>

        {shed.latestReport && reportStep === 0 && (
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleConfirm} disabled={loading}>
              {loading ? 'Confirming...' : '✅ Still Accurate'}
            </button>
            <button className="btn" style={{ flex: 1, backgroundColor: '#6f42c1', color: 'white' }} onClick={() => setReportStep(1)}>
              📝 Update Info
            </button>
          </div>
        )}

        {!shed.latestReport && reportStep === 0 && (
          <button className="btn btn-primary" style={{ width: '100%', marginBottom: '1.5rem' }} onClick={() => setReportStep(1)}>
            Submit First Report
          </button>
        )}

        {reportStep > 0 && (
          <div style={{ backgroundColor: 'var(--bg-color)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Updating Shed Info</h3>
            
            {reportStep === 1 && (
              <div>
                <label className="form-label">Is the shed open?</label>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <button className={`btn ${reportData.status === 'open' ? 'btn-primary' : ''}`} style={{ flex: 1, backgroundColor: reportData.status !== 'open' ? 'white' : '', color: reportData.status !== 'open' ? 'black' : '', border: '1px solid var(--border-color)' }} onClick={() => setReportData({...reportData, status: 'open'})}>Open</button>
                  <button className={`btn ${reportData.status === 'closed' ? 'btn-danger' : ''}`} style={{ flex: 1, backgroundColor: reportData.status !== 'closed' ? 'white' : '', color: reportData.status !== 'closed' ? 'black' : '', border: '1px solid var(--border-color)' }} onClick={() => setReportData({...reportData, status: 'closed'})}>Closed</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button className="btn" onClick={() => setReportStep(0)}>Cancel</button>
                  <button className="btn btn-primary" onClick={() => setReportStep(2)}>Next &rarr;</button>
                </div>
              </div>
            )}

            {reportStep === 2 && (
              <div>
                <label className="form-label">How long is the queue?</label>
                <select 
                  className="form-control" 
                  style={{ marginBottom: '1rem' }}
                  value={reportData.queue} 
                  onChange={(e) => setReportData({...reportData, queue: e.target.value})}
                >
                  <option value="none">No Queue / Very Fast</option>
                  <option value="short">Short (Under 30 mins)</option>
                  <option value="long">Long (1 - 3 hours)</option>
                  <option value="very_long">Very Long (3+ hours)</option>
                </select>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button className="btn" onClick={() => setReportStep(1)}>&larr; Back</button>
                  <button className="btn btn-primary" onClick={() => setReportStep(3)}>Next &rarr;</button>
                </div>
              </div>
            )}

            {reportStep === 3 && (
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>Which fuels are available?</label>
                
                <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <input type="checkbox" checked={reportData.fuel_petrol} onChange={(e) => setReportData({...reportData, fuel_petrol: e.target.checked})} /> Petrol
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <input type="checkbox" checked={reportData.fuel_diesel} onChange={(e) => setReportData({...reportData, fuel_diesel: e.target.checked})} /> Diesel
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', backgroundColor: 'white', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <input type="checkbox" checked={reportData.fuel_kerosene} onChange={(e) => setReportData({...reportData, fuel_kerosene: e.target.checked})} /> Kerosene
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button className="btn" onClick={() => setReportStep(2)}>&larr; Back</button>
                  <button className="btn btn-primary" onClick={handleSubmitReport} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default ShedDetail;
