import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../supabase';
import { useGeolocation } from '../utils/useGeolocation';

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={new L.DivIcon({
      className: 'new-shed-pin',
      html: `<div style="background-color: #007bff; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })} />
  );
}

function AddShed() {
  const navigate = useNavigate();
  const { location } = useGeolocation();
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

  // Set initial position if geolocation available
  React.useEffect(() => {
    if (location && !position) {
      setPosition({ lat: location.lat, lng: location.lng });
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) {
      alert('Please click on the map to set the shed location');
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
      alert('Shed added successfully!');
      navigate('/');
    }
  };

  const center = location ? [location.lat, location.lng] : [7.8731, 80.7718];

  return (
    <div className="container">
      <h1 className="mb-4">Add Missing Shed</h1>
      
      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label className="form-label">Shed Name</label>
          <input 
            type="text" 
            className="form-control" 
            required 
            placeholder="e.g. CPC Town Center"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Address / Street</label>
          <input 
            type="text" 
            className="form-control" 
            required
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">District</label>
          <select 
            className="form-control" 
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

        <div className="form-group">
          <label className="form-label">Available Fuels (Usually)</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label><input type="checkbox" checked={formData.fuel_petrol} onChange={(e) => setFormData({...formData, fuel_petrol: e.target.checked})} /> Petrol</label>
            <label><input type="checkbox" checked={formData.fuel_diesel} onChange={(e) => setFormData({...formData, fuel_diesel: e.target.checked})} /> Diesel</label>
            <label><input type="checkbox" checked={formData.fuel_kerosene} onChange={(e) => setFormData({...formData, fuel_kerosene: e.target.checked})} /> Kerosene</label>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Location (Tap on map to set Pin)</label>
          <div style={{ height: '300px', width: '100%', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <MapContainer center={center} zoom={location ? 14 : 7} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Submitting...' : 'Add Shed to Map'}
        </button>
      </form>
    </div>
  );
}

export default AddShed;
