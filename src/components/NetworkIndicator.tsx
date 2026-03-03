import { Wifi, WifiOff, Signal } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function NetworkIndicator() {
  const { online, connectionType, bandwidthMode, saveData } = useNetworkStatus();

  const getSignalIcon = () => {
    if (!online) return <WifiOff className="w-4 h-4 text-red-500" />;
    
    switch (bandwidthMode) {
      case 'low':
        return <Signal className="w-4 h-4 text-yellow-500" />;
      case 'medium':
        return <Signal className="w-4 h-4 text-blue-500" />;
      case 'high':
        return <Wifi className="w-4 h-4 text-green-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConnectionText = () => {
    if (!online) return 'Offline';
    if (saveData) return 'Data Saver';
    
    switch (connectionType) {
      case 'slow-2g':
      case '2g':
        return 'Slow Connection';
      case '3g':
        return 'Moderate Connection';
      case '4g':
      case 'wifi':
        return 'Fast Connection';
      default:
        return 'Unknown';
    }
  };

  const getBandwidthColor = () => {
    if (!online) return 'text-red-500';
    
    switch (bandwidthMode) {
      case 'low':
        return 'text-yellow-500';
      case 'medium':
        return 'text-blue-500';
      case 'high':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/30 border border-white/10">
      {getSignalIcon()}
      <span className={`text-xs font-medium ${getBandwidthColor()}`}>
        {getConnectionText()}
      </span>
    </div>
  );
}
