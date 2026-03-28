import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useGeolocation } from '../utils/useGeolocation';
import { MapPin, Loader2, AlertCircle, ChevronLeft } from 'lucide-react';

function AddShed() {
  const navigate = useNavigate();
  const { location, error: geoError } = useGeolocation();
  const [position, setPosition] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    district: '',
    fuel_petrol: true,
    fuel_diesel: true,
    fuel_kerosene: false
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location && !position) {
      setPosition({ lat: location.lat, lng: location.lng });
    }
  }, [location, position]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) {
      alert('Location Permissions required.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('sheds').insert([{
      ...formData,
      lat: position.lat,
      lng: position.lng,
      source: 'public'
    }]);

    setLoading(false);
    
    if (error) {
      alert(error.message);
    } else {
      alert('Station added successfully!');
      navigate('/');
    }
  };

  return (
    <div>
      <div className="light-header" style={{ paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)', boxShadow: 'var(--shadow)' }} 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={20} />
          </button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '1rem', fontWeight: '700', paddingRight: '36px' }}>
            New Station
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '60px' }}>
        <form onSubmit={handleSubmit} className="info-container" style={{ marginTop: '0.5rem', padding: '1rem' }}>
          
          {/* Mockup-style Location Card */}
          <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)' }}>
            {geoError ? (
              <>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(255, 59, 48, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={24} color="var(--danger)" />
                </div>
                <div>
                  <p style={{ fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.1rem' }}>GPS Denied</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Enable permissions</p>
                </div>
              </>
            ) : !position ? (
              <>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'var(--info-box)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 size={24} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
                <div>
                  <p style={{ fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.1rem' }}>Acquiring Signal</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Finding your location...</p>
                </div>
              </>
            ) : (
              <>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(52, 199, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={24} color="var(--success)" />
                </div>
                <div>
                  <p style={{ fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.1rem' }}>Location Acquired</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontFamily: 'monospace' }}>
                    {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>Station Name</label>
            <input 
              type="text" 
              className="form-control" 
              style={{ padding: '0.75rem 0.85rem', fontSize: '0.85rem' }}
              required 
              placeholder="e.g. CPC Town Center"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>Address / Street</label>
            <input 
              type="text" 
              className="form-control" 
              style={{ padding: '0.75rem 0.85rem', fontSize: '0.85rem' }}
              required
              placeholder="Enter street name"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>District</label>
            <select 
              className="form-control" 
              style={{ padding: '0.75rem 0.85rem', fontSize: '0.85rem' }}
              required
              value={formData.district}
              onChange={(e) => setFormData({...formData, district: e.target.value})}
            >
              <option value="">Select District</option>
              {['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Moneragala', 'Ratnapura', 'Kegalle'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ color: 'var(--text-light)', marginBottom: '0.5rem', fontSize: '0.75rem' }}>Available Fuels</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', fontWeight: '600', fontSize: '0.85rem' }}>
                <input type="checkbox" style={{ width: '1.1rem', height: '1.1rem', accentColor: '#000' }} checked={formData.fuel_petrol} onChange={(e) => setFormData({...formData, fuel_petrol: e.target.checked})} /> Petrol
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', fontWeight: '600', fontSize: '0.85rem' }}>
                <input type="checkbox" style={{ width: '1.1rem', height: '1.1rem', accentColor: '#000' }} checked={formData.fuel_diesel} onChange={(e) => setFormData({...formData, fuel_diesel: e.target.checked})} /> Diesel
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', fontWeight: '600', fontSize: '0.85rem', gridColumn: 'span 2' }}>
                <input type="checkbox" style={{ width: '1.1rem', height: '1.1rem', accentColor: '#000' }} checked={formData.fuel_kerosene} onChange={(e) => setFormData({...formData, fuel_kerosene: e.target.checked})} /> Kerosene
              </label>
            </div>
          </div>

          <button type="submit" className="btn" style={{ padding: '1rem', backgroundColor: 'var(--primary)', color: 'white', fontSize: '0.9rem' }} disabled={loading || !position}>
            {loading ? 'Submitting...' : 'Confirm Submission'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddShed;
