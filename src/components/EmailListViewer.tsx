import { useState, useEffect } from 'react';
import { Mail, Download as DownloadIcon, Users, TrendingUp } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface EmailSubscriber {
  email: string;
  type: 'music' | 'marketing';
  platform?: string;
  beatId?: string;
  beatTitle?: string;
  serviceId?: string;
  serviceName?: string;
  subscribedAt: string;
}

export function EmailListViewer() {
  const [musicEmails, setMusicEmails] = useState<EmailSubscriber[]>([]);
  const [marketingEmails, setMarketingEmails] = useState<EmailSubscriber[]>([]);
  const [activeTab, setActiveTab] = useState<'music' | 'marketing'>('music');

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337/emails`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setMusicEmails(data.musicEmails || []);
        setMarketingEmails(data.marketingEmails || []);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const exportToCSV = (emails: EmailSubscriber[], filename: string) => {
    const headers = ['Email', 'Type', 'Platform', 'Beat ID', 'Beat Title', 'Service ID', 'Service Name', 'Subscribed At'];
    const rows = emails.map(e => [
      e.email,
      e.type,
      e.platform || 'N/A',
      e.beatId || 'N/A',
      e.beatTitle || 'N/A',
      e.serviceId || 'N/A',
      e.serviceName || 'N/A',
      new Date(e.subscribedAt).toLocaleString()
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const currentEmails = activeTab === 'music' ? musicEmails : marketingEmails;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Email Lists</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Music Subscribers</p>
              <p className="text-3xl font-bold text-white">{musicEmails.length}</p>
            </div>
            <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Marketing Subscribers</p>
              <p className="text-3xl font-bold text-white">{marketingEmails.length}</p>
            </div>
            <div className="bg-pink-600 w-12 h-12 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4">
        <button
          onClick={() => setActiveTab('music')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'music'
              ? 'bg-purple-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Music List</span>
        </button>

        <button
          onClick={() => setActiveTab('marketing')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'marketing'
              ? 'bg-purple-600 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>Marketing List</span>
        </button>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={() => exportToCSV(
            currentEmails, 
            `${activeTab}-subscribers-${new Date().toISOString().split('T')[0]}.csv`
          )}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all"
        >
          <DownloadIcon className="w-5 h-5" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Email List */}
      <div className="bg-white/5 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                {activeTab === 'music' ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Song/Beat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Platform
                    </th>
                  </>
                ) : (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Service
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Subscribed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {currentEmails.map((subscriber, index) => (
                <tr key={index} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{subscriber.email}</span>
                    </div>
                  </td>
                  {activeTab === 'music' ? (
                    <>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{subscriber.beatTitle || 'N/A'}</span>
                          {subscriber.beatId && (
                            <span className="text-xs text-gray-500">ID: {subscriber.beatId}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          subscriber.platform === 'youtube' 
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {subscriber.platform || 'N/A'}
                        </span>
                      </td>
                    </>
                  ) : (
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{subscriber.serviceName || 'N/A'}</span>
                        {subscriber.serviceId && (
                          <span className="text-xs text-gray-500">ID: {subscriber.serviceId}</span>
                        )}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(subscriber.subscribedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentEmails.length === 0 && (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No subscribers yet</p>
          </div>
        )}
      </div>
    </div>
  );
}