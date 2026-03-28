import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Navigation, Fuel } from 'lucide-react';
import { useSheds } from '../hooks/useSheds';
import { useGeolocation } from '../utils/useGeolocation';
import { calculateDistance, formatDistance } from '../utils/distance';

function ListView() {
  const { sheds, loading } = useSheds();
  const { location, error: locationError } = useGeolocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, open, closed
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute top 5 dropdown suggestions
  const suggestedSheds = useMemo(() => {
    if (!searchQuery.trim() || !sheds) return [];
    const query = searchQuery.toLowerCase();
    return sheds.filter(shed => 
      shed.name.toLowerCase().includes(query) || 
      shed.address.toLowerCase().includes(query) ||
      shed.district.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [searchQuery, sheds]);

  const clearSearch = () => {
    setSearchQuery('');
    setShowDropdown(false);
  };

  const filteredAndSortedSheds = useMemo(() => {
    if (!sheds) return [];
    
    // Filter by Active Tab
    let filtered = sheds.filter(shed => {
      if (activeFilter === 'all') return true;
      const status = shed.latestReport ? shed.latestReport.status : 'unknown';
      return status === activeFilter;
    });

    // Optionally filter the main list by search query as well
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(shed => 
        shed.name.toLowerCase().includes(query) || 
        shed.address.toLowerCase().includes(query) ||
        shed.district.toLowerCase().includes(query)
      );
    }

    // Sort by distance using browser GPS
    const positioned = filtered.map(shed => {
      let dist = Infinity;
      if (location) {
        dist = calculateDistance(location.lat, location.lng, shed.lat, shed.lng);
      }
      return { ...shed, distance: dist };
    });

    return positioned.sort((a, b) => a.distance - b.distance);
  }, [sheds, location, activeFilter, searchQuery]);

  return (
    <div>
      <div className="light-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>Fuel Stations</h1>
        </div>
        
        <div style={{ position: 'relative', marginTop: '1.5rem' }} ref={dropdownRef}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8c8c8c', zIndex: 2 }} />
          <input 
            type="text" 
            className="search-pill" 
            placeholder="Search by name, city, or district"
            value={searchQuery}
            onFocus={() => setShowDropdown(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            style={{ paddingLeft: '3rem', paddingRight: searchQuery ? '3rem' : '1.25rem' }}
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={clearSearch} 
              style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8c8c8c', padding: 0, zIndex: 2 }}
            >
              <X size={20} />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {showDropdown && suggestedSheds.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              {suggestedSheds.map(shed => (
                <div 
                  key={`drop-${shed.id}`}
                  onClick={() => navigate(`/shed/${shed.id}`)}
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--info-box)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <Navigation size={18} color="var(--primary)" />
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.95rem' }}>{shed.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{shed.address} • {shed.district}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter Pills */}
      <div className="filter-container">
        <button className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All Stations</button>
        <button className={`filter-pill ${activeFilter === 'open' ? 'active' : ''}`} onClick={() => setActiveFilter('open')}>Open</button>
        <button className={`filter-pill ${activeFilter === 'closed' ? 'active' : ''}`} onClick={() => setActiveFilter('closed')}>Closed</button>
      </div>

      {/* Main List Container */}
      <div className="container" style={{ paddingBottom: '90px' }}>
        
        {locationError && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 193, 7, 0.1)', color: '#856404', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Enable GPS for accurate distance sorting.
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} style={{ height: '90px', backgroundColor: 'var(--border-color)', borderRadius: '20px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredAndSortedSheds.length === 0 ? (
              <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '2rem 0', fontWeight: '500' }}>No stations match your criteria.</p>
            ) : (
              filteredAndSortedSheds.map(shed => {
                let status = 'unknown';
                let queueText = '';
                
                if (shed.latestReport) {
                  status = shed.latestReport.status;
                  queueText = shed.latestReport.queue.replace('_', ' ').toUpperCase();
                }

                let badgeClass = 'neutral';
                if (status === 'open') badgeClass = 'green';
                if (status === 'closed') badgeClass = 'red';
                if (status === 'unknown') badgeClass = 'purple';

                return (
                  <div 
                    key={shed.id} 
                    className="list-item"
                    onClick={() => navigate(`/shed/${shed.id}`)}
                  >
                    <div className="icon-box">
                      <Fuel size={20} color="var(--primary)" />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.1rem' }}>
                        <h2 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-dark)' }}>{shed.name}</h2>
                        <span className={`badge ${badgeClass}`} style={{ fontSize: '0.6rem' }}>{status}</span>
                      </div>
                      
                      <p style={{ color: 'var(--text-light)', fontSize: '0.75rem', marginBottom: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {shed.address}
                      </p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-dark)' }}>
                          {queueText ? `Q: ${queueText}` : 'Wait: N/A'}
                        </div>
                        {shed.distance !== Infinity && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--text-dark)', fontWeight: '600', fontSize: '0.8rem' }}>
                            <Navigation size={11} fill="currentColor" />
                            {formatDistance(shed.distance)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListView;
