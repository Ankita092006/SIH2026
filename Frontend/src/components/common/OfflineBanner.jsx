import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        backgroundColor: isOnline ? '#2f855a' : '#c53030',
        color: '#ffffff',
        padding: '0.6rem 1rem',
        textAlign: 'center',
        fontSize: '1rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
        position: 'sticky',
        top: 0,
        zIndex: 9999
      }}
    >
      {isOnline ? (
        <>
          <Wifi size={18} />
          <span>Back online. Syncing cognitive records...</span>
        </>
      ) : (
        <>
          <WifiOff size={18} />
          <span>Offline mode. Gameplay is safely saved locally.</span>
        </>
      )}
    </div>
  );
}

export default OfflineBanner;
