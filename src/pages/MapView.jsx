import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { useGeolocation } from '../utils/useGeolocation';
import { useSheds } from '../hooks/useSheds';

// Custom icons
const createIcon = (color) => {
  return new L.DivIcon({
    className: 'custom-pin',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const icons = {
  open: createIcon('#28a745'),
  closed: createIcon('#dc3545'),
  unknown: createIcon('#6c757d')
};

function MapView() {
  const { location } = useGeolocation();
  const { sheds, loading } = useSheds();
  const navigate = useNavigate();

  const center = location ? [location.lat, location.lng] : [7.8731, 80.7718]; // Default to center of Sri Lanka

  return (
    <div className="map-container">
      {loading && <div style={{ padding: '1rem', textAlign: 'center' }}>Loading sheds...</div>}
      <MapContainer center={center} zoom={location ? 12 : 7} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {location && (
          <Marker position={[location.lat, location.lng]} icon={new L.DivIcon({
            className: 'user-pin',
            html: `<div style="background-color: #007bff; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,123,255,0.5);"></div>`,
            iconSize: [16, 16],
          })}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {sheds.map(shed => {
          let status = 'unknown';
          if (shed.latestReport) {
            status = shed.latestReport.status; // 'open' or 'closed'
          }
          
          return (
            <Marker 
              key={shed.id} 
              position={[shed.lat, shed.lng]} 
              icon={icons[status]}
            >
              <Popup>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{shed.name}</h3>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#666' }}>{shed.address}</p>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <span className={`badge ${status}`}>{status.toUpperCase()}</span>
                    {shed.latestReport && (
                      <span className="badge" style={{ marginLeft: '0.5rem', backgroundColor: '#e9ecef', color: '#495057' }}>
                        Q: {shed.latestReport.queue.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.5rem 1rem', width: '100%' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/shed/${shed.id}`);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapView;
