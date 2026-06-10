import { useEffect, useMemo, useState } from 'react';
import { Music, Loader2, DollarSign, Play, Download, Copy } from 'lucide-react';
import { toast } from 'sonner';

import { projectId, publicAnonKey } from '../utils/supabase/info';
import { copyBeatSalesUrl, getBeatSalesUrl } from '../utils/beatLinks';
import { DownloadModal } from './DownloadModal';

type BeatType = 'beat' | 'remix';

interface Beat {
  id: string;
  title: string;
  genre: string;
  bpm: string;
  duration: string;
  audioUrl: string;
  imageUrl: string;
  type: BeatType;
  price?: string;
  slug?: string;
}

function getSlugFromPathname(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 2 && parts[0] === 'b') return parts[1];
  return '';
}

async function downloadBeatFile(beat: Beat) {
  try {
    const res = await fetch(beat.audioUrl);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${beat.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch {
    const link = document.createElement('a');
    link.href = beat.audioUrl;
    link.download = `${beat.title}.mp3`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function BeatSalesPage() {
  const slug = typeof window !== 'undefined' ? getSlugFromPathname(window.location.pathname) : '';

  const [beat, setBeat] = useState<Beat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const salesUrl = useMemo(() => {
    if (!slug) return '';
    return getBeatSalesUrl(slug);
  }, [slug]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337/beats/slug/${encodeURIComponent(slug)}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (!response.ok) {
          setBeat(null);
          setLoadError('Beat not found.');
          return;
        }

        const data = await response.json();
        setBeat(data.beat || null);
      } catch (e: any) {
        setLoadError(e?.message || 'Failed to load beat.');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      load();
    } else {
      setIsLoading(false);
      setLoadError('Invalid beat link.');
    }
  }, [slug]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (!payment || !beat) return;

    window.history.replaceState({}, '', window.location.pathname);

    if (payment === 'cancelled') {
      toast.error('Payment cancelled. No charges were made.');
      return;
    }

    if (payment !== 'success') return;

    const sessionId = params.get('session');
    const verify = async () => {
      if (!sessionId) {
        toast.success('Payment successful! You can download your beat below.');
        return;
      }

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337/verify-payment`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.paid) {
            toast.success(`Payment confirmed! Downloading "${beat.title}"...`);
            await downloadBeatFile(beat);
          }
        } else {
          toast.success('Payment received! You can download your beat below.');
        }
      } catch {
        toast.success('Payment received! You can download your beat below.');
      }
    };

    verify();
  }, [beat]);

  const copyLink = async () => {
    if (!slug) return;
    await copyBeatSalesUrl(slug);
    toast.success('Sales link copied!');
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-32 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
            <p className="text-gray-400 mt-4">Loading beat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !beat) {
    return (
      <div className="pt-24 pb-32 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/5 backdrop-blur-lg border-2 border-white/20 rounded-xl p-8">
            <h1 className="text-2xl font-bold text-white mb-2">Beat not available</h1>
            <p className="text-gray-400">{loadError || 'This beat may have been removed.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const beatPrice = beat.price;

  return (
    <div className="pt-24 pb-32 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/5 backdrop-blur-lg border-2 border-white/20 rounded-xl p-8 space-y-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {beat.imageUrl ? (
                <img src={beat.imageUrl} alt={beat.title} className="w-full h-full object-cover" />
              ) : (
                <Music className="w-8 h-8 text-white/40" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold text-white truncate">{beat.title}</h1>
              <p className="text-gray-400 mt-1">
                {beat.genre} • {beat.bpm} BPM • {beat.duration} • {beat.type}
              </p>

              {beatPrice ? (
                <div className="mt-3 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-300 px-3 py-1 rounded-lg">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-semibold">{beatPrice}</span>
                </div>
              ) : (
                <div className="mt-3 inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 px-3 py-1 rounded-lg">
                  <span className="font-semibold">Free</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-white font-semibold text-lg">Direct sales link</h2>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm"
                value={salesUrl}
                readOnly
              />
              <button
                onClick={copyLink}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                title="Copy link"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-500">Use this URL in your YouTube description or any other platform.</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="flex-1 flex items-center justify-center space-x-2 bg-white hover:bg-gray-200 text-black py-3 rounded-lg font-semibold transition-all"
              onClick={() => setShowDownloadModal(true)}
            >
              <Download className="w-5 h-5" />
              <span>{beatPrice ? 'Buy License / Download' : 'Download'}</span>
            </button>

            {!beatPrice && (
              <button
                onClick={() => setShowDownloadModal(true)}
                className="flex-1 flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-semibold transition-all"
              >
                <Play className="w-5 h-5" />
                <span>Preview</span>
              </button>
            )}

            {beatPrice && (
              <div className="flex-1 flex items-center justify-center space-x-2 bg-white/5 text-gray-400 py-3 rounded-lg font-semibold border border-white/10 cursor-not-allowed">
                <Play className="w-5 h-5" />
                <span>Preview (Purchase to hear)</span>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-400 border-t border-white/10 pt-4">
            Tip: add this link to your video description for direct beat sales.
          </div>
        </div>

        {showDownloadModal && (
          <DownloadModal
            beat={beat}
            onClose={() => setShowDownloadModal(false)}
          />
        )}
      </div>
    </div>
  );
}
