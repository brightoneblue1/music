import { useState, useEffect } from 'react';

export type ConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | 'wifi' | 'unknown';
export type BandwidthMode = 'low' | 'medium' | 'high';

interface NetworkStatus {
  online: boolean;
  connectionType: ConnectionType;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  bandwidthMode: BandwidthMode;
}

export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    online: navigator.onLine,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false,
    bandwidthMode: 'high',
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      const online = navigator.onLine;
      const effectiveType = connection?.effectiveType || 'unknown';
      const downlink = connection?.downlink || 0;
      const rtt = connection?.rtt || 0;
      const saveData = connection?.saveData || false;

      // Determine bandwidth mode
      let bandwidthMode: BandwidthMode = 'high';
      
      if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
        bandwidthMode = 'low';
      } else if (effectiveType === '3g' || downlink < 1.5) {
        bandwidthMode = 'medium';
      }

      setNetworkStatus({
        online,
        connectionType: effectiveType as ConnectionType,
        effectiveType,
        downlink,
        rtt,
        saveData,
        bandwidthMode,
      });
    };

    updateNetworkStatus();

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
}
