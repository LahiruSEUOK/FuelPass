import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, Navigation2, Clock, Car } from 'lucide-react';
import { supabase } from '../supabase';
import { useSheds } from '../hooks/useSheds';

function ShedDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sheds, loading: shedsLoading, refresh } = useSheds();
  const [loading, setLoading] = useState(false);
  
  const shed = sheds.find(s => s.id === id);
  
  const [reportData, setReportData] = useState({
    status: 'open',
    queue: 'none',
    fuel_petrol: true,
    fuel_diesel: true,
    fuel_kerosene: false
  });

  useEffect(() => {
    if (shed && shed.latestReport) {
      const { status, queue, fuel_type } = shed.latestReport;
      setReportData({
        status: status || 'open',
        queue: queue || 'none',
        fuel_petrol: fuel_type === 'petrol' || fuel_type === 'all',
        fuel_diesel: fuel_type === 'diesel' || fuel_type === 'all',
        fuel_kerosene: fuel_type === 'kerosene'
      });
    }
  }, [shed]);

  if (shedsLoading) return <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>;
  if (!shed) return <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>Station not found.</div>;

  const currentStatus = shed.latestReport ? shed.latestReport.status : 'unknown';
  const queueStatus = shed.latestReport ? shed.latestReport.queue.replace('_', ' ').toUpperCase() : 'N/A';

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let fuel_type = 'none';
    if (reportData.fuel_petrol && reportData.fuel_diesel) fuel_type = 'all';
    else if (reportData.fuel_petrol) fuel_type = 'petrol';
    else if (reportData.fuel_diesel) fuel_type = 'diesel';
    else if (reportData.fuel_kerosene) fuel_type = 'kerosene';

    await supabase.from('fuel_updates').insert([{
      shed_id: id,
      status: reportData.status,
      queue: reportData.queue,
      fuel_type: fuel_type
    }]);
    
    await refresh();
    setLoading(false);
    navigate('/');
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '0.75rem 1rem', paddingBottom: '5rem' }}>
        
        {/* Sleek Top Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', marginTop: '0.5rem' }}>
          <button 
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)', boxShadow: 'var(--shadow)' }} 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={20} />
          </button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '1rem', fontWeight: '700', paddingRight: '36px' }}>
            Station Details
          </div>
        </div>

        {/* Header Info */}
        <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.2rem', letterSpacing: '-0.5px' }}>{shed.name}</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>{shed.address}</p>
        </div>

        {/* Current Status Badge Area like the mockup's delivery info */}
        <div className="info-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: '700', letterSpacing: '0.5px' }}>STATUS</span>
            <span style={{ fontSize: '1.15rem', fontWeight: '800', textTransform: 'uppercase', color: currentStatus === 'open' ? 'var(--success)' : currentStatus === 'closed' ? 'var(--danger)' : 'var(--badge-purple)' }}>
              {currentStatus}
            </span>
          </div>
          
          <div style={{ width: '1px', backgroundColor: 'var(--border-color)', height: '28px' }}></div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: '700', letterSpacing: '0.5px' }}>QUEUE LINE</span>
            <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-dark)' }}>{queueStatus}</span>
          </div>
        </div>

        {/* Form area styled like an info panel */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>Update Information</h2>
          
          <form onSubmit={handleSubmitReport} className="info-container" style={{ padding: '1.25rem' }}>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>Station availability</label>
              <div className="options-grid">
                <button type="button" className={`option-btn ${reportData.status === 'open' ? 'selected' : ''}`} style={{ padding: '0.7rem', fontSize: '0.85rem' }} onClick={() => setReportData({...reportData, status: 'open'})}>
                  Open
                </button>
                <button type="button" className={`option-btn ${reportData.status === 'closed' ? 'selected danger' : ''}`} style={{ padding: '0.7rem', fontSize: '0.85rem' }} onClick={() => setReportData({...reportData, status: 'closed'})}>
                  Closed
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>Queue estimate</label>
              <div style={{ position: 'relative' }}>
                <select 
                  className="form-control" 
                  value={reportData.queue} 
                  onChange={(e) => setReportData({...reportData, queue: e.target.value})}
                  style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', padding: '0.75rem 0.85rem', fontSize: '0.85rem' }}
                >
                  <option value="none">Drive In (No Queue)</option>
                  <option value="short">Short (&lt; 30 mins)</option>
                  <option value="long">Long (1 - 3 hours)</option>
                  <option value="very_long">Severe (3+ hours)</option>
                </select>
                <Clock size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', pointerEvents: 'none' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>Fuels available</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', padding: '0.85rem', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', gap: '0.6rem', fontWeight: '600', fontSize: '0.85rem' }}>
                  <input type="checkbox" style={{ width: '1.1rem', height: '1.1rem', accentColor: '#000' }} checked={reportData.fuel_petrol} onChange={(e) => setReportData({...reportData, fuel_petrol: e.target.checked})} />
                  Petrol
                </label>
                <label style={{ display: 'flex', alignItems: 'center', padding: '0.85rem', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', gap: '0.6rem', fontWeight: '600', fontSize: '0.85rem' }}>
                  <input type="checkbox" style={{ width: '1.1rem', height: '1.1rem', accentColor: '#000' }} checked={reportData.fuel_diesel} onChange={(e) => setReportData({...reportData, fuel_diesel: e.target.checked})} />
                  Diesel
                </label>
              </div>
            </div>

            {/* Mockup "Slide to confirm" style button -> large primary pill */}
            <button type="submit" className="btn" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '1rem', fontSize: '0.9rem' }} disabled={loading}>
              <Car size={18} />
              {loading ? 'Submitting...' : 'Confirm Status Update'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ShedDetail;
