import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Loader2, Coffee, DollarSign, ShoppingCart, Check } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { TermsAndConditionsModal } from './TermsAndConditionsModal';

const PAYPAL_CLIENT_ID = 'AbgmXdO1Xxl_UIXH3uufRpXlpqpsCeE1ysk68t8U1IPYNpQGRAKCMUFXkaGgeOI1D7TAyRWzyMRJGni2';

declare global {
  interface Window {
    paypal?: any;
  }
}

interface Beat {
  id: string;
  title: string;
  audioUrl: string;
  type: 'beat' | 'remix';
  price?: string;
}

function parseBeatPrice(price?: string): number {
  if (!price) return 0;
  const num = parseFloat(price.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

interface DownloadModalProps {
  beat: Beat;
  onClose: () => void;
}

export function DownloadModal({ beat, onClose }: DownloadModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [paypalReady, setPaypalReady] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const paypalRendered = useRef(false);

  const beatPrice = parseBeatPrice(beat.price);
  const isPaid = beatPrice > 0;

  // Load PayPal SDK
  useEffect(() => {
    if (!isPaid) return;

    if (window.paypal) {
      setPaypalReady(true);
      return;
    }

    const existing = document.getElementById('paypal-sdk');
    if (existing) {
      existing.addEventListener('load', () => setPaypalReady(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
    script.async = true;
    script.onload = () => setPaypalReady(true);
    document.head.appendChild(script);
  }, [isPaid]);

  // Render PayPal buttons once SDK is ready
  useEffect(() => {
    if (!paypalReady || !paypalContainerRef.current || paypalRendered.current) return;
    paypalRendered.current = true;

    window.paypal.Buttons({
      style: {
        layout: 'horizontal',
        color: 'gold',
        shape: 'rect',
        label: 'pay',
        tagline: false,
        height: 48,
      },
      createOrder: (_data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            description: `Beat License: ${beat.title}`,
            amount: { currency_code: 'USD', value: beatPrice.toFixed(2) },
          }],
        });
      },
      onApprove: async (data: any, _actions: any) => {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337/capture-paypal`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ orderId: data.orderID, expectedAmount: beatPrice }),
            }
          );
          const result = await response.json();
          if (!response.ok || !result.success) {
            setMessage(result.error || 'Payment verification failed. Please contact support.');
            return;
          }
          setMessage('Payment verified! Your download is starting.');
          triggerDownload();
          setTimeout(() => onClose(), 3000);
        } catch {
          setMessage('Payment verification failed. Please try again.');
        }
      },
      onError: (err: any) => {
        console.error('PayPal error:', err);
        setMessage('PayPal payment failed. Please try again.');
      },
    }).render(paypalContainerRef.current);
  }, [paypalReady]);

  const triggerDownload = async () => {
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
  };

  const handleBuyLicense = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      setShowTermsModal(true);
      return;
    }

    if (!email) {
      setMessage('Please enter your email');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe24c337/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ beatId: beat.id, beatTitle: beat.title, price: beatPrice, email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Failed to create checkout session. Please try again.');
        setIsSubmitting(false);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setMessage('Failed to create checkout session.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setMessage('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
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
          body: JSON.stringify({ email, beatId: beat.id, beatTitle: beat.title, platform: 'direct' }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('Download submission error:', error);
        setMessage('Failed to process download. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setMessage('Download starting! Check your email for updates.');
      await triggerDownload();

      setTimeout(() => onClose(), 3000);
    } catch (error) {
      console.error('Error submitting download:', error);
      setMessage('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
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
            {isPaid ? <ShoppingCart className="w-8 h-8 text-black" /> : <Download className="w-8 h-8 text-black" />}
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {isPaid ? 'Buy License' : 'Download'} — {beat.title}
          </h3>
          <p className="text-gray-400">
            {isPaid ? `$${beatPrice.toFixed(2)} · Instant download after payment` : 'Subscribe to download this track'}
          </p>
        </div>

        <form onSubmit={isPaid ? handleBuyLicense : handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Your Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-white/5 border-2 border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white"
              required={!isPaid}
            />
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('success') || message.includes('starting')
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {message}
            </div>
          )}

          {/* Paid beat: Stripe + PayPal */}
          {isPaid ? (
            <div className="space-y-3">
              {/* Terms & Conditions Checkbox */}
              <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="flex-shrink-0 mt-1"
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      agreedToTerms
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-blue-400 hover:border-blue-300'
                    }`}
                    role="checkbox"
                    aria-checked={agreedToTerms}
                  >
                    {agreedToTerms && <Check className="w-4 h-4 text-white" />}
                  </div>
                </button>
                <div className="flex-1">
                  <p className="text-sm text-gray-300">
                    I have read and agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-blue-400 hover:text-blue-300 underline font-semibold"
                    >
                      Beat License Agreement
                    </button>
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !agreedToTerms}
                className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-200 disabled:bg-white/50 text-black py-4 rounded-lg font-semibold transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Pay with Card — ${beatPrice.toFixed(2)}</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-gray-500 text-sm">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div ref={paypalContainerRef} className="min-h-[48px]">
                {!paypalReady && (
                  <div className="flex items-center justify-center h-12">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 text-center">
                Secure payment via Stripe or PayPal. Instant download after purchase.
              </p>
            </div>
          ) : (
            <>
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

              {/* Support via PayPal - For free music */}
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
                By downloading, you'll receive email updates about new releases. You can unsubscribe anytime.
              </p>
            </>
          )}
        </form>
      </div>

      {/* Terms & Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onAccept={() => {
          setAgreedToTerms(true);
          setShowTermsModal(false);
        }}
        onDecline={() => {
          setAgreedToTerms(false);
          setShowTermsModal(false);
        }}
      />
    </div>
  );
}
