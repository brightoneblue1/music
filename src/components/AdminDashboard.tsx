import { useState, useEffect } from 'react';
import { 
  LogOut, 
  Music, 
  Settings, 
  Upload,
  List,
  Mail,
  Lock,
  Image
} from 'lucide-react';
import { AdminLogin } from './AdminLogin';
import { BeatUpload } from './BeatUpload';
import { ServiceManager } from './ServiceManager';
import { EmailListViewer } from './EmailListViewer';
import { HeroEditor } from './HeroEditor';
import { LogoUploader } from './LogoUploader';

interface AdminDashboardProps {
  onExit: () => void;
}

export function AdminDashboard({ onExit }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'beats' | 'services' | 'emails' | 'hero' | 'logo'>('beats');

  const handleLogout = () => {
    setIsAuthenticated(false);
    onExit();
  };

  if (!isAuthenticated) {
    return <AdminLogin onAuthenticate={() => setIsAuthenticated(true)} onCancel={onExit} />;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <div className="bg-black/90 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Lock className="w-6 h-6 text-white" />
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('beats')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeTab === 'beats'
                ? 'bg-white text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <Music className="w-5 h-5" />
            <span>Beats & Remixes</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeTab === 'services'
                ? 'bg-white text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <List className="w-5 h-5" />
            <span>Services</span>
          </button>

          <button
            onClick={() => setActiveTab('emails')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeTab === 'emails'
                ? 'bg-white text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <Mail className="w-5 h-5" />
            <span>Email Lists</span>
          </button>

          <button
            onClick={() => setActiveTab('hero')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeTab === 'hero'
                ? 'bg-white text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Hero Section</span>
          </button>

          <button
            onClick={() => setActiveTab('logo')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeTab === 'logo'
                ? 'bg-white text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <Image className="w-5 h-5" />
            <span>Logo Upload</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white/5 backdrop-blur-lg border-2 border-white/20 rounded-xl p-6">
          {activeTab === 'beats' && <BeatUpload />}
          {activeTab === 'services' && <ServiceManager />}
          {activeTab === 'emails' && <EmailListViewer />}
          {activeTab === 'hero' && <HeroEditor />}
          {activeTab === 'logo' && <LogoUploader />}
        </div>
      </div>
    </div>
  );
}