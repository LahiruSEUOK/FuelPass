import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useSheds } from '../hooks/useSheds';
import { useGeolocation } from '../utils/useGeolocation';
import { calculateDistance, formatDistance } from '../utils/distance';

function ListView() {
  const { sheds, loading } = useSheds();
  const { location, error: locationError } = useGeolocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [overrideLocation, setOverrideLocation] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const activeLocation = overrideLocation || location;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Sri Lanka')}`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        setOverrideLocation({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          name: data[0].display_name.split(',')[0]
        });
      } else {
        alert('Location not found. Please try another search term.');
      }
    } catch (err) {
      console.error('Search error:', err);
      alert('Failed to search location.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setOverrideLocation(null);
  };

  const sortedSheds = useMemo(() => {
    if (!sheds) return [];
    
    // If location available, sort by distance
    const shedsWithDistance = sheds.map(shed => {
      let dist = Infinity;
      if (activeLocation) {
        dist = calculateDistance(activeLocation.lat, activeLocation.lng, shed.lat, shed.lng);
      }
      return { ...shed, distance: dist };
    });

    return shedsWithDistance.sort((a, b) => a.distance - b.distance);
  }, [sheds, activeLocation]);

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Nearby Sheds</h1>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input 
            type="text" 
            placeholder="Search city or town..." 
            className="form-control" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingRight: overrideLocation ? '2.5rem' : '1rem' }}
          />
          {overrideLocation && (
            <button 
              type="button" 
              onClick={clearSearch} 
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: '5px' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={isSearching}>
          <Search size={20} />
        </button>
      </form>

      {overrideLocation && (
        <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
          Showing results near: <strong style={{ color: 'var(--primary)' }}>{overrideLocation.name}</strong>
        </div>
      )}

      {locationError && !overrideLocation && (
        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius)', borderLeft: '4px solid var(--warning)', marginBottom: '1rem' }}>
          Please enable location services or search manually.
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="card skeleton" style={{ height: '90px', width: '100%' }}></div>
          ))}
        </div>
      )}

      {!loading && sortedSheds.length === 0 && <p>No sheds found.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sortedSheds.map(shed => {
          let status = 'unknown';
          let queueText = '';
          
          if (shed.latestReport) {
            status = shed.latestReport.status;
            queueText = shed.latestReport.queue.replace('_', ' ').toUpperCase();
          }

          return (
            <div 
              key={shed.id} 
              className="card"
              onClick={() => navigate(`/shed/${shed.id}`)}
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{shed.name}</h2>
                <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{shed.address}</p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className={`badge ${status}`}>{status.toUpperCase()}</span>
                  {queueText && <span className="badge" style={{ backgroundColor: '#e9ecef', color: '#495057' }}>Q: {queueText}</span>}
                </div>
              </div>
              <div style={{ textAlign: 'right', minWidth: '80px' }}>
                {shed.distance !== Infinity ? (
                  <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                    {formatDistance(shed.distance)}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ListView;
