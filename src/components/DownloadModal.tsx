import { useState, useEffect } from 'react';
import { X, Download, Loader2, Coffee, DollarSign } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Beat {
  id: string;
  title: string;
  audioUrl: string;
  type: 'beat' | 'remix';
}

interface DownloadModalProps {
  beat: Beat;
  onClose: () => void;
}

export function DownloadModal({ beat, onClose }: DownloadModalProps) {
  const [email, setEmail] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'youtube' | 'spotify' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const SPOTIFY_URL = 'https://open.spotify.com/artist/6nIsLjLEDuhdbJjpWGhQvn?si=8Cu_4NtkQDGKCUEg4iTsvA';
  const YOUTUBE_URL = 'https://www.youtube.com/@shhmaart';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337/download-beat`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            beatId: beat.id,
            beatTitle: beat.title,
            platform: 'direct', // Direct download without platform requirement
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('Download submission error:', error);
        setMessage('Failed to process download. Please try again.');
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();
      
      setMessage('Download starting! Check your email for updates.');
      
      // Trigger automatic download
      try {
        // Method 1: Try direct download with fetch
        const audioResponse = await fetch(beat.audioUrl);
        const blob = await audioResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${beat.title}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('Download initiated successfully');
      } catch (downloadError) {
        console.error('Direct download failed, trying alternative method:', downloadError);
        
        // Method 2: Fallback - open in new window
        const link = document.createElement('a');
        link.href = beat.audioUrl;
        link.download = `${beat.title}.mp3`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting download:', error);
      setMessage('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-black border-2 border-white/20 rounded-2xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white hover:bg-gray-200 text-black p-2 rounded-full transition-all shadow-lg z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Download {beat.title}</h3>
          <p className="text-gray-400">Subscribe to download this track</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-white/5 border-2 border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white"
              required
            />
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('started') 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {message}
            </div>
          )}

          {/* Buy Me a Coffee - Only for Remixes */}
          {beat.type === 'remix' && (
            <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Coffee className="w-6 h-6 text-yellow-500" />
                <h4 className="text-white font-semibold">Enjoying this remix?</h4>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Support my work and help me create more amazing remixes!
              </p>
              <a
                href="https://buymeacoffee.com/shhmaart?new=1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-black py-3 px-4 rounded-lg font-semibold transition-all"
              >
                <Coffee className="w-5 h-5" />
                <span>Buy Me a Coffee</span>
              </a>
            </div>
          )}

          {/* Support via PayPal - For All Music */}
          <div className="bg-blue-500/10 border-2 border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <DollarSign className="w-6 h-6 text-blue-400" />
              <h4 className="text-white font-semibold">Love this track?</h4>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              Your support helps me keep creating amazing music!
            </p>
            <a
              href="https://www.paypal.com/ncp/payment/ZF7ELGJA69UGW"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold transition-all"
            >
              <DollarSign className="w-5 h-5" />
              <span>Support via PayPal</span>
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-200 disabled:bg-white/50 text-black py-4 rounded-lg font-semibold transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download Now</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            By downloading, you'll receive email updates about new releases.
            You can unsubscribe anytime.
          </p>
        </form>
      </div>
    </div>
  );
}