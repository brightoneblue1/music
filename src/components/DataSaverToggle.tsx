import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface DataSaverToggleProps {
  onToggle: (enabled: boolean) => void;
}

export function DataSaverToggle({ onToggle }: DataSaverToggleProps) {
  const [dataSaver, setDataSaver] = useState(() => {
    const saved = localStorage.getItem('dataSaverMode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('dataSaverMode', dataSaver.toString());
    onToggle(dataSaver);
  }, [dataSaver, onToggle]);

  return (
    <button
      onClick={() => setDataSaver(!dataSaver)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        dataSaver 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
      aria-label={dataSaver ? 'Disable Data Saver' : 'Enable Data Saver'}
      title={dataSaver ? 'Data Saver Mode Active' : 'Enable Data Saver Mode'}
    >
      {dataSaver ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
      <span className="text-sm font-medium">
        {dataSaver ? 'Data Saver ON' : 'Data Saver OFF'}
      </span>
    </button>
  );
}
