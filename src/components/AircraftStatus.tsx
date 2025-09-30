import { useEffect, useState } from 'react';
import { getAircraftData } from '../api/getAircraftData';

const AircraftStatus = () => {
  const [aircraftCount, setAircraftCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateAircraftStatus = async () => {
    setIsLoading(true);
    try {
      const data = await getAircraftData();
      setAircraftCount(data.length);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch aircraft status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    updateAircraftStatus();
    
    // Set up interval to refresh data every 10 seconds
    const interval = setInterval(updateAircraftStatus, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: '80px',
      right: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      zIndex: 1000,
      minWidth: '200px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
        🛩️ Aircraft Status
      </div>
      <div>
        Aircraft visible: <strong>{aircraftCount}</strong>
      </div>
      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
        {isLoading ? (
          'Updating...'
        ) : lastUpdate ? (
          `Last update: ${lastUpdate.toLocaleTimeString()}`
        ) : (
          'Loading...'
        )}
      </div>
      <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
        Data from OpenSky Network
      </div>
    </div>
  );
};

export default AircraftStatus;