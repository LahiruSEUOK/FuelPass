import React, { useState } from 'react';

function OddEvenBanner() {
  const [vehicleNo, setVehicleNo] = useState('');
  
  const today = new Date();
  const isEvenDay = today.getDate() % 2 === 0;
  
  let canRefuel = null;
  if (vehicleNo.length > 0) {
    const lastDigit = parseInt(vehicleNo.slice(-1), 10);
    if (!isNaN(lastDigit)) {
      const isEvenVehicle = lastDigit % 2 === 0;
      canRefuel = (isEvenDay && isEvenVehicle) || (!isEvenDay && !isEvenVehicle);
    }
  }

  return (
    <div style={{ backgroundColor: isEvenDay ? 'var(--primary)' : '#6f42c1', color: 'white', padding: '1rem', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>
        Today is an {isEvenDay ? 'EVEN' : 'ODD'} day
      </h2>
      <p style={{ fontSize: '0.875rem', marginBottom: '1rem', opacity: 0.9 }}>
        {today.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
      
      <div style={{ maxWidth: '300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input 
          type="text" 
          placeholder="Enter last digit of plate (e.g. 4)"
          value={vehicleNo}
          onChange={(e) => setVehicleNo(e.target.value.replace(/[^0-9]/g, '').slice(0, 1))}
          style={{ padding: '0.5rem', borderRadius: '4px', border: 'none', textAlign: 'center', fontSize: '1.1rem' }}
        />
        {canRefuel !== null && (
          <div style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            borderRadius: '4px',
            backgroundColor: canRefuel ? '#28a745' : '#dc3545',
            fontWeight: 'bold',
            animation: 'fadeIn 0.3s ease-in'
          }}>
            {canRefuel ? "✅ You can get fuel today!" : "❌ You cannot get fuel today."}
          </div>
        )}
      </div>
    </div>
  );
}

export default OddEvenBanner;
